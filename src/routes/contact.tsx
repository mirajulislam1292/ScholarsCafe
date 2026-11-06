import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { Sections } from "@/components/page/Sections";
import { CmsText } from "@/lib/cms";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { Contact } from "@/components/scholars/Contact";
import { NameMarquee } from "@/components/scholars/NameMarquee";
import { PageHero } from "@/components/page/PageParts";

export const Route = createFileRoute("/contact")({
  head: () =>
    seo({
      path: "/contact",
      title: "Free Consultation: Study in the USA | Scholars Cafe",
      description:
        "Talk to Scholars Cafe about applying to US universities from Bangladesh. Free 30-minute consultation; we reply within 24 hours.",
    }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Sections
          page="/contact"
          blocks={{
            hero: (
              <>
                <PageHero
                  title={
                    <CmsText id="Contact.231ff83a4896">Let's Plan Your Future Together</CmsText>
                  }
                  lead={
                    <CmsText id="Contact.d939b4bf1168">
                      Have a question? Ready to start? Just reach out. We respond within 24 hours
                      and always give honest, personalized advice.
                    </CmsText>
                  }
                  image="/media/hero/d2-columbia.webp"
                  imageAlt="Butler Library, Columbia University"
                />
              </>
            ),
            form: (
              <>
                <Contact showHeader={false} />
              </>
            ),
            names: (
              <>
                <NameMarquee />
              </>
            ),
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
