import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { CmsText, useCmsAuto } from "@/lib/cms";
import { ResourceEntries } from "@/components/scholars/ResourceEntries";
import { EmptyNote, ResourcesSubPage } from "@/components/scholars/ResourcesNav";

export const Route = createFileRoute("/resources/podcast")({
  head: () =>
    seo({
      path: "/resources/podcast",
      title: "Study Abroad Podcast | Scholars Cafe",
      crumb: "Podcast",
      description:
        "Episodes, announcements and updates from the Scholars Cafe team for students applying to universities abroad.",
    }),
  component: PodcastPage,
});

// Entries from Website → Resources with category podcast ("broadcast" is the old name, still shown here).
function PodcastPage() {
  const t = useCmsAuto("ResourcesPodcast");
  return (
    <ResourcesSubPage
      path="/resources/podcast"
      title={<CmsText id="ResourcesPodcast.title">Podcast</CmsText>}
      lead={
        <CmsText id="ResourcesPodcast.lead">
          Episodes, announcements and updates from the Scholars Cafe team.
        </CmsText>
      }
    >
      <section className="mx-auto max-w-[1200px] px-6 section-y md:px-12">
        <ResourceEntries
          categories={["podcast", "broadcast"]}
          action={t("Open")}
          empty={
            <EmptyNote>
              <CmsText id="ResourcesPodcast.empty">No episodes yet.</CmsText>
            </EmptyNote>
          }
        />
      </section>
    </ResourcesSubPage>
  );
}
