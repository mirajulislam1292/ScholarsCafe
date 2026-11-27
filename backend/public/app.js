import { createApi } from "./net.js";
let me,
  items = [],
  section = "Overview";
let catalog = {};
// Old website text the public site no longer shows (see cms-retired-keys.json). Hidden in the editor;
// saved values are kept untouched in the database.
let retired = new Set();
const isRetired = (key) => retired.has(key);
const $ = (id) => document.getElementById(id);
const names = {
  copy: "Website text & images",
  sections: "Page sections",
  seo: "SEO titles",
  hero: "Hero videos",
  universities: "Universities",
  team: "Our Team",
  feedback: "Testimonials",
  faqs: "FAQs",
  countries: "Countries",
  courses: "Courses & pricing",
  blogs: "Blog",
  resources: "Resources",
  links: "Link page",
  colleges: "College directory",
  prompts: "Essay prompts",
  toolValues: "Core values cards",
  promptAngles: "Essay angles",
};
// Sidebar labels and one-line page descriptions for the non-content screens.
const LABELS = {
  Access: "Users & roles",
  Activity: "Audit log",
  "Student courses": "Courses & videos",
  Media: "Media library",
  Account: "Profile",
  Mail: "Mail (contact@)",
};
const ABOUT = {
  Overview: "Everything on the website, at a glance.",
  Media: "Images and videos for the website. Lesson videos stay private.",
  copy: "Every heading, paragraph and image on the public website.",
  sections: "Show, hide and reorder the sections of each page.",
  seo: "The title and description search engines show for each page.",
  hero: "The background videos on the home page.",
  universities: "Universities shown on the website.",
  team: "Founders and mentors on the About page.",
  feedback: "Student testimonials.",
  faqs: "Frequently asked questions.",
  countries: "Study destinations.",
  courses: "Programmes and prices shown on the website.",
  blogs: "Articles on the website blog.",
  resources: "Free public guides, templates and live-session links.",
  links: "The short link page for Instagram, TikTok and Facebook bios.",
  colleges:
    "Colleges at scholarscafe.com/colleges. An entry here replaces the built-in college with the same slug, or adds a new one.",
  prompts:
    "Supplemental essay prompts on Resources → Tools. Quote each one word for word from the college's own page and add that page as the source.",
  toolValues: "The value cards in the Core Values tool on Resources → Tools.",
  promptAngles: "Brainstorming angles shown for each prompt type on Resources → Tools.",
  Packages: "What students buy: price, what's included, courses and features.",
  Students: "Student accounts, packages, mentors and sign-in access.",
  "Student courses": "Courses, lessons and private lesson videos.",
  Messages: "Conversations between students and mentors.",
  Reviews: "Approve or reject student reviews.",
  Leads: "Enquiries from the website contact form and your forms.",
  "Visual editor":
    "Click any text on your website and change it. Only for the Super Admin account.",
  Forms: "Your own forms at scholarscafe.com/forms/…, replacing Google Forms. Answers go to Leads.",
  Bookings:
    "1-on-1 mentor sessions booked at scholarscafe.com/book (one per day), and when people can book.",
  Agreements:
    "Agreements people sign online at scholarscafe.com/sign/…: templates, sending, and signed copies.",
  "Private feedback": "Private feedback sent from the website.",
  Newsletter: "Newsletter sign-ups.",
  "ECA alerts":
    "People who asked to hear about new ECAs. Write one email and it goes to all of them.",
  Access: "Who can sign in to this workspace, and with which role.",
  "Email delivery": "Outgoing notification emails and their status.",
  Mail: "The contact@scholarscafe.com inbox: read, search and reply.",
  "Preview emails":
    "Every automatic email and a contact@ reply, with sample data. Nothing is sent.",
  Notifications: "Get notified on your phone or computer, and install the app.",
  Activity: "Every change, who made it and when. Only the Super Admin sees this.",
  "Team chat": "One group chat for the whole team. Pin important messages.",
  Tasks: "Team to-dos with deadlines. People get an email when assigned and before the deadline.",
  Progress: "Your streak, approximate hours and tasks done.",
  Account: "Your password and sign-in details.",
  "My courses": "Your courses and lessons.",
  Home: "",
  Documents: "Essays, SOPs, CVs and transcripts, with your mentor's feedback.",
  Resources: "Live sessions, videos and guides included in your package.",
  "Student resources":
    "Resources and announcements for students, by package. Lesson and resource videos.",
};
const label = (key) => names[key] || LABELS[key] || key;
const canPublishRole = (role) => role === "owner" || role === "admin";
const ENUMS = {
  device: ["desktop", "mobile"],
  collegeType: ["LAC", "NU"],
  testPolicy: ["", "required", "optional", "test-blind"],
  needBasedForIntl: ["", "yes", "no"],
  intlAidPolicy: ["", "need-blind", "need-aware", "merit-only", "limited", "none"],
  category: ["guide", "video", "live", "webinar", "podcast", "course", "template", "other"],
  type: ["link", "social", "youtube"],
  platform: [
    "instagram",
    "facebook",
    "youtube",
    "tiktok",
    "linkedin",
    "whatsapp",
    "email",
    "website",
  ],
  list: ["lac", "nu", "other"],
  required: ["required", "optional", "none"],
  archetype: ["why-us", "community", "intellectual", "extracurricular", "short-answer", "other"],
};
const HELP = {
  slug: "Web address, lowercase-with-dashes. For a college: scholarscafe.com/colleges/<slug>; the same slug as a built-in college replaces it.",
  collegeType:
    "LAC = National Liberal Arts College · NU = National University (U.S. News category).",
  applicants:
    "Every figure: leave blank if the college does not publish it (the site shows Not published). Never estimate. A filled figure needs its source link below it.",
  sat: "Middle 50% composite from CDS C9, e.g. 1450-1550.",
  act: "Middle 50% composite from CDS C9, e.g. 33-35.",
  ielts: "Minimum score, or none if the college says there is no minimum.",
  ed1: "Deadline as YYYY-MM-DD, or not-offered.",
  needBasedForIntl: "Do international students get need-based aid? Blank = not published.",
  policyQuote: "The college's exact words about need-blind or need-aware admission.",
  hidden: "Tick to hide this college from the website without deleting anything.",
  imageLicence:
    "Wikimedia Commons photos only, with a CC or public-domain licence. Leave the photo blank if unsure.",
  order: "Section ids in display order, separated by commas.",
  hidden: "Section ids to hide, separated by commas (leave empty to show all).",
  position: "Lower numbers appear first. Use the ↑ ↓ buttons in the list to reorder.",
  rate: "Playback speed, 0.5–1.5 (0.85 is calm).",
  page: "Page path, for example / or /about.",
  title: "",
  type: "link or social = a button in the list (social shows the network's icon) · youtube = a video card (paste the YouTube link).",
  platform: "For social icons: which network.",
  group:
    "Category on the About page. Choose one, or pick “+ New category…” to add your own (e.g. Advisors). People in the same category appear together.",
  highlight:
    "Featured: the button gets a light outline so it stands out. Order is set by position.",
  date: "Publish date, YYYY-MM-DD. The home page shows the five newest; Resources → Blog shows all.",
  category:
    "webinar, live or video = shown on Resources → Webinars. podcast = shown on Resources → Podcast (episodes, announcements and updates). Older entries saved as broadcast still show there.",
  linkedin: "Optional. Full LinkedIn profile link (https://…). Leave empty to hide the icon.",
  instagram: "Optional. Full Instagram profile link (https://…). Leave empty to hide the icon.",
  facebook: "Optional. Full Facebook profile link (https://…). Leave empty to hide the icon.",
  source:
    "Required. The college's own admissions or supplement page where this prompt appears (https://…). Never an essay blog.",
  asOf: "Date you checked the source, YYYY-MM-DD. College entries show a Stale badge after 12 months.",
  cycle: "Application cycle, e.g. 2026-27.",
  wordLimit: "Word limit. 0 = no limit or a character limit (explain it in limit note).",
  limitNote: "Optional, e.g. “150 characters” or “Choose one of three”.",
  list: "lac = liberal arts college, nu = national university.",
  required: "none = the college has no supplement (put “No supplemental essays” as the text).",
  archetype: "Prompt type, used for the filter and the matching essay angles.",
  hint: "One short line under the value, e.g. “Taking care of the people around you”.",
};
// Free-text fields with suggestions (pick one or type a new value).
const SUGGEST = {
  group: ["Founders", "Mentors", "Executive members", "Members", "Editors", "Team"],
};
const defaults = {
  mentors: { name: "", role: "", bio: "", photo: "", initials: "" },
  blogs: { title: "", slug: "", date: "", excerpt: "", body: "", author: "", image: "" },
  feedback: {
    name: "",
    quote: "",
    destination: "",
    outcome: "",
    year: "",
    initials: "",
    position: 0,
  },
  courses: {
    title: "",
    description: "",
    price: "",
    badge: "",
    features: [],
    cta: "Learn more",
    featured: false,
    position: 0,
  },
  copy: {},
  universities: { name: "", position: 0 },
  team: {
    name: "",
    group: "Founders",
    role: "Co-founder",
    title: "",
    line: "",
    photo: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    position: 0,
  },
  faqs: { q: "", a: "", position: 0 },
  countries: { name: "", enabled: false, position: 0 },
  hero: {
    place: "",
    device: "desktop",
    mp4: "",
    webm: "",
    poster: "",
    credit: "",
    rate: 0.85,
    enabled: true,
    position: 0,
  },
  seo: { page: "/", title: "", description: "" },
  sections: { page: "/", order: "", hidden: "" },
  resources: {
    title: "",
    category: "guide",
    country: "",
    url: "",
    description: "",
    image: "",
    position: 0,
  },
  links: {
    type: "link",
    platform: "website",
    label: "",
    url: "",
    note: "",
    highlight: false,
    enabled: true,
    position: 0,
  },
  colleges: {
    slug: "",
    name: "",
    collegeType: "LAC",
    city: "",
    state: "",
    code: "",
    rankLabel: "",
    rankEdition: "U.S. News 2027",
    rankSource: "",
    asOf: "",
    cdsYear: "",
    applicants: "",
    applicantsSource: "",
    admitted: "",
    admittedSource: "",
    edApplicants: "",
    edApplicantsSource: "",
    edAdmitted: "",
    edAdmittedSource: "",
    eaApplicants: "",
    eaApplicantsSource: "",
    eaAdmitted: "",
    eaAdmittedSource: "",
    earlyNote: "",
    sat: "",
    satSource: "",
    act: "",
    actSource: "",
    testPolicy: "",
    testPolicySource: "",
    testNote: "",
    needBasedForIntl: "",
    needBasedForIntlSource: "",
    intlAidPolicy: "",
    intlAidPolicySource: "",
    policyQuote: "",
    intlAided: "",
    intlAidedSource: "",
    intlAvgAward: "",
    intlAvgAwardSource: "",
    intlNote: "",
    costYear: "",
    tuition: "",
    tuitionSource: "",
    fees: "",
    feesSource: "",
    roomBoard: "",
    roomBoardSource: "",
    costNote: "",
    ielts: "",
    ieltsSource: "",
    toefl: "",
    toeflSource: "",
    duolingo: "",
    duolingoSource: "",
    englishNote: "",
    nationalCurriculum: "",
    nationalCurriculumSource: "",
    ed1: "",
    ed1Source: "",
    ed2: "",
    ed2Source: "",
    ea: "",
    eaSource: "",
    rd: "",
    rdSource: "",
    deadlineNote: "",
    highlight: "",
    image: "",
    imageTitle: "",
    imagePage: "",
    imageAuthor: "",
    imageLicence: "",
    imageLicenceUrl: "",
    urlAdmissions: "",
    urlInternational: "",
    urlAid: "",
    urlCds: "",
    hidden: false,
    position: 0,
  },
  prompts: {
    college: "",
    list: "lac",
    cycle: "2026-27",
    text: "",
    wordLimit: 0,
    limitNote: "",
    required: "required",
    archetype: "why-us",
    source: "",
    asOf: new Date().toISOString().slice(0, 10),
    position: 0,
  },
  toolValues: { label: "", hint: "", position: 0 },
  promptAngles: { archetype: "why-us", angle: "", position: 0 },
};
function node(tag, text, cls) {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (cls) n.className = cls;
  return n;
}
function button(text, fn, cls) {
  const b = node("button", text, cls);
  b.type = "button";
  b.onclick = () => Promise.resolve(fn()).catch(report);
  return b;
}
function report(e) {
  $("notice").textContent = e.message;
  $("notice").className = "error";
}
function notice(text) {
  $("notice").textContent = text;
  $("notice").className = "";
}
function showLogin() {
  $("boot").hidden = true;
  $("workspace").hidden = true;
  $("login").hidden = false;
}
const { api, whoAmI } = createApi({
  csrf: () => me?.csrf || "",
  onSignedOut: showLogin,
  onWaiting: () =>
    ($("boot").textContent =
      "Can't reach Scholars Cafe right now (the server may be restarting). Retrying…"),
});
async function refresh() {
  items = (await api("content")).items;
}
function field(form, key, value) {
  const label = node("label", key.replace(/[_-]/g, " "));
  const multi =
    Array.isArray(value) ||
    [
      "body",
      "bio",
      "description",
      "excerpt",
      "quote",
      "policyQuote",
      "nationalCurriculum",
      "intlNote",
      "costNote",
      "testNote",
      "englishNote",
      "deadlineNote",
      "earlyNote",
      "text",
      "angle",
    ].includes(key) ||
    String(value).length > 100;
  if (ENUMS[key]) {
    const select = node("select");
    for (const opt of ENUMS[key]) {
      const o = node("option", opt);
      o.value = opt;
      select.append(o);
    }
    // "broadcast" was renamed "podcast"; older entries open with the new name selected.
    select.value = key === "category" && value === "broadcast" ? "podcast" : value;
    select.id = "field-" + key;
    label.htmlFor = select.id;
    form.append(label, select);
    if (HELP[key]) form.append(node("small", HELP[key], "muted"));
    return () => select.value;
  }
  if (typeof value === "number") {
    const num = node("input");
    num.type = "number";
    num.step = key === "rate" ? "0.05" : "1";
    num.value = String(value);
    num.id = "field-" + key;
    label.htmlFor = num.id;
    form.append(label, num);
    if (HELP[key]) form.append(node("small", HELP[key], "muted"));
    return () => Number(num.value);
  }
  if (SUGGEST[key]) {
    // A real dropdown: the standard categories, any custom ones already in use, and "New category…".
    const legacy = { founder: "Founders", mentor: "Mentors" };
    const current = legacy[String(value || "").toLowerCase()] || String(value || "").trim();
    const used = items
      .filter((i) => i.kind === "team")
      .map(
        (i) =>
          legacy[String(i.data.group || "").toLowerCase()] || String(i.data.group || "").trim(),
      );
    const options = [...new Set([...SUGGEST[key], ...used, current].filter(Boolean))];
    const pick = node("select");
    for (const opt of [...options, "+ New category…"]) {
      const o = node("option", opt);
      o.value = opt;
      pick.append(o);
    }
    pick.value = current || options[0];
    pick.id = "field-" + key;
    label.htmlFor = pick.id;
    const custom = node("input");
    custom.maxLength = 60;
    custom.placeholder = "Category name, e.g. Advisors";
    custom.setAttribute("aria-label", "New category name");
    custom.hidden = true;
    pick.onchange = () => {
      custom.hidden = pick.value !== "+ New category…";
      if (!custom.hidden) custom.focus();
    };
    form.append(label, pick, custom);
    if (HELP[key]) form.append(node("small", HELP[key], "muted"));
    return () =>
      pick.value === "+ New category…" ? custom.value.trim() || current || "Team" : pick.value;
  }
  const input = node(typeof value === "boolean" ? "input" : multi ? "textarea" : "input");
  if (typeof value === "boolean") {
    input.type = "checkbox";
    input.checked = value;
  } else input.value = Array.isArray(value) ? value.join("\n") : value;
  if (key === "body") input.className = "body-field";
  if (["photo", "image", "linkedin", "instagram", "facebook", "source"].includes(key))
    input.type = "url";
  if (key === "email") input.type = "email";
  input.id = "field-" + key;
  label.htmlFor = input.id;
  form.append(label, input);
  if (HELP[key]) form.append(node("small", HELP[key], "muted"));
  if (/^(mp4|webm)$/.test(key) && canPublishRole(me.role)) {
    const file = node("input");
    file.type = "file";
    file.accept = key === "mp4" ? "video/mp4" : "video/webm";
    file.setAttribute("aria-label", "Upload video for " + key);
    file.onchange = async () => {
      if (!file.files[0]) return;
      file.disabled = true;
      try {
        input.value = (await upload(file.files[0])).url;
        notice("Video uploaded. Save the draft and publish to use it.");
      } catch (e) {
        report(e);
      } finally {
        file.disabled = false;
      }
    };
    form.append(
      file,
      node(
        "small",
        "Licensed footage only · " +
          key.toUpperCase() +
          " · maximum 12 MB · 1080p, 10–14 s, no audio",
        "muted",
      ),
    );
  }
  if (/(?:photo|image|mobileImage|logo|poster)$/i.test(key) && me.role !== "editor") {
    const file = node("input");
    file.type = "file";
    file.accept = "image/png,image/jpeg,image/webp";
    file.setAttribute("aria-label", "Upload image for " + key);
    file.onchange = async () => {
      if (!file.files[0]) return;
      file.disabled = true;
      try {
        input.value = (await upload(file.files[0])).url;
        notice("Image uploaded. Save the draft and publish to use it.");
      } catch (e) {
        report(e);
      } finally {
        file.disabled = false;
      }
    };
    form.append(
      file,
      node(
        "small",
        "Public images only · PNG, JPEG or WebP · maximum 5 MB / 16 megapixels",
        "muted",
      ),
    );
  }
  return () =>
    typeof value === "boolean"
      ? input.checked
      : Array.isArray(value)
        ? input.value
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : input.value;
}
function render() {
  $("heading").textContent = label(section);
  $("subtitle").textContent = ABOUT[section] || "";
  const screen = $("screen");
  screen.replaceChildren();
  for (const b of document.querySelectorAll("#nav button, #tabbar button"))
    b.classList.toggle("active", b.dataset.section === section);
  if ($("nav-more-list")?.querySelector("button.active")) setMoreOpen(true, false);
  // Gentle fade-in between screens (skipped when reduced motion is preferred, see style.css).
  screen.classList.remove("enter");
  void screen.offsetWidth;
  screen.classList.add("enter");
  window.scrollTo(0, 0);
  if (section === "Packages") {
    renderPackages().catch(report);
    return;
  }
  if (section === "Media") {
    renderMedia().catch(report);
    return;
  }
  if (section === "Overview") {
    const grid = node("div", undefined, "grid");
    for (const [kind, label] of Object.entries(names)) {
      const card = node("div", undefined, "card stat");
      card.append(
        node("p", label),
        node("strong", String(items.filter((i) => i.kind === kind).length)),
        button("Manage →", () => navigate(kind)),
      );
      grid.append(card);
    }
    screen.append(
      grid,
      node(
        "p",
        "Save drafts while you work. Owners and admins can publish when content is ready.",
        "muted",
      ),
    );
    return;
  }
  if (section === "Access") {
    renderAccess().catch(report);
    return;
  }
  if (section === "Activity") {
    if (!me.super_admin)
      return report(Error("The audit log is only available to the Super Admin."));
    renderAudit().catch(report);
    return;
  }
  if (section === "Mail") {
    renderContactMail().catch(report);
    return;
  }
  if (section === "Preview emails") {
    renderEmailPreviews().catch(report);
    return;
  }
  if (section === "Notifications") {
    renderNotifications().catch(report);
    return;
  }
  if (WORKSPACE[section]) {
    WORKSPACE[section]().catch(report);
    return;
  }
  if (section === "Leads") {
    renderLeads().catch(report);
    return;
  }
  if (section === "Account") {
    renderAccount();
    if (me.role === "student") renderMyDetails().catch(report);
    return;
  }
  if (section === "Home") {
    renderHome().catch(report);
    return;
  }
  if (section === "Resources") {
    renderMyResources().catch(report);
    return;
  }
  if (section === "Visual editor") {
    if (!me.visual)
      return report(Error("The visual editor is only available to the Super Admin account."));
    renderVisual();
    return;
  }
  if (section === "Forms") {
    renderForms().catch(report);
    return;
  }
  if (section === "Bookings") {
    renderBookings().catch(report);
    return;
  }
  if (section === "Documents") {
    renderDocuments().catch(report);
    return;
  }
  if (section === "Student resources") {
    renderStudentResources().catch(report);
    return;
  }
  if (section === "My courses") {
    renderMyCourses().catch(report);
    return;
  }
  if (section === "Messages") {
    (me.role === "student" ? renderThread(me.id) : renderThreads()).catch(report);
    return;
  }
  if (section === "Reviews") {
    renderReviews().catch(report);
    return;
  }
  if (section === "Student courses") {
    renderLmsCourses().catch(report);
    return;
  }
  if (section === "Students") {
    renderStudents().catch(report);
    return;
  }
  if (section === "Private feedback" || section === "Newsletter") {
    renderSubmissions().catch(report);
    return;
  }
  if (section === "Email delivery") {
    renderMail().catch(report);
    return;
  }
  if (section === "ECA alerts") {
    renderEcaAlerts().catch(report);
    return;
  }
  if (section === "Agreements") {
    import("./agreements-ui.js")
      .then((m) => m.renderAgreements({ api, node, button, input, select, notice, report, render }))
      .catch(report);
    return;
  }
  const bar = node("div", undefined, "toolbar");
  bar.append(node("p", "Manage " + names[section].toLowerCase()));
  if (section !== "copy")
    bar.append(
      button(
        "+ Add entry",
        () =>
          edit({
            id: crypto.randomUUID(),
            kind: section,
            title: "New entry",
            data: { ...defaults[section] },
            version: 0,
          }),
        "primary",
      ),
    );
  screen.append(bar);
  if (section === "copy") {
    const existingKeys = new Set(
      items.filter((i) => i.kind === "copy").flatMap((i) => Object.keys(i.data)),
    );
    const missing = Object.entries(catalog).filter(
      ([key]) => !existingKeys.has(key) && !isRetired(key),
    );
    const groups = [...new Set(missing.map(([key]) => key.split(".")[0]))];
    for (const group of groups)
      screen.append(
        button("Set up " + group + " fields", () =>
          edit({
            id: crypto.randomUUID(),
            kind: "copy",
            title: group + " additional fields",
            version: 0,
            data: Object.fromEntries(missing.filter(([key]) => key.split(".")[0] === group)),
          }),
        ),
      );
    screen.append(
      node(
        "p",
        "Existing published edits are preserved. New fields use the website defaults until you save and publish them. Images can be uploaded in image fields or from Media.",
        "muted",
      ),
    );
  }
  const pos = (i) => (typeof i.data.position === "number" ? i.data.position : 1e9);
  const list = items
    .filter((i) => i.kind === section)
    // A text entry whose every field is retired has nothing left that shows on the website.
    .filter((i) => i.kind !== "copy" || Object.keys(i.data).some((k) => !isRetired(k)))
    .sort((a, b) => pos(a) - pos(b) || a.title.localeCompare(b.title));
  const orderable =
    list.length > 1 && "position" in (defaults[section] || {}) && canPublishRole(me.role);
  if (!list.length)
    screen.append(
      node(
        "p",
        section === "copy"
          ? "Website text is imported during setup."
          : "No entries yet. Add your first one.",
        "empty",
      ),
    );
  list.forEach((item, index) => {
    const row = node("div", undefined, "card row");
    row.append(
      node("span", item.title),
      node("span", item.published ? "Published · may have a newer draft" : "Draft", "badge"),
    );
    if (section === "colleges" && staleCollege(item.data.asOf))
      row.append(node("span", "Stale: checked " + item.data.asOf, "badge"));
    if (orderable) {
      const up = button("↑", () => move(list, index, -1));
      const down = button("↓", () => move(list, index, 1));
      up.setAttribute("aria-label", "Move " + item.title + " up");
      down.setAttribute("aria-label", "Move " + item.title + " down");
      up.disabled = index === 0;
      down.disabled = index === list.length - 1;
      row.append(up, down);
    }
    if (section === "links") {
      const clicks = node("span", "", "muted");
      clicks.dataset.link = item.id;
      row.append(clicks);
    }
    row.append(button("Edit", () => edit(item)));
    screen.append(row);
  });
  if (section === "links" && list.length)
    api("links/clicks")
      .then(({ items: counts }) => {
        for (const el of screen.querySelectorAll("[data-link]")) {
          const c = counts.find((x) => x.link_id === el.dataset.link);
          el.textContent = `${Number(c?.last30 || 0)} clicks (30 days) · ${Number(c?.total || 0)} total`;
        }
      })
      .catch(() => {});
  if (section === "links")
    screen.append(
      node(
        "p",
        "The page is live at scholarscafe.com/links once at least one entry is published.",
        "muted",
      ),
    );
}
/** College figures older than 12 months (by their "as of" date) need a fresh check. */
function staleCollege(asOf) {
  const t = Date.parse(String(asOf || "") + "T00:00:00Z");
  if (!Number.isFinite(t)) return true;
  const limit = new Date();
  limit.setUTCFullYear(limit.getUTCFullYear() - 1);
  return t < limit.getTime();
}
/** Reorder: renumber the list (10, 20, 30…), save each changed entry and publish it. */
async function move(list, index, dir) {
  const order = [...list];
  const [item] = order.splice(index, 1);
  order.splice(index + dir, 0, item);
  for (const [i, entry] of order.entries()) {
    const position = (i + 1) * 10;
    if (entry.data.position === position) continue;
    await api("content", {
      id: entry.id,
      kind: entry.kind,
      title: entry.title,
      data: { ...entry.data, position },
      version: entry.version,
    });
    const saved = (await api("content")).items.find((x) => x.id === entry.id);
    if (entry.published)
      await api("content/" + encodeURIComponent(entry.id) + "/publish", { version: saved.version });
  }
  await refresh();
  render();
  notice("Order saved and published.");
}
function navigate(next) {
  // Like an app: a new section opens at the top of the page.
  if (next !== section) window.scrollTo({ top: 0 });
  section = next;
  clearSectionBadge(next);
  notice("");
  render();
}
function edit(item) {
  const screen = $("screen");
  screen.replaceChildren();
  const form = node("form", undefined, "card");
  screen.append(form);
  form.append(
    button("← Back", () => render()),
    node("h2", item.title),
  );
  const getters = {};
  const title = field(form, "Entry name", item.title);
  // Team entries saved before the LinkedIn/Instagram/Facebook fields existed still get those (empty) fields.
  const data = item.kind === "team" ? { ...defaults.team, ...item.data } : item.data;
  // Retired website text is not shown, but saving keeps its stored value as it was.
  const kept = {};
  for (const [key, value] of Object.entries(data))
    if (item.kind === "copy" && isRetired(key)) kept[key] = value;
    else getters[key] = field(form, key, value);
  const actions = node("div", undefined, "actions");
  const save = node("button", "Save draft", "primary");
  save.type = "submit";
  actions.append(save);
  if (item.version && me.role !== "editor")
    for (const action of ["publish", "unpublish"])
      actions.append(
        button(action === "publish" ? "Publish saved draft" : "Unpublish", async () => {
          await api("content/" + encodeURIComponent(item.id) + "/" + action, {
            version: item.version,
          });
          await refresh();
          render();
          notice(
            action === "publish"
              ? "Published. Your website will pick up the update."
              : "Unpublished.",
          );
        }),
      );
  actions.append(node("span", "Save your changes before publishing.", "muted"));
  form.append(actions);
  if (item.version && item.kind !== "copy" && canPublishRole(me.role))
    form.append(
      button(
        "Delete entry",
        async () => {
          if (
            !confirm(
              'Delete "' +
                item.title +
                '"? It disappears from the website. An owner can restore it from Activity.',
            )
          )
            return;
          await api("content/" + encodeURIComponent(item.id) + "/delete", {
            version: item.version,
          });
          await refresh();
          render();
          notice("Deleted.");
        },
        "danger",
      ),
    );
  if (item.version) {
    const history = node("details", undefined, "card");
    history.append(node("summary", "Version history"));
    history.ontoggle = async () => {
      if (!history.open || history.dataset.loaded) return;
      history.dataset.loaded = "1";
      const rows = (await api("content/" + encodeURIComponent(item.id) + "/revisions")).items;
      if (!rows.length) history.append(node("p", "No earlier versions yet.", "muted"));
      for (const r of rows) {
        const line = node("div", undefined, "row");
        line.append(
          node("span", new Date(r.created_at).toLocaleString() + " · " + (r.email || "unknown")),
          button("Restore as draft", async () => {
            await api("content/" + encodeURIComponent(item.id) + "/restore", {
              revision: r.id,
              version: item.version,
            });
            await refresh();
            edit(items.find((i) => i.id === item.id));
            notice("Earlier version restored as a draft. Review it, then publish.");
          }),
        );
        history.append(line);
      }
    };
    form.append(history);
  }
  form.onsubmit = async (e) => {
    e.preventDefault();
    save.disabled = true;
    try {
      await api("content", {
        id: item.id,
        kind: item.kind,
        title: title(),
        data: {
          ...kept,
          ...Object.fromEntries(Object.entries(getters).map(([k, get]) => [k, get()])),
        },
        version: item.version,
      });
      await refresh();
      edit(items.find((i) => i.id === item.id));
      notice("Draft saved.");
    } catch (err) {
      report(err);
    } finally {
      save.disabled = false;
    }
  };
}
async function upload(file, visibility = "public") {
  const video = file.type.startsWith("video/");
  if (file.size > (video ? 12 : 5) * 1024 * 1024)
    throw Error(
      video ? "Choose a video smaller than 12 MB." : "Choose an image smaller than 5 MB.",
    );
  const response = await fetch("/api/media", {
    method: "POST",
    headers: {
      "Content-Type": file.type,
      "X-CSRF-Token": me.csrf,
      "X-File-Name": file.name.replace(/[^a-zA-Z0-9._ -]/g, "_"),
      "X-Visibility": visibility,
    },
    body: file,
  });
  const result = await response.json();
  if (!response.ok) throw Error(result.error || "Upload failed.");
  return result;
}
// ---------- Student dashboard: staff screens ----------
function input(label, value = "", type = "text", max = 200) {
  const l = node("label", label);
  const el = type === "textarea" ? node("textarea") : node("input");
  if (type !== "textarea") el.type = type;
  el.value = value ?? "";
  el.maxLength = max;
  l.append(el);
  return [l, el];
}
function select(label, options, value) {
  const l = node("label", label);
  const el = node("select");
  for (const [v, t] of options) {
    const o = node("option", t);
    o.value = v;
    el.append(o);
  }
  // Without a preset value, keep the first option selected (an unmatched "" would show a blank box).
  if (value !== undefined) el.value = value ?? "";
  l.append(el);
  return [l, el];
}
async function renderLmsCourses(openId) {
  const screen = $("screen");
  const courses = (await api("lms/courses")).items;
  if (openId) return renderLmsCourse(courses.find((c) => c.id === openId));
  screen.append(
    node(
      "p",
      "Courses students take in their dashboard (separate from the public pricing list).",
      "muted",
    ),
    button("+ New course", () => renderLmsCourse(null), "primary"),
  );
  if (!courses.length) screen.append(node("p", "No courses yet.", "empty"));
  for (const c of courses) {
    const card = node("article", undefined, "card");
    card.append(
      node("h3", c.title),
      node("span", c.status, "badge"),
      node("p", `${c.lessons} lessons · ${c.students} students`, "muted"),
      button("Edit →", () => renderLmsCourse(c)),
    );
    screen.append(card);
  }
}
async function renderLmsCourse(course) {
  const screen = $("screen");
  screen.replaceChildren(button("← All courses", () => render()));
  const form = node("form", undefined, "card");
  const [tl, title] = input("Title", course?.title);
  const [sl, summary] = input("Summary", course?.summary, "textarea", 5000);
  const [stl, status] = select(
    "Status",
    [
      ["draft", "Draft (hidden from students)"],
      ["published", "Published"],
    ],
    course?.status || "draft",
  );
  const save = node("button", course ? "Save course" : "Create course", "primary");
  save.type = "submit";
  form.append(node("h2", course ? "Edit course" : "New course"), tl, sl, stl, save);
  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { title: title.value, summary: summary.value, status: status.value };
      const id = course
        ? (await api("lms/courses/" + course.id, body), course.id)
        : (await api("lms/courses", body)).id;
      notice("Course saved.");
      screen.replaceChildren();
      await renderLmsCourses(id);
    } catch (err) {
      report(err);
    }
  };
  screen.append(form);
  if (!course) return;
  form.append(
    button(
      "Delete course",
      async () => {
        if (!confirm("Delete this course? Students lose access at once.")) return;
        await api("lms/courses/" + course.id + "/delete", {});
        notice("Course deleted.");
        render();
      },
      "danger",
    ),
  );
  const lessons = (await api("lms/courses/" + course.id + "/lessons")).items;
  screen.append(
    node("h2", "Lessons"),
    node("p", "Videos are private: only students enrolled in this course can watch them.", "muted"),
  );
  for (const lesson of [...lessons, null])
    screen.append(lessonCard(course, lesson, lessons.length));
}
function lessonCard(course, lesson, count) {
  const card = node("form", undefined, lesson ? "card" : "card new");
  const [tl, title] = input("Lesson title", lesson?.title);
  const [bl, body] = input("Text / notes", lesson?.body, "textarea", 200000);
  const [pl, position] = input("Order", lesson?.position ?? (count + 1) * 10, "number");
  const pub = node("label", "Published");
  const published = node("input");
  published.type = "checkbox";
  published.checked = Boolean(lesson?.published);
  pub.prepend(published);
  // New uploads go to private disk storage (video_id); video_media_id is kept for older small uploads.
  let videoId = lesson?.video_id || null;
  let legacyId = lesson?.video_media_id || null;
  const attached = () =>
    videoId
      ? "Video: " + (lesson?.video_id === videoId ? lesson.video_name || "attached" : "new upload")
      : legacyId
        ? "Video attached (older upload)."
        : "No video.";
  const videoState = node("p", attached(), "muted");
  const file = videoFileInput(
    (state) => (videoState.textContent = state),
    (uploaded) => {
      videoId = uploaded.id;
      legacyId = null;
      videoState.textContent = "Uploaded " + uploaded.name + ". Save the lesson to attach it.";
    },
  );
  const remove = button("Remove video", () => {
    videoId = null;
    legacyId = null;
    videoState.textContent = "Video removed. Save the lesson to apply.";
  });
  const save = node("button", lesson ? "Save lesson" : "+ Add lesson", "primary");
  save.type = "submit";
  card.append(
    node("h3", lesson ? lesson.title : "New lesson"),
    tl,
    bl,
    pl,
    pub,
    videoState,
    file,
    remove,
    save,
  );
  if (lesson)
    card.append(
      button(
        "Delete lesson",
        async () => {
          if (!confirm("Delete this lesson and its progress records?")) return;
          await api("lms/lessons/" + lesson.id + "/delete", {});
          notice("Lesson deleted.");
          $("screen").replaceChildren();
          await renderLmsCourses(course.id);
        },
        "danger",
      ),
    );
  card.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api("lms/lessons" + (lesson ? "/" + lesson.id : ""), {
        course_id: course.id,
        title: title.value,
        body: body.value,
        position: Number(position.value) || 0,
        published: published.checked,
        video_media_id: legacyId,
        video_id: videoId,
      });
      notice("Lesson saved.");
      $("screen").replaceChildren();
      await renderLmsCourses(course.id);
    } catch (err) {
      report(err);
    }
  };
  return card;
}
async function renderStudents() {
  const screen = $("screen");
  const staff = canPublishRole(me.role);
  const [students, courses, mentors, pk] = await Promise.all([
    api("lms/students").then((r) => r.items),
    api("lms/courses").then((r) => r.items),
    staff ? api("mentors").then((r) => r.items) : [],
    staff ? api("packages") : { items: [], assigned: [] },
  ]);
  const mentorOptions = [["", "No mentor"], ...mentors.map((m) => [m.id, m.email])];
  const mentorName = (id) =>
    mentors.find((m) => m.id === id)?.email || (id ? "assigned mentor" : "no mentor");
  screen.append(
    node(
      "p",
      staff
        ? "Student accounts, their courses and mentors. Students sign in at student.scholarscafe.com (Google, an email code or a password)."
        : "Students assigned to you. You can keep notes.",
      "muted",
    ),
  );
  if (staff) {
    const add = node("form", undefined, "card");
    const [el, email] = input("Email", "", "email", 254);
    const [nl, name] = input("Full name", "", "text", 160);
    const [pl, phone] = input("Phone", "", "tel", 80);
    const [il, intake] = input("Target intake (e.g. Fall 2027)", "", "text", 40);
    const go = node("button", "Add student", "primary");
    go.type = "submit";
    add.append(node("h2", "Add a student"), el, nl, pl, il, go);
    add.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await api("lms/students", {
          email: email.value,
          full_name: name.value,
          phone: phone.value,
          target_intake: intake.value,
        });
        notice("Student added. They sign in at student.scholarscafe.com with this email.");
        render();
      } catch (err) {
        report(err);
      }
    };
    screen.append(add);
  }
  const search = node("input");
  search.type = "search";
  search.placeholder = "Search students";
  search.setAttribute("aria-label", "Search students");
  const list = node("div");
  screen.append(search, list);
  const draw = () => {
    const term = search.value.trim().toLowerCase();
    list.replaceChildren();
    const shown = students.filter(
      (s) => !term || `${s.full_name} ${s.email}`.toLowerCase().includes(term),
    );
    if (!shown.length) list.append(node("p", "No students yet.", "empty"));
    for (const s of shown) list.append(studentCard(s));
  };
  const studentCard = (s) => {
    const card = node("details", undefined, "card");
    card.append(
      node("summary", `${s.full_name || "(no name)"} · ${s.email}${s.active ? "" : " · inactive"}`),
    );
    const form = node("form");
    const fields = {};
    if (staff)
      for (const [key, label, max] of [
        ["full_name", "Full name", 160],
        ["phone", "Phone", 80],
        ["target_intake", "Target intake", 40],
      ]) {
        const [l, el] = input(label, s[key], "text", max);
        fields[key] = el;
        form.append(l);
      }
    const [nl, notes] = input(
      "Staff notes (never shown to the student)",
      s.staff_notes,
      "textarea",
      10000,
    );
    fields.staff_notes = notes;
    const save = node("button", "Save", "primary");
    save.type = "submit";
    form.append(nl, save);
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await api(
          "lms/students/" + s.id,
          Object.fromEntries(Object.entries(fields).map(([k, el]) => [k, el.value])),
        );
        notice("Saved.");
      } catch (err) {
        report(err);
      }
    };
    card.append(form);
    if (staff) card.append(...studentControls(s));
    card.append(node("h3", "Courses"));
    for (const en of s.enrollments) {
      const row = node("div", undefined, "toolbar");
      row.append(node("strong", en.title));
      if (staff) {
        const [, mentor] = select("Mentor", mentorOptions, en.mentor_id);
        const [, status] = select(
          "Status",
          [
            ["active", "Active"],
            ["paused", "Paused (locked)"],
            ["completed", "Completed"],
          ],
          en.status,
        );
        row.append(
          mentor,
          status,
          button("Save", async () => {
            await api("lms/enrollments", {
              user_id: s.id,
              course_id: en.course_id,
              mentor_id: mentor.value || null,
              status: status.value,
            });
            notice("Enrollment saved.");
          }),
          button(
            "Remove",
            async () => {
              if (!confirm("Remove this student from the course?")) return;
              await api("lms/enrollments/delete", { user_id: s.id, course_id: en.course_id });
              notice("Removed.");
              render();
            },
            "danger",
          ),
        );
      } else row.append(node("span", `${en.status} · ${mentorName(en.mentor_id)}`, "muted"));
      card.append(row);
    }
    if (!s.enrollments.length) card.append(node("p", "Not enrolled in any course.", "muted"));
    const open = courses.filter((c) => !s.enrollments.some((en) => en.course_id === c.id));
    if (staff && open.length) {
      const row = node("div", undefined, "toolbar");
      const [, course] = select(
        "Course",
        open.map((c) => [c.id, c.title + (c.status === "draft" ? " (draft)" : "")]),
      );
      const [, mentor] = select("Mentor", mentorOptions, "");
      row.append(
        course,
        mentor,
        button(
          "Enroll",
          async () => {
            await api("lms/enrollments", {
              user_id: s.id,
              course_id: course.value,
              mentor_id: mentor.value || null,
              status: "active",
            });
            notice("Enrolled.");
            render();
          },
          "primary",
        ),
      );
      card.append(row);
    }
    return card;
  };
  // Packages, one mentor for every course, and sign-in access (owner/admin).
  const studentControls = (s) => {
    const out = [node("h3", "Packages")];
    const mine = pk.assigned.filter((a) => a.user_id === s.id);
    for (const a of mine) {
      const p = pk.items.find((x) => x.id === a.package_id);
      const row = node("div", undefined, "toolbar");
      row.append(
        node("strong", p ? p.name : "Package"),
        node("span", "since " + new Date(a.granted_at).toLocaleDateString(), "muted"),
        button(
          "Remove",
          async () => {
            if (
              !confirm(
                "Remove this package? The student loses its courses unless another package includes them.",
              )
            )
              return;
            await api("packages/unassign", { user_id: s.id, package_id: a.package_id });
            notice("Package removed.");
            render();
          },
          "danger",
        ),
      );
      out.push(row);
    }
    if (!mine.length)
      out.push(node("p", "No package yet. Without one, the student sees nothing.", "muted"));
    const free = pk.items.filter((p) => p.active && !mine.some((a) => a.package_id === p.id));
    if (free.length) {
      const row = node("div", undefined, "toolbar");
      const [, choice] = select(
        "Package",
        free.map((p) => [p.id, p.name + (p.price ? " · " + p.price : "")]),
      );
      const [, mentor] = select("Mentor", mentorOptions, "");
      choice.setAttribute("aria-label", "Package to give");
      mentor.setAttribute("aria-label", "Mentor for this package's courses");
      row.append(
        choice,
        mentor,
        button(
          "Give package",
          async () => {
            await api("packages/assign", {
              user_id: s.id,
              package_id: choice.value,
              mentor_id: mentor.value || null,
            });
            notice("Package given. The student is now enrolled in its courses.");
            render();
          },
          "primary",
        ),
      );
      out.push(row);
    } else if (!pk.items.length)
      out.push(node("p", "Create packages on the Packages page first.", "muted"));
    const access = node("div", undefined, "toolbar");
    const [, mentorAll] = select("Mentor", mentorOptions, "");
    mentorAll.setAttribute("aria-label", "Mentor for all courses");
    access.append(
      node("span", "Mentor for all courses", "muted"),
      mentorAll,
      button("Apply", async () => {
        await api("students/" + s.id + "/mentor", { mentor_id: mentorAll.value || null });
        notice("Mentor updated on all of this student's courses.");
        render();
      }),
      button(
        s.active ? "Block sign-in" : "Allow sign-in",
        async () => {
          if (s.active && !confirm("Block this student? They are signed out everywhere.")) return;
          await api("students/" + s.id + "/access", { active: !s.active });
          notice(s.active ? "Sign-in blocked." : "Sign-in allowed.");
          render();
        },
        s.active ? "danger" : "primary",
      ),
    );
    out.push(node("h3", "Mentor and access"), access);
    return out;
  };
  search.oninput = draw;
  draw();
}
// ---------- Packages (owner/admin) ----------
const FEATURE_LABELS = {
  messaging: "Messaging with their mentor",
  uploads: "File uploads",
  reviews: "Reviews of their documents",
  live: "Live sessions",
};
async function renderPackages(openId) {
  const screen = $("screen");
  const [{ items: packages }, { items: courses }] = await Promise.all([
    api("packages"),
    api("lms/courses"),
  ]);
  if (openId !== undefined)
    return packageForm(
      packages.find((p) => p.id === openId) || {
        name: "",
        price: "",
        description: "",
        includes: [],
        features: {},
        active: true,
        position: (packages.length + 1) * 10,
        course_ids: [],
      },
      courses,
    );
  const bar = node("div", undefined, "toolbar");
  bar.append(
    node("p", packages.length + " package" + (packages.length === 1 ? "" : "s"), "muted"),
    button("+ New package", () => renderPackages(null), "primary"),
  );
  screen.append(bar);
  if (!packages.length)
    screen.append(
      node(
        "p",
        "No packages yet. Create one, then assign it to students from the Students page.",
        "empty",
      ),
    );
  for (const p of packages) {
    const row = node("div", undefined, "card row");
    const info = node("div");
    info.append(
      node("span", p.name, "row-title"),
      node(
        "p",
        [
          p.price || "No price set",
          p.course_ids.length + " course" + (p.course_ids.length === 1 ? "" : "s"),
          p.students + " student" + (p.students === 1 ? "" : "s"),
        ].join(" · "),
        "muted",
      ),
    );
    row.append(
      info,
      node("span", p.active ? "Active" : "Inactive", "badge"),
      button("Edit", () => {
        $("screen").replaceChildren();
        renderPackages(p.id).catch(report);
      }),
    );
    screen.append(row);
  }
}
function packageForm(p, courses) {
  const screen = $("screen");
  screen.replaceChildren();
  const form = node("form", undefined, "card");
  form.append(
    button("← Back", () => render()),
    node("h2", p.id ? p.name : "New package"),
  );
  const [nl, name] = input("Name (e.g. Fall 2027 cohort)", p.name, "text", 160);
  const [pl, price] = input("Price (as shown, e.g. ৳25,000)", p.price, "text", 80);
  const [dl, description] = input("Description", p.description, "textarea", 5000);
  const [il, includes] = input(
    "What's included (one item per line)",
    p.includes.join("\n"),
    "textarea",
    15000,
  );
  name.required = true;
  form.append(nl, pl, dl, il);
  const box = (text, checked, value) => {
    const l = node("label", undefined, "check");
    const c = node("input");
    c.type = "checkbox";
    c.checked = checked;
    c.value = value;
    l.append(c, document.createTextNode(" " + text));
    return [l, c];
  };
  const features = node("fieldset", undefined, "checks");
  features.append(node("legend", "Features this package turns on"));
  const featureBoxes = Object.entries(FEATURE_LABELS).map(([key, text]) => {
    const [l, c] = box(text, Boolean(p.features[key]), key);
    features.append(l);
    return c;
  });
  const courseSet = node("fieldset", undefined, "checks");
  courseSet.append(node("legend", "Courses students get (they are enrolled automatically)"));
  if (!courses.length)
    courseSet.append(node("p", "No courses yet. Add them in Courses & videos.", "muted"));
  const courseBoxes = courses.map((c) => {
    const [l, el] = box(
      c.title + (c.status === "draft" ? " (draft)" : ""),
      p.course_ids.includes(c.id),
      c.id,
    );
    courseSet.append(l);
    return el;
  });
  const [al, active] = box("Active (can be assigned to students)", p.active, "1");
  const [ol, position] = input("Order (lower numbers first)", String(p.position), "number", 6);
  form.append(features, courseSet, al, ol);
  const actions = node("div", undefined, "actions");
  const save = node("button", p.id ? "Save package" : "Create package", "primary");
  save.type = "submit";
  actions.append(save);
  if (p.id)
    actions.append(
      button(
        "Delete package",
        async () => {
          if (!confirm('Delete "' + p.name + '"?')) return;
          await api("packages/" + p.id + "/delete", {});
          render();
          notice("Package deleted.");
        },
        "danger",
      ),
    );
  if (p.id && p.students)
    actions.append(
      node(
        "span",
        `Changing the courses updates all ${p.students} student(s) who have this package.`,
        "muted",
      ),
    );
  form.append(actions);
  form.onsubmit = async (e) => {
    e.preventDefault();
    save.disabled = true;
    try {
      await api(p.id ? "packages/" + p.id : "packages", {
        name: name.value,
        price: price.value,
        description: description.value,
        includes: includes.value
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean),
        features: Object.fromEntries(featureBoxes.map((c) => [c.value, c.checked])),
        active: active.checked,
        position: Number(position.value) || 0,
        course_ids: courseBoxes.filter((c) => c.checked).map((c) => c.value),
      });
      render();
      notice("Package saved.");
    } catch (err) {
      report(err);
    } finally {
      save.disabled = false;
    }
  };
  screen.append(form);
}
// ---------- Private videos: chunked upload (staff) and the protected player ----------
const VIDEO_MAX = 2 * 1024 * 1024 * 1024;
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
/** Uploads in chunks; resumes from the server's byte count after a dropped connection. */
async function uploadVideo(file, progress) {
  if (!["video/mp4", "video/webm"].includes(file.type))
    throw Error("Choose an MP4 (H.264) or WebM video.");
  if (file.size > VIDEO_MAX) throw Error("Videos must be 2 GB or smaller.");
  const { id, chunk } = await api("videos", {
    name: file.name.slice(0, 200),
    size: file.size,
    mime: file.type,
  });
  let at = 0,
    failures = 0;
  while (at < file.size) {
    try {
      const r = await fetch("/api/videos/" + id + "/chunk", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Offset": String(at),
          "X-CSRF-Token": me.csrf,
        },
        body: file.slice(at, at + chunk),
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 409 && /Resume from byte (\d+)/.test(j.error || "")) {
        at = Number(/Resume from byte (\d+)/.exec(j.error)[1]);
        progress(at / file.size);
        continue;
      }
      if (!r.ok) throw Object.assign(Error(j.error || "Upload failed."), { final: r.status < 500 });
      at = j.received;
      failures = 0;
      progress(at / file.size);
    } catch (e) {
      if (e.final || ++failures > 5) throw e;
      await pause(2000 * failures);
    }
  }
  await api("videos/" + id + "/complete", {});
  return { id, name: file.name };
}
/** A file picker that uploads a video with a progress message. */
function videoFileInput(onState, onDone) {
  const file = node("input");
  file.type = "file";
  file.accept = "video/mp4,video/webm";
  file.setAttribute("aria-label", "Upload a video (MP4 or WebM, up to 2 GB)");
  file.onchange = async () => {
    if (!file.files[0]) return;
    file.disabled = true;
    const leave = (e) => e.preventDefault();
    window.addEventListener("beforeunload", leave);
    try {
      onState("Uploading… 0%");
      const done = await uploadVideo(file.files[0], (p) =>
        onState("Uploading… " + Math.floor(p * 100) + "% (keep this page open)"),
      );
      onDone(done);
    } catch (err) {
      onState("Upload failed.");
      report(err);
    } finally {
      window.removeEventListener("beforeunload", leave);
      file.disabled = false;
      file.value = "";
    }
  };
  return file;
}
/**
 * Protected player: short-lived link tied to this sign-in, no download button, a moving watermark with the
 * viewer's email (also in full screen), and resume for lessons. Expired links are renewed at the same second.
 */
