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
  "/net.js",
  "/brand-mark.png",
  "/icons/icon-192.png",
  "/sounds/notify.wav",
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
const ASSET = /^\/(app\.js|net\.js|style\.css|brand-mark\.png|icons\/|fonts\/|sounds\/)/;
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

// ---------- Push notifications (staff devices that turned them on; see backend/push.js) ----------
// The payload is only a title, a short preview and which screen to open. Nothing is cached.
// iPhone first: a normal, audible notification (never silent), so iOS 16.4+ Home Screen apps and
// Chrome/Edge/Safari on desktop play the system sound. Each kind of event shares a tag (one card per
// chat/task/mail thread instead of a pile) and renotify makes every new one alert again.
const appBadge = async () => {
  // App icon badge (Badging API: iOS 16.4+ Home Screen apps, Chrome/Edge installed apps) = notifications shown.
  if (!self.navigator.setAppBadge) return;
  const shown = await self.registration.getNotifications();
  await (shown.length ? self.navigator.setAppBadge(shown.length) : self.navigator.clearAppBadge());
};
self.addEventListener("push", (event) => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch {}
  const open = typeof d.open === "string" ? d.open : "";
  const tag = d.tag || "sc-" + Date.now();
  event.waitUntil(
    self.registration
      .showNotification(d.title || "Scholars Cafe Studio", {
        body: d.body || "",
        icon: "/icons/icon-192.png",
        tag,
        renotify: true,
        silent: false,
        data: { open },
      })
      .then(appBadge)
      .catch(() => {})
      // An open app window plays its own short sound and badges the right menu item.
      .then(() => self.clients.matchAll({ type: "window", includeUncontrolled: true }))
      .then((list) => list.forEach((c) => c.postMessage({ type: "push", open }))),
  );
});
// Clicking a notification opens the right screen: an open app window switches to it, else a new one opens.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const open = event.notification.data?.open || "";
  const url = "/" + (open ? "?open=" + encodeURIComponent(open) : "");
  event.waitUntil(
    appBadge()
      .catch(() => {})
      .then(() => self.clients.matchAll({ type: "window", includeUncontrolled: true }))
      .then((list) => {
        for (const c of list)
          if (new URL(c.url).origin === self.location.origin && "focus" in c) {
            c.postMessage({ open });
            return c.focus();
          }
        return self.clients.openWindow(url);
      }),
  );
});
self.addEventListener("notificationclose", (event) => event.waitUntil(appBadge().catch(() => {})));
