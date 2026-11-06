// Student files (Phase 4): essays, SOPs, CVs, transcripts and message attachments.
// - Allowlist of types, checked by content (magic bytes), not by the name or the browser's claim.
// - Stored on disk outside the web root under a random id (~/sc-private/files); the original name is only metadata.
// - Downloaded only through a 5-minute link bound to the signed-in user, always as an attachment, never rendered.
// - Every access checks that the user may reach that student (staff, their mentors, the student).
// No free virus scanner runs on Hostinger shared hosting (ClamAV needs its own daemon and ~1 GB RAM), so the
// type allowlist, active-content rejection and attachment-only download are the defence.
import { randomUUID, createHash } from "node:crypto";
import { mkdir, open, stat, unlink } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import express from "express";
import { z } from "zod";
import { canReachStudent, requireCan } from "./access.js";
import { makeToken, readToken } from "./tokens.js";

export const MAX_FILE = 10 * 1024 * 1024;
const STUDENT_QUOTA = 300 * 1024 * 1024;
const LINK_SECONDS = 5 * 60;
export const FILE_TYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
  "image/png": "png",
  "image/jpeg": "jpg",
};
const uuid = z.string().uuid();
const fileDir = (config) => config.FILE_DIR || join(homedir(), "sc-private", "files");
const pathOf = (config, f) => join(fileDir(config), f.id);

/** Union of the feature switches of a student's packages: { messaging, uploads, reviews, live }. */
export async function featuresOf(store, userId, c) {
  const rows = await store.query(
    `SELECT p.features FROM user_packages up JOIN packages p ON p.id=up.package_id
     WHERE up.user_id=? AND p.deleted_at IS NULL AND p.active=1`,
    [userId],
    c,
  );
  const out = { messaging: false, uploads: false, reviews: false, live: false };
  for (const r of rows) {
    const f = typeof r.features === "string" ? JSON.parse(r.features) : r.features || {};
    for (const k of Object.keys(out)) if (f[k] === true) out[k] = true;
  }
  return out;
}

/** Content check. Returns an error message, or null when the bytes really are the claimed type. */
export function checkFile(mime, bytes) {
  const latin = bytes.toString("latin1");
  switch (mime) {
    case "application/pdf":
      if (!latin.startsWith("%PDF-")) return "This isn't a PDF.";
      // Active content inside PDFs (scripts, launch actions, embedded files) is refused.
      if (
        /\/(JavaScript|JS|Launch|EmbeddedFile|RichMedia|OpenAction\s*<<[^>]*\/S\s*\/JavaScript)\b/.test(
          latin,
        )
      )
        return "This PDF contains scripts or embedded files. Export or print it to a plain PDF and try again.";
      return null;
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      if (bytes.readUInt32LE(0) !== 0x04034b50 || !latin.includes("word/"))
        return "This isn't a Word (.docx) document.";
      if (/vbaProject|oleObject|activeX/i.test(latin))
        return "This document contains macros or embedded objects. Save it as a plain .docx and try again.";
      return null;
    case "image/png":
      return bytes
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
        ? null
        : "This isn't a PNG image.";
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
        ? null
        : "This isn't a JPEG image.";
    case "text/plain": {
      if (bytes.includes(0)) return "This isn't a plain text file.";
      try {
        new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        return null;
      } catch {
        return "Text files must be UTF-8.";
      }
    }
    default:
      return "Use PDF, Word (.docx), plain text, PNG or JPEG.";
  }
}

