import { useEffect, useRef } from "react";

// Cloudflare Turnstile (free bot check). Renders nothing unless VITE_TURNSTILE_SITE_KEY is set.
// The widget adds a hidden "cf-turnstile-response" field to the surrounding form.
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<void> | null = null;
function loadScript() {
  if (window.turnstile) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Turnstile failed to load"));
    document.head.appendChild(s);
  });
  return loading;
}

export const turnstileEnabled = Boolean(SITE_KEY);

/** Reset all widgets after a submit, because each token can be used only once. */
export function resetTurnstile() {
  window.turnstile?.reset();
}

export function Turnstile({ theme = "light" }: { theme?: "light" | "dark" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let id: string | undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (!cancelled && ref.current && window.turnstile)
          id = window.turnstile.render(ref.current, { sitekey: SITE_KEY, theme, size: "flexible" });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (id) window.turnstile?.remove(id);
    };
  }, [theme]);
  if (!SITE_KEY) return null;
  return <div ref={ref} className="mt-4 min-h-[65px]" />;
}
