# Security and branding review — 20 September 2026

## Update — 23 September 2026

- Added owner/admin-only public-image uploads with the existing session, origin and CSRF checks. Images are decoded, resized and re-encoded as WebP; metadata is removed. SVG and other file types are rejected. Upload size, pixel count, rate and a transactionally locked 100 MB library quota are bounded.
- Images persist in MySQL, not a deployment directory. Public image URLs intentionally allow cross-origin use; private dashboard APIs do not. The UI warns against uploading private documents.
- 20 backend tests pass. A local mocked dashboard test covers upload/save/publish; live health, public-content CORS and unauthenticated media denial were verified. The 39 published records were compared before/after deployment and were unchanged.
- Actual owner Google login, a real live image upload and SMTP delivery still require owner-session verification. These tests are not an independent penetration test or a guarantee of zero vulnerabilities.

The following is the historical review from the previous release:

## Changes

- Applied the supplied #c0e6fd, #80aad3, #5b86b6, #3f6593 palette, with darker text and lighter surface shades for legibility. Website layout remains intact; the site now uses light surfaces instead of the previous forced dark theme.
- Added the supplied brand icon to both apps and browser icons. Asset: `public/brand-mark.png`, copied to `backend/public/brand-mark.png`.
- Used the built-in image tool to extract the icon from IMG_9956.jpg. Prompt: “Extract ONLY the large central infinity/airplane/graduation-cap icon. Preserve its exact shape and proportions, including plane and cap tassel. Remove every word, small corner logo, and textured background. Recolor the icon uniformly #3f6593. Center on a square genuinely transparent background with minimal 6% padding. Crisp flat edges, no shadow, no invented details.” The result is a generated extraction, not an original vector master.
- Newsletter submissions now persist consent and email in MySQL instead of only displaying success. Private feedback has a separate form and admin inbox. Subscriber unsubscribe requests can be recorded by an admin.
- Notifications queue transactionally with submissions. SMTP delivery uses TLS with certificate verification, a fixed sender and recipient, plain text, bounded retries, and no credential logging. Delivery remains disabled until SMTP_PASSWORD is configured. This is a notification queue, not a general mailbox reader or newsletter campaign sender.
- Added persistent rate limits for login and submissions, explicit JSON/origin guards, stronger URL validation, null-prototype CMS text dictionaries, transactional publishing-permission rechecks, and private-file restrictions.
- Added a CSP meta policy for the dashboard because Hostinger's CDN replaces the stronger CSP response header. Frame restrictions still rely on the response header; meta CSP cannot set frame-ancestors.
- Updated vulnerable dependencies, including the legacy map color dependency. No force upgrade was used.

## Verification

- 16 backend tests pass, including unauthorized access, role escalation, CSRF, OAuth state/nonce, revoked access, consent enforcement, duplicate signup privacy, abuse limits, and fixed mail recipient.
- Both npm dependency scans report zero known vulnerabilities after updates.
- Type checking and the production build pass.
- Desktop and mobile previews checked, including the admin inbox; no horizontal overflow or JavaScript page errors.
- Live backend health and branding respond successfully; sensitive paths return 403/404; anonymous submissions/mail-status APIs return 401; missing newsletter/feedback consent returns 400.
- Known database and OAuth secrets were not found in tracked files or the locally available Git history. The private `.env` stays ignored and is excluded from deployment archives.

## Limits and follow-up

This is an application review with automated checks, not proof of absence of vulnerabilities or an independent penetration test. It does not inspect Hostinger's internal systems or Google account security.

Hostinger sends X-Forwarded-For, but its trusted proxy addresses have not been verified. The app deliberately uses the socket address instead of trusting arbitrary client headers. Limits may group visitors behind the same proxy. Verify proxy topology with Hostinger before configuring TRUST_PROXY; do not set it to true or trust every network. Session/API limiting is also process-local, while login/submission limits are persisted.

Complete live authenticated role/revocation and mail delivery tests with the owner. Enable two-step verification for the owner's Google account, and verify database backup restoration. SMTP credentials are still required; queued notifications remain visible in the dashboard meanwhile. Newsletter ownership is not double-opt-in verified; no campaign delivery feature is enabled.
