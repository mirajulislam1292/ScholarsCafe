# Architecture plan (Phase 0)

## Surfaces and hosting (Hostinger Business plan, order 1008395584)
| Host | What | Runs as |
|---|---|---|
| scholarscafe.com | Public site, blog, `/links`, public forms | Static pre-rendered React (existing) |
| admin.scholarscafe.com | Staff only | Node app `backend/` (existing), Google-only |
| student.scholarscafe.com | Students only | **Same `backend/` code, its own Node app** with `PORTAL=student` |

**Choice: one codebase, separate Hostinger apps per subdomain.** Not one app with host-based routing, because:
- each app has its own process, env vars and cookies;
- a bug in host routing can't leak admin routes to students;
- the admin app is already set up this way.

Both apps share one MySQL database. Every commit to `main` redeploys all three.

**Cookies:**
- `__Host-sc_session` is host-only, so it can't set a domain and there are no wildcard cookies.
- Each portal also checks `roleFits(portal, role)` on every request, so a student session can't work on admin, and a staff session can't work on the student portal.

## Data model
MySQL has no RLS. Instead, every query goes through `access.js` scopes, which filter by role, assignment and entitlement, plus server checks and IDOR tests.

**Existing tables (reused):**
- `users`, `sessions`, `email_codes`, `audit`, `rate_limits`, `oauth_attempts`
- `content` (site content, blog, resources, universities, team) and `revisions`
- `media` and `media_quota`
- `lms_courses`, `lms_lessons`, `enrollments`, `lesson_progress`
- `messages`, `reviews`, `submissions`, `student_profiles`, `inquiries`, `mail_outbox`

**New tables:**
- `packages`: name, price, description, included features, active.
- `package_items`: package → course, resource or feature (`messaging`, `uploads`, `reviews`, `live`).
- `user_packages`: student, package, granted_by, expires_at. Gives access; a sign-up starts with none.
- `mentor_students`: which students each mentor can see.
- `files`: private uploads with a random name, checked type and size, owner, and a signed-access log.
- `forms`, `form_submissions`: form definition JSON, submission data, status, notes, Turnstile result.
- `link_items` and `link_clicks`: the `/links` page.
- `settings`: signup on/off, session timeouts.

**Roles:** `owner` = Super Admin, `admin`, `editor`, `mentor`, `student` (already in the code). `SUPER_ADMIN_EMAIL` replaces `OWNER_EMAIL`, and the old name stays as a fallback.

## Video storage (risk)
- **Hostinger:** Business includes 50 GB storage and "unmetered" bandwidth, but its terms forbid using shared hosting mainly to store or stream media.
  - About 30 lessons of 720p video (~10 GB) is fine.
  - Hundreds of hours watched by many students risks suspension.
  - The current upload limit is 12 MB per file, so this needs chunked upload.
- **Plan:** host on Hostinger first.
  - Encode at 720p, H.264, ~1.5 Mbps (about 0.7 GB/hour).
  - Serve through the existing protected route: checked per request, short-lived signed URL, range requests, watermark overlay.
- **Fallback when it grows:** Backblaze B2.
  - 10 GB free. On a no-card account it stops at its caps instead of billing; I'll confirm that before use.
  - Serve through the same signed route.
  - Cloudflare R2 has a better free tier but needs a card on file, so it needs your yes.

## Free-services cost table
| Service | Cost | Free limit | When the limit is hit |
|---|---|---|---|
| Hostinger Business (hosting, MySQL, SSL, subdomains, Node apps) | Already paid | 50 GB, fair-use CPU/RAM | Throttles; no auto-upgrade |
| Hostinger email SMTP | Already paid | ~3,000 emails/day per mailbox | Sending pauses |
| `no-reply@` mailbox | **Check:** a new mailbox may be outside the plan's free email | — | I'll ask before creating it; a free alias of `contact@` is the fallback |
| Google OAuth | Free | No cost for sign-in | — |
| Cloudflare Turnstile | Free | Unlimited | — |
| GitHub (repo; Actions disabled) | Free | — | — |
| ClamAV virus scan | Free (open source) | May exceed shared-hosting memory | Disabled if it won't run; type/size/magic-byte checks stay |
| Backblaze B2 (fallback only) | Free tier | 10 GB storage, 1 GB/day egress | Caps block access; no billing without a card |

No paid item will be added without your explicit yes. I won't touch auto-renew or billing settings.

## Subdomains and email status (checked today)
- **admin.scholarscafe.com:** live (Node app).
- **student.scholarscafe.com:** not created yet, and DNS doesn't resolve.
  - I can create it through the Hostinger API (free on Business): website setup, deploy from GitHub `main`, root `backend`, env vars, SSL.
  - I'll do this in Phase 1, after PR #5 is merged.
- **Email DNS:** SPF ✓ (`include:_spf.mail.hostinger.com`), DKIM ✓ (`hostingermail-a/b`), DMARC is `p=none`. I'll suggest `p=quarantine` once sending is confirmed clean.
