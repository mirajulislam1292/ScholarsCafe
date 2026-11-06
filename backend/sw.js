/* Service worker for the admin and student portals (served by app.js at /sw.js).
 * Rules:
 *  - Never touches /api, /auth or /public: no personal data, videos or API responses are ever cached.
 *  - Pages and the app's own files: network first (always the newest after a deploy), cache only as an
 *    offline fallback. When offline, pages show /offline.html.
 */
const VERSION = "__VERSION__";
const CACHE = "sc-shell-" + VERSION;
const SHELL = [
  "/offline.html",
  "/style.css",
  "/app.js",
  "/brand-mark.png",
  "/icons/icon-192.png",
  "/fonts/FunnelDisplay-Variable-latin.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: "reload" }))))
      .catch(() => {}) // a missing optional file must not block install
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
const PRIVATE = /^\/(api|auth|public)(\/|$)/;
const ASSET = /^\/(app\.js|style\.css|brand-mark\.png|icons\/|fonts\/)/;
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin || PRIVATE.test(url.pathname))
    return; // browser default: straight to the network, nothing stored
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/offline.html")));
    return;
  }
  if (ASSET.test(url.pathname))
    event.respondWith(
      fetch(req, { cache: "no-cache" })
        .then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(url.pathname, copy));
          }
          return res;
        })
        .catch(() => caches.match(url.pathname).then((r) => r || Response.error())),
    );
});
