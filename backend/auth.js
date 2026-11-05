// Email sign-in for approved accounts: password (scrypt) and a one-time email code / magic link.
// Student portal only. Every method only works for an active student account; team accounts are never
// found here. Self sign-up (when the owner leaves it open) creates a student with no access until staff
// assign a course or package.
import express from "express";
import { scrypt, randomBytes, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { z } from "zod";
import { token, hash, equal } from "./security.js";
import { sendLoginEmail } from "./mail.js";

const scryptAsync = promisify(scrypt);
const COST = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
export const CODE_MINUTES = 10; // one-time code and magic link lifetime
export const CODE_ATTEMPTS = 5; // wrong codes before the code is destroyed
export const PASSWORD_FAILURES = 5; // wrong passwords before a 15-minute lock
const LOCK_MINUTES = 15;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password.normalize("NFKC"), salt, 32, COST);
  return [
    "scrypt",
    COST.N,
    COST.r,
    COST.p,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}
export async function verifyPassword(password, stored) {
  const parts = typeof stored === "string" ? stored.split("$") : [];
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    await hashPassword(password); // same work either way, so timing does not reveal accounts
    return false;
  }
  const [, N, r, p, salt, key] = parts;
  const expected = Buffer.from(key, "base64url");
  const actual = await scryptAsync(
    password.normalize("NFKC"),
    Buffer.from(salt, "base64url"),
    expected.length,
    {
      N: Number(N),
      r: Number(r),
      p: Number(p),
      maxmem: COST.maxmem,
    },
  );
  return timingSafeEqual(expected, actual);
}
export const newCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");
const codeHash = (userId, code) => hash(userId + ":" + code);

const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((s) => s.toLowerCase());
export const passwordRule = z.string().min(12, "Use at least 12 characters.").max(128);
const passwordLogin = z.object({ email, password: z.string().min(1).max(128) }).strict();
const codeStart = z.object({ email }).strict();
const signupInput = z
  .object({
    email,
    name: z.string().trim().min(1, "Enter your name.").max(160),
    phone: z
      .string()
      .trim()
      .max(40)
      .regex(/^[+0-9 ()-]*$/, "Use digits, spaces and + ( ) - only.")
      .optional()
      .default(""),
  })
  .strict();
const resetInput = z
  .object({ email, code: z.string().regex(/^\d{6}$/), password: passwordRule })
  .strict();
const codeVerify = z.object({ email, code: z.string().regex(/^\d{6}$/) }).strict();
const passwordChange = z
  .object({ password: passwordRule, current: z.string().max(128).optional() })
  .strict();

const CODE_SENT = `If this email can use the student portal, a code is on its way. It expires in ${CODE_MINUTES} minutes.`;

/** Student self sign-up is open unless the owner switched it to invite-only. */
export async function signupOpen(store, c) {
  const rows = await store.query("SELECT value FROM settings WHERE name='student_signup'", [], c);
  return rows[0]?.value !== "invite";
}

const WRONG_CODE = "That code is wrong or has expired. Request a new one.";
const WRONG_PASSWORD =
  "Email or password is wrong, or the account is locked for 15 minutes. You can sign in with an email code instead.";

