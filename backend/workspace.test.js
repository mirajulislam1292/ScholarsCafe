import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import {
  addDays,
  dhakaDay,
  fromDhaka,
  queueTaskReminders,
  streakOf,
  weekStart,
} from "./workspace.js";

const ADMIN = "https://admin.scholarscafe.com";
const config = {
  ADMIN_ORIGIN: ADMIN,
  PUBLIC_ORIGIN: "https://scholarscafe.com",
  GOOGLE_CLIENT_ID: "t",
};
const SUPER = "contact.scholarscafe@gmail.com";
const cookie = "__Host-sc_session=" + "a".repeat(64);
const ID = (n) => `0000000${n}-0000-4000-8000-000000000000`;
const people = {
  super: { id: ID(1), role: "owner", email: SUPER },
  owner2: { id: ID(2), role: "owner", email: "second.owner@gmail.com" },
  admin: { id: ID(3), role: "admin", email: "admin@x.com" },
  editor: { id: ID(4), role: "editor", email: "editor@x.com" },
  mentor: { id: ID(5), role: "mentor", email: "mentor@x.com" },
  student: { id: ID(6), role: "student", email: "student@x.com" },
};

/** A small in-memory stand-in for the workspace tables (answers the queries workspace.js sends). */
function fakeStore(actor) {
  const db = { messages: [], tasks: [], assignees: [], outbox: [], sql: [] };
  const users = Object.values(people).map((u) => ({ ...u, active: 1 }));
  const store = {
    db,
    session: async () => ({ ...actor, csrf: "c" }),
    transaction: (fn) => fn({}),
    audit: async () => {},
    checkRateLimit: async () => true,
    query: async (q, a = []) => {
      db.sql.push([q, a]);
      if (q.startsWith("SELECT a.action")) return [{ action: "x", target: "y", email: SUPER }];
      if (q.startsWith("INSERT INTO staff_messages")) {
        db.messages.push({
          id: db.messages.length + 1,
          sender_id: a[0],
          body: a[1],
          pinned_at: null,
        });
        return { affectedRows: 1 };
      }
      if (q.startsWith("UPDATE staff_messages SET pinned_at=?")) {
        const m = db.messages.find((m) => m.id === a[2] && !m.deleted_at);
        if (m) m.pinned_at = a[0];
        return { affectedRows: m ? 1 : 0 };
      }
      if (q.startsWith("SELECT sender_id FROM staff_messages"))
        return db.messages.filter((m) => m.id === a[0] && !m.deleted_at);
      if (q.startsWith("UPDATE staff_messages SET deleted_at")) {
        db.messages.find((m) => m.id === a[0]).deleted_at = new Date();
        return { affectedRows: 1 };
      }
      if (q.includes("FROM staff_messages m")) {
        const live = db.messages.filter((m) => !m.deleted_at);
        const rows = (q.includes("pinned_at IS NOT NULL") ? live.filter((m) => m.pinned_at) : live)
          .map((m) => ({ ...m, sender_email: users.find((u) => u.id === m.sender_id)?.email }))
          .reverse();
        return rows;
      }
      if (q.startsWith("SELECT id,email,role FROM users WHERE active=1"))
        return users.filter((u) => u.role !== "student");
      if (q.startsWith("SELECT id,email FROM users WHERE active=1"))
        return users.filter((u) => a.includes(u.id) && u.role !== "student");
      if (q.startsWith("SELECT id,email FROM users WHERE id IN"))
        return users.filter((u) => a.includes(u.id));
      if (q.startsWith("SELECT user_id FROM staff_task_assignees"))
        return db.assignees.filter((x) => x.task_id === a[0]);
      if (q.startsWith("INSERT INTO staff_task_assignees")) {
        db.assignees.push({ task_id: a[0], user_id: a[1] });
        return { affectedRows: 1 };
      }
      if (q.startsWith("DELETE FROM staff_task_assignees")) {
        db.assignees = db.assignees.filter((x) => !(x.task_id === a[0] && x.user_id === a[1]));
        return { affectedRows: 1 };
      }
      if (q.startsWith("INSERT INTO staff_tasks")) {
        const [id, title, details, status, due_at, created_by] = a;
        db.tasks.push({ id, title, details, status, due_at, created_by });
        return { affectedRows: 1 };
      }
      if (
        q.startsWith("SELECT * FROM staff_tasks") ||
        q.startsWith("SELECT id,created_by FROM staff_tasks")
      )
        return db.tasks.filter((t) => t.id === a[0] && !t.deleted_at);
      if (q.includes("FROM staff_tasks t LEFT JOIN users u"))
        return db.tasks
          .filter((t) => !t.deleted_at)
          .map((t) => ({ ...t, creator_email: users.find((u) => u.id === t.created_by)?.email }));
      if (q.startsWith("SELECT a.task_id,u.id,u.email FROM staff_task_assignees"))
        return db.assignees
          .filter((x) => a.includes(x.task_id))
          .map((x) => ({ task_id: x.task_id, ...users.find((u) => u.id === x.user_id) }));
      if (q.startsWith("UPDATE staff_tasks SET deleted_at")) {
        db.tasks.find((t) => t.id === a[0]).deleted_at = new Date();
        return { affectedRows: 1 };
      }
      if (q.startsWith("SELECT 1 AS ok FROM staff_task_assignees"))
        return db.assignees
          .filter((x) => x.task_id === a[0] && x.user_id === a[1])
          .map(() => ({ ok: 1 }));
      if (q.startsWith("UPDATE staff_tasks SET status=?")) {
        db.tasks.find((t) => t.id === a[2]).status = a[0];
        return { affectedRows: 1 };
      }
      if (q.startsWith("UPDATE staff_tasks SET title=?")) {
        Object.assign(
          db.tasks.find((t) => t.id === a[5]),
          { title: a[0], due_at: a[3] },
        );
        return { affectedRows: 1 };
      }
      if (q.startsWith("INSERT INTO mail_outbox")) {
        db.outbox.push({ subject: a[1], body: a[2], to_email: a[3] });
        return { affectedRows: 1 };
      }
      return [];
    },
  };
  return store;
}
function client(actor, extra = {}) {
  const store = fakeStore(actor);
  const app = createApp(store, { ...config, ...extra });
  const send = (method, path, body) => {
    let r = request(app)
      [method]("/api" + path)
      .set("Cookie", cookie);
    if (method === "post") r = r.set("Origin", ADMIN).set("X-CSRF-Token", "c").send(body);
    return r;
  };
  return {
    store,
    get: (p) => send("get", p),
    post: (p, body = {}) => send("post", p, body),
  };
}

