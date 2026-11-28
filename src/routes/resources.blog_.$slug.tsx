import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Fragment, type ReactNode } from "react";
import { seo, SITE_URL } from "@/lib/seo";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { CtaBand, PageHero } from "@/components/page/PageParts";
import { GUIDES, guideBySlug, type Guide, type GuideBlock } from "@/data/guides";

// One page per guide: /resources/blog/<slug>, pre-rendered for every guide in src/data/guides.ts
// (scripts/generate-index.js). Posts written in the admin still show on /resources/blog.
export const Route = createFileRoute("/resources/blog_/$slug")({
  loader: ({ params }): Guide => {
    const g = guideBySlug(params.slug);
    if (!g) throw notFound();
    return g;
  },
  head: ({ loaderData: g }) => {
    if (!g) return { meta: [{ title: "Not found | Scholars Cafe" }] };
    const path = `/resources/blog/${g.slug}`;
    const base = seo({ path, title: g.title, description: g.description, crumb: g.crumb });
    const json = (o: object) => JSON.stringify(o).replace(/</g, "\\u003c");
    const article = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: g.h1,
      description: g.description,
      datePublished: g.published,
      dateModified: g.checked,
      inLanguage: "en",
      mainEntityOfPage: SITE_URL + path,
      image: SITE_URL + "/og/scholars-cafe.jpg",
      author: { "@type": "Organization", name: "Scholars Cafe", url: SITE_URL + "/" },
      publisher: { "@id": SITE_URL + "/#organization" },
    };
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: g.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    return {
      ...base,
      meta: base.meta.map((m) =>
        "property" in m && m.property === "og:type"
          ? { property: "og:type", content: "article" }
          : m,
      ),
      scripts: [
        ...base.scripts,
        { type: "application/ld+json", children: json(article) },
        ...(g.faqs.length ? [{ type: "application/ld+json", children: json(faq) }] : []),
      ],
    };
  },
  component: GuidePage,
});

const checkedLabel = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** Turns "**bold**" and "[text](url)" in guide text into elements. */
function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) parts.push(text.slice(last, i));
    if (m[1]) parts.push(<strong key={i}>{m[1]}</strong>);
    else if (m[3].startsWith("/"))
      parts.push(
        <a key={i} href={m[3]}>
          {m[2]}
        </a>,
      );
    else
      parts.push(
        <a key={i} href={m[3]} target="_blank" rel="noopener noreferrer">
          {m[2]}
        </a>,
      );
    last = i + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function Block({ b }: { b: GuideBlock }) {
  if (typeof b === "string")
    return (
      <p>
        <Rich text={b} />
      </p>
    );
  const items = "list" in b ? b.list : b.steps;
  const Tag = "list" in b ? "ul" : "ol";
  return (
    <Tag>
      {items.map((t) => (
        <li key={t}>
          <Rich text={t} />
        </li>
      ))}
    </Tag>
  );
}

function GuidePage() {
  const g: Guide = Route.useLoaderData();
  const others = GUIDES.filter((x) => x.slug !== g.slug);
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <PageHero title={g.h1} />
        <article className="section-y mx-auto max-w-[1200px] px-6 md:px-12">
          <div className="prose prose-neutral max-w-3xl prose-headings:font-heading prose-headings:font-medium prose-a:text-blue-700 md:prose-lg">
            <p className="not-prose type-body text-neutral-500">
              By Scholars Cafe · Last checked: {checkedLabel(g.checked)}
            </p>
            <p className="lead">
              <Rich text={g.lead} />
            </p>
            <p className="not-prose rounded-2xl bg-ice-100 px-5 py-4 type-body text-neutral-700">
              Fees and rules change. We link every figure to its official source; please confirm on
              the official site before you pay or apply.
            </p>
            {g.sections.map((s) => (
              <Fragment key={s.h2}>
                <h2>{s.h2}</h2>
                {s.blocks.map((b, i) => (
                  <Block key={i} b={b} />
                ))}
              </Fragment>
            ))}
            {g.faqs.length > 0 && (
              <>
                <h2>Frequently asked questions</h2>
                {g.faqs.map((f) => (
                  <Fragment key={f.q}>
                    <h3>{f.q}</h3>
                    <p>{f.a}</p>
                  </Fragment>
                ))}
              </>
            )}
            <h2>More guides</h2>
            <ul>
              {others.map((o) => (
                <li key={o.slug}>
                  <Link to="/resources/blog/$slug" params={{ slug: o.slug }}>
                    {o.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </article>
        <CtaBand title="Want help with your plan?" action="Book a free consultation" />
      </main>
      <Footer />
    </div>
  );
}
