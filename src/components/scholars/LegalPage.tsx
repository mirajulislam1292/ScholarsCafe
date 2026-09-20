import { CmsText } from "@/lib/cms";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function LegalPage({
  kicker,
  title,
  updated,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="bg-background pt-32 md:pt-40">
      {/* hero */}
      <section className="border-b border-border bg-gradient-to-b from-secondary/40 to-background">
        <div className="mx-auto max-w-[820px] px-5 py-16 md:px-8 md:py-24">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /><CmsText id="LegalPage.76c5505ff2e2">
            Back to home
          </CmsText></Link>
          <div className="mt-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky">
            {kicker}
          </div>
          <h1 className="mt-4 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground"><CmsText id="LegalPage.ba34a96f2969">
            Last updated: </CmsText>{updated}
          </p>
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
            {intro}
          </p>
        </div>
      </section>

      {/* body */}
      <article className="mx-auto max-w-[760px] px-5 py-16 md:px-8 md:py-24">
        <div
          className="prose prose-slate max-w-none
            prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
            prose-h2:mt-12 prose-h2:text-2xl prose-h2:md:text-3xl
            prose-h3:mt-8 prose-h3:text-lg
            prose-p:text-[16px] prose-p:leading-[1.75] prose-p:text-muted-foreground
            prose-ul:text-muted-foreground prose-li:my-1
            prose-a:text-sky prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            dark:prose-invert"
        >
          {children}
        </div>
      </article>
    </main>
  );
}
