// Team workspace inside the admin dashboard: one staff group chat, a shared to-do list with email
// reminders, and activity streaks. Staff only (owner, admin, editor, mentor); never on the student portal.
// Days and deadlines use Bangladesh time (Asia/Dhaka, UTC+6 all year, no daylight saving).
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { canPublish, isSuperAdmin } from "./security.js";
import { queuePush, staffIds } from "./push.js";

export const STAFF_ROLES = ["owner", "admin", "editor", "mentor"];
export const TASK_STATUSES = ["todo", "doing", "done"];
const DHAKA_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** "YYYY-MM-DD" of the Dhaka calendar day for a moment. */
export const dhakaDay = (at = new Date()) =>
  new Date(new Date(at).getTime() + DHAKA_MS).toISOString().slice(0, 10);
/** Adds whole days to a "YYYY-MM-DD" string. */
export const addDays = (day, n) =>
  new Date(Date.parse(day + "T00:00:00Z") + n * DAY_MS).toISOString().slice(0, 10);
/** A "YYYY-MM-DDTHH:mm" deadline typed in Dhaka time, as a UTC Date. */
export const fromDhaka = (local) => new Date(Date.parse(local + ":00Z") - DHAKA_MS);
/** The work week in Bangladesh starts on Sunday: the Sunday on or before a day. */
export const weekStart = (day) => addDays(day, -new Date(day + "T00:00:00Z").getUTCDay());
const dhakaText = (at) =>
  new Date(at).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }) + " (Bangladesh time)";
const asDay = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10));

/**
 * Duolingo-style streak: consecutive days with activity, ending today. A streak stays alive through
 * today even before today's first activity (it counts back from yesterday until the day is over).
 */
export function streakOf(days, today = dhakaDay()) {
  const set = new Set([...days].map(asDay));
  let day = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(day)) {
    n++;
    day = addDays(day, -1);
  }
  return n;
}

const nameOf = (email) => String(email || "").split("@")[0];
const isStaff = (actor) => STAFF_ROLES.includes(actor?.role);
const uuid = z.string().regex(/^[0-9a-f-]{36}$/);
const taskFields = {
  title: z.string().trim().min(1).max(200),
  details: z.string().trim().max(4000),
  assignees: z.array(uuid).max(20),
  // Typed in Bangladesh time from a date+time picker; empty = no deadline.
  due: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    .nullable()
    .or(z.literal("")),
  status: z.enum(TASK_STATUSES),
};
const taskInput = z
  .object({
    ...taskFields,
    details: taskFields.details.default(""),
    assignees: taskFields.assignees.default([]),
    due: taskFields.due.default(null),
    status: taskFields.status.default("todo"),
  })
  .strict();
// Edits change only the fields that are sent (no defaults, so nothing is reset by accident).
const taskEdit = z.object(taskFields).partial().strict();

