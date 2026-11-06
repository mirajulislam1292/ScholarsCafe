# Backend setup: sign-in pages, email and the first Super Admin

There are **two separate sign-in pages**, both running from the same code (`backend/`) and the same database:

| Page                                            | Who                                            | How they sign in                                                                                   |
| ----------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **https://admin.scholarscafe.com** (team)       | Master admin (owner), admins, editors, mentors | **Google only**, with a Gmail the master admin approved under **Access**                           |
| **https://student.scholarscafe.com** (students) | Students only                                  | Google, a one-time email code (with sign-in link), or a password. Can sign up themselves (setting) |

Each page refuses the other's accounts: a student who tries the admin page is told to use the student page, and vice versa. A session from one never works on the other.

Never put real secrets in Git. Paste them only into hPanel. The full list with comments is in `backend/.env.example`.

## What I need from you

1. **Google client** under the business Gmail, with both redirect URLs (section 2).
2. **Environment variables for the student app** (section 4). The site itself is already created and deploys from `main`.
3. **Sending mailbox** (section 3), so students get email codes.
4. **2-Step Verification** on every team Google account.

## 1. How access works

- **Team (admin page):** the master admin (`contact.scholarscafe@gmail.com` by default) adds people under **Access**: their Gmail and a role (_admin_, _editor_ or _mentor_). Whoever signs in with that Gmail gets exactly that role. Untick **Active** to remove access; their session ends immediately.
- **Students (student page):** either an admin adds them under **Students → Add a student**, or they sign up at student.scholarscafe.com (name, email, optional phone, or Google). A new account has **no access** until staff add a course or package.
- **Sign-up switch:** **Access → Student sign-up**: _Open_ or _Invite only_. Only the Super Admin can change it; it's audit-logged.
- **Sessions:** team 2 hours, students 12 hours. Every sign-in and change is in **Activity**.
- **Student email codes:** 6 digits plus a sign-in link, valid **10 minutes**, work once, destroyed after **5 wrong codes**, max **3 emails per address per 15 minutes**.
- **Student passwords:** optional, set under **Account** after signing in once; 12+ characters; 5 wrong tries lock the account for 15 minutes.
- **Forgot password (students):** type the email → **Forgot password?** → enter the emailed code and a new password. This signs out every other device. Same reply whether or not the email exists. Nobody, including admins, can see a password.
- No SMS (it costs money), no Microsoft sign-in.

## 2. Google sign-in under the business Gmail (about 15 minutes)

1. Open a private browser window and sign in at **https://console.cloud.google.com** with **contact.scholarscafe@gmail.com**.
2. **https://console.cloud.google.com/projectcreate** → name "Scholars Cafe" → **Create**, then select it at the top of the page.
3. **https://console.cloud.google.com/auth/overview** → **Get started**: app name "Scholars Cafe", support email contact.scholarscafe@gmail.com → Audience **External** → contact email the same → **Create**.
4. **https://console.cloud.google.com/auth/audience** → **Publish app** (in "Testing" only listed test users could sign in; basic sign-in needs no Google review).
5. **https://console.cloud.google.com/auth/clients** → **Create client** → type **Web application**, name "Scholars Cafe". Under **Authorised redirect URIs** add:
   - `https://admin.scholarscafe.com/auth/callback`
   - `https://student.scholarscafe.com/auth/callback`
   - optional, local testing: `http://localhost:3000/auth/callback` and `http://localhost:3001/auth/callback`
