// Native forms (Phase 5): a builder in the admin, public pages at scholarscafe.com/forms/<slug>, server-side
// validation (types, required, conditional fields, multi-step), Turnstile + rate limits, and every submission
// lands in the leads CRM (status, notes, assignment, CSV) with an email notification.
import { randomUUID, createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, open, stat, unlink } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { verifyTurnstile } from "./security.js";
import { makeToken, readToken } from "./tokens.js";
import { checkFile, FILE_TYPES, MAX_FILE } from "./files.js";
import { FORM_TEMPLATES } from "./form-templates.js";
import { xlsx } from "./xlsx.js";
import { importId, mapResponses, parseCsv, pickRole } from "./form-import.js";

export { FORM_TEMPLATES };
// Form attachments live next to student files, outside the web root, under a random id.
const uploadDir = (config) =>
  join(config.FILE_DIR || join(homedir(), "sc-private", "files"), "forms");
const uploadPath = (config, id) => join(uploadDir(config), id);
export const COVERS = ["campus-early-fall", "library", "students-walking", "oklahoma-autumn"];
const UPLOAD_TICKET_SECONDS = 6 * 60 * 60;
const UPLOADS_TOTAL = 3 * 1024 * 1024 * 1024; // all form attachments together
const FILE_HELP = "PDF, Word (.docx), text, PNG or JPEG, up to 10 MB.";

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
  "time",
  "file",
  "info",
];
const CHOICE = new Set(["select", "radio", "checkbox"]);
/** A choice starting with "# " is a heading inside the list, not something people can pick. */
export const isHeading = (option) => option.startsWith("# ");
const choices = (f) => (f.options || []).filter((o) => !isHeading(o));
const OTHER_MAX = 300;
const fieldId = z
  .string()
  .regex(/^[a-z][a-z0-9_]{0,39}$/, "Field ids: lowercase letters, digits, _");
const fieldSchema = z
  .object({
    id: fieldId,
    label: z.string().trim().min(1).max(1000),
    type: z.enum(FIELD_TYPES),
    required: z.boolean().default(false),
    help: z.string().max(3000).default(""),
    placeholder: z.string().max(120).default(""),
    options: z.array(z.string().trim().min(1).max(200)).max(60).default([]),
    // Radio and checkbox questions can add an "Other: ___" choice with a text box.
    other: z.boolean().default(false),
    max_length: z.number().int().min(1).max(5000).optional(),
    role: z.enum(["name", "email", "phone"]).nullable().default(null),
    show_if: z
      .object({ field: fieldId, equals: z.string().max(120) })
      .strict()
      .nullable()
      .default(null),
  })
  .strict()
  .refine((f) => !CHOICE.has(f.type) || choices(f).length > 0, "Choice fields need options.")
  .refine((f) => f.type !== "info" || !f.required, "A text block can't be required.");
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
    const all = def.steps.flatMap((s) => s.fields);
    if (all.every((f) => f.type === "info"))
      ctx.addIssue({ code: "custom", message: "Add at least one question." });
    if (all.filter((f) => f.type === "file").length > 5)
      ctx.addIssue({ code: "custom", message: "A form can have at most 5 file questions." });
  });
