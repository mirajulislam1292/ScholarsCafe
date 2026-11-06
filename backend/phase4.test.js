import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { createApp } from "./app.js";
import { checkFile } from "./files.js";
import { makeToken } from "./tokens.js";

const ADMIN = "https://admin.scholarscafe.com";
const base = {
  ADMIN_ORIGIN: ADMIN,
  PUBLIC_ORIGIN: "https://scholarscafe.com",
  GOOGLE_CLIENT_ID: "t",
};
const ME = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const DOC = "33333333-3333-4333-8333-333333333333";
const FILE = "44444444-4444-4444-8444-444444444444";
const cookie = "__Host-sc_session=" + "a".repeat(64);
const PDF = "application/pdf";
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function app(role, query, extra = {}) {
  const sql = [];
  const audits = [];
  const config =
    role === "student"
      ? // As portalConfig does on the student app: requests must come from the student origin.
        {
          ...base,
          PORTAL: "student",
          STUDENT_ORIGIN: "https://s.example",
          ADMIN_ORIGIN: "https://s.example",
        }
      : base;
  const a = createApp(
    {
      session: async () => ({ id: ME, role, email: "me@example.com", csrf: "abc" }),
      transaction: (fn) => fn({}),
      query: async (q, args) => (sql.push([q, args]), query ? query(q, args) : []),
      audit: async (_a, action) => audits.push(action),
    },
    { ...config, ...extra },
  );
  const origin = role === "student" ? "https://s.example" : ADMIN;
  return {
    sql,
    audits,
    get: (p) => request(a).get(p).set("Cookie", cookie),
    post: (p) =>
      request(a).post(p).set("Cookie", cookie).set("Origin", origin).set("X-CSRF-Token", "abc"),
  };
}
const features = (f) => [{ features: JSON.stringify(f) }];

test("File content checks: real types pass, disguised or active content is refused", () => {
  assert.equal(checkFile(PDF, Buffer.from("%PDF-1.7\n1 0 obj << /Type /Catalog >>")), null);
  assert.match(checkFile(PDF, Buffer.from("<html>hi</html>")), /isn't a PDF/);
  assert.match(
    checkFile(
      PDF,
      Buffer.from("%PDF-1.7\n<< /OpenAction << /S /JavaScript /JS (app.alert(1)) >> >>"),
    ),
    /scripts/,
  );
  const zip = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    Buffer.from("word/document.xml"),
  ]);
  assert.equal(checkFile(DOCX, zip), null);
  assert.match(checkFile(DOCX, Buffer.concat([zip, Buffer.from("word/vbaProject.bin")])), /macros/);
  assert.match(checkFile(DOCX, Buffer.from("MZ executable")), /Word/);
  assert.equal(checkFile("text/plain", Buffer.from("My essay ✓")), null);
  assert.match(checkFile("text/plain", Buffer.from([0x41, 0x00, 0x42])), /plain text/);
  assert.match(checkFile("image/png", Buffer.from("GIF89a")), /PNG/);
  assert.match(checkFile("application/x-msdownload", Buffer.from("MZ")), /Use PDF/);
});

