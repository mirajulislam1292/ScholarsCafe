import { useState } from "react";
import { useCmsValue } from "@/lib/cms";
import { UNIVERSITY_ACCEPTANCES } from "@/lib/university-acceptances";

/** Where students were admitted. Data-driven (admin key "universities"), no heading by design. */
export function LogoMarquee() {
  const items = useCmsValue("universities", UNIVERSITY_ACCEPTANCES);
  if (!items.length) return null;
  const loop = [...items, ...items];

  return (
    <section
      aria-label="Universities where our students were admitted"
      className="border-b border-neutral-900/[0.06] bg-white"
    >
      <div className="group relative overflow-hidden py-10 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] md:py-14">
        <ul className="flex w-max items-center gap-14 motion-safe:animate-marquee group-hover:[animation-play-state:paused] md:gap-20 motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:px-6">
          {loop.map((u, i) => (
            <li
              key={`${u.name}-${i}`}
              aria-hidden={i >= items.length}
              className={i >= items.length ? "motion-reduce:hidden" : undefined}
            >
              <Logo name={u.name} src={u.logo} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Logo({ name, src }: { name: string; src: string }) {
  const [failed, setFailed] = useState(!src);
  return (
    <div
      title={name}
      className="flex h-14 w-[132px] items-center justify-center opacity-50 grayscale transition-[opacity,filter] duration-500 ease-premium hover:opacity-100 hover:grayscale-0 md:h-16 md:w-[148px]"
    >
      {failed ? (
        <span className="text-center font-heading text-[15px] font-medium leading-tight tracking-[-0.01em] text-neutral-800">
          {name}
        </span>
      ) : (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="max-h-full max-w-full object-contain"
        />
      )}
    </div>
  );
}
