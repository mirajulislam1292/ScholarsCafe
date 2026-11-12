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
    post: (body) =>
      request(a)
        .post("/api/visual/edit")
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

test("Only the Super Admin Gmail may use the visual editor (other owners and admins are refused)", async () => {
  for (const actor of [
    { role: "owner", email: "other.owner@gmail.com" },
    { role: "admin", email: SUPER },
    { role: "editor", email: "e@x.com" },
  ]) {
    const t = app(actor);
    await t.post({ target: { type: "copy", key: "About.x" }, value: "Hi" }).expect(403);
    assert.equal(t.sql.length, 0, "refused before any query");
    const me = await t.me().expect(200);
    assert.equal(me.body.visual, undefined);
  }
  const me = await app(superUser).me().expect(200);
  assert.equal(me.body.visual, true);
  assert.equal(me.body.public_origin, "https://scholarscafe.com");
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
