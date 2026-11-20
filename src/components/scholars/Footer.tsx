import { useCmsLookup, useCmsAuto } from "@/lib/cms";
import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { EMAIL as CMS_DEFAULT_EMAIL, BOOK_LINK, STUDENT_PORTAL_URL } from "@/lib/scholars-data";
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEnabledCountries } from "@/lib/site-content";

type LinkRef = {
  label: string;
  href: string;
  external?: boolean;
  route?: "/privacy" | "/terms" | "/cookies";
};

export function Footer() {
  const countries = useEnabledCountries();
  const cmsLabel = useCmsLookup();

  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);

  return (
    <footer className="border-t border-white/8 bg-navy-deep text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-12 md:py-16">
        <div className="grid grid-cols-2 gap-x-10 gap-y-8 md:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="brand-mark" aria-hidden="true" />
              <span className="footer-brand font-display text-xl font-medium">
                <CmsText id="Footer.c9db85fc4db0">ScholarsCafe</CmsText>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              <CmsText id="Footer.ecef8dd200d7">
                Your gateway to global education. Scholars Cafe is Bangladesh's dedicated study
                abroad consultancy, helping ambitious students reach their dream universities
                worldwide.
              </CmsText>
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <FootIcon
                label="Facebook"
                href="https://www.facebook.com/profile.php?id=61571394902795"
              >
                <Facebook className="h-4 w-4" />
              </FootIcon>
              <FootIcon label="Instagram" href="https://www.instagram.com/scholars_cafe_/">
                <Instagram className="h-4 w-4" />
              </FootIcon>
              <FootIcon label="LinkedIn" href="https://www.linkedin.com/company/scholars-cafe09/">
                <Linkedin className="h-4 w-4" />
              </FootIcon>
              <a
                href={`mailto:${EMAIL}`}
                className="flex h-9 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-medium text-white/70 transition-colors hover:bg-white/10"
              >
                <Mail className="h-4 w-4" /> {EMAIL}
              </a>
            </div>
          </div>

          <Col
            title={cmsLabel("Footer.label.b6747064b2a6", "Programs")}
            links={[
              { label: "General Admission Track", href: "/programs" },
              { label: "File Opening Service", href: "/programs" },
            ]}
          />
          <Col
            title={cmsLabel("Footer.label.72eb63f032e4", "Destinations")}
            links={countries.map((c) => ({ label: c, href: "/#destinations" }))}
          />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-10 gap-y-8 border-t border-white/7 pt-8 md:grid-cols-4">
          <Col
            title={cmsLabel("Footer.label.de4743c87973", "Company")}
            links={[
              { label: "About Us", href: "/about" },
              { label: "Success Stories", href: "/#success" },
              { label: "Free Resources", href: "/resources" },
              { label: "Contact Us", href: "/contact" },
            ]}
          />
          <Col
            title={cmsLabel("Footer.label.e89b30aa1dc3", "Resources")}
            links={[
              { label: "Knowledge Hub", href: "/resources" },
              { label: "FAQ", href: "/resources#faq" },
              { label: "Newsletter", href: "/resources#newsletter" },
            ]}
          />
          <Col
            title={cmsLabel("Footer.label.be91940b79f4", "Support")}
            links={[
              { label: "Student Login", href: STUDENT_PORTAL_URL },
              { label: "Forms", href: "/forms" },
              { label: "Book a mentor session", href: BOOK_LINK },
              { label: "Email Support", href: `mailto:${EMAIL}`, external: true },
              { label: "Contact Form", href: "/contact" },
            ]}
          />
          <Col
            title={cmsLabel("Footer.label.4787eaf7c938", "Legal")}
            links={[
              { label: "Privacy Policy", href: "/privacy", route: "/privacy" },
              { label: "Terms of Service", href: "/terms", route: "/terms" },
              { label: "Cookie Notice", href: "/cookies", route: "/cookies" },
            ]}
          />
        </div>
      </div>

      <div className="border-t border-white/7">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-6 py-6 text-[13px] text-white/40 md:flex-row md:px-12">
          <div className="flex items-center gap-1.5 text-[13px] text-white/40">
            <span>
              <CmsText id="Footer.0a79b0ca699d">© </CmsText>
              {new Date().getFullYear()}
              <CmsText id="Footer.284e1c10b562"> Scholars Cafe. All rights reserved.</CmsText>
            </span>
          </div>
          <div className="flex gap-5">
            <Link to="/privacy" className="transition-colors hover:text-white">
              <CmsText id="Footer.54a57c3147c4">Privacy</CmsText>
            </Link>
            <Link to="/terms" className="transition-colors hover:text-white">
              <CmsText id="Footer.ede548996483">Terms</CmsText>
            </Link>
            <Link to="/cookies" className="transition-colors hover:text-white">
              <CmsText id="Footer.141395eb3556">Cookies</CmsText>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, links }: { title: string; links: LinkRef[] }) {
  const t = useCmsAuto("Footer.link");
  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);

  return (
    <div>
      <div className="font-display text-sm font-medium uppercase tracking-wider text-white">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5 text-sm text-white/55">
        {links.map((l) => (
          <li key={l.label}>
            {l.route ? (
              <Link to={l.route} className="transition-colors hover:text-sky-light">
                {t(l.label)}
              </Link>
            ) : (
              <a
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
                className="transition-colors hover:text-sky-light"
              >
                {t(l.label)}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FootIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);

  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition-all hover:border-sky hover:bg-sky hover:text-white"
    >
      {children}
    </a>
  );
}

const EMAIL = CMS_DEFAULT_EMAIL;
