// Agreements: the wording rules shared by the server, the PDF and the tests. A template body is plain text:
// a blank line starts a new paragraph, a line starting with "## " is a section heading, and {{key}} is a
// field (built-in or one the template adds). {{date}} is the signing date in Dhaka time.
import { createHash } from "node:crypto";

export const BUILTIN_FIELDS = Object.freeze([
  { key: "name", label: "Full legal name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone / WhatsApp", type: "tel" },
  { key: "id_number", label: "NID or passport number", type: "text", sensitive: true },
  { key: "cohort", label: "Role / cohort", type: "text" },
]);
export const AUTO_FIELDS = ["date"];
export const FIELD_KEY = /^[a-z][a-z0-9_]{0,39}$/;
const PLACEHOLDER = /\{\{\s*([a-z][a-z0-9_]{0,39})\s*\}\}/g;

/** The exact words the signer agrees to. Stored with every signed record. */
export const CONSENT_TEXT =
  "I have read this agreement, the details above are correct, and I agree that my electronic signature is legally binding, the same as signing on paper.";

/** Field keys used in a body, in order of first use. */
export const placeholders = (body) => [
  ...new Set([...String(body || "").matchAll(PLACEHOLDER)].map((m) => m[1])),
];

/** Body → [{ heading?: string, parts: [{ text } | { key }] }] (used by the PDF and the pages). */
export function parseBody(body) {
  return String(body || "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n");
      const out = [];
      let rest = lines;
      if (/^##\s+/.test(lines[0])) {
        out.push({ heading: lines[0].replace(/^##\s+/, "").trim(), parts: [] });
        rest = lines.slice(1);
      }
      if (rest.length) out.push({ parts: splitParts(rest.join("\n")) });
      return out;
    })
    .flat();
}
function splitParts(text) {
  const parts = [];
  let last = 0;
  for (const m of text.matchAll(PLACEHOLDER)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ key: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

/** Body with every {{key}} replaced. Missing values become `missing(key)`. */
export const fillBody = (body, values, missing = () => "Not provided") =>
  String(body || "").replace(PLACEHOLDER, (_m, key) => {
    const v = values[key];
    return typeof v === "string" && v.trim() ? v.trim() : missing(key);
  });

/**
 * The canonical signed text: this exact string is stored and its SHA-256 recorded. Changing this function
 * would change future hashes only; signed records keep the text they were signed with.
 */
export function renderAgreementText({ title, subtitle, ref, issued, body, values }) {
  return [
    title,
    subtitle || "",
    `Ref: ${ref}`,
    `Issued: ${issued}`,
    "",
    fillBody(body, values).replace(/\r\n?/g, "\n").trim(),
    "",
  ].join("\n");
}
export const sha256 = (data) => createHash("sha256").update(data).digest("hex");

// Dhaka time (UTC+6, no daylight saving).
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const dhaka = (d) => new Date(new Date(d).getTime() + 6 * 3600 * 1000);
/** "27 November 2026" */
export function dhakaDate(d) {
  const t = dhaka(d);
  return `${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]} ${t.getUTCFullYear()}`;
}
/** "27 November 2026, 2:05 PM (Dhaka time)" */
export function dhakaTime(d) {
  const t = dhaka(d);
  const h = t.getUTCHours();
  const m = String(t.getUTCMinutes()).padStart(2, "0");
  return `${dhakaDate(d)}, ${h % 12 || 12}:${m} ${h < 12 ? "AM" : "PM"} (Dhaka time)`;
}

/** "A01234567" → "•••••4567". Used for NID and passport numbers outside the signed record. */
export function mask(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  if (s.length <= 4) return "••••";
  return "•".repeat(Math.min(s.length - 4, 6)) + s.slice(-4);
}
/** "nusrat.jahan@example.com" → "nu••••••@example.com" */
export function maskEmail(email) {
  const [user, domain] = String(email || "").split("@");
  if (!domain) return "";
  return user.slice(0, 2) + "•".repeat(Math.max(2, Math.min(user.length - 2, 6))) + "@" + domain;
}

/** Checks one value the recipient typed. Returns an error message or "". Same rules as the signing page. */
export function checkValue(field, raw) {
  const v = typeof raw === "string" ? raw.trim() : "";
  if (!v) return field.required ? `Enter your ${field.label.toLowerCase()}.` : "";
  if (v.length > 300) return "Keep this under 300 characters.";
  if (/[\u0000-\u001f\u007f]/.test(v)) return "Remove special characters.";
  if (field.key === "name" && v.length < 2) return "Enter your full name as on your ID.";
  if ((field.key === "email" || field.type === "email") && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))
    return "Enter a valid email address.";
  if (field.key === "phone" || field.type === "tel") {
    if (!/^[+0-9 ()-]{6,30}$/.test(v) || (v.match(/\d/g) || []).length < 10)
      return "Enter a phone number with country code.";
  }
  if (field.key === "id_number" && !/^[A-Za-z0-9 -]{6,30}$/.test(v))
    return "Enter your NID or passport number.";
  return "";
}

/** The sample wording from the approved prototype. Staff must review it before use. */
export const SAMPLE_TEMPLATE = Object.freeze({
  title: "Mentorship Services Agreement",
  subtitle: "Between Scholars Cafe and the student named below",
  body: `This agreement is made between Scholars Cafe ("we") and {{name}}, holder of NID or passport number {{id_number}}, reachable at {{email}} and {{phone}} ("you"), joining as {{cohort}}.

## 1. What we will do
We will give you one-to-one mentorship for your US applications: building a college list, planning and reviewing essays, preparing financial aid forms such as the CSS Profile and ISFAA, and preparing for your F-1 visa interview.

## 2. What we cannot promise
Admission, scholarship and visa decisions are made by universities and the US government. We will give you our best guidance, but we do not and cannot guarantee any outcome.

## 3. What you agree to
You will share accurate information and documents, write your own essays, and keep to the deadlines you set with your mentor.

## 4. Fees
Any fees are those listed in the program confirmation sent to your email address above. Nothing in this agreement adds a fee.

## 5. Your privacy
We use your details only to deliver this mentorship. We do not share them with anyone without your consent, unless the law requires it.

## 6. Ending the agreement
Either of us may end this agreement with 14 days' written notice by email.

## 7. Governing law
This agreement is governed by the laws of Bangladesh.`,
});
