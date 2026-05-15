import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { WA_LINK } from "@/lib/scholars-data";
import heroCampus from "@/assets/hero-campus.jpg";
// Optional mobile-specific crop. Add a file at `src/assets/hero-campus-mobile.jpg` to override on small screens.
// To override the mobile hero image, place a file at `public/hero-campus-mobile.jpg`.
// Using the `public/` folder avoids build-time import errors when the file is absent.
const heroCampusMobilePath = "/hero-campus-mobile.jpg";

const TICKER = [
  "Allegheny College",
  "Augustana College",
  "Beloit College",
  "Calvin University",
  "Centre College",
  "Clark University",
  "Caldwell University",
  "Denison University",
  "DePauw University",
  "Florida Southern College",
  "Franklin & Marshall College",
  "Furman University",
  "Gettysburg College",
  "Hope College",
  "Illinois Tech",
  "Iowa State University",
  "Knox College",
  "Kent State University",
  "Lake Forest College",
  "Lawrence University",
  "Luther College",
  "University of Maryland",
  "Millsaps College",
  "NJIT",
  "NYIT",
  "Penn State",
  "Purdue University",
  "Rhodes College",
  "Sewanee University",
  "Sweet Briar College",
  "Temple University",
  "University of Connecticut",
  "University of Delaware",
  "Union College",
  "VCU",
  "Wabash College",
  "Whitman College",
  "Whitworth University",
  "Wofford College",
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-[var(--navy-deep)] pt-24 md:pt-28"
    >
      {/* full-bleed cinematic campus photo */}
      <div className="absolute inset-0 -z-20">
        <picture>
          <source srcSet={heroCampusMobilePath} media="(max-width: 768px)" />
          <img
            src={heroCampus}
            alt="Historic university campus at golden hour"
            width={1920}
            height={1280}
            className="h-full w-full object-cover object-top md:object-center"
          />
        </picture>
      </div>

      {/* dramatic gradient + vignette overlays (Crimson-style shadow) */}
      {/* desktop: deeper dramatic overlays */}
      <div className="pointer-events-none absolute inset-0 -z-10 hidden md:block bg-[linear-gradient(90deg,rgba(7,18,42,0.96)_0%,rgba(7,18,42,0.78)_38%,rgba(7,18,42,0.35)_70%,rgba(7,18,42,0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 hidden md:block bg-[radial-gradient(ellipse_at_30%_40%,transparent_0%,rgba(7,18,42,0.55)_70%,rgba(7,18,42,0.95)_100%)]" />
      {/* mobile: lighter overlays so the hero image reads better on small screens */}
      <div className="pointer-events-none absolute inset-0 -z-10 md:hidden bg-[linear-gradient(90deg,rgba(7,18,42,0.7)_0%,rgba(7,18,42,0.55)_38%,rgba(7,18,42,0.18)_70%,rgba(7,18,42,0.32)_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 md:hidden bg-[radial-gradient(ellipse_at_30%_40%,transparent_0%,rgba(7,18,42,0.35)_70%,rgba(7,18,42,0.7)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-[var(--navy-deep)]" />
      {/* subtle grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="relative mx-auto max-w-[1320px] px-5 md:px-10">
        {/* editorial headline */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-4 italic text-lg text-sky-light/90 md:text-xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Thousands Apply. Few Stand Out.
            </motion.p>
            <h1 className="font-display text-[clamp(2.35rem,14vw,7rem)] font-extrabold leading-[0.95] tracking-[-0.035em] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.45)] md:text-[clamp(2.75rem,8vw,7rem)] md:leading-[0.92]">
              {["Where", "ambition", "meets"].map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="block"
                >
                  {word}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="block italic font-light text-sky-light"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                acceptance.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-6 max-w-xl text-[16px] leading-[1.7] text-white/80 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] md:mt-10 md:text-[17px]"
            >
              We mentor ambitious Bangladeshi students from a first conversation to an
              acceptance letter — covering applications, scholarships, and the entire
              admissions journey across 11+ countries.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:mt-10 md:gap-4"
            >
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-sky px-7 py-4 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#0284c7] hover:shadow-button sm:w-auto"
              >
                Book a free strategy call
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
              </a>
              <a
                href="#programs"
                className="group inline-flex w-full items-center justify-center gap-2 px-2 py-3 text-[15px] font-semibold text-white sm:w-auto sm:py-4"
              >
                <span className="border-b border-white/40 pb-0.5 transition-colors group-hover:border-white">
                  Explore programs
                </span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </motion.div>

            <div className="mt-8 grid grid-cols-2 gap-3 lg:hidden">
              <div className="rounded-3xl border border-white/15 bg-white/5 p-4 text-white backdrop-blur-sm">
                <div className="font-display text-3xl font-extrabold leading-none">
                  100<span className="text-sky">+</span>
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-white/65">
                  Students placed worldwide
                </div>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/5 p-4 text-white backdrop-blur-sm">
                <div className="font-display text-3xl font-extrabold leading-none">
                  11<span className="text-sky">+</span>
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-white/65">
                  Countries covered
                </div>
              </div>
            </div>
          </div>

          {/* right column — editorial stat block */}
          <motion.aside
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="hidden flex-col justify-end gap-8 border-l border-white/15 pl-8 backdrop-blur-[2px] lg:flex lg:pl-12"
          >
            <div>
              <div className="font-display text-7xl font-extrabold leading-none text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.5)]">
                100<span className="text-sky">+</span>
              </div>
              <div className="mt-3 text-sm uppercase tracking-[0.18em] text-white/65">
                Students placed worldwide
              </div>
            </div>
            <div className="border-t border-white/15 pt-8">
              <div className="font-display text-7xl font-extrabold leading-none text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.5)]">
                11<span className="text-sky">+</span>
              </div>
              <div className="mt-3 text-sm uppercase tracking-[0.18em] text-white/65">
                Countries · USA · UK · DE
              </div>
            </div>
            <p className="border-t border-white/15 pt-8 text-[15px] leading-relaxed text-white/75">
              <span className="font-display text-2xl text-white">"</span>
              Real mentors. Honest advice. The forms, essays, and quiet 1 a.m. WhatsApp
              messages — all of it, together.
            </p>
          </motion.aside>
        </div>

        {/* university ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 border-t border-white/15 pb-8 pt-8 md:mt-24 md:pb-10"
        >
          <div className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            <span className="h-px w-10 bg-white/30" />
            Where our students are heading
          </div>
          <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
            <div className="flex w-max animate-marquee gap-8 md:gap-12">
              {[...TICKER, ...TICKER].map((u, i) => (
                <span
                  key={i}
                  className="font-display whitespace-nowrap text-xl font-bold text-white/40 hover:text-white/90 md:text-3xl"
                >
                  {u}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
