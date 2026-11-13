# Scholars Cafe: Owner's Manual

A plain-language guide to running the website, the team admin and the student portal. No coding needed. (Bangla: `USER_MANUAL_BN.md`.)

## 1. The three sites

| Site                         | Who               | How to sign in                                      |
| ---------------------------- | ----------------- | --------------------------------------------------- |
| **scholarscafe.com**         | Everyone          | No sign-in. Blog, guides, forms, `/links`           |
| **admin.scholarscafe.com**   | You and your team | **Continue with Google**, with a Gmail you approved |
| **student.scholarscafe.com** | Students          | Google, a 6-digit email code, or a password         |

- Each site turns away the other's accounts.
- You stay signed in for 7 days after you last used the site (both sites). Signing out, or being removed, ends it at once.
- Turn on Google 2-Step Verification for every team account.
- **Install as an app:** works for both the admin and the student portal. On a phone, open admin.scholarscafe.com (or student.scholarscafe.com), then Share → **Add to Home Screen** (iPhone, Safari) or menu → **Install app** (Android). It opens full screen with its own icon ("SC Studio"), a bottom tab bar, and a **More** sheet for every other section; tap the tab you're on to jump back to the top. You stay signed in for 7 days of use.

## 2. Roles

| Role                    | Can do                                                              |
| ----------------------- | ------------------------------------------------------------------- |
| **Owner** (Super Admin) | Everything, including access and the sign-up setting                |
| **Admin**               | Everything except managing other admins                             |
| **Editor**              | Website drafts only (cannot publish, see leads or students)         |
| **Mentor**              | Their leads, their students, those students' documents and messages |
| **Student**             | Their own portal: what their package unlocks                        |

**Add a team member:** Settings → **Users & roles** → Gmail → role → Save. To remove someone, untick **Active**. Their sessions end at once.

## 3. Students

**How students join:**

- **Sign up:** students can create an account at student.scholarscafe.com (name, email, optional phone). A new account sees **nothing** until you give it a package.
- **Invite only:** an owner can switch to this under Users & roles → **Student sign-up**. Then add students yourself under **Students → Add a student**.
- **Forgot password:** "Forgot password?" emails a 6-digit code.

**Students page** (Students → Students), for each student:

- **Give package:** enrolls them in the package's courses. You can pick a mentor at the same time.
- **Remove:** takes the package away. Courses another package still covers stay.
- **Mentor for all courses:** sets one mentor for all of that student's courses.
- **Block sign-in:** signs them out everywhere at once.
- **Staff notes:** never shown to the student.

## 4. Packages

Students → **Packages** → **+ New package**:

- name, price (as shown, e.g. ৳25,000), description and what's included (one item per line);
- **features:** messaging with their mentor, file uploads, document reviews, live sessions;
- **courses** the package unlocks.

Changing a package's courses updates everyone who has it. A package that students still have can't be deleted; mark it **inactive** instead.

## 5. Courses and videos

Students → **Courses & videos** → **+ New course**.

1. Add lessons: a title, text, an order (10, 20, 30…) and a **Published** tick.
2. **Upload a video:** MP4 is best (720p, H.264). Up to 2 GB per video, 30 GB in total. It uploads in pieces, so keep the page open; a dropped connection resumes on its own.
3. Set the course to **Published**. Students see it once a package gives it to them.

**What students get:** they resume where they stopped, and watching 90% marks the lesson done.

**Protection:**

- Each video link lasts 10 minutes and works only for that student.
- There's no download button.
- Their email moves faintly across the video.

Screen recording can't be prevented; the watermark makes leaks traceable.

## 6. Student resources and announcements

Students → **Student resources** → **+ New**:

