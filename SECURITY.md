# Security review (November 2026, Phases 1–5)

Scope: public site (`scholarscafe.com`, static build on Hostinger) and admin/CMS backend (`admin.scholarscafe.com`, Express + MySQL). The student dashboard lives in the admin app; its controls are in the Phase 5 sections below. Final checks (November 2026): build, type check, ESLint (0 errors), 47 backend tests, `npm audit --omit=dev` 0 (site), `npm audit` 0 (backend).

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
4. CSP still allows inline style attributes (`'unsafe-inline'` in style-src). Fonts are self-hosted; no third-party script hosts remain.
5. Dev-only advisories remain: `basic-ftp` (high; only the FTP deploy script, only exploitable by a malicious FTP server; fix is a major upgrade to test with your FTP account) and `minimatch` in the ESLint chain (moderate; fix needs an ESLint major). Neither ships to visitors.
6. Media-library images are public by design. Lesson videos are private and checked per request (Phase 5.3). Screen recording cannot be prevented.
7. Many unused UI packages remain in `package.json` (not shipped unless imported); prune when convenient.
8. **MySQL has no row-level security.** Isolation depends on every student-data query using `backend/access.js`; code review must enforce this. Tests cover each role.
9. **Email codes** are only as safe as the user's mailbox; no email alerts yet for new messages.
10. **Uploads ≤12 MB need MySQL `max_allowed_packet` ≥ 16 MB** on Hostinger, or large videos fail to save (see DEPLOYMENT.md).

## Your manual checklist
- [ ] Turn on 2-Step Verification for every Google account with admin access, and for GitHub and Hostinger logins.
- [ ] Turnstile: create a free widget at dash.cloudflare.com (domain `scholarscafe.com`). Set `VITE_TURNSTILE_SITE_KEY` as a build variable for the website and `TURNSTILE_SECRET_KEY` for the admin app in Hostinger, then redeploy both.
- [ ] Run the client-IP diagnostic and set `TRUST_PROXY` (risk 1).
- [ ] Backups: enable daily Hostinger database backups and do one test restore.
- [ ] Rotation: rotate the SMTP mailbox password and Google OAuth client secret if they were ever pasted into chats, emails or screenshots; rotate yearly otherwise.
- [ ] GitHub: protect `main` (require PR), enable Dependabot alerts. Two deploy paths exist (Hostinger Git auto-deploy and the FTP Action); disable whichever you don't use and delete its secrets.
- [ ] Before the first deploy of this branch: back up the database (migrations add columns and tables automatically on start).
- [ ] Monitoring: free uptime checks (e.g. UptimeRobot) on both domains; review the admin audit log monthly.

## Phase 3 additions (admin CMS + leads)
- **Mentor role:** server-side gate; mentors reach only `/api/me`, `/logout` and `/api/leads*`. Lead queries are scoped in SQL (`assigned_to = mentor id`); others' leads return 404. Mentors cannot reassign. Editors cannot see leads or delete.
- **Leads CSV:** cells starting with `= + - @` are neutralised (formula injection); every export is audited.
- **Video uploads:** MP4/WebM only, file-signature checked, ≤12 MB, 250 MB quota, served with Range support. Hostinger MySQL `max_allowed_packet` must allow 12 MB.
- **Delete/restore:** soft delete (`deleted_at`), version-checked restore, all audited. Seeds never revive deleted entries.
- Known limits: SEO overrides apply client-side (crawlers see build-time titles); Student role arrives in Phase 4/5.

