import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { Turnstile, turnstileEnabled, resetTurnstile } from "@/components/scholars/Turnstile";

// Public form page: scholarscafe.com/forms/<slug>. The page is pre-rendered once as a shell (/forms/_) and
// .htaccess serves it for every slug; the form itself loads from the admin API. Validation is repeated on the server.
export const Route = createFileRoute("/forms/$slug")({
  head: () => ({ meta: [{ title: "Scholars Cafe" }, { name: "robots", content: "noindex" }] }),
  component: FormPage,
});

type Field = {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: string[];
  max_length?: number;
  show_if?: { field: string; equals: string } | null;
};
type Form = {
  title: string;
  intro: string;
  definition: { steps: { title: string; fields: Field[] }[] };
};
type Answer = string | string[] | boolean;
const API = import.meta.env.VITE_CONTENT_API || "https://admin.scholarscafe.com";
const INPUT =
  "w-full rounded-2xl border border-neutral-900/10 bg-white px-4 py-3 text-neutral-900 outline-none transition-[border-color,box-shadow] duration-300 focus:border-blue-700 focus:shadow-[0_0_0_4px_rgb(43_109_166/0.12)]";

const shown = (f: Field, a: Record<string, Answer>) => {
  if (!f.show_if) return true;
  const v = a[f.show_if.field];
  return Array.isArray(v) ? v.includes(f.show_if.equals) : String(v ?? "") === f.show_if.equals;
};
function check(f: Field, v: Answer | undefined): string {
  const empty = v === undefined || v === "" || v === false || (Array.isArray(v) && !v.length);
  if (empty) return f.required ? "Required." : "";
  if (typeof v !== "string") return "";
  const s = v.trim();
  if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return "Enter a valid email.";
  if (f.type === "phone" && !/^[+0-9 ()-]{6,30}$/.test(s)) return "Enter a valid phone number.";
  if (f.type === "url" && !/^https:\/\//.test(s)) return "Enter an https:// link.";
  if (f.type === "number" && !/^-?\d+(\.\d+)?$/.test(s)) return "Enter a number.";
  return "";
}

function FormPage() {
  const [slug, setSlug] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [missing, setMissing] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Read the slug from the real address (the HTML shell was rendered for /forms/_).
    const s = decodeURIComponent(location.pathname.split("/")[2] || "");
    setSlug(s);
    if (!/^[a-z0-9-]{1,60}$/.test(s)) return setMissing(true);
    fetch(`${API}/public/forms/${s}`, { credentials: "omit" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((f: Form) => {
        setForm(f);
        document.title = f.title + " · Scholars Cafe";
      })
      .catch(() => setMissing(true));
  }, []);

  const steps = form?.definition.steps ?? [];
  const fields = (i: number) => steps[i]?.fields.filter((f) => shown(f, answers)) ?? [];
  const validate = (i: number) => {
    const e: Record<string, string> = {};
    for (const f of fields(i)) {
      const m = check(f, answers[f.id]);
      if (m) e[f.id] = m;
    }
    setErrors(e);
    if (Object.keys(e).length) document.getElementById("field-" + Object.keys(e)[0])?.focus();
    return !Object.keys(e).length;
  };
  const set = (id: string, v: Answer) => setAnswers((a) => ({ ...a, [id]: v }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!validate(step)) return;
    if (step < steps.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const visible = Object.fromEntries(
      steps
        .flatMap((s) => s.fields)
        .filter((f) => shown(f, answers) && f.id in answers)
        .map((f) => [f.id, answers[f.id]]),
    );
    const data = new FormData(event.currentTarget);
    setSending(true);
    try {
      const r = await fetch(`${API}/public/forms/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({
          answers: visible,
          website: String(data.get("website") || ""),
          ...(turnstileEnabled
            ? { turnstileToken: String(data.get("cf-turnstile-response") || "") }
            : {}),
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (j.fields) setErrors(j.fields);
        throw new Error(j.error || "Couldn't send. Please try again.");
      }
      setDone(j.message || "Thank you!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send.");
      resetTurnstile();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-ice-50">
      <Navbar />
      {/* Dark band behind the navbar (it is styled for the site's dark page headers). */}
      <div aria-hidden className="h-[clamp(220px,26vw,300px)] bg-blue-950" />
      <main className="relative mx-auto -mt-[clamp(110px,13vw,150px)] max-w-[680px] px-6 pb-24">
        {!form && !missing && (
          <p className="type-body rounded-3xl bg-white p-7 text-neutral-500 md:p-12">Loading…</p>
        )}
        {missing && (
          <div className="rounded-3xl bg-white p-7 md:p-12">
            <h1 className="type-h2 text-neutral-900">This form isn't available.</h1>
            <p className="type-body mt-4 text-neutral-600">
              It may have closed. You can always reach us from the contact page.
            </p>
            <a href="/contact" className="type-button mt-8 inline-flex text-blue-700">
              Contact us →
            </a>
          </div>
        )}
        {form && done && (
          <div role="status" className="rounded-3xl bg-white p-7 md:p-12">
            <h1 className="type-h2 text-neutral-900">Sent.</h1>
            <p className="type-lead mt-4 text-neutral-600">{done}</p>
          </div>
        )}
        {form && !done && (
          <form
            onSubmit={submit}
            noValidate
            className="rounded-3xl border border-neutral-900/[0.06] bg-white p-7 md:p-12"
          >
            <h1 className="type-h2 text-neutral-900">{form.title}</h1>
            {form.intro && (
              <p className="type-body mt-4 whitespace-pre-line text-neutral-600">{form.intro}</p>
            )}
            {steps.length > 1 && (
              <p className="type-caption mt-8 text-blue-700" aria-live="polite">
                Step {step + 1} of {steps.length}
                {steps[step].title ? " · " + steps[step].title : ""}
              </p>
            )}
            <div className="mt-8 grid gap-7">
              {fields(step).map((f) => (
                <FieldInput
                  key={f.id}
                  f={f}
                  value={answers[f.id]}
                  error={errors[f.id]}
                  onChange={(v) => set(f.id, v)}
                />
              ))}
            </div>
            {/* Honeypot: hidden from people, filled in by bots. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />
            {step === steps.length - 1 && <Turnstile />}
            {error && (
              <p role="alert" className="type-body mt-6 text-red-700">
                {error}
              </p>
            )}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="type-button h-12 rounded-full border border-neutral-900/10 px-6 text-neutral-800"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={sending}
                className="type-button h-12 rounded-full bg-blue-950 px-7 text-white transition-[background-color] duration-500 ease-premium hover:bg-blue-900 disabled:opacity-60"
              >
                {step < steps.length - 1 ? "Continue" : sending ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

function FieldInput({
  f,
  value,
  error,
  onChange,
}: {
  f: Field;
  value: Answer | undefined;
  error?: string;
  onChange: (v: Answer) => void;
}) {
  const id = "field-" + f.id;
  const describedBy =
    [f.help ? id + "-help" : "", error ? id + "-error" : ""].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
    required: f.required,
  };
  const label = (
    <span className="type-body font-medium text-neutral-900">
      {f.label}
      {f.required && <span className="text-blue-700"> *</span>}
    </span>
  );
  let control;
  if (f.type === "textarea")
    control = (
      <textarea
        {...common}
        rows={5}
        maxLength={f.max_length || 5000}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT}
      />
    );
  else if (f.type === "select")
    control = (
      <select
        {...common}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT}
      >
        <option value="">Choose…</option>
        {f.options?.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  else if (f.type === "radio" || f.type === "checkbox") {
    const many = f.type === "checkbox";
    const list = Array.isArray(value) ? value : [];
    return (
      <fieldset aria-describedby={describedBy}>
        <legend>{label}</legend>
        <div className="mt-3 grid gap-2">
          {f.options?.map((o) => (
            <label
              key={o}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-900/10 px-4 py-3 has-[:checked]:border-blue-700 has-[:checked]:bg-ice-50"
            >
              <input
                type={many ? "checkbox" : "radio"}
                name={f.id}
                checked={many ? list.includes(o) : value === o}
                onChange={() =>
                  onChange(
                    many ? (list.includes(o) ? list.filter((x) => x !== o) : [...list, o]) : o,
                  )
                }
                className="accent-blue-700"
              />
              <span className="type-body text-neutral-800">{o}</span>
            </label>
          ))}
        </div>
        {f.help && (
          <p id={id + "-help"} className="type-caption mt-2 text-neutral-500">
            {f.help}
          </p>
        )}
        {error && (
          <p id={id + "-error"} className="type-caption mt-2 text-red-700">
            {error}
          </p>
        )}
      </fieldset>
    );
  } else if (f.type === "consent")
    return (
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            {...common}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-1 accent-blue-700"
          />
          {label}
        </label>
        {error && (
          <p id={id + "-error"} className="type-caption mt-2 text-red-700">
            {error}
          </p>
        )}
      </div>
    );
  else
    control = (
      <input
        {...common}
        type={
          { email: "email", phone: "tel", number: "text", date: "date", url: "url" }[f.type] ||
          "text"
        }
        inputMode={f.type === "number" ? "decimal" : undefined}
        autoComplete={{ email: "email", phone: "tel" }[f.type]}
        placeholder={f.placeholder}
        maxLength={f.max_length || 300}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT}
      />
    );
  return (
    <label htmlFor={id} className="grid gap-2">
      {label}
      {control}
      {f.help && (
        <span id={id + "-help"} className="type-caption text-neutral-500">
          {f.help}
        </span>
      )}
      {error && (
        <span id={id + "-error"} className="type-caption text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}
