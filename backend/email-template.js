// One shared look for every email the app sends (replies from contact@, and the automatic mails from
// no-reply@: bookings, sign-in codes, tasks, form receipts, ECA alerts). The wording stays exactly what
// each feature writes as plain text; this only wraps it in a clean, brand-consistent HTML layout and keeps
// the plain text as the alternative part.
//
// Built for Gmail, Outlook (Word renderer) and phones: a single 600px table, inline styles only, web-safe
// fonts, no background images, no CSS the big clients drop, and no images at all (nothing to block).

export const CONTACT = "contact@scholarscafe.com";
const NAVY = "#041c31";
const INK = "#1f2a37";
const MUTED = "#5b6876";
const LINE = "#e3e8ee";
const PAGE = "#f4f6f8";
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
    return `<a href="${escapeHtml(href)}" style="color:${NAVY};text-decoration:underline;word-break:break-all">${url}</a>`;
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
        `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK}">${linkify(escapeHtml(para)).replace(/\n/g, "<br>")}</p>`,
    )
    .join("\n");
}

/**
 * The finished email: { html, text }. `text` is the body exactly as written plus the short footer.
 * @param {{ subject?: string, text: string, unsubscribeUrl?: string|null }} input
 */
export function renderEmail({ subject = "", text, unsubscribeUrl = null }) {
  const body = String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .trim();
  const footerText = [
    "—",
    "Scholars Cafe · https://scholarscafe.com",
    `Questions? Reply to this email or write to ${CONTACT}.`,
    ...(unsubscribeUrl && !body.includes(unsubscribeUrl) ? [`Unsubscribe: ${unsubscribeUrl}`] : []),
  ].join("\n");
  const plain = `${body}\n\n${footerText}\n`;
  const preheader = escapeHtml(body.replace(/\s+/g, " ").slice(0, 110));
  const unsub = unsubscribeUrl
    ? `<br><a href="${escapeHtml(unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline">Unsubscribe</a> from these emails.`
    : "";
  const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title>
<!--[if mso]><style>body,table,td,p,a{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${PAGE};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${PAGE}">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAGE}" style="background:${PAGE}">
<tr><td align="center" style="padding:24px 12px">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">
<tr><td bgcolor="${NAVY}" style="background:${NAVY};padding:18px 28px;border-radius:12px 12px 0 0">
<span style="font-family:${FONT};font-size:18px;font-weight:700;letter-spacing:.2px;color:#ffffff">Scholars Cafe</span>
</td></tr>
<tr><td bgcolor="#ffffff" style="background:#ffffff;padding:28px 28px 12px;border-left:1px solid ${LINE};border-right:1px solid ${LINE}">
${textToHtml(body)}
</td></tr>
<tr><td bgcolor="#ffffff" style="background:#ffffff;padding:0 28px 24px;border:1px solid ${LINE};border-top:0;border-radius:0 0 12px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid ${LINE};padding-top:16px;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED}">
<strong style="color:${INK}">Scholars Cafe</strong> · <a href="https://scholarscafe.com" style="color:${MUTED};text-decoration:underline">scholarscafe.com</a><br>
Questions? Reply to this email or write to <a href="mailto:${CONTACT}" style="color:${MUTED};text-decoration:underline">${CONTACT}</a>.${unsub}
</td></tr></table>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
  return { html, text: plain };
}
