# Scholars Cafe: Site Owner's Manual

A plain-language guide to running the website. No coding needed for everyday changes.
(Bangla version: `USER_MANUAL_BN.md`.)

---

## 1. Log in to the admin (Super Admin)
1. Go to **https://admin.scholarscafe.com**.
2. Click **Sign in with Google** and choose your approved Google account (`contact.scholarscafe@gmail.com` is the owner).
3. You land on **Overview**, which shows how many mentors, blogs, courses and text entries exist.

Only Google accounts you have approved can sign in. Sessions end automatically after 4 hours.
**Security tip:** turn on Google 2-Step Verification for every account with admin access.

### Roles
| Role | Can do |
|---|---|
| **Owner** (Super Admin) | Everything, including giving and removing access |
| **Admin** | Edit and publish content, read messages, manage editors |
| **Editor** | Write drafts only (cannot publish) |

**Give someone access:** Admin → **Access** → enter their Gmail address → choose a role → Save. To remove access, untick **Active** and save. Their session ends immediately.

---

## 2. Edit website text and images
1. Admin → **Website text & images**.
2. Find the section (for example *Hero*, *Programs*, *FAQ*) and click **Edit**.
3. Change the text. For an image, upload it or paste an `https://` link.
4. Click **Save draft**, then **Publish**. The live site updates within about a minute.

If a field you need isn't listed, click **Set up … fields** for that section. It adds the missing fields with the current website text, so nothing changes until you edit and publish.

**Hidden or placeholder text:** some text lives in one file, `src/content/site.json` (the USA section, which countries are shown, the contact form's default country). Fields ending in `_TODO` explain what to fill in. An empty field is hidden on the site. Changes to this file need a developer to commit them (see `DEPLOYMENT.md`, section 6).

## 3. Courses and pricing
Admin → **Courses & pricing** → **Edit** (or **+ Add entry**) → fill in the title, price, description, features (one per line), button text, and whether it's *featured* → **Save draft** → **Publish**.
To hide a course, open it and click **Unpublish**.

## 4. Mentors (team section)
Admin → **Mentors** → **+ Add entry** → name, role, short bio, photo (upload or `https://` link), initials (shown if there's no photo) → **Save draft** → **Publish**.

## 5. Universities and logos (the scrolling logo strip)
1. Admin → **Website text & images** → **Universities**.
2. Each university has a **name** and a **logo**. Upload a new logo or change the name, then **Publish**.
3. Logos look best as **dark logos on a transparent background** (PNG or WebP, about 300 px wide). The site shows them in gray and brings them to full strength on hover.
4. If a logo is missing or fails to load, the university's name appears instead.

## 6. Students and student dashboard
The student dashboard (courses, lessons, messages, reviews) is **not built yet**; it is the next project phase. When it's ready, this manual will cover adding students, assigning courses and moderating messages. For now:
- **Messages** in the admin shows enquiries from the contact form.
- **Newsletter** shows email signups (mark people as unsubscribed when they ask).
- **Feedback** holds testimonials. They are published only when you publish them.

## 7. Replace the hero videos
The background videos live in `public/media/hero/` and are listed in `src/lib/hero-media.ts`.
1. Find footage that is free for commercial use (Pexels, Pixabay, Coverr, or Wikimedia Commons with a CC BY licence). Prefer slow drone shots, **1080p or higher**, at least 10 seconds long.
2. Send the file and its web link to your developer, or follow the developer steps:
   - Desktop: 1920×1080 MP4 (H.264) + WebM; Mobile: 720×1280 portrait. No audio. Make a matching `.webp` poster.
   - Add it to `src/lib/hero-media.ts` with its place name. Add a `credit` if the licence requires attribution.
   - Record the source and licence in `CREDITS.md`.
3. Timing (how long each clip shows, fade length, speed) is set at the top of `src/components/scholars/HeroVideo.tsx`: `HOLD_SECONDS`, `FADE_MS`, `DEFAULT_RATE`.

## 8. Show more countries again
In `src/content/site.json` → `countries` → set `"enabled": true` for a country. The university explorer, contact form and footer update automatically. A developer commits the change.

## 9. Change colors and fonts
- Colors and fonts are defined once in `src/styles/design-system.css` (and mirrored in the `@theme` block of `src/styles.css`). The full palette and type are on the private page **https://scholarscafe.com/design-system**.
- **Font:** the site uses *Funnel Display*. To use your designer's files, place them in `public/fonts/` with the same file names and rebuild.
- Changing brand colors affects the whole site. Ask your developer, and check contrast (text must stay readable).

## 10. Troubleshooting
| Problem | What to do |
|---|---|
| A change doesn't appear | Did you click **Publish** (not only Save draft)? Wait 1 minute, then refresh with Ctrl+Shift+R (Cmd+Shift+R on Mac). |
| "This account has not been granted access" | That Google account isn't approved. An owner must add it under **Access**. |
| "Another editor changed this entry" | Someone saved it meanwhile. Reload the page and make your edit again. |
| Contact form says it can't send | Check that the admin site is up. If you enabled Turnstile, both keys must be set (see `DEPLOYMENT.md`). |
| Hero video doesn't play | On phones with data saver, slow connections or "reduce motion" turned on, a still image is shown on purpose. Otherwise check the file exists in `public/media/hero/`. |
| A logo shows as text | Its image is missing or broken. Upload it again (section 5). |
| Site is down after an update | hPanel → Websites → Node.js → Deployments: open the failed build's log, or redeploy the last good build. |

For anything else, contact your developer with a screenshot and the time it happened.