/** Queues one email per person through the outbox (mail_outbox); the mail timer delivers it. */
async function queueMail(store, c, to, subject, body) {
  await store.query(
    "INSERT INTO mail_outbox (id,subject,body,to_email) VALUES (?,?,?,?)",
    [randomUUID(), subject.slice(0, 160), body, to],
    c,
  );
}
export const taskMail = (config, task, intro) =>
  [
    intro,
    "",
    "Task: " + task.title,
    task.details ? "Details: " + task.details : "",
    "Deadline: " + (task.due_at ? dhakaText(task.due_at) : "none"),
    "",
    "Open your tasks: " + (config.ADMIN_ORIGIN || "") + "/",
    "",
    "This is an automatic message from the Scholars Cafe team workspace.",
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");

/**
 * Reminder emails before a deadline: about 24 hours and about 2 hours before, each queued exactly once
 * per assignee (the reminded_* columns are set in the same transaction, and only if still empty).
 * Run by the admin deployment only (see server.js).
 */
export async function queueTaskReminders(store, config, now = new Date()) {
  let queued = 0;
  const rows = await store.query(
    `SELECT a.task_id,a.user_id,a.reminded_24h_at,a.reminded_2h_at,t.title,t.details,t.due_at,u.email
       FROM staff_task_assignees a JOIN staff_tasks t ON t.id=a.task_id JOIN users u ON u.id=a.user_id
      WHERE t.deleted_at IS NULL AND t.status<>'done' AND t.due_at IS NOT NULL AND u.active=1
        AND t.due_at>? AND t.due_at<=? AND (a.reminded_24h_at IS NULL OR a.reminded_2h_at IS NULL)`,
    [now, new Date(now.getTime() + DAY_MS)],
  );
  for (const r of rows) {
    const left = new Date(r.due_at).getTime() - now.getTime();
    // Within 2 hours: the 2-hour reminder (and the 24-hour one is no longer needed).
    const kind = left <= 2 * 60 * 60 * 1000 ? "2h" : "24h";
    if (kind === "24h" && r.reminded_24h_at) continue;
    if (kind === "2h" && r.reminded_2h_at) continue;
    await store.transaction(async (c) => {
      const result = await store.query(
        kind === "2h"
          ? "UPDATE staff_task_assignees SET reminded_2h_at=?,reminded_24h_at=COALESCE(reminded_24h_at,?) WHERE task_id=? AND user_id=? AND reminded_2h_at IS NULL"
          : "UPDATE staff_task_assignees SET reminded_24h_at=? WHERE task_id=? AND user_id=? AND reminded_24h_at IS NULL",
        kind === "2h" ? [now, now, r.task_id, r.user_id] : [now, r.task_id, r.user_id],
        c,
      );
      if (result.affectedRows !== 1) return;
      await queueMail(
        store,
        c,
        r.email,
        (kind === "2h" ? "Due in about 2 hours: " : "Due tomorrow: ") + r.title,
        taskMail(
          config,
          r,
          kind === "2h"
            ? "Reminder: this task is due in about 2 hours."
            : "Reminder: this task is due in about 24 hours.",
        ),
      );
      await queuePush(store, c, [r.user_id], {
        title: kind === "2h" ? "Due in about 2 hours" : "Due tomorrow",
        body: r.title,
        open: "Tasks",
        tag: "task-" + r.task_id,
      });
      queued++;
    });
  }
  return queued;
}

export function installWorkspaceRoutes(app, { store, fail, config }) {
  // Belt and braces: the student portal never mounts these routes (see app.js), and students are refused.
  if (config.PORTAL === "student") return;
  const q = (sql, args, c) => store.query(sql, args, c);
  const staffOnly = (req) => {
    if (!isStaff(req.actor)) throw fail(403, "The team workspace is for staff only.");
  };
  const limited = async (req, scope, limit, seconds) => {
    if (store.checkRateLimit && !(await store.checkRateLimit(scope, req.actor.id, limit, seconds)))
      throw fail(429, "You're sending too fast. Wait a moment and try again.");
  };
  app.use("/api/workspace", (req, _res, next) => {
    staffOnly(req);
    next();
  });

  // ---------- Staff group chat ----------
  const chatColumns =
    "m.id,m.body,m.created_at,m.pinned_at,m.sender_id,u.email AS sender_email,u.role AS sender_role";
  const shape = (req) => (m) => ({
    id: Number(m.id),
    body: m.body,
    created_at: m.created_at,
    pinned: Boolean(m.pinned_at),
    pinned_at: m.pinned_at,
    sender: nameOf(m.sender_email),
    sender_role: m.sender_role,
    mine: m.sender_id === req.actor.id,
    can_delete: m.sender_id === req.actor.id || isSuperAdmin(req.actor, config),
  });
  app.get("/api/workspace/chat", async (req, res) => {
    const [recent, pinned] = await Promise.all([
      q(
        `SELECT ${chatColumns} FROM staff_messages m LEFT JOIN users u ON u.id=m.sender_id WHERE m.deleted_at IS NULL ORDER BY m.id DESC LIMIT 150`,
      ),
      q(
        `SELECT ${chatColumns} FROM staff_messages m LEFT JOIN users u ON u.id=m.sender_id WHERE m.deleted_at IS NULL AND m.pinned_at IS NOT NULL ORDER BY m.pinned_at DESC LIMIT 20`,
      ),
    ]);
    // Newest at the bottom, like a messenger.
    res.json({ items: recent.reverse().map(shape(req)), pinned: pinned.map(shape(req)) });
  });
  app.post("/api/workspace/chat", async (req, res) => {
    const { body } = z
      .object({ body: z.string().trim().min(1).max(2000) })
      .strict()
      .parse(req.body);
    await limited(req, "staff_chat", 20, 60);
    await store.transaction(async (c) => {
      await q("INSERT INTO staff_messages (sender_id,body) VALUES (?,?)", [req.actor.id, body], c);
      // Everyone else in the team chat gets a short preview.
      await queuePush(store, c, await staffIds(store, c, req.actor.id), {
        title: "Team chat",
        body: `${nameOf(req.actor.email)}: ${body}`,
        open: "Team chat",
        tag: "chat",
      });
    });
    res.status(201).json({ ok: true });
  });
  const messageId = (req) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw fail(404, "Message not found.");
    return id;
  };
  app.post("/api/workspace/chat/:id/pin", async (req, res) => {
    const { pinned } = z.object({ pinned: z.boolean() }).strict().parse(req.body);
    const result = await q(
      "UPDATE staff_messages SET pinned_at=?,pinned_by=? WHERE id=? AND deleted_at IS NULL",
      [pinned ? new Date() : null, pinned ? req.actor.id : null, messageId(req)],
    );
    if (result.affectedRows !== 1) throw fail(404, "Message not found.");
    if (pinned) {
      // A pinned message is marked as such in the notification.
      const [m] = await q("SELECT body FROM staff_messages WHERE id=?", [messageId(req)]);
      await queuePush(store, undefined, await staffIds(store, undefined, req.actor.id), {
        title: "📌 Pinned in team chat",
        body: `${nameOf(req.actor.email)} pinned: ${m?.body || ""}`,
        open: "Team chat",
        tag: "chat-pin",
      });
    }
    res.json({ ok: true });
  });
  app.post("/api/workspace/chat/:id/delete", async (req, res) => {
    const id = messageId(req);
    await store.transaction(async (c) => {
      const [m] = await q(
        "SELECT sender_id FROM staff_messages WHERE id=? AND deleted_at IS NULL FOR UPDATE",
        [id],
        c,
      );
      if (!m) throw fail(404, "Message not found.");
      // Your own message, or any message for the Super Admin.
      if (m.sender_id !== req.actor.id && !isSuperAdmin(req.actor, config))
        throw fail(403, "You can only delete your own messages.");
      await q(
        "UPDATE staff_messages SET deleted_at=UTC_TIMESTAMP(),pinned_at=NULL WHERE id=?",
        [id],
        c,
      );
      if (m.sender_id !== req.actor.id)
        await store.audit(req.actor.id, "staff_chat_delete", String(id), c);
    });
    res.json({ ok: true });
  });

  // ---------- To-do list ----------
  app.get("/api/workspace/staff", async (_req, res) => {
    const rows = await q(
      "SELECT id,email,role FROM users WHERE active=1 AND role IN ('owner','admin','editor','mentor') ORDER BY email",
    );
    res.json({ items: rows.map((u) => ({ ...u, name: nameOf(u.email) })) });
  });
  const loadTasks = async (where, args) => {
    const tasks = await q(
      `SELECT t.id,t.title,t.details,t.status,t.due_at,t.created_at,t.completed_at,t.created_by
         FROM staff_tasks t WHERE t.deleted_at IS NULL AND ${where}
        ORDER BY t.status='done', t.due_at IS NULL, t.due_at, t.created_at DESC LIMIT 300`,
      args,
    );
    if (!tasks.length) return [];
    const people = await q(
      `SELECT a.task_id,u.id,u.email FROM staff_task_assignees a JOIN users u ON u.id=a.user_id
        WHERE a.task_id IN (${tasks.map(() => "?").join(",")}) ORDER BY u.email`,
      tasks.map((t) => t.id),
    );
    return tasks.map((t) => ({
      ...t,
      assignees: people
        .filter((p) => p.task_id === t.id)
        .map((p) => ({ id: p.id, name: nameOf(p.email) })),
    }));
  };
  app.get("/api/workspace/tasks", async (req, res) => {
    // Owners and admins see every task; everyone else sees the tasks assigned to them.
    const items = canPublish(req.actor.role)
      ? await loadTasks("1=1", [])
      : await loadTasks("t.id IN (SELECT task_id FROM staff_task_assignees WHERE user_id=?)", [
          req.actor.id,
        ]);
    res.json({ items, now: new Date(), week_start: weekStart(dhakaDay()) });
  });
  /** Sets the assignee list; returns the people newly assigned (they get an email). */
  const setAssignees = async (c, taskId, ids) => {
    const wanted = [...new Set(ids)];
    if (wanted.length) {
      const valid = await q(
        `SELECT id,email FROM users WHERE active=1 AND role IN ('owner','admin','editor','mentor') AND id IN (${wanted.map(() => "?").join(",")})`,
        wanted,
        c,
      );
      if (valid.length !== wanted.length) throw fail(400, "Choose active staff members only.");
    }
    const current = (
      await q("SELECT user_id FROM staff_task_assignees WHERE task_id=? FOR UPDATE", [taskId], c)
    ).map((r) => r.user_id);
    const removed = current.filter((id) => !wanted.includes(id));
    const added = wanted.filter((id) => !current.includes(id));
    for (const id of removed)
      await q("DELETE FROM staff_task_assignees WHERE task_id=? AND user_id=?", [taskId, id], c);
    for (const id of added)
      await q("INSERT INTO staff_task_assignees (task_id,user_id) VALUES (?,?)", [taskId, id], c);
    if (!added.length) return [];
    return q(
      `SELECT id,email FROM users WHERE id IN (${added.map(() => "?").join(",")})`,
      added,
      c,
    );
  };
  const notifyAssigned = async (c, people, task, actor) => {
    for (const p of people)
      if (p.id !== actor.id)
        await queueMail(
          store,
          c,
          p.email,
          "New task for you: " + task.title,
          taskMail(config, task, `${nameOf(actor.email)} assigned you a task.`),
        );
    await queuePush(
      store,
      c,
      people.filter((p) => p.id !== actor.id).map((p) => p.id),
      {
        title: "New task for you",
        body: `${nameOf(actor.email)}: ${task.title}`,
        open: "Tasks",
        tag: "task",
      },
    );
  };
  app.post("/api/workspace/tasks", async (req, res) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Only owners and admins can create tasks.");
    const input = taskInput.parse(req.body);
    const id = randomUUID();
    const task = { ...input, due_at: input.due ? fromDhaka(input.due) : null };
    await store.transaction(async (c) => {
      await q(
        "INSERT INTO staff_tasks (id,title,details,status,due_at,created_by,completed_at) VALUES (?,?,?,?,?,?,?)",
        [
          id,
          task.title,
          task.details,
          task.status,
          task.due_at,
          req.actor.id,
          task.status === "done" ? new Date() : null,
        ],
        c,
      );
      await notifyAssigned(c, await setAssignees(c, id, input.assignees), task, req.actor);
    });
    res.status(201).json({ ok: true, id });
  });
  app.post("/api/workspace/tasks/:id", async (req, res) => {
    const id = uuid.parse(req.params.id);
    const admin = canPublish(req.actor.role);
    await store.transaction(async (c) => {
      const [current] = await q(
        "SELECT * FROM staff_tasks WHERE id=? AND deleted_at IS NULL FOR UPDATE",
        [id],
        c,
      );
      if (!current) throw fail(404, "Task not found.");
      if (!admin) {
        // Anyone assigned may move their task between to do, doing and done.
        const { status } = z
          .object({ status: z.enum(TASK_STATUSES) })
          .strict()
          .parse(req.body);
        const [mine] = await q(
          "SELECT 1 AS ok FROM staff_task_assignees WHERE task_id=? AND user_id=?",
          [id, req.actor.id],
          c,
        );
        if (!mine) throw fail(403, "You can only update tasks assigned to you.");
        await q(
          "UPDATE staff_tasks SET status=?,completed_at=?,updated_at=UTC_TIMESTAMP() WHERE id=?",
          [status, status === "done" ? current.completed_at || new Date() : null, id],
          c,
        );
        return;
      }
      const input = taskEdit.parse(req.body);
      const next = {
        title: input.title ?? current.title,
        details: input.details ?? current.details,
        status: input.status ?? current.status,
        due_at: input.due === undefined ? current.due_at : input.due ? fromDhaka(input.due) : null,
      };
      await q(
        "UPDATE staff_tasks SET title=?,details=?,status=?,due_at=?,completed_at=?,updated_at=UTC_TIMESTAMP() WHERE id=?",
        [
          next.title,
          next.details,
          next.status,
          next.due_at,
          next.status === "done" ? current.completed_at || new Date() : null,
          id,
        ],
        c,
      );
      // A new deadline gets fresh reminders.
      const oldDue = current.due_at ? new Date(current.due_at).getTime() : null;
      const newDue = next.due_at ? new Date(next.due_at).getTime() : null;
      if (oldDue !== newDue)
        await q(
          "UPDATE staff_task_assignees SET reminded_24h_at=NULL,reminded_2h_at=NULL WHERE task_id=?",
          [id],
          c,
        );
      if (input.assignees)
        await notifyAssigned(c, await setAssignees(c, id, input.assignees), next, req.actor);
    });
    res.json({ ok: true });
  });
  app.post("/api/workspace/tasks/:id/delete", async (req, res) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Only owners and admins can delete tasks.");
    const result = await q(
      "UPDATE staff_tasks SET deleted_at=UTC_TIMESTAMP() WHERE id=? AND deleted_at IS NULL",
      [uuid.parse(req.params.id)],
    );
    if (result.affectedRows !== 1) throw fail(404, "Task not found.");
    res.json({ ok: true });
  });

  // ---------- Activity and streaks ----------
  // The open dashboard pings about once a minute while the tab is visible AND someone used it in the
  // last minute. Each counted ping adds one minute; pings closer than 50 seconds apart are ignored.
  app.post("/api/workspace/ping", async (req, res) => {
    z.object({}).strict().parse(req.body);
    const now = new Date();
    const cutoff = new Date(now.getTime() - 50 * 1000);
    // MySQL applies these left to right, so both read the previous last_at.
    await q(
      `INSERT INTO staff_activity (user_id,day,minutes,first_at,last_at) VALUES (?,?,1,?,?)
       ON DUPLICATE KEY UPDATE minutes=minutes+IF(last_at<=?,1,0), last_at=IF(last_at<=?,?,last_at)`,
      [req.actor.id, dhakaDay(now), now, now, cutoff, cutoff, now],
    );
    res.json({ ok: true });
  });
  const summarize = (user, activity, tasks, today) => {
    const mine = activity.filter((a) => a.user_id === user.id);
    const start = weekStart(today);
    const minutesOn = (pred) =>
      mine.filter((a) => pred(asDay(a.day))).reduce((s, a) => s + Number(a.minutes), 0);
    const assigned = tasks.filter((t) => t.user_id === user.id);
    const doneThisWeek = assigned.filter(
      (t) => t.status === "done" && t.completed_at && dhakaDay(t.completed_at) >= start,
    );
    return {
      id: user.id,
      name: nameOf(user.email),
      email: user.email,
      role: user.role,
      streak: streakOf(
        mine.map((a) => asDay(a.day)),
        today,
      ),
      today_minutes: minutesOn((d) => d === today),
      week_minutes: minutesOn((d) => d >= start),
      days: Object.fromEntries(mine.map((a) => [asDay(a.day), Number(a.minutes)])),
      tasks_assigned: assigned.length,
      tasks_done: assigned.filter((t) => t.status === "done").length,
      tasks_done_week: doneThisWeek.length,
      tasks_open: assigned.filter((t) => t.status !== "done").length,
      tasks_overdue: assigned.filter(
        (t) => t.status !== "done" && t.due_at && new Date(t.due_at) < new Date(),
      ).length,
    };
  };
  const statsFor = async (users, days) => {
    const today = dhakaDay();
    const from = addDays(today, -Math.max(days, 400));
    const ids = users.map((u) => u.id);
    if (!ids.length) return [];
    const marks = ids.map(() => "?").join(",");
    const [activity, tasks] = await Promise.all([
      q(
        `SELECT user_id,day,minutes FROM staff_activity WHERE day>=? AND user_id IN (${marks}) ORDER BY day`,
        [from, ...ids],
      ),
      q(
        `SELECT a.user_id,t.status,t.due_at,t.completed_at FROM staff_task_assignees a JOIN staff_tasks t ON t.id=a.task_id
          WHERE t.deleted_at IS NULL AND a.user_id IN (${marks})`,
        ids,
      ),
    ]);
    return users.map((u) => {
      const s = summarize(u, activity, tasks, today);
      // Only the recent days are sent for the calendar; the streak uses the longer history above.
      const recent = addDays(today, -(days - 1));
      s.days = Object.fromEntries(Object.entries(s.days).filter(([d]) => d >= recent));
      return s;
    });
  };
  app.get("/api/workspace/progress", async (req, res) => {
    const [me] = await statsFor([req.actor], 14);
    res.json({ me, today: dhakaDay(), week_start: weekStart(dhakaDay()) });
  });
  app.get("/api/workspace/team", async (req, res) => {
    if (!isSuperAdmin(req.actor, config))
      throw fail(403, "Team activity is only available to the Super Admin account.");
    const days = req.query.days === "28" ? 28 : 14;
    const users = await q(
      "SELECT id,email,role FROM users WHERE active=1 AND role IN ('owner','admin','editor','mentor') ORDER BY email",
    );
    res.json({ items: await statsFor(users, days), today: dhakaDay(), days });
  });
}
