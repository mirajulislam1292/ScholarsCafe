import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createHash } from "node:crypto";
import { createApp } from "./app.js";
import { signaturePng, stateOf } from "./agreements.js";
import {
  SAMPLE_TEMPLATE,
  renderAgreementText,
  placeholders,
  mask,
  maskEmail,
  checkValue,
  dhakaTime,
} from "./agreements-text.js";
import { inviteEmail } from "./agreements-mail.js";
import { agreementPdf } from "./agreements-pdf.js";

const PUBLIC = "https://scholarscafe.com";
const ADMIN = "https://admin.scholarscafe.com";
const config = { ADMIN_ORIGIN: ADMIN, PUBLIC_ORIGIN: PUBLIC, GOOGLE_CLIENT_ID: "t" };
const studentConfig = {
  ...config,
  PORTAL: "student",
  ADMIN_ORIGIN: "https://student.scholarscafe.com",
};
const COOKIE = "__Host-sc_session=" + "a".repeat(64);
const sha = (s) => createHash("sha256").update(s).digest("hex");
// A real 1x1 PNG.
const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/** In-memory stand-in for MySQL: just the agreement queries (agreements.js), sessions and the outbox. */
function fakeStore({ role = "owner", email = "o@x.com", allow = () => true } = {}) {
  const db = { templates: [], agreements: [], signatures: [], events: [], outbox: [], audit: [] };
  const now = () => new Date();
  const plus = (q, unit) => {
    const m = new RegExp(`INTERVAL (\\d+) ${unit}`).exec(q);
    return m ? new Date(Date.now() + Number(m[1]) * (unit === "DAY" ? 86400000 : 60000)) : null;
  };
  const byId = (id) => db.agreements.find((a) => a.id === id);
  const store = {
    db,
    actor: { id: "u1", role, email, csrf: "c" },
    audit: async (...a) => db.audit.push(a),
    checkRateLimit: async (scope, key) => allow(scope, key),
    session: async () => store.actor,
    transaction: (fn) => fn({}),
    query: async (q, a = []) => {
      q = q.replace(/\s+/g, " ").trim();
      if (q.startsWith("SELECT * FROM agreements WHERE token_hash=?"))
        return db.agreements.filter((x) => x.token_hash && x.token_hash === a[0]);
      if (q.startsWith("SELECT * FROM agreements WHERE id=?"))
        return db.agreements.filter((x) => x.id === a[0]);
      if (q.startsWith("SELECT COUNT(*) AS n FROM agreements"))
        return [{ n: db.agreements.filter((x) => x.ref.startsWith(a[0].slice(0, -1))).length }];
      if (q.startsWith("INSERT INTO agreements ")) {
        const [
          id,
          ref,
          template_id,
          title,
          subtitle,
          body,
          fields,
          recipient_name,
          recipient_email,
          link_days,
          created_by,
        ] = a;
        db.agreements.push({
          id,
          ref,
          template_id,
          title,
          subtitle,
          body,
          fields: JSON.parse(fields),
          recipient_name,
          recipient_email,
          link_days,
          created_by,
          status: "draft",
          token_hash: null,
          created_at: now(),
          code_attempts: 0,
        });
        return { affectedRows: 1 };
      }
      if (q.startsWith("UPDATE agreements SET token_hash=?")) {
        const x = byId(a[2]);
        Object.assign(x, {
          token_hash: a[0],
          expires_at: plus(q, "DAY"),
          status: x.status === "draft" ? "sent" : x.status,
          sent_by: a[1],
          sent_at: now(),
          issued_at: x.issued_at || now(),
          proof_hash: null,
          code_hash: null,
        });
        return { affectedRows: 1 };
      }
      if (q.startsWith("UPDATE agreements SET template_id=?")) return { affectedRows: 1 };
      if (q.startsWith("UPDATE agreements SET status='viewed'")) {
        const x = byId(a[0]);
        if (x.status !== "sent") return { affectedRows: 0 };
        Object.assign(x, { status: "viewed", viewed_at: now() });
        return { affectedRows: 1 };
      }
      if (q.startsWith("UPDATE agreements SET proof_hash=?")) {
        Object.assign(byId(a[2]), {
          proof_hash: a[0],
          proof_expires_at: plus(q, "MINUTE"),
          verified_at: now(),
          verify_method: a[1],
          code_hash: null,
          code_attempts: 0,
        });
        return { affectedRows: 1 };
      }
      if (q.startsWith("UPDATE agreements SET code_hash=?,code_attempts=0")) {
        Object.assign(byId(a[1]), {
          code_hash: a[0],
          code_attempts: 0,
          code_expires_at: plus(q, "MINUTE"),
        });
        return { affectedRows: 1 };
      }
      if (q.startsWith("UPDATE agreements SET code_hash=NULL,code_attempts=0")) {
        Object.assign(byId(a[0]), { code_hash: null, code_attempts: 0 });
        return { affectedRows: 1 };
      }
      if (q.startsWith("UPDATE agreements SET code_attempts=code_attempts+1")) {
        byId(a[0]).code_attempts++;
        return { affectedRows: 1 };
      }
      if (q.startsWith("UPDATE agreements SET status='signed'")) {
        const x = byId(a[1]);
        if (x.status === "signed") return { affectedRows: 0 };
        Object.assign(x, { status: "signed", signed_at: a[0], code_hash: null });
        return { affectedRows: 1 };
      }
      if (q.startsWith("UPDATE agreements SET status='revoked'")) {
        Object.assign(byId(a[0]), {
          status: "revoked",
          revoked_at: now(),
          token_hash: null,
          proof_hash: null,
          code_hash: null,
        });
        return { affectedRows: 1 };
      }
      if (q.startsWith("INSERT INTO agreement_events")) {
        db.events.push({
          agreement_id: a[0],
          event: a[1],
          actor_id: a[2],
          detail: a[3],
          ip: a[4],
          created_at: now(),
        });
        return { affectedRows: 1 };
      }
      if (q.startsWith("SELECT e.event")) return db.events.filter((e) => e.agreement_id === a[0]);
      if (q.startsWith("INSERT INTO agreement_signatures")) {
        if (db.signatures.some((s) => s.agreement_id === a[0]))
          throw Object.assign(new Error("Duplicate entry"), { code: "ER_DUP_ENTRY" });
        const k = [
          "agreement_id",
          "doc_id",
          "field_values",
          "signature_png",
          "signature_method",
          "consent_text",
          "rendered_text",
          "text_sha256",
          "signed_at",
          "ip",
          "user_agent",
          "verification",
          "pdf",
          "pdf_sha256",
        ];
        db.signatures.push(Object.fromEntries(k.map((key, i) => [key, a[i]])));
        return { affectedRows: 1 };
      }
      if (q.includes("FROM agreement_signatures WHERE agreement_id=?")) {
        const s = db.signatures.filter((x) => x.agreement_id === a[0]);
        if (q.includes(" AS file")) {
          const col = /SELECT doc_id,(\w+) AS file/.exec(q)[1];
          return s.map((x) => ({ doc_id: x.doc_id, file: x[col] }));
        }
        return s;
      }
      if (q.startsWith("INSERT INTO mail_outbox")) {
        const [id, subject, body, reply_to, to_email, attach_agreement_id] = a;
        db.outbox.push({ id, subject, body, reply_to, to_email, attach_agreement_id });
        return { affectedRows: 1 };
      }
      if (q.startsWith("SELECT id,title,subtitle,body,fields"))
        return db.templates.filter((t) => !t.deleted_at);
      if (q.startsWith("SELECT * FROM agreement_templates WHERE id=?"))
        return db.templates.filter((t) => t.id === a[0] && !t.deleted_at);
      if (q.startsWith("INSERT INTO agreement_templates")) {
        const [id, title, subtitle, body, fields] = a;
        db.templates.push({ id, title, subtitle, body, fields: JSON.parse(fields) });
        return { affectedRows: 1 };
      }
      if (q.startsWith("UPDATE agreement_templates SET title=?")) {
        const t = db.templates.find((x) => x.id === a[4] && !x.deleted_at);
        if (!t) return { affectedRows: 0 };
        Object.assign(t, { title: a[0], subtitle: a[1], body: a[2], fields: JSON.parse(a[3]) });
        return { affectedRows: 1 };
      }
      if (q.startsWith("UPDATE agreement_templates SET deleted_at")) {
        const t = db.templates.find((x) => x.id === a[0]);
        if (t) t.deleted_at = now();
        return { affectedRows: 1 };
      }
      if (q.startsWith("SELECT a.id,a.ref")) {
        return db.agreements.map((x) => {
          const s = db.signatures.find((y) => y.agreement_id === x.id);
          return { ...x, doc_id: s?.doc_id, field_values: s?.field_values };
        });
      }
      if (q.startsWith("SELECT published FROM content")) return [];
      throw new Error("Unexpected query in test: " + q.slice(0, 80));
    },
  };
  return store;
}
const mailer = () => {
  const sent = [];
  return { sent, sendMail: async (m) => sent.push(m) };
};
const admin = (app) => ({
  get: (p) => request(app).get(p).set("Cookie", COOKIE),
  post: (p, body) =>
    request(app)
      .post(p)
      .set("Cookie", COOKIE)
      .set("Origin", ADMIN)
      .set("X-CSRF-Token", "c")
      .send(body),
});
const site = (app) => ({
  get: (p) => request(app).get(p).set("Origin", PUBLIC),
  post: (p, body) => request(app).post(p).set("Origin", PUBLIC).send(body),
});

