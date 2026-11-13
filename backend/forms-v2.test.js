import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inflateRawSync } from "node:zlib";
import request from "supertest";
import { createApp } from "./app.js";
import {
  definitionSchema,
  FORM_TEMPLATES,
  seedFormTemplates,
  summarize,
  validateAnswers,
} from "./forms.js";
import { makeToken } from "./tokens.js";
import { xlsx } from "./xlsx.js";

const PUBLIC = "https://scholarscafe.com";
const FORM_ID = "f2222222-2222-4222-8222-222222222222";
const def = definitionSchema.parse({
  steps: [
    {
      fields: [
        { id: "intro_block", label: "Read this first", type: "info", help: "Long text" },
        { id: "name", label: "Name", type: "text", required: true, role: "name" },
        {
          id: "year",
          label: "Year",
          type: "radio",
          required: true,
          options: ["2026", "2027"],
          other: true,
        },
        {
          id: "services",
          label: "Services",
          type: "checkbox",
          required: true,
          options: ["A", "# Group", "B"],
          other: true,
        },
        { id: "plain", label: "Plain", type: "radio", options: ["X", "Y"] },
        { id: "at", label: "Time", type: "time" },
        { id: "cv", label: "CV", type: "file", required: true },
      ],
    },
  ],
});
const ticket = (fu, ff = FORM_ID) => makeToken({ fu, ff }, 600);

test("All five Google Forms templates are valid, with unique addresses", () => {
  assert.equal(FORM_TEMPLATES.length, 5);
  assert.equal(new Set(FORM_TEMPLATES.map((t) => t.slug)).size, 5);
  for (const t of FORM_TEMPLATES) {
    assert.ok(definitionSchema.safeParse(t.definition).success, t.slug);
    const roles = t.definition.steps
      .flatMap((s) => s.fields)
      .map((f) => f.role)
      .filter(Boolean);
    assert.deepEqual(roles.sort(), ["email", "name", "phone"], t.slug + " feeds Leads");
  }
});

test("New question types: info blocks, Other answers, headings, time, file tickets", () => {
  const upload = "u1111111-1111-4111-8111-111111111111";
  const ok = validateAnswers(
    def,
    {
      intro_block: "ignored",
      name: "Rahim",
      year: "2029 (gap year)",
      services: ["A", "Something else"],
      at: "09:30",
      cv: ticket(upload),
    },
    { formId: FORM_ID },
  );
  assert.deepEqual(ok.clean, {
    name: "Rahim",
    year: "2029 (gap year)",
    services: ["A", "Something else"],
    at: "09:30",
    cv: { upload },
  });
  const bad = validateAnswers(
    def,
    {
      name: "R",
      year: "2026",
      services: ["# Group"],
      plain: "Z",
      at: "25:00",
      cv: ticket(upload, "another-form"),
    },
    { formId: FORM_ID },
  );
  assert.ok(bad.errors.plain, "Other is only allowed when the question has it");
  assert.ok(bad.errors.at);
  assert.ok(bad.errors.cv, "tickets are bound to their form");
  assert.ok(
    validateAnswers(
      def,
      { name: "R", year: "2026", services: ["x", "y"], cv: ticket(upload) },
      { formId: FORM_ID },
    ).errors.services,
    "only one Other answer",
  );
  assert.ok(
    validateAnswers(
      def,
      { name: "R", year: "2026", services: ["A"], cv: "forged" },
      { formId: FORM_ID },
    ).errors.cv,
  );
  assert.equal(
    definitionSchema.safeParse({ steps: [{ fields: [{ id: "a", label: "A", type: "info" }] }] })
      .success,
    false,
    "a form needs at least one question",
  );
  assert.equal(
    definitionSchema.safeParse({
      steps: [{ fields: [{ id: "a", label: "A", type: "radio", options: ["# Only a heading"] }] }],
    }).success,
    false,
  );
  assert.match(
    summarize(def, { name: "R", cv: { file: "id", name: "cv.pdf" } }),
    /CV: cv\.pdf \(file\)/,
  );
});

