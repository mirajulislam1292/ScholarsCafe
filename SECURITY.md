# Security review (November 2026, admin + student portals, Phases 1–7)

Scope: public site (`scholarscafe.com`, static build on Hostinger), admin (`admin.scholarscafe.com`) and student portal (`student.scholarscafe.com`), both from `backend/` (Express + MySQL). Final checks (6 November 2026): site build, type check, ESLint (0 errors), **87 backend tests**, `npm audit --omit=dev` **0** (site), `npm audit` **0** (backend). The portal restructure is summarised in "Portal restructure (Phases 1–7)" at the end.

## Findings and fixes

| #   | Finding                                                                                                                                                                                                | Severity | Fix                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Public site sent almost no security headers (no HSTS, CSP, frame, nosniff, referrer or permissions policy)                                                                                             | High     | `public/.htaccess` now sets all of them. CSP is strict and hash-based: the build (`scripts/generate-index.js`) hashes the exact inline scripts, so any injected script is blocked. Tested locally with no violations. |
| 2   | Critical/high advisories in production dependencies: TanStack Start server core and `seroval` serialization, zod, d3-color, postcss-selector-parser; backend body-parser (DoS), nodemailer, ip-address | Critical | Upgraded/pinned. `npm audit --omit=dev`: **0** (site), `npm audit`: **0** (backend). TanStack Start pinned to `~1.168.61` because 1.169 breaks the Lovable build config.                                              |
| 3   | `www.scholarscafe.com` served a duplicate site where the forms fail                                                                                                                                    | Medium   | 301 redirect to `https://scholarscafe.com`.                                                                                                                                                                           |
| 4   | No bot protection on public forms (honeypot + rate limit only)                                                                                                                                         | Medium   | Cloudflare Turnstile (free) on contact and newsletter forms, verified server-side. Off until keys are set (see checklist). Tests added.                                                                               |
| 5   | Refused admin sign-ins were not recorded                                                                                                                                                               | Low      | Logged as `sign_in_denied` in the audit log; the user still sees a generic message.                                                                                                                                   |
| 6   | Admin lacked a Permissions-Policy header                                                                                                                                                               | Low      | Added.                                                                                                                                                                                                                |
| 7   | Build files were not cacheable long-term                                                                                                                                                               | Perf     | Hashed assets cached for 1 year, HTML `no-cache`.                                                                                                                                                                     |

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

1. **Client IPs behind Hostinger's proxy.** Verified 2026-11-06: the app sees every request from `127.0.0.1` and the real address in `X-Forwarded-For`. `TRUST_PROXY=loopback` on both apps makes rate limits per visitor. Re-check with `GET /api/diagnostics/client-ip` (owner only) if hosting changes.
2. **MFA:** the app cannot verify Google 2-Step Verification. Enforce it on every owner/admin Google account (free).
3. **`.htaccess` headers only work if Hostinger honors them.** Verify after deploy: `curl -sI https://scholarscafe.com | grep -i -E "strict|content-security|x-frame"`.
4. CSP still allows inline style attributes (`'unsafe-inline'` in style-src). Fonts are self-hosted; no third-party script hosts remain.
5. Dev-only advisories remain: `basic-ftp` (high; only the FTP deploy script, only exploitable by a malicious FTP server; fix is a major upgrade to test with your FTP account) and `minimatch` in the ESLint chain (moderate; fix needs an ESLint major). Neither ships to visitors.
6. Media-library images are public by design. Lesson videos are private and checked per request (Phase 5.3). Screen recording cannot be prevented.
7. Many unused UI packages remain in `package.json` (not shipped unless imported); prune when convenient.
8. **MySQL has no row-level security.** Isolation depends on every student-data query using `backend/access.js`; code review must enforce this. Tests cover each role.
9. **Email codes** are only as safe as the user's mailbox. There are no email alerts for new student messages yet (form submissions and team notifications are emailed).
10. **Images and older small videos** are stored in MySQL (≤12 MB, needs `max_allowed_packet` ≥ 16 MB). New lesson/resource videos and student files are on disk (`~/sc-private`) and are not affected.
11. **No virus scanning** of student files: no free scanner runs on shared hosting. Defence is the type allowlist, active-content rejection (PDF scripts, Word macros) and download-only serving.
12. **Video protection is not DRM.** Signed, user-bound, short-lived links and a moving watermark deter sharing; screen recording and phone cameras cannot be prevented.
13. **Backups of `~/sc-private`.** Hostinger's account backups cover the home folder, but check that videos and student files are included before relying on them.

