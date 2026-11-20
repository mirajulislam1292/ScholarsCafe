import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";

test("Opening the app renews the session for 30 days (stays signed in across tabs and restarts)", async () => {
  const sql = [];
  const app = createApp(
    {
      session: async () => ({ id: "u", role: "owner", email: "o@example.com", csrf: "c" }),
      query: async (q, a) => (sql.push([q, a]), { affectedRows: 1 }),
    },
    { ADMIN_ORIGIN: "https://admin.scholarscafe.com", PUBLIC_ORIGIN: "https://scholarscafe.com" },
  );
  const res = await request(app)
    .get("/api/me")
    .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
    .expect(200);
  assert.ok(
    sql.some(
      ([q]) => q.startsWith("UPDATE sessions SET expires_at") && q.includes("INTERVAL 720 HOUR"),
    ),
  );
  const cookie = res.headers["set-cookie"].find((c) => c.startsWith("__Host-sc_session="));
  assert.match(cookie, /Max-Age=2592000/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  // No session: still refused.
  await request(app).get("/api/me").expect(401);
});

const ORIGINS = {
  ADMIN_ORIGIN: "https://admin.scholarscafe.com",
  PUBLIC_ORIGIN: "https://scholarscafe.com",
};
const days = (n) => new Date(Date.now() + n * 86400000);
function sessionStore(expiresAt, sql = []) {
  return {
    sql,
    session: async () => ({
      id: "u",
      role: "owner",
      email: "o@example.com",
      csrf: "c",
      expires_at: expiresAt,
    }),
    query: async (q, a) => (sql.push([q, a]), q.startsWith("SELECT") ? [] : { affectedRows: 1 }),
  };
}
const renewals = (store) => store.sql.filter(([q]) => q.startsWith("UPDATE sessions SET expires_at"));

test("Sign-out cause: a tab or installed app left open never reloads /api/me, so its session used to run out", async () => {
  // A session renewed 10 days ago (20 days left): any signed-in request slides it back to 30 days.
  const old = sessionStore(days(20));
  const res = await request(createApp(old, ORIGINS))
    .get("/api/workspace/staff")
    .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
    .expect(200);
  assert.equal(renewals(old).length, 1);
  assert.match(
    res.headers["set-cookie"].find((c) => c.startsWith("__Host-sc_session=")),
    /Max-Age=2592000/,
  );
  // Renewed within the last day: no extra write on every request.
  const fresh = sessionStore(days(29.9));
  const quiet = await request(createApp(fresh, ORIGINS))
    .get("/api/workspace/staff")
    .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
    .expect(200);
  assert.equal(renewals(fresh).length, 0);
  assert.equal(quiet.headers["set-cookie"], undefined);
  // The expiry time is internal and is not sent to the browser.
  const me = await request(createApp(sessionStore(days(5)), ORIGINS))
    .get("/api/me")
    .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
    .expect(200);
  assert.equal(me.body.expires_at, undefined);
  assert.equal(me.body.csrf, "c");
});

test("Sign-out cause: the /api rate limit was per address, so a team in one office (or behind one proxy) shared it", async () => {
  const app = createApp(sessionStore(days(29.9)), ORIGINS);
  const a = "__Host-sc_session=" + "a".repeat(64);
  const b = "__Host-sc_session=" + "b".repeat(64);
  for (let i = 0; i < 180; i++) await request(app).get("/api/workspace/staff").set("Cookie", a);
  await request(app).get("/api/workspace/staff").set("Cookie", a).expect(429);
  // Someone else on the same address is not affected.
  await request(app).get("/api/workspace/staff").set("Cookie", b).expect(200);
});

test("Sign out and deactivation still end the session at once", async () => {
  const store = sessionStore(days(20));
  const res = await request(createApp(store, ORIGINS))
    .post("/api/logout")
    .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
    .set("Origin", ORIGINS.ADMIN_ORIGIN)
    .set("X-CSRF-Token", "c")
    .set("Content-Type", "application/json")
    .send("{}")
    .expect(200);
  assert.ok(store.sql.some(([q]) => q.startsWith("DELETE FROM sessions WHERE token_hash")));
  assert.equal(renewals(store).length, 0, "sign-out does not renew first");
  const cookies = res.headers["set-cookie"].filter((c) => c.startsWith("__Host-sc_session="));
  assert.equal(cookies.length, 1);
  assert.match(cookies[0], /Expires=Thu, 01 Jan 1970/);
  // Deactivated or signed out elsewhere: the store finds no live session, so the very next request is refused.
  const gone = createApp({ session: async () => undefined, query: async () => [] }, ORIGINS);
  await request(gone)
    .get("/api/me")
    .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
    .expect(401);
});