function fakeStore(extra = {}) {
  const sql = [];
  const uploads = [];
  const form = {
    id: FORM_ID,
    slug: "apply",
    title: "Apply",
    success: "Thanks!",
    notify: 0,
    definition: JSON.stringify(def),
  };
  const store = {
    sql,
    uploads,
    query: async (q, a = []) => {
      sql.push([q, a]);
      if (
        q.includes("FROM forms WHERE slug=?") ||
        q.startsWith("SELECT id,slug,title,definition FROM forms") ||
        q.startsWith("SELECT id,definition FROM forms WHERE id=?")
      )
        return [form];
      if (q.startsWith("SELECT COALESCE(SUM(size),0)")) return [{ used: 0 }];
      if (q.startsWith("INSERT INTO form_uploads"))
        return (
          uploads.push({
            id: a[0],
            form_id: a[1],
            field_id: a[2],
            name: a[3],
            mime: a[4],
            size: a[5],
            inquiry_id: null,
          }),
          {}
        );
      if (q.startsWith("SELECT id,name,size FROM form_uploads"))
        return uploads.filter(
          (u) => u.id === a[0] && u.form_id === a[1] && u.field_id === a[2] && !u.inquiry_id,
        );
      if (q.startsWith("UPDATE form_uploads SET inquiry_id")) {
        uploads.find((u) => u.id === a[1]).inquiry_id = a[0];
        return {};
      }
      if (q.startsWith("SELECT id,name,mime FROM form_uploads"))
        return uploads.filter((u) => u.id === a[0] && u.inquiry_id);
      if (q.startsWith("SELECT id,created_at,status")) return extra.responses || [];
      if (q.startsWith("INSERT IGNORE INTO inquiries")) return { affectedRows: 1 };
      return [];
    },
    transaction: (fn) => fn({}),
    checkRateLimit: async () => true,
    audit: async () => {},
    session: async () => ({
      id: "owner",
      role: extra.role || "owner",
      email: "o@x.com",
      csrf: "c",
    }),
  };
  return store;
}
const PNG = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");

test("Form file uploads: website only, content checked, private, and claimed once by the submission", async () => {
  const dir = await mkdtemp(join(tmpdir(), "sc-forms-"));
  const store = fakeStore();
  const app = createApp(store, {
    ADMIN_ORIGIN: "https://admin.scholarscafe.com",
    PUBLIC_ORIGIN: PUBLIC,
    GOOGLE_CLIENT_ID: "t",
    FILE_DIR: dir,
  });
  const up = (body, type = "image/png", field = "cv") =>
    request(app)
      .post(`/public/forms/apply/upload?field=${field}`)
      .set("Origin", PUBLIC)
      .set("Content-Type", type)
      .set("X-File-Name", "../../my cv.png")
      .send(body);
  await request(app)
    .post("/public/forms/apply/upload?field=cv")
    .set("Content-Type", "image/png")
    .send(PNG)
    .expect(403);
  await up(Buffer.from("<script>alert(1)</script>")).expect(415);
  await up(PNG, "text/html").expect(415);
  await up(PNG, "image/png", "name").expect(400);
  const r = await up(PNG).expect(201);
  assert.equal(r.body.name, ".._.._my cv.png");
  assert.equal((await readdir(join(dir, "forms"))).length, 1);

  const answers = { name: "Rahim", year: "2026", services: ["B"], cv: r.body.ticket };
  const sent = await request(app)
    .post("/public/forms/apply")
    .set("Origin", PUBLIC)
    .send({ answers })
    .expect(201);
  assert.equal(sent.body.message, "Thanks!");
  const lead = store.sql.find(([q]) => q.startsWith("INSERT INTO inquiries"));
  const data = JSON.parse(lead[1][6]);
  assert.equal(data.cv.name, ".._.._my cv.png");
  assert.ok(store.uploads[0].inquiry_id, "the upload is attached to the submission");
  // The same ticket can't be used for a second submission.
  const again = await request(app)
    .post("/public/forms/apply")
    .set("Origin", PUBLIC)
    .send({ answers })
    .expect(400);
  assert.ok(again.body.fields.cv);

  // Staff download it as an attachment; it's sandboxed.
  const dl = await request(app)
    .get("/api/forms/uploads/" + store.uploads[0].id)
    .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
    .expect(200);
  assert.match(dl.headers["content-disposition"], /^attachment/);
  assert.match(dl.headers["content-security-policy"], /sandbox/);
  assert.deepEqual(Buffer.from(dl.body), await readFile(join(dir, "forms", store.uploads[0].id)));
});

