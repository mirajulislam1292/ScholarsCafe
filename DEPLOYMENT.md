# Deploying Scholars Cafe to Hostinger

Plan: **Hostinger Business Web Hosting**: Node.js apps, no VPS. One GitHub repository (`mirajulislam1292/ScholarsCafe`, branch `main`) deploys **three** sites. Every merge into `main` rebuilds all three automatically (Git auto-deploy, about 1–3 minutes).

| Site                       | What it is                                   | Hostinger app                  | Root folder     | Build           | Runs                     |
| -------------------------- | -------------------------------------------- | ------------------------------ | --------------- | --------------- | ------------------------ |
| `scholarscafe.com`         | Public website (React, pre-rendered)         | Node.js, framework **Vite**    | repository root | `npm run build` | static files from `dist` |
| `admin.scholarscafe.com`   | Team admin (Express + MySQL)                 | Node.js, framework **Express** | `backend`       | `npm run build` | `server.js`              |
| `student.scholarscafe.com` | Student portal (same code, `PORTAL=student`) | Node.js, framework **Express** | `backend`       | `npm run build` | `server.js`              |

Node **22** for all three (hPanel → Websites → site → Node.js → Settings).

## 1. Environment variables

Set in hPanel → Websites → _site_ → **Environment variables**, then **Redeploy**. Never put real values in Git. The full commented list is in `backend/.env.example`.

| Variable                                   | Admin                                                            | Student portal                        |
| ------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------- |
| `ADMIN_ORIGIN`                             | `https://admin.scholarscafe.com`                                 | same                                  |
| `PUBLIC_ORIGIN`                            | `https://scholarscafe.com`                                       | same                                  |
| `PORTAL`                                   | not set                                                          | `student`                             |
| `STUDENT_ORIGIN`                           | not set                                                          | `https://student.scholarscafe.com`    |
| `DB_HOST`                                  | `127.0.0.1`                                                      | same                                  |
| `DB_NAME`, `DB_USER`                       | `u814252648_sccms` (both)                                        | **same database** as admin            |
| `DB_PASSWORD`                              | the database password                                            | same                                  |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth web client                                    | same client (a second secret is fine) |
| `SMTP_USER`                                | `no-reply@scholarscafe.com` (default `contact@`)                 | same                                  |
| `SMTP_PASSWORD`                            | that mailbox's password                                          | same                                  |
| `TRUST_PROXY`                              | `loopback`                                                       | `loopback`                            |
| `TURNSTILE_SECRET_KEY`                     | optional (bot check on forms)                                    | not needed                            |
| `SUPER_ADMIN_EMAIL`                        | only for a brand-new empty database                              | not needed                            |
| `VIDEO_DIR`, `FILE_DIR`                    | optional; default `~/sc-private/videos` and `~/sc-private/files` | must match the admin                  |

Website build variables (optional): `VITE_CONTENT_API` (default `https://admin.scholarscafe.com`) and `VITE_TURNSTILE_SITE_KEY` (with the Turnstile secret above).

**Google sign-in:** the OAuth client must list both redirect URIs: `https://admin.scholarscafe.com/auth/callback` and `https://student.scholarscafe.com/auth/callback`. Steps: `BACKEND_SETUP.md` §2.

**If an app shows 503:** open hPanel → _site_ → Node.js → **Logs**. "Required configuration missing: X" names the missing variable. `ER_ACCESS_DENIED_ERROR` means the database user/password pair is wrong (both apps must use the same `u814252648_sccms` user).

## 2. Storage

- **Database:** one MySQL database for both apps. Tables and columns are created automatically when an app starts (safe to repeat). Back up before big merges (hPanel → Databases → Backups).
- **Private files** (lesson/resource videos, student documents): `~/sc-private/` in the hosting account's home folder, outside every website folder. Both apps run as the same hosting user, so the admin writes files there and the student portal reads them. Verified live.
- **Limits:**
  - Videos: 2 GB each, 30 GB in total.
  - Student files: 10 MB each, 300 MB per student.
  - The plan has 50 GB of disk.
- Website images and older small videos stay in MySQL (needs `max_allowed_packet` ≥ 16 MB).

## 3. SSL and domains

hPanel → Security → SSL: **Active** for `scholarscafe.com`, `www`, `admin.` and `student.` (free, auto-renewing). `www` redirects to `scholarscafe.com` (in `public/.htaccess`).

## 4. After each deploy

1. **Logs:** open each app's Node.js logs in hPanel; there should be no errors.
2. **Pages:** check these load:
   - https://scholarscafe.com (hero video, latest posts, portal section)
   - https://scholarscafe.com/links
   - https://admin.scholarscafe.com (Google sign-in)
   - https://student.scholarscafe.com ("Student portal" with sign-up)
3. **Security headers:** `curl -sI https://scholarscafe.com | grep -iE "strict-transport|content-security|x-frame"` (all three print).
4. **Browser cache:** the portals' service worker loads new app files automatically. The very first time after an update, one normal refresh may be needed.

## 5. Updating and rolling back

- **Content** (text, blog, resources, packages, forms, link page, students): edit in the admin, then **Publish**. No deploy needed.
- **Code:** branch → pull request → merge into `main`.
- **Roll back:** hPanel → _site_ → Node.js → Deployments → redeploy an earlier build, or revert the commit on GitHub.
- Only one deploy path should be active. If the GitHub Action FTP deploy (`.github/workflows/deploy.yml`) is still enabled, disable it (Hostinger Git auto-deploy is in use).

## 6. Test data (never on the live sites)

`backend/seed-data.js` fills a **test** database with labelled sample data:

- every role;
- 2 packages;
- a course with a video;
- messages, a document under review and a review;
- a form and a lead.

It refuses to run when any origin points at scholarscafe.com.

```bash
cd backend
node seed-data.js --test-data          # add (prints the test students' password once)
node seed-data.js --test-data --clean  # remove every test row and test file
```

Use it with a local MySQL (see `BACKEND_SETUP.md` §7) or a separate staging database, with `ADMIN_ORIGIN`/`PUBLIC_ORIGIN` set to `http://localhost:…`.

## 7. Local development

```bash
npm ci --legacy-peer-deps
npm run build                      # public site → dist/
npx tsc --noEmit && npx eslint .   # 0 errors expected
cd backend && npm ci && npm test   # all tests pass
```
