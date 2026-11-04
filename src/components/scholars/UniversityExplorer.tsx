import { useCmsLookup } from "@/lib/cms";
import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { useMemo, useState } from "react";
import { Reveal } from "./Reveal";
import {
  UNIVERSITIES as CMS_DEFAULT_UNIVERSITIES,
  WA_LINK as CMS_DEFAULT_WA_LINK,
  type University,
} from "@/lib/scholars-data";
import { Search, X, ArrowRight } from "lucide-react";
import { ENABLED_COUNTRIES, isCountryEnabled } from "@/lib/site-content";

const COUNTRIES = ["All", ...ENABLED_COUNTRIES];
const SCHOLARSHIPS = [
  "All",
  "Need-Based 100%",
  "Need-Based",
  "Merit-Based",
  "Full Scholarship",
  "Limited Aid",
  "State University",
];
const TYPES = ["All", "Liberal Arts", "Research", "Technical/STEM", "Arts & Design"];
const TUITIONS = ["All", "Free", "$0-10k", "$10-30k", "$30k+"];

export function UniversityExplorer() {
  const cmsLabel = useCmsLookup();

  const UNIVERSITIES = useCmsValue("data.UNIVERSITIES", CMS_DEFAULT_UNIVERSITIES);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  const [country, setCountry] = useState("All");
  const [scholarship, setScholarship] = useState("All");
  const [type, setType] = useState("All");
  const [tuition, setTuition] = useState("All");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(8);
  const [selected, setSelected] = useState<University | null>(null);

  const filtered = useMemo(() => {
    return UNIVERSITIES.filter(
      (u) =>
        isCountryEnabled(u.country) &&
        (country === "All" || u.country === country) &&
        (scholarship === "All" || u.scholarship === scholarship) &&
        (type === "All" || u.type === type) &&
        (tuition === "All" || u.tuition === tuition) &&
        (search === "" || u.name.toLowerCase().includes(search.toLowerCase())),
    );
  }, [country, scholarship, type, tuition, search]);

  const clear = () => {
    setCountry("All");
    setScholarship("All");
    setType("All");
    setTuition("All");
    setSearch("");
  };

  const activeTags: { label: string; onRemove: () => void }[] = [];
  if (country !== "All") activeTags.push({ label: country, onRemove: () => setCountry("All") });
  if (scholarship !== "All")
    activeTags.push({ label: scholarship, onRemove: () => setScholarship("All") });
  if (type !== "All") activeTags.push({ label: type, onRemove: () => setType("All") });
  if (tuition !== "All") activeTags.push({ label: tuition, onRemove: () => setTuition("All") });

  return (
    <section id="universities" className="bg-white py-[clamp(96px,13vw,200px)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="hidden">
            <CmsText id="UniversityExplorer.0d7a9a83ef6d">University Explorer</CmsText>
          </span>
          <h2 className="type-h2 text-neutral-900">
            <CmsText id="UniversityExplorer.3bbe267caa26">Find Your Perfect Fit</CmsText>
          </h2>
          <p className="mt-5 type-lead text-neutral-600">
            <CmsText id="UniversityExplorer.87c9a85ac63f">
              Browse our curated list of US universities by scholarship availability and type. A
              starting point for your personalized college list.
            </CmsText>
          </p>
        </Reveal>

        {/* Filter bar */}
        <Reveal>
          <div className="mt-12 rounded-3xl border border-neutral-900/[0.08] bg-white p-6 shadow-[0_4px_16px_rgb(4_28_49/0.04)] md:p-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {COUNTRIES.length > 2 && (
                <Select
                  label={cmsLabel("UniversityExplorer.label.701d021d08c5", "Country")}
                  value={country}
                  onChange={setCountry}
                  options={COUNTRIES}
                />
              )}
              <Select
                label={cmsLabel("UniversityExplorer.label.100163c6400d", "Scholarship")}
                value={scholarship}
                onChange={setScholarship}
                options={SCHOLARSHIPS}
              />
              <Select
                label={cmsLabel("UniversityExplorer.label.baaddf70fb5d", "Type")}
                value={type}
                onChange={setType}
                options={TYPES}
              />
              <Select
                label={cmsLabel("UniversityExplorer.label.c03ee8c1dbae", "Tuition")}
                value={tuition}
                onChange={setTuition}
                options={TUITIONS}
              />
              <div className="relative">
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  <CmsText id="UniversityExplorer.49c266baaaa7">Search</CmsText>
                </label>
                <Search className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-neutral-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={cmsLabel(
                    "UniversityExplorer.label.d02ef87a95f7",
                    "University name…",
                  )}
                  className="w-full rounded-xl border border-neutral-900/[0.08] bg-white py-2.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                />
              </div>
            </div>
            {activeTags.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {activeTags.map((t) => (
                  <button
                    key={t.label}
                    onClick={t.onRemove}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ice-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-ice-200"
                  >
                    {t.label} <X className="h-3 w-3" />
                  </button>
                ))}
                <button
                  onClick={clear}
                  className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
                >
                  <CmsText id="UniversityExplorer.29a390f9237e">Clear all</CmsText>
                </button>
              </div>
            )}
            <div className="mt-4 text-sm text-neutral-500">
              {filtered.length}
              <CmsText id="UniversityExplorer.ebca61909226"> universities found</CmsText>
            </div>
          </div>
        </Reveal>

        {/* Results */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.slice(0, visible).map((u) => (
            <button
              key={u.name}
              onClick={() => setSelected(u)}
              className="group rounded-2xl border border-neutral-900/[0.08] bg-white p-5 text-left transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_48px_rgb(4_28_49/0.08)]"
            >
              <div className="flex items-start justify-between">
                <div className="text-3xl">{u.flag}</div>
                <span className="rounded-full bg-ice-100 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-blue-700">
                  {u.country}
                </span>
              </div>
              <h3 className="mt-4 type-h3 text-[1.0625rem] leading-tight text-neutral-900">
                {u.name}
              </h3>
              <div className="mt-3 space-y-1 text-[12px] text-neutral-600">
                <div>{u.type}</div>
                <div className="text-blue-700">{u.scholarship}</div>
                <div>
                  <CmsText id="UniversityExplorer.172b6f9f21d3">Acceptance: </CmsText>
                  {u.acceptance}
                </div>
              </div>
            </button>
          ))}
        </div>

        {filtered.length > visible && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisible((v) => v + 8)}
              className="rounded-full border-2 border-neutral-900/20 px-6 py-3 text-sm font-medium text-neutral-900 transition-all hover:bg-blue-700 hover:text-white"
            >
              <CmsText id="UniversityExplorer.8f9849c015cd">Load More Universities →</CmsText>
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-3xl bg-white p-8 shadow-[0_40px_80px_rgb(4_28_49/0.25)]"
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-900"
              aria-label={cmsLabel("UniversityExplorer.label.7d9eb7acb13e", "Close")}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-4xl">{selected.flag}</div>
            <h3 className="mt-3 type-h3 text-neutral-900">{selected.name}</h3>
            <div className="mt-1 text-sm text-neutral-500">
              {selected.country}
              <CmsText id="UniversityExplorer.a137f17a19a0"> · </CmsText>
              {selected.type}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <Fact
                label={cmsLabel("UniversityExplorer.label.e231b563d447", "Acceptance Rate")}
                value={selected.acceptance}
              />
              <Fact
                label={cmsLabel("UniversityExplorer.label.73607046c317", "Financial Aid")}
                value={selected.scholarship}
              />
              <Fact
                label={cmsLabel("UniversityExplorer.label.66b1b8c96dcf", "Tuition Range")}
                value={selected.tuition}
              />
              <Fact
                label={cmsLabel("UniversityExplorer.label.7a6cde09cd31", "University Type")}
                value={selected.type}
              />
            </div>
            <p className="mt-6 text-[14px] leading-relaxed text-neutral-600">
              {selected.name}
              <CmsText id="UniversityExplorer.192eae1272bb">
                {" "}
                is on our recommended list for our Full Scholarship and General Admission tracks.
                Talk to a mentor to understand application strategy, deadlines, and aid positioning.
              </CmsText>
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-700 px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-blue-800"
            >
              <CmsText id="UniversityExplorer.cdb1b2633afe">Apply with Scholars Cafe </CmsText>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const UNIVERSITIES = useCmsValue("data.UNIVERSITIES", CMS_DEFAULT_UNIVERSITIES);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-neutral-900/[0.08] bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  const UNIVERSITIES = useCmsValue("data.UNIVERSITIES", CMS_DEFAULT_UNIVERSITIES);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  return (
    <div className="rounded-xl bg-ice-50 p-3">
      <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </div>
      <div className="mt-1 font-medium text-neutral-900">{value}</div>
    </div>
  );
}

const UNIVERSITIES = CMS_DEFAULT_UNIVERSITIES;
const WA_LINK = CMS_DEFAULT_WA_LINK;