test("Responses: staff-only table and an Excel file with one column per question", async () => {
  const responses = [
    {
      id: "i1",
      created_at: new Date("2026-11-12T10:00:00Z"),
      status: "new",
      name: "Rahim",
      email: "r@x.com",
      phone: "",
      data: JSON.stringify({
        name: '=HYPERLINK("evil")',
        services: ["A", "Something else"],
        cv: { file: "u1111111-1111-4111-8111-111111111111", name: "cv.pdf" },
        old_question: "kept",
      }),
    },
  ];
  for (const role of ["editor", "mentor"]) {
    const app = createApp(fakeStore({ role, responses }), {
      ADMIN_ORIGIN: "https://a",
      PUBLIC_ORIGIN: PUBLIC,
      GOOGLE_CLIENT_ID: "t",
    });
    await request(app)
      .get(`/api/forms/${FORM_ID}/responses.xlsx`)
      .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
      .expect(403);
  }
  const app = createApp(fakeStore({ responses }), {
    ADMIN_ORIGIN: "https://admin.scholarscafe.com",
    PUBLIC_ORIGIN: PUBLIC,
    GOOGLE_CLIENT_ID: "t",
  });
  const t = await request(app)
    .get(`/api/forms/${FORM_ID}/responses`)
    .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
    .expect(200);
  assert.deepEqual(
    t.body.columns.map((c) => c.id),
    ["name", "year", "services", "plain", "at", "cv", "old_question"],
  );
  const x = await request(app)
    .get(`/api/forms/${FORM_ID}/responses.xlsx`)
    .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
    .buffer(true)
    .parse((res, cb) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => cb(null, Buffer.concat(chunks)));
    })
    .expect(200);
  assert.match(x.headers["content-type"], /spreadsheetml/);
  const sheet = unzip(x.body)["xl/worksheets/sheet1.xml"];
  assert.match(sheet, /Something else/);
  assert.ok(!sheet.includes("<f>"), "answers are never formulas");
  assert.match(sheet, /=HYPERLINK\(&quot;evil&quot;\)/);
  assert.match(
    unzip(x.body)["xl/worksheets/_rels/sheet1.xml.rels"],
    /admin\.scholarscafe\.com\/api\/forms\/uploads\/u1111111/,
  );
});

/** Minimal unzip for the test (reads the central directory). */
function unzip(buf) {
  const out = {};
  const end = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  let p = buf.readUInt32LE(end + 16);
  const n = buf.readUInt16LE(end + 10);
  for (let i = 0; i < n; i++) {
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString();
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    out[name] = inflateRawSync(buf.subarray(start, start + size)).toString();
    p += 46 + nameLen + buf.readUInt16LE(p + 30) + buf.readUInt16LE(p + 32);
  }
  return out;
}

test("xlsx writer: valid zip, escaped text, header row", () => {
  const files = unzip(xlsx({ header: ["A & B"], rows: [["<x>"], [3], [null]] }));
  assert.ok(files["[Content_Types].xml"] && files["xl/workbook.xml"] && files["xl/styles.xml"]);
  assert.match(files["xl/worksheets/sheet1.xml"], /A &amp; B.*&lt;x&gt;.*<v>3<\/v>/s);
});

test("Google Forms CSV import: titles matched, commas inside choices kept, Other kept, times read", async () => {
  const { parseCsv, mapResponses, parseTimestamp, importId } = await import("./form-import.js");
  const t = FORM_TEMPLATES.find((x) => x.slug === "individual-services");
  const def2 = definitionSchema.parse(t.definition);
  const csv =
    '﻿Timestamp,Name,Email,WhatsApp Number,"Which Services do you want to purchase?\n(You can purchase multiple services at a time)",Amount you have Paid,Transaction ID,Screenshot/Picture of the Payment,Score\r\n' +
    '2025/11/12 10:30:45 PM GMT+6,Rahim,r@x.com,017,"CSS Fillup (one-on-one): 2,500 Taka, 2 Supplemental Essay : 1,000 Taka, Visa help, please",2500,TX1,https://drive.google.com/open?id=abc,\r\n';
  const { items, matched, unmatched } = mapResponses(def2, parseCsv(csv));
  assert.equal(items.length, 1);
  assert.deepEqual(items[0].data.services, [
    "CSS Fillup (one-on-one): 2,500 Taka",
    "2 Supplemental Essay : 1,000 Taka",
    "Visa help, please",
  ]);
  assert.equal(items[0].data.full_name, "Rahim");
  assert.equal(items[0].data.payment_screenshot, "https://drive.google.com/open?id=abc");
  assert.equal(items[0].createdAt.toISOString(), "2025-11-12T16:30:45.000Z");
  assert.ok(matched.length >= 7);
  assert.deepEqual(unmatched, ["Score"]);
  assert.equal(parseTimestamp("11/12/2025 22:30:45").toISOString(), "2025-11-12T16:30:45.000Z");
  assert.equal(importId("f", items[0]), importId("f", items[0]), "re-imports are skipped");

  // The BootCamp's long question (paragraph + question in one Google title) still matches.
  const boot = definitionSchema.parse(FORM_TEMPLATES[0].definition);
  const m = mapResponses(boot, [
    [
      "Please fill out this form carefully, as seats are strictly limited. Our team will reach out...\nAre you interested in submitting supporting materials (such as your resume, extracurricular list, or honors profile) to help us evaluate your profile for selection?  ",
    ],
    ["Yes"],
  ]);
  assert.equal(m.items[0].data.supporting_materials, "Yes");
});

