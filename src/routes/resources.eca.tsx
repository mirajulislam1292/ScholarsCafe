import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { CmsText } from "@/lib/cms";
import { EcaAlerts } from "@/components/scholars/EcaAlerts";
import { ResourcesSubPage } from "@/components/scholars/ResourcesNav";

export const Route = createFileRoute("/resources/eca")({
  head: () =>
    seo({
      path: "/resources/eca",
      title: "ECA Notifications | Scholars Cafe",
      description:
        "Get an email from Scholars Cafe whenever a new extracurricular activity (ECA) opportunity opens. Free, and you can unsubscribe at any time.",
    }),
  component: EcaPage,
});

function EcaPage() {
  return (
    <ResourcesSubPage
      path="/resources/eca"
      title={<CmsText id="ResourcesEca.title">ECA Notification</CmsText>}
      lead={
        <CmsText id="ResourcesEca.lead">
          Competitions, volunteering, programs and other extracurricular activities that strengthen
          your application.
        </CmsText>
      }
    >
      <section className="mx-auto max-w-[1200px] px-6 py-[clamp(56px,9vw,120px)] md:px-12">
        <EcaAlerts />
      </section>
    </ResourcesSubPage>
  );
}
