// "Save to My List" on /colleges and each college page. Students keep the list in the student portal
// (student.scholarscafe.com, backend/my-list.js), which sends deadline reminders.
// - Signed in there: the button saves or removes here, with the portal's own cookie (same site) and a
//   token only this website can read. Nothing is stored in this browser.
// - Signed out, or the portal can't be reached: the button is a link to the portal, which asks them to
//   sign in and then confirms the add. The page they came from is passed as a return address.
import { useEffect, useState, useSyncExternalStore } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { STUDENT_PORTAL_URL } from "@/lib/scholars-data";

const PORTAL = STUDENT_PORTAL_URL;
type Saved =
  | { kind: "unknown" }
  | { kind: "out" }
  | { kind: "in"; slugs: Set<string>; token: string; cap: number };

let state: Saved = { kind: "unknown" };
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const set = (next: Saved) => {
  state = next;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Asks the portal once per page load who is signed in and what they saved. */
function load() {
  if (loading || typeof window === "undefined") return;
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), 6000);
  loading = fetch(PORTAL + "/mylist/saved", { credentials: "include", signal: timeout.signal })
    .then((r) => (r.ok ? r.json() : null))
    .then((j) =>
      set(
        j?.signedIn && Array.isArray(j.slugs) && typeof j.token === "string"
          ? { kind: "in", slugs: new Set(j.slugs), token: j.token, cap: Number(j.cap) || 25 }
          : { kind: "out" },
      ),
    )
    .catch(() => set({ kind: "out" }))
    .finally(() => clearTimeout(timer));
}

async function save(slug: string, saved: boolean): Promise<string | null> {
  if (state.kind !== "in") return "Sign in to the student portal first.";
  const r = await fetch(PORTAL + "/mylist/save", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": state.token },
    body: JSON.stringify({ slug, saved }),
  }).catch(() => null);
  if (!r) return "No connection. Try again.";
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) {
    set({ kind: "out" });
    return "Your portal session ended. Tap again to sign in.";
  }
  // Already on the list (another tab): show it as saved.
  if (!r.ok && !(saved && r.status === 409 && /already/i.test(j.error || "")))
    return j.error || "That didn't work. Try again.";
  if (state.kind !== "in") return null;
  const slugs = new Set(state.slugs);
  if (saved) slugs.add(slug);
  else slugs.delete(slug);
  set({ ...state, slugs });
  return null;
}

/**
 * `compact`: a round icon button for college cards (sits over the photo).
 * Otherwise a full button with a short line about reminders.
 */
export function SaveToList({
  slug,
  name,
  compact = false,
}: {
  slug: string;
  name: string;
  compact?: boolean;
}) {
  const s = useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [href, setHref] = useState(`${PORTAL}/my-list?add=${encodeURIComponent(slug)}`);
  useEffect(() => {
    load();
    // Where to come back to after signing in (the portal accepts only our own /colleges pages).
    setHref(
      `${PORTAL}/my-list?add=${encodeURIComponent(slug)}&return=${encodeURIComponent(
        window.location.origin + window.location.pathname,
      )}`,
    );
  }, [slug]);

  const saved = s.kind === "in" && s.slugs.has(slug);
  const label = saved ? "Saved to My List" : "Save to My List";
  const Icon = saved ? BookmarkCheck : Bookmark;
  const full = s.kind === "in" && !saved && s.slugs.size >= s.cap;

  const look = compact
    ? "inline-flex h-11 w-11 items-center justify-center rounded-full shadow-[0_4px_14px_rgb(4_28_49/0.18)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 " +
      (saved
        ? "bg-blue-950 text-white hover:bg-blue-900"
        : "bg-white/95 text-blue-900 hover:bg-white")
    : "type-button inline-flex h-12 items-center gap-2 rounded-full px-6 transition-[background-color] duration-500 ease-premium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 " +
      (saved
        ? "bg-blue-950 text-white hover:bg-blue-900"
        : "border-2 border-blue-950 text-blue-950 hover:bg-blue-50");
  const content = (
    <>
      <Icon aria-hidden className={compact ? "h-5 w-5" : "h-5 w-5 shrink-0"} />
      {compact ? <span className="sr-only">{`${label}: ${name}`}</span> : label}
    </>
  );

  const control =
    s.kind === "in" ? (
      <button
        type="button"
        className={look + (busy ? " opacity-60" : "")}
        aria-pressed={saved}
        disabled={busy}
        title={compact ? `${label}: ${name}` : undefined}
        onClick={async () => {
          if (full) {
            setError(`Your list is full (${s.cap}). Remove one in the portal first.`);
            return;
          }
          setBusy(true);
          setError(await save(slug, !saved));
          setBusy(false);
        }}
      >
        {content}
      </button>
    ) : (
      <a href={href} className={look} title={compact ? `${label}: ${name}` : undefined}>
        {content}
      </a>
    );

  if (compact)
    return (
      <div className="flex flex-col items-end gap-1">
        {control}
        {error && (
          <p
            role="status"
            className="max-w-[14rem] rounded-lg bg-white px-2 py-1 text-xs text-red-700 shadow"
          >
            {error}
          </p>
        )}
      </div>
    );
  return (
    <div>
      {control}
      <p role="status" className="mt-2 text-sm text-neutral-600">
        {error ??
          (saved
            ? "On your list in the student portal. Choose a round there to get deadline reminders."
            : s.kind === "in"
              ? "Saved colleges get deadline reminders in the student portal."
              : "Sign in to the student portal to save it. You get deadline reminders 14, 7 and 1 days before.")}
      </p>
    </div>
  );
}