/** A template plus one sent agreement. Returns the raw link token from the invitation email. */
async function sent(store, m, fields = []) {
  const app = createApp(store, config, undefined, m);
  const t = await admin(app).post("/api/agreements/templates", { ...SAMPLE_TEMPLATE });
  assert.equal(t.status, 200, t.text);
  const r = await admin(app).post("/api/agreements", {
    template_id: t.body.id,
    recipient_name: "Nusrat Jahan",
    recipient_email: "Nusrat@Example.com",
    fields: [
      {
        key: "id_number",
        label: "NID or passport number",
        value: "",
        recipient: true,
        required: true,
      },
      { key: "cohort", label: "Role / cohort", value: "Student, Fall 2027", recipient: false },
      ...fields,
    ],
    send: true,
  });
  assert.equal(r.status, 200, r.text);
  assert.equal(r.body.emailed, true);
  const html = m.sent.at(-1).html;
  const raw = /\/sign\/([0-9a-f]{64})/.exec(html)[1];
  return { app, raw, id: r.body.id, templateId: t.body.id };
}
async function verifiedProof(app, store, m, raw) {
  const c = await site(app).post(`/public/sign/${raw}/code`, {});
  assert.equal(c.status, 200, c.text);
  const code = /is (\d{6})/.exec(m.sent.at(-1).text)[1];
  const v = await site(app).post(`/public/sign/${raw}/verify`, { code });
  assert.equal(v.status, 200, v.text);
  return v.body.proof;
}
const goodSubmit = (proof) => ({
  proof,
  values: { name: "Nusrat Jahan", phone: "+880 1712 345678", id_number: "A01234567" },
  signature: PNG,
  method: "draw",
  consent: true,
});

