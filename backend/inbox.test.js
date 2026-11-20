import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import { pollInbox, sanitizeMail, parseMessage, viewCsp, hasRemoteImages } from "./inbox.js";

const ADMIN = "https://admin.scholarscafe.com";
const IMAP = { CONTACT_IMAP_USER: "contact@scholarscafe.com", CONTACT_IMAP_PASSWORD: "pw" };
const base = {
  ADMIN_ORIGIN: ADMIN,
  PUBLIC_ORIGIN: "https://scholarscafe.com",
  GOOGLE_CLIENT_ID: "t",
};
const cookie = "__Host-sc_session=" + "a".repeat(64);
const MID = "11111111-1111-4111-8111-111111111111";

const raw = (n, extra = "") =>
  Buffer.from(
    [
      `From: "Student ${n}" <student${n}@example.com>`,
      "To: contact@scholarscafe.com",
      `Subject: Question ${n}`,
      `Message-ID: <q${n}@example.com>`,
      "Date: Thu, 19 Nov 2026 10:00:00 +0000",
      "MIME-Version: 1.0",
      'Content-Type: multipart/alternative; boundary="b"',
      "",
      "--b",
      "Content-Type: text/plain; charset=utf-8",
      "",
      `Hello, I have question ${n}.`,
      "--b",
      "Content-Type: text/html; charset=utf-8",
      "",
      `<p onclick="x()">Hello <b>${n}</b></p><script>alert(1)</script><img src="https://track.example/p.gif">${extra}`,
      "--b--",
      "",
    ].join("\r\n"),
  );

/** An ImapFlow-shaped fake mailbox. */
function fakeImap(messages, { validity = 7n, fail } = {}) {
  const calls = { fetchOne: [], loggedOut: false };
  const client = {
    calls,
    mailbox: { uidValidity: validity, uidNext: Math.max(0, ...messages.map((m) => m.uid)) + 1 },
    async connect() {
      if (fail) throw Object.assign(new Error("no"), { authenticationFailed: true });
    },
    async getMailboxLock() {
      return { release() {} };
    },
    async *fetch(range) {
      const from = Number(range.split(":")[0]);
      // Like IMAP, "N:*" always returns the last message even if its UID is below N.
      const hits = messages.filter((m) => m.uid >= from);
      for (const m of hits.length ? hits : messages.slice(-1))
        yield { uid: m.uid, size: m.source.length };
    },
    async fetchOne(uid) {
      calls.fetchOne.push(Number(uid));
      return { uid: Number(uid), source: messages.find((m) => m.uid === Number(uid)).source };
    },
    async logout() {
      calls.loggedOut = true;
    },
  };
  return client;
}

function fakeStore(actor) {
  const db = { settings: {}, mail: [], outbox: [], push: [], sql: [] };
  return {
    db,
    session: async () => actor && { ...actor, csrf: "c" },
    transaction: (fn) => fn({}),
    audit: async () => {},
    checkRateLimit: async () => true,
    query: async (q, a = []) => {
      db.sql.push([q, a]);
      if (q.startsWith("SELECT value FROM settings")) {
        const v = db.settings[/name='(\w+)'/.exec(q)[1]];
        return v ? [{ value: v }] : [];
      }
      if (q.startsWith("INSERT INTO settings")) return ((db.settings[a[0]] = a[1]), {});
      if (q.startsWith("SELECT id FROM contact_mail WHERE message_id=?"))
        return db.mail.filter((m) => m.message_id === a[0]);
      if (q.startsWith("INSERT IGNORE INTO contact_mail")) {
        if (db.mail.some((m) => m.uidvalidity === a[1] && m.uid === a[2]))
          return { affectedRows: 0 };
        db.mail.push({
          id: a[0],
          uidvalidity: a[1],
          uid: a[2],
          message_id: a[3],
          from_email: a[7],
          subject: a[9],
          body_html: a[13],
        });
        return { affectedRows: 1 };
      }
      if (q.startsWith("SELECT id FROM users WHERE active=1 AND role IN ('owner','admin')"))
        return [{ id: "owner-1" }, { id: "admin-1" }];
      if (q.startsWith("INSERT INTO push_outbox")) {
        for (let i = 0; i < a.length; i += 2)
          db.push.push({ user_id: a[i], ...JSON.parse(a[i + 1]) });
        return {};
      }
      if (q.startsWith("SELECT * FROM contact_mail WHERE id=?"))
        return a[0] === MID
          ? [
              {
                id: MID,
                direction: "in",
                message_id: "<q1@example.com>",
                references_hdr: "<q0@example.com>",
                from_name: "Student",
                from_email: "student1@example.com",
                subject: "Question 1",
                body_text: "Hello <there>",
                body_html: '<p style="color:red">Hello</p><img src="https://t.example/x.gif">',
                has_remote_images: 1,
                attachments: "[]",
                received_at: new Date(),
              },
            ]
          : [];
      if (q.startsWith("INSERT INTO mail_outbox")) return (db.outbox.push(a), {});
      if (q.startsWith("SELECT COUNT(*)")) return [{ total: 1, unread: 1 }];
      return q.startsWith("SELECT") ? [] : { affectedRows: 1 };
    },
  };
}