test("Audit log: only the Super Admin (owner + SUPER_ADMIN_EMAIL), not other owners or admins", async () => {
  for (const who of [people.owner2, people.admin, people.editor, people.mentor]) {
    const t = client(who);
    await t.get("/audit").expect(403);
    assert.equal((await t.get("/me")).body.super_admin, undefined);
  }
  const t = client(people.super);
  assert.equal((await t.get("/audit").expect(200)).body.items.length, 1);
  assert.equal((await t.get("/me")).body.super_admin, true);
  // A different configured Super Admin email moves the access with it.
  await client(people.super, { SUPER_ADMIN_EMAIL: "someone@else.com" }).get("/audit").expect(403);
  await client(people.owner2, { SUPER_ADMIN_EMAIL: "Second.Owner@gmail.com" })
    .get("/audit")
    .expect(200);
});

test("Staff chat: every staff role can read and post; students never reach it", async () => {
  for (const who of [people.super, people.admin, people.editor, people.mentor]) {
    const t = client(who);
    await t.post("/workspace/chat", { body: "Hello <b>team</b>" }).expect(201);
    const r = await t.get("/workspace/chat").expect(200);
    assert.equal(r.body.items[0].body, "Hello <b>team</b>", "stored as plain text");
    assert.equal(r.body.items[0].mine, true);
  }
  // On the admin portal a student session is refused; the student portal never mounts the routes.
  await client(people.student).get("/workspace/chat").expect(401);
  const portal = createApp(fakeStore(people.student), {
    ...config,
    PORTAL: "student",
    STUDENT_ORIGIN: "https://student.scholarscafe.com",
  });
  await request(portal).get("/api/workspace/chat").set("Cookie", cookie).expect(403);
  const t = client(people.editor);
  await t.post("/workspace/chat", { body: "x".repeat(2001) }).expect(400);
  await t.post("/workspace/chat", { body: "   " }).expect(400);
});

