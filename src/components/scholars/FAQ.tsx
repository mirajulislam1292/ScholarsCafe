import { useCmsList } from "@/lib/cms";
import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { useState } from "react";
import { Reveal } from "./Reveal";
import { FAQS as CMS_DEFAULT_FAQS, EMAIL as CMS_DEFAULT_EMAIL } from "@/lib/scholars-data";
import { Plus, Mail, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function FAQ() {
  const FAQS = useCmsList("faqs", CMS_DEFAULT_FAQS);
  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);

  const [open, setOpen] = useState<number | null>(0);
  // FAQPage structured data from the same questions shown below, so search results can show them.
  const faqJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }).replace(/</g, "\\u003c");
  return (
    <section id="faq" className="bg-white section-y">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <Reveal className="max-w-2xl">
          <span className="hidden">
            <CmsText id="FAQ.4e9f48728271">Got Questions?</CmsText>
          </span>
          <h2 className="type-h2 text-neutral-900">
            <CmsText id="FAQ.a3d458e1bd1e">Frequently Asked Questions</CmsText>
          </h2>
          <p className="mt-5 type-lead text-neutral-600">
            <CmsText id="FAQ.cffc4c5054c6">Everything you want to know, answered honestly.</CmsText>
          </p>
        </Reveal>

        <Reveal className="section-body max-w-3xl">
          <div className="card-soft divide-y divide-border overflow-hidden">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-heading text-[16px] font-medium text-neutral-900">
                      {f.q}
                    </span>
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ice-100 text-blue-700 transition-transform ${isOpen ? "rotate-45" : ""}`}
                    >
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
                        <p className="type-body px-6 pb-7 pr-14 text-neutral-700">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal className="mt-8 flex max-w-3xl flex-wrap items-center gap-3">
          <span className="text-sm text-neutral-500">
            <CmsText id="FAQ.6089a8bb7c64">Still have questions?</CmsText>
          </span>
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-neutral-900/20 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-all hover:bg-blue-700 hover:text-white"
          >
            <Mail className="h-4 w-4" aria-hidden />
            <CmsText id="FAQ.d9172c43bec6">Email us</CmsText>
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-700 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-blue-800"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            <CmsText id="FAQ.contact">Contact us</CmsText>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

const FAQS = CMS_DEFAULT_FAQS;
const EMAIL = CMS_DEFAULT_EMAIL;
