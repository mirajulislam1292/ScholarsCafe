import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";

test("Opening the app renews the session for 7 days (stays signed in across tabs and restarts)", async () => {
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
      ([q]) => q.startsWith("UPDATE sessions SET expires_at") && q.includes("INTERVAL 168 HOUR"),
    ),
  );
  const cookie = res.headers["set-cookie"].find((c) => c.startsWith("__Host-sc_session="));
  assert.match(cookie, /Max-Age=604800/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  // No session: still refused.
  await request(app).get("/api/me").expect(401);
});