function videoPlayer(playPath, lessonId) {
  const wrap = node("div", undefined, "player");
  const video = node("video");
  video.controls = true;
  video.preload = "metadata";
  video.playsInline = true;
  video.disablePictureInPicture = true;
  video.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
  video.setAttribute("disableRemotePlayback", "");
  video.oncontextmenu = (e) => e.preventDefault();
  const mark = node("div", undefined, "watermark");
  mark.setAttribute("aria-hidden", "true");
  const full = button("Full screen", () =>
    document.fullscreenElement ? document.exitFullscreen() : wrap.requestFullscreen?.(),
  );
  full.className = "player-full";
  wrap.append(video, mark, full);
  // Full screen on the wrapper (not the video) so the watermark stays visible.
  video.ondblclick = (e) => {
    e.preventDefault();
    full.click();
  };
  let retried = false,
    lastSaved = 0;
  const load = async (resumeAt) => {
    const link = await api(playPath);
    mark.textContent = link.watermark;
    video.onloadedmetadata = () => {
      const at = resumeAt ?? link.position;
      if (at > 5 && at < video.duration - 10) video.currentTime = at;
    };
    video.src = link.url;
  };
  video.onplaying = () => (retried = false);
  video.onerror = async () => {
    if (retried)
      return report(Error("This video can't play right now. Your access may have changed."));
    retried = true;
    const at = video.currentTime;
    try {
      await load(at);
      await video.play().catch(() => {});
    } catch (err) {
      report(err);
    }
  };
  const save = () => {
    if (!lessonId || !video.duration || me.role !== "student") return;
    lastSaved = Date.now();
    api("lms/my/position", {
      lesson_id: lessonId,
      seconds: video.currentTime,
      duration: video.duration,
    }).catch(() => {});
  };
  video.ontimeupdate = () => Date.now() - lastSaved > 15000 && !video.paused && save();
  video.onpause = save;
  video.onended = save;
  const move = setInterval(() => {
    if (!wrap.isConnected) return clearInterval(move);
    mark.style.left = 4 + Math.random() * 56 + "%";
    mark.style.top = 6 + Math.random() * 74 + "%";
  }, 7000);
  load().catch(report);
  return wrap;
}

