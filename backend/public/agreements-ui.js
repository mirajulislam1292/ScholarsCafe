// Agreements screen (owners and admins): templates, new agreement with preview, the list with statuses,
// and the signed record. Loaded on demand from app.js; uses the dashboard's own helpers (passed in).
let h; // { api, node, button, input, select, notice, report, render }
const $screen = () => document.getElementById("screen");
const PH = /\{\{\s*([a-z][a-z0-9_]{0,39})\s*\}\}/g;
const placeholders = (body) => [...new Set([...String(body || "").matchAll(PH)].map((m) => m[1]))];
const STATE = {
  draft: ["Draft", "draft"],
  sent: ["Sent", "new"],
  viewed: ["Viewed", "new"],
  signed: ["Signed", "live"],
  expired: ["Expired", "closed"],
  revoked: ["Revoked", "closed"],
};
const when = (d) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        timeZone: "Asia/Dhaka",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";
const day = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        timeZone: "Asia/Dhaka",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
const NON_LATIN = /[^\u0000-ÿ‘’“”–—•…€™]/;

function styles() {
  if (document.getElementById("agreements-css")) return;
  const l = document.createElement("link");
  l.id = "agreements-css";
  l.rel = "stylesheet";
  l.href = "/agreements.css";
  document.head.append(l);
}
function check(label, checked) {
  const l = h.node("label", undefined, "check");
  const c = h.node("input");
  c.type = "checkbox";
  c.checked = Boolean(checked);
  l.append(c, document.createTextNode(" " + label));
  return [l, c];
}
function back(text, fn) {
  const bar = h.node("div", undefined, "form-back-bar");
  bar.append(h.button("← " + text, fn));
  return bar;
}
let cache = null;
async function load() {
  cache = await h.api("agreements");
  return cache;
}

export async function renderAgreements(helpers) {
  h = helpers;
  styles();
  const data = await load();
  showList(data);
}

// ---------- List ----------
function showList(data) {
  const screen = $screen();
  screen.replaceChildren();
  const bar = h.node("div", undefined, "toolbar");
  const counts = data.items.reduce((m, a) => ((m[a.state] = (m[a.state] || 0) + 1), m), {});
  bar.append(
    h.node(
      "p",
      data.items.length
        ? `${counts.signed || 0} signed · ${(counts.sent || 0) + (counts.viewed || 0)} waiting`
        : "Send an agreement to sign online.",
    ),
  );
  const right = h.node("span", undefined, "agr-bar-actions");
  right.append(
    h.button(`Templates (${data.templates.length})`, () => showTemplates(data)),
    h.button("+ New agreement", () => compose(data), "primary"),
  );
  bar.append(right);
  screen.append(bar);
  if (!data.templates.length)
    screen.append(
      h.node(
        "p",
        "Start with a template: the agreement text, with fields like {{name}} that fill in. Open Templates to write one.",
        "card",
      ),
    );
  if (!data.items.length) {
    screen.append(h.node("p", "No agreements yet.", "empty"));
    return;
  }
  const filter = h.node("div", undefined, "agr-filter");
  const list = h.node("div", undefined, "form-cards");
  let current = "all";
  const draw = () => {
    list.replaceChildren();
    for (const a of data.items.filter((x) => current === "all" || x.state === current))
      list.append(card(a));
    if (!list.children.length) list.append(h.node("p", "Nothing here.", "muted"));
  };
  for (const [key, text] of [["all", "All"], ...Object.entries(STATE).map(([k, v]) => [k, v[0]])]) {
    if (key !== "all" && !counts[key]) continue;
    const b = h.button(`${text}${key === "all" ? "" : ` (${counts[key]})`}`, () => {
      current = key;
      for (const x of filter.children) x.setAttribute("aria-pressed", String(x === b));
      draw();
    });
    b.setAttribute("aria-pressed", String(key === "all"));
    filter.append(b);
  }
  screen.append(filter, list);
  draw();
}