export function installFileRoutes(app, { store, fail, config }) {
  const q = (sql, args, c) => store.query(sql, args, c);

  // Upload into a student's space. ?student=<id>&purpose=message|document
  app.post(
    "/api/lms/files",
    (req, _res, next) => (requireCan(req.actor, "file.upload"), next()),
    express.raw({ type: Object.keys(FILE_TYPES), limit: MAX_FILE }),
    async (req, res) => {
      const studentId = uuid.parse(req.query.student);
      const purpose = z.enum(["message", "document"]).parse(req.query.purpose);
      const mime = String(req.get("Content-Type") || "")
        .split(";")[0]
        .trim();
      if (!FILE_TYPES[mime] || !Buffer.isBuffer(req.body))
        throw fail(415, "Use PDF, Word (.docx), plain text, PNG or JPEG (max 10 MB).");
      if (!req.body.length) throw fail(400, "The file is empty.");
      const problem = checkFile(mime, req.body);
      if (problem) throw fail(415, problem);
      if (store.checkRateLimit && !(await store.checkRateLimit("upload", req.actor.id, 20, 3600)))
        throw fail(429, "Too many uploads. Please wait a little.");
      const name =
        String(req.get("X-File-Name") || "file")
          .replace(/[^\w .()-]/g, "_")
          .slice(0, 150) || "file";
      const id = randomUUID();
      await store
        .transaction(async (c) => {
          const [student] = await q(
            "SELECT id FROM users WHERE id=? AND role='student'",
            [studentId],
            c,
          );
          if (
            !student ||
            !(await canReachStudent(req.actor, studentId, store.query.bind(store), c))
          )
            throw fail(404, "Student not found.");
          if (req.actor.role === "student") {
            const f = await featuresOf(store, studentId, c);
            const allowed = purpose === "message" ? f.messaging : f.uploads || f.reviews;
            if (!allowed) throw fail(403, "File uploads aren't included in your package.");
          }
          const [{ used }] = await q(
            "SELECT COALESCE(SUM(size),0) AS used FROM files WHERE student_id=? AND deleted_at IS NULL FOR UPDATE",
            [studentId],
            c,
          );
          if (Number(used) + req.body.length > STUDENT_QUOTA)
            throw fail(413, "This student's file space (300 MB) is full.");
          await mkdir(fileDir(config), { recursive: true, mode: 0o700 }).catch(() => {
            throw fail(507, "The server can't store files right now.");
          });
          const fh = await open(pathOf(config, { id }), "wx", 0o600);
          try {
            await fh.write(req.body);
          } finally {
            await fh.close();
          }
          await q(
            "INSERT INTO files (id,student_id,uploaded_by,name,mime,size,sha256,purpose) VALUES (?,?,?,?,?,?,?,?)",
            [
              id,
              studentId,
              req.actor.id,
              name,
              mime,
              req.body.length,
              createHash("sha256").update(req.body).digest("hex"),
              purpose,
            ],
            c,
          );
          await store.audit(req.actor.id, "file_upload:" + purpose, studentId, c);
        })
        .catch(async (e) => {
          await unlink(pathOf(config, { id })).catch(() => {});
          throw e;
        });
      res.status(201).json({ id, name, size: req.body.length });
    },
  );

  const reachable = async (actor, fileId, c) => {
    const [f] = await q("SELECT * FROM files WHERE id=? AND deleted_at IS NULL", [fileId], c);
    if (!f || !(await canReachStudent(actor, f.student_id, store.query.bind(store), c)))
      return null;
    // A file attached to a message an admin removed is hidden from everyone but staff.
    if (actor.role !== "owner" && actor.role !== "admin") {
      const [hidden] = await q(
        "SELECT 1 FROM messages WHERE file_id=? AND deleted_at IS NOT NULL LIMIT 1",
        [fileId],
        c,
      );
      if (hidden) return null;
    }
    return f;
  };
  // A 5-minute download link for this user.
  app.get("/api/lms/files/:id", async (req, res) => {
    const f = await reachable(req.actor, uuid.parse(req.params.id));
    if (!f) throw fail(404, "File not found.");
    res.json({
      name: f.name,
      url: "/api/lms/download/" + makeToken({ f: f.id, u: req.actor.id }, LINK_SECONDS),
    });
  });
  app.get("/api/lms/download/:token", async (req, res) => {
    const t = readToken(req.params.token);
    if (!t || t.u !== req.actor.id) throw fail(403, "This download link has expired. Try again.");
    const f = await reachable(req.actor, t.f);
    if (!f) throw fail(404, "File not found.");
    const path = pathOf(config, f);
    const { size } = await stat(path).catch(() => {
      throw fail(404, "File not found.");
    });
    res.set({
      "Content-Type": f.mime,
      "Content-Length": String(size),
      "Content-Disposition": `attachment; filename="${f.name.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'",
      "Cross-Origin-Resource-Policy": "same-origin",
    });
    createReadStream(path).pipe(res);
  });
}