// ---------- Student portal: Home and Resources ----------
const TYPE_LABELS = {
  live: "Live session",
  video: "Video",
  guide: "Guide",
  link: "Link",
  announcement: "Announcement",
};
const dateTime = (t) =>
  new Date(String(t).replace(" ", "T") + (/Z|[+-]\d\d:?\d\d$/.test(t) ? "" : "Z")).toLocaleString(
    undefined,
    { dateStyle: "medium", timeStyle: "short" },
  );
function openLink(url, text) {
  const a = node("a", text, "button-link");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}
function openCourse(courseId, lessonId) {
  section = "My courses";
  for (const b of document.querySelectorAll("#nav button, #tabbar button"))
    b.classList.toggle("active", b.dataset.section === section);
  $("subtitle").textContent = "";
  $("screen").replaceChildren();
  renderMyCourse(courseId, lessonId).catch(report);
}
async function renderHome() {
  const h = await api("lms/my/home");
  const first = h.name.trim().split(/\s+/)[0];
  $("heading").textContent = first ? "Hi, " + first : "Welcome";
  const screen = $("screen");
  const grid = node("div", undefined, "home-grid");
  const card = (title) => {
    const c = node("section", undefined, "card home-card");
    c.append(node("p", title, "eyebrow"));
    grid.append(c);
    return c;
  };
  const cont = card("CONTINUE LEARNING");
  if (h.next) {
    cont.append(node("h3", h.next.title), node("p", h.next.course, "muted"));
    if (h.next.duration) {
      const bar = node("progress");
      bar.max = h.next.duration;
      bar.value = h.next.seconds;
      bar.setAttribute("aria-label", "Watched so far");
      cont.append(bar);
    }
    cont.append(
      button(
        h.next.seconds ? "Resume →" : "Start →",
        () => openCourse(h.next.course_id, h.next.lesson_id),
        "primary",
      ),
    );
  } else
    cont.append(
      node(
        "p",
        h.packages.length
          ? "No lessons yet. They'll appear here as soon as they're published."
          : "Your courses appear here once you have a package.",
        "muted",
      ),
    );
  const pk = card(h.packages.length > 1 ? "MY PACKAGES" : "MY PACKAGE");
  if (!h.packages.length)
    pk.append(
      node("p", "You don't have a package yet.", ""),
      node(
        "p",
        "When you enrol, we'll add it here and your courses and resources unlock automatically.",
        "muted",
      ),
    );
  for (const p of h.packages) {
    pk.append(node("h3", p.name));
    if (p.includes.length) {
      const ul = node("ul", undefined, "ticks");
      for (const i of p.includes) ul.append(node("li", i));
      pk.append(ul);
    }
  }
  const mentor = card(h.mentors.length > 1 ? "MY MENTORS" : "MY MENTOR");
  if (!h.mentors.length) mentor.append(node("p", "Your mentor will be assigned soon.", "muted"));
  for (const m of h.mentors) mentor.append(node("p", m));
  if (h.mentors.length && myFeatures.messaging)
    mentor.append(button("Send a message", () => navigate("Messages")));
  if (h.live.length) {
    const live = card("UPCOMING LIVE SESSIONS");
    for (const r of h.live) {
      const row = node("div", undefined, "row");
      const info = node("div");
      info.append(node("span", r.title, "row-title"), node("p", dateTime(r.starts_at), "muted"));
      row.append(info);
      if (r.url) row.append(openLink(r.url, "Join ↗"));
      live.append(row);
    }
  }
  screen.append(grid);
  const news = node("section", undefined, "card");
  news.append(node("p", "ANNOUNCEMENTS", "eyebrow"));
  if (!h.announcements.length) news.append(node("p", "No announcements yet.", "muted"));
  for (const a of h.announcements) {
    const item = node("article", undefined, "announcement");
    item.append(
      node("h3", (a.pinned ? "📌 " : "") + a.title),
      node("p", dateTime(a.created_at), "muted"),
    );
    if (a.body) item.append(node("p", a.body, "pre-line"));
    if (a.url) item.append(openLink(a.url, "Open ↗"));
    news.append(item);
  }
  screen.append(news);
}
async function renderMyResources() {
  const screen = $("screen");
  const [{ items }, { items: courses }] = await Promise.all([
    api("lms/my/resources"),
    api("lms/my/courses"),
  ]);
  if (courses.length) {
    const box = node("section", undefined, "card");
    box.append(node("p", "ONGOING COURSES", "eyebrow"));
    for (const c of courses) {
      const row = node("div", undefined, "row");
      const info = node("div");
      info.append(
        node("span", c.title, "row-title"),
        node("p", `${c.done} of ${c.lessons} lessons done`, "muted"),
      );
      row.append(
        info,
        button("Open →", () => openCourse(c.id)),
      );
      box.append(row);
    }
    screen.append(box);
  }
  const bar = node("div", undefined, "toolbar filters");
  const types = ["all", ...new Set(items.map((r) => r.type))];
  let type = "all";
  const chips = node("div", undefined, "chips");
  chips.setAttribute("role", "group");
  chips.setAttribute("aria-label", "Filter by type");
  for (const t of types) {
    const b = button(t === "all" ? "All" : TYPE_LABELS[t] + "s", () => {
      type = t;
      for (const x of chips.children) x.setAttribute("aria-pressed", String(x === b));
      draw();
    });
    b.setAttribute("aria-pressed", String(t === "all"));
    chips.append(b);
  }
  const countries = [...new Set(items.map((r) => r.country).filter(Boolean))].sort();
  const [, country] = select("Country", [["", "All countries"], ...countries.map((c) => [c, c])]);
  country.setAttribute("aria-label", "Filter by country");
  const search = node("input");
  search.type = "search";
  search.placeholder = "Search title or tag";
  search.setAttribute("aria-label", "Search resources");
  bar.append(chips);
  if (countries.length) bar.append(country);
  bar.append(search);
  const list = node("div");
  if (items.length) screen.append(bar);
  screen.append(list);
  const draw = () => {
    const term = search.value.trim().toLowerCase();
    const shown = items.filter(
      (r) =>
        (type === "all" || r.type === type) &&
        (!country.value || r.country === country.value) &&
        (!term || (r.title + " " + r.tags).toLowerCase().includes(term)),
    );
    list.replaceChildren();
    if (!shown.length)
      list.append(
        node(
          "p",
          items.length
            ? "Nothing matches these filters."
            : "No resources yet. Live sessions, videos and guides from your package will appear here.",
          "empty",
        ),
      );
    for (const r of shown) {
      const c = node("article", undefined, "card resource");
      const meta = [TYPE_LABELS[r.type]];
      if (r.starts_at) meta.push(dateTime(r.starts_at));
      if (r.country) meta.push(r.country);
      c.append(node("p", meta.join(" · "), "eyebrow"), node("h3", r.title));
      if (r.body) c.append(node("p", r.body, "pre-line muted"));
      if (r.tags) {
        const tags = node("p", undefined, "tags");
        for (const t of r.tags.split(",")) tags.append(node("span", "#" + t, "badge"));
        c.append(tags);
      }
      if (r.has_video) {
        const play = button(
          "▶ Play video",
          () => {
            play.replaceWith(videoPlayer("lms/resources/" + r.id + "/play"));
          },
          "primary",
        );
        c.append(play);
      }
      if (r.url) c.append(openLink(r.url, r.type === "live" ? "Join ↗" : "Open ↗"));
      list.append(c);
    }
  };
  for (const el of [country, search]) el.oninput = draw;
  draw();
}

