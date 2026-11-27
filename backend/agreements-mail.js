// Agreements: the emails, on the shared branded template (email-template.js). The invitation and the 6-digit
// code carry secrets (the private link, the code), so they go straight to the recipient and are never stored
// in the mail outbox. The signed-copy emails (with the PDF attached) go through the outbox like other mail.
import { renderEmail, CONTACT } from "./email-template.js";

const firstName = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)[0] || "";
const from = (transport) => {
  const sender = transport?.sender || CONTACT;
  return {
    from: `Scholars Cafe <${sender}>`,
    replyTo: sender === CONTACT ? undefined : CONTACT,
  };
};

/** The invitation: REF badge, the document card, "Review & Sign Agreement" and the private-link note. */
export function inviteEmail({ title, ref, issued, expires, name, email, url }) {
  const subject = `Please review and sign: ${title}`;
  const { html, text } = renderEmail({
    subject,
    preheader: `Your ${title} is ready to sign. It takes about five minutes, on your phone too.`,
    label: "Signature requested",
    ref,
    heading: title,
    firstName: firstName(name),
    greeting: "Hello,",
    text: `Your ${title} with Scholars Cafe is ready. Please read it and sign online. It takes about five minutes, and you can sign on your phone.\n\nIf anything in the agreement is unclear, reply to this email and your mentor will walk you through it before you sign.`,
    details: [
      ["Document", title],
      ["Status", "Awaiting your signature"],
      ["Issued", issued],
      ["Link expires", expires],
    ],
    button: { label: "Review & Sign Agreement", url },
    note: `This is a private, single-use link generated only for ${email}. It expires on ${expires}. Please don't forward this email.`,
  });
  return { subject, html, text };
}
export async function sendInvite(transport, input) {
  await transport.sendMail({ ...from(transport), to: input.email, ...inviteEmail(input) });
}

/** The 6-digit identity check code for the signing page. */
export function codeEmail({ title, code, minutes }) {
  const subject = `Your code to sign: ${title}`;
  const { html, text } = renderEmail({
    subject,
    preheader: `Your code is ${code}. It expires in ${minutes} minutes.`,
    label: "Agreement code",
    heading: "Your code to sign",
    text: `Use this code to open and sign "${title}". Your code is ${code}`,
    code,
    note: `It expires in ${minutes} minutes and works once. If you did not ask for this, ignore this email. Nobody can sign without the code.`,
  });
  return { subject, html, text };
}
export async function sendCode(transport, to, input) {
  await transport.sendMail({ ...from(transport), to, ...codeEmail(input) });
}

/** Outbox body and layout for the signer's copy. */
export const signedCopyText = ({ name, title, docId, signedAt, sha }) =>
  `Dear ${firstName(name) || "there"},\n\nThank you for signing the ${title}. Your signed copy is attached as a PDF.\n\nDocument ID: ${docId}\nSigned: ${signedAt}\nSHA-256 of the signed text: ${sha}\n\nPlease keep this email for your records. If anything looks wrong, reply to this email.`;
export const signedCopyLayout = ({ name, title, ref, docId, signedAt, sha }) => ({
  label: "Agreement signed",
  ref,
  heading: "Your signed copy",
  firstName: firstName(name),
  greeting: "Hello,",
  text: `Thank you for signing the ${title}. Your signed copy is attached as a PDF. Please keep this email for your records.`,
  details: [
    ["Document", title],
    ["Document ID", docId],
    ["Signed", signedAt],
    ["SHA-256", sha],
  ],
  note: "If anything looks wrong, reply to this email.",
});

/** Outbox body and layout for the team copy (contact@). */
export const teamSignedText = ({ name, email, title, ref, docId, signedAt, adminOrigin }) =>
  `${name} (${email}) signed the ${title}.\n\nREF: ${ref}\nDocument ID: ${docId}\nSigned: ${signedAt}\n\nThe signed PDF is attached. The full record is in the dashboard under Agreements${adminOrigin ? `: ${adminOrigin}/?open=Agreements` : "."}`;
export const teamSignedLayout = ({ name, email, title, ref, docId, signedAt }) => ({
  label: "Agreement signed",
  ref,
  heading: `${name} signed the ${title}`,
  greeting: "Hello,",
  text: "The signed PDF is attached. The full record is in the dashboard under Agreements.",
  details: [
    ["Signed by", `${name} (${email})`],
    ["Document ID", docId],
    ["Signed", signedAt],
  ],
  button: { label: "View agreements", screen: "Agreements" },
});
