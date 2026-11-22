import { useEffect, useRef, useState, type ReactNode } from "react";

/** State saved in localStorage. Every access is wrapped in try/catch (private mode, blocked storage). */
export function useStoredState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* storage unavailable or bad JSON: start fresh */
    }
    loaded.current = true;
  }, [key]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue];
}

export function removeStored(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Copy text; returns true on success. Falls back to a hidden textarea. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Save plain text as a .txt file (no server involved). */
export function downloadText(filename: string, text: string) {
  try {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    /* ignore */
  }
}

export function ToolButton({
  children,
  onClick,
  variant = "soft",
  disabled,
  type = "button",
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "soft" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
}) {
  const styles = {
    primary: "bg-blue-700 text-white hover:bg-blue-800",
    soft: "bg-ice-100 text-blue-900 hover:bg-ice-200",
    ghost: "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-blue-600/40",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`type-button inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[15px] transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}

/** Short live status line for copy/reset feedback (screen readers hear it too). */
export function useFlash(): [string, (msg: string) => void] {
  const [msg, setMsg] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flash = (m: string) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(""), 2500);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return [msg, flash];
}

export function Flash({ msg }: { msg: string }) {
  return (
    <p role="status" aria-live="polite" className="type-caption min-h-6 text-blue-800">
      {msg}
    </p>
  );
}

export const fieldClass =
  "w-full min-w-0 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[16px] text-neutral-900 placeholder:text-neutral-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25";
