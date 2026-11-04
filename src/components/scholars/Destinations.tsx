import { useCmsValue } from "@/lib/cms";
import { ArrowUpRight } from "lucide-react";
import { WA_LINK as CMS_DEFAULT_WA_LINK } from "@/lib/scholars-data";
import { SITE } from "@/lib/site-content";
import { Reveal } from "./Reveal";

/** USA focus section: large imagery, very little text. Content: src/content/site.json > usa. */
export function Destinations() {
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);
  const usa = SITE.usa;

  return (
    <section id="destinations" className="bg-white py-[clamp(96px,12vw,160px)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="max-w-[16ch] font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-normal leading-[1.05] tracking-[-0.025em] text-neutral-900">
              {usa.heading}
            </h2>
            {usa.lead && (
              <p className="mt-5 max-w-md font-text text-[16px] leading-relaxed text-neutral-600">
                {usa.lead}
              </p>
            )}
          </div>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 self-start font-text text-[15px] font-medium text-blue-700 md:self-auto"
          >
            {usa.cta}
            <ArrowUpRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </Reveal>

        <div className="-mx-6 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {usa.regions.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.08} className="w-[82%] shrink-0 snap-start md:w-auto">
              <figure className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-blue-950">
                <img
                  src={r.image}
                  alt={r.place}
                  loading="lazy"
                  decoding="async"
                  width={1920}
                  height={1080}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-[1.04]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(4_28_49/0.85)_100%)]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-7">
                  <div className="font-heading text-[1.75rem] font-light tracking-[-0.02em] text-white">
                    {r.name}
                  </div>
                  <div className="mt-1 font-text text-[13px] text-ice-300/90">{r.place}</div>
                  {r.note && (
                    <p className="mt-3 font-text text-[14px] leading-snug text-white/80">
                      {r.note}
                    </p>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
