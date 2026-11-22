import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useCmsList } from "@/lib/cms";
import { ESSAY_PROMPTS, type EssayPrompt, type PromptArchetype } from "@/data/essay-prompts";
import { ARCHETYPE_LABEL, DEFAULT_ANGLES, type PromptAngle } from "@/data/essay-tools";
import { fieldClass } from "./shared";

const ARCHS = Object.keys(ARCHETYPE_LABEL) as PromptArchetype[];
const BANDS = [
  { id: "", label: "Any length" },
  { id: "short", label: "Up to 100 words", test: (n: number | null) => n !== null && n <= 100 },
  {
    id: "mid",
    label: "101 to 250 words",
    test: (n: number | null) => n !== null && n > 100 && n <= 250,
  },
  {
    id: "long",
    label: "251 to 400 words",
    test: (n: number | null) => n !== null && n > 250 && n <= 400,
  },
  { id: "xl", label: "Over 400 words", test: (n: number | null) => n !== null && n > 400 },
  { id: "none", label: "No word limit given", test: (n: number | null) => n === null },
] as const;

const str = (v: unknown) => (typeof v === "string" ? v : "");
function fromCms(d: Record<string, unknown>, id: string): EssayPrompt {
  const required = d.required === "optional" || d.required === "none" ? d.required : "required";
  const wl = typeof d.wordLimit === "number" && d.wordLimit > 0 ? d.wordLimit : null;
  return {
    id,
    college: str(d.college),
    list: d.list === "nu" ? "nu" : "lac",
    cycle: str(d.cycle) || "2026-27",
    text: str(d.text),
    wordLimit: wl,
    limitNote: str(d.limitNote) || null,
    required,
    archetype: (ARCHS as string[]).includes(str(d.archetype))
      ? (d.archetype as PromptArchetype)
      : "other",
    source: str(d.source),
    asOf: str(d.asOf),
    noSupplement: required === "none",
    position: typeof d.position === "number" ? d.position : 0,
  };
}

const formatDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00Z");
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
};

