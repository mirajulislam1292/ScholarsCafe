// Agreements: staff write templates and send an agreement from the admin. The recipient gets a private
// link (scholarscafe.com/sign/<token>), proves it is them with a 6-digit code sent to the invited email
// (or by being signed in to the student portal with that email), fills in their details, signs (drawn or
// typed) and submits. The signed record is written once and never changed; the server makes the PDF.
//
// Secrets: the link token (256 bits), the email code and the short-lived proof of the identity check are
// stored only as SHA-256 hashes. The link expires after AGREEMENT_LINK_DAYS (default 7) and signs once.
// Privacy: NID and passport numbers are masked everywhere except the signed record. Nothing here logs them.
import { randomUUID, randomBytes } from "node:crypto";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { token, hash, equal } from "./security.js";
import { newCode, CODE_MINUTES, CODE_ATTEMPTS, CODES_PER_DAY } from "./auth.js";
import {
  BUILTIN_FIELDS,
  AUTO_FIELDS,
  FIELD_KEY,
  CONSENT_TEXT,
  placeholders,
  renderAgreementText,
  sha256,
  dhakaDate,
  dhakaTime,
  mask,
  maskEmail,
  checkValue,
  SAMPLE_TEMPLATE,
} from "./agreements-text.js";
import { agreementPdf } from "./agreements-pdf.js";
import {
  sendInvite,
  sendCode,
  signedCopyText,
  signedCopyLayout,
  teamSignedText,
  teamSignedLayout,
} from "./agreements-mail.js";

export const PROOF_MINUTES = 60;
export const MAX_SIGNATURE_BYTES = 300 * 1024;
const TOKEN_RE = /^[0-9a-f]{64}$/;
const json = (v, fallback) => {
  if (v == null) return fallback;
  if (typeof v === "string")
    try {
      return JSON.parse(v);
    } catch {
      return fallback;
    }
  return v;
};
export const linkDays = (config) => {
  const n = Number.parseInt(config.AGREEMENT_LINK_DAYS || "7", 10);
  return Number.isFinite(n) && n >= 1 && n <= 30 ? n : 7;
};
const past = (d) => d && new Date(d).getTime() <= Date.now();
/** Draft, Sent, Viewed, Signed, Expired, Revoked. */
export function stateOf(a) {
  if (a.status === "signed" || a.status === "revoked" || a.status === "draft") return a.status;
  return past(a.expires_at) ? "expired" : a.status;
}
const builtin = Object.fromEntries(BUILTIN_FIELDS.map((f) => [f.key, f]));

async function event(store, c, agreementId, name, { actor = null, detail = "", ip = null } = {}) {
  await store.query(
    "INSERT INTO agreement_events (agreement_id,event,actor_id,detail,ip) VALUES (?,?,?,?,?)",
    [agreementId, name, actor, String(detail).slice(0, 300), ip ? String(ip).slice(0, 64) : null],
    c,
  );
}

