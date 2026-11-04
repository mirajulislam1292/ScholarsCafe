import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/scholars/Navbar";
import { Hero } from "@/components/scholars/Hero";
import { NameMarquee } from "@/components/scholars/NameMarquee";
import { Destinations } from "@/components/scholars/Destinations";
import { SuccessStories } from "@/components/scholars/SuccessStories";
import { BlogPosts } from "@/components/scholars/BlogPosts";
import { Footer } from "@/components/scholars/Footer";
import { PageIndex } from "@/components/page/PageIndex";
import { CtaBand } from "@/components/page/PageParts";

export const Route = createFileRoute("/")({
  component: Index,
});

// Home: hero → names → USA → page index → proof → CTA. Detailed content lives on the inner pages.
// The stats band (src/components/scholars/Stats.tsx) is hidden until the numbers are verified.
function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <NameMarquee />
        <Destinations />
        <PageIndex />
        <SuccessStories />
        <BlogPosts />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