test("Staff chat: pin shows in the pinned bar; delete own only, Super Admin can delete any", async () => {
  const t = client(people.editor);
  await t.post("/workspace/chat", { body: "Office closed Friday" }).expect(201);
  await t.post("/workspace/chat/1/pin", { pinned: true }).expect(200);
  let r = await t.get("/workspace/chat");
  assert.equal(r.body.pinned.length, 1);
  assert.equal(r.body.pinned[0].body, "Office closed Friday");
  await t.post("/workspace/chat/1/pin", { pinned: false }).expect(200);
  assert.equal((await t.get("/workspace/chat")).body.pinned.length, 0);
  await t.post("/workspace/chat/99/pin", { pinned: true }).expect(404);

  // Someone else's message: an admin (or another owner) can't delete it, the Super Admin can.
  const store = t.store;
  for (const who of [people.admin, people.owner2]) {
    const app = createApp({ ...store, session: async () => ({ ...who, csrf: "c" }) }, config);
    await request(app)
      .post("/api/workspace/chat/1/delete")
      .set("Cookie", cookie)
      .set("Origin", ADMIN)
      .set("X-CSRF-Token", "c")
      .send({})
      .expect(403);
  }
  const superApp = createApp(
    { ...store, session: async () => ({ ...people.super, csrf: "c" }) },
    config,
  );
  await request(superApp)
    .post("/api/workspace/chat/1/delete")
    .set("Cookie", cookie)
    .set("Origin", ADMIN)
    .set("X-CSRF-Token", "c")
    .send({})
    .expect(200);
  assert.equal((await t.get("/workspace/chat")).body.items.length, 0);
  // The sender may delete their own.
  await t.post("/workspace/chat", { body: "typo" }).expect(201);
  await t.post("/workspace/chat/2/delete").expect(200);
});

test("Tasks: owners/admins create and assign; assigning queues exactly one email per new assignee", async () => {
  await client(people.editor).post("/workspace/tasks", { title: "Nope" }).expect(403);
  await client(people.mentor).post("/workspace/tasks", { title: "Nope" }).expect(403);
  const t = client(people.admin);
  const created = await t
    .post("/workspace/tasks", {
      title: "Call new leads",
      details: "Use the script",
      assignees: [people.mentor.id],
      due: "2026-11-20T17:00",
    })
    .expect(201);
  const { outbox, tasks } = t.store.db;
  assert.equal(outbox.length, 1);
  assert.equal(outbox[0].to_email, "mentor@x.com");
  assert.match(outbox[0].subject, /Call new leads/);
  assert.match(outbox[0].body, /20 Nov.*5:00\s?pm.*Bangladesh time/i);
  // 17:00 in Dhaka is 11:00 UTC.
  assert.equal(tasks[0].due_at.toISOString(), "2026-11-20T11:00:00.000Z");
  // Saving again with the same person sends nothing more; adding someone emails only them.
  const id = created.body.id;
  await t.post("/workspace/tasks/" + id, { assignees: [people.mentor.id] }).expect(200);
  assert.equal(outbox.length, 1);
  await t
    .post("/workspace/tasks/" + id, { assignees: [people.mentor.id, people.editor.id] })
    .expect(200);
  assert.equal(outbox.length, 2);
  assert.equal(outbox[1].to_email, "editor@x.com");
  // Students can't be assigned.
  await t.post("/workspace/tasks/" + id, { assignees: [people.student.id] }).expect(400);
});

