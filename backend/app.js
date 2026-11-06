import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { OAuth2Client } from "google-auth-library";
import { randomUUID, createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { installMedia, serveMedia, sendBytes } from "./media.js";
import { installAuthRoutes, installAccountRoutes, signupOpen } from "./auth.js";
import { installLmsRoutes, installStudentRoutes, installMessageRoutes } from "./lms.js";
import { installPackageRoutes } from "./packages.js";
import {
  token,
  hash,
  equal,
  trustedGoogleIdentity,
  canManage,
  canPublish,
  canEditContent,
  leadUpdate,
  LEAD_STATUSES,
  csvCell,
  userInput,
  recordInput,
  verifyTurnstile,
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

// Two portals run from this same code: the team admin (default) and the student portal (PORTAL=student),
// each on its own domain with its own cookie. Each refuses the other's accounts at sign-in and per request.
export const portalOf = (config) => (config.PORTAL === "student" ? "student" : "admin");
export const roleFits = (portal, role) =>
  portal === "student" ? role === "student" : role !== "student";
/** The student deployment uses STUDENT_ORIGIN as its own origin everywhere (cookies, CSRF, links). */
export function portalConfig(env) {
  return env.PORTAL === "student" ? { ...env, ADMIN_ORIGIN: env.STUDENT_ORIGIN } : env;
}

export function createApp(
  store,
  config,
  google = new OAuth2Client(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.ADMIN_ORIGIN + "/auth/callback",
  ),
  mailer = null,
) {
  const app = express();
  const portal = portalOf(config);
  // Team sessions are short (2 hours); students stay signed in for 12 hours.
  const sessionHours = portal === "student" ? 12 : 2;
  // Every sign-in method ends here: replace any previous session, create a new one, audit it.
  const startSession = async (c, user, req, method) => {
    const session = token();
    const previous = cookie(req, sessionCookie);
    if (previous) await store.query("DELETE FROM sessions WHERE token_hash=?", [hash(previous)], c);
    await store.query(
      `INSERT INTO sessions (token_hash,user_id,csrf,expires_at) VALUES (?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL ${sessionHours} HOUR))`,
      [hash(session), user.id, token()],
      c,
    );
    await store.audit(
      user.id,
      method === "google" ? "sign_in" : "sign_in_" + method,
      user.email,
      c,
    );
    return session;
  };
  const setSession = (res, session) =>
    res.cookie(sessionCookie, session, { ...cookieOptions, maxAge: sessionHours * 60 * 60 * 1000 });
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
    res.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
    next();
  });
  app.use(express.json({ limit: "512kb", type: "application/json" }));
  const sharedLimit = (scope, limit, seconds) => async (req, res, next) => {
    if (store.checkRateLimit && !(await store.checkRateLimit(scope, req.ip, limit, seconds)))
      return res
        .status(429)
        .set("Retry-After", String(seconds))
        .json({ error: "Too many requests. Please try again later." });
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
  // Tells the sign-in screen which portal it is (admin: Google only; student: Google, email code, password).
  app.get("/auth/config", async (_req, res) =>
    res.json(portal === "student" ? { portal, signup: await signupOpen(store) } : { portal }),
  );
  // The website's content and forms are served by the admin deployment only.
  if (portal === "student") app.use("/public", (_req, _res, next) => next(fail(404, "Not found.")));
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
  app.use(
    ["/public/inquiries", "/public/feedback", "/public/newsletter"],
    sharedLimit("submissions", 20, 3600),
  );
  // Optional Cloudflare Turnstile bot check. Active only when TURNSTILE_SECRET_KEY is set.
  app.use(
    ["/public/inquiries", "/public/feedback", "/public/newsletter"],
    async (req, res, next) => {
      const tokenValue = req.body?.turnstileToken;
      if (req.body && typeof req.body === "object") delete req.body.turnstileToken;
      if (!config.TURNSTILE_SECRET_KEY) return next();
      if (typeof tokenValue !== "string" || !tokenValue || tokenValue.length > 2048)
        return res.status(400).json({ error: "Please complete the verification and try again." });
      const verify = config.verifyTurnstile || verifyTurnstile;
      if (!(await verify(config.TURNSTILE_SECRET_KEY, tokenValue)))
        return res.status(400).json({ error: "Verification failed. Please try again." });
      next();
    },
  );
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
      await store.query(
        "INSERT INTO inquiries (id,name,email,phone,message) VALUES (?,?,?,?,?)",
        [randomUUID(), data.name, data.email, data.phone, data.message],
        c,
      );
      await queueNotification(
        c,
        "New website inquiry",
        data.email,
        `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n\n${data.message}`,
      );
    });
    res.status(201).json({ ok: true });
  });
  async function queueNotification(c, subject, email, body) {
    await store.query(
      "INSERT INTO mail_outbox (id,subject,body,reply_to) VALUES (?,?,?,?)",
      [randomUUID(), subject, body, email],
      c,
    );
  }
  for (const kind of ["feedback", "newsletter"]) {
    app.post("/public/" + kind, async (req, res) => {
      const data = z
        .object({
          email: z
            .string()
            .trim()
            .email()
            .max(254)
            .transform((s) => s.toLowerCase()),
          name: z.string().trim().max(160).default(""),
          message: z.string().trim().max(5000).default(""),
          consent: z.literal(true),
          website: z.string().max(200).optional(),
        })
        .strict()
        .parse(req.body);
      if (kind === "feedback" && (!data.name || !data.message))
        throw fail(400, "Please enter your name and feedback.");
      if (data.website) return res.json({ ok: true });
      await store.transaction(async (c) => {
        const result = await store.query(
          "INSERT IGNORE INTO submissions (id,kind,email,name,message,consent_at,dedupe_key) VALUES (?,?,?,?,?,UTC_TIMESTAMP(),?)",
          [
            randomUUID(),
            kind,
            data.email,
            data.name,
            data.message,
            kind === "newsletter" ? data.email : null,
          ],
          c,
        );
        if (result.affectedRows === 1)
          await queueNotification(
            c,
            kind === "newsletter" ? "New newsletter signup" : "New private feedback",
            data.email,
            `Type: ${kind}\nName: ${data.name}\nEmail: ${data.email}\nConsent: given on the website\n\n${data.message}`,
          );
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
    let session;
    try {
      session = await store.transaction(async (c) => {
        const rows = await store.query(
          "SELECT * FROM users WHERE email=? FOR UPDATE",
          [identity.email.toLowerCase()],
          c,
        );
        let user = rows[0];
        // Student portal with open sign-up: a new Google account becomes a student with no access yet.
        if (!user && portal === "student" && (await signupOpen(store, c))) {
          user = {
            id: randomUUID(),
            email: identity.email.toLowerCase(),
            role: "student",
            active: 1,
          };
          await store.query(
            "INSERT INTO users (id,email,role,active) VALUES (?,?,'student',1)",
            [user.id, user.email],
            c,
          );
          await store.query(
            "INSERT INTO student_profiles (user_id,full_name,updated_at) VALUES (?,?,UTC_TIMESTAMP())",
            [user.id, String(identity.name || "").slice(0, 160)],
            c,
          );
          await store.audit(user.id, "student_signup_google", user.email, c);
        }
        if (!user?.active || (user.google_sub && user.google_sub !== identity.sub))
          throw fail(403, "denied");
        if (!roleFits(portal, user.role)) throw fail(403, "portal");
        await store.query("UPDATE users SET google_sub=? WHERE id=?", [identity.sub, user.id], c);
        return startSession(c, user, req, "google");
      });
    } catch (error) {
      // Record refused sign-ins (the transaction above rolled back) and show a friendly message.
      if (error.status !== 403) throw error;
      await Promise.resolve()
        .then(() => store.audit(null, "sign_in_denied", identity.email.toLowerCase()))
        .catch(() => {});
      return res.redirect(
        303,
        "/?signin=" + (error.message === "portal" ? "other-portal" : "denied"),
      );
    }
    setSession(res, session);
    res.redirect("/");
  });
  // Email code and password sign-in exist only on the student portal; the team admin is Google only.
  if (portal === "student")
    installAuthRoutes(app, { store, config, mailer, fail, startSession, setSession });
  app.use("/api", async (req, res, next) => {
    const raw = cookie(req, sessionCookie);
    if (!raw || raw.length !== 64) throw fail(401, "Please sign in.");
    req.actor = await store.session(hash(raw));
    if (!req.actor) throw fail(401, "Your session has expired or access was removed.");
    if (!roleFits(portal, req.actor.role)) throw fail(401, "Please sign in on the right page.");
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      if (
        req.headers.origin !== config.ADMIN_ORIGIN ||
        !equal(req.headers["x-csrf-token"], req.actor.csrf)
      )
        throw fail(403, "Request verification failed. Reload and try again.");
      if (!(req.method === "POST" && req.path === "/media") && !req.is("application/json"))
        throw fail(415, "JSON required.");
    }
    next();
  });
  app.get("/api/me", (req, res) => res.json(req.actor));
  // Mentors only reach their own leads; every other admin API is closed to them.
  // Mentors reach their leads and the student dashboard API (/lms); students reach only /lms.
  // Every other admin API is closed to them. Row-level rules for /lms live in access.js.
  app.use("/api", (req, _res, next) => {
    const own = ["/me", "/logout", "/password"].includes(req.path) || req.path.startsWith("/lms/");
    if (req.actor.role === "mentor" && (own || req.path.startsWith("/leads"))) return next();
    if (req.actor.role === "student" && own) return next();
    if (req.actor.role === "mentor") throw fail(403, "Mentors can only open their assigned leads.");
    if (req.actor.role === "student") throw fail(403, "This area is for staff only.");
    next();
  });
  if (portal === "student")
    installAccountRoutes(app, { store, fail, currentToken: (req) => cookie(req, sessionCookie) });
  installStudentRoutes(app, { store, fail, sendBytes });
  installLmsRoutes(app, { store, fail });
  installPackageRoutes(app, { store, fail });
  installMessageRoutes(app, { store, fail });
  // Owner-only: shows how the server sees the client address, to verify TRUST_PROXY before enabling it.
  app.get("/api/diagnostics/client-ip", (req, res) => {
    if (req.actor.role !== "owner") throw fail(403, "Diagnostics are restricted to owners.");
    res.json({
      ip: req.ip,
      socket: req.socket.remoteAddress,
      forwardedFor: req.headers["x-forwarded-for"] || null,
      trustProxy: Boolean(config.TRUST_PROXY),
    });
  });
  installMedia(app, store, config, sharedLimit("media", 30, 3600));
  serveMedia(app, store);
  // ---------- Leads CRM (website inquiries) ----------
  // Row-level scoping: owners/admins see every lead; mentors only rows assigned to them; editors none.
  const leadScope = (actor) => {
    if (canPublish(actor.role)) return { where: "1=1", args: [] };
    if (actor.role === "mentor") return { where: "i.assigned_to=?", args: [actor.id] };
    throw fail(403, "Leads are restricted to admins, owners and assigned mentors.");
  };
  const leadFilter = (req, actor) => {
    const scope = leadScope(actor);
    const where = [scope.where];
    const args = [...scope.args];
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";
    if (q) {
      where.push("(i.name LIKE ? OR i.email LIKE ? OR i.phone LIKE ? OR i.message LIKE ?)");
      const like = "%" + q.replace(/[\\%_]/g, "\\$&") + "%";
      args.push(like, like, like, like);
    }
    if (LEAD_STATUSES.includes(req.query.status)) {
      where.push("i.status=?");
      args.push(req.query.status);
    }
    if (canPublish(actor.role) && typeof req.query.assigned === "string") {
      if (req.query.assigned === "none") where.push("i.assigned_to IS NULL");
      else if (/^[0-9a-f-]{36}$/.test(req.query.assigned)) {
        where.push("i.assigned_to=?");
        args.push(req.query.assigned);
      }
    }
    return { sql: where.join(" AND "), args };
  };
  const LEAD_COLUMNS =
    "i.id,i.name,i.email,i.phone,i.message,i.status,i.notes,i.assigned_to,u.email AS assigned_email,i.created_at,i.updated_at";
  app.get("/api/leads", async (req, res) => {
    const f = leadFilter(req, req.actor);
    res.json({
      items: await store.query(
        `SELECT ${LEAD_COLUMNS} FROM inquiries i LEFT JOIN users u ON u.id=i.assigned_to WHERE ${f.sql} ORDER BY i.created_at DESC LIMIT 500`,
        f.args,
      ),
    });
  });
  app.get("/api/leads.csv", async (req, res) => {
    const f = leadFilter(req, req.actor);
    const rows = await store.query(
      `SELECT ${LEAD_COLUMNS} FROM inquiries i LEFT JOIN users u ON u.id=i.assigned_to WHERE ${f.sql} ORDER BY i.created_at DESC LIMIT 5000`,
      f.args,
    );
    const head = ["Created", "Name", "Email", "Phone", "Status", "Assigned to", "Notes", "Message"];
    const lines = [head.map(csvCell).join(",")].concat(
      rows.map((r) =>
        [
          r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
          r.name,
          r.email,
          r.phone,
          r.status,
          r.assigned_email,
          r.notes,
          r.message,
        ]
          .map(csvCell)
          .join(","),
      ),
    );
    await store.audit(req.actor.id, "leads_export", String(rows.length));
    res
      .set("Content-Type", "text/csv; charset=utf-8")
      .set("Content-Disposition", 'attachment; filename="scholarscafe-leads.csv"')
      .send("\ufeff" + lines.join("\r\n"));
  });
  app.post("/api/leads/:id", async (req, res) => {
    if (!/^[0-9a-f-]{36}$/.test(req.params.id)) throw fail(404, "Lead not found.");
    const input = leadUpdate.parse(req.body);
    const actor = req.actor;
    const scope = leadScope(actor);
    if (actor.role === "mentor" && input.assigned_to !== undefined)
      throw fail(403, "Only admins can assign leads.");
    await store.transaction(async (c) => {
      const [row] = await store.query(
        `SELECT i.id FROM inquiries i WHERE i.id=? AND ${scope.where} FOR UPDATE`,
        [req.params.id, ...scope.args],
        c,
      );
      if (!row) throw fail(404, "Lead not found.");
      if (input.assigned_to) {
        const [m] = await store.query(
          "SELECT id FROM users WHERE id=? AND role='mentor' AND active=1",
          [input.assigned_to],
          c,
        );
        if (!m) throw fail(400, "Choose an active mentor.");
      }
      const sets = [];
      const args = [];
      for (const key of ["status", "notes", "assigned_to"])
        if (input[key] !== undefined) {
          sets.push(key + "=?");
          args.push(input[key]);
        }
      if (!sets.length) return;
      await store.query(
        `UPDATE inquiries SET ${sets.join(",")},updated_at=UTC_TIMESTAMP() WHERE id=?`,
        [...args, req.params.id],
        c,
      );
      await store.audit(actor.id, "lead_update:" + Object.keys(input).join("+"), req.params.id, c);
    });
    res.json({ ok: true });
  });
  app.get("/api/mentors", async (req, res) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Restricted.");
    res.json({
      items: await store.query(
        "SELECT id,email FROM users WHERE role='mentor' AND active=1 ORDER BY email",
      ),
    });
  });
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
    if (!canPublish(req.actor.role))
      throw fail(403, "Submissions are restricted to admins and owners.");
    res.json({
      items: await store.query(
        "SELECT id,kind,email,name,message,consent_at,unsubscribed_at,created_at FROM submissions ORDER BY created_at DESC LIMIT 500",
      ),
    });
  });
  app.post("/api/submissions/:id/unsubscribe", async (req, res) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Subscriber management is restricted.");
    await store.transaction(async (c) => {
      await store.query(
        "UPDATE submissions SET unsubscribed_at=UTC_TIMESTAMP() WHERE id=? AND kind='newsletter'",
        [req.params.id],
        c,
      );
      await store.audit(req.actor.id, "newsletter_unsubscribe", req.params.id, c);
    });
    res.json({ ok: true });
  });
  app.get("/api/mail-status", async (req, res) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Mail status is restricted.");
    res.json({
      configured: Boolean(config.SMTP_PASSWORD),
      items: await store.query(
        "SELECT id,subject,attempts,sent_at,created_at FROM mail_outbox ORDER BY created_at DESC LIMIT 200",
      ),
    });
  });
  app.post("/api/logout", async (req, res) => {
    await store.query("DELETE FROM sessions WHERE token_hash=?", [
      hash(cookie(req, sessionCookie)),
    ]);
    res.clearCookie(sessionCookie, cookieOptions);
    res.json({ ok: true });
  });
  const requireContentRole = (actor) => {
    if (!canEditContent(actor.role)) throw fail(403, "Content editing is restricted.");
  };
  app.get("/api/content", async (_req, res) =>
    res.json({
      items: await store.query(
        "SELECT id,kind,title,draft AS data,version,published IS NOT NULL AS published FROM content WHERE deleted_at IS NULL ORDER BY kind,title",
      ),
    }),
  );
  app.post("/api/content", async (req, res) => {
    requireContentRole(req.actor);
    const input = recordInput.parse(req.body);
    await store.transaction(async (c) => {
      const actor = (
        await store.query("SELECT role,active FROM users WHERE id=? FOR UPDATE", [req.actor.id], c)
      )[0];
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
  // ---------- Content history, restore and delete ----------
  const requireEditor = (actor) => {
    if (!canEditContent(actor.role)) throw fail(403, "Content editing is restricted.");
  };
  app.get("/api/content/:id/revisions", async (req, res) => {
    requireEditor(req.actor);
    res.json({
      items: await store.query(
        "SELECT r.id,r.created_at,u.email FROM revisions r LEFT JOIN users u ON u.id=r.actor_id WHERE r.content_id=? ORDER BY r.id DESC LIMIT 50",
        [req.params.id],
      ),
    });
  });
  app.post("/api/content/:id/restore", async (req, res) => {
    requireEditor(req.actor);
    const revision = Number(req.body?.revision);
    const version = req.body?.version;
    if (!Number.isInteger(revision) || !Number.isInteger(version))
      throw fail(400, "Version required.");
    await store.transaction(async (c) => {
      const [current] = await store.query(
        "SELECT * FROM content WHERE id=? FOR UPDATE",
        [req.params.id],
        c,
      );
      if (!current || current.version !== version)
        throw fail(409, "Entry changed. Reload before restoring.");
      const [rev] = await store.query(
        "SELECT snapshot FROM revisions WHERE id=? AND content_id=?",
        [revision, req.params.id],
        c,
      );
      if (!rev) throw fail(404, "Version not found.");
      // Validate the old snapshot against today's rules before it becomes the draft again.
      recordInput.parse({
        id: current.id,
        kind: current.kind,
        title: current.title,
        data: rev.snapshot,
        version: 0,
      });
      await store.query(
        "INSERT INTO revisions (content_id,actor_id,snapshot) VALUES (?,?,?)",
        [current.id, req.actor.id, JSON.stringify(current.draft)],
        c,
      );
      await store.query(
        "UPDATE content SET draft=?,deleted_at=NULL,version=version+1 WHERE id=?",
        [JSON.stringify(rev.snapshot), current.id],
        c,
      );
      await store.audit(req.actor.id, "restore_version", current.id + "#" + revision, c);
    });
    res.json({ ok: true });
  });
  app.post("/api/content/:id/delete", async (req, res) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Only admins and owners can delete.");
    if (!Number.isInteger(req.body?.version)) throw fail(400, "Version required.");
    await store.transaction(async (c) => {
      // Soft delete: hidden everywhere, kept for the audit trail and so startup seeding never revives it.
      const result = await store.query(
        "UPDATE content SET deleted_at=UTC_TIMESTAMP(),published=NULL,version=version+1 WHERE id=? AND version=? AND deleted_at IS NULL",
        [req.params.id, req.body.version],
        c,
      );
      if (result.affectedRows !== 1) throw fail(409, "Entry changed. Reload before deleting.");
      await store.audit(req.actor.id, "delete", req.params.id, c);
    });
    res.json({ ok: true });
  });
  app.post("/api/content/:id/:action", async (req, res) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Only admins and owners can publish.");
    if (!["publish", "unpublish"].includes(req.params.action)) throw fail(404, "Unknown action.");
    if (!Number.isInteger(req.body.version)) throw fail(400, "Version required.");
    await store.transaction(async (c) => {
      const actor = (
        await store.query("SELECT role,active FROM users WHERE id=? FOR UPDATE", [req.actor.id], c)
      )[0];
      if (!actor?.active || !canPublish(actor.role))
        throw fail(403, "Your publishing access was removed.");
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
  // Security settings: everyone on the team except editors may read them; only the owner (Super Admin) changes them.
  app.get("/api/settings", async (req, res) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Settings are restricted.");
    res.json({ student_signup: (await signupOpen(store)) ? "open" : "invite" });
  });
  app.post("/api/settings", async (req, res) => {
    if (req.actor.role !== "owner")
      throw fail(403, "Only the Super Admin can change security settings.");
    const { student_signup } = z
      .object({ student_signup: z.enum(["open", "invite"]) })
      .strict()
      .parse(req.body);
    await store.transaction(async (c) => {
      await store.query(
        "INSERT INTO settings (name,value) VALUES ('student_signup',?) ON DUPLICATE KEY UPDATE value=VALUES(value)",
        [student_signup],
        c,
      );
      await store.audit(req.actor.id, "setting_student_signup", student_signup, c);
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
    res.status(status).json({
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
