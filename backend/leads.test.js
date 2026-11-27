import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import { csvCell, canManage } from "./security.js";

const config = {
  ADMIN_ORIGIN: "https://admin.scholarscafe.com",
  PUBLIC_ORIGIN: "https://scholarscafe.com",
  GOOGLE_CLIENT_ID: "test",
};
const COOKIE = "__Host-sc_session=" + "a".repeat(64);
const MENTOR = "11111111-1111-4111-8111-111111111111";
const LEAD = "22222222-2222-4222-8222-222222222222";
const asRole = (role, query, id = MENTOR) =>
  createApp(
    {
      session: async () => ({ id, role, csrf: "abc" }),
      transaction: (fn) => fn({}),
      query,
      audit: async () => {},
    },
    config,
  );
const get = (app, path) => request(app).get(path).set("Cookie", COOKIE);
const post = (app, path, body) =>
  request(app)
    .post(path)
    .set("Cookie", COOKIE)
    .set("Origin", config.ADMIN_ORIGIN)
    .set("X-CSRF-Token", "abc")
    .send(body);

test("Mentors have no access to leads at all (list, export, update)", async () => {
  const writes = [];
  const app = asRole("mentor", async (sql) => {
    writes.push(sql);
    return [];
  });
  await get(app, "/api/leads").expect(403);
  await get(app, "/api/leads.csv").expect(403);
  await post(app, "/api/leads/" + LEAD, { status: "contacted" }).expect(403);
  assert.equal(writes.length, 0, "refused before any query");
});

test("Mentors are locked out of website management, users, audit and inbox admin APIs", async () => {
  const app = asRole("mentor", async () => []);
  for (const path of [
    "/api/users",
    "/api/audit",
    "/api/inquiries",
    "/api/mentors",
    "/api/settings",
  ])
    await get(app, path).expect(403);
  // Mentors may write blog drafts but not website sections or FAQs.
  await post(app, "/api/content", {
    id: "faq-x",
    kind: "faqs",
    title: "Q",
    data: { q: "Q", a: "A", position: 1 },
    version: 0,
  }).expect(403);
});

test("Executives read and update leads but cannot assign or export them", async () => {
  let seen;
  const exec = asRole("editor", async (sql, args) => {
    seen = { sql, args };
    return sql.includes("FROM inquiries") ? [{ id: LEAD }] : [];
  });
  await get(exec, "/api/leads?assigned=" + LEAD).expect(200);
  assert.equal(seen.args.includes(LEAD), false, "assignment filter is for owners and admins");
  await post(exec, "/api/leads/" + LEAD, { status: "contacted" }).expect(200);
  await post(exec, "/api/leads/" + LEAD, { assigned_to: MENTOR }).expect(403);
  await get(exec, "/api/leads.csv").expect(403);
});

test("Lead updates are validated and only assign active mentors", async () => {
  const admin = asRole("admin", async (sql) =>
    sql.includes("FROM inquiries") ? [{ id: LEAD }] : [],
  );
  await post(admin, "/api/leads/" + LEAD, { status: "won" }).expect(400);
  await post(admin, "/api/leads/" + LEAD, { status: "new", role: "owner" }).expect(400);
  await post(admin, "/api/leads/" + LEAD, { assigned_to: MENTOR }).expect(400); // not an active mentor
  await post(admin, "/api/leads/not-a-uuid", { status: "new" }).expect(404);
});

test("CSV export neutralises spreadsheet formulas (owners and admins)", async () => {
  assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.equal(csvCell("+1 555"), '"\'+1 555"');
  assert.equal(csvCell(null), '""');
  const app = asRole("admin", async () => [{ name: "=cmd", email: "a@b.c" }]);
  const res = await get(app, "/api/leads.csv")
    .expect(200)
    .expect("Content-Type", /text\/csv/);
  assert.match(res.text, /"'=cmd"/);
});

test("Only the Owner manages users and roles", () => {
  assert.equal(canManage("owner", "mentor", "admin"), true);
  assert.equal(canManage("admin", "mentor", "mentor"), false);
  assert.equal(canManage("admin", "editor", "mentor"), false);
  assert.equal(canManage("mentor", "editor", "editor"), false);
});

test("Restore validates the old snapshot and requires the current version", async () => {
  const app = asRole("admin", async (sql) => {
    if (sql.startsWith("SELECT kind FROM content")) return [{ kind: "faqs" }];
    if (sql.startsWith("SELECT * FROM content"))
      return [{ id: "faq-01", kind: "faqs", title: "Q", version: 3, draft: {} }];
    if (sql.startsWith("SELECT snapshot")) return [{ snapshot: { q: "x", a: "y", position: 10 } }];
    return { affectedRows: 1 };
  });
  await post(app, "/api/content/faq-01/restore", { revision: 7, version: 2 }).expect(409);
  await post(app, "/api/content/faq-01/restore", { revision: 7, version: 3 }).expect(200);
  // Executives can't restore or delete website FAQs (website management is for owners and admins).
  const exec = asRole("editor", async (sql) =>
    sql.startsWith("SELECT kind FROM content") ? [{ kind: "faqs" }] : [],
  );
  await post(exec, "/api/content/faq-01/restore", { revision: 7, version: 3 }).expect(403);
  await post(exec, "/api/content/faq-01/delete", { version: 3 }).expect(403);
});
