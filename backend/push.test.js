import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import { deliverPush, pushEndpointOk, queuePush, vapidKeys, preview } from "./push.js";
import { queueTaskReminders } from "./workspace.js";

const ADMIN = "https://admin.scholarscafe.com";
const config = {
  ADMIN_ORIGIN: ADMIN,
  PUBLIC_ORIGIN: "https://scholarscafe.com",
  GOOGLE_CLIENT_ID: "t",
};
const cookie = "__Host-sc_session=" + "a".repeat(64);
const ID = (n) => `0000000${n}-0000-4000-8000-000000000000`;
const FCM = "https://fcm.googleapis.com/fcm/send/abc";

/** Minimal fake: records SQL, keeps settings, push_outbox and push_subscriptions in memory. */
function fakeStore(actor, extra = () => undefined) {
  const db = { settings: {}, outbox: [], subs: [], sql: [] };
  return {
    db,
    session: async () => actor && { ...actor, csrf: "c" },
    transaction: (fn) => fn({}),
    audit: async () => {},
    checkRateLimit: async () => true,
    query: async (q, a = []) => {
      db.sql.push([q, a]);
      const own = extra(q, a, db);
      if (own !== undefined) return own;
      if (q.startsWith("SELECT value FROM settings")) {
        const v = db.settings[/name='(\w+)'/.exec(q)[1]];
        return v ? [{ value: v }] : [];
      }
      if (q.startsWith("INSERT IGNORE INTO settings")) {
        db.settings.vapid_keys ??= a[0];
        return { affectedRows: 1 };
      }
      if (q.startsWith("INSERT INTO push_outbox")) {
        for (let i = 0; i < a.length; i += 2)
          db.outbox.push({ id: db.outbox.length + 1, user_id: a[i], payload: a[i + 1] });
        return { affectedRows: a.length / 2 };
      }
      if (q.startsWith("SELECT id,user_id,payload FROM push_outbox")) return [...db.outbox];
      if (q.startsWith("DELETE FROM push_outbox")) {
        db.outbox = db.outbox.filter((r) => !a.includes(r.id));
        return {};
      }
      if (q.startsWith("SELECT id,user_id,endpoint"))
        return db.subs.filter((s) => a.includes(s.user_id));
      if (q.startsWith("DELETE FROM push_subscriptions WHERE id=?") && q.endsWith("id=?")) {
        db.subs = db.subs.filter((s) => s.id !== a[0]);
        return {};
      }
      if (q.startsWith("INSERT INTO push_subscriptions")) {
        db.subs.push({
          id: a[0],
          user_id: a[1],
          endpoint: a[3],
          p256dh: a[4],
          auth: a[5],
          device: a[6],
        });
        return { affectedRows: 1 };
      }
      if (
        q.startsWith(
          "SELECT id FROM users WHERE active=1 AND role IN ('owner','admin','editor','mentor') AND id<>?",
        )
      )
        return [1, 2, 3]
          .map(ID)
          .filter((id) => id !== a[0])
          .map((id) => ({ id }));
      if (q.startsWith("SELECT id,device")) return [];
      return q.startsWith("SELECT") ? [] : { affectedRows: 1 };
    },
  };
}

test("VAPID keys: made once and stored, env vars override", async () => {
  const store = fakeStore();
  let made = 0;
  const gen = () => (made++, { publicKey: "PUB" + made, privateKey: "PRIV" + made });
  const k1 = await vapidKeys(store, {}, gen);
  const k2 = await vapidKeys(store, {}, gen);
  assert.equal(made, 1);
  assert.deepEqual([k1.publicKey, k1.privateKey], ["PUB1", "PRIV1"]);
  assert.equal(k2.publicKey, "PUB1");
  assert.equal(store.db.settings.vapid_keys, "PUB1.PRIV1");
  assert.equal(k1.subject, "mailto:contact@scholarscafe.com");
  // A second process that finds the stored pair uses it (no new keys).
  const other = fakeStore();
  other.db.settings.vapid_keys = "P.Q";
  assert.equal((await vapidKeys(other, {}, gen)).publicKey, "P");
  assert.equal(made, 1);
  const env = await vapidKeys(store, { VAPID_PUBLIC_KEY: " E ", VAPID_PRIVATE_KEY: "F" }, gen);
  assert.deepEqual([env.publicKey, env.privateKey], ["E", "F"]);
});

