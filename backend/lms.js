// Student dashboard API, staff side: courses, lessons, students, enrollments.
// Mounted under /api (session + CSRF already checked). Every read uses the scopes in access.js;
// every write checks the permission table and re-checks rows inside the transaction.
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  courseScope,
  lessonScope,
  studentScope,
  profileColumns,
  requireCan,
  can,
  canReachStudent,
  isStaff,
} from "./access.js";

const uuid = z.string().uuid();
const courseInput = z
  .object({
    title: z.string().trim().min(1).max(200),
    summary: z.string().max(5000).default(""),
    status: z.enum(["draft", "published"]).default("draft"),
  })
  .strict();
const lessonInput = z
  .object({
    course_id: uuid,
    title: z.string().trim().min(1).max(200),
    body: z.string().max(200000).default(""),
    video_media_id: uuid.nullable().default(null),
    video_id: uuid.nullable().default(null),
    published: z.boolean().default(false),
    position: z.number().int().min(0).max(10000).default(0),
  })
  .strict();
const studentInput = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    full_name: z.string().trim().min(1).max(160),
    phone: z.string().trim().max(80).default(""),
    target_intake: z.string().trim().max(40).default(""),
  })
  .strict();
const profileInput = z
  .object({
    full_name: z.string().trim().min(1).max(160).optional(),
    phone: z.string().trim().max(80).optional(),
    target_intake: z.string().trim().max(40).optional(),
    staff_notes: z.string().max(10000).optional(),
  })
  .strict();
const enrollmentInput = z
  .object({
    user_id: uuid,
    course_id: uuid,
    mentor_id: uuid.nullable().default(null),
    status: z.enum(["active", "paused", "completed"]).default("active"),
  })
  .strict();
const enrollmentKey = z.object({ user_id: uuid, course_id: uuid }).strict();

