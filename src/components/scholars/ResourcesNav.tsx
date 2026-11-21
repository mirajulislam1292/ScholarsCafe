import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { CmsText, useCmsLookup } from "@/lib/cms";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Reveal } from "./Reveal";

/** The four Resources sub-pages, in menu order. Also used by the navbar's Resources menu. */
export const RESOURCE_PAGES = [
  {
    id: "blog",
    href: "/resources/blog",
    label: "Blog",
    desc: "Articles from our mentors on applying, essays and student life.",
  },
  {
    id: "eca",
    href: "/resources/eca",
    label: "ECA Notification",
    desc: "Get an email when a new extracurricular opportunity opens.",
  },
  {
    id: "webinars",
    href: "/resources/webinars",
    label: "Webinar",
    desc: "Live sessions and recordings you can join for free.",
  },
  {
    id: "podcast",
    href: "/resources/podcast",
    label: "Podcast",
    desc: "Episodes, announcements and updates from the Scholars Cafe team.",
  },
  {
    id: "tools",
    href: "/resources/tools",
    label: "Essay Tools",
    desc: "Core values finder, Common App activity helper and official supplemental prompts.",
  },
] as const;

/** Hub: four cards linking to the sub-pages. */
export function ResourcesHubCards() {
  const cmsLabel = useCmsLookup();
  return (
    <section className="bg-white section-y">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <h2 className="type-h2 text-neutral-900">
          <CmsText id="ResourcesHub.title">Explore resources</CmsText>
        </h2>
        <div className="section-body grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RESOURCE_PAGES.map((p, i) => (
            <Reveal key={p.href} delay={i * 0.05}>
              <a
                href={p.href}
                className="card-soft card-hover group flex h-full flex-col justify-between gap-6 p-7"
              >
                <div>
                  <h3 className="type-h3 text-neutral-900 group-hover:text-blue-800">
                    {cmsLabel("ResourcesHub." + p.id, p.label)}
                  </h3>
                  <p className="type-body mt-3 text-neutral-600">
                    {cmsLabel("ResourcesHub." + p.id + ".desc", p.desc)}
                  </p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ice-100 text-blue-700 transition-colors duration-500 ease-premium group-hover:bg-blue-700 group-hover:text-white">
                  <ArrowUpRight aria-hidden className="h-4 w-4" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Layout for each sub-page: compact dark header with tabs to the other sub-pages, then the content. */
export function ResourcesSubPage({
  path,
  title,
  lead,
  children,
}: {
  path: string;
  title: ReactNode;
  lead: ReactNode;
  children: ReactNode;
}) {
  const cmsLabel = useCmsLookup();
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="relative isolate overflow-hidden bg-blue-950 navy-glow pb-12 pt-32 text-white md:pt-36">
          <div
            aria-hidden
            className="absolute -right-24 -top-24 -z-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(110_164_215/0.22)_0%,transparent_65%)] md:-right-10 md:h-[560px] md:w-[560px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay [background-image:var(--grain)]"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ice-300/25 to-transparent"
          />
          <div className="mx-auto max-w-[1200px] px-6 md:px-12">
            <a href="/resources" className="type-caption text-ice-300 hover:text-white">
              ← <CmsText id="ResourcesHub.back">Resources</CmsText>
            </a>
            <h1 className="type-h1 mt-4 max-w-[18ch]">{title}</h1>
            <p className="type-lead mt-5 max-w-[46ch] text-ice-200/85">{lead}</p>
            <nav aria-label="Resources" className="mt-8 flex flex-wrap gap-2">
              {RESOURCE_PAGES.map((p) => {
                const active = p.href === path;
                return (
                  <a
                    key={p.href}
                    href={p.href}
                    aria-current={active ? "page" : undefined}
                    className={`type-nav inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full px-4 transition-colors duration-500 ease-premium ${
                      active
                        ? "bg-ice-100 text-blue-950 shadow-[0_8px_24px_rgb(0_0_0/0.25)]"
                        : "bg-white/[0.04] text-white/85 ring-1 ring-white/20 hover:bg-white/10 hover:text-white hover:ring-white/35"
                    }`}
                  >
                    {cmsLabel("ResourcesHub." + p.id, p.label)}
                  </a>
                );
              })}
            </nav>
          </div>
        </section>
        {children}
      </main>
      <Footer />
    </div>
  );
}

/** Honest empty state for a sub-page with nothing published yet. */
export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="type-body rounded-3xl border border-dashed border-blue-600/25 bg-ice-50 p-8 text-neutral-600">
      {children}
    </p>
  );
}
