import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import {
  ACTION_VERBS,
  ACTIVITY_LIMITS as L,
  ACTIVITY_LIMITS_SOURCE,
  ARTICLES,
  FILLER_WORDS,
  IMPACT_TEMPLATES,
} from "@/data/essay-tools";
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

const KEY = "sc-tools-activities-v1";
type Activity = { id: string; position: string; organization: string; description: string };
const blank = (): Activity => ({
  id: Math.random().toString(36).slice(2, 10),
  position: "",
  organization: "",
  description: "",
});

// Fixed id for the first card so server and browser render the same markup.
const FIRST: Activity[] = [{ id: "first", position: "", organization: "", description: "" }];
const escape = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Remove filler words (and optionally articles), then tidy spaces and punctuation. */
export function trimFiller(text: string, articles: boolean) {
  const words = [...FILLER_WORDS, ...(articles ? ARTICLES : [])].sort(
    (a, b) => b.length - a.length,
  );
  let out = text;
  for (const w of words) out = out.replace(new RegExp(`\\b${escape(w)}\\b\\s*`, "gi"), "");
  return out
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function Counter({ value, max }: { value: string; max: number }) {
  const n = value.length;
  const over = n > max;
  return (
    <span
      className={`type-caption tabular-nums ${over ? "font-semibold text-red-700" : n > max * 0.9 ? "text-amber-700" : "text-neutral-500"}`}
    >
      {n}/{max}
      {over && <span className="sr-only"> characters, over the limit</span>}
    </span>
  );
}

export function ActivityOptimizer() {
  const [list, setList] = useStoredState<Activity[]>(KEY, FIRST);
  const [articles, setArticles] = useState(false);
  const [msg, flash] = useFlash();

  const update = (id: string, patch: Partial<Activity>) =>
    setList((p) => p.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const move = (i: number, d: -1 | 1) =>
    setList((p) => {
      const j = i + d;
      if (j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const asText = () =>
    list
      .filter((a) => a.position || a.organization || a.description)
      .map((a, i) => `${i + 1}. ${a.position}\n   ${a.organization}\n   ${a.description}`)
      .join("\n\n") + "\n";

  return (
    <div>
      <p className="type-body text-neutral-700">
        Common App gives you up to {L.max} activities, with {L.position} characters for your
        position, {L.organization} for the organisation and {L.description} for the description.
        Counters turn red when you go over.{" "}
        <a
          href={ACTIVITY_LIMITS_SOURCE.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline underline-offset-4 hover:text-blue-900"
        >
          Source: {ACTIVITY_LIMITS_SOURCE.label}
        </a>
        .
      </p>

      <ol className="mt-6 grid gap-5">
        {list.map((a, i) => {
          const pid = `act-${a.id}`;
          return (
            <li key={a.id} className="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="type-h3 text-neutral-900">Activity {i + 1}</h3>
                <div className="flex gap-1">
                  <IconBtn
                    label={`Move activity ${i + 1} up`}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn
                    label={`Move activity ${i + 1} down`}
                    disabled={i === list.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn
                    label={`Delete activity ${i + 1}`}
                    disabled={list.length === 1}
                    onClick={() => setList((p) => p.filter((x) => x.id !== a.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
              <div className="mt-4 grid gap-4">
                <Field
                  id={`${pid}-p`}
                  label="Position / leadership"
                  value={a.position}
                  max={L.position}
                  onChange={(v) => update(a.id, { position: v })}
                />
                <Field
                  id={`${pid}-o`}
                  label="Organisation name"
                  value={a.organization}
                  max={L.organization}
                  onChange={(v) => update(a.id, { organization: v })}
                />
                <Field
                  id={`${pid}-d`}
                  label="Description: what you did, honours, results"
                  value={a.description}
                  max={L.description}
                  multi
                  onChange={(v) => update(a.id, { description: v })}
                />
                <div className="flex flex-wrap gap-2">
                  <ToolButton
                    onClick={() => {
                      const next = trimFiller(a.description, articles);
                      update(a.id, { description: next });
                      flash(
                        next === a.description
                          ? "Nothing to trim."
                          : `Trimmed ${a.description.length - next.length} characters.`,
                      );
                    }}
                    ariaLabel={`Trim filler words in activity ${i + 1}`}
                  >
                    Trim filler words
                  </ToolButton>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ToolButton
          variant="primary"
          disabled={list.length >= L.max}
          onClick={() => setList((p) => [...p, blank()])}
        >
          Add activity ({list.length}/{L.max})
        </ToolButton>
        <ToolButton
          onClick={async () =>
            flash(
              (await copyText(asText()))
                ? "Copied all activities."
                : "Copy failed. Try Save as text.",
            )
          }
        >
          Copy all
        </ToolButton>
        <ToolButton onClick={() => downloadText("my-activities.txt", asText())}>
          Save as text
        </ToolButton>
        <ToolButton
          variant="ghost"
          onClick={() => {
            if (!window.confirm("Clear all activities on this device?")) return;
            removeStored(KEY);
            setList(FIRST);
            flash("Cleared.");
          }}
        >
          Start over
        </ToolButton>
      </div>
      <label className="mt-4 flex items-center gap-3 text-[15px] text-neutral-700">
        <input
          type="checkbox"
          checked={articles}
          onChange={(e) => setArticles(e.target.checked)}
          className="h-4 w-4"
        />
        Also remove “a”, “an” and “the” when trimming (common in activity lists)
      </label>
      <Flash msg={msg} />
      <p className="type-caption text-neutral-500">
        Saved only in this browser. Nothing is sent to Scholars Cafe.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-ice-50 p-6 md:p-8">
          <h3 className="type-h3 text-neutral-900">Strong verbs to start with</h3>
          <div className="mt-4 grid gap-4">
            {ACTION_VERBS.map((g) => (
              <div key={g.group}>
                <h4 className="text-[15px] font-semibold text-neutral-800">{g.group}</h4>
                <p className="mt-1 text-[15px] leading-relaxed text-neutral-600">
                  {g.verbs.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-3xl bg-ice-50 p-6 md:p-8">
          <h3 className="type-h3 text-neutral-900">Impact templates</h3>
          <p className="mt-2 text-[15px] text-neutral-600">
            Fill the brackets with your own facts. Numbers make a line easy to believe.
          </p>
          <ul className="mt-4 grid gap-4">
            {IMPACT_TEMPLATES.map((t) => (
              <li key={t.label}>
                <h4 className="text-[15px] font-semibold text-neutral-800">{t.label}</h4>
                <p className="mt-1 break-words font-mono text-[13px] text-blue-900">{t.template}</p>
                <p className="mt-1 text-[15px] text-neutral-600">e.g. {t.example}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  max,
  multi,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  max: number;
  multi?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[15px] font-semibold text-neutral-800">
          {label}
        </label>
        <Counter value={value} max={max} />
      </div>
      {multi ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} mt-2`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} mt-2`}
        />
      )}
    </div>
  );
}

function IconBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 ring-1 ring-neutral-200 transition-colors hover:bg-ice-100 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-35"
    >
      {children}
    </button>
  );
}
