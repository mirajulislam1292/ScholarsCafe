// Private videos (Phase 3). Files live on disk OUTSIDE the web root (default ~/sc-private/videos, shared by the
// admin and student apps because both run as the same hosting user). Staff upload in 5 MB chunks; students only
// get a short-lived play link that is tied to their own session and re-checked on every byte-range request.
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, open, stat, unlink } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import express from "express";
import { z } from "zod";
import { requireCan } from "./access.js";

export const CHUNK = 5 * 1024 * 1024;
const MAX_VIDEO = 2 * 1024 * 1024 * 1024; // 2 GB per file (about 3 hours at 720p)
const QUOTA = 30 * 1024 * 1024 * 1024; // all videos together; the Business plan has 50 GB of disk
const TYPES = { "video/mp4": "mp4", "video/webm": "webm" };
const LINK_SECONDS = 10 * 60;
const uuid = z.string().uuid();
const startInput = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .transform((s) => s.replace(/[^\w .()-]/g, "_")),
    size: z.number().int().min(16).max(MAX_VIDEO),
    mime: z.enum(Object.keys(TYPES)),
  })
  .strict();

export const videoDir = (config) => config.VIDEO_DIR || join(homedir(), "sc-private", "videos");
const fileOf = (config, video) => join(videoDir(config), `${video.id}.${TYPES[video.mime]}`);

// ---------- Play links: HMAC over {video, user, what, exp}. The key lives only in this process. ----------
const KEY = randomBytes(32);
const sign = (payload) => createHmac("sha256", KEY).update(payload).digest("base64url");
export function playLink(videoId, userId, kind, refId, now = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({
      v: videoId,
      u: userId,
      k: kind,
      r: refId,
      e: Math.floor(now / 1000) + LINK_SECONDS,
    }),
  ).toString("base64url");
  return "/api/lms/stream/" + payload + "." + sign(payload);
}
export function readLink(token, now = Date.now()) {
  const [payload, mac] = String(token).split(".");
  if (!payload || !mac) return null;
  const want = Buffer.from(sign(payload));
  const got = Buffer.from(mac);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.e * 1000 > now ? data : null;
  } catch {
    return null;
  }
}

/** Streams a file with HTTP Range support (Safari needs it; seeking uses it). */
async function sendFile(req, res, path, mime) {
  const { size } = await stat(path);
  res.set({
    "Content-Type": mime,
    "Cache-Control": "private, no-store",
    "Content-Disposition": "inline",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  });
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.get("Range") || "");
  let start = 0,
    end = size - 1;
  if (range && (range[1] || range[2])) {
    start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start > end || start >= size) {
      res.status(416).set("Content-Range", `bytes */${size}`).end();
      return;
    }
    res.status(206).set("Content-Range", `bytes ${start}-${end}/${size}`);
  }
  res.set("Content-Length", String(end - start + 1));
  if (req.method === "HEAD") return void res.end();
  createReadStream(path, { start, end }).pipe(res);
}

/**
 * `allowed(kind, refId, actor)` re-checks access for each stream request (lesson or resource still open to this user).
 */
