// ECA alerts: a sign-up list on scholarscafe.com/resources/eca, and a "send to everyone" button in the admin.
// Every alert goes through the mail_outbox worker (never sent directly), one row per subscriber, spaced out
// so a big list doesn't hit the mailbox's sending limit or hold up team notifications.
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { sender } from "./mail.js";

/** Seconds between two alert emails in the outbox (the worker sends at most one every 15 seconds). */
export const ECA_GAP_SECONDS = 30;
const ROWS_PER_INSERT = 200;

const tokenSchema = z.string().regex(/^[0-9a-f]{64}$/);
export const unsubscribeUrl = (config, t) =>
  config.ADMIN_ORIGIN + "/public/unsubscribe/eca?t=" + encodeURIComponent(t);

/** The plain-text email each subscriber gets: the team's message plus a one-click unsubscribe footer. */
export function alertBody(body, url) {
  return (
    body.trim() +
    "\n\n--\nYou get this email because you asked Scholars Cafe to tell you about new ECAs." +
    "\nUnsubscribe with one click: " +
    url +
    "\n"
  );
}

// A tiny page for the unsubscribe link (no scripts, no inline styles: the admin's CSP forbids both).
const page = (title, text, form = "") =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><link rel="stylesheet" href="/style.css"></head><body><main class="card unsubscribe"><h1>${title}</h1><p>${text}</p>${form}<p><a href="https://scholarscafe.com/resources/eca">Back to Scholars Cafe</a></p></main></body></html>`;

/** Public routes. The origin check, rate limits, Turnstile and JSON-only rules for /public/eca-alerts are the
 * shared ones in app.js (same as the newsletter). The unsubscribe link has no origin: its random token is the key. */
export function installEcaPublicRoutes(app, { store, sharedLimit, config }) {
  app.post("/public/eca-alerts", async (req, res) => {
    const data = z
      .object({
        email: z
          .string()
          .trim()
          .email()
          .max(254)
          .transform((s) => s.toLowerCase()),
        consent: z.literal(true),
        website: z.string().max(200).optional(),
      })
      .strict()
      .parse(req.body);
    // Honeypot filled in: pretend it worked.
    if (data.website) return res.status(201).json({ ok: true });
    // Signing up again after unsubscribing turns alerts back on (with a fresh consent time).
    await store.query(
      "INSERT INTO eca_subscribers (id,email,token,consent_at) VALUES (?,?,?,UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE consent_at=IF(unsubscribed_at IS NULL,consent_at,UTC_TIMESTAMP()),unsubscribed_at=NULL",
      [randomUUID(), data.email, randomBytes(32).toString("hex")],
    );
    // Same answer whether or not the address was already on the list.
    res.status(201).json({ ok: true });
  });

  const limit = sharedLimit("unsubscribe", 60, 3600);
  const tokenOf = (req) => {
    const parsed = tokenSchema.safeParse(req.query.t);
    return parsed.success ? parsed.data : null;
  };
  // GET only shows a button, so link scanners in mail apps can't unsubscribe people by opening the link.
  app.get("/public/unsubscribe/eca", limit, (req, res) => {
    const t = tokenOf(req);
    res.type("html");
    if (!t)
      return res
        .status(400)
        .send(
          page(
            "Link not valid",
            "This unsubscribe link is incomplete. Copy the whole link from the email.",
          ),
        );
    res.send(
      page(
        "Stop ECA alerts?",
        "You'll stop getting emails about new ECAs from Scholars Cafe.",
        `<form method="post" action="/public/unsubscribe/eca?t=${t}"><button type="submit" class="primary">Unsubscribe</button></form>`,
      ),
    );
  });
  // The button above, and mail apps' own "Unsubscribe" (RFC 8058 one-click POST), land here.
  app.post("/public/unsubscribe/eca", limit, async (req, res) => {
    const t = tokenOf(req);
    res.type("html");
    if (!t)
      return res
        .status(400)
        .send(
          page(
            "Link not valid",
            "This unsubscribe link is incomplete. Copy the whole link from the email.",
          ),
        );
    await store.transaction(async (c) => {
      await store.query(
        "UPDATE eca_subscribers SET unsubscribed_at=UTC_TIMESTAMP() WHERE token=? AND unsubscribed_at IS NULL",
        [t],
        c,
      );
      // Alerts still waiting in the queue for this person are dropped too.
      await store.query(
        "DELETE FROM mail_outbox WHERE sent_at IS NULL AND unsubscribe_url=?",
        [unsubscribeUrl(config, t)],
        c,
      );
    });
    // Same page whether or not the token matched, so the link can't be used to probe the list.
    res.send(page("You're unsubscribed", "You won't get any more ECA alerts from us."));
  });
}

/** Admin routes (team admin only). Owners and admins can see the list and send; editors and mentors cannot. */
export function installEcaAdminRoutes(app, { store, fail, canPublish, config }) {
  const allowed = (req) => {
    if (!canPublish(req.actor.role)) throw fail(403, "ECA alerts are for owners and admins.");
  };
  app.get("/api/eca/subscribers", async (req, res) => {
    allowed(req);
    const items = await store.query(
      "SELECT id,email,consent_at,unsubscribed_at,created_at FROM eca_subscribers ORDER BY created_at DESC LIMIT 2000",
    );
    res.json({
      active: items.filter((s) => !s.unsubscribed_at).length,
      items,
      from: sender(config),
      mailConnected: Boolean(config.SMTP_PASSWORD),
      gapSeconds: ECA_GAP_SECONDS,
    });
  });
  app.post("/api/eca/subscribers/:id/remove", async (req, res) => {
    allowed(req);
    const id = z.string().uuid().safeParse(req.params.id);
    if (!id.success) throw fail(404, "Subscriber not found.");
    await store.transaction(async (c) => {
      const [row] = await store.query(
        "SELECT token FROM eca_subscribers WHERE id=? FOR UPDATE",
        [id.data],
        c,
      );
      if (!row) throw fail(404, "Subscriber not found.");
      await store.query(
        "DELETE FROM mail_outbox WHERE sent_at IS NULL AND unsubscribe_url=?",
        [unsubscribeUrl(config, row.token)],
        c,
      );
      await store.query("DELETE FROM eca_subscribers WHERE id=?", [id.data], c);
      await store.audit(req.actor.id, "eca_subscriber_remove", id.data, c);
    });
    res.json({ ok: true });
  });
  app.post("/api/eca/broadcast", async (req, res) => {
    allowed(req);
    const data = z
      .object({
        subject: z.string().trim().min(3).max(150),
        body: z.string().trim().min(10).max(20000),
      })
      .strict()
      .parse(req.body);
    const queued = await store.transaction(async (c) => {
      const subs = await store.query(
        "SELECT email,token FROM eca_subscribers WHERE unsubscribed_at IS NULL ORDER BY created_at",
        [],
        c,
      );
      if (!subs.length) throw fail(400, "Nobody has signed up for ECA alerts yet.");
      for (let start = 0; start < subs.length; start += ROWS_PER_INSERT) {
        const chunk = subs.slice(start, start + ROWS_PER_INSERT);
        const args = [];
        chunk.forEach((s, i) => {
          const url = unsubscribeUrl(config, s.token);
          args.push(
            randomUUID(),
            data.subject,
            alertBody(data.body, url),
            "contact@scholarscafe.com",
            s.email,
            url,
            // Spaced out: the first goes at once, then one every ECA_GAP_SECONDS.
            (start + i) * ECA_GAP_SECONDS,
          );
        });
        await store.query(
          "INSERT INTO mail_outbox (id,subject,body,reply_to,to_email,unsubscribe_url,next_attempt_at) VALUES " +
            chunk.map(() => "(?,?,?,?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL ? SECOND))").join(","),
          args,
          c,
        );
      }
      await store.audit(
        req.actor.id,
        "eca_broadcast",
        `${subs.length} recipient(s): ${data.subject}`.slice(0, 250),
        c,
      );
      return subs.length;
    });
    res.status(201).json({
      ok: true,
      queued,
      minutes: Math.ceil(((queued - 1) * ECA_GAP_SECONDS) / 60),
    });
  });
}
