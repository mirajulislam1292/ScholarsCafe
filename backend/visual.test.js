import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";

const config = {
  ADMIN_ORIGIN: "https://admin.scholarscafe.com",
  PUBLIC_ORIGIN: "https://scholarscafe.com",
  GOOGLE_CLIENT_ID: "t",
};
const SUPER = "contact.scholarscafe@gmail.com";
const cookie = "__Host-sc_session=" + "a".repeat(64);

function app(actor, query) {
  const sql = [];
  const a = createApp(
    {
      session: async () => ({ id: "u1", csrf: "c", ...actor }),
      transaction: (fn) => fn({}),
      query: async (q, args) => (sql.push([q, args]), query ? query(q, args) : []),
      audit: async () => {},
    },
    config,
  );
  return {
    sql,
    post: (body, path = "/api/visual/edit") =>
      request(a)
        .post(path)
        .set("Cookie", cookie)
        .set("Origin", config.ADMIN_ORIGIN)
        .set("X-CSRF-Token", "c")
        .send(body),
    me: () => request(a).get("/api/me").set("Cookie", cookie),
  };
}
const superUser = { role: "owner", email: SUPER };
const live = (q) =>
  q.startsWith("SELECT role,active,email FROM users")
    ? [{ role: "owner", active: 1, email: SUPER }]
    : null;

test("The Owner and Admins use the visual editor; executives and mentors are refused (no email check)", async () => {
  for (const actor of [
    { role: "editor", email: SUPER },
    { role: "mentor", email: "m@x.com" },
  ]) {
    const t = app(actor);
    await t.post({ target: { type: "copy", key: "About.x" }, value: "Hi" }).expect(403);
    assert.equal(t.sql.length, 0, "refused before any query");
    const me = await t.me().expect(200);
    assert.equal(me.body.visual, undefined);
    assert.equal(me.body.permissions.includes("site.manage"), false);
  }
  for (const role of ["owner", "admin"]) {
    const me = await app({ role, email: "anyone@example.com" }).me().expect(200);
    assert.equal(me.body.visual, true);
    assert.equal(me.body.public_origin, "https://scholarscafe.com");
  }
});

test("Editing a text updates the entry that holds it, publishes it and keeps a revision", async () => {
  const t = app(
    superUser,
    (q) =>
      live(q) ||
      (q.includes("FROM content WHERE kind='copy'")
        ? [
            {
              id: "copy-Home",
              kind: "copy",
              draft: { "Hero.a": "Old", "Hero.b": "Draft only" },
              published: { "Hero.a": "Old" },
              version: 3,
            },
            {
              id: "copy-About",
              kind: "copy",
              draft: { "About.x": "A" },
              published: { "About.x": "A" },
              version: 1,
            },
          ]
        : []),
  );
  await t.post({ target: { type: "copy", key: "Hero.a" }, value: "New headline" }).expect(200);
  const update = t.sql.find(([q]) => q.startsWith("UPDATE content SET draft=?,published=?"));
  assert.equal(update[1][2], "copy-Home");
  assert.deepEqual(
    JSON.parse(update[1][1]),
    { "Hero.a": "New headline" },
    "only this text goes live, not other drafts",
  );
  assert.ok(t.sql.some(([q]) => q.startsWith("INSERT INTO revisions")));
});

test("A text not stored yet goes into the visual editor's own entry", async () => {
  const t = app(superUser, (q) => live(q) || []);
  await t
    .post({
      target: { type: "copy", key: "Links.tagline" },
      value: "Your guide to US universities",
    })
    .expect(200);
  const insert = t.sql.find(([q]) => q.startsWith("INSERT INTO content"));
  assert.match(insert[0], /copy-visual-editor/);
  assert.deepEqual(JSON.parse(insert[1][1]), { "Links.tagline": "Your guide to US universities" });
});

test("List items: only existing text fields, and the item's rules still apply", async () => {
  const entry = (q) =>
    live(q) ||
    (q.includes("FROM content WHERE id=?")
      ? [
          {
            id: "team-1",
            kind: "team",
            draft: null,
            published: {
              name: "A",
              group: "Founders",
              role: "",
              title: "",
              line: "",
              photo: "/team/a.webp",
              position: 1,
            },
          },
        ]
      : []);
  await app(superUser, entry)
    .post({ target: { type: "entry", id: "team-1", field: "name" }, value: "Rahim" })
    .expect(200);
  await app(superUser, entry)
    .post({ target: { type: "entry", id: "team-1", field: "position" }, value: "2" })
    .expect(400);
  await app(superUser, entry)
    .post({ target: { type: "entry", id: "team-1", field: "photo" }, value: "javascript:alert(1)" })
    .expect(400);
  await app(superUser)
    .post({ target: { type: "copy", key: "../etc" }, value: "x" })
    .expect(400);
});