test("Tasks: an assignee can change the status of their own task only", async () => {
  const t = client(people.admin);
  const { body } = await t.post("/workspace/tasks", { title: "A", assignees: [people.mentor.id] });
  const store = t.store;
  const as = (who) => createApp({ ...store, session: async () => ({ ...who, csrf: "c" }) }, config);
  const post = (who, body2) =>
    request(as(who))
      .post("/api/workspace/tasks/" + body.id)
      .set("Cookie", cookie)
      .set("Origin", ADMIN)
      .set("X-CSRF-Token", "c")
      .send(body2);
  await post(people.mentor, { status: "doing" }).expect(200);
  assert.equal(store.db.tasks[0].status, "doing");
  await post(people.mentor, { title: "Renamed" }).expect(400);
  await post(people.editor, { status: "done" }).expect(403);
});

test("Reminders: 24h and 2h before the deadline, each queued once per assignee", async () => {
  const due = new Date("2026-11-20T11:00:00Z");
  const row = { task_id: "t1", user_id: "u1", reminded_24h_at: null, reminded_2h_at: null };
  const outbox = [];
  const store = {
    transaction: (fn) => fn({}),
    query: async (q, a) => {
      if (q.includes("FROM staff_task_assignees a JOIN staff_tasks"))
        return due > a[0] && due <= a[1] && (!row.reminded_24h_at || !row.reminded_2h_at)
          ? [{ ...row, title: "Report", details: "", due_at: due, email: "m@x.com" }]
          : [];
      if (q.startsWith("UPDATE staff_task_assignees SET reminded_2h_at")) {
        if (row.reminded_2h_at) return { affectedRows: 0 };
        row.reminded_2h_at = a[0];
        row.reminded_24h_at ||= a[1];
        return { affectedRows: 1 };
      }
      if (q.startsWith("UPDATE staff_task_assignees SET reminded_24h_at")) {
        if (row.reminded_24h_at) return { affectedRows: 0 };
        row.reminded_24h_at = a[0];
        return { affectedRows: 1 };
      }
      if (q.startsWith("INSERT INTO mail_outbox")) outbox.push({ subject: a[1], to: a[3] });
      return [];
    },
  };
  const at = (h) => new Date(due.getTime() - h * 3600 * 1000);
  assert.equal(await queueTaskReminders(store, config, at(30)), 0, "too early");
  assert.equal(await queueTaskReminders(store, config, at(23.9)), 1);
  assert.equal(await queueTaskReminders(store, config, at(23)), 0, "not twice");
  assert.equal(await queueTaskReminders(store, config, at(5)), 0);
  assert.equal(await queueTaskReminders(store, config, at(1.9)), 1);
  assert.equal(await queueTaskReminders(store, config, at(1)), 0, "not twice");
  assert.equal(await queueTaskReminders(store, config, at(-1)), 0, "nothing after the deadline");
  assert.deepEqual(
    outbox.map((m) => m.subject),
    ["Due tomorrow: Report", "Due in about 2 hours: Report"],
  );
  assert.equal(outbox[0].to, "m@x.com");
});

test("Streaks count consecutive Bangladesh days and survive until the day ends", () => {
  const today = "2026-11-17";
  assert.equal(streakOf([], today), 0);
  assert.equal(streakOf(["2026-11-17"], today), 1);
  assert.equal(streakOf(["2026-11-15", "2026-11-16", "2026-11-17"], today), 3);
  // Not in yet today: yesterday's streak still counts.
  assert.equal(streakOf(["2026-11-15", "2026-11-16"], today), 2);
  // A missed day breaks it.
  assert.equal(streakOf(["2026-11-14", "2026-11-15"], today), 0);
  assert.equal(streakOf(["2026-11-13", "2026-11-15", "2026-11-16", "2026-11-17"], today), 3);
  // Across a month end, and with Date values from MySQL.
  assert.equal(
    streakOf([new Date("2026-10-31T00:00:00Z"), new Date("2026-11-01T00:00:00Z")], "2026-11-01"),
    2,
  );
  // Bangladesh day boundary: 18:30 UTC is already the next day in Dhaka.
  assert.equal(dhakaDay(new Date("2026-11-16T18:30:00Z")), "2026-11-17");
  assert.equal(dhakaDay(new Date("2026-11-16T17:59:00Z")), "2026-11-16");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(weekStart("2026-11-17"), "2026-11-15", "work week starts on Sunday");
  assert.equal(fromDhaka("2026-11-18T00:30").toISOString(), "2026-11-17T18:30:00.000Z");
});

