// 1-on-1 mentor session booking (like Calendly). The team sets the open hours in the admin app; visitors pick
// a time on scholarscafe.com/book. At most one booking per day: the `day` column is UNIQUE, so two people
// booking the same day at the same moment can't both get it. Times are stored in UTC and shown in Bangladesh
// time (Asia/Dhaka, UTC+6, no daylight saving). All email goes through the mail outbox.
import { randomUUID } from "node:crypto";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { verifyTurnstile } from "./security.js";

const DHAKA_OFFSET = 6 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
/** A slot must start at least this long from now, so the reminder (60–90 min before) always goes out. */
export const MIN_NOTICE_MINUTES = 120;
/** Successful bookings from one network (IP) per day; the calendar takes only one booking a day. */
export const BOOKINGS_PER_IP_DAY = 2;
export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Saturday–Thursday, 8–11 pm Bangladesh time, 45-minute sessions, up to 30 days ahead.
export const BOOKING_DEFAULTS = Object.freeze({
  days: [6, 0, 1, 2, 3, 4],
  windows: [{ start: "20:00", end: "23:00" }],
  slot: 45,
  ahead: 30,
  blocked: [],
  link: "",
});

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$|^24:00$/, "Use a time like 20:00.");
const minutes = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const isoDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((d) => !Number.isNaN(Date.parse(d + "T00:00:00Z")), "Not a real date.");
export const settingsSchema = z
  .object({
    days: z.array(z.number().int().min(0).max(6)).max(7),
    windows: z
      .array(z.object({ start: hhmm, end: hhmm }).strict())
      .min(1, "Add at least one time window.")
      .max(6)
      .refine((ws) => ws.every((w) => minutes(w.end) > minutes(w.start)), {
        message: "Each window must end after it starts (same day).",
      }),
    slot: z.number().int().min(15).max(180),
    ahead: z.number().int().min(1).max(180),
    blocked: z.array(isoDay).max(366),
    link: z
      .string()
      .trim()
      .max(300)
      .refine((s) => s === "" || /^https:\/\/\S+$/.test(s), "Use an https:// meeting link."),
  })
  .strict();

