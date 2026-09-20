import {useCmsLookup} from "@/lib/cms";
import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { WA_LINK as CMS_DEFAULT_WA_LINK } from "@/lib/scholars-data";
import { UNIVERSITY_ACCEPTANCES } from "@/lib/university-acceptances";
import heroCampus from "@/assets/hero-campus.jpg";
// Optional mobile-specific crop. Add a file at `src/assets/hero-campus-mobile.jpg` to override on small screens.
// Mobile hero image candidates in `public/` (order = priority).
// First priority: provided image file the user specified.
const heroCampusMobilePath = "/15976d71-f6b3-4da2-8736-137bca2bec49.png";

const ACCEPTANCE_RAIL = UNIVERSITY_ACCEPTANCES;

export function Hero() {
 const cmsLabel = useCmsLookup();

  const headline = useCmsValue('local.headline',['Where','ambition','meets']);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  const reduceMotion = Boolean(useReducedMotion());

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            alt={cmsLabel("Hero.label.5611a31dca90","Historic university campus at golden hour")}
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
              className="mb-4 font-display italic text-lg text-sky-light/90 md:text-xl"
            ><CmsText id="Hero.f3f277c44b6e">
              Thousands Apply. Few Stand Out.
            </CmsText></motion.p>
            <h1 className="font-display text-[clamp(2.35rem,14vw,7rem)] font-extrabold leading-[0.95] tracking-[-0.035em] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.45)] md:text-[clamp(2.75rem,8vw,7rem)] md:leading-[0.92]">
              {headline.map((word, i) => (
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
                className="font-display block italic font-light text-sky-light"
              ><CmsText id="Hero.5fcef7e1a94c">
                acceptance.
              </CmsText></motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-6 max-w-xl text-[16px] leading-[1.7] text-white/80 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] md:mt-10 md:text-[17px]"
            ><CmsText id="Hero.91b0af9f861a">
              We mentor ambitious Bangladeshi students from a first conversation to an
              acceptance letter, covering applications, scholarships, and the entire
              admissions journey across 12 study destinations.
            </CmsText></motion.p>

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
              ><CmsText id="Hero.009fe0d39178">
                Book a free strategy call
                </CmsText><ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
              </a>
              <a
                href="#programs"
                className="group inline-flex w-full items-center justify-center gap-2 px-2 py-3 text-[15px] font-semibold text-white sm:w-auto sm:py-4"
              >
                <span className="border-b border-white/40 pb-0.5 transition-colors group-hover:border-white"><CmsText id="Hero.f4685c1f868b">
                  Explore programs
                </CmsText></span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </motion.div>

            
          </div>

          {/* right column, editorial stat block */}
          
        </div>

        {/* university ticker */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7, ease: "easeOut" }}
          className="mt-16 pb-8 md:mt-24 md:pb-10"
        >
          <div className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            <span className="h-px w-10 bg-white/30" /><CmsText id="Hero.a73b267ead09">
            Where our students are heading
          </CmsText></div>
          <motion.div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_7%,black_93%,transparent)]">
            <div
              className={`flex w-max items-center gap-8 md:gap-12 [will-change:transform] ${reduceMotion ? "motion-reduce:animate-none" : "animate-marquee"}`}
              style={reduceMotion ? { animationPlayState: "paused" } : { animationDuration: "92s" }}
            >
              {[...ACCEPTANCE_RAIL, ...ACCEPTANCE_RAIL].map((item, index) => (
                <AcceptanceRailItem key={`${item.name}-${index}`} name={item.name} logo={item.logo} onClick={scrollToTop} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

type AcceptanceRailItemProps = {
  name: string;
  logo: string;
  onClick: () => void;
};

function AcceptanceRailItem({ name, logo, onClick }: AcceptanceRailItemProps) {
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  return (
    <button type="button" onClick={onClick} className="inline-flex shrink-0 items-center gap-3 whitespace-nowrap px-1 py-2 text-white/72 transition-colors hover:text-white">
      <img
        src={logo}
        alt={`${name} logo`}
        loading="lazy"
        decoding="async"
        className="h-10 w-10 shrink-0 object-contain opacity-85 drop-shadow-[0_0_18px_rgba(255,255,255,0.12)] md:h-11 md:w-11"
      />
      <span className="font-sans text-[14px] font-medium tracking-[-0.01em] md:text-[15px]">
        {name}
      </span>
    </button>
  );
}

const WA_LINK = CMS_DEFAULT_WA_LINK;
