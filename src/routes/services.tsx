import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { Sections } from "@/components/page/Sections";
import { CmsText, useCmsValue } from "@/lib/cms";
import { SERVICES as CMS_DEFAULT_SERVICES } from "@/lib/scholars-data";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { NameMarquee } from "@/components/scholars/NameMarquee";
import { Booking } from "@/components/scholars/Booking";
import { Reveal } from "@/components/scholars/Reveal";
import { Block, CtaBand, PageHero, ParallaxImage } from "@/components/page/PageParts";

export const Route = createFileRoute("/services")({
  head: () =>
    seo({
      path: "/services",
      title: "US Application Help: Essays, Aid & Visa | Scholars Cafe",
      description:
        "Individual services for US university applications from Bangladesh: college list, Common App essays, CSS Profile and ISFAA, and F-1 visa interview prep.",
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
                        <li className="group grid grid-cols-[3rem_1fr] gap-5 border-b border-neutral-900/[0.08] py-6 md:grid-cols-[4.5rem_1fr] md:py-8">
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
            booking: (
              <>
                <Block
                  id="book"
                  title="1-on-1 mentor session"
                  intro="Pick an open day and time, tell us what you'd like to talk about, and we'll email you the meeting link."
                >
                  <div className="max-w-[720px]">
                    <Booking />
                  </div>
                </Block>
              </>
            ),
            image: (
              <>
                <ParallaxImage
                  src="/media/pages/library.webp"
                  srcSm="/media/pages/library-sm.webp"
                  alt="Students working together in a university library"
                  className="image-band"
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
                {/* This page already has the booking calendar, so the closing band points to the program forms. */}
                <CtaBand
                  title="Want a mentor through every step?"
                  action="Apply to a program"
                  href="/forms"
                />
              </>
            ),
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
