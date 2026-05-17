import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/scholars/Navbar";
import { Hero } from "@/components/scholars/Hero";
import { Stats } from "@/components/scholars/Stats";
import { Destinations } from "@/components/scholars/Destinations";
import { WorldMap } from "@/components/scholars/WorldMap";
import { Programs } from "@/components/scholars/Programs";
import { Services } from "@/components/scholars/Services";
import { Process } from "@/components/scholars/Process";
import { TestPrep } from "@/components/scholars/TestPrep";
import { UniversityExplorer } from "@/components/scholars/UniversityExplorer";
import { SuccessStories } from "@/components/scholars/SuccessStories";
import { FAQ } from "@/components/scholars/FAQ";
import { About } from "@/components/scholars/About";
import { Resources } from "@/components/scholars/Resources";
import { Newsletter } from "@/components/scholars/Newsletter";
import { Contact } from "@/components/scholars/Contact";
import { Footer } from "@/components/scholars/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Scholars Cafe — Your Dream University Starts Here" },
      { name: "description", content: "Bangladesh's #1 study abroad consultancy. Expert mentorship for USA, UK, Canada, Germany & 8+ more countries. Scholarships, SAT/IELTS/TOEFL prep, visa guidance — from application to acceptance." },
      { property: "og:title", content: "Scholars Cafe — Your Dream University Starts Here" },
      { property: "og:description", content: "From Bangladesh to the World. Expert university admissions, scholarship strategy, and test prep — built for ambitious Bangladeshi students." },
    ],
  }),
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
        <TestPrep />
        <UniversityExplorer />
        <SuccessStories />
        <FAQ />
        <About />
        <Resources />
        <Newsletter />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
