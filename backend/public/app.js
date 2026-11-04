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
};
const canPublishRole = (role) => role === "owner" || role === "admin";
const ENUMS = { group: ["founder", "mentor"], device: ["desktop", "mobile"] };
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
  $("heading").textContent = names[section] || section;
  const screen = $("screen");
  screen.replaceChildren();
  for (const b of $("nav").children) b.classList.toggle("active", b.dataset.section === section);
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
async function upload(file) {
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
    },
    body: file,
  });
  const result = await response.json();
  if (!response.ok) throw Error(result.error || "Upload failed.");
  return result;
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
    if (user.id !== me.id && (me.role === "owner" || ["editor", "mentor", "student"].includes(user.role)))
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
    $("password-form").hidden = true;
    $("code-form").hidden = false;
    $("login-code").focus();
    loginMessage(j.message);
  } catch (err) {
    loginMessage(err.message);
  }
};
$("code-back").onclick = () => {
  $("code-form").hidden = true;
  $("password-form").hidden = false;
  loginMessage("");
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
  const current = me.has_password ? field("Current password", "pw-current", "current-password") : null;
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
  $("login").hidden = true;
  $("workspace").hidden = false;
  $("identity").textContent = me.email + " · " + me.role;
  const navFor =
    me.role === "student"
      ? ["Account"]
      : me.role === "mentor"
      ? ["Leads", "Account"]
      : [
          "Overview",
          "Media",
          ...Object.keys(names),
          ...(me.role === "editor"
            ? []
            : ["Leads", "Access", "Private feedback", "Newsletter", "Email delivery", "Activity"]),
          "Account",
        ];
  if (me.role === "mentor") section = "Leads";
  if (me.role === "student") section = "Account";
  for (const key of navFor) {
    const b = button(names[key] || key, () => navigate(key));
    b.dataset.section = key;
    $("nav").append(b);
  }
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
