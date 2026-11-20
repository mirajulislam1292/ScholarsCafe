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
export async function vapidKeys(store, config, generate = webpush.generateVAPIDKeys) {
  const subject = config.VAPID_SUBJECT || "mailto:contact@scholarscafe.com";
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

/** Queues one notification per user. `payload`: { title, body, open, tag }. */
export async function queuePush(store, c, userIds, payload) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return 0;
  const json = JSON.stringify({
    title: preview(payload.title, 60),
    body: preview(payload.body),
    open: payload.open || "",
    tag: payload.tag || "",
  });
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
/** Owners and admins: the only people who may read the contact@ inbox. */
export async function inboxReaderIds(store, c) {
  const rows = await store.query(
    "SELECT id FROM users WHERE active=1 AND role IN ('owner','admin')",
    [],
    c,
  );
  return rows.map((r) => r.id);
}

/**
 * Sends what is queued (up to 100 per run). Push is best effort: a failed send is not retried, but a
 * subscription the push service says is gone (404/410) is deleted at once.
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
  let sent = 0;
  const gone = new Set();
  for (const row of rows)
    for (const s of subs.filter((s) => s.user_id === row.user_id && !gone.has(s.id))) {
      try {
        await send(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          row.payload,
          {
            TTL: 24 * 3600,
            urgency: "high",
            vapidDetails: keys,
            timeout: 10000,
          },
        );
        sent++;
        await store.query("UPDATE push_subscriptions SET last_ok_at=UTC_TIMESTAMP() WHERE id=?", [
          s.id,
        ]);
      } catch (error) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          gone.add(s.id);
          await store.query("DELETE FROM push_subscriptions WHERE id=?", [s.id]);
        } else console.error("Push delivery failed:", error?.statusCode || error?.name);
      }
    }
  return { sent, removed: gone.size };
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
      "SELECT id,device,created_at,last_ok_at,endpoint_hash FROM push_subscriptions WHERE user_id=? ORDER BY created_at DESC",
      [req.actor.id],
    );
    res.json({
      publicKey,
      devices: devices.map((d) => ({
        id: d.id,
        device: d.device,
        created_at: d.created_at,
        last_ok_at: d.last_ok_at,
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
    await queuePush(store, undefined, [req.actor.id], {
      title: "Notifications are on",
      body: "This is how Scholars Cafe Studio will let you know about new messages.",
      open: "Notifications",
      tag: "test",
    });
    res.json({ ok: true });
  });
}
