// Search and sharing tags for each page: canonical address, title/description, Open Graph and Twitter cards.
// Keep titles under ~60 characters and descriptions under ~155, describe the page honestly (no ranking or
// success claims we can't prove) and lead with what people actually search for.
import { EMAIL, PHONE, WA_LINK } from "@/lib/scholars-data";

export const SITE_URL = "https://scholarscafe.com";
const OG_IMAGE = SITE_URL + "/og/scholars-cafe.jpg";

export function seo({
  path,
  title,
  description,
  noindex = false,
}: {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
}) {
  const url = SITE_URL + (path === "/" ? "/" : path.replace(/\/$/, ""));
  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(noindex ? [{ name: "robots", content: "noindex" }] : []),
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Scholars Cafe" },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Scholars Cafe" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

// Social profiles (the same ones shown on the site and the link page).
export const SAME_AS = [
  "https://www.facebook.com/scholarscafe09/",
  "https://www.instagram.com/scholars_cafe_/",
  "https://www.linkedin.com/company/scholars-cafe09/",
  "https://www.youtube.com/@ScholarsCafe09",
  "https://www.tiktok.com/@scholars.cafe",
];

/** Structured data for Google: who we are, what we do, how to reach us. Only facts that are true and visible. */
export const ORGANIZATION_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": SITE_URL + "/#organization",
      name: "Scholars Cafe",
      url: SITE_URL + "/",
      logo: SITE_URL + "/brand/icon-512.png",
      image: OG_IMAGE,
      description:
        "Mentor-led admissions guidance for Bangladeshi students applying to universities in the United States: college lists, essays, financial aid and scholarships, and F-1 visa preparation.",
      email: EMAIL,
      telephone: PHONE,
      areaServed: { "@type": "Country", name: "Bangladesh" },
      knowsAbout: [
        "Studying in the USA from Bangladesh",
        "US university admissions",
        "Full scholarships and financial aid",
        "CSS Profile and ISFAA",
        "Common App essays",
        "F-1 student visa",
      ],
      sameAs: SAME_AS,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "admissions advice",
        email: EMAIL,
        telephone: PHONE,
        url: WA_LINK,
        availableLanguage: ["English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      url: SITE_URL + "/",
      name: "Scholars Cafe",
      publisher: { "@id": SITE_URL + "/#organization" },
      inLanguage: "en",
    },
  ],
});
