let me,
  items = [],
  section = "Overview";
const $ = (id) => document.getElementById(id);
const names = {
  mentors: "Mentors",
  blogs: "Blogs",
  feedback: "Feedback",
  courses: "Courses & pricing",
  copy: "Website text",
};
const defaults = {
  mentors: { name: "", role: "", bio: "", photo: "", initials: "" },
  blogs: { title: "", slug: "", excerpt: "", body: "", author: "", image: "" },
  feedback: { name: "", quote: "", destination: "", outcome: "", year: "", initials: "" },
  courses: {
    title: "",
    description: "",
    price: "",
    badge: "",
    features: [],
    cta: "Learn more",
    featured: false,
  },
  copy: {},
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
  if (section === "Messages") {
    renderMessages().catch(report);
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
  const list = items.filter((i) => i.kind === section);
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
  for (const item of list) {
    const row = node("div", undefined, "card row");
    row.append(
      node("span", item.title),
      node("span", item.published ? "Published · may have a newer draft" : "Draft", "badge"),
      button("Edit", () => edit(item)),
    );
    screen.append(row);
  }
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
async function renderAccess() {
  const users = (await api("users")).items;
  const screen = $("screen");
  const card = node("form", undefined, "card");
  card.append(node("h2", "Approve a Google account"));
  const email = field(card, "email", "");
  const label = node("label", "Role");
  const select = node("select");
  for (const role of me.role === "owner" ? ["editor", "admin", "owner"] : ["editor"]) {
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
    if (user.id !== me.id && (me.role === "owner" || user.role === "editor"))
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
try {
  me = await api("me");
  await refresh();
  $("login").hidden = true;
  $("workspace").hidden = false;
  $("identity").textContent = me.email + " · " + me.role;
  for (const key of [
    "Overview",
    ...Object.keys(names),
    ...(me.role === "editor" ? [] : ["Access", "Messages", "Activity"]),
  ]) {
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
