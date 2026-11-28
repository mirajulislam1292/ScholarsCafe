import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { seo } from "@/lib/seo";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { Reveal } from "@/components/scholars/Reveal";
import { CtaBand, PageHero } from "@/components/page/PageParts";
import { SaveToList } from "@/components/scholars/SaveToList";
import { AID_LABEL, TEST_LABEL } from "@/data/state-universities";
import type { AidPolicy, TestPolicy } from "@/data/state-universities";
import {
  BDT_RATE,
  COLLEGE_RANK_RULE,
  TYPE_LABEL,
  type College,
  type CollegeType,
} from "@/data/college-directory";
import {
  BAND_LABEL,
  NP,
  admitRate,
  band,
  fmtDate,
  isStale,
  useColleges,
  type Band,
} from "@/lib/colleges";

export const Route = createFileRoute("/colleges/")({
  head: () =>
    seo({
      path: "/colleges",
      title: "US College Profiles for Bangladeshi Students | Scholars Cafe",
      crumb: "Colleges",
      description:
        "US liberal arts colleges and national universities: admit rates, SAT/ACT, aid for international students and costs in taka, linked to official sources.",
    }),
  component: CollegesPage,
});

const ALL = "all";
type Filters = {
  type: CollegeType | typeof ALL;
  state: string;
  aid: AidPolicy | "unknown" | typeof ALL;
  test: TestPolicy | "unknown" | typeof ALL;
  band: Band | typeof ALL;
  q: string;
};
const EMPTY: Filters = { type: ALL, state: ALL, aid: ALL, test: ALL, band: ALL, q: "" };
const rankNum = (c: College) => Number(/#(\d+)/.exec(c.rank.label)?.[1] ?? 999);

function CollegesPage() {
  const colleges = useColleges();
  const [f, setF] = useState<Filters>(EMPTY);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v }));

  const states = useMemo(
    () => [...new Set(colleges.map((c) => c.state))].filter(Boolean).sort(),
    [colleges],
  );
  const list = useMemo(
    () =>
      colleges
        .filter(
          (c) =>
            (f.type === ALL || c.type === f.type) &&
            (f.state === ALL || c.state === f.state) &&
            (f.aid === ALL || (c.intlAidPolicy.value ?? "unknown") === f.aid) &&
            (f.test === ALL || (c.testPolicy.value ?? "unknown") === f.test) &&
            (f.band === ALL || band(c) === f.band) &&
            (!f.q || c.name.toLowerCase().includes(f.q.toLowerCase())),
        )
        .sort((a, b) => a.type.localeCompare(b.type) || rankNum(a) - rankNum(b)),
    [colleges, f],
  );
  const active = (Object.keys(EMPTY) as (keyof Filters)[]).filter((k) => f[k] !== EMPTY[k]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <PageHero
          title="US college directory"
          lead="Admit rates, test policy, aid for international students and costs in taka for the top US colleges. Every figure links to the college's own records."
        />

        <section className="tone-tint section-y">
          <div className="mx-auto max-w-[1200px] px-6 md:px-12">
            <Reveal className="max-w-3xl">
              <h2 className="type-h2 text-neutral-900">Find colleges that fit</h2>
              <p className="mt-5 type-body text-neutral-600">
                {COLLEGE_RANK_RULE} Figures come from each college's Common Data Set and its
                admissions and aid pages. If a college does not publish something, we write "{NP}"
                instead of guessing. Taka amounts use one rate: ৳{BDT_RATE.value}/USD on{" "}
                {fmtDate(BDT_RATE.date)} (
                <a
                  href={BDT_RATE.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline-offset-2 hover:underline"
                >
                  Bangladesh Bank
                </a>
                ).
              </p>
            </Reveal>

            <Reveal>
              <div className="section-body card-soft p-5 md:p-8">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Pick
                    label="Type"
                    value={f.type}
                    onChange={(v) => set("type", v as Filters["type"])}
                    options={[
                      [ALL, "All types"],
                      ["LAC", TYPE_LABEL.LAC],
                      ["NU", TYPE_LABEL.NU],
                    ]}
                  />
                  <Pick
                    label="State"
                    value={f.state}
                    onChange={(v) => set("state", v)}
                    options={[
                      [ALL, "All states"],
                      ...states.map((s) => [s, s] as [string, string]),
                    ]}
                  />
                  <Pick
                    label="Aid for international students"
                    value={f.aid}
                    onChange={(v) => set("aid", v as Filters["aid"])}
                    options={[
                      [ALL, "Any aid policy"],
                      ...(Object.keys(AID_LABEL) as AidPolicy[]).map(
                        (k) => [k, AID_LABEL[k]] as [string, string],
                      ),
                      ["unknown", NP],
                    ]}
                  />
                  <Pick
                    label="SAT/ACT policy"
                    value={f.test}
                    onChange={(v) => set("test", v as Filters["test"])}
                    options={[
                      [ALL, "Any test policy"],
                      ...(Object.keys(TEST_LABEL) as TestPolicy[]).map(
                        (k) => [k, TEST_LABEL[k]] as [string, string],
                      ),
                      ["unknown", NP],
                    ]}
                  />
                  <Pick
                    label="Admit rate"
                    value={f.band}
                    onChange={(v) => set("band", v as Filters["band"])}
                    options={[
                      [ALL, "Any admit rate"],
                      ...(Object.keys(BAND_LABEL) as Band[]).map(
                        (k) => [k, BAND_LABEL[k]] as [string, string],
                      ),
                    ]}
                  />
                  <div>
                    <label htmlFor="college-q" className="mb-1.5 block text-sm text-neutral-600">
                      Search
                    </label>
                    <input
                      id="college-q"
                      value={f.q}
                      onChange={(e) => set("q", e.target.value)}
                      placeholder="College name"
                      className="w-full rounded-xl border border-neutral-900/[0.08] bg-white px-3 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600">
                  <span aria-live="polite">
                    {list.length} {list.length === 1 ? "college" : "colleges"}
                  </span>
                  {active.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setF(EMPTY)}
                      className="inline-flex items-center gap-1 rounded-full bg-ice-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-ice-200"
                    >
                      Clear filters <X aria-hidden className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </Reveal>

            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <li key={c.slug} className="relative">
                  <CollegeCard c={c} />
                  {/* Outside the card link (no button inside a link), over the photo's right corner. */}
                  <div className="absolute right-3 top-3">
                    <SaveToList slug={c.slug} name={c.name} compact />
                  </div>
                </li>
              ))}
            </ul>
            {list.length === 0 && (
              <p className="mt-8 type-body text-neutral-600">
                No college matches these filters. Try clearing one.
              </p>
            )}
          </div>
        </section>

        <CtaBand title="Not sure which of these fit you?" action="Book a free strategy call" />
      </main>
      <Footer />
    </div>
  );
}

