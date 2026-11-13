import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Item = { id: string; kind: string; title: string; data: Record<string, unknown> };
const Content = createContext<Item[] | null>(null);
const ENDPOINT = import.meta.env.VITE_CONTENT_API || "https://admin.scholarscafe.com";

// ---------- Visual editor (admin preview only) ----------
// The admin shows this site in a frame with ?sc-edit. Then every text the admin can change is
// remembered with where it comes from, clicks pick a text instead of following links, and the admin
// can show unsaved changes. Visitors never get this: it needs the admin's frame and only listens to
// messages from the admin's own address. Nothing is saved from here; the admin saves.
type Target = { type: "copy"; key: string } | { type: "entry"; id: string; field: string };
const ADMIN_ORIGIN = (() => {
  try {
    return new URL(ENDPOINT).origin;
  } catch {
    return "https://admin.scholarscafe.com";
  }
})();
export const EDIT_MODE =
  typeof window !== "undefined" &&
  window.parent !== window &&
  /[?&]sc-edit(=|&|$)/.test(window.location.search);
const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const registry = new Map<string, Map<string, Target>>(); // shown text → where it comes from
function register(text: unknown, target: Target) {
  if (!EDIT_MODE || (typeof text !== "string" && typeof text !== "number")) return;
  const t = norm(String(text));
  if (!t || t.length > 5000) return;
  const id = target.type === "copy" ? "c:" + target.key : `e:${target.id}:${target.field}`;
  // Also under the text as the page shows it without a leading emoji/flag (some lists strip it).
  for (const shown of new Set([t, t.replace(/^[^\p{L}\p{N}]+/u, "").trim()])) {
    if (!shown) continue;
    if (!registry.has(shown)) registry.set(shown, new Map());
    registry.get(shown)!.set(id, target);
  }
}
type Preview = { copy: Record<string, string>; entries: Record<string, Record<string, string>> };
/** Unsaved changes from the admin, shown on top of the live content (preview only). */
function withPreview(items: Item[] | null, preview: Preview): Item[] | null {
  if (!items || (!Object.keys(preview.copy).length && !Object.keys(preview.entries).length))
    return items;
  const placed = new Set<string>();
  const out = items.map((i) => {
    if (i.kind === "copy") {
      const hit = Object.keys(preview.copy).filter((k) => k in i.data);
      if (!hit.length) return i;
      hit.forEach((k) => placed.add(k));
      return {
        ...i,
        data: { ...i.data, ...Object.fromEntries(hit.map((k) => [k, preview.copy[k]])) },
      };
    }
    const fields = preview.entries[i.id];
    if (!fields) return i;
    const data: Record<string, unknown> = { ...i.data };
    for (const [field, value] of Object.entries(fields)) {
      const [name, n] = field.split(".");
      if (n === undefined) data[name] = value;
      else if (Array.isArray(data[name])) {
        const list = [...(data[name] as unknown[])];
        list[Number(n)] = value;
        data[name] = list;
      }
    }
    return { ...i, data };
  });
  const rest = Object.fromEntries(Object.entries(preview.copy).filter(([k]) => !placed.has(k)));
  return Object.keys(rest).length
    ? [...out, { id: "__preview", kind: "copy", title: "", data: rest }]
    : out;
}

/** Short stable id for a built-in text, so fixed labels can be edited without listing each by hand. */
const textId = (s: string) => {
  let h = 0x811c9dc5;
  for (const ch of s) h = Math.imul(h ^ (ch.codePointAt(0) as number), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, "0");
};
/** Editable built-in text: `t("Contact Us")` shows the admin's version of it, or the text itself. */
export function useCmsAuto(prefix: string) {
  const lookup = useCmsLookup();
  return (text: string) => lookup(prefix + "." + textId(text), text);
}
export function useCmsLookup() {
  const items = useContext(Content);
  const copy = Object.assign(
    Object.create(null),
    ...(items || []).filter((i) => i.kind === "copy").map((i) => i.data),
  );
  return (key: string, fallback: string) => {
    const value = typeof copy[key] === "string" ? (copy[key] as string) : fallback;
    register(value, { type: "copy", key });
    return value;
  };
}
// ---------- No stale text on load ----------
// Every page is pre-rendered with the admin's content as it was at build time (embedded as JSON so
// the browser starts from the same text). A tiny script in <head> fetches the live content right
// away and keeps the page invisible until it is known to be current: shown at once when nothing
// changed since the build, after the update when something did, and after 2.5 s at the latest.
const EMBED_ID = "sc-content";
declare global {
  var __SC_CONTENT__: Item[] | undefined;
  interface Window {
    __scLive?: Promise<Item[] | null>;
  }
}
function initialContent(): Item[] | null {
  if (typeof window === "undefined") return globalThis.__SC_CONTENT__ ?? null;
  try {
    const raw = document.getElementById(EMBED_ID)?.textContent;
    const items = raw ? JSON.parse(raw) : null;
    return Array.isArray(items) ? items : null;
  } catch {
    return null;
  }
}
const safeJson = (v: unknown) =>
  JSON.stringify(v)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
