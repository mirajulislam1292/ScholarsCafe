import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import {
  LIST_CAP,
  daysLeft,
  dhakaDate,
  dueOffset,
  queueCollegeReminders,
  siteToken,
  loadColleges,
} from "./my-list.js";
import { siteOrigins, safeReturn, safeSlug } from "./public/return-url.js";
import BUILT_IN from "./college-data.json" with { type: "json" };

const ADMIN = "https://admin.scholarscafe.com";
const STUDENT_ORIGIN = "https://student.scholarscafe.com";
const SITE = "https://scholarscafe.com";
const adminConfig = { ADMIN_ORIGIN: ADMIN, PUBLIC_ORIGIN: SITE, GOOGLE_CLIENT_ID: "t" };
const studentConfig = {
  ...adminConfig,
  ADMIN_ORIGIN: STUDENT_ORIGIN,
  PORTAL: "student",
  STUDENT_ORIGIN,
};
const cookie = "__Host-sc_session=" + "a".repeat(64);
const ID = (n) => `0000000${n}-0000-4000-8000-000000000000`;
const SLUGS = BUILT_IN.map((c) => c.slug);
const SRC = "https://www.example.edu/deadlines";

/** In-memory fake of the tables this feature touches. `actor` is the signed-in user (or null). */
function fakeStore(actor, db = {}) {
  db.list ??= [];
  db.reminders ??= [];
  db.subs ??= [];
  db.outbox ??= [];
  db.push ??= [];
  db.content ??= [];
  db.enrollments ??= [];
  db.users ??= {};
  db.sql = [];
  const userOf = (id) => db.users[id] || { email: id + "@x.com", role: "student", active: 1 };
  return {
    db,
    session: async () => actor && { ...actor, csrf: "c" },
    transaction: (fn) => fn({}),
    audit: async () => {},
    checkRateLimit: async () => true,
    query: async (q, a = []) => {
      db.sql.push([q, a]);
      if (q.startsWith("SELECT published FROM content WHERE kind='colleges'"))
        return db.content.map((d) => ({ published: d }));
      if (q.startsWith("SELECT slug FROM college_list WHERE user_id=?"))
        return db.list.filter((r) => r.user_id === a[0]).map((r) => ({ slug: r.slug }));
      if (q.startsWith("INSERT INTO college_list")) {
        if (db.list.some((r) => r.user_id === a[0] && r.slug === a[1]))
          throw Object.assign(new Error("dup"), { code: "ER_DUP_ENTRY" });
        db.list.push({
          user_id: a[0],
          slug: a[1],
          round: "",
          status: "researching",
          notes: "",
          created_at: new Date(),
        });
        return { affectedRows: 1 };
      }
      if (q.startsWith("SELECT slug,round,status,notes,created_at FROM college_list"))
        return db.list.filter((r) => r.user_id === a[0]).map((r) => ({ ...r, user_id: undefined }));
      if (q.startsWith("UPDATE college_list SET")) {
        const fields = /SET (.*),updated_at/
          .exec(q)[1]
          .split(",")
          .map((f) => f.split("=")[0]);
        const [user, slug] = a.slice(-2);
        const row = db.list.find((r) => r.user_id === user && r.slug === slug);
        if (!row) return { affectedRows: 0 };
        fields.forEach((f, i) => (row[f] = a[i]));
        return { affectedRows: 1 };
      }
      if (q.startsWith("DELETE FROM college_list WHERE user_id=? AND slug=?")) {
        const before = db.list.length;
        db.list = db.list.filter((r) => !(r.user_id === a[0] && r.slug === a[1]));
        return { affectedRows: before - db.list.length };
      }
      if (q.startsWith("SELECT COUNT(*) AS n FROM push_subscriptions WHERE user_id=?"))
        return [{ n: db.subs.filter((s) => s.user_id === a[0]).length }];
      if (q.startsWith("SELECT l.user_id,l.slug,l.round,l.status,l.created_at")) {
        let rows = db.list.filter((r) => userOf(r.user_id).role === "student");
        let i = 0;
        if (q.includes("e2.mentor_id=?")) {
          const mentor = a[i++];
          const mine = db.enrollments.filter((e) => e.mentor_id === mentor).map((e) => e.user_id);
          rows = rows.filter((r) => mine.includes(r.user_id));
        }
        if (q.includes(" AND l.user_id=?")) {
          const only = a[i++];
          rows = rows.filter((r) => r.user_id === only);
        }
        if (q.includes("l.status IN ('researching','applying')"))
          rows = rows.filter((r) => ["researching", "applying"].includes(r.status));
        // Staff rows never carry the student's private notes.
        return rows.map(({ notes: _n, ...r }) => ({ ...r, email: userOf(r.user_id).email }));
      }
      if (q.startsWith("SELECT l.user_id,l.slug,l.round,u.email FROM college_list"))
        return db.list
          .filter((r) => r.round && ["researching", "applying"].includes(r.status))
          .filter((r) => userOf(r.user_id).active && userOf(r.user_id).role === "student")
          .map((r) => ({ ...r, email: userOf(r.user_id).email }));
      if (q.startsWith("INSERT IGNORE INTO college_reminders")) {
        const key = a.slice(0, 4).join("|");
        if (db.reminders.some((r) => r.key === key)) return { affectedRows: 0 };
        db.reminders.push({ key, deadline: a[4], channel: a[5] });
        return { affectedRows: 1 };
      }
      if (q.startsWith("INSERT INTO push_outbox")) {
        db.push.push({ user_id: a[0], payload: JSON.parse(a[1]) });
        return { affectedRows: 1 };
      }
      if (q.startsWith("INSERT INTO mail_outbox")) {
        db.outbox.push({ subject: a[1], body: a[2], to: a[3] });
        return { affectedRows: 1 };
      }
      return q.startsWith("SELECT") ? [] : { affectedRows: 1 };
    },
  };
}
const student = (n = 1) => ({ id: ID(n), role: "student", email: `s${n}@x.com` });
const post = (app, path, body, origin = STUDENT_ORIGIN) =>
  request(app)
    .post(path)
    .set("Cookie", cookie)
    .set("Origin", origin)
    .set("X-CSRF-Token", "c")
    .send(body);

