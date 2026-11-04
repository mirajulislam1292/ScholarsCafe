import { createFileRoute } from "@tanstack/react-router";
import { Sections } from "@/components/page/Sections";
import { CmsText, useCmsValue } from "@/lib/cms";
import { SERVICES as CMS_DEFAULT_SERVICES } from "@/lib/scholars-data";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { NameMarquee } from "@/components/scholars/NameMarquee";
import { Reveal } from "@/components/scholars/Reveal";
import { Block, CtaBand, PageHero, ParallaxImage } from "@/components/page/PageParts";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services - Scholars Cafe" },
      {
        name: "description",
        content:
          "Individual admissions services for US universities: planning, essays, financial aid, visas and more.",
      },
      { property: "og:title", content: "Services - Scholars Cafe" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const SERVICES = useCmsValue("data.SERVICES", CMS_DEFAULT_SERVICES);
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Sections
          page="/services"
          blocks={{
            hero: (
              <>
                <PageHero
                  title={
                    <CmsText id="Services.7eaa4eb59048">
                      Every piece of the journey, handled.
                    </CmsText>
                  }
                  lead={
                    <CmsText id="Services.1d120c350141">
                      Pick exactly the support you need. Our individual services let you plug expert
                      help in wherever the road feels uncertain.
                    </CmsText>
                  }
                  image="/media/hero/d3-philadelphia-university.webp"
                  imageAlt="Aerial view of a university district in Philadelphia"
                />
              </>
            ),
            services: (
              <>
                <Block
                  sticky
                  title={<CmsText id="Services.6fc361952438">Individual Services</CmsText>}
                >
                  <ol className="border-t border-neutral-900/[0.08]">
                    {SERVICES.map((s, i) => (
                      <Reveal key={s.title} delay={i * 0.04}>
                        <li className="group grid grid-cols-[3rem_1fr] gap-5 border-b border-neutral-900/[0.08] py-8 md:grid-cols-[4.5rem_1fr] md:py-10">
                          <span className="font-heading text-[1.5rem] font-light leading-none text-neutral-400 transition-colors duration-500 ease-premium group-hover:text-blue-700">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="transition-transform duration-700 ease-premium group-hover:translate-x-1">
                            <h3 className="type-h3 text-neutral-900">{s.title}</h3>
                            <p className="type-body mt-2 max-w-[52ch] text-neutral-600">{s.desc}</p>
                          </div>
                        </li>
                      </Reveal>
                    ))}
                  </ol>
                </Block>
              </>
            ),
            image: (
              <>
                <ParallaxImage
                  src="/media/pages/library.webp"
                  srcSm="/media/pages/library-sm.webp"
                  alt="Students working together in a university library"
                  className="h-[56vh] min-h-[360px] md:h-[72vh]"
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