/** The build's content, so the pre-rendered page and the browser's first render agree. */
export function EmbeddedContent() {
  const [json] = useState(() => {
    if (typeof window === "undefined")
      return globalThis.__SC_CONTENT__ ? safeJson(globalThis.__SC_CONTENT__) : "";
    return document.getElementById(EMBED_ID)?.textContent ?? "";
  });
  if (!json) return null;
  return (
    <script id={EMBED_ID} type="application/json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
/** Runs in <head> before anything is painted (see above). Kept tiny and dependency-free. */
export const FRESH_CONTENT_SCRIPT = `(function(){var d=document.documentElement;if(window.parent!==window&&/[?&]sc-edit(=|&|$)/.test(location.search))return;d.classList.add("sc-wait");var show=function(){d.classList.remove("sc-wait")};setTimeout(show,2500);window.__scLive=fetch(${JSON.stringify(ENDPOINT + "/public/content")},{credentials:"omit"}).then(function(r){return r.ok?r.json():null}).then(function(j){var items=j&&Array.isArray(j.items)?j.items:null;var same=function(){try{var e=document.getElementById("${EMBED_ID}");return!!(items&&e&&JSON.stringify(JSON.parse(e.textContent))===JSON.stringify(items))}catch(x){return false}};if(!items)show();else if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){if(same())show()});else if(same())show();return items}).catch(function(){show();return null})})();`;
export const FRESH_CONTENT_STYLE = "html.sc-wait body{opacity:0}";

export function ContentProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[] | null>(initialContent);
  const [live, setLive] = useState(false);
  const [preview, setPreview] = useState<Preview>({ copy: {}, entries: {} });
  useEffect(() => {
    const endpoint = ENDPOINT;
    if (!endpoint) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const r = await fetch(endpoint + "/public/content", {
          signal: controller.signal,
          credentials: "omit",
        });
        if (!r.ok) return;
        const data = await r.json();
        if (Array.isArray(data.items)) {
          setItems(data.items);
          setLive(true);
        }
      } catch {
        /* Keep the last successful content while offline. */
      }
    };
    // First load: the request the <head> script already started (no second download).
    const early = window.__scLive;
    if (early)
      void early.then((fetched) => {
        if (fetched) {
          setItems(fetched);
          setLive(true);
        } else void load();
      });
    else void load();
    const interval = window.setInterval(load, 60000);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);
  // Once the live content is on screen, the page may be shown (see FRESH_CONTENT_SCRIPT).
  useEffect(() => {
    if (live) requestAnimationFrame(() => document.documentElement.classList.remove("sc-wait"));
  }, [live]);
  return (
    <Content.Provider value={EDIT_MODE ? withPreview(items, preview) : items}>
      <BrandSettings />
      {EDIT_MODE && <EditBridge onPreview={setPreview} />}
      {children}
    </Content.Provider>
  );
}
const DEFAULT_BRAND_MARK = "/brand/mark-blue.png";
function BrandSettings() {
  const brand = useCmsValue("brand", { image: DEFAULT_BRAND_MARK });
  useEffect(() => {
    // Only override the built-in logo files when the admin has uploaded a custom mark.
    if (brand.image === DEFAULT_BRAND_MARK) return;
    document.documentElement.style.setProperty(
      "--brand-mark-url",
      `url(${JSON.stringify(brand.image)})`,
    );
    document
      .querySelectorAll<HTMLLinkElement>('link[rel="icon"],link[rel="apple-touch-icon"]')
      .forEach((link) => {
        link.href = brand.image;
      });
  }, [brand.image]);
  return null;
}
/** True once the admin's published content has loaded (false while loading or when offline). */
export function useCmsReady() {
  return useContext(Content) !== null;
}
export function CmsText({ id, children }: { id: string; children: ReactNode }) {
  const items = useContext(Content);
  const replacement = items?.find((i) => i.kind === "copy" && typeof i.data[id] === "string")?.data[
    id
  ];
  register(typeof replacement === "string" ? replacement : children, { type: "copy", key: id });
  if (typeof replacement !== "string") return <>{children}</>;
  const original = typeof children === "string" ? children : "";
  return (
    <>
      {(/^\s/.test(original) && !/^\s/.test(replacement) ? " " : "") +
        replacement +
        (/\s$/.test(original) && !/\s$/.test(replacement) ? " " : "")}
    </>
  );
}
export function useCmsCollection<T>(
  kind: string,
  fallback: T[],
  map: (data: Record<string, unknown>, id: string) => T,
): T[] {
  const items = useContext(Content);
  if (items === null) return fallback;
  const rows = items.filter((i) => i.kind === kind);
  rows.forEach(registerEntry);
  return rows.map((i) => map(i.data, i.id));
}
export function useCmsValue<T>(key: string, fallback: T): T {
  const items = useContext(Content);
  const copy = Object.assign(
    Object.create(null),
    ...(items || []).filter((i) => i.kind === "copy").map((i) => i.data),
  );
  function visit(value: unknown, path: string): unknown {
    if (typeof value === "number") {
      const next = copy[path];
      const shown =
        typeof next === "string" &&
        next.trim() &&
        Number.isFinite(Number(next)) &&
        Math.abs(Number(next)) <= 1000000
          ? Number(next)
          : value;
      register(shown, { type: "copy", key: path });
      return shown;
    }
    if (typeof value === "string") {
      const next = copy[path];
      if (typeof next !== "string") return (register(value, { type: "copy", key: path }), value);
      if (
        (/^(https?:|mailto:|tel:|#|\/)/.test(value) ||
          /(?:url|link|href|src|image|photo)$/i.test(path)) &&
        // eslint-disable-next-line no-control-regex -- rejects control characters in CMS URLs on purpose
        (!/^(https:\/\/|mailto:|tel:|#|\/(?!\/))/.test(next) || /[\u0000-\u0020\\]/.test(next))
      )
        return value;
      register(next, { type: "copy", key: path });
      return next;
    }
    if (Array.isArray(value)) {
      // When the admin has saved this list, show exactly its length: built-in defaults past the
      // admin's last item would otherwise appear as stray repeats.
      const prefix = path + ".";
      let last = -1;
      for (const k in copy)
        if (k.startsWith(prefix)) {
          const n = Number(k.slice(prefix.length).split(".")[0]);
          if (Number.isInteger(n) && n > last) last = n;
        }
      const list = last >= 0 && last + 1 < value.length ? value.slice(0, last + 1) : value;
      return list.map((v, i) => visit(v, path + "." + i));
    }
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, visit(v, path + "." + k)]),
      );
    return value;
  }
  return visit(fallback, key) as T;
}

