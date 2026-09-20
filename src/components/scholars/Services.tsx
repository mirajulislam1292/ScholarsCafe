import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { Reveal, RevealStagger, StaggerItem } from "./Reveal";
import { SERVICES as CMS_DEFAULT_SERVICES } from "@/lib/scholars-data";
import { ScholarIcon } from "./ScholarIcon";

export function Services() {
  const SERVICES = useCmsValue("data.SERVICES", CMS_DEFAULT_SERVICES);

  return (
    <section id="services" className="bg-[#F8FAFC] py-24 md:py-32 dark:bg-navy-deep">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-sky"><CmsText id="Services.6fc361952438">Individual Services</CmsText></span>
          <h2 className="mt-4 font-display text-[clamp(2rem,3.5vw,3rem)] font-extrabold text-navy dark:text-white"><CmsText id="Services.7eaa4eb59048">
            Every piece of the journey, handled.
          </CmsText></h2>
          <p className="mt-5 text-[17px] leading-relaxed text-slate-600 dark:text-white/72"><CmsText id="Services.1d120c350141">
            Pick exactly the support you need. Our individual services let you plug expert help in wherever the road feels uncertain.
          </CmsText></p>
        </Reveal>

        <RevealStagger className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <StaggerItem key={s.title}>
              <div className="group h-full rounded-2xl border border-border bg-white p-6 transition-all hover:-translate-y-1.5 hover:border-sky hover:shadow-card-hover dark:border-white/10 dark:bg-white/6 dark:hover:border-sky/70">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-tint text-sky-deep transition-transform group-hover:scale-110 dark:bg-white/10 dark:text-sky-light">
                  <ScholarIcon name={s.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-navy dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-white/72">{s.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

const SERVICES = CMS_DEFAULT_SERVICES;