6. **Create** → copy the **Client ID** and **Client secret** into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` on **both** apps in hPanel → **Restart** both.
7. Test both pages in a private window. When it works, delete the old client in your personal account (same Clients page, old project).
   Changing the client doesn't affect who has access; people keep their roles.

## 3. Email for student sign-in codes

**Chosen: Hostinger SMTP.** It's already paid for and on your domain, so you don't need a new account, card or DNS change. Checked: SPF ✓, DKIM ✓, DMARC `p=none`.

- **Target sender: `no-reply@scholarscafe.com`.** In hPanel → **Emails** → **Create email account**, check whether a new mailbox is free on your plan before clicking create. If it costs anything, skip it and keep `contact@`.
- If you created it: set `SMTP_USER=no-reply@scholarscafe.com` and `SMTP_PASSWORD=<its password>` on the **student** and **admin** apps → **Restart**.
- If not: leave `SMTP_USER` empty and put the `contact@scholarscafe.com` password in `SMTP_PASSWORD`.

4. Test on https://student.scholarscafe.com with a student's email → **Email me a one-time code**. Check spam the first time.

## 4. Student portal app in Hostinger

**Already done (5 Nov 2026):** the site `student.scholarscafe.com` is created on the Business plan at no extra cost. It deploys from GitHub `main` (root `backend`, Express, Node 22, `server.js`) with auto-deploy on.
**You:** add its environment variables. It won't start without them, and secrets never go through chat.

1. hPanel → **Websites** → **student.scholarscafe.com** → **Node.js** (or **Deployments**) → **Environment variables**: copy all of the admin app's variables, then set these:

| Variable                                   | Value                              |
| ------------------------------------------ | ---------------------------------- |
| `PORTAL`                                   | `student`                          |
| `STUDENT_ORIGIN`                           | `https://student.scholarscafe.com` |
| `ADMIN_ORIGIN`, `PUBLIC_ORIGIN`            | same as the admin app              |
| `DB_*`                                     | same database as the admin app     |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | same client (section 2)            |
| `SMTP_PASSWORD`                            | section 3                          |

2. hPanel → **Security → SSL**: make sure SSL is active for `student.scholarscafe.com` (free on your plan).
3. **Restart**, then open https://student.scholarscafe.com: it should say **Student portal**.
   From then on, every commit to `main` updates the website, the admin and the student portal.

## 5. Environment variables (admin app)

| Variable                                   | Value                                                    | Required                       |
| ------------------------------------------ | -------------------------------------------------------- | ------------------------------ |
| `ADMIN_ORIGIN`                             | `https://admin.scholarscafe.com`                         | yes                            |
| `PUBLIC_ORIGIN`                            | `https://scholarscafe.com`                               | yes                            |
| `DB_HOST`                                  | `127.0.0.1`                                              | yes                            |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`        | hPanel → **Databases → MySQL**                           | yes                            |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | section 2                                                | yes                            |
| `SMTP_PASSWORD`                            | section 3                                                | for contact-form notifications |
| `SUPER_ADMIN_EMAIL`                        | first master admin (section 6); `OWNER_EMAIL` also works | only for a new, empty database |
| `SMTP_USER`                                | `no-reply@scholarscafe.com` once it exists               | optional                       |
| `TURNSTILE_SECRET_KEY`                     | Cloudflare Turnstile secret (see SECURITY.md)            | optional                       |
| `TRUST_PROXY`                              | `loopback` (verified: Hostinger's proxy is 127.0.0.1)    | yes, on both apps              |
| Leave `PORTAL` unset on the admin app.     |

## 6. The master admin (first Super Admin)

- On first start with an **empty** `users` table, the app creates exactly one owner: `SUPER_ADMIN_EMAIL` (default `contact.scholarscafe@gmail.com`). It never does this again and never re-activates a removed owner.
- That person signs in at https://admin.scholarscafe.com with Google and adds everyone else under **Access**.
- The app always keeps at least one owner. Turn on Google 2-Step Verification for every team account.
- Already live? The owner already exists; `OWNER_EMAIL` has no effect.

## 7. Local development

1. Copy `backend/.env.example` to `backend/.env`; set `ADMIN_ORIGIN=http://localhost:3000`, local MySQL values and the Google client.
2. Admin: `cd backend && node local-dev.js` → http://localhost:3000
3. Student portal: `PORTAL=student STUDENT_ORIGIN=http://localhost:3001 PORT=3001 node local-dev.js` → http://localhost:3001 (email codes are printed in that terminal).

## 8. Checks after setup

- Admin page: an approved Gmail gets in with the right role; a non-approved Gmail and a student account are refused.
- Student page: a student gets in with Google or an email code; a team account is refused.
- **Activity** shows `sign_in`, `sign_in_email_code`, `sign_in_password`, `sign_in_password_reset`, `student_signup` and `sign_in_denied` entries.

