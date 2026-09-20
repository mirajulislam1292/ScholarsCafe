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
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[1000] transition-all duration-300 ${
          scrolled ? "glass-nav shadow-nav h-[64px]" : "bg-transparent h-[72px]"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-5 md:px-8">
          <button type="button" onClick={scrollToTop} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M12 2L3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M8 11l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display text-xl font-extrabold">
              <span className={scrolled ? "text-navy" : "text-white"}><CmsText id="Navbar.05d3d9ddab08">Scholars</CmsText></span>
              <span className="text-sky"><CmsText id="Navbar.0d5f2e74a9f6"> Cafe</CmsText></span>
            </span>
          </button>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`group relative text-[15px] font-medium transition-colors ${
                  scrolled ? "text-slate-600 hover:text-navy" : "text-white/85 hover:text-white"
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
              className={`lg:hidden ${scrolled ? "text-navy" : "text-white"}`}
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
            className="fixed inset-0 z-[2000] bg-navy-deep p-6 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <button onClick={scrollToTop} className="font-display text-2xl text-white"><CmsText id="Navbar.05d3d9ddab08">
                Scholars </CmsText><span className="text-sky"><CmsText id="Navbar.0d5f2e74a9f6">Cafe</CmsText></span>
              </button>
              <button onClick={() => setOpen(false)} aria-label={cmsLabel("Navbar.label.7d9eb7acb13e","Close")} className="text-white"><X className="h-7 w-7" /></button>
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
                  className="text-2xl font-semibold text-white"
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