// ---------- Auth: students see and change only their own list ----------
test("My list: a student reads only their own rows and cannot change another student's", async () => {
  const db = {
    list: [
      { user_id: ID(1), slug: SLUGS[0], round: "", status: "researching", notes: "mine" },
      { user_id: ID(2), slug: SLUGS[1], round: "rd", status: "applying", notes: "secret" },
    ],
  };
  const app = createApp(fakeStore(student(1), db), studentConfig);
  const r = await request(app).get("/api/lms/my/list").set("Cookie", cookie).expect(200);
  assert.deepEqual(
    r.body.items.map((i) => i.slug),
    [SLUGS[0]],
  );
  assert.ok(!JSON.stringify(r.body).includes("secret"));
  // Student 2's college: the update and delete are keyed on the session user, so nothing changes.
  await post(app, `/api/lms/my/list/${SLUGS[1]}`, { status: "submitted" }).expect(404);
  await post(app, `/api/lms/my/list/${SLUGS[1]}/delete`, {}).expect(200);
  assert.equal(db.list.find((x) => x.user_id === ID(2)).status, "applying");
  assert.equal(db.list.length, 2);
  // There is no way to name another student: unknown fields are rejected.
  await post(app, `/api/lms/my/list/${SLUGS[0]}`, { user_id: ID(2), status: "applying" }).expect(
    400,
  );
  // Signed out: 401. Writes need the portal origin and CSRF token.
  await request(createApp(fakeStore(null, db), studentConfig))
    .get("/api/lms/my/list")
    .expect(401);
  await post(app, "/api/lms/my/list", { slug: SLUGS[3] }, SITE).expect(403);
  // Students never reach the staff views.
  await request(app).get("/api/lms/college-lists").set("Cookie", cookie).expect(403);
  await request(app).get("/api/lms/college-lists/due").set("Cookie", cookie).expect(403);
});