test("One line of a list (e.g. a program feature) can be edited in place", async () => {
  const t = app(
    superUser,
    (q) =>
      live(q) ||
      (q.includes("FROM content WHERE id=?")
        ? [
            {
              id: "course-1",
              kind: "courses",
              draft: null,
              published: {
                title: "Full Scholarship",
                description: "",
                price: "",
                badge: "",
                features: ["A", "B", "C"],
                cta: "Go",
                featured: false,
                position: 1,
              },
            },
          ]
        : []),
  );
  await t
    .post({ target: { type: "entry", id: "course-1", field: "features.1" }, value: "B2" })
    .expect(200);
  const update = t.sql.find(([q]) => q.startsWith("UPDATE content SET draft=?,published=?"));
  assert.deepEqual(JSON.parse(update[1][1]).features, ["A", "B2", "C"]);
  await app(
    superUser,
    (q) =>
      live(q) ||
      (q.includes("FROM content WHERE id=?")
        ? [{ id: "course-1", kind: "courses", published: { features: ["A"] } }]
        : []),
  )
    .post({ target: { type: "entry", id: "course-1", field: "features.5" }, value: "X" })
    .expect(400);
});

// ---------- Team sections (About page) ----------
const person = (id, name, group, role, position) => ({
  id,
  draft: null,
  published: {
    name,
    group,
    role,
    title: "",
    line: "Bio of " + name,
    photo: "/p/" + id + ".webp",
    position,
  },
});
const people = [
  person("team-a", "A", "Founders", "Co-founder & CEO", 10),
  person("team-b", "B", "Executive members", "COO", 30),
  person("team-c", "C", "mentor", "Mentor", 50),
];
const teamDb =
  (sections = []) =>
  (q) =>
    live(q) ||
    (q.includes("kind='team'") ? people : q.includes("LIKE 'team-section-%'") ? sections : []);
const layout = (sections) => ({ sections });

test("Team layout: Owner and Admins only; executives and mentors refused before any query", async () => {
  for (const role of ["editor", "mentor"]) {
    const t = app({ role, email: SUPER }, teamDb());
    await t
      .post(
        layout([{ id: "team-section-leadership", name: "Leadership", members: [] }]),
        "/api/visual/team",
      )
      .expect(403);
    assert.equal(t.sql.length, 0);
  }
});

test("Team layout: sections are created, people placed and ordered, nothing else changes", async () => {
  const t = app(superUser, teamDb());
  const res = await t
    .post(
      layout([
        {
          id: "team-section-leadership",
          name: "Leadership",
          members: [
            { id: "team-b", role: "COO" },
            { id: "team-a", role: "Founder" },
          ],
        },
        {
          id: "team-section-mentors",
          name: "Mentors",
          members: [{ id: "team-c", role: "Mentor" }],
        },
      ]),
      "/api/visual/team",
    )
    .expect(200);
  assert.equal(res.body.sections, 2);
  const inserts = t.sql.filter(([q]) => q.startsWith("INSERT INTO content"));
  assert.deepEqual(
    inserts.map(([, a]) => [a[0], a[1], JSON.parse(a[3])]),
    [
      ["team-section-leadership", "Leadership", { name: "Leadership", position: 0 }],
      ["team-section-mentors", "Mentors", { name: "Mentors", position: 10 }],
    ],
  );
  const updates = Object.fromEntries(
    t.sql
      .filter(([q]) => q.startsWith("UPDATE content SET draft=?,published=?"))
      .map(([, a]) => [a[2], JSON.parse(a[1])]),
  );
  assert.deepEqual(updates["team-b"], {
    ...people[1].published,
    section: "team-section-leadership",
    rank: 0,
  });
  assert.deepEqual(updates["team-a"], {
    ...people[0].published,
    role: "Founder",
    section: "team-section-leadership",
    rank: 10,
  });
  assert.deepEqual(updates["team-c"], {
    ...people[2].published,
    section: "team-section-mentors",
    rank: 0,
  });
  assert.equal(t.sql.filter(([q]) => q.startsWith("INSERT INTO revisions")).length, 3);
});

test("Team layout: everyone must be listed once, and a removed section is deleted", async () => {
  await app(superUser, teamDb())
    .post(
      layout([
        {
          id: "team-section-leadership",
          name: "Leadership",
          members: [{ id: "team-a", role: "" }],
        },
      ]),
      "/api/visual/team",
    )
    .expect(409);
  await app(superUser, teamDb())
    .post(
      layout([
        { id: "team-section-x", name: "X", members: [{ id: "team-a", role: "" }] },
        {
          id: "team-section-y",
          name: "Y",
          members: [
            { id: "team-a", role: "" },
            { id: "team-b", role: "" },
            { id: "team-c", role: "" },
          ],
        },
      ]),
      "/api/visual/team",
    )
    .expect(400);
  await app(superUser, teamDb())
    .post(layout([{ id: "team-section-x", name: "  ", members: [] }]), "/api/visual/team")
    .expect(400);
  const old = {
    id: "team-section-old",
    kind: "teamSections",
    draft: { name: "Old", position: 0 },
    published: { name: "Old", position: 0 },
    deleted_at: null,
  };
  const t = app(superUser, teamDb([old]));
  await t
    .post(
      layout([
        {
          id: "team-section-leadership",
          name: "Leadership",
          members: people.map((p) => ({ id: p.id, role: p.published.role })),
        },
      ]),
      "/api/visual/team",
    )
    .expect(200);
  const del = t.sql.find(([q]) => q.includes("deleted_at=UTC_TIMESTAMP()"));
  assert.deepEqual(del[1], ["team-section-old"]);
  const other = { ...old, id: "team-section-leadership", kind: "copy" };
  await app(superUser, teamDb([other]))
    .post(
      layout([
        {
          id: "team-section-leadership",
          name: "L",
          members: people.map((p) => ({ id: p.id, role: "" })),
        },
      ]),
      "/api/visual/team",
    )
    .expect(400);
});