test("Import route: owner/admin only, inserts once with the original time and no emails", async () => {
  const store = fakeStore();
  const app = createApp(store, {
    ADMIN_ORIGIN: "https://a",
    PUBLIC_ORIGIN: PUBLIC,
    GOOGLE_CLIENT_ID: "t",
  });
  const csv = "Timestamp,Name,Year\n2025/01/02 9:00:00 AM GMT+6,Rahim,2027\n";
  const r = await request(app)
    .post(`/api/forms/${FORM_ID}/import?status=closed`)
    .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
    .set("Origin", "https://a")
    .set("X-CSRF-Token", "c")
    .set("Content-Type", "text/csv")
    .send(csv)
    .expect(200);
  assert.deepEqual(r.body.matched, ["Name", "Year"]);
  const ins = store.sql.find(([q]) => q.startsWith("INSERT IGNORE INTO inquiries"));
  assert.equal(ins[1][1], "Rahim");
  assert.equal(ins[1][7], "closed");
  assert.equal(ins[1][8].toISOString(), "2025-01-02T03:00:00.000Z");
  assert.ok(!store.sql.some(([q]) => q.includes("mail_outbox")));
  const ed = createApp(fakeStore({ role: "editor" }), {
    ADMIN_ORIGIN: "https://a",
    PUBLIC_ORIGIN: PUBLIC,
    GOOGLE_CLIENT_ID: "t",
  });
  await request(ed)
    .post(`/api/forms/${FORM_ID}/import`)
    .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
    .set("Origin", "https://a")
    .set("X-CSRF-Token", "c")
    .set("Content-Type", "text/csv")
    .send(csv)
    .expect(403);
});

test("schema.sql splits into valid statements (no ';' inside comments)", async () => {
  const s = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  for (const chunk of s.split(";").filter((x) => x.trim())) {
    const code = chunk
      .split("\n")
      .filter((l) => !l.trim().startsWith("--"))
      .join("\n")
      .trim();
    if (code) assert.match(code, /^(CREATE|ALTER|INSERT|DROP|SET)\b/i, code.slice(0, 80));
  }
});

test("Receipts: the person gets a copy of their answers, at most 3 a day per address, and it can be turned off", async () => {
  const { receiptText } = await import("./forms.js");
  const def3 = definitionSchema.parse({
    steps: [
      {
        fields: [
          { id: "name", label: "Name", type: "text", required: true, role: "name" },
          { id: "email", label: "Email", type: "email", required: true, role: "email" },
          { id: "plan", label: "Plan", type: "radio", options: ["A", "B"] },
        ],
      },
    ],
  });
  let allowed = 3;
  const run = async (formRow) => {
    const sql = [];
    const app = createApp(
      {
        query: async (q, a) => (
          sql.push([q, a]),
          q.includes("FROM forms WHERE slug=?") ? [formRow] : []
        ),
        transaction: (fn) => fn({}),
        checkRateLimit: async (scope) => (scope === "form-receipt" ? allowed-- > 0 : true),
      },
      { ADMIN_ORIGIN: "https://a", PUBLIC_ORIGIN: PUBLIC, GOOGLE_CLIENT_ID: "t" },
    );
    await request(app)
      .post("/public/forms/apply")
      .set("Origin", PUBLIC)
      .send({ answers: { name: "Rahim Uddin", email: "rahim@example.com", plan: "B" } })
      .expect(201);
    return sql.filter(([q]) => q.includes("to_email"));
  };
  const row = {
    id: FORM_ID,
    title: "Apply",
    success: "Thanks",
    notify: 0,
    receipt: 1,
    definition: JSON.stringify(def3),
  };
  const [r] = await run(row);
  assert.equal(r[1][4], "rahim@example.com");
  assert.equal(r[1][3], "contact@scholarscafe.com", "replies go to the team");
  assert.match(r[1][2], /^Hi Rahim,/);
  assert.match(r[1][2], /Plan: B/);
  assert.equal((await run({ ...row, receipt: 0 })).length, 0, "switched off");
  allowed = 0;
  assert.equal((await run(row)).length, 0, "daily limit per address");
  assert.match(receiptText("X", "(no name)", "a: b"), /^Hi,/);
});