## 9. Permissions (enforced on the server, tested)

|                                                 | Super Admin (owner) | Admin                      | Editor      | Mentor                     | Student       |
| ----------------------------------------------- | ------------------- | -------------------------- | ----------- | -------------------------- | ------------- |
| Site content, blog, resources, link page, media | ✓                   | ✓                          | edit drafts | –                          | –             |
| Publish, leads, students, courses               | ✓                   | ✓                          | –           | own leads + their students | own data only |
| Packages, giving them, block sign-in            | ✓                   | ✓                          | –           | –                          | –             |
| Access: add/remove team                         | everyone            | editors, mentors, students | –           | –                          | –             |
| Security settings (sign-up mode)                | ✓                   | view                       | –           | –                          | –             |
| Activity log                                    | ✓                   | ✓                          | –           | –                          | –             |

## 10. Packages (Phase 2)

- **Packages page:** name, price, description, what's included, the features it turns on (messaging, uploads, reviews, live) and its courses.
- **Students page → a student → Packages:** "Give package" enrolls the student in every course of that package (optionally with a mentor). "Remove" takes away the courses that no other package of theirs includes. A student with no package sees nothing.
- Changing a package's courses updates everyone who has it.
- **Mentor and access:** set one mentor for all of a student's courses; "Block sign-in" signs the student out everywhere.
- The feature switches are stored now and enforced when messaging, uploads and reviews are gated (Phases 3–4).

## 11. Student portal and videos (Phase 3)

**Students see:** Home (continue learning, their package, mentor, upcoming live sessions, announcements), My courses, Resources (ongoing courses plus live links, videos, guides; filter by type, country, tag), Messages and Profile.

**Admin → Student resources:** announcements, live sessions (Google Meet / Facebook Live link and start time), videos, guides and links.

- Tick packages to limit who sees an item. Leave them unticked for every student who has a package.
- Students without a package see nothing.

**Videos**

- Upload them in a lesson (Courses & videos) or in Student resources. They go up in 5 MB pieces, up to 2 GB each and 30 GB in total. Keep the page open while uploading.
- Files are stored outside the website folder, at `~/sc-private/videos` (override with `VIDEO_DIR`).
- Recommended export: MP4, H.264, 720p, about 1.5 Mbps (about 0.7 GB per hour).
- Delete videos nothing uses in Student resources → Video library.

**What the protection does:**

- Playback links last 10 minutes and only work for the signed-in student they were made for.
- Access is re-checked on every request. Removing a package, pausing an enrollment or blocking the student stops playback.
- No download button, no picture-in-picture, no right-click menu.
- A faint watermark with the student's email moves around the video, including in full screen.

**What it cannot prevent (honestly):** a determined student can still record their screen or film it with a phone, and technical users can save what their browser receives. The watermark makes a leaked recording traceable to the student; it doesn't stop it. Real DRM (Widevine/FairPlay) needs a paid streaming service.

**Hosting note:** Hostinger's terms don't allow shared hosting to be used mainly for streaming. Course videos for your students are fine at this scale; if viewing grows to many hours a day, move the files to Backblaze B2 (see ARCHITECTURE.md).

## 12. Messaging, files, document reviews, testimonials (Phase 4)

The package switches now apply:

| Package feature | Student gets                                                          |
| --------------- | --------------------------------------------------------------------- |
| Messaging       | Messages with their mentor (with attachments)                         |
| Uploads         | Documents page: share files with the team (transcripts, certificates) |
| Reviews         | Documents page: submit essays/SOPs/CVs for mentor review              |

Students without a feature don't see that menu item, and the server refuses the action.

**Messages**

- Mentors see only their own students; owners and admins see everyone.
- A conversation refreshes every 15 seconds while it's open, and unread counts show in the menu.
- Admins can remove a message. The student and mentor then see "removed by the Scholars Cafe team"; admins still see the original for the record.
- Limit: 30 messages an hour per person.

**Files**

