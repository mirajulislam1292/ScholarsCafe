import { useCmsLookup, useCmsValue, CmsText } from "@/lib/cms";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BOOK_LINK, STUDENT_PORTAL_URL } from "@/lib/scholars-data";
import { RESOURCE_PAGES } from "./ResourcesNav";

const DEFAULT_NAV = [
  { label: "Home", href: "/" },
  { label: "Programs", href: "/programs" },
  { label: "Destinations", href: "/#destinations" },
  { label: "Services", href: "/services" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
const ease = [0.22, 1, 0.36, 1] as const;

export function Navbar() {
  const cmsLabel = useCmsLookup();
  const NAV = useCmsValue("local.NAV", DEFAULT_NAV);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[1000] transition-[background-color,border-color,backdrop-filter] duration-700 ease-premium ${
          solid
            ? "border-b border-neutral-900/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6 md:px-12">
          <a
            href="/"
            aria-label={cmsLabel("Navbar.label.7f7e5d138281", "Scholars Cafe home")}
            className="relative -m-2 grid h-12 w-12 place-items-center rounded-full"
          >
            <span
              aria-hidden
              className={`brand-mark h-8! w-9! transition-colors duration-700 ease-premium ${
                solid ? "bg-blue-700!" : "bg-ice-100!"
              }`}
            />
          </a>

          <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
            {NAV.filter((i) => i.href !== "/" && i.href !== "#top").map((item) => {
              const link = (
                <a
                  key={item.href}
                  href={item.href}
                  className={`type-nav transition-colors duration-500 ease-premium ${
                    solid
                      ? "text-neutral-600 hover:text-neutral-900"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              );
              if (item.href !== "/resources") return link;
              // Resources: its four sub-pages open below on hover or keyboard focus.
              return (
                <div key={item.href} className="group relative">
                  {link}
                  <div className="invisible absolute left-1/2 top-full z-10 w-60 -translate-x-1/2 pt-4 opacity-0 transition-opacity duration-300 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <ul className="rounded-2xl border border-neutral-900/[0.08] bg-white p-2 shadow-[0_24px_60px_rgb(15_40_70/0.12)]">
                      {RESOURCE_PAGES.map((p) => (
                        <li key={p.href}>
                          <a
                            href={p.href}
                            className="type-nav block rounded-xl px-4 py-2.5 text-neutral-700 hover:bg-ice-50 hover:text-neutral-900"
                          >
                            {cmsLabel("ResourcesHub." + p.id, p.label)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={STUDENT_PORTAL_URL}
              className={`inline-flex h-10 items-center whitespace-nowrap rounded-full px-4 type-button transition-colors duration-500 ease-premium ${
                solid
                  ? "text-neutral-700 ring-1 ring-neutral-900/15 hover:bg-neutral-100 hover:text-neutral-900"
                  : "text-white/85 ring-1 ring-white/20 hover:bg-white/10 hover:text-white"
              }`}
            >
              <CmsText id="Navbar.studentlogin">Student login</CmsText>
            </a>
            <a
              href={BOOK_LINK}
              className={`hidden h-10 items-center rounded-full px-5 type-button transition-colors duration-500 ease-premium md:inline-flex ${
                solid
                  ? "bg-blue-700 text-white hover:bg-blue-800"
                  : "bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md hover:bg-white/20"
              }`}
            >
              <CmsText id="Navbar.33b0f3e06600"> Book a Free Call</CmsText>
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={cmsLabel("Navbar.label.99af6606ff9d", "Menu")}
              aria-expanded={open}
              className={`grid h-11 w-11 place-items-center rounded-full transition-colors lg:hidden ${
                solid ? "text-neutral-900 hover:bg-neutral-100" : "text-white hover:bg-white/10"
              }`}
            >
              <span aria-hidden className="grid w-5 gap-[5px]">
                <span className="h-px w-full bg-current" />
                <span className="h-px w-full bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="fixed inset-0 z-[2000] flex flex-col overflow-y-auto bg-blue-950 px-6 pb-10 pt-4 text-white lg:hidden"
          >
            <div className="flex h-14 items-center justify-between">
              <span aria-hidden className="brand-mark h-8! w-9! bg-ice-100!" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={cmsLabel("Navbar.label.7d9eb7acb13e", "Close")}
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-14 flex flex-col">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.6, ease }}
                >
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 font-heading text-[2rem] font-light tracking-[-0.02em] text-white/90 hover:text-white"
                  >
                    {item.label}
                  </a>
                  {item.href === "/resources" && (
                    <div className="-mt-1 mb-2 flex flex-wrap gap-x-5 gap-y-1 pl-1">
                      {RESOURCE_PAGES.map((p) => (
                        <a
                          key={p.href}
                          href={p.href}
                          onClick={() => setOpen(false)}
                          className="type-nav py-1.5 text-ice-300 hover:text-white"
                        >
                          {cmsLabel("ResourcesHub." + p.id, p.label)}
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </nav>
            <a
              href={STUDENT_PORTAL_URL}
              className="mt-auto inline-flex h-12 items-center justify-center rounded-full type-button text-white ring-1 ring-white/25 hover:bg-white/10"
            >
              <CmsText id="Navbar.studentlogin.mobile">Student login</CmsText>
            </a>
            <a
              href={BOOK_LINK}
              className="mt-3 inline-flex h-12 items-center justify-center rounded-full bg-ice-100 type-button text-blue-950"
            >
              <CmsText id="Navbar.b2151df99763">Book Call</CmsText>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