export function installVideoRoutes(app, { store, fail, config, allowed }) {
  const q = (sql, args, c) => store.query(sql, args, c);
  const id = (req) => uuid.parse(req.params.id);

  // Ready videos, for the lesson and resource pickers.
  app.get("/api/videos", async (req, res) => {
    requireCan(req.actor, "resource.write");
    res.json({
      items: await q(
        "SELECT id,name,mime,size,created_at FROM videos WHERE status='ready' ORDER BY created_at DESC LIMIT 500",
      ),
    });
  });
  app.post("/api/videos", async (req, res) => {
    requireCan(req.actor, "resource.write");
    const d = startInput.parse(req.body);
    const video = { id: randomUUID(), mime: d.mime };
    // Abandoned uploads (unfinished after a day) are removed so they don't hold disk or quota.
    const stale = await q(
      "SELECT id,mime FROM videos WHERE status='uploading' AND created_at < UTC_TIMESTAMP() - INTERVAL 1 DAY",
    );
    for (const v of stale) {
      await unlink(fileOf(config, v)).catch(() => {});
      await q("DELETE FROM videos WHERE id=? AND status='uploading'", [v.id]);
    }
    try {
      await mkdir(videoDir(config), { recursive: true, mode: 0o700 });
      await (await open(fileOf(config, video), "w", 0o600)).close();
    } catch {
      throw fail(507, "The server can't store videos right now (storage folder not writable).");
    }
    await store.transaction(async (c) => {
      const [{ used }] = await q(
        "SELECT COALESCE(SUM(size),0) AS used FROM videos FOR UPDATE",
        [],
        c,
      );
      if (Number(used) + d.size > QUOTA) {
        await unlink(fileOf(config, video)).catch(() => {});
        throw fail(413, "Video storage is full (30 GB). Delete unused videos first.");
      }
      await q(
        "INSERT INTO videos (id,name,mime,size,created_by) VALUES (?,?,?,?,?)",
        [video.id, d.name, d.mime, d.size, req.actor.id],
        c,
      );
    });
    res.status(201).json({ id: video.id, chunk: CHUNK });
  });
  // One chunk at the exact next offset (X-Offset), so a retried or out-of-order chunk can't corrupt the file.
  app.post(
    "/api/videos/:id/chunk",
    (req, _res, next) => (requireCan(req.actor, "resource.write"), next()),
    express.raw({ type: "application/octet-stream", limit: CHUNK + 1024 }),
    async (req, res) => {
      const videoId = id(req);
      const offset = Number(req.get("X-Offset"));
      if (!Buffer.isBuffer(req.body) || !req.body.length) throw fail(400, "Empty chunk.");
      const received = await store.transaction(async (c) => {
        const [v] = await q("SELECT * FROM videos WHERE id=? FOR UPDATE", [videoId], c);
        if (!v || v.status !== "uploading") throw fail(404, "Upload not found.");
        if (offset !== Number(v.received)) throw fail(409, "Resume from byte " + v.received + ".");
        if (offset + req.body.length > Number(v.size)) throw fail(400, "More data than announced.");
        const f = await open(fileOf(config, v), "r+");
        try {
          await f.write(req.body, 0, req.body.length, offset);
        } finally {
          await f.close();
        }
        await q("UPDATE videos SET received=? WHERE id=?", [offset + req.body.length, videoId], c);
        return offset + req.body.length;
      });
      res.json({ received });
    },
  );
  app.post("/api/videos/:id/complete", async (req, res) => {
    requireCan(req.actor, "resource.write");
    const videoId = id(req);
    await store.transaction(async (c) => {
      const [v] = await q("SELECT * FROM videos WHERE id=? FOR UPDATE", [videoId], c);
      if (!v || v.status !== "uploading") throw fail(404, "Upload not found.");
      if (Number(v.received) !== Number(v.size)) throw fail(409, "The upload is not finished yet.");
      const head = Buffer.alloc(16);
      const f = await open(fileOf(config, v), "r");
      try {
        await f.read(head, 0, 16, 0);
      } finally {
        await f.close();
      }
      const ok =
        v.mime === "video/mp4"
          ? head.subarray(4, 8).toString("latin1") === "ftyp"
          : head.readUInt32BE(0) === 0x1a45dfa3;
      if (!ok) {
        await unlink(fileOf(config, v)).catch(() => {});
        await q("DELETE FROM videos WHERE id=?", [videoId], c);
        throw fail(415, "This file isn't a playable MP4 or WebM video.");
      }
      await q("UPDATE videos SET status='ready' WHERE id=?", [videoId], c);
      await store.audit(req.actor.id, "upload_video", v.name, c);
    });
    res.json({ ok: true });
  });
  app.post("/api/videos/:id/delete", async (req, res) => {
    requireCan(req.actor, "resource.write");
    const videoId = id(req);
    await store.transaction(async (c) => {
      const [v] = await q("SELECT * FROM videos WHERE id=? FOR UPDATE", [videoId], c);
      if (!v) throw fail(404, "Video not found.");
      const [{ n }] = await q(
        `SELECT (SELECT COUNT(*) FROM lms_lessons WHERE video_id=?)
              + (SELECT COUNT(*) FROM student_resources WHERE video_id=? AND deleted_at IS NULL) AS n`,
        [videoId, videoId],
        c,
      );
      if (Number(n)) throw fail(409, "This video is still used by a lesson or resource.");
      await q("DELETE FROM videos WHERE id=?", [videoId], c);
      await unlink(fileOf(config, v)).catch(() => {});
      await store.audit(req.actor.id, "video_delete", v.name, c);
    });
    res.json({ ok: true });
  });

  // Playback. The link must be for this signed-in user, unexpired, and the lesson/resource must still be open to them.
  app.get("/api/lms/stream/:token", async (req, res) => {
    const link = readLink(req.params.token);
    if (!link || link.u !== req.actor.id)
      throw fail(403, "This video link has expired. Reload the page.");
    if (!(await allowed(link.k, link.r, req.actor)))
      throw fail(403, "You no longer have access to this video.");
    const [v] = await q("SELECT id,mime FROM videos WHERE id=? AND status='ready'", [link.v]);
    if (!v) throw fail(404, "Video not found.");
    await sendFile(req, res, fileOf(config, v), v.mime).catch((e) => {
      if (e.code === "ENOENT") throw fail(404, "Video file not found.");
      throw e;
    });
  });
}
