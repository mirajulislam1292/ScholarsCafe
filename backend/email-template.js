// One shared, branded template for every email the app sends (bookings, sign-in codes, tasks, form
// receipts, ECA alerts, team notices, and mail written in the dashboard's Mail screen).
// Layout and markup follow the approved "Scholars Cafe Email Studio" design.
//
// renderEmail() returns { html, text }: the HTML part and a plain-text alternative built from the same data.
// Built for Gmail (web, iPhone, Android), Apple Mail and Outlook (Windows and Outlook.com): tables with
// role="presentation", inline styles, a fixed 600px Outlook wrapper, a VML button for Outlook, dark mode
// through classes (plus [data-ogsc] for Outlook.com), and a mobile layout under 620px.
// All text that comes from people (names, messages, form answers) is escaped before it is used.

import {
  BRAND_NAME,
  TAGLINE,
  SITE,
  SITE_LABEL,
  CONTACT,
  LOGO,
  SOCIAL,
  COLORS as C,
  DARK as D,
  FONTS,
} from "./email-brand.js";

export { BRAND_NAME, SITE, CONTACT, SOCIAL };
export const LOGO_BLUE = LOGO.light;
export const LOGO_ICE = LOGO.dark;
/** The footer tagline (fixed: set in email-brand.js). */
export const DEFAULT_TAGLINE = TAGLINE;

const HEAD = FONTS.heading;
const BODY = FONTS.body;
const MONO = FONTS.mono;

export const escapeHtml = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

// Bare https:// links become clickable; trailing punctuation stays outside the link.
const URL_RE = /https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]]/g;
const linkStyle = `color:${C.link};text-decoration:underline;word-break:break-word;`;
function linkify(escaped) {
  return escaped.replace(URL_RE, (url) => {
    const href = url.replace(/&amp;/g, "&");
    return `<a href="${escapeHtml(href)}" class="sc-a" style="${linkStyle}">${url}</a>`;
  });
}

