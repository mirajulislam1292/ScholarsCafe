# Backend setup: sign-in pages, email and the first Super Admin

There are **two separate sign-in pages**, both running from the same code (`backend/`) and the same database:

| Page | Who | How they sign in |
|---|---|---|
| **https://admin.scholarscafe.com** (team) | Master admin (owner), admins, editors, mentors | **Google only**, with a Gmail the master admin approved under **Access** |
| **https://student.scholarscafe.com** (students) | Students only | Google, a one-time email code (with sign-in link), or a password |

Each page refuses the other's accounts: a student who tries the admin page is told to use the student page, and vice versa. A session from one never works on the other.

Never put real secrets in Git. Paste them only into hPanel. The full list with comments is in `backend/.env.example`.

## What I need from you
1. **Google client** under the business Gmail, with both redirect URLs (section 2).
2. **The student subdomain** in Hostinger (section 4).
3. **Mailbox password** for `contact@scholarscafe.com` in `SMTP_PASSWORD` on the student app (section 3), so students can get email codes.
4. **2-Step Verification** on every team Google account.

## 1. How access works
- **Team (admin page):** the master admin (`contact.scholarscafe@gmail.com` by default) adds people under **Access**: their Gmail and a role (*admin*, *editor* or *mentor*). Whoever signs in with that Gmail gets exactly that role. Untick **Active** to remove access; their session ends immediately.
- **Students (student page):** an admin adds them under **Students → Add a student** (email + name) and enrolls them in courses. Nobody can sign up on their own.
- **Student email codes:** 6 digits plus a sign-in link, valid **10 minutes**, work once, destroyed after **5 wrong codes**, max **3 emails per address per 15 minutes**.
- **Student passwords:** optional, set under **Account** after signing in once; 12+ characters; 5 wrong tries lock the account for 15 minutes.
- **Forgot password (students):** sign in with an email code, then set a new password under **Account**. Nobody, including admins, can see a password.
- No SMS, no Microsoft sign-in, no self sign-up.

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
**Chosen: Hostinger SMTP** (your `contact@scholarscafe.com` mailbox). It's already paid for and on your domain, so no new account, card or DNS change; a few student sign-ins a day is far below its limit. If you ever need thousands of emails a day, Resend (3,000/month free) or Brevo (300/day free) can replace it with one setting.
1. **https://hpanel.hostinger.com** → **Emails** → `scholarscafe.com` → make sure `contact@scholarscafe.com` exists; set or reset its password.
2. Put that password in `SMTP_PASSWORD` on the **student** app (and the admin app too, for contact-form notifications) → **Restart**.
3. Check SPF and DKIM are active: hPanel → **Emails → DNS settings**.
4. Test on https://student.scholarscafe.com with a student's email → **Email me a one-time code**. Check spam the first time.

## 4. Create the student portal in Hostinger (about 10 minutes)
1. hPanel → **Websites** → add **student.scholarscafe.com** as a Node.js app, the same way `admin.scholarscafe.com` is set up:
   - same GitHub repository, branch **main**, root directory **`backend`**
   - Express, Node **22**, entry file `server.js`, start `npm start`, build `npm run build`
2. **Environment variables** for the student app: copy all of the admin app's variables, then set these:

| Variable | Value |
|---|---|
| `PORTAL` | `student` |
| `STUDENT_ORIGIN` | `https://student.scholarscafe.com` |
| `ADMIN_ORIGIN`, `PUBLIC_ORIGIN` | same as the admin app |
| `DB_*` | same database as the admin app |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | same client (section 2) |
| `SMTP_PASSWORD` | section 3 |

3. hPanel → **Security → SSL**: make sure SSL is active for `student.scholarscafe.com`.
4. **Deploy**, then open https://student.scholarscafe.com: it should say **Student portal**.
From then on, every commit to `main` updates the website, the admin and the student portal.

## 5. Environment variables (admin app)
| Variable | Value | Required |
|---|---|---|
| `ADMIN_ORIGIN` | `https://admin.scholarscafe.com` | yes |
| `PUBLIC_ORIGIN` | `https://scholarscafe.com` | yes |
| `DB_HOST` | `127.0.0.1` | yes |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | hPanel → **Databases → MySQL** | yes |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | section 2 | yes |
| `SMTP_PASSWORD` | section 3 | for contact-form notifications |
| `OWNER_EMAIL` | first master admin (section 6) | only for a new, empty database |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret (see SECURITY.md) | optional |
| `TRUST_PROXY` | leave empty until verified (SECURITY.md) | optional |
Leave `PORTAL` unset on the admin app.

## 6. The master admin (first Super Admin)
- On first start with an **empty** `users` table, the app creates exactly one owner: `OWNER_EMAIL` (default `contact.scholarscafe@gmail.com`). It never does this again and never re-activates a removed owner.
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
- **Activity** shows `sign_in`, `sign_in_email_code`, `sign_in_password` and `sign_in_denied` entries.