test("Mail delivery: receipts go to the person, notifications to the team inbox", async () => {
  const { deliverMail } = await import("./mail.js");
  for (const [row, to] of [
    [
      {
        id: "1",
        subject: "s",
        body: "b",
        to_email: "rahim@example.com",
        reply_to: "contact@scholarscafe.com",
      },
      "rahim@example.com",
    ],
    [
      { id: "2", subject: "s", body: "b", to_email: null, reply_to: null },
      "contact@scholarscafe.com",
    ],
  ]) {
    const sent = [];
    await deliverMail(
      { transaction: (fn) => fn({}), query: async (q) => (q.startsWith("SELECT") ? [row] : {}) },
      { sender: "no-reply@scholarscafe.com", sendMail: async (m) => sent.push(m) },
    );
    assert.equal(sent[0].to, to);
  }
});

test("built-in forms go live once and never come back after the team removes them", async () => {
  const settings = new Set();
  const forms = [];
  const store = {
    async query(sql, args) {
      if (sql.startsWith("INSERT IGNORE INTO settings")) {
        if (settings.has(args[0])) return { affectedRows: 0 };
        settings.add(args[0]);
        return { affectedRows: 1 };
      }
      if (sql.startsWith("SELECT id FROM forms"))
        return forms.filter((f) => f.slug === args[0] && !f.deleted);
      if (sql.startsWith("INSERT INTO forms")) {
        forms.push({
          slug: args[0],
          published: args[4],
          definition: JSON.parse(args[6]),
          cover: args[7],
          summary: args[9],
        });
        return { affectedRows: 1 };
      }
      if (sql.startsWith("UPDATE forms SET summary=")) {
        const f = forms.find((x) => x.slug === args[1] && !x.deleted && !x.summary);
        if (f) f.summary = args[0];
        return { affectedRows: f ? 1 : 0 };
      }
      throw new Error("unexpected " + sql);
    },
  };
  const added = await seedFormTemplates(store);
  assert.deepEqual(
    added,
    FORM_TEMPLATES.map((t) => t.slug),
  );
  assert.ok(forms.every((f) => f.published === true && f.cover?.startsWith("site:")));
  assert.ok(forms.every((f) => f.summary && f.summary.length <= 300));
  forms[0].deleted = true;
  assert.deepEqual(await seedFormTemplates(store), []);
  assert.equal(forms.length, FORM_TEMPLATES.length);
});

test("old Google columns match despite a doubled word, and leftover columns get readable titles", async () => {
  const { mapResponses } = await import("./form-import.js");
  const { extraLabel } = await import("./forms.js");
  const def = {
    steps: [{ fields: [{ id: "school", label: "Schools you have attended", type: "text" }] }],
  };
  const r = mapResponses(def, [
    [
      "Timestamp",
      "Schools you have have attended",
      "Tell us a story about your life in three lines",
    ],
    ["2026/08/01 10:00:00 AM GMT+6", "Dhaka College", "Once upon a time"],
  ]);
  assert.equal(r.items[0].data.school, "Dhaka College");
  const extra = Object.keys(r.items[0].data).find((k) => k.startsWith("gf_"));
  assert.equal(extraLabel(extra), "Tell us a story about your life in three lines");
});

test("public forms list: a summary, or the first real line of the introduction", async () => {
  const { summaryOf } = await import("./forms.js");
  assert.equal(summaryOf({ summary: " Short. ", intro: "x" }), "Short.");
  assert.equal(
    summaryOf({
      summary: "",
      intro: "Welcome to Scholars Cafe ☕🌍\nA Cafe to Ease Your Study Abroad Journey.\n\n📢 Help with your US student visa interview.",
    }),
    "Help with your US student visa interview.",
  );
  assert.equal(summaryOf({ summary: "", intro: "" }), "");
  assert.ok(summaryOf({ summary: "", intro: "word ".repeat(80) }).length <= 180);
});
