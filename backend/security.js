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
export function canManage(actor, targetRole, newRole) {
  return (
    actor === "owner" || (actor === "admin" && targetRole === "editor" && newRole === "editor")
  );
}
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
    role: z.enum(["owner", "admin", "editor"]),
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
    try { const url = new URL(s); return url.protocol === "https:" && !url.username && !url.password; }
    catch { return false; }
  }, "Use an HTTPS URL without embedded credentials");
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
  }),
  feedback: z.object({
    name: text,
    quote: text,
    destination: text,
    outcome: text,
    year: text,
    initials: text,
  }),
  courses: z.object({
    title: text,
    description: text,
    price: text,
    badge: text,
    features: z.array(text).max(50),
    cta: text,
    featured: z.boolean(),
  }),
  copy: z.record(z.string().max(200), text),
};
export const recordInput = z
  .object({
    id: z
      .string()
      .regex(/^[a-zA-Z0-9_.-]+$/)
      .max(120),
    kind: z.enum(["mentors", "blogs", "feedback", "courses", "copy"]),
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
