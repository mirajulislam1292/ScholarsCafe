// Native forms (Phase 5): a builder in the admin, public pages at scholarscafe.com/forms/<slug>, server-side
// validation (types, required, conditional fields, multi-step), Turnstile + rate limits, and every submission
// lands in the leads CRM (status, notes, assignment, CSV) with an email notification.
import { randomUUID } from "node:crypto";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { verifyTurnstile } from "./security.js";

export const FIELD_TYPES = [
  "text",
  "textarea",
  "email",
  "phone",
  "number",
  "date",
  "url",
  "select",
  "radio",
  "checkbox",
  "consent",
];
const CHOICE = new Set(["select", "radio", "checkbox"]);
const fieldId = z
  .string()
  .regex(/^[a-z][a-z0-9_]{0,39}$/, "Field ids: lowercase letters, digits, _");
const fieldSchema = z
  .object({
    id: fieldId,
    label: z.string().trim().min(1).max(300),
    type: z.enum(FIELD_TYPES),
    required: z.boolean().default(false),
    help: z.string().max(300).default(""),
    placeholder: z.string().max(120).default(""),
    options: z.array(z.string().trim().min(1).max(120)).max(50).default([]),
    max_length: z.number().int().min(1).max(5000).optional(),
    role: z.enum(["name", "email", "phone"]).nullable().default(null),
    show_if: z
      .object({ field: fieldId, equals: z.string().max(120) })
      .strict()
      .nullable()
      .default(null),
  })
  .strict()
  .refine((f) => !CHOICE.has(f.type) || f.options.length > 0, "Choice fields need options.");
export const definitionSchema = z
  .object({
    steps: z
      .array(
        z
          .object({
            title: z.string().max(120).default(""),
            fields: z.array(fieldSchema).min(1).max(40),
          })
          .strict(),
      )
      .min(1)
      .max(10),
  })
  .strict()
  .superRefine((def, ctx) => {
    const seen = new Set();
    for (const step of def.steps)
      for (const f of step.fields) {
        if (seen.has(f.id))
          ctx.addIssue({ code: "custom", message: `Duplicate field id "${f.id}".` });
        if (f.show_if && !seen.has(f.show_if.field))
          ctx.addIssue({
            code: "custom",
            message: `"${f.label}" depends on a field that must come before it.`,
          });
        seen.add(f.id);
      }
  });
const formInput = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, digits and dashes.")
      .max(60),
    title: z.string().trim().min(1).max(200),
    intro: z.string().max(2000).default(""),
    success: z.string().max(500).default("Thank you! We'll get back to you within 24 hours."),
    published: z.boolean().default(false),
    notify: z.boolean().default(true),
    definition: definitionSchema,
  })
  .strict();

/** The website's contact form, rebuilt as the first template (same fields and choices as Contact.tsx). */
export const INQUIRY_TEMPLATE = {
  slug: "inquiry",
  title: "Talk to Scholars Cafe",
  intro: "Tell us a little about you. We reply within 24 hours.",
  success: "Thank you! We'll get back to you within 24 hours.",
  published: false,
  notify: true,
  definition: {
    steps: [
      {
        title: "About you",
        fields: [
          { id: "name", label: "Full name", type: "text", required: true, role: "name" },
          { id: "email", label: "Email", type: "email", required: true, role: "email" },
          { id: "phone", label: "Phone / WhatsApp", type: "phone", required: true, role: "phone" },
          {
            id: "grade",
            label: "Current grade / year",
            type: "select",
            required: true,
            options: ["Grade 9", "Grade 10", "Grade 11", "Grade 12", "Gap Year", "Other"],
          },
        ],
      },
      {
        title: "Your plans",
        fields: [
          {
            id: "interest",
            label: "I'm interested in",
            type: "select",
            required: true,
            options: [
              "Full Scholarship Track",
              "General Admission Track",
              "File Opening",
              "Essay Review",
              "College List Building",
              "Visa Appointment Support",
              "CSS Profile / ISFAA",
              "Just Exploring",
            ],
          },
          {
            id: "country",
            label: "Target country",
            type: "select",
            // The site's enabled destinations today (Website → Countries) plus the contact form's extra choice.
            options: ["USA", "Other / Not Sure"],
          },
          { id: "message", label: "Anything else?", type: "textarea", max_length: 5000 },
        ],
      },
    ],
  },
};

const visible = (field, answers) =>
  !field.show_if ||
  (Array.isArray(answers[field.show_if.field])
    ? answers[field.show_if.field].includes(field.show_if.equals)
    : String(answers[field.show_if.field] ?? "") === field.show_if.equals);