export function installLmsRoutes(app, { store, fail }) {
  const q = (sql, args, c) => store.query(sql, args, c);
  const id = (req) => uuid.parse(req.params.id);

  // ---------- Courses ----------
  app.get("/api/lms/courses", async (req, res) => {
    const s = courseScope(req.actor);
    const items = await q(
      `SELECT c.id,c.title,c.summary,c.status,c.updated_at,
        (SELECT COUNT(*) FROM lms_lessons l WHERE l.course_id=c.id) AS lessons,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id=c.id) AS students
       FROM lms_courses c WHERE c.deleted_at IS NULL AND ${s.sql} ORDER BY c.title LIMIT 500`,
      s.params,
    );
    res.json({ items });
  });
  app.post("/api/lms/courses", async (req, res) => {
    requireCan(req.actor, "course.write");
    const data = courseInput.parse(req.body);
    const courseId = randomUUID();
    await store.transaction(async (c) => {
      await q(
        "INSERT INTO lms_courses (id,title,summary,status,created_by) VALUES (?,?,?,?,?)",
        [courseId, data.title, data.summary, data.status, req.actor.id],
        c,
      );
      await store.audit(req.actor.id, "course_create", courseId, c);
    });
    res.status(201).json({ id: courseId });
  });
  app.post("/api/lms/courses/:id", async (req, res) => {
    requireCan(req.actor, "course.write");
    const courseId = id(req);
    const data = courseInput.parse(req.body);
    await store.transaction(async (c) => {
      const r = await q(
        "UPDATE lms_courses SET title=?,summary=?,status=?,updated_at=UTC_TIMESTAMP() WHERE id=? AND deleted_at IS NULL",
        [data.title, data.summary, data.status, courseId],
        c,
      );
      if (!r.affectedRows) throw fail(404, "Course not found.");
      await store.audit(req.actor.id, "course_update:" + data.status, courseId, c);
    });
    res.json({ ok: true });
  });
  // Soft delete: hides the course from students at once; enrollments and progress are kept.
  app.post("/api/lms/courses/:id/delete", async (req, res) => {
    requireCan(req.actor, "course.write");
    const courseId = id(req);
    await store.transaction(async (c) => {
      const r = await q(
        "UPDATE lms_courses SET deleted_at=UTC_TIMESTAMP() WHERE id=? AND deleted_at IS NULL",
        [courseId],
        c,
      );
      if (!r.affectedRows) throw fail(404, "Course not found.");
      await store.audit(req.actor.id, "course_delete", courseId, c);
    });
    res.json({ ok: true });
  });

  // ---------- Lessons ----------
  app.get("/api/lms/courses/:id/lessons", async (req, res) => {
    const s = lessonScope(req.actor);
    const items = await q(
      `SELECT l.id,l.course_id,l.position,l.title,l.body,l.video_media_id,l.video_id,l.published,v.name AS video_name
       FROM lms_lessons l LEFT JOIN videos v ON v.id=l.video_id
       WHERE l.course_id=? AND ${s.sql} ORDER BY l.position,l.title`,
      [id(req), ...s.params],
    );
    res.json({ items });
  });
  const checkVideo = async (videoId, c) => {
    if (!videoId) return;
    const [m] = await q("SELECT mime,visibility FROM media WHERE id=?", [videoId], c);
    if (!m || !m.mime.startsWith("video/")) throw fail(400, "Choose an uploaded video.");
    if (m.visibility !== "private") throw fail(400, "Lesson videos must be uploaded as private.");
  };
  const saveLesson = async (req, res, lessonId) => {
    requireCan(req.actor, "lesson.write");
    const d = lessonInput.parse(req.body);
    await store.transaction(async (c) => {
      const [course] = await q(
        "SELECT id FROM lms_courses WHERE id=? AND deleted_at IS NULL FOR UPDATE",
        [d.course_id],
        c,
      );
      if (!course) throw fail(404, "Course not found.");
      await checkVideo(d.video_media_id, c);
      if (d.video_id) {
        const [v] = await q("SELECT id FROM videos WHERE id=? AND status='ready'", [d.video_id], c);
        if (!v) throw fail(400, "Choose an uploaded video.");
      }
      const args = [d.title, d.body, d.video_media_id, d.video_id, d.published, d.position];
      if (lessonId) {
        const r = await q(
          "UPDATE lms_lessons SET title=?,body=?,video_media_id=?,video_id=?,published=?,position=?,updated_at=UTC_TIMESTAMP() WHERE id=? AND course_id=?",
          [...args, lessonId, d.course_id],
          c,
        );
        if (!r.affectedRows) throw fail(404, "Lesson not found.");
      } else
        await q(
          "INSERT INTO lms_lessons (title,body,video_media_id,video_id,published,position,id,course_id) VALUES (?,?,?,?,?,?,?,?)",
          [...args, (lessonId = randomUUID()), d.course_id],
          c,
        );
      await store.audit(req.actor.id, "lesson_save", lessonId, c);
    });
    res.json({ id: lessonId });
  };
  app.post("/api/lms/lessons", (req, res) => saveLesson(req, res, null));
  app.post("/api/lms/lessons/:id", (req, res) => saveLesson(req, res, id(req)));
  app.post("/api/lms/lessons/:id/delete", async (req, res) => {
    requireCan(req.actor, "lesson.write");
    const lessonId = id(req);
    await store.transaction(async (c) => {
      const r = await q("DELETE FROM lms_lessons WHERE id=?", [lessonId], c);
      if (!r.affectedRows) throw fail(404, "Lesson not found.");
      await store.audit(req.actor.id, "lesson_delete", lessonId, c);
    });
    res.json({ ok: true });
  });

  // ---------- Students ----------
  app.get("/api/lms/students", async (req, res) => {
    if (req.actor.role === "student") throw fail(403, "Staff only.");
    const s = studentScope(req.actor, "u.id");
    const students = await q(
      `SELECT u.id,u.email,u.active,${profileColumns(req.actor).replace("p.user_id,", "")}
       FROM users u LEFT JOIN student_profiles p ON p.user_id=u.id
       WHERE u.role='student' AND ${s.sql} ORDER BY p.full_name,u.email LIMIT 1000`,
      s.params,
    );
    const e = studentScope(req.actor, "e.user_id");
    const enrollments = await q(
      `SELECT e.user_id,e.course_id,e.mentor_id,e.status,c.title FROM enrollments e
       JOIN lms_courses c ON c.id=e.course_id WHERE c.deleted_at IS NULL AND ${e.sql}`,
      e.params,
    );
    res.json({
      items: students.map((st) => ({
        ...st,
        enrollments: enrollments.filter((x) => x.user_id === st.id),
      })),
    });
  });
  // Create a student account (no self sign-up). They sign in with Google, an email code or a password they set.
  app.post("/api/lms/students", async (req, res) => {
    requireCan(req.actor, "enrollment.write");
    const d = studentInput.parse(req.body);
    const userId = randomUUID();
    await store.transaction(async (c) => {
      const [existing] = await q("SELECT id FROM users WHERE email=? FOR UPDATE", [d.email], c);
      if (existing) throw fail(409, "An account with this email already exists.");
      await q(
        "INSERT INTO users (id,email,role,active) VALUES (?,?,'student',1)",
        [userId, d.email],
        c,
      );
      await q(
        "INSERT INTO student_profiles (user_id,full_name,phone,target_intake) VALUES (?,?,?,?)",
        [userId, d.full_name, d.phone, d.target_intake],
        c,
      );
      await store.audit(req.actor.id, "student_create", d.email, c);
    });
    res.status(201).json({ id: userId });
  });
  app.post("/api/lms/students/:id", async (req, res) => {
    const studentId = id(req);
    const d = profileInput.parse(req.body);
    const fields = Object.keys(d);
    if (!fields.length) throw fail(400, "Nothing to save.");
    // Staff edit everything; mentors only notes on their own students; students use their own page (step 3).
    if (!isStaff(req.actor)) {
      if (!can(req.actor, "profile.notes"))
        throw fail(403, "You do not have permission for this action.");
      if (fields.some((f) => f !== "staff_notes")) throw fail(403, "You can only add notes.");
    }
    await store.transaction(async (c) => {
      const [student] = await q(
        "SELECT id FROM users WHERE id=? AND role='student' FOR UPDATE",
        [studentId],
        c,
      );
      if (!student || !(await canReachStudent(req.actor, studentId, store.query.bind(store), c)))
        throw fail(404, "Student not found.");
      await q("INSERT IGNORE INTO student_profiles (user_id) VALUES (?)", [studentId], c);
      await q(
        `UPDATE student_profiles SET ${fields.map((f) => f + "=?").join(",")},updated_at=UTC_TIMESTAMP() WHERE user_id=?`,
        [...fields.map((f) => d[f]), studentId],
        c,
      );
      await store.audit(req.actor.id, "student_update:" + fields.join("+"), studentId, c);
    });
    res.json({ ok: true });
  });

  // ---------- Enrollments ----------
  app.post("/api/lms/enrollments", async (req, res) => {
    requireCan(req.actor, "enrollment.write");
    const d = enrollmentInput.parse(req.body);
    await store.transaction(async (c) => {
      const [student] = await q(
        "SELECT id FROM users WHERE id=? AND role='student' AND active=1",
        [d.user_id],
        c,
      );
      if (!student) throw fail(400, "Choose an active student.");
      const [course] = await q(
        "SELECT id FROM lms_courses WHERE id=? AND deleted_at IS NULL",
        [d.course_id],
        c,
      );
      if (!course) throw fail(400, "Choose a course.");
      if (d.mentor_id) {
        const [mentor] = await q(
          "SELECT id FROM users WHERE id=? AND role='mentor' AND active=1",
          [d.mentor_id],
          c,
        );
        if (!mentor) throw fail(400, "Choose an active mentor.");
      }
      await q(
        `INSERT INTO enrollments (user_id,course_id,mentor_id,status) VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE mentor_id=VALUES(mentor_id),status=VALUES(status)`,
        [d.user_id, d.course_id, d.mentor_id, d.status],
        c,
      );
      await store.audit(
        req.actor.id,
        "enrollment_save:" + d.status,
        `${d.user_id}/${d.course_id}`,
        c,
      );
    });
    res.json({ ok: true });
  });
  app.post("/api/lms/enrollments/delete", async (req, res) => {
    requireCan(req.actor, "enrollment.write");
    const d = enrollmentKey.parse(req.body);
    await store.transaction(async (c) => {
      const r = await q(
        "DELETE FROM enrollments WHERE user_id=? AND course_id=?",
        [d.user_id, d.course_id],
        c,
      );
      if (!r.affectedRows) throw fail(404, "Enrollment not found.");
      await store.audit(req.actor.id, "enrollment_delete", `${d.user_id}/${d.course_id}`, c);
    });
    res.json({ ok: true });
  });
}

