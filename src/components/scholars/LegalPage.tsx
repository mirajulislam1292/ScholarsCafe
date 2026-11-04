import { CmsText } from "@/lib/cms";
import { CtaBand, PageHero } from "@/components/page/PageParts";

/** Shared layout for Privacy, Terms and Cookies: page hero, readable article, closing CTA. */
export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  kicker?: string;
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <PageHero
        title={title}
        lead={
          <>
            {intro}
            <span className="type-caption mt-5 block text-ice-400">
              <CmsText id="LegalPage.ba34a96f2969">Last updated: </CmsText>
              {updated}
            </span>
          </>
        }
      />
      <section className="bg-white py-[clamp(96px,12vw,160px)]">
        <article
          className="prose mx-auto max-w-[720px] px-6 md:px-0
            prose-headings:font-heading prose-headings:font-light prose-headings:tracking-[-0.02em] prose-headings:text-neutral-900
            prose-h2:mt-16 prose-h2:text-[clamp(1.5rem,2.4vw,2rem)]
            prose-h3:mt-10 prose-h3:text-[1.25rem] prose-h3:font-medium
            prose-p:font-heading prose-p:text-[1.0625rem] prose-p:leading-[1.75] prose-p:text-neutral-700
            prose-li:font-heading prose-li:text-neutral-700 prose-li:marker:text-blue-400
            prose-a:font-medium prose-a:text-blue-700 prose-a:underline-offset-4
            prose-strong:font-semibold prose-strong:text-neutral-900"
        >
          {children}
        </article>
      </section>
      <CtaBand title="Questions about your data? Just ask." action="Contact us" />
    </main>
  );
}