/** Public sign-in routes. `startSession(c, user, req, method)` creates the session row and returns its token. */
export function installAuthRoutes(app, { store, config, mailer, fail, startSession, setSession }) {
  const sameOrigin = (req, _res, next) => {
    if (req.headers.origin !== config.ADMIN_ORIGIN)
      throw fail(403, "Request verification failed. Reload and try again.");
    next();
  };
  const devLog =
    !mailer && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(config.ADMIN_ORIGIN || "");

  app.post("/auth/password", sameOrigin, async (req, res) => {
    const { email: address, password } = passwordLogin.parse(req.body);
    const rows = await store.query(
      "SELECT id,email,role,active,password_hash,(locked_until IS NOT NULL AND locked_until>UTC_TIMESTAMP()) AS locked FROM users WHERE email=? AND role='student'",
      [address],
    );
    const user = rows[0];
    const ok = await verifyPassword(password, user?.active ? user.password_hash : null);
    if (!user?.active || user.locked || !ok) {
      // MySQL applies SET left to right: on the 5th miss the counter resets to 0 and the lock is set.
      if (user?.active && !user.locked && user.password_hash)
        await store.query(
          `UPDATE users SET failed_logins=IF(failed_logins+1>=?,0,failed_logins+1),
             locked_until=IF(failed_logins=0,DATE_ADD(UTC_TIMESTAMP(),INTERVAL ${LOCK_MINUTES} MINUTE),locked_until) WHERE id=?`,
          [PASSWORD_FAILURES, user.id],
        );
      await store.audit(null, "sign_in_denied", address).catch(() => {});
      throw fail(401, WRONG_PASSWORD);
    }
    const session = await store.transaction(async (c) => {
      await store.query(
        "UPDATE users SET failed_logins=0,locked_until=NULL WHERE id=?",
        [user.id],
        c,
      );
      return startSession(c, user, req, "password");
    });
    setSession(res, session);
    res.json({ ok: true });
  });

  // Per-address limit applies whether or not the account exists, so it reveals nothing.
  const limitCodes = async (address) => {
    if (store.checkRateLimit && !(await store.checkRateLimit("email-code", address, 3, 900)))
      throw fail(429, "Too many codes requested for this email. Wait 15 minutes.");
    if (!mailer && !devLog) throw fail(503, "Email sign-in is not set up yet. Use Google.");
  };
  // Stores a fresh code + link for an active student and emails it (not awaited, so timing is equal).
  const issueCode = async (user) => {
    const code = newCode(),
      link = token();
    await store.query(
      `REPLACE INTO email_codes (user_id,code_hash,link_hash,attempts,expires_at)
       VALUES (?,?,?,0,DATE_ADD(UTC_TIMESTAMP(),INTERVAL ${CODE_MINUTES} MINUTE))`,
      [user.id, codeHash(user.id, code), hash(link)],
    );
    const url = `${config.ADMIN_ORIGIN}/auth/email/link?token=${link}`;
    if (devLog) console.log(`[local only] sign-in code for ${user.email}: ${code}  link: ${url}`);
    else
      sendLoginEmail(mailer, user.email, code, url, CODE_MINUTES).catch(() =>
        console.error("Sign-in email could not be sent."),
      );
  };
  // Checks a code inside transaction c. Counts misses (destroying the code on the last one) and
  // returns the user row only for a correct, unexpired code, which is then used up.
  const consumeCode = async (c, address, code) => {
    const rows = await store.query(
      `SELECT u.id,u.email,u.role,e.code_hash,e.attempts FROM users u JOIN email_codes e ON e.user_id=u.id
       WHERE u.email=? AND u.active=1 AND u.role='student' AND e.expires_at>UTC_TIMESTAMP() FOR UPDATE`,
      [address],
      c,
    );
    const row = rows[0];
    if (!row) return null;
    if (row.attempts >= CODE_ATTEMPTS || !equal(codeHash(row.id, code), row.code_hash)) {
      if (row.attempts + 1 >= CODE_ATTEMPTS)
        await store.query("DELETE FROM email_codes WHERE user_id=?", [row.id], c);
      else
        await store.query(
          "UPDATE email_codes SET attempts=attempts+1 WHERE user_id=?",
          [row.id],
          c,
        );
      return null;
    }
    await store.query("DELETE FROM email_codes WHERE user_id=?", [row.id], c);
    return row;
  };

  app.post("/auth/email/start", sameOrigin, async (req, res) => {
    const { email: address } = codeStart.parse(req.body);
    await limitCodes(address);
    const rows = await store.query(
      "SELECT id,email FROM users WHERE email=? AND active=1 AND role='student'",
      [address],
    );
    if (rows[0]) await issueCode(rows[0]);
    res.json({ ok: true, message: CODE_SENT });
  });

  // Self sign-up: creates a student with no courses or package (zero access) and emails a code.
  // The reply is the same whether the email is new, already a student, or a team account.
  app.post("/auth/signup", sameOrigin, async (req, res) => {
    const input = signupInput.parse(req.body);
    if (!(await signupOpen(store)))
      throw fail(403, "Sign-up is by invitation only. Contact Scholars Cafe to get access.");
    if (store.checkRateLimit && !(await store.checkRateLimit("signup", req.ip || "?", 10, 3600)))
      throw fail(429, "Too many sign-ups from this network. Try again later.");
    await limitCodes(input.email);
    const user = await store.transaction(async (c) => {
      const rows = await store.query(
        "SELECT id,email,role,active FROM users WHERE email=? FOR UPDATE",
        [input.email],
        c,
      );
      if (rows[0]) return rows[0].role === "student" && rows[0].active ? rows[0] : null;
      const created = { id: randomUUID(), email: input.email };
      await store.query(
        "INSERT INTO users (id,email,role,active) VALUES (?,?,'student',1)",
        [created.id, created.email],
        c,
      );
      await store.query(
        "INSERT INTO student_profiles (user_id,full_name,phone,updated_at) VALUES (?,?,?,UTC_TIMESTAMP())",
        [created.id, input.name, input.phone],
        c,
      );
      await store.audit(created.id, "student_signup", created.email, c);
      return created;
    });
    if (user) await issueCode(user);
    res.json({ ok: true, message: CODE_SENT });
  });

  // Forgot password: the emailed code proves the address; sets the new password and signs out every device.
  app.post("/auth/password/reset", sameOrigin, async (req, res) => {
    const { email: address, code, password } = resetInput.parse(req.body);
    const stored = await hashPassword(password);
    const outcome = await store.transaction(async (c) => {
      const row = await consumeCode(c, address, code);
      if (!row) return { error: true };
      await store.query(
        "UPDATE users SET password_hash=?,failed_logins=0,locked_until=NULL WHERE id=?",
        [stored, row.id],
        c,
      );
      await store.query("DELETE FROM sessions WHERE user_id=?", [row.id], c);
      await store.audit(row.id, "password_reset", row.email, c);
      return { session: await startSession(c, row, req, "password_reset") };
    });
    if (outcome.error) throw fail(401, WRONG_CODE);
    setSession(res, outcome.session);
    res.json({ ok: true });
  });

  app.post("/auth/email/verify", sameOrigin, async (req, res) => {
    const { email: address, code } = codeVerify.parse(req.body);
    const outcome = await store.transaction(async (c) => {
      const row = await consumeCode(c, address, code);
      return row ? { session: await startSession(c, row, req, "email_code") } : { error: true };
    });
    if (outcome.error) throw fail(401, WRONG_CODE);
    setSession(res, outcome.session);
    res.json({ ok: true });
  });

  // Email scanners open links automatically, so GET only shows a button; the POST signs in.
  app.get("/auth/email/link", (req, res) => {
    const link =
      typeof req.query.token === "string" && /^[0-9a-f]{64}$/.test(req.query.token)
        ? req.query.token
        : "";
    res.type("html")
      .send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Sign in · Scholars Cafe</title><link rel="stylesheet" href="/style.css"></head>
<body><div class="login"><h1>Sign in to Scholars Cafe</h1>${
      link
        ? `<form method="post" action="/auth/email/link"><input type="hidden" name="token" value="${link}"><button class="primary" type="submit">Continue sign-in →</button></form>`
        : `<p>This link is not valid. <a href="/">Request a new code</a>.</p>`
    }</div></body></html>`);
  });
  app.post(
    "/auth/email/link",
    express.urlencoded({ extended: false, limit: "2kb" }),
    sameOrigin,
    async (req, res) => {
      const link =
        typeof req.body?.token === "string" && /^[0-9a-f]{64}$/.test(req.body.token)
          ? req.body.token
          : "";
      const session = await store.transaction(async (c) => {
        if (!link) return null;
        const rows = await store.query(
          `SELECT u.id,u.email,u.role FROM email_codes e JOIN users u ON u.id=e.user_id
         WHERE e.link_hash=? AND e.expires_at>UTC_TIMESTAMP() AND u.active=1 AND u.role='student' FOR UPDATE`,
          [hash(link)],
          c,
        );
        if (!rows[0]) return null;
        await store.query("DELETE FROM email_codes WHERE user_id=?", [rows[0].id], c);
        return startSession(c, rows[0], req, "email_link");
      });
      if (!session)
        throw fail(401, "This sign-in link has expired or was already used. Request a new code.");
      setSession(res, session);
      res.redirect(303, "/");
    },
  );
}

/** Signed-in routes (mounted after the /api session check). */
export function installAccountRoutes(app, { store, fail, currentToken }) {
  app.post("/api/password", async (req, res) => {
    const { password, current } = passwordChange.parse(req.body);
    const rows = await store.query("SELECT password_hash FROM users WHERE id=?", [req.actor.id]);
    if (rows[0]?.password_hash && !(await verifyPassword(current || "", rows[0].password_hash)))
      throw fail(403, "Your current password is wrong.");
    const stored = await hashPassword(password);
    await store.transaction(async (c) => {
      await store.query(
        "UPDATE users SET password_hash=?,failed_logins=0,locked_until=NULL WHERE id=?",
        [stored, req.actor.id],
        c,
      );
      // Sign out every other device; keep this one.
      await store.query(
        "DELETE FROM sessions WHERE user_id=? AND token_hash<>?",
        [req.actor.id, hash(currentToken(req))],
        c,
      );
      await store.audit(req.actor.id, "password_set", req.actor.email, c);
    });
    res.json({ ok: true });
  });
}
