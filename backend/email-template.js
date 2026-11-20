// One shared, branded look for every email the app sends: replies from contact@ and the automatic mails
// from no-reply@ (bookings, sign-in codes, tasks, form receipts, ECA alerts, team notices). The wording
// stays exactly what each feature writes as plain text; this wraps it in a card with the logo, one clear
// button for the main action, a signature card and a short footer, and keeps the plain text alternative.
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
// The /links page tagline (CMS key Links.tagline); this default is the website's own text.
export const DEFAULT_TAGLINE = "Mentor-led guidance for studying abroad, from Bangladesh.";

const NAVY = "#041c31";
const BLUE = "#185689";
const INK = "#1f2a37";
const MUTED = "#5b6876";
const LINE = "#e3e8ee";
const PAGE = "#f1f5f8";
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

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
    return `<a href="${escapeHtml(href)}" class="sc-link" style="color:${BLUE};text-decoration:underline;word-break:break-all">${url}</a>`;
  });
}

/** Plain text → HTML paragraphs (blank line = new paragraph, single line break = <br>). */
export function textToHtml(text) {
  return String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map(
      (para) =>
        `<p class="sc-text" style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK}">${linkify(escapeHtml(para)).replace(/\n/g, "<br>")}</p>`,
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

/** The plain-text signature (same content as the HTML signature card). */
export function signatureText(tagline = DEFAULT_TAGLINE) {
  return [
    "Scholars Cafe",
    tagline,
    `${SITE.replace("https://", "")} · ${CONTACT}`,
    SOCIAL.map(([n, u]) => `${n}: ${u}`).join("\n"),
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

function signatureHtml(tagline) {
  const social = SOCIAL.map(
    ([n, u]) =>
      `<a href="${escapeHtml(u)}" class="sc-link" style="color:${BLUE};text-decoration:none;font-weight:600">${n}</a>`,
  ).join(`<span style="color:${MUTED}"> &nbsp;·&nbsp; </span>`);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="sc-sig" bgcolor="#f7fafc" style="background:#f7fafc;border:1px solid ${LINE};border-radius:12px">
<tr><td width="56" valign="top" style="padding:16px 0 16px 16px"><img class="sc-light-img" src="${LOGO_BLUE}" width="40" height="36" alt="" style="display:block;border:0;outline:none;width:40px;height:36px"><!--[if !mso]><!--><img class="sc-dark-img" src="${LOGO_ICE}" width="40" height="36" alt="" style="display:none;border:0;outline:none;width:40px;height:36px"><!--<![endif]--></td>
<td valign="top" class="sc-muted" style="padding:16px;font-family:${FONT};font-size:13px;line-height:1.6;color:${MUTED}">
<strong class="sc-text" style="font-size:15px;color:${INK}">Scholars Cafe</strong><br>
${escapeHtml(tagline)}<br>
<a href="${SITE}" class="sc-link" style="color:${BLUE};text-decoration:none">scholarscafe.com</a> &nbsp;·&nbsp; <a href="mailto:${CONTACT}" class="sc-link" style="color:${BLUE};text-decoration:none">${CONTACT}</a><br>
${social}
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
}) {
  const body = String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .trim();
  const footerText = [
    `Questions? Reply to this email or write to ${CONTACT}.`,
    ...(unsubscribeUrl && !body.includes(unsubscribeUrl) ? [`Unsubscribe: ${unsubscribeUrl}`] : []),
  ].join("\n");
  const plain = `${body}\n\n${action && !body.includes(action.url) ? `${action.label}: ${action.url}\n\n` : ""}—\n${signatureText(tagline)}\n\n${footerText}\n`;
  const preheader = escapeHtml(body.replace(/\s+/g, " ").slice(0, 110));
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
  .sc-sig { background:#0f1b27 !important; border-color:#24364a !important; }
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
<!--[if mso]><style>body,table,td,p,a{font-family:Arial,sans-serif!important}</style><![endif]-->
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
${textToHtml(body)}
${action ? button(action) : ""}
</td></tr>
<tr><td bgcolor="#ffffff" class="sc-card sc-pad" style="background:#ffffff;padding:4px 28px 24px;border:1px solid ${LINE};border-top:0;border-radius:0 0 14px 14px">
${signatureHtml(tagline)}
</td></tr>
<tr><td class="sc-pad sc-muted" style="padding:16px 28px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};text-align:center">
Questions? Reply to this email or write to <a href="mailto:${CONTACT}" style="color:${MUTED};text-decoration:underline">${CONTACT}</a>.${unsub}<br>
© Scholars Cafe · <a href="${SITE}" style="color:${MUTED};text-decoration:underline">scholarscafe.com</a>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
  return { html, text: plain };
}
