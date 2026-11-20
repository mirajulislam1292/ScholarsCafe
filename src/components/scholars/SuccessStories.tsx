import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { useEffect, useState } from "react";
import { Reveal, RevealStagger, StaggerItem } from "./Reveal";
import { TESTIMONIALS as DEFAULT_TESTIMONIALS } from "@/lib/scholars-data";
import { useCmsCollection } from "@/lib/cms";
import { Star } from "lucide-react";
import { motion } from "motion/react";

const SLIDE_INTERVAL = 6000;

export function SuccessStories() {
  const TESTIMONIALS = useCmsCollection(
    "feedback",
    [],
    (data) =>
      ({ ...data, color: "from-blue-600 to-blue-900" }) as (typeof DEFAULT_TESTIMONIALS)[number],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % Math.max(1, TESTIMONIALS.length));
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [TESTIMONIALS.length]);

  const total = TESTIMONIALS.length;
  // No stories yet: render nothing rather than a second "book a call" band (the page already ends with one).
  if (!total) return null;
  const leftIndex = (activeIndex - 1 + total) % total;
  const rightIndex = (activeIndex + 1) % total;

  const visibleTestimonials = [
    { testimonial: TESTIMONIALS[leftIndex], position: "left" as const },
    { testimonial: TESTIMONIALS[activeIndex % total], position: "center" as const },
    { testimonial: TESTIMONIALS[rightIndex], position: "right" as const },
  ];

  return (
    <section id="success" className="tone-tint section-y ">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="hidden">
            <CmsText id="SuccessStories.2ef2f8126cf5">Student Wins</CmsText>
          </span>
          <h2 className="type-h2 text-neutral-900 ">
            <CmsText id="SuccessStories.e96a6c77cf3b">Real Students. Real Results.</CmsText>
          </h2>
          <p className="mt-5 type-lead text-neutral-600 ">
            <CmsText id="SuccessStories.325bb7362969">
              Every success story started with a conversation. Here's what happens when preparation
              meets opportunity and the right guidance.
            </CmsText>
          </p>
        </Reveal>

        <div className="section-body grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.15fr_1fr] lg:items-stretch">
          {visibleTestimonials.map(({ testimonial, position }) => {
            const isCenter = position === "center";
            const isSide = position !== "center";

            return (
              <motion.article
                key={`${testimonial.name}-${position}`}
                initial={false}
                animate={{
                  opacity: 1,
                }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-900/[0.08] bg-white pt-9 shadow-[0_24px_48px_rgb(4_28_49/0.08)] transition-all   ${
                  isCenter ? "z-20" : "z-10"
                } ${isSide ? "lg:mt-8" : ""}`}
              >
                <div className="px-9">
                  <div className="font-heading text-6xl leading-none text-blue-700/15">
                    <CmsText id="SuccessStories.8a331fdde703">"</CmsText>
                  </div>
                  <p className="mt-2 text-[15px] italic leading-[1.85] text-neutral-600 ">
                    {testimonial.quote}
                  </p>
                  <div className="mt-7 flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.color} type-h3 text-[1.0625rem] text-white`}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="type-h3 text-[1.0625rem] text-neutral-900 ">
                        {testimonial.name}
                      </div>
                      <div className="text-[13px] font-medium text-blue-700 ">
                        {testimonial.destination}
                      </div>
                      <div className="text-[12px] text-neutral-500 ">{testimonial.year}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5 text-blue-600">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-7 bg-gradient-to-r from-blue-600 to-blue-900 px-9 py-4 text-center text-sm font-medium text-white">
                  {testimonial.outcome}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
