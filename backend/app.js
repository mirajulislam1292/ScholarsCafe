import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { OAuth2Client } from "google-auth-library";
import { randomUUID, createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  token,
  hash,
  equal,
  trustedGoogleIdentity,
  canManage,
  canPublish,
  userInput,
  recordInput,
} from "./security.js";

const fail = (status, message) => Object.assign(new Error(message), { status });
function cookie(req, name) {
  return req.headers.cookie
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(name + "="))
    ?.slice(name.length + 1);
}
const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax", path: "/" };
const sessionCookie = "__Host-sc_session";
const stateCookie = "__Host-sc_oauth";

export function createApp(
  store,
  config,
  google = new OAuth2Client(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.ADMIN_ORIGIN + "/auth/callback",
  ),
) {
  const app = express();
  // No generic trust-proxy setting: only an explicitly verified Hostinger proxy range may be trusted.
  if (config.TRUST_PROXY) app.set("trust proxy", config.TRUST_PROXY.split(","));
  app.disable("x-powered-by");
  app.set("query parser", "simple");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", "https:"],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'none'"],
        },
      },
      referrerPolicy: { policy: "no-referrer" },
    }),
  );
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Robots-Tag", "noindex, nofollow");
    next();
  });
  app.use(express.json({ limit: "512kb", type: "application/json" }));
  const sharedLimit = (scope, limit, seconds) => async (req, res, next) => {
    if (store.checkRateLimit && !(await store.checkRateLimit(scope, req.ip, limit, seconds)))
      return res.status(429).set("Retry-After", String(seconds)).json({ error: "Too many requests. Please try again later." });
    next();
  };
  app.use("/auth", sharedLimit("auth", 60, 900));
  app.use(
    "/auth",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 30,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      limit: 180,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use(
    ["/public/inquiries", "/public/feedback", "/public/newsletter"],
    rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 10,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(["/public/inquiries", "/public/feedback", "/public/newsletter"], (req, res, next) => {
    if (req.headers.origin !== config.PUBLIC_ORIGIN)
      return res.status(403).json({ error: "Website origin required." });
    res.set("Access-Control-Allow-Origin", config.PUBLIC_ORIGIN);
    res.vary("Origin");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    if (!req.is("application/json")) return res.status(415).json({ error: "JSON required." });
    next();
  });
  app.use(["/public/inquiries", "/public/feedback", "/public/newsletter"], sharedLimit("submissions", 20, 3600));
  app.post("/public/inquiries", async (req, res) => {
    const data = z
      .object({
        name: z.string().trim().min(1).max(160),
        email: z.string().email().max(254),
        phone: z.string().trim().min(1).max(80),
        message: z.string().max(5000),
        website: z.string().max(200).optional(),
      })
      .strict()
      .parse(req.body);
    if (data.website) return res.json({ ok: true });
    await store.transaction(async (c) => {
      await store.query("INSERT INTO inquiries (id,name,email,phone,message) VALUES (?,?,?,?,?)", [randomUUID(), data.name, data.email, data.phone, data.message], c);
      await queueNotification(c, "New website inquiry", data.email, `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n\n${data.message}`);
    });
    res.status(201).json({ ok: true });
  });
  async function queueNotification(c, subject, email, body) {
    await store.query("INSERT INTO mail_outbox (id,subject,body,reply_to) VALUES (?,?,?,?)", [randomUUID(), subject, body, email], c);
  }
  for (const kind of ["feedback", "newsletter"]) {
    app.post("/public/" + kind, async (req, res) => {
      const data = z.object({
        email: z.string().trim().email().max(254).transform((s) => s.toLowerCase()),
        name: z.string().trim().max(160).default(""),
        message: z.string().trim().max(5000).default(""),
        consent: z.literal(true),
        website: z.string().max(200).optional(),
      }).strict().parse(req.body);
      if (kind === "feedback" && (!data.name || !data.message)) throw fail(400, "Please enter your name and feedback.");
      if (data.website) return res.json({ ok: true });
      await store.transaction(async (c) => {
        const result = await store.query("INSERT IGNORE INTO submissions (id,kind,email,name,message,consent_at,dedupe_key) VALUES (?,?,?,?,?,UTC_TIMESTAMP(),?)", [randomUUID(), kind, data.email, data.name, data.message, kind === "newsletter" ? data.email : null], c);
        if (result.affectedRows === 1)
          await queueNotification(c, kind === "newsletter" ? "New newsletter signup" : "New private feedback", data.email, `Type: ${kind}\nName: ${data.name}\nEmail: ${data.email}\nConsent: given on the website\n\n${data.message}`);
      });
      // Same response for duplicates avoids exposing who is already subscribed.
      res.status(201).json({ ok: true });
    });
  }
  app.get("/public/content", async (req, res) => {
    if (req.headers.origin === config.PUBLIC_ORIGIN) {
      res.set("Access-Control-Allow-Origin", config.PUBLIC_ORIGIN);
      res.vary("Origin");
    }
    const rows = await store.query(
      "SELECT id,kind,title,published AS data FROM content WHERE published IS NOT NULL ORDER BY id",
    );
    res.json({ items: rows });
  });
  app.get("/auth/google", async (req, res) => {
    const state = token(),
      nonce = token(),
      verifier = token();
    await store.query(
      "INSERT INTO oauth_attempts (state_hash,nonce,verifier,expires_at) VALUES (?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 10 MINUTE))",
      [hash(state), nonce, verifier],
    );
    res.cookie(stateCookie, state, { ...cookieOptions, maxAge: 600000 });
    res.redirect(
      google.generateAuthUrl({
        scope: ["openid", "email", "profile"],
        state,
        nonce,
        prompt: "select_account",
        code_challenge: createHash("sha256").update(verifier).digest("base64url"),
        code_challenge_method: "S256",
      }),
    );
  });
  app.get("/auth/callback", async (req, res) => {
    const { state, code } = req.query;
    if (
      typeof state !== "string" ||
      typeof code !== "string" ||
      !equal(state, cookie(req, stateCookie))
    )
      throw fail(400, "Invalid or expired sign-in. Start again.");
    res.clearCookie(stateCookie, cookieOptions);
    const attempt = await store.transaction(async (c) => {
      const rows = await store.query(
        "SELECT * FROM oauth_attempts WHERE state_hash=? AND expires_at>UTC_TIMESTAMP() FOR UPDATE",
        [hash(state)],
        c,
      );
      await store.query("DELETE FROM oauth_attempts WHERE state_hash=?", [hash(state)], c);
      return rows[0];
    });
    if (!attempt) throw fail(400, "Sign-in expired. Start again.");
    const { tokens } = await google.getToken({ code, codeVerifier: attempt.verifier });
    const ticket = await google.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.GOOGLE_CLIENT_ID,
    });
    const identity = ticket.getPayload();
    if (!trustedGoogleIdentity(identity, attempt.nonce))
      throw fail(403, "Google account could not be verified.");
    const session = token(),
      csrf = token();
    await store.transaction(async (c) => {
      const rows = await store.query(
        "SELECT * FROM users WHERE email=? FOR UPDATE",
        [identity.email.toLowerCase()],
        c,
      );
      const user = rows[0];
      if (!user?.active || (user.google_sub && user.google_sub !== identity.sub))
        throw fail(403, "This account has not been granted access.");
      await store.query("UPDATE users SET google_sub=? WHERE id=?", [identity.sub, user.id], c);
      const previous = cookie(req, sessionCookie);
      if (previous)
        await store.query("DELETE FROM sessions WHERE token_hash=?", [hash(previous)], c);
      await store.query(
        "INSERT INTO sessions (token_hash,user_id,csrf,expires_at) VALUES (?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 4 HOUR))",
        [hash(session), user.id, csrf],
        c,
      );
      await store.audit(user.id, "sign_in", user.email, c);
    });
    res.cookie(sessionCookie, session, { ...cookieOptions, maxAge: 4 * 60 * 60 * 1000 });
    res.redirect("/");
  });
  app.use("/api", async (req, res, next) => {
    const raw = cookie(req, sessionCookie);
    if (!raw || raw.length !== 64) throw fail(401, "Please sign in with Google.");
    req.actor = await store.session(hash(raw));
    if (!req.actor) throw fail(401, "Your session has expired or access was removed.");
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      if (
        req.headers.origin !== config.ADMIN_ORIGIN ||
        !equal(req.headers["x-csrf-token"], req.actor.csrf)
      )
        throw fail(403, "Request verification failed. Reload and try again.");
      if (!req.is("application/json")) throw fail(415, "JSON required.");
    }
    next();
  });
  app.get("/api/me", (req, res) => res.json(req.actor));
  app.get("/api/inquiries", async (req, res) => {
    if (!canPublish(req.actor.role))
      throw fail(403, "Messages are restricted to admins and owners.");
    res.json({
      items: await store.query(
        "SELECT id,name,email,phone,message,created_at FROM inquiries ORDER BY created_at DESC LIMIT 200",
      ),
    });
  });
  app.get("/api/submissions", async (req, res) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Submissions are restricted to admins and owners.");
    res.json({ items: await store.query("SELECT id,kind,email,name,message,consent_at,unsubscribed_at,created_at FROM submissions ORDER BY created_at DESC LIMIT 500") });
  });
  app.post("/api/submissions/:id/unsubscribe", async (req, res) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Subscriber management is restricted.");
    await store.transaction(async (c) => {
      await store.query("UPDATE submissions SET unsubscribed_at=UTC_TIMESTAMP() WHERE id=? AND kind='newsletter'", [req.params.id], c);
      await store.audit(req.actor.id, "newsletter_unsubscribe", req.params.id, c);
    });
    res.json({ ok: true });
  });
  app.get("/api/mail-status", async (req, res) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Mail status is restricted.");
    res.json({ configured: Boolean(config.SMTP_PASSWORD), items: await store.query("SELECT id,subject,attempts,sent_at,created_at FROM mail_outbox ORDER BY created_at DESC LIMIT 200") });
  });
  app.post("/api/logout", async (req, res) => {
    await store.query("DELETE FROM sessions WHERE token_hash=?", [
      hash(cookie(req, sessionCookie)),
    ]);
    res.clearCookie(sessionCookie, cookieOptions);
    res.json({ ok: true });
  });
  app.get("/api/content", async (_req, res) =>
    res.json({
      items: await store.query(
        "SELECT id,kind,title,draft AS data,version,published IS NOT NULL AS published FROM content ORDER BY kind,title",
      ),
    }),
  );
  app.post("/api/content", async (req, res) => {
    const input = recordInput.parse(req.body);
    await store.transaction(async (c) => {
      const actor = (await store.query("SELECT role,active FROM users WHERE id=? FOR UPDATE", [req.actor.id], c))[0];
      if (!actor?.active) throw fail(403, "Your access was removed.");
      const rows = await store.query("SELECT * FROM content WHERE id=? FOR UPDATE", [input.id], c);
      const current = rows[0];
      if (
        current
          ? current.version !== input.version || current.kind !== input.kind
          : input.version !== 0
      )
        throw fail(409, "Another editor changed this entry. Reload before saving.");
      if (current) {
        await store.query(
          "INSERT INTO revisions (content_id,actor_id,snapshot) VALUES (?,?,?)",
          [input.id, req.actor.id, JSON.stringify(current.draft)],
          c,
        );
        await store.query(
          "UPDATE content SET title=?,draft=?,version=version+1 WHERE id=?",
          [input.title, JSON.stringify(input.data), input.id],
          c,
        );
      } else
        await store.query(
          "INSERT INTO content (id,kind,title,draft) VALUES (?,?,?,?)",
          [input.id, input.kind, input.title, JSON.stringify(input.data)],
          c,
        );
      await store.audit(req.actor.id, "save_draft", input.id, c);
    });
    res.json({ ok: true });
  });
  app.post("/api/content/:id/:action", async (req, res) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Only admins and owners can publish.");
    if (!["publish", "unpublish"].includes(req.params.action)) throw fail(404, "Unknown action.");
    if (!Number.isInteger(req.body.version)) throw fail(400, "Version required.");
    await store.transaction(async (c) => {
      const actor = (await store.query("SELECT role,active FROM users WHERE id=? FOR UPDATE", [req.actor.id], c))[0];
      if (!actor?.active || !canPublish(actor.role)) throw fail(403, "Your publishing access was removed.");
      const result = await store.query(
        req.params.action === "publish"
          ? "UPDATE content SET published=draft,version=version+1 WHERE id=? AND version=?"
          : "UPDATE content SET published=NULL,version=version+1 WHERE id=? AND version=?",
        [req.params.id, req.body.version],
        c,
      );
      if (result.affectedRows !== 1) throw fail(409, "Entry changed. Reload before publishing.");
      await store.audit(req.actor.id, req.params.action, req.params.id, c);
    });
    res.json({ ok: true });
  });
  app.get("/api/users", async (req, res) => {
    if (req.actor.role === "editor") throw fail(403, "Access management is restricted.");
    res.json({ items: await store.query("SELECT id,email,role,active FROM users ORDER BY email") });
  });
  app.post("/api/users", async (req, res) => {
    const input = userInput.parse(req.body);
    await store.transaction(async (c) => {
      // Serialize owner changes so concurrent requests cannot remove the last owner.
      const owners = await store.query(
        "SELECT id FROM users WHERE role='owner' AND active=1 ORDER BY id FOR UPDATE",
        [],
        c,
      );
      const current = (
        await store.query("SELECT * FROM users WHERE email=? FOR UPDATE", [input.email], c)
      )[0];
      // Re-read actor inside this transaction so a revoked role cannot grant new access.
      const actor = (
        await store.query("SELECT * FROM users WHERE id=? FOR UPDATE", [req.actor.id], c)
      )[0];
      if (!actor?.active || !canManage(actor.role, current?.role ?? input.role, input.role))
        throw fail(403, "You cannot grant or modify that role.");
      if (current?.id === actor.id) throw fail(400, "Ask another owner to change your own access.");
      if (
        current?.role === "owner" &&
        current.active &&
        (!input.active || input.role !== "owner") &&
        owners.length <= 1
      )
        throw fail(400, "The last owner must remain active.");
      if (current) {
        await store.query(
          "UPDATE users SET role=?,active=? WHERE id=?",
          [input.role, input.active, current.id],
          c,
        );
        await store.query("DELETE FROM sessions WHERE user_id=?", [current.id], c);
      } else
        await store.query(
          "INSERT INTO users (id,email,role,active) VALUES (?,?,?,?)",
          [randomUUID(), input.email, input.role, input.active],
          c,
        );
      await store.audit(
        actor.id,
        "access_" + input.role + "_" + (input.active ? "enabled" : "revoked"),
        input.email,
        c,
      );
    });
    res.json({ ok: true });
  });
  app.get("/api/audit", async (req, res) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Audit log is restricted.");
    res.json({
      items: await store.query(
        "SELECT a.action,a.target,a.created_at,u.email FROM audit a LEFT JOIN users u ON u.id=a.actor_id ORDER BY a.id DESC LIMIT 200",
      ),
    });
  });
  app.use(
    express.static(fileURLToPath(new URL("./public", import.meta.url)), {
      dotfiles: "deny",
      index: "index.html",
      maxAge: 0,
    }),
  );
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));
  app.use((error, _req, res, _next) => {
    const status = error.name === "ZodError" ? 400 : error.status || 500;
    if (status >= 500) console.error("Request failed:", error.code || error.name);
    res
      .status(status)
      .json({
        error:
          status === 500
            ? "Unable to complete request. Please try again."
            : error.name === "ZodError"
              ? "Please check the entry fields."
              : error.message,
      });
  });
  return app;
}
