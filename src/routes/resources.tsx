import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { Sections } from "@/components/page/Sections";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { CmsText, useCmsValue } from "@/lib/cms";
import {
  RESOURCES as CMS_DEFAULT_RESOURCES,
  RESOURCE_CATEGORIES as CMS_DEFAULT_RESOURCE_CATEGORIES,
} from "@/lib/scholars-data";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { Reveal } from "@/components/scholars/Reveal";
import { UniversityExplorer } from "@/components/scholars/UniversityExplorer";
import { FAQ } from "@/components/scholars/FAQ";
import { Newsletter } from "@/components/scholars/Newsletter";
import { Block, CtaBand, PageHero } from "@/components/page/PageParts";

export const Route = createFileRoute("/resources")({
  head: () =>
    seo({
      path: "/resources",
      title: "Free Guides to Study in the USA from Bangladesh",
      description:
        "Free guides for Bangladeshi students applying to US universities: essays, scholarships, financial aid, tests and visas, plus a university explorer and FAQs.",
    }),
  component: ResourcesPage,
});

/** Strip leading emoji/flags from legacy tags (no emoji in the design). */
const clean = (s: string) => s.replace(/^[^\p{L}\p{N}]+/u, "").trim();

function ResourcesPage() {
  const RESOURCES = useCmsValue("data.RESOURCES", CMS_DEFAULT_RESOURCES);
  const CATEGORIES = useCmsValue("data.RESOURCE_CATEGORIES", CMS_DEFAULT_RESOURCE_CATEGORIES);
  const [filter, setFilter] = useState<string>("All");
  const featured = RESOURCES.filter((r) => r.featured);
  const list = RESOURCES.filter((r) => !r.featured && (filter === "All" || r.category === filter));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Sections
          page="/resources"
          blocks={{
            hero: (
              <>
                <PageHero
                  title={
                    <>
                      <CmsText id="Resources.bfa3e8d52c73">Every guide we wish we had</CmsText>{" "}
                      <span className="text-ice-300">
                        <CmsText id="Resources.54ec7866ea80">when we were applying.</CmsText>
                      </span>
                    </>
                  }
                  lead={
                    <CmsText id="Resources.89cf27a56028">
                      Information shouldn't be locked behind a paywall. Every guide, checklist, and
                      breakdown below is free. No email required, no upsell.
                    </CmsText>
                  }
                  image="/media/pages/campus-early-fall.webp"
                  imageSm="/media/pages/campus-early-fall-sm.webp"
                  imageAlt="A college campus in early fall"
                />
              </>
            ),
            featured: (
              <>
                {featured.length > 0 && (
                  <Block tone="dark" title="Start here.">
                    <div className="grid gap-6 md:grid-cols-2">
                      {featured.map((r, i) => (
                        <Reveal key={r.title} delay={i * 0.06}>
                          <a
                            href="#newsletter"
                            className="group flex h-full flex-col justify-between gap-16 rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-[background-color,border-color,transform] duration-700 ease-premium hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06] md:p-12"
                          >
                            <div>
                              <p className="type-caption text-ice-400">{clean(r.tag)}</p>
                              <h3 className="type-h2 mt-5 text-white">{r.title}</h3>
                              <p className="type-body mt-5 max-w-[46ch] text-ice-300/85">
                                {r.teaser}
                              </p>
                            </div>
                            <span className="type-button inline-flex items-center gap-2 text-ice-100">
                              {r.readTime} · Get it by email
                              <ArrowUpRight
                                aria-hidden
                                className="h-4 w-4 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                              />
                            </span>
                          </a>
                        </Reveal>
                      ))}
                    </div>
                  </Block>
                )}
              </>
            ),
            guides: (
              <>
                <Block sticky title="All guides">
                  <div
                    role="tablist"
                    aria-label="Guide topics"
                    className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
                  >
                    {["All", ...CATEGORIES.map((c) => c.id)].map((c) => {
                      const label =
                        c === "All" ? "All" : (CATEGORIES.find((x) => x.id === c)?.label ?? c);
                      const active = filter === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setFilter(c)}
                          className={`type-nav h-10 shrink-0 whitespace-nowrap rounded-full px-4 transition-colors duration-500 ease-premium ${
                            active
                              ? "bg-blue-950 text-white"
                              : "text-neutral-600 ring-1 ring-neutral-900/10 hover:text-neutral-900 hover:ring-neutral-900/25"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <ul className="mt-10 border-t border-neutral-900/[0.08]">
                    {list.map((r) => (
                      <li key={r.title} className="border-b border-neutral-900/[0.08]">
                        <a
                          href="#newsletter"
                          className="group grid gap-2 py-7 md:grid-cols-[1fr_auto] md:gap-10"
                        >
                          <div className="transition-transform duration-700 ease-premium group-hover:translate-x-1">
                            <h3 className="type-h3 text-neutral-900 group-hover:text-blue-800">
                              {r.title}
                            </h3>
                            <p className="type-body mt-2 max-w-[60ch] text-neutral-600">
                              {r.teaser}
                            </p>
                          </div>
                          <span className="type-caption self-start whitespace-nowrap text-neutral-500 md:pt-1.5">
                            {r.readTime}
                          </span>
                        </a>
                      </li>
                    ))}
                    {list.length === 0 && (
                      <li className="type-body py-10 text-neutral-500">
                        No guides in this topic yet.
                      </li>
                    )}
                  </ul>
                </Block>
              </>
            ),
            explorer: (
              <>
                <UniversityExplorer />
              </>
            ),
            faq: (
              <>
                <FAQ />
              </>
            ),
            newsletter: (
              <>
                <Newsletter />
              </>
            ),
            cta: (
              <>
                <CtaBand />
              </>
            ),
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
