import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { useState } from "react";
import { Reveal } from "./Reveal";
import { FAQS as CMS_DEFAULT_FAQS, WA_LINK as CMS_DEFAULT_WA_LINK, EMAIL as CMS_DEFAULT_EMAIL } from "@/lib/scholars-data";
import { Plus, Mail, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function FAQ() {
  const FAQS = useCmsValue("data.FAQS", CMS_DEFAULT_FAQS);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);
  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);

  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-sky"><CmsText id="FAQ.4e9f48728271">Got Questions?</CmsText></span>
          <h2 className="mt-4 font-display text-[clamp(2rem,3.5vw,3rem)] font-extrabold text-navy"><CmsText id="FAQ.a3d458e1bd1e">
            Frequently Asked Questions
          </CmsText></h2>
          <p className="mt-5 text-[17px] leading-relaxed text-slate-600"><CmsText id="FAQ.cffc4c5054c6">
            Everything you want to know, answered honestly.
          </CmsText></p>
        </Reveal>

        <Reveal className="mx-auto mt-12 max-w-3xl">
          <div className="divide-y divide-border rounded-2xl border border-border bg-white">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} className={isOpen ? "bg-sky-deep" : ""}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-display text-[16px] font-bold text-navy">{f.q}</span>
                    <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky/10 text-sky transition-transform ${isOpen ? "rotate-45" : ""}`}>
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 text-[15px] leading-[1.85] text-white/85">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-slate-500"><CmsText id="FAQ.6089a8bb7c64">Still have questions?</CmsText></span>
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-all hover:bg-navy hover:text-white"
          >
            <Mail className="h-4 w-4" aria-hidden /><CmsText id="FAQ.d9172c43bec6">
            Email us
          </CmsText></a>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-sky px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#335579]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden /><CmsText id="FAQ.13cd408610e3">
            WhatsApp us
          </CmsText></a>
        </Reveal>
      </div>
    </section>
  );
}

const FAQS = CMS_DEFAULT_FAQS;
const WA_LINK = CMS_DEFAULT_WA_LINK;
const EMAIL = CMS_DEFAULT_EMAIL;
