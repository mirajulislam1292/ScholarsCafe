import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import { definitionSchema, INQUIRY_TEMPLATE, summarize, validateAnswers } from "./forms.js";

const PUBLIC = "https://scholarscafe.com";
const config = {
  ADMIN_ORIGIN: "https://admin.scholarscafe.com",
  PUBLIC_ORIGIN: PUBLIC,
  GOOGLE_CLIENT_ID: "t",
};
const def = definitionSchema.parse({
  steps: [
    {
      title: "You",
      fields: [
        { id: "name", label: "Name", type: "text", required: true, role: "name" },
        { id: "email", label: "Email", type: "email", required: true, role: "email" },
        {
          id: "level",
          label: "Level",
          type: "radio",
          required: true,
          options: ["Bachelor", "Master"],
        },
      ],
    },
    {
      title: "Master's details",
      fields: [
        {
          id: "gpa",
          label: "Bachelor's GPA",
          type: "number",
          required: true,
          show_if: { field: "level", equals: "Master" },
        },
        { id: "tests", label: "Tests", type: "checkbox", options: ["IELTS", "SAT", "GRE"] },
        { id: "ok", label: "I agree", type: "consent", required: true },
      ],
    },
  ],
});

test("Definitions: unique ids, conditions must point backwards, choices need options", () => {
  assert.ok(
    definitionSchema.safeParse(INQUIRY_TEMPLATE.definition).success,
    "the template is valid",
  );
  const one = (fields) => definitionSchema.safeParse({ steps: [{ fields }] }).success;
  assert.equal(
    one([
      { id: "a", label: "A", type: "text" },
      { id: "a", label: "B", type: "text" },
    ]),
    false,
  );
  assert.equal(
    one([
      { id: "a", label: "A", type: "text", show_if: { field: "b", equals: "x" } },
      { id: "b", label: "B", type: "text" },
    ]),
    false,
  );
  assert.equal(one([{ id: "a", label: "A", type: "select" }]), false);
  assert.equal(one([{ id: "Bad Id", label: "A", type: "text" }]), false);
  assert.equal(one([{ id: "a", label: "A", type: "file" }]), false);
});

test("Answers: required, types, choices; conditional fields only when shown and never stored when hidden", () => {
  const base = { name: "Rahim", email: "r@example.com", ok: true };
  assert.deepEqual(validateAnswers(def, { ...base, level: "Bachelor", gpa: "3.9" }).clean, {
    name: "Rahim",
    email: "r@example.com",
    level: "Bachelor",
    ok: true,
  });
  assert.deepEqual(validateAnswers(def, { ...base, level: "Master" }).errors, { gpa: "Required." });
  const e = validateAnswers(def, {
    name: "x".repeat(301),
    email: "nope",
    level: "PhD",
    tests: ["SAT", "<script>"],
    ok: "yes",
  }).errors;
  assert.deepEqual(Object.keys(e).sort(), ["email", "level", "name", "ok", "tests"]);
  const ok = validateAnswers(def, {
    ...base,
    level: "Master",
    gpa: "3.7",
    tests: ["IELTS", "IELTS"],
    extra: "dropped",
  });
  assert.deepEqual(ok.clean.tests, ["IELTS"]);
  assert.ok(!("extra" in ok.clean));
  assert.match(summarize(def, ok.clean), /Bachelor's GPA: 3\.7\nTests: IELTS\nI agree: Yes/);
});

function appWith(query, extra = {}) {
  const sql = [];
  return {
    sql,
    app: createApp(
      {
        query: async (q, a) => (sql.push([q, a]), query(q, a)),
        transaction: (fn) => fn({}),
        checkRateLimit: async () => true,
      },
      { ...config, ...extra },
    ),
  };
}
const form = {
  id: "f1111111-1111-4111-8111-111111111111",
  title: "Apply",
  success: "Thanks!",
  notify: 1,
  definition: JSON.stringify(def),
};

test("Public submit: website origin, JSON, honeypot, Turnstile; stored in the leads CRM with a notification", async () => {
  const { app, sql } = appWith(async (q) => (q.includes("FROM forms WHERE slug=?") ? [form] : []));
  const answers = { name: "Rahim", email: "r@example.com", level: "Bachelor", ok: true };
  await request(app).post("/public/forms/apply").send({ answers }).expect(403);
  await request(app)
    .post("/public/forms/apply")
    .set("Origin", PUBLIC)
    .send({ answers, website: "bot" })
    .expect(200);
  assert.equal(sql.length, 0, "honeypot hits are dropped silently");
  const bad = await request(app)
    .post("/public/forms/apply")
    .set("Origin", PUBLIC)
    .send({ answers: { name: "x" } })
    .expect(400);
  assert.ok(bad.body.fields.email);
  const ok = await request(app)
    .post("/public/forms/apply")
    .set("Origin", PUBLIC)
    .send({ answers })
    .expect(201);
  assert.equal(ok.body.message, "Thanks!");
  const lead = sql.find(([q]) => q.startsWith("INSERT INTO inquiries"));
  assert.deepEqual(lead[1].slice(1, 4), ["Rahim", "r@example.com", ""]);
  assert.equal(lead[1][5], form.id);
  assert.ok(sql.some(([q]) => q.startsWith("INSERT INTO mail_outbox")));

  const guarded = appWith(async (q) => (q.includes("FROM forms") ? [form] : []), {
    TURNSTILE_SECRET_KEY: "s",
    verifyTurnstile: async (_s, t) => t === "good",
  });
  await request(guarded.app)
    .post("/public/forms/apply")
    .set("Origin", PUBLIC)
    .send({ answers })
    .expect(400);
  await request(guarded.app)
    .post("/public/forms/apply")
    .set("Origin", PUBLIC)
    .send({ answers, turnstileToken: "bad" })
    .expect(400);
  await request(guarded.app)
    .post("/public/forms/apply")
    .set("Origin", PUBLIC)
    .send({ answers, turnstileToken: "good" })
    .expect(201);
});

test("Public form page: unpublished forms are hidden; slugs are checked", async () => {
  const { app, sql } = appWith(async () => []);
  await request(app).get("/public/forms/apply").expect(404);
  assert.match(sql[0][0], /published=1 AND deleted_at IS NULL/);
  await request(app).get("/public/forms/..%2Fetc").expect(400);
});

test("Form admin is owner/admin only; editors and mentors are refused", async () => {
  for (const role of ["editor", "mentor"]) {
    const app = createApp(
      {
        session: async () => ({ id: "u", role, csrf: "c" }),
        query: async () => [],
        transaction: (fn) => fn({}),
      },
      config,
    );
    await request(app)
      .get("/api/forms")
      .set("Cookie", "__Host-sc_session=" + "a".repeat(64))
      .expect(403);
  }
});

test("Link clicks: website origin only, and only for published links", async () => {
  const { app, sql } = appWith(async (q) => (q.includes("kind='links'") ? [{ id: "ig" }] : []));
  await request(app).post("/public/links/ig/click").expect(403);
  await request(app).post("/public/links/ig/click").set("Origin", PUBLIC).expect(204);
  assert.ok(sql.some(([q]) => q.startsWith("INSERT INTO link_clicks")));
  const none = appWith(async () => []);
  await request(none.app).post("/public/links/nope/click").set("Origin", PUBLIC).expect(404);
});
