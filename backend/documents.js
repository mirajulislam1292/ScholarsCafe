// Document reviews (Phase 4): a student submits an essay, SOP, CV or transcript; their mentor (or staff) replies
// with comments, an optional marked-up file and a status. Students can send a new version, which reopens it.
// Rows are scoped with studentScope (staff: all, mentor: their students, student: own).
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { canReachStudent, isStaff, requireCan, studentScope } from "./access.js";
import { featuresOf } from "./files.js";

const uuid = z.string().uuid();
export const DOC_KINDS = ["essay", "sop", "cv", "transcript", "lor", "other"];
export const DOC_STATUSES = ["shared", "submitted", "in_review", "changes_requested", "approved"];
const docInput = z
  .object({
    title: z.string().trim().min(1).max(200),
    kind: z.enum(DOC_KINDS),
    file_id: uuid,
    note: z.string().max(5000).default(""),
    review: z.boolean().default(true),
  })
  .strict();
const commentInput = z
  .object({
    body: z.string().trim().max(10000).default(""),
    file_id: uuid.nullable().default(null),
    status: z.enum(["in_review", "changes_requested", "approved"]).nullable().default(null),
  })
  .strict();

export function installDocumentRoutes(app, { store, fail }) {
  const q = (sql, args, c) => store.query(sql, args, c);
  const id = (req) => uuid.parse(req.params.id);
  // A file the student owns and that isn't attached to anything yet.
  const freshFile = async (fileId, studentId, c) => {
    const [f] = await q(
      `SELECT f.id FROM files f WHERE f.id=? AND f.student_id=? AND f.purpose='document' AND f.deleted_at IS NULL
       AND NOT EXISTS (SELECT 1 FROM documents d WHERE d.file_id=f.id)
       AND NOT EXISTS (SELECT 1 FROM document_comments k WHERE k.file_id=f.id)`,
      [fileId, studentId],
      c,
    );
    if (!f) throw fail(400, "Upload the file first.");
  };
  const load = async (actor, docId, c, lock = false) => {
    const s = studentScope(actor, "d.student_id");
    const [doc] = await q(
      `SELECT d.* FROM documents d WHERE d.id=? AND ${s.sql}${lock ? " FOR UPDATE" : ""}`,
      [docId, ...s.params],
      c,
    );
    if (!doc) throw fail(404, "Document not found.");
    return doc;
  };

  app.get("/api/lms/documents", async (req, res) => {
    const s = studentScope(req.actor, "d.student_id"); // editors refused
    const status = z
      .enum(DOC_STATUSES)
      .optional()
      .parse(req.query.status || undefined);
    const items = await q(
      `SELECT d.id,d.student_id,d.title,d.kind,d.status,d.created_at,d.updated_at,u.email,p.full_name,
        (SELECT COUNT(*) FROM document_comments k WHERE k.document_id=d.id) AS comments
       FROM documents d JOIN users u ON u.id=d.student_id LEFT JOIN student_profiles p ON p.user_id=d.student_id
       WHERE ${s.sql} ${status ? "AND d.status=?" : ""}
       ORDER BY FIELD(d.status,'submitted','in_review','changes_requested','shared','approved'),d.updated_at DESC LIMIT 500`,
      [...s.params, ...(status ? [status] : [])],
    );
    res.json({ items });
  });
  app.post("/api/lms/documents", async (req, res) => {
    if (req.actor.role !== "student") throw fail(403, "Students submit documents.");
    const d = docInput.parse(req.body);
    const docId = randomUUID();
    await store.transaction(async (c) => {
      const f = await featuresOf(store, req.actor.id, c);
      if (d.review && !f.reviews)
        throw fail(403, "Document reviews aren't included in your package.");
      if (!d.review && !f.uploads) throw fail(403, "File uploads aren't included in your package.");
      await freshFile(d.file_id, req.actor.id, c);
      await q(
        "INSERT INTO documents (id,student_id,title,kind,file_id,note,status) VALUES (?,?,?,?,?,?,?)",
        [
          docId,
          req.actor.id,
          d.title,
          d.kind,
          d.file_id,
          d.note,
          d.review ? "submitted" : "shared",
        ],
        c,
      );
    });
    res.status(201).json({ id: docId });
  });
  app.get("/api/lms/documents/:id", async (req, res) => {
    const doc = await load(req.actor, id(req));
    const [file] = await q("SELECT id,name,size FROM files WHERE id=?", [doc.file_id]);
    const comments = await q(
      `SELECT k.id,k.body,k.status,k.created_at,k.author_id,a.role AS author_role,
        ${req.actor.role === "student" ? "NULL" : "a.email"} AS author_email,f.id AS file_id,f.name AS file_name
       FROM document_comments k LEFT JOIN users a ON a.id=k.author_id LEFT JOIN files f ON f.id=k.file_id
       WHERE k.document_id=? ORDER BY k.created_at,k.id`,
      [doc.id],
    );
    res.json({
      document: { ...doc, file },
      comments: comments.map((k) => ({ ...k, mine: k.author_id === req.actor.id })),
    });
  });
  // Comment, attach a file and/or change the status. Students: a comment or a new version (reopens the review).
  app.post("/api/lms/documents/:id/comments", async (req, res) => {
    const d = commentInput.parse(req.body);
    const docId = id(req);
    if (!d.body && !d.file_id && !d.status) throw fail(400, "Write a comment or attach a file.");
    const student = req.actor.role === "student";
    if (!student) requireCan(req.actor, "document.review");
    if (student && d.status) throw fail(403, "Only your mentor can change the status.");
    if (
      store.checkRateLimit &&
      !(await store.checkRateLimit("doc-comment", req.actor.id, 60, 3600))
    )
      throw fail(429, "Too many comments. Please wait a little.");
    await store.transaction(async (c) => {
      const doc = await load(req.actor, docId, c, true);
      if (
        !student &&
        !(await canReachStudent(req.actor, doc.student_id, store.query.bind(store), c))
      )
        throw fail(404, "Document not found.");
      if (d.file_id) await freshFile(d.file_id, doc.student_id, c);
      const next = student ? (d.file_id && doc.status !== "shared" ? "submitted" : null) : d.status;
      await q(
        "INSERT INTO document_comments (id,document_id,author_id,body,file_id,status) VALUES (?,?,?,?,?,?)",
        [randomUUID(), docId, req.actor.id, d.body, d.file_id, next],
        c,
      );
      await q(
        `UPDATE documents SET ${next ? "status=?," : ""}${!student && !doc.reviewer_id ? "reviewer_id=?," : ""}updated_at=UTC_TIMESTAMP() WHERE id=?`,
        [...(next ? [next] : []), ...(!student && !doc.reviewer_id ? [req.actor.id] : []), docId],
        c,
      );
      if (!student && next) await store.audit(req.actor.id, "document_" + next, docId, c);
    });
    res.status(201).json({ ok: true });
  });
  // Staff can withdraw a document (e.g. uploaded by mistake). Files stay for the audit trail.
  app.post("/api/lms/documents/:id/delete", async (req, res) => {
    if (!isStaff(req.actor)) throw fail(403, "Only owners and admins can remove documents.");
    const r = await q("DELETE FROM documents WHERE id=?", [id(req)]);
    if (!r.affectedRows) throw fail(404, "Document not found.");
    await store.audit(req.actor.id, "document_delete", req.params.id);
    res.json({ ok: true });
  });
}
