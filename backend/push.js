// Web Push for the installable admin app (free: the browser vendors' push services + the web-push package).
// - VAPID keys are made on first start and kept in the settings table; VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY
//   env vars override them. Nothing to paste.
// - Events queue rows in push_outbox inside their own transaction; the admin app sends them (server.js).
// - Payloads carry a title, a short preview and the screen to open. Never whole messages or emails.
// - Dead subscriptions (404/410 from the push service) are deleted.
import { createHash, randomUUID } from "node:crypto";
import * as webpush from "web-push";
import { z } from "zod";

export const STAFF = ["owner", "admin", "editor", "mentor"];
const PREVIEW = 90;
export const preview = (s, n = PREVIEW) => {
  const t = String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
};
export const nameOf = (email) => String(email || "").split("@")[0];

let cached = null;
/** { publicKey, privateKey, subject }: env vars first, then the stored pair, else a new pair is stored. */
/** Apple and Google reject a VAPID subject that is not a real mailto: or https: URL (403 BadJwtToken). */
export const DEFAULT_SUBJECT = "mailto:contact@scholarscafe.com";
export const subjectOk = (s) =>
  /^mailto:[^@\s/]+@[^@\s/]+\.[a-z]{2,}$/i.test(String(s || "")) ||
  /^https:\/\/(?!localhost)[^\s/]+\.[a-z]{2,}(\/\S*)?$/i.test(String(s || ""));
export async function vapidKeys(store, config, generate = webpush.generateVAPIDKeys) {
  const wanted = String(config.VAPID_SUBJECT || "").trim();
  if (wanted && !subjectOk(wanted))
    console.error("VAPID_SUBJECT is not a valid mailto:/https: URL; using " + DEFAULT_SUBJECT);
  const subject = wanted && subjectOk(wanted) ? wanted : DEFAULT_SUBJECT;
  if (config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY)
    return {
      publicKey: config.VAPID_PUBLIC_KEY.trim(),
      privateKey: config.VAPID_PRIVATE_KEY.trim(),
      subject,
    };
  if (cached?.store === store) return cached.keys;
  const read = async () =>
    (await store.query("SELECT value FROM settings WHERE name='vapid_keys'"))[0]?.value;
  let value = await read();
  if (!value) {
    const k = generate();
    // INSERT IGNORE: if two processes start together, both end up using the first stored pair.
    await store.query("INSERT IGNORE INTO settings (name,value) VALUES ('vapid_keys',?)", [
      `${k.publicKey}.${k.privateKey}`,
    ]);
    value = await read();
  }
  const [publicKey, privateKey] = String(value).split(".");
  const keys = { publicKey, privateKey, subject };
  cached = { store, keys };
  return keys;
}

// Called (debounced) after something is queued, so pushes go out in about a second, not on the next tick.
let kicker = null;
let kickTimer = null;
export const onPushQueued = (fn) => {
  kicker = fn;
};
function kick() {
  if (!kicker || kickTimer) return;
  kickTimer = setTimeout(() => {
    kickTimer = null;
    kicker();
  }, 800);
  kickTimer.unref?.();
}

/**
 * Queues one notification per user, and keeps it as an alert for the bell in the header (and the app
 * icon badge count). `payload`: { title, body, open, tag }.
 */
export async function queuePush(store, c, userIds, payload) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return 0;
  const title = preview(payload.title, 60);
  const body = preview(payload.body);
  const open = String(payload.open || "").slice(0, 40);
  const json = JSON.stringify({ title, body, open, tag: payload.tag || "" });
  await store.query(
    `INSERT INTO staff_alerts (user_id,title,body,open) VALUES ${ids.map(() => "(?,?,?,?)").join(",")}`,
    ids.flatMap((id) => [id, title, body, open]),
    c,
  );
  await store.query(
    `INSERT INTO push_outbox (user_id,payload) VALUES ${ids.map(() => "(?,?)").join(",")}`,
    ids.flatMap((id) => [id, json]),
    c,
  );
  kick();
  return ids.length;
}
/** Every active staff member except `except` (the person who caused the event). */
export async function staffIds(store, c, except) {
  const rows = await store.query(
    "SELECT id FROM users WHERE active=1 AND role IN ('owner','admin','editor','mentor') AND id<>?",
    [except || ""],
    c,
  );
  return rows.map((r) => r.id);
}
/** Owners and admins: the only people who may read the contact@ inbox (and every lead). */
export async function inboxReaderIds(store, c) {
  const rows = await store.query(
    "SELECT id FROM users WHERE active=1 AND role IN ('owner','admin')",
    [],
    c,
  );
  return rows.map((r) => r.id);
}