test("Uploads: editors refused; students need the feature; content is checked before storing", async () => {
  const dir = await mkdtemp(join(tmpdir(), "sc-files-"));
  try {
    const editor = app("editor", null, { FILE_DIR: dir });
    await editor
      .post(`/api/lms/files?student=${ME}&purpose=document`)
      .set("Content-Type", PDF)
      .send(Buffer.from("%PDF-1.4"))
      .expect(403);
    // Student without uploads/reviews in their package.
    const noFeature = app(
      "student",
      async (q) =>
        q.includes("role='student'") ? [{ id: ME }] : q.includes("p.features") ? features({}) : [],
      { FILE_DIR: dir },
    );
    await noFeature
      .post(`/api/lms/files?student=${ME}&purpose=document`)
      .set("Content-Type", PDF)
      .send(Buffer.from("%PDF-1.4 hello"))
      .expect(403);
    // Disguised file: refused before any database work or disk write.
    await noFeature
      .post(`/api/lms/files?student=${ME}&purpose=document`)
      .set("Content-Type", PDF)
      .send(Buffer.from("<script>alert(1)</script>"))
      .expect(415);
    await noFeature
      .post(`/api/lms/files?student=${ME}&purpose=document`)
      .set("Content-Type", "text/html")
      .send("<b>x</b>")
      .expect(415);
    assert.deepEqual(await readdir(dir), []);
    // A student uploading into another student's space.
    const other = app(
      "student",
      async (q) => (q.includes("role='student'") ? [{ id: OTHER }] : features({ uploads: true })),
      { FILE_DIR: dir },
    );
    await other
      .post(`/api/lms/files?student=${OTHER}&purpose=document`)
      .set("Content-Type", PDF)
      .send(Buffer.from("%PDF-1.4"))
      .expect(404);
    // Allowed: stored under a random id, original name only as metadata.
    const ok = app(
      "student",
      async (q) => {
        if (q.includes("role='student'")) return [{ id: ME }];
        if (q.includes("p.features")) return features({ uploads: true });
        if (q.includes("SUM(size)")) return [{ used: 0 }];
        return [];
      },
      { FILE_DIR: dir },
    );
    const res = await ok
      .post(`/api/lms/files?student=${ME}&purpose=document`)
      .set("Content-Type", PDF)
      .set("X-File-Name", "../../etc/passwd<script>.pdf")
      .send(Buffer.from("%PDF-1.4 my essay"))
      .expect(201);
    assert.deepEqual(await readdir(dir), [res.body.id]);
    assert.ok(!res.body.name.includes("/") && !res.body.name.includes("<"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("Downloads: link bound to the user, forced attachment, sandboxed", async () => {
  const student = app("student", async () => []);
  await student.get("/api/lms/download/" + makeToken({ f: FILE, u: OTHER }, 60)).expect(403);
  await student.get("/api/lms/download/garbage").expect(403);
  await student.get("/api/lms/files/" + FILE).expect(404); // not reachable
});

test("Messaging: students need the messaging feature; attachments must be their own fresh upload", async () => {
  const noMsg = app("student", async (q) =>
    q.includes("role='student'") ? [{ id: ME }] : q.includes("p.features") ? features({}) : [],
  );
  const r = await noMsg
    .post("/api/lms/threads/" + ME)
    .send({ body: "hi" })
    .expect(403);
  assert.match(r.body.error, /Messaging isn't included/);
  const withMsg = app("student", async (q) =>
    q.includes("role='student'")
      ? [{ id: ME }]
      : q.includes("p.features")
        ? features({ messaging: true })
        : [],
  );
  await withMsg
    .post("/api/lms/threads/" + ME)
    .send({ body: "hi" })
    .expect(201);
  await withMsg
    .post("/api/lms/threads/" + ME)
    .send({ body: "", file_id: FILE })
    .expect(400);
  await withMsg
    .post("/api/lms/threads/" + ME)
    .send({ body: "" })
    .expect(400);
});

test("Moderation: only owners/admins remove messages; removed content is hidden from students", async () => {
  for (const role of ["mentor", "student", "editor"]) {
    const { post } = app(role);
    await post("/api/lms/messages/" + FILE + "/delete")
      .send({})
      .expect(403);
  }
  const admin = app("admin", async () => ({ affectedRows: 1 }));
  await admin
    .post("/api/lms/messages/" + FILE + "/delete")
    .send({})
    .expect(200);
  assert.deepEqual(admin.audits, ["message_remove"]);
  const student = app("student", async (q) =>
    q.includes("role='student'")
      ? [{ id: ME }]
      : q.startsWith("SELECT m.id")
        ? [
            {
              id: "m1",
              body: "secret",
              deleted_at: "2026-01-01",
              file_id: FILE,
              file_name: "x.pdf",
              sender_id: OTHER,
            },
          ]
        : [],
  );
  const res = await student.get("/api/lms/threads/" + ME).expect(200);
  assert.deepEqual(
    [res.body.items[0].body, res.body.items[0].file_id, res.body.items[0].removed],
    ["", null, true],
  );
});

test("Documents: students can't set a status; mentors can't reach other students; editors refused", async () => {
  const student = app("student");
  await student
    .post("/api/lms/documents/" + DOC + "/comments")
    .send({ body: "done", status: "approved" })
    .expect(403);
  // Mentor: the scoped lookup finds nothing for a student who isn't theirs.
  const mentor = app("mentor", async () => []);
  await mentor
    .post("/api/lms/documents/" + DOC + "/comments")
    .send({ body: "ok", status: "approved" })
    .expect(404);
  const scoped = mentor.sql.find(([q]) => q.includes("FROM documents d WHERE d.id=?"));
  assert.match(scoped[0], /e2\.mentor_id=\?/);
  await app("editor").get("/api/lms/documents").expect(403);
  // Students submit only with the right feature.
  const noReview = app("student", async (q) =>
    q.includes("p.features") ? features({ uploads: true }) : [],
  );
  await noReview
    .post("/api/lms/documents")
    .send({ title: "SOP", kind: "sop", file_id: FILE, review: true })
    .expect(403);
  await app("mentor")
    .post("/api/lms/documents")
    .send({ title: "x", kind: "sop", file_id: FILE })
    .expect(403);
});

test("Testimonials: only approved reviews with consent become a website draft", async () => {
  const review = (over) => async (q) =>
    q.includes("FROM reviews r JOIN lms_courses")
      ? [
          {
            id: DOC,
            body: "Great help",
            status: "approved",
            public_consent: 1,
            featured: 0,
            full_name: "Rahim Uddin",
            course: "USA",
            ...over,
          },
        ]
      : [];
  await app("admin", review({ public_consent: 0 }))
    .post(`/api/lms/reviews/${DOC}/feature`)
    .send({})
    .expect(400);
  await app("admin", review({ status: "pending" }))
    .post(`/api/lms/reviews/${DOC}/feature`)
    .send({})
    .expect(400);
  await app("mentor", review({})).post(`/api/lms/reviews/${DOC}/feature`).send({}).expect(403);
  const ok = app("admin", review({}));
  await ok.post(`/api/lms/reviews/${DOC}/feature`).send({}).expect(200);
  const insert = ok.sql.find(([q]) => q.startsWith("INSERT IGNORE INTO content"));
  const draft = JSON.parse(insert[1][3]);
  assert.equal(draft.name, "Rahim", "first name only");
  assert.equal(insert[1][1], "feedback");
  assert.ok(!insert[0].includes("published"), "saved as a draft, not published");
});
