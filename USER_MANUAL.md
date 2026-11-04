# Scholars Cafe: Site Owner's Manual

A plain-language guide to running the website. No coding needed for everyday changes.
(Bangla version: `USER_MANUAL_BN.md`.)

**Site pages:** Home, Programs, Services, About (with Our Team), Resources (guides, university explorer, FAQ, newsletter) and Contact, plus Privacy, Terms and Cookies.

---

## 1. Sign-in pages
| Page | For | How |
|---|---|---|
| **https://admin.scholarscafe.com** | You (master admin) and your team | **Continue with Google**, with a Gmail you approved under **Access** |
| **https://student.scholarscafe.com** | Students | Google, **Email me a one-time code** (expires in 10 minutes), or a password they set under **Account** |

Each page turns away the other's accounts. Sessions end automatically after 4 hours.
**Students who forget their password:** sign in with an email code, then set a new password under **Account**.
**Security tip:** turn on Google 2-Step Verification for every team account.

### Roles
| Role | Can do |
|---|---|
| **Owner** (Super Admin) | Everything, including giving and removing access |
| **Admin** | Edit and publish content, read messages, manage editors |
| **Editor** | Write drafts only (cannot publish, delete or see leads) |
| **Mentor** | Their **Leads**, **Students** and **Messages** only; can add notes |
| **Student** | Their own courses, lessons, messages, reviews and details |

**Give a team member access:** Admin → **Access** → enter their Gmail address → choose a role (*admin*, *editor* or *mentor*) → Save. When they sign in with that Gmail they get exactly that role. Students are added under **Students** instead. To remove access, untick **Active** and save. Their session ends immediately.

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

## 8. Students and courses (student dashboard)
**Student courses** (Admin/Owner) are the courses students take online. They are separate from *Courses & pricing* on the public site.
1. **Student courses** → **+ New course** → title, summary → status *Draft* while you build it → **Create course**.
2. Open it with **Edit →**. Add lessons: title, text, order (10, 20, 30…), **Published** tick, and an optional video (MP4/WebM up to 12 MB). Lesson videos are **private**: only students enrolled in that course can watch them. Click **+ Add lesson** / **Save lesson**.
3. Set the course to **Published** when it's ready. Draft courses and unpublished lessons are never shown to students.

**Students** (Admin/Owner):
1. **Add a student**: email, full name, phone, target intake → **Add student**. They sign in at **https://student.scholarscafe.com** with Google (if that email is a Google account), an email code, or a password they set. Nobody can sign up on their own.
2. Open a student → **Enroll** them in a course and pick their **mentor**. Change the status any time: *Active*, *Paused* (locks the course, e.g. unpaid) or *Completed*. **Remove** takes them out of the course.
3. **Staff notes** are never shown to the student. To block a student completely: **Access** → untick **Active**.

**Mentors** see **Students**: only students enrolled with them, and they can add notes. They cannot change courses or enrollments.
**What students see:** they sign in at **https://student.scholarscafe.com** and land on **My courses**: each course with a progress bar, then lessons in order with the video, the text and **Mark as done**. Under **Account** they can edit their name, phone and target intake, and set a password.
**Messages:** each student has one conversation with their mentor(s) and the Scholars Cafe team. Students use **Messages**; mentors and admins open **Messages** to see every conversation they're allowed to (unread counts shown). Mentors only see their own students. Up to 30 messages per person per hour. There are no email alerts yet, so check **Messages** daily.
**Reviews:** students can review a course they're enrolled in (1–5 stars + text) at the bottom of the course page. Admins approve or reject them under **Reviews**. Editing a review sends it back for approval. Approved reviews are not shown on the public website yet; copy the good ones into **Testimonials** if you want them there.
**Video protection:** videos play only for students actively enrolled in that course (and their mentor and admins). Pausing an enrollment, unpublishing a lesson or deactivating an account stops playback straight away. Download buttons are hidden, but no website can stop someone recording their screen, so don't put anything in a video you couldn't accept being shared.
**Newsletter** shows email signups.

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
| A student can't see a course | The course must be **Published**, the student enrolled with status **Active**, and the lessons ticked **Published**. |
| "Too many codes requested" | Wait 15 minutes, or sign in with Google or a password. |
| Site is down after an update | hPanel → Websites → Node.js → Deployments: open the failed build's log, or redeploy the last good build. |

For anything else, contact your developer with a screenshot and the time it happened.
