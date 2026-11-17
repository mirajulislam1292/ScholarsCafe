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
    id: "broadcast",
    href: "/resources/broadcast",
    label: "Broadcast",
    desc: "Announcements and updates from the Scholars Cafe team.",
  },
] as const;

/** Hub: four cards linking to the sub-pages. */
export function ResourcesHubCards() {
  const cmsLabel = useCmsLookup();
  return (
    <section className="bg-white py-[clamp(56px,9vw,120px)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <h2 className="type-h2 text-neutral-900">
          <CmsText id="ResourcesHub.title">Explore resources</CmsText>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RESOURCE_PAGES.map((p, i) => (
            <Reveal key={p.href} delay={i * 0.05}>
              <a
                href={p.href}
                className="group flex h-full flex-col justify-between gap-8 rounded-3xl border border-neutral-900/[0.08] bg-ice-50 p-7 transition-[transform,box-shadow] duration-700 ease-premium hover:-translate-y-1 hover:shadow-[0_24px_60px_rgb(15_40_70/0.08)]"
              >
                <div>
                  <h3 className="type-h3 text-neutral-900 group-hover:text-blue-800">
                    {cmsLabel("ResourcesHub." + p.id, p.label)}
                  </h3>
                  <p className="type-body mt-3 text-neutral-600">
                    {cmsLabel("ResourcesHub." + p.id + ".desc", p.desc)}
                  </p>
                </div>
                <ArrowUpRight
                  aria-hidden
                  className="h-5 w-5 text-blue-700 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
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
        <section className="bg-blue-950 pb-10 pt-32 text-white md:pt-40">
          <div className="mx-auto max-w-[1200px] px-6 md:px-12">
            <a href="/resources" className="type-caption text-ice-300 hover:text-white">
              ← <CmsText id="ResourcesHub.back">Resources</CmsText>
            </a>
            <h1 className="type-h1 mt-4 max-w-[18ch]">{title}</h1>
            <p className="type-lead mt-5 max-w-[46ch] text-ice-200/85">{lead}</p>
            <nav
              aria-label="Resources"
              className="-mx-6 mt-10 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {RESOURCE_PAGES.map((p) => {
                const active = p.href === path;
                return (
                  <a
                    key={p.href}
                    href={p.href}
                    aria-current={active ? "page" : undefined}
                    className={`type-nav inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full px-4 transition-colors duration-500 ease-premium ${
                      active
                        ? "bg-ice-100 text-blue-950"
                        : "text-white/80 ring-1 ring-white/20 hover:bg-white/10 hover:text-white"
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
    <p className="type-body rounded-3xl border border-dashed border-neutral-900/15 p-8 text-neutral-600">
      {children}
    </p>
  );
}
