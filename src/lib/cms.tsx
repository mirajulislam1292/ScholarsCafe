import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Item = { id: string; kind: string; title: string; data: Record<string, unknown> };
const Content = createContext<Item[] | null>(null);
export function useCmsLookup() {
  const items = useContext(Content);
  const copy = Object.assign(
    Object.create(null),
    ...(items || []).filter((i) => i.kind === "copy").map((i) => i.data),
  );
  return (key: string, fallback: string) =>
    typeof copy[key] === "string" ? (copy[key] as string) : fallback;
}
export function ContentProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[] | null>(null);
  useEffect(() => {
    const endpoint = import.meta.env.VITE_CONTENT_API || "https://admin.scholarscafe.com";
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
        if (Array.isArray(data.items)) setItems(data.items);
      } catch {
        /* Keep the last successful content while offline. */
      }
    };
    void load();
    const interval = window.setInterval(load, 60000);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);
  return (
    <Content.Provider value={items}>
      <BrandSettings />
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
export function CmsText({ id, children }: { id: string; children: ReactNode }) {
  const items = useContext(Content);
  const replacement = items?.find((i) => i.kind === "copy" && typeof i.data[id] === "string")?.data[
    id
  ];
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
  return items === null
    ? fallback
    : items.filter((i) => i.kind === kind).map((i) => map(i.data, i.id));
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
      return typeof next === "string" &&
        next.trim() &&
        Number.isFinite(Number(next)) &&
        Math.abs(Number(next)) <= 1000000
        ? Number(next)
        : value;
    }
    if (typeof value === "string") {
      const next = copy[path];
      if (typeof next !== "string") return value;
      if (
        (/^(https?:|mailto:|tel:|#|\/)/.test(value) ||
          /(?:url|link|href|src|image|photo)$/i.test(path)) &&
        // eslint-disable-next-line no-control-regex -- rejects control characters in CMS URLs on purpose
        (!/^(https:\/\/|mailto:|tel:|#|\/(?!\/))/.test(next) || /[\u0000-\u0020\\]/.test(next))
      )
        return value;
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
