import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import { hashPassword, verifyPassword, newCode, CODE_MINUTES, CODE_ATTEMPTS } from "./auth.js";
import { hash } from "./security.js";

// Email code and password sign-in live on the student portal (its origin is passed as ADMIN_ORIGIN).
const config = {
  PORTAL: "student",
  ADMIN_ORIGIN: "https://student.scholarscafe.com",
  PUBLIC_ORIGIN: "https://scholarscafe.com",
  GOOGLE_CLIENT_ID: "test",
};
const USER = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "mentor@example.com",
  role: "student",
  active: 1,
};
const post = (app, path, body, origin = config.ADMIN_ORIGIN) =>
  request(app).post(path).set("Origin", origin).send(body);

// Minimal in-memory store that answers the queries the auth routes make.
function fakeStore({ user = USER, code = null, limit = true, signup = "open" } = {}) {
  const state = {
    user: { ...user, failed_logins: 0, locked: 0 },
    code,
    sessions: 0,
    sent: [],
    log: [],
    created: [],
    profiles: [],
    sessionsCleared: 0,
  };
  const query = async (sql, args = []) => {
    state.log.push(sql);
    if (sql.startsWith("SELECT value FROM settings")) return [{ value: signup }];
    if (sql.startsWith("SELECT id,email,role,active FROM users WHERE email=? FOR UPDATE"))
      return args[0] === state.user.email ? [state.user] : [];
    if (sql.startsWith("INSERT INTO users")) state.created.push(args);
    if (sql.startsWith("INSERT INTO student_profiles")) state.profiles.push(args);
    if (sql.startsWith("UPDATE users SET password_hash")) state.user.password_hash = args[0];
    if (sql.startsWith("DELETE FROM sessions WHERE user_id")) state.sessionsCleared++;
    if (sql.startsWith("SELECT id,email,role,active,password_hash"))
      return args[0] === state.user.email ? [state.user] : [];
    if (sql.startsWith("SELECT id,email FROM users"))
      return args[0] === state.user.email ? [state.user] : [];
    if (sql.startsWith("REPLACE INTO email_codes")) {
      state.code = { code_hash: args[1], link_hash: args[2], attempts: 0 };
      return [];
    }
    if (sql.includes("JOIN email_codes e ON e.user_id=u.id"))
      return state.code && args[0] === state.user.email ? [{ ...state.user, ...state.code }] : [];
    if (sql.includes("WHERE e.link_hash=?"))
      return state.code?.link_hash === args[0] ? [state.user] : [];
    if (sql.startsWith("UPDATE email_codes SET attempts")) state.code.attempts++;
    if (sql.startsWith("DELETE FROM email_codes")) state.code = null;
    if (sql.startsWith("INSERT INTO sessions")) state.sessions++;
    if (sql.startsWith("UPDATE users SET failed_logins=IF")) {
      const n = state.user.failed_logins + 1;
      state.user.failed_logins = n >= 5 ? 0 : n;
      if (n >= 5) state.user.locked = 1;
    }
    return [];
  };
  const store = {
    query,
    transaction: (fn) => fn({}),
    audit: async () => {},
    checkRateLimit: async () => limit,
    session: async () => null,
  };
  return { store, state };
}
const mailer = (state) => ({ sendMail: async (m) => state.sent.push(m) });

test("Passwords are salted scrypt hashes and verify correctly", async () => {
  const a = await hashPassword("correct horse battery"),
    b = await hashPassword("correct horse battery");
  assert.match(a, /^scrypt\$32768\$8\$1\$/);
  assert.notEqual(a, b); // unique salt
  assert.equal(await verifyPassword("correct horse battery", a), true);
  assert.equal(await verifyPassword("wrong horse battery", a), false);
  assert.equal(await verifyPassword("anything", null), false);
});

