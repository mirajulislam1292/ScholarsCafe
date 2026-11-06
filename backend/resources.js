// Student portal (Phase 3): resources and announcements gated by package, the Home page, video play links and
// resume position. Staff manage resources under /api/resources (owner/admin); students read under /api/lms/my/*.
// Every student read takes its WHERE clause from access.js.
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { lessonScope, requireCan, resourceScope } from "./access.js";
import { playLink } from "./videos.js";

const uuid = z.string().uuid();
const https = z
  .string()
  .trim()
  .max(2000)
  .refine((s) => !s || /^https:\/\/[^\s"'<>\\]+$/.test(s), "Use a full https:// link");
const resourceInput = z
  .object({
    type: z.enum(["announcement", "live", "video", "guide", "link"]),
    title: z.string().trim().min(1).max(200),
    body: z.string().max(20000).default(""),
    url: https.default(""),
    video_id: uuid.nullable().default(null),
    tags: z
      .string()
      .max(300)
      .default("")
      .transform((s) =>
        s
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
          .join(","),
      ),
    country: z.string().trim().max(80).default(""),
    starts_at: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?Z?$/)
      .nullable()
      .default(null),
    published: z.boolean().default(false),
    pinned: z.boolean().default(false),
    package_ids: z.array(uuid).max(100).default([]),
  })
  .strict();
const positionInput = z
  .object({
    lesson_id: uuid,
    seconds: z.number().min(0).max(86400),
    duration: z.number().min(0).max(86400),
  })
  .strict();
const RESOURCE_COLUMNS =
  "r.id,r.type,r.title,r.body,r.url,(r.video_id IS NOT NULL) AS has_video,r.tags,r.country,r.starts_at,r.pinned,r.created_at";

/** Access re-check for each video stream request. */
export function streamAccess(store) {
  return async (kind, refId, actor) => {
    if (kind === "lesson") {
      const l = lessonScope(actor);
      const rows = await store.query(
        `SELECT 1 FROM lms_lessons l WHERE l.id=? AND l.video_id IS NOT NULL AND ${l.sql}`,
        [refId, ...l.params],
      );
      return rows.length > 0;
    }
    if (kind === "resource") {
      const r = resourceScope(actor);
      const rows = await store.query(
        `SELECT 1 FROM student_resources r WHERE r.id=? AND r.video_id IS NOT NULL AND ${r.sql}`,
        [refId, ...r.params],
      );
      return rows.length > 0;
    }
    return false;
  };
}

export function installResourceRoutes(app, { store, fail }) {
  const q = (sql, args, c) => store.query(sql, args, c);
  const id = (req) => uuid.parse(req.params.id);
  const onlyStudents = (req) => {
    if (req.actor.role !== "student") throw fail(403, "This page is for students.");
  };

  // ---------- Staff: resources and announcements ----------
  app.get("/api/resources", async (req, res) => {
    requireCan(req.actor, "resource.write");
    const items = await q(
      `SELECT r.*,v.name AS video_name FROM student_resources r LEFT JOIN videos v ON v.id=r.video_id
       WHERE r.deleted_at IS NULL ORDER BY r.pinned DESC,r.created_at DESC LIMIT 1000`,
    );
    const links = await q("SELECT resource_id,package_id FROM resource_packages");
    res.json({
      items: items.map((r) => ({
        ...r,
        published: Boolean(r.published),
        pinned: Boolean(r.pinned),
        package_ids: links.filter((l) => l.resource_id === r.id).map((l) => l.package_id),
      })),
    });
  });
  const save = async (req, res, existingId) => {
    requireCan(req.actor, "resource.write");
    const d = resourceInput.parse(req.body);
    if (d.type === "video" && !d.video_id) throw fail(400, "Choose or upload a video.");
    if (["live", "link"].includes(d.type) && !d.url) throw fail(400, "Add the link.");
    const resourceId = existingId || randomUUID();
    await store.transaction(async (c) => {
      if (d.video_id) {
        const [v] = await q("SELECT id FROM videos WHERE id=? AND status='ready'", [d.video_id], c);
        if (!v) throw fail(400, "Choose an uploaded video.");
      }
      for (const p of new Set(d.package_ids)) {
        const [found] = await q(
          "SELECT id FROM packages WHERE id=? AND deleted_at IS NULL",
          [p],
          c,
        );
        if (!found) throw fail(400, "Choose existing packages.");
      }
      const values = [
        d.type,
        d.title,
        d.body,
        d.url,
        d.video_id,
        d.tags,
        d.country,
        d.starts_at
          ? d.starts_at
              .replace("T", " ")
              .replace(/(\.\d+)?Z$/, "")
              .slice(0, 19)
          : null,
        d.published,
        d.pinned,
      ];
      if (existingId) {
        const r = await q(
          "UPDATE student_resources SET type=?,title=?,body=?,url=?,video_id=?,tags=?,country=?,starts_at=?,published=?,pinned=?,updated_at=UTC_TIMESTAMP() WHERE id=? AND deleted_at IS NULL",
          [...values, resourceId],
          c,
        );
        if (!r.affectedRows) throw fail(404, "Resource not found.");
        await q("DELETE FROM resource_packages WHERE resource_id=?", [resourceId], c);
      } else
        await q(
          "INSERT INTO student_resources (type,title,body,url,video_id,tags,country,starts_at,published,pinned,id,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
          [...values, resourceId, req.actor.id],
          c,
        );
      for (const p of new Set(d.package_ids))
        await q(
          "INSERT INTO resource_packages (resource_id,package_id) VALUES (?,?)",
          [resourceId, p],
          c,
        );
      await store.audit(req.actor.id, "resource_save:" + d.type, d.title, c);
    });
    res.status(existingId ? 200 : 201).json({ id: resourceId });
  };
  app.post("/api/resources", (req, res) => save(req, res, null));
  app.post("/api/resources/:id", (req, res) => save(req, res, id(req)));
  app.post("/api/resources/:id/delete", async (req, res) => {
    requireCan(req.actor, "resource.write");
    const resourceId = id(req);
    const r = await q(
      "UPDATE student_resources SET deleted_at=UTC_TIMESTAMP() WHERE id=? AND deleted_at IS NULL",
      [resourceId],
    );
    if (!r.affectedRows) throw fail(404, "Resource not found.");
    await store.audit(req.actor.id, "resource_delete", resourceId);
    res.json({ ok: true });
  });

  // ---------- Students ----------
  app.get("/api/lms/my/resources", async (req, res) => {
    onlyStudents(req);
    const r = resourceScope(req.actor);
    const items = await q(
      `SELECT ${RESOURCE_COLUMNS} FROM student_resources r WHERE r.type<>'announcement' AND ${r.sql}
       ORDER BY r.pinned DESC,COALESCE(r.starts_at,r.created_at) DESC LIMIT 500`,
      r.params,
    );
    res.json({ items });
  });
  app.get("/api/lms/my/home", async (req, res) => {
    onlyStudents(req);
    const me = req.actor.id;
    const [profile] = await q("SELECT full_name FROM student_profiles WHERE user_id=?", [me]);
    const packages = await q(
      `SELECT p.name,p.includes,p.features FROM user_packages up JOIN packages p ON p.id=up.package_id
       WHERE up.user_id=? AND p.deleted_at IS NULL ORDER BY up.granted_at`,
      [me],
    );
    const mentors = await q(
      `SELECT DISTINCT u.email FROM enrollments e JOIN users u ON u.id=e.mentor_id
       WHERE e.user_id=? AND u.active=1 AND e.status<>'paused'`,
      [me],
    );
    const r = resourceScope(req.actor);
    const announcements = await q(
      `SELECT ${RESOURCE_COLUMNS} FROM student_resources r WHERE r.type='announcement' AND ${r.sql}
       ORDER BY r.pinned DESC,r.created_at DESC LIMIT 5`,
      r.params,
    );
    const live = await q(
      `SELECT ${RESOURCE_COLUMNS} FROM student_resources r WHERE r.type='live' AND r.starts_at>=UTC_TIMESTAMP() - INTERVAL 3 HOUR AND ${r.sql}
       ORDER BY r.starts_at LIMIT 3`,
      r.params,
    );
    // Continue learning: the lesson watched most recently, else the first lesson not yet done.
    const l = lessonScope(req.actor);
    let [next] = await q(
      `SELECT l.id AS lesson_id,l.title,l.course_id,c.title AS course,g.seconds,g.duration
       FROM video_progress g JOIN lms_lessons l ON l.id=g.lesson_id JOIN lms_courses c ON c.id=l.course_id
       WHERE g.user_id=? AND ${l.sql} ORDER BY g.updated_at DESC LIMIT 1`,
      [me, ...l.params],
    );
    if (!next)
      [next] = await q(
        `SELECT l.id AS lesson_id,l.title,l.course_id,c.title AS course FROM lms_lessons l JOIN lms_courses c ON c.id=l.course_id
         WHERE NOT EXISTS (SELECT 1 FROM lesson_progress g WHERE g.user_id=? AND g.lesson_id=l.id) AND ${l.sql}
         ORDER BY c.title,l.position LIMIT 1`,
        [me, ...l.params],
      );
    const json = (v, f) => (typeof v === "string" ? JSON.parse(v) : (v ?? f));
    res.json({
      name: profile?.full_name || "",
      packages: packages.map((p) => ({
        name: p.name,
        includes: json(p.includes, []),
        features: json(p.features, {}),
      })),
      mentors: mentors.map((m) => m.email),
      announcements,
      live,
      next: next || null,
    });
  });
  // Play links (10 minutes, this user only). The stream route re-checks access on every request.
  app.get("/api/lms/lessons/:id/play", async (req, res) => {
    const lessonId = id(req);
    const l = lessonScope(req.actor);
    const [lesson] = await q(
      `SELECT l.id,l.video_id,l.video_media_id FROM lms_lessons l WHERE l.id=? AND ${l.sql}`,
      [lessonId, ...l.params],
    );
    if (!lesson || (!lesson.video_id && !lesson.video_media_id))
      throw fail(404, "Video not found.");
    const [pos] = await q("SELECT seconds FROM video_progress WHERE user_id=? AND lesson_id=?", [
      req.actor.id,
      lessonId,
    ]);
    res.json({
      url: lesson.video_id
        ? playLink(lesson.video_id, req.actor.id, "lesson", lessonId)
        : "/api/lms/lessons/" + lessonId + "/video", // older uploads stored in the database
      watermark: req.actor.email,
      position: pos ? Number(pos.seconds) : 0,
    });
  });
  app.get("/api/lms/resources/:id/play", async (req, res) => {
    onlyStudents(req);
    const resourceId = id(req);
    const r = resourceScope(req.actor);
    const [row] = await q(`SELECT r.video_id FROM student_resources r WHERE r.id=? AND ${r.sql}`, [
      resourceId,
      ...r.params,
    ]);
    if (!row?.video_id) throw fail(404, "Video not found.");
    res.json({
      url: playLink(row.video_id, req.actor.id, "resource", resourceId),
      watermark: req.actor.email,
      position: 0,
    });
  });
  // Resume position; 90% watched also marks the lesson done.
  app.post("/api/lms/my/position", async (req, res) => {
    requireCan(req.actor, "progress.write");
    const d = positionInput.parse(req.body);
    const l = lessonScope(req.actor);
    const [lesson] = await q(`SELECT l.id FROM lms_lessons l WHERE l.id=? AND ${l.sql}`, [
      d.lesson_id,
      ...l.params,
    ]);
    if (!lesson) throw fail(404, "Lesson not found.");
    await q(
      `INSERT INTO video_progress (user_id,lesson_id,seconds,duration) VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE seconds=VALUES(seconds),duration=VALUES(duration)`,
      [req.actor.id, d.lesson_id, Math.floor(d.seconds), Math.floor(d.duration)],
    );
    const done = d.duration > 0 && d.seconds / d.duration >= 0.9;
    if (done)
      await q("INSERT IGNORE INTO lesson_progress (user_id,lesson_id) VALUES (?,?)", [
        req.actor.id,
        d.lesson_id,
      ]);
    res.json({ ok: true, done });
  });
}
