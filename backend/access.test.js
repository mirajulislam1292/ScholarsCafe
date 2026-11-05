import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import {
  courseScope,
  lessonScope,
  studentScope,
  profileColumns,
  can,
  canReachStudent,
} from "./access.js";
import { canManage } from "./security.js";

// Student sessions only work on the student portal (PORTAL=student); team sessions on the admin.
const forRole = (config, role) => (role === "student" ? { ...config, PORTAL: "student" } : config);

const ME = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const as = (role) => ({ id: ME, role });

test("Staff see everything; editors and unknown roles see nothing", () => {
  for (const role of ["owner", "admin"]) {
    assert.deepEqual(courseScope(as(role)), { sql: "1=1", params: [] });
    assert.deepEqual(studentScope(as(role), "m.student_id"), { sql: "1=1", params: [] });
  }
  for (const actor of [as("editor"), as("nobody"), null, { role: "student" }]) {
    assert.throws(() => courseScope(actor), { status: 403 });
    assert.throws(() => lessonScope(actor), { status: 403 });
    assert.throws(() => studentScope(actor, "e.user_id"), { status: 403 });
  }
});

test("Students are scoped to their own rows and open courses", () => {
  const s = as("student");
  assert.deepEqual(studentScope(s, "r.user_id"), { sql: "r.user_id=?", params: [ME] });
  const c = courseScope(s);
  assert.match(c.sql, /e3\.user_id=\?/);
  assert.match(c.sql, /status<>'paused'/);
  assert.match(c.sql, /c3\.status='published'/);
  assert.match(c.sql, /deleted_at IS NULL/);
  assert.deepEqual(c.params, [ME]);
  const l = lessonScope(s);
  assert.match(l.sql, /^l\.published=1 AND /);
  assert.deepEqual(l.params, [ME]);
  assert.doesNotMatch(profileColumns(s), /staff_notes/);
});

test("Mentors only reach students enrolled with them", async () => {
  const m = as("mentor");
  assert.deepEqual(studentScope(m, "m.student_id"), {
    sql: "m.student_id IN (SELECT e2.user_id FROM enrollments e2 WHERE e2.mentor_id=?)",
    params: [ME],
  });
  assert.match(profileColumns(m), /staff_notes/);
  const query = async (_sql, args) => (args[0] === OTHER && args[1] === ME ? [{ 1: 1 }] : []);
  assert.equal(await canReachStudent(m, OTHER, query), true);
  assert.equal(await canReachStudent(m, "33333333-3333-4333-8333-333333333333", query), false);
  assert.equal(await canReachStudent(as("student"), OTHER, query), false);
  assert.equal(await canReachStudent(as("student"), ME, query), true);
});

test("Scope columns are whitelisted (no SQL from callers)", () => {
  assert.throws(() => studentScope(as("student"), "1=1 OR x.user_id"));
  assert.throws(() => studentScope(as("student"), "m.body"));
});

test("Write permissions follow the role table", () => {
  assert.equal(can(as("student"), "course.write"), false);
  assert.equal(can(as("mentor"), "enrollment.write"), false);
  assert.equal(can(as("student"), "review.moderate"), false);
  assert.equal(can(as("student"), "review.write"), true);
  assert.equal(can(as("admin"), "course.write"), true);
  assert.equal(can(as("editor"), "message.send"), false);
  assert.equal(can(as("mentor"), "progress.write"), false);
  // Admins may create students; only owners make admins.
  assert.equal(canManage("admin", "student", "student"), true);
  assert.equal(canManage("admin", "student", "admin"), false);
});

test("Students are locked out of every staff API", async () => {
  const config = {
    ADMIN_ORIGIN: "https://admin.scholarscafe.com",
    PUBLIC_ORIGIN: "https://scholarscafe.com",
    GOOGLE_CLIENT_ID: "t",
  };
  const app = createApp(
    {
      session: async () => ({ id: ME, role: "student", csrf: "abc" }),
      transaction: (fn) => fn({}),
      query: async () => [],
      audit: async () => {},
    },
    forRole(config, "student"),
  );
  const cookie = "__Host-sc_session=" + "a".repeat(64);
  for (const path of [
    "/api/content",
    "/api/leads",
    "/api/users",
    "/api/media",
    "/api/audit",
    "/api/inquiries",
    "/api/mentors",
  ])
    await request(app).get(path).set("Cookie", cookie).expect(403);
  await request(app).get("/api/me").set("Cookie", cookie).expect(200);
});

test("Private media is never served on the public route", async () => {
  let sql;
  const app = createApp(
    { query: async (q) => ((sql = q), []) },
    { ADMIN_ORIGIN: "https://a", PUBLIC_ORIGIN: "https://b" },
  );
  await request(app).get("/public/media/11111111-1111-4111-8111-111111111111").expect(404);
  assert.match(sql, /visibility='public'/);
});