test("Password sign-in works, then five misses lock the account", async () => {
  const { store, state } = fakeStore({
    user: { ...USER, password_hash: await hashPassword("a long enough secret") },
  });
  const app = createApp(store, config);
  const ok = await post(app, "/auth/password", {
    email: USER.email,
    password: "a long enough secret",
  }).expect(200);
  assert.match(ok.headers["set-cookie"][0], /^__Host-sc_session=[0-9a-f]{64};.*HttpOnly.*Secure/);
  for (let i = 0; i < 5; i++)
    await post(app, "/auth/password", { email: USER.email, password: "nope" }).expect(401);
  assert.equal(state.user.locked, 1);
  // Even the right password is refused while locked.
  await post(app, "/auth/password", { email: USER.email, password: "a long enough secret" }).expect(
    401,
  );
  assert.equal(state.sessions, 1);
});

test("Sign-in posts need the admin origin (no login CSRF)", async () => {
  const { store } = fakeStore();
  const app = createApp(store, config, undefined, mailer({ sent: [] }));
  await post(
    app,
    "/auth/password",
    { email: USER.email, password: "x" },
    "https://evil.example",
  ).expect(403);
  await post(app, "/auth/email/start", { email: USER.email }, "https://evil.example").expect(403);
});

test("Email code: same reply for unknown emails, 10-minute expiry, one use", async () => {
  const { store, state } = fakeStore();
  const app = createApp(store, config, undefined, mailer(state));
  const unknown = await post(app, "/auth/email/start", { email: "nobody@example.com" }).expect(200);
  const known = await post(app, "/auth/email/start", { email: USER.email }).expect(200);
  assert.deepEqual(unknown.body, known.body);
  assert.equal(CODE_MINUTES <= 10, true);
  assert.ok(state.log.some((s) => s.includes(`INTERVAL ${CODE_MINUTES} MINUTE`)));
  await new Promise((r) => setImmediate(r));
  assert.equal(state.sent.length, 1);
  assert.equal(state.sent[0].to, USER.email);
  const code = state.sent[0].text.match(/code is (\d{6})/)[1];
  assert.equal(state.code.code_hash, hash(USER.id + ":" + code)); // only the hash is stored
  await post(app, "/auth/email/verify", { email: USER.email, code }).expect(200);
  await post(app, "/auth/email/verify", { email: USER.email, code }).expect(401); // used up
});

test("Email code is destroyed after five wrong guesses", async () => {
  const { store, state } = fakeStore();
  const app = createApp(store, config, undefined, mailer(state));
  await post(app, "/auth/email/start", { email: USER.email }).expect(200);
  await new Promise((r) => setImmediate(r));
  const code = state.sent[0].text.match(/code is (\d{6})/)[1];
  const wrong = code === "000000" ? "111111" : "000000";
  for (let i = 0; i < CODE_ATTEMPTS; i++)
    await post(app, "/auth/email/verify", { email: USER.email, code: wrong }).expect(401);
  assert.equal(state.code, null);
  await post(app, "/auth/email/verify", { email: USER.email, code }).expect(401);
  assert.equal(state.sessions, 0);
});

test("Per-email request limit and magic link that needs a POST", async () => {
  const limited = fakeStore({ limit: false });
  await post(
    createApp(limited.store, config, undefined, mailer(limited.state)),
    "/auth/email/start",
    { email: USER.email },
  ).expect(429);

  const { store, state } = fakeStore();
  const app = createApp(store, config, undefined, mailer(state));
  await post(app, "/auth/email/start", { email: USER.email }).expect(200);
  await new Promise((r) => setImmediate(r));
  const link = state.sent[0].text.match(/token=([0-9a-f]{64})/)[1];
  const page = await request(app)
    .get("/auth/email/link?token=" + link)
    .expect(200);
  assert.equal(state.sessions, 0); // opening the link (e.g. by a mail scanner) does not sign in
  assert.match(page.text, /method="post"/);
  await request(app)
    .post("/auth/email/link")
    .set("Origin", config.ADMIN_ORIGIN)
    .type("form")
    .send({ token: link })
    .expect(303);
  assert.equal(state.sessions, 1);
  await request(app)
    .post("/auth/email/link")
    .set("Origin", config.ADMIN_ORIGIN)
    .type("form")
    .send({ token: link })
    .expect(401);
});