test("My list: own update saves round, status and notes; bad values refused", async () => {
  const db = { list: [{ user_id: ID(1), slug: SLUGS[0], round: "", status: "researching" }] };
  const app = createApp(fakeStore(student(1), db), studentConfig);
  await post(app, `/api/lms/my/list/${SLUGS[0]}`, {
    round: "rd",
    status: "applying",
    notes: "Ask about the arts supplement",
  }).expect(200);
  assert.deepEqual(
    [db.list[0].round, db.list[0].status, db.list[0].notes],
    ["rd", "applying", "Ask about the arts supplement"],
  );
  await post(app, `/api/lms/my/list/${SLUGS[0]}`, { status: "accepted" }).expect(400);
  await post(app, `/api/lms/my/list/${SLUGS[0]}`, { round: "ed3" }).expect(400);
  await post(app, `/api/lms/my/list/${SLUGS[0]}`, { notes: "x".repeat(2001) }).expect(400);
  await post(app, "/api/lms/my/list/Bad%20Slug", { status: "applying" }).expect(404);
});

// ---------- Cap and duplicates ----------
test("My list: unknown colleges, duplicates and the 25-college cap", async () => {
  const db = {};
  const app = createApp(fakeStore(student(1), db), studentConfig);
  await post(app, "/api/lms/my/list", { slug: "no-such-college" }).expect(404);
  await post(app, "/api/lms/my/list", { slug: "../etc" }).expect(400);
  await post(app, "/api/lms/my/list", { slug: SLUGS[0] }).expect(201);
  const dup = await post(app, "/api/lms/my/list", { slug: SLUGS[0] }).expect(409);
  assert.match(dup.body.error, /already on your list/);
  for (const slug of SLUGS.slice(1, LIST_CAP)) await post(app, "/api/lms/my/list", { slug });
  assert.equal(db.list.length, LIST_CAP);
  const full = await post(app, "/api/lms/my/list", { slug: SLUGS[LIST_CAP] }).expect(409);
  assert.match(full.body.error, /full/);
  assert.equal(db.list.length, LIST_CAP);
  // Another student's 25 don't count against this one.
  const other = createApp(fakeStore(student(2), db), studentConfig);
  await post(other, "/api/lms/my/list", { slug: SLUGS[0] }).expect(201);
  // The cap is checked under a row lock.
  assert.ok(db.sql.some(([q]) => q.includes("FOR UPDATE")));
});

test("My list: sorted by next deadline; facts come from the directory", async () => {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 86400000).toISOString().slice(0, 10);
  const later = new Date(now.getTime() + 40 * 86400000).toISOString().slice(0, 10);
  const db = {
    content: [
      { slug: SLUGS[0], name: "A College", collegeType: "LAC", rd: later, rdSource: SRC },
      { slug: SLUGS[1], name: "B College", collegeType: "NU", rd: soon, rdSource: SRC },
    ],
    list: [
      { user_id: ID(1), slug: SLUGS[0], round: "rd", status: "researching", notes: "" },
      { user_id: ID(1), slug: SLUGS[1], round: "rd", status: "researching", notes: "" },
    ],
  };
  const app = createApp(fakeStore(student(1), db), studentConfig);
  const r = await request(app).get("/api/lms/my/list").set("Cookie", cookie).expect(200);
  assert.deepEqual(
    r.body.items.map((i) => i.name),
    ["B College", "A College"],
  );
  assert.equal(r.body.cap, 25);
  // A figure without a source is not used (never shown as a fact).
  const facts = await loadColleges(
    fakeStore(null, { content: [{ slug: "x-college", name: "X", rd: "2027-01-01" }] }),
  );
  assert.equal(facts.get("x-college").rd, null);
  // Built-in facts carry the directory's own values.
  const w = BUILT_IN[0];
  const item = (
    await request(
      createApp(
        fakeStore(student(3), {
          list: [{ user_id: ID(3), slug: w.slug, round: "", status: "researching", notes: "" }],
        }),
        studentConfig,
      ),
    )
      .get("/api/lms/my/list")
      .set("Cookie", cookie)
  ).body.items[0];
  assert.equal(item.name, w.name);
  assert.equal(item.deadlines.rd.date, w.rd);
  assert.equal(item.admit_rate, Math.round((w.admitted / w.applicants) * 1000) / 10);
});

