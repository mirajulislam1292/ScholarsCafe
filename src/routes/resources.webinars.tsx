import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { CmsText, useCmsAuto } from "@/lib/cms";
import { ResourceEntries } from "@/components/scholars/ResourceEntries";
import { EmptyNote, ResourcesSubPage } from "@/components/scholars/ResourcesNav";

export const Route = createFileRoute("/resources/webinars")({
  head: () =>
    seo({
      path: "/resources/webinars",
      title: "Webinars | Scholars Cafe",
      description:
        "Free Scholars Cafe webinars and live sessions for Bangladeshi students applying abroad, with recordings of past sessions.",
    }),
  component: WebinarsPage,
});

// Entries from Website → Resources with category webinar, live or video.
function WebinarsPage() {
  const t = useCmsAuto("ResourcesWebinars");
  return (
    <ResourcesSubPage
      path="/resources/webinars"
      title={<CmsText id="ResourcesWebinars.title">Webinar</CmsText>}
      lead={
        <CmsText id="ResourcesWebinars.lead">
          Free live sessions with our mentors, and recordings of past ones.
        </CmsText>
      }
    >
      <section className="mx-auto max-w-[1200px] px-6 section-y md:px-12">
        <ResourceEntries
          categories={["webinar", "live", "video"]}
          action={t("Join or watch")}
          empty={
            <EmptyNote>
              <CmsText id="ResourcesWebinars.empty">
                No webinars scheduled right now. Check back soon for the next one.
              </CmsText>
            </EmptyNote>
          }
        />
      </section>
    </ResourcesSubPage>
  );
}
