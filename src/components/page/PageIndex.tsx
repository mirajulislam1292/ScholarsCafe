import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "../scholars/Reveal";

type Entry = {
  to: "/programs" | "/services" | "/about" | "/resources";
  name: string;
  line: string;
  image: string;
};

const ENTRIES: Entry[] = [
  {
    to: "/programs",
    name: "Programs",
    line: "Three mentor-led tracks, from first call to acceptance.",
    image: "/media/pages/oklahoma-autumn-sm.webp",
  },
  {
    to: "/services",
    name: "Services",
    line: "Expert help exactly where you need it.",
    image: "/media/pages/library-sm.webp",
  },
  {
    to: "/about",
    name: "About",
    line: "Who we are, and the team behind Scholars Cafe.",
    image: "/media/pages/students-walking-sm.webp",
  },
  {
    to: "/resources",
    name: "Resources",
    line: "Free guides, a university explorer and answers.",
    image: "/media/pages/campus-early-fall-sm.webp",
  },
];

/** Home page index: large rows linking to each inner page, with an image that follows hover. */
export function PageIndex() {
  return (
    <section className="bg-neutral-50 py-[clamp(96px,13vw,200px)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <ul className="border-t border-neutral-900/[0.08]">
          {ENTRIES.map((e, i) => (
            <Reveal key={e.to} delay={i * 0.05}>
              <li className="border-b border-neutral-900/[0.08]">
                <Link
                  to={e.to}
                  className="group grid grid-cols-[1fr_auto] items-center gap-6 py-8 md:grid-cols-[3rem_1fr_1fr_auto] md:gap-10 md:py-11"
                >
                  <span className="type-caption hidden text-neutral-400 md:block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="type-h2 text-neutral-900 transition-transform duration-700 ease-premium group-hover:translate-x-2">
                    {e.name}
                  </span>
                  <span className="type-body col-span-2 -mt-3 max-w-[38ch] text-neutral-600 md:col-span-1 md:mt-0">
                    {e.line}
                  </span>
                  <span className="relative row-start-1 flex items-center justify-end md:row-auto md:col-start-4">
                    <img
                      src={e.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="pointer-events-none absolute right-16 hidden h-24 w-36 rounded-2xl object-cover opacity-0 shadow-[0_24px_48px_rgb(4_28_49/0.18)] transition-[opacity,transform] duration-700 ease-premium group-hover:-translate-y-1 group-hover:opacity-100 lg:block"
                    />
                    <span className="grid h-12 w-12 place-items-center rounded-full ring-1 ring-neutral-900/10 transition-colors duration-500 ease-premium group-hover:bg-blue-950 group-hover:text-white group-hover:ring-blue-950">
                      <ArrowUpRight aria-hidden className="h-5 w-5" />
                    </span>
                  </span>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
