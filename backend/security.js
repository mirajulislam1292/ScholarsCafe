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
import { can } from "./permissions.js";
// Roles and what they may do live in permissions.js. Only the Owner manages users and roles.
export function canManage(actor, _targetRole, _newRole) {
  return can(actor, "users.manage");
}
export const canEditContent = (role) => can(role, "content.write");
export const canPublish = (role) => can(role, "content.publish");
// Kept for older callers: the Owner role (no email check). Owner-only rules use permissions.js.
export const superAdminEmail = (config) =>
  (config.SUPER_ADMIN_EMAIL || config.OWNER_EMAIL || "contact.scholarscafe@gmail.com")
    .trim()
    .toLowerCase();
export const isSuperAdmin = (actor, _config) => actor?.role === "owner";
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

// College directory (/colleges). One flat entry per college, so the generic editor can show it.
// Every figure is a text box plus a "<figure>Source" box. Blank figure = not published (the site
// says so); a figure that is filled in must have an HTTPS source. Entries override the built-in
// list (src/data/college-directory.ts) by slug, or add a new college.
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const blankOr = (re) =>
  z
    .string()
    .max(40)
    .regex(new RegExp(`^(${re.source.slice(1, -1)})?$`));
export const COLLEGE_FIGURES = {
  applicants: blankOr(/^\d{1,7}$/),
  admitted: blankOr(/^\d{1,7}$/),
  edApplicants: blankOr(/^\d{1,7}$/),
  edAdmitted: blankOr(/^\d{1,7}$/),
  eaApplicants: blankOr(/^\d{1,7}$/),
  eaAdmitted: blankOr(/^\d{1,7}$/),
  sat: blankOr(/^\d{3,4}-\d{3,4}$/),
  act: blankOr(/^\d{1,2}(\.\d)?-\d{1,2}(\.\d)?$/),
  testPolicy: z.enum(["", "required", "optional", "test-blind"]),
  needBasedForIntl: z.enum(["", "yes", "no"]),
  intlAidPolicy: z.enum(["", "need-blind", "need-aware", "merit-only", "limited", "none"]),
  intlAided: blankOr(/^\d{1,6}$/),
  intlAvgAward: blankOr(/^\d{1,7}$/),
  tuition: blankOr(/^\d{1,7}$/),
  fees: blankOr(/^\d{1,7}$/),
  roomBoard: blankOr(/^\d{1,7}$/),
  ielts: blankOr(/^(\d(\.\d)?|none)$/),
  toefl: blankOr(/^(\d{1,3}|none)$/),
  duolingo: blankOr(/^(\d{1,3}|none)$/),
  nationalCurriculum: z.string().max(1000),
  ed1: blankOr(/^(\d{4}-\d{2}-\d{2}|not-offered)$/),
  ed2: blankOr(/^(\d{4}-\d{2}-\d{2}|not-offered)$/),
  ea: blankOr(/^(\d{4}-\d{2}-\d{2}|not-offered)$/),
  rd: blankOr(/^(\d{4}-\d{2}-\d{2}|not-offered)$/),
};
const collegeNote = z.string().max(1000);
const colleges = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100),
    name: z.string().trim().min(1).max(200),
    collegeType: z.enum(["LAC", "NU"]),
    city: short,
    state: short,
    code: z.string().regex(/^[A-Z]{2}$/),
    rankLabel: short,
    rankEdition: short,
    rankSource: safeUrl,
    asOf: z.string().regex(DATE),
    cdsYear: short,
    ...COLLEGE_FIGURES,
    ...Object.fromEntries(Object.keys(COLLEGE_FIGURES).map((k) => [k + "Source", safeUrl])),
    earlyNote: collegeNote,
    testNote: collegeNote,
    policyQuote: collegeNote,
    intlNote: collegeNote,
    costYear: short,
    costNote: collegeNote,
    englishNote: collegeNote,
    deadlineNote: collegeNote,
    highlight: z.string().max(400),
    // Photo: same licence fields as the state briefs. With a photo, its page and licence are required.
    image: safeUrlOrPath,
    imageTitle: short,
    imagePage: safeUrl,
    imageAuthor: short,
    imageLicence: short,
    imageLicenceUrl: safeUrl,
    urlAdmissions: safeUrl,
    urlInternational: safeUrl,
    urlAid: safeUrl,
    urlCds: safeUrl,
    // Hide a built-in college from the site without deleting anything.
    hidden: z.boolean(),
    position,
  })
  .strict()
  .superRefine((d, ctx) => {
    for (const k of Object.keys(COLLEGE_FIGURES))
      if (String(d[k]).trim() && !d[k + "Source"])
        ctx.addIssue({ code: "custom", path: [k + "Source"], message: `Add a source for ${k}` });
    if (d.image && (!d.imagePage || !d.imageLicence))
      ctx.addIssue({ code: "custom", path: ["imageLicence"], message: "Photo needs its licence" });
  });
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
    // Section on the About page: founder, mentor, or any name (e.g. "Executive members").
    group: z.string().trim().min(1).max(60),
    role: short,
    title: short,
    line: short,
    photo: safeUrlOrPath,
    // Optional profile links (HTTPS). The icon is shown only when a link is set.
    linkedin: safeUrl.optional(),
    instagram: safeUrl.optional(),
    facebook: safeUrl.optional(),
    position,
    // Set by the visual editor's team layout: the section (a teamSections entry id) and the order
    // inside it. Members without them sit in the first section, in the order they had before.
    section: z
      .string()
      .regex(/^[a-zA-Z0-9_.-]+$/)
      .max(120)
      .optional(),
    rank: position,
  }),
  // Sections (divisions) of the team on the About page, e.g. "Leadership", "Mentors". Edited only in
  // the visual editor; a section with nobody in it is hidden on the website.
  teamSections: z.object({ name: z.string().trim().min(1).max(60), position }),
  faqs: z.object({ q: short, a: text, position }),
  // Public resources (guides, templates, live links). Package-only student material is private (Phase 3).
  resources: z.object({
    title: short,
    // webinar/live/video show on scholarscafe.com/resources/webinars; podcast on /resources/podcast
    // ("broadcast" is the old name of podcast and still accepted, so older entries keep working).
    category: z.enum([
      "guide",
      "video",
      "live",
      "webinar",
      "podcast",
      "broadcast",
      "course",
      "template",
      "other",
    ]),
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
  // /resources/tools: supplemental essay prompts (quoted from the college's own page; source required).
  prompts: z.object({
    college: z.string().trim().min(1).max(200),
    list: z.enum(["lac", "nu", "other"]),
    cycle: z
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .max(7),
    text: z.string().trim().min(1).max(5000),
    // 0 = no word limit (or a character limit, explained in limitNote).
    wordLimit: z.number().int().min(0).max(5000),
    limitNote: short,
    required: z.enum(["required", "optional", "none"]),
    archetype: z.enum([
      "why-us",
      "community",
      "intellectual",
      "extracurricular",
      "short-answer",
      "other",
    ]),
    source: safeUrl.refine((s) => s.length > 0, "A source URL is required"),
    asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    position,
  }),
  // /resources/tools: Core Values cards.
  toolValues: z.object({ label: z.string().trim().min(1).max(60), hint: short, position }),
  // /resources/tools: brainstorming angles per prompt archetype (our own wording).
  promptAngles: z.object({
    archetype: z.enum([
      "why-us",
      "community",
      "intellectual",
      "extracurricular",
      "short-answer",
      "other",
    ]),
    angle: z.string().trim().min(1).max(1000),
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
  colleges,
};
export const KINDS = Object.keys(fields);
/** True when `data` is valid content for `kind` (same rules as saving in the admin). */
export function contentValid(kind, data) {
  const schema = fields[kind];
  if (!schema) return false;
  return (schema.strict ? schema.strict() : schema).safeParse(data).success;
}
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
      "colleges",
      "prompts",
      "toolValues",
      "promptAngles",
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