test("Activity ping counts at most one minute per ~minute and is staff only", async () => {
  const t = client(people.editor);
  await t.post("/workspace/ping", {}).expect(200);
  const [sql, args] = t.store.db.sql.find(([q]) => q.startsWith("INSERT INTO staff_activity"));
  assert.match(sql, /ON DUPLICATE KEY UPDATE minutes=minutes\+IF\(last_at<=\?,1,0\)/);
  assert.equal(args[0], people.editor.id);
  assert.equal(args[1], dhakaDay());
  await t.post("/workspace/ping", { minutes: 50 }).expect(400);
  // Team view: every staff member (not students), with each person's streak, days in and time.
  for (const who of ["admin", "editor", "mentor", "super"]) {
    const team = await client(people[who]).get("/workspace/team").expect(200);
    const first = team.body.items[0];
    for (const key of ["streak", "today_minutes", "week_minutes", "days"]) assert.ok(key in first);
  }
  await client(people.student).get("/workspace/team").expect(401);
  const mine = await client(people.mentor).get("/workspace/progress").expect(200);
  assert.equal(mine.body.me.streak, 0);
});

test("Tasks: every staff member sees all tasks; only the assigner, an assignee or an admin can change them", async () => {
  // One store shared by several people, so they all see the same tasks.
  const store = fakeStore(people.admin);
  let actor = people.admin;
  store.session = async () => ({ ...actor, csrf: "c" });
  const app = createApp(store, config);
  const as = (who) => {
    actor = people[who];
    return {
      get: (p) =>
        request(app)
          .get("/api" + p)
          .set("Cookie", cookie),
      post: (p, body = {}) =>
        request(app)
          .post("/api" + p)
          .set("Cookie", cookie)
          .set("Origin", ADMIN)
          .set("X-CSRF-Token", "c")
          .send(body),
    };
  };
  const created = await as("admin")
    .post("/workspace/tasks", {
      title: "Write the FAQ",
      assignees: [people.mentor.id],
      due: "2026-12-01T18:00",
    })
    .expect(201);
  const id = created.body.id;
  // An editor who has nothing to do with it still sees it, with who it's for, the deadline and the status.
  const seen = (await as("editor").get("/workspace/tasks").expect(200)).body.items;
  assert.equal(seen.length, 1);
  assert.equal(seen[0].title, "Write the FAQ");
  assert.deepEqual(seen[0].assignees, [{ id: people.mentor.id, name: "mentor" }]);
  assert.equal(seen[0].assigned_by, "admin");
  assert.ok(seen[0].due_at);
  assert.equal(seen[0].status, "todo");
  assert.equal(seen[0].can_edit, false);
  assert.equal(seen[0].can_status, false);
  // ...but can't change or delete it.
  await as("editor")
    .post("/workspace/tasks/" + id, { status: "done" })
    .expect(403);
  await as("editor").post(`/workspace/tasks/${id}/delete`).expect(403);
  // The assignee may move it along (status only).
  const forMentor = (await as("mentor").get("/workspace/tasks").expect(200)).body.items[0];
  assert.equal(forMentor.can_status, true);
  assert.equal(forMentor.can_edit, false);
  await as("mentor")
    .post("/workspace/tasks/" + id, { status: "doing" })
    .expect(200);
  await as("mentor")
    .post("/workspace/tasks/" + id, { title: "Renamed" })
    .expect(400);
  // Whoever assigned it may edit it fully, even without the admin role.
  store.db.tasks[0].created_by = people.editor.id;
  assert.equal((await as("editor").get("/workspace/tasks")).body.items[0].can_edit, true);
  await as("editor")
    .post("/workspace/tasks/" + id, { title: "Write the FAQ page" })
    .expect(200);
  assert.equal(store.db.tasks[0].title, "Write the FAQ page");
  await as("editor").post(`/workspace/tasks/${id}/delete`).expect(200);
  // Students never reach the team's tasks (the admin portal refuses their session outright).
  await as("student").get("/workspace/tasks").expect(401);
});