// ---------- Student side: my courses, progress, profile, protected video ----------
const progressInput = z.object({ lesson_id: uuid, done: z.boolean() }).strict();
const myProfileInput = z
  .object({
    full_name: z.string().trim().min(1).max(160),
    phone: z.string().trim().max(80).default(""),
    target_intake: z.string().trim().max(40).default(""),
  })
  .strict();

export function installStudentRoutes(app, { store, fail, sendBytes }) {
  const q = (sql, args, c) => store.query(sql, args, c);
  const onlyStudents = (req) => {
    if (req.actor.role !== "student") throw fail(403, "This page is for students.");
  };

  app.get("/api/lms/my/courses", async (req, res) => {
    onlyStudents(req);
    const s = courseScope(req.actor);
    const items = await q(
      `SELECT c.id,c.title,c.summary,
        (SELECT COUNT(*) FROM lms_lessons l WHERE l.course_id=c.id AND l.published=1) AS lessons,
        (SELECT COUNT(*) FROM lesson_progress g JOIN lms_lessons l ON l.id=g.lesson_id
           WHERE g.user_id=? AND l.course_id=c.id AND l.published=1) AS done
       FROM lms_courses c WHERE ${s.sql} ORDER BY c.title`,
      [req.actor.id, ...s.params],
    );
    res.json({ items });
  });
  app.get("/api/lms/my/courses/:id", async (req, res) => {
    onlyStudents(req);
    const courseId = uuid.parse(req.params.id);
    const c = courseScope(req.actor);
    const [course] = await q(
      `SELECT c.id,c.title,c.summary FROM lms_courses c WHERE c.id=? AND ${c.sql}`,
      [courseId, ...c.params],
    );
    if (!course) throw fail(404, "Course not found.");
    const l = lessonScope(req.actor);
    const lessons = await q(
      `SELECT l.id,l.title,l.body,l.position,(l.video_media_id IS NOT NULL OR l.video_id IS NOT NULL) AS has_video,
        EXISTS(SELECT 1 FROM lesson_progress g WHERE g.user_id=? AND g.lesson_id=l.id) AS done
       FROM lms_lessons l WHERE l.course_id=? AND ${l.sql} ORDER BY l.position,l.title`,
      [req.actor.id, courseId, ...l.params],
    );
    res.json({ course, lessons });
  });
  app.post("/api/lms/my/progress", async (req, res) => {
    requireCan(req.actor, "progress.write");
    const d = progressInput.parse(req.body);
    await store.transaction(async (c) => {
      const l = lessonScope(req.actor);
      const [lesson] = await q(
        `SELECT l.id FROM lms_lessons l WHERE l.id=? AND ${l.sql}`,
        [d.lesson_id, ...l.params],
        c,
      );
      if (!lesson) throw fail(404, "Lesson not found.");
      if (d.done)
        await q(
          "INSERT IGNORE INTO lesson_progress (user_id,lesson_id) VALUES (?,?)",
          [req.actor.id, d.lesson_id],
          c,
        );
      else
        await q(
          "DELETE FROM lesson_progress WHERE user_id=? AND lesson_id=?",
          [req.actor.id, d.lesson_id],
          c,
        );
    });
    res.json({ ok: true });
  });
  app.get("/api/lms/my/profile", async (req, res) => {
    onlyStudents(req);
    const s = studentScope(req.actor, "p.user_id");
    const [profile] = await q(
      `SELECT ${profileColumns(req.actor)} FROM student_profiles p WHERE ${s.sql}`,
      s.params,
    );
    res.json(profile || { full_name: "", phone: "", target_intake: "" });
  });
  app.post("/api/lms/my/profile", async (req, res) => {
    onlyStudents(req);
    requireCan(req.actor, "profile.write");
    const d = myProfileInput.parse(req.body);
    // Own row only, and never staff_notes.
    await q(
      `INSERT INTO student_profiles (user_id,full_name,phone,target_intake,updated_at) VALUES (?,?,?,?,UTC_TIMESTAMP())
       ON DUPLICATE KEY UPDATE full_name=VALUES(full_name),phone=VALUES(phone),target_intake=VALUES(target_intake),updated_at=UTC_TIMESTAMP()`,
      [req.actor.id, d.full_name, d.phone, d.target_intake],
    );
    res.json({ ok: true });
  });

  // Protected lesson video. Checked on EVERY request (including each byte-range request), so pausing an
  // enrollment, unpublishing a lesson or deactivating an account stops playback immediately.
  // Same-origin only, never cached, never on the public media route.
  app.get("/api/lms/lessons/:id/video", async (req, res) => {
    const lessonId = uuid.parse(req.params.id);
    const l = lessonScope(req.actor); // throws 403 for editors
    const [file] = await q(
      `SELECT m.bytes,m.mime FROM lms_lessons l JOIN media m ON m.id=l.video_media_id
       WHERE l.id=? AND m.visibility='private' AND ${l.sql}`,
      [lessonId, ...l.params],
    );
    if (!file || !String(file.mime).startsWith("video/")) throw fail(404, "Video not found.");
    res.set({
      "Content-Type": file.mime,
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline",
      "Cross-Origin-Resource-Policy": "same-origin",
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes",
    });
    sendBytes(req, res, file.bytes);
  });
}

