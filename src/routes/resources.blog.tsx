import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { CmsText } from "@/lib/cms";
import { BlogPosts } from "@/components/scholars/BlogPosts";
import { EmptyNote, ResourcesSubPage } from "@/components/scholars/ResourcesNav";

export const Route = createFileRoute("/resources/blog")({
  head: () =>
    seo({
      path: "/resources/blog",
      title: "Blog | Scholars Cafe",
      description:
        "Articles from Scholars Cafe mentors for Bangladeshi students applying abroad: applications, essays, scholarships and student life.",
    }),
  component: BlogPage,
});

// Every post from the admin's Website → Blog, newest first.
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
      <BlogPosts
        limit={1000}
        heading={null}
        empty={
          <div className="mx-auto max-w-[1200px] px-6 py-20 md:px-12">
            <EmptyNote>
              <CmsText id="ResourcesBlog.empty">
                No articles yet. Our first posts are on the way.
              </CmsText>
            </EmptyNote>
          </div>
        }
      />
    </ResourcesSubPage>
  );
}
