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
    const endpoint = import.meta.env.VITE_CONTENT_API;
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
  return <Content.Provider value={items}>{children}</Content.Provider>;
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
    if (typeof value === "string") {
      const next = copy[path];
      if (typeof next !== "string") return value;
      if (
        (/^(https?:|mailto:|tel:|#|\/)/.test(value) || /(?:url|link|href|src|image|photo)$/i.test(path)) &&
        (!/^(https:\/\/|mailto:|tel:|#|\/(?!\/))/.test(next) || /[\u0000-\u0020\\]/.test(next))
      )
        return value;
      return next;
    }
    if (Array.isArray(value)) return value.map((v, i) => visit(v, path + "." + i));
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, visit(v, path + "." + k)]),
      );
    return value;
  }
  return visit(fallback, key) as T;
}
