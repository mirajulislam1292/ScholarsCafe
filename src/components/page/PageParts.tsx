import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useCmsValue } from "@/lib/cms";
import { WA_LINK as CMS_DEFAULT_WA_LINK } from "@/lib/scholars-data";
import { Reveal } from "../scholars/Reveal";

/* Shared building blocks for inner pages: hero → intro → content → proof → CTA. */

const GRAIN =
  "pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay [background-image:var(--grain)]";

/** Image that drifts slightly slower than the page (off for reduced motion). */
export function ParallaxImage({
  src,
  srcSm,
  alt,
  className = "",
  strength = 60,
  priority = false,
}: {
  src: string;
  srcSm?: string;
  alt: string;
  className?: string;
  strength?: number;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);
  return (
    <div
      ref={ref}
      className={`overflow-hidden ${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} ${className}`}
    >
      <motion.picture style={reduce ? undefined : { y }} className="absolute inset-[-80px_0]">
        {srcSm && <source media="(max-width: 767px)" srcSet={srcSm} />}
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          className="h-full w-full object-cover"
        />
      </motion.picture>
    </div>
  );
}

/** Cinematic page hero: large Light headline over a dark brand gradient, grain, optional image. */
export function PageHero({
  title,
  lead,
  image,
  imageSm,
  imageAlt = "",
}: {
  title: ReactNode;
  lead?: ReactNode;
  image?: string;
  imageSm?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-blue-950 text-white">
      {image && (
        <ParallaxImage
          src={image}
          srcSm={imageSm}
          alt={imageAlt}
          priority
          strength={80}
          className="absolute inset-0 -z-10"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(4_28_49/0.6)_0%,rgb(4_28_49/0.35)_40%,rgb(4_28_49/0.92)_100%),radial-gradient(80%_70%_at_100%_0%,rgb(43_109_166/0.35)_0%,transparent_60%)]"
      />
      <div aria-hidden className={GRAIN} />
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-[clamp(72px,10vh,128px)] pt-40 md:px-12">
        <h1 className="type-h1 max-w-[16ch] motion-safe:animate-rise">{title}</h1>
        {lead && (
          <p
            className="type-lead mt-7 max-w-[40ch] text-ice-200/85 motion-safe:animate-rise"
            style={{ animationDelay: "160ms" }}
          >
            {lead}
          </p>
        )}
      </div>
    </section>
  );
}

type Tone = "light" | "muted" | "dark";
const toneClass: Record<Tone, string> = {
  light: "bg-white text-neutral-700",
  muted: "bg-neutral-50 text-neutral-700",
  dark: "relative isolate bg-blue-950 text-ice-200/85",
};

/** Section with consistent spacing (120–200px desktop). Optional sticky side heading. */
export function Block({
  tone = "light",
  title,
  intro,
  children,
  sticky = false,
  id,
}: {
  tone?: Tone;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  sticky?: boolean;
  id?: string;
}) {
  const dark = tone === "dark";
  const heading = title && (
    <Reveal className={sticky ? "lg:sticky lg:top-32 lg:self-start" : "max-w-3xl"}>
      <h2 className={`type-h2 ${dark ? "text-white" : "text-neutral-900"}`}>{title}</h2>
      {intro && (
        <p className={`type-lead mt-6 max-w-xl ${dark ? "text-ice-300/85" : "text-neutral-600"}`}>
          {intro}
        </p>
      )}
    </Reveal>
  );
  return (
    <section id={id} className={`${toneClass[tone]} py-[clamp(72px,13vw,200px)]`}>
      {dark && <div aria-hidden className={GRAIN} />}
      <div className="relative mx-auto max-w-[1200px] px-6 md:px-12">
        {sticky ? (
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[5fr_7fr] lg:gap-24">
            {heading}
            <div className="min-w-0">{children}</div>
          </div>
        ) : (
          <>
            {heading}
            {children && <div className={title ? "mt-16 md:mt-20" : ""}>{children}</div>}
          </>
        )}
      </div>
    </section>
  );
}

/** Closing call-to-action band, used at the end of every page. */
export function CtaBand({
  title = "Start with one honest conversation.",
  action = "Book a free strategy call",
}: {
  title?: ReactNode;
  action?: ReactNode;
}) {
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);
  return (
    <section className="relative isolate overflow-hidden bg-blue-950 py-[clamp(72px,12vw,176px)] text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(70%_90%_at_10%_100%,rgb(43_109_166/0.4)_0%,transparent_60%)]"
      />
      <div aria-hidden className={GRAIN} />
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-10 px-6 md:flex-row md:items-end md:px-12">
        <Reveal>
          <h2 className="type-h1 max-w-[14ch]">{title}</h2>
        </Reveal>
        <Reveal>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="type-button group inline-flex h-12 items-center gap-2 rounded-full bg-ice-100 px-6 text-blue-950 transition-[background-color,box-shadow] duration-500 ease-premium hover:bg-white hover:shadow-[0_16px_40px_rgb(0_0_0/0.35)]"
          >
            {action}
            <ArrowUpRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
