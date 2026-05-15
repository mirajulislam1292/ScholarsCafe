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