/** Unread alert counts per user (the number on the app icon). */
async function unreadCounts(store, users) {
  if (!users.length) return {};
  const rows = await store.query(
    `SELECT user_id,COUNT(*) AS n FROM staff_alerts WHERE read_at IS NULL AND user_id IN (${users.map(() => "?").join(",")}) GROUP BY user_id`,
    users,
  );
  return Object.fromEntries((rows || []).map((r) => [r.user_id, Number(r.n)]));
}
const OPTIONS = (keys) => ({ TTL: 24 * 3600, urgency: "high", vapidDetails: keys, timeout: 10000 });
const hostOf = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};
/**
 * Sends one payload to one device and records the push service's answer on the subscription.
 * 404/410 (gone) deletes it. Returns { ok, status, body } with the service's reply (for "Send a test").
 */
async function sendOne(store, s, payload, keys, send) {
  try {
    const r = await send(
      { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
      payload,
      OPTIONS(keys),
    );
    await store.query(
      "UPDATE push_subscriptions SET last_ok_at=UTC_TIMESTAMP(),last_status=?,last_error=NULL WHERE id=?",
      [r?.statusCode || 201, s.id],
    );
    return { ok: true, status: r?.statusCode || 201, body: String(r?.body || "").slice(0, 200) };
  } catch (error) {
    const status = error?.statusCode || 0;
    const body = String(error?.body || error?.message || error?.name || "")
      .replace(/\s+/g, " ")
      .slice(0, 200);
    if (status === 404 || status === 410) {
      await store.query("DELETE FROM push_subscriptions WHERE id=?", [s.id]);
    } else {
      await store.query("UPDATE push_subscriptions SET last_status=?,last_error=? WHERE id=?", [
        status || null,
        body || "Network error",
        s.id,
      ]);
      // e.g. "Push delivery failed: 403 web.push.apple.com BadJwtToken" (never the payload or keys).
      console.error("Push delivery failed:", status || "network", hostOf(s.endpoint), body);
    }
    return { ok: false, status, body, gone: status === 404 || status === 410 };
  }
}

/**
 * Sends what is queued (up to 100 per run). Push is best effort: a failed send is not retried, but a
 * subscription the push service says is gone (404/410) is deleted at once. Each payload carries the
 * person's unread count so the service worker can set the app icon badge.
 */
export async function deliverPush(store, config, send = webpush.sendNotification) {
  const rows = await store.query(
    "SELECT id,user_id,payload FROM push_outbox ORDER BY id LIMIT 100",
  );
  if (!rows.length) return { sent: 0, removed: 0 };
  await store.query(
    `DELETE FROM push_outbox WHERE id IN (${rows.map(() => "?").join(",")})`,
    rows.map((r) => r.id),
  );
  const keys = await vapidKeys(store, config);
  const users = [...new Set(rows.map((r) => r.user_id))];
  const subs = await store.query(
    `SELECT id,user_id,endpoint,p256dh,auth FROM push_subscriptions WHERE user_id IN (${users.map(() => "?").join(",")})`,
    users,
  );
  const unread = await unreadCounts(store, users);
  let sent = 0;
  const gone = new Set();
  for (const row of rows) {
    let payload = row.payload;
    try {
      payload = JSON.stringify({ ...JSON.parse(row.payload), badge: unread[row.user_id] || 1 });
    } catch {}
    for (const s of subs.filter((s) => s.user_id === row.user_id && !gone.has(s.id))) {
      const r = await sendOne(store, s, payload, keys, send);
      if (r.ok) sent++;
      if (r.gone) gone.add(s.id);
    }
  }
  return { sent, removed: gone.size };
}

/** "Send a test": straight to every device of this person, returning each push service's answer. */
export async function sendTest(store, config, userId, send = webpush.sendNotification) {
  const keys = await vapidKeys(store, config);
  await store.query("INSERT INTO staff_alerts (user_id,title,body,open) VALUES (?,?,?,?)", [
    userId,
    "Notifications are on",
    "This is a test from Scholars Cafe Studio.",
    "Notifications",
  ]);
  const unread = await unreadCounts(store, [userId]);
  const payload = JSON.stringify({
    title: "Notifications are on",
    body: "This is a test from Scholars Cafe Studio.",
    open: "Notifications",
    tag: "test",
    badge: unread[userId] || 1,
  });
  const subs = await store.query(
    "SELECT id,user_id,endpoint,p256dh,auth,device FROM push_subscriptions WHERE user_id=?",
    [userId],
  );
  const results = [];
  for (const s of subs)
    results.push({
      device: s.device || "Device",
      service: hostOf(s.endpoint),
      ...(await sendOne(store, s, payload, keys, send)),
    });
  return { subject: keys.subject, results };
}

// Only the real browser push services: an endpoint is a URL the server will POST to, so no other hosts.
const PUSH_HOSTS = [
  /^fcm\.googleapis\.com$/,
  /^android\.googleapis\.com$/,
  /(^|\.)push\.services\.mozilla\.com$/,
  /(^|\.)notify\.windows\.com$/,
  /(^|\.)push\.apple\.com$/,
];
export const pushEndpointOk = (url) => {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && !u.port && PUSH_HOSTS.some((h) => h.test(u.hostname));
  } catch {
    return false;
  }
};
const endpointHash = (e) => createHash("sha256").update(e).digest("hex");

