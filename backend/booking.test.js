import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import request from "supertest";
import { createApp } from "./app.js";
import {
  BOOKING_DEFAULTS,
  MIN_NOTICE_MINUTES,
  dhakaDay,
  dhakaLabel,
  openSlots,
  queueBookingReminders,
  settingsSchema,
} from "./booking.js";

const PUBLIC = "https://scholarscafe.com";
const config = {
  ADMIN_ORIGIN: "https://admin.scholarscafe.com",
  PUBLIC_ORIGIN: PUBLIC,
  GOOGLE_CLIENT_ID: "t",
};
const COOKIE = "__Host-sc_session=" + "a".repeat(64);
const MIN = 60 * 1000;

/**
 * In-memory stand-in for MySQL, enough for booking.js: the bookings table keeps the UNIQUE key on `day`
 * (NULLs allowed), and the outbox records every queued email.
 */
function fakeStore({ settings, role = "owner", now = () => Date.now() } = {}) {
  const bookings = [];
  const outbox = [];
  const audit = [];
  const store = {
    bookings,
    outbox,
    audit: async (...a) => audit.push(a),
    checkRateLimit: async () => true,
    session: async () => ({ id: "owner", role, email: "o@x.com", csrf: "c" }),
    transaction: (fn) => fn({}),
    query: async (q, a = []) => {
      if (q.startsWith("SELECT data FROM booking_settings"))
        return settings ? [{ data: settings }] : [];
      if (q.startsWith("INSERT INTO booking_settings")) {
        settings = JSON.parse(a[0]);
        return { affectedRows: 1 };
      }
      if (q.startsWith("SELECT day FROM bookings"))
        return store.race
          ? []
          : bookings.filter((b) => b.day).map((b) => ({ day: new Date(b.day + "T00:00:00Z") }));
      if (q.startsWith("INSERT INTO bookings")) {
        const [id, day, starts_at, ends_at, name, email, phone, topic] = a;
        if (bookings.some((b) => b.day === day))
          throw Object.assign(new Error("Duplicate entry"), { code: "ER_DUP_ENTRY", errno: 1062 });
        bookings.push({
          id,
          day,
          starts_at,
          ends_at,
          name,
          email,
          phone,
          topic,
          status: "booked",
          reminded_at: null,
        });
        return { affectedRows: 1 };
      }
      if (q.startsWith("INSERT INTO mail_outbox")) {
        const [id, subject, body, reply_to, to_email] = a;
        outbox.push({ id, subject, body, reply_to, to_email });
        return { affectedRows: 1 };
      }
      if (
        q.includes("FROM bookings") &&
        q.includes("reminded_at IS NULL") &&
        q.startsWith("SELECT")
      ) {
        const t = now();
        return bookings.filter((b) => {
          const s = new Date(b.starts_at).getTime();
          return b.status === "booked" && !b.reminded_at && s > t + 60 * MIN && s <= t + 90 * MIN;
        });
      }
      if (q.startsWith("UPDATE bookings SET reminded_at")) {
        const b = bookings.find((x) => x.id === a[0] && !x.reminded_at);
        if (b) b.reminded_at = new Date();
        return { affectedRows: b ? 1 : 0 };
      }
      if (q.startsWith("SELECT id,name,email,starts_at,ends_at,status FROM bookings"))
        return bookings.filter((b) => b.id === a[0]);
      if (q.startsWith("UPDATE bookings SET status='cancelled'")) {
        const b = bookings.find((x) => x.id === a[0]);
        Object.assign(b, { status: "cancelled", day: null, cancelled_at: new Date() });
        return { affectedRows: 1 };
      }
      if (q.startsWith("SELECT id,status,starts_at")) return bookings;
      return [];
    },
  };
  return store;
}

// A fixed moment: Tuesday 17 Nov 2026, 10:00 in Dhaka (04:00 UTC).
const NOW = Date.parse("2026-11-17T04:00:00Z");