// ---------- Admin: student resources, announcements and the video library ----------
async function renderStudentResources(openId) {
  const screen = $("screen");
  const [{ items }, { items: packages }, { items: videos }] = await Promise.all([
    api("resources"),
    api("packages"),
    api("videos"),
  ]);
  if (openId !== undefined)
    return resourceForm(
      items.find((r) => r.id === openId) || {
        type: "announcement",
        title: "",
        body: "",
        url: "",
        video_id: null,
        tags: "",
        country: "",
        starts_at: null,
        published: false,
        pinned: false,
        package_ids: [],
      },
      packages,
      videos,
    );
  const bar = node("div", undefined, "toolbar");
  bar.append(
    node("p", items.length + " item" + (items.length === 1 ? "" : "s"), "muted"),
    button(
      "+ New",
      () => {
        screen.replaceChildren();
        renderStudentResources(null).catch(report);
      },
      "primary",
    ),
  );
  screen.append(bar);
  if (!items.length)
    screen.append(
      node(
        "p",
        "Nothing yet. Add an announcement, a live-session link, a guide or an exclusive video.",
        "empty",
      ),
    );
  const pkName = (id) => packages.find((p) => p.id === id)?.name || "removed package";
  for (const r of items) {
    const row = node("div", undefined, "card row");
    const info = node("div");
    info.append(
      node("span", (r.pinned ? "📌 " : "") + r.title, "row-title"),
      node(
        "p",
        [
          TYPE_LABELS[r.type],
          r.package_ids.length
            ? r.package_ids.map(pkName).join(", ")
            : "Every student with a package",
        ].join(" · "),
        "muted",
      ),
    );
    row.append(
      info,
      node("span", r.published ? "Published" : "Draft", "badge"),
      button("Edit", () => {
        screen.replaceChildren();
        renderStudentResources(r.id).catch(report);
      }),
    );
    screen.append(row);
  }
  // Video library: delete videos nothing uses any more (frees disk space).
  const lib = node("details", undefined, "card");
  lib.append(node("summary", `Video library (${videos.length})`));
  const total = videos.reduce((n, v) => n + Number(v.size), 0);
  lib.append(node("p", (total / 1024 ** 3).toFixed(2) + " GB of 30 GB used.", "muted"));
  for (const v of videos) {
    const row = node("div", undefined, "row");
    row.append(
      node("span", v.name + " · " + (Number(v.size) / 1024 ** 2).toFixed(0) + " MB"),
      button(
        "Delete",
        async () => {
          if (!confirm("Delete " + v.name + "? This can't be undone.")) return;
          await api("videos/" + v.id + "/delete", {});
          notice("Video deleted.");
          render();
        },
        "danger",
      ),
    );
    lib.append(row);
  }
  screen.append(lib);
}
function resourceForm(r, packages, videos) {
  const screen = $("screen");
  screen.replaceChildren();
  const form = node("form", undefined, "card");
  form.append(
    button("← Back", () => render()),
    node("h2", r.id ? r.title : "New resource or announcement"),
  );
  const [yl, type] = select(
    "Type",
    Object.entries(TYPE_LABELS).map(([k, v]) => [k, v]),
    r.type,
  );
  const [tl, title] = input("Title", r.title, "text", 200);
  title.required = true;
  const [bl, body] = input("Text", r.body || "", "textarea", 20000);
  const [ul, url] = input(
    "Link (https://…, e.g. Google Meet or Facebook Live)",
    r.url,
    "url",
    2000,
  );
  const [sl, starts] = input("Starts at (live sessions)", "", "datetime-local", 20);
  if (r.starts_at) {
    const d = new Date(
      String(r.starts_at).replace(" ", "T") + (String(r.starts_at).endsWith("Z") ? "" : "Z"),
    );
    starts.value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
  const [gl, tags] = input("Tags (comma separated, e.g. sop, scholarships)", r.tags, "text", 300);
  const [cl, country] = input("Country (e.g. USA, UK)", r.country, "text", 80);
  let videoId = r.video_id;
  const [vl, picker] = select(
    "Video",
    [["", "No video"], ...videos.map((v) => [v.id, v.name])],
    videoId || "",
  );
  picker.onchange = () => (videoId = picker.value || null);
  const videoState = node("p", "", "muted");
  const file = videoFileInput(
    (s) => (videoState.textContent = s),
    (v) => {
      const o = node("option", v.name);
      o.value = v.id;
      picker.append(o);
      picker.value = videoId = v.id;
      videoState.textContent = "Uploaded. Save to attach it.";
    },
  );
  const audience = node("fieldset", undefined, "checks");
  audience.append(
    node("legend", "Who sees it"),
    node(
      "p",
      "Tick packages to limit it. Leave all unticked for every student with a package.",
      "muted",
    ),
  );
  const boxes = packages.map((p) => {
    const l = node("label", undefined, "check");
    const c = node("input");
    c.type = "checkbox";
    c.value = p.id;
    c.checked = r.package_ids.includes(p.id);
    l.append(c, document.createTextNode(" " + p.name + (p.active ? "" : " (inactive)")));
    audience.append(l);
    return c;
  });
  if (!packages.length) audience.append(node("p", "No packages yet.", "muted"));
  const flag = (text, value) => {
    const l = node("label", undefined, "check");
    const c = node("input");
    c.type = "checkbox";
    c.checked = value;
    l.append(c, document.createTextNode(" " + text));
    return [l, c];
  };
  const [pl, published] = flag("Published (visible to students)", r.published);
  const [nl, pinned] = flag("Pinned to the top", r.pinned);
  form.append(yl, tl, bl, ul, sl, gl, cl, vl, file, videoState, audience, pl, nl);
  const actions = node("div", undefined, "actions");
  const save = node("button", "Save", "primary");
  save.type = "submit";
  actions.append(save);
  if (r.id)
    actions.append(
      button(
        "Delete",
        async () => {
          if (!confirm('Delete "' + r.title + '"?')) return;
          await api("resources/" + r.id + "/delete", {});
          render();
          notice("Deleted.");
        },
        "danger",
      ),
    );
  form.append(actions);
  form.onsubmit = async (e) => {
    e.preventDefault();
    save.disabled = true;
    try {
      await api(r.id ? "resources/" + r.id : "resources", {
        type: type.value,
        title: title.value,
        body: body.value,
        url: url.value.trim(),
        video_id: videoId,
        tags: tags.value,
        country: country.value,
        starts_at: starts.value ? new Date(starts.value).toISOString() : null,
        published: published.checked,
        pinned: pinned.checked,
        package_ids: boxes.filter((c) => c.checked).map((c) => c.value),
      });
      render();
      notice("Saved.");
    } catch (err) {
      report(err);
    } finally {
      save.disabled = false;
    }
  };
  screen.append(form);
}
// ---------- Documents: submit (students), review with comments and status (mentors and staff) ----------
const DOC_KINDS = {
  essay: "Essay",
  sop: "Statement of purpose",
  cv: "CV / résumé",
  transcript: "Transcript",
  lor: "Recommendation letter",
  other: "Other",
};
const DOC_STATUS = {
  shared: "Shared with the team",
  submitted: "Waiting for review",
  in_review: "In review",
  changes_requested: "Changes requested",
  approved: "Approved",
};
let myFeatures = {};
let leadsForm = "";
async function renderDocuments() {
  const screen = $("screen");
  const student = me.role === "student";
  const [fl, filter] = student
    ? [null, null]
    : select("Show", [["", "All"], ...Object.entries(DOC_STATUS)], "submitted");
  const list = node("div");
  if (student) {
    const add = node("form", undefined, "card");
    const [tl, title] = input("Title (e.g. SOP for University of Toronto)", "", "text", 200);
    title.required = true;
    const [kl, kind] = select("Type", Object.entries(DOC_KINDS), "sop");
    const [nl, note] = input("Note for your mentor (optional)", "", "textarea", 5000);
    const picker = filePicker(me.id, "document", "Document file");
    const options = [];
    if (myFeatures.reviews) options.push(["review", "Ask my mentor to review it"]);
    if (myFeatures.uploads) options.push(["share", "Just share it with the team"]);
    const [ml, mode] = select("What should we do with it?", options, options[0]?.[0]);
    const go = node("button", "Submit", "primary");
    go.type = "submit";
    add.append(node("h2", "Submit a document"), tl, kl, picker, nl);
    if (options.length > 1) add.append(ml);
    add.append(go);
    add.onsubmit = async (e) => {
      e.preventDefault();
      if (!picker.uploaded) return report(Error("Choose a file and wait for it to upload."));
      go.disabled = true;
      try {
        await api("lms/documents", {
          title: title.value,
          kind: kind.value,
          file_id: picker.uploaded.id,
          note: note.value,
          review: mode.value === "review",
        });
        notice(
          mode.value === "review"
            ? "Submitted. Your mentor will review it and reply here."
            : "Shared with the team.",
        );
        render();
      } catch (err) {
        report(err);
      } finally {
        go.disabled = false;
      }
    };
    screen.append(add);
  } else screen.append(fl);
  screen.append(list);
  const load = async () => {
    const items = (await api("lms/documents" + (filter?.value ? "?status=" + filter.value : "")))
      .items;
    list.replaceChildren();
    if (!items.length)
      list.append(
        node("p", student ? "You haven't submitted anything yet." : "Nothing here.", "empty"),
      );
    for (const d of items) {
      const row = node("div", undefined, "card row");
      const info = node("div");
      info.append(
        node("span", d.title, "row-title"),
        node(
          "p",
          [
            DOC_KINDS[d.kind],
            ...(student ? [] : [d.full_name || d.email]),
            "updated " + when(d.updated_at || d.created_at),
            d.comments + " comment" + (Number(d.comments) === 1 ? "" : "s"),
          ].join(" · "),
          "muted",
        ),
      );
      row.append(
        info,
        node("span", DOC_STATUS[d.status], "badge status-" + d.status),
        button("Open", () => renderDocument(d.id)),
      );
      list.append(row);
    }
  };
  if (filter) filter.onchange = () => load().catch(report);
  await load();
}
async function renderDocument(docId) {
  const screen = $("screen");
  const { document: d, comments } = await api("lms/documents/" + docId);
  const student = me.role === "student";
  screen.replaceChildren(button("← Documents", () => render()));
  $("heading").textContent = d.title;
  const head = node("section", undefined, "card");
  head.append(
    node("p", DOC_KINDS[d.kind] + " · submitted " + when(d.created_at), "eyebrow"),
    node("span", DOC_STATUS[d.status], "badge status-" + d.status),
  );
  if (d.file) head.append(node("p"), fileChip(d.file.id, d.file.name));
  if (d.note) head.append(node("p", d.note, "pre-line"));
  screen.append(head);
  const thread = node("div", undefined, "thread");
  for (const k of comments) {
    const who = k.mine
      ? "You"
      : k.author_role === "student"
        ? "Student"
        : student
          ? k.author_role === "mentor"
            ? "Your mentor"
            : "Scholars Cafe team"
          : k.author_email || "Staff";
    const bubble = node("article", undefined, "message" + (k.mine ? " mine" : ""));
    bubble.append(node("p", `${who} · ${when(k.created_at)}`, "muted"));
    if (k.status) bubble.append(node("span", "→ " + (DOC_STATUS[k.status] || k.status), "badge"));
    if (k.body) bubble.append(node("p", k.body, "lesson-body"));
    if (k.file_id) bubble.append(fileChip(k.file_id, k.file_name));
    thread.append(bubble);
  }
  if (!comments.length)
    thread.append(
      node(
        "p",
        student ? "No feedback yet. Your mentor will reply here." : "No comments yet.",
        "empty",
      ),
    );
  screen.append(thread);
  const form = node("form", undefined, "card");
  const [cl, body] = input(
    student ? "Reply or explain your changes" : "Feedback",
    "",
    "textarea",
    10000,
  );
  const picker = filePicker(
    d.student_id,
    "document",
    student ? "New version" : "Marked-up file (optional)",
  );
  form.append(node("h3", student ? "Reply or send a new version" : "Review"), cl, picker);
  let status = null;
  if (!student) {
    [, status] = select(
      "Set status",
      [
        ["", "Keep: " + DOC_STATUS[d.status]],
        ["in_review", DOC_STATUS.in_review],
        ["changes_requested", DOC_STATUS.changes_requested],
        ["approved", DOC_STATUS.approved],
      ],
      "",
    );
    status.setAttribute("aria-label", "Set status");
    form.append(status);
  }
  const send = node("button", "Send", "primary");
  send.type = "submit";
  form.append(send);
  if (student && d.status !== "shared")
    form.append(node("p", "Sending a new version puts it back in the review queue.", "muted"));
  form.onsubmit = async (e) => {
    e.preventDefault();
    send.disabled = true;
    try {
      await api("lms/documents/" + docId + "/comments", {
        body: body.value,
        file_id: picker.uploaded?.id || null,
        status: status?.value || null,
      });
      notice("Sent.");
      await renderDocument(docId);
    } catch (err) {
      report(err);
    } finally {
      send.disabled = false;
    }
  };
  screen.append(form);
}
// ---------- Form builder (owner/admin): fields, required, validation, conditions, steps ----------
const FIELD_TYPES = {
  text: "Short text",
  textarea: "Long text",
  email: "Email",
  phone: "Phone",
  number: "Number",
  date: "Date",
  url: "Link (https)",
  select: "Dropdown",
  radio: "Single choice",
  checkbox: "Checkboxes (pick several)",
  consent: "Consent checkbox",
  time: "Time",
  file: "File upload",
  info: "Text block / section heading",
};
// The "add a question" buttons, in the order people reach for them (like Google Forms).
const ADD_BUTTONS = [
  ["text", "Short answer"],
  ["textarea", "Paragraph"],
  ["radio", "Multiple choice"],
  ["checkbox", "Checkboxes"],
  ["select", "Dropdown"],
  ["file", "File upload"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["number", "Number"],
  ["date", "Date"],
  ["time", "Time"],
  ["url", "Link"],
  ["consent", "Consent"],
  ["info", "Text / heading"],
];
const CHOICE_TYPES = ["select", "radio", "checkbox"];
const slugify = (s, max = 40) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^(\d)/, "f_$1")
    .slice(0, max) || "field";
async function renderForms(openId) {
  const screen = $("screen");
  const { items, template, templates = [] } = await api("forms");
  if (typeof openId === "string" && openId.startsWith("tpl:")) {
    const t = templates.find((x) => "tpl:" + x.slug === openId);
    if (t) return formBuilder(structuredClone(t));
  }
  if (openId !== undefined) {
    const blank = {
      slug: "",
      title: "",
      intro: "",
      success: "Thank you! We'll get back to you within 24 hours.",
      published: false,
      notify: true,
      cover: "site:campus-early-fall",
      definition: {
        steps: [
          {
            title: "",
            fields: [
              { id: "name", label: "Full name", type: "text", required: true, role: "name" },
            ],
          },
        ],
      },
    };
    return formBuilder(
      openId === "template"
        ? structuredClone(template)
        : items.find((f) => f.id === openId) || blank,
    );
  }
  const bar = node("div", undefined, "toolbar");
  bar.append(node("span"), node("span"));
  bar.lastChild.append(
    button("Start from the contact form", () => renderFormsOpen("template")),
    button("+ New form", () => renderFormsOpen(null), "primary"),
  );
  screen.append(bar);
  if (!items.length)
    screen.append(
      node(
        "p",
        "No forms yet. Start from the website's contact form, or build one from scratch.",
        "empty",
      ),
    );
  // Live forms first, then drafts. Each card: name, its own link (open or copy), responses, edit.
  const sorted = [...items].sort((x, y) => Number(y.published) - Number(x.published));
  const list = node("div", undefined, "form-cards");
  for (const f of sorted) {
    const url = "https://scholarscafe.com/forms/" + f.slug;
    const card = node("div", undefined, "card form-card");
    const top = node("div", undefined, "form-card-top");
    top.append(
      node("span", f.published ? "Live" : "Draft", "pill " + (f.published ? "live" : "draft")),
      node(
        "span",
        f.submissions
          ? `${f.submissions} response${f.submissions === 1 ? "" : "s"}${f.unread ? ` · ${f.unread} new` : ""}`
          : "No responses yet",
        "muted",
      ),
    );
    const title = node("h3", f.title.replace(/^Scholars Cafe\s+/i, ""));
    const link = node("div", undefined, "form-link");
    const a = node("a", "/forms/" + f.slug);
    a.title = url;
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    const copy = button("Copy link", async () => {
      await navigator.clipboard.writeText(url);
      copy.textContent = "Copied";
      setTimeout(() => (copy.textContent = "Copy link"), 1500);
    });
    link.append(a, copy);
    if (!f.published)
      link.append(node("span", "Not open to the public until you publish it.", "muted"));
    const actions = node("div", undefined, "actions");
    actions.append(
      button("See responses", () => renderResponses(f).catch(report), "primary"),
      button("Edit", () => renderFormsOpen(f.id)),
    );
    card.append(top, title, link, actions);
    list.append(card);
  }
  screen.append(list);
  // The forms that used to be Google Forms, ready to use (each opens as a draft to check, then publish).
  const used = new Set(items.map((f) => f.slug));
  const ready = templates.filter((t) => !used.has(t.slug));
  if (ready.length) {
    screen.append(
      node("h3", "Ready-made forms (from your Google Forms)"),
      node(
        "p",
        "Same questions, choices and introductions as the Google Forms. Open one, check it, tick Published and save.",
        "muted",
      ),
    );
    for (const t of ready) {
      const row = node("div", undefined, "card row");
      const info = node("div");
      const count = t.definition.steps.flatMap((s) => s.fields).filter((x) => x.type !== "info");
      info.append(
        node("span", t.title, "row-title"),
        node("p", `scholarscafe.com/forms/${t.slug} · ${count.length} questions`, "muted"),
      );
      row.append(
        info,
        button("Use this form", () => renderFormsOpen("tpl:" + t.slug), "primary"),
      );
      screen.append(row);
    }
  }
}
// ---------- Bookings: 1-on-1 mentor sessions (scholarscafe.com/book), one per day ----------
const BOOKING_WEEKDAYS = [
  [6, "Saturday"],
  [0, "Sunday"],
  [1, "Monday"],
  [2, "Tuesday"],
  [3, "Wednesday"],
  [4, "Thursday"],
  [5, "Friday"],
];
async function renderBookings() {
  const screen = $("screen");
  const { items, settings } = await api("booking");
  const upcoming = items.filter((b) => b.upcoming);
  const bar = node("div", undefined, "toolbar");
  const link = node("a", "scholarscafe.com/book");
  link.href = "https://scholarscafe.com/book";
  link.target = "_blank";
  link.rel = "noopener";
  const lead = node(
    "p",
    upcoming.length ? `${upcoming.length} upcoming · ` : "No upcoming sessions · ",
  );
  lead.append(link);
  bar.append(lead);
  screen.append(bar);
  if (!settings.link)
    screen.append(
      node(
        "p",
        "No meeting link yet. Add your Google Meet link under “When people can book” so it goes into every confirmation.",
        "card",
      ),
    );
  const list = node("div", undefined, "form-cards");
  for (const b of items) {
    const card = node("div", undefined, "card form-card");
    const top = node("div", undefined, "form-card-top");
    const state = b.upcoming ? "Upcoming" : b.status === "cancelled" ? "Cancelled" : "Past";
    top.append(
      node(
        "span",
        state,
        "pill " + (b.upcoming ? "live" : b.status === "cancelled" ? "closed" : "draft"),
      ),
      node("span", b.reminded_at ? "Reminder sent" : "", "muted"),
    );
    const email = node("a", b.email);
    email.href = "mailto:" + b.email;
    const who = node("p");
    who.append(
      document.createTextNode(b.name + " · "),
      email,
      document.createTextNode(b.phone ? " · " + b.phone : ""),
    );
    card.append(top, node("h3", b.when), who, node("p", b.topic, "muted booking-topic"));
    if (b.upcoming) {
      const actions = node("div", undefined, "actions");
      actions.append(
        button(
          "Cancel booking",
          async () => {
            if (
              !confirm(
                `Cancel ${b.name}'s session on ${b.when}? They will get an email, and the day opens again.`,
              )
            )
              return;
            await api("booking/" + b.id + "/cancel", {});
            render();
            notice("Booking cancelled. " + b.name + " will get an email.");
          },
          "danger",
        ),
      );
      card.append(actions);
    }
    list.append(card);
  }
  if (!items.length) screen.append(node("p", "No bookings yet.", "empty"));
  screen.append(list, bookingSettingsForm(settings));
}
function bookingSettingsForm(s) {
  const wrap = node("details", undefined, "card");
  wrap.open = !s.link;
  wrap.append(node("summary", "When people can book"));
  const form = node("form");
  form.append(
    node(
      "p",
      "All times are Bangladesh time. Only one session can be booked per day; once a day is booked it disappears from the website.",
      "muted",
    ),
  );
  const days = node("fieldset", undefined, "checks");
  days.append(node("legend", "Open days"));
  const dayBoxes = BOOKING_WEEKDAYS.map(([n, name]) => {
    const l = node("label", undefined, "check");
    const c = node("input");
    c.type = "checkbox";
    c.value = String(n);
    c.checked = s.days.includes(n);
    l.append(c, document.createTextNode(" " + name));
    days.append(l);
    return c;
  });
  const [wl, windows] = input(
    "Hours (e.g. 20:00-23:00; add more with commas: 10:00-12:00, 20:00-23:00)",
    s.windows.map((w) => w.start + "-" + w.end).join(", "),
    "text",
    120,
  );
  const [sl, slot] = input("Session length (minutes)", String(s.slot), "number", 3);
  const [al, ahead] = input("How many days ahead people can book", String(s.ahead), "number", 3);
  const [ll, link] = input(
    "Meeting link (Google Meet), sent in every confirmation",
    s.link,
    "url",
    300,
  );
  link.placeholder = "https://meet.google.com/…";
  // Closed dates: pick a date and add it; tap one to remove it.
  const today = () => new Date(Date.now() + 6 * 3600000).toISOString().slice(0, 10);
  const blocked = new Set(s.blocked);
  const blockedSet = node("fieldset", undefined, "checks");
  blockedSet.append(node("legend", "Closed dates (holidays, travel)"));
  const chips = node("div", undefined, "booking-chips");
  const drawChips = () => {
    chips.replaceChildren();
    for (const d of [...blocked].sort()) {
      if (d < today()) continue;
      const chip = button(d + " ×", () => {
        blocked.delete(d);
        drawChips();
      });
      chip.setAttribute("aria-label", "Open " + d + " again");
      chips.append(chip);
    }
    if (!chips.children.length) chips.append(node("span", "None", "muted"));
  };
  const picker = node("input");
  picker.type = "date";
  picker.setAttribute("aria-label", "Date to close");
  const addRow = node("div", undefined, "booking-add");
  addRow.append(
    picker,
    button("Close this date", () => {
      if (!picker.value) return;
      blocked.add(picker.value);
      picker.value = "";
      drawChips();
    }),
  );
  blockedSet.append(addRow, chips);
  drawChips();
  const actions = node("div", undefined, "actions");
  const save = node("button", "Save", "primary");
  save.type = "submit";
  actions.append(save);
  form.append(days, wl, sl, al, ll, blockedSet, actions);
  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const parsed = windows.value
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean)
        .map((w) => {
          const m = w.match(/^(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})$/);
          if (!m) throw Error(`“${w}” isn't a time range. Write it like 20:00-23:00.`);
          const t = (h, mm) => h.padStart(2, "0") + ":" + mm;
          return { start: t(m[1], m[2]), end: t(m[3], m[4]) };
        });
      await api("booking/settings", {
        days: dayBoxes.filter((c) => c.checked).map((c) => Number(c.value)),
        windows: parsed,
        slot: Number(slot.value),
        ahead: Number(ahead.value),
        blocked: [...blocked].filter((d) => d >= today()),
        link: link.value.trim(),
      });
      render();
      notice("Saved. The website shows the new times right away.");
    } catch (err) {
      report(err);
    }
  };
  wrap.append(form);
  return wrap;
}
// ---------- Form responses: a table like Google Forms' responses tab, with an Excel download ----------
async function renderResponses(f) {
  const screen = $("screen");
  const { columns, items } = await api("forms/" + f.id + "/responses");
  screen.replaceChildren();
  const bar = node("div", undefined, "form-back-bar");
  const xl = node("a", "Download Excel", "button");
  xl.href = "/api/forms/" + f.id + "/responses.xlsx";
  xl.setAttribute("download", "");
  bar.append(
    button("← Forms", () => render()),
    node("span", undefined, "spacer"),
    button("Open in Leads", () => {
      leadsForm = f.id;
      navigate("Leads");
    }),
    xl,
  );
  screen.append(
    bar,
    node("h2", f.title.replace(/^Scholars Cafe\s+/i, "")),
    node(
      "p",
      `${items.length} response${items.length === 1 ? "" : "s"}, newest first. Tap one to read all answers.`,
      "muted",
    ),
  );
  const answer = (v) => {
    if (v && typeof v === "object" && !Array.isArray(v) && v.file) {
      const a = node("a", v.name || "file");
      a.href = "/api/forms/uploads/" + v.file;
      a.setAttribute("download", "");
      return a;
    }
    if (typeof v === "string" && /^https:\/\/\S+$/.test(v)) {
      // e.g. a Google Drive file from an imported Google Forms response
      const a = node("a", v.includes("drive.google.com") ? "Google Drive file" : v);
      a.href = v;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      return a;
    }
    return node("span", Array.isArray(v) ? v.join(", ") : v === true ? "Yes" : String(v ?? ""));
  };
  if (items.length) {
    const search = node("input", undefined, "response-search");
    search.type = "search";
    search.placeholder = "Search by name, email or any answer";
    search.setAttribute("aria-label", "Search responses");
    const list = node("div", undefined, "responses-list");
    for (const r of items) {
      const d = node("details", undefined, "card response");
      const sum = node("summary");
      const who = node("span", undefined, "who");
      who.append(
        node("strong", r.name || "(no name)"),
        node("span", [r.email, r.phone].filter(Boolean).join(" · "), "muted"),
      );
      const meta = node("span", undefined, "meta");
      meta.append(
        node(
          "span",
          new Date(r.created_at).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          "muted",
        ),
        node("span", r.status, "pill " + r.status),
      );
      sum.append(who, meta);
      const dl = node("dl");
      for (const c of columns) {
        const v = r.data[c.id];
        if (v === undefined || v === "" || (Array.isArray(v) && !v.length)) continue;
        dl.append(node("dt", c.label.split("\n")[0]));
        const dd = node("dd");
        dd.append(answer(v));
        dl.append(dd);
      }
      d.append(sum, dl);
      d.dataset.text = (
        [r.name, r.email, r.phone].join(" ") +
        " " +
        Object.values(r.data)
          .map((v) => (typeof v === "object" && v && !Array.isArray(v) ? v.name : String(v)))
          .join(" ")
      ).toLowerCase();
      list.append(d);
    }
    const none = node("p", "No response matches.", "empty");
    none.hidden = true;
    search.oninput = () => {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      for (const d of list.children)
        shown += (d.hidden = !!q && !d.dataset.text.includes(q)) ? 0 : 1;
      none.hidden = shown > 0;
    };
    screen.append(search, list, none);
  } else
    screen.append(
      node("p", "No responses yet. Share the form's link to start getting answers.", "empty"),
    );
  // Bring in the answers people gave on the old Google Form (tucked away: needed once).
  const imp = node("details", undefined, "import-old");
  imp.append(node("summary", "Import old responses from Google Forms"));
  imp.append(
    node(
      "p",
      "In Google Forms: Responses → ⋮ → Download responses (.csv). Unzip it and choose the .csv here. Importing the same file twice adds nothing twice, and no emails are sent.",
      "muted",
    ),
  );
  const [isl, impStatus] = select(
    "Status for the imported responses in Leads",
    [
      ["contacted", "Contacted"],
      ["closed", "Closed"],
      ["enrolled", "Enrolled"],
      ["new", "New"],
    ],
    "contacted",
  );
  const csvFile = node("input");
  csvFile.type = "file";
  csvFile.accept = ".csv,text/csv";
  csvFile.setAttribute("aria-label", "Google Forms responses CSV");
  const impGo = button(
    "Import",
    async () => {
      const file = csvFile.files[0];
      if (!file) throw Error("Choose the .csv file first.");
      if (file.size > 8 * 1024 * 1024) throw Error("That file is larger than 8 MB.");
      impGo.disabled = true;
      try {
        const r = await fetch(`/api/forms/${f.id}/import?status=${impStatus.value}`, {
          method: "POST",
          headers: { "Content-Type": "text/csv", "X-CSRF-Token": me.csrf },
          body: await file.text(),
        });
        const j = await r.json();
        if (!r.ok) throw Error(j.error || "Import failed.");
        await renderResponses(f);
        notice(
          `Imported ${j.added} response${j.added === 1 ? "" : "s"}` +
            (j.skipped ? `, ${j.skipped} were already here` : "") +
            ".",
        );
      } finally {
        impGo.disabled = false;
      }
    },
    "primary",
  );
  imp.append(isl, csvFile, impGo);
  screen.append(imp);
}
const renderFormsOpen = (id) => {
  $("screen").replaceChildren();
  renderForms(id).catch(report);
};
function formBuilder(f) {
  const screen = $("screen");
  screen.replaceChildren();
  const def = structuredClone(f.definition);
  const form = node("form", undefined, "card");
  form.append(
    button("← Forms", () => render()),
    node("h2", f.id ? f.title : "New form"),
  );
  const [tl, title] = input("Title", f.title, "text", 200);
  title.required = true;
  const [sl, slug] = input("Address: scholarscafe.com/forms/…", f.slug, "text", 60);
  slug.required = true;
  slug.pattern = "[a-z0-9]+(-[a-z0-9]+)*";
  title.oninput = () => {
    if (!f.id && !slug.dataset.touched) slug.value = slugify(title.value, 60).replace(/_/g, "-");
  };
  slug.oninput = () => (slug.dataset.touched = "1");
  const [il, intro] = input(
    "Introduction (optional; line breaks are kept and https:// links become clickable)",
    f.intro,
    "textarea",
    10000,
  );
  intro.rows = 6;
  const [sml, summary] = input(
    "Short description (shown under the title on scholarscafe.com/forms; one or two sentences)",
    f.summary || "",
    "textarea",
    300,
  );
  summary.rows = 2;
  const [ml, success] = input("Message after sending", f.success, "text", 500);
  const flag = (text, value) => {
    const l = node("label", undefined, "check");
    const c = node("input");
    c.type = "checkbox";
    c.checked = value;
    l.append(c, document.createTextNode(" " + text));
    return [l, c];
  };
  // Header photo: one of the website's photos, or an image uploaded here.
  const COVER_CHOICES = [
    ["site:campus-early-fall", "Campus in early fall"],
    ["site:library", "Library"],
    ["site:students-walking", "Students walking"],
    ["site:oklahoma-autumn", "Campus in autumn"],
    ["", "No photo (dark blue)"],
  ];
  let coverValue = f.cover || "";
  const coverBox = node("div", undefined, "cover-picker");
  const coverPreview = node("img");
  coverPreview.alt = "";
  const [cpl, coverPick] = select(
    "Header photo",
    [
      ...COVER_CHOICES,
      ...(coverValue.startsWith("https://") ? [[coverValue, "Your uploaded image"]] : []),
    ],
    coverValue,
  );
  const drawCover = () => {
    const site = coverValue.match(/^site:(.+)$/);
    coverPreview.hidden = !coverValue;
    coverPreview.src = site
      ? `https://scholarscafe.com/media/pages/${site[1]}-sm.webp`
      : coverValue || "";
  };
  coverPick.onchange = () => {
    coverValue = coverPick.value;
    drawCover();
  };
  const coverFile = node("input");
  coverFile.type = "file";
  coverFile.accept = "image/png,image/jpeg,image/webp";
  coverFile.setAttribute("aria-label", "Upload your own header photo");
  coverFile.onchange = async () => {
    if (!coverFile.files[0]) return;
    coverFile.disabled = true;
    try {
      coverValue = (await upload(coverFile.files[0])).url;
      const o = node("option", "Your uploaded image");
      o.value = coverValue;
      coverPick.append(o);
      coverPick.value = coverValue;
      drawCover();
      notice("Photo uploaded. Save the form to use it.");
    } catch (err) {
      report(err);
    } finally {
      coverFile.disabled = false;
      coverFile.value = "";
    }
  };
  const coverUp = node("label", "…or upload your own (wide photo, under 5 MB): ");
  coverUp.append(coverFile);
  coverBox.append(cpl, coverUp, coverPreview);
  drawCover();
  const [pl, published] = flag("Published (anyone with the link can fill it in)", f.published);
  const [nl, notify] = flag("Email me each new submission", f.notify);
  const [rl2, receipt] = flag(
    "Email people a copy of their answers (needs an Email question; sent from the website's address)",
    f.receipt !== false,
  );
  form.append(tl, sl, sml, il, ml, coverBox, pl, nl, rl2);
  if (f.id && f.published) {
    const a = node("a", "Open the live form ↗", "button-link");
    a.href = "https://scholarscafe.com/forms/" + f.slug;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    form.append(a);
  }
  const stepsBox = node("div");
  form.append(node("h3", "Questions"), stepsBox);
  const allFields = () => def.steps.flatMap((s) => s.fields);
  const drawSteps = () => {
    stepsBox.replaceChildren();
    def.steps.forEach((step, si) => {
      const box = node("fieldset", undefined, "checks builder-step");
      box.append(node("legend", def.steps.length > 1 ? `Step ${si + 1}` : "Questions"));
      if (def.steps.length > 1) {
        const [stl, st] = input("Step title", step.title, "text", 120);
        st.oninput = () => (step.title = st.value);
        box.append(stl);
      }
      step.fields.forEach((field, fi) => box.append(fieldEditor(step, field, fi, si)));
      const tools = node("div", undefined, "toolbar");
      const adds = node("div", undefined, "add-question");
      adds.append(node("span", "Add:", "muted"));
      for (const [type, text] of ADD_BUTTONS)
        adds.append(
          button("+ " + text, () => {
            let id = "question_" + (allFields().length + 1);
            while (allFields().some((x) => x.id === id)) id += "_";
            step.fields.push({
              id,
              label: type === "info" ? "Section heading" : "New question",
              type,
              required: false,
              ...(CHOICE_TYPES.includes(type) ? { options: ["Option 1", "Option 2"] } : {}),
            });
            drawSteps();
          }),
        );
      box.append(adds);
      if (def.steps.length > 1)
        tools.append(
          button(
            "Remove step",
            () => {
              if (!confirm("Remove this step and its questions?")) return;
              def.steps.splice(si, 1);
              drawSteps();
            },
            "danger",
          ),
        );
      box.append(tools);
      stepsBox.append(box);
    });
    stepsBox.append(
      button("+ Add a step (multi-page form)", () => {
        def.steps.push({
          title: "",
          fields: [
            {
              id: "step" + (def.steps.length + 1) + "_q1",
              label: "New question",
              type: "text",
              required: false,
            },
          ],
        });
        drawSteps();
      }),
    );
  };
  const fieldEditor = (step, field, fi, si) => {
    const card = node("details", undefined, "card builder-field");
    card.open =
      fi === step.fields.length - 1 &&
      (field.label === "New question" || field.label === "Section heading");
    const info = field.type === "info";
    const summary = node(
      "summary",
      `${field.label.split("\n")[0].slice(0, 90)}${field.label.length > 90 ? "…" : ""}${field.required ? " *" : ""} · ${FIELD_TYPES[field.type]}${field.show_if ? " · conditional" : ""}`,
    );
    card.append(summary);
    const [ll, labelIn] = input(info ? "Heading" : "Question", field.label, "textarea", 1000);
    labelIn.rows = 2;
    labelIn.oninput = () => (field.label = labelIn.value);
    const [yl, type] = select("Type", Object.entries(FIELD_TYPES), field.type);
    type.onchange = () => {
      field.type = type.value;
      if (CHOICE_TYPES.includes(field.type) && !field.options?.length)
        field.options = ["Option 1", "Option 2"];
      drawSteps();
    };
    card.append(ll, yl);
    if (!info) {
      const [rl, req] = flag("Required", Boolean(field.required));
      req.onchange = () => (field.required = req.checked);
      card.append(rl);
    } else field.required = false;
    if (CHOICE_TYPES.includes(field.type)) {
      const [ol, opts] = input(
        "Choices (one per line; start a line with # to make it a heading inside the list)",
        (field.options || []).join("\n"),
        "textarea",
        12000,
      );
      opts.rows = Math.min(14, Math.max(4, (field.options || []).length + 1));
      opts.oninput = () =>
        (field.options = opts.value
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean));
      card.append(ol);
      if (field.type !== "select") {
        const [otl, other] = flag('Add an "Other:" choice with a text box', Boolean(field.other));
        other.onchange = () => (field.other = other.checked);
        card.append(otl);
      }
    }
    if (field.type === "file")
      card.append(
        node(
          "p",
          "People can attach one PDF, Word (.docx), text, PNG or JPEG file up to 10 MB. Files are private: download them from Responses.",
          "muted",
        ),
      );
    if (["text", "email", "phone"].includes(field.type)) {
      const [rol, role] = select(
        "Use in Leads as",
        [
          ["", "—"],
          ["name", "Name"],
          ["email", "Email (reply-to)"],
          ["phone", "Phone"],
        ],
        field.role || "",
      );
      role.onchange = () => (field.role = role.value || null);
      card.append(rol);
    }
    if (["text", "textarea"].includes(field.type)) {
      const [xl, max] = input(
        "Maximum characters",
        String(field.max_length || (field.type === "textarea" ? 5000 : 300)),
        "number",
        5,
      );
      max.min = "1";
      max.max = "5000";
      max.oninput = () => (field.max_length = Number(max.value) || undefined);
      card.append(xl);
    }
    const [hl, help] = input(
      info ? "Text (links become clickable)" : "Description / help text (optional)",
      field.help || "",
      "textarea",
      3000,
    );
    help.rows = info ? 5 : 2;
    help.oninput = () => (field.help = help.value);
    card.append(hl);
    // Conditional: show only when an earlier choice question has a given answer.
    const earlier = def.steps
      .slice(0, si + 1)
      .flatMap((s, i) => (i < si ? s.fields : s.fields.slice(0, fi)))
      .filter((x) => CHOICE_TYPES.includes(x.type));
    if (earlier.length) {
      const [cl, when] = select(
        "Show only when",
        [["", "Always show"], ...earlier.map((x) => [x.id, x.label])],
        field.show_if?.field || "",
      );
      const source = earlier.find((x) => x.id === field.show_if?.field);
      card.append(cl);
      if (source) {
        const [vl, eq] = select(
          "is",
          source.options.filter((o) => !o.startsWith("# ")).map((o) => [o, o]),
          field.show_if.equals,
        );
        eq.onchange = () => (field.show_if = { field: source.id, equals: eq.value });
        card.append(vl);
      }
      when.onchange = () => {
        const src = earlier.find((x) => x.id === when.value);
        field.show_if = src ? { field: src.id, equals: src.options[0] } : null;
        drawSteps();
      };
    }
    const tools = node("div", undefined, "toolbar");
    const move = (dir) => {
      const j = fi + dir;
      if (j < 0 || j >= step.fields.length) return;
      [step.fields[fi], step.fields[j]] = [step.fields[j], step.fields[fi]];
      drawSteps();
    };
    tools.append(
      button("↑", () => move(-1)),
      button("↓", () => move(1)),
      button(
        "Delete question",
        () => {
          if (step.fields.length === 1) return report(Error("A step needs at least one question."));
          if (!confirm("Delete this " + (info ? "text block?" : "question?"))) return;
          step.fields.splice(fi, 1);
          drawSteps();
        },
        "danger",
      ),
    );
    card.append(tools);
    return card;
  };
  drawSteps();
  const actions = node("div", undefined, "actions");
  const save = node("button", "Save form", "primary");
  save.type = "submit";
  actions.append(save);
  if (f.id)
    actions.append(
      button(
        "Delete form",
        async () => {
          if (!confirm(`Delete "${f.title}"? Its submissions stay in Leads.`)) return;
          await api("forms/" + f.id + "/delete", {});
          render();
          notice("Form deleted.");
        },
        "danger",
      ),
    );
  form.append(actions);
  form.onsubmit = async (e) => {
    e.preventDefault();
    save.disabled = true;
    try {
      // Field ids are hidden from editors; keep them stable, derive new ones from the label.
      const used = new Set();
      for (const fld of allFields()) {
        if (/^question_\d+_*$|^step\d+_q1$/.test(fld.id)) fld.id = slugify(fld.label);
        while (used.has(fld.id)) fld.id = (fld.id + "_2").slice(0, 40);
        used.add(fld.id);
        if (!CHOICE_TYPES.includes(fld.type)) delete fld.options;
        if (!["radio", "checkbox"].includes(fld.type)) delete fld.other;
        if (fld.type === "info") fld.required = false;
        if (!["text", "email", "phone"].includes(fld.type)) fld.role = null;
        if (!["text", "textarea"].includes(fld.type)) delete fld.max_length;
      }
      const saved = await api(f.id ? "forms/" + f.id : "forms", {
        slug: slug.value.trim(),
        title: title.value,
        intro: intro.value,
        summary: summary.value,
        success: success.value,
        published: published.checked,
        notify: notify.checked,
        receipt: receipt.checked,
        cover: coverValue,
        definition: def,
      });
      notice(
        "Form saved." +
          (published.checked ? " It's live at scholarscafe.com/forms/" + slug.value.trim() : ""),
      );
      renderFormsOpen(saved.id);
    } catch (err) {
      report(err);
    } finally {
      save.disabled = false;
    }
  };
  screen.append(form);
}
// ---------- Visual editor (Super Admin only): click any text on the real website and change it ----------
const VISUAL_PAGES = [
  ["/", "Home"],
  ["/programs", "Programs"],
  ["/services", "Services"],
  ["/resources", "Resources"],
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/links", "Link page"],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"],
  ["/cookies", "Cookies"],
];
let visualPage = "/";
let visualWidth = "desktop";
function renderVisual() {
  const screen = $("screen");
  const origin = me.public_origin;
  // Unsaved changes shown in the preview; saved ones stay shown until the page reloads.
  const preview = { copy: {}, entries: {} };
  const bar = node("div", undefined, "toolbar visual-bar");
  const [, page] = select("Page", VISUAL_PAGES, visualPage);
  page.setAttribute("aria-label", "Page to edit");
  const widths = node("div", undefined, "chips");
  for (const [w, label] of [
    ["desktop", "Desktop"],
    ["mobile", "Phone"],
  ]) {
    const b = button(label, () => {
      visualWidth = w;
      frame.className = "visual-frame " + w;
      for (const x of widths.children) x.setAttribute("aria-pressed", String(x === b));
    });
    b.setAttribute("aria-pressed", String(visualWidth === w));
    widths.append(b);
  }
  const audit = button("Show what can't be edited", () =>
    frame.contentWindow?.postMessage({ type: "sc-audit" }, origin),
  );
  const open = node("a", "Open page ↗", "button-link");
  open.target = "_blank";
  open.rel = "noopener noreferrer";
  bar.append(page, widths, audit, open);
  const layout = node("div", undefined, "visual-layout");
  const stage = node("div", undefined, "visual-stage");
  const frame = node("iframe");
  frame.className = "visual-frame " + visualWidth;
  frame.title = "Website preview";
  stage.append(frame);
  const panel = node("aside", undefined, "card visual-panel");
  panel.setAttribute("aria-live", "polite");
  const idle = () => {
    panel.replaceChildren(
      node("h2", "Click a text to change it"),
      node(
        "p",
        "Texts you can change get a blue dashed outline when you point at them. Changes are saved and published straight away; the website updates within about a minute.",
        "muted",
      ),
    );
  };
  const load = () => {
    visualPage = page.value;
    frame.src = origin + visualPage + "?sc-edit=1";
    open.href = origin + visualPage;
    idle();
  };
  page.onchange = load;
  layout.append(stage, panel);
  screen.append(bar, layout);
  load();

  const sendPreview = () =>
    frame.contentWindow?.postMessage({ type: "sc-preview", ...preview }, origin);
  const label = (t) =>
    t.type === "copy"
      ? "Website text · " + t.key
      : (names[items.find((i) => i.id === t.id)?.kind] || "List item") + " · " + t.field;
  // The full current text (with its line breaks) when the admin has it; the page shows it flattened.
  const original = (t, shown) => {
    const flat = (v) =>
      String(v ?? "")
        .replace(/\s+/g, " ")
        .trim();
    if (t.type === "entry") {
      const [field, n] = t.field.split(".");
      const raw = items.find((i) => i.id === t.id)?.data?.[field];
      const v = n === undefined ? raw : Array.isArray(raw) ? raw[Number(n)] : undefined;
      return typeof v === "string" && flat(v) === shown ? v : shown;
    }
    for (const i of items)
      if (i.kind === "copy" && typeof i.data[t.key] === "string" && flat(i.data[t.key]) === shown)
        return i.data[t.key];
    return typeof catalog[t.key] === "string" && flat(catalog[t.key]) === shown
      ? catalog[t.key]
      : shown;
  };
  const setPending = (targets, value) => {
    for (const t of targets)
      if (t.type === "copy") preview.copy[t.key] = value;
      else (preview.entries[t.id] ||= {})[t.field] = value;
    sendPreview();
  };
  const clearPending = (targets) => {
    for (const t of targets)
      if (t.type === "copy") delete preview.copy[t.key];
      else if (preview.entries[t.id]) delete preview.entries[t.id][t.field];
    sendPreview();
  };
  const edit = (hit) => {
    if (!hit.targets.length) {
      panel.replaceChildren(
        node("h2", "This text isn't connected yet"),
        node("p", "“" + hit.text.slice(0, 300) + "”", "pre-line"),
        node("p", "Tell your developer which text this is, and it will be made editable.", "muted"),
        button("Back", idle),
      );
      return;
    }
    const form = node("form");
    const before = original(hit.targets[0], hit.text);
    const [tl, text] = input("Text", before, "textarea", 20000);
    text.rows = Math.min(14, Math.max(3, Math.ceil(before.length / 40)));
    const where = node("details", undefined, "muted");
    where.append(
      node(
        "summary",
        hit.targets.length > 1 ? `Used in ${hit.targets.length} places` : "Where this text lives",
      ),
    );
    const boxes = hit.targets.map((t) => {
      const l = node("label", undefined, "check");
      const c = node("input");
      c.type = "checkbox";
      c.checked = true;
      l.append(c, document.createTextNode(" " + label(t)));
      where.append(l);
      return c;
    });
    const chosen = () => hit.targets.filter((_, i) => boxes[i].checked);
    text.oninput = () => setPending(chosen(), text.value);
    const save = node("button", "Save & publish", "primary");
    save.type = "submit";
    const cancel = button("Cancel", () => {
      clearPending(hit.targets);
      idle();
    });
    const actions = node("div", undefined, "actions");
    actions.append(save, cancel);
    form.append(node("h2", "Edit text"), tl, where, actions);
    form.onsubmit = async (e) => {
      e.preventDefault();
      const targets = chosen();
      if (!targets.length) return report(Error("Tick at least one place to change."));
      save.disabled = true;
      try {
        for (const target of targets) await api("visual/edit", { target, value: text.value });
        setPending(targets, text.value);
        await refresh();
        notice("Saved and published. The website shows it within about a minute.");
        idle();
      } catch (err) {
        report(err);
      } finally {
        save.disabled = false;
      }
    };
    panel.replaceChildren(form);
    text.focus();
  };
  const message = (e) => {
    if (!frame.isConnected) return window.removeEventListener("message", message);
    if (
      e.origin !== origin ||
      e.source !== frame.contentWindow ||
      !e.data ||
      typeof e.data !== "object"
    )
      return;
    if (e.data.type === "sc-ready") sendPreview();
    if (
      e.data.type === "sc-pick" &&
      typeof e.data.text === "string" &&
      Array.isArray(e.data.targets)
    )
      edit({
        text: e.data.text,
        targets: e.data.targets.filter((t) => t && (t.type === "copy" || t.type === "entry")),
      });
    if (e.data.type === "sc-audit" && Array.isArray(e.data.missing)) {
      panel.replaceChildren(
        node(
          "h2",
          e.data.missing.length
            ? `${e.data.missing.length} texts not connected yet`
            : "Everything here can be edited",
        ),
      );
      const ul = node("ul", undefined, "audit-list");
      for (const t of e.data.missing.slice(0, 200)) ul.append(node("li", String(t).slice(0, 160)));
      panel.append(ul, button("Back", idle));
    }
  };
  window.addEventListener("message", message);
}
// ---------- Student dashboard: student screens ----------
async function renderMyCourses() {
  const screen = $("screen");
  const courses = (await api("lms/my/courses")).items;
  screen.append(node("p", "Your courses. Pick up where you left off.", "muted"));
  if (!courses.length)
    screen.append(
      node("p", "You're not enrolled in a course yet. Your mentor will add you.", "empty"),
    );
  for (const c of courses) {
    const card = node("article", undefined, "card");
    const pct = c.lessons ? Math.round((c.done / c.lessons) * 100) : 0;
    const bar = node("progress");
    bar.max = 100;
    bar.value = pct;
    bar.setAttribute("aria-label", `${pct}% complete`);
    card.append(
      node("h3", c.title),
      node("p", c.summary || "", "muted"),
      bar,
      node("p", `${c.done} of ${c.lessons} lessons done`, "muted"),
      button("Open course →", () => renderMyCourse(c.id), "primary"),
    );
    screen.append(card);
  }
}
async function renderMyCourse(courseId, lessonId) {
  const screen = $("screen");
  const { course, lessons } = await api("lms/my/courses/" + courseId);
  screen.replaceChildren(button("← My courses", () => render()));
  $("heading").textContent = course.title;
  const layout = node("div", undefined, "course-layout");
  const list = node("ol", undefined, "lesson-list");
  const current =
    lessons.find((l) => l.id === lessonId) || lessons.find((l) => !l.done) || lessons[0];
  for (const l of lessons) {
    const item = node("li");
    const b = button((l.done ? "✓ " : "") + l.title, () => renderMyCourse(courseId, l.id));
    if (l === current) b.setAttribute("aria-current", "true");
    item.append(b);
    list.append(item);
  }
  const view = node("section", undefined, "card lesson-view");
  if (!current) view.append(node("p", "Lessons will appear here soon.", "empty"));
  else {
    view.append(node("h2", current.title));
    if (current.has_video)
      view.append(videoPlayer("lms/lessons/" + current.id + "/play", current.id));
    if (current.body) view.append(node("p", current.body, "lesson-body"));
    const toggle = button(
      current.done ? "Mark as not done" : "Mark as done ✓",
      async () => {
        await api("lms/my/progress", { lesson_id: current.id, done: !current.done });
        const next = lessons[lessons.indexOf(current) + 1];
        await renderMyCourse(courseId, !current.done && next ? next.id : current.id);
      },
      current.done ? "" : "primary",
    );
    view.append(toggle);
  }
  layout.append(list, view);
  screen.append(layout, await reviewForm(courseId));
}
async function renderMyDetails() {
  const p = await api("lms/my/profile");
  const card = node("form", undefined, "card");
  const [nl, name] = input("Full name", p.full_name, "text", 160);
  const [pl, phone] = input("Phone", p.phone, "tel", 80);
  const [il, intake] = input("Target intake (e.g. Fall 2027)", p.target_intake, "text", 40);
  const save = node("button", "Save details", "primary");
  save.type = "submit";
  card.append(node("h2", "My details"), nl, pl, il, save);
  card.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api("lms/my/profile", {
        full_name: name.value,
        phone: phone.value,
        target_intake: intake.value,
      });
      notice("Details saved.");
    } catch (err) {
      report(err);
    }
  };
  $("screen").prepend(card);
}
// ---------- Messages and reviews ----------
const when = (t) =>
  new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
