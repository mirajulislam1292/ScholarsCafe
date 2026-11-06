import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const token = () => randomBytes(32).toString("hex");
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export function equal(a, b) {
  return (
    typeof a === "string" &&
    typeof b === "string" &&
    Buffer.byteLength(a) === Buffer.byteLength(b) &&
    timingSafeEqual(Buffer.from(a), Buffer.from(b))
  );
}
// Roles: owner (Super Admin) > admin > editor | mentor | student. Admins may manage editors, mentors and students only.
const ADMIN_MANAGED = ["editor", "mentor", "student"];
export function canManage(actor, targetRole, newRole) {
  return (
    actor === "owner" ||
    (actor === "admin" && ADMIN_MANAGED.includes(targetRole) && ADMIN_MANAGED.includes(newRole))
  );
}
export const canEditContent = (role) => role === "owner" || role === "admin" || role === "editor";
export const canPublish = (role) => role === "owner" || role === "admin";
export function trustedGoogleIdentity(payload, nonce) {
  return (
    !!payload &&
    payload.email_verified === true &&
    equal(payload.nonce, nonce) &&
    typeof payload.sub === "string" &&
    typeof payload.email === "string" &&
    (payload.email.toLowerCase().endsWith("@gmail.com") || typeof payload.hd === "string")
  );
}
export const userInput = z
  .object({
    email: z
      .string()
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    role: z.enum(["owner", "admin", "editor", "mentor", "student"]),
    active: z.boolean(),
  })
  .strict();
// Text is rendered as text, never executable HTML. Limits also bound DB usage.
const text = z.string().max(100000);
const safeUrl = z
  .string()
  .max(2000)
  .refine((s) => {
    if (!s) return true;
    try {
      const url = new URL(s);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Use an HTTPS URL without embedded credentials");
// HTTPS URL or a path on the public site (e.g. /media/hero/clip.mp4). No protocol-relative "//".
const safeUrlOrPath = z
  .string()
  .max(2000)
  .refine(
    (s) =>
      !s || (/^\/(?!\/)[\w\-./%]*$/.test(s) && !s.includes("..")) || safeUrl.safeParse(s).success,
    "Use an HTTPS URL or a site path starting with /",
  );
const position = z.number().int().min(0).max(10000).optional();
const short = z.string().max(300);
const fields = {
  mentors: z.object({ name: text, role: text, bio: text, photo: safeUrl, initials: text }),
  blogs: z.object({
    title: text,
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100),
    body: text,
    excerpt: text,
    author: text,
    image: safeUrl,
    date: z
      .string()
      .regex(/^(\d{4}-\d{2}-\d{2})?$/)
      .optional(),
  }),
  feedback: z.object({
    position,
    name: text,
    quote: text,
    destination: text,
    outcome: text,
    year: text,
    initials: text,
  }),
  courses: z.object({
    position,
    title: text,
    description: text,
    price: text,
    badge: text,
    features: z.array(text).max(50),
    cta: text,
    featured: z.boolean(),
  }),
  copy: z.record(z.string().max(200), text),
  universities: z.object({ name: short, position }),
  team: z.object({
    name: short,
    group: z.enum(["founder", "mentor"]),
    role: short,
    title: short,
    line: short,
    photo: safeUrlOrPath,
    position,
  }),
  faqs: z.object({ q: short, a: text, position }),
  // Public resources (guides, templates, live links). Package-only student material is private (Phase 3).
  resources: z.object({
    title: short,
    category: z.enum(["guide", "video", "live", "course", "template", "other"]),
    country: short,
    url: safeUrlOrPath,
    description: text,
    image: safeUrlOrPath,
    position,
  }),
  // The /links page (link-in-bio).
  links: z.object({
    // link = button, social = icon row, youtube = video card (thumbnail; opens YouTube).
    type: z.enum(["link", "social", "youtube"]).optional(),
    platform: z
      .enum([
        "instagram",
        "facebook",
        "youtube",
        "tiktok",
        "linkedin",
        "whatsapp",
        "email",
        "website",
      ])
      .optional(),
    label: short,
    url: safeUrlOrPath,
    note: short,
    highlight: z.boolean(),
    enabled: z.boolean(),
    position,
  }),
  countries: z.object({ name: short, enabled: z.boolean(), position }),
  hero: z.object({
    place: short,
    device: z.enum(["desktop", "mobile"]),
    mp4: safeUrlOrPath,
    webm: safeUrlOrPath,
    poster: safeUrlOrPath,
    credit: short,
    rate: z.number().min(0.5).max(1.5),
    enabled: z.boolean(),
    position,
  }),
  seo: z.object({
    page: z
      .string()
      .regex(/^\/[a-z-]*$/)
      .max(60),
    title: z.string().max(70),
    description: z.string().max(170),
  }),
  sections: z.object({
    page: z
      .string()
      .regex(/^\/[a-z-]*$/)
      .max(60),
    order: z
      .string()
      .regex(/^[a-z-]+(,[a-z-]+)*$/)
      .max(500),
    hidden: z
      .string()
      .regex(/^([a-z-]+(,[a-z-]+)*)?$/)
      .max(500),
  }),
};
export const KINDS = Object.keys(fields);
export const recordInput = z
  .object({
    id: z
      .string()
      .regex(/^[a-zA-Z0-9_.-]+$/)
      .max(120),
    kind: z.enum([
      "mentors",
      "blogs",
      "feedback",
      "courses",
      "copy",
      "universities",
      "team",
      "faqs",
      "countries",
      "hero",
      "seo",
      "sections",
      "resources",
      "links",
    ]),
    title: z.string().min(1).max(255),
    data: z.unknown(),
    version: z.number().int().nonnegative(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const parsed = fields[value.kind].strict
      ? fields[value.kind].strict().safeParse(value.data)
      : fields[value.kind].safeParse(value.data);
    if (!parsed.success) ctx.addIssue({ code: "custom", message: "Invalid content fields" });
  });

// Cloudflare Turnstile server-side check. Fails closed on network errors or timeouts.
export async function verifyTurnstile(secret, responseToken) {
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: responseToken }),
      signal: AbortSignal.timeout(8000),
    });
    const result = await response.json();
    return result?.success === true;
  } catch {
    return false;
  }
}

// Leads (website inquiries) CRM
export const LEAD_STATUSES = ["new", "contacted", "enrolled", "closed"];
export const leadUpdate = z
  .object({
    status: z.enum(LEAD_STATUSES).optional(),
    notes: z.string().max(5000).optional(),
    assigned_to: z.string().uuid().nullable().optional(),
  })
  .strict();
/** CSV cell: quote, double inner quotes, and neutralise spreadsheet formulas. */
export function csvCell(value) {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}
