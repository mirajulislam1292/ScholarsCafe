import sharp from "sharp";
import { randomUUID } from "node:crypto";
import express from "express";
import { canPublish } from "./security.js";

const fail = (status, message) => Object.assign(new Error(message), { status });
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];
const MAX_VIDEO = 12 * 1024 * 1024;
const QUOTA = 250 * 1024 * 1024;

/** Check the file's real signature, not just the declared type. */
function videoSignatureOk(type, bytes) {
  if (bytes.length < 16) return false;
  if (type === "video/mp4") return bytes.subarray(4, 8).toString("latin1") === "ftyp";
  if (type === "video/webm") return bytes.readUInt32BE(0) === 0x1a45dfa3;
  return false;
}

export function installMedia(app, store, config, limit) {
  // Registered after authentication and CSRF verification. No untrusted file paths.
  app.get("/api/media", async (_req, res) => {
    const items = await store.query(
      "SELECT id,name,size,mime,visibility,created_at FROM media ORDER BY created_at DESC LIMIT 200",
    );
    res.json({
      items: items.map((item) => ({
        ...item,
        url:
          item.visibility === "private" ? null : config.ADMIN_ORIGIN + "/public/media/" + item.id,
      })),
    });
  });
  app.post(
    "/api/media",
    (req, _res, next) => {
      if (!canPublish(req.actor.role)) throw fail(403, "Only owners and admins can upload media.");
      const type = req.get("Content-Type") || "";
      if (![...IMAGE_TYPES, ...VIDEO_TYPES].includes(type))
        throw fail(415, "Choose a PNG, JPEG or WebP image, or an MP4 or WebM video.");
      next();
    },
    limit,
    express.raw({ type: [...IMAGE_TYPES, ...VIDEO_TYPES], limit: "12mb" }),
    async (req, res) => {
      if (!Buffer.isBuffer(req.body) || !req.body.length) throw fail(400, "Choose a file.");
      const type = req.get("Content-Type");
      let bytes;
      let mime;
      if (VIDEO_TYPES.includes(type)) {
        if (req.body.length > MAX_VIDEO) throw fail(413, "Videos must be 12 MB or smaller.");
        if (!videoSignatureOk(type, req.body))
          throw fail(415, "The video could not be read. Use MP4 (H.264) or WebM.");
        bytes = req.body; // stored as uploaded; never executed or transformed
        mime = type;
      } else {
        if (req.body.length > 5 * 1024 * 1024) throw fail(413, "Images must be 5 MB or smaller.");
        try {
          const image = sharp(req.body, {
            limitInputPixels: 16000000,
            animated: false,
            failOn: "warning",
          });
          const info = await image.metadata();
          if (!["png", "jpeg", "webp"].includes(info.format) || (info.pages || 1) > 1)
            throw Error("format");
          // Re-encode and remove metadata; never serve the original upload.
          bytes = await image
            .rotate()
            .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
            .webp({ quality: 88 })
            .toBuffer();
        } catch {
          throw fail(
            415,
            "The image could not be read. Use a static PNG, JPEG or WebP under 16 megapixels.",
          );
        }
        if (bytes.length > 4 * 1024 * 1024) throw fail(413, "Please choose a smaller image.");
        mime = "image/webp";
      }
      const id = randomUUID();
      // Lesson videos are uploaded as private: never on the public route, only to enrolled students.
      const visibility = req.get("X-Visibility") === "private" ? "private" : "public";
      const name = String(req.get("X-File-Name") || "File")
        .replace(/[\x00-\x1f\x7f]/g, "")
        .slice(0, 200);
      await store.transaction(async (c) => {
        const [actor] = await store.query(
          "SELECT role,active FROM users WHERE id=? FOR UPDATE",
          [req.actor.id],
          c,
        );
        if (!actor?.active || !canPublish(actor.role))
          throw fail(403, "Upload access was removed.");
        // A single locked quota row serializes concurrent uploads across all admins.
        const [quota] = await store.query(
          "SELECT used_bytes FROM media_quota WHERE id=1 FOR UPDATE",
          [],
          c,
        );
        if (!quota || Number(quota.used_bytes) + bytes.length > QUOTA)
          throw fail(413, "The 250 MB media library is full.");
        await store.query(
          "INSERT INTO media (id,name,bytes,size,actor_id,mime,visibility) VALUES (?,?,?,?,?,?,?)",
          [id, name, bytes, bytes.length, req.actor.id, mime, visibility],
          c,
        );
        await store.query(
          "UPDATE media_quota SET used_bytes=used_bytes+? WHERE id=1",
          [bytes.length],
          c,
        );
        await store.audit(
          req.actor.id,
          mime.startsWith("video") ? "upload_video" : "upload_image",
          id,
          c,
        );
      });
      res.status(201).json({
        id,
        url: visibility === "private" ? null : config.ADMIN_ORIGIN + "/public/media/" + id,
        mime,
        visibility,
      });
    },
  );
}

export function serveMedia(app, store) {
  app.get("/public/media/:id", async (req, res) => {
    if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(req.params.id))
      throw fail(404, "Not found.");
    const [file] = await store.query(
      "SELECT bytes,mime FROM media WHERE id=? AND visibility='public'",
      [req.params.id],
    );
    if (!file) throw fail(404, "Not found.");
    const mime = [...IMAGE_TYPES, ...VIDEO_TYPES].includes(file.mime) ? file.mime : "image/webp";
    const bytes = file.bytes;
    res.set({
      "Content-Type": mime,
      "Cache-Control": "public,max-age=31536000,immutable",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes",
    });
    sendBytes(req, res, bytes);
  });
}

/** Sends a stored file, answering HTTP Range requests (Safari needs them for video; seeking uses them). */
export function sendBytes(req, res, bytes) {
  // Byte ranges: required by Safari to play video, also lets browsers seek.
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.get("Range") || "");
  if (range && (range[1] || range[2])) {
    let start = range[1] ? Number(range[1]) : bytes.length - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : bytes.length - 1;
    start = Math.max(0, start);
    end = Math.min(end, bytes.length - 1);
    if (start > end) return res.status(416).set("Content-Range", `bytes */${bytes.length}`).end();
    return res
      .status(206)
      .set("Content-Range", `bytes ${start}-${end}/${bytes.length}`)
      .send(bytes.subarray(start, end + 1));
  }
  res.send(bytes);
}
