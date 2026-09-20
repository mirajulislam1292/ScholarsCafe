import nodemailer from "nodemailer";

export function createMailer(config) {
  if (!config.SMTP_PASSWORD) return null;
  return nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: { user: "contact@scholarscafe.com", pass: config.SMTP_PASSWORD },
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    connectionTimeout: 10000,
    socketTimeout: 20000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}

// At-least-once delivery: a crash after sending can cause a duplicate, never lost records.
export async function deliverMail(store, transport) {
  if (!transport) return;
  await store.transaction(async (c) => {
    const rows = await store.query(
      "SELECT * FROM mail_outbox WHERE sent_at IS NULL AND attempts<5 AND next_attempt_at<=UTC_TIMESTAMP() ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED", [], c,
    );
    if (!rows.length) return;
    const row = rows[0];
    try {
      await transport.sendMail({
        from: 'Scholars Cafe Website <contact@scholarscafe.com>',
        to: "contact@scholarscafe.com",
        replyTo: row.reply_to || undefined,
        subject: row.subject,
        text: row.body,
        messageId: `<${row.id}@scholarscafe.com>`,
      });
      await store.query("UPDATE mail_outbox SET sent_at=UTC_TIMESTAMP(),attempts=attempts+1 WHERE id=?", [row.id], c);
    } catch {
      // Never log SMTP credentials or private message bodies.
      await store.query("UPDATE mail_outbox SET attempts=attempts+1,next_attempt_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 HOUR) WHERE id=?", [row.id], c);
      console.error("Mailbox delivery failed; message remains in dashboard and delivery queue.");
    }
  });
}
