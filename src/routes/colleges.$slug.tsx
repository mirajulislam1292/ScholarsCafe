import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { seo } from "@/lib/seo";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { Reveal } from "@/components/scholars/Reveal";
import { CtaBand, PageHero } from "@/components/page/PageParts";
import { AID_LABEL, STATE_UNIVERSITIES, TEST_LABEL } from "@/data/state-universities";
import {
  BDT_RATE,
  COLLEGE_RANK_RULE,
  TYPE_LABEL,
  collegeBySlug,
  type College,
  type Fig,
} from "@/data/college-directory";
import {
  NP,
  bdt,
  fmtDate,
  fmtDeadline,
  fmtEnglish,
  isStale,
  rate,
  stickerUsd,
  useColleges,
  usd,
} from "@/lib/colleges";

// One profile per college: /colleges/<slug>, pre-rendered for every built-in college
// (scripts/generate-index.js). Colleges added only in the admin render in the browser.
export const Route = createFileRoute("/colleges/$slug")({
  loader: ({ params }) => ({ slug: params.slug }),
  head: ({ params }) => {
    const c = collegeBySlug(params.slug);
    return c
      ? seo({
          path: `/colleges/${c.slug}`,
          title: `${c.name}: Admissions and Aid for Bangladeshi Students | Scholars Cafe`,
          description: `${c.name} (${c.city}, ${c.code}): admit rate, SAT/ACT, English test minimums, aid for international students, deadlines and cost in taka, from official sources.`,
        })
      : seo({
          path: `/colleges/${params.slug}`,
          title: "College profile | Scholars Cafe",
          description:
            "A US college profile for Bangladeshi applicants, with every figure linked to its official source.",
        });
  },
  component: CollegePage,
});

function CollegePage() {
  const { slug } = Route.useLoaderData();
  const c = useColleges().find((x) => x.slug === slug);
  if (!c)
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <PageHero title="College not found" lead="This college is not in our directory." />
          <section className="section-y mx-auto max-w-[1200px] px-6 md:px-12">
            <Link to="/colleges" className="type-body text-blue-700 hover:underline">
              See all colleges
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  return <Profile c={c} />;
}

