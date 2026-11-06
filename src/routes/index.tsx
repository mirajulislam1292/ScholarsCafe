import { createFileRoute } from "@tanstack/react-router";
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
