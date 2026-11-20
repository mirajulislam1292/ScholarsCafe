// How the dashboard talks to /api. Someone is treated as signed out only when the server says so twice:
// a dropped connection, a server restart (every deploy, or Hostinger waking the app up), a 429 or one
// stray 401 must never send them back to the sign-in screen. Tested in net.test.js.
export class Offline extends Error {}

export function createApi({
  fetch = globalThis.fetch.bind(globalThis),
  wait = (ms) => new Promise((r) => setTimeout(r, ms)),
  csrf = () => "",
  onSignedOut = () => {},
  onWaiting = () => {},
} = {}) {
  async function request(path, body) {
    let r;
    try {
      r = await fetch("/api/" + path, {
        method: body === undefined ? "GET" : "POST",
        headers:
          body === undefined ? {} : { "Content-Type": "application/json", "X-CSRF-Token": csrf() },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new Offline("No connection. Check your internet and try again.");
    }
    const j = await r.json().catch(() => null);
    // Not our JSON (a proxy error page while the app restarts), a 5xx or a 429: temporary.
    if (!j || r.status >= 500 || r.status === 429)
      throw new Offline(j?.error || "The server is busy or restarting. Try again in a moment.");
    return { status: r.status, ok: r.ok, j };
  }
  /** GETs are retried a few times on temporary failures; POSTs are not (they might have gone through). */
  async function attempt(path, body) {
    const delays = body === undefined ? [800, 2500, 6000] : [];
    for (let i = 0; ; i++) {
      try {
        return await request(path, body);
      } catch (e) {
        if (!(e instanceof Offline) || i >= delays.length) throw e;
        await wait(delays[i]);
      }
    }
  }
  async function api(path, body) {
    let r = await attempt(path, body);
    if (r.status === 401) {
      // Double-check before signing anyone out. If /api/me can't be reached, assume still signed in.
      const still = await attempt("me").then(
        (m) => m.ok,
        () => true,
      );
      if (!still) {
        onSignedOut();
        throw Error(r.j.error);
      }
      if (body !== undefined) throw Error("That didn't go through. Please try again.");
      r = await attempt(path, body);
    }
    if (!r.ok) throw Error(r.j.error);
    return r.j;
  }
  /** Opening the app: the signed-in user, or null if signed out. Waits out restarts instead of failing. */
  async function whoAmI() {
    for (let i = 0; ; i++) {
      try {
        const r = await request("me");
        return r.ok ? r.j : null;
      } catch {
        onWaiting(i);
        await wait(Math.min(2000 * (i + 1), 15000));
      }
    }
  }
  return { api, whoAmI };
}
