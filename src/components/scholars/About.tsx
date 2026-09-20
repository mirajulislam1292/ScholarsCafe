import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { Reveal, RevealStagger, StaggerItem } from "./Reveal";
import { VALUES as CMS_DEFAULT_VALUES, TEAM as DEFAULT_TEAM } from "@/lib/scholars-data";
import { useCmsCollection } from "@/lib/cms";
import { ArrowRight, Target } from "lucide-react";
import { ScholarIcon } from "./ScholarIcon";

export function About() {
  const VALUES = useCmsValue("data.VALUES", CMS_DEFAULT_VALUES);

  const TEAM = useCmsCollection('mentors', DEFAULT_TEAM.filter(m=>m.role!=='Test Prep Lead').map(m=>({...m,photo:''})), data => data as typeof DEFAULT_TEAM[number] & {photo:string});
  return (
    <section id="about" className="bg-white py-24 text-navy md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[5fr_6fr]">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-sky"><CmsText id="About.10a516acef81">Who We Are</CmsText></span>
            <h2 className="mt-4 font-display text-[clamp(2rem,3.5vw,3rem)] font-extrabold leading-[1.1]"><CmsText id="About.8bdc46e618ce">
              Built by Students,</CmsText><br /><CmsText id="About.6aa9f10fe080"> For Students.
            </CmsText></h2>
            <div className="mt-6 space-y-4 text-[15px] leading-[1.85] text-navy/70">
              <p><CmsText id="About.a179d3cbbe8a">
                Scholars Cafe is a Bangladeshi study abroad consultancy with one unwavering mission: to make world-class international education genuinely accessible to every deserving student, regardless of financial background or family connections.
              </CmsText></p>
              <p><CmsText id="About.11528efd2a1c">
                We know exactly what Bangladeshi students face. Complex application portals in English. Financial aid forms that require documents you've never heard of. Confusing test requirements. Essay prompts that ask you to "be yourself" without any guidance on what that means. We've been there, and we built Scholars Cafe to be the guide we wished we had.
              </CmsText></p>
              <p><CmsText id="About.a025ca48fcc6">
                Our team is passionate, experienced, and entirely student-first. We don't just process applications. We build relationships, strategies, and futures.
              </CmsText></p>
            </div>

            <div className="mt-7 rounded-2xl border-l-4 border-sky bg-sky/10 p-6">
              <div className="flex gap-3 text-[15px] leading-relaxed text-navy/80">
                <Target className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky" strokeWidth={2} aria-hidden />
                <div>
                  <span className="font-bold"><CmsText id="About.b3bb760b6a9d">Our mission:</CmsText></span><CmsText id="About.ca4646eca668"> To empower every Bangladeshi student with the mentorship, strategy, and resources to unlock world-class international education, from their first consultation to their visa approval day.
                </CmsText></div>
              </div>
            </div>
          </Reveal>

          <RevealStagger className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="h-full rounded-2xl border border-sky/15 bg-sky-soft p-6 transition-all hover:-translate-y-1 hover:border-sky/50 hover:bg-white hover:shadow-card-hover">
                  <ScholarIcon name={v.icon} className="h-8 w-8 text-sky" strokeWidth={1.5} />
                  <h3 className="mt-4 font-display text-lg font-bold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy/70">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </RevealStagger>
        </div>

        {/* Team */}
        <div className="mt-24">
          <Reveal className="text-center">
            <h3 className="font-display text-3xl font-extrabold"><CmsText id="About.72271dec619e">Meet the Team</CmsText></h3>
            <p className="mt-2 text-sky"><CmsText id="About.018115599b07">Real people. Real experience. Genuinely here for you.</CmsText></p>
          </Reveal>
          <RevealStagger className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((m) => (
              <StaggerItem key={m.name}>
                <div className="h-full rounded-2xl border border-sky/15 bg-sky-soft p-6 text-center transition-all hover:-translate-y-1 hover:border-sky/40 hover:bg-white hover:shadow-card-hover">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky font-display text-xl font-extrabold text-white">
                    {m.photo ? <img src={m.photo} alt={m.name} className="h-full w-full rounded-full object-cover" loading="lazy" /> : m.initials}
                  </div>
                  <div className="mt-4 font-display text-lg font-bold">{m.name}</div>
                  <div className="text-[13px] font-semibold text-sky">{m.role}</div>
                  <p className="mt-3 text-[13px] leading-relaxed text-navy/65">{m.bio}</p>
                </div>
              </StaggerItem>
            ))}
            <StaggerItem className="sm:col-span-2 lg:col-span-4">
              <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-sky/25 bg-sky-soft p-8 text-center md:flex-row md:justify-between md:text-left">
                <div>
                  <div className="font-display text-lg font-bold"><CmsText id="About.9d698add0344">Join Our Team</CmsText></div>
                  <p className="mt-1 text-sm text-navy/60"><CmsText id="About.ca0ddff4273e">We're hiring. See open roles and help build the future of Bangladeshi study abroad.</CmsText></p>
                </div>
                <a className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0284c7] md:mt-0" href="#contact"><CmsText id="About.31e392d1c037">
                  Apply </CmsText><ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </StaggerItem>
          </RevealStagger>
        </div>
      </div>
    </section>
  );
}

const VALUES = CMS_DEFAULT_VALUES;