test("Push endpoints: only real browser push services", () => {
  for (const ok of [
    FCM,
    "https://updates.push.services.mozilla.com/wpush/v2/x",
    "https://web.push.apple.com/QO",
    "https://wns2-par02p.notify.windows.com/w/?token=x",
  ])
    assert.ok(pushEndpointOk(ok), ok);
  for (const bad of [
    "http://fcm.googleapis.com/x",
    "https://localhost/x",
    "https://169.254.169.254/latest",
    "https://fcm.googleapis.com.evil.com/x",
    "https://fcm.googleapis.com:8443/x",
    "not a url",
  ])
    assert.equal(pushEndpointOk(bad), false, bad);
});

test("Delivery: short payload to each device, dead subscriptions removed", async () => {
  const store = fakeStore();
  store.db.settings.vapid_keys = "PUB.PRIV";
  store.db.subs.push(
    { id: "s1", user_id: ID(1), endpoint: FCM + "1", p256dh: "k", auth: "a" },
    { id: "s2", user_id: ID(1), endpoint: FCM + "2", p256dh: "k", auth: "a" },
    { id: "s3", user_id: ID(2), endpoint: FCM + "3", p256dh: "k", auth: "a" },
  );
  await queuePush(store, undefined, [ID(1), ID(2), ID(1)], {
    title: "Team chat",
    body: "x".repeat(500),
    open: "Team chat",
    tag: "chat",
  });
  assert.equal(store.db.outbox.length, 2, "one row per person");
  const calls = [];
  const send = async (sub, payload, opts) => {
    calls.push({ sub, payload: JSON.parse(payload), opts });
    if (sub.endpoint.endsWith("2")) throw Object.assign(new Error("gone"), { statusCode: 410 });
  };
  const r = await deliverPush(store, {}, send);
  assert.equal(calls.length, 3);
  assert.deepEqual(r, { sent: 2, removed: 1 });
  assert.deepEqual(
    store.db.subs.map((s) => s.id),
    ["s1", "s3"],
  );
  assert.equal(store.db.outbox.length, 0);
  const p = calls[0].payload;
  assert.equal(p.open, "Team chat");
  assert.ok(p.body.length <= 90, "preview only");
  assert.equal(calls[0].opts.vapidDetails.publicKey, "PUB");
  assert.equal(preview("a  b\n c"), "a b c");
});

test("Routes: subscribe validates the endpoint; mentors allowed, students refused", async () => {
  const mentor = fakeStore({ id: ID(5), role: "mentor", email: "m@x.com" });
  mentor.db.settings.vapid_keys = "PUB.PRIV";
  const app = createApp(mentor, config);
  const got = await request(app).get("/api/push").set("Cookie", cookie).expect(200);
  assert.equal(got.body.publicKey, "PUB");
  const post = (body) =>
    request(app)
      .post("/api/push/subscribe")
      .set("Cookie", cookie)
      .set("Origin", ADMIN)
      .set("X-CSRF-Token", "c")
      .send(body);
  const keys = { p256dh: "B".repeat(87), auth: "C".repeat(22) };
  await post({ endpoint: "https://169.254.169.254/x", keys }).expect(400);
  await post({ endpoint: FCM, keys, expirationTime: null, device: "Chrome on Android" }).expect(
    201,
  );
  assert.equal(mentor.db.subs[0].user_id, ID(5));
  assert.equal(mentor.db.subs[0].device, "Chrome on Android");
  // Test notification goes to yourself only.
  await request(app)
    .post("/api/push/test")
    .set("Cookie", cookie)
    .set("Origin", ADMIN)
    .set("X-CSRF-Token", "c")
    .send({})
    .expect(200);
  assert.deepEqual(
    mentor.db.outbox.map((r) => r.user_id),
    [ID(5)],
  );
  // Students never reach the team admin API; the student portal refuses them too.
  const student = fakeStore({ id: ID(6), role: "student", email: "s@x.com" });
  await request(createApp(student, config)).get("/api/push").set("Cookie", cookie).expect(401);
  await request(
    createApp(student, {
      ...config,
      PORTAL: "student",
      STUDENT_ORIGIN: "https://student.scholarscafe.com",
    }),
  )
    .get("/api/push")
    .set("Cookie", cookie)
    .expect(403);
});

