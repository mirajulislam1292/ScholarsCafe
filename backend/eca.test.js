import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import { alertBody, ECA_GAP_SECONDS, unsubscribeUrl } from "./eca.js";
import { deliverMail } from "./mail.js";

const config = {
  ADMIN_ORIGIN: "https://admin.scholarscafe.com",
  PUBLIC_ORIGIN: "https://scholarscafe.com",
  GOOGLE_CLIENT_ID: "test",
};
const COOKIE = "__Host-sc_session=" + "a".repeat(64);
const ACTOR = "11111111-1111-4111-8111-111111111111";
const SUB = "22222222-2222-4222-8222-222222222222";
const TOKEN = "b".repeat(64);

/** Fake store that records every query and answers SELECTs from a small in-memory list. */
function fakeStore(role = "owner", subs = []) {
  const queries = [];
  const audits = [];
  return {
    queries,
    audits,
    session: async () => ({ id: ACTOR, role, csrf: "abc" }),
    transaction: (fn) => fn({}),
    audit: async (actor, action, target) => audits.push({ actor, action, target }),
    query: async (sql, args = []) => {
      queries.push({ sql, args });
      if (sql.startsWith("SELECT email,token FROM eca_subscribers")) return subs;
      if (sql.startsWith("SELECT token FROM eca_subscribers"))
        return subs.filter((s) => s.id === args[0]);
      if (sql.startsWith("SELECT id,email")) return subs;
      return { affectedRows: 1 };
    },
  };
}
const signup = (app, body) =>
  request(app)
    .post("/public/eca-alerts")
    .set("Origin", config.PUBLIC_ORIGIN)
    .send({ email: "Student@Example.com", consent: true, ...body });
const admin = (app, path, body) =>
  request(app)
    .post(path)
    .set("Cookie", COOKIE)
    .set("Origin", config.ADMIN_ORIGIN)
    .set("X-CSRF-Token", "abc")
    .send(body);

test("ECA sign-up: website origin only, consent required, honeypot, lower-cased email", async () => {
  const store = fakeStore();
  const app = createApp(store, config);
  await request(app)
    .post("/public/eca-alerts")
    .set("Origin", "https://evil.example")
    .send({ email: "a@b.co", consent: true })
    .expect(403);
  await signup(app, { consent: false }).expect(400);
  await signup(app, { role: "owner" }).expect(400); // unknown fields rejected
  await signup(app, { website: "spam" }).expect(201);
  assert.equal(store.queries.filter((q) => q.sql.includes("eca_subscribers")).length, 0);
  const res = await signup(app).expect(201);
  assert.equal(res.headers["access-control-allow-origin"], config.PUBLIC_ORIGIN);
  const insert = store.queries.find((q) => q.sql.startsWith("INSERT INTO eca_subscribers"));
  assert.equal(insert.args[1], "student@example.com");
  assert.match(insert.args[2], /^[0-9a-f]{64}$/); // random unsubscribe token
  // Re-subscribing after unsubscribing turns alerts back on; the answer never says who is listed.
  assert.match(insert.sql, /ON DUPLICATE KEY UPDATE .*unsubscribed_at=NULL/);
});

test("ECA sign-up uses Turnstile when configured", async () => {
  const app = createApp(fakeStore(), {
    ...config,
    TURNSTILE_SECRET_KEY: "x",
    verifyTurnstile: async (_s, t) => t === "good",
  });
  await signup(app).expect(400);
  await signup(app, { turnstileToken: "bad" }).expect(400);
  await signup(app, { turnstileToken: "good" }).expect(201);
});

test("The student portal has no ECA routes", async () => {
  const app = createApp(fakeStore("owner"), { ...config, PORTAL: "student" });
  await signup(app).expect(404);
  await request(app)
    .get("/public/unsubscribe/eca?t=" + TOKEN)
    .expect(404);
});

test("Unsubscribe: GET only shows a button, POST unsubscribes and drops queued alerts", async () => {
  const store = fakeStore();
  const app = createApp(store, config);
  const page = await request(app)
    .get("/public/unsubscribe/eca?t=" + TOKEN)
    .expect(200);
  assert.match(page.text, /<form method="post"/);
  assert.equal(store.queries.filter((q) => q.sql.startsWith("UPDATE")).length, 0);
  await request(app).get("/public/unsubscribe/eca?t=not-a-token").expect(400);
  // One-click unsubscribe from a mail app (RFC 8058): form-encoded POST, no Origin header.
  await request(app)
    .post("/public/unsubscribe/eca?t=" + TOKEN)
    .type("form")
    .send("List-Unsubscribe=One-Click")
    .expect(200);
  const update = store.queries.find((q) => q.sql.startsWith("UPDATE eca_subscribers"));
  assert.deepEqual(update.args, [TOKEN]);
  const drop = store.queries.find((q) => q.sql.startsWith("DELETE FROM mail_outbox"));
  assert.deepEqual(drop.args, [unsubscribeUrl(config, TOKEN)]);
});