test("text helpers: placeholders, masking, validation and the rendered text", () => {
  assert.deepEqual(placeholders("{{name}} and {{ id_number }} and {{name}} {{date}}"), [
    "name",
    "id_number",
    "date",
  ]);
  assert.equal(mask("A01234567"), "•••••4567");
  assert.equal(mask("123"), "••••");
  assert.equal(maskEmail("nusrat.jahan@example.com"), "nu••••••@example.com");
  assert.equal(
    checkValue({ key: "phone", label: "Phone", required: true }, "123"),
    "Enter a phone number with country code.",
  );
  assert.equal(checkValue({ key: "id_number", label: "ID", required: true }, "A01234567"), "");
  assert.match(checkValue({ key: "x", label: "Note", required: true }, ""), /Enter your note/);
  const text = renderAgreementText({
    title: "T",
    subtitle: "",
    ref: "R",
    issued: "1 May 2026",
    body: "Hi {{name}}, {{cohort}}",
    values: { name: "A" },
  });
  assert.equal(text, "T\n\nRef: R\nIssued: 1 May 2026\n\nHi A, Not provided\n");
  assert.equal(dhakaTime("2026-11-27T08:05:00Z"), "27 November 2026, 2:05 PM (Dhaka time)");
});

test("signature PNG check accepts a real PNG and rejects anything else", () => {
  assert.ok(signaturePng(PNG));
  assert.equal(signaturePng("data:image/png;base64,AAAA"), null);
  assert.equal(signaturePng("data:image/jpeg;base64," + PNG.split(",")[1]), null);
  assert.equal(
    signaturePng("data:image/png;base64," + Buffer.alloc(400 * 1024).toString("base64")),
    null,
  );
});