// ---------- Return URL allowlist ----------
test("Return URL: only https /colleges pages on our own website", () => {
  const allowed = siteOrigins(STUDENT_ORIGIN);
  assert.deepEqual(allowed, [SITE]);
  assert.deepEqual(siteOrigins("http://student.scholarscafe.com"), []);
  assert.deepEqual(siteOrigins("https://admin.scholarscafe.com"), []);
  assert.deepEqual(siteOrigins("http://localhost:3000"), []);
  const ok = (u) => safeReturn(u, allowed);
  assert.equal(ok(SITE + "/colleges"), SITE + "/colleges");
  assert.equal(ok(SITE + "/colleges/"), SITE + "/colleges/");
  assert.equal(ok(SITE + "/colleges/williams-college"), SITE + "/colleges/williams-college");
  // Query strings and fragments are dropped.
  assert.equal(ok(SITE + "/colleges/williams-college?x=1#y"), SITE + "/colleges/williams-college");
  for (const bad of [
    "https://evil.com/colleges",
    "https://scholarscafe.com.evil.com/colleges",
    "https://evilscholarscafe.com/colleges",
    "http://scholarscafe.com/colleges",
    "https://user:pw@scholarscafe.com/colleges",
    "https://scholarscafe.com:8443/colleges",
    "https://scholarscafe.com/contact",
    "https://scholarscafe.com/colleges/../admin",
    "https://scholarscafe.com/colleges/a/b",
    "//evil.com/colleges",
    "/colleges",
    "javascript:alert(1)",
    "data:text/html,hi",
    "https://admin.scholarscafe.com/colleges",
    "https://student.scholarscafe.com/colleges",
    "",
    null,
    undefined,
    "https://scholarscafe.com/colleges/" + "a".repeat(600),
  ])
    assert.equal(ok(bad), null, String(bad));
  assert.equal(safeSlug("williams-college"), "williams-college");
  for (const bad of ["Williams", "a/b", "-x", "x-", "a--b", "", null, "a".repeat(101)])
    assert.equal(safeSlug(bad), null, String(bad));
});

// ---------- Reminder timing and dedupe ----------
test("Reminder timing: days in Dhaka time, one window per offset", () => {
  // 18:30 UTC is already the next day in Dhaka (UTC+6).
  assert.equal(dhakaDate(new Date("2026-12-01T18:30:00Z")), "2026-12-02");
  assert.equal(daysLeft("2026-12-15", new Date("2026-12-01T17:59:00Z")), 14);
  assert.equal(daysLeft("2026-12-15", new Date("2026-12-01T18:00:00Z")), 13);
  assert.equal(daysLeft("not-offered", new Date()), null);
  assert.deepEqual([20, 15, 14, 8, 7, 2, 1, 0, -3, null].map(dueOffset), [
    null,
    null,
    14,
    14,
    7,
    7,
    1,
    null,
    null,
    null,
  ]);
});

const deadlineDb = (deadline, extra = {}) => ({
  content: [
    { slug: SLUGS[0], name: "Test College", collegeType: "LAC", rd: deadline, rdSource: SRC },
  ],
  list: [{ user_id: ID(1), slug: SLUGS[0], round: "rd", status: "applying", notes: "" }],
  ...extra,
});
// 10:00 in Dhaka on 2026-12-01.
const at10 = new Date("2026-12-01T04:00:00Z");

