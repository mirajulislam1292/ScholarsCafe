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