test("Course and student writes are refused for students and mentors before touching the database", async () => {
  const config = {
    ADMIN_ORIGIN: "https://admin.scholarscafe.com",
    PUBLIC_ORIGIN: "https://scholarscafe.com",
    GOOGLE_CLIENT_ID: "t",
  };
  for (const role of ["student", "mentor"]) {
    const writes = [];
    const app = createApp(
      {
        session: async () => ({ id: ME, role, csrf: "abc" }),
        transaction: (fn) => fn({}),
        query: async (sql) => (writes.push(sql), []),
        audit: async () => {},
      },
      forRole(config, role),
    );
    const post = (path, body) =>
      request(app)
        .post(path)
        .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
        .set("Origin", config.ADMIN_ORIGIN)
        .set("X-CSRF-Token", "abc")
        .send(body);
    await post("/api/lms/courses", { title: "x" }).expect(403);
    await post("/api/lms/lessons", { course_id: OTHER, title: "x" }).expect(403);
    await post("/api/lms/students", { email: "a@b.co", full_name: "x" }).expect(403);
    await post("/api/lms/enrollments", { user_id: ME, course_id: OTHER }).expect(403);
    await post("/api/lms/students/" + OTHER, { full_name: "x" }).expect(403);
    assert.deepEqual(writes, []);
  }
});

test("Lesson video: login required, editors refused, query scoped to the student and private files", async () => {
  const config = {
    ADMIN_ORIGIN: "https://admin.scholarscafe.com",
    PUBLIC_ORIGIN: "https://scholarscafe.com",
    GOOGLE_CLIENT_ID: "t",
  };
  const path = "/api/lms/lessons/" + OTHER + "/video";
  await request(createApp({ session: async () => null }, config))
    .get(path)
    .expect(401);
  const cookie = "__Host-sc_session=" + "a".repeat(64);
  const appFor = (role, query) =>
    createApp(
      { session: async () => ({ id: ME, role, csrf: "abc" }), query },
      forRole(config, role),
    );
  await request(appFor("editor", async () => []))
    .get(path)
    .set("Cookie", cookie)
    .expect(403);
  let seen;
  const app = appFor(
    "student",
    async (sql, args) => (
      (seen = { sql, args }),
      [{ bytes: Buffer.from("0123456789"), mime: "video/mp4" }]
    ),
  );
  const res = await request(app)
    .get(path)
    .set("Cookie", cookie)
    .set("Range", "bytes=2-5")
    .expect(206);
  assert.equal(res.headers["content-range"], "bytes 2-5/10");
  assert.equal(res.headers["cache-control"], "private, no-store");
  assert.match(seen.sql, /m\.visibility='private'/);
  assert.match(seen.sql, /l\.published=1/);
  assert.deepEqual(seen.args, [OTHER, ME]);
});

test("Messages: a student cannot read or post in another student's thread; mentors can't moderate reviews", async () => {
  const config = {
    ADMIN_ORIGIN: "https://admin.scholarscafe.com",
    PUBLIC_ORIGIN: "https://scholarscafe.com",
    GOOGLE_CLIENT_ID: "t",
  };
  const writes = [];
  const store = (role) => ({
    session: async () => ({ id: ME, role, csrf: "abc" }),
    transaction: (fn) => fn({}),
    checkRateLimit: async () => true,
    audit: async () => {},
    query: async (sql) => {
      if (!sql.startsWith("SELECT")) writes.push(sql);
      return sql.startsWith("SELECT id FROM users WHERE id=? AND role='student'")
        ? [{ id: OTHER }]
        : [];
    },
  });
  const cookie = "__Host-sc_session=" + "a".repeat(64);
  const app = createApp(store("student"), forRole(config, "student"));
  await request(app)
    .get("/api/lms/threads/" + OTHER)
    .set("Cookie", cookie)
    .expect(404);
  await request(app)
    .post("/api/lms/threads/" + OTHER)
    .set("Cookie", cookie)
    .set("Origin", config.ADMIN_ORIGIN)
    .set("X-CSRF-Token", "abc")
    .send({ body: "hi" })
    .expect(404);
  assert.deepEqual(writes, []);
  const mentor = createApp(store("mentor"), config);
  await request(mentor).get("/api/lms/reviews").set("Cookie", cookie).expect(403);
  await request(mentor)
    .post("/api/lms/reviews/" + OTHER)
    .set("Cookie", cookie)
    .set("Origin", config.ADMIN_ORIGIN)
    .set("X-CSRF-Token", "abc")
    .send({ status: "approved" })
    .expect(403);
});