test("Sanitiser: no scripts, handlers, frames or javascript: links; formatting kept", () => {
  const out = sanitizeMail(
    '<table border="0"><tr><td style="color:#123" bgcolor="#fff"><a href="javascript:alert(1)">x</a><a href="https://ok.example">ok</a></td></tr></table>' +
      '<script>alert(1)</script><iframe src="https://x"></iframe><form action="https://x"><input></form><img src="x" onerror="alert(1)"><svg onload="x()"></svg><style>body{}</style>',
  );
  assert.doesNotMatch(out, /script|iframe|<form|<input|onerror|onload|javascript:|<svg|<style/i);
  assert.match(out, /<table border="0">/);
  assert.match(out, /style="color:#123"/);
  assert.match(
    out,
    /<a href="https:\/\/ok\.example" target="_blank" rel="noopener noreferrer">ok<\/a>/,
  );
  assert.ok(hasRemoteImages('<img src="https://t/x.gif">'));
  assert.ok(!hasRemoteImages('<img src="cid:abc">'));
});

test("Parser: headers, plain text and sanitised HTML", async () => {
  const m = await parseMessage(raw(1));
  assert.equal(m.from_email, "student1@example.com");
  assert.equal(m.from_name, "Student 1");
  assert.equal(m.subject, "Question 1");
  assert.equal(m.message_id, "<q1@example.com>");
  assert.match(m.body_text, /question 1/);
  assert.doesNotMatch(m.body_html, /script|onclick/);
  assert.equal(m.has_remote_images, true);
});

test("Polling: imports new mail once, remembers its place, notifies owners/admins", async () => {
  const store = fakeStore();
  const box = [1, 2, 3].map((uid) => ({ uid, source: raw(uid) }));
  let client = fakeImap(box);
  assert.equal(await pollInbox(store, IMAP, () => client), 3);
  assert.equal(store.db.settings.imap_state, "7:3");
  assert.ok(client.calls.loggedOut);
  assert.equal(store.db.push.length, 6, "two readers × three messages");
  assert.equal(store.db.push[0].open, "Mail");
  assert.equal(store.db.push[0].body, "Student 1: Question 1");
  assert.match(JSON.parse(store.db.settings.imap_status).ok.toString(), /true/);
  // Next poll: only the new message is fetched.
  box.push({ uid: 4, source: raw(4) });
  client = fakeImap(box);
  assert.equal(await pollInbox(store, IMAP, () => client), 1);
  assert.deepEqual(client.calls.fetchOne, [4]);
  // Nothing new: nothing fetched even though IMAP returns the last message for "5:*".
  client = fakeImap(box);
  assert.equal(await pollInbox(store, IMAP, () => client), 0);
  assert.deepEqual(client.calls.fetchOne, []);
  // Mailbox reset (new UIDVALIDITY): same Message-IDs are not stored twice.
  client = fakeImap(box, { validity: 8n });
  assert.equal(await pollInbox(store, IMAP, () => client), 0);
  assert.equal(store.db.mail.length, 4);
});