/** Validates answers against a definition. Returns { clean } or { errors: {fieldId: message} }. */
export function validateAnswers(definition, raw) {
  const answers = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const clean = {};
  const errors = {};
  for (const step of definition.steps)
    for (const f of step.fields) {
      if (!visible(f, clean)) continue; // hidden fields are dropped, never stored
      const v = answers[f.id];
      const empty =
        v === undefined || v === null || v === "" || v === false || (Array.isArray(v) && !v.length);
      if (empty) {
        if (f.required) errors[f.id] = "Required.";
        continue;
      }
      const s = typeof v === "string" ? v.trim() : v;
      const max = f.max_length ?? (f.type === "textarea" ? 5000 : 300);
      const bad = (msg) => (errors[f.id] = msg);
      switch (f.type) {
        case "checkbox":
          if (!Array.isArray(s) || s.some((x) => !f.options.includes(x)))
            bad("Choose from the list.");
          else clean[f.id] = [...new Set(s)];
          break;
        case "consent":
          if (s !== true) bad("Please tick this box.");
          else clean[f.id] = true;
          break;
        default: {
          if (typeof s !== "string") {
            bad("Invalid answer.");
            break;
          }
          if (s.length > max) bad(`At most ${max} characters.`);
          else if (f.type === "email" && !z.string().email().safeParse(s).success)
            bad("Enter a valid email.");
          else if (f.type === "phone" && !/^[+0-9 ()-]{6,30}$/.test(s))
            bad("Enter a valid phone number.");
          else if (f.type === "number" && !/^-?\d+(\.\d+)?$/.test(s)) bad("Enter a number.");
          else if (f.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(s)) bad("Enter a date.");
          else if (f.type === "url" && !/^https:\/\/[^\s"'<>\\]+$/.test(s))
            bad("Enter an https:// link.");
          else if ((f.type === "select" || f.type === "radio") && !f.options.includes(s))
            bad("Choose from the list.");
          else clean[f.id] = s;
        }
      }
    }
  return Object.keys(errors).length ? { errors } : { clean };
}

/** Plain-text summary for the CRM and the notification email. */
export function summarize(definition, clean) {
  const lines = [];
  for (const step of definition.steps)
    for (const f of step.fields)
      if (f.id in clean)
        lines.push(
          `${f.label}: ${Array.isArray(clean[f.id]) ? clean[f.id].join(", ") : clean[f.id] === true ? "Yes" : clean[f.id]}`,
        );
  return lines.join("\n");
}

const json = (v) => (typeof v === "string" ? JSON.parse(v) : v);

/** Admin routes. Install AFTER the /api session middleware (they need req.actor). */
export function installFormAdminRoutes(app, { store, fail, canPublish }) {
  const q = (sql, args, c) => store.query(sql, args, c);
  const staffOnly = (req) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Forms are managed by owners and admins.");
  };

  // ---------- Admin ----------
  app.get("/api/forms", async (req, res) => {
    staffOnly(req);
    const rows = await q(
      `SELECT f.*,(SELECT COUNT(*) FROM inquiries i WHERE i.form_id=f.id) AS submissions,
        (SELECT COUNT(*) FROM inquiries i WHERE i.form_id=f.id AND i.status='new') AS unread
       FROM forms f WHERE f.deleted_at IS NULL ORDER BY f.created_at`,
    );
    res.json({
      items: rows.map((f) => ({
        ...f,
        published: Boolean(f.published),
        notify: Boolean(f.notify),
        definition: json(f.definition),
        submissions: Number(f.submissions),
        unread: Number(f.unread),
      })),
      template: INQUIRY_TEMPLATE,
    });
  });
  const save = async (req, res, existingId) => {
    staffOnly(req);
    const d = formInput.parse(req.body);
    const formId = existingId || randomUUID();
    await store.transaction(async (c) => {
      const [clash] = await q(
        "SELECT id FROM forms WHERE slug=? AND id<>? AND deleted_at IS NULL",
        [d.slug, formId],
        c,
      );
      if (clash) throw fail(409, "Another form already uses this address.");
      const values = [
        d.slug,
        d.title,
        d.intro,
        d.success,
        d.published,
        d.notify,
        JSON.stringify(d.definition),
      ];
      if (existingId) {
        const r = await q(
          "UPDATE forms SET slug=?,title=?,intro=?,success=?,published=?,notify=?,definition=?,updated_at=UTC_TIMESTAMP() WHERE id=? AND deleted_at IS NULL",
          [...values, formId],
          c,
        );
        if (!r.affectedRows) throw fail(404, "Form not found.");
      } else
        await q(
          "INSERT INTO forms (slug,title,intro,success,published,notify,definition,id) VALUES (?,?,?,?,?,?,?,?)",
          [...values, formId],
          c,
        );
      await store.audit(req.actor.id, existingId ? "form_update" : "form_create", d.slug, c);
    });
    res.status(existingId ? 200 : 201).json({ id: formId });
  };
  app.post("/api/forms", (req, res) => save(req, res, null));
  app.post("/api/forms/:id", (req, res) => save(req, res, z.string().uuid().parse(req.params.id)));
  app.post("/api/forms/:id/delete", async (req, res) => {
    staffOnly(req);
    const formId = z.string().uuid().parse(req.params.id);
    // Submissions stay in the CRM; the form just stops accepting new ones.
    const r = await q(
      "UPDATE forms SET deleted_at=UTC_TIMESTAMP(),published=0,slug=CONCAT(slug,'-deleted-',LEFT(id,8)) WHERE id=? AND deleted_at IS NULL",
      [formId],
    );
    if (!r.affectedRows) throw fail(404, "Form not found.");
    await store.audit(req.actor.id, "form_delete", formId);
    res.json({ ok: true });
  });
}

/** Public routes (scholarscafe.com/forms/<slug>). Install before the /api session middleware. */
export function installPublicFormRoutes(app, { store, fail, config, sharedLimit }) {
  const q = (sql, args, c) => store.query(sql, args, c);
  const cors = (req, res) => {
    if (req.headers.origin === config.PUBLIC_ORIGIN) {
      res.set("Access-Control-Allow-Origin", config.PUBLIC_ORIGIN);
      res.vary("Origin");
    }
  };
  const slugOf = (req) =>
    z
      .string()
      .regex(/^[a-z0-9-]{1,60}$/)
      .parse(req.params.slug);
  app.get("/public/forms/:slug", async (req, res) => {
    cors(req, res);
    const [f] = await q(
      "SELECT slug,title,intro,definition FROM forms WHERE slug=? AND published=1 AND deleted_at IS NULL",
      [slugOf(req)],
    );
    if (!f) throw fail(404, "This form isn't available.");
    res.json({ ...f, definition: json(f.definition) });
  });
  app.options("/public/forms/:slug", (req, res) => {
    if (req.headers.origin !== config.PUBLIC_ORIGIN) return res.sendStatus(403);
    cors(req, res);
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(204);
  });
  app.post(
    "/public/forms/:slug",
    rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 10,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
    (req, res, next) => {
      if (req.headers.origin !== config.PUBLIC_ORIGIN)
        return res.status(403).json({ error: "Website origin required." });
      cors(req, res);
      if (!req.is("application/json")) return res.status(415).json({ error: "JSON required." });
      next();
    },
    sharedLimit("submissions", 20, 3600),
    async (req, res) => {
      const body = z
        .object({
          answers: z.record(z.string(), z.unknown()),
          turnstileToken: z.string().max(2048).optional(),
          website: z.string().max(200).optional(), // honeypot
        })
        .strict()
        .parse(req.body);
      if (body.website) return res.json({ ok: true });
      if (config.TURNSTILE_SECRET_KEY) {
        const verify = config.verifyTurnstile || verifyTurnstile;
        if (
          !body.turnstileToken ||
          !(await verify(config.TURNSTILE_SECRET_KEY, body.turnstileToken))
        )
          return res.status(400).json({ error: "Please complete the verification and try again." });
      }
      const [form] = await q(
        "SELECT id,title,success,notify,definition FROM forms WHERE slug=? AND published=1 AND deleted_at IS NULL",
        [slugOf(req)],
      );
      if (!form) throw fail(404, "This form isn't available.");
      const def = json(form.definition);
      const result = validateAnswers(def, body.answers);
      if (result.errors)
        return res
          .status(400)
          .json({ error: "Please check the highlighted answers.", fields: result.errors });
      const pick = (role) => {
        const f = def.steps.flatMap((s) => s.fields).find((x) => x.role === role);
        return f && typeof result.clean[f.id] === "string" ? result.clean[f.id] : "";
      };
      const name = pick("name").slice(0, 160) || "(no name)";
      const email = pick("email").slice(0, 254);
      const phone = pick("phone").slice(0, 80);
      const message = summarize(def, result.clean);
      await store.transaction(async (c) => {
        await q(
          "INSERT INTO inquiries (id,name,email,phone,message,form_id,data) VALUES (?,?,?,?,?,?,?)",
          [randomUUID(), name, email, phone, message, form.id, JSON.stringify(result.clean)],
          c,
        );
        if (form.notify)
          await q(
            "INSERT INTO mail_outbox (id,subject,body,reply_to) VALUES (?,?,?,?)",
            [randomUUID(), "New form submission: " + form.title, message, email || null],
            c,
          );
      });
      res.status(201).json({ ok: true, message: form.success });
    },
  );
}
