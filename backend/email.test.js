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

test("Email template: branded card, escaped body, links, signature, plain-text alternative", () => {
  const body = "Hi <b>Rafi</b> & team\n\nOpen: https://admin.scholarscafe.com/?a=1&b=2.\nThanks";
  const { html, text } = renderEmail({ subject: "Hello", text: body });
  // Wording is kept exactly; the plain part is the body, then the signature and a short footer.
  assert.ok(text.startsWith(body + "\n\n—\n" + BRAND_NAME + "\n" + DEFAULT_TAGLINE));
  assert.match(text, /contact@scholarscafe\.com/);
  for (const [, url] of SOCIAL) assert.ok(text.includes(url) && html.includes(url));
  // Never trusted as markup.
  assert.doesNotMatch(html, /<b>Rafi/);
  assert.match(html, /Hi &lt;b&gt;Rafi&lt;\/b&gt; &amp; team/);
  // Links are clickable, trailing punctuation stays outside, & is escaped once in href.
  assert.match(html, /href="https:\/\/admin\.scholarscafe\.com\/\?a=1&amp;b=2"/);
  assert.match(html, /b=2<\/a>\./);
  // Logo from the website's brand files (absolute https), header, card, signature, footer.
  assert.match(html, /<img src="https:\/\/scholarscafe\.com\/brand\/mark-ice\.png"/);
  assert.match(
    html,
    /<img class="sc-light-img" src="https:\/\/scholarscafe\.com\/brand\/mark-blue\.png"/,
  );
  // Dark mode (Apple Mail): the light logo swaps for the ice one, links get a lighter blue.
  assert.match(
    html,
    /<img class="sc-dark-img" src="https:\/\/scholarscafe\.com\/brand\/mark-ice\.png"/,
  );
  assert.match(html, /\.sc-link \{ color:#8cc2f0 !important; \}/);
  assert.match(html, /class="sc-foot"/);
  // Gmail/Outlook/mobile basics: tables, inline styles, 600px, MSO wrapper; dark-mode styles for Apple Mail.
  assert.match(html, /max-width:600px/);
  assert.match(html, /<!--\[if mso\]>/);
  assert.match(html, /role="presentation"/);
  assert.match(html, /prefers-color-scheme: dark/);
  assert.match(html, /bgcolor="#041c31"/);
  assert.doesNotMatch(html, /<script/);
  assert.doesNotMatch(html, /Unsubscribe/);
  assert.doesNotMatch(html, /sc-btn/, "no button without an action");
});

test("Main action button: derived from the mail, Outlook-safe", () => {
  const admin = "https://admin.scholarscafe.com";
  const cases = [
    [
      { subject: "Your session is booked", text: "Join here: https://meet.google.com/abc-defg" },
      "Join session",
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
      "Book another time",
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
  assert.match(html, /class="sc-btn" href="https:\/\/a\.example\/t"[^>]*>Open task<\/a>/);
  assert.match(text, /Open task: https:\/\/a\.example\/t/);
});

test("Signature tagline comes from the CMS when set, with a safe default", async () => {
  const store = (rows) => ({ query: async () => rows });
  assert.equal(await emailTagline(store([]), 1e12), DEFAULT_TAGLINE);
  assert.equal(
    await emailTagline(
      store([{ published: JSON.stringify({ "Links.tagline": " Study abroad, simply. " }) }]),
      2e12,
    ),
    "Study abroad, simply.",
  );
  // Cached for 10 minutes.
  assert.equal(await emailTagline(store([]), 2e12 + 1000), "Study abroad, simply.");
  assert.match(renderEmail({ text: "x", tagline: "T <x>" }).html, /T &lt;x&gt;/);
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
  // Dashboard replies carry the same footer, but no button.
  assert.match(reply.html, /class="sc-foot"/);
  assert.doesNotMatch(reply.html, /sc-btn/);
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
  assert.match(m.html, /class="sc-btn" href="https:\/\/s\/x"[^>]*>Sign in</);
  assert.match(m.html, /href="https:\/\/s\/x"/);
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
  assert.match(confirmed.text, />Join session<\/a>/);
  const eca = await request(app).get("/api/email-previews/eca-alert").set("Cookie", cookie);
  assert.match(eca.text, />Unsubscribe<\/a>/);
  await request(app).get("/api/email-previews/nope").set("Cookie", cookie).expect(404);
});

test("Footer: divider, logo, name, tagline, socials + contact, then the website once", () => {
  const { html, text } = renderEmail({ subject: "Hi", text: "Hello" });
  const at = (needle) => {
    const i = html.indexOf(needle);
    assert.ok(i > 0, needle);
    return i;
  };
  const order = [
    at('class="sc-line"'),
    at('class="sc-light-img" src="https://scholarscafe.com/brand/mark-blue.png"'),
    at("Scholars&#39; Cafe</div>"),
    at(DEFAULT_TAGLINE + "</div>"),
    at(">Facebook</a>"),
    at(">Instagram</a>"),
    at(">LinkedIn</a>"),
    at(`href="mailto:${CONTACT}"`),
    at('href="https://scholarscafe.com"'),
  ];
  assert.deepEqual(
    [...order].sort((a, b) => a - b),
    order,
  );
  assert.equal(DEFAULT_TAGLINE, "Mentor-led guidance for studying abroad from Bangladesh");
  // Heading font with web-safe fallbacks; brand colours.
  assert.match(html, /font-family:'Funnel Display','Segoe UI',Helvetica,Arial,sans-serif/);
  assert.match(html, /bgcolor="#e8f3f9"/);
  // Every image is an absolute https PNG (no SVG/webp: many mail apps don't show them).
  const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(imgs.length >= 2);
  for (const src of imgs) assert.match(src, /^https:\/\/scholarscafe\.com\/brand\/[\w-]+\.png$/);
  // The website appears exactly once, in HTML (link and visible text) and in the plain text.
  assert.equal(html.split('href="https://scholarscafe.com"').length - 1, 1);
  assert.equal(html.split(">scholarscafe.com</a>").length - 1, 1);
  assert.equal(text.match(/(^|[^@/.])scholarscafe\.com/gm).length, 1);
  assert.ok(text.trimEnd().endsWith("scholarscafe.com"));
  for (const [n, u] of SOCIAL) assert.ok(text.includes(`${n}: ${u}`));
  assert.ok(text.includes(`Email: ${CONTACT}`));
});

test("Formatting (Compose/replies only): bold and https links, everything else escaped", () => {
  const src =
    'Hi **Rafi** <img src=x onerror=alert(1)>\n\nRead [the guide](https://scholarscafe.com/resources?a=1&b=2) and [bad](javascript:alert(1)) **[x](https://e.co/"onmouseover=1)**';
  const html = textToHtml(src, { format: true });
  assert.match(html, /Hi <strong>Rafi<\/strong> &lt;img src=x onerror=alert\(1\)&gt;/);
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