- **Types:** Announcement (shown on the student's Home), Live session (Google Meet / Facebook Live link and start time), Video, Guide, Link.
- **Who sees it:** tick packages, or leave them all unticked for every student who has a package.
- **Published and Pinned:** Published makes it visible; Pinned puts it on top.
- **Video library** (at the bottom): see how much space you've used, and delete videos nothing uses.

## 7. Messages, documents and reviews

- **Messages:** only students whose package includes messaging can message. Each student has one conversation with their mentor and the team.
  - Attachments are allowed: PDF, Word, text, PNG and JPEG, up to 10 MB.
  - The conversation refreshes every 15 seconds.
  - Owners and admins can **Remove** a message; students then see "removed by the Scholars Cafe team".
- **Documents** (Students → Documents):
  - Students submit an essay, SOP, CV, transcript or recommendation letter.
  - The mentor replies with feedback, an optional marked-up file and a status: In review, Changes requested or Approved.
  - A new version from the student puts it back in the queue.
- **Reviews:** students review their courses.
  1. Approve or reject them under Reviews.
  2. If the student ticked "may show on the website", click **Add to website testimonials**. This creates a draft under Website → Testimonials.
  3. Check it, then publish.

## 8. Visual editor (Super Admin only)

The easiest way to change any text on the website: Admin → Website → **Visual editor**. It only appears, and only works, for the Super Admin account (contact.scholarscafe@gmail.com); every other account is refused by the server.

1. Pick a page (Home, Programs, Services, Resources, About, Contact, Link page…) and **Desktop** or **Phone**.
2. Point at a text: editable ones get a blue dashed outline. Click it.
3. Type the new text on the right. The preview changes as you type.
4. **Save & publish**. It is live on scholarscafe.com within about a minute, with no deploy. An earlier version is kept (Version history in the old editors).

If the same text appears in several places (e.g. a button used twice), the panel lists them; untick the ones you don't want to change. **Show what can't be edited** lists anything on the page not connected yet (only automatic numbers, initials and the year are left).

## 8. The website

- **Text and images:** Website → **Website text & images** → Edit → **Save draft** → **Publish** (live within about a minute).
- **Lists:** Blog (set a date; the home page shows the 5 newest), Resources, Courses & pricing, Universities, Our Team, Testimonials, FAQs, Countries, Hero videos. **+ Add entry**, **Edit**, **↑ ↓** to reorder, **Unpublish** to hide.
- **Page sections:** order or hide sections, e.g. home: `hero,names,usa,pages,stories,journal,resources,portal,cta`.
- **SEO titles:** the Google title and description for each page.
- **Undo:** open an entry → **Version history** → **Restore as draft** → Publish.

## 9. Forms (your Google Forms replacement)

Inbox → **Forms**:

- **Ready-made forms:** your five Google Forms (ED II & RD BootCamp, Premium Mentorship, F-1 Visa, USA Cohort, Individual Services) are rebuilt with the same questions, choices and introductions. Click **Use this form**, check it, tick **Published** and save.
- **Start from the contact form**, or **+ New form**.
- **Add buttons**, one per question type: Short answer, Paragraph, Multiple choice, Checkboxes, Dropdown, **File upload**, Email, Phone, Number, Date, Time, Link, Consent, and **Text / heading** (a section title or a paragraph of information, no answer).
- Each question can be **Required**, have a description (links become clickable) and a maximum length.
- **Multiple choice and Checkboxes** can add an **"Other:"** choice with a text box. In a choice list, a line starting with `#` is a heading (e.g. `# Guidance Program:`), not something people pick.
- **Header photo:** pick one of the website's photos or upload your own wide photo (under 5 MB).
- **Introduction:** write it like a Google Form description. An emoji at the start of a line (✅ ⛔ 💰 📌 💳 📩 🔗…) shows as a matching icon; a line ending with ":" followed by lines makes a neat list (✅ gives ticks, ⛔ gives crosses); "Facebook: https://…" lines under a heading become buttons; other emojis are left out.
- **File upload:** one PDF, Word (.docx), text, PNG or JPEG up to 10 MB per question (up to 5 per form). Files are private.
- **Show only when:** a question can appear only for a certain earlier answer, for example "Which grade?" only when "Other" is chosen.
- **+ Add a step** makes a multi-page form.
- **Publishing:** tick **Published** and save. The form is live at `scholarscafe.com/forms/<address>`; share that link.
- **Forms list:** each form is a card with its own link. Tap the link to open the form, or **Copy link** to share it. **Live** forms are open to the public; **Draft** ones are not.
- **See responses** (on each form): one card per person, newest first. Tap a card to read all their answers; use the search box to find a name, email or any answer. Click a file to download it. **Download Excel** gives everything as a spreadsheet; file cells link back to the download (sign in to the admin first).
- **Old Google Forms responses:** in Google Forms open the form → Responses → ⋮ → **Download responses (.csv)**, unzip it, then at the bottom of the form's responses page use **Import old responses from Google Forms**. Questions are matched by title, the original dates are kept, files stay as Google Drive links, and importing the same file twice adds nothing twice.
- **Where answers are saved:** in the website's own database (not Google). Uploaded files are kept privately on the server. See them under the form's **Responses**, or in **Leads**.
- **A copy to the person:** like Google Forms, everyone who fills in a form with an Email question gets an automatic email with a copy of their answers. It comes from the website's sending address (`SMTP_USER`, e.g. no-reply@scholarscafe.com), and replies go to contact@scholarscafe.com. Untick "Email people a copy of their answers" to turn it off for a form. At most 3 a day go to the same address.
- **Answers** also go to **Leads**, labelled with the form's name, for status, notes and mentor. Tick "Email me" to also get each one by email.

## 10. Leads

Inbox → **Leads**: every contact-form and form submission.

- **Track:** set the status (new → contacted → enrolled → closed), add notes, and assign a mentor.
- **Filter:** by text, status, mentor or **source** (which form).
- **Export CSV** downloads the filtered list.

## 11. Link page (scholarscafe.com/links)

Website → **Link page** → **+ Add entry**:

- **type:** `social` (an icon in the top row), `link` (a button) or `youtube` (a video card; paste the YouTube link).
- **highlight** makes a featured button; **position** sets the order; untick **enabled** to hide.

Click counts (last 30 days and all time) appear next to each link. Put `scholarscafe.com/links` in your Instagram, TikTok and Facebook bios.

## 12. Troubleshooting

| Problem                                    | What to do                                                                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| A change doesn't appear                    | Did you click **Publish**? Wait a minute, then refresh.                                                                                         |
| A student sees nothing                     | They need a package. Check that the package is active, its courses are published, and the lessons are ticked Published.                         |
| A student can't message or upload          | Their package needs the Messaging / Uploads / Reviews feature.                                                                                  |
| "This account has not been granted access" | That Google account isn't added under Users & roles.                                                                                            |
| Upload refused                             | Files: PDF, Word (.docx), text, PNG or JPEG up to 10 MB; PDFs with scripts and Word files with macros are refused. Videos: MP4/WebM up to 2 GB. |
| A form says "not available"                | It isn't **Published**, or the address changed.                                                                                                 |
| A site shows 503                           | hPanel → that site → Node.js → **Logs**; see `DEPLOYMENT.md` §1.                                                                                |
| "Too many requests"                        | Wait a while. Limits protect against spam (e.g. 10 form submissions an hour per visitor).                                                       |

For anything else, send your developer a screenshot and the time it happened.
