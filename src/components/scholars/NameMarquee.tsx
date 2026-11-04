import { useCmsList } from "@/lib/cms";
import { UNIVERSITY_ACCEPTANCES } from "@/lib/university-acceptances";

/**
 * Universities where students were admitted: text-only, slow right-to-left loop, no heading.
 * Data-driven (admin key "universities"). The list is rendered twice for a seamless loop;
 * each name carries its own trailing dot so both halves are identical.
 */
export function NameMarquee() {
  const items = useCmsList("universities", UNIVERSITY_ACCEPTANCES).filter((u) => u.name?.trim());
  if (!items.length) return null;

  const row = (copy: number) =>
    items.map((u, i) => (
      <li
        key={`${copy}-${u.name}-${i}`}
        aria-hidden={copy > 0}
        className={`flex shrink-0 items-center ${copy > 0 ? "motion-reduce:hidden" : ""}`}
      >
        <span className="type-marquee whitespace-nowrap transition-colors duration-500 ease-premium hover:text-blue-800">
          {u.name}
        </span>
        <span aria-hidden className="mx-8 h-1 w-1 rounded-full bg-neutral-300 md:mx-11" />
      </li>
    ));

  return (
    <section
      aria-label="Universities where our students were admitted"
      className="border-b border-neutral-900/[0.06] bg-white"
    >
      <div className="group overflow-hidden py-9 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)] md:py-12">
        <ul className="flex w-max items-center motion-safe:animate-marquee group-hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-3 motion-reduce:px-6">
          {row(0)}
          {row(1)}
        </ul>
      </div>
    </section>
  );
}
