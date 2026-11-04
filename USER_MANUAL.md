# Scholars Cafe: Site Owner's Manual

A plain-language guide to running the website. No coding needed for everyday changes.
(Bangla version: `USER_MANUAL_BN.md`.)

**Site pages:** Home, Programs, Services, About (with Our Team), Resources (guides, university explorer, FAQ, newsletter) and Contact, plus Privacy, Terms and Cookies.

---

## 1. Log in to the admin (Super Admin)
1. Go to **https://admin.scholarscafe.com**.
2. Click **Continue with Google**, or type your email and either your password or **Email me a one-time code** (the code expires in 10 minutes). `contact.scholarscafe@gmail.com` is the owner.
   To set or change a password: **Account** → enter it twice → **Save password**. Forgot it? Sign in with an email code.
3. You land on **Overview**. Mentors land on **Leads**.

Only accounts you have approved can sign in. Sessions end automatically after 4 hours.
**Security tip:** turn on Google 2-Step Verification for every account with admin access.

### Roles
| Role | Can do |
|---|---|
| **Owner** (Super Admin) | Everything, including giving and removing access |
| **Admin** | Edit and publish content, read messages, manage editors |
| **Editor** | Write drafts only (cannot publish, delete or see leads) |
| **Mentor** | Sees only **Leads** assigned to them; can change status and notes |

**Give someone access:** Admin → **Access** → enter their Gmail address → choose a role → Save. To remove access, untick **Active** and save. Their session ends immediately.

---

## 2. Edit website text and images
1. Admin → **Website text & images**.
2. Find the section (for example *Hero*, *Programs*, *FAQ*) and click **Edit**.
3. Change the text. For an image, upload it or paste an `https://` link.
4. Click **Save draft**, then **Publish**. The live site updates within about a minute.

If a field you need isn't listed, click **Set up … fields** for that section. It adds the missing fields with the current website text, so nothing changes until you edit and publish.

**Hidden or placeholder text:** some text lives in one file, `src/content/site.json` (the USA section and the contact form's default country). Fields ending in `_TODO` explain what to fill in. An empty field is hidden on the site. Changes to this file need a developer to commit them (see `DEPLOYMENT.md`, section 6).

## 3. Courses and pricing
Admin → **Courses & pricing** → **Edit** (or **+ Add entry**) → fill in the title, price, description, features (one per line), button text, and whether it's *featured* → **Save draft** → **Publish**.
To hide a course, open it and click **Unpublish**.

## 4. Lists you can edit (add, edit, reorder, delete)
These menus each hold a list. **+ Add entry** creates one; **Edit** changes it; **↑ / ↓** moves it (the new order is published at once); **Unpublish** hides it; **Delete entry** (Admin/Owner) removes it.
| Menu | What it controls |
|---|---|
| **Our Team** | Founders and mentors on the About page. *group* = founder or mentor; photo upload or `https://` link. |
| **Universities** | The moving name strip. One university name per entry. |
| **Testimonials** | Student quotes. Shown only after you publish them. |
| **FAQs** | Questions and answers on the Resources page. |
| **Countries** | Tick *enabled* to show a country in the explorer, contact form and footer (only USA is on now). |
| **Hero videos** | The home-page video playlist (see section 6). |
| **Blog** | Journal posts on the home page. |

**Undo a mistake:** open the entry → **Version history** → pick an earlier version → **Restore as draft** → check it → **Publish**. Deleted entries are kept in the database, so your developer can bring one back.

## 5. Page sections and SEO
- **Page sections:** one entry per page. *order* lists the section ids top to bottom, separated by commas (for example `hero,names,usa,pages,stories,journal,cta`). Put an id in *hidden* to hide that section. Remove nothing you don't recognise; unknown ids are ignored.
- **SEO titles:** one entry per page (`/`, `/about`, `/programs`, …). *title* (max 70 characters) is the browser-tab and Google title; *description* (max 170) is the Google snippet. Google may take days to pick up changes.

## 6. Hero videos
Admin → **Hero videos**. Each entry is one clip: *place* (shown on screen), *device* (desktop = wide, mobile = tall), *mp4* and *webm* (upload, max 12 MB, or an `https://` link), *poster* (still image), *credit*, *rate* (speed, 1 = normal) and *enabled*. Reorder with ↑ / ↓.
1. Use footage that is free for commercial use (Pexels, Pixabay, Coverr, or Wikimedia Commons CC BY), slow drone shots, 1080p, at least 10 seconds, no audio.
2. Desktop 1920×1080, mobile 720×1280. Keep each file under 12 MB (compress first, e.g. with HandBrake).
3. Write the source and licence in *credit* if required, and tell your developer to add it to `CREDITS.md`.
If no clip is enabled for a device, the built-in clips play.

## 7. Leads (contact form enquiries)
Admin → **Leads**. Every contact-form message becomes a lead.
- **Status:** new → contacted → enrolled → closed. Add **notes** and click **Save**.
- **Assign** a lead to a mentor (Admin/Owner). The mentor then sees it when they sign in, and nothing else.
- **Search and filter** by name/email/text, status or mentor. **Export CSV** downloads the filtered list (opens in Excel/Google Sheets).
- To add a mentor: **Access** → their Gmail → role **mentor** → Save.

## 8. Students and student dashboard
The student dashboard (courses, lessons, messages, reviews) is **not built yet**; it is a later phase. **Newsletter** shows email signups (mark people as unsubscribed when they ask).

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
| Hero video doesn't play | On phones with data saver, slow connections or "reduce motion" turned on, a still image is shown on purpose. Otherwise check the clip is *enabled* and its file opens. |
| Upload refused | Images: PNG/JPEG/WebP up to 5 MB. Videos: MP4/WebM up to 12 MB. Renamed files are rejected. |
| Site is down after an update | hPanel → Websites → Node.js → Deployments: open the failed build's log, or redeploy the last good build. |

For anything else, contact your developer with a screenshot and the time it happened.
