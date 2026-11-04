# Backend setup: sign-in, email and the first Super Admin

Admin app: `admin.scholarscafe.com` (folder `backend/`). Every value below goes into
**hPanel → Websites → admin.scholarscafe.com → Node.js → Environment variables**, then click **Restart**.
Never put real values in Git. The full list with comments is in `backend/.env.example`.

## What I need from you
1. **Google OAuth client** (section 2): confirm the two redirect URLs are added. You keep the secret; paste it only into hPanel.
2. **Mailbox password** for `contact@scholarscafe.com`, typed by you into `SMTP_PASSWORD` in hPanel (not sent to me).
3. **Who the first Super Admin is.** Default: `contact.scholarscafe@gmail.com`. If different, set `OWNER_EMAIL` *before* the first start on a new database.
4. A yes/no on **turning on 2-Step Verification** for that Google account (strongly recommended).

## 1. Sign-in methods
| Method | How it works | Limits |
|---|---|---|
| **Google** | "Continue with Google" | Account must be approved under **Access** |
| **Email + password** | Optional. Set under **Account** after signing in once | 12+ characters; 5 wrong tries lock the account for 15 minutes |
| **Email code / magic link** | "Email me a one-time code": a 6-digit code and a sign-in link | Expires in **10 minutes**, works once, destroyed after **5 wrong codes**, max **3 emails per address per 15 minutes**, plus 30 sign-in requests per IP per 15 minutes |

There is no self sign-up and no SMS. Microsoft sign-in is not used anywhere (the code was checked; none existed).
Forgot your password? Use the email code, then set a new password under **Account**.

## 2. Google OAuth (free)
1. Open **https://console.cloud.google.com/apis/credentials** and sign in with the owner Google account.
2. Pick the existing Scholars Cafe project (or **Create project** → name it "Scholars Cafe").
3. If asked, set up the **OAuth consent screen**: User type **External** → app name "Scholars Cafe Admin", support email `contact.scholarscafe@gmail.com` → scopes: `openid`, `email`, `profile` only → **Publish app** (these scopes need no Google review).
4. **Credentials → + Create credentials → OAuth client ID** → type **Web application** (or open the existing one).
5. **Authorized redirect URIs**, add both:
   - Production: `https://admin.scholarscafe.com/auth/callback`
   - Local development: `http://localhost:3000/auth/callback`
6. Leave **Authorized JavaScript origins** empty (not needed). **Save**.
7. Copy **Client ID** → `GOOGLE_CLIENT_ID`; **Client secret** → `GOOGLE_CLIENT_SECRET`.
Tip: for full separation, create a second client just for local development.

## 3. Email for sign-in codes: choice
| Option | Free tier | Fit |
|---|---|---|
| **Hostinger SMTP** (chosen) | Included with your hosting mailbox; daily limit set by your plan (see hPanel → Emails) | Already set up for contact-form notifications |
| Supabase Auth email | Built-in sender is for testing only (very low hourly limit) | Would need a second auth system plus its own SMTP anyway |
| Resend | 3,000/month, 100/day | Needs a new account and DNS records |
| Brevo | 300/day | Needs a new account and DNS records |

**Why Hostinger SMTP:** it is already paid for and running for this domain, so it adds no new account, card or DNS change.
Codes come from your own domain (`contact@scholarscafe.com`); with SPF and DKIM on (step 3 checks) they are less likely to land in spam.
A handful of admin sign-ins a day is far below any plan's limit; if students later need thousands of emails, switch to Resend or Brevo with one config change.
(Free-tier numbers change; check each provider's pricing page before relying on them.)

**Set it up:**
1. hPanel → **Emails** → `scholarscafe.com` → confirm the mailbox `contact@scholarscafe.com` exists (create it if not).
2. Set or reset its password there. Put it in `SMTP_PASSWORD`. Restart the admin app.
3. Check SPF and DKIM: hPanel → **Emails → DNS settings** (or **Domains → DNS**) should show both as active. If not, click **Fix**/**Add**.
4. Test: open the admin sign-in page, enter your email, click **Email me a one-time code**. The email should arrive within a minute (check spam the first time).
Without `SMTP_PASSWORD`, email sign-in says "not set up yet"; Google still works. On `localhost` the code is printed in the terminal instead.

## 4. Environment variables (complete list)
| Variable | Value | Required |
|---|---|---|
| `ADMIN_ORIGIN` | `https://admin.scholarscafe.com` | yes |
| `PUBLIC_ORIGIN` | `https://scholarscafe.com` | yes |
| `DB_HOST` | `127.0.0.1` | yes |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | hPanel → **Databases → MySQL** | yes |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | section 2 | yes |
| `SMTP_PASSWORD` | section 3 | for email codes and notifications |
| `OWNER_EMAIL` | first Super Admin (section 5) | only for a new, empty database |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret (see SECURITY.md) | optional |
| `TRUST_PROXY` | leave empty until verified (SECURITY.md) | optional |

## 5. Creating the first Super Admin safely
- On first start with an **empty** `users` table, the app creates exactly one owner: `OWNER_EMAIL` (default `contact.scholarscafe@gmail.com`). It never does this again, and never re-activates a removed owner.
- That person signs in with **Google** or an **email code** (no password exists yet), then can set a password under **Account**.
- Add everyone else under **Access** (Gmail/email + role). Nobody can sign up on their own.
- Turn on Google 2-Step Verification for every owner/admin account. The app keeps at least one owner at all times.
- Already live? Your owner already exists; `OWNER_EMAIL` has no effect.

## 6. Local development
1. Copy `backend/.env.example` to `backend/.env` and set `ADMIN_ORIGIN=http://localhost:3000`, local MySQL values and the Google client.
2. `cd backend && npm install && node local-dev.js` → open http://localhost:3000.
3. Email codes are printed in that terminal (no email is sent locally).

## 7. Checks after deploy
- Google sign-in works; a non-approved Google account is refused.
- Email code arrives, works once, and fails after 10 minutes.
- **Activity** shows `sign_in`, `sign_in_email_code`, `sign_in_password` and `sign_in_denied` entries.
