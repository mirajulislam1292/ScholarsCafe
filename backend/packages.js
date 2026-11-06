// Packages (Phase 2): name, price, what's included, the courses it unlocks and the features it turns on
// (messaging, uploads, reviews, live). Owners and admins only. Assigning a package to a student enrolls them
// in its courses, so course access keeps going through enrollments and the scopes in access.js.
// Also: per-student sign-in access and "same mentor for all courses".
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { requireCan } from "./access.js";

const uuid = z.string().uuid();
export const FEATURES = ["messaging", "uploads", "reviews", "live"];
const packageInput = z
  .object({
    name: z.string().trim().min(1).max(160),
    price: z.string().trim().max(80).default(""),
    description: z.string().max(5000).default(""),
    includes: z.array(z.string().trim().min(1).max(300)).max(50).default([]),
    features: z
      .object(Object.fromEntries(FEATURES.map((f) => [f, z.boolean().default(false)])))
      .strict()
      .default({}),
    active: z.boolean().default(true),
    position: z.number().int().min(0).max(10000).default(0),
    course_ids: z.array(uuid).max(200).default([]),
  })
  .strict();
const assignInput = z
  .object({ user_id: uuid, package_id: uuid, mentor_id: uuid.nullable().default(null) })
  .strict();
const unassignInput = z.object({ user_id: uuid, package_id: uuid }).strict();
const accessInput = z.object({ active: z.boolean() }).strict();
const mentorInput = z.object({ mentor_id: uuid.nullable() }).strict();
const json = (v, fallback) => (typeof v === "string" ? JSON.parse(v) : (v ?? fallback));

