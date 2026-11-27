// Agreements: the emails. The invitation and the 6-digit code carry secrets (the private link, the code),
// so they go straight to the recipient's address and are never stored in the mail outbox. The signed-copy
// emails (with the PDF attached) go through the outbox like every other automatic email.
import {
  renderEmail,
  escapeHtml,
  CONTACT,
  LOGO_BLUE,
  LOGO_ICE,
  DEFAULT_TAGLINE,
} from "./email-template.js";

const NAVY = "#041c31";
const BLUE = "#0b426d";
const INK = "#0c2d5e";
const MUTED = "#5b7088";
const LINE = "#dbe5ee";
const ICE50 = "#f6fbfe";
const ICE200 = "#d8e7f0";
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const HEADING = "'Funnel Display','Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "'JetBrains Mono',Menlo,Consolas,monospace";

const firstName = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)[0] || "there";
const from = (transport) => {
  const sender = transport?.sender || CONTACT;
  return {
    from: `Scholars Cafe <${sender}>`,
    replyTo: sender === CONTACT ? undefined : CONTACT,
  };
};

/** The invitation: the prototype's letterhead (REF badge, date) and action card, then the shared footer. */
export function inviteEmail(
  { title, ref, issued, expires, name, email, url },
  tagline = DEFAULT_TAGLINE,
) {
  const subject = `Please review and sign: ${title}`;
  const text = `Dear ${firstName(name)},

Your ${title} with Scholars' Cafe is ready. Please read it and sign online. It takes about five minutes, and you can sign on your phone.

Review & Sign Agreement: ${url}

REF ${ref}, issued ${issued}.
This is a private, single-use link generated only for ${email}. It expires on ${expires}. Please don't forward this email.

If anything in the agreement is unclear, reply to this email and your mentor will walk you through it before you sign.

Warm regards,
The Scholars' Cafe team`;
  const p = (html, last = false) =>
    `<p class="sc-text" style="margin:0 0 ${last ? 0 : 14}px;font-family:${FONT};font-size:15px;line-height:1.65;color:${INK}">${html}</p>`;
  const headerHtml = `<tr><td bgcolor="#ffffff" class="sc-card sc-pad" style="background:#ffffff;padding:22px 28px;border:1px solid ${LINE};border-bottom:1px solid ${LINE};border-radius:14px 14px 0 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" width="44" style="width:44px;padding-right:10px"><img class="sc-light-img" src="${LOGO_BLUE}" width="34" height="31" alt="Scholars' Cafe" style="display:block;border:0;width:34px;height:31px"><!--[if !mso]><!--><img class="sc-dark-img" src="${LOGO_ICE}" width="34" height="31" alt="" style="display:none;border:0;width:34px;height:31px"><!--<![endif]--></td>
<td valign="middle" class="sc-text" style="font-family:${HEADING};font-size:16px;font-weight:700;color:${NAVY};white-space:nowrap">Scholars' Cafe</td>
<td valign="middle" align="right" class="sc-muted" style="font-family:${FONT};font-size:11px;line-height:16px;color:${MUTED}">
<span style="display:inline-block;padding:3px 8px;border:1px solid ${LINE};border-radius:6px;font-family:${MONO};font-size:10.5px;letter-spacing:.04em;color:${BLUE};background:${ICE50};white-space:nowrap">REF ${escapeHtml(ref)}</span>
<div style="margin-top:5px">${escapeHtml(issued)}</div>
</td></tr></table>
</td></tr>`;
  const bodyHtml = `${p(`Dear ${escapeHtml(firstName(name))},`)}
${p(`Your ${escapeHtml(title)} with Scholars' Cafe is ready. Please read it and sign online.`)}
${p("It takes about five minutes, and you can sign on your phone.", true)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 6px;background:${ICE50};border:1px solid ${ICE200};border-radius:12px" bgcolor="${ICE50}"><tr><td style="padding:20px 22px;font-family:${FONT}">
<div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${MUTED}">Document</div>
<div style="margin-top:4px;font-family:${HEADING};font-size:18px;font-weight:700;color:${NAVY};line-height:24px">${escapeHtml(title)}</div>
<div style="margin-top:10px"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:#fff7e6;border:1px solid #f3dfb4;color:#7a5200;font-size:12px;font-weight:600">&#9679; Awaiting your signature</span></div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px"><tr><td style="border-radius:10px;background:${BLUE}" bgcolor="${BLUE}">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escapeHtml(url)}" style="height:46px;v-text-anchor:middle;width:250px" arcsize="20%" stroke="f" fillcolor="${BLUE}"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold">Review &amp; Sign Agreement</center></v:roundrect><![endif]-->
<!--[if !mso]><!--><a class="sc-btn" href="${escapeHtml(url)}" style="display:inline-block;padding:13px 22px;font-family:${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px">Review &amp; Sign Agreement</a><!--<![endif]-->
</td></tr></table>
<div style="margin-top:14px;font-size:12.5px;line-height:19px;color:${MUTED}">This is a private, single-use link generated only for <span style="color:${INK}">${escapeHtml(email)}</span>. It expires on ${escapeHtml(expires)}. Please don't forward this email.</div>
</td></tr></table>
<div style="height:18px;line-height:18px;font-size:1px">&nbsp;</div>
${p("If anything in the agreement is unclear, reply to this email and your mentor will walk you through it before you sign.")}
${p("Warm regards,<br>The Scholars' Cafe team")}`;
  const { html, text: plain } = renderEmail({ subject, text, tagline, headerHtml, bodyHtml });
  return { subject, html, text: plain };
}

export async function sendInvite(transport, input, tagline) {
  const m = inviteEmail(input, tagline);
  await transport.sendMail({ ...from(transport), to: input.email, ...m });
}

/** The 6-digit identity check code for the signing page. */
export function codeEmail({ title, code, minutes }, tagline = DEFAULT_TAGLINE) {
  const subject = `Your code to sign: ${title}`;
  const text = `Your code to open and sign "${title}" is ${code}\n\nIt expires in ${minutes} minutes and works once. If you did not ask for this, ignore this email. Nobody can sign without the code.`;
  return { subject, ...renderEmail({ subject, text, tagline }) };
}
export async function sendCode(transport, to, input, tagline) {
  const m = codeEmail(input, tagline);
  await transport.sendMail({
    ...from(transport),
    to,
    subject: m.subject,
    html: m.html,
    text: m.text,
  });
}

/** Outbox text for the signer's copy. */
export const signedCopyText = ({ name, title, docId, signedAt, sha }) =>
  `Dear ${firstName(name)},

Thank you for signing the ${title}. Your signed copy is attached as a PDF.

Document ID: ${docId}
Signed: ${signedAt}
SHA-256 of the signed text: ${sha}

Please keep this email for your records. If anything looks wrong, reply to this email.

Warm regards,
The Scholars' Cafe team`;

/** Outbox text for the team copy (contact@). */
export const teamSignedText = ({ name, email, title, ref, docId, signedAt, adminOrigin }) =>
  `${name} (${email}) signed the ${title}.

REF: ${ref}
Document ID: ${docId}
Signed: ${signedAt}

The signed PDF is attached. The full record is in the dashboard under Agreements${adminOrigin ? `: ${adminOrigin}/?open=Agreements` : "."}`;