function Profile({ c }: { c: College }) {
  const admit = rate(c.admitted, c.applicants);
  const ed = rate(c.edAdmitted, c.edApplicants);
  const ea = rate(c.eaAdmitted, c.eaApplicants);
  const sticker = stickerUsd(c);
  const brief = STATE_UNIVERSITIES.find((s) => s.code === c.code);
  const stale = isStale(c.asOf);
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <PageHero
          title={c.name}
          lead={`${c.city}, ${c.state} · ${c.rank.label}`}
          image={c.image?.src}
          imageAlt={c.image ? `${c.name} campus` : ""}
        />

        <section className="bg-white section-y">
          <div className="mx-auto max-w-[1200px] px-6 md:px-12">
            <Reveal className="max-w-3xl">
              <h2 className="type-h2 text-neutral-900">For international applicants</h2>
              {c.highlight && <p className="mt-5 type-lead text-neutral-700">{c.highlight}</p>}
              <p className="mt-5 type-body text-neutral-600">
                {TYPE_LABEL[c.type]}. Figures were checked on {fmtDate(c.asOf)}
                {c.cdsYear ? ` and use the ${c.cdsYear} Common Data Set where noted` : ""}. If{" "}
                {c.name} does not publish a figure, we say so rather than estimate. Check the
                official pages before you apply.
              </p>
              {stale && (
                <p className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
                  Stale: these figures are more than 12 months old.
                </p>
              )}
            </Reveal>

            <div className="section-body grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <Fact title="How selective" note={c.cdsYear ? `CDS ${c.cdsYear}, section C1` : null}>
                <Big>{admit != null ? `${admit}% admitted` : NP}</Big>
                <Rows>
                  <Row label="Applied" f={c.applicants} show={(v) => v.toLocaleString("en-US")} />
                  <Row label="Admitted" f={c.admitted} show={(v) => v.toLocaleString("en-US")} />
                </Rows>
              </Fact>

              <Fact title="Early rounds" note={c.earlyNote}>
                <Rows>
                  <Row
                    label="Early Decision applied"
                    f={c.edApplicants}
                    show={(v) => v.toLocaleString("en-US")}
                  />
                  <Row
                    label="Early Decision admitted"
                    f={c.edAdmitted}
                    show={(v) => v.toLocaleString("en-US")}
                  />
                  <Plain label="Early Decision rate">{ed != null ? `${ed}%` : NP}</Plain>
                  <Row
                    label="Early Action applied"
                    f={c.eaApplicants}
                    show={(v) => v.toLocaleString("en-US")}
                  />
                  <Row
                    label="Early Action admitted"
                    f={c.eaAdmitted}
                    show={(v) => v.toLocaleString("en-US")}
                  />
                  <Plain label="Early Action rate">{ea != null ? `${ea}%` : NP}</Plain>
                </Rows>
              </Fact>

              <Fact title="SAT and ACT" note={c.testNote}>
                <Big source={c.testPolicy.source}>
                  {c.testPolicy.value ? TEST_LABEL[c.testPolicy.value] : NP}
                </Big>
                <Rows>
                  <Row label="SAT middle 50%" f={c.sat} show={(v) => v} />
                  <Row label="ACT middle 50%" f={c.act} show={(v) => v} />
                </Rows>
              </Fact>

              <Fact title="English test minimums" note={c.englishNote}>
                <Rows>
                  <Row label="IELTS" f={c.ielts} show={fmtEnglish} />
                  <Row label="TOEFL iBT" f={c.toefl} show={fmtEnglish} />
                  <Row label="Duolingo" f={c.duolingo} show={fmtEnglish} />
                </Rows>
              </Fact>

              <Fact title="Aid for international students" note={c.intlNote}>
                <Big source={c.intlAidPolicy.source}>
                  {c.intlAidPolicy.value ? AID_LABEL[c.intlAidPolicy.value] : NP}
                </Big>
                {c.policyQuote && (
                  <blockquote className="mt-3 border-l-2 border-blue-200 pl-3 type-caption text-neutral-700">
                    "{c.policyQuote}"
                  </blockquote>
                )}
                <Rows>
                  <Row
                    label="Need-based aid for non-US citizens"
                    f={c.needBasedForIntl}
                    show={(v) => (v ? "Yes" : "No")}
                  />
                  <Row
                    label="International students given aid (CDS H6)"
                    f={c.intlAided}
                    show={(v) => v.toLocaleString("en-US")}
                  />
                  <Row label="Average award (CDS H6)" f={c.intlAvgAward} show={usd} />
                  <Row label="Average intl aid award in BDT" f={c.intlAvgAward} show={bdt} />
                </Rows>
              </Fact>

              <Fact
                title="Cost per year"
                note={[c.costYear, c.costNote].filter(Boolean).join(" · ") || null}
              >
                <Rows>
                  <Row label="Tuition" f={c.tuition} show={usd} />
                  <Row label="Required fees" f={c.fees} show={usd} />
                  <Row label="Room and board" f={c.roomBoard} show={usd} />
                  <Plain label="Total">{sticker != null ? usd(sticker) : NP}</Plain>
                  <Plain label="Sticker cost in BDT">
                    {sticker != null ? bdt(sticker) : NP}
                  </Plain>
                </Rows>
                <p className="mt-3 type-caption text-neutral-500">
                  Before aid. Books, travel and insurance are extra. At ৳{BDT_RATE.value}/USD on{" "}
                  {fmtDate(BDT_RATE.date)}.
                </p>
              </Fact>

              <Fact title="SSC and HSC results">
                <p className="type-body text-neutral-800">
                  {c.nationalCurriculum.value ?? NP}
                </p>
                <SourceLine href={c.nationalCurriculum.source} />
              </Fact>

              <Fact title="Deadlines for fall 2027 entry" note={c.deadlineNote}>
                <Rows>
                  <Row label="Early Decision I" f={c.ed1} show={fmtDeadline} />
                  <Row label="Early Decision II" f={c.ed2} show={fmtDeadline} />
                  <Row label="Early Action" f={c.ea} show={fmtDeadline} />
                  <Row label="Regular Decision" f={c.rd} show={fmtDeadline} />
                </Rows>
              </Fact>
            </div>

            <Reveal className="mt-10 card-soft p-6 md:p-8">
              <h3 className="type-h3 text-neutral-900">Official sources</h3>
              <ul className="mt-4 flex flex-col gap-2">
                <SourceItem href={c.urls.admissions}>First-year admissions</SourceItem>
                <SourceItem href={c.urls.international}>International applicants</SourceItem>
                <SourceItem href={c.urls.aid}>Financial aid</SourceItem>
                <SourceItem href={c.urls.cds}>Common Data Set</SourceItem>
              </ul>
              {brief && (
                <p className="mt-6 type-body text-neutral-700">
                  Also see our {c.state} brief:{" "}
                  <Link
                    to="/universities/$state"
                    params={{ state: brief.slug }}
                    className="text-blue-700 hover:underline"
                  >
                    {brief.university}
                  </Link>
                  .
                </p>
              )}
              <p className="mt-6 type-caption text-neutral-500">
                Rank: {c.rank.label}, {c.rank.edition} (
                <a
                  href={c.rank.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  U.S. News
                </a>
                ). {COLLEGE_RANK_RULE}
              </p>
              <p className="mt-3 type-caption text-neutral-500">
                Taka figures use {BDT_RATE.label}, ৳{BDT_RATE.value} per USD on{" "}
                {fmtDate(BDT_RATE.date)} (
                <a
                  href={BDT_RATE.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  source
                </a>
                ). As of {fmtDate(c.asOf)}. Costs and rules change every year.
              </p>
              {c.image && <ImageCredit img={c.image} />}
            </Reveal>

            <p className="mt-8">
              <Link to="/colleges" className="type-body text-blue-700 hover:underline">
                Back to all colleges
              </Link>
            </p>
          </div>
        </section>

        <CtaBand title={`Want ${c.name} on your list?`} action="Book a free strategy call" />
      </main>
      <Footer />
    </div>
  );
}

function Fact({
  title,
  note,
  children,
}: {
  title: string;
  note?: string | null;
  children: ReactNode;
}) {
  return (
    <Reveal className="card-soft flex flex-col p-6 md:p-8">
      <h3 className="type-h3 text-[1.125rem] text-neutral-900">{title}</h3>
      <div className="mt-3">{children}</div>
      {note && <p className="mt-3 type-caption text-neutral-600">{note}</p>}
    </Reveal>
  );
}

function Big({ children, source }: { children: ReactNode; source?: string | null }) {
  return (
    <div>
      <div className="font-heading text-[1.5rem] font-light leading-snug tracking-[-0.01em] text-neutral-900">
        {children}
      </div>
      <SourceLine href={source ?? null} />
    </div>
  );
}

function Rows({ children }: { children: ReactNode }) {
  return <dl className="mt-3 divide-y divide-neutral-900/[0.06]">{children}</dl>;
}

function Row<T>({ label, f, show }: { label: string; f: Fig<T>; show: (v: T) => string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
      <dt className="text-sm text-neutral-600">{label}</dt>
      <dd className="flex items-baseline gap-2 text-right">
        <span className={f.value == null ? "text-sm text-neutral-500" : "font-medium text-neutral-900"}>
          {f.value == null ? NP : show(f.value)}
        </span>
        {f.source && (
          <a
            href={f.source}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Source for ${label}`}
            className="text-blue-700 hover:text-blue-900"
          >
            <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
          </a>
        )}
      </dd>
    </div>
  );
}

function Plain({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
      <dt className="text-sm text-neutral-600">{label}</dt>
      <dd className="pr-5.5 text-right font-medium text-neutral-900">{children}</dd>
    </div>
  );
}

function SourceLine({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex items-center gap-1 type-caption text-blue-700 hover:underline"
    >
      Source
      <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
    </a>
  );
}

function SourceItem({ href, children }: { href: string | null; children: ReactNode }) {
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
        className="inline-flex items-center gap-1.5 type-body text-blue-700 hover:underline"
      >
        {children}
        <ArrowUpRight aria-hidden className="h-4 w-4" />
      </a>
    </li>
  );
}

function ImageCredit({ img }: { img: NonNullable<College["image"]> }) {
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
