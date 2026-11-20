import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { CmsText, useCmsAuto } from "@/lib/cms";
import { ResourceEntries } from "@/components/scholars/ResourceEntries";
import { EmptyNote, ResourcesSubPage } from "@/components/scholars/ResourcesNav";

export const Route = createFileRoute("/resources/broadcast")({
  head: () =>
    seo({
      path: "/resources/broadcast",
      title: "Broadcast | Scholars Cafe",
      description:
        "Announcements and updates from the Scholars Cafe team for students applying to universities abroad.",
    }),
  component: BroadcastPage,
});

// Entries from Website → Resources with category broadcast.
function BroadcastPage() {
  const t = useCmsAuto("ResourcesBroadcast");
  return (
    <ResourcesSubPage
      path="/resources/broadcast"
      title={<CmsText id="ResourcesBroadcast.title">Broadcast</CmsText>}
      lead={
        <CmsText id="ResourcesBroadcast.lead">
          Announcements and updates from the Scholars Cafe team.
        </CmsText>
      }
    >
      <section className="mx-auto max-w-[1200px] px-6 section-y md:px-12">
        <ResourceEntries
          categories={["broadcast"]}
          action={t("Open")}
          empty={
            <EmptyNote>
              <CmsText id="ResourcesBroadcast.empty">No announcements yet.</CmsText>
            </EmptyNote>
          }
        />
      </section>
    </ResourcesSubPage>
  );
}
