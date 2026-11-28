import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { CmsText } from "@/lib/cms";
import { BlogPosts } from "@/components/scholars/BlogPosts";
import { ResourcesSubPage } from "@/components/scholars/ResourcesNav";
import { GUIDES } from "@/data/guides";

export const Route = createFileRoute("/resources/blog")({
  head: () =>
    seo({
      path: "/resources/blog",
      title: "Study in the USA Blog | Scholars Cafe",
      crumb: "Blog",
      description:
        "Articles from Scholars Cafe mentors for Bangladeshi students applying abroad: applications, essays, scholarships and student life.",
    }),
  component: BlogPage,
});

// The built-in guides (src/data/guides.ts, each with its own page), then every post from the
// admin's Website → Blog, newest first.
function BlogPage() {
  return (
    <ResourcesSubPage
      path="/resources/blog"
      title={<CmsText id="ResourcesBlog.title">Blog</CmsText>}
      lead={
        <CmsText id="ResourcesBlog.lead">
          Articles from our mentors on applying, essays, scholarships and student life.
        </CmsText>
      }
    >
      <section className="bg-white section-y">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <h2 className="type-h2 text-neutral-900">
            <CmsText id="ResourcesBlog.guides">Guides</CmsText>
          </h2>
          <div className="section-body grid gap-6 md:grid-cols-2">
            {GUIDES.map((g) => (
              <article key={g.slug} className="card-soft card-hover p-7">
                <h3 className="text-xl font-medium">
                  <Link
                    to="/resources/blog/$slug"
                    params={{ slug: g.slug }}
                    className="hover:text-blue-700"
                  >
                    {g.h1}
                  </Link>
                </h3>
                <p className="mt-3 text-neutral-600">{g.description}</p>
                <Link
                  to="/resources/blog/$slug"
                  params={{ slug: g.slug }}
                  className="mt-5 inline-block font-medium text-blue-700"
                  aria-label={`Read: ${g.h1}`}
                >
                  Read guide →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <BlogPosts limit={1000} heading="From our mentors" />
    </ResourcesSubPage>
  );
}