## Phase 4 additions (sign-in)
- Methods: Google, email + password (optional), email code/magic link. No self sign-up, no SMS, no Microsoft. All require an active approved account.
- Passwords: scrypt (N=32768, r=8, p=1, unique salt), 12–128 chars; 5 misses → 15-minute lock; unknown emails cost the same time. Setting a password needs the current one and signs out other devices.
- Email codes: 6 random digits + 256-bit link token, only hashes stored, 10-minute expiry, single use, destroyed after 5 wrong tries, 3 sends per address per 15 min, same reply for unknown emails, sent without awaiting (no timing leak).
- Magic link: GET only shows a button (mail scanners can't consume it); POST requires the admin Origin. All sign-in POSTs check Origin (no login CSRF). Session cookie unchanged (`__Host-`, HttpOnly, Secure, SameSite=Lax, 4 h).
- Risk: an email code is only as safe as the mailbox. Keep 2-Step Verification on mailboxes of admin accounts.

## Phase 5.1 additions (student dashboard: schema and access rules)
- New tables: `lms_courses`, `lms_lessons`, `enrollments` (student, course, mentor, status), `student_profiles`, `lesson_progress`, `messages`, `reviews`. New role `student` (admins can create them; no self sign-up).
- **Row-level rules:** MySQL has no built-in RLS, so `backend/access.js` is the single source of WHERE clauses for student data, always built from the session user's id. Students: own rows, published courses they're actively enrolled in (paused = locked), published lessons only, staff notes never selected. Mentors: only students enrolled with them. Owners/admins: all. Editors: none. Scope columns are whitelisted.
- **API gate:** students reach only `/api/me`, `/api/logout`, `/api/password` and `/api/lms/*`; all staff APIs return 403.
- **Private media:** `media.visibility = 'private'` files are never served by the public media route (lesson videos; signed access arrives in step 5.3).
- Verified on MySQL 8 with two students, two mentors, a paused enrollment and a draft course.

## Phase 5.2 additions (staff side: courses and students)
- API `backend/lms.js` under `/api/lms/*`: reads use `access.js` scopes; writes check the permission table first (refused before any query) and re-check rows inside the transaction. All writes audited.
- Students are created only by owners/admins (409 on duplicate email). Mentors may only write `staff_notes` for their own students. Enrollment requires an active student, a live course and an active mentor.
- Lesson videos must be private uploads (`X-Visibility: private`); public files are refused for lessons. Private files return 404 on the public route.
- Verified on MySQL 8: owner/mentor/student flows, paused enrollment hides the course, draft course and unpublished lesson hidden from the student.

## Phase 5.3 additions (student side and protected video)
- Student API `/api/lms/my/*` (students only): courses via `courseScope`, lessons via `lessonScope`, progress only on lessons the student can open, profile writes limited to own name/phone/intake (unknown fields such as `staff_notes` rejected).
- Lesson video `/api/lms/lessons/:id/video`: session required, access re-checked on every request including each byte range (pause/unpublish/deactivate takes effect immediately), private files only, `Cache-Control: private, no-store`, `Cross-Origin-Resource-Policy: same-origin`. Chose per-request checks over signed URLs: nothing to leak or share.
- Limits: hidden download button is a deterrent, not DRM; screen recording can't be prevented. Videos are read whole from MySQL per range request (fine for ≤12 MB files and modest traffic; move to object storage if usage grows).
- Verified on MySQL 8: enrolled student 206 range; not-enrolled student, paused enrollment and unpublished lesson 404; no session 401; editor 403.

## Phase 5.4 additions (messages and reviews)
- Messages: one thread per student; access via `canReachStudent` inside the transaction (student: own; mentor: own students; staff: all); others get 404 with nothing written. Bodies are plain text (rendered with `textContent`), 1–5000 chars, 30 messages per user per hour. Students never see staff email addresses.
- Reviews: only for courses in the student's `courseScope` (enrolled, not paused, published); one per course; any edit returns it to `pending`; only owners/admins moderate (audited). Not published anywhere yet.
- Fixed: MySQL sessions now run in UTC (`SET time_zone='+00:00'` per connection). Before, a server not on UTC stored local time that the driver read as UTC, shifting lead and message times.
- Verified on MySQL 8: other mentor and other student 404 on read and post, rate limit at 31st message, review moderation roles.