/** Bangladesh calendar date (YYYY-MM-DD) of a moment. */
export const dhakaDay = (ms) => new Date(ms + DHAKA_OFFSET).toISOString().slice(0, 10);
const clock = (ms) => {
  const d = new Date(ms + DHAKA_OFFSET);
  const h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h < 12 ? "AM" : "PM"}`;
};
/** e.g. "Wednesday, 18 November 2026, 8:00 PM – 8:45 PM (Bangladesh time, GMT+6)" */
export function dhakaLabel(start, end) {
  const s = new Date(new Date(start).getTime() + DHAKA_OFFSET);
  const date = `${WEEKDAYS[s.getUTCDay()]}, ${s.getUTCDate()} ${MONTHS[s.getUTCMonth()]} ${s.getUTCFullYear()}`;
  return `${date}, ${clock(new Date(start).getTime())} – ${clock(new Date(end).getTime())} (Bangladesh time, GMT+6)`;
}

export async function loadSettings(store, c) {
  const [row] = await store.query("SELECT data FROM booking_settings WHERE id=1", [], c);
  const saved = row?.data && typeof row.data === "object" ? row.data : {};
  const merged = { ...BOOKING_DEFAULTS, ...saved };
  const ok = settingsSchema.safeParse(merged);
  return ok.success ? ok.data : { ...BOOKING_DEFAULTS };
}

/**
 * Open days and their slots. `taken` is the set of Bangladesh dates that already have a booking.
 * Only days that still have at least one slot are returned. No personal data.
 */
export function openSlots(settings, taken, now = Date.now()) {
  const blocked = new Set(settings.blocked);
  const earliest = now + MIN_NOTICE_MINUTES * MINUTE;
  const today = dhakaDay(now);
  const out = [];
  for (let i = 0; i <= settings.ahead; i++) {
    const day = new Date(Date.parse(today + "T00:00:00Z") + i * DAY).toISOString().slice(0, 10);
    const weekday = new Date(day + "T00:00:00Z").getUTCDay();
    if (!settings.days.includes(weekday) || blocked.has(day) || taken.has(day)) continue;
    const slots = [];
    const windows = [...settings.windows].sort((a, b) => minutes(a.start) - minutes(b.start));
    for (const w of windows)
      for (let t = minutes(w.start); t + settings.slot <= minutes(w.end); t += settings.slot) {
        const start = Date.parse(day + "T00:00:00Z") + t * MINUTE - DHAKA_OFFSET;
        if (start < earliest) continue;
        if (slots.some((s) => s.start === new Date(start).toISOString())) continue;
        slots.push({ start: new Date(start).toISOString(), time: clock(start) });
      }
    if (slots.length) out.push({ date: day, weekday: WEEKDAYS[weekday], slots });
  }
  return out;
}

async function takenDays(store, c) {
  const rows = await store.query(
    "SELECT day FROM bookings WHERE day IS NOT NULL AND starts_at>=UTC_TIMESTAMP() - INTERVAL 1 DAY",
    [],
    c,
  );
  return new Set(
    rows.map((r) =>
      r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day).slice(0, 10),
    ),
  );
}

const footer = [
  "",
  "Scholars Cafe",
  "https://scholarscafe.com",
  "",
  "You are getting this email because this address was used to book a session at scholarscafe.com.",
];
const hi = (name) => `Hi ${String(name).split(/\s+/)[0] || "there"},`;
const linkLine = (link) =>
  link ? `Join here: ${link}` : "We will email you the meeting link before the session.";
export function confirmationText(b, link) {
  return [
    hi(b.name),
    "",
    "Your 1-on-1 mentor session with Scholars Cafe is booked.",
    "",
    `When: ${dhakaLabel(b.starts_at, b.ends_at)}`,
    `Topic: ${b.topic}`,
    linkLine(link),
    "",
    "We will send you a reminder about an hour before. If you can't make it, reply to this email so we can free the time for someone else.",
    ...footer,
  ].join("\n");
}
export function reminderText(b, link) {
  return [
    hi(b.name),
    "",
    "A reminder: your 1-on-1 mentor session with Scholars Cafe starts soon.",
    "",
    `When: ${dhakaLabel(b.starts_at, b.ends_at)}`,
    `Topic: ${b.topic}`,
    linkLine(link),
    ...footer,
  ].join("\n");
}
export function cancelText(b) {
  return [
    hi(b.name),
    "",
    `Your 1-on-1 mentor session with Scholars Cafe on ${dhakaLabel(b.starts_at, b.ends_at)} has been cancelled.`,
    "",
    "Sorry for the change. You can pick another time at https://scholarscafe.com/book, or reply to this email.",
    ...footer,
  ].join("\n");
}
const teamText = (b) =>
  [
    "New 1-on-1 mentor session booking",
    "",
    `When: ${dhakaLabel(b.starts_at, b.ends_at)}`,
    `Name: ${b.name}`,
    `Email: ${b.email}`,
    `Phone: ${b.phone || "-"}`,
    "",
    "Topic:",
    b.topic,
    "",
    "Manage it in the admin app: Inbox → Bookings.",
  ].join("\n");

const outbox = (store, c, { subject, body, replyTo, to }) =>
  store.query(
    "INSERT INTO mail_outbox (id,subject,body,reply_to,to_email) VALUES (?,?,?,?,?)",
    // Subjects can carry a visitor's name: no line breaks or control characters in a mail header.
    [
      randomUUID(),
      subject.replace(/[\x00-\x1f\x7f]+/g, " ").slice(0, 160),
      body,
      replyTo || null,
      to || null,
    ],
    c,
  );

/**
 * Queue reminder emails for sessions starting in 60–90 minutes. Each booking gets one: `reminded_at` is set
 * in the same transaction, and only if it was still empty. Run every minute by the admin deployment.
 */
export async function queueBookingReminders(store) {
  return store.transaction(async (c) => {
    const due = await store.query(
      `SELECT id,name,email,topic,starts_at,ends_at FROM bookings
       WHERE status='booked' AND reminded_at IS NULL
         AND starts_at > UTC_TIMESTAMP() + INTERVAL 60 MINUTE
         AND starts_at <= UTC_TIMESTAMP() + INTERVAL 90 MINUTE
       ORDER BY starts_at LIMIT 20 FOR UPDATE SKIP LOCKED`,
      [],
      c,
    );
    if (!due.length) return 0;
    const { link } = await loadSettings(store, c);
    let queued = 0;
    for (const b of due) {
      const r = await store.query(
        "UPDATE bookings SET reminded_at=UTC_TIMESTAMP() WHERE id=? AND reminded_at IS NULL",
        [b.id],
        c,
      );
      if (!r.affectedRows) continue;
      await outbox(store, c, {
        subject: "Reminder: your Scholars Cafe session starts soon",
        body: reminderText(b, link),
        replyTo: "contact@scholarscafe.com",
        to: b.email,
      });
      queued++;
    }
    return queued;
  });
}

/** scholarscafe.com/book. Install before the /api session middleware (the student portal 404s /public). */
export function installPublicBookingRoutes(app, { store, fail, config, sharedLimit }) {
  const cors = (req, res) => {
    if (req.headers.origin === config.PUBLIC_ORIGIN) {
      res.set("Access-Control-Allow-Origin", config.PUBLIC_ORIGIN);
      res.vary("Origin");
    }
  };
  app.get("/public/booking/slots", async (req, res) => {
    cors(req, res);
    const settings = await loadSettings(store);
    res.json({
      timezone: "Asia/Dhaka",
      slot: settings.slot,
      days: openSlots(settings, await takenDays(store)),
    });
  });
  app.options("/public/booking", (req, res) => {
    if (req.headers.origin !== config.PUBLIC_ORIGIN) return res.sendStatus(403);
    cors(req, res);
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "600");
    res.sendStatus(204);
  });
  const bodySchema = z
    .object({
      start: z.string().datetime(),
      name: z.string().trim().min(1, "Enter your name.").max(160),
      email: z
        .string()
        .trim()
        .email("Enter a valid email.")
        .max(254)
        .transform((s) => s.toLowerCase()),
      phone: z
        .string()
        .trim()
        .max(30)
        .refine((s) => s === "" || /^[+0-9 ()-]{6,30}$/.test(s), "Enter a valid phone number.")
        .default(""),
      topic: z.string().trim().min(3, "Tell us what you'd like to talk about.").max(2000),
      turnstileToken: z.string().max(2048).optional(),
      website: z.string().max(200).optional(), // honeypot
    })
    .strict();
  app.post(
    "/public/booking",
    rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 10,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
    (req, res, next) => {
      if (req.headers.origin !== config.PUBLIC_ORIGIN)
        return res.status(403).json({ error: "Website origin required." });
      cors(req, res);
      if (!req.is("application/json")) return res.status(415).json({ error: "JSON required." });
      next();
    },
    sharedLimit("booking", 10, 3600),
    async (req, res) => {
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        const fields = {};
        for (const issue of parsed.error.issues) {
          const key = String(issue.path[0] ?? "");
          if (key && !fields[key]) fields[key] = issue.message;
        }
        return res.status(400).json({ error: "Please check the highlighted answers.", fields });
      }
      const body = parsed.data;
      if (body.website) return res.status(201).json({ ok: true });
      if (config.TURNSTILE_SECRET_KEY) {
        const verify = config.verifyTurnstile || verifyTurnstile;
        if (
          !body.turnstileToken ||
          !(await verify(config.TURNSTILE_SECRET_KEY, body.turnstileToken))
        )
          return res.status(400).json({ error: "Please complete the verification and try again." });
      }
      // At most 3 bookings a day from one email address.
      if (
        store.checkRateLimit &&
        !(await store.checkRateLimit("booking-email", body.email, 3, 86400))
      )
        return res
          .status(429)
          .json({ error: "Too many bookings from this email today. Please write to us instead." });
      const settings = await loadSettings(store);
      const start = Date.parse(body.start);
      const day = dhakaDay(start);
      const open = openSlots(settings, await takenDays(store)).find((d) => d.date === day);
      if (!open || !open.slots.some((s) => Date.parse(s.start) === start))
        return res.status(409).json({
          error: "Sorry, that time is no longer available. Please pick another day.",
        });
      // Only one booking fits a day, so one visitor must not be able to take every open day with made-up
      // emails. Counted only for bookings that reach this point (a valid, open slot).
      if (
        store.checkRateLimit &&
        !(await store.checkRateLimit("booking-ip-day", req.ip || "?", BOOKINGS_PER_IP_DAY, 86400))
      )
        return res
          .status(429)
          .json({
            error: "Too many bookings from this network today. Please write to us instead.",
          });
      const b = {
        id: randomUUID(),
        day,
        starts_at: new Date(start),
        ends_at: new Date(start + settings.slot * MINUTE),
        name: body.name,
        email: body.email,
        phone: body.phone,
        topic: body.topic,
      };
      try {
        await store.transaction(async (c) => {
          await store.query(
            "INSERT INTO bookings (id,day,starts_at,ends_at,name,email,phone,topic) VALUES (?,?,?,?,?,?,?,?)",
            [b.id, b.day, b.starts_at, b.ends_at, b.name, b.email, b.phone, b.topic],
            c,
          );
          await outbox(store, c, {
            subject: "Your Scholars Cafe session is booked",
            body: confirmationText(b, settings.link),
            replyTo: "contact@scholarscafe.com",
            to: b.email,
          });
          await outbox(store, c, {
            subject: `New booking: ${b.name}, ${dhakaLabel(b.starts_at, b.ends_at).replace(/ \(Bangladesh.*$/, "")}`,
            body: teamText(b),
            replyTo: b.email,
          });
        });
      } catch (e) {
        // The UNIQUE key on `day`: someone else booked this day a moment ago.
        if (e?.code === "ER_DUP_ENTRY" || e?.errno === 1062)
          return res.status(409).json({
            error: "Sorry, someone just booked that day. Please pick another day.",
          });
        throw e;
      }
      res.status(201).json({
        ok: true,
        when: dhakaLabel(b.starts_at, b.ends_at),
        start: b.starts_at.toISOString(),
      });
    },
  );
}

/** Admin: availability settings and the bookings list (owners and admins). */
export function installBookingAdminRoutes(app, { store, fail, canPublish }) {
  const staffOnly = (req) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Bookings are managed by owners and admins.");
  };
  app.get("/api/booking", async (req, res) => {
    staffOnly(req);
    const settings = await loadSettings(store);
    const rows = await store.query(
      `SELECT id,status,starts_at,ends_at,name,email,phone,topic,reminded_at,cancelled_at,created_at FROM bookings
       ORDER BY (status='booked' AND starts_at>=UTC_TIMESTAMP()) DESC,
         CASE WHEN status='booked' AND starts_at>=UTC_TIMESTAMP() THEN starts_at END ASC,
         starts_at DESC
       LIMIT 300`,
    );
    res.json({
      settings,
      defaults: BOOKING_DEFAULTS,
      items: rows.map((b) => ({
        ...b,
        when: dhakaLabel(b.starts_at, b.ends_at),
        upcoming: b.status === "booked" && new Date(b.starts_at).getTime() >= Date.now(),
      })),
    });
  });
  app.post("/api/booking/settings", async (req, res) => {
    staffOnly(req);
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) throw fail(400, parsed.error.issues[0]?.message || "Check the settings.");
    const s = parsed.data;
    s.days = [...new Set(s.days)].sort();
    s.blocked = [...new Set(s.blocked)].sort();
    await store.query(
      "INSERT INTO booking_settings (id,data) VALUES (1,?) ON DUPLICATE KEY UPDATE data=VALUES(data)",
      [JSON.stringify(s)],
    );
    await store.audit(req.actor.id, "booking_settings", "");
    res.json({ ok: true, settings: s });
  });
  app.post("/api/booking/:id/cancel", async (req, res) => {
    staffOnly(req);
    const id = z.string().uuid().parse(req.params.id);
    await store.transaction(async (c) => {
      const [b] = await store.query(
        "SELECT id,name,email,starts_at,ends_at,status FROM bookings WHERE id=? FOR UPDATE",
        [id],
        c,
      );
      if (!b) throw fail(404, "Booking not found.");
      if (b.status !== "booked") throw fail(409, "This booking is already cancelled.");
      // day=NULL frees the day for someone else (the UNIQUE key ignores NULLs).
      await store.query(
        "UPDATE bookings SET status='cancelled',day=NULL,cancelled_at=UTC_TIMESTAMP() WHERE id=?",
        [id],
        c,
      );
      if (new Date(b.starts_at).getTime() > Date.now())
        await outbox(store, c, {
          subject: "Your Scholars Cafe session was cancelled",
          body: cancelText(b),
          replyTo: "contact@scholarscafe.com",
          to: b.email,
        });
      await store.audit(req.actor.id, "booking_cancel", id, c);
    });
    res.json({ ok: true });
  });
}
