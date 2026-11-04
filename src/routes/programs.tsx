import { createFileRoute } from "@tanstack/react-router";
import { Sections } from "@/components/page/Sections";
import { ArrowUpRight, Check } from "lucide-react";
import { CmsText, useCmsCollection, useCmsValue } from "@/lib/cms";
import {
  PROGRAMS as DEFAULT_PROGRAMS,
  PROCESS as CMS_DEFAULT_PROCESS,
  WA_LINK as CMS_DEFAULT_WA_LINK,
} from "@/lib/scholars-data";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { NameMarquee } from "@/components/scholars/NameMarquee";
import { Reveal } from "@/components/scholars/Reveal";
import { Block, CtaBand, PageHero, ParallaxImage } from "@/components/page/PageParts";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs - Scholars Cafe" },
      {
        name: "description",
        content:
          "Mentor-led tracks for Bangladeshi students applying to US universities: full scholarship, general admission and file opening.",
      },
      { property: "og:title", content: "Programs - Scholars Cafe" },
    ],
  }),
  component: ProgramsPage,
});

type Program = (typeof DEFAULT_PROGRAMS)[number];

function ProgramsPage() {
  const PROGRAMS = useCmsCollection(
    "courses",
    DEFAULT_PROGRAMS,
    (data, id) => ({ ...data, id, icon: "graduation-cap" }) as Program,
  );
  const PROCESS = useCmsValue("data.PROCESS", CMS_DEFAULT_PROCESS);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Sections
          page="/programs"
          blocks={{
            hero: (
              <>
                <PageHero
                  title={
                    <CmsText id="Programs.e2cd5f83037c">Choose Your Path to the World</CmsText>
                  }
                  lead={
                    <CmsText id="Programs.f664216f2985">
                      Whether you're chasing full scholarships or standard admission, we have a
                      structured, mentor-led program built around your goals.
                    </CmsText>
                  }
                  image="/media/pages/oklahoma-autumn.webp"
                  imageSm="/media/pages/oklahoma-autumn-sm.webp"
                />
              </>
            ),
            tracks: (
              <>
                <Block title={<CmsText id="Programs.1d5c2e2d47ce">Our Tracks</CmsText>}>
                  <div className="grid gap-6">
                    {PROGRAMS.map((p, i) => (
                      <Reveal key={p.id} delay={i * 0.05}>
                        <ProgramRow p={p} waLink={WA_LINK} />
                      </Reveal>
                    ))}
                  </div>
                </Block>
              </>
            ),
            process: (
              <>
                <section className="relative isolate overflow-hidden bg-blue-950 py-[clamp(72px,13vw,200px)] text-white">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay [background-image:var(--grain)]"
                  />
                  <div className="mx-auto max-w-[1200px] px-6 md:px-12">
                    <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                      <h2 className="type-h2 max-w-[14ch]">
                        <CmsText id="Process.0de600876bfd">
                          From conversation to acceptance.
                        </CmsText>
                      </h2>
                      <p className="type-lead max-w-md text-ice-300/80">
                        <CmsText id="Process.a5a96a06b61f">
                          A six-step path designed to take the chaos out of admissions and replace
                          it with structure, strategy, and momentum.
                        </CmsText>
                      </p>
                    </Reveal>
                  </div>
                  <ol
                    aria-label="Our process"
                    className="mx-auto mt-16 flex max-w-[1200px] snap-x snap-mandatory scroll-pl-6 gap-5 overflow-x-auto px-6 pb-4 md:scroll-pl-12 [scrollbar-width:thin] md:mt-20 md:px-12"
                  >
                    {PROCESS.map((step) => (
                      <li
                        key={step.n}
                        className="group w-[78%] shrink-0 snap-start rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-[background-color,border-color,transform] duration-700 ease-premium hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06] sm:w-[46%] lg:w-[31%] md:p-10"
                      >
                        <span className="font-heading text-[3.5rem] font-light leading-none text-ice-500 transition-colors duration-700 group-hover:text-ice-200">
                          {String(step.n).padStart(2, "0")}
                        </span>
                        <h3 className="type-h3 mt-14 text-white">{step.title}</h3>
                        <p className="type-body mt-3 text-ice-300/80">{step.desc}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              </>
            ),
            image: (
              <>
                <ParallaxImage
                  src="/media/pages/campus-early-fall.webp"
                  srcSm="/media/pages/campus-early-fall-sm.webp"
                  alt="A quiet college campus in early fall"
                  className="h-[56vh] min-h-[360px] md:h-[80vh]"
                />
              </>
            ),
            names: (
              <>
                <NameMarquee />
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

function ProgramRow({ p, waLink }: { p: Program; waLink: string }) {
  const featured = Boolean(p.featured);
  return (
    <article
      className={`group relative isolate grid gap-10 overflow-hidden rounded-3xl p-8 transition-shadow duration-700 ease-premium md:grid-cols-[5fr_7fr] md:gap-16 md:p-14 ${
        featured
          ? "bg-blue-950 text-ice-200/85 hover:shadow-[0_40px_80px_rgb(4_28_49/0.25)]"
          : "border border-neutral-900/[0.08] bg-white hover:shadow-[0_40px_80px_rgb(4_28_49/0.1)]"
      }`}
    >
      {featured && (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(70%_90%_at_100%_0%,rgb(43_109_166/0.45)_0%,transparent_60%)]"
        />
      )}
      <div className="flex flex-col justify-between gap-8">
        <div>
          <p className={`type-caption ${featured ? "text-ice-400" : "text-blue-700"}`}>{p.badge}</p>
          <h3 className={`type-h2 mt-4 ${featured ? "text-white" : "text-neutral-900"}`}>
            {p.title}
          </h3>
          {p.price && (
            <p className={`type-body mt-3 ${featured ? "text-ice-400" : "text-neutral-500"}`}>
              {p.price}
            </p>
          )}
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`type-button inline-flex h-12 w-fit items-center gap-2 rounded-full px-6 transition-colors duration-500 ease-premium ${
            featured
              ? "bg-ice-100 text-blue-950 hover:bg-white"
              : "bg-blue-700 text-white hover:bg-blue-800"
          }`}
        >
          {p.cta}
          <ArrowUpRight aria-hidden className="h-4 w-4" />
        </a>
      </div>
      <div>
        <p className={`type-lead ${featured ? "text-ice-200/90" : "text-neutral-700"}`}>
          {p.description}
        </p>
        <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {p.features.map((f) => (
            <li key={f} className="type-body flex items-start gap-3">
              <Check
                aria-hidden
                strokeWidth={1.75}
                className={`mt-1 h-4 w-4 shrink-0 ${featured ? "text-ice-300" : "text-blue-600"}`}
              />
              <span className={featured ? "text-ice-200/85" : "text-neutral-700"}>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