/** A PNG data URL from the signing page → Buffer, or null if it isn't a sane PNG. */
export function signaturePng(dataUrl) {
  const m = /^data:image\/png;base64,([A-Za-z0-9+/]+={0,2})$/.exec(String(dataUrl || ""));
  if (!m) return null;
  const buf = Buffer.from(m[1], "base64");
  if (buf.length < 67 || buf.length > MAX_SIGNATURE_BYTES) return null;
  if (!buf.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return null;
  if (buf.toString("ascii", 12, 16) !== "IHDR") return null;
  const w = buf.readUInt32BE(16),
    h = buf.readUInt32BE(20);
  if (!w || !h || w > 4000 || h > 4000) return null;
  return buf;
}

// ---------------------------------------------------------------- public signing API (admin deployment)
/**
 * scholarscafe.com/sign/<token> calls these on the admin server (like the other website forms). CORS and
 * the Origin check allow only the website. The student portal deployment adds /sign-check/<token>.
 */
export function installAgreementPublicRoutes(
  app,
  { store, fail, config, sharedLimit, mailer, portal, sessionOf },
) {
  const devLog =
    !mailer && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(config.ADMIN_ORIGIN || "");
  const findByToken = async (raw, c, lock = false) => {
    if (!TOKEN_RE.test(raw || "")) return null;
    const rows = await store.query(
      "SELECT * FROM agreements WHERE token_hash=?" + (lock ? " FOR UPDATE" : ""),
      [hash(raw)],
      c,
    );
    return rows[0] || null;
  };
  const issueProof = async (c, a, method, ip) => {
    const proof = token();
    await store.query(
      `UPDATE agreements SET proof_hash=?,proof_expires_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL ${PROOF_MINUTES} MINUTE),
         verified_at=UTC_TIMESTAMP(),verify_method=?,code_hash=NULL,code_attempts=0 WHERE id=?`,
      [hash(proof), method, a.id],
      c,
    );
    await event(store, c, a.id, "verified", {
      detail: method === "student_portal" ? "Signed in to the student portal" : "Email code",
      ip,
    });
    return proof;
  };
  const proofOk = (a, proof) =>
    typeof proof === "string" &&
    TOKEN_RE.test(proof) &&
    Boolean(a.proof_hash) &&
    equal(hash(proof), a.proof_hash) &&
    !past(a.proof_expires_at);

  // The student portal: if the visitor is signed in there with the invited email, skip the code.
  // A plain link (no fetch), so the website needs no extra connect-src. The proof goes back in the
  // address fragment, which browsers never send to a server.
  if (portal === "student") {
    app.get(
      "/sign-check/:token",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 30,
        standardHeaders: "draft-8",
        legacyHeaders: false,
      }),
      async (req, res) => {
        const raw = String(req.params.token || "");
        const back = (frag) =>
          res.redirect(
            303,
            `${config.PUBLIC_ORIGIN}/sign/${TOKEN_RE.test(raw) ? raw : ""}#${frag}`,
          );
        const actor = await sessionOf(req);
        if (!actor) return back("portal=signin");
        const proof = await store.transaction(async (c) => {
          const a = await findByToken(raw, c, true);
          if (!a || !["sent", "viewed", "signed"].includes(stateOf(a))) return null;
          if (String(actor.email).toLowerCase() !== String(a.recipient_email).toLowerCase())
            return "";
          return issueProof(c, a, "student_portal", req.ip);
        });
        if (proof === null) return back("portal=invalid");
        if (!proof) return back("portal=mismatch");
        back("proof=" + proof);
      },
    );
    return;
  }

  const paths = ["/public/sign"];
  app.use(
    paths,
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 120,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(paths, (req, res, next) => {
    if (req.headers.origin !== config.PUBLIC_ORIGIN)
      return res.status(403).json({ error: "Website origin required." });
    res.set("Access-Control-Allow-Origin", config.PUBLIC_ORIGIN);
    res.vary("Origin");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "600");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    if (req.method === "POST" && !req.is("application/json"))
      return res.status(415).json({ error: "JSON required." });
    next();
  });
  app.use(paths, sharedLimit("sign", 200, 3600));

  const gone = (a) => {
    const s = a ? stateOf(a) : "missing";
    if (s === "revoked")
      throw fail(
        410,
        "This agreement was withdrawn. Please contact Scholars' Cafe if you need a new link.",
      );
    if (s === "expired")
      throw fail(410, "This link has expired. Ask Scholars' Cafe to send you a new one.");
    if (s === "missing" || s === "draft")
      throw fail(404, "This link is not valid. It may have been replaced by a newer link.");
  };
  const signedRow = async (id, c) =>
    (
      await store.query(
        "SELECT doc_id,field_values,signature_png,signature_method,signed_at FROM agreement_signatures WHERE agreement_id=?",
        [id],
        c,
      )
    )[0] || null;

  // Before the identity check: only what the invitation email already showed.
  app.get("/public/sign/:token", async (req, res) => {
    const a = await findByToken(req.params.token);
    gone(a);
    if (a.status === "sent")
      await store.transaction(async (c) => {
        const r = await store.query(
          "UPDATE agreements SET status='viewed',viewed_at=UTC_TIMESTAMP() WHERE id=? AND status='sent'",
          [a.id],
          c,
        );
        if (r.affectedRows) await event(store, c, a.id, "viewed", { ip: req.ip });
      });
    const s = a.status === "signed" ? await signedRow(a.id) : null;
    res.json({
      state: stateOf(a),
      ref: a.ref,
      title: a.title,
      issued: dhakaDate(a.issued_at || a.sent_at || a.created_at),
      expires: a.expires_at ? dhakaDate(a.expires_at) : "",
      firstName: String(a.recipient_name).trim().split(/\s+/)[0],
      email: maskEmail(a.recipient_email),
      signed: s ? { docId: s.doc_id, signedAt: dhakaTime(s.signed_at) } : null,
    });
  });

  const codeLimit = async (address) => {
    if (store.checkRateLimit && !(await store.checkRateLimit("email-code", address, 3, 900)))
      throw fail(429, "Too many codes requested for this email. Wait 15 minutes.");
    if (
      store.checkRateLimit &&
      !(await store.checkRateLimit("email-code-day", address, CODES_PER_DAY, 86400))
    )
      throw fail(429, "Too many codes requested for this email today. Try again tomorrow.");
  };
  app.post("/public/sign/:token/code", async (req, res) => {
    z.object({})
      .strict()
      .parse(req.body || {});
    const a = await findByToken(req.params.token);
    gone(a);
    if (!mailer && !devLog)
      throw fail(503, "Email is not set up yet. Please contact Scholars' Cafe.");
    await codeLimit(a.recipient_email);
    const code = newCode();
    await store.transaction(async (c) => {
      await store.query(
        `UPDATE agreements SET code_hash=?,code_attempts=0,code_expires_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL ${CODE_MINUTES} MINUTE) WHERE id=?`,
        [hash(a.id + ":" + code), a.id],
        c,
      );
      await event(store, c, a.id, "code", { ip: req.ip });
    });
    if (devLog) console.log(`[local only] agreement code for ${a.recipient_email}: ${code}`);
    else
      await sendCode(mailer, a.recipient_email, {
        title: a.title,
        code,
        minutes: CODE_MINUTES,
      }).catch(() => {
        throw fail(502, "The code email could not be sent. Please try again in a minute.");
      });
    res.json({ ok: true, email: maskEmail(a.recipient_email), minutes: CODE_MINUTES });
  });

  const WRONG = "That code is wrong or has expired. Request a new one.";
  app.post("/public/sign/:token/verify", async (req, res) => {
    const { code } = z
      .object({ code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code.") })
      .strict()
      .parse(req.body);
    const outcome = await store.transaction(async (c) => {
      const a = await findByToken(req.params.token, c, true);
      gone(a);
      if (!a.code_hash || past(a.code_expires_at)) return { error: true };
      if (a.code_attempts >= CODE_ATTEMPTS || !equal(hash(a.id + ":" + code), a.code_hash)) {
        await store.query(
          a.code_attempts + 1 >= CODE_ATTEMPTS
            ? "UPDATE agreements SET code_hash=NULL,code_attempts=0 WHERE id=?"
            : "UPDATE agreements SET code_attempts=code_attempts+1 WHERE id=?",
          [a.id],
          c,
        );
        return { error: true };
      }
      return { proof: await issueProof(c, a, "email_code", req.ip) };
    });
    if (outcome.error) throw fail(401, WRONG);
    res.json({ ok: true, proof: outcome.proof });
  });

  const proofBody = z.object({ proof: z.string().regex(TOKEN_RE) }).strict();
  const verified = async (req, c, lock = false) => {
    const a = await findByToken(req.params.token, c, lock);
    gone(a);
    return a;
  };
  // After the identity check: the whole agreement (and the signed copy, once signed).
  app.post("/public/sign/:token/document", async (req, res) => {
    const { proof } = proofBody.parse(req.body);
    const a = await verified(req);
    if (!proofOk(a, proof))
      throw fail(401, "Please confirm it's you again. Your check has expired.");
    const s = a.status === "signed" ? await signedRow(a.id) : null;
    res.json({
      state: stateOf(a),
      ref: a.ref,
      title: a.title,
      subtitle: a.subtitle,
      body: a.body,
      issued: dhakaDate(a.issued_at || a.sent_at || a.created_at),
      expires: a.expires_at ? dhakaDate(a.expires_at) : "",
      today: dhakaDate(Date.now()),
      recipientName: a.recipient_name,
      recipientEmail: a.recipient_email,
      consentText: CONSENT_TEXT,
      fields: json(a.fields, []).map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type || "text",
        recipient: Boolean(f.recipient),
        required: Boolean(f.required),
        sensitive: Boolean(f.sensitive),
        value: f.value || "",
      })),
      signed: s
        ? {
            docId: s.doc_id,
            signedAt: dhakaTime(s.signed_at),
            signedDate: dhakaDate(s.signed_at),
            values: json(s.field_values, {}),
            method: s.signature_method,
            signature: "data:image/png;base64," + Buffer.from(s.signature_png).toString("base64"),
          }
        : null,
    });
  });

  const submitBody = z
    .object({
      proof: z.string().regex(TOKEN_RE),
      values: z
        .record(z.string().regex(FIELD_KEY), z.string().max(300))
        .refine((v) => Object.keys(v).length <= 40, "Too many fields."),
      signature: z.string().max(Math.ceil((MAX_SIGNATURE_BYTES * 4) / 3) + 40),
      method: z.enum(["draw", "type"]),
      consent: z.literal(true, { error: "Tick the box to confirm." }),
    })
    .strict();
  app.post("/public/sign/:token/submit", async (req, res) => {
    const parsed = submitBody.safeParse(req.body);
    if (!parsed.success)
      throw fail(400, parsed.error.issues[0]?.message || "Please check your details.");
    const body = parsed.data;
    const png = signaturePng(body.signature);
    if (!png) throw fail(400, "Add your signature in the box, then submit again.");
    const result = await store.transaction(async (c) => {
      const a = await verified(req, c, true);
      if (a.status === "signed")
        throw fail(409, "This agreement is already signed. It can't be signed or changed again.");
      if (!proofOk(a, body.proof))
        throw fail(401, "Please confirm it's you again. Your check has expired.");
      const fields = json(a.fields, []);
      const values = {};
      const errors = {};
      for (const f of fields) {
        if (f.recipient) {
          const msg = checkValue(f, body.values[f.key]);
          if (msg) errors[f.key] = msg;
          else values[f.key] = String(body.values[f.key] || "").trim();
        } else values[f.key] = String(f.value || "").trim();
      }
      if (Object.keys(errors).length)
        throw Object.assign(fail(400, "Please check the highlighted details."), { fields: errors });
      const signedAt = new Date(Math.floor(Date.now() / 1000) * 1000);
      values.date = dhakaDate(signedAt);
      const issued = dhakaDate(a.issued_at || a.sent_at || a.created_at);
      const text = renderAgreementText({
        title: a.title,
        subtitle: a.subtitle,
        ref: a.ref,
        issued,
        body: a.body,
        values,
      });
      const sha = sha256(text);
      const docId = `${a.ref}-${randomBytes(3).toString("hex").toUpperCase()}`;
      const ip = String(req.ip || "").slice(0, 64);
      const userAgent = String(req.headers["user-agent"] || "").slice(0, 400);
      const verification = {
        method: a.verify_method,
        email: a.recipient_email,
        verified_at: a.verified_at ? new Date(a.verified_at).toISOString() : null,
      };
      const verificationLabel = `${a.verify_method === "student_portal" ? "Signed in to the student portal as" : "6-digit code sent to"} ${a.recipient_email}${a.verified_at ? `, ${dhakaTime(a.verified_at)}` : ""}`;
      let pdf;
      try {
        pdf = await agreementPdf({
          ref: a.ref,
          title: a.title,
          subtitle: a.subtitle,
          issued,
          body: a.body,
          values,
          signature: png,
          method: body.method,
          signer: a.recipient_name,
          email: a.recipient_email,
          docId,
          signedAt,
          sha,
          ip,
          userAgent,
          verificationLabel,
          consent: CONSENT_TEXT,
        });
      } catch {
        throw fail(400, "Your signature image couldn't be read. Clear it and sign again.");
      }
      await store.query(
        `INSERT INTO agreement_signatures (agreement_id,doc_id,field_values,signature_png,signature_method,consent_text,
           rendered_text,text_sha256,signed_at,ip,user_agent,verification,pdf,pdf_sha256) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          a.id,
          docId,
          JSON.stringify(values),
          png,
          body.method,
          CONSENT_TEXT,
          text,
          sha,
          signedAt,
          ip,
          userAgent,
          JSON.stringify(verification),
          pdf,
          sha256(pdf),
        ],
        c,
      );
      await store.query(
        "UPDATE agreements SET status='signed',signed_at=?,code_hash=NULL WHERE id=? AND status<>'signed'",
        [signedAt, a.id],
        c,
      );
      await event(store, c, a.id, "signed", { detail: docId, ip });
      const when = dhakaTime(signedAt);
      const name = values.name || a.recipient_name;
      await store.query(
        "INSERT INTO mail_outbox (id,subject,body,reply_to,to_email,attach_agreement_id,layout) VALUES (?,?,?,?,?,?,?)",
        [
          randomUUID(),
          `Your signed copy: ${a.title}`.slice(0, 160),
          signedCopyText({ name, title: a.title, docId, signedAt: when, sha }),
          "contact@scholarscafe.com",
          a.recipient_email,
          a.id,
          JSON.stringify(
            signedCopyLayout({ name, title: a.title, ref: a.ref, docId, signedAt: when, sha }),
          ),
        ],
        c,
      );
      await store.query(
        "INSERT INTO mail_outbox (id,subject,body,reply_to,to_email,attach_agreement_id,layout) VALUES (?,?,?,?,?,?,?)",
        [
          randomUUID(),
          `Agreement signed: ${name}, ${a.title}`.slice(0, 160),
          teamSignedText({
            name,
            email: a.recipient_email,
            title: a.title,
            ref: a.ref,
            docId,
            signedAt: when,
            adminOrigin: config.ADMIN_ORIGIN,
          }),
          a.recipient_email,
          null,
          a.id,
          JSON.stringify(
            teamSignedLayout({
              name,
              email: a.recipient_email,
              title: a.title,
              ref: a.ref,
              docId,
              signedAt: when,
            }),
          ),
        ],
        c,
      );
      await store.audit(null, "agreement_signed", a.ref, c);
      return { docId, signedAt: when, signedDate: dhakaDate(signedAt), sha };
    });
    res.status(201).json({ ok: true, ...result });
  });

  // The signed PDF, for the signer (after the identity check).
  app.post("/public/sign/:token/pdf", async (req, res) => {
    const { proof } = proofBody.parse(req.body);
    const a = await verified(req);
    if (!proofOk(a, proof)) throw fail(401, "Please confirm it's you again.");
    if (a.status !== "signed") throw fail(409, "This agreement isn't signed yet.");
    const [row] = await store.query(
      "SELECT doc_id,pdf FROM agreement_signatures WHERE agreement_id=?",
      [a.id],
    );
    if (!row) throw fail(404, "Signed copy not found.");
    res
      .type("application/pdf")
      .set("Content-Disposition", `attachment; filename="${row.doc_id}.pdf"`)
      .send(Buffer.from(row.pdf));
  });
}

// ---------------------------------------------------------------- staff API (admin, owners and admins)
const templateInput = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1, "Give the template a title.").max(200),
    subtitle: z.string().trim().max(300).default(""),
    body: z.string().trim().min(1, "Write the agreement text.").max(50000),
    fields: z
      .array(
        z
          .object({
            key: z.string().regex(FIELD_KEY, "Field keys use lowercase letters, digits and _."),
            label: z.string().trim().min(1).max(80),
            sensitive: z.boolean().default(false),
          })
          .strict(),
      )
      .max(30)
      .default([]),
  })
  .strict();
const fieldInput = z
  .object({
    key: z.string().regex(FIELD_KEY),
    label: z.string().trim().min(1).max(80),
    value: z.string().trim().max(300).default(""),
    recipient: z.boolean().default(false),
    required: z.boolean().default(false),
  })
  .strict();
const agreementInput = z
  .object({
    id: z.string().uuid().optional(),
    template_id: z.string().uuid(),
    recipient_name: z.string().trim().min(1, "Enter the recipient's name.").max(160),
    recipient_email: z
      .string()
      .trim()
      .email("Enter the recipient's email.")
      .max(254)
      .transform((s) => s.toLowerCase()),
    link_days: z.number().int().min(1).max(30).optional(),
    fields: z.array(fieldInput).max(40),
    send: z.boolean().default(false),
  })
  .strict();

/** Staff fields → the stored field list for this agreement (one entry per placeholder in the body). */
export function agreementFields(template, input, fail) {
  const custom = Object.fromEntries(json(template.fields, []).map((f) => [f.key, f]));
  const given = Object.fromEntries(input.fields.map((f) => [f.key, f]));
  const keys = placeholders(template.body).filter((k) => !AUTO_FIELDS.includes(k));
  if (!keys.includes("name")) keys.unshift("name");
  return keys.map((key) => {
    const def = builtin[key] || custom[key];
    if (!def)
      throw fail(
        400,
        `The template uses {{${key}}} but has no field for it. Add it to the template.`,
      );
    const f = given[key] || {};
    const field = {
      key,
      label: f.label || def.label,
      type: def.type || "text",
      sensitive: Boolean(def.sensitive),
      value:
        f.value ||
        (key === "name" ? input.recipient_name : key === "email" ? input.recipient_email : ""),
      recipient: given[key] ? Boolean(f.recipient) : key === "name" || !["email"].includes(key),
      required: given[key] ? Boolean(f.recipient && f.required) : key !== "cohort",
    };
    if (key === "email" && !field.recipient) field.value = input.recipient_email;
    if (!field.recipient && !field.value)
      throw fail(400, `Fill in "${field.label}", or tick "Recipient fills in".`);
    if (!field.recipient && checkValue({ ...field, required: true }, field.value))
      throw fail(400, `"${field.label}": ${checkValue({ ...field, required: true }, field.value)}`);
    if (field.recipient) field.required = key === "name" ? true : field.required;
    return field;
  });
}

export function installAgreementAdminRoutes(app, { store, fail, config, canPublish, mailer }) {
  const staff = (req) => {
    if (!canPublish(req.actor.role))
      throw fail(403, "Agreements are managed by owners and admins.");
  };
  const devLog =
    !mailer && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(config.ADMIN_ORIGIN || "");
  const idParam = (req) => z.string().uuid().parse(req.params.id);
  const load = async (id, c, lock = false) => {
    const [a] = await store.query(
      "SELECT * FROM agreements WHERE id=?" + (lock ? " FOR UPDATE" : ""),
      [id],
      c,
    );
    if (!a) throw fail(404, "Agreement not found.");
    return a;
  };
  const nextRef = async (c) => {
    const year = new Date(Date.now() + 6 * 3600 * 1000).getUTCFullYear();
    const [row] = await store.query(
      "SELECT COUNT(*) AS n FROM agreements WHERE ref LIKE ?",
      [`SC-AGR-${year}-%`],
      c,
    );
    return `SC-AGR-${year}-${String(Number(row?.n || 0) + 1).padStart(4, "0")}`;
  };
  // New private link: a fresh token replaces the old one (which stops working) and the clock restarts.
  const newLink = async (c, a, actor, name) => {
    const raw = token();
    const days = a.link_days || linkDays(config);
    await store.query(
      `UPDATE agreements SET token_hash=?,expires_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL ${Number(days)} DAY),
         status=IF(status='draft','sent',status),sent_by=?,sent_at=UTC_TIMESTAMP(),
         issued_at=COALESCE(issued_at,UTC_TIMESTAMP()),proof_hash=NULL,code_hash=NULL,updated_at=UTC_TIMESTAMP() WHERE id=?`,
      [hash(raw), actor, a.id],
      c,
    );
    await event(store, c, a.id, name, { actor });
    return {
      raw,
      url: `${config.PUBLIC_ORIGIN}/sign/${raw}`,
      expires: dhakaDate(Date.now() + days * 86400000),
    };
  };
  const email = async (a, link) => {
    if (!mailer) {
      if (devLog) console.log(`[local only] agreement link for ${a.recipient_email}: ${link.url}`);
      return false;
    }
    try {
      await sendInvite(mailer, {
        title: a.title,
        ref: a.ref,
        issued: dhakaDate(a.issued_at || Date.now()),
        expires: link.expires,
        name: a.recipient_name,
        email: a.recipient_email,
        url: link.url,
      });
      return true;
    } catch {
      console.error("Agreement email could not be sent.");
      return false;
    }
  };
  const sendable = (a) => {
    if (a.status === "signed") throw fail(409, "This agreement is already signed.");
    if (a.status === "revoked") throw fail(409, "This agreement was revoked. Create a new one.");
  };

  app.get("/api/agreements", async (req, res) => {
    staff(req);
    const templates = await store.query(
      "SELECT id,title,subtitle,body,fields,updated_at,created_at FROM agreement_templates WHERE deleted_at IS NULL ORDER BY title",
    );
    const rows = await store.query(
      `SELECT a.id,a.ref,a.title,a.recipient_name,a.recipient_email,a.status,a.fields,a.expires_at,a.sent_at,
         a.viewed_at,a.signed_at,a.revoked_at,a.created_at,s.doc_id,s.field_values
       FROM agreements a LEFT JOIN agreement_signatures s ON s.agreement_id=a.id ORDER BY a.created_at DESC LIMIT 300`,
    );
    res.json({
      linkDays: linkDays(config),
      builtin: BUILTIN_FIELDS,
      sample: SAMPLE_TEMPLATE,
      templates: templates.map((t) => ({ ...t, fields: json(t.fields, []) })),
      items: rows.map(({ fields, field_values, ...a }) => {
        const values = json(field_values, null);
        const fixed = json(fields, []).find((f) => f.key === "id_number");
        return {
          ...a,
          state: stateOf(a),
          id_masked: mask(values?.id_number || fixed?.value || ""),
        };
      }),
    });
  });

  app.post("/api/agreements/templates", async (req, res) => {
    staff(req);
    const t = templateInput.parse(req.body);
    const keys = new Set();
    for (const f of t.fields) {
      if (builtin[f.key] || AUTO_FIELDS.includes(f.key))
        throw fail(400, `"${f.key}" is a built-in field. Use another key.`);
      if (keys.has(f.key)) throw fail(400, `The field "${f.key}" is listed twice.`);
      keys.add(f.key);
    }
    const unknown = placeholders(t.body).filter(
      (k) => !builtin[k] && !AUTO_FIELDS.includes(k) && !keys.has(k),
    );
    if (unknown.length)
      throw fail(400, `Add a field for {{${unknown[0]}}}, or remove it from the text.`);
    const id = t.id || randomUUID();
    if (t.id) {
      const r = await store.query(
        "UPDATE agreement_templates SET title=?,subtitle=?,body=?,fields=?,updated_at=UTC_TIMESTAMP() WHERE id=? AND deleted_at IS NULL",
        [t.title, t.subtitle, t.body, JSON.stringify(t.fields), id],
      );
      if (!r.affectedRows) throw fail(404, "Template not found.");
    } else
      await store.query(
        "INSERT INTO agreement_templates (id,title,subtitle,body,fields,created_by,updated_at) VALUES (?,?,?,?,?,?,UTC_TIMESTAMP())",
        [id, t.title, t.subtitle, t.body, JSON.stringify(t.fields), req.actor.id],
      );
    await store.audit(req.actor.id, "agreement_template_save", t.title.slice(0, 200));
    res.json({ ok: true, id });
  });
  app.post("/api/agreements/templates/:id/delete", async (req, res) => {
    staff(req);
    const id = idParam(req);
    await store.query(
      "UPDATE agreement_templates SET deleted_at=UTC_TIMESTAMP() WHERE id=? AND deleted_at IS NULL",
      [id],
    );
    await store.audit(req.actor.id, "agreement_template_delete", id);
    res.json({ ok: true });
  });

  // Create (or update a draft), and optionally send it at once.
  app.post("/api/agreements", async (req, res) => {
    staff(req);
    const input = agreementInput.parse(req.body);
    const out = await store.transaction(async (c) => {
      const [t] = await store.query(
        "SELECT * FROM agreement_templates WHERE id=? AND deleted_at IS NULL",
        [input.template_id],
        c,
      );
      if (!t) throw fail(404, "Template not found.");
      const fields = agreementFields(t, input, fail);
      const days = input.link_days || linkDays(config);
      let a;
      if (input.id) {
        a = await load(input.id, c, true);
        if (a.status !== "draft") throw fail(409, "Only drafts can be edited.");
        await store.query(
          `UPDATE agreements SET template_id=?,title=?,subtitle=?,body=?,fields=?,recipient_name=?,recipient_email=?,
             link_days=?,updated_at=UTC_TIMESTAMP() WHERE id=?`,
          [
            t.id,
            t.title,
            t.subtitle,
            t.body,
            JSON.stringify(fields),
            input.recipient_name,
            input.recipient_email,
            days,
            a.id,
          ],
          c,
        );
      } else {
        a = { id: randomUUID(), ref: await nextRef(c) };
        await store.query(
          `INSERT INTO agreements (id,ref,template_id,title,subtitle,body,fields,recipient_name,recipient_email,link_days,created_by)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [
            a.id,
            a.ref,
            t.id,
            t.title,
            t.subtitle,
            t.body,
            JSON.stringify(fields),
            input.recipient_name,
            input.recipient_email,
            days,
            req.actor.id,
          ],
          c,
        );
        await event(store, c, a.id, "created", { actor: req.actor.id });
      }
      a = await load(a.id, c, true);
      const link = input.send ? await newLink(c, a, req.actor.id, "sent") : null;
      await store.audit(req.actor.id, input.send ? "agreement_send" : "agreement_draft", a.ref, c);
      return { a: input.send ? await load(a.id, c) : a, link };
    });
    const emailed = out.link ? await email(out.a, out.link) : false;
    res.json({ ok: true, id: out.a.id, ref: out.a.ref, sent: Boolean(out.link), emailed });
  });

  // Send a draft, or resend: a new private link by email (the old link stops working).
  app.post("/api/agreements/:id/send", async (req, res) => {
    staff(req);
    const id = idParam(req);
    const out = await store.transaction(async (c) => {
      const a = await load(id, c, true);
      sendable(a);
      const link = await newLink(c, a, req.actor.id, a.status === "draft" ? "sent" : "resent");
      await store.audit(req.actor.id, "agreement_send", a.ref, c);
      return { a: await load(id, c), link };
    });
    res.json({ ok: true, emailed: await email(out.a, out.link) });
  });
  // Copy link: a new private link to share another way (WhatsApp). The emailed link stops working.
  app.post("/api/agreements/:id/link", async (req, res) => {
    staff(req);
    const id = idParam(req);
    const link = await store.transaction(async (c) => {
      const a = await load(id, c, true);
      sendable(a);
      const l = await newLink(c, a, req.actor.id, "link");
      await store.audit(req.actor.id, "agreement_link", a.ref, c);
      return l;
    });
    res.json({ ok: true, url: link.url, expires: link.expires });
  });
  app.post("/api/agreements/:id/revoke", async (req, res) => {
    staff(req);
    const id = idParam(req);
    await store.transaction(async (c) => {
      const a = await load(id, c, true);
      if (a.status === "signed")
        throw fail(409, "A signed agreement can't be revoked. Its record stays as it is.");
      if (a.status === "revoked") return;
      await store.query(
        "UPDATE agreements SET status='revoked',revoked_at=UTC_TIMESTAMP(),token_hash=NULL,proof_hash=NULL,code_hash=NULL WHERE id=?",
        [id],
        c,
      );
      await event(store, c, id, "revoked", { actor: req.actor.id });
      await store.audit(req.actor.id, "agreement_revoke", a.ref, c);
    });
    res.json({ ok: true });
  });

  app.get("/api/agreements/:id", async (req, res) => {
    staff(req);
    const id = idParam(req);
    const a = await load(id);
    const [s] = await store.query(
      `SELECT doc_id,field_values,signature_method,consent_text,rendered_text,text_sha256,signed_at,ip,user_agent,
         verification,pdf_sha256 FROM agreement_signatures WHERE agreement_id=?`,
      [id],
    );
    const events = await store.query(
      `SELECT e.event,e.detail,e.ip,e.created_at,u.email AS actor_email FROM agreement_events e
       LEFT JOIN users u ON u.id=e.actor_id WHERE e.agreement_id=? ORDER BY e.id`,
      [id],
    );
    res.json({
      id: a.id,
      ref: a.ref,
      title: a.title,
      subtitle: a.subtitle,
      body: a.body,
      template_id: a.template_id,
      recipient_name: a.recipient_name,
      recipient_email: a.recipient_email,
      link_days: a.link_days,
      state: stateOf(a),
      expires_at: a.expires_at,
      sent_at: a.sent_at,
      viewed_at: a.viewed_at,
      signed_at: a.signed_at,
      revoked_at: a.revoked_at,
      created_at: a.created_at,
      // NID and passport numbers in full only on the signed record.
      fields: json(a.fields, []).map((f) => ({
        ...f,
        value: f.sensitive && !s ? mask(f.value) : f.value,
      })),
      signed: s
        ? {
            doc_id: s.doc_id,
            values: json(s.field_values, {}),
            method: s.signature_method,
            consent_text: s.consent_text,
            rendered_text: s.rendered_text,
            text_sha256: s.text_sha256,
            pdf_sha256: s.pdf_sha256,
            signed_at: s.signed_at,
            signed_label: dhakaTime(s.signed_at),
            ip: s.ip,
            user_agent: s.user_agent,
            verification: json(s.verification, {}),
          }
        : null,
      events: events.map((e) => ({ ...e, when: dhakaTime(e.created_at) })),
    });
  });
  const signedFile = async (req, column) => {
    staff(req);
    const id = idParam(req);
    const [row] = await store.query(
      `SELECT doc_id,${column} AS file FROM agreement_signatures WHERE agreement_id=?`,
      [id],
    );
    if (!row) throw fail(404, "This agreement isn't signed yet.");
    return row;
  };
  app.get("/api/agreements/:id/pdf", async (req, res) => {
    const row = await signedFile(req, "pdf");
    await store.audit(req.actor.id, "agreement_pdf", row.doc_id);
    res
      .type("application/pdf")
      .set(
        "Content-Disposition",
        `${req.query.view === "1" ? "inline" : "attachment"}; filename="${row.doc_id}.pdf"`,
      )
      .send(Buffer.from(row.file));
  });
  app.get("/api/agreements/:id/signature.png", async (req, res) => {
    const row = await signedFile(req, "signature_png");
    res.type("image/png").send(Buffer.from(row.file));
  });
}
