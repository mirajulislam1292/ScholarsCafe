import { useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "./Reveal";
import { Mail, Check, PartyPopper } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

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
          <span className="mt-6 inline-block text-xs font-bold uppercase tracking-[0.15em] text-sky-light">Stay Updated</span>
          <h2 className="mt-3 font-display text-[clamp(2rem,3.5vw,3rem)] font-extrabold">
            Get Free Scholarship Alerts & Study Tips
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-white/80">
            Join 500+ Bangladeshi students who get weekly scholarship deadlines, application tips, country guides, and university news — completely free.
          </p>

          {!done ? (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
              className="mx-auto mt-10 flex max-w-[520px] overflow-hidden rounded-full border-[1.5px] border-white/25 bg-white/10 backdrop-blur-sm focus-within:border-sky"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-transparent px-6 py-4 text-[15px] text-white placeholder:text-white/45 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-sky px-7 py-4 text-[15px] font-bold text-white transition-colors hover:bg-[#0284c7]"
              >
                Subscribe →
              </button>
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
                <span>You're in! Welcome to the Scholars Cafe community.</span>
                <PartyPopper className="h-6 w-6 text-sky-light" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="mt-1 text-sm text-white/70">Check your inbox — your first guide is on its way.</div>
            </motion.div>
          )}

          <div className="mt-6 text-[13px] text-white/35">No spam, ever. Unsubscribe with one click, anytime.</div>
        </Reveal>
      </div>
    </section>
  );
}
