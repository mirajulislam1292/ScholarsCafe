import test from "node:test";
import assert from "node:assert/strict";
import { renderEmail, textToHtml } from "./email-template.js";
import { createMailer, deliverMail, outboxMessage, loginEmail } from "./mail.js";

test("Email template: escaped body, links, footer, plain-text alternative", () => {
  const body = "Hi <b>Rafi</b> & team\n\nOpen: https://admin.scholarscafe.com/?a=1&b=2.\nThanks";
  const { html, text } = renderEmail({ subject: "Hello", text: body });
  // Wording is kept exactly; the plain part is the body plus a short footer.
  assert.ok(text.startsWith(body + "\n\n—\nScholars Cafe"));
  assert.match(text, /contact@scholarscafe\.com/);
  // Never trusted as markup.
  assert.doesNotMatch(html, /<b>Rafi/);
  assert.match(html, /Hi &lt;b&gt;Rafi&lt;\/b&gt; &amp; team/);
  // Links are clickable, trailing punctuation stays outside, & is escaped once in href.
  assert.match(html, /href="https:\/\/admin\.scholarscafe\.com\/\?a=1&amp;b=2"/);
  assert.match(html, /b=2<\/a>\./);
  // Gmail/Outlook/mobile basics: tables, inline styles, 600px, MSO wrapper, no <style> blocks outside MSO.
  assert.match(html, /max-width:600px/);
  assert.match(html, /<!--\[if mso\]>/);
  assert.match(html, /role="presentation"/);
  assert.doesNotMatch(html.replace(/<!--\[if mso\]>[\s\S]*?<!\[endif\]-->/g, ""), /<style/);
  assert.doesNotMatch(html, /<script|<img/);
  assert.doesNotMatch(html, /Unsubscribe/);
});

test("Email template: unsubscribe link only on list mail", () => {
  const url = "https://admin.scholarscafe.com/public/unsubscribe/eca?t=abc";
  const { html, text } = renderEmail({ text: "New ECA", unsubscribeUrl: url });
  assert.match(
    html,
    /href="https:\/\/admin\.scholarscafe\.com\/public\/unsubscribe\/eca\?t=abc"[^>]*>Unsubscribe/,
  );
  assert.match(text, /Unsubscribe: https:\/\/admin/);
  // Not repeated when the body already carries the link.
  const again = renderEmail({ text: "Bye " + url, unsubscribeUrl: url }).text;
  assert.equal(again.split(url).length, 2);
  assert.equal(textToHtml("a\nb\n\nc").match(/<p /g).length, 2);
});

test("Outbox mail: From name, Reply-To contact@ on no-reply mail, threading, list headers", () => {
  const transport = {
    sender: "no-reply@scholarscafe.com",
    contact: { sender: "contact@scholarscafe.com" },
  };
  const receipt = outboxMessage(
    { id: "r1", subject: "Your response", body: "Thanks", to_email: "a@b.co", reply_to: null },
    transport,
  );
  assert.equal(receipt.from, "Scholars Cafe <no-reply@scholarscafe.com>");
  assert.equal(receipt.replyTo, "contact@scholarscafe.com");
  assert.equal(receipt.messageId, "<r1@scholarscafe.com>");
  assert.match(receipt.html, /Thanks/);
  // Team notices keep the visitor as Reply-To and go to the inbox.
  const team = outboxMessage(
    { id: "t", subject: "New inquiry", body: "x", reply_to: "v@x.co" },
    transport,
  );
  assert.equal(team.to, "contact@scholarscafe.com");
  assert.equal(team.replyTo, "v@x.co");
  assert.equal(team.from, "Scholars Cafe <no-reply@scholarscafe.com>");
  // A Mail-screen reply: from contact@, threaded.
  const reply = outboxMessage(
    {
      id: "x",
      subject: "Re: Help",
      body: "Sure",
      to_email: "s@x.co",
      from_contact: 1,
      in_reply_to: "<m1@x.co>",
      references_hdr: "<m0@x.co> <m1@x.co>",
    },
    transport,
  );
  assert.equal(reply.from, "Scholars Cafe <contact@scholarscafe.com>");
  assert.equal(reply.replyTo, undefined);
  assert.equal(reply.inReplyTo, "<m1@x.co>");
  assert.equal(reply.references, "<m0@x.co> <m1@x.co>");
  const eca = outboxMessage(
    { id: "e", subject: "ECA", body: "b", to_email: "s@x.co", unsubscribe_url: "https://u/x" },
    transport,
  );
  assert.equal(eca.headers["List-Unsubscribe"], "<https://u/x>");
  assert.match(eca.html, /Unsubscribe/);
});

test("Replies go through the contact@ transport; missing transport keeps them queued", async () => {
  const sent = [];
  const row = { id: "x", subject: "Re: a", body: "b", to_email: "s@x.co", from_contact: 1 };
  const run = async (transport) => {
    const queries = [];
    await deliverMail(
      {
        transaction: (fn) => fn({}),
        query: async (sql) => (queries.push(sql), sql.startsWith("SELECT") ? [row] : {}),
      },
      transport,
    );
    return queries;
  };
  const contact = {
    sender: "contact@scholarscafe.com",
    sendMail: async (m) => sent.push(["contact", m]),
  };
  let q = await run({
    sender: "no-reply@scholarscafe.com",
    contact,
    sendMail: async (m) => sent.push(["main", m]),
  });
  assert.deepEqual(
    sent.map((s) => s[0]),
    ["contact"],
  );
  assert.ok(q.some((s) => s.includes("sent_at=UTC_TIMESTAMP()")));
  q = await run({
    sender: "no-reply@scholarscafe.com",
    contact: null,
    sendMail: async () => sent.push(["main"]),
  });
  assert.equal(sent.length, 1);
  assert.ok(q.some((s) => s.includes("attempts=attempts+1,next_attempt_at")));
});

test("Mailer: contact@ transport reused or signed in separately", () => {
  const same = createMailer({ SMTP_PASSWORD: "x" });
  assert.equal(same.contact, same);
  const split = createMailer({
    SMTP_PASSWORD: "x",
    SMTP_USER: "no-reply@scholarscafe.com",
    CONTACT_IMAP_USER: "contact@scholarscafe.com",
    CONTACT_IMAP_PASSWORD: "y",
  });
  assert.equal(split.sender, "no-reply@scholarscafe.com");
  assert.equal(split.contact.sender, "contact@scholarscafe.com");
  assert.equal(
    createMailer({ SMTP_PASSWORD: "x", SMTP_USER: "no-reply@scholarscafe.com" }).contact,
    null,
  );
});

test("Sign-in code email uses the shared template", () => {
  const m = loginEmail(
    { sender: "no-reply@scholarscafe.com" },
    "a@b.co",
    "123456",
    "https://s/x",
    10,
  );
  assert.equal(m.from, "Scholars Cafe <no-reply@scholarscafe.com>");
  assert.equal(m.replyTo, "contact@scholarscafe.com");
  assert.match(m.text, /^Your sign-in code is 123456/);
  assert.match(m.html, /123456/);
  assert.match(m.html, /href="https:\/\/s\/x"/);
});