function CollegeCard({ c }: { c: College }) {
  const r = admitRate(c);
  return (
    <Link
      to="/colleges/$slug"
      params={{ slug: c.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-900/[0.08] bg-white transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_48px_rgb(4_28_49/0.08)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-blue-950">
        {c.image ? (
          <img
            src={c.image.card}
            alt=""
            width={640}
            height={400}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            style={{ objectPosition: c.imagePosition }}
          />
        ) : (
          <div
            aria-hidden
            className="h-full w-full bg-[radial-gradient(110%_80%_at_85%_0%,rgb(43_109_166/0.7)_0%,transparent_60%),linear-gradient(180deg,var(--color-blue-800),var(--color-blue-950))]"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-blue-900">
          {c.rank.label.replace(/ National .*$/, "")}{" "}
          {c.type === "LAC" ? "Liberal arts" : "National"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="type-h3 text-[1.125rem] leading-tight text-neutral-900">{c.name}</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {c.city}, {c.state}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <div>
            <dt className="text-neutral-500">Admit rate</dt>
            <dd className="font-medium text-neutral-900">{r != null ? `${r}%` : NP}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">SAT/ACT</dt>
            <dd className="font-medium text-neutral-900">
              {c.testPolicy.value ? TEST_LABEL[c.testPolicy.value].replace(/ \(.*\)$/, "") : NP}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-neutral-500">Aid for international students</dt>
            <dd className="font-medium text-neutral-900">
              {c.intlAidPolicy.value ? AID_LABEL[c.intlAidPolicy.value] : NP}
            </dd>
          </div>
        </dl>
        {isStale(c.asOf) && (
          <span className="mt-4 self-start rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
            Stale: checked {fmtDate(c.asOf)}
          </span>
        )}
      </div>
    </Link>
  );
}

function Pick({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  const id = "college-" + label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-neutral-600">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-neutral-900/[0.08] bg-white px-3 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 sm:text-sm"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
