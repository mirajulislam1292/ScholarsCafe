import { useMemo } from "react";
import { Check } from "lucide-react";
import { useCmsList } from "@/lib/cms";
import { DEFAULT_VALUES, REFLECTION_PROMPTS, type ValueCard } from "@/data/essay-tools";
import {
  Flash,
  ToolButton,
  copyText,
  downloadText,
  fieldClass,
  removeStored,
  useFlash,
  useStoredState,
} from "./shared";

const KEY = "sc-tools-values-v1";
type Saved = {
  step: 1 | 2 | 3 | 4;
  ten: string[];
  five: string[];
  three: string[];
  notes: Record<string, string>;
};
const EMPTY: Saved = { step: 1, ten: [], five: [], three: [], notes: {} };
const STEPS = [
  { n: 1, label: "Pick 10", need: 10 },
  { n: 2, label: "Narrow to 5", need: 5 },
  { n: 3, label: "Choose your top 3", need: 3 },
  { n: 4, label: "Reflect", need: 0 },
] as const;

export function CoreValues() {
  const cards = useCmsList<ValueCard>("toolValues", DEFAULT_VALUES, (d) => ({
    label: String(d.label || ""),
    hint: String(d.hint || ""),
  })).filter((c) => c.label);
  const [s, setS] = useStoredState<Saved>(KEY, EMPTY);
  const [msg, flash] = useFlash();
  const step = STEPS[s.step - 1];

  const pool: ValueCard[] = useMemo(() => {
    const byLabel = new Map(cards.map((c) => [c.label, c]));
    const get = (l: string) => byLabel.get(l) || { label: l, hint: "" };
    if (s.step === 1) return cards;
    if (s.step === 2) return s.ten.map(get);
    return s.five.map(get);
  }, [cards, s.step, s.ten, s.five]);
  const chosen = s.step === 1 ? s.ten : s.step === 2 ? s.five : s.three;
  const listKey = s.step === 1 ? "ten" : s.step === 2 ? "five" : "three";

  function toggle(label: string) {
    setS((p) => {
      const list = p[listKey] as string[];
      if (list.includes(label)) return { ...p, [listKey]: list.filter((l) => l !== label) };
      if (list.length >= step.need) return p;
      return { ...p, [listKey]: [...list, label] };
    });
  }

  const summary = () => {
    const lines = ["My core values (Scholars Cafe Core Values tool)", ""];
    s.three.forEach((v, i) => {
      lines.push(`${i + 1}. ${v}`);
      REFLECTION_PROMPTS.forEach((r, j) => {
        const note = (s.notes[`${v}::${j}`] || "").trim();
        if (note) lines.push(`   ${r.theme}: ${note}`);
      });
      lines.push("");
    });
    if (s.five.length)
      lines.push("Also important to me: " + s.five.filter((v) => !s.three.includes(v)).join(", "));
    return lines.join("\n").trim() + "\n";
  };

  return (
    <div className="print-area">
      <ol className="flex flex-wrap gap-2" aria-label="Steps">
        {STEPS.map((st) => (
          <li
            key={st.n}
            aria-current={st.n === s.step ? "step" : undefined}
            className={`type-caption rounded-full px-4 py-2 ${
              st.n === s.step
                ? "bg-blue-700 text-white"
                : st.n < s.step
                  ? "bg-ice-100 text-blue-900"
                  : "bg-white text-neutral-500 ring-1 ring-neutral-200"
            }`}
          >
            {st.n}. {st.label}
          </li>
        ))}
      </ol>

      {s.step < 4 ? (
        <>
          <p className="type-body mt-6 text-neutral-700">
            {s.step === 1 &&
              "Pick the 10 values that feel most like you. Go with your first reaction; you can change it later."}
            {s.step === 2 && "Now keep only 5. Ask yourself which ones you have actually acted on."}
            {s.step === 3 &&
              "Choose your top 3. These are the values you would want an admissions reader to notice without being told."}
          </p>
          <p className="type-caption mt-2 text-neutral-500" aria-live="polite">
            {chosen.length} of {step.need} selected
          </p>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pool.map((c) => {
              const on = chosen.includes(c.label);
              const full = !on && chosen.length >= step.need;
              return (
                <li key={c.label}>
                  <button
                    type="button"
                    aria-pressed={on}
                    disabled={full}
                    onClick={() => toggle(c.label)}
                    className={`flex h-full w-full items-start gap-3 rounded-2xl p-4 text-left transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      on
                        ? "bg-blue-700 text-white"
                        : "bg-white ring-1 ring-neutral-200 hover:ring-blue-600/40 disabled:opacity-45"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        on ? "bg-white text-blue-700" : "ring-1 ring-neutral-300"
                      }`}
                    >
                      {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{c.label}</span>
                      {c.hint && (
                        <span
                          className={`mt-1 block text-sm ${on ? "text-white/85" : "text-neutral-600"}`}
                        >
                          {c.hint}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            {s.step > 1 && (
              <ToolButton
                variant="ghost"
                onClick={() => setS((p) => ({ ...p, step: (p.step - 1) as Saved["step"] }))}
              >
                Back
              </ToolButton>
            )}
            <ToolButton
              variant="primary"
              disabled={chosen.length !== step.need}
              onClick={() =>
                setS((p) => ({
                  ...p,
                  step: (p.step + 1) as Saved["step"],
                  // Keep later picks only if they are still in the narrowed list.
                  five: p.step === 1 ? p.five.filter((v) => p.ten.includes(v)) : p.five,
                  three:
                    p.step <= 2
                      ? p.three.filter((v) => (p.step === 1 ? p.ten : p.five).includes(v))
                      : p.three,
                }))
              }
            >
              Continue
            </ToolButton>
          </div>
        </>
      ) : (
        <>
          <p className="type-body mt-6 text-neutral-700">
            Your top 3. For each one, answer the questions that spark a real memory. A few honest
            lines are enough; you are collecting material, not writing the essay yet.
          </p>
          <div className="mt-6 grid gap-6">
            {s.three.map((v, i) => (
              <section key={v} className="rounded-3xl bg-white p-6 ring-1 ring-neutral-200 md:p-8">
                <h3 className="type-h3 text-neutral-900">
                  {i + 1}. {v}
                </h3>
                <div className="mt-5 grid gap-5">
                  {REFLECTION_PROMPTS.map((r, j) => {
                    const id = `cv-${i}-${j}`;
                    return (
                      <div key={j}>
                        <label htmlFor={id} className="block text-[15px] text-neutral-800">
                          <span className="font-semibold">{r.theme}.</span>{" "}
                          {r.prompt.replaceAll("{value}", v.toLowerCase())}
                        </label>
                        <textarea
                          id={id}
                          rows={2}
                          value={s.notes[`${v}::${j}`] || ""}
                          onChange={(e) =>
                            setS((p) => ({
                              ...p,
                              notes: { ...p.notes, [`${v}::${j}`]: e.target.value },
                            }))
                          }
                          className={`${fieldClass} mt-2`}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          <div className="no-print mt-6 flex flex-wrap gap-3">
            <ToolButton variant="ghost" onClick={() => setS((p) => ({ ...p, step: 3 }))}>
              Back
            </ToolButton>
            <ToolButton
              variant="primary"
              onClick={async () =>
                flash(
                  (await copyText(summary()))
                    ? "Copied to clipboard."
                    : "Copy failed. Try Save as text.",
                )
              }
            >
              Copy summary
            </ToolButton>
            <ToolButton onClick={() => downloadText("my-core-values.txt", summary())}>
              Save as text
            </ToolButton>
            <ToolButton onClick={() => window.print()}>Print</ToolButton>
          </div>
          <p className="type-body mt-6 text-neutral-700">
            Want help turning these into an essay?{" "}
            <a
              href="/book"
              className="font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-900"
            >
              Book a meeting with a mentor
            </a>
            .
          </p>
        </>
      )}
      <div className="no-print mt-4 flex flex-wrap items-center gap-3">
        <ToolButton
          variant="ghost"
          onClick={() => {
            if (!window.confirm("Clear your values and notes on this device?")) return;
            removeStored(KEY);
            setS(EMPTY);
            flash("Cleared.");
          }}
        >
          Start over
        </ToolButton>
        <Flash msg={msg} />
      </div>
      <p className="type-caption mt-2 text-neutral-500">
        Saved only in this browser. Nothing is sent to Scholars Cafe.
      </p>
    </div>
  );
}
