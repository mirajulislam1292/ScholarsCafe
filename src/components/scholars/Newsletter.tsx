import { useCmsLookup } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "./Reveal";
import { Turnstile, turnstileEnabled, resetTurnstile } from "./Turnstile";
import { Mail, Check, PartyPopper } from "lucide-react";

export function Newsletter() {
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
      const response = await fetch(
        (import.meta.env.VITE_CONTENT_API || "https://admin.scholarscafe.com") +
          "/public/newsletter",
        {
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
        },
      );
      if (!response.ok) throw new Error("Could not save your signup. Please try again later.");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to connect.");
      resetTurnstile();
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="newsletter" className="bg-blue-950 py-[clamp(72px,13vw,200px)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <Reveal className="mx-auto max-w-2xl text-center text-white">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
          >
            <Mail className="h-8 w-8 text-ice-300" />
          </motion.div>
          <span className="hidden">
            <CmsText id="Newsletter.ac7654d7cf2c">Stay Updated</CmsText>
          </span>
          <h2 className="type-h2">
            <CmsText id="Newsletter.8d2bdd3b4ffc">Get Free Scholarship Alerts & Study Tips</CmsText>
          </h2>
          <p className="mt-5 type-lead text-white/80">
            <CmsText id="Newsletter.0c183d00d7df">
              Join 500+ Bangladeshi students who get weekly scholarship deadlines, application tips,
              and US university news, completely free.
            </CmsText>
          </p>

          {!done ? (
            <form onSubmit={subscribe} className="mx-auto mt-10 max-w-[520px]">
              {/* Phones: email and button stacked full width; larger screens: one pill. */}
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 sm:overflow-hidden sm:rounded-full sm:border sm:border-white/40 sm:bg-white/10">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={cmsLabel(
                    "Newsletter.label.3ffc275e3d21",
                    "Enter your email address",
                  )}
                  aria-label={cmsLabel("Newsletter.label.f2488fd4ef4a", "Email address")}
                  className="min-w-0 flex-1 rounded-full border border-white/40 bg-white/10 px-6 py-4 text-[16px] text-white placeholder:text-white/70 focus:outline-none sm:rounded-none sm:border-0 sm:bg-transparent sm:text-[15px]"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="type-button rounded-full bg-ice-100 px-7 py-4 text-blue-950 transition-colors hover:bg-white sm:rounded-none"
                >
                  <CmsText id="Newsletter.d0f736aa267d">Subscribe →</CmsText>
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
                  I agree to receive scholarship news by email. I can ask to unsubscribe at any
                  time.{" "}
                  <a href="/privacy" className="underline">
                    Privacy policy
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
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto mt-10 max-w-md rounded-2xl bg-white/15 p-7 backdrop-blur-sm"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-neutral-900">
                <Check className="h-6 w-6" strokeWidth={3} />
              </div>
              <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 type-h3">
                <span>
                  <CmsText id="Newsletter.66023af1bfb0">
                    You're in! Welcome to the Scholars Cafe community.
                  </CmsText>
                </span>
                <PartyPopper className="h-6 w-6 text-ice-300" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="mt-1 text-sm text-white/90">
                Your signup is saved. Thank you for joining our mailing list.
              </div>
            </motion.div>
          )}

          <div className="mt-6 text-[13px] text-white/80">
            To unsubscribe, email contact@scholarscafe.com.
          </div>
        </Reveal>
      </div>
    </section>
  );
}
