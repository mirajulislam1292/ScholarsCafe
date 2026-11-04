import { createFileRoute } from "@tanstack/react-router";
import { CmsText, useCmsValue } from "@/lib/cms";
import { VALUES as CMS_DEFAULT_VALUES } from "@/lib/scholars-data";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { NameMarquee } from "@/components/scholars/NameMarquee";
import { Reveal } from "@/components/scholars/Reveal";
import { Block, CtaBand, PageHero, ParallaxImage } from "@/components/page/PageParts";
import { Team } from "@/components/page/Team";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About - Scholars Cafe" },
      {
        name: "description",
        content:
          "Scholars Cafe mentors Bangladeshi students applying to universities in the United States. Meet the team.",
      },
      { property: "og:title", content: "About - Scholars Cafe" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const VALUES = useCmsValue("data.VALUES", CMS_DEFAULT_VALUES);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <PageHero
          title={
            <>
              <CmsText id="About.8bdc46e618ce">Built by Students,</CmsText>{" "}
              <span className="text-ice-300">
                <CmsText id="About.6aa9f10fe080"> For Students.</CmsText>
              </span>
            </>
          }
          image="/media/pages/students-walking.webp"
          imageSm="/media/pages/students-walking-sm.webp"
        />

        {/* Intro + who we are */}
        <Block
          sticky
          title={<CmsText id="About.10a516acef81">Who We Are</CmsText>}
          intro={
            <>
              <CmsText id="About.ca4646eca668">
                To empower every Bangladeshi student with the mentorship, strategy, and resources to
                unlock world-class international education, from their first SAT session to their
                visa approval day.
              </CmsText>
            </>
          }
        >
          <div className="type-body space-y-7 text-[1.0625rem] leading-[1.75] text-neutral-700">
            <Reveal>
              <p>
                <CmsText id="About.a179d3cbbe8a">
                  Scholars Cafe is a Bangladeshi study abroad consultancy with one unwavering
                  mission: to make world-class international education genuinely accessible to every
                  deserving student, regardless of financial background or family connections.
                </CmsText>
              </p>
            </Reveal>
            <Reveal>
              <p>
                <CmsText id="About.11528efd2a1c">
                  We know exactly what Bangladeshi students face. Complex application portals in
                  English. Financial aid forms that require documents you've never heard of.
                  Confusing test requirements. Essay prompts that ask you to "be yourself" without
                  any guidance on what that means. We've been there, and we built Scholars Cafe to
                  be the guide we wished we had.
                </CmsText>
              </p>
            </Reveal>
            <Reveal>
              <p>
                <CmsText id="About.a025ca48fcc6">
                  Our team is passionate, experienced, and entirely student-first. We don't just
                  process applications. We build relationships, strategies, and futures.
                </CmsText>
              </p>
            </Reveal>
          </div>
        </Block>

        {/* Full-bleed image band */}
        <ParallaxImage
          src="/media/pages/library.webp"
          srcSm="/media/pages/library-sm.webp"
          alt="Students studying together in a university library"
          className="h-[56vh] min-h-[360px] md:h-[78vh]"
        />

        {/* Values as numbered rows */}
        <Block tone="dark" sticky title="What we hold to.">
          <ol className="border-t border-white/10">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.05}>
                <li className="group grid grid-cols-[3.5rem_1fr] gap-6 border-b border-white/10 py-9 transition-colors duration-500 ease-premium md:grid-cols-[5rem_1fr]">
                  <span className="font-heading text-[1.75rem] font-light leading-none text-ice-500 transition-colors duration-500 group-hover:text-ice-200">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="type-h3 text-white">{v.title}</h3>
                    <p className="type-body mt-2 max-w-[48ch] text-ice-300/80">{v.desc}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </Block>

        <Team />

        {/* Proof: where students were admitted */}
        <NameMarquee />

        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
