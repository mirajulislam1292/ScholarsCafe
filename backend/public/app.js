let me,
  items = [],
  section = "Overview";
let catalog = {};
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
};
// Sidebar labels and one-line page descriptions for the non-content screens.
const LABELS = {
  Access: "Users & roles",
  Activity: "Audit log",
  "Student courses": "Courses & videos",
  Media: "Media library",
  Account: "Profile",
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
  Packages: "What students buy: price, what's included, courses and features.",
  Students: "Student accounts, packages, mentors and sign-in access.",
  "Student courses": "Courses, lessons and private lesson videos.",
  Messages: "Conversations between students and mentors.",
  Reviews: "Approve or reject student reviews.",
  Leads: "Enquiries from the website contact form.",
  "Private feedback": "Private feedback sent from the website.",
  Newsletter: "Newsletter sign-ups.",
  Access: "Who can sign in to this workspace, and with which role.",
  "Email delivery": "Outgoing notification emails and their status.",
  Activity: "Every change, who made it and when.",
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
  group: ["founder", "mentor"],
  device: ["desktop", "mobile"],
  category: ["guide", "video", "live", "course", "template", "other"],
};
const HELP = {
  order: "Section ids in display order, separated by commas.",
  hidden: "Section ids to hide, separated by commas (leave empty to show all).",
  position: "Lower numbers appear first. Use the ↑ ↓ buttons in the list to reorder.",
  rate: "Playback speed, 0.5–1.5 (0.85 is calm).",
  page: "Page path, for example / or /about.",
  title: "",
};
const defaults = {
  mentors: { name: "", role: "", bio: "", photo: "", initials: "" },
  blogs: { title: "", slug: "", excerpt: "", body: "", author: "", image: "" },
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
    group: "founder",
    role: "Co-founder",
    title: "",
    line: "",
    photo: "",
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
  links: { label: "", url: "", note: "", highlight: false, enabled: true, position: 0 },
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
async function api(path, body) {
  const r = await fetch("/api/" + path, {
    method: body === undefined ? "GET" : "POST",
    headers:
      body === undefined
        ? {}
        : { "Content-Type": "application/json", "X-CSRF-Token": me?.csrf || "" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) {
    if (r.status === 401) {
      $("workspace").hidden = true;
      $("login").hidden = false;
    }
    throw Error(j.error);
  }
  return j;
}
async function refresh() {
  items = (await api("content")).items;
}
function field(form, key, value) {
  const label = node("label", key.replace(/[_-]/g, " "));
  const multi =
    Array.isArray(value) ||
    ["body", "bio", "description", "excerpt", "quote"].includes(key) ||
    String(value).length > 100;
  if (ENUMS[key]) {
    const select = node("select");
    for (const opt of ENUMS[key]) {
      const o = node("option", opt);
      o.value = opt;
      select.append(o);
    }
    select.value = value;
    select.id = "field-" + key;
    label.htmlFor = select.id;
    form.append(label, select);
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
  const input = node(typeof value === "boolean" ? "input" : multi ? "textarea" : "input");
  if (typeof value === "boolean") {
    input.type = "checkbox";
    input.checked = value;
  } else input.value = Array.isArray(value) ? value.join("\n") : value;
  if (key === "body") input.className = "body-field";
  if (["photo", "image"].includes(key)) input.type = "url";
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
  for (const b of $("nav").querySelectorAll("button"))
    b.classList.toggle("active", b.dataset.section === section);
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
      const card = node("div", undefined, "card");
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
    renderAudit().catch(report);
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
    const missing = Object.entries(catalog).filter(([key]) => !existingKeys.has(key));
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
    if (orderable) {
      const up = button("↑", () => move(list, index, -1));
      const down = button("↓", () => move(list, index, 1));
      up.setAttribute("aria-label", "Move " + item.title + " up");
      down.setAttribute("aria-label", "Move " + item.title + " down");
      up.disabled = index === 0;
      down.disabled = index === list.length - 1;
      row.append(up, down);
    }
    row.append(button("Edit", () => edit(item)));
    screen.append(row);
  });
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
  section = next;
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
  for (const [key, value] of Object.entries(item.data)) getters[key] = field(form, key, value);
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
        data: Object.fromEntries(Object.entries(getters).map(([k, get]) => [k, get()])),
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
  for (const b of $("nav").querySelectorAll("button"))
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
  const go = node("button", "Filter", "primary");
  go.type = "submit";
  const csv = node("a", "Export CSV");
  csv.className = "button";
  filters.append(q, status, ...(admin ? [assigned] : []), go, csv);
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
        node("p", row.email + " · " + row.phone, "muted"),
        node("p", row.message),
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
try {
  me = await api("me");
  const catalogResponse = await fetch("/cms-copy-catalog.json");
  if (catalogResponse.ok) catalog = await catalogResponse.json();
  if (!["mentor", "student"].includes(me.role)) await refresh();
  if (me.role === "student") myFeatures = await api("lms/my/features").catch(() => ({}));
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
    "countries",
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
        ? [["", ["Leads", "Students", "Documents", "Messages"]]]
        : [
            ["", ["Overview"]],
            ["Website", website],
            ...(me.role === "editor"
              ? []
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
                  ["Inbox", ["Leads", "Private feedback", "Newsletter"]],
                  ["Settings", ["Access", "Email delivery", "Activity"]],
                ]),
          ];
  if (me.role === "mentor") section = "Leads";
  if (me.role === "student") section = "Home";
  if (me.role === "student") {
    document.querySelector("aside .eyebrow").textContent = "STUDENT DASHBOARD";
    document.querySelector("main header .eyebrow").textContent = "SCHOLARS CAFE / STUDENT";
  }
  for (const [group, keys] of navFor) {
    if (group) $("nav").append(node("p", group, "nav-group"));
    for (const key of keys) {
      const b = button(label(key), () => navigate(key));
      b.dataset.section = key;
      $("nav").append(b);
    }
  }
  if (me.role === "student")
    api("lms/my/unread")
      .then(({ unread }) => {
        const b = $("nav").querySelector('[data-section="Messages"]');
        if (unread && b) b.textContent = `Messages (${unread})`;
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
  render();
} catch (e) {
  if (!e.message.includes("sign in")) report(e);
}
