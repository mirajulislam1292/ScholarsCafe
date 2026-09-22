import {useCmsLookup} from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "./Reveal";
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
    setSending(true); setError("");
    try {
      const response = await fetch((import.meta.env.VITE_CONTENT_API || "https://admin.scholarscafe.com") + "/public/newsletter", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "omit",
        body: JSON.stringify({ email, consent: fields.get("consent") === "on", website: fields.get("website") || "" }),
      });
      if (!response.ok) throw new Error("Could not save your signup. Please try again later.");
      setDone(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to connect."); }
    finally { setSending(false); }
  }

  return (
    <section id="newsletter" className="bg-newsletter-gradient py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center text-white">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
          >
            <Mail className="h-8 w-8 text-sky-light" />
          </motion.div>
          <span className="mt-6 inline-block text-xs font-bold uppercase tracking-[0.15em] text-sky-light"><CmsText id="Newsletter.ac7654d7cf2c">Stay Updated</CmsText></span>
          <h2 className="mt-3 font-display text-[clamp(2rem,3.5vw,3rem)] font-extrabold"><CmsText id="Newsletter.8d2bdd3b4ffc">
            Get Free Scholarship Alerts & Study Tips
          </CmsText></h2>
          <p className="mt-5 text-[17px] leading-relaxed text-white/80"><CmsText id="Newsletter.0c183d00d7df">
            Join 500+ Bangladeshi students who get weekly scholarship deadlines, application tips, country guides, and university news, completely free.
          </CmsText></p>

          {!done ? (
            <form
              onSubmit={subscribe}
              className="mx-auto mt-10 max-w-[520px]"
            >
              <div className="flex overflow-hidden rounded-full border border-white/40 bg-white/10">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={cmsLabel("Newsletter.label.3ffc275e3d21","Enter your email address")}
                aria-label={cmsLabel("Newsletter.label.f2488fd4ef4a","Email address")}
                className="min-w-0 flex-1 bg-transparent px-6 py-4 text-[15px] text-white placeholder:text-white/70 focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="bg-sky px-7 py-4 text-[15px] font-bold text-white transition-colors hover:bg-[#0284c7]"
              ><CmsText id="Newsletter.d0f736aa267d">
                Subscribe →
              </CmsText></button>
              </div>
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <label className="mt-4 flex items-start gap-3 text-left text-sm text-white/90">
                <input name="consent" type="checkbox" required className="mt-1" />
                <span>I agree to receive scholarship news by email. I can ask to unsubscribe at any time. <a href="/privacy" className="underline">Privacy policy</a></span>
              </label>
              {error && <p role="alert" className="mt-3 text-white">{error}</p>}
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto mt-10 max-w-md rounded-2xl bg-white/15 p-7 backdrop-blur-sm"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-navy">
                <Check className="h-6 w-6" strokeWidth={3} />
              </div>
              <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 font-display text-lg font-bold">
                <span><CmsText id="Newsletter.66023af1bfb0">You're in! Welcome to the Scholars Cafe community.</CmsText></span>
                <PartyPopper className="h-6 w-6 text-sky-light" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="mt-1 text-sm text-white/90">Your signup is saved. Thank you for joining our mailing list.</div>
            </motion.div>
          )}

          <div className="mt-6 text-[13px] text-white/80">To unsubscribe, email contact@scholarscafe.com.</div>
        </Reveal>
      </div>
    </section>
  );
}
