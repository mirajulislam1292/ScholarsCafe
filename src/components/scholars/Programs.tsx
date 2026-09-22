import { Reveal, RevealStagger, StaggerItem } from "./Reveal";
import { PROGRAMS, WA_LINK } from "@/lib/scholars-data";
import { Check, ArrowRight, Star } from "lucide-react";
import { ScholarIcon } from "./ScholarIcon";

export function Programs() {
  return (
    <section id="programs" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-sky">Our Tracks</span>
          <h2 className="mt-4 font-display text-[clamp(2rem,3.5vw,3rem)] font-extrabold text-navy">
            Choose Your Path to the World
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-slate-600">
            Whether you're chasing full scholarships or standard admission, we have a structured,
            mentor-led program built around your goals.
          </p>
        </Reveal>

        <RevealStagger className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PROGRAMS.map((p) => (
            <StaggerItem key={p.id} className={p.featured ? "lg:scale-[1.03]" : ""}>
              <div
                className={`relative flex h-full flex-col rounded-3xl p-9 transition-all duration-300 hover:-translate-y-2 ${
                  p.featured
                    ? "border-2 border-gold bg-navy text-white shadow-2xl shadow-navy/20"
                    : "border border-border bg-white shadow-card hover:shadow-card-hover"
                }`}
              >
                <div
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    p.featured
                      ? "border-gold/40 bg-gold/15 text-gold"
                      : "border-sky/30 bg-sky/10 text-sky-deep"
                  }`}
                >
                  {p.featured && <Star className="h-3 w-3 fill-current" aria-hidden />}
                  {p.badge}
                </div>
                <div className="mt-6">
                  <ScholarIcon
                    name={p.icon}
                    className={`h-14 w-14 ${p.featured ? "text-gold" : "text-sky-deep"}`}
                    strokeWidth={1.5}
                  />
                </div>
                <h3
                  className={`mt-4 font-display text-2xl font-extrabold ${p.featured ? "text-white" : "text-navy"}`}
                >
                  {p.title}
                </h3>
                <p className={`mt-2 text-sm ${p.featured ? "text-white/50" : "text-slate-500"}`}>
                  {p.price}
                </p>
                <p
                  className={`mt-5 text-[15px] leading-relaxed ${p.featured ? "text-white/80" : "text-slate-600"}`}
                >
                  {p.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[14px]">
                      <span
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                          p.featured ? "bg-sky text-white" : "bg-sky-tint text-sky-deep"
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className={p.featured ? "text-white/85" : "text-slate-700"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                    p.featured
                      ? "bg-sky text-white hover:bg-sky-light hover:text-navy"
                      : "bg-navy text-white hover:bg-sky"
                  }`}
                >
                  {p.cta} <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </StaggerItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