test("Slots: Bangladesh time, open weekdays only, slot length, days ahead", () => {
  const days = openSlots(BOOKING_DEFAULTS, new Set(), NOW);
  assert.equal(days[0].date, "2026-11-17");
  assert.deepEqual(
    days[0].slots.map((s) => s.time),
    ["8:00 PM", "8:45 PM", "9:30 PM", "10:15 PM"],
    "20:00–23:00 in 45-minute slots; a slot must end by 23:00",
  );
  assert.equal(days[0].slots[0].start, "2026-11-17T14:00:00.000Z", "20:00 Dhaka is 14:00 UTC");
  assert.ok(!days.some((d) => d.weekday === "Friday"), "Friday is closed by default");
  assert.ok(
    days.every((d) => d.date <= "2026-12-17"),
    "30 days ahead",
  );
  assert.equal(
    dhakaDay(Date.parse("2026-11-17T18:30:00Z")),
    "2026-11-18",
    "after 6 pm UTC it's the next day in Dhaka",
  );
});

test("Slots exclude booked, blocked and past days, and times too soon", () => {
  const settings = { ...BOOKING_DEFAULTS, blocked: ["2026-11-19"] };
  const days = openSlots(settings, new Set(["2026-11-18"]), NOW).map((d) => d.date);
  assert.ok(!days.includes("2026-11-18"), "booked day");
  assert.ok(!days.includes("2026-11-19"), "blocked day");
  assert.ok(!days.includes("2026-11-16"), "past day");
  // At 19:00 Dhaka the 20:00 slot is within the minimum notice; later ones remain.
  const evening = Date.parse("2026-11-17T13:00:00Z");
  const today = openSlots(BOOKING_DEFAULTS, new Set(), evening)[0];
  assert.equal(today.date, "2026-11-17");
  assert.ok(today.slots.every((s) => Date.parse(s.start) >= evening + MIN_NOTICE_MINUTES * MIN));
  assert.equal(today.slots[0].time, "9:30 PM");
  // Late at night, today is gone entirely.
  assert.notEqual(
    openSlots(BOOKING_DEFAULTS, new Set(), Date.parse("2026-11-17T17:00:00Z"))[0].date,
    "2026-11-17",
  );
});

test("Settings validation", () => {
  assert.ok(settingsSchema.safeParse(BOOKING_DEFAULTS).success);
  const bad = (patch) => !settingsSchema.safeParse({ ...BOOKING_DEFAULTS, ...patch }).success;
  assert.ok(
    bad({ windows: [{ start: "23:00", end: "20:00" }] }),
    "window must end after it starts",
  );
  assert.ok(bad({ windows: [] }));
  assert.ok(bad({ slot: 5 }));
  assert.ok(bad({ ahead: 0 }));
  assert.ok(bad({ days: [7] }));
  assert.ok(bad({ blocked: ["2026-13-45"] }));
  assert.ok(bad({ link: "http://meet.google.com/abc" }), "https only");
  assert.ok(bad({ link: "javascript:alert(1)" }));
  assert.ok(!bad({ link: "https://meet.google.com/abc-defg-hij" }));
  assert.ok(bad({ extra: 1 }));
});

const book = (app, body) =>
  request(app)
    .post("/public/booking")
    .set("Origin", PUBLIC)
    .send({ name: "Rahim Uddin", email: "Rahim@Example.com", topic: "My college list", ...body });