export function installPackageRoutes(app, { store, fail }) {
  const q = (sql, args, c) => store.query(sql, args, c);
  const id = (req) => uuid.parse(req.params.id);

  const activeStudent = async (userId, c) => {
    const [s] = await q(
      "SELECT id FROM users WHERE id=? AND role='student' FOR UPDATE",
      [userId],
      c,
    );
    if (!s) throw fail(404, "Student not found.");
  };
  const checkMentor = async (mentorId, c) => {
    if (!mentorId) return;
    const [m] = await q(
      "SELECT id FROM users WHERE id=? AND role='mentor' AND active=1",
      [mentorId],
      c,
    );
    if (!m) throw fail(400, "Choose an active mentor.");
  };
  // Enroll each holder of a package in all of its courses (keeps existing mentor and status).
  const enrollHolders = (packageId, mentorId, userId, c) =>
    q(
      `INSERT INTO enrollments (user_id,course_id,mentor_id,status)
       SELECT up.user_id,pc.course_id,?,'active' FROM user_packages up
       JOIN package_courses pc ON pc.package_id=up.package_id
       JOIN lms_courses lc ON lc.id=pc.course_id AND lc.deleted_at IS NULL
       WHERE up.package_id=? ${userId ? "AND up.user_id=?" : ""}
       ON DUPLICATE KEY UPDATE mentor_id=COALESCE(VALUES(mentor_id),enrollments.mentor_id)`,
      [mentorId, packageId, ...(userId ? [userId] : [])],
      c,
    );
  // Remove enrollments in `courseIds` for `userIds`, unless another of their packages still includes the course.
  const dropUncovered = async (userIds, courseIds, c) => {
    if (!userIds.length || !courseIds.length) return;
    const u = userIds.map(() => "?").join(","),
      k = courseIds.map(() => "?").join(",");
    await q(
      `DELETE e FROM enrollments e WHERE e.user_id IN (${u}) AND e.course_id IN (${k})
       AND NOT EXISTS (SELECT 1 FROM user_packages up JOIN package_courses pc ON pc.package_id=up.package_id
         WHERE up.user_id=e.user_id AND pc.course_id=e.course_id)`,
      [...userIds, ...courseIds],
      c,
    );
  };

  app.get("/api/packages", async (req, res) => {
    requireCan(req.actor, "package.write");
    const rows = await q(
      `SELECT p.*,(SELECT COUNT(*) FROM user_packages up WHERE up.package_id=p.id) AS students
       FROM packages p WHERE p.deleted_at IS NULL ORDER BY p.position,p.name`,
    );
    const links = await q("SELECT package_id,course_id FROM package_courses");
    const assigned = await q(
      "SELECT up.user_id,up.package_id,up.granted_at FROM user_packages up JOIN packages p ON p.id=up.package_id WHERE p.deleted_at IS NULL",
    );
    res.json({
      items: rows.map((p) => ({
        ...p,
        active: Boolean(p.active),
        students: Number(p.students),
        includes: json(p.includes, []),
        features: json(p.features, {}),
        course_ids: links.filter((l) => l.package_id === p.id).map((l) => l.course_id),
      })),
      assigned,
    });
  });

  const save = async (req, res, existingId) => {
    requireCan(req.actor, "package.write");
    const d = packageInput.parse(req.body);
    const packageId = existingId || randomUUID();
    await store.transaction(async (c) => {
      if (d.course_ids.length) {
        const found = await q(
          `SELECT id FROM lms_courses WHERE deleted_at IS NULL AND id IN (${d.course_ids.map(() => "?").join(",")})`,
          d.course_ids,
          c,
        );
        if (found.length !== new Set(d.course_ids).size)
          throw fail(400, "Choose existing courses.");
      }
      const values = [
        d.name,
        d.price,
        d.description,
        JSON.stringify(d.includes),
        JSON.stringify(d.features),
        d.active,
        d.position,
      ];
      let before = [];
      if (existingId) {
        const [p] = await q(
          "SELECT id FROM packages WHERE id=? AND deleted_at IS NULL FOR UPDATE",
          [packageId],
          c,
        );
        if (!p) throw fail(404, "Package not found.");
        before = (
          await q("SELECT course_id FROM package_courses WHERE package_id=?", [packageId], c)
        ).map((r) => r.course_id);
        await q(
          "UPDATE packages SET name=?,price=?,description=?,includes=?,features=?,active=?,position=?,updated_at=UTC_TIMESTAMP() WHERE id=?",
          [...values, packageId],
          c,
        );
        await q("DELETE FROM package_courses WHERE package_id=?", [packageId], c);
      } else
        await q(
          "INSERT INTO packages (name,price,description,includes,features,active,position,id) VALUES (?,?,?,?,?,?,?,?)",
          [...values, packageId],
          c,
        );
      for (const courseId of new Set(d.course_ids))
        await q(
          "INSERT INTO package_courses (package_id,course_id) VALUES (?,?)",
          [packageId, courseId],
          c,
        );
      if (existingId) {
        // Keep holders in step with the course list: add new courses, drop removed ones.
        await enrollHolders(packageId, null, null, c);
        const removed = before.filter((x) => !d.course_ids.includes(x));
        const holders = (
          await q("SELECT user_id FROM user_packages WHERE package_id=?", [packageId], c)
        ).map((r) => r.user_id);
        await dropUncovered(holders, removed, c);
      }
      await store.audit(req.actor.id, existingId ? "package_update" : "package_create", d.name, c);
    });
    res.status(existingId ? 200 : 201).json({ id: packageId });
  };
  app.post("/api/packages", (req, res) => save(req, res, null));
  app.post("/api/packages/assign", async (req, res) => {
    requireCan(req.actor, "package.write");
    const d = assignInput.parse(req.body);
    await store.transaction(async (c) => {
      await activeStudent(d.user_id, c);
      await checkMentor(d.mentor_id, c);
      const [p] = await q(
        "SELECT name FROM packages WHERE id=? AND deleted_at IS NULL",
        [d.package_id],
        c,
      );
      if (!p) throw fail(400, "Choose a package.");
      await q(
        "INSERT IGNORE INTO user_packages (user_id,package_id,granted_by) VALUES (?,?,?)",
        [d.user_id, d.package_id, req.actor.id],
        c,
      );
      await enrollHolders(d.package_id, d.mentor_id, d.user_id, c);
      await store.audit(req.actor.id, "package_assign:" + p.name, d.user_id, c);
    });
    res.json({ ok: true });
  });
  app.post("/api/packages/unassign", async (req, res) => {
    requireCan(req.actor, "package.write");
    const d = unassignInput.parse(req.body);
    await store.transaction(async (c) => {
      await activeStudent(d.user_id, c);
      const r = await q(
        "DELETE FROM user_packages WHERE user_id=? AND package_id=?",
        [d.user_id, d.package_id],
        c,
      );
      if (!r.affectedRows) throw fail(404, "This student does not have that package.");
      const courses = (
        await q("SELECT course_id FROM package_courses WHERE package_id=?", [d.package_id], c)
      ).map((x) => x.course_id);
      await dropUncovered([d.user_id], courses, c);
      await store.audit(req.actor.id, "package_unassign", `${d.user_id}/${d.package_id}`, c);
    });
    res.json({ ok: true });
  });
  app.post("/api/packages/:id", (req, res) => save(req, res, id(req)));
  app.post("/api/packages/:id/delete", async (req, res) => {
    requireCan(req.actor, "package.write");
    const packageId = id(req);
    await store.transaction(async (c) => {
      const [p] = await q(
        "SELECT name FROM packages WHERE id=? AND deleted_at IS NULL FOR UPDATE",
        [packageId],
        c,
      );
      if (!p) throw fail(404, "Package not found.");
      const [{ n }] = await q(
        "SELECT COUNT(*) AS n FROM user_packages WHERE package_id=?",
        [packageId],
        c,
      );
      if (Number(n))
        throw fail(
          409,
          `${n} student(s) have this package. Remove it from them first, or mark it inactive.`,
        );
      await q("UPDATE packages SET deleted_at=UTC_TIMESTAMP() WHERE id=?", [packageId], c);
      await store.audit(req.actor.id, "package_delete", p.name, c);
    });
    res.json({ ok: true });
  });

  // ---------- Per-student controls (owner/admin) ----------
  app.post("/api/students/:id/access", async (req, res) => {
    requireCan(req.actor, "enrollment.write");
    const studentId = id(req);
    const d = accessInput.parse(req.body);
    await store.transaction(async (c) => {
      await activeStudent(studentId, c);
      await q("UPDATE users SET active=? WHERE id=?", [d.active, studentId], c);
      if (!d.active) await q("DELETE FROM sessions WHERE user_id=?", [studentId], c);
      await store.audit(
        req.actor.id,
        d.active ? "student_enable" : "student_disable",
        studentId,
        c,
      );
    });
    res.json({ ok: true });
  });
  app.post("/api/students/:id/mentor", async (req, res) => {
    requireCan(req.actor, "enrollment.write");
    const studentId = id(req);
    const d = mentorInput.parse(req.body);
    await store.transaction(async (c) => {
      await activeStudent(studentId, c);
      await checkMentor(d.mentor_id, c);
      await q("UPDATE enrollments SET mentor_id=? WHERE user_id=?", [d.mentor_id, studentId], c);
      await store.audit(req.actor.id, "student_mentor", studentId, c);
    });
    res.json({ ok: true });
  });
}