test("Reminders: 14, 7 and 1 days before, once each; email when no push device", async () => {
  const db = deadlineDb("2026-12-15");
  const store = fakeStore(null, db);
  const config = { STUDENT_ORIGIN };
  assert.equal(await queueCollegeReminders(store, config, at10), 1);
  assert.equal(db.outbox.length, 1);
  assert.equal(db.outbox[0].to, ID(1) + "@x.com");
  assert.match(db.outbox[0].subject, /^14 days left: Test College Regular Decision$/);
  assert.match(db.outbox[0].body, /15 December 2026/);
  assert.match(db.outbox[0].body, /Open your list: https:\/\/student\.scholarscafe\.com\/my-list/);
  // Running again (every 5 minutes, or after a restart) sends nothing more for this offset.
  assert.equal(await queueCollegeReminders(store, config, at10), 0);
  assert.equal(await queueCollegeReminders(store, config, new Date("2026-12-03T04:00:00Z")), 0);
  // 7 days before: one more. Then 1 day before: one more. Deadline day: nothing.
  assert.equal(await queueCollegeReminders(store, config, new Date("2026-12-08T04:00:00Z")), 1);
  assert.equal(await queueCollegeReminders(store, config, new Date("2026-12-14T04:00:00Z")), 1);
  assert.equal(await queueCollegeReminders(store, config, new Date("2026-12-14T09:00:00Z")), 0);
  assert.equal(await queueCollegeReminders(store, config, new Date("2026-12-15T04:00:00Z")), 0);
  assert.deepEqual(
    db.reminders.map((r) => r.key.split("|").slice(1)),
    [
      [SLUGS[0], "rd", "14"],
      [SLUGS[0], "rd", "7"],
      [SLUGS[0], "rd", "1"],
    ],
  );
  assert.equal(db.outbox.length, 3);
});

test("Reminders: not before 9:00 Dhaka; push instead of email when the student has a device", async () => {
  const db = deadlineDb("2026-12-08", { subs: [{ user_id: ID(1) }] });
  const store = fakeStore(null, db);
  // 08:59 in Dhaka: wait.
  assert.equal(await queueCollegeReminders(store, {}, new Date("2026-12-01T02:59:00Z")), 0);
  assert.equal(await queueCollegeReminders(store, {}, new Date("2026-12-01T03:00:00Z")), 1);
  assert.equal(db.outbox.length, 0);
  assert.equal(db.push.length, 1);
  assert.equal(db.push[0].payload.title, "7 days left: Test College");
  assert.equal(db.push[0].payload.open, "My list");
  assert.equal(db.reminders[0].channel, "push");
});

test("Reminders follow a deadline changed in the admin; only chosen rounds, open statuses", async () => {
  const db = deadlineDb("2026-12-15");
  const store = fakeStore(null, db);
  // The admin moves the deadline to 5 January: nothing is due on 1 December any more.
  db.content[0].rd = "2027-01-05";
  assert.equal(await queueCollegeReminders(store, {}, at10), 0);
  // 14 days before the new date, the reminder names the new date.
  assert.equal(await queueCollegeReminders(store, {}, new Date("2026-12-22T04:00:00Z")), 1);
  assert.match(db.outbox[0].body, /5 January 2027/);
  assert.equal(db.reminders[0].deadline, "2027-01-05");
  // Submitted, no round chosen, or an inactive account: no reminders.
  const quiet = (row, users = {}) =>
    queueCollegeReminders(
      fakeStore(null, deadlineDb("2026-12-15", { list: [row], users })),
      {},
      at10,
    );
  const base = { user_id: ID(1), slug: SLUGS[0], round: "rd", status: "applying", notes: "" };
  assert.equal(await quiet({ ...base, status: "submitted" }), 0);
  assert.equal(await quiet({ ...base, status: "decision" }), 0);
  assert.equal(await quiet({ ...base, round: "" }), 0);
  assert.equal(await quiet(base, { [ID(1)]: { email: "s@x.com", role: "student", active: 0 } }), 0);
  // A round the college does not offer never reminds.
  assert.equal(await quiet({ ...base, round: "ed2" }), 0);
});