test("Codes are six random digits", () => {
  const seen = new Set(Array.from({ length: 50 }, newCode));
  for (const c of seen) assert.match(c, /^\d{6}$/);
  assert.ok(seen.size > 40);
});

test("Self sign-up: new students get zero-access accounts; the reply never reveals who exists", async () => {
  const { store, state } = fakeStore();
  const app = createApp(store, config, undefined, mailer(state));
  const fresh = await post(app, "/auth/signup", {
    email: "New@Example.com",
    name: "New Student",
    phone: "+880 1700-000000",
  }).expect(200);
  const existing = await post(app, "/auth/signup", { email: USER.email, name: "X" }).expect(200);
  assert.deepEqual(fresh.body, existing.body);
  assert.equal(state.created.length, 1);
  assert.equal(state.created[0][1], "new@example.com");
  assert.ok(state.log.some((s) => s.includes("VALUES (?,?,'student',1)")));
  assert.deepEqual(state.profiles[0].slice(1), ["New Student", "+880 1700-000000"]);
  // No course, package or enrollment is created: access starts at zero.
  assert.ok(!state.log.some((s) => /enrollments|user_packages/.test(s)));
  await new Promise((r) => setImmediate(r));
  assert.equal(state.sent.length, 2); // a code to the new student and to the existing one

  // A team account's email is never turned into a student, and gets no email, with the same reply.
  const team = fakeStore({ user: { ...USER, role: "admin" } });
  const teamReply = await post(
    createApp(team.store, config, undefined, mailer(team.state)),
    "/auth/signup",
    { email: USER.email, name: "X" },
  ).expect(200);
  assert.deepEqual(teamReply.body, fresh.body);
  await new Promise((r) => setImmediate(r));
  assert.equal(team.state.created.length + team.state.sent.length, 0);

  await post(app, "/auth/signup", { email: "bad", name: "X" }).expect(400);
  await post(app, "/auth/signup", { email: "a@b.co", name: "X", role: "owner" }).expect(400);
});

test("Invite-only mode refuses sign-up and Google sign-up creates nothing", async () => {
  const { store, state } = fakeStore({ signup: "invite" });
  const app = createApp(store, config, undefined, mailer(state));
  await post(app, "/auth/signup", { email: "new@example.com", name: "X" }).expect(403);
  assert.equal(state.created.length, 0);
  assert.deepEqual((await request(app).get("/auth/config")).body, {
    portal: "student",
    signup: false,
  });
});

test("Forgot password: emailed code sets a new password once and signs out every device", async () => {
  const { store, state } = fakeStore();
  const app = createApp(store, config, undefined, mailer(state));
  await post(app, "/auth/email/start", { email: USER.email }).expect(200);
  await new Promise((r) => setImmediate(r));
  const code = state.sent[0].text.match(/code is (\d{6})/)[1];
  await post(app, "/auth/password/reset", { email: USER.email, code, password: "short" }).expect(
    400,
  );
  const wrong = code === "000000" ? "111111" : "000000";
  await post(app, "/auth/password/reset", {
    email: USER.email,
    code: wrong,
    password: "a brand new passphrase",
  }).expect(401);
  const ok = await post(app, "/auth/password/reset", {
    email: USER.email,
    code,
    password: "a brand new passphrase",
  }).expect(200);
  assert.match(ok.headers["set-cookie"][0], /^__Host-sc_session=/);
  assert.equal(await verifyPassword("a brand new passphrase", state.user.password_hash), true);
  assert.equal(state.sessionsCleared, 1);
  await post(app, "/auth/password/reset", {
    email: USER.email,
    code,
    password: "another new passphrase",
  }).expect(401); // the code is used up
  // Unknown emails get the same error as wrong codes.
  const unknown = await post(app, "/auth/password/reset", {
    email: "nobody@example.com",
    code,
    password: "a brand new passphrase",
  }).expect(401);
  assert.match(unknown.body.error, /wrong or has expired/);
});
