import {useCmsLookup} from "@/lib/cms";
import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WA_LINK as CMS_DEFAULT_WA_LINK } from "@/lib/scholars-data";

const DEFAULT_NAV = [
  { label: "Home", href: "#top" },
  { label: "Programs", href: "#programs" },
  { label: "Destinations", href: "#destinations" },
  { label: "Services", href: "#services" },
  { label: "Resources", href: "#resources" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
 const cmsLabel = useCmsLookup();

  const NAV = useCmsValue('local.NAV',DEFAULT_NAV);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80 || window.location.pathname !== "/");
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[1000] transition-all duration-300 ${
          scrolled ? "glass-nav shadow-nav h-[64px]" : "bg-white/95 h-[72px] border-b border-sky/10"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-5 md:px-8">
          <button type="button" onClick={scrollToTop} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover" aria-label="Scholars Cafe home">
            <span className="brand-mark" aria-hidden="true" />
          </button>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`group relative text-[15px] font-medium transition-colors ${
                  "text-navy/70 hover:text-sky"
                }`}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-sky transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-sky px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#0284c7] hover:shadow-button md:inline-flex"
            >
              <Phone className="h-4 w-4" /><CmsText id="Navbar.33b0f3e06600"> Book a Free Call
            </CmsText></a>
            <button
              onClick={() => setOpen(true)}
              aria-label={cmsLabel("Navbar.label.99af6606ff9d","Menu")}
              className="text-navy lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[2000] bg-sky-soft p-6 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <button onClick={scrollToTop} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-card" aria-label="Scholars Cafe home"><span className="brand-mark" aria-hidden="true" /></button>
              <button onClick={() => setOpen(false)} aria-label={cmsLabel("Navbar.label.7d9eb7acb13e","Close")} className="text-navy"><X className="h-7 w-7" /></button>
            </div>
            <nav className="mt-12 flex flex-col gap-6">
              {NAV.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i }}
                  className="text-2xl font-semibold text-navy transition-colors hover:text-sky"
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>
            <div className="absolute inset-x-6 bottom-10 flex gap-3">
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full bg-whatsapp py-3 text-center font-semibold text-white"><CmsText id="Navbar.6a40edf1fc87">WhatsApp</CmsText></a>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full bg-sky py-3 text-center font-semibold text-white"><CmsText id="Navbar.b2151df99763">Book Call</CmsText></a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const WA_LINK = CMS_DEFAULT_WA_LINK;