const formInput = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, digits and dashes.")
      .max(60),
    title: z.string().trim().min(1).max(200),
    intro: z.string().max(10000).default(""),
    success: z.string().max(500).default("Thank you! We'll get back to you within 24 hours."),
    published: z.boolean().default(false),
    notify: z.boolean().default(true),
    // Email people a copy of their answers when the form has an email question.
    receipt: z.boolean().default(true),
    // Header photo: one of the website's photos ("site:library") or an uploaded image link.
    cover: z
      .string()
      .max(500)
      .regex(
        new RegExp(`^(site:(${COVERS.join("|")})|https://[^\\s"'<>\\\\]+)?$`),
        "Pick one of the photos or upload an image.",
      )
      .default(""),
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
export function validateAnswers(definition, raw, { formId } = {}) {
  const answers = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const clean = {};
  const errors = {};
  for (const step of definition.steps)
    for (const f of step.fields) {
      if (f.type === "info" || !visible(f, clean)) continue; // hidden fields are dropped, never stored
      const v = answers[f.id];
      const empty =
        v === undefined ||
        v === null ||
        v === false ||
        (typeof v === "string" && !v.trim()) ||
        (Array.isArray(v) && !v.length);
      if (empty) {
        if (f.required) errors[f.id] = "Required.";
        continue;
      }
      const s = typeof v === "string" ? v.trim() : v;
      const max = f.max_length ?? (f.type === "textarea" ? 5000 : 300);
      const bad = (msg) => (errors[f.id] = msg);
      switch (f.type) {
        case "checkbox": {
          const list = Array.isArray(s)
            ? s.map((x) => (typeof x === "string" ? x.trim() : x))
            : null;
          // Anything not in the list is the "Other" text: allowed once, only when the question has Other.
          const extra = list ? list.filter((x) => !choices(f).includes(x)) : [];
          if (
            !list ||
            extra.length > (f.other ? 1 : 0) ||
            extra.some((x) => typeof x !== "string" || !x || x.length > OTHER_MAX)
          )
            bad(f.other && extra.length === 1 ? 'Keep "Other" short.' : "Choose from the list.");
          else clean[f.id] = [...new Set(list)];
          break;
        }
        case "file": {
          // The answer is the upload ticket the upload route handed out; the route checks the upload itself.
          const t = typeof s === "string" ? readToken(s) : null;
          if (!t || !t.fu || t.ff !== formId) bad("Please upload the file again.");
          else clean[f.id] = { upload: t.fu };
          break;
        }
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
          else if (f.type === "time" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(s)) bad("Enter a time.");
          else if (f.type === "url" && !/^https:\/\/[^\s"'<>\\]+$/.test(s))
            bad("Enter an https:// link.");
          else if (
            (f.type === "select" || f.type === "radio") &&
            !choices(f).includes(s) &&
            !(f.type === "radio" && f.other && s.length <= OTHER_MAX)
          )
            bad("Choose from the list.");
          else clean[f.id] = s;
        }
      }
    }
  return Object.keys(errors).length ? { errors } : { clean };
}

/** The email the person gets: thanks, and a copy of their answers. */
export function receiptText(title, name, summary) {
  const hi = name && name !== "(no name)" ? `Hi ${name.split(/\s+/)[0]},` : "Hi,";
  return [
    hi,
    "",
    `Thank you for filling in "${title}". We have received your response. Here is a copy of your answers:`,
    "",
    summary,
    "",
    "If anything needs to change, reply to this email or write to contact@scholarscafe.com.",
    "",
    "Scholars Cafe",
    "https://scholarscafe.com",
    "",
    "You are getting this automatic email because this address was entered on a form at scholarscafe.com.",
  ].join("\n");
}
/** One answer as plain text (lists joined, files by name). */
export function answerText(v) {
  if (Array.isArray(v)) return v.join(", ");
  if (v === true) return "Yes";
  if (v && typeof v === "object") return v.name ? `${v.name} (file)` : "(file)";
  return v == null ? "" : String(v);
}
/** Plain-text summary for the CRM and the notification email. */
export function summarize(definition, clean) {
  const lines = [];
  for (const step of definition.steps)
    for (const f of step.fields)
      if (f.id in clean) lines.push(`${f.label}: ${answerText(clean[f.id])}`);
  return lines.join("\n");
}

const json = (v) => (typeof v === "string" ? JSON.parse(v) : v);

/** Admin routes. Install AFTER the /api session middleware (they need req.actor). */
/**
 * Put each built-in form on the live site once, published, so a fresh database has them without a manual
 * step. A marker in settings means a form the team later edits, unpublishes or deletes is never re-added.
 */
export async function seedFormTemplates(store) {
  const added = [];
  for (const t of FORM_TEMPLATES) {
    const marker = await store.query("INSERT IGNORE INTO settings (name,value) VALUES (?,?)", [
      `form_seed:${t.slug}`,
      "1",
    ]);
    if (!marker?.affectedRows) continue;
    const [taken] = await store.query("SELECT id FROM forms WHERE slug=? AND deleted_at IS NULL", [
      t.slug,
    ]);
    if (taken) continue;
    const d = formInput.parse({ ...t, published: true });
    await store.query(
      "INSERT INTO forms (slug,title,intro,success,published,notify,definition,cover,receipt,id) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [
        d.slug,
        d.title,
        d.intro,
        d.success,
        d.published,
        d.notify,
        JSON.stringify(d.definition),
        d.cover || null,
        d.receipt,
        randomUUID(),
      ],
    );
    added.push(d.slug);
  }
  return added;
}

