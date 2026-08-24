import { EMAIL, WA_LINK } from "@/lib/scholars-data";
import { Facebook, Instagram, Linkedin, Mail, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";

type LinkRef = { label: string; href: string; external?: boolean; route?: "/privacy" | "/terms" | "/cookies" };

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-navy-deep text-white">
      <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="M12 2L3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M8 11l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-display text-xl font-extrabold">
                Scholars <span className="text-sky">Cafe</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              Your gateway to global education. Scholars Cafe is Bangladesh's dedicated study abroad consultancy — helping ambitious students reach their dream universities worldwide.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <FootIcon href="https://www.facebook.com/profile.php?id=61571394902795"><Facebook className="h-4 w-4" /></FootIcon>
              <FootIcon href="https://www.instagram.com/scholars_cafe_/"><Instagram className="h-4 w-4" /></FootIcon>
              <FootIcon href="https://www.linkedin.com/company/scholars-cafe09/"><Linkedin className="h-4 w-4" /></FootIcon>
              <FootIcon href={WA_LINK}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487 2.981 1.287 2.981.858 3.518.804.537-.054 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413"/></svg>
              </FootIcon>
              <a href={`mailto:${EMAIL}`} className="flex h-9 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-medium text-white/70 transition-colors hover:bg-white/10">
                <Mail className="h-4 w-4" /> {EMAIL}
              </a>
            </div>
          </div>

          <Col
            title="Programs"
            links={[
              { label: "Full Scholarship Track", href: "/#programs" },
              { label: "General Admission Track", href: "/#programs" },
              { label: "File Opening Service", href: "/#programs" },
              { label: "SAT Preparation", href: "/#test-prep" },
              { label: "IELTS / TOEFL / DET", href: "/#test-prep" },
            ]}
          />
          <Col
            title="Destinations"
            links={[
              { label: "🇺🇸 USA (Primary)", href: "/#destinations" },
              { label: "🇬🇧 United Kingdom", href: "/#world-map" },
              { label: "🇨🇦 Canada", href: "/#world-map" },
              { label: "🇩🇪 Germany", href: "/#world-map" },
              { label: "🇸🇪 Sweden", href: "/#world-map" },
              { label: "🇰🇷 South Korea", href: "/#world-map" },
              { label: "Explore world map →", href: "/#world-map" },
            ]}
          />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-10 border-t border-white/7 pt-10 md:grid-cols-4">
          <Col
            title="Company"
            links={[
              { label: "About Us", href: "/#about" },
              { label: "Success Stories", href: "/#stories" },
              { label: "Free Resources", href: "/#resources" },
              { label: "Contact Us", href: "/#contact" },
            ]}
          />
          <Col
            title="Resources"
            links={[
              { label: "Knowledge Hub", href: "/#resources" },
              { label: "FAQ", href: "/#faq" },
              { label: "Newsletter", href: "/#newsletter" },
            ]}
          />
          <Col
            title="Support"
            links={[
              { label: "WhatsApp Support", href: WA_LINK, external: true },
              { label: "Email Support", href: `mailto:${EMAIL}`, external: true },
              { label: "Contact Form", href: "/#contact" },
            ]}
          />
          <Col
            title="Legal"
            links={[
              { label: "Privacy Policy", href: "/privacy", route: "/privacy" },
              { label: "Terms of Service", href: "/terms", route: "/terms" },
              { label: "Cookie Notice", href: "/cookies", route: "/cookies" },
            ]}
          />
        </div>
      </div>

      <div className="border-t border-white/7">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-5 py-7 text-[13px] text-white/40 md:flex-row md:px-8">
          <div className="flex items-center gap-1.5 text-[13px] text-white/40">
            <span>© {new Date().getFullYear()} Scholars Cafe. All rights reserved. Made with</span>
            <Heart className="inline h-3.5 w-3.5 fill-rose-400 text-rose-400" aria-hidden />
            <span>in Bangladesh.</span>
          </div>
          <div className="flex gap-5">
            <Link to="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-white">Terms</Link>
            <Link to="/cookies" className="transition-colors hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, links }: { title: string; links: LinkRef[] }) {
  return (
    <div>
      <div className="font-display text-sm font-bold uppercase tracking-wider text-white">{title}</div>
      <ul className="mt-4 space-y-2.5 text-sm text-white/55">
        {links.map((l) => (
          <li key={l.label}>
            {l.route ? (
              <Link to={l.route} className="transition-colors hover:text-sky-light">{l.label}</Link>
            ) : (
              <a
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
                className="transition-colors hover:text-sky-light"
              >
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FootIcon({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition-all hover:border-sky hover:bg-sky hover:text-white"
    >
      {children}
    </a>
  );
}
