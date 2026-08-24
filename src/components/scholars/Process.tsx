import { Reveal, RevealStagger, StaggerItem } from "./Reveal";
import { PROCESS } from "@/lib/scholars-data";
import { ScholarIcon } from "./ScholarIcon";

export function Process() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-sky">How It Works</span>
          <h2 className="mt-4 font-display text-[clamp(2rem,3.5vw,3rem)] font-extrabold text-navy">
            From conversation to acceptance.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-slate-600">
            A six-step path designed to take the chaos out of admissions — and replace it with structure, strategy, and momentum.
          </p>
        </Reveal>

        <div className="relative mt-20">
          {/* Vertical timeline line */}
          <div className="absolute left-6 top-0 hidden h-full w-px border-l-2 border-dashed border-sky/30 md:block md:left-1/2" />

          <RevealStagger className="space-y-10 md:space-y-16">
            {PROCESS.map((step, i) => (
              <StaggerItem key={step.n}>
                <div className={`relative flex flex-col gap-6 md:grid md:grid-cols-2 md:items-center md:gap-12 ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}>
                  <div className={`md:[direction:ltr] ${i % 2 === 1 ? "md:text-right" : "md:text-left"} pl-20 md:pl-0`}>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-tint text-sky-deep">
                      <ScholarIcon name={step.icon} className="h-6 w-6" />
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold text-navy">
                      Step {step.n}: {step.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{step.desc}</p>
                  </div>
                  <div className="hidden md:block" />

                  {/* Number circle on timeline */}
                  <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-sky font-display text-lg font-extrabold text-white shadow-[0_0_0_6px_rgba(14,165,233,0.15)] md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
                    {step.n}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </RevealStagger>
        </div>
      </div>
    </section>
  );
}
