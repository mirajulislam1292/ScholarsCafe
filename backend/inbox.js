// The contact@scholarscafe.com mailbox inside the admin dashboard (owners and admins only).
// - The admin app reads it over IMAP (imap.hostinger.com:993, TLS) every ~90 seconds with the free
//   imapflow package. Sign-in comes only from CONTACT_IMAP_USER / CONTACT_IMAP_PASSWORD (hPanel env vars).
// - Headers and sanitised bodies are stored in MySQL (contact_mail). Attachments: names and sizes only.
// - HTML mail is shown in a sandboxed frame with its own strict CSP: no scripts, remote images blocked
//   until someone clicks "Show images".
// - Replies and new mail (Compose) go out from contact@ through the normal mail outbox (replies threaded
//   with In-Reply-To/References); after sending, a copy is appended to the mailbox's Sent folder.
import { randomUUID, randomBytes } from "node:crypto";
import { ImapFlow } from "imapflow";
import MailComposer from "nodemailer/lib/mail-composer";
import { simpleParser } from "mailparser";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { canPublish } from "./security.js";
import { escapeHtml, CONTACT } from "./email-template.js";
import { queuePush, inboxReaderIds, preview } from "./push.js";
import { sender, outboxMessage, emailTheme } from "./mail.js";

// Email layout for mail typed in the Mail screen: the team's own words with simple formatting, a greeting
// when the message doesn't already start with one, and, for replies, the original message quoted below.
const GREETING_RE = /^\s*(hi|hello|hey|dear|assalamu|salam|good (morning|afternoon|evening))\b/i;
export function typedLayout(body, { name = "", quote = null, theme = "light" } = {}) {
  const own = GREETING_RE.test(body);
  return {
    text: body,
    format: true,
    ...(emailTheme(theme) === "dark" ? { theme: "dark" } : {}),
    ...(own ? {} : name ? { firstName: name } : { greeting: "Hello," }),
    ...(quote ? { quote } : {}),
  };
}
/** The name we know for an address from mail it sent us, or "". */
async function knownName(store, email, c) {
  if (!email) return "";
  const [r] = await store.query(
    "SELECT from_name FROM contact_mail WHERE direction='in' AND from_email=? AND from_name<>'' ORDER BY received_at DESC LIMIT 1",
    [email],
    c,
  );
  return String(r?.from_name || "").trim();
}
const quoteDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });

const MAX_SOURCE = 15 * 1024 * 1024; // bigger messages: headers only
const FIRST_IMPORT = 50; // on first connect, only the latest messages
const clip = (s, n) => String(s ?? "").slice(0, n);

export const imapConfigured = (config) =>
  Boolean(config.CONTACT_IMAP_USER && config.CONTACT_IMAP_PASSWORD);
export const canReplyFrom = (config) =>
  Boolean(config.SMTP_PASSWORD) &&
  (Boolean(config.CONTACT_IMAP_PASSWORD) || sender(config) === CONTACT);

/** Safe HTML for display: formatting and tables only; no scripts, forms, frames or event handlers. */
export function sanitizeMail(html) {
  const clean = sanitizeHtml(String(html || ""), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "center",
      "font",
      "span",
      "u",
      "s",
      "hr",
    ]),
    disallowedTagsMode: "discard",
    allowedAttributes: {
      "*": ["style", "align", "valign", "width", "height", "bgcolor", "color", "dir", "lang"],
      a: ["href", "title", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      table: ["border", "cellpadding", "cellspacing"],
      font: ["face", "size", "color"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["https", "http", "data", "cid"] },
    allowProtocolRelative: false,
    // Links open in a new tab (outside the sandbox), never inside the dashboard.
    transformTags: {
      a: (tag, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
      }),
    },
  });
  return clean;
}
export const hasRemoteImages = (html) =>
  /<img[^>]+src\s*=\s*["']?\s*https?:/i.test(html) || /url\(\s*['"]?\s*https?:/i.test(html);

