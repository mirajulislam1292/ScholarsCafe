import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Turnstile, turnstileEnabled, resetTurnstile } from "@/components/scholars/Turnstile";

// Book a 1-on-1 mentor session (like Calendly). Open days and times come from the admin (Inbox → Bookings).
// One booking per day: a booked day disappears, and the server refuses a day someone just took (409).
const API = import.meta.env.VITE_CONTENT_API || "https://admin.scholarscafe.com";
const INPUT =
  "w-full rounded-2xl border border-neutral-900/10 bg-white px-4 py-3 text-neutral-900 outline-none transition-[border-color,box-shadow] duration-300 focus:border-blue-700 focus:shadow-[0_0_0_4px_rgb(43_109_166/0.12)]";

type Slot = { start: string; time: string };
type Day = { date: string; weekday: string; slots: Slot[] };
type Fields = "name" | "email" | "phone" | "topic";
/** Days shown before "More days", so the times stay close on a phone. */
const FIRST_DAYS = 9;

const dayLabel = (date: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(date + "T00:00:00Z").toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });

export function Booking() {
  const [days, setDays] = useState<Day[] | null>(null);
  const [slotLength, setSlotLength] = useState(45);
  const [failed, setFailed] = useState(false);
  const [day, setDay] = useState<Day | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState("");
  const [allDays, setAllDays] = useState(false);

  const load = useCallback(() => {
    setFailed(false);
    return fetch(API + "/public/booking/slots", { credentials: "omit" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { days?: Day[]; slot?: number }) => {
        setDays(Array.isArray(d.days) ? d.days : []);
        if (d.slot) setSlotLength(d.slot);
      })
      .catch(() => setFailed(true));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!slot) return;
    const data = new FormData(event.currentTarget);
    const value = (k: string) => String(data.get(k) || "").trim();
    const e: Partial<Record<Fields, string>> = {};
    if (!value("name")) e.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email"))) e.email = "Enter a valid email.";
    if (value("phone") && !/^[+0-9 ()-]{6,30}$/.test(value("phone")))
      e.phone = "Enter a valid phone number.";
    if (value("topic").length < 3) e.topic = "Tell us what you'd like to talk about.";
    setErrors(e);
    setError("");
    if (Object.keys(e).length) {
      document.getElementById("booking-" + Object.keys(e)[0])?.focus();
      return;
    }
    setSending(true);
    try {
      const r = await fetch(API + "/public/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({
          start: slot.start,
          name: value("name"),
          email: value("email"),
          phone: value("phone"),
          topic: value("topic"),
          website: String(data.get("website") || ""),
          ...(turnstileEnabled
            ? { turnstileToken: String(data.get("cf-turnstile-response") || "") }
            : {}),
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 409) {
        // Someone took this day a moment ago: show the fresh list.
        setDay(null);
        setSlot(null);
        await load();
      }
      if (!r.ok) {
        if (j.fields) setErrors(j.fields);
        throw new Error(j.error || "Couldn't book. Please try again.");
      }
      setDone(j.when || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't book.");
      resetTurnstile();
    } finally {
      setSending(false);
    }
  }

  if (done)
    return (
      <div
        role="status"
        className="rounded-3xl border border-neutral-900/[0.06] bg-white p-7 md:p-10"
      >
        <h3 className="type-h3 text-neutral-900">You're booked.</h3>
        <p className="type-lead mt-4 text-neutral-700">{done}</p>
        <p className="type-body mt-4 text-neutral-600">
          We've emailed you the details. You'll get a reminder about an hour before.
        </p>
      </div>
    );

  return (
    <div className="rounded-3xl border border-neutral-900/[0.06] bg-white p-6 sm:p-7 md:p-10">
      <p className="type-caption text-neutral-500">
        {slotLength} minutes · Online · Times in Bangladesh time (GMT+6)
      </p>
      {error && (
        <p role="alert" className="type-body mt-5 text-red-700">
          {error}
        </p>
      )}

      {!slot && (
        <div aria-busy={days === null && !failed}>
          <h3 className="type-h3 mt-5 text-neutral-900">Pick a day</h3>
          {days === null && !failed && <p className="type-body mt-4 text-neutral-500">Loading…</p>}
          {failed && (
            <p className="type-body mt-4 text-neutral-600">
              We couldn't load the open times.{" "}
              <button type="button" onClick={() => load()} className="text-blue-700 underline">
                Try again
              </button>{" "}
              or{" "}
              <a href="/contact" className="text-blue-700 underline">
                contact us
              </a>
              .
            </p>
          )}
          {days && !days.length && (
            <p className="type-body mt-4 text-neutral-600">
              No open times right now. Please check back soon, or{" "}
              <a href="/contact" className="text-blue-700 underline">
                contact us
              </a>
              .
            </p>
          )}
          {days && days.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {(allDays ? days : days.slice(0, FIRST_DAYS)).map((d) => {
                const active = day?.date === d.date;
                return (
                  <button
                    key={d.date}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setDay(d);
                      // On a phone the times are below the days: bring them into view.
                      requestAnimationFrame(() =>
                        document
                          .getElementById("booking-times")
                          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
                      );
                    }}
                    className={`min-w-0 rounded-2xl border px-2 py-3 text-center transition-colors duration-300 ${
                      active
                        ? "border-blue-950 bg-blue-950 text-white"
                        : "border-neutral-900/10 text-neutral-800 hover:border-blue-700"
                    }`}
                  >
                    <span className="block text-[0.8rem] opacity-75">
                      {dayLabel(d.date, { weekday: "short" })}
                    </span>
                    <span className="block font-semibold">
                      {dayLabel(d.date, { day: "numeric", month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {days && days.length > FIRST_DAYS && !allDays && (
            <button
              type="button"
              onClick={() => setAllDays(true)}
              className="type-button mt-4 text-blue-700"
            >
              More days ({days.length - FIRST_DAYS})
            </button>
          )}
          {day && (
            <>
              <h3 id="booking-times" className="type-h3 mt-8 scroll-mt-28 text-neutral-900">
                Pick a time on{" "}
                {dayLabel(day.date, { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {day.slots.map((s) => (
                  <button
                    key={s.start}
                    type="button"
                    onClick={() => {
                      setSlot(s);
                      setError("");
                      requestAnimationFrame(() =>
                        document
                          .getElementById("booking-form")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
                      );
                    }}
                    className="rounded-2xl border border-neutral-900/10 px-3 py-3 font-semibold text-neutral-800 transition-colors duration-300 hover:border-blue-700 hover:text-blue-700"
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {slot && day && (
        <form id="booking-form" onSubmit={submit} noValidate className="scroll-mt-28">
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ice-50 px-4 py-3">
            <p className="type-body font-semibold text-neutral-900">
              {dayLabel(day.date, { weekday: "long", day: "numeric", month: "long" })} · {slot.time}
            </p>
            <button
              type="button"
              onClick={() => setSlot(null)}
              className="type-button text-blue-700"
            >
              Change
            </button>
          </div>
          <div className="mt-7 grid gap-6">
            <Input id="name" label="Your name" required error={errors.name} autoComplete="name" />
            <Input
              id="email"
              label="Email"
              type="email"
              required
              error={errors.email}
              autoComplete="email"
              help="We send the confirmation and meeting link here."
            />
            <Input
              id="phone"
              label="Phone (optional)"
              type="tel"
              error={errors.phone}
              autoComplete="tel"
            />
            <div>
              <label htmlFor="booking-topic" className="type-body font-semibold text-neutral-900">
                What would you like to talk about? <span className="text-blue-700">*</span>
              </label>
              <textarea
                id="booking-topic"
                name="topic"
                rows={4}
                maxLength={2000}
                aria-invalid={Boolean(errors.topic)}
                aria-describedby={errors.topic ? "booking-topic-error" : undefined}
                className={INPUT + " mt-2"}
              />
              {errors.topic && (
                <p id="booking-topic-error" className="type-caption mt-2 text-red-700">
                  {errors.topic}
                </p>
              )}
            </div>
          </div>
          {/* Honeypot: hidden from people, filled in by bots. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />
          <Turnstile />
          <button
            type="submit"
            disabled={sending}
            className="type-button mt-8 h-12 w-full rounded-full bg-blue-950 px-7 text-white transition-[background-color] duration-500 ease-premium hover:bg-blue-900 disabled:opacity-60 sm:w-auto"
          >
            {sending ? "Booking…" : "Book this time"}
          </button>
        </form>
      )}
    </div>
  );
}

function Input({
  id,
  label,
  type = "text",
  required,
  error,
  help,
  autoComplete,
}: {
  id: Fields;
  label: string;
  type?: string;
  required?: boolean;
  error?: string;
  help?: string;
  autoComplete?: string;
}) {
  const describedBy = [help && `booking-${id}-help`, error && `booking-${id}-error`]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <label htmlFor={"booking-" + id} className="type-body font-semibold text-neutral-900">
        {label} {required && <span className="text-blue-700">*</span>}
      </label>
      {help && (
        <p id={`booking-${id}-help`} className="type-caption mt-1 text-neutral-500">
          {help}
        </p>
      )}
      <input
        id={"booking-" + id}
        name={id}
        type={type}
        maxLength={id === "email" ? 254 : id === "phone" ? 30 : 160}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        className={INPUT + " mt-2"}
      />
      {error && (
        <p id={`booking-${id}-error`} className="type-caption mt-2 text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