// ---------- Admin views: staff only, existing roles ----------
test("Admin views: owners see all, mentors only their students, editors and students refused", async () => {
  const now = new Date();
  const soon = new Date(now.getTime() + 5 * 86400000).toISOString().slice(0, 10);
  const later = new Date(now.getTime() + 60 * 86400000).toISOString().slice(0, 10);
  const db = {
    content: [
      { slug: SLUGS[0], name: "Soon College", collegeType: "LAC", rd: soon, rdSource: SRC },
      { slug: SLUGS[1], name: "Later College", collegeType: "LAC", rd: later, rdSource: SRC },
    ],
    list: [
      { user_id: ID(1), slug: SLUGS[0], round: "rd", status: "applying", notes: "private 1" },
      { user_id: ID(2), slug: SLUGS[0], round: "rd", status: "researching", notes: "private 2" },
      { user_id: ID(2), slug: SLUGS[1], round: "rd", status: "applying", notes: "" },
      { user_id: ID(3), slug: SLUGS[0], round: "rd", status: "submitted", notes: "" },
    ],
    enrollments: [{ user_id: ID(1), mentor_id: ID(8) }],
  };
  const as = (actor) => createApp(fakeStore(actor, db), adminConfig);
  const owner = as({ id: ID(9), role: "owner", email: "o@x.com" });
  const all = await request(owner).get("/api/lms/college-lists").set("Cookie", cookie).expect(200);
  assert.equal(all.body.items.length, 4);
  assert.ok(!JSON.stringify(all.body).includes("private"), "notes stay private to the student");
  const one = await request(owner)
    .get("/api/lms/college-lists?student=" + ID(2))
    .set("Cookie", cookie)
    .expect(200);
  assert.deepEqual([...new Set(one.body.items.map((i) => i.user_id))], [ID(2)]);
  await request(owner).get("/api/lms/college-lists?student=x").set("Cookie", cookie).expect(400);
  // Due in 14 days: open statuses with a deadline within 14 days, soonest first.
  const due = await request(owner)
    .get("/api/lms/college-lists/due")
    .set("Cookie", cookie)
    .expect(200);
  assert.deepEqual(
    due.body.items.map((i) => [i.user_id, i.name]),
    [
      [ID(1), "Soon College"],
      [ID(2), "Soon College"],
    ],
  );
  assert.equal(due.body.items[0].student_email, ID(1) + "@x.com");
  // Mentor: only their own student.
  const mentor = as({ id: ID(8), role: "mentor", email: "m@x.com" });
  const mine = await request(mentor)
    .get("/api/lms/college-lists/due")
    .set("Cookie", cookie)
    .expect(200);
  assert.deepEqual(
    mine.body.items.map((i) => i.user_id),
    [ID(1)],
  );
  const mineAll = await request(mentor)
    .get("/api/lms/college-lists?student=" + ID(2))
    .set("Cookie", cookie)
    .expect(200);
  assert.equal(mineAll.body.items.length, 0);
  // Editors are refused; students can't use the team admin at all.
  const editor = as({ id: ID(7), role: "editor", email: "e@x.com" });
  await request(editor).get("/api/lms/college-lists").set("Cookie", cookie).expect(403);
  await request(editor).get("/api/lms/college-lists/due").set("Cookie", cookie).expect(403);
  await request(as(student(1)))
    .get("/api/lms/college-lists/due")
    .set("Cookie", cookie)
    .expect(401);
  // Staff cannot use the student's own list routes.
  await request(owner).get("/api/lms/my/list").set("Cookie", cookie).expect(403);
});

