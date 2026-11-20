// One shared, branded look for every email the app sends: replies from contact@ and the automatic mails
// from no-reply@ (bookings, sign-in codes, tasks, form receipts, ECA alerts, team notices). The wording
// stays exactly what each feature writes as plain text; this wraps it in a card with the logo, one clear
// button for the main action and a branded footer (logo, name, tagline, socials, contact; the website link
// once at the very bottom), and keeps the plain text alternative.
//
// Built for Gmail (web/iOS/Android), Apple Mail and Outlook (Word renderer) and phones: tables, inline
// styles, bgcolor attributes, a VML button for Outlook, 600px max width. Dark mode: the header and button
// keep their own colours, and Apple Mail gets explicit dark styles (Gmail ignores them and inverts safely).

export const CONTACT = "contact@scholarscafe.com";
export const SITE = "https://scholarscafe.com";
// Logos are the website's own brand files (absolute URLs, so mail apps can load them).
export const LOGO_ICE = SITE + "/brand/mark-ice.png";
export const LOGO_BLUE = SITE + "/brand/mark-blue.png";
// The same social profiles the website footer links to. Nothing invented.
export const SOCIAL = [
  ["Facebook", "https://www.facebook.com/profile.php?id=61571394902795"],
  ["Instagram", "https://www.instagram.com/scholars_cafe_/"],
  ["LinkedIn", "https://www.linkedin.com/company/scholars-cafe09/"],
];
// The footer tagline. The CMS key Links.tagline (the /links page) overrides it when it has been edited.
export const DEFAULT_TAGLINE = "Mentor-led guidance for studying abroad from Bangladesh";
export const BRAND_NAME = "Scholars' Cafe";

// Brand colours from the website (src/styles.css).
const NAVY = "#041c31"; // blue-950
const BLUE = "#0b426d"; // blue-800: buttons
const LINK = "#2b6da6"; // blue-600: links
const ICE = "#e8f3f9"; // ice-100: footer panel
const INK = "#1f2a37";
const MUTED = "#5b6876";
const LINE = "#e3e8ee";
const PAGE = "#f1f5f8";
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
// The website's heading font; mail apps without it fall back to web-safe fonts.
const HEADING = "'Funnel Display','Segoe UI',Helvetica,Arial,sans-serif";

export const escapeHtml = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

// Bare https:// links become clickable; trailing punctuation stays outside the link.
const URL_RE = /https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]]/g;
function linkify(escaped) {
  return escaped.replace(URL_RE, (url) => {
    const href = url.replace(/&amp;/g, "&");
    return `<a href="${escapeHtml(href)}" class="sc-link" style="color:${LINK};text-decoration:underline;word-break:break-all">${url}</a>`;
  });
}