export function installFormAdminRoutes(app, { store, fail, canPublish, config }) {
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
        receipt: f.receipt === undefined || f.receipt === null ? true : Boolean(f.receipt),
        definition: json(f.definition),
        submissions: Number(f.submissions),
        unread: Number(f.unread),
      })),
      template: INQUIRY_TEMPLATE,
      templates: FORM_TEMPLATES,
    });
  });

  // ---------- Responses: a table per form, an Excel download, and attached files ----------
  const responses = async (formId) => {
    const [form] = await q("SELECT id,slug,title,definition FROM forms WHERE id=?", [formId]);
    if (!form) throw fail(404, "Form not found.");
    const def = json(form.definition);
    const rows = await q(
      "SELECT id,created_at,status,name,email,phone,data FROM inquiries WHERE form_id=? ORDER BY created_at DESC LIMIT 5000",
      [formId],
    );
    const items = rows.map((r) => ({ ...r, data: json(r.data) || {} }));
    const columns = def.steps
      .flatMap((s) => s.fields)
      .filter((f) => f.type !== "info")
      .map((f) => ({ id: f.id, label: f.label, type: f.type }));
    // Answers to questions that were later removed from the form are kept, at the end.
    const known = new Set(columns.map((c) => c.id));
    for (const r of items)
      for (const k of Object.keys(r.data))
        if (!known.has(k)) (known.add(k), columns.push({ id: k, label: k, type: "removed" }));
    return { form, columns, items };
  };
  app.get("/api/forms/:id/responses", async (req, res) => {
    staffOnly(req);
    const { form, columns, items } = await responses(z.string().uuid().parse(req.params.id));
    res.json({ form: { id: form.id, slug: form.slug, title: form.title }, columns, items });
  });
  app.get("/api/forms/:id/responses.xlsx", async (req, res) => {
    staffOnly(req);
    const { form, columns, items } = await responses(z.string().uuid().parse(req.params.id));
    const fileLink = (v) => ({
      text: v.name || "file",
      link: `${config.ADMIN_ORIGIN}/api/forms/uploads/${v.file}`,
    });
    const body = xlsx({
      sheet: form.title,
      header: [
        "Submitted (UTC)",
        "Status",
        ...columns.map((c) => c.label.split("\n")[0].slice(0, 200)),
      ],
      widths: [20, 12, ...columns.map((c) => (c.type === "textarea" ? 50 : 28))],
      rows: items.map((r) => [
        r.created_at instanceof Date ? r.created_at : new Date(r.created_at),
        r.status,
        ...columns.map((c) => {
          const v = r.data[c.id];
          return v && typeof v === "object" && !Array.isArray(v) && v.file
            ? fileLink(v)
            : answerText(v);
        }),
      ]),
    });
    await store.audit(req.actor.id, "form_export", form.id);
    res
      .set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      .set("Content-Disposition", `attachment; filename="${form.slug}-responses.xlsx"`)
      .set("Cache-Control", "private, no-store")
      .send(body);
  });
  // Old responses from Google Forms (CSV). Owner/admin only; rows already imported are skipped.
  app.post(
    "/api/forms/:id/import",
    express.text({ type: ["text/csv", "text/plain"], limit: "8mb" }),
    async (req, res) => {
      staffOnly(req);
      const formId = z.string().uuid().parse(req.params.id);
      const status = z
        .enum(["new", "contacted", "enrolled", "closed"])
        .default("contacted")
        .parse(req.query.status || undefined);
      if (typeof req.body !== "string" || !req.body.trim())
        throw fail(400, "Choose the CSV file you downloaded from Google Forms.");
      const [form] = await q("SELECT id,definition FROM forms WHERE id=? AND deleted_at IS NULL", [
        formId,
      ]);
      if (!form) throw fail(404, "Form not found.");
      const def = json(form.definition);
      const { items, matched, unmatched } = mapResponses(def, parseCsv(req.body));
      if (!matched.length)
        throw fail(400, "None of the columns match this form's questions. Is it the right file?");
      if (items.length > 5000) throw fail(413, "Import at most 5,000 responses at a time.");
      let added = 0;
      await store.transaction(async (c) => {
        for (const item of items) {
          const r = await q(
            "INSERT IGNORE INTO inquiries (id,name,email,phone,message,form_id,data,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
            [
              importId(formId, item),
              pickRole(def, item.data, "name").slice(0, 160) || "(no name)",
              pickRole(def, item.data, "email").slice(0, 254),
              pickRole(def, item.data, "phone").slice(0, 80),
              summarize(def, item.data).slice(0, 20000),
              formId,
              JSON.stringify(item.data),
              status,
              item.createdAt || new Date(),
            ],
            c,
          );
          added += r?.affectedRows ? 1 : 0;
        }
        await store.audit(req.actor.id, "form_import", `${formId}:${added}`, c);
      });
      res.json({ added, skipped: items.length - added, matched, unmatched });
    },
  );
  app.get("/api/forms/uploads/:id", async (req, res) => {
    staffOnly(req);
    const [f] = await q(
      "SELECT id,name,mime FROM form_uploads WHERE id=? AND inquiry_id IS NOT NULL",
      [z.string().uuid().parse(req.params.id)],
    );
    if (!f) throw fail(404, "File not found.");
    const path = uploadPath(config, f.id);
    const { size } = await stat(path).catch(() => {
      throw fail(404, "File not found.");
    });
    res.set({
      "Content-Type": f.mime,
      "Content-Length": String(size),
      "Content-Disposition": `attachment; filename="${f.name.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'",
      "Cross-Origin-Resource-Policy": "same-origin",
    });
    createReadStream(path).pipe(res);
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
        d.cover || null,
        d.receipt,
      ];
      if (existingId) {
        const r = await q(
          "UPDATE forms SET slug=?,title=?,intro=?,success=?,published=?,notify=?,definition=?,cover=?,receipt=?,updated_at=UTC_TIMESTAMP() WHERE id=? AND deleted_at IS NULL",
          [...values, formId],
          c,
        );
        if (!r.affectedRows) throw fail(404, "Form not found.");
      } else
        await q(
          "INSERT INTO forms (slug,title,intro,success,published,notify,definition,cover,receipt,id) VALUES (?,?,?,?,?,?,?,?,?,?)",
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
      "SELECT slug,title,intro,cover,definition FROM forms WHERE slug=? AND published=1 AND deleted_at IS NULL",
      [slugOf(req)],
    );
    if (!f) throw fail(404, "This form isn't available.");
    res.json({ ...f, definition: json(f.definition) });
  });
  app.options(["/public/forms/:slug", "/public/forms/:slug/upload"], (req, res) => {
    if (req.headers.origin !== config.PUBLIC_ORIGIN) return res.sendStatus(403);
    cors(req, res);
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, X-File-Name");
    res.set("Access-Control-Max-Age", "600");
    res.sendStatus(204);
  });

  // A file for a form's file question. Returns a ticket the form sends with its answers; the file only
  // counts once the form is sent, and unsent uploads are removed after a day.
  const removeStale = async () => {
    const old = await q(
      "SELECT id FROM form_uploads WHERE inquiry_id IS NULL AND created_at < UTC_TIMESTAMP() - INTERVAL 1 DAY LIMIT 20",
    );
    for (const { id } of old) {
      await unlink(uploadPath(config, id)).catch(() => {});
      await q("DELETE FROM form_uploads WHERE id=? AND inquiry_id IS NULL", [id]);
    }
  };
  app.post(
    "/public/forms/:slug/upload",
    rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 15,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
    (req, res, next) => {
      if (req.headers.origin !== config.PUBLIC_ORIGIN)
        return res.status(403).json({ error: "Website origin required." });
      cors(req, res);
      next();
    },
    sharedLimit("form-uploads", 60, 3600),
    express.raw({ type: Object.keys(FILE_TYPES), limit: MAX_FILE }),
    async (req, res) => {
      const fieldId = z
        .string()
        .regex(/^[a-z][a-z0-9_]{0,39}$/)
        .parse(req.query.field);
      const mime = String(req.get("Content-Type") || "")
        .split(";")[0]
        .trim();
      if (!FILE_TYPES[mime] || !Buffer.isBuffer(req.body)) throw fail(415, "Use " + FILE_HELP);
      if (!req.body.length) throw fail(400, "The file is empty.");
      const problem = checkFile(mime, req.body);
      if (problem) throw fail(415, problem);
      const [form] = await q(
        "SELECT id,definition FROM forms WHERE slug=? AND published=1 AND deleted_at IS NULL",
        [slugOf(req)],
      );
      if (!form) throw fail(404, "This form isn't available.");
      const field = json(form.definition)
        .steps.flatMap((s) => s.fields)
        .find((f) => f.id === fieldId && f.type === "file");
      if (!field) throw fail(400, "This question doesn't take files.");
      await removeStale().catch(() => {});
      const [{ used }] = await q("SELECT COALESCE(SUM(size),0) AS used FROM form_uploads");
      if (Number(used) + req.body.length > UPLOADS_TOTAL)
        throw fail(507, "We can't take files right now. Please email it to us instead.");
      const name =
        String(req.get("X-File-Name") || "file")
          .replace(/[^\w .()-]/g, "_")
          .slice(0, 150) || "file";
      const id = randomUUID();
      await mkdir(uploadDir(config), { recursive: true, mode: 0o700 }).catch(() => {
        throw fail(507, "We can't take files right now. Please email it to us instead.");
      });
      const fh = await open(uploadPath(config, id), "wx", 0o600);
      try {
        await fh.write(req.body);
      } finally {
        await fh.close();
      }
      try {
        await q(
          "INSERT INTO form_uploads (id,form_id,field_id,name,mime,size,sha256) VALUES (?,?,?,?,?,?,?)",
          [
            id,
            form.id,
            fieldId,
            name,
            mime,
            req.body.length,
            createHash("sha256").update(req.body).digest("hex"),
          ],
        );
      } catch (e) {
        await unlink(uploadPath(config, id)).catch(() => {});
        throw e;
      }
      res.status(201).json({
        ticket: makeToken({ fu: id, ff: form.id }, UPLOAD_TICKET_SECONDS),
        name,
        size: req.body.length,
      });
    },
  );
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
        "SELECT id,title,success,notify,receipt,definition FROM forms WHERE slug=? AND published=1 AND deleted_at IS NULL",
        [slugOf(req)],
      );
      if (!form) throw fail(404, "This form isn't available.");
      const def = json(form.definition);
      const result = validateAnswers(def, body.answers, { formId: form.id });
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
      const clean = result.clean;
      // A copy to the person, like Google Forms. At most 3 a day to one address, so the form can't be
      // used to flood someone else's inbox.
      const sendReceipt =
        Boolean(email) &&
        form.receipt !== 0 &&
        form.receipt !== false &&
        (!store.checkRateLimit ||
          (await store.checkRateLimit("form-receipt", email.toLowerCase(), 3, 86400)));
      const fileFields = Object.keys(clean).filter((k) => clean[k] && clean[k].upload);
      const inquiryId = randomUUID();
      await store.transaction(async (c) => {
        // Attach the uploads: each must belong to this form and question and not be used already.
        for (const k of fileFields) {
          const [u] = await q(
            "SELECT id,name,size FROM form_uploads WHERE id=? AND form_id=? AND field_id=? AND inquiry_id IS NULL FOR UPDATE",
            [clean[k].upload, form.id, k],
            c,
          );
          if (!u)
            throw Object.assign(fail(400, "Please check the highlighted answers."), {
              fields: { [k]: "Please upload the file again." },
            });
          clean[k] = { file: u.id, name: u.name, size: Number(u.size) };
          await q("UPDATE form_uploads SET inquiry_id=? WHERE id=?", [inquiryId, u.id], c);
        }
        const message = summarize(def, clean);
        await q(
          "INSERT INTO inquiries (id,name,email,phone,message,form_id,data) VALUES (?,?,?,?,?,?,?)",
          [inquiryId, name, email, phone, message, form.id, JSON.stringify(clean)],
          c,
        );
        if (form.notify)
          await q(
            "INSERT INTO mail_outbox (id,subject,body,reply_to) VALUES (?,?,?,?)",
            [randomUUID(), "New form submission: " + form.title, message, email || null],
            c,
          );
        if (sendReceipt)
          await q(
            "INSERT INTO mail_outbox (id,subject,body,reply_to,to_email) VALUES (?,?,?,?,?)",
            [
              randomUUID(),
              ("Your response: " + form.title).slice(0, 160),
              receiptText(form.title, name, message),
              "contact@scholarscafe.com",
              email,
            ],
            c,
          );
      });
      res.status(201).json({ ok: true, message: form.success });
    },
  );
}
