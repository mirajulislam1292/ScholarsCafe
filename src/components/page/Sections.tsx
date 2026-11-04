import { Fragment, type ReactNode } from "react";
import { usePageSections } from "@/lib/cms";

/**
 * Renders a page's blocks in the order (and visibility) set in the admin under "Page sections".
 * Block ids are the keys of `blocks`, in their default order.
 */
export function Sections({ page, blocks }: { page: string; blocks: Record<string, ReactNode> }) {
  const order = usePageSections(page, Object.keys(blocks));
  return (
    <>
      {order.map((id) => (
        <Fragment key={id}>{blocks[id]}</Fragment>
      ))}
    </>
  );
}