/**
 * A published collection from the admin, sorted by `position`. Falls back to the built-in
 * defaults until content loads, or when the admin has no published entries of that kind.
 */
export function useCmsList<T>(
  kind: string,
  fallback: T[],
  map?: (data: Record<string, unknown>, id: string) => T,
): T[] {
  const items = useContext(Content);
  const rows = (items || []).filter((i) => i.kind === kind);
  if (!rows.length) return fallback;
  rows.forEach(registerEntry);
  const pos = (d: Record<string, unknown>) => (typeof d.position === "number" ? d.position : 1e9);
  return [...rows]
    .sort((a, b) => pos(a.data) - pos(b.data))
    .map((i) => (map ? map(i.data, i.id) : (i.data as T)));
}

/** Section order and visibility for a page, from the admin's "Page sections" (ids not listed keep their default place). */
export function usePageSections(page: string, defaults: string[]): string[] {
  const items = useContext(Content);
  const entry = (items || []).find((i) => i.kind === "sections" && i.data.page === page);
  if (!entry) return defaults;
  const split = (v: unknown) =>
    typeof v === "string"
      ? v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  const order = split(entry.data.order).filter((id) => defaults.includes(id));
  const hidden = new Set(split(entry.data.hidden));
  return [...order, ...defaults.filter((id) => !order.includes(id))].filter(
    (id) => !hidden.has(id),
  );
}