test("Triggers: chat (not the sender), pinned marked, task assignee, deadline reminder", async () => {
  const actor = { id: ID(1), role: "owner", email: "boss@x.com" };
  const store = fakeStore(actor, (q, a) => {
    if (q.startsWith("UPDATE staff_messages SET pinned_at")) return { affectedRows: 1 };
    if (q.startsWith("SELECT body FROM staff_messages")) return [{ body: "Office closed Friday" }];
    if (q.startsWith("SELECT id,email FROM users WHERE active=1"))
      return a.map((id) => ({ id, email: "p@x.com" }));
    if (q.startsWith("SELECT user_id FROM staff_task_assignees")) return [];
    if (q.startsWith("SELECT id,email FROM users WHERE id IN"))
      return a.map((id) => ({ id, email: "p@x.com" }));
  });
  const app = createApp(store, config);
  const post = (path, body) =>
    request(app)
      .post(path)
      .set("Cookie", cookie)
      .set("Origin", ADMIN)
      .set("X-CSRF-Token", "c")
      .send(body);
  await post("/api/workspace/chat", { body: "Hello team, meeting at 5" }).expect(201);
  let rows = store.db.outbox.map((r) => ({ user: r.user_id, ...JSON.parse(r.payload) }));
  assert.deepEqual(rows.map((r) => r.user).sort(), [ID(2), ID(3)]);
  assert.equal(rows[0].body, "boss: Hello team, meeting at 5");
  assert.equal(rows[0].open, "Team chat");
  store.db.outbox = [];
  await post("/api/workspace/chat/7/pin", { pinned: true }).expect(200);
  rows = store.db.outbox.map((r) => JSON.parse(r.payload));
  assert.equal(rows.length, 2);
  assert.match(rows[0].title, /📌 Pinned/);
  store.db.outbox = [];
  await post("/api/workspace/tasks", {
    title: "Call the embassy",
    assignees: [ID(1), ID(4)],
  }).expect(201);
  rows = store.db.outbox.map((r) => ({ user: r.user_id, ...JSON.parse(r.payload) }));
  assert.deepEqual(
    rows.map((r) => r.user),
    [ID(4)],
    "the assigner is not notified",
  );
  assert.equal(rows[0].open, "Tasks");
  // Deadline reminders reuse the existing timing and push to the assignee.
  store.db.outbox = [];
  const now = new Date("2026-11-20T00:00:00Z");
  const rem = fakeStore(null, (q) => {
    if (q.startsWith("SELECT a.task_id"))
      return [
        {
          task_id: "t1",
          user_id: ID(4),
          title: "Visa form",
          due_at: new Date(now.getTime() + 3600e3),
          email: "p@x.com",
        },
      ];
  });
  assert.equal(await queueTaskReminders(rem, config, now), 1);
  const r = JSON.parse(rem.db.outbox[0].payload);
  assert.equal(rem.db.outbox[0].user_id, ID(4));
  assert.equal(r.title, "Due in about 2 hours");
  assert.equal(r.body, "Visa form");
});
