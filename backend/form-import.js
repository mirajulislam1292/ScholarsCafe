// Bringing old Google Forms responses into the dashboard: the CSV from Google Forms (Responses → ⋮ →
// Download responses) is matched to this form's questions by their titles. Each row is stored once (a
// re-import skips rows already there), with its original time, and never triggers notification emails.
import { createHash } from "node:crypto";
import { isHeading } from "./forms.js";

/** RFC 4180 CSV (quoted cells, "" escapes, newlines inside quotes). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') ((cell += '"'), i++);
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") (row.push(cell), (cell = ""));
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      (row.push(cell), rows.push(row), (row = []), (cell = ""));
    } else cell += c;
  }
  if (cell || row.length) (row.push(cell), rows.push(row));
  return rows.filter((r) => r.some((x) => x.trim()));
}

const norm = (s) =>
  String(s)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");

/**
 * Google's timestamps: "2025/11/12 10:30:45 PM GMT+6" (form download) or "11/12/2025 22:30:45" (sheet,
 * read as Bangladesh time, GMT+6). Returns a Date, or null.
 */
export function parseTimestamp(raw) {
  const s = String(raw).trim();
  let m = s.match(
    /^(\d{4})\/(\d{1,2})\/(\d{1,2}) (\d{1,2}):(\d{2}):(\d{2})(?: ?([AP]M))?(?: GMT([+-]\d{1,2})(?::?(\d{2}))?)?$/i,
  );
  let y, mo, d, h, mi, se, ap, tz, tzm;
  if (m) [, y, mo, d, h, mi, se, ap, tz, tzm] = m;
  else {
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2})(?: ?([AP]M))?$/i);
    if (!m) return null;
    [, mo, d, y, h, mi, se, ap] = m;
  }
  let hour = Number(h);
  if (ap) hour = (hour % 12) + (/p/i.test(ap) ? 12 : 0);
  const offset =
    (tz === undefined ? 6 : Number(tz)) * 60 + Math.sign(Number(tz ?? 6)) * Number(tzm || 0);
  const t =
    Date.UTC(Number(y), Number(mo) - 1, Number(d), hour, Number(mi), Number(se)) - offset * 60000;
  return Number.isFinite(t) ? new Date(t) : null;
}

/** Splits a Google checkbox cell ("A, B, Other text") using the known choices, which may contain commas. */
function splitChoices(cell, options) {
  let rest = `, ${cell}, `;
  const picked = [];
  for (const o of [...options].sort((a, b) => b.length - a.length))
    if (rest.includes(`, ${o}, `)) (picked.push(o), (rest = rest.replace(`, ${o}, `, ", ")));
  const other = rest.replace(/^(,\s*)+|(,\s*)+$/g, "").trim();
  const ordered = options.filter((o) => picked.includes(o));
  return other ? [...ordered, other] : ordered;
}

/** Maps CSV rows to submissions for a form definition. */
export function mapResponses(definition, rows) {
  const [header, ...body] = rows;
  if (!header) return { items: [], matched: [], unmatched: [] };
  const fields = definition.steps.flatMap((s) => s.fields).filter((f) => f.type !== "info");
  const used = new Set();
  const map = header.map((h, col) => {
    const lines = String(h).split(/\n/).map(norm).filter(Boolean);
    const whole = norm(h);
    if (whole === "timestamp") return { kind: "time" };
    const f =
      fields.find((x) => !used.has(x.id) && lines.includes(norm(x.label))) ||
      fields.find((x) => !used.has(x.id) && norm(x.label) && whole.startsWith(norm(x.label)));
    if (f) return (used.add(f.id), { kind: "field", field: f });
    // Google's own "Email address" column (when the form collected emails).
    if (/^emailaddress$/.test(whole)) {
      const e = fields.find((x) => x.role === "email" && !used.has(x.id));
      if (e) return (used.add(e.id), { kind: "field", field: e });
    }
    const key = (
      "gf_" +
      String(h)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
    )
      .slice(0, 40)
      .replace(/_+$/, "");
    return {
      kind: "extra",
      key: key === "gf" ? "gf_column_" + (col + 1) : key,
      title: String(h).split("\n")[0],
    };
  });
  const items = body.map((row) => {
    const data = {};
    let createdAt = null;
    map.forEach((m, i) => {
      const cell = String(row[i] ?? "")
        .trim()
        .slice(0, 20000);
      if (m.kind === "time") return void (createdAt = parseTimestamp(cell));
      if (!cell) return;
      if (m.kind === "extra") return void (data[m.key] = cell);
      const f = m.field;
      if (f.type === "checkbox")
        data[f.id] = splitChoices(
          cell,
          f.options.filter((o) => !isHeading(o)),
        );
      else if (f.type === "consent") data[f.id] = true;
      else data[f.id] = cell; // file answers stay as the Google Drive links
    });
    return { data, createdAt };
  });
  return {
    items: items.filter((x) => Object.keys(x.data).length),
    matched: map.filter((m) => m.kind === "field").map((m) => m.field.label.split("\n")[0]),
    unmatched: map.filter((m) => m.kind === "extra").map((m) => m.title),
  };
}

/** A stable id for a row, so importing the same file twice doesn't create duplicates. */
export function importId(formId, item) {
  const h = createHash("sha256")
    .update(formId + JSON.stringify(item.data) + (item.createdAt?.toISOString() || ""))
    .digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export const pickRole = (definition, data, role) => {
  const f = definition.steps.flatMap((s) => s.fields).find((x) => x.role === role);
  return f && typeof data[f.id] === "string" ? data[f.id] : "";
};
