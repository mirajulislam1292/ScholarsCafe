# Deploying Scholars Cafe to Hostinger

Your plan: **Hostinger Business Web Hosting** (supports Node.js apps; no VPS needed).
The project is two separate websites, both deployed from the same GitHub repository
(`mirajulislam1292/ScholarsCafe`, branch `main`):

| Website | What it is | Hostinger app type | Root folder | Build | Output / entry |
|---|---|---|---|---|---|
| `scholarscafe.com` | Public website (React, pre-rendered) | Node.js app, framework **Vite** | repository root | `npm run build` | output folder `dist` |
| `admin.scholarscafe.com` | Admin/CMS (Express + MySQL) | Node.js app, framework **Express** | `backend` | `npm run build` | entry file `server.js`, start `npm start` |

Both currently have **Git auto-deployment on**: every push to `main` rebuilds and publishes them.

---

## 1. Before you deploy (one time)
1. In GitHub, open the pull request for this work, review it, and **merge it into `main`**. The merge triggers the deploy.
2. Node.js version for both apps: **22** (hPanel → Websites → *site* → Node.js → Settings).
3. If you use the GitHub Action FTP deploy (`.github/workflows/deploy.yml`) *and* Hostinger Git auto-deploy, two deploys run for each push. Keep one (recommended: Hostinger Git auto-deploy) and disable the other (GitHub → Actions → "Build and Deploy to Hostinger" → Disable workflow).

## 2. Public website: `scholarscafe.com`
hPanel → **Websites** → `scholarscafe.com` → **Node.js** (Deployments):
- Repository: `mirajulislam1292/ScholarsCafe`, branch `main`, root directory `.` (empty)
- Framework: **Vite**, Node **22**, package manager **npm**
- Build command: `npm run build` · Output directory: `dist`
- **Build environment variables** (optional):
  - `VITE_CONTENT_API` = `https://admin.scholarscafe.com` (this is already the default)
  - `VITE_TURNSTILE_SITE_KEY` = your Cloudflare Turnstile **site key** (only after you create one; see SECURITY.md)
- Click **Deploy** (or push to `main`). The build writes `dist/.htaccess` with the security headers, the content security policy and the `www → scholarscafe.com` redirect.

## 3. Admin: `admin.scholarscafe.com`
hPanel → **Websites** → `admin.scholarscafe.com` → **Node.js**:
- Same repository and branch, **root directory `backend`**
- Framework: **Express**, Node **22**, entry file `server.js`, start command `npm start`, build `npm run build`
- **Environment variables** (hPanel → Node.js → Environment variables). Never put these in Git:

| Variable | Value |
|---|---|
| `DB_HOST` | `127.0.0.1` |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | from hPanel → Databases → MySQL (the existing CMS database) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud → APIs & Services → Credentials (OAuth web client). Redirect URI must be `https://admin.scholarscafe.com/auth/callback` |
| `ADMIN_ORIGIN` | `https://admin.scholarscafe.com` |
| `PUBLIC_ORIGIN` | `https://scholarscafe.com` |
| `SMTP_PASSWORD` | password of the `contact@scholarscafe.com` mailbox (optional; enables email notifications) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile **secret key** (optional; must match the site key above) |
| `TRUST_PROXY` | leave empty until verified (see SECURITY.md, "Rate limits") |

The full list with comments is in `backend/.env.example`. After changing variables, click **Restart**.

## 4. Domain and SSL
- Both domains already point to Hostinger. In hPanel → **Security → SSL**, make sure SSL is **Active** for `scholarscafe.com`, `www.scholarscafe.com` and `admin.scholarscafe.com` (free SSL, auto-renewing).
- Turn on **Force HTTPS** for each domain if it isn't already.

## 5. Check the live site after each deploy
1. Open https://scholarscafe.com: the hero video should play, logos should scroll under it.
2. Security headers:
   `curl -sI https://scholarscafe.com | grep -iE "strict-transport|content-security|x-frame"` (all three should print)
3. `https://www.scholarscafe.com` should redirect to `https://scholarscafe.com`.
4. Open https://admin.scholarscafe.com and sign in with Google.
5. Send a test message from the contact form and check it appears in the admin under **Inquiries**.

If the hero video doesn't play, open the browser console. A blocked video means the CSP or the file path changed; see USER_MANUAL.md → Troubleshooting.

## 6. Updating the live site later
- **Text, courses, mentors, blogs, logos:** edit in the admin and click **Publish**. No deploy needed; the site picks it up within a minute.
- **Code, images, videos, `src/content/site.json`:** commit to a branch → open a pull request → merge into `main`. Hostinger rebuilds automatically (about 2–4 minutes). Check progress in hPanel → Node.js → Deployments.
- **Roll back:** in hPanel → Deployments, redeploy an earlier successful build, or revert the commit in GitHub.

## 7. Local build (for developers)
```bash
npm ci --legacy-peer-deps
npm run build          # public site → dist/
cd backend && npm ci && npm test
```
