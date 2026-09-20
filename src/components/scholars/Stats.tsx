import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { Reveal } from "./Reveal";
import { CountUp } from "./CountUp";
import { STATS as CMS_DEFAULT_STATS } from "@/lib/scholars-data";

export function Stats() {
  const STATS = useCmsValue("data.STATS", CMS_DEFAULT_STATS);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        <Reveal>
          <div className="mb-12 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky">
            <span className="h-px w-10 bg-sky" /><CmsText id="Stats.ba087e4b0991">
            By the numbers
          </CmsText></div>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-x-12">
          {STATS.map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="relative">
                <div className="font-display text-[clamp(3.5rem,7vw,6rem)] font-extrabold leading-none text-navy transition-colors hover:text-sky">
                  <CountUp end={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-4 max-w-[180px] text-[13px] uppercase tracking-[0.16em] text-navy/55">
                  {s.label}
                </div>
                <div className="mt-6 h-px w-12 bg-sky" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const STATS = CMS_DEFAULT_STATS;
