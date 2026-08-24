import { Reveal, RevealStagger, StaggerItem } from "./Reveal";
import { VALUES, TEAM } from "@/lib/scholars-data";
import { ArrowRight, Target } from "lucide-react";
import { ScholarIcon } from "./ScholarIcon";

export function About() {
  return (
    <section id="about" className="bg-dark-gradient py-24 text-white md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[5fr_6fr]">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-sky-light">Who We Are</span>
            <h2 className="mt-4 font-display text-[clamp(2rem,3.5vw,3rem)] font-extrabold leading-[1.1]">
              Built by Students,<br /> For Students.
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-[1.85] text-white/75">
              <p>
                Scholars Cafe is a Bangladeshi study abroad consultancy with one unwavering mission: to make world-class international education genuinely accessible to every deserving student — regardless of financial background or family connections.
              </p>
              <p>
                We know exactly what Bangladeshi students face. Complex application portals in English. Financial aid forms that require documents you've never heard of. Confusing test requirements. Essay prompts that ask you to "be yourself" without any guidance on what that means. We've been there — and we built Scholars Cafe to be the guide we wished we had.
              </p>
              <p>
                Our team is passionate, experienced, and entirely student-first. We don't just process applications — we build relationships, strategies, and futures.
              </p>
            </div>

            <div className="mt-7 rounded-2xl border-l-4 border-sky bg-sky/10 p-6">
              <div className="flex gap-3 text-[15px] leading-relaxed text-white/85">
                <Target className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-light" strokeWidth={2} aria-hidden />
                <div>
                  <span className="font-bold">Our mission:</span> To empower every Bangladeshi student with the mentorship, strategy, and resources to unlock world-class international education — from their first SAT session to their visa approval day.
                </div>
              </div>
            </div>
          </Reveal>

          <RevealStagger className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="h-full rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-sky/50 hover:bg-white/10">
                  <ScholarIcon name={v.icon} className="h-8 w-8 text-sky-light" strokeWidth={1.5} />
                  <h3 className="mt-4 font-display text-lg font-bold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </RevealStagger>
        </div>

        {/* Team */}
        <div className="mt-24">
          <Reveal className="text-center">
            <h3 className="font-display text-3xl font-extrabold">Meet the Team</h3>
            <p className="mt-2 text-sky-light">Real people. Real experience. Genuinely here for you.</p>
          </Reveal>
          <RevealStagger className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((m) => (
              <StaggerItem key={m.name}>
                <div className="h-full rounded-2xl border border-white/12 bg-white/5 p-6 text-center backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-sky/40">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky to-midnight font-display text-xl font-extrabold">
                    {m.initials}
                  </div>
                  <div className="mt-4 font-display text-lg font-bold">{m.name}</div>
                  <div className="text-[13px] font-semibold text-sky-light">{m.role}</div>
                  <p className="mt-3 text-[13px] leading-relaxed text-white/65">{m.bio}</p>
                </div>
              </StaggerItem>
            ))}
            <StaggerItem className="sm:col-span-2 lg:col-span-4">
              <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-white/20 p-8 text-center md:flex-row md:justify-between md:text-left">
                <div>
                  <div className="font-display text-lg font-bold">Join Our Team</div>
                  <p className="mt-1 text-sm text-white/60">We're hiring — see open roles and help build the future of Bangladeshi study abroad.</p>
                </div>
                <a className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0284c7] md:mt-0" href="#contact">
                  Apply <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </StaggerItem>
          </RevealStagger>
        </div>
      </div>
    </section>
  );
}
