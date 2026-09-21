import { useState } from "react";
import { Reveal, RevealStagger, StaggerItem } from "./Reveal";
import { RESOURCES, RESOURCE_CATEGORIES, type ResourceCategory } from "@/lib/scholars-data";
import { ArrowUpRight, Clock } from "lucide-react";
import { ScholarIcon } from "./ScholarIcon";

type Filter = "All" | ResourceCategory;

export function Resources() {
  const [filter, setFilter] = useState<Filter>("All");

  const featured = RESOURCES.filter((r) => r.featured);
  const allFiltered = filter === "All" ? RESOURCES : RESOURCES.filter((r) => r.category === filter);
  const nonFeaturedFiltered = allFiltered.filter((r) => !r.featured);

  return (
    <section id="resources" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        {/* Header */}
        <Reveal>
          <div className="grid items-end gap-8 md:grid-cols-[1fr_auto] md:gap-16">
            <div>
              <span className="kicker">Knowledge Hub · Always free</span>
              <h2 className="mt-5 editorial-h2">
                Every guide we wish we had
                <br />
                <span className="font-display italic font-light text-sky">
                  when we were applying.
                </span>
              </h2>
            </div>
            <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Information shouldn't be locked behind a paywall. Every guide, checklist, and
              breakdown below is free. No email required, no upsell.
            </p>
          </div>
        </Reveal>

        {/* Featured articles, magazine layout */}
        {filter === "All" && featured.length > 0 && (
          <RevealStagger className="mt-16 grid gap-6 md:grid-cols-2">
            {featured.map((r) => (
              <StaggerItem key={r.title}>
                <a
                  href="#newsletter"
                  className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-gradient-to-br from-navy to-midnight p-8 text-white transition-all hover:-translate-y-1 hover:shadow-card-hover md:p-10"
                >
                  <h3 className="mt-8 font-display text-3xl font-extrabold leading-tight md:text-4xl">
                    {r.title}
                  </h3>
                  <p className="mt-5 flex-1 text-[15px] leading-relaxed text-white/75">
                    {r.teaser}
                  </p>
                  <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-5">
                    <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-white/55">
                      <Clock className="h-3.5 w-3.5" />
                      {r.readTime}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-light">
                      Read guide
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                    </span>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </RevealStagger>
        )}

        {/* Category filter pills */}
        <Reveal>
          <div className="mt-16 flex flex-wrap items-center gap-2 border-y border-border py-5">
            <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Filter
            </span>
            {(["All", ...RESOURCE_CATEGORIES.map((c) => c.id)] as Filter[]).map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                  filter === c
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Article grid */}
        <RevealStagger className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {nonFeaturedFiltered.map((r) => (
            <StaggerItem key={r.title}>
              <a
                href="#newsletter"
                className="group flex h-full flex-col rounded-[24px] border border-border bg-card p-7 transition-all hover:-translate-y-1.5 hover:border-sky hover:shadow-card-hover"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground">
                    <ScholarIcon name={r.icon} className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky">
                    {r.category}
                  </span>
                </div>
                <h3 className="mt-7 font-display text-xl font-bold leading-snug text-foreground">
                  {r.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {r.teaser}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {r.readTime}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-sky transition-transform group-hover:rotate-45" />
                </div>
              </a>
            </StaggerItem>
          ))}
        </RevealStagger>

        <Reveal className="mt-10 text-center text-sm text-muted-foreground">
          New guides every month ·{" "}
          <a
            className="font-semibold text-sky hover:underline"
            href="https://www.instagram.com/scholars_cafe_/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow @scholars_cafe_ for weekly tips →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