## Your manual checklist

- [ ] Turn on 2-Step Verification for every Google account with admin access, and for GitHub and Hostinger logins.
- [ ] Turnstile: create a free widget at dash.cloudflare.com (domain `scholarscafe.com`). Set `VITE_TURNSTILE_SITE_KEY` as a build variable for the website and `TURNSTILE_SECRET_KEY` for the admin app in Hostinger, then redeploy both.
- [x] Run the client-IP diagnostic and set `TRUST_PROXY` (risk 1).
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

## Separate admin and student portals

- Same code, two deployments: `admin.scholarscafe.com` (default) and `student.scholarscafe.com` (`PORTAL=student`). Each has its own host-only `__Host-` cookie, CSRF origin and Google redirect URL.
- Admin portal: Google only; email-code and password routes don't exist there (404). Student sessions get 401.
- Student portal: Google, email code, password; every lookup is limited to `role='student'`, so team emails never get codes and can't use passwords there. Team sessions get 401. The website's content and form endpoints are disabled (404).
- Refused Google sign-ins redirect to a friendly message and are audited; no session is created.

## Portal restructure (Phases 1–7)

- **Sign-up and roles (Phase 1):** students may sign themselves up (an owner can switch to invite-only). A new account has **zero access** until an owner/admin gives it a package. Same reply whether an email exists or not. Password reset by 6-digit email code; a reset signs out every session. Sessions: 12 h on the student portal, 2 h on the admin. Roles: owner (Super Admin), admin, editor, mentor, student, with the matrix in `BACKEND_SETUP.md` §9.
- **Packages (Phase 2):** only owners/admins create or assign them, refused before any database query for other roles. Giving a package enrolls the student in its courses; removing one drops only courses no other package covers. Blocking a student deletes their sessions.
- **Student resources and videos (Phase 3):**
  - Resources are read only through `resourceScope` (published, and unlocked by one of the student's packages). Mentors and editors are refused.
  - Videos are stored on disk outside the web root under random ids, uploaded in 5 MB chunks at exact offsets, and the file signature is checked before they're marked ready.
  - Playback uses HMAC-signed links that last 10 minutes and are bound to the signed-in user. Access is re-checked on every byte-range request.
  - A moving watermark shows the viewer's email, including in full screen.
- **Messaging, files and reviews (Phase 4):**
  - Package features are enforced on the server (messaging, uploads, reviews).
  - Files are allowlisted (PDF, DOCX, TXT, PNG, JPEG) and checked by content. PDFs with scripts or embedded files and Word files with macros or embedded objects are refused.
  - Files are stored under random names outside the web root, with a 300 MB quota per student and 20 uploads an hour.
  - Downloads use 5-minute user-bound links and are served as attachments with `CSP: sandbox`.
  - Documents are scoped with `studentScope`; only staff and the student's mentors can set a status.
  - Removed messages are hidden from students and mentors.
  - Testimonials go public only with the student's consent, and only as a draft an admin publishes.
- **Forms and links (Phase 5):**
  - Form definitions are validated (unique ids, conditions pointing backwards), and answers are validated on the server: types, choices, lengths. Answers to hidden conditional questions are dropped.
  - Submissions require the website origin, Turnstile (when configured), a honeypot, 10 per hour per visitor and a shared limit, and they land in the leads CRM.
  - Link clicks store only a per-link daily counter.
  - Admin form routes sit behind the session middleware (a test caught them registered before it).
- **PWA (Phase 6):** the service worker never handles `/api`, `/auth` or `/public`, so no personal data or video is cached. App files are fetched network-first; the worker is served by Node with `no-cache` and a per-deploy version.
- **Test data (Phase 7):** `backend/seed-data.js` refuses to run without `--test-data`, with `NODE_ENV=production`, or when any origin points at scholarscafe.com. Everything it creates is labelled (`@example.test`, `[TEST]`), and `--clean` deletes only labelled rows and files (tested).
- **Rate limits per visitor:** `TRUST_PROXY=loopback` on both apps (verified with the client-IP diagnostic).
