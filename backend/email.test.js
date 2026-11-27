import test from "node:test";
import assert from "node:assert/strict";
import {
  renderEmail,
  textToHtml,
  actionFor,
  SOCIAL,
  DEFAULT_TAGLINE,
  BRAND_NAME,
  CONTACT,
} from "./email-template.js";
import { createMailer, deliverMail, outboxMessage, loginEmail, emailTagline } from "./mail.js";

test("Email template: branded card, escaped text, links, dark mode, Outlook, plain-text part", () => {
  const body = "Hi <b>Rafi</b> & team\n\nOpen: https://admin.scholarscafe.com/?a=1&b=2.\nThanks";
  const { html, text } = renderEmail({ subject: "Hello", text: body });
  // Plain part: the message as written, then the brand footer.
  assert.ok(text.startsWith(body + "\n\n--\n" + BRAND_NAME + "\n" + DEFAULT_TAGLINE));
  assert.equal(BRAND_NAME, "Scholars Cafe");
  assert.match(text, /contact@scholarscafe\.com/);
  for (const [, url] of SOCIAL) assert.ok(text.includes(url) && html.includes(url));
  // Never trusted as markup.
  assert.doesNotMatch(html, /<b>Rafi/);
  assert.match(html, /Hi &lt;b&gt;Rafi&lt;\/b&gt; &amp; team/);
  // Links are clickable, trailing punctuation stays outside, & is escaped once in href.
  assert.match(html, /href="https:\/\/admin\.scholarscafe\.com\/\?a=1&amp;b=2"/);
  assert.match(html, /b=2<\/a>\./);
  // Logos: absolute PNGs, blue for light mode and ice swapped in for dark mode.
  assert.match(
    html,
    /<img src="https:\/\/scholarscafe\.com\/brand\/mark-blue\.png"[^>]+class="sc-logo-l"/,
  );
  assert.match(
    html,
    /class="sc-logo-d"[^>]*><img src="https:\/\/scholarscafe\.com\/brand\/mark-ice\.png"/,
  );
  assert.match(html, /\.sc-logo-l\{display:none!important;\}/);
  // Dark mode: meta tags, media query, Outlook.com rules, button colours.
  assert.match(html, /<meta name="color-scheme" content="light dark">/);
  assert.match(html, /<meta name="supported-color-schemes" content="light dark">/);
  assert.match(html, /prefers-color-scheme: dark/);
  assert.match(html, /\[data-ogsc\] \.sc-t/);
  assert.match(html, /\.sc-btn\{background:#8cc2f0!important;color:#041c31!important;\}/);
  // Gmail/Outlook/mobile basics: tables, 600px card, Outlook wrapper and DPI fix, mobile rules.
  assert.match(html, /max-width:600px/);
  assert.match(html, /<!--\[if mso\]><table role="presentation" width="600"/);
  assert.match(html, /<o:PixelsPerInch>96<\/o:PixelsPerInch>/);
  assert.match(html, /@media only screen and \(max-width:620px\)/);
  assert.match(html, /\.sc-h1\{font-size:23px!important/);
  assert.match(html, /role="presentation"/);
  assert.doesNotMatch(html, /<script|display:\s*(flex|grid)|var\(--|<svg|\.webp/);
  assert.doesNotMatch(html, /Unsubscribe/);
  assert.doesNotMatch(html, /sc-btn" style="display:inline-block/, "no button without an action");
  // No em dashes anywhere in the template.
  assert.doesNotMatch(html + text, /\u2014/);
});

test("Email layout: label, REF, heading, greeting, details, code, button, note and quote", () => {
  const { html, text } = renderEmail({
    subject: "S",
    label: "Booking confirmed",
    ref: "SC-1",
    heading: "Your <session>",
    firstName: "Nusrat Jahan",
    text: "Message",
    details: [
      ["When", "Tue 2 Dec"],
      ["Empty", ""],
    ],
    code: "482 913",
    button: { label: "Join the session", url: "https://meet.example/x" },
    note: "Small print",
    quote: { by: "On Mon, X wrote:", text: "Original <q>" },
  });
  assert.match(html, />Booking confirmed<\/td>/);
  assert.match(html, />REF SC-1<\/td>/);
  assert.match(html, /<h1 class="sc-h sc-h1"[^>]*>Your &lt;session&gt;<\/h1>/);
  assert.match(html, />Hi Nusrat,<\/p>/);
  assert.match(html, />Tue 2 Dec<\/td>/);
  assert.doesNotMatch(html, />Empty</, "empty rows are dropped");
  assert.match(html, />4 8 2 9 1 3<\/div>/);
  assert.match(html, /<v:roundrect[^>]+href="https:\/\/meet\.example\/x"/);
  assert.match(html, /Original &lt;q&gt;/);
  const order = [
    "REF SC-1",
    "Your &lt;session&gt;",
    "Hi Nusrat,",
    "Message",
    "Tue 2 Dec",
    "4 8 2 9 1 3",
    ">Join the session<",
    "Small print",
    "Original",
  ].map((n) => html.indexOf(n, html.indexOf('class="sc-card"')));
  assert.deepEqual(
    [...order].sort((x, y) => x - y),
    order,
  );
  assert.ok(order.every((i) => i > 0));
  assert.match(
    text,
    /^REF SC-1\n\nYour <session>\n\nHi Nusrat,\n\nMessage\n\nWhen: Tue 2 Dec\n\nYour code: 482913\n\nJoin the session:\nhttps:\/\/meet\.example\/x\n\nSmall print\n\nOn Mon, X wrote:\n> Original <q>\n\n--\nScholars Cafe/,
  );
  // Stacked rows for form answers; a plain greeting when the name is unknown.
  const stacked = renderEmail({
    text: "x",
    details: [["Question?", "Answer"]],
    stacked: true,
    greeting: "Hello,",
  });
  assert.match(stacked.html, />Question\?<\/div>/);
  assert.match(stacked.html, />Hello,<\/p>/);
  assert.match(stacked.text, /Question\?:\nAnswer/);
  // Only https buttons.
  assert.doesNotMatch(
    renderEmail({ text: "x", button: { label: "B", url: "javascript:alert(1)" } }).html,
    /javascript/,
  );
});

test("Main action button: derived from the mail, Outlook-safe", () => {
  const admin = "https://admin.scholarscafe.com";
  const cases = [
    [
      { subject: "Your session is booked", text: "Join here: https://meet.google.com/abc-defg" },
      "Join the session",
      "https://meet.google.com/abc-defg",
    ],
    [
      {
        subject: "Code",
        text: "Or open this link to sign in:\nhttps://student.scholarscafe.com/auth/x?t=1",
      },
      "Sign in",
      "https://student.scholarscafe.com/auth/x?t=1",
    ],
    [
      { subject: "New task for you: X", text: "Open your tasks: https://admin.scholarscafe.com/" },
      "Open task",
      "https://admin.scholarscafe.com/",
    ],
    [
      {
        subject: "Your Scholars Cafe session was cancelled",
        text: "Pick another time at https://scholarscafe.com/book, or reply.",
      },
      "Book a new time",
      "https://scholarscafe.com/book",
    ],
    [
      { subject: "New booking: Rafi", text: "x", toTeam: true },
      "View booking",
      admin + "/?open=Bookings",
    ],
    [
      { subject: "New website inquiry", text: "x", toTeam: true },
      "View lead",
      admin + "/?open=Leads",
    ],
  ];
  for (const [mail, label, url] of cases)
    assert.deepEqual(actionFor(mail, admin), { label, url }, label);
  assert.equal(
    actionFor({ subject: "New booking: x", text: "x" }, admin),
    null,
    "only team notices",
  );
  assert.equal(actionFor({ subject: "Hi", text: "Join here: http://insecure.example" }), null);
  const { html, text } = renderEmail({
    text: "Hello",
    action: { label: "Open task", url: "https://a.example/t" },
  });
  assert.match(html, /<v:roundrect[^>]+href="https:\/\/a\.example\/t"/);
  assert.match(html, /<a href="https:\/\/a\.example\/t" class="sc-btn"[^>]*>Open task<\/a>/);
  assert.match(text, /Open task:\nhttps:\/\/a\.example\/t/);
});

test("Tagline is fixed in the brand file (no longer taken from the website CMS)", async () => {
  assert.equal(DEFAULT_TAGLINE, "A Cafe to Ease Your Study Abroad Journey");
  assert.equal(
    await emailTagline({ query: async () => [{ published: '{"Links.tagline":"x"}' }] }),
    DEFAULT_TAGLINE,
  );
  assert.match(renderEmail({ text: "x" }).html, />A Cafe to Ease Your Study Abroad Journey<\/p>/);
});

test("Email template: unsubscribe link only on list mail", () => {
  const url = "https://admin.scholarscafe.com/public/unsubscribe/eca?t=abc";
  const { html, text } = renderEmail({ text: "New ECA", unsubscribeUrl: url });
  assert.match(
    html,
    /href="https:\/\/admin\.scholarscafe\.com\/public\/unsubscribe\/eca\?t=abc"[^>]*>Unsubscribe/,
  );
  assert.match(text, /Unsubscribe: https:\/\/admin/);
  assert.match(
    html,
    /You are getting this email because you subscribed to Scholars Cafe updates\./,
  );
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
  // Dashboard replies carry the same footer, but no button.
  assert.match(reply.html, /class="sc-foot"/);
  assert.doesNotMatch(reply.html, /<v:roundrect/);
  // A stored layout is used when present, with admin screens turned into links.
  const laid = outboxMessage(
    {
      id: "l",
      subject: "New booking",
      body: "plain",
      layout: JSON.stringify({
        heading: "New booking",
        button: { label: "View booking", screen: "Bookings" },
      }),
    },
    { ...transport, adminOrigin: "https://admin.scholarscafe.com" },
  );
  assert.match(laid.html, /href="https:\/\/admin\.scholarscafe\.com\/\?open=Bookings"/);
  assert.match(laid.text, /^New booking/);
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

test("Sign-in code email: code box, expiry note, link as small print, no button", () => {
  const m = loginEmail(
    { sender: "no-reply@scholarscafe.com" },
    "a@b.co",
    "123456",
    "https://s/x",
    10,
  );
  assert.equal(m.from, "Scholars Cafe <no-reply@scholarscafe.com>");
  assert.equal(m.replyTo, "contact@scholarscafe.com");
  assert.match(m.text, /Your code: 123456/);
  assert.match(m.text, /expires in 10 minutes/);
  assert.match(m.html, />1 2 3 4 5 6<\/div>/);
  assert.match(m.html, /href="https:\/\/s\/x"/);
  assert.doesNotMatch(m.html, /<v:roundrect/);
});

test("Preview emails: owners/admins only, every template renders, nothing is sent", async () => {
  const { default: request } = await import("supertest");
  const { createApp } = await import("./app.js");
  const base = {
    ADMIN_ORIGIN: "https://admin.scholarscafe.com",
    PUBLIC_ORIGIN: "https://scholarscafe.com",
    GOOGLE_CLIENT_ID: "t",
  };
  const cookie = "__Host-sc_session=" + "a".repeat(64);
  const store = (role) => ({
    session: async () => ({ id: "u", role, email: "x@x.com", csrf: "c" }),
    checkRateLimit: async () => true,
    query: async (q) => {
      assert.doesNotMatch(q, /INSERT|UPDATE|DELETE/, "read only");
      return [];
    },
  });
  for (const role of ["editor", "mentor"])
    await request(createApp(store(role), base))
      .get("/api/email-previews")
      .set("Cookie", cookie)
      .expect(403);
  const app = createApp(store("admin"), base);
  const { body } = await request(app).get("/api/email-previews").set("Cookie", cookie).expect(200);
  const ids = body.items.map((p) => p.id);
  for (const id of [
    "booking-confirmed",
    "booking-reminder",
    "booking-cancelled",
    "booking-team",
    "task-assigned",
    "task-reminder",
    "form-receipt",
    "inquiry-team",
    "eca-alert",
    "contact-reply",
    "contact-compose",
    "sign-in-code",
    "agreement-invite",
    "form-team",
  ])
    assert.ok(ids.includes(id), id);
  const byId = Object.fromEntries(body.items.map((p) => [p.id, p]));
  assert.equal(byId["contact-reply"].from, "Scholars Cafe <contact@scholarscafe.com>");
  assert.equal(byId["booking-confirmed"].replyTo, "contact@scholarscafe.com");
  for (const id of ids) {
    const page = await request(app)
      .get("/api/email-previews/" + id)
      .set("Cookie", cookie)
      .expect(200);
    assert.match(page.text, /class="sc-foot"/, id);
    assert.equal(page.text.split('href="https://scholarscafe.com"').length - 1, 1, id);
    assert.doesNotMatch(page.headers["content-security-policy"], /script-src/);
  }
  const confirmed = await request(app)
    .get("/api/email-previews/booking-confirmed")
    .set("Cookie", cookie);
  assert.match(confirmed.text, />Join the session<\/a>/);
  const eca = await request(app).get("/api/email-previews/eca-alert").set("Cookie", cookie);
  assert.match(eca.text, />Unsubscribe<\/a>/);
  await request(app).get("/api/email-previews/nope").set("Cookie", cookie).expect(404);
});

test("Footer: logo, name, tagline, socials, contact, reply line, then the website once", () => {
  const { html, text } = renderEmail({ subject: "Hi", text: "Hello" });
  const foot = html.slice(html.indexOf('class="sc-foot"'));
  const at = (needle) => {
    const i = foot.indexOf(needle);
    assert.ok(i > 0, needle);
    return i;
  };
  const order = [
    at('src="https://scholarscafe.com/brand/mark-blue.png" width="34"'),
    at(">Scholars Cafe</p>"),
    at(">" + DEFAULT_TAGLINE + "</p>"),
    at(">Facebook</a>"),
    at(">Instagram</a>"),
    at(">LinkedIn</a>"),
    at(">YouTube</a>"),
    at(">TikTok</a>"),
    at(`href="mailto:${CONTACT}"`),
    at("Questions? Just reply to this email."),
    at('href="https://scholarscafe.com"'),
  ];
  assert.deepEqual(
    [...order].sort((a, b) => a - b),
    order,
  );
  assert.match(html, /font-family:'Funnel Display','Segoe UI',Helvetica,Arial,sans-serif/);
  assert.match(foot, /background:#e8f3f9;border-top:1px solid #e3e8ee/);
  // Every image is an absolute https PNG (no SVG/webp: many mail apps don't show them).
  const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(imgs.length >= 4);
  for (const src of imgs) assert.match(src, /^https:\/\/scholarscafe\.com\/brand\/[\w-]+\.png$/);
  // The website appears exactly once, in HTML (link and visible text) and in the plain text.
  assert.equal(html.split('href="https://scholarscafe.com"').length - 1, 1);
  assert.equal(html.split(">scholarscafe.com</a>").length - 1, 1);
  assert.equal(text.match(/(^|[^@/.])scholarscafe\.com/gm).length, 1);
  assert.ok(text.trimEnd().endsWith("Questions? Just reply to this email.\nscholarscafe.com"));
  for (const [n, u] of SOCIAL) assert.ok(text.includes(`${n}: ${u}`));
  assert.ok(text.includes(`Email: ${CONTACT}`));
  assert.doesNotMatch(html + text, /Scholars' Cafe|Scholars&#39; Cafe/, "no apostrophe");
});

test("Formatting (Compose/replies only): bold and https links, everything else escaped", () => {
  const src =
    'Hi **Rafi** <img src=x onerror=alert(1)>\n\nRead [the guide](https://scholarscafe.com/resources?a=1&b=2) and [bad](javascript:alert(1)) **[x](https://e.co/"onmouseover=1)**';
  const html = textToHtml(src, { format: true });
  assert.match(html, /Hi <strong[^>]*>Rafi<\/strong> &lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(
    html,
    /<a href="https:\/\/scholarscafe\.com\/resources\?a=1&amp;b=2"[^>]*>the guide<\/a>/,
  );
  assert.doesNotMatch(html, /href="javascript/);
  assert.doesNotMatch(html, /<img|onmouseover="|" onmouseover/);
  // Automatic mails keep their text exactly (no formatting).
  assert.match(textToHtml("a **b**"), /a \*\*b\*\*/);
  const { text } = renderEmail({ text: "**Hi** [site](https://x.co/a)", format: true });
  assert.ok(text.startsWith("Hi site (https://x.co/a)"));
});
