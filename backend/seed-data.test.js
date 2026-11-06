import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertTestTarget, clean, seed, TEST_DOMAIN } from "./seed-data.js";

const local = {
  ADMIN_ORIGIN: "http://localhost:3000",
  PUBLIC_ORIGIN: "http://localhost:5173",
  DB_NAME: "sc_test",
};

test("Seed refuses the live sites, production mode, and runs without the flag", () => {
  assert.throws(() => assertTestTarget(local, []), /--test-data/);
  for (const [k, v] of [
    ["ADMIN_ORIGIN", "https://admin.scholarscafe.com"],
    ["PUBLIC_ORIGIN", "https://scholarscafe.com"],
    ["STUDENT_ORIGIN", "https://student.scholarscafe.com"],
  ])
    assert.throws(() => assertTestTarget({ ...local, [k]: v }, ["--test-data"]), /live site/);
  assert.throws(
    () => assertTestTarget({ ...local, NODE_ENV: "production" }, ["--test-data"]),
    /production/,
  );
  assert.doesNotThrow(() => assertTestTarget(local, ["--test-data"]));
});

test("Seed data is clearly labelled, and cleanup only deletes labelled rows and test files", async () => {
  const dir = await mkdtemp(join(tmpdir(), "sc-seed-"));
  const env = { ...local, VIDEO_DIR: join(dir, "v"), FILE_DIR: join(dir, "f") };
  try {
    const sql = [];
    const store = {
      query: async (q, a = []) => {
        sql.push([q, a]);
        if (q.startsWith("SELECT f.id FROM files")) return [{ id: inserted.file }];
        if (q.startsWith("SELECT id,mime FROM videos"))
          return inserted.video ? [{ id: inserted.video, mime: "video/mp4" }] : [];
        return [];
      },
    };
    const inserted = {};
    const out = await seed(store, env, () => {});
    assert.match(out.password, /^Test-/);
    const users = sql.filter(([q]) => q.startsWith("INSERT INTO users"));
    assert.equal(users.length, 5);
    for (const [, a] of users) assert.ok(a[1].endsWith(TEST_DOMAIN), "every user is @example.test");
    for (const table of ["lms_courses", "packages", "forms", "student_resources"]) {
      const row = sql.find(([q]) => q.startsWith("INSERT INTO " + table));
      assert.ok(
        row[1].some((v) => typeof v === "string" && v.startsWith("[TEST]")),
        table + " is labelled",
      );
    }
    inserted.file = sql.find(([q]) => q.startsWith("INSERT INTO files"))[1][0];
    inserted.video = sql.find(([q]) => q.startsWith("INSERT INTO videos"))?.[1][0];
    assert.ok((await readdir(join(dir, "f"))).includes(inserted.file));

    sql.length = 0;
    await clean(store, env, () => {});
    for (const [q, a] of sql.filter(([q]) => q.startsWith("DELETE")))
      assert.ok(/\[TEST\]%/.test(q) || a.includes("%" + TEST_DOMAIN), "unscoped delete: " + q);
    assert.deepEqual(await readdir(join(dir, "f")), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