test("invite email: letterhead, REF, button, private link note and the shared footer", () => {
  const m = inviteEmail({
    title: "Mentorship Services Agreement",
    ref: "SC-AGR-2026-0001",
    issued: "27 November 2026",
    expires: "4 December 2026",
    name: "Nusrat Jahan",
    email: "n@example.com",
    url: "https://scholarscafe.com/sign/" + "a".repeat(64),
  });
  for (const s of [
    "REF SC-AGR-2026-0001",
    "Review &amp; Sign Agreement",
    "single-use link",
    "n@example.com",
    "4 December 2026",
    "Hi Nusrat,",
    "Signature requested",
  ])
    assert.ok(m.html.includes(s), s);
  assert.ok(m.text.includes("https://scholarscafe.com/sign/"));
  assert.ok(!/\u2014/.test(m.text), "no em-dashes in the copy");
});

test("the PDF is generated with the letterhead, fields and audit footer", async () => {
  const pdf = await agreementPdf({
    ...SAMPLE_TEMPLATE,
    ref: "SC-AGR-2026-0001",
    issued: "27 November 2026",
    values: { name: "Nusrat Jahan", id_number: "A01234567" },
    signature: signaturePng(PNG),
    method: "type",
    signer: "Nusrat Jahan",
    email: "n@example.com",
    docId: "SC-AGR-2026-0001-ABC123",
    signedAt: new Date(),
    sha: "f".repeat(64),
    ip: "1.1.1.1",
    userAgent: "test",
    verificationLabel: "code",
    consent: "I agree",
  });
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  assert.ok(pdf.length > 3000);
});

test("token: 256 bits, stored only as a hash, expires after 7 days", async () => {
  const store = fakeStore();
  const m = mailer();
  const { raw } = await sent(store, m);
  assert.match(raw, /^[0-9a-f]{64}$/);
  const a = store.db.agreements[0];
  assert.equal(a.token_hash, sha(raw));
  assert.ok(!JSON.stringify(store.db).includes(raw), "raw token is never stored");
  assert.equal(
    store.db.outbox.length,
    0,
    "the invitation (with the link) does not go through the outbox",
  );
  const days = (new Date(a.expires_at) - Date.now()) / 86400000;
  assert.ok(days > 6.9 && days <= 7, String(days));
  assert.equal(a.ref, `SC-AGR-${new Date(Date.now() + 6 * 3600e3).getUTCFullYear()}-0001`);
});

test("CORS: only scholarscafe.com may call the signing API", async () => {
  const store = fakeStore();
  const m = mailer();
  const { app, raw } = await sent(store, m);
  assert.equal((await request(app).get(`/public/sign/${raw}`)).status, 403);
  assert.equal(
    (await request(app).get(`/public/sign/${raw}`).set("Origin", "https://evil.example")).status,
    403,
  );
  const ok = await site(app).get(`/public/sign/${raw}`);
  assert.equal(ok.status, 200);
  assert.equal(ok.headers["access-control-allow-origin"], PUBLIC);
  assert.equal(ok.body.email, "nu••••@example.com");
  assert.equal(ok.body.title, "Mentorship Services Agreement");
  assert.equal(ok.body.body, undefined, "the text needs the identity check first");
  const pre = await request(app).options(`/public/sign/${raw}/submit`).set("Origin", PUBLIC);
  assert.equal(pre.status, 204);
  assert.equal(store.db.agreements[0].status, "viewed");
  assert.ok(store.db.events.some((e) => e.event === "viewed"));
});

test("OTP is required: no document or signing without a passed code", async () => {
  const store = fakeStore();
  const m = mailer();
  const { app, raw } = await sent(store, m);
  const fake = "b".repeat(64);
  assert.equal((await site(app).post(`/public/sign/${raw}/document`, { proof: fake })).status, 401);
  assert.equal((await site(app).post(`/public/sign/${raw}/submit`, goodSubmit(fake))).status, 401);
  assert.equal(
    (await site(app).post(`/public/sign/${raw}/verify`, { code: "123456" })).status,
    401,
    "no code yet",
  );
  await site(app).post(`/public/sign/${raw}/code`, {});
  const mail = m.sent.at(-1);
  assert.equal(mail.to, "nusrat@example.com");
  const code = /is (\d{6})/.exec(mail.text)[1];
  assert.ok(!JSON.stringify(store.db).includes(`"${code}"`));
  const wrong = String((Number(code) + 1) % 1e6).padStart(6, "0");
  for (let i = 0; i < 5; i++)
    assert.equal((await site(app).post(`/public/sign/${raw}/verify`, { code: wrong })).status, 401);
  assert.equal(
    (await site(app).post(`/public/sign/${raw}/verify`, { code })).status,
    401,
    "5 misses destroy the code",
  );
  const proof = await verifiedProof(app, store, m, raw);
  const doc = await site(app).post(`/public/sign/${raw}/document`, { proof });
  assert.equal(doc.status, 200);
  assert.ok(doc.body.body.includes("{{name}}"));
  assert.equal(doc.body.fields.find((f) => f.key === "cohort").recipient, false);
});