function senderLabel(m) {
  if (m.mine) return "You";
  if (m.sender_role === "student") return "Student";
  if (me.role === "student")
    return m.sender_role === "mentor" ? "Your mentor" : "Scholars Cafe team";
  return m.sender_email || m.sender_role || "Staff";
}
// ---------- Student files: upload (private, checked on the server) and 5-minute download links ----------
const FILE_ACCEPT =
  ".pdf,.docx,.txt,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg";
async function uploadFile(file, studentId, purpose) {
  if (file.size > 10 * 1024 * 1024) throw Error("Files must be 10 MB or smaller.");
  const type =
    file.type ||
    {
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
    }[file.name.split(".").pop().toLowerCase()] ||
    "";
  const r = await fetch(`/api/lms/files?student=${studentId}&purpose=${purpose}`, {
    method: "POST",
    headers: {
      "Content-Type": type,
      "X-CSRF-Token": me.csrf,
      "X-File-Name": file.name.replace(/[^\w .()-]/g, "_").slice(0, 150),
    },
    body: file,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(j.error || "Upload failed.");
  return j;
}
async function downloadFile(fileId) {
  const { url, name } = await api("lms/files/" + fileId);
  const a = node("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
}
function fileChip(id, name) {
  const b = button("📎 " + name, () => downloadFile(id));
  b.className = "file-chip";
  return b;
}
/** File picker that uploads straight away and remembers the uploaded id. */
function filePicker(studentId, purpose, label) {
  const wrap = node("div", undefined, "file-picker");
  const input = node("input");
  input.type = "file";
  input.accept = FILE_ACCEPT;
  input.setAttribute("aria-label", label);
  const state = node("span", "PDF, Word, text, PNG or JPEG · up to 10 MB", "muted");
  wrap.append(input, state);
  wrap.uploaded = null;
  input.onchange = async () => {
    wrap.uploaded = null;
    if (!input.files[0]) return;
    input.disabled = true;
    state.textContent = "Uploading…";
    try {
      wrap.uploaded = await uploadFile(input.files[0], studentId, purpose);
      state.textContent = "Ready: " + wrap.uploaded.name;
    } catch (err) {
      input.value = "";
      state.textContent = err.message;
    } finally {
      input.disabled = false;
    }
  };
  wrap.reset = () => {
    input.value = "";
    wrap.uploaded = null;
    state.textContent = "PDF, Word, text, PNG or JPEG · up to 10 MB";
  };
  return wrap;
}
async function renderThread(studentId, title, back) {
  const screen = $("screen");
  screen.replaceChildren();
  if (back) screen.append(button("← All conversations", back));
  if (title) $("heading").textContent = title;
  const list = node("div", undefined, "thread");
  list.setAttribute("aria-live", "polite");
  let shown = "";
  const draw = async () => {
    const messages = (await api("lms/threads/" + studentId)).items;
    const key = JSON.stringify(messages.map((m) => [m.id, m.removed]));
    if (key === shown) return;
    shown = key;
    list.replaceChildren();
    if (!messages.length)
      list.append(
        node(
          "p",
          me.role === "student"
            ? "Ask your mentor anything here. They'll reply as soon as they can."
            : "No messages yet.",
          "empty",
        ),
      );
    for (const m of messages) {
      const bubble = node("article", undefined, "message" + (m.mine ? " mine" : ""));
      bubble.append(node("p", `${senderLabel(m)} · ${when(m.created_at)}`, "muted"));
      if (m.removed && me.role !== "owner" && me.role !== "admin")
        bubble.append(node("p", "This message was removed by the Scholars Cafe team.", "muted"));
      else {
        if (m.removed) bubble.append(node("span", "Removed (only admins see this)", "badge"));
        if (m.body) bubble.append(node("p", m.body, "lesson-body"));
        if (m.file_id) bubble.append(fileChip(m.file_id, m.file_name));
        if (!m.removed && (me.role === "owner" || me.role === "admin"))
          bubble.append(
            button(
              "Remove",
              async () => {
                if (!confirm("Remove this message? The student and mentor won't see it any more."))
                  return;
                await api("lms/messages/" + m.id + "/delete", {});
                await draw();
              },
              "danger small",
            ),
          );
      }
      list.append(bubble);
    }
    list.lastElementChild?.scrollIntoView({ block: "nearest" });
  };
  const form = node("form", undefined, "card");
  const [l, text] = input("Message", "", "textarea", 5000);
  const attach = filePicker(studentId, "message", "Attach a file");
  const send = node("button", "Send", "primary");
  send.type = "submit";
  form.append(l, attach, send);
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (!text.value.trim() && !attach.uploaded) return;
    try {
      send.disabled = true;
      await api("lms/threads/" + studentId, {
        body: text.value,
        file_id: attach.uploaded?.id || null,
      });
      text.value = "";
      attach.reset();
      await draw();
    } catch (err) {
      report(err);
    } finally {
      send.disabled = false;
    }
  };
  screen.append(list, form);
  await draw();
  // Near-real-time: check for new messages every 15 seconds while this conversation is open and visible.
  const timer = setInterval(() => {
    if (!list.isConnected) return clearInterval(timer);
    if (!document.hidden) draw().catch(() => {});
  }, 15000);
}
async function renderThreads() {
  const screen = $("screen");
  const items = (await api("lms/threads")).items;
  screen.append(
    node(
      "p",
      me.role === "mentor"
        ? "Conversations with your students."
        : "Conversations with every student.",
      "muted",
    ),
  );
  if (!items.length) screen.append(node("p", "No students yet.", "empty"));
  for (const t of items) {
    const card = node("article", undefined, "card");
    const name = t.full_name || t.email;
    card.append(
      node("h3", name),
      node(
        "p",
        (t.last_at ? "Last message " + when(t.last_at) : "No messages yet") +
          (t.unread ? ` · ${t.unread} unread` : ""),
        t.unread ? "badge" : "muted",
      ),
      button("Open →", () => renderThread(t.id, name, () => navigate("Messages"))),
    );
    screen.append(card);
  }
}
async function reviewForm(courseId) {
  const mine = (await api("lms/my/reviews")).items.find((r) => r.course_id === courseId);
  const form = node("form", undefined, "card");
  const [rl, rating] = select(
    "Rating",
    [
      ["5", "★★★★★ Excellent"],
      ["4", "★★★★ Good"],
      ["3", "★★★ OK"],
      ["2", "★★ Poor"],
      ["1", "★ Bad"],
    ],
    String(mine?.rating || 5),
  );
  const [bl, body] = input("Your review (at least 10 characters)", mine?.body, "textarea", 2000);
  const cl = node("label", undefined, "check");
  const consent = node("input");
  consent.type = "checkbox";
  consent.checked = Boolean(mine?.public_consent);
  cl.append(
    consent,
    document.createTextNode(
      " Scholars Cafe may show this review on its website with my first name.",
    ),
  );
  const save = node("button", mine ? "Update review" : "Send review", "primary");
  save.type = "submit";
  const state = {
    pending: "Waiting for approval.",
    approved: "Approved. Thank you!",
    rejected: "Not approved. You can edit and send it again.",
  };
  form.append(
    node("h2", "Review this course"),
    ...(mine ? [node("p", state[mine.status], "muted")] : []),
    rl,
    bl,
    cl,
    save,
  );
  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api("lms/my/reviews", {
        course_id: courseId,
        rating: Number(rating.value),
        body: body.value,
        public_consent: consent.checked,
      });
      notice("Thanks! Your review will appear after the team approves it.");
      form.replaceWith(await reviewForm(courseId));
    } catch (err) {
      report(err);
    }
  };
  return form;
}
async function renderReviews() {
  const screen = $("screen");
  const [fl, filter] = select(
    "Show",
    [
      ["pending", "Waiting for approval"],
      ["approved", "Approved"],
      ["rejected", "Rejected"],
      ["", "All"],
    ],
    "pending",
  );
  const list = node("div");
  screen.append(
    node(
      "p",
      "Students review courses they're enrolled in. Approve before anyone else can see them.",
      "muted",
    ),
    fl,
    list,
  );
  const load = async () => {
    const items = (await api("lms/reviews" + (filter.value ? "?status=" + filter.value : "")))
      .items;
    list.replaceChildren();
    if (!items.length) list.append(node("p", "Nothing here.", "empty"));
    for (const r of items) {
      const card = node("article", undefined, "card");
      card.append(
        node("h3", `${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)} · ${r.course}`),
        node("p", `${r.full_name || r.email} · ${when(r.created_at)}`, "muted"),
        node("p", r.body, "lesson-body"),
        node("span", r.status, "badge"),
        node(
          "span",
          r.public_consent ? "May be shown on the website" : "Private (no consent to publish)",
          "badge",
        ),
      );
      if (r.status === "approved" && r.public_consent && !r.featured)
        card.append(
          button("Add to website testimonials", async () => {
            await api("lms/reviews/" + r.id + "/feature", {});
            notice("Added as a draft in Website → Testimonials. Check it and publish it there.");
            await refresh();
            await load();
          }),
        );
      if (r.featured) card.append(node("span", "On the website (Testimonials)", "badge"));
      for (const [label, status] of [
        ["Approve", "approved"],
        ["Reject", "rejected"],
      ])
        if (r.status !== status)
          card.append(
            button(
              label,
              async () => {
                await api("lms/reviews/" + r.id, { status });
                notice("Review " + status + ".");
                await load();
              },
              status === "approved" ? "primary" : "danger",
            ),
          );
      list.append(card);
    }
  };
  filter.onchange = () => load().catch(report);
  await load();
}
async function renderMedia() {
  const screen = $("screen");
  screen.append(
    node(
      "p",
      "Only upload images you own or have permission to use. Uploaded images are public immediately; never upload private documents.",
      "muted",
    ),
  );
  if (me.role !== "editor") {
    const file = node("input");
    file.type = "file";
    file.accept = "image/png,image/jpeg,image/webp,video/mp4,video/webm";
    file.setAttribute("aria-label", "Upload public image or video");
    file.onchange = async () => {
      if (!file.files[0]) return;
      file.disabled = true;
      try {
        await upload(file.files[0]);
        render();
        notice("Image uploaded. Copy its URL into any image field.");
      } catch (e) {
        report(e);
      } finally {
        file.disabled = false;
      }
    };
    screen.append(file);
  }
  const result = await api("media");
  for (const item of result.items) {
    const card = node("div", undefined, "card");
    const isVideo = String(item.mime || "").startsWith("video/");
    const image = node(isVideo ? "video" : "img");
    image.src = item.url;
    image.width = 160;
    if (isVideo) {
      image.muted = true;
      image.preload = "metadata";
      image.controls = true;
    } else {
      image.alt = item.name;
      image.loading = "lazy";
    }
    const url = node("input");
    url.readOnly = true;
    url.value = item.url;
    url.setAttribute("aria-label", "Image URL");
    card.append(
      image,
      node("p", item.name),
      url,
      button("Copy URL", async () => {
        await navigator.clipboard.writeText(item.url);
        notice("Image URL copied.");
      }),
    );
    screen.append(card);
  }
  if (!result.items.length) screen.append(node("p", "No uploaded images yet.", "empty"));
}
async function renderAccess() {
  const users = (await api("users")).items;
  const screen = $("screen");
  // Student sign-up switch: everyone sees it, only the Super Admin (owner) can change it.
  const settings = await api("settings");
  const signup = node("form", undefined, "card");
  signup.append(
    node("h2", "Student sign-up"),
    node(
      "p",
      "Open: anyone can create a student account at student.scholarscafe.com; it has no access until you add a course or package. Invite only: just the students you add under Students.",
      "muted",
    ),
  );
  const mode = node("select");
  for (const [value, text] of [
    ["open", "Open sign-up"],
    ["invite", "Invite only"],
  ]) {
    const o = node("option", text);
    o.value = value;
    o.selected = settings.student_signup === value;
    mode.append(o);
  }
  mode.disabled = me.role !== "owner";
  const modeLabel = node("label", "Mode");
  modeLabel.append(mode);
  signup.append(modeLabel);
  if (me.role === "owner") {
    const save = node("button", "Save", "primary");
    save.type = "submit";
    signup.append(save);
    signup.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await api("settings", { student_signup: mode.value });
        notice("Student sign-up saved.");
      } catch (err) {
        report(err);
      }
    };
  } else signup.append(node("p", "Only the Super Admin can change this.", "muted"));
  screen.append(signup);
  const card = node("form", undefined, "card");
  card.append(node("h2", "Approve a Google account"));
  const email = field(card, "email", "");
  const label = node("label", "Role");
  const select = node("select");
  for (const role of me.role === "owner"
    ? ["student", "editor", "mentor", "admin", "owner"]
    : ["student", "editor", "mentor"]) {
    const option = node("option", role);
    option.value = role;
    select.append(option);
  }
  card.append(label, select);
  const save = node("button", "Grant access", "primary");
  save.type = "submit";
  card.append(
    node(
      "p",
      "Only the exact approved Google account can sign in. Owner access grants full control.",
      "muted",
    ),
    save,
  );
  card.onsubmit = async (e) => {
    e.preventDefault();
    save.disabled = true;
    try {
      await api("users", { email: email(), role: select.value, active: true });
      render();
      notice("Access updated.");
    } catch (err) {
      report(err);
    } finally {
      save.disabled = false;
    }
  };
  screen.append(card);
  for (const user of users) {
    const row = node("div", undefined, "card row");
    row.append(
      node("span", user.email),
      node("span", user.role + (user.active ? "" : " · revoked"), "badge"),
    );
    if (
      user.id !== me.id &&
      (me.role === "owner" || ["editor", "mentor", "student"].includes(user.role))
    )
      row.append(
        button(user.active ? "Revoke access" : "Restore access", async () => {
          if (!confirm("Change access for " + user.email + "?")) return;
          await api("users", { email: user.email, role: user.role, active: !user.active });
          render();
        }),
      );
    screen.append(row);
  }
}
async function renderAudit() {
  const rows = (await api("audit")).items;
  const table = node("table");
  const head = node("tr");
  for (const text of ["Time", "Account", "Action", "Entry"]) head.append(node("th", text));
  table.append(head);
  for (const row of rows) {
    const tr = node("tr");
    for (const value of [
      new Date(row.created_at).toLocaleString(),
      row.email || "System",
      row.action,
      row.target,
    ])
      tr.append(node("td", value));
    table.append(tr);
  }
  $("screen").append(table);
}
async function renderLeads() {
  const screen = $("screen");
  const admin = canPublishRole(me.role);
  const mentors = admin ? (await api("mentors")).items : [];
  const filters = node("form", undefined, "card toolbar");
  const q = node("input");
  q.type = "search";
  q.placeholder = "Search name, email, phone or message";
  q.setAttribute("aria-label", "Search leads");
  const status = node("select");
  status.setAttribute("aria-label", "Filter by status");
  for (const v of ["", "new", "contacted", "enrolled", "closed"]) {
    const o = node("option", v || "All statuses");
    o.value = v;
    status.append(o);
  }
  const assigned = node("select");
  assigned.setAttribute("aria-label", "Filter by mentor");
  if (admin) {
    for (const [v, t] of [
      ["", "All mentors"],
      ["none", "Unassigned"],
      ...mentors.map((m) => [m.id, m.email]),
    ]) {
      const o = node("option", t);
      o.value = v;
      assigned.append(o);
    }
  }
  // Source: the website contact form or a form from the builder.
  const source = node("select");
  source.setAttribute("aria-label", "Filter by source");
  const forms = admin ? (await api("forms")).items : [];
  for (const [v, t] of [
    ["", "All sources"],
    ["website", "Website contact form"],
    ...forms.map((f) => [f.id, f.title]),
  ]) {
    const o = node("option", t);
    o.value = v;
    source.append(o);
  }
  source.value = leadsForm || "";
  leadsForm = "";
  const go = node("button", "Filter", "primary");
  go.type = "submit";
  const csv = node("a", "Export CSV");
  csv.className = "button";
  filters.append(q, status, ...(admin ? [assigned, source] : []), go, csv);
  const list = node("div");
  screen.append(
    node(
      "p",
      admin
        ? "Every website enquiry. Assign a mentor, track status and keep notes."
        : "Leads assigned to you.",
      "muted",
    ),
    filters,
    list,
  );
  const query = () => {
    const p = new URLSearchParams();
    if (q.value.trim()) p.set("q", q.value.trim());
    if (status.value) p.set("status", status.value);
    if (admin && assigned.value) p.set("assigned", assigned.value);
    if (admin && source.value) p.set("form", source.value);
    return p.toString();
  };
  const load = async () => {
    csv.href = "/api/leads.csv" + (query() ? "?" + query() : "");
    const rows = (await api("leads" + (query() ? "?" + query() : ""))).items;
    list.replaceChildren();
    if (!rows.length) list.append(node("p", "No leads match.", "empty"));
    for (const row of rows) {
      const card = node("article", undefined, "card");
      card.append(
        node("h2", row.name),
        node("span", row.form_title || "Website contact form", "badge"),
        node("p", [row.email, row.phone].filter(Boolean).join(" · "), "muted"),
        node("p", row.message, "pre-line"),
        node("p", "Received " + new Date(row.created_at).toLocaleString(), "muted"),
      );
      const st = node("select");
      st.setAttribute("aria-label", "Status for " + row.name);
      for (const v of ["new", "contacted", "enrolled", "closed"]) {
        const o = node("option", v);
        o.value = v;
        st.append(o);
      }
      st.value = row.status || "new";
      const notes = node("textarea");
      notes.value = row.notes || "";
      notes.maxLength = 5000;
      notes.setAttribute("aria-label", "Notes for " + row.name);
      const who = node("select");
      who.setAttribute("aria-label", "Assigned mentor for " + row.name);
      if (admin) {
        for (const [v, t] of [["", "Unassigned"], ...mentors.map((m) => [m.id, m.email])]) {
          const o = node("option", t);
          o.value = v;
          who.append(o);
        }
        who.value = row.assigned_to || "";
      }
      const save = button(
        "Save",
        async () => {
          const body = { status: st.value, notes: notes.value };
          if (admin) body.assigned_to = who.value || null;
          await api("leads/" + row.id, body);
          notice("Lead updated.");
        },
        "primary",
      );
      card.append(node("label", "Status"), st, node("label", "Notes"), notes);
      if (admin) card.append(node("label", "Assigned mentor"), who);
      else if (row.assigned_email) card.append(node("p", "Assigned to you", "badge"));
      card.append(save);
      list.append(card);
    }
  };
  filters.onsubmit = (e) => {
    e.preventDefault();
    load().catch(report);
  };
  await load();
}
async function renderMessages() {
  const rows = (await api("inquiries")).items;
  for (const row of rows) {
    const card = node("article", undefined, "card");
    card.append(
      node("h2", row.name),
      node("p", row.email + " · " + row.phone, "muted"),
      node("p", row.message),
      node("p", new Date(row.created_at).toLocaleString(), "muted"),
    );
    $("screen").append(card);
  }
  if (!rows.length) $("screen").append(node("p", "No messages yet.", "empty"));
}
async function renderSubmissions() {
  const kind = section === "Newsletter" ? "newsletter" : "feedback";
  const rows = (await api("submissions")).items.filter((row) => row.kind === kind);
  $("screen").append(
    node(
      "p",
      kind === "newsletter"
        ? "Signups are recorded with consent. This dashboard does not send newsletter campaigns. Honor unsubscribe requests before contacting subscribers."
        : "Private feedback is never published automatically.",
      "muted",
    ),
  );
  for (const row of rows) {
    const card = node("article", undefined, "card");
    card.append(
      node("h2", row.name || row.email),
      node("p", row.email),
      node("p", row.message),
      node("p", new Date(row.created_at).toLocaleString(), "muted"),
    );
    if (kind === "newsletter")
      card.append(
        row.unsubscribed_at
          ? node("p", "Unsubscribed", "badge")
          : button("Mark unsubscribed", async () => {
              await api("submissions/" + row.id + "/unsubscribe", {});
              render();
            }),
      );
    $("screen").append(card);
  }
  if (!rows.length) $("screen").append(node("p", "No entries yet.", "empty"));
}
// ECA alerts: compose one email, it is queued once per subscriber (with their own unsubscribe link).
async function renderEcaAlerts() {
  const data = await api("eca/subscribers");
  const screen = $("screen");
  const summary = node("article", undefined, "card");
  summary.append(
    node("p", "Active subscribers", "muted"),
    node("strong", String(data.active)),
    node(
      "p",
      `Emails go from ${data.from}, one every ${data.gapSeconds} seconds, so the mailbox isn't overloaded. Each email has a one-click unsubscribe link.` +
        (data.mailConnected
          ? ""
          : " Mail delivery is not connected yet: emails wait in the queue."),
      "muted",
    ),
  );
  screen.append(summary);

  const form = node("form", undefined, "card");
  const [sl, subject] = input("Subject", "", "text", 150);
  subject.required = true;
  subject.placeholder = "New ECA open: …";
  const [bl, body] = input("Message", "", "textarea", 20000);
  body.required = true;
  body.rows = 8;
  body.placeholder = "What it is, who can join, deadline, and the link to apply.";
  const send = node("button", "Send to all subscribers", "primary");
  send.type = "submit";
  form.append(node("h2", "Send an ECA alert"), sl, bl, send);
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (!data.active) return report(Error("Nobody has signed up for ECA alerts yet."));
    if (
      !confirm(
        `Send "${subject.value.trim()}" to ${data.active} subscriber${data.active === 1 ? "" : "s"}? This can't be undone.`,
      )
    )
      return;
    send.disabled = true;
    try {
      const r = await api("eca/broadcast", { subject: subject.value, body: body.value });
      notice(
        `Queued for ${r.queued} subscriber${r.queued === 1 ? "" : "s"}.` +
          (r.minutes ? ` All will be sent within about ${r.minutes} minutes.` : ""),
      );
      render();
    } catch (err) {
      send.disabled = false;
      report(err);
    }
  };
  screen.append(form);

  screen.append(node("h2", "Subscribers"));
  for (const row of data.items) {
    const card = node("div", undefined, "card row");
    card.append(
      node("span", row.email),
      node(
        "span",
        row.unsubscribed_at
          ? "Unsubscribed"
          : "Since " + new Date(row.consent_at || row.created_at).toLocaleDateString(),
        "badge",
      ),
      button("Remove", async () => {
        if (!confirm(`Remove ${row.email} from ECA alerts?`)) return;
        await api("eca/subscribers/" + row.id + "/remove", {});
        render();
      }),
    );
    screen.append(card);
  }
  if (!data.items.length) screen.append(node("p", "No sign-ups yet.", "empty"));
}
async function renderMail() {
  const result = await api("mail-status");
  $("screen").append(
    node(
      "p",
      result.configured
        ? "Notifications go to contact@scholarscafe.com. Your original messages remain in the dashboard."
        : "Mailbox delivery is not connected yet. Entries are saved here and notifications are queued until the mailbox password is configured.",
      "card",
    ),
  );
  for (const row of result.items) {
    const card = node("div", undefined, "card row");
    card.append(
      node("span", row.subject),
      node(
        "span",
        row.sent_at
          ? "Sent"
          : row.attempts >= 5
            ? "Delivery failed — check mailbox settings"
            : "Queued",
        "badge",
      ),
    );
    $("screen").append(card);
  }
}
// Which portal is this? Team admin (Google only) or student portal (Google, email code, password).
const authConfig = await fetch("/auth/config")
  .then((r) => r.json())
  .catch(() => ({ portal: "admin" }));