test("Admin and student portals are separate: each refuses the other's sessions and sign-in methods", async () => {
  const base = {
    ADMIN_ORIGIN: "https://admin.scholarscafe.com",
    PUBLIC_ORIGIN: "https://scholarscafe.com",
    GOOGLE_CLIENT_ID: "t",
  };
  const cookie = "__Host-sc_session=" + "a".repeat(64);
  const appAs = (role, config) =>
    createApp(
      {
        session: async () => ({ id: ME, role, csrf: "abc" }),
        query: async () => [],
        checkRateLimit: async () => true,
      },
      config,
    );
  const admin = (role) => appAs(role, base);
  const student = (role) => appAs(role, { ...base, PORTAL: "student" });
  // A student session is useless on the admin; a team session is useless on the student portal.
  await request(admin("student")).get("/api/me").set("Cookie", cookie).expect(401);
  for (const role of ["owner", "admin", "editor", "mentor"])
    await request(student(role)).get("/api/me").set("Cookie", cookie).expect(401);
  await request(admin("owner")).get("/api/me").set("Cookie", cookie).expect(200);
  await request(student("student")).get("/api/me").set("Cookie", cookie).expect(200);
  // Admin is Google only: no email code or password routes exist there.
  const origin = base.ADMIN_ORIGIN;
  await request(admin("owner"))
    .post("/auth/password")
    .set("Origin", origin)
    .send({ email: "a@b.co", password: "x" })
    .expect(404);
  await request(admin("owner"))
    .post("/auth/email/start")
    .set("Origin", origin)
    .send({ email: "a@b.co" })
    .expect(404);
  await request(admin("owner"))
    .post("/api/password")
    .set("Cookie", cookie)
    .set("Origin", origin)
    .set("X-CSRF-Token", "abc")
    .send({ password: "x".repeat(12) })
    .expect(404);
  // The student portal does not serve the website's content or forms.
  await request(student("student")).get("/public/content").expect(404);
  assert.deepEqual((await request(student("student")).get("/auth/config")).body, {
    portal: "student",
    signup: true,
  });
  assert.deepEqual((await request(admin("owner")).get("/auth/config")).body, { portal: "admin" });
});

test("Google sign-in on the wrong portal is refused with a friendly redirect and no session", async () => {
  const google = {
    generateAuthUrl: () => "https://accounts.google.com",
    getToken: async () => ({ tokens: { id_token: "x" } }),
    verifyIdToken: async () => ({
      getPayload: () => ({ sub: "s1", email: "stu@gmail.com", email_verified: true, nonce: "n" }),
    }),
  };
  const writes = [];
  const store = (role) => ({
    transaction: async (fn) => fn({}),
    audit: async () => {},
    query: async (sql) => {
      if (sql.startsWith("SELECT * FROM oauth_attempts")) return [{ nonce: "n", verifier: "v" }];
      if (sql.startsWith("SELECT * FROM users"))
        return [{ id: ME, email: "stu@gmail.com", role, active: 1, google_sub: null }];
      if (!sql.startsWith("DELETE FROM oauth")) writes.push(sql);
      return [];
    },
  });
  const config = {
    ADMIN_ORIGIN: "https://admin.scholarscafe.com",
    PUBLIC_ORIGIN: "https://scholarscafe.com",
    GOOGLE_CLIENT_ID: "t",
  };
  const res = await request(createApp(store("student"), config, google))
    .get("/auth/callback?state=valid&code=c")
    .set("Cookie", "__Host-sc_oauth=valid")
    .expect(303);
  assert.equal(res.headers.location, "/?signin=other-portal");
  assert.ok(!(res.headers["set-cookie"] || []).some((c) => c.startsWith("__Host-sc_session=")));
  assert.deepEqual(writes, []);
  const res2 = await request(createApp(store("owner"), { ...config, PORTAL: "student" }, google))
    .get("/auth/callback?state=valid&code=c")
    .set("Cookie", "__Host-sc_oauth=valid")
    .expect(303);
  assert.equal(res2.headers.location, "/?signin=other-portal");
});

test("Security settings: only the Super Admin changes them; editors, mentors and students can't read them", async () => {
  const base = {
    ADMIN_ORIGIN: "https://admin.scholarscafe.com",
    PUBLIC_ORIGIN: "https://scholarscafe.com",
    GOOGLE_CLIENT_ID: "t",
  };
  const writes = [];
  const appAs = (role) =>
    createApp(
      {
        session: async () => ({ id: ME, role, csrf: "abc" }),
        query: async (sql, args) => (
          sql.startsWith("INSERT INTO settings") && writes.push(args),
          []
        ),
        transaction: (fn) => fn({}),
        audit: async () => {},
        checkRateLimit: async () => true,
      },
      role === "student"
        ? { ...base, PORTAL: "student", ADMIN_ORIGIN: "https://student.scholarscafe.com" }
        : base,
    );
  const cookie = "__Host-sc_session=" + "a".repeat(64);
  const set = (role, body, origin = base.ADMIN_ORIGIN) =>
    request(appAs(role))
      .post("/api/settings")
      .set("Cookie", cookie)
      .set("Origin", origin)
      .set("X-CSRF-Token", "abc")
      .send(body);
  await set("admin", { student_signup: "invite" }).expect(403);
  await set("editor", { student_signup: "invite" }).expect(403);
  await set("mentor", { student_signup: "invite" }).expect(403);
  await set("student", { student_signup: "invite" }, "https://student.scholarscafe.com").expect(
    403,
  );
  assert.equal(writes.length, 0);
  await set("owner", { student_signup: "maybe" }).expect(400);
  await set("owner", { student_signup: "invite" }).expect(200);
  assert.deepEqual(writes, [["invite"]]);
  await request(appAs("admin")).get("/api/settings").set("Cookie", cookie).expect(200);
  await request(appAs("editor")).get("/api/settings").set("Cookie", cookie).expect(403);
  await request(appAs("mentor")).get("/api/settings").set("Cookie", cookie).expect(403);
});
