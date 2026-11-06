import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";

const config = {
  ADMIN_ORIGIN: "https://admin.scholarscafe.com",
  PUBLIC_ORIGIN: "https://scholarscafe.com",
  GOOGLE_CLIENT_ID: "t",
};
const ME = "11111111-1111-4111-8111-111111111111";
const STUDENT = "22222222-2222-4222-8222-222222222222";
const PKG = "33333333-3333-4333-8333-333333333333";
const COURSE = "44444444-4444-4444-8444-444444444444";
const MENTOR = "55555555-5555-4555-8555-555555555555";

function appFor(role, query) {
  const sql = [];
  const audits = [];
  const app = createApp(
    {
      session: async () => ({ id: ME, role, csrf: "abc" }),
      transaction: (fn) => fn({}),
      query: async (q, args) => (sql.push(q), query ? query(q, args) : []),
      audit: async (_a, action) => audits.push(action),
    },
    role === "student"
      ? {
          ...config,
          PORTAL: "student",
          STUDENT_ORIGIN: "https://s.example",
          ADMIN_ORIGIN: "https://s.example",
        }
      : config,
  );
  const post = (path, body) =>
    request(app)
      .post(path)
      .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
      .set("Origin", role === "student" ? "https://s.example" : config.ADMIN_ORIGIN)
      .set("X-CSRF-Token", "abc")
      .send(body);
  const get = (path) =>
    request(app)
      .get(path)
      .set("Cookie", "__Host-sc_session=" + "a".repeat(64));
  return { post, get, sql, audits };
}

test("Only owners and admins reach packages and per-student controls", async () => {
  for (const role of ["editor", "mentor", "student"]) {
    const { post, get, sql } = appFor(role);
    await get("/api/packages").expect(403);
    await post("/api/packages", { name: "Cohort" }).expect(403);
    await post("/api/packages/" + PKG, { name: "Cohort" }).expect(403);
    await post("/api/packages/" + PKG + "/delete", {}).expect(403);
    await post("/api/packages/assign", { user_id: STUDENT, package_id: PKG }).expect(403);
    await post("/api/packages/unassign", { user_id: STUDENT, package_id: PKG }).expect(403);
    await post("/api/students/" + STUDENT + "/access", { active: false }).expect(403);
    await post("/api/students/" + STUDENT + "/mentor", { mentor_id: null }).expect(403);
    assert.deepEqual(sql, [], role + " must be refused before any query");
  }
});

test("Package input is validated (unknown fields, bad course ids, unknown features)", async () => {
  const { post } = appFor("admin");
  await post("/api/packages", { name: "x", owner: true }).expect(400);
  await post("/api/packages", { name: "x", course_ids: ["1 OR 1=1"] }).expect(400);
  await post("/api/packages", { name: "x", features: { admin: true } }).expect(400);
  await post("/api/packages", { name: "" }).expect(400);
});

test("Creating a package refuses courses that do not exist", async () => {
  const { post } = appFor("admin", async () => []);
  const res = await post("/api/packages", { name: "Cohort", course_ids: [COURSE] }).expect(400);
  assert.match(res.body.error, /existing courses/);
});

test("Assigning a package checks the student and enrolls them in its courses", async () => {
  const { post, sql, audits } = appFor("admin", async (q) => {
    if (q.includes("FROM users WHERE id=? AND role='student'")) return [{ id: STUDENT }];
    if (q.includes("role='mentor'")) return [{ id: MENTOR }];
    if (q.includes("FROM packages WHERE id=?")) return [{ name: "Cohort" }];
    return [];
  });
  await post("/api/packages/assign", {
    user_id: STUDENT,
    package_id: PKG,
    mentor_id: MENTOR,
  }).expect(200);
  assert.ok(sql.some((q) => q.includes("INSERT IGNORE INTO user_packages")));
  assert.ok(sql.some((q) => q.includes("INSERT INTO enrollments") && q.includes("up.user_id=?")));
  assert.deepEqual(audits, ["package_assign:Cohort"]);
});

test("Packages cannot be assigned to staff accounts or with a non-mentor", async () => {
  const notStudent = appFor("admin", async () => []);
  await notStudent.post("/api/packages/assign", { user_id: STUDENT, package_id: PKG }).expect(404);
  const badMentor = appFor("admin", async (q) =>
    q.includes("role='student'") ? [{ id: STUDENT }] : [],
  );
  await badMentor
    .post("/api/packages/assign", { user_id: STUDENT, package_id: PKG, mentor_id: MENTOR })
    .expect(400);
});

test("Removing a package only drops courses no other package covers", async () => {
  const { post, sql } = appFor("admin", async (q) => {
    if (q.includes("role='student'")) return [{ id: STUDENT }];
    if (q.startsWith("DELETE FROM user_packages")) return { affectedRows: 1 };
    if (q.includes("FROM package_courses WHERE package_id=?")) return [{ course_id: COURSE }];
    return [];
  });
  await post("/api/packages/unassign", { user_id: STUDENT, package_id: PKG }).expect(200);
  const drop = sql.find((q) => q.startsWith("DELETE e FROM enrollments"));
  assert.match(drop, /NOT EXISTS/);
});

test("A package held by students cannot be deleted", async () => {
  const { post } = appFor("owner", async (q) => {
    if (q.includes("SELECT name FROM packages")) return [{ name: "Cohort" }];
    if (q.includes("COUNT(*) AS n")) return [{ n: 2 }];
    return [];
  });
  const res = await post("/api/packages/" + PKG + "/delete", {}).expect(409);
  assert.match(res.body.error, /2 student/);
});

test("Disabling a student signs them out everywhere", async () => {
  const { post, sql, audits } = appFor("admin", async (q) =>
    q.includes("role='student'") ? [{ id: STUDENT }] : [],
  );
  await post("/api/students/" + STUDENT + "/access", { active: false }).expect(200);
  assert.ok(sql.some((q) => q.startsWith("DELETE FROM sessions")));
  assert.deepEqual(audits, ["student_disable"]);
});
