// My College List: students save colleges from scholarscafe.com/colleges, pick a round, track status and
// get deadline reminders (14, 7 and 1 days before, Asia/Dhaka). Staff see their students' lists.
// - College facts come from college-data.json (exported from src/data/college-directory.ts) with the
//   admin's published "colleges" entries applied on top, read fresh each time, so an edited deadline is
//   used at once (lists and reminders).
// - Students reach only their own rows: every student query is keyed on the session's user id.
// - Staff views use studentScope (owners/admins: everyone; mentors: their students; editors: refused).
// - Reminders are logged in college_reminders (one row per student, college, round and offset) inside the
//   same transaction that queues them, so a restart or a second process never sends one twice.
import { readFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { queuePush, vapidKeys, saveSubscription, removeSubscription } from "./push.js";
import { studentScope } from "./access.js";
import { equal } from "./security.js";
import { can } from "./permissions.js";

export const ROUNDS = ["ed1", "ed2", "ea", "rd"];
export const ROUND_LABEL = {
  ed1: "Early Decision I",
  ed2: "Early Decision II",
  ea: "Early Action",
  rd: "Regular Decision",
};
export const STATUSES = ["researching", "applying", "submitted", "decision"];
export const LIST_CAP = 25;
export const OFFSETS = [14, 7, 1];
/** Reminders go out from 9:00 in Dhaka, never at night. */
export const SEND_FROM_HOUR = 9;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const slugOk = (s) => typeof s === "string" && s.length <= 100 && SLUG.test(s);
const DEFAULT_STUDENT_ORIGIN = "https://student.scholarscafe.com";

const BUILT_IN = JSON.parse(readFileSync(new URL("./college-data.json", import.meta.url), "utf8"));

// ---------- College facts: built-in list + the admin's published entries ----------
const str = (v) => (typeof v === "string" ? v.trim() : "");
// A figure counts only with its source (the same rule the website uses, see src/lib/colleges.ts).
const fig = (d, k) => (str(d[k]) && str(d[k + "Source"]) ? str(d[k]) : null);
const int = (raw) => (raw && /^\d+$/.test(raw) ? Number(raw) : null);
const deadline = (raw) =>
  raw && (/^\d{4}-\d{2}-\d{2}$/.test(raw) || raw === "not-offered") ? raw : null;
const AID = new Set(["need-blind", "need-aware", "merit-only", "limited", "none"]);

/** One admin "colleges" entry (flat fields, backend/security.js) as the facts this feature uses. */
export function fromCms(d) {
  const aid = fig(d, "intlAidPolicy");
  return {
    slug: str(d.slug),
    name: str(d.name),
    type: str(d.collegeType) === "NU" ? "NU" : "LAC",
    asOf: str(d.asOf),
    applicants: int(fig(d, "applicants")),
    admitted: int(fig(d, "admitted")),
    intlAidPolicy: AID.has(aid) ? aid : null,
    ed1: deadline(fig(d, "ed1")),
    ed2: deadline(fig(d, "ed2")),
    ea: deadline(fig(d, "ea")),
    rd: deadline(fig(d, "rd")),
    deadlineNote: str(d.deadlineNote) || null,
    hidden: d.hidden === true,
  };
}
/** Same slug replaces, a new slug adds, hidden removes (as on the website). */
export function mergeColleges(base, cms) {
  const bySlug = new Map(base.map((c) => [c.slug, c]));
  for (const c of cms) {
    if (!c.slug || !c.name) continue;
    if (c.hidden) bySlug.delete(c.slug);
    else bySlug.set(c.slug, c);
  }
  return bySlug;
}
/** Map of slug -> college, read fresh (a deadline edited in the admin applies at once). */
export async function loadColleges(store, c) {
  const rows = await store.query(
    "SELECT published FROM content WHERE kind='colleges' AND published IS NOT NULL AND deleted_at IS NULL",
    [],
    c,
  );
  const cms = [];
  for (const r of rows || []) {
    const d = typeof r.published === "string" ? JSON.parse(r.published) : r.published;
    if (d && typeof d === "object") cms.push(fromCms(d));
  }
  return mergeColleges(BUILT_IN, cms);
}

// ---------- Dates (Bangladesh is UTC+6 all year, no daylight saving) ----------
const DHAKA_MS = 6 * 3600 * 1000;
export const dhakaDate = (now) => new Date(now.getTime() + DHAKA_MS).toISOString().slice(0, 10);
export const dhakaHour = (now) => new Date(now.getTime() + DHAKA_MS).getUTCHours();
const isDate = (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
/** Whole days from today in Dhaka to the deadline date (0 = today, negative = passed). */
export function daysLeft(date, now) {
  if (!isDate(date)) return null;
  return Math.round(
    (Date.parse(date + "T00:00:00Z") - Date.parse(dhakaDate(now) + "T00:00:00Z")) / 86400000,
  );
}
/**
 * Which reminder is due with this many days left: 1 (1 day), 7 (2 to 7 days) or 14 (8 to 14 days).
 * A college saved late gets the nearest one only, never a burst of all three.
 */
export function dueOffset(days) {
  if (days == null || days < 1) return null;
  return [...OFFSETS].reverse().find((o) => days <= o) ?? null;
}
export const admitRate = (c) =>
  c && c.admitted != null && c.applicants
    ? Math.round((c.admitted / c.applicants) * 1000) / 10
    : null;

/** The deadline that matters for sorting: the chosen round's, else the next one still open. */
function nextDeadline(college, round, now) {
  if (!college) return null;
  if (round) {
    const date = college[round];
    return isDate(date) ? { round, date, days: daysLeft(date, now), chosen: true } : null;
  }
  const open = ROUNDS.filter((r) => isDate(college[r]) && daysLeft(college[r], now) >= 0).sort(
    (a, b) => college[a].localeCompare(college[b]),
  );
  return open.length
    ? {
        round: open[0],
        date: college[open[0]],
        days: daysLeft(college[open[0]], now),
        chosen: false,
      }
    : null;
}
/** One saved row as the screens show it. */
export function listItem(row, colleges, now) {
  const c = colleges.get(row.slug) || null;
  return {
    slug: row.slug,
    name: c?.name || row.slug,
    missing: !c,
    type: c?.type || null,
    admit_rate: admitRate(c),
    intl_aid: c?.intlAidPolicy || null,
    deadlines: Object.fromEntries(
      ROUNDS.map((r) => [
        r,
        { date: c ? (c[r] ?? null) : null, days: c ? daysLeft(c[r], now) : null },
      ]),
    ),
    deadline_note: c?.deadlineNote || null,
    round: row.round || "",
    status: row.status,
    // Private notes are the student's own: staff rows never select them.
    ...(row.notes !== undefined ? { notes: row.notes ?? "" } : {}),
    next: nextDeadline(c, row.round || "", now),
    added_at: row.created_at,
    ...(row.user_id ? { user_id: row.user_id } : {}),
  };
}
/** Soonest upcoming deadline first; passed or unknown deadlines after, then by name. */
export function byNextDeadline(a, b) {
  const key = (i) => (i.next && i.next.days >= 0 ? i.next.days : 100000);
  return key(a) - key(b) || a.name.localeCompare(b.name);
}

// ---------- The public site's Save button (scholarscafe.com -> student.scholarscafe.com) ----------
/**
 * The token the website must send with a save. Derived from the session's CSRF token, so it is useless
 * for any /api call, and only scholarscafe.com can read it (CORS with credentials, one exact origin).
 */
export const siteToken = (csrf) =>
  createHash("sha256")
    .update("my-list-site:" + csrf)
    .digest("hex");

const update = z
  .object({
    round: z.enum(["", ...ROUNDS]).optional(),
    status: z.enum(STATUSES).optional(),
    notes: z.string().max(2000).optional(),
  })
  .strict();

/** Adds one college for a student: known slug, no duplicates, at most LIST_CAP. Throws with a status. */
export async function addToList(store, fail, userId, slug) {
  if (!slugOk(slug)) throw fail(400, "Choose a college from the list.");
  const colleges = await loadColleges(store);
  if (!colleges.has(slug)) throw fail(404, "That college is not in the directory.");
  await store.transaction(async (c) => {
    // Locks this student's rows so two quick taps can't both pass the cap.
    const rows = await store.query(
      "SELECT slug FROM college_list WHERE user_id=? FOR UPDATE",
      [userId],
      c,
    );
    if (rows.some((r) => r.slug === slug)) throw fail(409, "This college is already on your list.");
    if (rows.length >= LIST_CAP)
      throw fail(409, `Your list is full (${LIST_CAP} colleges). Remove one to add another.`);
    try {
      await store.query(
        "INSERT INTO college_list (user_id,slug,round,status,notes,updated_at) VALUES (?,?,'','researching','',UTC_TIMESTAMP())",
        [userId, slug],
        c,
      );
    } catch (e) {
      if (e?.code === "ER_DUP_ENTRY") throw fail(409, "This college is already on your list.");
      throw e;
    }
  });
  return colleges.get(slug);
}
const ownRows = (store, userId, c) =>
  store.query(
    "SELECT slug,round,status,notes,created_at FROM college_list WHERE user_id=? ORDER BY created_at",
    [userId],
    c,
  );

export function installMyListRoutes(app, { store, fail, config }) {
  const studentOnly = (req) => {
    if (req.actor.role !== "student") throw fail(403, "My College List is for students.");
  };
  const slugParam = (req) => {
    if (!slugOk(req.params.slug)) throw fail(404, "Not on your list.");
    return req.params.slug;
  };
  // ----- Student: their own list only (user id from the session, never from the request) -----
  app.get("/api/lms/my/list", async (req, res) => {
    studentOnly(req);
    const now = new Date();
    const colleges = await loadColleges(store);
    const items = (await ownRows(store, req.actor.id))
      .map((r) => listItem(r, colleges, now))
      .sort(byNextDeadline);
    const [subs] = await store.query(
      "SELECT COUNT(*) AS n FROM push_subscriptions WHERE user_id=?",
      [req.actor.id],
    );
    res.json({
      items,
      cap: LIST_CAP,
      today: dhakaDate(now),
      push_devices: Number(subs?.n || 0),
      colleges: [...colleges.values()]
        .map((c) => ({ slug: c.slug, name: c.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    });
  });
  app.post("/api/lms/my/list", async (req, res) => {
    studentOnly(req);
    const { slug } = z
      .object({ slug: z.string().max(100) })
      .strict()
      .parse(req.body);
    const college = await addToList(store, fail, req.actor.id, slug);
    res.status(201).json({ ok: true, slug, name: college.name });
  });
  app.post("/api/lms/my/list/:slug", async (req, res) => {
    studentOnly(req);
    const slug = slugParam(req);
    const d = update.parse(req.body);
    const fields = Object.keys(d);
    if (!fields.length) throw fail(400, "Nothing to save.");
    const r = await store.query(
      `UPDATE college_list SET ${fields.map((f) => f + "=?").join(",")},updated_at=UTC_TIMESTAMP() WHERE user_id=? AND slug=?`,
      [...fields.map((f) => d[f]), req.actor.id, slug],
    );
    if (!r.affectedRows) throw fail(404, "Not on your list.");
    res.json({ ok: true });
  });
  app.post("/api/lms/my/list/:slug/delete", async (req, res) => {
    studentOnly(req);
    const slug = slugParam(req);
    await store.query("DELETE FROM college_list WHERE user_id=? AND slug=?", [req.actor.id, slug]);
    res.json({ ok: true });
  });

  // ----- Student: this device for deadline reminders (same keys and delivery as staff push) -----
  app.get("/api/lms/my/push", async (req, res) => {
    studentOnly(req);
    const { publicKey } = await vapidKeys(store, config);
    res.json({ publicKey });
  });
  app.post("/api/lms/my/push/subscribe", async (req, res) => {
    studentOnly(req);
    await saveSubscription(store, req.actor.id, req.body, res);
  });
  app.post("/api/lms/my/push/unsubscribe", async (req, res) => {
    studentOnly(req);
    await removeSubscription(store, fail, req.actor.id, req.body, res);
  });

  // ----- Staff: lists of the students they may reach (mentors: their own students) -----
  const staffScope = (req) => {
    if (req.actor.role === "student" || !can(req.actor, "students.view"))
      throw fail(403, "Staff only.");
    return studentScope(req.actor, "l.user_id"); // everyone or, for mentors, their own students
  };
  const staffRows = async (req, extra = "", args = []) => {
    const s = staffScope(req);
    return store.query(
      `SELECT l.user_id,l.slug,l.round,l.status,l.created_at,u.email,p.full_name
         FROM college_list l JOIN users u ON u.id=l.user_id LEFT JOIN student_profiles p ON p.user_id=l.user_id
        WHERE u.role='student' AND ${s.sql}${extra} ORDER BY l.created_at LIMIT 5000`,
      [...s.params, ...args],
    );
  };
  app.get("/api/lms/college-lists", async (req, res) => {
    const student = typeof req.query.student === "string" ? req.query.student : "";
    if (student && !/^[0-9a-f-]{36}$/.test(student)) throw fail(400, "Invalid student.");
    const rows = await staffRows(req, student ? " AND l.user_id=?" : "", student ? [student] : []);
    const now = new Date();
    const colleges = await loadColleges(store);
    res.json({ items: rows.map((r) => listItem(r, colleges, now)).sort(byNextDeadline) });
  });
  // "Due in the next 14 days": the chosen round's deadline, or the next open one when no round is chosen.
  app.get("/api/lms/college-lists/due", async (req, res) => {
    const rows = await staffRows(req, " AND l.status IN ('researching','applying')");
    const now = new Date();
    const colleges = await loadColleges(store);
    const items = rows
      .map((r) => ({
        ...listItem(r, colleges, now),
        student_email: r.email,
        student_name: r.full_name || "",
      }))
      .filter((i) => i.next && i.next.days >= 0 && i.next.days <= 14)
      .sort(byNextDeadline);
    res.json({ items, today: dhakaDate(now), days: 14 });
  });
}

/**
 * The website's Save button, on the student portal only. Installed before the /api session check.
 * GET  /mylist/saved -> { signedIn, slugs, token } for the signed-in student (credentials, CORS).
 * POST /mylist/save  { slug, saved } with X-CSRF-Token: token. Origin must be exactly PUBLIC_ORIGIN.
 */
export function installSiteSaveRoutes(app, { store, fail, config, sessionOf, limiter }) {
  const origin = config.PUBLIC_ORIGIN;
  const cors = (req, res) => {
    res.vary("Origin");
    if (!origin || req.headers.origin !== origin) return false;
    res.set({
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-CSRF-Token",
      "Access-Control-Max-Age": "600",
    });
    return true;
  };
  if (limiter) app.use("/mylist", limiter);
  app.options(["/mylist/saved", "/mylist/save"], (req, res) => {
    if (!cors(req, res)) return res.sendStatus(403);
    res.sendStatus(204);
  });
  const student = async (req) => {
    const actor = await sessionOf(req);
    return actor && actor.role === "student" ? actor : null;
  };
  app.get("/mylist/saved", async (req, res) => {
    if (!cors(req, res)) throw fail(403, "Website origin required.");
    const actor = await student(req);
    if (!actor) return res.json({ signedIn: false });
    const rows = await store.query("SELECT slug FROM college_list WHERE user_id=?", [actor.id]);
    res.json({
      signedIn: true,
      slugs: rows.map((r) => r.slug),
      cap: LIST_CAP,
      token: siteToken(actor.csrf),
    });
  });
  app.post("/mylist/save", async (req, res) => {
    if (!cors(req, res)) throw fail(403, "Website origin required.");
    if (!req.is("application/json")) throw fail(415, "JSON required.");
    const actor = await student(req);
    if (!actor) throw fail(401, "Please sign in.");
    if (!equal(req.headers["x-csrf-token"], siteToken(actor.csrf)))
      throw fail(403, "Request verification failed. Reload and try again.");
    const { slug, saved } = z
      .object({ slug: z.string().max(100), saved: z.boolean() })
      .strict()
      .parse(req.body);
    if (saved) await addToList(store, fail, actor.id, slug);
    else {
      if (!slugOk(slug)) throw fail(400, "Choose a college from the list.");
      await store.query("DELETE FROM college_list WHERE user_id=? AND slug=?", [actor.id, slug]);
    }
    res.json({ ok: true, slug, saved });
  });
}

// ---------- Reminders (run by the admin deployment, see server.js) ----------
const longDate = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
const leftText = (days) => (days === 1 ? "1 day" : `${days} days`);
export function reminderMail(config, r) {
  const link = (config.STUDENT_ORIGIN || DEFAULT_STUDENT_ORIGIN) + "/my-list";
  return {
    subject: `${leftText(r.days)} left: ${r.name} ${ROUND_LABEL[r.round]}`,
    body: [
      `Your ${ROUND_LABEL[r.round]} deadline for ${r.name} is ${longDate(r.date)}. That is ${leftText(r.days)} from today (Dhaka time).`,
      "",
      "Check the college's own admissions page for the exact time of day and any changes.",
      "",
      "Open your list: " + link,
      "",
      "You get this because you saved this college and chose this round on My College List. Change the round or the status there to stop these reminders.",
    ].join("\n"),
  };
}

/** The structured email layout (shared template): label, heading, details and a button to the list. */
export function collegeReminderLayout(config, r) {
  return {
    label: "Deadline reminder",
    heading: `${leftText(r.days)} left: ${r.name}`,
    text: `Your ${ROUND_LABEL[r.round]} deadline for ${r.name} is ${leftText(r.days)} from today (Dhaka time). Check the college's own admissions page for the exact time of day and any changes.`,
    details: [
      ["College", r.name],
      ["Deadline", longDate(r.date)],
      ["Type", ROUND_LABEL[r.round]],
    ],
    button: {
      label: "Open My List",
      url: (config.STUDENT_ORIGIN || DEFAULT_STUDENT_ORIGIN) + "/my-list",
    },
    note: "You get this because you saved this college and chose this round on My College List. Change the round or the status there to stop these reminders.",
  };
}

/**
 * Queues the reminders that are due now: push to the student's devices, or email when they have none.
 * Only rows with a chosen round and status Researching or Applying get reminders.
 */
export async function queueCollegeReminders(store, config, now = new Date()) {
  if (dhakaHour(now) < SEND_FROM_HOUR) return 0;
  const colleges = await loadColleges(store);
  const rows = await store.query(
    `SELECT l.user_id,l.slug,l.round,u.email FROM college_list l JOIN users u ON u.id=l.user_id
      WHERE l.round<>'' AND l.status IN ('researching','applying') AND u.active=1 AND u.role='student'`,
  );
  let queued = 0;
  for (const row of rows) {
    const college = colleges.get(row.slug);
    const date = college?.[row.round];
    const days = daysLeft(date, now);
    const offset = dueOffset(days);
    if (!offset) continue;
    await store.transaction(async (c) => {
      const [subs] = await store.query(
        "SELECT COUNT(*) AS n FROM push_subscriptions WHERE user_id=?",
        [row.user_id],
        c,
      );
      const channel = Number(subs?.n || 0) > 0 ? "push" : "email";
      const logged = await store.query(
        "INSERT IGNORE INTO college_reminders (user_id,slug,round,offset_days,deadline,channel) VALUES (?,?,?,?,?,?)",
        [row.user_id, row.slug, row.round, offset, date, channel],
        c,
      );
      if (logged.affectedRows !== 1) return; // already sent for this offset
      const r = { name: college.name, round: row.round, date, days };
      if (channel === "push")
        await queuePush(store, c, [row.user_id], {
          title: `${leftText(days)} left: ${college.name}`,
          body: `${ROUND_LABEL[row.round]} deadline ${longDate(date)}`,
          open: "My list",
          tag: `deadline-${row.slug}-${row.round}`,
        });
      else {
        const mail = reminderMail(config, r);
        await store.query(
          "INSERT INTO mail_outbox (id,subject,body,to_email,layout) VALUES (?,?,?,?,?)",
          [
            randomUUID(),
            mail.subject.slice(0, 160),
            mail.body,
            row.email,
            JSON.stringify(collegeReminderLayout(config, r)),
          ],
          c,
        );
      }
      queued++;
    });
  }
  return queued;
}