/** One parsed message → the row stored in contact_mail. */
export async function parseMessage(source) {
  const m = await simpleParser(source, { skipImageLinks: true, skipTextToHtml: true });
  const from = m.from?.value?.[0] || {};
  const html = m.html ? sanitizeMail(m.html) : null;
  const text = clip(m.text || (html ? sanitizeHtml(html, { allowedTags: [] }) : ""), 200000);
  const refs = Array.isArray(m.references) ? m.references.join(" ") : m.references || "";
  return {
    message_id: clip(m.messageId, 255) || null,
    in_reply_to: clip(m.inReplyTo, 255) || null,
    references_hdr: clip(refs, 4000) || null,
    from_name: clip(from.name, 200),
    from_email: clip(from.address, 254).toLowerCase(),
    to_text: clip(m.to?.text, 500),
    subject: clip(m.subject || "(no subject)", 300),
    snippet: preview(text, 280),
    body_text: text,
    body_html: html ? clip(html, 1000000) : null,
    has_remote_images: html ? hasRemoteImages(html) : false,
    attachments: (m.attachments || []).slice(0, 30).map((a) => ({
      name: clip(a.filename || "attachment", 200),
      size: a.size || 0,
      type: a.contentType,
    })),
    received_at: m.date && !isNaN(m.date) ? m.date : new Date(),
  };
}

const readState = async (store) => {
  const v = (await store.query("SELECT value FROM settings WHERE name='imap_state'"))[0]?.value;
  const [validity, last] = String(v || "").split(":");
  return { validity: validity || null, last: Number(last) || 0 };
};
const saveSetting = (store, name, value) =>
  store.query(
    "INSERT INTO settings (name,value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=VALUES(value)",
    [name, clip(value, 255)],
  );

export const defaultImap = (config) =>
  new ImapFlow({
    host: config.CONTACT_IMAP_HOST || "imap.hostinger.com",
    port: 993,
    secure: true,
    auth: { user: config.CONTACT_IMAP_USER.trim(), pass: config.CONTACT_IMAP_PASSWORD },
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    logger: false,
    connectionTimeout: 15000,
    socketTimeout: 60000,
  });

/**
 * Saves a copy of a message sent as contact@ into that mailbox's Sent folder (IMAP APPEND), so it shows
 * in webmail and phone mail apps too. Best effort: a failure is logged (no content) and never retried.
 */
export async function appendSent(config, message, connect = defaultImap) {
  if (!imapConfigured(config)) return false;
  const raw = await new MailComposer({ ...message, date: new Date() }).compile().build();
  const client = connect(config);
  try {
    await client.connect();
    const boxes = await client.list();
    const box =
      boxes.find((b) => b.specialUse === "\\Sent") ||
      boxes.find((b) => /^(INBOX[./])?Sent( Items| Messages)?$/i.test(b.path));
    await client.append(box?.path || "INBOX.Sent", raw, ["\\Seen"]);
    return true;
  } catch (error) {
    console.error("Saving to Sent failed:", error?.code || error?.name);
    return false;
  } finally {
    await client.logout().catch(() => {});
  }
}