export function installPushRoutes(app, { store, fail, config }) {
  const staffOnly = (req) => {
    if (!STAFF.includes(req.actor.role)) throw fail(403, "Notifications are for staff only.");
  };
  app.get("/api/push", async (req, res) => {
    staffOnly(req);
    const { publicKey } = await vapidKeys(store, config);
    const devices = await store.query(
      "SELECT id,device,created_at,last_ok_at,last_status,last_error,endpoint,endpoint_hash FROM push_subscriptions WHERE user_id=? ORDER BY created_at DESC",
      [req.actor.id],
    );
    res.json({
      publicKey,
      devices: devices.map((d) => ({
        id: d.id,
        device: d.device,
        created_at: d.created_at,
        last_ok_at: d.last_ok_at,
        last_status: d.last_status ?? null,
        last_error: d.last_error ?? null,
        service: hostOf(d.endpoint),
        key: d.endpoint_hash.slice(0, 16),
      })),
    });
  });
  const subscription = z
    .object({
      endpoint: z.string().max(1000).refine(pushEndpointOk, "Unsupported push service."),
      keys: z.object({ p256dh: z.string().min(20).max(200), auth: z.string().min(8).max(100) }),
      expirationTime: z.number().nullable().optional(),
      device: z.string().trim().max(120).default(""),
    })
    .strict();
  app.post("/api/push/subscribe", async (req, res) => {
    staffOnly(req);
    const s = subscription.parse(req.body);
    const h = endpointHash(s.endpoint);
    // One row per device (endpoint). Signing in as someone else on the same device moves it to them.
    await store.query(
      "INSERT INTO push_subscriptions (id,user_id,endpoint_hash,endpoint,p256dh,auth,device) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE user_id=VALUES(user_id),p256dh=VALUES(p256dh),auth=VALUES(auth),device=VALUES(device)",
      [randomUUID(), req.actor.id, h, s.endpoint, s.keys.p256dh, s.keys.auth, s.device],
    );
    res.status(201).json({ ok: true, key: h.slice(0, 16) });
  });
  app.post("/api/push/unsubscribe", async (req, res) => {
    staffOnly(req);
    const input = z
      .object({ endpoint: z.string().max(1000).optional(), id: z.string().uuid().optional() })
      .strict()
      .parse(req.body);
    if (!input.endpoint && !input.id) throw fail(400, "Choose a device.");
    await store.query(
      input.id
        ? "DELETE FROM push_subscriptions WHERE id=? AND user_id=?"
        : "DELETE FROM push_subscriptions WHERE endpoint_hash=? AND user_id=?",
      [input.id || endpointHash(input.endpoint), req.actor.id],
    );
    res.json({ ok: true });
  });
  app.post("/api/push/test", async (req, res) => {
    staffOnly(req);
    if (store.checkRateLimit && !(await store.checkRateLimit("push_test", req.actor.id, 5, 300)))
      throw fail(429, "Wait a few minutes before sending another test.");
    // Sent now (not queued) so the screen can show exactly what Apple/Google/Mozilla answered.
    res.json(await sendTest(store, config, req.actor.id, config.pushSend));
  });

  // ---------- The bell: recent alerts for this person ----------
  app.get("/api/push/alerts", async (req, res) => {
    staffOnly(req);
    const items = await store.query(
      "SELECT id,title,body,open,read_at,created_at FROM staff_alerts WHERE user_id=? ORDER BY id DESC LIMIT 20",
      [req.actor.id],
    );
    const [count] = await store.query(
      "SELECT COUNT(*) AS n FROM staff_alerts WHERE user_id=? AND read_at IS NULL",
      [req.actor.id],
    );
    res.json({
      unread: Number(count?.n || 0),
      items: items.map((a) => ({
        id: Number(a.id),
        title: a.title,
        body: a.body,
        open: a.open,
        read: Boolean(a.read_at),
        created_at: a.created_at,
      })),
    });
  });
  // Marks alerts read: all of them (bell opened), or those for one screen (that screen was opened).
  app.post("/api/push/alerts/read", async (req, res) => {
    staffOnly(req);
    const { open } = z
      .object({ open: z.string().max(40).optional() })
      .strict()
      .parse(req.body);
    await store.query(
      `UPDATE staff_alerts SET read_at=UTC_TIMESTAMP() WHERE user_id=? AND read_at IS NULL${open ? " AND open=?" : ""}`,
      open ? [req.actor.id, open] : [req.actor.id],
    );
    const [count] = await store.query(
      "SELECT COUNT(*) AS n FROM staff_alerts WHERE user_id=? AND read_at IS NULL",
      [req.actor.id],
    );
    res.json({ ok: true, unread: Number(count?.n || 0) });
  });
}
