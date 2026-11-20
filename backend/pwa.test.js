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

test("Service worker: shows pushed notifications and opens the right screen", async () => {
  const res = await request(createApp({}, base)).get("/sw.js").expect(200);
  assert.match(res.text, /addEventListener\("push"/);
  assert.match(res.text, /showNotification\(/);
  assert.match(res.text, /addEventListener\("notificationclick"/);
  assert.match(res.text, /"\?open=" \+ encodeURIComponent\(open\)/);
  // Push handling never adds to the cache.
  const push = res.text.slice(res.text.indexOf('addEventListener("push"'));
  assert.doesNotMatch(push, /caches\./);
});

test("Push is iPhone-first: audible, tagged, renotifies, badges; app has a bundled sound", async () => {
  const app = createApp({}, base);
  const sw = (await request(app).get("/sw.js").expect(200)).text;
  assert.doesNotMatch(sw, /silent:\s*true/);
  assert.match(sw, /silent: false/);
  assert.match(sw, /renotify: true/);
  assert.match(sw, /tag,/);
  assert.match(sw, /setAppBadge\(shown\.length\)/);
  assert.match(sw, /postMessage\(\{ type: "push", open \}\)/);
  const wav = await request(app).get("/sounds/notify.wav").buffer(true).expect(200);
  assert.match(wav.headers["content-type"], /audio\/(wav|x-wav|wave)/);
  assert.ok(wav.body.length > 1000 && wav.body.length < 64 * 1024, "small file");
  assert.equal(wav.body.subarray(0, 4).toString(), "RIFF");
});

test("Install hint: a slim in-flow banner (never the sidebar's <aside>), phones only, dismissible", async () => {
  const { readFileSync } = await import("node:fs");
  const js = readFileSync(new URL("./public/app.js", import.meta.url), "utf8");
  const css = readFileSync(new URL("./public/style.css", import.meta.url), "utf8");
  // The global `aside` rule is the fixed 240px sidebar; the hint once inherited it and covered the chat.
  assert.doesNotMatch(js, /node\("aside"[^)]*install/);
  const hint = js.slice(js.indexOf("function showInstallHint"), js.indexOf("// In-app alert"));
  assert.match(hint, /phoneLike\(\)/, "not shown on desktop");
  assert.match(hint, /localStorage\.setItem\("install-hint", "dismissed"\)/);
  assert.match(hint, /\$\("notice"\)\.before\(bar\)/, "part of the page flow");
  const rule = /\.install-hint \{([^}]*)\}/.exec(css)[1];
  assert.doesNotMatch(rule, /position:\s*(fixed|absolute)/);
});
