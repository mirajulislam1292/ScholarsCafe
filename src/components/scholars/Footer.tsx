import {useCmsLookup} from "@/lib/cms";
import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { EMAIL as CMS_DEFAULT_EMAIL, WA_LINK as CMS_DEFAULT_WA_LINK } from "@/lib/scholars-data";
import { Facebook, Instagram, Linkedin, Mail, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";

type LinkRef = { label: string; href: string; external?: boolean; route?: "/privacy" | "/terms" | "/cookies" };

export function Footer() {
 const cmsLabel = useCmsLookup();

  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  return (
    <footer className="border-t border-white/8 bg-navy-deep text-white">
      <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="brand-mark" aria-hidden="true" />
              <span className="font-display text-xl font-extrabold"><CmsText id="Footer.05d3d9ddab08">
                Scholars </CmsText><span className="text-sky"><CmsText id="Footer.0d5f2e74a9f6">Cafe</CmsText></span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55"><CmsText id="Footer.ecef8dd200d7">
              Your gateway to global education. Scholars Cafe is Bangladesh's dedicated study abroad consultancy, helping ambitious students reach their dream universities worldwide.
            </CmsText></p>
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
            title={cmsLabel("Footer.label.b6747064b2a6","Programs")}
            links={[
              { label: cmsLabel("Footer.label.9239a782b606","Full Scholarship Track"), href: "/#programs" },
              { label: cmsLabel("Footer.label.b11052be997a","General Admission Track"), href: "/#programs" },
              { label: cmsLabel("Footer.label.536ee868d5e7","File Opening Service"), href: "/#programs" },
            ]}
          />
          <Col
            title={cmsLabel("Footer.label.72eb63f032e4","Destinations")}
            links={[
              { label: cmsLabel("Footer.label.8a9576229c91","🇺🇸 USA (Primary)"), href: "/#destinations" },
              { label: cmsLabel("Footer.label.08f913495af3","🇬🇧 United Kingdom"), href: "/#world-map" },
              { label: cmsLabel("Footer.label.a445c4590f06","🇨🇦 Canada"), href: "/#world-map" },
              { label: cmsLabel("Footer.label.3b7f64b10597","🇩🇪 Germany"), href: "/#world-map" },
              { label: cmsLabel("Footer.label.7d3af89d24d2","🇸🇪 Sweden"), href: "/#world-map" },
              { label: cmsLabel("Footer.label.845cdc6f102d","🇰🇷 South Korea"), href: "/#world-map" },
              { label: cmsLabel("Footer.label.49978ec74aef","Explore world map →"), href: "/#world-map" },
            ]}
          />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-10 border-t border-white/7 pt-10 md:grid-cols-4">
          <Col
            title={cmsLabel("Footer.label.de4743c87973","Company")}
            links={[
              { label: cmsLabel("Footer.label.5d8c71abc527","About Us"), href: "/#about" },
              { label: cmsLabel("Footer.label.3c9bcaeff941","Success Stories"), href: "/#stories" },
              { label: cmsLabel("Footer.label.39b08fb6b8d2","Free Resources"), href: "/#resources" },
              { label: cmsLabel("Footer.label.98b67063cf8e","Contact Us"), href: "/#contact" },
            ]}
          />
          <Col
            title={cmsLabel("Footer.label.e89b30aa1dc3","Resources")}
            links={[
              { label: cmsLabel("Footer.label.6dee457e49da","Knowledge Hub"), href: "/#resources" },
              { label: cmsLabel("Footer.label.dbc468a14b60","FAQ"), href: "/#faq" },
              { label: cmsLabel("Footer.label.f84ca2e7716b","Newsletter"), href: "/#newsletter" },
            ]}
          />
          <Col
            title={cmsLabel("Footer.label.be91940b79f4","Support")}
            links={[
              { label: cmsLabel("Footer.label.b5604c3ed574","WhatsApp Support"), href: WA_LINK, external: true },
              { label: cmsLabel("Footer.label.79bed99f1f74","Email Support"), href: `mailto:${EMAIL}`, external: true },
              { label: cmsLabel("Footer.label.5641d7b645e1","Contact Form"), href: "/#contact" },
            ]}
          />
          <Col
            title={cmsLabel("Footer.label.4787eaf7c938","Legal")}
            links={[
              { label: cmsLabel("Footer.label.506ff3946215","Privacy Policy"), href: "/privacy", route: "/privacy" },
              { label: cmsLabel("Footer.label.4afa55bf7aec","Terms of Service"), href: "/terms", route: "/terms" },
              { label: cmsLabel("Footer.label.eb095f90a1f1","Cookie Notice"), href: "/cookies", route: "/cookies" },
            ]}
          />
        </div>
      </div>

      <div className="border-t border-white/7">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-5 py-7 text-[13px] text-white/40 md:flex-row md:px-8">
          <div className="flex items-center gap-1.5 text-[13px] text-white/40">
            <span><CmsText id="Footer.0a79b0ca699d">© </CmsText>{new Date().getFullYear()}<CmsText id="Footer.7d32fd93da7c"> Scholars Cafe. All rights reserved. Made with</CmsText></span>
            <Heart className="inline h-3.5 w-3.5 fill-rose-400 text-rose-400" aria-hidden />
            <span><CmsText id="Footer.66c9cc3a6577">in Bangladesh.</CmsText></span>
          </div>
          <div className="flex gap-5">
            <Link to="/privacy" className="transition-colors hover:text-white"><CmsText id="Footer.54a57c3147c4">Privacy</CmsText></Link>
            <Link to="/terms" className="transition-colors hover:text-white"><CmsText id="Footer.ede548996483">Terms</CmsText></Link>
            <Link to="/cookies" className="transition-colors hover:text-white"><CmsText id="Footer.141395eb3556">Cookies</CmsText></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, links }: { title: string; links: LinkRef[] }) {
  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

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
  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

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

const EMAIL = CMS_DEFAULT_EMAIL;
const WA_LINK = CMS_DEFAULT_WA_LINK;
