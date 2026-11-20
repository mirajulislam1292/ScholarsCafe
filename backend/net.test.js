import test from "node:test";
import assert from "node:assert/strict";
import { createApi } from "./public/net.js";

/** A fetch that answers from a list: a status + JSON body, an HTML page, or "offline" (network error). */
function replies(...list) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push([url, init.method]);
    const next = list.length > 1 ? list.shift() : list[0];
    if (next === "offline") throw new TypeError("Failed to fetch");
    if (next === "html")
      return { status: 503, ok: false, json: async () => JSON.parse("<html>Service Unavailable") };
    const [status, body] = next;
    return { status, ok: status < 400, json: async () => body };
  };
  return { fetch, calls };
}
const setup = (net, extra = {}) => {
  let signedOut = 0;
  const api = createApi({
    fetch: net.fetch,
    wait: async () => {},
    onSignedOut: () => signedOut++,
    ...extra,
  });
  return { ...api, signedOut: () => signedOut };
};

test("Sign-out cause: opening the app while the server restarts used to show the sign-in screen", async () => {
  // Hostinger answers with an HTML error page while the app restarts after a deploy or wakes from idle.
  // Before: /api/me failed to parse, and the sign-in screen (visible by default) stayed up.
  const net = replies("html", "offline", [503, { error: "x" }], [200, { id: "u", role: "owner" }]);
  let waiting = 0;
  const t = setup(net, { onWaiting: () => waiting++ });
  assert.deepEqual(await t.whoAmI(), { id: "u", role: "owner" });
  assert.equal(waiting, 3);
  assert.equal(t.signedOut(), 0);
  // Only a real "not signed in" answer means signed out.
  assert.equal(await setup(replies([401, { error: "Please sign in." }])).whoAmI(), null);
});

test("Sign-out cause: one 401 in the middle of work used to bounce people to the sign-in screen", async () => {
  // A stray 401, but /api/me says the session is fine: the request is repeated, nobody is signed out.
  const net = replies([401, { error: "no" }], [200, { id: "u" }], [200, { items: [1] }]);
  const t = setup(net);
  assert.deepEqual(await t.api("workspace/tasks"), { items: [1] });
  assert.equal(t.signedOut(), 0);
  assert.deepEqual(
    net.calls.map(([u]) => u),
    ["/api/workspace/tasks", "/api/me", "/api/workspace/tasks"],
  );
  // /api/me can't be reached either: still not signed out.
  const flaky = setup(replies([401, { error: "no" }], "offline", "offline", "offline", "offline", [200, { ok: 1 }]));
  assert.deepEqual(await flaky.api("workspace/tasks"), { ok: 1 });
  assert.equal(flaky.signedOut(), 0);
  // Confirmed by /api/me: signed out.
  const out = setup(replies([401, { error: "Your session has expired." }]));
  await assert.rejects(out.api("workspace/tasks"), /expired/);
  assert.equal(out.signedOut(), 1);
});

test("Temporary failures: GETs are retried, POSTs are not repeated, and 403s are just errors", async () => {
  const get = setup(replies([429, { error: "Too many" }], "html", [200, { ok: 1 }]));
  assert.deepEqual(await get.api("workspace/chat"), { ok: 1 });
  const post = replies("offline", [201, { ok: 1 }]);
  await assert.rejects(setup(post).api("workspace/chat", { body: "hi" }), /No connection/);
  assert.equal(post.calls.length, 1, "a message is never sent twice");
  const denied = setup(replies([403, { error: "Staff only." }]));
  await assert.rejects(denied.api("workspace/team"), /Staff only/);
  assert.equal(denied.signedOut(), 0);
});

test("The sign-in screen is hidden until the server confirms nobody is signed in", async () => {
  const { readFile } = await import("node:fs/promises");
  const html = await readFile(new URL("./public/index.html", import.meta.url), "utf8");
  assert.match(html, /<div id="login" class="login" hidden>/);
  assert.match(html, /<p id="boot"[^>]*>/);
});
