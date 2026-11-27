// "Preview emails" (owners and admins, team admin only): every automatic email, a contact@ reply and a
// Compose mail, rendered with the real text builders and the shared template, using made-up sample data. Read only:
// nothing is queued or sent. Each preview is its own tiny page with a strict CSP, shown in a sandbox.
import { canPublish } from "./security.js";
import { outboxMessage, loginEmail } from "./mail.js";
import {
  confirmationText,
  reminderText,
  cancelText,
  teamText,
  confirmationLayout,
  reminderLayout,
  cancelLayout,
  teamLayout,
} from "./booking.js";
import { receiptText, receiptLayout, responseLayout } from "./forms.js";
import { alertBody, unsubscribeUrl } from "./eca.js";
import { taskMail, taskLayout } from "./workspace.js";
import { typedLayout } from "./inbox.js";

const at = (h) => new Date(Date.UTC(2026, 10, 24, 4 + h, 0));
const booking = {
  name: "Rafi Ahmed",
  email: "rafi@example.com",
  phone: "+880 1700-000000",
  topic: "Choosing universities in the USA for undergrad",
  starts_at: at(0),
  ends_at: new Date(at(0).getTime() + 30 * 60 * 1000),
};
const task = {
  title: "Call the embassy about the visa slot",
  details: "Ask about earlier dates for Rafi.",
  due_at: at(26),
};
const answers = [
  ["Full name", "Rafi Ahmed"],
  ["Current level", "HSC 2026, Science"],
  ["Target intake", "Fall 2027"],
  ["Questions for us", "Which universities fit my budget, and when should I start my essays?"],
];
const json = (l) => JSON.stringify(l);

