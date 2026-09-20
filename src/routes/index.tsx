import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/scholars/Navbar";
import { Hero } from "@/components/scholars/Hero";
import { Stats } from "@/components/scholars/Stats";
import { Destinations } from "@/components/scholars/Destinations";
import { WorldMap } from "@/components/scholars/WorldMap";
import { Programs } from "@/components/scholars/Programs";
import { Services } from "@/components/scholars/Services";
import { Process } from "@/components/scholars/Process";
import { UniversityExplorer } from "@/components/scholars/UniversityExplorer";
import { SuccessStories } from "@/components/scholars/SuccessStories";
import { FAQ } from "@/components/scholars/FAQ";
import { About } from "@/components/scholars/About";
import { Resources } from "@/components/scholars/Resources";
import { Newsletter } from "@/components/scholars/Newsletter";
import { Contact } from "@/components/scholars/Contact";
import { Footer } from "@/components/scholars/Footer";
import { BlogPosts } from "@/components/scholars/BlogPosts";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Destinations />
        <WorldMap />
        <Programs />
        <Services />
        <Process />
        <UniversityExplorer />
        <SuccessStories />
        <FAQ />
        <About />
        <Resources />
        <BlogPosts />
        <Newsletter />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
