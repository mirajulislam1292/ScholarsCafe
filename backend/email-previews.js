// "Preview emails" (owners and admins, team admin only): every automatic email, a contact@ reply and a
// Compose mail, rendered with the real text builders and the shared template, using made-up sample data. Read only:
// nothing is queued or sent. Each preview is its own tiny page with a strict CSP, shown in a sandbox.
import { canPublish } from "./security.js";
import { outboxMessage, loginEmail, emailTagline } from "./mail.js";
import { confirmationText, reminderText, cancelText, teamText } from "./booking.js";
import { receiptText } from "./forms.js";
import { alertBody, unsubscribeUrl } from "./eca.js";
import { taskMail } from "./workspace.js";
import { reminderMail } from "./my-list.js";

const at = (h) => new Date(Date.UTC(2026, 10, 24, 4 + h, 0));
const booking = {
  name: "Rafi Ahmed",
  email: "rafi@example.com",
  phone: "+880 1700-000000",
  topic: "Choosing between USA and Canada for undergrad",
  starts_at: at(0),
  ends_at: new Date(at(0).getTime() + 30 * 60 * 1000),
};
const task = {
  title: "Call the embassy about the visa slot",
  details: "Ask about earlier dates for Rafi.",
  due_at: at(26),
};

export function previewMails(config, transport) {
  const admin = config.ADMIN_ORIGIN || "https://admin.scholarscafe.com";
  const meet = "https://meet.google.com/abc-defg-hij";
  const unsub = unsubscribeUrl({ ADMIN_ORIGIN: admin }, "sample-token");
  const row = (id, label, r) => ({ id, label, row: { id: "preview-" + id, ...r } });
  return [
    row("booking-confirmed", "Booking confirmed (to student)", {
      subject: "Your Scholars Cafe session is booked",
      body: confirmationText(booking, meet),
      to_email: booking.email,
    }),
    row("booking-reminder", "Booking reminder (to student)", {
      subject: "Reminder: your Scholars Cafe session starts soon",
      body: reminderText(booking, meet),
      to_email: booking.email,
    }),
    row("booking-cancelled", "Booking cancelled (to student)", {
      subject: "Your Scholars Cafe session was cancelled",
      body: cancelText(booking),
      to_email: booking.email,
    }),
    row("booking-team", "New booking (to the team inbox)", {
      subject: "New booking: Rafi Ahmed",
      body: teamText(booking),
      reply_to: booking.email,
    }),
    row("task-assigned", "Task assigned (to staff)", {
      subject: "New task for you: " + task.title,
      body: taskMail(config, task, "mahim assigned you a task."),
      to_email: "staff@example.com",
    }),
    row("task-reminder", "Task deadline reminder (to staff)", {
      subject: "Due tomorrow: " + task.title,
      body: taskMail(config, task, "Reminder: this task is due in about 24 hours."),
      to_email: "staff@example.com",
    }),
    (() => {
      // Sample only: a made-up date, not a real college deadline.
      const m = reminderMail(config, {
        name: "Sample College",
        round: "rd",
        date: "2027-01-05",
        days: 7,
      });
      return row("college-deadline", "College deadline reminder (to student, no push device)", {
        subject: m.subject,
        body: m.body,
        to_email: booking.email,
      });
    })(),
    row("form-receipt", "Form receipt (to the person who filled it in)", {
      subject: "Your response: Free consultation",
      body: receiptText(
        "Free consultation",
        "Rafi Ahmed",
        "Name: Rafi Ahmed\nTarget: USA, Fall 2027",
      ),
      to_email: booking.email,
      reply_to: "contact@scholarscafe.com",
    }),
    row("inquiry-team", "Website inquiry (to the team inbox)", {
      subject: "New website inquiry",
      body: "Name: Rafi Ahmed\nEmail: rafi@example.com\nPhone: +880 1700-000000\n\nI'd like help with my applications.",
      reply_to: booking.email,
    }),
    row("eca-alert", "ECA alert (to subscribers, with unsubscribe)", {
      subject: "New ECA open: Model UN 2026",
      body: alertBody(
        "Model UN 2026 is open for applications until 5 December.\n\nApply: https://scholarscafe.com/resources/eca",
        unsub,
      ),
      to_email: "subscriber@example.com",
      unsubscribe_url: unsub,
    }),
    row("contact-reply", "Reply from contact@ (Mail screen)", {
      subject: "Re: Question about the USA package",
      body: "Hi Rafi,\n\nYes, the package includes SAT guidance and two essay reviews.\n\nBest wishes,\nScholars Cafe team",
      to_email: booking.email,
      from_contact: 1,
      in_reply_to: "<q1@example.com>",
    }),
    row("contact-compose", "New email from contact@ (Compose, with formatting)", {
      subject: "Your shortlist for Fall 2027",
      body: "Hi Rafi,\n\nHere is your **updated university shortlist**. Before our next call, please read [our free guides](https://scholarscafe.com/resources) and send us your test dates.\n\nBest wishes,\nScholars Cafe team",
      to_email: booking.email,
      from_contact: 1,
    }),
  ]
    .map((p) => ({ ...p, message: outboxMessage(p.row, transport, p.tagline) }))
    .concat([
      {
        id: "sign-in-code",
        label: "Sign-in code (student portal)",
        message: loginEmail(
          transport,
          booking.email,
          "482913",
          "https://student.scholarscafe.com/auth/email?t=sample",
          10,
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
  const all = async () => {
    await emailTagline(store);
    return previewMails(config, transport);
  };
  app.use("/api/email-previews", (req, _res, next) => {
    if (!canPublish(req.actor.role)) throw fail(403, "Email previews are for owners and admins.");
    next();
  });
  app.get("/api/email-previews", async (_req, res) =>
    res.json({
      items: (await all()).map((p) => ({
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
    const p = (await all()).find((x) => x.id === req.params.id);
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
