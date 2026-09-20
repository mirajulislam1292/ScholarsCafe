# Scholars Cafe administration

This is a separate Node.js + MySQL application for `admin.scholarscafe.com`.
It does not run from the public website's static `dist` folder. Deploy this
directory as the source of a separate Hostinger Node.js website. Node 22,
`npm ci`, entry `server.js`, start command `npm start`.

## Current delivery status

Deployed to Hostinger on 2026-09-20. The admin login page, database initialization,
published content API, and Google authorization redirect passed live checks.
Anonymous admin requests return 401. The public site is deployed with the CMS
endpoint enabled. Credentials are stored in Hostinger server environment variables.
The owner must still complete a real Google sign-in; authenticated publishing,
role changes, and revocation remain to be verified in production.

## Required configuration

Use the keys in `.env.example` as Hostinger environment variables. Never commit
the real values, ship them to the static website, or send them to the browser.
`server.js` refuses to start if required configuration is missing.

Create a Google OAuth **Web application** in the owner's Google Cloud project.
Authorized redirect URI: `https://admin.scholarscafe.com/auth/callback`.
Use only `openid email profile` scopes. Configure the consent screen for the
Google accounts being invited; an external app in testing requires test users.
Store the client secret directly in Hostinger's server environment.
The application has no Google API access to Gmail or the user's messages.

Point the public site's `VITE_CONTENT_API` build variable at
`https://admin.scholarscafe.com`, then rebuild it after the backend is ready.
Content refreshes at page load and once per minute in an open tab.

## Access model

The first database initialization inserts `contact.scholarscafe@gmail.com`
as owner only if there are no user records. It never recreates or restores a
revoked owner during normal restarts. Google account subjects are bound on first
approved login. Gmail or verified Google Workspace identities are supported;
Google accounts using arbitrary third-party email addresses are deliberately
rejected because Google may not be authoritative for their current ownership.

Owners manage all roles. Admins manage content and editor access. Editors save
drafts. Only admins and owners publish/unpublish or view inquiries/audit records.
Users cannot change their own access; the last active owner cannot be removed.
Access changes revoke existing sessions. Sessions expire after four hours.

## Content

The dashboard manages mentors, courses/pricing, plain-text blog articles,
approved testimonials and text catalog entries. Published records alone are
public. Existing testimonials are seeded as drafts for owner verification.
Images currently use HTTPS image URLs; uploading files is not implemented.
Blog content is plain text rather than executable HTML. Website text catalog
covers static text nodes and imported content data; some UI attributes and
locally constructed strings still need catalog migration before claiming that
every individual website string is editable.

The first launch creates tables and imports seed entries without replacing
existing edits. Back up the database before subsequent schema changes. Content
revisions and access/publish actions are recorded in MySQL. Establish daily
Hostinger database backups and verify restore before production handoff.

## Verification

Run `npm test` here, and `npx tsc --noEmit` plus `npm run build` in the parent.
HTTP tests cover unauthenticated access, role restrictions, callback state,
CSRF/origin checks, input validation and public draft filtering. They use an
injected store; production MySQL transactions and real Google login still need
integration verification. Verify an approved owner, unapproved account, revoked
session, editor denial, publish visibility and two simultaneous edits before
declaring the launch complete.

Rate limiting currently uses a process-local store; verify the Hostinger proxy
address settings before setting TRUST_PROXY. Multiple backend replicas require
a shared rate-limit store. No admin link is added to the public navigation, but
the public API address and TLS records can reveal the admin hostname. Its
security relies on authentication and server permissions, not its secrecy.
