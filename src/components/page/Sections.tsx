import { Fragment, type ReactNode } from "react";
import { usePageSections } from "@/lib/cms";

/**
 * Renders a page's blocks in the order (and visibility) set in the admin under "Page sections".
 * Block ids are the keys of `blocks`, in their default order. Blocks named in `first` always open
 * the page in that order (default: the hero) and those in `last` always close it, just before the
 * footer (default: the "Start with one honest conversation" CTA band); the admin order applies to
 * everything in between. Hidden blocks stay hidden.
 */
export function Sections({
  page,
  blocks,
  first = ["hero"],
  last = ["cta"],
}: {
  page: string;
  blocks: Record<string, ReactNode>;
  first?: string[];
  last?: string[];
}) {
  const visible = usePageSections(page, Object.keys(blocks));
  const pinned = (ids: string[]) => ids.filter((id) => visible.includes(id));
  const order = [
    ...pinned(first),
    ...visible.filter((id) => !first.includes(id) && !last.includes(id)),
    ...pinned(last),
  ];
  return (
    <>
      {order.map((id) => (
        <Fragment key={id}>{blocks[id]}</Fragment>
      ))}
    </>
  );
}