test("Polling: not configured does nothing; a failed sign-in is recorded without secrets", async () => {
  const store = fakeStore();
  let used = false;
  assert.equal(await pollInbox(store, {}, () => ((used = true), fakeImap([]))), 0);
  assert.equal(used, false);
  assert.equal(await pollInbox(store, IMAP, () => fakeImap([], { fail: true })), 0);
  const status = JSON.parse(store.db.settings.imap_status);
  assert.equal(status.ok, false);
  assert.match(status.reason, /CONTACT_IMAP_PASSWORD/);
  assert.doesNotMatch(store.db.settings.imap_status, /pw/);
});

test("Access: owners and admins only", async () => {
  for (const role of ["editor", "mentor"])
    await request(createApp(fakeStore({ id: "u", role, email: "x@x.com" }), base))
      .get("/api/inbox")
      .set("Cookie", cookie)
      .expect(403);
  const res = await request(
    createApp(fakeStore({ id: "u", role: "admin", email: "a@x.com" }), base),
  )
    .get("/api/inbox")
    .set("Cookie", cookie)
    .expect(200);
  assert.equal(res.body.connected, false, "clear not-connected state without env vars");
});

test("Safe display: own CSP with no scripts; remote images only on request", async () => {
  const app = createApp(fakeStore({ id: "u", role: "owner", email: "o@x.com" }), {
    ...base,
    ...IMAP,
  });
  const res = await request(app).get(`/api/inbox/${MID}/view`).set("Cookie", cookie).expect(200);
  const csp = res.headers["content-security-policy"];
  assert.match(csp, /default-src 'none'/);
  assert.doesNotMatch(csp, /script-src/);
  assert.match(csp, /img-src data: cid:;/);
  assert.match(csp, /sandbox allow-popups allow-popups-to-escape-sandbox/);
  assert.match(csp, /frame-ancestors 'self'/);
  assert.equal(res.headers["x-frame-options"], "SAMEORIGIN");
  assert.match(viewCsp(true), /img-src data: cid: https:/);
  // The dashboard itself may frame its own origin (for this view).
  const page = await request(app).get("/api/me").set("Cookie", cookie);
  assert.match(page.headers["content-security-policy"], /frame-src 'self'/);
});

test("Reply: from contact@, threaded, logged; refused without the mailbox password", async () => {
  const store = fakeStore({ id: "u", role: "owner", email: "o@x.com" });
  const post = (cfg) =>
    request(createApp(store, cfg))
      .post(`/api/inbox/${MID}/reply`)
      .set("Cookie", cookie)
      .set("Origin", ADMIN)
      .set("X-CSRF-Token", "c")
      .send({ body: "Thanks, here is the answer." });
  await post({ ...base, SMTP_PASSWORD: "s", SMTP_USER: "no-reply@scholarscafe.com" }).expect(400);
  await post({
    ...base,
    ...IMAP,
    SMTP_PASSWORD: "s",
    SMTP_USER: "no-reply@scholarscafe.com",
  }).expect(201);
  const [id, subject, body, to, inReplyTo, refs] = store.db.outbox[0];
  assert.ok(id);
  assert.equal(subject, "Re: Question 1");
  assert.equal(body, "Thanks, here is the answer.");
  assert.equal(to, "student1@example.com");
  assert.equal(inReplyTo, "<q1@example.com>");
  assert.equal(refs, "<q0@example.com> <q1@example.com>");
  assert.ok(
    store.db.sql.some(([q]) => q.includes("from_contact") && q.includes("VALUES (?,?,?,?,1,?,?)")),
  );
  assert.ok(store.db.sql.some(([q]) => q.startsWith("UPDATE contact_mail SET replied_at")));
});
