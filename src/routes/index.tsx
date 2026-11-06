import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { Sections } from "@/components/page/Sections";
import { Navbar } from "@/components/scholars/Navbar";
import { Hero } from "@/components/scholars/Hero";
import { NameMarquee } from "@/components/scholars/NameMarquee";
import { Destinations } from "@/components/scholars/Destinations";
import { SuccessStories } from "@/components/scholars/SuccessStories";
import { BlogPosts } from "@/components/scholars/BlogPosts";
import { ResourcesPreview } from "@/components/scholars/ResourcesPreview";
import { PortalCta } from "@/components/scholars/PortalCta";
import { Footer } from "@/components/scholars/Footer";
import { PageIndex } from "@/components/page/PageIndex";
import { CtaBand } from "@/components/page/PageParts";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      path: "/",
      title: "Study in the USA from Bangladesh | Scholars Cafe",
      description:
        "One-to-one mentors for Bangladeshi students applying to US universities: college lists, essays, scholarships, CSS Profile, ISFAA and F-1 visa prep.",
    }),
  component: Index,
});

// Home: hero → names → USA → page index → proof → journal → resources → portal → CTA. Detailed content lives on the inner pages.
// The stats band (src/components/scholars/Stats.tsx) is hidden until the numbers are verified.
function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Sections
          page="/"
          blocks={{
            hero: (
              <>
                <Hero />
              </>
            ),
            names: (
              <>
                <NameMarquee />
              </>
            ),
            usa: (
              <>
                <Destinations />
              </>
            ),
            pages: (
              <>
                <PageIndex />
              </>
            ),
            stories: (
              <>
                <SuccessStories />
              </>
            ),
            journal: (
              <>
                <BlogPosts />
              </>
            ),
            resources: (
              <>
                <ResourcesPreview />
              </>
            ),
            portal: (
              <>
                <PortalCta />
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