test("Public booking: one booking per day, confirmation + team email, 409 for a taken day", async () => {
  const store = fakeStore({
    settings: { ...BOOKING_DEFAULTS, link: "https://meet.google.com/abc-defg-hij" },
  });
  const app = createApp(store, config);
  const slots = await request(app).get("/public/booking/slots").set("Origin", PUBLIC).expect(200);
  assert.equal(slots.headers["access-control-allow-origin"], PUBLIC);
  assert.equal(slots.body.timezone, "Asia/Dhaka");
  const [first, second] = slots.body.days;
  assert.ok(!JSON.stringify(slots.body).includes("@"), "no personal data");

  const ok = await book(app, { start: first.slots[1].start, phone: "+880 1711-000000" }).expect(
    201,
  );
  assert.match(ok.body.when, /Bangladesh time/);
  assert.equal(store.bookings.length, 1);
  assert.equal(store.bookings[0].day, first.date);
  assert.equal(store.bookings[0].email, "rahim@example.com");
  // Confirmation to the person (with the meeting link) and a notification to the team.
  const [mine, team] = store.outbox;
  assert.equal(mine.to_email, "rahim@example.com");
  assert.match(mine.body, /meet\.google\.com\/abc-defg-hij/);
  assert.match(mine.body, /My college list/);
  assert.match(mine.body, /GMT\+6/);
  assert.equal(team.to_email, null, "team notification goes to the inbox");
  assert.equal(team.reply_to, "rahim@example.com");

  // The booked day is no longer offered, and another slot that day is refused.
  const after = await request(app).get("/public/booking/slots").expect(200);
  assert.ok(!after.body.days.some((d) => d.date === first.date));
  const taken = await book(app, { start: first.slots[2].start, email: "other@x.com" }).expect(409);
  assert.match(taken.body.error, /pick another day/);
  // Another day still works.
  await book(app, { start: second.slots[0].start, email: "other@x.com" }).expect(201);
  assert.equal(store.bookings.length, 2);
});

