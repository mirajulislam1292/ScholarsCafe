// Writes every email the app sends (sample data) to ../email-previews/ as .html and .txt files, so the
// design can be checked in a browser. Nothing is sent. Run: node backend/scripts/write-email-previews.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { previewMails } from "../email-previews.js";

const out = fileURLToPath(new URL("../../email-previews/", import.meta.url));
const transport = {
  sender: "no-reply@scholarscafe.com",
  adminOrigin: "https://admin.scholarscafe.com",
  contact: { sender: "contact@scholarscafe.com" },
};
await mkdir(out, { recursive: true });
const mails = previewMails({ ADMIN_ORIGIN: "https://admin.scholarscafe.com" }, transport);
const index = [];
for (const [i, p] of mails.entries()) {
  const name = `${String(i + 1).padStart(2, "0")}-${p.id}`;
  await writeFile(out + name + ".html", p.message.html);
  await writeFile(out + name + ".txt", p.message.text);
  index.push(
    `<li><a href="${name}.html">${p.label}</a> · <a href="${name}.txt">plain text</a><br><small>Subject: ${p.message.subject.replace(/</g, "&lt;")}</small></li>`,
  );
}
await writeFile(
  out + "index.html",
  `<!doctype html><meta charset="utf-8"><title>Scholars Cafe email previews</title><body style="font:15px/1.6 -apple-system,sans-serif;max-width:720px;margin:40px auto;padding:0 16px"><h1>Scholars Cafe email previews</h1><ol>${index.join("")}</ol></body>`,
);
console.log(`Wrote ${mails.length} emails to ${out}`);