// ---------- The website's Save button (cross-site, student portal only) ----------
test("Website save: exact origin, credentials CORS, derived token; admin portal has none", async () => {
  const db = {};
  const app = createApp(fakeStore(student(1), db), studentConfig);
  const pre = await request(app)
    .options("/mylist/save")
    .set("Origin", SITE)
    .set("Access-Control-Request-Method", "POST")
    .expect(204);
  assert.equal(pre.headers["access-control-allow-origin"], SITE);
  assert.equal(pre.headers["access-control-allow-credentials"], "true");
  assert.match(pre.headers["access-control-allow-headers"], /X-CSRF-Token/);
  await request(app).options("/mylist/save").set("Origin", "https://evil.com").expect(403);
  await request(app).get("/mylist/saved").set("Origin", "https://evil.com").expect(403);
  await request(app).get("/mylist/saved").set("Cookie", cookie).expect(403); // no Origin
  const saved = await request(app)
    .get("/mylist/saved")
    .set("Origin", SITE)
    .set("Cookie", cookie)
    .expect(200);
  assert.equal(saved.body.signedIn, true);
  assert.deepEqual(saved.body.slugs, []);
  assert.equal(saved.body.token, siteToken("c"));
  assert.notEqual(saved.body.token, "c", "the session CSRF token itself is never sent");
  const save = (body, token = saved.body.token, origin = SITE) =>
    request(app)
      .post("/mylist/save")
      .set("Origin", origin)
      .set("Cookie", cookie)
      .set("X-CSRF-Token", token)
      .send(body);
  await save({ slug: SLUGS[0], saved: true }, "wrong").expect(403);
  await save({ slug: SLUGS[0], saved: true }, "c").expect(403);
  await save({ slug: SLUGS[0], saved: true }, saved.body.token, "https://evil.com").expect(403);
  await save({ slug: SLUGS[0], saved: true }).expect(200);
  assert.deepEqual(
    db.list.map((r) => [r.user_id, r.slug]),
    [[ID(1), SLUGS[0]]],
  );
  await save({ slug: SLUGS[0], saved: true }).expect(409);
  await save({ slug: SLUGS[0], saved: false }).expect(200);
  assert.equal(db.list.length, 0);
  await request(app)
    .post("/mylist/save")
    .set("Origin", SITE)
    .set("Cookie", cookie)
    .set("X-CSRF-Token", saved.body.token)
    .set("Content-Type", "text/plain")
    .send("{}")
    .expect(415);
  // Signed out: the site shows a sign-in link instead; saving is refused.
  const out = createApp(fakeStore(null, db), studentConfig);
  const anon = await request(out).get("/mylist/saved").set("Origin", SITE).expect(200);
  assert.deepEqual(anon.body, { signedIn: false });
  await request(out)
    .post("/mylist/save")
    .set("Origin", SITE)
    .set("X-CSRF-Token", "x")
    .send({ slug: SLUGS[0], saved: true })
    .expect(401);
  // The team admin has no such routes, and /my-list is the student portal's page.
  const admin = createApp(fakeStore(student(1), db), adminConfig);
  await request(admin).get("/mylist/saved").set("Origin", SITE).expect(404);
  await request(admin).get("/my-list").expect(404);
  const page = await request(app).get("/my-list").expect(200);
  assert.match(page.text, /<div id="workspace"/);
});

test("Student push routes: students only, own devices", async () => {
  const db = {};
  const store = fakeStore(student(1), db);
  const app = createApp(store, studentConfig);
  const keys = { p256dh: "B".repeat(87), auth: "C".repeat(22) };
  await post(app, "/api/lms/my/push/subscribe", {
    endpoint: "https://169.254.169.254/x",
    keys,
  }).expect(400);
  await post(app, "/api/lms/my/push/subscribe", {
    endpoint: "https://web.push.apple.com/abc",
    keys,
    device: "Safari on iPhone/iPad (app)",
  }).expect(201);
  const insert = db.sql.find(([q]) => q.startsWith("INSERT INTO push_subscriptions"));
  assert.equal(insert[1][1], ID(1));
  // Staff push on the student portal stays closed (unchanged).
  await request(app).get("/api/push").set("Cookie", cookie).expect(403);
  const owner = createApp(fakeStore({ id: ID(9), role: "owner", email: "o@x.com" }), adminConfig);
  await request(owner).get("/api/lms/my/push").set("Cookie", cookie).expect(403);
});