const portal = authConfig.portal;
if (portal === "student") {
  document.title = "Scholars Cafe · Student portal";
  $("login-eyebrow").textContent = "STUDENT PORTAL";
  $("login-title").textContent = "Your journey, in one place.";
  $("login-lead").textContent = "Sign in to see your courses, lessons and messages.";
  $("email-signin").hidden = false;
  $("show-signup").hidden = !authConfig.signup;
  $("login-foot").textContent = authConfig.signup
    ? "Team members sign in at admin.scholarscafe.com."
    : "Sign-up is by invitation. Team members sign in at admin.scholarscafe.com.";
}
const signinResult = new URLSearchParams(location.search).get("signin");
if (signinResult) {
  $("login-message").textContent =
    signinResult === "other-portal"
      ? portal === "student"
        ? "This is the student portal. Team members sign in at admin.scholarscafe.com."
        : "This page is for the Scholars Cafe team. Students sign in at student.scholarscafe.com."
      : "This Google account doesn't have access. Ask an admin to add it.";
  history.replaceState(null, "", "/");
}
// Sign-in screen: password, or a one-time email code (the email also holds a magic link).
async function authPost(path, body) {
  const r = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(j.error || "Sign-in failed. Try again.");
  return j;
}
function loginMessage(text) {
  $("login-message").textContent = text;
}
$("password-form").onsubmit = async (e) => {
  e.preventDefault();
  const email = $("login-email").value.trim();
  const password = $("login-password").value;
  if (!email || !password) return loginMessage("Enter your email and password, or ask for a code.");
  try {
    await authPost("/auth/password", { email, password });
    location.reload();
  } catch (err) {
    loginMessage(err.message);
  }
};
$("send-code").onclick = async () => {
  const email = $("login-email").value.trim();
  if (!email) return loginMessage("Enter your email first.");
  try {
    const j = await authPost("/auth/email/start", { email });
    showForm("code-form");
    $("login-code").focus();
    loginMessage(j.message);
  } catch (err) {
    loginMessage(err.message);
  }
};
// Shows one of the sign-in forms and hides the others.
function showForm(id) {
  for (const f of ["password-form", "code-form", "signup-form", "reset-form"])
    $(f).hidden = f !== id;
  loginMessage("");
}
$("code-back").onclick = () => showForm("password-form");
$("signup-back").onclick = () => showForm("password-form");
$("reset-back").onclick = () => showForm("password-form");
$("show-signup").onclick = () => {
  showForm("signup-form");
  $("signup-email").value = $("login-email").value;
  $("signup-name").focus();
};
$("signup-form").onsubmit = async (e) => {
  e.preventDefault();
  const email = $("signup-email").value.trim();
  const name = $("signup-name").value.trim();
  if (!email || !name) return loginMessage("Enter your name and email.");
  try {
    const j = await authPost("/auth/signup", {
      email,
      name,
      phone: $("signup-phone").value.trim(),
    });
    $("login-email").value = email;
    showForm("code-form");
    $("login-code").focus();
    loginMessage(j.message);
  } catch (err) {
    loginMessage(err.message);
  }
};
$("forgot").onclick = async () => {
  const email = $("login-email").value.trim();
  if (!email) return loginMessage("Enter your email first, then tap Forgot password.");
  try {
    const j = await authPost("/auth/email/start", { email });
    showForm("reset-form");
    $("reset-code").focus();
    loginMessage(j.message);
  } catch (err) {
    loginMessage(err.message);
  }
};
$("reset-form").onsubmit = async (e) => {
  e.preventDefault();
  if ($("reset-password").value !== $("reset-again").value)
    return loginMessage("The two passwords don't match.");
  try {
    await authPost("/auth/password/reset", {
      email: $("login-email").value.trim(),
      code: $("reset-code").value.trim(),
      password: $("reset-password").value,
    });
    location.reload();
  } catch (err) {
    loginMessage(err.message);
  }
};
$("code-form").onsubmit = async (e) => {
  e.preventDefault();
  try {
    await authPost("/auth/email/verify", {
      email: $("login-email").value.trim(),
      code: $("login-code").value.trim(),
    });
    location.reload();
  } catch (err) {
    loginMessage(err.message);
  }
};
function renderAccount() {
  const card = node("form", undefined, "card");
  card.append(
    node("h2", me.has_password ? "Change password" : "Set a password"),
    node(
      "p",
      "Optional. Lets you sign in with your email and password as well as Google or an email code. At least 12 characters. Other devices are signed out.",
      "muted",
    ),
  );
  const field = (label, id, auto) => {
    const l = node("label", label);
    const input = document.createElement("input");
    input.type = "password";
    input.id = id;
    input.autocomplete = auto;
    input.maxLength = 128;
    l.append(input);
    card.append(l);
    return input;
  };
  const current = me.has_password
    ? field("Current password", "pw-current", "current-password")
    : null;
  const next = field("New password", "pw-new", "new-password");
  const again = field("Repeat new password", "pw-again", "new-password");
  const save = node("button", "Save password", "primary");
  save.type = "submit";
  card.append(save);
  card.onsubmit = async (e) => {
    e.preventDefault();
    if (next.value !== again.value) return report(Error("The two new passwords don't match."));
    try {
      await api("password", {
        password: next.value,
        ...(current ? { current: current.value } : {}),
      });
      me.has_password = true;
      notice("Password saved.");
      render();
    } catch (err) {
      report(err);
    }
  };
  $("screen").append(card);
}
// ---------- Team workspace: staff chat, tasks, progress (staff only; see backend/workspace.js) ----------
const STAFF = ["owner", "admin", "editor", "mentor"];
const WORKSPACE = {
  "Team chat": () => renderTeamChat(),
  Tasks: () => renderTasks(),
  Progress: () => renderProgress(),
};
const DHAKA = "Asia/Dhaka";
const dhakaTime = (t, opts) => new Date(t).toLocaleString("en-GB", { timeZone: DHAKA, ...opts });
const dhakaDayOf = (t) => new Date(new Date(t).getTime() + 6 * 3600000).toISOString().slice(0, 10);
// A deadline as the "YYYY-MM-DDTHH:mm" a date+time picker shows (Bangladesh time).
const dhakaInput = (t) =>
  t ? new Date(new Date(t).getTime() + 6 * 3600000).toISOString().slice(0, 16) : "";
const dueText = (t) =>
  dhakaTime(t, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
const hours = (minutes) =>
  minutes < 60 ? `~${minutes}m` : `~${Math.floor(minutes / 60)}h ${minutes % 60}m`;

async function renderTeamChat() {
  const screen = $("screen");
  const pins = node("div", undefined, "pin-bar");
  pins.hidden = true;
  const list = node("div", undefined, "team-chat");
  list.setAttribute("aria-live", "polite");
  const form = node("form", undefined, "chat-composer");
  const text = node("textarea");
  text.maxLength = 2000;
  text.rows = 1;
  text.placeholder = "Message the team";
  text.setAttribute("aria-label", "Message the team");
  const send = node("button", "Send", "primary");
  send.type = "submit";
  form.append(text, send);
  screen.append(pins, list, form);
  let shown = "";
  let pinsOpen = false;
  let data = { items: [], pinned: [] };
  const jump = (id) => {
    const el = document.getElementById("msg-" + id);
    if (!el) return notice("That message is older than the latest 150.");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 1600);
  };
  const pin = async (m, pinned) => {
    await api(`workspace/chat/${m.id}/pin`, { pinned });
    shown = "";
    await draw();
  };
  const drawPins = () => {
    // On phones the header sticks to the top; keep the pinned bar just below it.
    const header = document.querySelector("aside");
    pins.style.top =
      header && getComputedStyle(header).position === "sticky" ? header.offsetHeight + "px" : "0";
    pins.replaceChildren();
    pins.hidden = !data.pinned.length;
    if (!data.pinned.length) return;
    const top = data.pinned[0];
    const head = node("button", undefined, "pin-head");
    head.type = "button";
    head.setAttribute("aria-expanded", String(pinsOpen));
    head.append(
      node(
        "span",
        data.pinned.length > 1 ? `Pinned · ${data.pinned.length}` : "Pinned",
        "pin-label",
      ),
      node("span", top.body, "pin-text"),
      node("span", pinsOpen ? "Hide" : data.pinned.length > 1 ? "All" : "Open", "pin-more"),
    );
    head.onclick = () => {
      if (data.pinned.length === 1 && !pinsOpen) return jump(top.id);
      pinsOpen = !pinsOpen;
      drawPins();
    };
    pins.append(head);
    if (!pinsOpen) return;
    for (const m of data.pinned) {
      const row = node("div", undefined, "pin-row");
      const go = node("button", undefined, "pin-jump");
      go.type = "button";
      go.append(
        node("span", `${m.sender} · ${dueText(m.created_at)}`, "muted"),
        node("span", m.body),
      );
      go.onclick = () => jump(m.id);
      row.append(
        go,
        button("Unpin", () => pin(m, false), "small"),
      );
      pins.append(row);
    }
  };
  const draw = async () => {
    data = await api("workspace/chat");
    const key = JSON.stringify([
      data.items.map((m) => [m.id, m.pinned]),
      data.pinned.map((m) => m.id),
    ]);
    if (key === shown) return;
    const first = !shown;
    shown = key;
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 160;
    drawPins();
    list.replaceChildren();
    if (!data.items.length)
      list.append(node("p", "No messages yet. Say hello to the team.", "empty"));
    let lastDay = "";
    const today = dhakaDayOf(Date.now());
    const yesterday = dhakaDayOf(Date.now() - 86400000);
    for (const m of data.items) {
      const day = dhakaDayOf(m.created_at);
      if (day !== lastDay) {
        lastDay = day;
        list.append(
          node(
            "p",
            day === today
              ? "Today"
              : day === yesterday
                ? "Yesterday"
                : dhakaTime(m.created_at, { weekday: "short", day: "numeric", month: "short" }),
            "chat-day",
          ),
        );
      }
      const bubble = node("article", undefined, "chat-msg" + (m.mine ? " mine" : ""));
      bubble.id = "msg-" + m.id;
      const meta = node("p", undefined, "chat-meta");
      meta.append(
        node("strong", m.mine ? "You" : m.sender),
        document.createTextNode(
          " · " + dhakaTime(m.created_at, { hour: "numeric", minute: "2-digit", hour12: true }),
        ),
      );
      if (m.pinned) meta.append(node("span", "Pinned", "badge"));
      const tools = node("div", undefined, "chat-tools");
      tools.append(button(m.pinned ? "Unpin" : "Pin", () => pin(m, !m.pinned), "link"));
      if (m.can_delete)
        tools.append(
          button(
            "Delete",
            async () => {
              if (!confirm("Delete this message for everyone?")) return;
              await api(`workspace/chat/${m.id}/delete`, {});
              shown = "";
              await draw();
            },
            "link danger-link",
          ),
        );
      bubble.append(meta, node("p", m.body, "chat-body"), tools);
      list.append(bubble);
    }
    if (first || atBottom) window.scrollTo(0, document.body.scrollHeight);
  };
  const grow = () => {
    text.style.height = "auto";
    text.style.height = Math.min(text.scrollHeight, 160) + "px";
  };
  text.oninput = grow;
  // Enter sends on a keyboard; Shift+Enter (and Enter on phones) adds a new line.
  text.onkeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !matchMedia("(pointer: coarse)").matches) {
      e.preventDefault();
      form.requestSubmit();
    }
  };
  form.onsubmit = async (e) => {
    e.preventDefault();
    const body = text.value.trim();
    if (!body) return;
    try {
      send.disabled = true;
      await api("workspace/chat", { body });
      text.value = "";
      grow();
      await draw();
      window.scrollTo(0, document.body.scrollHeight);
    } catch (err) {
      report(err);
    } finally {
      send.disabled = false;
    }
  };
  await draw();
  // Near-real-time: check for new messages every 4 seconds while the chat is open and visible.
  const timer = setInterval(() => {
    if (!list.isConnected) return clearInterval(timer);
    if (!document.hidden) draw().catch(() => {});
  }, 4000);
}

let taskView = "Mine";
async function renderTasks() {
  const screen = $("screen");
  const admin = canPublishRole(me.role);
  const [{ items, now, week_start }, staff] = await Promise.all([
    api("workspace/tasks"),
    api("workspace/staff"),
  ]);
  const nowMs = new Date(now).getTime();
  const weekFrom = Date.parse(week_start + "T00:00:00Z") - 6 * 3600000;
  const weekTo = weekFrom + 7 * 86400000;
  const overdue = (t) => t.status !== "done" && t.due_at && new Date(t.due_at).getTime() < nowMs;
  const mine = (t) => t.assignees.some((a) => a.id === me.id);
  const views = {
    Mine: { label: "My tasks", pick: mine },
    Week: {
      label: "This week",
      pick: (t) =>
        t.due_at &&
        new Date(t.due_at).getTime() >= weekFrom &&
        new Date(t.due_at).getTime() < weekTo,
    },
    Overdue: { label: "Overdue", pick: overdue },
    All: { label: "Everyone", pick: () => true },
  };
  if (!views[taskView]) taskView = "Mine";
  const bar = node("div", undefined, "task-bar");
  const chips = node("div", undefined, "chips");
  chips.setAttribute("role", "group");
  chips.setAttribute("aria-label", "Show tasks");
  for (const [key, v] of Object.entries(views)) {
    const open = items.filter(
      (t) => v.pick(t) && (key === "Overdue" || t.status !== "done"),
    ).length;
    const b = button(`${v.label}${open ? " " + open : ""}`, () => {
      taskView = key;
      navigate("Tasks");
    });
    b.setAttribute("aria-pressed", String(key === taskView));
    if (key === "Overdue" && open) b.classList.add("warn");
    chips.append(b);
  }
  bar.append(chips);
  if (admin) bar.append(button("+ New task", () => taskForm(null, staff.items), "primary"));
  screen.append(bar);
  const shown = items.filter(views[taskView].pick);
  const open = shown.filter((t) => t.status !== "done");
  const done = shown.filter((t) => t.status === "done");
  if (!open.length)
    screen.append(
      node(
        "p",
        taskView === "Overdue"
          ? "Nothing overdue. Nice work."
          : taskView === "Mine"
            ? "No open tasks for you right now."
            : "No open tasks here.",
        "empty",
      ),
    );
  const listEl = node("div", undefined, "task-list");
  for (const t of open)
    listEl.append(taskCard(t, { admin, overdue: overdue(t), staff: staff.items }));
  screen.append(listEl);
  if (done.length) {
    const d = node("details", undefined, "task-done");
    d.append(node("summary", `Done (${done.length})`));
    const doneList = node("div", undefined, "task-list");
    for (const t of done) doneList.append(taskCard(t, { admin, staff: staff.items }));
    d.append(doneList);
    screen.append(d);
  }
}
function taskCard(t, { admin, overdue, staff }) {
  const card = node("article", undefined, "card task" + (t.status === "done" ? " is-done" : ""));
  const top = node("div", undefined, "task-top");
  top.append(node("h3", t.title));
  const canChange = t.can_status ?? (admin || t.assignees.some((a) => a.id === me.id));
  if (canChange) {
    const [, status] = select(
      "",
      [
        ["todo", "To do"],
        ["doing", "Doing"],
        ["done", "Done"],
      ],
      t.status,
    );
    status.className = "task-status s-" + t.status;
    status.setAttribute("aria-label", "Status of " + t.title);
    status.onchange = async () => {
      try {
        await api("workspace/tasks/" + t.id, { status: status.value });
        if (status.value === "done") notice("Marked done.");
        navigate("Tasks");
      } catch (e) {
        report(e);
      }
    };
    top.append(status);
  } else
    top.append(node("span", { todo: "To do", doing: "Doing", done: "Done" }[t.status], "badge"));
  card.append(top);
  const meta = node("p", undefined, "task-meta");
  if (t.due_at) {
    meta.append(node("span", "Due " + dueText(t.due_at), overdue ? "due overdue" : "due"));
    if (overdue) meta.append(node("span", "Overdue", "badge badge-danger"));
  } else meta.append(node("span", "No deadline", "muted"));
  if (t.assignees.length)
    meta.append(
      node(
        "span",
        "For " + t.assignees.map((a) => (a.id === me.id ? "you" : a.name)).join(", "),
        "muted",
      ),
    );
  if (t.assigned_by)
    meta.append(node("span", "From " + (t.created_by === me.id ? "you" : t.assigned_by), "muted"));
  card.append(meta);
  if (t.details) card.append(node("p", t.details, "task-details"));
  if (t.can_edit ?? admin) {
    const actions = node("div", undefined, "task-actions");
    actions.append(
      button("Edit", () => taskForm(t, staff), "small"),
      button(
        "Delete",
        async () => {
          if (!confirm(`Delete the task "${t.title}"?`)) return;
          await api(`workspace/tasks/${t.id}/delete`, {});
          navigate("Tasks");
        },
        "small danger",
      ),
    );
    card.append(actions);
  }
  return card;
}
function taskForm(task, staff) {
  const screen = $("screen");
  screen.replaceChildren();
  $("heading").textContent = task ? "Edit task" : "New task";
  const form = node("form", undefined, "card task-form");
  const [tl, title] = input("Task", task?.title, "text", 200);
  title.required = true;
  const [dl, details] = input("Details (optional)", task?.details || "", "textarea", 4000);
  details.rows = 3;
  const [wl, due] = input(
    "Deadline (Bangladesh time, optional)",
    dhakaInput(task?.due_at),
    "datetime-local",
  );
  const who = node("fieldset", undefined, "assignees");
  who.append(node("legend", "Assign to"));
  const picked = new Set((task?.assignees || []).map((a) => a.id));
  const boxes = [];
  for (const s of staff) {
    const l = node("label", undefined, "check");
    const box = node("input");
    box.type = "checkbox";
    box.value = s.id;
    box.checked = picked.has(s.id);
    boxes.push(box);
    l.append(box, document.createTextNode(`${s.name} (${s.role})`));
    who.append(l);
  }
  form.append(tl, dl, wl, who);
  let status;
  if (task) {
    const [sl, s] = select(
      "Status",
      [
        ["todo", "To do"],
        ["doing", "Doing"],
        ["done", "Done"],
      ],
      task.status,
    );
    status = s;
    form.append(sl);
  }
  form.append(
    node(
      "p",
      "People you add get an email, and a reminder 24 hours and 2 hours before the deadline.",
      "muted",
    ),
  );
  const actions = node("div", undefined, "actions");
  const save = node("button", task ? "Save" : "Create task", "primary");
  save.type = "submit";
  actions.append(
    save,
    button("Cancel", () => navigate("Tasks")),
  );
  form.append(actions);
  form.onsubmit = async (e) => {
    e.preventDefault();
    const body = {
      title: title.value,
      details: details.value,
      due: due.value || null,
      assignees: boxes.filter((b) => b.checked).map((b) => b.value),
      ...(status ? { status: status.value } : {}),
    };
    try {
      save.disabled = true;
      await api(task ? "workspace/tasks/" + task.id : "workspace/tasks", body);
      navigate("Tasks");
      notice(task ? "Task saved." : "Task created.");
    } catch (err) {
      report(err);
      save.disabled = false;
    }
  };
  screen.append(form);
  title.focus();
}

