import { Reveal, RevealStagger, StaggerItem } from "./Reveal";
import { COUNTRIES, WA_LINK } from "@/lib/scholars-data";
import { ArrowUpRight } from "lucide-react";

export function Destinations() {
  const featured = COUNTRIES.find((c) => c.featured)!;
  const others = COUNTRIES.filter((c) => !c.featured);

  return (
    <section id="destinations" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        <Reveal>
          <div className="grid items-end gap-8 md:grid-cols-[1fr_auto] md:gap-16">
            <div>
              <h2 className="mt-5 editorial-h2">
                Choose a country.
                <br />
                <span className="font-display italic font-light text-sky">
                  We'll handle the rest.
                </span>
              </h2>
            </div>
            <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Our deepest expertise is the USA, where Bangladeshi students consistently earn
              need-based scholarships at top liberal arts colleges. We also support applications
              across Europe, Asia, and beyond.
            </p>
          </div>
        </Reveal>

        {/* Featured country, large editorial card */}
        <Reveal delay={0.1}>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-14 grid overflow-hidden rounded-[28px] border border-border country-feature bg-sky-tint p-8 text-white transition-all hover:-translate-y-1 hover:shadow-card-hover md:grid-cols-[1fr_1.2fr] md:p-12"
          >
            <div className="flex flex-col justify-between gap-8">
              <div>
                <div className="mt-6 text-8xl md:text-9xl">{featured.flag}</div>
              </div>
              <div className="font-display text-5xl font-extrabold md:text-6xl">
                {featured.name}
              </div>
            </div>
            <div className="flex flex-col justify-between gap-8 border-t border-white/15 pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
              <div>
                <p className="mt-4 text-2xl font-light leading-snug text-white/85 md:text-3xl">
                  {featured.note}. We've built our practice around helping Bangladeshi students
                  unlock 50–100% need-based aid at top US universities.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-sky-light">
                Explore USA pathway
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
              </div>
            </div>
          </a>
        </Reveal>

        {/* Other countries, minimal editorial grid */}
        <RevealStagger className="mt-6 country-grid flex flex-wrap gap-px overflow-hidden rounded-[28px] border border-border bg-border">
          {others.map((c) => (
            <StaggerItem key={c.name} className="min-w-0 flex-[1_1_220px]">
              <div className="group relative h-full bg-card p-7 transition-colors hover:bg-secondary">
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{c.flag}</span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h3 className="mt-8 font-display text-xl font-bold text-foreground">{c.name}</h3>
                <div className="mt-2 text-[13px] text-muted-foreground">{c.note}</div>
                <div className="mt-5 inline-block border-t border-sky pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky">
                  {c.tag}
                </div>
              </div>
            </StaggerItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
