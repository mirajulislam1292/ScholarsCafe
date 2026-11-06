import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";

const base = {
  ADMIN_ORIGIN: "https://admin.scholarscafe.com",
  PUBLIC_ORIGIN: "https://scholarscafe.com",
  GOOGLE_CLIENT_ID: "t",
};

test("Manifest: installable, per portal", async () => {
  const admin = await request(createApp({}, base)).get("/manifest.webmanifest").expect(200);
  assert.match(admin.headers["content-type"], /manifest\+json/);
  assert.equal(admin.body.name, "Scholars Cafe Studio");
  assert.equal(admin.body.display, "standalone");
  assert.ok(admin.body.icons.some((i) => i.purpose === "maskable" && i.sizes === "512x512"));
  const student = await request(
    createApp(
      {},
      { ...base, PORTAL: "student", STUDENT_ORIGIN: "https://student.scholarscafe.com" },
    ),
  )
    .get("/manifest.webmanifest")
    .expect(200);
  assert.equal(student.body.name, "Scholars Cafe Student");
});

test("Service worker: revalidated every load, never caches private routes", async () => {
  const res = await request(createApp({}, base)).get("/sw.js").expect(200);
  assert.equal(res.headers["cache-control"], "no-cache");
  assert.match(res.headers["content-type"], /javascript/);
  assert.doesNotMatch(res.text, /__VERSION__/, "version is stamped per deploy");
  // Private paths are excluded before any caching logic runs.
  assert.match(res.text, /const PRIVATE = \/\^\\\/\(api\|auth\|public\)/);
  assert.match(res.text, /PRIVATE\.test\(url\.pathname\)\)\s*return;/);
  // Only the shell list is pre-cached: no /api, videos or downloads.
  const shell = /const SHELL = \[([\s\S]*?)\]/.exec(res.text)[1];
  assert.doesNotMatch(shell, /\/api|\/lms|stream|download|video/);
});

test("Offline page and icons are static files", async () => {
  const app = createApp({}, base);
  const offline = await request(app).get("/offline.html").expect(200);
  assert.match(offline.text, /You're offline/);
  for (const icon of ["icon-192.png", "icon-512.png", "maskable-512.png", "apple-touch-icon.png"])
    await request(app)
      .get("/icons/" + icon)
      .expect(200)
      .expect("Content-Type", /png/);
});