function dayStrip(days, today, count) {
  const strip = node("div", undefined, "day-strip");
  for (let i = count - 1; i >= 0; i--) {
    const day = new Date(Date.parse(today + "T00:00:00Z") - i * 86400000)
      .toISOString()
      .slice(0, 10);
    const m = days[day] || 0;
    const cell = node("span", undefined, "day-cell");
    cell.dataset.level = m ? (m < 30 ? "1" : m < 120 ? "2" : "3") : "0";
    const label = `${new Date(day + "T00:00:00Z").toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })}: ${m ? hours(m) : "not in"}`;
    cell.title = label;
    cell.setAttribute("aria-label", label);
    cell.setAttribute("role", "img");
    if (day === today) cell.classList.add("today");
    strip.append(cell);
  }
  return strip;
}
function statTile(label, value, sub) {
  const tile = node("div", undefined, "ws-stat");
  tile.append(node("span", label, "ws-stat-label"), node("strong", value));
  if (sub) tile.append(node("span", sub, "muted"));
  return tile;
}
let teamDays = 14;
async function renderProgress() {
  const screen = $("screen");
  const { me: s, today } = await api("workspace/progress");
  const tiles = node("div", undefined, "ws-stats");
  tiles.append(
    statTile(
      "Streak",
      `${s.streak} ${s.streak === 1 ? "day" : "days"}`,
      s.today_minutes ? "In today" : s.streak ? "Open the dashboard today to keep it" : "",
    ),
    statTile("Today", hours(s.today_minutes)),
    statTile("This week", hours(s.week_minutes)),
    statTile("Tasks done", String(s.tasks_done_week), "this week"),
  );
  const mine = node("section", undefined, "card");
  mine.append(
    node("h2", "Your last 2 weeks"),
    dayStrip(s.days, today, 14),
    node(
      "p",
      "Hours are approximate: they count while this dashboard is open and being used. Weeks start on Sunday.",
      "muted",
    ),
  );
  if (s.tasks_open)
    mine.append(
      button(
        `${s.tasks_open} open ${s.tasks_open === 1 ? "task" : "tasks"}${s.tasks_overdue ? `, ${s.tasks_overdue} overdue` : ""} →`,
        () => {
          taskView = s.tasks_overdue ? "Overdue" : "Mine";
          navigate("Tasks");
        },
        "small",
      ),
    );
  screen.append(tiles, mine);
  const team = await api("workspace/team?days=" + teamDays);
  const section = node("section", undefined, "team-progress");
  const head = node("div", undefined, "task-bar");
  head.append(node("h2", "Team"));
  const chips = node("div", undefined, "chips");
  for (const n of [14, 28]) {
    const b = button(`${n} days`, () => {
      teamDays = n;
      navigate("Progress");
    });
    b.setAttribute("aria-pressed", String(n === teamDays));
    chips.append(b);
  }
  head.append(chips);
  const inToday = team.items.filter((u) => u.today_minutes).map((u) => u.name);
  section.append(
    head,
    node(
      "p",
      (inToday.length ? "In today: " + inToday.join(", ") : "Nobody has been in yet today") +
        ". Each square is a day, today on the right; darker means more time.",
      "muted",
    ),
  );
  for (const u of team.items) {
    const card = node("article", undefined, "card person");
    const top = node("div", undefined, "task-top");
    top.append(node("h3", u.name), node("span", u.role, "badge"));
    card.append(
      top,
      node(
        "p",
        `Streak ${u.streak} · Today ${hours(u.today_minutes)} · This week ${hours(u.week_minutes)} · Tasks done ${u.tasks_done}/${u.tasks_assigned}` +
          (u.tasks_overdue ? ` · ${u.tasks_overdue} overdue` : ""),
        "task-meta",
      ),
      dayStrip(u.days, team.today, team.days),
    );
    section.append(card);
  }
  screen.append(section);
}
// Approximate active time: about once a minute, while this tab is visible AND was used in the last minute.
function startHeartbeat() {
  if (!STAFF.includes(me.role)) return;
  let lastInput = Date.now();
  const mark = () => (lastInput = Date.now());
  for (const type of ["pointerdown", "keydown", "wheel", "touchstart", "scroll"])
    addEventListener(type, mark, { passive: true, capture: true });
  const beat = () => {
    if (document.hidden || Date.now() - lastInput > 60000) return;
    api("workspace/ping", {}).catch(() => {});
  };
  beat();
  setInterval(beat, 60000);
}
// ---------- Mail (contact@ inbox), notifications and "install the app" (backend: inbox.js, push.js) ----------
const isIos =
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1 &&
    !/android/i.test(navigator.userAgent));
const standalone = () =>
  matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const pushSupported = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
const IOS_PUSH_NOTE =
  "iPhone and iPad: notifications work only after you add this app to your Home Screen (Share → Add to Home Screen) and open it from there. Needs iOS 16.4 or later.";
let installPrompt = null;
addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e;
  showInstallHint();
});
addEventListener("appinstalled", () => {
  installPrompt = null;
  $("install-hint")?.remove();
});
/** A small "Install the app" card: the browser's own prompt where supported, steps on iPhone. */
/** The full "Install the app" card for Settings → Notifications (the browser's prompt, or iPhone steps). */
function installCard() {
  if (standalone() || (!installPrompt && !isIos)) return null;
  const card = node("div", undefined, "card install-card");
  card.append(node("h2", "Install the app"));
  if (installPrompt)
    card.append(
      node(
        "p",
        "Add Scholars Cafe Studio to this device: it opens like an app and can show notifications.",
      ),
      button("Install", () => promptInstall(card), "primary"),
    );
  else
    card.append(
      node(
        "p",
        "On iPhone or iPad, open this page in Safari, tap Share, then “Add to Home Screen”.",
      ),
      node("p", IOS_PUSH_NOTE, "muted"),
    );
  return card;
}
async function promptInstall(el) {
  const p = installPrompt;
  if (!p) return;
  installPrompt = null;
  await p.prompt();
  await p.userChoice.catch(() => {});
  el?.remove();
  $("install-hint")?.remove();
}
const phoneLike = () => isIos || matchMedia("(max-width: 800px), (pointer: coarse)").matches;
/**
 * One slim banner above the screen (in the page flow, never over content), most important first:
 * iPhone in a Safari tab → "Add to Home Screen first"; notifications not decided yet → "Enable
 * notifications" (shown on every device, it is how alerts arrive); blocked → how to turn them back on;
 * else, on phones with the browser's install prompt → "Install". × remembers a dismissal.
 */
function bannerState() {
  if (!me || me.role === "student" || $("workspace").hidden) return null;
  if (isIos && !standalone()) return "ios-install";
  if (pushSupported() && Notification.permission === "default") return "enable";
  if (pushSupported() && Notification.permission === "denied") return "denied";
  if (!standalone() && phoneLike() && installPrompt) return "install";
  return null;
}
const DISMISS_KEY = {
  "ios-install": "install-hint",
  install: "install-hint",
  denied: "push-denied",
};
let enableLater = false;
function deniedHelp() {
  if (isIos)
    return "Notifications are off for SC Studio. Turn them on in iPhone Settings → Notifications → SC Studio → Allow Notifications (and Sounds, Badges).";
  if (/android/i.test(navigator.userAgent))
    return "Notifications are blocked. Turn them on: long-press the SC Studio icon → App info → Notifications → Allow (in Chrome: ⋮ → Settings → Site settings → Notifications).";
  return "Notifications are blocked. Click the site icon left of the address → Notifications → Allow, then reload.";
}
function showAlertsBanner() {
  $("install-hint")?.remove();
  const state = bannerState();
  if (!state || (state === "enable" && enableLater)) return;
  try {
    if (DISMISS_KEY[state] && localStorage.getItem(DISMISS_KEY[state]) === "dismissed") return;
  } catch {}
  const bar = node("div", undefined, "install-hint" + (state === "enable" ? " enable" : ""));
  bar.id = "install-hint";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Notifications");
  const text = node("p");
  if (state === "enable")
    text.append(
      node("strong", "Enable notifications"),
      " – you need this to get alerts for messages, tasks, mail and form submissions.",
    );
  else
    text.textContent = {
      "ios-install":
        "Add to Home Screen first: tap Share → “Add to Home Screen”, then open SC Studio from there to get notifications (iOS 16.4+).",
      denied: deniedHelp(),
      install: "Install SC Studio for quick access and notifications.",
    }[state];
  bar.append(text);
  if (state === "enable")
    bar.append(
      // requestPermission() must run right inside the tap (iOS 16.4+ ignores it otherwise).
      button(
        "Enable notifications",
        () => enableFromTap(Notification.requestPermission()),
        "primary",
      ),
      button("Later", () => {
        enableLater = true;
        bar.remove();
      }),
    );
  if (state === "ios-install") bar.append(button("How", () => navigate("Notifications")));
  if (state === "install") bar.append(button("Install", () => promptInstall(), "primary"));
  if (DISMISS_KEY[state]) {
    const close = button(
      "×",
      () => {
        try {
          localStorage.setItem(DISMISS_KEY[state], "dismissed");
        } catch {}
        bar.remove();
      },
      "install-close",
    );
    close.setAttribute("aria-label", "Dismiss");
    bar.append(close);
  }
  $("notice").before(bar);
}
function showInstallHint() {
  showAlertsBanner();
}
async function enableFromTap(asked) {
  try {
    await turnOnPush(asked);
    notice("Notifications are on for this device.");
  } catch (e) {
    report(e);
  }
  showAlertsBanner();
  refreshBell();
  if (section === "Notifications") render();
}

// In-app alert while the app is open: a short bundled sound and a badge on the menu item.
// Browsers (iOS Safari above all) only allow sound after the person has tapped the page once, so the
// first tap "unlocks" the audio element silently.
const chime = new Audio("/sounds/notify.wav");
chime.preload = "auto";
let soundReady = false;
addEventListener(
  "pointerdown",
  () => {
    if (soundReady) return;
    chime.muted = true;
    chime
      .play()
      .then(() => {
        chime.pause();
        chime.currentTime = 0;
        chime.muted = false;
        soundReady = true;
      })
      .catch(() => {});
  },
  true,
);
const newBySection = {};
function markSection(key) {
  const count = newBySection[key] || 0;
  const text = count > 9 ? "9+" : String(count);
  const tab = $("tabbar")?.querySelector(`[data-section="${CSS.escape(key)}"]`);
  const more = $("tabbar")?.querySelector('[data-section="More"]');
  for (const b of [tab, $("nav")?.querySelector(`[data-section="${CSS.escape(key)}"]`)])
    if (b && key !== "Mail") count ? (b.dataset.badge = text) : delete b.dataset.badge;
  // Screens without their own tab show the dot on "More".
  if (!tab && more) {
    const hidden = Object.entries(newBySection)
      .filter(([k]) => !$("tabbar").querySelector(`[data-section="${CSS.escape(k)}"]`))
      .reduce((n, [, v]) => n + v, 0);
    hidden ? (more.dataset.badge = hidden > 9 ? "9+" : String(hidden)) : delete more.dataset.badge;
  }
}
function inAppAlert(open) {
  if (document.visibilityState === "visible" && soundReady) {
    chime.currentTime = 0;
    chime.play().catch(() => {});
  }
  if (open && open !== section) {
    newBySection[open] = (newBySection[open] || 0) + 1;
    markSection(open);
  }
  if (open === "Mail")
    api("inbox")
      .then((r) => setMailBadge(r.unread))
      .catch(() => {});
  refreshBell();
}
function clearSectionBadge(key) {
  markAlertsRead(key);
  if (!newBySection[key]) return;
  delete newBySection[key];
  markSection(key);
}
// ---------- The bell: recent alerts, unread count, and the app icon badge (Badging API) ----------
const BELL_ICON = "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0";
const bell = { unread: 0, items: [] };
const setAppBadge = (n) =>
  (n > 0 ? navigator.setAppBadge?.(n) : navigator.clearAppBadge?.())?.catch?.(() => {});
const clearAppBadge = () => setAppBadge(0);
function buildBell() {
  if ($("bell") || !me || me.role === "student") return;
  const wrap = node("div", undefined, "bell-wrap");
  const b = node("button", undefined, "bell");
  b.id = "bell";
  b.type = "button";
  b.setAttribute("aria-label", "Notifications");
  b.setAttribute("aria-expanded", "false");
  b.setAttribute("aria-controls", "bell-panel");
  b.append(icon(BELL_ICON), node("span", "", "bell-count"));
  const panel = node("div", undefined, "bell-panel card");
  panel.id = "bell-panel";
  panel.hidden = true;
  b.onclick = () => toggleBell(panel.hidden);
  wrap.append(b, panel);
  document.querySelector("main header").append(wrap);
  document.addEventListener("click", (e) => {
    if (!panel.hidden && !wrap.contains(e.target)) toggleBell(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) toggleBell(false);
  });
}
function drawBell() {
  const count = $("bell")?.querySelector(".bell-count");
  if (count) {
    count.textContent = bell.unread > 9 ? "9+" : String(bell.unread);
    count.hidden = !bell.unread;
    $("bell").setAttribute(
      "aria-label",
      bell.unread ? `Notifications, ${bell.unread} unread` : "Notifications",
    );
  }
  setAppBadge(bell.unread);
  const panel = $("bell-panel");
  if (!panel || panel.hidden) return;
  const head = node("div", undefined, "bell-head");
  head.append(node("strong", "Notifications"));
  if (bell.unread)
    head.append(
      button(
        "Mark all read",
        async () => {
          await markAlertsRead();
        },
        "link",
      ),
    );
  const list = node("div", undefined, "bell-list");
  for (const a of bell.items) {
    const item = node("button", undefined, "bell-item" + (a.read ? "" : " unread"));
    item.type = "button";
    item.append(
      node("span", a.title, "bell-title"),
      node("span", a.body, "bell-body"),
      node("time", mailDate(a.created_at)),
    );
    item.onclick = () => {
      toggleBell(false);
      if (a.open && $("nav").querySelector(`[data-section="${CSS.escape(a.open)}"]`))
        navigate(a.open);
      else markAlertsRead(a.open);
    };
    list.append(item);
  }
  if (!bell.items.length) list.append(node("p", "No alerts yet.", "empty"));
  const foot = button(
    "Notification settings",
    () => {
      toggleBell(false);
      navigate("Notifications");
    },
    "link",
  );
  panel.replaceChildren(head, list, foot);
}
function toggleBell(open) {
  const panel = $("bell-panel");
  if (!panel) return;
  panel.hidden = !open;
  $("bell").setAttribute("aria-expanded", String(open));
  if (open) refreshBell();
}
async function refreshBell() {
  if (!$("bell")) return;
  try {
    Object.assign(bell, await api("push/alerts"));
  } catch {
    return;
  }
  drawBell();
}
/** Marks alerts read: all of them, or only those for one screen (when that screen is opened). */
async function markAlertsRead(open) {
  if (open !== undefined && !bell.items.some((a) => !a.read && a.open === open)) return;
  const r = await api("push/alerts/read", open ? { open } : {}).catch(() => null);
  if (r) await refreshBell();
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    refreshBell();
    showAlertsBanner(); // permission may have changed in Settings meanwhile
  }
});
setInterval(() => {
  if (document.visibilityState === "visible") refreshBell();
}, 60000);
const b64url = (s) =>
  Uint8Array.from(
    atob(
      s
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(s.length / 4) * 4, "="),
    ),
    (c) => c.charCodeAt(0),
  );
function deviceName() {
  const ua = navigator.userAgent;
  const os = /android/i.test(ua)
    ? "Android"
    : isIos
      ? "iPhone/iPad"
      : /mac/i.test(ua)
        ? "Mac"
        : /win/i.test(ua)
          ? "Windows"
          : "computer";
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /firefox|fxios/i.test(ua)
      ? "Firefox"
      : /chrome|crios/i.test(ua)
        ? "Chrome"
        : /safari/i.test(ua)
          ? "Safari"
          : "Browser";
  return `${browser} on ${os}${standalone() ? " (app)" : ""}`;
}
async function currentSubscription() {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}
async function turnOnPush(asked) {
  if (!pushSupported())
    throw Error(isIos && !standalone() ? IOS_PUSH_NOTE : "This browser can't show notifications.");
  // Asked synchronously inside the tap that called this (required on iPhone).
  const permission = await (asked ?? Notification.requestPermission());
  if (permission !== "granted")
    throw Error(permission === "denied" ? deniedHelp() : "Notifications were not allowed.");
  const reg = await navigator.serviceWorker.ready;
  const { publicKey } = await api("push");
  const key = b64url(publicKey);
  let sub = await reg.pushManager.getSubscription();
  const same = (a) =>
    a && new Uint8Array(a).every((v, i) => v === key[i]) && a.byteLength === key.length;
  if (sub && !same(sub.options?.applicationServerKey)) {
    await sub.unsubscribe();
    sub = null;
  }
  try {
    sub ||= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  } catch (e) {
    throw Error("This device couldn't register for push: " + (e?.message || e?.name || "error"));
  }
  await api("push/subscribe", { ...sub.toJSON(), device: deviceName() });
}
async function turnOffPush() {
  const sub = await currentSubscription();
  if (!sub) return;
  await api("push/unsubscribe", { endpoint: sub.endpoint }).catch(() => {});
  await sub.unsubscribe();
}
/** Keeps the server's copy of this device's subscription current (it may have been cleaned up). */
async function syncPush() {
  if (!pushSupported() || Notification.permission !== "granted") return;
  const sub = await currentSubscription();
  // Allowed but never registered (or the registration was lost): register now, no tap needed.
  if (!sub) return turnOnPush(Promise.resolve("granted"));
  await api("push/subscribe", { ...sub.toJSON(), device: deviceName() });
}

async function renderNotifications() {
  const screen = $("screen");
  const data = await api("push");
  const sub = await currentSubscription().catch(() => null);
  const on = Boolean(sub) && Notification.permission === "granted";
  const card = node("article", undefined, "card");
  card.append(
    node("h2", "This device"),
    node(
      "p",
      on ? "Notifications are on for this device." : "Notifications are off for this device.",
    ),
  );
  const actions = node("div", undefined, "actions");
  if (on)
    actions.append(
      button("Send a test", async () => {
        const r = await api("push/test", {});
        testResults(results, r);
      }),
      button("Turn off", async () => {
        await turnOffPush();
        notice("Notifications are off for this device.");
        render();
      }),
    );
  else
    actions.append(
      button(
        "Turn on notifications",
        async () => {
          await turnOnPush();
          notice("Notifications are on for this device.");
          render();
        },
        "primary",
      ),
    );
  card.append(actions);
  const results = node("div", undefined, "push-results");
  results.setAttribute("aria-live", "polite");
  card.append(results);
  if (Notification?.permission === "denied") card.append(node("p", deniedHelp(), "muted"));
  if (isIos || !pushSupported()) card.append(node("p", IOS_PUSH_NOTE, "muted"));
  screen.append(card);

  // What this device reports, to find out quickly why nothing arrives.
  const reg = await navigator.serviceWorker?.getRegistration().catch(() => null);
  const diag = node("article", undefined, "card push-diag");
  const rows = [
    ["Notifications permission", pushSupported() ? Notification.permission : "not supported here"],
    ["Opened as installed app", standalone() ? "yes" : "no (browser tab)"],
    [
      "Service worker",
      reg?.active ? "active, scope " + new URL(reg.scope).pathname : "not running",
    ],
    ["Registered for push", sub ? "yes, via " + new URL(sub.endpoint).hostname : "no"],
    ["Your devices on the server", String(data.devices.length)],
    ["App icon badge", "setAppBadge" in navigator ? "supported" : "not supported here"],
  ];
  diag.append(node("h2", "Check this device"));
  const dl = node("dl");
  for (const [k, v] of rows) dl.append(node("dt", k), node("dd", v));
  diag.append(dl);
  screen.append(diag);

  const what = node("article", undefined, "card");
  const list = node("ul");
  for (const t of [
    "A new team chat message (pinned messages are marked 📌).",
    "A task assigned to you, and reminders before its deadline.",
    ...(canPublishRole(me.role)
      ? ["A new email to contact@scholarscafe.com.", "A new form submission or website inquiry."]
      : []),
  ])
    list.append(node("li", t));
  what.append(
    node("h2", "What you'll get"),
    list,
    node(
      "p",
      "Notifications show only a short preview. Tap one to open the right screen.",
      "muted",
    ),
    node(
      "p",
      "Each one plays your device's notification sound. iPhone: if you hear nothing, open Settings → Notifications → SC Studio and turn on Sounds (and check the silent switch). While the app is open it plays a short sound too, after your first tap.",
      "muted",
    ),
  );
  screen.append(what);

  const install = installCard();
  if (install) screen.append(install);

  screen.append(node("h2", "Your devices"));
  for (const d of data.devices) {
    const row = node("div", undefined, "card row");
    row.append(
      node("span", d.device || "Device"),
      node(
        "span",
        d.last_error
          ? `Last push failed (${d.last_status || "network"}): ${d.last_error}`
          : d.last_ok_at
            ? "Last push delivered " + new Date(d.last_ok_at).toLocaleString()
            : "Added " + new Date(d.created_at).toLocaleDateString(),
        "badge" + (d.last_error ? " warn" : ""),
      ),
      button("Remove", async () => {
        if (sub && (await sha16(sub.endpoint)) === d.key) await sub.unsubscribe().catch(() => {});
        await api("push/unsubscribe", { id: d.id });
        render();
      }),
    );
    screen.append(row);
  }
  if (!data.devices.length) screen.append(node("p", "No devices yet.", "empty"));
}
/** Shows exactly what each push service (Apple, Google, Mozilla, Microsoft) answered to the test. */
function testResults(box, r) {
  box.replaceChildren();
  if (!r.results.length) {
    box.append(
      node("p", "No devices are registered for you yet. Tap Turn on notifications first.", "muted"),
    );
    return;
  }
  for (const x of r.results) {
    const line = node("p", undefined, x.ok ? "ok" : "error");
    line.textContent = x.ok
      ? `✓ ${x.device}: accepted by ${x.service} (${x.status}). It should arrive in a few seconds.`
      : `✗ ${x.device}: ${x.service} answered ${x.status || "no response"}${x.body ? " — " + x.body : ""}${x.gone ? " (removed: turn notifications on again on that device)" : ""}`;
    box.append(line);
  }
}
async function sha16(text) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(h)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

const previewState = { id: null, phone: false, text: false, theme: "light" };

