import { useCmsValue, CmsText } from "@/lib/cms";
import { useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { WA_LINK as CMS_DEFAULT_WA_LINK } from "@/lib/scholars-data";
import { HeroVideo } from "./HeroVideo";
import { useMagnetic } from "@/hooks/use-magnetic";
import type { HeroClip } from "@/lib/hero-media";

// CSS-only entrance so the headline is visible before JavaScript loads (good for LCP and no-JS).
const RISE = "motion-safe:animate-rise";
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

export function Hero() {
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);
  const headline = useCmsValue("local.headline", ["Where", "ambition", "meets"]);
  const [clip, setClip] = useState<HeroClip | null>(null);
  const magnetic = useMagnetic<HTMLAnchorElement>();

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-blue-950 text-white"
    >
      <HeroVideo onClip={setClip} />

      {/* Legibility: deep same-hue wash, heavier at the bottom-left where the words sit */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(4_28_49/0.5)_0%,rgb(4_28_49/0.15)_22%,rgb(4_28_49/0.7)_48%,rgb(4_28_49/0.92)_72%,rgb(4_28_49/0.96)_100%)] md:bg-[linear-gradient(180deg,rgb(4_28_49/0.55)_0%,rgb(4_28_49/0.15)_38%,rgb(4_28_49/0.55)_70%,rgb(4_28_49/0.92)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_0%_100%,rgb(4_28_49/0.65)_0%,transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-[clamp(64px,10vh,120px)] pt-40 md:px-12">
        <h1 className="max-w-[15ch] type-display text-white">
          {headline.map((word, i) => (
            <span
              key={word}
              style={delay(120 + i * 90)}
              className={`${RISE} inline-block pr-[0.22em]`}
            >
              {word}
            </span>
          ))}
          <span style={delay(390)} className={`${RISE} inline-block text-ice-300`}>
            <CmsText id="Hero.5fcef7e1a94c">acceptance.</CmsText>
          </span>
        </h1>

        <p style={delay(560)} className={`${RISE} mt-8 max-w-[34ch] type-lead text-ice-200/85`}>
          <CmsText id="Hero.lead.v2">
            One-to-one mentorship for Bangladeshi students aiming at the world's best universities.
          </CmsText>
        </p>

        <div style={delay(700)} className={`${RISE} mt-12 flex flex-wrap items-center gap-3`}>
          <a
            ref={magnetic}
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-ice-100 px-6 type-button text-blue-950 transition-[background-color,box-shadow] duration-500 ease-premium hover:bg-white hover:shadow-[0_16px_40px_rgb(0_0_0/0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ice-300"
          >
            <CmsText id="Hero.009fe0d39178">Book a free strategy call</CmsText>
            <ArrowUpRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
          <a
            href="/programs"
            className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 type-button text-white transition-colors duration-500 ease-premium hover:border-white/50 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ice-300"
          >
            <CmsText id="Hero.f4685c1f868b">Explore programs</CmsText>
          </a>
        </div>
      </div>

      {/* Location caption, plus the credit where a license requires it */}
      <p
        aria-hidden
        className="pointer-events-none absolute bottom-6 right-6 hidden text-right font-text text-[12px] leading-relaxed text-white/55 transition-opacity duration-700 md:right-12 md:block"
        style={{ opacity: clip ? 1 : 0 }}
      >
        {clip?.place}
        {clip?.credit && <span className="block text-white/40">{clip.credit}</span>}
      </p>
    </section>
  );
}
