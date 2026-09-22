# Content Studio

Sign in at https://admin.scholarscafe.com with an approved Google account.

- **Website text & images:** edit existing groups. “Set up … fields” adds controls introduced by the new design. Existing published content is not replaced. Save a draft, then publish it.
- **Media:** owners/admins upload public PNG, JPEG or WebP images (maximum 5 MB and 16 megapixels). Copy a URL into an image field, or upload directly beside the field. Images are public immediately: never upload private documents. The library is capped at 100 MB and persists in MySQL across deployments.
- Hero fields: `hero.media.image` and `hero.media.mobileImage`. University marks: `universities.*.logo`. Country photos: `destinations.*.image`. Transparent brand icon: `brand.image`; upload a transparent image, not a poster or rectangular background.
- Mentors, courses/prices, blogs and public testimonials are managed in their own sections. Drafts are not public. Editors cannot publish or upload images.
- Contact messages and consented newsletter signups are saved to the existing backend. Email notifications depend on the existing SMTP configuration. Signup does not automatically send a guide or a newsletter campaign.
- The frontend refreshes published content approximately every minute; reloading also fetches it.

The homepage uses a campus photograph with a slow zoom and pause control, not video footage. Reduced-motion preferences disable movement. Site text is rendered as plain text, never HTML.

## Deployment

Both websites use Hostinger Git auto-deployment from `main`.
Main website: repository root, Vite, output `dist`.
Admin: **admin.scholarscafe.com**, repository root directory **backend**, Node 22, Express, build script **build**, entry **server.js**. Do not change the entry to `app.js`: that exports the application factory and does not start the server. For any manual archive deployment, explicitly set `server.js` rather than relying on auto-detection. Exclude `.env`, dependencies and test files. Preserve all existing environment variables and the MySQL database. Schema additions are non-destructive; existing content seed records use `INSERT IGNORE`.

Run `npm test` in `backend/` before deployment. The tests mock storage and identity; a signed-in owner should also verify a real upload/save/publish in the live dashboard.
