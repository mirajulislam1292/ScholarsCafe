import { ArrowUpRight } from "lucide-react";
import { useCmsCollection } from "@/lib/cms";

type Entry = {
  id: string;
  title: string;
  category: string;
  country: string;
  url: string;
  description: string;
  image: string;
  position: number;
};

/**
 * Entries from the admin's Website → Resources list, filtered by category (for example webinar/live/video
 * on the Webinar page, broadcast on the Broadcast page). Shows `empty` when nothing is published.
 */
export function ResourceEntries({
  categories,
  action,
  empty,
}: {
  categories: string[];
  action: string;
  empty: React.ReactNode;
}) {
  const items = useCmsCollection<Entry>("resources", [], (data, id) => ({ ...data, id }) as Entry)
    .filter((r) => categories.includes(r.category))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  if (!items.length) return <>{empty}</>;
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {items.map((r) => (
        <li
          key={r.id}
          className="flex flex-col overflow-hidden rounded-3xl border border-neutral-900/[0.08] bg-white"
        >
          {r.image && (
            <img src={r.image} alt="" loading="lazy" className="aspect-video w-full object-cover" />
          )}
          <div className="flex flex-1 flex-col p-7">
            {r.country && <p className="type-caption text-blue-700">{r.country}</p>}
            <h3 className="type-h3 mt-2 text-neutral-900">{r.title}</h3>
            {r.description && (
              <p className="type-body mt-3 whitespace-pre-wrap text-neutral-600">{r.description}</p>
            )}
            {r.url && (
              <a
                href={r.url}
                target={r.url.startsWith("/") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="type-button mt-6 inline-flex items-center gap-2 self-start text-blue-700"
              >
                {action}
                <ArrowUpRight aria-hidden className="h-4 w-4" />
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
