# Hostinger Deployment Guide

## Quick Deploy to Hostinger

This repo is configured to automatically build and deploy to your Hostinger account.

### Setup (One time only)

1. Get your FTP password from Hostinger hPanel:
   - Go to hPanel → Account → FTP/SFTP
   - Copy your FTP username and password from Hostinger

2. Create a `.env` file in the project root:
   ```
   cp .env.example .env
   # Then fill in your Hostinger FTP values
   ```

### Deploy

Run this command to build and upload to Hostinger:

```bash
npm run deploy
```

That's it! The script will:
- Build your site to `dist/client`
- Generate `dist/client/index.html` so Hostinger has a default document to serve
- Connect to the Hostinger FTP host from your `.env`
- Upload everything to the FTP root for the account

### Files Deployed

Only the contents of `dist/client/` are uploaded. The `.htaccess` rewrite rules are already included for SPA routing.

### Troubleshooting

- **"FTP_PASS environment variable not set"** → Make sure `.env` has your FTP password
- **"Connection refused"** → Check your FTP password is correct
- **403 Forbidden on the live site** → Make sure the deployed folder includes `index.html` and `.htaccess`. `npm run build` now generates the HTML shell, so upload the resulting `dist/client/` contents or run `npm run deploy`.
- **404 on routes** → The `.htaccess` rules in the FTP root handle SPA routing automatically

### Automatic GitHub deploys (recommended)

You can set up automated builds and deploys from GitHub using the included GitHub Actions workflow: [/.github/workflows/deploy.yml](.github/workflows/deploy.yml#L1-L200). The workflow will build the site and perform an atomic deploy to your Hostinger FTP account on every push to `main`, and runs once daily by cron.

Required GitHub Secrets (Repository → Settings → Secrets → Actions):
- `FTP_HOST` — Hostinger FTP host (example: 82.25.83.46)
- `FTP_USER` — FTP username
- `FTP_PASSWORD` — FTP password
- `FTP_PORT` — (optional) FTP port (default 21)
- `FTP_DIR` — Remote site folder (example: `public_html` or `domains/yourdomain.com/public_html`)

Notes:
- The workflow uploads to a timestamped temporary remote directory and then renames it into place, keeping a backup copy (`<FTP_DIR>_bak_<timestamp>`). This prevents partial uploads from being served and preserves an immediate rollback copy.
- The workflow uses `lftp` and requires you to add the secrets above. You can trigger it manually from the Actions tab (`workflow_dispatch`) or by pushing to `main`.
- If your Hostinger plan supports SFTP (recommended), consider updating the workflow to use SFTP or create an SSH-deploy path; contact Hostinger support to enable SFTP if necessary.

Security recommendations:
- Store credentials only in GitHub Secrets and avoid committing them to the repo or `.env` in production. Keep `.env` for local development only.
- Enable 2FA on the GitHub account and restrict branch protection rules on `main` to require PR reviews and passing checks before merging.
- Limit who can edit Actions/workflows in the repository settings.

