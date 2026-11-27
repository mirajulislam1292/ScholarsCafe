import { createFileRoute } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Check, Download, Lock, Mail, PenLine, ShieldCheck, Type, Undo2 } from "lucide-react";
import "@/styles/signature-font.css";

// Private signing page: scholarscafe.com/sign/<token>. Pre-rendered once as a shell (/sign/_) and served for
// every token by .htaccess, so no token is ever pre-rendered. Everything loads in the browser from the admin
// API (/public/sign/…), which only answers this website. The recipient first proves it's them with a
// 6-digit code sent to the invited email (or their student portal sign-in), then fills in, signs and submits.
export const Route = createFileRoute("/sign/$token")({
  head: () => ({
    meta: [
      { title: "Sign Agreement | Scholars Cafe" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: SignPage,
});

const API = import.meta.env.VITE_CONTENT_API || "https://admin.scholarscafe.com";
const PORTAL = import.meta.env.VITE_STUDENT_PORTAL || "https://student.scholarscafe.com";
const CONTACT = "contact@scholarscafe.com";
const INK = "#0b2a4a";
const PH = /\{\{\s*([a-z][a-z0-9_]{0,39})\s*\}\}/g;

type Field = {
  key: string;
  label: string;
  type: string;
  recipient: boolean;
  required: boolean;
  sensitive: boolean;
  value: string;
};
type Summary = {
  state: string;
  ref: string;
  title: string;
  issued: string;
  expires: string;
  firstName: string;
  email: string;
  signed: { docId: string; signedAt: string } | null;
};
type Signed = {
  docId: string;
  signedAt: string;
  signedDate: string;
  values: Record<string, string>;
  signature: string;
};
type Doc = {
  state: string;
  ref: string;
  title: string;
  subtitle: string;
  body: string;
  issued: string;
  expires: string;
  today: string;
  recipientName: string;
  recipientEmail: string;
  consentText: string;
  fields: Field[];
  signed: Signed | null;
};

class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
async function call<T>(path: string, body?: unknown): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${API}/public/sign/${path}`, {
      method: body === undefined ? "GET" : "POST",
      credentials: "omit",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("No connection. Check your internet and try again.", 0);
  }
  const j = await r.json().catch(() => null);
  if (!r.ok)
    throw new ApiError(
      j?.error || "Something went wrong. Please try again in a moment.",
      r.status,
      j?.fields,
    );
  return j as T;
}

// The same checks the server makes (agreements-text.js checkValue).
function checkValue(f: Field, raw: string | undefined): string {
  const v = (raw || "").trim();
  if (!v) return f.required ? `Enter your ${f.label.toLowerCase()}.` : "";
  if (v.length > 300) return "Keep this under 300 characters.";
  if (f.key === "name" && v.length < 2) return "Enter your full name as on your ID.";
  if ((f.key === "email" || f.type === "email") && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))
    return "Enter a valid email address.";
  if (f.key === "phone" || f.type === "tel")
    if (!/^[+0-9 ()-]{6,30}$/.test(v) || (v.match(/\d/g) || []).length < 10)
      return "Enter a phone number with country code.";
  if (f.key === "id_number" && !/^[A-Za-z0-9 -]{6,30}$/.test(v))
    return "Enter your NID or passport number.";
  return "";
}
const HINTS: Record<string, { placeholder: string; auto: string; type: string }> = {
  name: { placeholder: "As on your NID or passport", auto: "name", type: "text" },
  email: { placeholder: "you@example.com", auto: "email", type: "email" },
  phone: { placeholder: "+880 1XXX XXXXXX", auto: "tel", type: "tel" },
  id_number: { placeholder: "e.g. A01234567", auto: "off", type: "text" },
  cohort: { placeholder: "e.g. Student, Fall 2027 intake", auto: "off", type: "text" },
};

function readStored(token: string) {
  try {
    return sessionStorage.getItem("sc-sign:" + token.slice(0, 16)) || "";
  } catch {
    return "";
  }
}
function store(token: string, proof: string) {
  try {
    if (proof) sessionStorage.setItem("sc-sign:" + token.slice(0, 16), proof);
    else sessionStorage.removeItem("sc-sign:" + token.slice(0, 16));
  } catch {
    /* private mode: the proof just lives in memory */
  }
}

function SignPage() {
  const [token, setToken] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [proof, setProof] = useState("");
  const [error, setError] = useState("");
  const [portalNote, setPortalNote] = useState("");
  const [justSigned, setJustSigned] = useState<Signed | null>(null);
  const [detailsDone, setDetailsDone] = useState(false);

  const openDoc = useCallback(async (t: string, p: string) => {
    try {
      const d = await call<Doc>(`${t}/document`, { proof: p });
      setDoc(d);
      setProof(p);
      store(t, p);
    } catch (e) {
      store(t, "");
      setProof("");
      if (e instanceof ApiError && e.status !== 401) setError(e.message);
    }
  }, []);

  useEffect(() => {
    const t = decodeURIComponent(location.pathname.split("/")[2] || "");
    setToken(t);
    if (!/^[0-9a-f]{64}$/.test(t)) {
      setError("This link is not valid. Check that you opened the whole link from your email.");
      return;
    }
    // Back from the student portal: #proof=… (signed in with the invited email) or #portal=…
    const hash = new URLSearchParams(location.hash.slice(1));
    if (location.hash) history.replaceState(null, "", location.pathname);
    const portal = hash.get("portal");
    if (portal === "signin")
      setPortalNote("You're not signed in to the student portal. Use the email code instead.");
    if (portal === "mismatch")
      setPortalNote(
        "Your student portal account uses a different email. Use the code sent to the invited email.",
      );
    const p = /^[0-9a-f]{64}$/.test(hash.get("proof") || "") ? hash.get("proof")! : readStored(t);
    call<Summary>(t)
      .then((s) => {
        setSummary(s);
        if (p) return openDoc(t, p);
      })
      .catch((e: Error) => setError(e.message));
  }, [openDoc]);

  const signed = justSigned || doc?.signed || null;
  const step1Done = Boolean(signed) || detailsDone;

  return (
    <div className="min-h-screen bg-[#eef3f7] font-display text-blue-950">
      <header className="sticky top-0 z-10 border-b border-[#dbe5ee] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 lg:px-8">
          <Wordmark />
          {doc && (
            <div className="order-3 w-full md:order-2 md:w-auto">
              <ProgressSteps step1Done={step1Done} signed={Boolean(signed)} live={!signed} />
            </div>
          )}
          <span className="order-2 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[12px] font-medium text-blue-800 md:order-3">
            <Lock size={13} aria-hidden="true" /> Private Document
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-[1160px] px-4 py-6 lg:px-8 lg:py-10">
        {error ? (
          <Notice title="This link can't be opened" text={error} />
        ) : !summary ? (
          <p className="py-16 text-center text-[14px] text-ice-700" role="status">
            Opening your agreement…
          </p>
        ) : doc && signed ? (
          <Confirmation
            doc={doc}
            signed={signed}
            token={token}
            proof={proof}
            fresh={!!justSigned}
          />
        ) : doc ? (
          <SigningForm
            doc={doc}
            token={token}
            proof={proof}
            onExpired={() => {
              store(token, "");
              setProof("");
              setDoc(null);
              setPortalNote("Your check expired. Please confirm it's you again.");
            }}
            onProgress={setDetailsDone}
            onSigned={(s) => {
              setJustSigned(s);
              window.scrollTo({ top: 0 });
            }}
          />
        ) : (
          <Gate
            summary={summary}
            token={token}
            note={portalNote}
            onVerified={(p) => openDoc(token, p)}
          />
        )}
      </main>
      <div className="px-4 pb-8 text-center text-[12px] text-ice-600">
        Questions before you sign? Write to{" "}
        <a className="underline" href={`mailto:${CONTACT}`}>
          {CONTACT}
        </a>
      </div>
    </div>
  );
}

function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src="/brand/mark-blue.png" alt="" width={28} height={25} className="h-auto w-7" />
      <span className="text-[17px] font-semibold tracking-[-0.01em] text-blue-950">
        Scholars Cafe
      </span>
    </span>
  );
}

function ProgressSteps({
  step1Done,
  signed,
  live,
}: {
  step1Done: boolean;
  signed: boolean;
  live: boolean;
}) {
  const Step = ({ n, label, state }: { n: number; label: string; state: string }) => (
    <li className="flex items-center gap-2" aria-current={state === "active" ? "step" : undefined}>
      <span
        className={
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold " +
          (state === "done"
            ? "bg-blue-800 text-white"
            : state === "active"
              ? "border border-blue-800 text-blue-800"
              : "border border-[#dbe5ee] text-ice-600")
        }
      >
        {state === "done" ? <Check size={13} strokeWidth={3} aria-hidden="true" /> : n}
      </span>
      <span
        className={
          "whitespace-nowrap text-[13px] " + (state === "todo" ? "text-ice-600" : "text-blue-950")
        }
      >
        {label}
      </span>
    </li>
  );
  return (
    <ol className="flex items-center gap-3" aria-label="Signing progress">
      <Step n={1} label="Fill details" state={step1Done ? "done" : "active"} />
      <li aria-hidden="true" className="h-px w-6 bg-[#dbe5ee] md:w-10" />
      <Step
        n={2}
        label="Sign & submit"
        state={signed ? "done" : step1Done && live ? "active" : "todo"}
      />
    </ol>
  );
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <section className="mx-auto max-w-[560px] rounded-2xl border border-[#dbe5ee] bg-white p-6 lg:p-8">
      <h1 className="text-[20px] font-semibold tracking-[-0.01em]">{title}</h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ice-700">{text}</p>
      <p className="mt-4 text-[13.5px] text-ice-700">
        Need help? Write to{" "}
        <a className="text-blue-700 underline" href={`mailto:${CONTACT}`}>
          {CONTACT}
        </a>
        .
      </p>
    </section>
  );
}

// ---------- Step 0: confirm it's you (6-digit email code, or the student portal sign-in) ----------
function Gate({
  summary,
  token,
  note,
  onVerified,
}: {
  summary: Summary;
  token: string;
  note: string;
  onVerified: (proof: string) => void;
}) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(note);
  const [err, setErr] = useState("");
  const isSigned = summary.state === "signed";

  const sendCode = async () => {
    setBusy(true);
    setErr("");
    try {
      const r = await call<{ email: string; minutes: number }>(`${token}/code`, {});
      setSent(true);
      setMsg(`We sent a 6-digit code to ${r.email}. It expires in ${r.minutes} minutes.`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const verify = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setErr("Enter the 6-digit code from the email.");
    setBusy(true);
    setErr("");
    try {
      const r = await call<{ proof: string }>(`${token}/verify`, { code });
      onVerified(r.proof);
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-[560px] rounded-2xl border border-[#dbe5ee] bg-white p-6 lg:p-8">
      <p className="font-mono text-[11px] tracking-[0.04em] text-blue-800">REF {summary.ref}</p>
      <h1 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.015em]">
        {summary.title}
      </h1>
      {isSigned && summary.signed ? (
        <p className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-[13.5px] leading-6 text-blue-900">
          Signed on {summary.signed.signedAt}. Document ID{" "}
          <span className="font-mono">{summary.signed.docId}</span>. Confirm it's you to see the
          signed copy and download the PDF.
        </p>
      ) : (
        <p className="mt-2 text-[14.5px] leading-relaxed text-ice-700">
          Hi {summary.firstName}. Issued {summary.issued}
          {summary.expires ? `, this link works until ${summary.expires}` : ""}.
        </p>
      )}
      <div className="mt-6 border-t border-[#dbe5ee] pt-5">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold">
          <ShieldCheck size={18} className="text-blue-700" aria-hidden="true" /> First, confirm it's
          you
        </h2>
        <p className="mt-1 text-[14px] leading-relaxed text-ice-700">
          We'll email a 6-digit code to {summary.email}, the address this agreement was sent to.
        </p>
        {msg && (
          <p className="mt-3 text-[13.5px] text-blue-900" role="status">
            {msg}
          </p>
        )}
        {!sent ? (
          <button
            type="button"
            onClick={sendCode}
            disabled={busy}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-3.5 text-[15.5px] font-semibold text-white hover:bg-blue-900 disabled:opacity-70 sm:w-auto"
          >
            <Mail size={17} aria-hidden="true" /> {busy ? "Sending…" : "Email me a code"}
          </button>
        ) : (
          <form onSubmit={verify} className="mt-4" noValidate>
            <label htmlFor="code" className="mb-1.5 block text-[13px] font-medium">
              6-digit code
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-lg border border-[#dbe5ee] bg-white px-3.5 py-2.5 text-center font-mono text-[20px] tracking-[0.3em] text-blue-950 focus:border-blue-600 focus:outline-none sm:w-48"
                aria-invalid={Boolean(err)}
                aria-describedby={err ? "code-err" : undefined}
              />
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-3 text-[15.5px] font-semibold text-white hover:bg-blue-900 disabled:opacity-70"
              >
                {busy ? "Checking…" : "Continue"}
              </button>
            </div>
            <button
              type="button"
              onClick={sendCode}
              disabled={busy}
              className="mt-3 text-[13px] text-blue-700 underline"
            >
              Send a new code
            </button>
          </form>
        )}
        {err && (
          <p id="code-err" className="mt-3 text-[13px] text-[#b3261e]" role="alert">
            {err}
          </p>
        )}
        <p className="mt-6 text-[13px] leading-5 text-ice-700">
          Signed in to the student portal with this email?{" "}
          <a className="text-blue-700 underline" href={`${PORTAL}/sign-check/${token}`}>
            Continue without a code
          </a>
          .
        </p>
      </div>
    </section>
  );
}

// ---------- The agreement sheet (letterhead paper with live inline fields) ----------
function DocField({ value, placeholder }: { value?: string; placeholder: string }) {
  return value ? (
    <span className="rounded-[3px] bg-blue-50 px-1 font-medium text-blue-800 [box-shadow:inset_0_-1px_0_#9ac2e9]">
      {value}
    </span>
  ) : (
    <span className="rounded-[3px] border border-dashed border-blue-300 px-1 text-blue-500">
      {placeholder}
    </span>
  );
}
function blocks(body: string) {
  return body
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .flatMap((block) => {
      const lines = block.split("\n");
      const out: { heading?: string; text?: string }[] = [];
      if (/^##\s+/.test(lines[0])) out.push({ heading: lines.shift()!.replace(/^##\s+/, "") });
      if (lines.length) out.push({ text: lines.join("\n") });
      return out;
    });
}
function Filled({
  text,
  values,
  labels,
}: {
  text: string;
  values: Record<string, string>;
  labels: Record<string, string>;
}) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(PH)) {
    parts.push(text.slice(last, m.index));
    parts.push(
      <DocField
        key={m.index}
        value={values[m[1]]?.trim()}
        placeholder={`[${labels[m[1]] || m[1]}]`}
      />,
    );
    last = (m.index || 0) + m[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}
function AgreementSheet({
  doc,
  values,
  children,
  signedNote,
}: {
  doc: Doc;
  values: Record<string, string>;
  children?: ReactNode;
  signedNote?: ReactNode;
}) {
  const labels = Object.fromEntries(doc.fields.map((f) => [f.key, f.label]));
  labels.date = "Date";
  return (
    <article className="rounded-[4px] border border-[#dbe5ee] bg-[#fdfdfc] px-5 py-8 text-[14.5px] leading-[1.7] text-[#1b3554] shadow-[0_1px_2px_rgb(4_28_49/0.06),0_18px_40px_-24px_rgb(4_28_49/0.25)] lg:px-12 lg:py-12">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#dbe5ee] pb-5">
        <Wordmark />
        <div className="text-right text-[11.5px] leading-5 text-ice-700">
          <div className="font-mono text-[11px] tracking-[0.04em] text-blue-800">REF {doc.ref}</div>
          <div>Issued {doc.issued}</div>
        </div>
      </header>
      <h1 className="mt-7 text-[24px] font-semibold leading-tight tracking-[-0.015em] text-blue-950 lg:text-[28px]">
        {doc.title}
      </h1>
      {doc.subtitle && <p className="mt-1 text-[13px] text-ice-700">{doc.subtitle}</p>}
      {blocks(doc.body).map((b, i) =>
        b.heading !== undefined ? (
          <h2 key={i} className="mt-5 text-[15px] font-semibold text-blue-950">
            {b.heading}
          </h2>
        ) : (
          <p key={i} className="mt-2 whitespace-pre-line first-of-type:mt-6">
            <Filled text={b.text || ""} values={values} labels={labels} />
          </p>
        ),
      )}
      {children}
      {signedNote}
    </article>
  );
}

// ---------- Signature: Draw (canvas, mouse and touch) or Type (script font) ----------
function DrawPad({ onChange }: { onChange: (png: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const s = useRef({
    drawing: false,
    last: { x: 0, y: 0 },
    mid: { x: 0, y: 0 },
    has: false,
  });
  useEffect(() => {
    const c = ref.current!;
    const setup = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const prev = s.current.has ? c.toDataURL() : null;
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      const ctx = c.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.3;
      if (prev) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, r.width, r.height);
        img.src = prev;
      }
    };
    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);
  const pos = (e: ReactPointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const down = (e: ReactPointerEvent) => {
    e.preventDefault();
    ref.current!.setPointerCapture(e.pointerId);
    const p = pos(e);
    s.current = { ...s.current, drawing: true, last: p, mid: p };
    const ctx = ref.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();
  };
  const move = (e: ReactPointerEvent) => {
    if (!s.current.drawing) return;
    const p = pos(e);
    const { last, mid } = s.current;
    const m = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
    const ctx = ref.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(mid.x, mid.y);
    ctx.quadraticCurveTo(last.x, last.y, m.x, m.y);
    ctx.stroke();
    s.current.last = p;
    s.current.mid = m;
  };
  const up = () => {
    if (!s.current.drawing) return;
    s.current.drawing = false;
    s.current.has = true;
    onChange(ref.current!.toDataURL("image/png"));
  };
  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
      aria-label="Signature drawing area. Draw with your finger or mouse."
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerLeave={up}
    />
  );
}

async function typedSignatureToPng(text: string) {
  try {
    await document.fonts.load('64px "Mrs Saint Delafield"');
  } catch {
    /* falls back to a cursive font */
  }
  const w = 640,
    h = 170,
    c = document.createElement("canvas");
  c.width = w * 2;
  c.height = h * 2;
  const ctx = c.getContext("2d")!;
  ctx.scale(2, 2);
  let size = 78;
  do {
    ctx.font = `${size}px "Mrs Saint Delafield", cursive`;
    size -= 4;
  } while (ctx.measureText(text).width > w - 40 && size > 28);
  ctx.fillStyle = INK;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, 20, h - 46);
  return c.toDataURL("image/png");
}

function SignatureLine({ dateLabel }: { dateLabel: string }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-4 bottom-[34px] border-t border-blue-950/70" />
      <div className="pointer-events-none absolute inset-x-4 bottom-2.5 flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-ice-700">
        <span>Authorized Signature</span>
        <span className="normal-case tracking-normal">{dateLabel}</span>
      </div>
    </>
  );
}

// ---------- Steps 1 and 2: details, signature, consent, submit ----------
function SigningForm({
  doc,
  token,
  proof,
  onExpired,
  onSigned,
  onProgress,
}: {
  doc: Doc;
  token: string;
  proof: string;
  onExpired: () => void;
  onSigned: (s: Signed) => void;
  onProgress: (done: boolean) => void;
}) {
  const asked = useMemo(() => doc.fields.filter((f) => f.recipient), [doc]);
  const fixed = useMemo(
    () => Object.fromEntries(doc.fields.filter((f) => !f.recipient).map((f) => [f.key, f.value])),
    [doc],
  );
  const [v, setV] = useState<Record<string, string>>(() =>
    Object.fromEntries(asked.map((f) => [f.key, f.value || ""])),
  );
  const [touched, setTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [drawn, setDrawn] = useState<string | null>(null);
  const [typed, setTyped] = useState(doc.recipientName);
  const [padKey, setPadKey] = useState(0);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failMsg, setFailMsg] = useState("");

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    for (const f of asked) {
      const m = checkValue(f, v[f.key]);
      if (m) e[f.key] = m;
    }
    return { ...e, ...serverErrors };
  }, [v, asked, serverErrors]);
  const step1Done = Object.keys(errors).length === 0;
  useEffect(() => onProgress(step1Done), [step1Done, onProgress]);
  const hasSignature = mode === "draw" ? Boolean(drawn) : typed.trim().length > 2;
  const canSubmit = step1Done && hasSignature && consent && !busy;
  const values = { ...fixed, ...v, date: doc.today };
  const signerName = (v.name ?? fixed.name ?? doc.recipientName) || "";

  const update = (key: string, val: string) => {
    setV((p) => ({ ...p, [key]: val }));
    setServerErrors((p) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== key)));
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setFailMsg("");
    if (!canSubmit) {
      const first = Object.keys(errors)[0];
      if (first) document.getElementById("f-" + first)?.focus();
      return;
    }
    setBusy(true);
    try {
      const image = mode === "draw" ? drawn! : await typedSignatureToPng(typed.trim());
      const r = await call<{ docId: string; signedAt: string; signedDate: string }>(
        `${token}/submit`,
        { proof, values: v, signature: image, method: mode, consent: true },
      );
      onSigned({ ...r, values: { ...fixed, ...v }, signature: image });
    } catch (err) {
      const ex = err as ApiError;
      if (ex.status === 401) return onExpired();
      if (ex.fields) setServerErrors(ex.fields);
      setFailMsg(ex.message);
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start"
    >
      <aside className="xl:sticky xl:top-[84px] xl:order-2">
        <div className="rounded-2xl border border-[#dbe5ee] bg-white p-5 lg:p-6">
          <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Step 1: Your details</h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ice-700">
            These fill in the agreement as you type. Check them against your ID.
          </p>
          <div className="mt-5 grid gap-4">
            {asked.map((f) => {
              const hint = HINTS[f.key] || {
                placeholder: "",
                auto: "off",
                type: f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text",
              };
              const id = "f-" + f.key;
              const err = errors[f.key];
              const show =
                Boolean(err) &&
                (touched || (v[f.key] || "").length > 3 || Boolean(serverErrors[f.key]));
              return (
                <div key={f.key}>
                  <label
                    htmlFor={id}
                    className="mb-1.5 block text-[13px] font-medium text-blue-950"
                  >
                    {f.label}
                    {!f.required && (
                      <span className="ml-1 font-normal text-ice-600">(optional)</span>
                    )}
                  </label>
                  <input
                    id={id}
                    type={hint.type}
                    autoComplete={hint.auto}
                    value={v[f.key] || ""}
                    placeholder={hint.placeholder}
                    maxLength={300}
                    onChange={(e) => update(f.key, e.target.value)}
                    aria-invalid={show}
                    aria-describedby={show ? `${id}-err` : undefined}
                    className={
                      "w-full rounded-lg border bg-white px-3.5 py-2.5 text-[16px] text-blue-950 placeholder:text-ice-500 focus:outline-none " +
                      (show
                        ? "border-[#c0392b] focus:border-[#c0392b]"
                        : "border-[#dbe5ee] focus:border-blue-600")
                    }
                  />
                  {show && (
                    <p id={`${id}-err`} className="mt-1 text-[12.5px] text-[#b3261e]">
                      {err}
                    </p>
                  )}
                </div>
              );
            })}
            {doc.fields
              .filter((f) => !f.recipient && f.value)
              .map((f) => (
                <div key={f.key}>
                  <p className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-medium text-blue-950">
                    <span>{f.label}</span>
                    <span className="text-[11.5px] font-normal text-ice-600">
                      From your invitation
                    </span>
                  </p>
                  <p className="rounded-lg border border-[#dbe5ee] bg-ice-50 px-3.5 py-2.5 text-[16px] text-blue-950 break-words">
                    {f.value}
                  </p>
                </div>
              ))}
          </div>
          {doc.fields.some((f) => f.sensitive) && (
            <p className="mt-5 flex items-start gap-2 text-[12px] leading-5 text-ice-700">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-blue-700" aria-hidden="true" />
              Your ID number is stored only with this signed agreement and is never shown publicly.
            </p>
          )}
        </div>
      </aside>

      <div className="min-w-0 xl:order-1">
        <AgreementSheet doc={doc} values={values}>
          <section aria-labelledby="sig-heading" className="mt-10">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3
                id="sig-heading"
                className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ice-700"
              >
                Your signature
              </h3>
              <div
                className="inline-flex rounded-lg border border-[#dbe5ee] bg-ice-50 p-0.5"
                role="group"
                aria-label="Signature method"
              >
                {(
                  [
                    ["draw", "Draw", PenLine],
                    ["type", "Type", Type],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={mode === id}
                    onClick={() => setMode(id)}
                    className={
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] " +
                      (mode === id
                        ? "bg-white text-blue-950 shadow-[0_1px_2px_rgb(4_28_49/0.12)]"
                        : "text-ice-700 hover:text-blue-950")
                    }
                  >
                    <Icon size={14} aria-hidden="true" /> {label}
                  </button>
                ))}
              </div>
            </div>
            {mode === "type" && (
              <div className="mb-3">
                <label htmlFor="typed-sig" className="sr-only">
                  Type your signature
                </label>
                <input
                  id="typed-sig"
                  value={typed}
                  maxLength={80}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Type your full name"
                  className="w-full rounded-lg border border-[#dbe5ee] bg-white px-3.5 py-2.5 text-[16px] text-blue-950 placeholder:text-ice-500 focus:border-blue-600 focus:outline-none"
                />
              </div>
            )}
            <div className="relative h-[150px] rounded-xl border border-[#dbe5ee] bg-[#fbfdff]">
              {mode === "draw" ? (
                <>
                  <DrawPad key={padKey} onChange={setDrawn} />
                  {!drawn && (
                    <span className="pointer-events-none absolute left-4 top-3 text-[12px] text-ice-500">
                      Sign here with your finger or mouse
                    </span>
                  )}
                </>
              ) : (
                <span
                  className="pointer-events-none absolute bottom-[38px] left-4 max-w-[92%] truncate text-[54px] leading-none"
                  style={{ color: INK, fontFamily: '"Mrs Saint Delafield", cursive' }}
                >
                  {typed}
                </span>
              )}
              <SignatureLine dateLabel={doc.today} />
              {mode === "draw" && drawn && (
                <button
                  type="button"
                  onClick={() => {
                    setDrawn(null);
                    setPadKey((k) => k + 1);
                  }}
                  className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-[#dbe5ee] bg-white px-2 py-1 text-[12px] text-ice-700 hover:text-blue-950"
                >
                  <Undo2 size={13} aria-hidden="true" /> Clear
                </button>
              )}
            </div>
            <p className="mt-2 text-[13px] text-ice-700">{signerName || "Your full legal name"}</p>
          </section>
          <div className="mt-6 border-t border-[#dbe5ee] pt-5">
            <label
              htmlFor="consent"
              className="flex cursor-pointer items-start gap-3 text-[14px] leading-6 text-[#1b3554]"
            >
              <input
                id="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-[18px] w-[18px] shrink-0 accent-[#0b426d]"
              />
              <span>{doc.consentText}</span>
            </label>
            {touched && !canSubmit && !busy && !failMsg && (
              <p className="mt-3 text-[13px] text-[#b3261e]" role="status">
                {!step1Done
                  ? "Complete your details first."
                  : !hasSignature
                    ? "Add your signature in the box above."
                    : "Tick the box to confirm."}
              </p>
            )}
            {failMsg && (
              <p className="mt-3 text-[13px] text-[#b3261e]" role="alert">
                {failMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className={
                "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[15.5px] font-semibold transition-colors lg:w-auto " +
                (canSubmit ? "bg-blue-800 text-white hover:bg-blue-900" : "bg-ice-200 text-ice-600")
              }
            >
              <PenLine size={17} aria-hidden="true" />{" "}
              {busy ? "Recording your signature…" : "Complete & Submit Signature"}
            </button>
            <p className="mt-3 text-[12px] text-ice-600">
              This link works until {doc.expires}. After you submit, the agreement can't be changed.
            </p>
          </div>
        </AgreementSheet>
      </div>
    </form>
  );
}

// ---------- Done: Agreement Signed & Recorded ----------
function Confirmation({
  doc,
  signed,
  token,
  proof,
  fresh,
}: {
  doc: Doc;
  signed: Signed;
  token: string;
  proof: string;
  fresh: boolean;
}) {
  const [note, setNote] = useState("");
  const values = { ...signed.values, date: signed.signedDate };
  const name = signed.values.name || doc.recipientName;
  const download = async () => {
    setNote("");
    try {
      const r = await fetch(`${API}/public/sign/${token}/pdf`, {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.error || "Download failed.");
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${signed.docId}.pdf`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      setNote((e as Error).message + " The PDF is also in your email.");
    }
  };
  return (
    <div className="mx-auto grid max-w-[860px] gap-6">
      <section className="rounded-2xl border border-[#dbe5ee] bg-white p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-800 text-white">
            <Check size={22} strokeWidth={2.5} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold tracking-[-0.015em]">
              Agreement Signed &amp; Recorded
            </h1>
            <p className="mt-1 text-[14px] leading-relaxed text-ice-700">
              {fresh
                ? `A signed copy is on its way to ${doc.recipientEmail}. You can close this page.`
                : "This agreement is signed and can't be changed. You can download your copy."}
            </p>
          </div>
        </div>
        <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-[#dbe5ee] pt-5 text-[14px] sm:grid-cols-2">
          {[
            ["Document", doc.title],
            ["Document ID", signed.docId],
            ["Signed by", name],
            ["Timestamp", signed.signedAt],
          ].map(([k, val]) => (
            <div key={k} className="min-w-0">
              <dt className="text-[12px] uppercase tracking-[0.08em] text-ice-600">{k}</dt>
              <dd
                className={
                  "mt-0.5 break-words " +
                  (k === "Document ID" ? "font-mono text-[13px] text-blue-800" : "text-blue-950")
                }
              >
                {val}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={download}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-3 text-[15px] font-semibold text-white hover:bg-blue-900 sm:w-auto"
          >
            <Download size={17} aria-hidden="true" /> Download Signed PDF
          </button>
          {note && (
            <span className="text-[12.5px] text-[#b3261e]" role="status">
              {note}
            </span>
          )}
        </div>
      </section>
      <AgreementSheet
        doc={doc}
        values={values}
        signedNote={
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-[12.5px] leading-5 text-blue-900">
            Signed electronically by <strong className="font-semibold">{name}</strong> (
            {doc.recipientEmail}) on {signed.signedAt}. Document ID{" "}
            <span className="font-mono">{signed.docId}</span>.
          </div>
        }
      >
        <section className="mt-10" aria-label="Signature">
          <div className="relative h-[150px] rounded-xl">
            <img
              src={signed.signature}
              alt={`Signature of ${name}`}
              className="absolute bottom-[38px] left-2 h-[96px] w-auto max-w-[90%] object-contain object-left-bottom"
            />
            <SignatureLine dateLabel={signed.signedDate} />
          </div>
          <p className="mt-2 text-[13px] text-ice-700">{name}</p>
        </section>
      </AgreementSheet>
    </div>
  );
}