// "Email style: Light / Dark" for mail sent from the dashboard. Dark mail keeps its colours in phone dark
// mode (Outlook and Gmail repaint light mail grey). The last choice is remembered per user on this device.
const emailThemeKey = () => `email-theme:${me?.id || ""}`;
function savedEmailTheme() {
  try {
    return localStorage.getItem(emailThemeKey()) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}
function emailThemeSwitch(onChange, { value = savedEmailTheme(), remember = true } = {}) {
  const box = node("div", undefined, "email-theme");
  box.setAttribute("role", "group");
  box.setAttribute("aria-label", "Email style");
  let current = value;
  const opts = [
    ["light", "Light"],
    ["dark", "Dark"],
  ].map(([v, text]) => [v, button(text, () => pick(v))]);
  const paint = () => {
    for (const [v, b] of opts) b.setAttribute("aria-pressed", String(v === current));
  };
  function pick(v) {
    if (v === current) return;
    current = v;
    if (remember)
      try {
        localStorage.setItem(emailThemeKey(), v);
      } catch {
        /* private mode: the choice just isn't remembered */
      }
    paint();
    onChange?.(v);
  }
  box.append(node("span", "Email style", "email-theme-label"), ...opts.map(([, b]) => b));
  paint();
  return {
    el: box,
    get value() {
      return current;
    },
  };
}
async function renderEmailPreviews() {
  const screen = $("screen");
  const dark = previewState.theme === "dark" ? "?theme=dark" : "";
  const { items } = await api("email-previews" + dark);
  const current = items.find((p) => p.id === previewState.id) || items[0];
  previewState.id = current.id;
  const bar = node("div", undefined, "mail-bar");
  const [, pick] = select(
    "Email",
    items.map((p) => [p.id, p.label]),
    current.id,
  );
  pick.setAttribute("aria-label", "Choose an email");
  pick.onchange = () => {
    previewState.id = pick.value;
    render();
  };
  const toggle = (labelText, key) => {
    const b = button(labelText, () => {
      previewState[key] = !previewState[key];
      render();
    });
    b.setAttribute("aria-pressed", String(previewState[key]));
    return b;
  };
  const style = emailThemeSwitch(
    (v) => {
      previewState.theme = v;
      render();
    },
    { value: previewState.theme, remember: false },
  );
  bar.append(pick, toggle("Phone width", "phone"), toggle("Plain text", "text"), style.el);
  screen.append(bar);
  const meta = node("div", undefined, "card preview-meta");
  for (const [k, v] of [
    ["Subject", current.subject],
    ["From", current.from],
    ["To", current.to],
    ["Reply-To", current.replyTo || "—"],
  ]) {
    const line = node("p");
    line.append(node("b", k + ": "), document.createTextNode(v));
    meta.append(line);
  }
  screen.append(meta);
  if (previewState.text) {
    screen.append(node("pre", current.text, "card preview-text"));
    return;
  }
  const frame = node(
    "iframe",
    undefined,
    "mail-body preview-frame" + (previewState.phone ? " phone" : ""),
  );
  frame.setAttribute("sandbox", "allow-popups allow-popups-to-escape-sandbox");
  frame.setAttribute("referrerpolicy", "no-referrer");
  frame.title = "Email preview";
  frame.src = "/api/email-previews/" + encodeURIComponent(current.id) + dark;
  screen.append(frame);
}

const mailState = { q: "", unread: false, open: null, images: false, folder: "inbox" };
const mailDate = (t) => {
  const d = new Date(t);
  return d.toDateString() === new Date().toDateString()
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "numeric", month: "short" });
};
function setMailBadge(unread) {
  for (const b of document.querySelectorAll('#nav [data-section="Mail"]'))
    b.textContent = label("Mail") + (unread ? ` (${unread})` : "");
}
async function renderContactMail() {
  const screen = $("screen");
  const sent = mailState.folder === "sent";
  const data = await api(
    "inbox?" +
      new URLSearchParams({
        q: mailState.q,
        filter: mailState.unread && !sent ? "unread" : "",
        folder: mailState.folder,
      }),
  );
  setMailBadge(data.unread);
  if (!data.connected)
    screen.append(
      node(
        "p",
        "Not connected. The contact@ mailbox appears here once the owner adds CONTACT_IMAP_USER and CONTACT_IMAP_PASSWORD in hPanel (Node.js app → Environment variables) and restarts the app.",
        "card notice-card",
      ),
    );
  else if (data.status && !data.status.ok)
    screen.append(node("p", "Last check failed: " + data.status.reason, "card notice-card"));

  const bar = node("form", undefined, "mail-bar");
  const search = node("input");
  search.type = "search";
  search.placeholder = "Search mail";
  search.value = mailState.q;
  search.maxLength = 100;
  search.setAttribute("aria-label", "Search mail");
  bar.onsubmit = (e) => {
    e.preventDefault();
    mailState.q = search.value.trim();
    mailState.open = null;
    render();
  };
  const compose = button(
    "✏️ Compose",
    () => openComposer(data.can_reply),
    "primary mail-compose-btn",
  );
  const folder = (key, text) => {
    const b = button(text, () => {
      mailState.folder = key;
      mailState.open = null;
      render();
    });
    b.setAttribute("aria-pressed", String(mailState.folder === key));
    return b;
  };
  bar.append(compose, folder("inbox", "Inbox"), folder("sent", "Sent"), search);
  if (!sent) {
    const unreadChip = button(`Unread${data.unread ? " " + data.unread : ""}`, () => {
      mailState.unread = !mailState.unread;
      render();
    });
    unreadChip.setAttribute("aria-pressed", String(mailState.unread));
    bar.append(unreadChip);
  }
  if (data.connected)
    bar.append(
      button("Check now", async () => {
        const r = await api("inbox/sync", {});
        notice(r.added ? `${r.added} new message${r.added === 1 ? "" : "s"}.` : "No new mail.");
        render();
      }),
    );
  screen.append(bar);

  const layout = node("div", undefined, "mail" + (mailState.open ? " reading" : ""));
  const list = node("div", undefined, "mail-list");
  list.setAttribute("role", "list");
  for (const m of data.items) {
    const b = node("button", undefined, "mail-item" + (m.read ? "" : " unread"));
    b.type = "button";
    b.setAttribute("role", "listitem");
    if (m.id === mailState.open) b.setAttribute("aria-current", "true");
    const top = node("span", undefined, "mail-top");
    top.append(
      node("span", sent ? "To: " + m.to : m.from_name || m.from_email, "mail-from"),
      node("time", mailDate(m.received_at)),
    );
    b.append(
      top,
      node(
        "span",
        (m.replied ? "↩ " : "") + (m.has_attachments ? "📎 " : "") + m.subject,
        "mail-subject",
      ),
      node("span", m.snippet, "mail-snippet"),
    );
    b.onclick = () => {
      mailState.open = m.id;
      mailState.images = false;
      render();
    };
    list.append(b);
  }
  if (!data.items.length)
    list.append(
      node(
        "p",
        mailState.q
          ? "No messages match your search."
          : sent
            ? "Nothing sent yet."
            : "No mail yet.",
        "empty",
      ),
    );
  const reader = node("section", undefined, "mail-reader");
  layout.append(list, reader);
  screen.append(layout);
  const opened = data.items.find((m) => m.id === mailState.open);
  if (opened && !opened.read) {
    // Opening a message marks it read on the server; reflect that at once.
    setMailBadge(data.unread - 1);
    list.querySelector('[aria-current="true"]')?.classList.remove("unread");
  }
  if (mailState.open)
    await renderMailMessage(reader, data.can_reply).catch((e) => {
      mailState.open = null;
      report(e);
    });
  else reader.append(node("p", "Choose a message to read it.", "empty"));
}
async function renderMailMessage(reader, canReply) {
  const m = await api("inbox/" + mailState.open);
  const head = node("div", undefined, "mail-head");
  head.append(
    button(
      "← Back",
      () => {
        mailState.open = null;
        render();
      },
      "mail-back",
    ),
    node("h2", m.subject),
    node(
      "p",
      m.sent
        ? `From ${m.from_email} · To: ${m.to}`
        : `${m.from_name ? m.from_name + " · " : ""}${m.from_email}`,
      "mail-meta",
    ),
    node("p", new Date(m.received_at).toLocaleString(), "mail-meta"),
  );
  const actions = node("div", undefined, "actions");
  if (!m.sent)
    actions.append(
      button("Mark unread", async () => {
        await api(`inbox/${m.id}/read`, { read: false });
        mailState.open = null;
        render();
      }),
    );
  if (m.has_remote_images && !mailState.images)
    actions.append(
      button("Show images", () => {
        mailState.images = true;
        frame.src = `/api/inbox/${m.id}/view?images=1`;
        actions.lastChild.remove();
      }),
    );
  head.append(actions);
  if (m.has_remote_images && !mailState.images)
    head.append(node("p", "Remote images are blocked to protect your privacy.", "muted"));
  // No scripts and no same-origin access: the frame's own CSP (see /api/inbox/:id/view) also forbids them.
  const frame = node("iframe", undefined, "mail-body");
  frame.setAttribute("sandbox", "allow-popups allow-popups-to-escape-sandbox");
  frame.setAttribute("referrerpolicy", "no-referrer");
  frame.title = "Message";
  frame.src = `/api/inbox/${m.id}/view${mailState.images ? "?images=1" : ""}`;
  reader.append(head, frame);
  if (m.attachments.length) {
    const a = node("ul", undefined, "mail-attachments");
    for (const f of m.attachments)
      a.append(node("li", `📎 ${f.name} (${Math.max(1, Math.round(f.size / 1024))} KB)`));
    reader.append(a, node("p", "Open webmail to download attachments.", "muted"));
  }
  for (const r of m.replies) {
    const c = node("div", undefined, "card mail-reply-sent");
    c.append(
      node(
        "p",
        `Replied by ${(r.by || "team").split("@")[0]} · ${new Date(r.at).toLocaleString()}`,
        "mail-meta",
      ),
      node("p", r.body, "pre"),
    );
    reader.append(c);
  }
  if (m.sent) return;
  const form = node("form", undefined, "card mail-compose");
  const [bl, body] = input(`Reply to ${m.from_email}`, "", "textarea", 20000);
  body.rows = 6;
  body.required = true;
  const send = node("button", "Send reply", "primary");
  send.type = "submit";
  const replyStyle = emailThemeSwitch();
  form.append(bl, node("p", "Sent from contact@scholarscafe.com.", "muted"), replyStyle.el, send);
  if (!canReply) {
    send.disabled = true;
    form.append(node("p", "Replies need CONTACT_IMAP_PASSWORD in hPanel.", "muted"));
  }
  form.onsubmit = async (e) => {
    e.preventDefault();
    send.disabled = true;
    try {
      await api(`inbox/${m.id}/reply`, { body: body.value, theme: replyStyle.value });
      notice("Reply queued. It goes out from contact@ within a minute.");
      render();
    } catch (err) {
      send.disabled = false;
      report(err);
    }
  };
  reader.append(form);
}
// Compose: a new email from contact@ in the branded template. Desktop: a modal with a live preview beside
// the form. Phone: a full-screen sheet with Write / Preview tabs and a sticky Send / Cancel bar.
// The preview is rendered by the server (same template as the real mail) in a sandboxed frame.
function openComposer(canSend) {
  if (document.querySelector(".compose-overlay")) return;
  const overlay = node("div", undefined, "compose-overlay");
  const sheet = node("div", undefined, "compose");
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.setAttribute("aria-labelledby", "compose-title");
  const head = node("div", undefined, "compose-head");
  const title = node("h2", "New email");
  title.id = "compose-title";
  const tabs = node("div", undefined, "compose-tabs");
  tabs.setAttribute("role", "tablist");
  const tab = (text, key) => {
    const b = button(text, () => show(key));
    b.setAttribute("role", "tab");
    b.dataset.tab = key;
    return b;
  };
  tabs.append(tab("Write", "write"), tab("Preview", "preview"));
  head.append(title, tabs);

  const form = node("form", undefined, "compose-form");
  form.noValidate = true;
  const [toL, to] = input("To", "", "text", 1000);
  to.type = "email";
  to.multiple = true;
  to.autocomplete = "email";
  to.inputMode = "email";
  to.autocapitalize = "off";
  to.spellcheck = false;
  to.placeholder = "name@example.com, another@example.com";
  const [subL, subject] = input("Subject", "", "text", 160);
  const [bodyL, body] = input("Message", "", "textarea", 20000);
  body.rows = 12;
  const tools = node("div", undefined, "compose-tools");
  const wrap = (before, after, fallback) => {
    const { selectionStart: a, selectionEnd: b, value } = body;
    const picked = value.slice(a, b) || fallback;
    body.setRangeText(before + picked + after, a, b, "select");
    body.focus();
    schedule();
  };
  tools.append(
    button("B", () => wrap("**", "**", "bold text"), "compose-tool compose-bold"),
    button(
      "Link",
      () => {
        const url = (prompt("Link address (https://…)", "https://") || "").trim();
        if (!/^https:\/\/\S+$/.test(url)) return;
        wrap("[", `](${url})`, "link text");
      },
      "compose-tool",
    ),
    node("span", "**bold**, [text](https://…), blank line = new paragraph", "muted"),
  );
  form.append(toL, subL, bodyL, tools);
  const from = node("p", "Sent from contact@scholarscafe.com with the branded footer.", "muted");
  const error = node("p", undefined, "compose-error");
  error.setAttribute("role", "alert");
  error.hidden = true;
  form.append(from, error);

  const previewPane = node("div", undefined, "compose-preview");
  const frame = node("iframe", undefined, "compose-frame");
  frame.setAttribute("sandbox", "allow-popups allow-popups-to-escape-sandbox");
  frame.setAttribute("referrerpolicy", "no-referrer");
  frame.title = "Email preview";
  const style = emailThemeSwitch(() => refresh());
  const previewHead = node("div", undefined, "compose-preview-head");
  previewHead.append(style.el);
  previewPane.append(previewHead, frame);

  const panes = node("div", undefined, "compose-panes");
  panes.append(form, previewPane);

  const bar = node("div", undefined, "compose-bar");
  const cancel = button("Cancel", () => close());
  const send = node("button", "Send", "primary");
  send.type = "button";
  if (!canSend) {
    send.disabled = true;
    from.textContent = "Sending needs CONTACT_IMAP_PASSWORD in hPanel.";
  }
  bar.append(cancel, send);
  sheet.append(head, panes, bar);
  overlay.append(sheet);
  document.body.append(overlay);
  document.body.classList.add("compose-open");

  let timer = 0;
  let seq = 0;
  const visible = () => getComputedStyle(previewPane).display !== "none";
  async function refresh() {
    if (!visible()) return;
    const n = ++seq;
    try {
      const r = await api("inbox/compose/preview", {
        to: to.value,
        subject: subject.value,
        body: body.value,
        theme: style.value,
      });
      if (n === seq) frame.src = r.url;
    } catch {
      /* the preview is a convenience; sending shows real errors */
    }
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(refresh, 500);
  }
  function show(key) {
    sheet.dataset.tab = key;
    for (const b of tabs.children) b.setAttribute("aria-selected", String(b.dataset.tab === key));
    if (key === "preview") refresh();
  }
  const dirty = () => Boolean(to.value.trim() || subject.value.trim() || body.value.trim());
  function close(force) {
    if (!force && dirty() && !confirm("Discard this email?")) return;
    clearTimeout(timer);
    document.removeEventListener("keydown", onKey);
    document.body.classList.remove("compose-open");
    overlay.remove();
  }
  function onKey(e) {
    if (e.key === "Escape") close();
  }
  document.addEventListener("keydown", onKey);
  for (const el of [to, subject, body]) el.addEventListener("input", schedule);
  const fail = (msg, field) => {
    error.textContent = msg;
    error.hidden = false;
    if (field) {
      show("write");
      field.focus();
    }
  };
  async function submit() {
    error.hidden = true;
    const list = to.value.split(/[,;\s]+/).filter(Boolean);
    if (!list.length) return fail("Add at least one recipient.", to);
    if (list.length > 5) return fail("Send to at most 5 people at once.", to);
    const bad = list.find((a) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a));
    if (bad) return fail(`"${bad}" is not a valid email address.`, to);
    if (!subject.value.trim()) return fail("Add a subject.", subject);
    if (!body.value.trim()) return fail("Write a message.", body);
    send.disabled = true;
    send.textContent = "Sending…";
    try {
      const r = await api("inbox/compose", {
        to: to.value,
        subject: subject.value,
        body: body.value,
        theme: style.value,
      });
      close(true);
      notice(`Sent to ${r.to.join(", ")}. It goes out from contact@ within a minute.`);
      mailState.folder = "sent";
      mailState.open = null;
      render();
    } catch (err) {
      send.disabled = false;
      send.textContent = "Send";
      fail(err.message || "Sending failed. Try again.");
    }
  }
  send.onclick = submit;
  form.onsubmit = (e) => {
    e.preventDefault();
    submit();
  };
  show("write");
  refresh();
  to.focus();
}
// ---------- Mobile: bottom tab bar (up to 5 tabs) and a "More" sheet with the full menu ----------
const TAB_ICONS = {
  Home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  "My courses":
    "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  Resources: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.2 5.8-2.1 6.3-6.3 2.1 2.1-6.3z",
  Documents: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6",
  Messages: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  Account: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  Overview: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  Leads:
    "M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
  Students:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  More: "M4 6h16M4 12h16M4 18h16",
  "Team chat":
    "M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-.9L3 20l1.1-4A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z",
  Tasks: "M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9",
  Progress: "M3 3v18h18M7 15l4-4 3 3 6-6",
  Bookings:
    "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
};
const TAB_LABELS = {
  "My courses": "Courses",
  Account: "Profile",
  Overview: "Website",
  "Team chat": "Chat",
};
function icon(path) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  svg.append(p);
  return svg;
}
function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  $("tabbar")?.querySelector('[data-section="More"]')?.setAttribute("aria-expanded", String(open));
}
function buildTabbar(keys) {
  const priority = {
    student: ["Home", "My courses", "Resources", "Messages", "Documents", "Account"],
    mentor: ["Leads", "Students", "Documents", "Messages"],
  }[me.role] || ["Team chat", "Tasks", "Progress", "Leads", "Bookings", "Overview"];
  const tabs =
    keys.length <= 5 ? keys : [...priority.filter((k) => keys.includes(k)).slice(0, 4), "More"];
  const bar = node("nav", undefined, "tabbar");
  bar.id = "tabbar";
  bar.setAttribute("aria-label", "Main");
  for (const key of tabs) {
    const b = node("button");
    b.type = "button";
    b.dataset.section = key;
    b.append(icon(TAB_ICONS[key] || TAB_ICONS.More), node("span", TAB_LABELS[key] || label(key)));
    if (key === "More") {
      b.setAttribute("aria-expanded", "false");
      b.setAttribute("aria-controls", "nav");
      b.onclick = () => setMenu(!document.body.classList.contains("menu-open"));
    } else
      b.onclick = () => {
        setMenu(false);
        // Tapping the tab you're on scrolls to the top and refreshes it, as in phone apps.
        if (key === section) window.scrollTo({ top: 0, behavior: "smooth" });
        navigate(key);
      };
    bar.append(b);
  }
  const backdrop = node("div", undefined, "menu-backdrop");
  backdrop.onclick = () => setMenu(false);
  document.body.append(backdrop, bar);
  return tabs.filter((k) => k !== "More");
}
// Desktop sidebar: show or fold the rarely used screens. Phones always list them in the "More" sheet.
function setMoreOpen(open, remember = true) {
  $("nav").querySelector(".nav-more")?.setAttribute("aria-expanded", String(open));
  $("nav-more-list")?.classList.toggle("open", open);
  if (remember)
    try {
      localStorage.setItem("nav-more", open ? "open" : "closed");
    } catch {}
}
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
try {
  me = await whoAmI();
  if (!me) throw Object.assign(Error("Please sign in."), { signedOut: true });
  const catalogResponse = await fetch("/cms-copy-catalog.json");
  if (catalogResponse.ok) catalog = await catalogResponse.json();
  const retiredResponse = await fetch("/cms-retired-keys.json").catch(() => null);
  if (retiredResponse?.ok) retired = new Set(await retiredResponse.json());
  if (!["mentor", "student"].includes(me.role)) await refresh();
  if (me.role === "student") myFeatures = await api("lms/my/features").catch(() => ({}));
  $("boot").hidden = true;
  $("login").hidden = true;
  $("workspace").hidden = false;
  $("identity").textContent = me.email + " · " + me.role;
  // Sidebar: [group heading, sections]. Editors only see the website; mentors and students get short lists.
  const website = [
    "copy",
    "sections",
    "seo",
    "hero",
    "blogs",
    "resources",
    "courses",
    "universities",
    "team",
    "feedback",
    "faqs",
    "colleges",
    "prompts",
    "promptAngles",
    "toolValues",
    // "countries" is hidden: the site is USA-only now. Its rows stay in the database.
    "links",
    "Media",
  ];
  const navFor =
    me.role === "student"
      ? [
          [
            "",
            [
              "Home",
              "My courses",
              "Resources",
              ...(myFeatures.uploads || myFeatures.reviews ? ["Documents"] : []),
              ...(myFeatures.messaging ? ["Messages"] : []),
              "Account",
            ],
          ],
        ]
      : me.role === "mentor"
        ? [
            ["", ["Leads", "Students", "Documents", "Messages"]],
            ["Team", ["Team chat", "Tasks", "Progress"]],
            ["Settings", ["Notifications"]],
          ]
        : [
            // Daily screens first; everything else sits under "More" (see DAILY below).
            [
              "",
              [
                "Team chat",
                "Tasks",
                "Progress",
                ...(me.role === "editor" ? [] : ["Leads", "Bookings"]),
              ],
            ],
            [
              "Website",
              me.visual ? ["Overview", "Visual editor", ...website] : ["Overview", ...website],
            ],
            ...(me.role === "editor"
              ? [["Settings", ["Notifications"]]]
              : [
                  [
                    "Students",
                    [
                      "Students",
                      "Packages",
                      "Student courses",
                      "Student resources",
                      "Documents",
                      "Messages",
                      "Reviews",
                    ],
                  ],
                  [
                    "Inbox",
                    ["Mail", "Forms", "Private feedback", "Newsletter", "ECA alerts", "Agreements"],
                  ],
                  // The audit log is for the Super Admin only.
                  [
                    "Settings",
                    [
                      "Access",
                      "Email delivery",
                      "Preview emails",
                      "Notifications",
                      ...(me.super_admin ? ["Activity"] : []),
                    ],
                  ],
                ]),
          ];
  if (!["mentor", "student"].includes(me.role)) section = "Team chat";
  if (me.role === "mentor") section = "Leads";
  if (me.role === "student") section = "Home";
  if (me.role === "student") {
    document.querySelector("aside .eyebrow").textContent = "STUDENT DASHBOARD";
    document.querySelector("main header .eyebrow").textContent = "SCHOLARS CAFE / STUDENT";
  }
  // Staff: the first (unnamed) group is the daily list; the rest folds under a "More" toggle on desktop.
  const staffNav = !["mentor", "student"].includes(me.role);
  const tabKeys = buildTabbar(navFor.flatMap(([, keys]) => keys));
  let target = $("nav");
  navFor.forEach(([group, keys], index) => {
    if (staffNav && index === 1) {
      const toggle = node("button", "More", "nav-more");
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", "nav-more-list");
      toggle.onclick = () => setMoreOpen(toggle.getAttribute("aria-expanded") !== "true");
      target = node("div", undefined, "nav-more-list");
      target.id = "nav-more-list";
      $("nav").append(toggle, target);
    }
    // On phones, the "More" sheet skips what the bottom bar already shows.
    const groupInTabbar = keys.every((k) => tabKeys.includes(k));
    if (group) {
      const heading = node("p", group, "nav-group");
      if (groupInTabbar) heading.classList.add("in-tabbar");
      target.append(heading);
    }
    for (const key of keys) {
      const b = button(label(key), () => {
        setMenu(false);
        navigate(key);
      });
      b.dataset.section = key;
      if (tabKeys.includes(key)) b.classList.add("in-tabbar");
      target.append(b);
    }
  });
  if (staffNav) {
    let saved = null;
    try {
      saved = localStorage.getItem("nav-more");
    } catch {}
    setMoreOpen(saved === "open");
  }
  if (me.role === "student")
    api("lms/my/unread")
      .then(({ unread }) => {
        const b = $("nav").querySelector('[data-section="Messages"]');
        if (unread && b) b.textContent = `Messages (${unread})`;
        const t = $("tabbar")?.querySelector('[data-section="Messages"]');
        if (unread && t) t.dataset.badge = unread > 9 ? "9+" : String(unread);
      })
      .catch(() => {});
  $("logout").onclick = async () => {
    try {
      await api("logout", {});
      location.reload();
    } catch (e) {
      report(e);
    }
  };
  // A tapped notification opens its screen: ?open=… on a fresh start, a message when the app is open.
  const canOpen = (key) =>
    Boolean(key && $("nav").querySelector(`[data-section="${CSS.escape(key)}"]`));
  const wanted = new URLSearchParams(location.search).get("open");
  if (canOpen(wanted)) section = wanted;
  if (wanted) history.replaceState(null, "", "/");
  navigator.serviceWorker?.addEventListener("message", (e) => {
    if (e.data?.type === "push") return inAppAlert(canOpen(e.data.open) ? e.data.open : "");
    if (canOpen(e.data?.open)) navigate(e.data.open);
  });
  buildBell();
  refreshBell();
  if (me.role !== "student") {
    syncPush().catch(() => {});
    showInstallHint();
  }
  if (canPublishRole(me.role))
    api("inbox")
      .then((r) => setMailBadge(r.unread))
      .catch(() => {});
  render();
  startHeartbeat();
} catch (e) {
  if (e.signedOut) showLogin();
  else {
    // Signed in, but the screen failed to load: say so and offer a reload (never the sign-in screen).
    $("boot").hidden = false;
    $("boot").textContent = "Couldn't open the dashboard: " + e.message + " ";
    $("boot").append(button("Reload", () => location.reload()));
  }
}
