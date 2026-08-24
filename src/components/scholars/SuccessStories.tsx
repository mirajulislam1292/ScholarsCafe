import { useEffect, useState } from "react";
import { Reveal, RevealStagger, StaggerItem } from "./Reveal";
import { TESTIMONIALS, WA_LINK } from "@/lib/scholars-data";
import { Star } from "lucide-react";
import { motion } from "motion/react";

const SLIDE_INTERVAL = 6000;

export function SuccessStories() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % TESTIMONIALS.length);
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, []);

  const total = TESTIMONIALS.length;
  const leftIndex = (activeIndex - 1 + total) % total;
  const rightIndex = (activeIndex + 1) % total;

  const visibleTestimonials = [
    { testimonial: TESTIMONIALS[leftIndex], position: "left" as const },
    { testimonial: TESTIMONIALS[activeIndex], position: "center" as const },
    { testimonial: TESTIMONIALS[rightIndex], position: "right" as const },
  ];

  return (
    <section id="success" className="bg-sky-soft py-24 md:py-32 dark:bg-navy-deep">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-sky">Student Wins</span>
          <h2 className="mt-4 font-display text-[clamp(2rem,3.5vw,3rem)] font-extrabold text-navy dark:text-white">
            Real Students. Real Results.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-slate-600 dark:text-white/70">
            Every success story started with a conversation. Here's what happens when preparation meets opportunity — and the right guidance.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.15fr_1fr] lg:items-stretch">
          {visibleTestimonials.map(({ testimonial, position }) => {
            const isCenter = position === "center";
            const isSide = position !== "center";

            return (
              <motion.article
                key={`${testimonial.name}-${position}`}
                initial={false}
                animate={{
                  opacity: isCenter ? 1 : 0.78,
                }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white pt-9 shadow-card-hover transition-all dark:border-white/10 dark:bg-white/6 ${
                  isCenter ? "z-20" : "z-10"
                } ${isSide ? "lg:mt-8" : ""}`}
              >
                <div className="px-9">
                  <div className="font-display text-6xl leading-none text-sky/15">"</div>
                  <p className="mt-2 text-[15px] italic leading-[1.85] text-slate-600 dark:text-white/75">{testimonial.quote}</p>
                  <div className="mt-7 flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.color} font-display text-base font-extrabold text-white`}>
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="font-display text-base font-bold text-navy dark:text-white">{testimonial.name}</div>
                      <div className="text-[13px] font-semibold text-sky-deep dark:text-sky-light">{testimonial.destination}</div>
                      <div className="text-[12px] text-slate-500 dark:text-white/55">{testimonial.year}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5 text-gold">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                    </div>
                  </div>
                </div>
                <div className="mt-7 bg-gradient-to-r from-sky to-navy px-9 py-4 text-center text-sm font-bold text-white">
                  {testimonial.outcome}
                </div>
              </motion.article>
            );
          })}
        </div>

        <Reveal className="mt-12 text-center">
          <p className="text-slate-600 dark:text-white/70">Your success story is next.</p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky px-7 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#0284c7] hover:shadow-button"
          >
            Book a Free Consultation →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