/** Recipients typed in Compose: comma/semicolon separated, at most 5, each a valid address. */
export const MAX_RECIPIENTS = 5;
export function parseRecipients(value) {
  const list = [
    ...new Set(
      String(value ?? "")
        .split(/[,;\s]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
  if (!list.length) return { error: "Add at least one recipient." };
  if (list.length > MAX_RECIPIENTS)
    return { error: `Send to at most ${MAX_RECIPIENTS} people at once.` };
  const bad = list.find((a) => a.length > 254 || !z.email().safeParse(a).success);
  if (bad) return { error: `"${bad.slice(0, 60)}" is not a valid email address.` };
  const joined = list.join(", ");
  if (joined.length > 254) return { error: "The recipient list is too long." };
  return { list, joined };
}
const composeSchema = z
  .object({
    to: z.string().max(1000),
    subject: z.string().trim().min(1, "Add a subject.").max(160),
    body: z.string().trim().min(1, "Write a message.").max(20000),
    theme: z.enum(["light", "dark"]).default("light"),
  })
  .strict();
const cleanSubject = (s) => s.replace(/[\x00-\x1f\x7f]+/g, " ").trim();

// Compose previews: the rendered card is kept for a few minutes under a random token so the sandboxed
// preview frame can load it as its own page (with its own CSP). Memory only; nothing is logged.
const previews = new Map();
const PREVIEW_MS = 10 * 60 * 1000;
function keepPreview(userId, html) {
  const now = Date.now();
  for (const [k, v] of previews) if (v.exp < now) previews.delete(k);
  while (previews.size >= 200) previews.delete(previews.keys().next().value);
  const token = randomBytes(18).toString("base64url");
  previews.set(token, { userId, html, exp: now + PREVIEW_MS });
  return token;
}

let polling = null;
/**
 * Reads new messages from contact@'s INBOX into contact_mail. Returns how many were added.
 * `connect(config)` returns an ImapFlow-like client (tests pass a fake one).
 */
export function pollInbox(store, config, connect = defaultImap) {
  if (!imapConfigured(config)) return Promise.resolve(0);
  // One poll at a time per process (the timer and the "Check now" button share it).
  polling ||= runPoll(store, config, connect).finally(() => {
    polling = null;
  });
  return polling;
}
async function runPoll(store, config, connect) {
  const client = connect(config);
  let added = 0;
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const validity = String(client.mailbox.uidValidity);
      const state = await readState(store);
      let last = state.validity === validity ? state.last : 0;
      const next = Number(client.mailbox.uidNext) || 1;
      if (!last) last = Math.max(0, next - 1 - FIRST_IMPORT);
      if (next - 1 > last) {
        const found = [];
        for await (const msg of client.fetch(
          `${last + 1}:*`,
          { uid: true, size: true },
          { uid: true },
        ))
          if (msg.uid > last) found.push({ uid: msg.uid, size: msg.size });
        found.sort((a, b) => a.uid - b.uid);
        for (const { uid, size } of found) {
          const big = size > MAX_SOURCE;
          const msg = await client.fetchOne(
            String(uid),
            big ? { uid: true, headers: true } : { uid: true, source: true },
            { uid: true },
          );
          const row = await parseMessage(big ? msg.headers : msg.source);
          if (big) row.snippet = "This message is too large to show here. Open it in webmail.";
          if (await storeMessage(store, validity, uid, row)) added++;
          await saveSetting(store, "imap_state", `${validity}:${uid}`);
        }
      }
    } finally {
      lock.release();
    }
    await saveSetting(store, "imap_status", JSON.stringify({ ok: true, at: new Date() }));
  } catch (error) {
    // Never log the password or message content; a short reason helps the owner fix hPanel settings.
    const reason = error?.authenticationFailed
      ? "Sign-in failed. Check CONTACT_IMAP_USER and CONTACT_IMAP_PASSWORD."
      : "Could not reach the mail server.";
    await saveSetting(
      store,
      "imap_status",
      JSON.stringify({ ok: false, at: new Date(), reason }),
    ).catch(() => {});
    console.error("Inbox check failed:", error?.code || error?.name);
  } finally {
    await client.logout().catch(() => {});
  }
  return added;
}
async function storeMessage(store, validity, uid, row) {
  let inserted = false;
  await store.transaction(async (c) => {
    // A message already stored (same Message-ID, e.g. after a mailbox reset) is not added again.
    if (row.message_id) {
      const dup = await store.query(
        "SELECT id FROM contact_mail WHERE message_id=? AND direction='in' LIMIT 1",
        [row.message_id],
        c,
      );
      if (dup.length) return;
    }
    const result = await store.query(
      `INSERT IGNORE INTO contact_mail (id,direction,uidvalidity,uid,message_id,in_reply_to,references_hdr,from_name,from_email,to_text,subject,snippet,body_text,body_html,has_remote_images,attachments,received_at)
       VALUES (?,'in',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        randomUUID(),
        validity,
        uid,
        row.message_id,
        row.in_reply_to,
        row.references_hdr,
        row.from_name,
        row.from_email,
        row.to_text,
        row.subject,
        row.snippet,
        row.body_text,
        row.body_html,
        row.has_remote_images,
        JSON.stringify(row.attachments),
        row.received_at,
      ],
      c,
    );
    if (result.affectedRows !== 1) return;
    inserted = true;
    await queuePush(store, c, await inboxReaderIds(store, c), {
      title: "New email to contact@",
      body: `${row.from_name || row.from_email}: ${row.subject}`,
      open: "Mail",
      tag: "mail",
    });
  });
  return inserted;
}

/** The document shown inside the sandboxed frame (served with its own CSP, see the /view route). */
export function viewDocument(row) {
  const body = row.body_html
    ? row.body_html
    : `<pre style="white-space:pre-wrap;word-wrap:break-word;font:inherit;margin:0">${escapeHtml(row.body_text || "")}</pre>`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"><style>body{margin:0;padding:12px;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#1f2a37;background:#fff;overflow-wrap:anywhere}img{max-width:100%;height:auto}table{max-width:100%}</style></head><body>${body}</body></html>`;
}
export const viewCsp = (images) =>
  [
    "default-src 'none'",
    `img-src data: cid:${images ? " https:" : ""}`,
    "style-src 'unsafe-inline'",
    "font-src data:",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'self'",
    "sandbox allow-popups allow-popups-to-escape-sandbox",
  ].join("; ");

export function installInboxRoutes(app, { store, fail, config, connect }) {
  const owners = (req) => {
    if (!canPublish(req.actor.role)) throw fail(403, "The mail inbox is for owners and admins.");
  };
  app.use("/api/inbox", (req, _res, next) => {
    owners(req);
    next();
  });
  const id = (req) => z.string().uuid().parse(req.params.id);
  const one = async (req) => {
    const [row] = await store.query("SELECT * FROM contact_mail WHERE id=?", [id(req)]);
    if (!row) throw fail(404, "Message not found.");
    return row;
  };
  app.get("/api/inbox", async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";
    const sent = req.query.folder === "sent";
    const filter = !sent && req.query.filter === "unread" ? " AND read_at IS NULL" : "";
    const like = "%" + q.replace(/[\\%_]/g, (c) => "\\" + c) + "%";
    const items = await store.query(
      `SELECT id,from_name,from_email,to_text,subject,snippet,received_at,read_at,replied_at,
              (attachments IS NOT NULL AND JSON_LENGTH(attachments)>0) AS has_attachments
         FROM contact_mail WHERE direction='${sent ? "out" : "in"}'${filter}
         ${q ? `AND (subject LIKE ? OR ${sent ? "to_text" : "from_email"} LIKE ? OR from_name LIKE ? OR body_text LIKE ?)` : ""}
        ORDER BY received_at DESC LIMIT 100`,
      q ? [like, like, like, like] : [],
    );
    const [counts] = await store.query(
      "SELECT COUNT(*) AS total, SUM(read_at IS NULL) AS unread FROM contact_mail WHERE direction='in'",
    );
    const status = (await store.query("SELECT value FROM settings WHERE name='imap_status'"))[0]
      ?.value;
    let parsed = null;
    try {
      parsed = status ? JSON.parse(status) : null;
    } catch {}
    res.json({
      connected: imapConfigured(config),
      can_reply: canReplyFrom(config),
      mailbox: imapConfigured(config) ? config.CONTACT_IMAP_USER.trim() : CONTACT,
      status: parsed,
      unread: Number(counts?.unread || 0),
      total: Number(counts?.total || 0),
      items: items.map((m) => ({
        id: m.id,
        from_name: m.from_name,
        from_email: m.from_email,
        to: sent ? m.to_text : undefined,
        subject: m.subject,
        snippet: m.snippet,
        received_at: m.received_at,
        read: sent || Boolean(m.read_at),
        replied: Boolean(m.replied_at),
        has_attachments: Boolean(Number(m.has_attachments)),
      })),
    });
  });
  // New mail from contact@ (Compose). Same path as replies: the outbox sends it as contact@ with the
  // branded template, and a copy goes to the Sent folder. The body is never logged.
  const composed = async (req) => {
    const input = composeSchema.parse(req.body);
    const to = parseRecipients(input.to);
    if (to.error) throw fail(400, to.error);
    return { ...input, subject: cleanSubject(input.subject), to };
  };
  app.post("/api/inbox/compose/preview", async (req, res) => {
    if (
      store.checkRateLimit &&
      !(await store.checkRateLimit("inbox_preview", req.actor.id, 300, 600))
    )
      throw fail(429, "Too many previews. Wait a minute.");
    const input = z
      .object({
        to: z.string().max(1000).default(""),
        subject: z.string().max(160).default(""),
        body: z.string().max(20000).default(""),
        theme: z.enum(["light", "dark"]).default("light"),
      })
      .strict()
      .parse(req.body);
    const to = parseRecipients(input.to);
    const previewBody = input.body.trim() || "Your message appears here.";
    const name = to.list?.length === 1 ? await knownName(store, to.list[0]) : "";
    const message = outboxMessage(
      {
        id: "preview",
        subject: cleanSubject(input.subject) || "(no subject)",
        body: previewBody,
        to_email: to.joined || "",
        from_contact: 1,
        layout: typedLayout(previewBody, { name, theme: input.theme }),
      },
      { contact: { sender: CONTACT }, sender: CONTACT },
    );
    res.json({ url: `/api/inbox/compose/preview?t=${keepPreview(req.actor.id, message.html)}` });
  });
  app.get("/api/inbox/compose/preview", (req, res) => {
    const p = previews.get(String(req.query.t || ""));
    if (!p || p.userId !== req.actor.id || p.exp < Date.now()) throw fail(404, "Preview expired.");
    res
      .set({
        "Content-Security-Policy":
          "default-src 'none'; img-src https: data:; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; base-uri 'none'; form-action 'none'; frame-ancestors 'self'; sandbox allow-popups allow-popups-to-escape-sandbox",
        "X-Frame-Options": "SAMEORIGIN",
        "Cache-Control": "no-store",
        "Content-Type": "text/html; charset=utf-8",
      })
      .send(p.html);
  });
  app.post("/api/inbox/compose", async (req, res) => {
    if (!canReplyFrom(config))
      throw fail(
        400,
        "Sending needs the contact@ mailbox password (CONTACT_IMAP_PASSWORD) in hPanel.",
      );
    const { to, subject, body, theme } = await composed(req);
    if (
      store.checkRateLimit &&
      !(await store.checkRateLimit("inbox_compose", req.actor.id, 20, 600))
    )
      throw fail(429, "Too many emails in a short time. Wait a few minutes.");
    const outId = randomUUID();
    await store.transaction(async (c) => {
      const name = to.list.length === 1 ? await knownName(store, to.list[0], c) : "";
      await store.query(
        "INSERT INTO mail_outbox (id,subject,body,to_email,from_contact,layout) VALUES (?,?,?,?,1,?)",
        [outId, subject, body, to.joined, JSON.stringify(typedLayout(body, { name, theme }))],
        c,
      );
      await store.query(
        `INSERT INTO contact_mail (id,direction,message_id,from_name,from_email,to_text,subject,snippet,body_text,received_at,read_at,sent_by)
         VALUES (?,'out',?,'Scholars Cafe',?,?,?,?,?,UTC_TIMESTAMP(),UTC_TIMESTAMP(),?)`,
        [
          outId,
          `<${outId}@scholarscafe.com>`,
          CONTACT,
          to.joined,
          subject,
          preview(body, 280),
          body,
          req.actor.id,
        ],
        c,
      );
      await store.audit(req.actor.id, "inbox_compose", to.joined, c);
    });
    res.status(201).json({ ok: true, id: outId, to: to.list });
  });
  app.get("/api/inbox/:id", async (req, res) => {
    const m = await one(req);
    // Our own replies to this message (and to earlier ones in the same thread).
    const ids = [m.message_id, ...String(m.references_hdr || "").split(/\s+/)].filter(Boolean);
    const replies = ids.length
      ? await store.query(
          `SELECT c.id,c.body_text,c.received_at,c.to_text,u.email AS sent_by FROM contact_mail c LEFT JOIN users u ON u.id=c.sent_by
            WHERE c.direction='out' AND c.in_reply_to IN (${ids.map(() => "?").join(",")}) ORDER BY c.received_at`,
          ids,
        )
      : [];
    if (!m.read_at)
      await store.query("UPDATE contact_mail SET read_at=UTC_TIMESTAMP() WHERE id=?", [m.id]);
    let attachments = [];
    try {
      attachments =
        typeof m.attachments === "string" ? JSON.parse(m.attachments) : m.attachments || [];
    } catch {}
    res.json({
      id: m.id,
      sent: m.direction === "out",
      from_name: m.from_name,
      from_email: m.from_email,
      to: m.to_text,
      subject: m.subject,
      received_at: m.received_at,
      read: true,
      replied: Boolean(m.replied_at),
      html: Boolean(m.body_html),
      has_remote_images: Boolean(m.has_remote_images),
      text: m.body_text || "",
      attachments,
      replies: replies.map((r) => ({
        id: r.id,
        body: r.body_text,
        at: r.received_at,
        to: r.to_text,
        by: r.sent_by,
      })),
    });
  });
  // The message body as its own tiny page for the sandboxed frame. Its CSP has no script source at all,
  // and remote images load only with ?images=1 (the "Show images" button).
  app.get("/api/inbox/:id/view", async (req, res) => {
    const m = await one(req);
    res
      .set({
        "Content-Security-Policy": viewCsp(req.query.images === "1"),
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Type": "text/html; charset=utf-8",
      })
      .send(viewDocument(m));
  });
  app.post("/api/inbox/:id/read", async (req, res) => {
    const { read } = z.object({ read: z.boolean() }).strict().parse(req.body);
    const r = await store.query(
      `UPDATE contact_mail SET read_at=${read ? "COALESCE(read_at,UTC_TIMESTAMP())" : "NULL"} WHERE id=? AND direction='in'`,
      [id(req)],
    );
    if (r.affectedRows !== 1) throw fail(404, "Message not found.");
    res.json({ ok: true });
  });
  app.post("/api/inbox/:id/reply", async (req, res) => {
    const { body, theme } = z
      .object({
        body: z.string().trim().min(1).max(20000),
        theme: z.enum(["light", "dark"]).default("light"),
      })
      .strict()
      .parse(req.body);
    if (!canReplyFrom(config))
      throw fail(
        400,
        "Replies need the contact@ mailbox password (CONTACT_IMAP_PASSWORD) in hPanel.",
      );
    if (store.checkRateLimit && !(await store.checkRateLimit("inbox_reply", req.actor.id, 30, 600)))
      throw fail(429, "Too many replies in a short time. Wait a few minutes.");
    const m = await one(req);
    if (m.direction !== "in" || !m.from_email) throw fail(400, "This message can't be answered.");
    const outId = randomUUID();
    const subject = (/^re:/i.test(m.subject) ? m.subject : "Re: " + m.subject)
      .replace(/[\x00-\x1f\x7f]+/g, " ")
      .slice(0, 160);
    const references = [m.references_hdr, m.message_id].filter(Boolean).join(" ").slice(-4000);
    await store.transaction(async (c) => {
      const layout = typedLayout(body, {
        name: m.from_name || "",
        theme,
        quote: {
          by: `On ${quoteDate(m.received_at)}, ${m.from_name || m.from_email} wrote:`,
          text: String(m.body_text || m.snippet || "").slice(0, 2000),
        },
      });
      await store.query(
        "INSERT INTO mail_outbox (id,subject,body,to_email,from_contact,in_reply_to,references_hdr,layout) VALUES (?,?,?,?,1,?,?,?)",
        [
          outId,
          subject,
          body,
          m.from_email,
          m.message_id,
          references || null,
          JSON.stringify(layout),
        ],
        c,
      );
      await store.query(
        `INSERT INTO contact_mail (id,direction,message_id,in_reply_to,references_hdr,from_name,from_email,to_text,subject,snippet,body_text,received_at,read_at,sent_by)
         VALUES (?,'out',?,?,?,'Scholars Cafe',?,?,?,?,?,UTC_TIMESTAMP(),UTC_TIMESTAMP(),?)`,
        [
          outId,
          `<${outId}@scholarscafe.com>`,
          m.message_id,
          references || null,
          CONTACT,
          m.from_email,
          subject,
          preview(body, 280),
          body,
          req.actor.id,
        ],
        c,
      );
      await store.query(
        "UPDATE contact_mail SET replied_at=UTC_TIMESTAMP(),read_at=COALESCE(read_at,UTC_TIMESTAMP()) WHERE id=?",
        [m.id],
        c,
      );
      await store.audit(req.actor.id, "inbox_reply", m.from_email, c);
    });
    res.status(201).json({ ok: true, id: outId });
  });
  app.post("/api/inbox/sync", async (req, res) => {
    if (!imapConfigured(config)) throw fail(400, "The contact@ mailbox is not connected yet.");
    if (store.checkRateLimit && !(await store.checkRateLimit("inbox_sync", req.actor.id, 10, 300)))
      throw fail(429, "Wait a moment before checking again.");
    res.json({ ok: true, added: await pollInbox(store, config, connect) });
  });
}