/** Every email the app sends, with made-up sample data, rendered exactly as it would be sent. */
export function previewMails(config, transport, theme = "light") {
  const admin = config.ADMIN_ORIGIN || "https://admin.scholarscafe.com";
  const meet = "https://meet.google.com/abc-defg-hij";
  const unsub = unsubscribeUrl({ ADMIN_ORIGIN: admin }, "sample-token");
  const row = (id, label, r) => ({ id, label, row: { id: "preview-" + id, ...r } });
  const replyBody =
    "Hi Rafi,\n\nYes, the package includes SAT guidance and two essay reviews. I have added both to your plan.\n\nBest wishes,\nTasnim\nScholars Cafe";
  const composeBody =
    "Here is what to focus on this month so your applications stay on track.\n\n- Finish the first draft of your **Common App personal essay**\n- Ask two teachers for recommendation letters\n- Book your IELTS or Duolingo test date\n\nIf anything is unclear, read [our free guides](https://scholarscafe.com/resources) or reply to this email.\n\nBest,\nThe Scholars Cafe team";
  const ecaBody =
    "Model UN 2026 is open for applications until **5 December**. It is a good fit for students interested in international relations and public speaking.\n\nApply here: https://scholarscafe.com/resources/eca";
  return [
    row("contact-reply", "1. Reply from contact@ (Mail screen)", {
      subject: "Re: Question about the USA package",
      body: replyBody,
      to_email: booking.email,
      from_contact: 1,
      in_reply_to: "<q1@example.com>",
      layout: json(
        typedLayout(replyBody, {
          name: "Rafi Ahmed",
          quote: {
            by: "On Mon, 24 Nov 2026, Rafi Ahmed wrote:",
            text: "Hello, does the USA package include SAT guidance and essay reviews?",
          },
        }),
      ),
    }),
    row("contact-compose", "2. New email (Compose)", {
      subject: "Your application checklist for December",
      body: composeBody,
      to_email: booking.email,
      from_contact: 1,
      layout: json(typedLayout(composeBody, { name: "Rafi Ahmed" })),
    }),
    row("booking-confirmed", "3. Booking confirmed (to student)", {
      subject: "Your Scholars Cafe session is booked",
      body: confirmationText(booking, meet),
      to_email: booking.email,
      layout: json(confirmationLayout(booking, meet)),
    }),
    row("booking-reminder", "4. Booking reminder (to student)", {
      subject: "Reminder: your Scholars Cafe session starts soon",
      body: reminderText(booking, meet),
      to_email: booking.email,
      layout: json(reminderLayout(booking, meet)),
    }),
    row("booking-cancelled", "5. Booking cancelled (to student)", {
      subject: "Your Scholars Cafe session was cancelled",
      body: cancelText(booking),
      to_email: booking.email,
      layout: json(cancelLayout(booking)),
    }),
    row("form-receipt", "6. Form receipt (to the person who filled it in)", {
      subject: "Your response: Free consultation",
      body: receiptText("Free consultation", "Rafi Ahmed", "(answers)"),
      to_email: booking.email,
      reply_to: "contact@scholarscafe.com",
      layout: json(receiptLayout("Free consultation", "Rafi Ahmed", answers)),
    }),
    row("task-assigned", "7. Task assigned (to staff)", {
      subject: "New task for you: " + task.title,
      body: taskMail(config, task, "mahim assigned you a task."),
      to_email: "staff@example.com",
      layout: json(
        taskLayout(task, {
          label: "New task",
          heading: "A task has been assigned to you",
          text: "mahim assigned you a task in the team workspace.",
        }),
      ),
    }),
    row(
      "agreement-invite",
      "9. Agreement invite (sample: the Agreements feature is not built yet)",
      {
        subject: "Please review and sign your mentoring agreement",
        body: "Please review and sign your mentoring agreement.",
        to_email: booking.email,
        layout: json({
          label: "Agreement",
          ref: "SC-AGR-2026-0142",
          heading: "Your mentoring agreement is ready",
          firstName: "Rafi Ahmed",
          text: "Please review and sign your mentoring agreement. It sets out the services and timeline we discussed.",
          details: [
            ["Agreement", "Mentorship Services Agreement"],
            ["Prepared for", "Rafi Ahmed"],
            ["Link expires", "Thursday, 4 December 2026"],
          ],
          button: { label: "Review & Sign Agreement", url: "https://scholarscafe.com/sign/sample" },
          note: "This is a private link made for you. Please do not forward this email. If you have questions before signing, just reply.",
        }),
      },
    ),
    row("eca-alert", "10. ECA alert (newsletter layout, with Unsubscribe)", {
      subject: "New ECA open: Model UN 2026",
      body: alertBody(ecaBody, unsub),
      to_email: "subscriber@example.com",
      unsubscribe_url: unsub,
      layout: json({
        label: "ECA alert",
        heading: "New ECA open: Model UN 2026",
        text: ecaBody,
        format: true,
      }),
    }),
    row("booking-team", "Extra: New booking (to the team inbox)", {
      subject: "New booking: Rafi Ahmed",
      body: teamText(booking),
      reply_to: booking.email,
      layout: json(teamLayout(booking)),
    }),
    row("task-reminder", "Extra: Task due tomorrow (to staff)", {
      subject: "Due tomorrow: " + task.title,
      body: taskMail(config, task, "Reminder: this task is due in about 24 hours."),
      to_email: "staff@example.com",
      layout: json(
        taskLayout(task, {
          label: "Due tomorrow",
          heading: "A task is due tomorrow",
          text: "Reminder: this task is due in about 24 hours.",
        }),
      ),
    }),
    row("form-team", "Extra: New form response (to the team inbox)", {
      subject: "New form submission: Free consultation",
      body: "(answers)",
      reply_to: booking.email,
      layout: json(responseLayout("Free consultation", answers)),
    }),
    row("inquiry-team", "Extra: Website inquiry (to the team inbox)", {
      subject: "New website inquiry",
      body: "Name: Rafi Ahmed",
      reply_to: booking.email,
      layout: json({
        label: "New inquiry",
        heading: "New website inquiry",
        details: [
          ["Name", "Rafi Ahmed"],
          ["Email", "rafi@example.com"],
          ["Phone", "+880 1700-000000"],
          ["Message", "I'd like help with my US applications for Fall 2027."],
        ],
        stacked: true,
        button: { label: "View lead", screen: "Leads" },
      }),
    }),
  ]
    .map((p) => ({ ...p, message: outboxMessage(p.row, transport, { theme }) }))
    .concat([
      {
        id: "sign-in-code",
        label: "8. Sign-in code (student portal)",
        message: loginEmail(
          transport,
          booking.email,
          "482913",
          "https://student.scholarscafe.com/auth/email?t=sample",
          10,
          theme,
        ),
      },
    ]);
}

export function installEmailPreviewRoutes(app, { store, fail, config }) {
  const transport = {
    sender: (config.SMTP_USER || "no-reply@scholarscafe.com").trim().toLowerCase(),
    adminOrigin: config.ADMIN_ORIGIN || "",
    contact: { sender: "contact@scholarscafe.com" },
  };
  // ?theme=dark shows every email in the dark style (the Light / Dark switch on the page).
  const all = async (req) =>
    previewMails(config, transport, req.query.theme === "dark" ? "dark" : "light");
  app.use("/api/email-previews", (req, _res, next) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Email previews are for owners and admins.");
    next();
  });
  app.get("/api/email-previews", async (req, res) =>
    res.json({
      items: (await all(req)).map((p) => ({
        id: p.id,
        label: p.label,
        subject: p.message.subject,
        from: p.message.from,
        to: p.message.to,
        replyTo: p.message.replyTo || null,
        text: p.message.text,
      })),
    }),
  );
  // The HTML as its own page for a sandboxed frame: no scripts at all; images only from https.
  app.get("/api/email-previews/:id", async (req, res) => {
    const p = (await all(req)).find((x) => x.id === req.params.id);
    if (!p) throw fail(404, "No such email.");
    res
      .set({
        "Content-Security-Policy":
          "default-src 'none'; img-src https: data:; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; base-uri 'none'; form-action 'none'; frame-ancestors 'self'; sandbox allow-popups allow-popups-to-escape-sandbox",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Type": "text/html; charset=utf-8",
      })
      .send(p.message.html);
  });
}