// ---------- Messages (one thread per student) and course reviews ----------
const messageInput = z.object({ body: z.string().trim().min(1).max(5000) }).strict();
const reviewInput = z
  .object({
    course_id: uuid,
    rating: z.number().int().min(1).max(5),
    body: z.string().trim().min(10).max(2000),
  })
  .strict();
const moderation = z.object({ status: z.enum(["approved", "rejected", "pending"]) }).strict();

export function installMessageRoutes(app, { store, fail }) {
  const q = (sql, args, c) => store.query(sql, args, c);
  const reach = async (req, studentId, c) => {
    const [student] = await q("SELECT id FROM users WHERE id=? AND role='student'", [studentId], c);
    if (!student || !(await canReachStudent(req.actor, studentId, store.query.bind(store), c)))
      throw fail(404, "Conversation not found.");
  };

  // Staff and mentors: list of student conversations in their scope, newest first, with unread counts.
  app.get("/api/lms/threads", async (req, res) => {
    if (req.actor.role === "student") throw fail(403, "Staff only.");
    const s = studentScope(req.actor, "u.id");
    const items = await q(
      `SELECT u.id,u.email,p.full_name,
        (SELECT MAX(m.created_at) FROM messages m WHERE m.student_id=u.id) AS last_at,
        (SELECT COUNT(*) FROM messages m WHERE m.student_id=u.id AND m.sender_id=u.id AND m.read_at IS NULL) AS unread
       FROM users u LEFT JOIN student_profiles p ON p.user_id=u.id
       WHERE u.role='student' AND u.active=1 AND ${s.sql}
       ORDER BY last_at IS NULL, last_at DESC, p.full_name LIMIT 1000`,
      s.params,
    );
    res.json({ items });
  });
  // One conversation. Opening it marks the other side's messages as read.
  app.get("/api/lms/threads/:id", async (req, res) => {
    const studentId = uuid.parse(req.params.id);
    const messages = await store.transaction(async (c) => {
      await reach(req, studentId, c);
      const fromStudent = req.actor.id === studentId;
      await q(
        `UPDATE messages SET read_at=UTC_TIMESTAMP() WHERE student_id=? AND read_at IS NULL AND ${fromStudent ? "sender_id<>?" : "sender_id=?"}`,
        [studentId, studentId],
        c,
      );
      return q(
        `SELECT m.id,m.body,m.created_at,m.read_at,m.sender_id,s.role AS sender_role,
          ${fromStudent ? "NULL" : "s.email"} AS sender_email
         FROM messages m LEFT JOIN users s ON s.id=m.sender_id
         WHERE m.student_id=? ORDER BY m.created_at,m.id LIMIT 500`,
        [studentId],
        c,
      );
    });
    res.json({ items: messages.map((m) => ({ ...m, mine: m.sender_id === req.actor.id })) });
  });
  app.post("/api/lms/threads/:id", async (req, res) => {
    requireCan(req.actor, "message.send");
    const studentId = uuid.parse(req.params.id);
    const { body } = messageInput.parse(req.body);
    if (store.checkRateLimit && !(await store.checkRateLimit("message", req.actor.id, 30, 3600)))
      throw fail(429, "You've sent a lot of messages. Please wait a little.");
    const messageId = randomUUID();
    await store.transaction(async (c) => {
      await reach(req, studentId, c);
      await q(
        "INSERT INTO messages (id,student_id,sender_id,body) VALUES (?,?,?,?)",
        [messageId, studentId, req.actor.id, body],
        c,
      );
    });
    res.status(201).json({ id: messageId });
  });
  // Students: unread count for the menu badge.
  app.get("/api/lms/my/unread", async (req, res) => {
    if (req.actor.role !== "student") throw fail(403, "This page is for students.");
    const [row] = await q(
      "SELECT COUNT(*) AS n FROM messages WHERE student_id=? AND sender_id<>? AND read_at IS NULL",
      [req.actor.id, req.actor.id],
    );
    res.json({ unread: Number(row?.n || 0) });
  });

  // ---------- Reviews ----------
  app.get("/api/lms/my/reviews", async (req, res) => {
    if (req.actor.role !== "student") throw fail(403, "This page is for students.");
    const s = studentScope(req.actor, "r.user_id");
    res.json({
      items: await q(
        `SELECT r.course_id,r.rating,r.body,r.status FROM reviews r WHERE ${s.sql}`,
        s.params,
      ),
    });
  });
  // One review per course; editing sends it back for approval.
  app.post("/api/lms/my/reviews", async (req, res) => {
    requireCan(req.actor, "review.write");
    const d = reviewInput.parse(req.body);
    await store.transaction(async (c) => {
      const cs = courseScope(req.actor);
      const [course] = await q(
        `SELECT c.id FROM lms_courses c WHERE c.id=? AND ${cs.sql}`,
        [d.course_id, ...cs.params],
        c,
      );
      if (!course) throw fail(404, "Course not found.");
      await q(
        `INSERT INTO reviews (id,user_id,course_id,rating,body,status) VALUES (?,?,?,?,?,'pending')
         ON DUPLICATE KEY UPDATE rating=VALUES(rating),body=VALUES(body),status='pending',created_at=CURRENT_TIMESTAMP`,
        [randomUUID(), req.actor.id, d.course_id, d.rating, d.body],
        c,
      );
    });
    res.json({ ok: true, status: "pending" });
  });
  app.get("/api/lms/reviews", async (req, res) => {
    requireCan(req.actor, "review.moderate");
    const status = moderation.shape.status.safeParse(req.query.status).data;
    const items = await q(
      `SELECT r.id,r.rating,r.body,r.status,r.created_at,c.title AS course,u.email,p.full_name
       FROM reviews r JOIN lms_courses c ON c.id=r.course_id JOIN users u ON u.id=r.user_id
       LEFT JOIN student_profiles p ON p.user_id=r.user_id
       ${status ? "WHERE r.status=?" : ""} ORDER BY r.created_at DESC LIMIT 500`,
      status ? [status] : [],
    );
    res.json({ items });
  });
  app.post("/api/lms/reviews/:id", async (req, res) => {
    requireCan(req.actor, "review.moderate");
    const reviewId = uuid.parse(req.params.id);
    const { status } = moderation.parse(req.body);
    await store.transaction(async (c) => {
      const r = await q("UPDATE reviews SET status=? WHERE id=?", [status, reviewId], c);
      if (!r.affectedRows) throw fail(404, "Review not found.");
      await store.audit(req.actor.id, "review_" + status, reviewId, c);
    });
    res.json({ ok: true });
  });
}
