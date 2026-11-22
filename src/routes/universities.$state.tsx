import { createFileRoute, notFound } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { seo } from "@/lib/seo";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { Reveal } from "@/components/scholars/Reveal";
import { CtaBand, PageHero } from "@/components/page/PageParts";
import {
  AID_LABEL,
  AS_OF,
  RANK_RULE,
  TEST_LABEL,
  stateBySlug,
  type StateUniversity,
} from "@/data/state-universities";

// One page per state: /universities/<state-slug>, pre-rendered for all 50 (scripts/generate-index.js).
export const Route = createFileRoute("/universities/$state")({
  loader: ({ params }): StateUniversity => {
    const s = stateBySlug(params.state);
    if (!s) throw notFound();
    return s;
  },
  head: ({ loaderData: s }) =>
    s
      ? seo({
          path: `/universities/${s.slug}`,
          title: `${s.university} | Scholars Cafe`,
          description: `${s.university}, the top-ranked university in ${s.state}: English test scores, SAT/ACT policy, estimated cost and financial aid for international students, with official sources.`,
        })
      : { meta: [{ title: "Not found | Scholars Cafe" }] },
  component: StatePage,
});

const NP = "Not published";
const usd = (n: number) => "$" + n.toLocaleString("en-US");

function StatePage() {
  const s: StateUniversity = Route.useLoaderData();
  const e = s.english;
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <PageHero
          title={s.university}
          lead={`${s.city}, ${s.state} · ${s.rank.label}`}
          image={s.image?.src}
          imageAlt={s.image ? `${s.university} campus` : ""}
        />

        <section className="bg-white section-y">
          <div className="mx-auto max-w-[1200px] px-6 md:px-12">
            <Reveal className="max-w-3xl">
              <h2 className="type-h2 text-neutral-900">International student brief</h2>
              <p className="mt-5 type-body text-neutral-600">
                Figures are taken from {s.university}'s own official pages, as of {fmtDate(AS_OF)}.
                Where the university does not publish a figure we say so rather than estimate.
                Always verify on the official site before you apply.
              </p>
            </Reveal>

            <div className="section-body grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <Fact title="GPA benchmark" source={s.gpa.source}>
                {s.gpa.value ?? NP}
              </Fact>
              <Fact title="SAT / ACT" source={s.test.source} note={s.test.note}>
                {s.test.value ? TEST_LABEL[s.test.value] : NP}
              </Fact>
              <Fact title="English test scores" source={e.source} note={e.note}>
                <dl className="grid grid-cols-3 gap-3">
                  <Score label="IELTS" v={e.ielts} />
                  <Score label="TOEFL iBT" v={e.toefl} />
                  <Score label="Duolingo" v={e.duolingo} />
                </dl>
              </Fact>
              <Fact
                title="Estimated cost of attendance"
                source={s.cost.source}
                note={[s.cost.year, s.cost.note].filter(Boolean).join(" · ") || null}
              >
                {s.cost.value != null ? `${usd(s.cost.value)} / year` : NP}
              </Fact>
              <Fact
                title="Financial aid for internationals"
                source={s.aid.source}
                note={s.aid.note}
              >
                {s.aid.value ? AID_LABEL[s.aid.value] : NP}
              </Fact>
              <Fact title="Why this university" source={s.rank.source}>
                <span className="block">{s.rank.label}</span>
                <span className="mt-2 block type-caption text-neutral-500">
                  {RANK_RULE} Edition used: {s.rank.edition}.
                </span>
              </Fact>
            </div>

            <Reveal className="mt-10 card-soft p-6 md:p-8">
              <h3 className="type-h3 text-neutral-900">Official sources</h3>
              <ul className="mt-4 flex flex-col gap-2">
                <SourceLink href={s.urls.admissions}>First-year admissions</SourceLink>
                <SourceLink href={s.urls.international}>International applicants</SourceLink>
                <SourceLink href={s.urls.cost}>Cost of attendance</SourceLink>
                <SourceLink href={s.urls.aid}>Financial aid</SourceLink>
              </ul>
              <p className="mt-6 type-caption text-neutral-500">
                As of {fmtDate(AS_OF)}. Requirements and costs change every year: verify on the
                official site.
              </p>
              {s.image && <ImageCredit img={s.image} />}
            </Reveal>
          </div>
        </section>

        <CtaBand title={`Want ${s.university} on your list?`} action="Book a free strategy call" />
      </main>
      <Footer />
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Fact({
  title,
  source,
  note,
  children,
}: {
  title: string;
  source: string | null;
  note?: string | null;
  children: ReactNode;
}) {
  return (
    <Reveal className="card-soft flex flex-col p-6 md:p-8">
      <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        {title}
      </div>
      <div className="mt-3 font-heading text-[1.5rem] font-light leading-snug tracking-[-0.01em] text-neutral-900">
        {children}
      </div>
      {note && <p className="mt-3 type-caption text-neutral-600">{note}</p>}
      {source && (
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1 pt-4 type-caption text-blue-700 hover:underline"
        >
          Source
          <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
        </a>
      )}
    </Reveal>
  );
}

function Score({ label, v }: { label: string; v: number | null }) {
  return (
    <div>
      <dt className="type-caption text-neutral-500">{label}</dt>
      <dd className={v == null ? "text-[15px] text-neutral-500" : ""}>{v ?? NP}</dd>
    </div>
  );
}

function SourceLink({ href, children }: { href: string | null; children: ReactNode }) {
  if (!href)
    return (
      <li className="type-body text-neutral-500">
        {children}: {NP}
      </li>
    );
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 type-body text-blue-700 hover:underline"
      >
        {children}
        <ArrowUpRight aria-hidden className="h-4 w-4" />
      </a>
    </li>
  );
}

function ImageCredit({ img }: { img: NonNullable<StateUniversity["image"]> }) {
  return (
    <p className="mt-3 type-caption text-neutral-500">
      Photo:{" "}
      <a href={img.page} target="_blank" rel="noopener noreferrer" className="underline">
        {img.title}
      </a>{" "}
      by {img.author},{" "}
      {img.licenceUrl ? (
        <a href={img.licenceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          {img.licence}
        </a>
      ) : (
        img.licence
      )}
      , via Wikimedia Commons. Resized and converted to WebP.
    </p>
  );
}