test("code requests share the sign-in code rate limits per email", async () => {
  const seen = [];
  const store = fakeStore({
    allow: (scope, key) => (seen.push([scope, key]), scope !== "email-code"),
  });
  const m = mailer();
  const { app, raw } = await sent(store, m);
  const r = await site(app).post(`/public/sign/${raw}/code`, {});
  assert.equal(r.status, 429);
  assert.ok(seen.some(([s, k]) => s === "email-code" && k === "nusrat@example.com"));
});

test("signing: stores the record, PDF, emails, and can't be signed twice or changed", async () => {
  const store = fakeStore();
  const m = mailer();
  const { app, raw, id } = await sent(store, m);
  const proof = await verifiedProof(app, store, m, raw);
  const bad = await site(app).post(`/public/sign/${raw}/submit`, {
    ...goodSubmit(proof),
    values: { name: "N", phone: "1", id_number: "" },
  });
  assert.equal(bad.status, 400);
  assert.ok(bad.body.fields.id_number && bad.body.fields.phone);
  assert.equal(
    (await site(app).post(`/public/sign/${raw}/submit`, { ...goodSubmit(proof), consent: false }))
      .status,
    400,
  );
  const ok = await site(app).post(`/public/sign/${raw}/submit`, goodSubmit(proof));
  assert.equal(ok.status, 201, ok.text);
  assert.match(ok.body.docId, /^SC-AGR-\d{4}-0001-[0-9A-F]{6}$/);
  assert.match(ok.body.signedAt, /\(Dhaka time\)$/);
  const s = store.db.signatures[0];
  const values = JSON.parse(s.field_values);
  assert.equal(values.id_number, "A01234567");
  assert.equal(
    values.cohort,
    "Student, Fall 2027",
    "staff-fixed values can't be changed by the signer",
  );
  assert.equal(s.text_sha256, sha(s.rendered_text));
  assert.ok(s.rendered_text.includes("Nusrat Jahan, holder of NID or passport number A01234567"));
  assert.equal(s.signature_method, "draw");
  assert.ok(s.consent_text.startsWith("I have read this agreement"));
  assert.equal(JSON.parse(s.verification).method, "email_code");
  assert.equal(s.pdf.subarray(0, 5).toString(), "%PDF-");
  assert.equal(s.pdf_sha256, sha(s.pdf));
  assert.equal(store.db.agreements[0].status, "signed");
  assert.deepEqual(
    store.db.outbox.map((o) => [o.to_email, o.attach_agreement_id]),
    [
      ["nusrat@example.com", id],
      [null, id],
    ],
  );
  assert.ok(!store.db.outbox.some((o) => o.body.includes("A01234567")), "no NID in emails");
  // Twice: refused, nothing changes.
  const again = await site(app).post(`/public/sign/${raw}/submit`, {
    ...goodSubmit(proof),
    values: { ...goodSubmit(proof).values, id_number: "Z99999999" },
  });
  assert.equal(again.status, 409);
  assert.equal(store.db.signatures.length, 1);
  assert.equal(JSON.parse(store.db.signatures[0].field_values).id_number, "A01234567");
  // Read-only afterwards: the link shows the signed state, and the signer can download the PDF.
  const view = await site(app).get(`/public/sign/${raw}`);
  assert.equal(view.body.state, "signed");
  assert.equal(view.body.signed.docId, ok.body.docId);
  const pdf = await site(app)
    .post(`/public/sign/${raw}/pdf`, { proof })
    .buffer(true)
    .parse((res, cb) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => cb(null, Buffer.concat(chunks)));
    });
  assert.equal(pdf.status, 200);
  assert.equal(pdf.headers["content-type"], "application/pdf");
  assert.equal(pdf.body.subarray(0, 5).toString(), "%PDF-");
  // Staff can't revoke or resend a signed agreement.
  assert.equal((await admin(app).post(`/api/agreements/${id}/revoke`, {})).status, 409);
  assert.equal((await admin(app).post(`/api/agreements/${id}/send`, {})).status, 409);
});

