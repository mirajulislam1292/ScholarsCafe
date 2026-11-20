import nodemailer from "nodemailer";
import { renderEmail, CONTACT } from "./email-template.js";

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

/** The nodemailer message for one outbox row: shared HTML template + plain-text alternative. */
export function outboxMessage(row, transport) {
  const fromContact = Boolean(row.from_contact);
  const from = fromContact ? transport.contact?.sender || CONTACT : transport.sender || CONTACT;
  const { html, text } = renderEmail({
    subject: row.subject,
    text: row.body,
    unsubscribeUrl: row.unsubscribe_url || null,
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
export async function deliverMail(store, transport) {
  if (!transport) return;
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
      await via.sendMail(outboxMessage(row, transport));
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
}

/** Sign-in code + magic link (sent straight to the account's own address, not via the outbox). */
export function loginEmail(transport, to, code, url, minutes) {
  const subject = "Your Scholars Cafe sign-in code";
  const { html, text } = renderEmail({
    subject,
    text: `Your sign-in code is ${code}\n\nOr open this link to sign in:\n${url}\n\nThe code and link expire in ${minutes} minutes and work once. If you did not ask for this, ignore this email; nobody can sign in without the code.`,
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