- Accepted types: PDF, Word (.docx), plain text, PNG and JPEG, up to 10 MB each and 300 MB per student, 20 uploads an hour.
- The content is checked, not the file name.
- PDFs with scripts or embedded files, and Word files with macros or embedded objects, are refused.
- Files are stored outside the website under random names (`~/sc-private/files`, override with `FILE_DIR`).
- Downloads use 5-minute links tied to the signed-in user and always download, never open in the browser.
- **Virus scanning:** there is no free scanner that runs on Hostinger shared hosting (ClamAV needs its own service and about 1 GB of memory). The type checks and download-only rule above are the protection. Open student files on an up-to-date computer.

**Document reviews**

- A student submits a document and it shows as "Waiting for review".
- The mentor replies with comments, an optional marked-up file and a status: In review, Changes requested or Approved.
- A new version from the student puts it back in the queue. Find them under Students → Documents.

**Testimonials**

- In a course review, the student can tick "may show this on the website with my first name".
- In Reviews, approve it, then click **Add to website testimonials**. This creates a draft in Website → Testimonials for you to check and publish.

**AI-writing detectors:** not added. Open-source detectors (RoBERTa-based classifiers, Binoculars, DetectGPT-style methods) need Python and large models (hundreds of MB to several GB, ideally a GPU), which Hostinger shared hosting can't run. Their accuracy is also unreliable: high false-positive rates, especially for non-native English writers, and easy to evade by paraphrasing. Even OpenAI withdrew its own detector for low accuracy. If wanted later, it can only ever be an indicator, never proof.

## 13. Landing page, forms and the link page (Phase 5)

**Home page:** after the stories it now shows the five newest blog posts (set a date on each post), three guides from Resources, and a "Log in to the portal" section linking to student.scholarscafe.com. Reorder or hide them in Website → Page sections (ids `journal`, `resources`, `portal`).

**Forms (Inbox → Forms):**

- **Building:** questions can be short or long text, email, phone, number, date, link, dropdown, single or multiple choice, or a consent checkbox. Each can be required, have help text, a maximum length, and "show only when" another answer has a given value. Add steps for a multi-page form.
- **Template:** "Start from the contact form" recreates the website's contact form.
- **Publishing:** published forms are live at `scholarscafe.com/forms/<address>`.
- **Answers are checked twice:** in the browser, then again on the server.
- **Spam protection:** Turnstile (when the keys are set), 10 submissions an hour per visitor, and a hidden honeypot field.
- **Where submissions go:** to Leads, labelled with the form's name, so status, notes, mentor assignment and the CSV export all work. The Source filter shows one form. "Email me" sends each one to the team inbox.
- **Replacing a Google Form:** build it here, publish it, and point your links to the new address.

**Link page (Website → Link page):**

- `scholarscafe.com/links` shows social icons (type `social`), featured buttons (`highlight`), normal links, and YouTube videos (type `youtube`; a thumbnail that opens YouTube).
- Order uses `position`; untick `enabled` to hide one.
- Click counts (last 30 days and total) appear next to each link in the admin. Only a daily counter per link is stored, nothing about the visitor.
- Until you publish links, the page shows the site's existing links: socials, a WhatsApp call, guides, the portal and the website.

## 14. Install as an app, and mobile (Phase 6)

**Install:** both portals can be added to a phone's home screen and open full screen with the Scholars Cafe icon.

- **iPhone:** open the portal in Safari, tap Share, then **Add to Home Screen**.
- **Android:** open it in Chrome, open the menu, then **Install app**.

**Offline:** without a connection, the app shows an "You're offline" page.

**What is stored on the device:** only the app's own files (layout, script, logo, font), never `/api`, `/auth` or `/public`. So no personal data, messages, files, videos or API answers are kept. The app's files are always re-checked with the server first, so everyone gets the newest version right after a deploy. This also fixes having to hard-refresh the admin.

**Mobile:** under 800 px wide, the menu becomes a bottom tab bar (up to four main screens plus **More**, which opens the full menu as a sheet). The layout respects the iPhone notch and home bar, tap targets are at least 44 px, and screens fade in gently (off when "Reduce motion" is on). Checked at 360, 390 and 430 px with no sideways scrolling.

Screenshots (sample data): `docs/screenshots/` (student and admin, desktop and mobile).
