import { Store } from "./store.js";
import { createApp, portalConfig } from "./app.js";
import { createMailer, deliverMail } from "./mail.js";
import { seedFormTemplates } from "./forms.js";
import { queueBookingReminders } from "./booking.js";
import { queueTaskReminders } from "./workspace.js";
import { deliverPush, onPushQueued, vapidKeys } from "./push.js";
import { pollInbox, imapConfigured, appendSent } from "./inbox.js";

for (const key of [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "ADMIN_ORIGIN",
  "PUBLIC_ORIGIN",
]) {
  if (!process.env[key]) throw new Error("Required configuration missing: " + key);
}
// PORTAL=student runs the student portal (student.scholarscafe.com) from this same code and database.
if (process.env.PORTAL === "student" && !process.env.STUDENT_ORIGIN)
  throw new Error("Required configuration missing: STUDENT_ORIGIN");
for (const key of [
  "ADMIN_ORIGIN",
  "PUBLIC_ORIGIN",
  ...(process.env.PORTAL === "student" ? ["STUDENT_ORIGIN"] : []),
]) {
  const url = new URL(process.env[key]);
  if (url.protocol !== "https:" || url.origin !== process.env[key])
    throw new Error("An exact HTTPS origin is required: " + key);
}
// Google IDs and secrets never contain whitespace; strip any that sneaks in when pasting into hPanel
// (a stray space makes Google reject every sign-in with "invalid_client").
for (const key of ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"])
  process.env[key] = process.env[key].replace(/\s+/g, "");
// LiteSpeed loads the entry point with require(), so avoid top-level await.
async function start() {
  const store = new Store(process.env);
  await store.initialize();
  await seedFormTemplates(store);
  await store.clean();
  const cleanup = setInterval(
    () => store.clean().catch(() => console.error("Session cleanup failed")),
    600000,
  );
  cleanup.unref();
  const mailer = createMailer(process.env);
  // Mail sent as contact@ (replies, Compose) also lands in that mailbox's Sent folder.
  if (mailer && imapConfigured(process.env))
    mailer.saveSent = (message) => appendSent(process.env, message);
  let delivering = false;
  const mailTimer = setInterval(async () => {
    // Team notifications are delivered by the admin deployment only.
    if (delivering || !mailer || process.env.PORTAL === "student") return;
    delivering = true;
    try {
      await deliverMail(store, mailer);
    } catch {
      console.error("Mailbox queue check failed");
    } finally {
      delivering = false;
    }
  }, 15000);
  mailTimer.unref();
  // Task deadline reminders (24h and 2h before), queued into the outbox by the admin deployment only.
  let reminding = false;
  const reminderTimer = setInterval(async () => {
    if (reminding || process.env.PORTAL === "student") return;
    reminding = true;
    try {
      await queueTaskReminders(store, process.env);
    } catch {
      console.error("Task reminder check failed");
    } finally {
      reminding = false;
    }
  }, 300000);
  reminderTimer.unref();
  // Booking reminders (60–90 minutes before a session), queued once each into the mail outbox. Admin only.
  let bookingReminding = false;
  const bookingTimer = setInterval(async () => {
    if (bookingReminding || process.env.PORTAL === "student") return;
    bookingReminding = true;
    try {
      await queueBookingReminders(store);
    } catch {
      console.error("Booking reminder check failed");
    } finally {
      bookingReminding = false;
    }
  }, 60000);
  bookingTimer.unref();
  // Web Push (admin app only): sent about a second after an event is queued, with a 15-second safety net.
  if (process.env.PORTAL !== "student") {
    await vapidKeys(store, process.env); // makes and stores the VAPID keys on first start
    let pushing = false;
    const push = async () => {
      if (pushing) return;
      pushing = true;
      try {
        await deliverPush(store, process.env);
      } catch {
        console.error("Push delivery check failed");
      } finally {
        pushing = false;
      }
    };
    onPushQueued(push);
    setInterval(push, 15000).unref();
    // The contact@ mailbox (IMAP), checked every 90 seconds when CONTACT_IMAP_USER/PASSWORD are set.
    if (imapConfigured(process.env)) {
      const check = () => pollInbox(store, process.env).catch(() => {});
      setTimeout(check, 5000).unref();
      setInterval(check, 90000).unref();
    }
  }
  const server = createApp(store, portalConfig(process.env), undefined, mailer).listen(
    Number(process.env.PORT || 3000),
    "0.0.0.0",
  );
  process.on("SIGTERM", () => server.close(() => store.pool.end().then(() => process.exit(0))));
}
start().catch((error) => {
  console.error("Admin startup failed:", error.code || error.name);
  process.exit(1);
});
