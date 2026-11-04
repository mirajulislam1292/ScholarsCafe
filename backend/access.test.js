import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import { courseScope, lessonScope, studentScope, profileColumns, can, canReachStudent } from "./access.js";
import { canManage } from "./security.js";

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
  const config = { ADMIN_ORIGIN: "https://admin.scholarscafe.com", PUBLIC_ORIGIN: "https://scholarscafe.com", GOOGLE_CLIENT_ID: "t" };
  const app = createApp(
    { session: async () => ({ id: ME, role: "student", csrf: "abc" }), transaction: (fn) => fn({}), query: async () => [], audit: async () => {} },
    config,
  );
  const cookie = "__Host-sc_session=" + "a".repeat(64);
  for (const path of ["/api/content", "/api/leads", "/api/users", "/api/media", "/api/audit", "/api/inquiries", "/api/mentors"])
    await request(app).get(path).set("Cookie", cookie).expect(403);
  await request(app).get("/api/me").set("Cookie", cookie).expect(200);
});

test("Private media is never served on the public route", async () => {
  let sql;
  const app = createApp({ query: async (q) => ((sql = q), []) }, { ADMIN_ORIGIN: "https://a", PUBLIC_ORIGIN: "https://b" });
  await request(app).get("/public/media/11111111-1111-4111-8111-111111111111").expect(404);
  assert.match(sql, /visibility='public'/);
});

test("Course and student writes are refused for students and mentors before touching the database", async () => {
  const config = { ADMIN_ORIGIN: "https://admin.scholarscafe.com", PUBLIC_ORIGIN: "https://scholarscafe.com", GOOGLE_CLIENT_ID: "t" };
  for (const role of ["student", "mentor"]) {
    const writes = [];
    const app = createApp(
      { session: async () => ({ id: ME, role, csrf: "abc" }), transaction: (fn) => fn({}), query: async (sql) => (writes.push(sql), []), audit: async () => {} },
      config,
    );
    const post = (path, body) =>
      request(app).post(path).set("Cookie", "__Host-sc_session=" + "a".repeat(64)).set("Origin", config.ADMIN_ORIGIN).set("X-CSRF-Token", "abc").send(body);
    await post("/api/lms/courses", { title: "x" }).expect(403);
    await post("/api/lms/lessons", { course_id: OTHER, title: "x" }).expect(403);
    await post("/api/lms/students", { email: "a@b.co", full_name: "x" }).expect(403);
    await post("/api/lms/enrollments", { user_id: ME, course_id: OTHER }).expect(403);
    await post("/api/lms/students/" + OTHER, { full_name: "x" }).expect(403);
    assert.deepEqual(writes, []);
  }
});