// Simple formatting for mail typed in the dashboard (compose and replies): **bold** and [label](https://…).
const MD_LINK = /\[([^\]\n]{1,200})\]\((https:\/\/[^\s()<>"']{1,2000})\)/g;
const BOLD = /\*\*([^*\n]{1,500}?)\*\*/g;
function rich(escaped) {
  const links = [];
  const held = escaped.replace(MD_LINK, (_m, label, url) => {
    links.push(
      `<a href="${escapeHtml(url.replace(/&amp;/g, "&"))}" class="sc-link" style="color:${LINK};text-decoration:underline">${label}</a>`,
    );
    return `\u0000${links.length - 1}\u0000`;
  });
  return linkify(held)
    .replace(BOLD, "<strong>$1</strong>")
    .replace(/\u0000(\d+)\u0000/g, (_m, i) => links[Number(i)]);
}
/** The plain-text version of formatted text: "**x**" → "x", "[label](url)" → "label (url)". */
export const plainFormatted = (text) =>
  String(text ?? "")
    .replace(MD_LINK, "$1 ($2)")
    .replace(BOLD, "$1");

/** Plain text → HTML paragraphs (blank line = new paragraph, single line break = <br>). */
export function textToHtml(text, { format = false } = {}) {
  return String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map(
      (para) =>
        `<p class="sc-text" style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK}">${(format ? rich : linkify)(escapeHtml(para)).replace(/\n/g, "<br>")}</p>`,
    )
    .join("\n");
}

/**
 * The main action button for a mail, worked out from what it already says (so no feature has to change
 * its wording): a session link, the task list, a sign-in link, or the right dashboard screen for team
 * notices. Returns null when there is nothing obvious to click.
 */
export function actionFor({ subject = "", text = "", toTeam = false }, adminOrigin = "") {
  const link = (re) => re.exec(text)?.[1];
  const admin = (screen) =>
    adminOrigin ? `${adminOrigin}/?open=${encodeURIComponent(screen)}` : null;
  const pick = (label, url) => (url && /^https:\/\//.test(url) ? { label, url } : null);
  let a;
  if ((a = link(/Join here: (https:\/\/\S+)/))) return pick("Join session", a);
  if ((a = link(/sign in:\n(https:\/\/\S+)/i))) return pick("Sign in", a);
  if ((a = link(/Open your tasks: (https:\/\/\S+)/))) return pick("Open task", a);
  if (/cancelled/i.test(subject) && text.includes(SITE + "/book"))
    return pick("Book another time", SITE + "/book");
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

/** The plain-text footer (same content and order as the HTML footer; the website appears once, last). */
export function signatureText(tagline = DEFAULT_TAGLINE) {
  return [
    BRAND_NAME,
    tagline,
    "",
    ...SOCIAL.map(([n, u]) => `${n}: ${u}`),
    `Email: ${CONTACT}`,
  ].join("\n");
}

function button({ label, url }) {
  const href = escapeHtml(url);
  const text = escapeHtml(label);
  // Outlook gets a VML rounded rectangle; everyone else a padded link.
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px"><tr><td align="left">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:44px;v-text-anchor:middle;width:220px" arcsize="20%" stroke="f" fillcolor="${BLUE}"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold">${text}</center></v:roundrect><![endif]-->
<!--[if !mso]><!--><a class="sc-btn" href="${href}" style="display:inline-block;background:${BLUE};color:#ffffff;font-family:${FONT};font-size:15px;font-weight:700;line-height:44px;padding:0 24px;border-radius:10px;text-decoration:none">${text}</a><!--<![endif]-->
</td></tr></table>`;
}

// The footer every email ends with: divider, centred logo, name in the heading font, tagline, social
// links and the contact address. The website link follows once, at the very bottom (see renderEmail).
function footerHtml(tagline) {
  const sep = `<span class="sc-muted" style="color:${MUTED}">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`;
  const links = [...SOCIAL.map(([n, u]) => [n, u]), [CONTACT, "mailto:" + CONTACT]]
    .map(
      ([n, u]) =>
        `<a href="${escapeHtml(u)}" class="sc-link" style="color:${LINK};text-decoration:none;font-weight:600;white-space:nowrap">${escapeHtml(n)}</a>`,
    )
    .join(sep);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td class="sc-line" style="border-top:1px solid ${LINE};font-size:0;line-height:0;height:1px">&nbsp;</td></tr>
<tr><td align="center" bgcolor="${ICE}" class="sc-foot" style="background:${ICE};padding:24px 20px 22px;text-align:center;border-radius:0 0 14px 14px">
<img class="sc-light-img" src="${LOGO_BLUE}" width="48" height="43" alt="Scholars' Cafe logo" style="display:block;margin:0 auto 10px;border:0;outline:none;width:48px;height:43px"><!--[if !mso]><!--><img class="sc-dark-img" src="${LOGO_ICE}" width="48" height="43" alt="Scholars' Cafe logo" style="display:none;margin:0 auto 10px;border:0;outline:none;width:48px;height:43px"><!--<![endif]-->
<div class="sc-text" style="font-family:${HEADING};font-size:20px;font-weight:700;line-height:1.3;color:${NAVY}">${escapeHtml(BRAND_NAME)}</div>
<div class="sc-muted" style="font-family:${FONT};font-size:13px;line-height:1.5;color:${BLUE};margin:4px 0 14px">${escapeHtml(tagline)}</div>
<div style="font-family:${FONT};font-size:13px;line-height:1.9">${links}</div>
</td></tr></table>`;
}

/**
 * The finished email: { html, text }. `text` is the body exactly as written, the signature and a footer.
 * @param {{ subject?: string, text: string, unsubscribeUrl?: string|null,
 *           action?: {label: string, url: string}|null, tagline?: string }} input
 */
export function renderEmail({
  subject = "",
  text,
  unsubscribeUrl = null,
  action = null,
  tagline = DEFAULT_TAGLINE,
  format = false,
}) {
  const body = String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .trim();
  const footerText = [
    "Questions? Just reply to this email.",
    ...(unsubscribeUrl && !body.includes(unsubscribeUrl) ? [`Unsubscribe: ${unsubscribeUrl}`] : []),
  ].join("\n");
  const plainBody = format ? plainFormatted(body) : body;
  const plain = `${plainBody}\n\n${action && !body.includes(action.url) ? `${action.label}: ${action.url}\n\n` : ""}—\n${signatureText(tagline)}\n\n${footerText}\n${SITE.replace("https://", "")}\n`;
  const preheader = escapeHtml(plainBody.replace(/\s+/g, " ").slice(0, 110));
  const unsub = unsubscribeUrl
    ? `<br><a href="${escapeHtml(unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline">Unsubscribe</a> from these emails.`
    : "";
  const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(subject)}</title>
<style>
@media (prefers-color-scheme: dark) {
  .sc-page { background:#0b1622 !important; }
  .sc-card { background:#13202d !important; border-color:#24364a !important; }
  .sc-foot { background:#0f1b27 !important; }
  .sc-line { border-color:#24364a !important; }
  .sc-text { color:#e6edf3 !important; }
  .sc-muted { color:#9fb0c0 !important; }
  .sc-link { color:#8cc2f0 !important; }
  .sc-light-img { display:none !important; }
  .sc-dark-img { display:block !important; }
}
@media only screen and (max-width:620px) {
  .sc-pad { padding-left:20px !important; padding-right:20px !important; }
}
</style>
<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@700&display=swap" rel="stylesheet"><!--<![endif]-->
<!--[if mso]><style>body,table,td,p,a,div{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body class="sc-page" style="margin:0;padding:0;background:${PAGE};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${PAGE}">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAGE}" class="sc-page" style="background:${PAGE}">
<tr><td align="center" style="padding:24px 12px">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">
<tr><td bgcolor="${NAVY}" class="sc-pad" style="background:${NAVY};padding:18px 28px;border-radius:14px 14px 0 0">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:10px"><img src="${LOGO_ICE}" width="32" height="29" alt="" style="display:block;border:0;outline:none;width:32px;height:29px"></td>
<td valign="middle" style="font-family:${FONT};font-size:18px;font-weight:700;letter-spacing:.2px;color:#ffffff">Scholars Cafe</td>
</tr></table>
</td></tr>
<tr><td bgcolor="#ffffff" class="sc-card sc-pad" style="background:#ffffff;padding:28px 28px 8px;border-left:1px solid ${LINE};border-right:1px solid ${LINE}">
${textToHtml(body, { format })}
${action ? button(action) : ""}
</td></tr>
<tr><td bgcolor="#ffffff" class="sc-card" style="background:#ffffff;padding:8px 0 0;border:1px solid ${LINE};border-top:0;border-radius:0 0 14px 14px">
${footerHtml(tagline)}
</td></tr>
<tr><td class="sc-pad sc-muted" style="padding:16px 28px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};text-align:center">
Questions? Just reply to this email.${unsub}<br>
<a href="${SITE}" style="color:${MUTED};text-decoration:underline">scholarscafe.com</a>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
  return { html, text: plain };
}
