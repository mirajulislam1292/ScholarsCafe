import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import {
  API_ROUTES,
  apiRule,
  can,
  CONTENT_KIND_PERMISSION,
  mayCallApi,
  PERMISSIONS,
  permissionsOf,
  STAFF_ROLES,
} from "./permissions.js";
import { KINDS } from "./security.js";

const config = {
  ADMIN_ORIGIN: "https://admin.scholarscafe.com",
  PUBLIC_ORIGIN: "https://scholarscafe.com",
  GOOGLE_CLIENT_ID: "t",
};
const cookie = "__Host-sc_session=" + "a".repeat(64);
const ID = "11111111-1111-4111-8111-111111111111";

/** Every /api path the admin app mounts (Express 5 router), with its methods. */
function apiPaths(app) {
  const out = [];
  for (const layer of app.router.stack)
    if (layer.route?.path?.startsWith?.("/api/"))
      out.push([layer.route.path, Object.keys(layer.route.methods)]);
  return out;
}

test("Every API route the admin app mounts has a rule in the permission map", () => {
  const app = createApp({ session: async () => null }, config);
  const paths = apiPaths(app);
  assert.ok(paths.length > 100, "found the routes");
  const missing = paths.filter(([p]) => !apiRule(p.slice(4)));
  assert.deepEqual(missing, []);
});

test("Every permission names real roles, and every content kind has a permission", () => {
  for (const [p, roles] of Object.entries(PERMISSIONS))
    for (const r of roles) assert.ok([...STAFF_ROLES, "student"].includes(r), p + ": " + r);
  for (const kind of KINDS) assert.ok(CONTENT_KIND_PERMISSION[kind], kind);
  for (const [, permission] of API_ROUTES)
    assert.ok(permission === null || PERMISSIONS[permission], String(permission));
});

test("Role matrix: what each role may and may not do", () => {
  const yes = {
    owner: Object.keys(PERMISSIONS).filter((p) => !["progress.write", "review.write"].includes(p)),
    admin: [
      "chat.board",
      "tasks.manage",
      "team.performance",
      "site.manage",
      "leads.assign",
      "leads.export",
      "content.publish",
      "inbox.admin",
    ],
    editor: [
      "chat.team",
      "leads.view",
      "mail.inbox",
      "students.all",
      "course.write",
      "review.moderate",
    ],
    mentor: [
      "chat.team",
      "tasks.view",
      "bookings.view",
      "mail.send",
      "content.write",
      "document.review",
    ],
  };
  const no = {
    admin: ["users.manage", "audit.view", "settings.system", "site.advanced", "chat.moderate"],
    editor: [
      "chat.board",
      "tasks.manage",
      "team.performance",
      "site.manage",
      "leads.assign",
      "leads.export",
      "content.publish",
      "content.delete",
      "package.write",
      "course.delete",
      "users.manage",
    ],
    mentor: [
      "chat.board",
      "leads.view",
      "mail.inbox",
      "students.all",
      "course.write",
      "review.moderate",
      "site.manage",
      "tasks.manage",
    ],
  };
  for (const [role, list] of Object.entries(yes))
    for (const p of list) assert.equal(can(role, p), true, `${role} should have ${p}`);
  for (const [role, list] of Object.entries(no))
    for (const p of list) assert.equal(can(role, p), false, `${role} must not have ${p}`);
  assert.deepEqual(permissionsOf("student"), [
    "file.upload",
    "message.send",
    "profile.write",
    "progress.write",
    "review.write",
  ]);
  assert.equal(can("nobody", "chat.team"), false);
  assert.equal(can(undefined, "chat.team"), false);
  assert.equal(can("owner", "made.up"), false);
});

test("Path rules: prefixes match whole segments only, unknown paths are refused", () => {
  assert.equal(apiRule("/media")?.[0], "/media");
  assert.equal(apiRule("/mentors")?.[0], "/mentors");
  assert.equal(apiRule("/leads.csv")?.[0], "/leads");
  assert.equal(apiRule("/leadsx"), undefined);
  assert.equal(apiRule("/nothing-here"), undefined);
  assert.equal(mayCallApi({ role: "owner" }, "/nothing-here"), false);
  assert.equal(mayCallApi({ role: "student" }, "/media"), false);
  assert.equal(mayCallApi({ role: "student" }, "/lms/my/home"), true);
});

test("Restricted APIs refuse each role before any database query", async () => {
  const refused = {
    editor: [
      ["get", "/api/users"],
      ["get", "/api/audit"],
      ["get", "/api/settings"],
      ["get", "/api/workspace/team"],
      ["get", "/api/workspace/chat?channel=board"],
      ["get", "/api/forms"],
      ["get", "/api/mentors"],
      ["get", "/api/leads.csv"],
      ["post", "/api/visual/edit"],
      ["post", "/api/media"],
      ["post", "/api/users"],
      ["post", "/api/workspace/tasks"],
      ["post", "/api/booking/settings"],
      ["post", "/api/packages/assign"],
    ],
    mentor: [
      ["get", "/api/leads"],
      ["get", "/api/inbox"],
      ["get", "/api/users"],
      ["get", "/api/workspace/chat?channel=board"],
      ["get", "/api/workspace/team"],
      ["post", "/api/content/x/publish"],
      ["post", "/api/lms/courses"],
      ["post", "/api/resources"],
    ],
    admin: [
      ["get", "/api/users"],
      ["get", "/api/audit"],
      ["get", "/api/settings"],
      ["post", "/api/users"],
      ["post", "/api/settings"],
    ],
  };
  for (const [role, list] of Object.entries(refused)) {
    const sql = [];
    const app = createApp(
      {
        session: async () => ({ id: ID, role, csrf: "c", email: role + "@x.com" }),
        transaction: (fn) => fn({}),
        query: async (q) => (sql.push(q), []),
        audit: async () => {},
        checkRateLimit: async () => true,
      },
      config,
    );
    for (const [method, path] of list) {
      sql.length = 0;
      let r = request(app)[method](path).set("Cookie", cookie);
      if (method === "post")
        r = r.set("Origin", config.ADMIN_ORIGIN).set("X-CSRF-Token", "c").send({});
      const res = await r;
      assert.equal(res.status, 403, `${role} ${method.toUpperCase()} ${path} → ${res.status}`);
      assert.deepEqual(sql, [], `${role} ${path} refused before any query`);
    }
  }
});

test("/api/me sends the role label and the permission list the dashboard uses", async () => {
  for (const [role, label] of [
    ["owner", "Owner"],
    ["admin", "Admin"],
    ["editor", "Executive"],
    ["mentor", "Mentor"],
  ]) {
    const app = createApp(
      { session: async () => ({ id: ID, role, csrf: "c" }), query: async () => [] },
      config,
    );
    const me = (await request(app).get("/api/me").set("Cookie", cookie).expect(200)).body;
    assert.equal(me.role_label, label);
    assert.deepEqual(me.permissions, permissionsOf(role));
    assert.equal(me.super_admin, undefined, "no email-based Super Admin flag");
  }
});
