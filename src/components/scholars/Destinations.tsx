import { useState } from "react";
import { CmsText, useCmsValue } from "@/lib/cms";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site-content";
import { RANK_EDITION, REGIONS, STATE_UNIVERSITIES, type Region } from "@/data/state-universities";
import { Reveal } from "./Reveal";

const OLDER = STATE_UNIVERSITIES.filter((s) => !s.rank.edition.includes("2027")).length;

/** USA focus section: one card per state with its top-ranked university, filtered by region.
 *  Heading/lead: src/content/site.json > usa. Data: src/data/state-universities.ts. */
export function Destinations() {
  const usa = useCmsValue("site.usa", SITE.usa);
  const [region, setRegion] = useState<Region>("Northeast");
  const states = STATE_UNIVERSITIES.filter((s) => s.region === region);

  return (
    <section id="destinations" className="bg-white section-y">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="max-w-[16ch] type-h2 text-neutral-900">{usa.heading}</h2>
            {usa.lead && <p className="mt-5 max-w-md type-body text-neutral-600">{usa.lead}</p>}
          </div>
          <a
            href="/services"
            className="group inline-flex items-center gap-1.5 self-start type-button text-blue-700 md:self-auto"
          >
            <CmsText id="Destinations.cta.services">Explore our services</CmsText>
            <ArrowUpRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </Reveal>

        <div className="section-body">
          <div role="tablist" aria-label="Region" className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={region === r}
                onClick={() => setRegion(r)}
                className={`type-button h-10 rounded-full border px-4 transition-colors duration-300 ${
                  region === r
                    ? "border-blue-950 bg-blue-950 text-white"
                    : "border-neutral-900/10 bg-white text-neutral-700 hover:border-blue-500/40"
                }`}
              >
                {r}
                <span className={`ml-1.5 ${region === r ? "text-ice-300/80" : "text-neutral-400"}`}>
                  {STATE_UNIVERSITIES.filter((s) => s.region === r).length}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-4 type-caption text-neutral-500">
            Each state's highest-ranked university in U.S. News Best National Universities (
            {RANK_EDITION}
            {OLDER > 0 && `; ${OLDER} states use the previous edition`}). Tap a card for its
            international student brief.
          </p>

          <div
            key={region}
            className="-mx-6 mt-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-3 md:mx-0 md:px-0"
          >
            {states.map((s) => (
              <a
                key={s.slug}
                href={`/universities/${s.slug}`}
                className="group relative block aspect-[4/5] w-[72%] shrink-0 snap-start overflow-hidden rounded-3xl bg-blue-950 sm:w-[44%] md:w-[30%] lg:w-[23%]"
              >
                {s.image ? (
                  <img
                    src={s.image.card}
                    alt={`${s.university} campus`}
                    loading="lazy"
                    decoding="async"
                    width={640}
                    height={800}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-[1.04]"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_0%,rgb(43_109_166/0.55)_0%,transparent_60%),linear-gradient(180deg,var(--color-blue-900),var(--color-blue-950))]"
                  />
                )}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgb(4_28_49/0.88)_100%)]"
                />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="type-caption text-ice-300/90">{s.state}</div>
                  <div className="mt-1 font-heading text-[1.35rem] font-light leading-tight tracking-[-0.02em] text-white">
                    {s.university}
                  </div>
                  <div className="mt-2 flex items-center gap-1 font-text text-[13px] text-white/70">
                    {s.rank.label}
                    <ArrowUpRight
                      aria-hidden
                      className="h-3.5 w-3.5 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
