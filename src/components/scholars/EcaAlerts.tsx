import { useState } from "react";
import { Check } from "lucide-react";
import { CmsText, useCmsLookup } from "@/lib/cms";
import { Turnstile, turnstileEnabled, resetTurnstile } from "./Turnstile";

const API = import.meta.env.VITE_CONTENT_API || "https://admin.scholarscafe.com";

/** "Email me when a new ECA is posted": saves the address on the admin's ECA alerts list. */
export function EcaAlerts() {
  const cmsLabel = useCmsLookup();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function subscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = new FormData(e.currentTarget);
    setSending(true);
    setError("");
    try {
      const response = await fetch(API + "/public/eca-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({
          email,
          consent: fields.get("consent") === "on",
          website: fields.get("website") || "",
          ...(turnstileEnabled
            ? { turnstileToken: fields.get("cf-turnstile-response") || "" }
            : {}),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Could not save your sign-up. Please try again later.");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect.");
      resetTurnstile();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-3xl bg-blue-950 p-7 text-white md:p-12">
      <h2 className="type-h2">
        <CmsText id="EcaAlerts.title">Tell me when a new ECA opens</CmsText>
      </h2>
      <p className="type-body mt-4 max-w-[52ch] text-white/80">
        <CmsText id="EcaAlerts.lead">
          Leave your email and we'll write to you whenever we post a new extracurricular
          opportunity. Only ECA news, and you can unsubscribe from any email with one click.
        </CmsText>
      </p>
      {done ? (
        <p
          role="status"
          className="type-body mt-8 inline-flex items-center gap-3 rounded-2xl bg-white/15 px-5 py-4"
        >
          <Check aria-hidden className="h-5 w-5 shrink-0 text-emerald-300" strokeWidth={3} />
          <CmsText id="EcaAlerts.done">You're on the list. We'll email you about new ECAs.</CmsText>
        </p>
      ) : (
        <form onSubmit={subscribe} className="mt-8 max-w-[520px]">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={cmsLabel("EcaAlerts.label.email", "Your email address")}
              aria-label={cmsLabel("EcaAlerts.label.emailAria", "Email address")}
              autoComplete="email"
              className="min-w-0 flex-1 rounded-full border border-white/40 bg-white/10 px-6 py-4 text-[16px] text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-ice-300"
            />
            <button
              type="submit"
              disabled={sending}
              className="type-button rounded-full bg-ice-100 px-7 py-4 text-blue-950 transition-colors hover:bg-white disabled:opacity-60"
            >
              <CmsText id="EcaAlerts.submit">Notify me</CmsText>
            </button>
          </div>
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />
          <label className="mt-4 flex items-start gap-3 text-left text-sm text-white/90">
            <input name="consent" type="checkbox" required className="mt-1" />
            <span>
              <CmsText id="EcaAlerts.consent">
                Yes, email me when a new ECA comes up. I can unsubscribe at any time.
              </CmsText>{" "}
              <a href="/privacy" className="underline">
                <CmsText id="EcaAlerts.privacy">Privacy policy</CmsText>
              </a>
            </span>
          </label>
          <Turnstile />
          {error && (
            <p role="alert" className="mt-3 text-white">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
