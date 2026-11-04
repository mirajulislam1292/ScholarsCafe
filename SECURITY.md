# Security review (Phase 1, November 2026)

Scope: public site (`scholarscafe.com`, static build on Hostinger) and admin/CMS backend (`admin.scholarscafe.com`, Express + MySQL). The student dashboard does not exist yet; its controls are planned in Phase 4.

## Findings and fixes

| # | Finding | Severity | Fix |
|---|---|---|---|
| 1 | Public site sent almost no security headers (no HSTS, CSP, frame, nosniff, referrer or permissions policy) | High | `public/.htaccess` now sets all of them. CSP is strict and hash-based: the build (`scripts/generate-index.js`) hashes the exact inline scripts, so any injected script is blocked. Tested locally with no violations. |
| 2 | Critical/high advisories in production dependencies: TanStack Start server core and `seroval` serialization, zod, d3-color, postcss-selector-parser; backend body-parser (DoS), nodemailer, ip-address | Critical | Upgraded/pinned. `npm audit --omit=dev`: **0** (site), `npm audit`: **0** (backend). TanStack Start pinned to `~1.168.61` because 1.169 breaks the Lovable build config. |
| 3 | `www.scholarscafe.com` served a duplicate site where the forms fail | Medium | 301 redirect to `https://scholarscafe.com`. |
| 4 | No bot protection on public forms (honeypot + rate limit only) | Medium | Cloudflare Turnstile (free) on contact and newsletter forms, verified server-side. Off until keys are set (see checklist). Tests added. |
| 5 | Refused admin sign-ins were not recorded | Low | Logged as `sign_in_denied` in the audit log; the user still sees a generic message. |
| 6 | Admin lacked a Permissions-Policy header | Low | Added. |
| 7 | Build files were not cacheable long-term | Perf | Hashed assets cached for 1 year, HTML `no-cache`. |

## Verified, no change needed
- **Secrets:** repo and full git history scanned; no keys, passwords or tokens. The one committed `.env.production` held only the public admin URL. `.env` is git-ignored; real secrets live in Hostinger env vars. Nothing to rotate from the repo.
- **Sessions:** random 256-bit tokens stored hashed; `__Host-` cookies, HttpOnly, Secure, SameSite=Lax; 4-hour expiry; logout deletes the session; any role change or revocation kills that user's sessions.
- **Auth:** Google OAuth with state, nonce and PKCE; verified email required; accounts must be pre-approved; Google `sub` is pinned on first login. No passwords are stored.
- **Access control:** every `/api` route requires a session; roles (owner > admin > editor) are checked server-side and re-read inside DB transactions; the last owner cannot be removed. ID-taking routes (content, submissions) are admin-only resources with no per-user ownership, so no IDOR path exists.
- **Input/output:** all queries parameterized (no SQL injection); strict zod schemas reject unknown fields (no mass assignment); HTTPS-only URLs in CMS; CMS text is rendered as text, never HTML; admin UI uses no `innerHTML`/`eval`; the site ignores unsafe CMS links.
- **CSRF/CORS:** per-session CSRF token plus Origin check on writes; public endpoints only accept `https://scholarscafe.com`.
- **Uploads:** admin-only, type-sniffed and re-encoded with sharp (metadata stripped), stored in the DB with random IDs, 5 MB / 16 MP / 100 MB quota limits.
- **Errors:** generic messages, no stack traces; logs record error codes only, never secrets or personal data.
- **Privacy:** privacy, terms and cookie pages exist; the public site sets no cookies.

## Remaining risks
1. **Rate limits may be shared by all visitors.** Behind Hostinger's proxy every request may appear to come from one IP, so the 10/hour form limit could become site-wide. Check with `GET /api/diagnostics/client-ip` (owner only) and set `TRUST_PROXY` to the proxy range it reveals.
2. **MFA:** the app cannot verify Google 2-Step Verification. Enforce it on every owner/admin Google account (free).
3. **`.htaccess` headers only work if Hostinger honors them.** Verify after deploy: `curl -sI https://scholarscafe.com | grep -i -E "strict|content-security|x-frame"`.
4. CSP still allows inline style attributes, Google Fonts (to be self-hosted in Phase 2) and map data from jsDelivr (self-host later).
5. Dev-only advisories remain: `basic-ftp` (FTP deploy script; needs a major upgrade that requires testing with your FTP account) and the ESLint chain. Neither ships to visitors.
6. Media-library images are public by design. Private files and lesson videos (Phase 4) must use short-lived signed URLs.
7. Many unused UI packages remain; prune in Phase 5.

## Your manual checklist
- [ ] Turn on 2-Step Verification for every Google account with admin access, and for GitHub and Hostinger logins.
- [ ] Turnstile: create a free widget at dash.cloudflare.com (domain `scholarscafe.com`). Set `VITE_TURNSTILE_SITE_KEY` as a build variable for the website and `TURNSTILE_SECRET_KEY` for the admin app in Hostinger, then redeploy both.
- [ ] Run the client-IP diagnostic and set `TRUST_PROXY` (risk 1).
- [ ] Backups: enable daily Hostinger database backups and do one test restore.
- [ ] Rotation: rotate the SMTP mailbox password and Google OAuth client secret if they were ever pasted into chats, emails or screenshots; rotate yearly otherwise.
- [ ] GitHub: protect `main` (require PR), enable Dependabot alerts. Two deploy paths exist (Hostinger Git auto-deploy and the FTP Action); disable whichever you don't use and delete its secrets.
- [ ] Monitoring: free uptime checks (e.g. UptimeRobot) on both domains; review the admin audit log monthly.
