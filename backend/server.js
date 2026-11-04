import { Store } from "./store.js";
import { createApp, portalConfig } from "./app.js";
import { createMailer, deliverMail } from "./mail.js";

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
// LiteSpeed loads the entry point with require(), so avoid top-level await.
async function start() {
  const store = new Store(process.env);
  await store.initialize();
  await store.clean();
  const cleanup = setInterval(
    () => store.clean().catch(() => console.error("Session cleanup failed")),
    600000,
  );
  cleanup.unref();
  const mailer = createMailer(process.env);
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