function card(a) {
  const [text, cls] = STATE[a.state] || [a.state, "draft"];
  const c = h.node("div", undefined, "card form-card");
  const top = h.node("div", undefined, "form-card-top");
  top.append(h.node("span", text, "pill " + cls), h.node("span", a.ref, "muted agr-ref"));
  const who = h.node("p");
  who.append(document.createTextNode(a.recipient_name + " · "));
  const mail = h.node("a", a.recipient_email);
  mail.href = "mailto:" + a.recipient_email;
  who.append(mail);
  c.append(top, h.node("h3", a.title), who);
  const facts = [];
  if (a.id_masked) facts.push("ID " + a.id_masked);
  if (a.state === "signed") facts.push("Signed " + when(a.signed_at));
  else if (a.state === "revoked") facts.push("Revoked " + day(a.revoked_at));
  else if (a.sent_at) {
    facts.push("Sent " + day(a.sent_at));
    if (a.viewed_at) facts.push("Opened " + day(a.viewed_at));
    facts.push((a.state === "expired" ? "Expired " : "Expires ") + day(a.expires_at));
  } else facts.push("Created " + day(a.created_at));
  c.append(h.node("p", facts.join(" · "), "muted"));
  const actions = h.node("div", undefined, "actions");
  if (a.state === "signed") {
    actions.append(h.button("View signed copy", () => details(a.id), "primary"));
    const pdf = h.node("a", "Download PDF", "button");
    pdf.href = `/api/agreements/${a.id}/pdf`;
    pdf.setAttribute("download", "");
    actions.append(pdf);
  } else if (a.state === "draft") {
    actions.append(
      h.button("Edit", () => editDraft(a.id)),
      h.button("Send", () => send(a, "Send"), "primary"),
    );
  } else if (a.state !== "revoked") {
    actions.append(
      h.button("Resend", () => send(a, "Resend"), "primary"),
      h.button("Copy link", () => copyLink(a)),
      h.button("Details", () => details(a.id)),
    );
  } else actions.append(h.button("Details", () => details(a.id)));
  if (!["signed", "revoked"].includes(a.state))
    actions.append(
      h.button(
        "Revoke",
        async () => {
          if (!confirm(`Revoke ${a.ref} for ${a.recipient_name}? The link stops working.`)) return;
          await h.api(`agreements/${a.id}/revoke`, {});
          h.notice("Revoked. The link no longer works.");
          showList(await load());
        },
        "danger",
      ),
    );
  c.append(actions);
  return c;
}

async function send(a, verb) {
  if (
    !confirm(
      `${verb} "${a.title}" to ${a.recipient_email}? ${verb === "Resend" ? "A new link goes out and the old link stops working." : "They get an email with a private link."}`,
    )
  )
    return;
  const r = await h.api(`agreements/${a.id}/send`, {});
  h.notice(
    r.emailed
      ? `Sent to ${a.recipient_email}.`
      : "Saved, but the email could not be sent. Use Copy link and share it another way.",
  );
  showList(await load());
}
async function copyLink(a) {
  if (
    !confirm(
      "Copy link makes a new private link for you to share (for example on WhatsApp). The link in the email stops working. Continue?",
    )
  )
    return;
  const { url, expires } = await h.api(`agreements/${a.id}/link`, {});
  let copied = false;
  try {
    await navigator.clipboard.writeText(url);
    copied = true;
  } catch {}
  showList(await load());
  const box = h.node("div", undefined, "card agr-link");
  box.append(
    h.node(
      "p",
      copied
        ? `Copied. It works until ${expires}, for ${a.recipient_email} only.`
        : `Copy this link. It works until ${expires}.`,
    ),
  );
  const field = h.node("input");
  field.readOnly = true;
  field.value = url;
  field.onfocus = () => field.select();
  box.append(field);
  $screen().prepend(box);
}

