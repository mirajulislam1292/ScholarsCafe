// Student dashboard API, staff side: courses, lessons, students, enrollments.
// Mounted under /api (session + CSRF already checked). Every read uses the scopes in access.js;
// every write checks the permission table and re-checks rows inside the transaction.
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { courseScope, lessonScope, studentScope, profileColumns, requireCan, can, canReachStudent, isStaff } from "./access.js";

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
    published: z.boolean().default(false),
    position: z.number().int().min(0).max(10000).default(0),
  })
  .strict();
const studentInput = z
  .object({
    email: z.string().trim().email().max(254).transform((s) => s.toLowerCase()),
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
      await q("INSERT INTO lms_courses (id,title,summary,status,created_by) VALUES (?,?,?,?,?)", [courseId, data.title, data.summary, data.status, req.actor.id], c);
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
      const r = await q("UPDATE lms_courses SET deleted_at=UTC_TIMESTAMP() WHERE id=? AND deleted_at IS NULL", [courseId], c);
      if (!r.affectedRows) throw fail(404, "Course not found.");
      await store.audit(req.actor.id, "course_delete", courseId, c);
    });
    res.json({ ok: true });
  });

  // ---------- Lessons ----------
  app.get("/api/lms/courses/:id/lessons", async (req, res) => {
    const s = lessonScope(req.actor);
    const items = await q(
      `SELECT l.id,l.course_id,l.position,l.title,l.body,l.video_media_id,l.published FROM lms_lessons l
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
      const [course] = await q("SELECT id FROM lms_courses WHERE id=? AND deleted_at IS NULL FOR UPDATE", [d.course_id], c);
      if (!course) throw fail(404, "Course not found.");
      await checkVideo(d.video_media_id, c);
      const args = [d.title, d.body, d.video_media_id, d.published, d.position];
      if (lessonId) {
        const r = await q(
          "UPDATE lms_lessons SET title=?,body=?,video_media_id=?,published=?,position=?,updated_at=UTC_TIMESTAMP() WHERE id=? AND course_id=?",
          [...args, lessonId, d.course_id],
          c,
        );
        if (!r.affectedRows) throw fail(404, "Lesson not found.");
      } else
        await q("INSERT INTO lms_lessons (title,body,video_media_id,published,position,id,course_id) VALUES (?,?,?,?,?,?,?)", [...args, (lessonId = randomUUID()), d.course_id], c);
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
    res.json({ items: students.map((st) => ({ ...st, enrollments: enrollments.filter((x) => x.user_id === st.id) })) });
  });
  // Create a student account (no self sign-up). They sign in with Google, an email code or a password they set.
  app.post("/api/lms/students", async (req, res) => {
    requireCan(req.actor, "enrollment.write");
    const d = studentInput.parse(req.body);
    const userId = randomUUID();
    await store.transaction(async (c) => {
      const [existing] = await q("SELECT id FROM users WHERE email=? FOR UPDATE", [d.email], c);
      if (existing) throw fail(409, "An account with this email already exists.");
      await q("INSERT INTO users (id,email,role,active) VALUES (?,?,'student',1)", [userId, d.email], c);
      await q("INSERT INTO student_profiles (user_id,full_name,phone,target_intake) VALUES (?,?,?,?)", [userId, d.full_name, d.phone, d.target_intake], c);
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
      if (!can(req.actor, "profile.notes")) throw fail(403, "You do not have permission for this action.");
      if (fields.some((f) => f !== "staff_notes")) throw fail(403, "You can only add notes.");
    }
    await store.transaction(async (c) => {
      const [student] = await q("SELECT id FROM users WHERE id=? AND role='student' FOR UPDATE", [studentId], c);
      if (!student || !(await canReachStudent(req.actor, studentId, store.query.bind(store), c))) throw fail(404, "Student not found.");
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
      const [student] = await q("SELECT id FROM users WHERE id=? AND role='student' AND active=1", [d.user_id], c);
      if (!student) throw fail(400, "Choose an active student.");
      const [course] = await q("SELECT id FROM lms_courses WHERE id=? AND deleted_at IS NULL", [d.course_id], c);
      if (!course) throw fail(400, "Choose a course.");
      if (d.mentor_id) {
        const [mentor] = await q("SELECT id FROM users WHERE id=? AND role='mentor' AND active=1", [d.mentor_id], c);
        if (!mentor) throw fail(400, "Choose an active mentor.");
      }
      await q(
        `INSERT INTO enrollments (user_id,course_id,mentor_id,status) VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE mentor_id=VALUES(mentor_id),status=VALUES(status)`,
        [d.user_id, d.course_id, d.mentor_id, d.status],
        c,
      );
      await store.audit(req.actor.id, "enrollment_save:" + d.status, `${d.user_id}/${d.course_id}`, c);
    });
    res.json({ ok: true });
  });
  app.post("/api/lms/enrollments/delete", async (req, res) => {
    requireCan(req.actor, "enrollment.write");
    const d = enrollmentKey.parse(req.body);
    await store.transaction(async (c) => {
      const r = await q("DELETE FROM enrollments WHERE user_id=? AND course_id=?", [d.user_id, d.course_id], c);
      if (!r.affectedRows) throw fail(404, "Enrollment not found.");
      await store.audit(req.actor.id, "enrollment_delete", `${d.user_id}/${d.course_id}`, c);
    });
    res.json({ ok: true });
  });
}
