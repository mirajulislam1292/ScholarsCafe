import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import { canManage, trustedGoogleIdentity, recordInput } from "./security.js";
const config = {
  ADMIN_ORIGIN: "https://admin.scholarscafe.com",
  PUBLIC_ORIGIN: "https://scholarscafe.com",
  GOOGLE_CLIENT_ID: "test",
};
test("Role management prevents editor escalation and admin ownership grants", () => {
  for (const target of ["owner", "admin", "editor"])
    for (const role of ["owner", "admin", "editor"])
      assert.equal(canManage("editor", target, role), false);
  assert.equal(canManage("admin", "editor", "owner"), false);
  assert.equal(canManage("admin", "owner", "editor"), false);
  assert.equal(canManage("admin", "editor", "editor"), true);
  assert.equal(canManage("owner", "admin", "owner"), true);
});
test("Google email and nonce must be verified; third party emails are not trusted automatically", () => {
  const p = { sub: "123", email: "owner@gmail.com", email_verified: true, nonce: "expected" };
  assert.equal(trustedGoogleIdentity(p, "expected"), true);
  assert.equal(trustedGoogleIdentity({ ...p, email_verified: false }, "expected"), false);
  assert.equal(trustedGoogleIdentity(p, "different"), false);
  assert.equal(trustedGoogleIdentity({ ...p, email: "owner@example.com" }, "expected"), false);
});
test("Anonymous users cannot access admin APIs", async () => {
  const app = createApp({}, config);
  for (const path of ["me", "content", "users", "audit"])
    await request(app)
      .get("/api/" + path)
      .expect(401);
  await request(app).post("/api/content").send({}).expect(401);
});
test("Authenticated writes require both same origin and CSRF token", async () => {
  const store = { session: async () => ({ id: "1", role: "owner", csrf: "abc" }) };
  const app = createApp(store, config);
  await request(app)
    .post("/api/users")
    .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
    .send({})
    .expect(403);
  await request(app)
    .post("/api/users")
    .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
    .set("Origin", "https://attacker.example")
    .set("X-CSRF-Token", "abc")
    .send({})
    .expect(403);
});
test("Editors cannot publish or read staff records", async () => {
  const app = createApp(
    { session: async () => ({ id: "1", role: "editor", csrf: "abc" }) },
    config,
  );
  const cookie = "__Host-sc_session=" + "a".repeat(64);
  await request(app).get("/api/users").set("Cookie", cookie).expect(403);
  await request(app)
    .post("/api/content/example/publish")
    .set("Cookie", cookie)
    .set("Origin", config.ADMIN_ORIGIN)
    .set("X-CSRF-Token", "abc")
    .send({ version: 1 })
    .expect(403);
});
test("OAuth callback rejects missing state before exchanging credentials", async () => {
  await request(createApp({}, config)).get("/auth/callback?state=forged&code=forged").expect(400);
});
test("Untrusted image schemes and arbitrary fields are rejected", () => {
  const base = {
    id: "a",
    kind: "mentors",
    title: "Mentor",
    version: 0,
    data: { name: "Test", role: "Mentor", bio: "", photo: "javascript:alert(1)", initials: "T" },
  };
  assert.equal(recordInput.safeParse(base).success, false);
  base.data.photo = "https://example.com/photo.png";
  assert.equal(recordInput.safeParse(base).success, true);
  base.data.roleOverride = "owner";
  assert.equal(recordInput.safeParse(base).success, false);
});
test("Public endpoint only queries published records and grants CORS to the website", async () => {
  const store = {
    query: async (sql) => {
      assert.match(sql, /WHERE published IS NOT NULL/);
      return [];
    },
  };
  const app = createApp(store, config);
  const ok = await request(app)
    .get("/public/content")
    .set("Origin", config.PUBLIC_ORIGIN)
    .expect(200);
  assert.equal(ok.headers["access-control-allow-origin"], config.PUBLIC_ORIGIN);
  const other = await request(app)
    .get("/public/content")
    .set("Origin", "https://other.example")
    .expect(200);
  assert.equal(other.headers["access-control-allow-origin"], undefined);
});
test("A genuine Google account still cannot enter without approval", async () => {
  const store = {
    transaction: (fn) => fn({}),
    query: async (sql) => {
      if (sql.startsWith("SELECT * FROM oauth_attempts"))
        return [{ nonce: "valid", verifier: "verifier" }];
      if (sql.startsWith("DELETE FROM oauth_attempts")) return {};
      if (sql.startsWith("SELECT * FROM users")) return [];
      throw Error("Unexpected write before authorization");
    },
  };
  const google = {
    getToken: async () => ({ tokens: { id_token: "verified-by-mock" } }),
    verifyIdToken: async () => ({
      getPayload: () => ({
        sub: "123",
        email: "unapproved@gmail.com",
        email_verified: true,
        nonce: "valid",
      }),
    }),
  };
  const response = await request(createApp(store, config, google))
    .get("/auth/callback?state=valid&code=code")
    .set("Cookie", "__Host-sc_oauth=valid")
    .expect(403);
  assert.ok(
    !(response.headers["set-cookie"] || []).some((c) => c.startsWith("__Host-sc_session=")),
  );
});
test("Revoked/expired sessions cannot read private data", async () => {
  const app = createApp({ session: async () => undefined }, config);
  await request(app)
    .get("/api/inquiries")
    .set("Cookie", "__Host-sc_session=" + "b".repeat(64))
    .expect(401);
});
test("Malformed inquiry payloads and off-site submission origins are rejected", async () => {
  const app = createApp({}, config);
  await request(app)
    .post("/public/inquiries")
    .set("Origin", "https://attacker.example")
    .send({})
    .expect(403);
  await request(app)
    .post("/public/inquiries")
    .set("Origin", config.PUBLIC_ORIGIN)
    .send({ email: "not-an-email" })
    .expect(400);
});