// ---------- Templates ----------
function showTemplates(data) {
  const screen = $screen();
  screen.replaceChildren(back("Agreements", () => showList(data)));
  const bar = h.node("div", undefined, "toolbar");
  bar.append(
    h.node(
      "p",
      "The wording of each agreement. Sent agreements keep the text they were sent with.",
    ),
    h.button("+ New template", () => editTemplate(data, null), "primary"),
  );
  screen.append(bar);
  if (!data.templates.length) screen.append(h.node("p", "No templates yet.", "empty"));
  const list = h.node("div", undefined, "form-cards");
  for (const t of data.templates) {
    const c = h.node("div", undefined, "card form-card");
    c.append(
      h.node("h3", t.title),
      h.node(
        "p",
        "Fields: " +
          (placeholders(t.body)
            .map((k) => `{{${k}}}`)
            .join(", ") || "none"),
        "muted",
      ),
    );
    const actions = h.node("div", undefined, "actions");
    actions.append(
      h.button("Edit", () => editTemplate(data, t)),
      h.button("Use", () => compose(data, { template_id: t.id }), "primary"),
      h.button(
        "Delete",
        async () => {
          if (
            !confirm(`Delete the template "${t.title}"? Agreements already sent keep their text.`)
          )
            return;
          await h.api(`agreements/templates/${t.id}/delete`, {});
          showTemplates(await load());
        },
        "danger",
      ),
    );
    c.append(actions);
    list.append(c);
  }
  screen.append(list);
}

function editTemplate(data, t) {
  const screen = $screen();
  screen.replaceChildren(back("Templates", () => showTemplates(data)));
  const form = h.node("form", undefined, "card agr-form");
  const [tl, title] = h.input("Title", t?.title || "", "text", 200);
  const [sl, subtitle] = h.input("Line under the title (optional)", t?.subtitle || "", "text", 300);
  const [bl, body] = h.input("Agreement text", t?.body || "", "textarea", 50000);
  body.rows = 18;
  body.classList.add("agr-body");
  const help = h.node("p", undefined, "muted agr-help");
  help.textContent =
    "A blank line starts a new paragraph. Start a line with ## for a section heading. Fields: " +
    data.builtin.map((f) => `{{${f.key}}}`).join(" ") +
    " {{date}} (signing date), plus your own fields below.";
  const warn = h.node("p", "", "agr-warn");
  const checkLatin = () => {
    warn.textContent = NON_LATIN.test(body.value + title.value + subtitle.value)
      ? "The PDF prints Latin letters only. Bangla or other scripts show as ? in the PDF (the online record keeps them)."
      : "";
  };
  body.oninput = checkLatin;
  checkLatin();
  const sample = h.button("Insert sample wording", () => {
    if (body.value.trim() && !confirm("Replace the text with the sample wording?")) return;
    title.value = title.value || data.sample.title;
    subtitle.value = subtitle.value || data.sample.subtitle;
    body.value = data.sample.body;
    checkLatin();
  });
  const sampleNote = h.node(
    "p",
    "Sample wording from the design. Have it reviewed for Bangladesh law before you send it.",
    "muted",
  );
  // Custom fields.
  const fieldsBox = h.node("fieldset", undefined, "agr-custom");
  fieldsBox.append(h.node("legend", "Your own fields (optional)"));
  const rows = h.node("div");
  const addRow = (f = { key: "", label: "", sensitive: false }) => {
    const row = h.node("div", undefined, "agr-custom-row");
    const [kl, key] = h.input("Key (used as {{key}})", f.key, "text", 40);
    key.placeholder = "school";
    const [ll, lab] = h.input("Label", f.label, "text", 80);
    lab.placeholder = "School name";
    const [cl, sens] = check("Private (mask like an ID number)", f.sensitive);
    row.append(
      kl,
      ll,
      cl,
      h.button("Remove", () => row.remove()),
    );
    row.read = () => ({
      key: key.value.trim(),
      label: lab.value.trim(),
      sensitive: sens.checked,
    });
    rows.append(row);
  };
  for (const f of t?.fields || []) addRow(f);
  fieldsBox.append(
    rows,
    h.button("+ Add field", () => addRow()),
  );
  const actions = h.node("div", undefined, "actions");
  const save = h.node("button", "Save template", "primary");
  save.type = "submit";
  actions.append(save);
  form.append(tl, sl, bl, help, warn, sample, sampleNote, fieldsBox, actions);
  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const fields = [...rows.children].map((r) => r.read()).filter((f) => f.key || f.label);
      await h.api("agreements/templates", {
        ...(t ? { id: t.id } : {}),
        title: title.value,
        subtitle: subtitle.value,
        body: body.value,
        fields,
      });
      h.notice("Template saved.");
      showTemplates(await load());
    } catch (err) {
      h.report(err);
    }
  };
  screen.append(form);
}