test("Only owners and admins can see the list or send alerts", async () => {
  for (const role of ["editor", "mentor"]) {
    const app = createApp(fakeStore(role), config);
    await request(app).get("/api/eca/subscribers").set("Cookie", COOKIE).expect(403);
    await admin(app, "/api/eca/broadcast", { subject: "New ECA", body: "Details here." }).expect(
      403,
    );
    await admin(app, "/api/eca/subscribers/" + SUB + "/remove", {}).expect(403);
  }
  const res = await request(createApp(fakeStore("admin"), config))
    .get("/api/eca/subscribers")
    .set("Cookie", COOKIE)
    .expect(200);
  assert.equal(res.body.from, "contact@scholarscafe.com");
});

test("Broadcast queues one paced outbox row per active subscriber, with an unsubscribe link, and is audited", async () => {
  const subs = [
    { id: SUB, email: "one@example.com", token: "1".repeat(64) },
    { id: ACTOR, email: "two@example.com", token: "2".repeat(64) },
  ];
  const store = fakeStore("owner", subs);
  const app = createApp(store, config);
  await admin(app, "/api/eca/broadcast", { subject: "x", body: "short" }).expect(400);
  const res = await admin(app, "/api/eca/broadcast", {
    subject: "New ECA open: Debate club",
    body: "Apply by Friday at https://example.com",
  }).expect(201);
  assert.equal(res.body.queued, 2);
  const insert = store.queries.find((q) => q.sql.startsWith("INSERT INTO mail_outbox"));
  assert.match(insert.sql, /to_email,unsubscribe_url,next_attempt_at/);
  const rows = [];
  for (let i = 0; i < insert.args.length; i += 7) rows.push(insert.args.slice(i, i + 7));
  assert.equal(rows.length, 2);
  for (const [n, [, subject, body, replyTo, to, url, delay]] of rows.entries()) {
    assert.equal(subject, "New ECA open: Debate club");
    assert.equal(to, subs[n].email);
    assert.equal(replyTo, "contact@scholarscafe.com");
    assert.equal(url, unsubscribeUrl(config, subs[n].token));
    assert.ok(body.includes(url), "each email carries its own unsubscribe link");
    assert.equal(delay, n * ECA_GAP_SECONDS); // paced, never all at once
  }
  assert.equal(store.audits[0].action, "eca_broadcast");
  assert.match(store.audits[0].target, /^2 recipient/);
  // With nobody signed up, nothing is queued.
  await admin(createApp(fakeStore("owner", []), config), "/api/eca/broadcast", {
    subject: "New ECA open",
    body: "Some details here.",
  }).expect(400);
});

test("Removing a subscriber deletes them and their queued alerts, and is audited", async () => {
  const store = fakeStore("admin", [{ id: SUB, email: "one@example.com", token: TOKEN }]);
  const app = createApp(store, config);
  await admin(app, "/api/eca/subscribers/not-a-uuid/remove", {}).expect(404);
  await admin(app, "/api/eca/subscribers/" + ACTOR + "/remove", {}).expect(404);
  await admin(app, "/api/eca/subscribers/" + SUB + "/remove", {}).expect(200);
  assert.ok(store.queries.some((q) => q.sql.startsWith("DELETE FROM eca_subscribers")));
  assert.deepEqual(store.queries.find((q) => q.sql.startsWith("DELETE FROM mail_outbox")).args, [
    unsubscribeUrl(config, TOKEN),
  ]);
  assert.equal(store.audits[0].action, "eca_subscriber_remove");
});

test("The outbox worker adds one-click List-Unsubscribe headers to alert emails only", async () => {
  const sent = [];
  const transport = { sender: "contact@scholarscafe.com", sendMail: async (m) => sent.push(m) };
  const url = unsubscribeUrl(config, TOKEN);
  for (const row of [
    {
      id: "a",
      subject: "Alert",
      body: alertBody("Hi", url),
      to_email: "x@y.co",
      unsubscribe_url: url,
    },
    { id: "b", subject: "Team", body: "note", to_email: null, unsubscribe_url: null },
  ]) {
    const store = {
      transaction: (fn) => fn({}),
      query: async (sql) => (sql.startsWith("SELECT") ? [row] : { affectedRows: 1 }),
    };
    await deliverMail(store, transport);
  }
  assert.equal(sent[0].headers["List-Unsubscribe"], `<${url}>`);
  assert.equal(sent[0].headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
  assert.equal(sent[1].headers, undefined);
});
