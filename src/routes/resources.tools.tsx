import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { seo } from "@/lib/seo";
import { CmsText } from "@/lib/cms";
import { ResourcesSubPage } from "@/components/scholars/ResourcesNav";
import { CoreValues } from "@/components/tools/CoreValues";
import { ActivityOptimizer } from "@/components/tools/ActivityOptimizer";
import { PromptBank } from "@/components/tools/PromptBank";

export const Route = createFileRoute("/resources/tools")({
  head: () =>
    seo({
      path: "/resources/tools",
      title: "Free Essay & Activity Tools | Scholars Cafe",
      description:
        "Free tools for Bangladeshi students applying to US universities: find your core values, fit Common App activities into the character limits, and browse official supplemental essay prompts.",
    }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <ResourcesSubPage
      path="/resources/tools"
      title={<CmsText id="ResourcesTools.title">Essay Tools</CmsText>}
      lead={
        <CmsText id="ResourcesTools.lead">
          Three free tools for your application. Everything stays in your browser.
        </CmsText>
      }
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <nav aria-label="On this page" className="no-print flex flex-wrap gap-2 pt-10">
          {[
            ["#core-values", "Core values"],
            ["#activities", "Activity list"],
            ["#prompts", "Supplemental prompts"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="type-nav inline-flex h-10 items-center rounded-full bg-ice-100 px-4 text-blue-900 transition-colors hover:bg-ice-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
      <ToolSection
        id="core-values"
        title={<CmsText id="ResourcesTools.values.title">Find your core values</CmsText>}
        lead={
          <CmsText id="ResourcesTools.values.lead">
            Good essays show what you care about. Narrow a long list down to three values, then
            collect real moments from your own life that prove them.
          </CmsText>
        }
      >
        <CoreValues />
      </ToolSection>
      <ToolSection
        id="activities"
        tone="ice"
        title={<CmsText id="ResourcesTools.activities.title">Common App activity list</CmsText>}
        lead={
          <CmsText id="ResourcesTools.activities.lead">
            Write each activity inside the character limits, trim filler words and put your
            strongest activities first.
          </CmsText>
        }
      >
        <ActivityOptimizer />
      </ToolSection>
      <ToolSection
        id="prompts"
        title={<CmsText id="ResourcesTools.prompts.title">Supplemental essay prompts</CmsText>}
        lead={
          <CmsText id="ResourcesTools.prompts.lead">
            See what each college asks before you start, and plan essays you can reuse.
          </CmsText>
        }
      >
        <PromptBank />
      </ToolSection>
    </ResourcesSubPage>
  );
}

function ToolSection({
  id,
  title,
  lead,
  tone = "white",
  children,
}: {
  id: string;
  title: ReactNode;
  lead: ReactNode;
  tone?: "white" | "ice";
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id + "-h"}
      className={`scroll-mt-24 section-y ${tone === "ice" ? "bg-neutral-50" : "bg-white"}`}
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <h2 id={id + "-h"} className="type-h2 text-neutral-900">
          {title}
        </h2>
        <p className="type-lead mt-4 max-w-[60ch] text-neutral-600">{lead}</p>
        <div className="section-body">{children}</div>
      </div>
    </section>
  );
}