// Simple formatting for mail typed by the team (Mail screen, ECA alerts): **bold** and [label](https://…).
const MD_LINK = /\[([^\]\n]{1,200})\]\((https:\/\/[^\s()<>"']{1,2000})\)/g;
const BOLD = /\*\*([^*\n]{1,500}?)\*\*/g;
function rich(escaped) {
  const links = [];
  const held = escaped.replace(MD_LINK, (_m, label, url) => {
    links.push(
      `<a href="${escapeHtml(url.replace(/&amp;/g, "&"))}" class="sc-a" style="${linkStyle}">${label}</a>`,
    );
    return `\u0000${links.length - 1}\u0000`;
  });
  return linkify(held)
    .replace(BOLD, '<strong style="font-weight:700;">$1</strong>')
    .replace(/\u0000(\d+)\u0000/g, (_m, i) => links[Number(i)]);
}
/** The plain-text version of formatted text: "**x**" → "x", "[label](url)" → "label (url)". */
export const plainFormatted = (text) =>
  String(text ?? "")
    .replace(MD_LINK, "$1 ($2)")
    .replace(BOLD, "$1");

const clean = (s) =>
  String(s ?? "")
    .replace(/\r\n?/g, "\n")
    .trim();
const inline = (s, format) => (format ? rich : linkify)(escapeHtml(s));
const paragraphs = (s) =>
  clean(s)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+$/, ""))
    .filter((p) => p.trim());

const P = `margin:0 0 16px 0;font-family:${BODY};font-size:16px;line-height:26px;color:${C.navy};`;

/** Plain text → HTML paragraphs and bullet lists (lines starting with "- "). */
export function textToHtml(text, { format = false } = {}) {
  return paragraphs(text)
    .map((para) => {
      const lines = para.split("\n");
      if (lines.every((l) => /^\s*-\s+/.test(l)))
        return (
          `<ul style="margin:0 0 16px 0;padding:0 0 0 22px;">` +
          lines
            .map(
              (l) =>
                `<li class="sc-t" style="margin:0 0 8px 0;font-family:${BODY};font-size:16px;line-height:26px;color:${C.navy};">${inline(l.replace(/^\s*-\s+/, ""), format)}</li>`,
            )
            .join("") +
          `</ul>`
        );
      return `<p class="sc-t" style="${P}">${lines.map((l) => inline(l, format)).join("<br>")}</p>`;
    })
    .join("\n");
}

/**
 * The main action button for a mail without its own layout (older queued mail), worked out from what the
 * text says: a session link, the task list, a sign-in link, or the right dashboard screen for team notices.
 */
export function actionFor({ subject = "", text = "", toTeam = false }, adminOrigin = "") {
  const link = (re) => re.exec(text)?.[1];
  const admin = (screen) => adminScreen(adminOrigin, screen);
  const pick = (label, url) => (url && /^https:\/\//.test(url) ? { label, url } : null);
  let a;
  if ((a = link(/Join here: (https:\/\/\S+)/))) return pick("Join the session", a);
  if ((a = link(/sign in:\n(https:\/\/\S+)/i))) return pick("Sign in", a);
  if ((a = link(/Open your tasks: (https:\/\/\S+)/))) return pick("Open task", a);
  if (/cancelled/i.test(subject) && text.includes(SITE + "/book"))
    return pick("Book a new time", SITE + "/book");
  if (toTeam) {
    if (/^New booking/i.test(subject)) return pick("View booking", admin("Bookings"));
    if (/^New (website inquiry|form submission)/i.test(subject))
      return pick("View lead", admin("Leads"));
    if (/^New private feedback/i.test(subject))
      return pick("View feedback", admin("Private feedback"));
    if (/^New newsletter/i.test(subject)) return pick("View sign-ups", admin("Newsletter"));
  }
  return null;
}
/** A screen in the admin app ("Bookings", "Leads", "Tasks"…), or null when the admin address is unknown. */
export const adminScreen = (adminOrigin, screen) =>
  adminOrigin ? `${adminOrigin}/?open=${encodeURIComponent(screen)}` : null;

/** The plain-text footer (same content and order as the HTML footer; the website appears once, last). */
export function signatureText() {
  return [
    BRAND_NAME,
    TAGLINE,
    "",
    ...SOCIAL.map(([n, u]) => `${n}: ${u}`),
    `Email: ${CONTACT}`,
    "",
    "Questions? Just reply to this email.",
    SITE_LABEL,
  ].join("\n");
}

// ---------------------------------------------------------------------------------------------------------
// HTML pieces (from the approved design)

function buttonHtml({ label, url }) {
  const w = Math.max(180, Math.round(label.length * 8.6 + 64));
  const href = escapeHtml(url);
  const text = escapeHtml(label);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;">
<tr><td align="left" class="sc-btn" style="border-radius:8px;background:${C.blue};">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:48px;v-text-anchor:middle;width:${w}px;" arcsize="17%" stroke="f" fillcolor="${C.blue}"><w:anchorlock/><center style="color:#ffffff;font-family:'Segoe UI',Arial,sans-serif;font-size:16px;font-weight:600;">${text}</center></v:roundrect><![endif]-->
<!--[if !mso]><!--><a href="${href}" class="sc-btn" style="display:inline-block;background:${C.blue};color:#ffffff;font-family:${BODY};font-size:16px;font-weight:600;line-height:48px;padding:0 28px;border-radius:8px;text-decoration:none;mso-hide:all;">${text}</a><!--<![endif]-->
</td></tr></table>`;
}

function detailsHtml(rows, stacked) {
  if (!rows.length) return "";
  const cell = ([label, value], i) => {
    const top = i ? `border-top:1px solid ${C.line};` : "";
    const v = escapeHtml(value).replace(/\n/g, "<br>");
    if (stacked)
      return `<tr><td class="sc-line" style="${top}padding:14px 18px;">
<div class="sc-m" style="font-family:${BODY};font-size:13px;line-height:18px;color:${C.muted};margin:0 0 4px 0;">${escapeHtml(label)}</div>
<div class="sc-t" style="font-family:${BODY};font-size:15px;line-height:23px;color:${C.navy};word-break:break-word;">${linkify(v)}</div></td></tr>`;
    return `<tr><td class="sc-line sc-m" width="38%" valign="top" style="${top}padding:12px 0 12px 18px;font-family:${BODY};font-size:14px;line-height:22px;color:${C.muted};">${escapeHtml(label)}</td>
<td class="sc-line sc-t" valign="top" style="${top}padding:12px 18px 12px 12px;font-family:${BODY};font-size:15px;line-height:22px;font-weight:600;color:${C.navy};word-break:break-word;">${linkify(v)}</td></tr>`;
  };
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="sc-box" style="width:100%;border:1px solid ${C.line};border-radius:10px;border-collapse:separate;margin:4px 0 24px 0;">
${rows.map(cell).join("\n")}
</table>`;
}

function codeHtml(code) {
  const spaced = String(code).replace(/\s/g, "").split("").join(" ");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 24px 0;">
<tr><td align="center" class="sc-panel" style="background:${C.ice};border-radius:10px;padding:22px 12px;">
<div class="sc-h" style="font-family:${HEAD};font-size:34px;line-height:40px;font-weight:600;letter-spacing:6px;color:${C.navy};">${escapeHtml(spaced)}</div>
</td></tr></table>`;
}

function logoImgs(size) {
  const h = Math.round(size / LOGO.ratio);
  const img = (src, cls) =>
    `<img src="${src}" width="${size}" height="${h}" alt="${BRAND_NAME}"${cls ? ` class="${cls}"` : ""} style="display:block;border:0;outline:none;text-decoration:none;width:${size}px;height:${h}px;">`;
  return `${img(LOGO.light, "sc-logo-l")}<!--[if !mso]><!--><div class="sc-logo-d" style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${img(LOGO.dark, "")}</div><!--<![endif]-->`;
}

const DARK_CSS = `
.sc-body,.sc-bg{background:${D.page}!important;}
.sc-card{background:${D.card}!important;border-color:${D.line}!important;}
.sc-h,.sc-t{color:${D.text}!important;}
.sc-m{color:${D.muted}!important;}
.sc-a{color:${D.link}!important;}
.sc-foot,.sc-panel{background:${D.footer}!important;}
.sc-foot,.sc-box,.sc-line,.sc-quote{border-color:${D.line}!important;}
.sc-chip{background:${D.footer}!important;color:${D.link}!important;border-color:${D.line}!important;}
.sc-btn{background:${D.link}!important;color:${C.navy}!important;}
.sc-logo-l{display:none!important;}
.sc-logo-d{display:block!important;max-height:none!important;overflow:visible!important;}`;
const OGSC_CSS = `
[data-ogsc] .sc-h,[data-ogsc] .sc-t{color:${D.text}!important;}
[data-ogsc] .sc-m{color:${D.muted}!important;}
[data-ogsc] .sc-a{color:${D.link}!important;}`;

/** Details as [label, value] pairs; also accepts "Label: value" lines. Empty values are dropped. */
function detailRows(details) {
  if (!details) return [];
  const rows = Array.isArray(details)
    ? details
    : String(details)
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const i = l.indexOf(":");
          return i < 0 ? ["", l] : [l.slice(0, i).trim(), l.slice(i + 1).trim()];
        });
  return rows.map(([k, v]) => [String(k ?? ""), String(v ?? "").trim()]).filter(([, v]) => v);
}

const httpsOnly = (b) =>
  b && b.label && typeof b.url === "string" && /^https:\/\//.test(b.url) ? b : null;

/**
 * The finished email: { html, text }.
 *
 * @param {object} input
 * @param {string} input.subject           Subject line (used as the HTML title).
 * @param {string} [input.text]            The message, as plain text (blank line = paragraph, "- " = bullet).
 * @param {boolean} [input.format]         Allow **bold** and [label](https://…) in the message (team-written mail).
 * @param {string} [input.preheader]       Inbox preview text; defaults to the start of the message.
 * @param {string} [input.label]           Small uppercase label in the header, e.g. "Booking confirmed".
 * @param {string} [input.ref]             Reference badge, e.g. for agreements.
 * @param {string} [input.heading]         Heading above the greeting.
 * @param {string} [input.firstName]       Adds "Hi {firstName}," before the message.
 * @param {string} [input.greeting]        A greeting to use when there is no first name, e.g. "Hello,".
 * @param {Array|string} [input.details]   Details box rows: [[label, value], …] or "Label: value" lines.
 * @param {boolean} [input.stacked]        Show details as stacked question-and-answer rows (form answers).
 * @param {string} [input.code]            A one-time code shown in a large box.
 * @param {{label:string,url:string}} [input.button]  Main action (https only).
 * @param {{label:string,url:string}} [input.action]  Older name for `button`.
 * @param {string} [input.note]            Small print under the button.
 * @param {{by:string,text:string}} [input.quote]     The original message, for replies.
 * @param {string} [input.unsubscribeUrl]  Newsletters and alerts only: adds the subscription line.
 */
export function renderEmail(input) {
  const t = { ...input };
  const message = clean(t.text);
  const button = httpsOnly(t.button || t.action);
  const rows = detailRows(t.details);
  const note = clean(t.note);
  const quote = t.quote && clean(t.quote.text) ? t.quote : null;
  const unsubscribeUrl = t.unsubscribeUrl || null;
  const firstName =
    String(t.firstName ?? "")
      .trim()
      .split(/\s+/)[0] || "";

  // Inbox preview: the start of the message as plain text, then invisible filler so nothing else shows.
  const preText = String(t.preheader || plainFormatted(message) || t.heading || "")
    .replace(/^\s*-\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 110);
  const filler = "&#847;&zwnj;&nbsp;".repeat(Math.max(0, 140 - preText.length) >> 1);

  // "Hi {first name}," or an explicit greeting such as "Hello," (mail to someone whose name we don't know).
  const greeting = firstName ? `Hi ${firstName},` : String(t.greeting ?? "").trim();
  const greet = greeting ? `<p class="sc-t" style="${P}">${escapeHtml(greeting)}</p>` : "";
  const ref = t.ref
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px 0;"><tr><td class="sc-chip" style="background:${C.ice};border:1px solid ${C.line};border-radius:6px;padding:4px 10px;font-family:${MONO};font-size:12px;line-height:18px;letter-spacing:1px;color:${C.blue};">REF ${escapeHtml(t.ref)}</td></tr></table>`
    : "";
  const heading = t.heading
    ? `<h1 class="sc-h sc-h1" style="margin:0 0 18px 0;font-family:${HEAD};font-size:26px;line-height:33px;font-weight:600;letter-spacing:-0.2px;color:${C.navy};">${escapeHtml(t.heading)}</h1>`
    : "";
  const noteHtml = note
    ? paragraphs(note)
        .map(
          (p) =>
            `<p class="sc-m" style="margin:0 0 16px 0;font-family:${BODY};font-size:14px;line-height:22px;color:${C.muted};">${p
              .split("\n")
              .map((l) => linkify(escapeHtml(l)))
              .join("<br>")}</p>`,
        )
        .join("\n")
    : "";
  const quoteHtml = quote
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 16px 0;"><tr><td class="sc-quote" style="border-left:3px solid ${C.line};padding:2px 0 2px 14px;">
${quote.by ? `<p class="sc-m" style="margin:0 0 6px 0;font-family:${BODY};font-size:13px;line-height:20px;color:${C.muted};">${escapeHtml(quote.by)}</p>` : ""}
<p class="sc-m" style="margin:0;font-family:${BODY};font-size:15px;line-height:23px;color:${C.muted};">${escapeHtml(clean(quote.text)).replace(/\n/g, "<br>")}</p></td></tr></table>`
    : "";
  const label = t.label
    ? `<td align="right" valign="middle" class="sc-m" style="font-family:${BODY};font-size:12px;line-height:16px;letter-spacing:1px;text-transform:uppercase;font-weight:600;color:${C.muted};">${escapeHtml(t.label)}</td>`
    : "";
  const sep = `<span class="sc-m" style="color:${C.muted};">&nbsp;&middot; </span>`;
  const fl = (href, text) =>
    `<a href="${escapeHtml(href)}" class="sc-a" style="color:${C.link};text-decoration:none;">${escapeHtml(text)}</a>`;
  const unsub = unsubscribeUrl
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;"><tr><td align="center" class="sc-m" style="padding:20px 24px 0 24px;font-family:${BODY};font-size:12px;line-height:18px;color:${C.muted};">You are getting this email because you subscribed to ${BRAND_NAME} updates.<br><a href="${escapeHtml(unsubscribeUrl)}" class="sc-a" style="color:${C.muted};text-decoration:underline;">Unsubscribe</a></td></tr></table>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(t.subject)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><style>body,table,td,p,a,li,h1,div{font-family:'Segoe UI',Arial,sans-serif!important;}</style><![endif]-->
<!--[if !mso]><!--><link href="${FONTS.googleCss}" rel="stylesheet"><!--<![endif]-->
<style>
:root{color-scheme:light dark;supported-color-schemes:light dark;}
body{margin:0!important;padding:0!important;width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
table,td{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
img{-ms-interpolation-mode:bicubic;}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;}
@media only screen and (max-width:620px){
.sc-outer{padding:0!important;}
.sc-card{width:100%!important;border-radius:0!important;border-left:0!important;border-right:0!important;}
.sc-pad{padding-left:20px!important;padding-right:20px!important;}
.sc-foot{border-radius:0!important;}
.sc-h1{font-size:23px!important;line-height:30px!important;}
}
@media (prefers-color-scheme: dark){${DARK_CSS}
}${OGSC_CSS}
</style>
</head>
<body class="sc-body" style="margin:0;padding:0;background:${C.page};">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preText)}${filler}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="sc-bg" bgcolor="${C.page}" style="width:100%;background:${C.page};">
<tr><td align="center" class="sc-outer" style="padding:32px 12px;">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="sc-card" bgcolor="${C.card}" style="width:100%;max-width:600px;background:${C.card};border:1px solid ${C.line};border-radius:14px;border-collapse:separate;">
<tr><td class="sc-pad" style="padding:30px 40px 6px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="40" valign="middle" style="width:40px;">${logoImgs(40)}</td>
<td valign="middle" class="sc-h" style="padding-left:12px;font-family:${HEAD};font-size:18px;line-height:22px;font-weight:600;color:${C.navy};">${BRAND_NAME}</td>
${label}
</tr></table>
</td></tr>
<tr><td class="sc-pad" style="padding:26px 40px 12px 40px;">
${ref}${heading}${greet}${textToHtml(message, { format: Boolean(t.format) })}
${detailsHtml(rows, Boolean(t.stacked))}${t.code ? codeHtml(t.code) : ""}${button ? buttonHtml(button) : ""}${noteHtml}${quoteHtml}
</td></tr>
<tr><td class="sc-foot" align="center" style="background:${C.ice};border-top:1px solid ${C.line};border-radius:0 0 13px 13px;padding:30px 24px 28px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center">${logoImgs(34)}</td></tr></table>
<p class="sc-h" style="margin:12px 0 4px 0;font-family:${HEAD};font-size:18px;line-height:24px;font-weight:600;color:${C.navy};">${BRAND_NAME}</p>
<p class="sc-m" style="margin:0 0 16px 0;font-family:${BODY};font-size:13px;line-height:20px;color:${C.muted};">${escapeHtml(TAGLINE)}</p>
<p style="margin:0 0 20px 0;font-family:${BODY};font-size:13px;line-height:22px;">${SOCIAL.map(([n, u]) => fl(u, n)).join(sep)}<br>${fl("mailto:" + CONTACT, CONTACT)}</p>
<p class="sc-m" style="margin:0;font-family:${BODY};font-size:13px;line-height:20px;color:${C.muted};">Questions? Just reply to this email.<br>${fl(SITE, SITE_LABEL)}</p>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
${unsub}
</td></tr>
</table>
</body>
</html>`;

  // Plain-text part, built from the same data.
  const out = [];
  if (t.ref) out.push("REF " + t.ref);
  if (t.heading) out.push(t.heading);
  if (greeting) out.push(greeting);
  if (message) out.push(t.format ? plainFormatted(message) : message);
  if (rows.length)
    out.push(
      rows
        .map(([k, v]) => (k ? (t.stacked ? `${k}:\n${v}` : `${k}: ${v}`) : v))
        .join(t.stacked ? "\n\n" : "\n"),
    );
  if (t.code) out.push(`Your code: ${String(t.code).replace(/\s/g, "")}`);
  if (button && !message.includes(button.url)) out.push(`${button.label}:\n${button.url}`);
  if (note) out.push(note);
  if (quote) out.push((quote.by ? quote.by + "\n" : "") + clean(quote.text).replace(/^/gm, "> "));
  out.push("--\n" + signatureText());
  if (unsubscribeUrl && !message.includes(unsubscribeUrl))
    out.push(`Unsubscribe: ${unsubscribeUrl}`);
  const text = out.join("\n\n") + "\n";

  return { html, text };
}