test("expiry, revoke and resend: old or withdrawn links stop working", async () => {
  const store = fakeStore();
  const m = mailer();
  const { app, raw, id } = await sent(store, m);
  store.db.agreements[0].expires_at = new Date(Date.now() - 1000);
  assert.equal(stateOf(store.db.agreements[0]), "expired");
  assert.equal((await site(app).get(`/public/sign/${raw}`)).status, 410);
  assert.equal((await site(app).post(`/public/sign/${raw}/code`, {})).status, 410);
  // Resend: a fresh link and 7 more days; the old link is gone.
  const r = await admin(app).post(`/api/agreements/${id}/send`, {});
  assert.equal(r.status, 200);
  const fresh = /\/sign\/([0-9a-f]{64})/.exec(m.sent.at(-1).html)[1];
  assert.notEqual(fresh, raw);
  assert.equal((await site(app).get(`/public/sign/${raw}`)).status, 404);
  assert.equal((await site(app).get(`/public/sign/${fresh}`)).status, 200);
  assert.ok(store.db.events.some((e) => e.event === "resent"));
  // Copy link rotates too and returns the URL to staff only.
  const l = await admin(app).post(`/api/agreements/${id}/link`, {});
  assert.match(l.body.url, /^https:\/\/scholarscafe\.com\/sign\/[0-9a-f]{64}$/);
  const linkToken = l.body.url.split("/").pop();
  assert.equal((await admin(app).post(`/api/agreements/${id}/revoke`, {})).status, 200);
  assert.equal(store.db.agreements[0].token_hash, null);
  assert.equal((await site(app).get(`/public/sign/${linkToken}`)).status, 404);
  for (const e of ["created", "sent", "resent", "link", "revoked"])
    assert.ok(
      store.db.events.some((x) => x.event === e),
      e,
    );
});

test("admin permissions: owners and admins only, with CSRF", async () => {
  for (const role of ["editor", "mentor"]) {
    const app = createApp(fakeStore({ role }), config, undefined, mailer());
    assert.equal((await admin(app).get("/api/agreements")).status, 403, role);
    assert.equal(
      (await admin(app).post("/api/agreements/templates", SAMPLE_TEMPLATE)).status,
      403,
      role,
    );
  }
  const app = createApp(fakeStore(), config, undefined, mailer());
  assert.equal((await request(app).get("/api/agreements")).status, 401);
  const noCsrf = await request(app)
    .post("/api/agreements/templates")
    .set("Cookie", COOKIE)
    .set("Origin", ADMIN)
    .send(SAMPLE_TEMPLATE);
  assert.equal(noCsrf.status, 403);
  assert.equal((await admin(app).get("/api/agreements")).status, 200);
  const adminApp = createApp(fakeStore({ role: "admin" }), config, undefined, mailer());
  assert.equal((await admin(adminApp).get("/api/agreements")).status, 200);
  // Not on the student portal.
  const student = createApp(fakeStore({ role: "student" }), studentConfig, undefined, mailer());
  assert.notEqual((await admin(student).get("/api/agreements")).status, 200);
  assert.equal(
    (
      await request(student)
        .get("/public/sign/" + "a".repeat(64))
        .set("Origin", PUBLIC)
    ).status,
    404,
  );
});

test("templates: unknown placeholders and built-in keys are refused", async () => {
  const app = createApp(fakeStore(), config, undefined, mailer());
  const r = await admin(app).post("/api/agreements/templates", {
    title: "T",
    body: "Hi {{name}}, school {{school}}",
  });
  assert.equal(r.status, 400);
  assert.match(r.body.error, /school/);
  const b = await admin(app).post("/api/agreements/templates", {
    title: "T",
    body: "{{name}}",
    fields: [{ key: "phone", label: "x" }],
  });
  assert.equal(b.status, 400);
  const ok = await admin(app).post("/api/agreements/templates", {
    title: "T",
    body: "{{name}} at {{school}}",
    fields: [{ key: "school", label: "School" }],
  });
  assert.equal(ok.status, 200);
});