test("Two people booking the same day at the same moment: the database key lets only one through", async () => {
  const store = fakeStore();
  const app = createApp(store, config);
  const { body } = await request(app).get("/public/booking/slots").expect(200);
  const day = body.days[0];
  // Both requests pass the availability check before either insert lands (the check sees no bookings).
  store.race = true;
  const results = await Promise.all([
    book(app, { start: day.slots[0].start, email: "a@x.com" }),
    book(app, { start: day.slots[1].start, email: "b@x.com" }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
  assert.equal(store.bookings.filter((b) => b.day === day.date).length, 1);
  assert.equal(store.outbox.length, 2, "only the winner gets emails");
});

test("Public booking validation, website origin, honeypot and slot checks", async () => {
  const store = fakeStore();
  const app = createApp(store, config);
  const { body } = await request(app).get("/public/booking/slots").expect(200);
  const start = body.days[0].slots[0].start;
  await request(app)
    .post("/public/booking")
    .send({ start, name: "A", email: "a@x.com", topic: "Hello" })
    .expect(403);
  const bad = await book(app, { start, name: "", email: "not-an-email", topic: "" }).expect(400);
  assert.ok(bad.body.fields.name && bad.body.fields.email && bad.body.fields.topic);
  await book(app, { start, phone: "call me <script>" }).expect(400);
  await book(app, { start, extra: "x" }).expect(400);
  // A time that isn't a slot (off the grid, Friday, or in the past).
  await book(app, { start: new Date(Date.parse(start) + 10 * MIN).toISOString() }).expect(409);
  await book(app, { start: "2020-01-01T14:00:00.000Z" }).expect(409);
  // Bots filling the hidden field get a fake success and nothing is saved.
  await book(app, { start, website: "spam" }).expect(201);
  assert.equal(store.bookings.length, 0);
});

test("Turnstile and per-email limit", async () => {
  const store = fakeStore();
  const app = createApp(store, {
    ...config,
    TURNSTILE_SECRET_KEY: "s",
    verifyTurnstile: async (_k, t) => t === "good",
  });
  const { body } = await request(app).get("/public/booking/slots").expect(200);
  const start = body.days[0].slots[0].start;
  await book(app, { start }).expect(400);
  await book(app, { start, turnstileToken: "bad" }).expect(400);
  store.checkRateLimit = async (scope) => scope !== "booking-email";
  await book(app, { start, turnstileToken: "good" }).expect(429);
  store.checkRateLimit = async () => true;
  await book(app, { start, turnstileToken: "good" }).expect(201);
});

test("Reminder is queued once, 60–90 minutes before the start", async () => {
  let now = Date.parse("2026-11-18T12:00:00Z");
  const store = fakeStore({
    now: () => now,
    settings: { ...BOOKING_DEFAULTS, link: "https://meet.google.com/x" },
  });
  store.bookings.push({
    id: "b1",
    day: "2026-11-18",
    starts_at: new Date("2026-11-18T14:00:00Z"),
    ends_at: new Date("2026-11-18T14:45:00Z"),
    name: "Rahim",
    email: "r@x.com",
    topic: "Essays",
    status: "booked",
    reminded_at: null,
  });
  assert.equal(await queueBookingReminders(store), 0, "two hours before: too early");
  now = Date.parse("2026-11-18T12:40:00Z"); // 80 minutes before
  assert.equal(await queueBookingReminders(store), 1);
  assert.equal(await queueBookingReminders(store), 0, "never twice");
  now += 5 * MIN;
  assert.equal(await queueBookingReminders(store), 0);
  assert.equal(store.outbox.length, 1);
  assert.equal(store.outbox[0].to_email, "r@x.com");
  assert.match(store.outbox[0].body, /8:00 PM – 8:45 PM \(Bangladesh time/);
  assert.match(store.outbox[0].body, /meet\.google\.com\/x/);
});

test("Admin: owners/admins only; save settings; cancel frees the day and emails the person", async () => {
  for (const role of ["editor", "mentor"]) {
    const app = createApp(fakeStore({ role }), config);
    await request(app).get("/api/booking").set("Cookie", COOKIE).expect(403);
  }
  const store = fakeStore();
  const app = createApp(store, config);
  const got = await request(app).get("/api/booking").set("Cookie", COOKIE).expect(200);
  assert.deepEqual(got.body.settings, BOOKING_DEFAULTS);
  await request(app)
    .post("/api/booking/settings")
    .set("Cookie", COOKIE)
    .set("X-CSRF-Token", "c")
    .set("Origin", config.ADMIN_ORIGIN)
    .send({ ...BOOKING_DEFAULTS, slot: 1 })
    .expect(400);
  const saved = await request(app)
    .post("/api/booking/settings")
    .set("Cookie", COOKIE)
    .set("X-CSRF-Token", "c")
    .set("Origin", config.ADMIN_ORIGIN)
    .send({ ...BOOKING_DEFAULTS, days: [5, 5, 1], link: "https://meet.google.com/abc" })
    .expect(200);
  assert.deepEqual(saved.body.settings.days, [1, 5]);

  const { body } = await request(app).get("/public/booking/slots").expect(200);
  const day = body.days[0];
  await book(app, { start: day.slots[0].start }).expect(201);
  const id = store.bookings[0].id;
  const list = await request(app).get("/api/booking").set("Cookie", COOKIE).expect(200);
  assert.equal(list.body.items[0].upcoming, true);
  store.outbox.length = 0;
  await request(app)
    .post(`/api/booking/${id}/cancel`)
    .set("Cookie", COOKIE)
    .set("X-CSRF-Token", "c")
    .set("Origin", config.ADMIN_ORIGIN)
    .send({})
    .expect(200);
  assert.equal(store.bookings[0].day, null);
  assert.equal(store.outbox.length, 1);
  assert.equal(store.outbox[0].to_email, "rahim@example.com");
  assert.match(store.outbox[0].subject, /cancelled/);
  await request(app)
    .post(`/api/booking/${id}/cancel`)
    .set("Cookie", COOKIE)
    .set("X-CSRF-Token", "c")
    .set("Origin", config.ADMIN_ORIGIN)
    .send({})
    .expect(409);
  const again = await request(app).get("/public/booking/slots").expect(200);
  assert.ok(
    again.body.days.some((d) => d.date === day.date),
    "the day is open again",
  );
});

test("Student portal does not expose booking", async () => {
  const app = createApp(fakeStore(), {
    ...config,
    PORTAL: "student",
    ADMIN_ORIGIN: "https://student.scholarscafe.com",
  });
  await request(app).get("/public/booking/slots").expect(404);
  await book(app, { start: new Date().toISOString() }).expect(404);
});

test("Schema has the one-per-day key, and dates read well", async () => {
  const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  assert.match(schema, /CREATE TABLE IF NOT EXISTS bookings[\s\S]*UNIQUE KEY one_per_day \(day\)/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS booking_settings/);
  assert.equal(
    dhakaLabel("2026-11-18T14:00:00Z", "2026-11-18T14:45:00Z"),
    "Wednesday, 18 November 2026, 8:00 PM – 8:45 PM (Bangladesh time, GMT+6)",
  );
});