/** Applies the admin's SEO title/description for the current page (client side, no redeploy). */
export function SeoOverride({ path }: { path: string }) {
  const items = useContext(Content);
  const entry = (items || []).find((i) => i.kind === "seo" && i.data.page === path);
  useEffect(() => {
    if (!entry) return;
    const { title, description } = entry.data as { title?: string; description?: string };
    if (title) document.title = title;
    if (description)
      document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [entry]);
  return null;
}

/** Every plain text field of a published list item (team member, FAQ, blog post…) can be edited too. */
function registerEntry(i: Item) {
  if (!EDIT_MODE || i.id === "__preview") return;
  for (const [field, value] of Object.entries(i.data)) {
    if (typeof value === "string" && field !== "position")
      register(value, { type: "entry", id: i.id, field });
    // Lists of short texts (e.g. a program's features): each line can be edited.
    if (Array.isArray(value))
      value.forEach(
        (v, n) =>
          typeof v === "string" && register(v, { type: "entry", id: i.id, field: field + "." + n }),
      );
  }
}

/** Inside the admin's preview: outline editable text, report clicks, show unsaved changes. */
function EditBridge({ onPreview }: { onPreview: (p: Preview) => void }) {
  useEffect(() => {
    const post = (msg: Record<string, unknown>) => window.parent.postMessage(msg, ADMIN_ORIGIN);
    const style = document.createElement("style");
    style.textContent =
      "[data-sc-edit]{outline:2px dashed #2b6da6!important;outline-offset:3px;cursor:text!important}" +
      "[data-sc-edit='no']{outline:2px dotted #b4232a!important;cursor:not-allowed!important}" +
      "*{scroll-behavior:auto!important}";
    document.head.append(style);
    // The text under the pointer: the exact text node when the browser can tell, else the element.
    const pick = (x: number, y: number, el: Element | null) => {
      const caret =
        (
          document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range | null }
        ).caretRangeFromPoint?.(x, y)?.startContainer ??
        (
          document as Document & {
            caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node } | null;
          }
        ).caretPositionFromPoint?.(x, y)?.offsetNode;
      const candidates: { text: string; el: Element }[] = [];
      if (caret && caret.nodeType === Node.TEXT_NODE && caret.parentElement)
        candidates.push({ text: norm(caret.textContent || ""), el: caret.parentElement });
      for (
        let n = el, depth = 0;
        n && n !== document.body && depth < 5;
        n = n.parentElement, depth++
      )
        candidates.push({ text: norm((n as HTMLElement).innerText || n.textContent || ""), el: n });
      for (const c of candidates)
        if (c.text && registry.has(c.text))
          return { ...c, targets: [...registry.get(c.text)!.values()] };
      const own = candidates.find((c) => c.text && c.text.length < 400);
      return own ? { ...own, targets: [] as Target[] } : null;
    };
    let marked: Element | null = null;
    const mark = (el: Element | null, editable: boolean) => {
      if (marked && marked !== el) marked.removeAttribute("data-sc-edit");
      marked = el;
      el?.setAttribute("data-sc-edit", editable ? "yes" : "no");
    };
    const over = (e: MouseEvent) => {
      const hit = pick(e.clientX, e.clientY, e.target as Element);
      mark(hit?.el ?? null, Boolean(hit?.targets.length));
    };
    const click = (e: MouseEvent) => {
      // Picking text never follows links, submits forms or opens menus here.
      e.preventDefault();
      e.stopPropagation();
      const hit = pick(e.clientX, e.clientY, e.target as Element);
      if (hit)
        post({ type: "sc-pick", text: hit.text, targets: hit.targets, path: location.pathname });
    };
    const stop = (e: Event) => e.preventDefault();
    const message = (e: MessageEvent) => {
      if (e.origin !== ADMIN_ORIGIN || !e.data || typeof e.data !== "object") return;
      if (e.data.type === "sc-preview") {
        const copy = e.data.copy && typeof e.data.copy === "object" ? e.data.copy : {};
        const entries = e.data.entries && typeof e.data.entries === "object" ? e.data.entries : {};
        onPreview({ copy, entries });
      }
      if (e.data.type === "sc-audit") {
        // Visible text that can't be edited yet (to find what still needs connecting).
        const seen = new Set<string>();
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const t = norm(n.textContent || "");
          const parent = n.parentElement;
          if (!t || t.length < 2 || !parent || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(parent.tagName))
            continue;
          if (!parent.getClientRects().length || registry.has(t)) continue;
          let covered = false;
          for (let a: Element | null = parent, d = 0; a && d < 4; a = a.parentElement, d++)
            if (registry.has(norm((a as HTMLElement).innerText || ""))) covered = true;
          if (!covered) seen.add(t);
        }
        post({ type: "sc-audit", path: location.pathname, missing: [...seen] });
      }
    };
    document.addEventListener("mouseover", over, true);
    document.addEventListener("click", click, true);
    document.addEventListener("submit", stop, true);
    window.addEventListener("message", message);
    post({ type: "sc-ready", path: location.pathname });
    return () => {
      document.removeEventListener("mouseover", over, true);
      document.removeEventListener("click", click, true);
      document.removeEventListener("submit", stop, true);
      window.removeEventListener("message", message);
      style.remove();
    };
  }, [onPreview]);
  return null;
}