test("NID is masked in lists and unsigned records, in full on the signed record", async () => {
  const store = fakeStore();
  const m = mailer();
  const { app, raw, id } = await sent(store, m);
  const proof = await verifiedProof(app, store, m, raw);
  const before = await admin(app).get(`/api/agreements/${id}`);
  assert.equal(before.body.signed, null);
  await site(app).post(`/public/sign/${raw}/submit`, goodSubmit(proof));
  const list = await admin(app).get("/api/agreements");
  assert.equal(list.body.items[0].id_masked, "•••••4567");
  assert.ok(!JSON.stringify(list.body.items).includes("A01234567"));
  const after = await admin(app).get(`/api/agreements/${id}`);
  assert.equal(after.body.signed.values.id_number, "A01234567");
  assert.equal(after.body.state, "signed");
  assert.ok(after.body.events.some((e) => e.event === "verified"));
  const png = await admin(app).get(`/api/agreements/${id}/signature.png`);
  assert.equal(png.headers["content-type"], "image/png");
});

test("staff-known NID typed by staff is masked until signed", async () => {
  const store = fakeStore();
  const m = mailer();
  const app = createApp(store, config, undefined, m);
  const t = await admin(app).post("/api/agreements/templates", {
    title: "T",
    body: "{{name}} {{id_number}}",
  });
  const r = await admin(app).post("/api/agreements", {
    template_id: t.body.id,
    recipient_name: "A B",
    recipient_email: "a@b.co",
    fields: [{ key: "id_number", label: "NID", value: "1234567890", recipient: false }],
  });
  assert.equal(r.status, 200, r.text);
  const d = await admin(app).get(`/api/agreements/${r.body.id}`);
  assert.equal(d.body.fields.find((f) => f.key === "id_number").value, "••••••7890");
  assert.equal(d.body.state, "draft");
  assert.equal(m.sent.length, 0, "a draft sends nothing");
});

test("student portal: signed in with the invited email skips the code", async () => {
  const store = fakeStore();
  const m = mailer();
  const { raw, app } = await sent(store, m);
  const student = createApp(fakeStore(), studentConfig, undefined, mailer());
  // Same database: point the student app at the same rows.
  const shared = fakeStore({ role: "student", email: "nusrat@example.com" });
  shared.db.agreements = store.db.agreements;
  shared.db.events = store.db.events;
  const portal = createApp(shared, studentConfig, undefined, mailer());
  const r = await request(portal).get(`/sign-check/${raw}`).set("Cookie", COOKIE);
  assert.equal(r.status, 303);
  const proof = /#proof=([0-9a-f]{64})$/.exec(r.headers.location)?.[1];
  assert.ok(proof, r.headers.location);
  assert.ok(r.headers.location.startsWith(`${PUBLIC}/sign/${raw}#`));
  assert.equal((await site(app).post(`/public/sign/${raw}/document`, { proof })).status, 200);
  shared.actor = { ...shared.actor, email: "someone@else.com" };
  const mismatch = await request(portal).get(`/sign-check/${raw}`).set("Cookie", COOKIE);
  assert.match(mismatch.headers.location, /#portal=mismatch$/);
  const none = await request(student).get(`/sign-check/${raw}`);
  assert.match(none.headers.location, /#portal=signin$/);
});

test("outbox delivery attaches the signed PDF", async () => {
  const { deliverMail } = await import("./mail.js");
  const sentMail = [];
  const row = {
    id: "m1",
    subject: "Your signed copy: T",
    body: "Hi",
    to_email: "n@x.com",
    attach_agreement_id: "a1",
  };
  const store = {
    transaction: (fn) => fn({}),
    query: async (q) => {
      if (q.includes("FROM mail_outbox")) return [row];
      if (q.includes("FROM agreement_signatures"))
        return [{ doc_id: "SC-AGR-2026-0001-ABC123", pdf: Buffer.from("%PDF-1.3 x") }];
      return [];
    },
  };
  await deliverMail(store, {
    sender: "no-reply@scholarscafe.com",
    sendMail: async (m) => sentMail.push(m),
  });
  assert.equal(sentMail[0].attachments[0].filename, "SC-AGR-2026-0001-ABC123.pdf");
  assert.equal(sentMail[0].attachments[0].contentType, "application/pdf");
});
