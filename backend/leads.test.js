import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import { csvCell, canManage } from "./security.js";

const config = { ADMIN_ORIGIN: "https://admin.scholarscafe.com", PUBLIC_ORIGIN: "https://scholarscafe.com", GOOGLE_CLIENT_ID: "test" };
const COOKIE = "__Host-sc_session=" + "a".repeat(64);
const MENTOR = "11111111-1111-4111-8111-111111111111";
const LEAD = "22222222-2222-4222-8222-222222222222";
const asRole = (role, query, id = MENTOR) =>
  createApp({ session: async () => ({ id, role, csrf: "abc" }), transaction: (fn) => fn({}), query, audit: async () => {} }, config);
const get = (app, path) => request(app).get(path).set("Cookie", COOKIE);
const post = (app, path, body) =>
  request(app).post(path).set("Cookie", COOKIE).set("Origin", config.ADMIN_ORIGIN).set("X-CSRF-Token", "abc").send(body);

test("Mentors only see leads assigned to them (row-level scoping in SQL)", async () => {
  let seen;
  const app = asRole("mentor", async (sql, args) => { seen = { sql, args }; return []; });
  await get(app, "/api/leads?q=ana&assigned=" + LEAD).expect(200);
  assert.match(seen.sql, /i\.assigned_to=\?/);
  assert.equal(seen.args[0], MENTOR); // the mentor's own id, never a client-supplied one
  assert.equal(seen.args.includes(LEAD), false); // assignment filter ignored for mentors
});

test("Mentors are locked out of content, users, media and audit APIs", async () => {
  const app = asRole("mentor", async () => []);
  for (const path of ["/api/content", "/api/users", "/api/media", "/api/audit", "/api/inquiries", "/api/mentors"])
    await get(app, path).expect(403);
  await post(app, "/api/content", {}).expect(403);
});

test("Editors cannot read leads; mentors cannot reassign or touch others' leads", async () => {
  await get(asRole("editor", async () => []), "/api/leads").expect(403);
  await post(asRole("mentor", async () => []), "/api/leads/" + LEAD, { assigned_to: MENTOR }).expect(403);
  // Lead not in the mentor's scope -> 404 (no information leak), and nothing is written.
  const writes = [];
  const app = asRole("mentor", async (sql) => { if (!sql.startsWith("SELECT")) writes.push(sql); return []; });
  await post(app, "/api/leads/" + LEAD, { status: "contacted" }).expect(404);
  assert.equal(writes.length, 0);
});

test("Lead updates are validated and only assign active mentors", async () => {
  const admin = asRole("admin", async (sql) => (sql.includes("FROM inquiries") ? [{ id: LEAD }] : []));
  await post(admin, "/api/leads/" + LEAD, { status: "won" }).expect(400);
  await post(admin, "/api/leads/" + LEAD, { status: "new", role: "owner" }).expect(400);
  await post(admin, "/api/leads/" + LEAD, { assigned_to: MENTOR }).expect(400); // not an active mentor
  await post(admin, "/api/leads/not-a-uuid", { status: "new" }).expect(404);
});

test("CSV export neutralises spreadsheet formulas and is scoped", async () => {
  assert.equal(csvCell('=HYPERLINK("x")'), "\"'=HYPERLINK(\"\"x\"\")\"");
  assert.equal(csvCell("+1 555"), "\"'+1 555\"");
  assert.equal(csvCell(null), '""');
  let seen;
  const app = asRole("mentor", async (sql, args) => { seen = { sql, args }; return [{ name: "=cmd", email: "a@b.c" }]; });
  const res = await get(app, "/api/leads.csv").expect(200).expect("Content-Type", /text\/csv/);
  assert.match(res.text, /"'=cmd"/);
  assert.equal(seen.args[0], MENTOR);
});

test("Admins may manage mentors and editors but not owners or admins", () => {
  assert.equal(canManage("admin", "mentor", "mentor"), true);
  assert.equal(canManage("admin", "editor", "mentor"), true);
  assert.equal(canManage("admin", "mentor", "admin"), false);
  assert.equal(canManage("admin", "admin", "mentor"), false);
  assert.equal(canManage("mentor", "editor", "editor"), false);
});

test("Restore validates the old snapshot and requires the current version", async () => {
  const app = asRole("editor", async (sql) => {
    if (sql.startsWith("SELECT * FROM content")) return [{ id: "faq-01", kind: "faqs", title: "Q", version: 3, draft: {} }];
    if (sql.startsWith("SELECT snapshot")) return [{ snapshot: { q: "x", a: "y", position: 10 } }];
    return { affectedRows: 1 };
  });
  await post(app, "/api/content/faq-01/restore", { revision: 7, version: 2 }).expect(409);
  await post(app, "/api/content/faq-01/restore", { revision: 7, version: 3 }).expect(200);
  // Editors cannot delete
  await post(app, "/api/content/faq-01/delete", { version: 3 }).expect(403);
});