// ---------- New agreement (or edit a draft) ----------
async function editDraft(id) {
  const d = await h.api("agreements/" + id);
  compose(cache, {
    id,
    template_id: d.template_id,
    recipient_name: d.recipient_name,
    recipient_email: d.recipient_email,
    link_days: d.link_days,
    fields: d.fields.map((f) => (f.sensitive ? { ...f, value: "" } : f)),
  });
}
function compose(data, draft = {}) {
  if (!data.templates.length) return showTemplates(data);
  const screen = $screen();
  screen.replaceChildren(back("Agreements", () => showList(data)));
  const wrap = h.node("div", undefined, "agr-compose");
  const form = h.node("form", undefined, "card agr-form");
  const [tpl, template] = h.select(
    "Template",
    data.templates.map((t) => [t.id, t.title]),
    draft.template_id || data.templates[0].id,
  );
  const [nl, name] = h.input("Recipient's full name", draft.recipient_name || "", "text", 160);
  const [el, email] = h.input("Recipient's email", draft.recipient_email || "", "email", 254);
  const [dl, days] = h.input(
    "Link works for (days)",
    String(draft.link_days || data.linkDays),
    "number",
    2,
  );
  days.min = "1";
  days.max = "30";
  const fieldsBox = h.node("fieldset", undefined, "agr-fields");
  fieldsBox.append(h.node("legend", "Fields"));
  const intro = h.node(
    "p",
    "Fill in what you already know. Tick “Recipient fills in” for what they should enter (they can also correct a value you gave).",
    "muted",
  );
  const rows = h.node("div", undefined, "agr-field-rows");
  fieldsBox.append(intro, rows);
  const preview = h.node("article", undefined, "agr-paper");
  const given = Object.fromEntries((draft.fields || []).map((f) => [f.key, f]));
  let fieldRows = [];
  const tplNow = () => data.templates.find((t) => t.id === template.value);
  const defsFor = (t) => {
    const custom = Object.fromEntries((t.fields || []).map((f) => [f.key, f]));
    const builtin = Object.fromEntries(data.builtin.map((f) => [f.key, f]));
    const keys = placeholders(t.body).filter((k) => k !== "date");
    if (!keys.includes("name")) keys.unshift("name");
    return keys.map((k) => ({ key: k, ...(builtin[k] || custom[k] || { label: k }) }));
  };
  const buildRows = () => {
    rows.replaceChildren();
    fieldRows = defsFor(tplNow()).map((def) => {
      const g = given[def.key];
      const row = h.node("div", undefined, "agr-field-row");
      const [vl, value] = h.input(
        def.label,
        g?.value ?? "",
        def.type === "email" ? "email" : "text",
        300,
      );
      if (def.sensitive) value.autocomplete = "off";
      const fills = g ? g.recipient : def.key !== "email";
      const [rl, recipient] = check("Recipient fills in", fills);
      const [ql, required] = check("Required", g ? g.required : def.key !== "cohort");
      if (def.key === "name" || def.key === "email") {
        value.placeholder =
          def.key === "name" ? "Uses the recipient's name" : "Uses the recipient's email";
      }
      const sync = () => {
        ql.hidden = !recipient.checked;
        if (def.key === "name") required.checked = true;
        drawPreview();
      };
      recipient.onchange = sync;
      value.oninput = drawPreview;
      required.onchange = drawPreview;
      row.append(vl, rl, ql);
      rows.append(row);
      ql.hidden = !recipient.checked;
      return {
        def,
        read: () => ({
          key: def.key,
          label: def.label,
          value: value.value.trim(),
          recipient: recipient.checked,
          required: recipient.checked && required.checked,
        }),
      };
    });
    drawPreview();
  };
  const drawPreview = () => {
    const t = tplNow();
    const values = Object.fromEntries(
      fieldRows.map((r) => {
        const f = r.read();
        let v = f.value;
        if (!v && f.key === "name") v = name.value.trim();
        if (!v && f.key === "email") v = email.value.trim();
        return [
          f.key,
          { v, label: r.def.label, recipient: f.recipient, sensitive: r.def.sensitive },
        ];
      }),
    );
    values.date = { v: "Signing date", label: "Date" };
    preview.replaceChildren();
    const head = h.node("header", undefined, "agr-paper-head");
    const brand = h.node("span", "Scholars' Cafe", "agr-brand");
    head.append(brand, h.node("span", "REF assigned on save", "agr-ref"));
    preview.append(head, h.node("h2", t.title));
    if (t.subtitle) preview.append(h.node("p", t.subtitle, "muted"));
    for (const block of String(t.body)
      .replace(/\r\n?/g, "\n")
      .trim()
      .split(/\n{2,}/)) {
      const lines = block.split("\n");
      if (/^##\s+/.test(lines[0])) {
        preview.append(h.node("h3", lines.shift().replace(/^##\s+/, "")));
        if (!lines.length) continue;
      }
      const p = h.node("p");
      const text = lines.join("\n");
      let last = 0;
      for (const m of text.matchAll(PH)) {
        p.append(document.createTextNode(text.slice(last, m.index)));
        const f = values[m[1]] || { v: "", label: m[1] };
        const span = h.node(
          "span",
          f.v ? (f.sensitive ? "•••• (private)" : f.v) : `[${f.label}]`,
          f.v && !f.recipient ? "agr-val" : "agr-blank",
        );
        p.append(span);
        last = m.index + m[0].length;
      }
      p.append(document.createTextNode(text.slice(last)));
      preview.append(p);
    }
    preview.append(
      h.node("p", "Signature box, consent and Submit appear here for the recipient.", "agr-sig"),
    );
  };
  template.onchange = buildRows;
  name.oninput = drawPreview;
  email.oninput = drawPreview;
  const actions = h.node("div", undefined, "actions");
  const saveDraft = h.node("button", "Save draft");
  saveDraft.type = "button";
  const sendBtn = h.node("button", "Send", "primary");
  sendBtn.type = "submit";
  actions.append(saveDraft, sendBtn);
  const submit = async (sendNow) => {
    try {
      if (sendNow && !confirm(`Send this agreement to ${email.value.trim()}?`)) return;
      const r = await h.api("agreements", {
        ...(draft.id ? { id: draft.id } : {}),
        template_id: template.value,
        recipient_name: name.value,
        recipient_email: email.value,
        link_days: Number(days.value) || data.linkDays,
        fields: fieldRows.map((x) => x.read()),
        send: sendNow,
      });
      h.notice(
        !sendNow
          ? `Draft ${r.ref} saved.`
          : r.emailed
            ? `${r.ref} sent to ${email.value.trim()}.`
            : `${r.ref} saved as sent, but the email could not go out. Use Copy link.`,
      );
      showList(await load());
    } catch (err) {
      h.report(err);
    }
  };
  saveDraft.onclick = () => submit(false);
  form.onsubmit = (e) => {
    e.preventDefault();
    submit(true);
  };
  form.append(tpl, nl, el, dl, fieldsBox, actions);
  const side = h.node("div", undefined, "agr-preview");
  side.append(h.node("p", "Preview", "agr-preview-label"), preview);
  wrap.append(form, side);
  screen.append(wrap);
  buildRows();
}

// ---------- Details and the signed record ----------
async function details(id) {
  const d = await h.api("agreements/" + id);
  const screen = $screen();
  screen.replaceChildren(back("Agreements", async () => showList(await load())));
  const [text, cls] = STATE[d.state] || [d.state, "draft"];
  const head = h.node("div", undefined, "card");
  const top = h.node("div", undefined, "form-card-top");
  top.append(h.node("span", text, "pill " + cls), h.node("span", d.ref, "muted agr-ref"));
  head.append(
    top,
    h.node("h2", d.title),
    h.node("p", `${d.recipient_name} · ${d.recipient_email}`),
  );
  screen.append(head);
  const s = d.signed;
  if (s) {
    const rec = h.node("div", undefined, "card agr-record");
    rec.append(h.node("h3", "Signed record"));
    const img = h.node("img", undefined, "agr-signature");
    img.src = `/api/agreements/${d.id}/signature.png`;
    img.alt = "Signature of " + (s.values.name || d.recipient_name);
    rec.append(img);
    const dl = h.node("dl", undefined, "agr-dl");
    const rows = [
      ["Document ID", s.doc_id],
      ["Signed", s.signed_label],
      ["Method", s.method === "draw" ? "Drawn" : "Typed"],
      [
        "Identity check",
        `${s.verification.method === "student_portal" ? "Student portal sign-in" : "Email code"} (${s.verification.email || ""})`,
      ],
      ["IP address", s.ip || "Unknown"],
      ["Device", s.user_agent || "Unknown"],
      ["Text SHA-256", s.text_sha256],
      ["PDF SHA-256", s.pdf_sha256],
    ];
    for (const f of d.fields) rows.push([f.label, s.values[f.key] || "Not provided"]);
    rows.push(["Consent", s.consent_text]);
    for (const [k, v] of rows) dl.append(h.node("dt", k), h.node("dd", v));
    rec.append(dl);
    const actions = h.node("div", undefined, "actions");
    const pdf = h.node("a", "Download PDF", "button primary");
    pdf.href = `/api/agreements/${d.id}/pdf`;
    pdf.setAttribute("download", "");
    const view = h.node("a", "Open PDF", "button");
    view.href = `/api/agreements/${d.id}/pdf?view=1`;
    view.target = "_blank";
    view.rel = "noopener";
    actions.append(pdf, view);
    rec.append(actions);
    const text = h.node("details", undefined, "agr-text");
    text.append(
      h.node("summary", "Signed text (exactly as hashed)"),
      h.node("pre", s.rendered_text),
    );
    rec.append(text);
    screen.append(rec);
  } else {
    const info = h.node("div", undefined, "card");
    info.append(h.node("h3", "Fields"));
    const dl = h.node("dl", undefined, "agr-dl");
    for (const f of d.fields)
      dl.append(
        h.node("dt", f.label),
        h.node(
          "dd",
          f.recipient ? `Recipient fills in${f.value ? ` (suggested: ${f.value})` : ""}` : f.value,
        ),
      );
    info.append(dl);
    screen.append(info);
  }
  const log = h.node("div", undefined, "card");
  log.append(h.node("h3", "History"));
  const ul = h.node("ul", undefined, "agr-events");
  const NAMES = {
    created: "Created",
    sent: "Sent",
    resent: "Resent (new link)",
    link: "New link copied",
    viewed: "Opened",
    code: "Code emailed",
    verified: "Identity checked",
    signed: "Signed",
    revoked: "Revoked",
  };
  for (const e of d.events) {
    const li = h.node("li");
    li.append(
      h.node("strong", NAMES[e.event] || e.event),
      document.createTextNode(
        ` · ${e.when}${e.actor_email ? " · " + e.actor_email : ""}${e.detail ? " · " + e.detail : ""}${e.ip ? " · IP " + e.ip : ""}`,
      ),
    );
    ul.append(li);
  }
  log.append(ul);
  screen.append(log);
}
