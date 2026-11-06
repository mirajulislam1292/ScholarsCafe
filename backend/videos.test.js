import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { createApp } from "./app.js";
import { playLink, readLink } from "./videos.js";
import { resourceScope } from "./access.js";

const ADMIN = "https://admin.scholarscafe.com";
const base = {
  ADMIN_ORIGIN: ADMIN,
  PUBLIC_ORIGIN: "https://scholarscafe.com",
  GOOGLE_CLIENT_ID: "t",
};
const ME = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const VID = "33333333-3333-4333-8333-333333333333";
const LESSON = "44444444-4444-4444-8444-444444444444";
const cookie = "__Host-sc_session=" + "a".repeat(64);

test("Play links: signed, user-bound and short-lived", () => {
  const url = playLink(VID, ME, "lesson", LESSON);
  const token = url.split("/").pop();
  assert.deepEqual((({ v, u, k, r }) => ({ v, u, k, r }))(readLink(token)), {
    v: VID,
    u: ME,
    k: "lesson",
    r: LESSON,
  });
  const [payload, mac] = token.split(".");
  const forged = Buffer.from(
    JSON.stringify({ ...JSON.parse(Buffer.from(payload, "base64url")), u: OTHER }),
  ).toString("base64url");
  assert.equal(readLink(forged + "." + mac), null, "changing the user breaks the signature");
  assert.equal(readLink(token, Date.now() + 11 * 60 * 1000), null, "expires after 10 minutes");
  assert.equal(readLink("garbage"), null);
});

test("Resource scope: students need a package that unlocks it; mentors and editors refused", () => {
  const s = resourceScope({ id: ME, role: "student" });
  assert.match(s.sql, /r\.published=1/);
  assert.match(s.sql, /deleted_at IS NULL/);
  assert.match(s.sql, /up5\.user_id=\?/);
  assert.deepEqual(s.params, [ME, ME]);
  assert.deepEqual(resourceScope({ id: ME, role: "admin" }), { sql: "1=1", params: [] });
  for (const role of ["mentor", "editor"])
    assert.throws(() => resourceScope({ id: ME, role }), { status: 403 });
});

function app(role, query, extra = {}) {
  const sql = [];
  const config =
    role === "student" ? { ...base, PORTAL: "student", STUDENT_ORIGIN: "https://s.example" } : base;
  const a = createApp(
    {
      session: async () => ({ id: ME, role, email: "me@example.com", csrf: "abc" }),
      transaction: (fn) => fn({}),
      query: async (q, args) => (sql.push(q), query ? query(q, args) : []),
      audit: async () => {},
    },
    { ...config, ...extra },
  );
  const origin = role === "student" ? "https://s.example" : ADMIN;
  return {
    sql,
    get: (p) => request(a).get(p).set("Cookie", cookie),
    post: (p) =>
      request(a).post(p).set("Cookie", cookie).set("Origin", origin).set("X-CSRF-Token", "abc"),
  };
}

test("Only owners and admins manage videos and student resources", async () => {
  for (const role of ["editor", "mentor", "student"]) {
    const { get, post, sql } = app(role);
    await get("/api/videos").expect(403);
    await post("/api/videos").send({ name: "a.mp4", size: 100, mime: "video/mp4" }).expect(403);
    await post("/api/videos/" + VID + "/chunk")
      .set("Content-Type", "application/octet-stream")
      .set("X-Offset", "0")
      .send(Buffer.alloc(20))
      .expect(403);
    await post("/api/videos/" + VID + "/delete")
      .send({})
      .expect(403);
    await get("/api/resources").expect(403);
    await post("/api/resources").send({ type: "guide", title: "x" }).expect(403);
    assert.deepEqual(sql, [], role + " refused before any query");
  }
});

test("Resource links must be https (no javascript: or http:)", async () => {
  const { post } = app("admin");
  for (const url of ["javascript:alert(1)", "http://example.com", "https://ex ample.com"])
    await post("/api/resources").send({ type: "link", title: "x", url }).expect(400);
  await post("/api/resources").send({ type: "video", title: "x" }).expect(400);
  await post("/api/resources").send({ type: "guide", title: "x", owner: true }).expect(400);
});