export function PromptBank() {
  const prompts = useCmsList<EssayPrompt>("prompts", ESSAY_PROMPTS, fromCms).filter(
    (p) => p.college && p.text && p.source,
  );
  const angles = useCmsList<PromptAngle>("promptAngles", DEFAULT_ANGLES, (d) => ({
    archetype: (ARCHS as string[]).includes(str(d.archetype))
      ? (d.archetype as PromptArchetype)
      : "other",
    angle: str(d.angle),
  })).filter((a) => a.angle);

  const [college, setCollege] = useState("");
  const [band, setBand] = useState("");
  const [cycle, setCycle] = useState("");
  const [arch, setArch] = useState<PromptArchetype | "">("");

  const colleges = useMemo(
    () => [...new Set(prompts.map((p) => p.college))].sort((a, b) => a.localeCompare(b)),
    [prompts],
  );
  const cycles = useMemo(
    () => [...new Set(prompts.map((p) => p.cycle))].sort().reverse(),
    [prompts],
  );
  const bandTest = BANDS.find((b) => b.id === band);
  const shown = prompts.filter(
    (p) =>
      (!college || p.college === college) &&
      (!cycle || p.cycle === cycle) &&
      (!arch || (!p.noSupplement && p.archetype === arch)) &&
      (!band || (!p.noSupplement && bandTest && "test" in bandTest && bandTest.test(p.wordLimit))),
  );
  const groups = useMemo(() => {
    const m = new Map<string, EssayPrompt[]>();
    for (const p of shown) m.set(p.college, [...(m.get(p.college) || []), p]);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [shown]);
  const reset = () => {
    setCollege("");
    setBand("");
    setCycle("");
    setArch("");
  };

  return (
    <div>
      <p className="type-body text-neutral-700">
        Supplemental essay prompts from the top 35 liberal arts colleges and top 30 national
        universities in the U.S. News 2027 rankings. Each one is quoted word for word from the
        college's own website, with a link so you can check it.
      </p>

      <form
        className="mt-6 grid gap-4 rounded-3xl bg-ice-50 p-5 sm:grid-cols-2 lg:grid-cols-4 md:p-6"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Filter prompts"
      >
        <Select id="pb-college" label="College" value={college} onChange={setCollege}>
          <option value="">All colleges ({colleges.length})</option>
          {colleges.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          id="pb-type"
          label="Prompt type"
          value={arch}
          onChange={(v) => setArch(v as PromptArchetype | "")}
        >
          <option value="">All types</option>
          {ARCHS.map((a) => (
            <option key={a} value={a}>
              {ARCHETYPE_LABEL[a]}
            </option>
          ))}
        </Select>
        <Select id="pb-band" label="Word limit" value={band} onChange={setBand}>
          {BANDS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </Select>
        <Select id="pb-cycle" label="Cycle" value={cycle} onChange={setCycle}>
          <option value="">All cycles</option>
          {cycles.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="type-caption text-neutral-600" aria-live="polite">
          {shown.length} {shown.length === 1 ? "entry" : "entries"} from {groups.length}{" "}
          {groups.length === 1 ? "college" : "colleges"}
        </p>
        {(college || band || cycle || arch) && (
          <button
            type="button"
            onClick={reset}
            className="type-caption text-blue-700 underline underline-offset-4 hover:text-blue-900"
          >
            Clear filters
          </button>
        )}
      </div>

      {arch && <AngleList arch={arch} angles={angles.filter((a) => a.archetype === arch)} />}

      <div className="mt-6 grid gap-5">
        {groups.length === 0 && (
          <p className="type-body rounded-3xl border border-dashed border-blue-600/25 bg-ice-50 p-8 text-neutral-600">
            No prompts match these filters yet.
          </p>
        )}
        {groups.map(([name, items]) => (
          <section key={name} className="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 md:p-7">
            <h3 className="type-h3 text-neutral-900">{name}</h3>
            <ul className="mt-4 grid gap-4">
              {items.map((p) => (
                <li
                  key={p.id}
                  className="border-t border-neutral-100 pt-4 first:border-0 first:pt-0"
                >
                  {p.noSupplement ? (
                    <p className="text-[16px] text-neutral-800">
                      No supplemental essays for {p.cycle}.
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{ARCHETYPE_LABEL[p.archetype]}</Badge>
                        <Badge tone={p.required === "optional" ? "plain" : "blue"}>
                          {p.required === "optional" ? "Optional" : "Required"}
                        </Badge>
                        {p.wordLimit !== null && <Badge tone="plain">{p.wordLimit} words</Badge>}
                        {p.limitNote && <Badge tone="plain">{p.limitNote}</Badge>}
                      </div>
                      <blockquote className="mt-3 whitespace-pre-line break-words text-[16px] leading-relaxed text-neutral-800">
                        {p.text}
                      </blockquote>
                    </>
                  )}
                  <p className="type-caption mt-2 text-neutral-500">
                    {p.cycle} · checked {formatDate(p.asOf)} ·{" "}
                    <a
                      href={p.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-700 underline underline-offset-4 hover:text-blue-900"
                    >
                      Source
                      <ExternalLink aria-hidden className="h-3 w-3" />
                      <span className="sr-only">(opens {name}'s website)</span>
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="type-caption mt-6 text-neutral-500">
        Prompts are © each college and quoted here for guidance only. Colleges can change them at
        any time, so always confirm on the college's own page or in the application before you
        write.
      </p>

      {!arch && (
        <div className="mt-10">
          <h3 className="type-h3 text-neutral-900">Ways in, by prompt type</h3>
          <p className="mt-2 text-[15px] text-neutral-600">
            Our mentors' starting points. Pick a type above to see only its ideas.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {ARCHS.map((a) => (
              <details key={a} className="group rounded-3xl bg-ice-50 p-5 md:p-6">
                <summary className="cursor-pointer list-none text-[16px] font-semibold text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  {ARCHETYPE_LABEL[a]}
                  <span aria-hidden className="ml-2 text-blue-700 group-open:hidden">
                    +
                  </span>
                  <span aria-hidden className="ml-2 hidden text-blue-700 group-open:inline">
                    −
                  </span>
                </summary>
                <ul className="mt-3 grid list-disc gap-2 pl-5 text-[15px] leading-relaxed text-neutral-700">
                  {angles
                    .filter((x) => x.archetype === a)
                    .map((x, i) => (
                      <li key={i}>{x.angle}</li>
                    ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AngleList({ arch, angles }: { arch: PromptArchetype; angles: PromptAngle[] }) {
  if (!angles.length) return null;
  return (
    <section className="mt-6 rounded-3xl bg-blue-950 p-6 text-white md:p-8">
      <h3 className="type-h3">Ways into a {ARCHETYPE_LABEL[arch]} prompt</h3>
      <ul className="mt-4 grid list-disc gap-2 pl-5 text-[15px] leading-relaxed text-white/85">
        {angles.map((a, i) => (
          <li key={i}>{a.angle}</li>
        ))}
      </ul>
    </section>
  );
}

function Select({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-[15px] font-semibold text-neutral-800">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} mt-2`}
      >
        {children}
      </select>
    </div>
  );
}

function Badge({
  children,
  tone = "ice",
}: {
  children: React.ReactNode;
  tone?: "ice" | "blue" | "plain";
}) {
  const c = {
    ice: "bg-ice-100 text-blue-900",
    blue: "bg-blue-700 text-white",
    plain: "bg-white text-neutral-700 ring-1 ring-neutral-200",
  }[tone];
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[13px] font-medium ${c}`}>
      {children}
    </span>
  );
}
