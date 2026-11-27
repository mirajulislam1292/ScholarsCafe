import nodemailer from "nodemailer";
import { renderEmail, actionFor, adminScreen, CONTACT, DEFAULT_TAGLINE } from "./email-template.js";

// The email footer tagline is fixed in email-brand.js (it no longer follows the website's Links.tagline).
// Kept as a function so existing callers keep working.
export async function emailTagline() {
  return DEFAULT_TAGLINE;
}

// The mailbox that sends (and signs in to SMTP). Set SMTP_USER=no-reply@scholarscafe.com once that mailbox exists.
export const sender = (config) => (config.SMTP_USER || CONTACT).trim().toLowerCase();
const smtp = (user, pass) =>
  nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    connectionTimeout: 10000,
    socketTimeout: 20000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
export function createMailer(config) {
  if (!config.SMTP_PASSWORD) return null;
  const transport = smtp(sender(config), config.SMTP_PASSWORD);
  transport.sender = sender(config);
  transport.adminOrigin = config.ADMIN_ORIGIN || "";
  // Replies from the dashboard's Mail screen go out as contact@ itself. If the main sender already is
  // contact@, reuse it; otherwise sign in with the contact@ mailbox (the same password IMAP uses).
  const contactUser = (config.CONTACT_IMAP_USER || CONTACT).trim().toLowerCase();
  transport.contact =
    transport.sender === contactUser
      ? transport
      : config.CONTACT_IMAP_PASSWORD
        ? Object.assign(smtp(contactUser, config.CONTACT_IMAP_PASSWORD), { sender: contactUser })
        : null;
  return transport;
}

/** The layout stored with an outbox row (JSON), or null for older rows and plain mail. */
function rowLayout(row) {
  if (!row.layout) return null;
  try {
    const l = typeof row.layout === "string" ? JSON.parse(row.layout) : row.layout;
    return l && typeof l === "object" ? l : null;
  } catch {
    return null;
  }
}
/** A layout button may name an admin screen ({ label, screen }) instead of a URL: resolved here. */
function resolveButton(button, adminOrigin) {
  if (!button) return null;
  const url = button.url || (button.screen ? adminScreen(adminOrigin, button.screen) : null);
  return url ? { label: button.label, url } : null;
}

/** Light or dark: the email style picked in Compose / Reply (stored as layout.theme). */
export const emailTheme = (t) => (t === "dark" ? "dark" : "light");

/**
 * The nodemailer message for one outbox row: shared HTML template + plain-text alternative.
 * The theme comes from the row's layout (layout.theme); `opts.theme` overrides it (Preview emails page).
 */
export function outboxMessage(row, transport, opts = {}) {
  const fromContact = Boolean(row.from_contact);
  const from = fromContact ? transport.contact?.sender || CONTACT : transport.sender || CONTACT;
  const layout = rowLayout(row);
  const theme = emailTheme(opts.theme || layout?.theme);
  const { html, text } = layout
    ? renderEmail({
        ...layout,
        subject: row.subject,
        theme,
        button: resolveButton(layout.button, transport.adminOrigin),
        unsubscribeUrl: row.unsubscribe_url || null,
      })
    : renderEmail({
        subject: row.subject,
        text: row.body,
        theme,
        unsubscribeUrl: row.unsubscribe_url || null,
        // Mail typed in the dashboard gets no automatic button; automatic mail gets one main button.
        button: fromContact
          ? null
          : actionFor(
              { subject: row.subject, text: row.body, toTeam: !row.to_email },
              transport.adminOrigin,
            ),
        // Mail typed in the dashboard (compose, replies) may use **bold** and [label](https://…) links.
        format: fromContact,
      });
  return {
    from: `Scholars Cafe <${from}>`,
    // Team notifications go to the inbox; a form receipt goes to the person who filled in the form.
    to: row.to_email || CONTACT,
    // Mail from no-reply@ always has a human address to answer: the visitor (team notices) or contact@.
    replyTo: row.reply_to || (from === CONTACT ? undefined : CONTACT),
    subject: row.subject,
    text,
    html,
    messageId: `<${row.id}@scholarscafe.com>`,
    ...(row.in_reply_to ? { inReplyTo: row.in_reply_to } : {}),
    ...(row.references_hdr ? { references: row.references_hdr } : {}),
    // Alert emails (ECA list): the mail app's own "Unsubscribe" button, one click (RFC 8058).
    ...(row.unsubscribe_url
      ? {
          headers: {
            "List-Unsubscribe": `<${row.unsubscribe_url}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        }
      : {}),
  };
}

// At-least-once delivery: a crash after sending can cause a duplicate, never lost records.
// Mail sent as contact@ is then copied to that mailbox's Sent folder (transport.saveSent, IMAP APPEND),
// after the database transaction, so a slow mail server never holds the queue lock.
export async function deliverMail(store, transport) {
  if (!transport) return;
  let sentFromContact = null;
  await store.transaction(async (c) => {
    const rows = await store.query(
      "SELECT * FROM mail_outbox WHERE sent_at IS NULL AND attempts<5 AND next_attempt_at<=UTC_TIMESTAMP() ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED",
      [],
      c,
    );
    if (!rows.length) return;
    const row = rows[0];
    try {
      const via = row.from_contact ? transport.contact : transport;
      if (!via) throw new Error("contact mailbox not configured");
      const message = outboxMessage(row, transport);
      await via.sendMail(message);
      if (row.from_contact) sentFromContact = message;
      await store.query(
        "UPDATE mail_outbox SET sent_at=UTC_TIMESTAMP(),attempts=attempts+1 WHERE id=?",
        [row.id],
        c,
      );
    } catch {
      // Never log SMTP credentials or private message bodies.
      await store.query(
        "UPDATE mail_outbox SET attempts=attempts+1,next_attempt_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 HOUR) WHERE id=?",
        [row.id],
        c,
      );
      console.error("Mailbox delivery failed; message remains in dashboard and delivery queue.");
    }
  });
  if (sentFromContact && transport.saveSent)
    await transport.saveSent(sentFromContact).catch(() => {});
}

/** Sign-in code + magic link (sent straight to the account's own address, not via the outbox). */
export function loginEmail(transport, to, code, url, minutes, theme = "light") {
  const subject = "Your Scholars Cafe sign-in code";
  const { html, text } = renderEmail({
    subject,
    theme: emailTheme(theme),
    preheader: `Your sign-in code is ${code}. It expires in ${minutes} minutes.`,
    label: "Sign-in code",
    heading: "Your sign-in code",
    text: "Use this code to sign in to Scholars Cafe.",
    code,
    note: `The code expires in ${minutes} minutes and works once. If you did not ask for this, you can ignore this email; nobody can sign in without the code.\n\nOr sign in with this link: ${url}`,
  });
  const from = transport.sender || CONTACT;
  return {
    from: `Scholars Cafe <${from}>`,
    to,
    replyTo: from === CONTACT ? undefined : CONTACT,
    subject,
    text,
    html,
  };
}
export async function sendLoginEmail(transport, to, code, url, minutes) {
  await transport.sendMail(loginEmail(transport, to, code, url, minutes));
}