test("Chunked upload writes at the right offset, checks the file type, then streams with ranges", async () => {
  const dir = await mkdtemp(join(tmpdir(), "sc-video-"));
  try {
    const mp4 = Buffer.concat([
      Buffer.from([0, 0, 0, 24]),
      Buffer.from("ftypisom"),
      Buffer.alloc(40, 7),
    ]);
    const row = {
      id: null,
      mime: "video/mp4",
      size: mp4.length,
      received: 0,
      status: "uploading",
      name: "a.mp4",
    };
    const query = async (q, args) => {
      if (q.includes("SUM(size)")) return [{ used: 0 }];
      if (q.startsWith("INSERT INTO videos")) return ((row.id = args[0]), { affectedRows: 1 });
      if (q.startsWith("SELECT * FROM videos")) return [row];
      if (q.startsWith("UPDATE videos SET received")) return ((row.received = args[0]), {});
      if (q.startsWith("UPDATE videos SET status")) return ((row.status = "ready"), {});
      if (q.includes("FROM lms_lessons l WHERE l.id=? AND l.video_id")) return [{ 1: 1 }];
      if (q.startsWith("SELECT id,mime FROM videos")) return row.status === "ready" ? [row] : [];
      return [];
    };
    const admin = app("admin", query, { VIDEO_DIR: dir });
    const start = await admin
      .post("/api/videos")
      .send({ name: "Intro.mp4", size: mp4.length, mime: "video/mp4" })
      .expect(201);
    const chunk = (from, to) =>
      admin
        .post("/api/videos/" + start.body.id + "/chunk")
        .set("Content-Type", "application/octet-stream")
        .set("X-Offset", String(from))
        .send(mp4.subarray(from, to));
    await chunk(20, 30).expect(409); // wrong offset is refused
    await admin
      .post("/api/videos/" + start.body.id + "/complete")
      .send({})
      .expect(409); // not finished
    await chunk(0, 20).expect(200);
    await chunk(20, mp4.length).expect(200);
    await admin
      .post("/api/videos/" + start.body.id + "/complete")
      .send({})
      .expect(200);
    assert.deepEqual(await readFile(join(dir, start.body.id + ".mp4")), mp4);

    const url = playLink(start.body.id, ME, "lesson", LESSON);
    const res = await admin.get(url).set("Range", "bytes=4-11").expect(206);
    assert.equal(res.headers["content-range"], `bytes 4-11/${mp4.length}`);
    assert.equal(res.headers["cache-control"], "private, no-store");
    assert.equal(Buffer.from(res.body).toString("latin1"), "ftypisom");
    // Someone else's link does not work for this session.
    await admin.get(playLink(start.body.id, OTHER, "lesson", LESSON)).expect(403);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("A non-video file is rejected and removed at completion", async () => {
  const dir = await mkdtemp(join(tmpdir(), "sc-video-"));
  try {
    const bad = Buffer.from("<html><script>alert(1)</script></html>");
    const row = { id: null, mime: "video/mp4", size: bad.length, received: 0, status: "uploading" };
    const query = async (q, args) => {
      if (q.includes("SUM(size)")) return [{ used: 0 }];
      if (q.startsWith("INSERT INTO videos")) return ((row.id = args[0]), {});
      if (q.startsWith("SELECT * FROM videos")) return [row];
      if (q.startsWith("UPDATE videos SET received")) return ((row.received = args[0]), {});
      return [];
    };
    const admin = app("admin", query, { VIDEO_DIR: dir });
    const { body } = await admin
      .post("/api/videos")
      .send({ name: "x.mp4", size: bad.length, mime: "video/mp4" });
    await admin
      .post("/api/videos/" + body.id + "/chunk")
      .set("Content-Type", "application/octet-stream")
      .set("X-Offset", "0")
      .send(bad)
      .expect(200);
    await admin
      .post("/api/videos/" + body.id + "/complete")
      .send({})
      .expect(415);
    await assert.rejects(readFile(join(dir, body.id + ".mp4")));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("Streams re-check access: a student whose access ended gets 403", async () => {
  const student = app("student", async () => []);
  await student.get(playLink(VID, ME, "lesson", LESSON)).expect(403);
  await student.get(playLink(VID, ME, "resource", LESSON)).expect(403);
});

test("Students only see home, resources and play links through their own scope", async () => {
  const seen = [];
  const student = app("student", async (q, args) => (seen.push([q, args]), []));
  await student.get("/api/lms/my/resources").expect(200);
  await student.get("/api/lms/my/home").expect(200);
  await student.get("/api/lms/resources/" + VID + "/play").expect(404);
  for (const [q, args] of seen.filter(([q]) => q.includes("student_resources")))
    assert.ok(
      q.includes("up5.user_id=?") && args.includes(ME),
      "resource reads are scoped to the student",
    );
  // Staff-only listing is closed to students.
  await student.get("/api/resources").expect(403);
});
