import { useEffect, useRef, type RefObject } from "react";
import { CmsText, useCmsValue } from "@/lib/cms";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site-content";
import { RANK_EDITION, STATE_UNIVERSITIES, type StateUniversity } from "@/data/state-universities";
import { Reveal } from "./Reveal";

const OLDER = STATE_UNIVERSITIES.filter((s) => !s.rank.edition.includes("2027")).length;

const SPEED = 28; // px per second
const RESUME_MS = 2500; // idle time after an interaction before auto-scroll resumes
const EASE_MS = 700; // how quickly the speed eases in and out
const DRAG_THRESHOLD = 6; // px of mouse movement before a press counts as a drag, not a click

/** USA focus section: one card per state with its top-ranked university, in a full-width, slowly
 *  auto-scrolling track that people can also drag, swipe or scroll.
 *  Heading/lead: src/content/site.json > usa. Data: src/data/state-universities.ts.
 *  The list is rendered three times ([clone, real, clone]) so the track can loop both ways; the
 *  clones are aria-hidden, not focusable, and hidden entirely when reduced motion is requested. */
export function Destinations() {
  const usa = useCmsValue("site.usa", SITE.usa);
  const trackRef = useRef<HTMLUListElement>(null);
  useLoopingScroll(trackRef);

  return (
    <section id="destinations" className="bg-white section-y">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="max-w-[16ch] type-h2 text-neutral-900">{usa.heading}</h2>
            {usa.lead && <p className="mt-5 max-w-md type-body text-neutral-600">{usa.lead}</p>}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 self-start md:self-auto">
            <a
              href="/colleges"
              className="group inline-flex items-center gap-1.5 type-button text-blue-700"
            >
              <CmsText id="Destinations.cta.colleges">See all 67 colleges</CmsText>
              <ArrowUpRight
                aria-hidden
                className="h-4 w-4 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
            <a
              href="/services"
              className="group inline-flex items-center gap-1.5 type-button text-blue-700"
            >
              <CmsText id="Destinations.cta.services">Explore our services</CmsText>
              <ArrowUpRight
                aria-hidden
                className="h-4 w-4 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </Reveal>

        <p className="section-body type-caption text-neutral-500">
          Each state's highest-ranked university in U.S. News Best National Universities (
          {RANK_EDITION}
          {OLDER > 0 && `; ${OLDER} states use the previous edition`}). Tap a card for its
          international student brief.
        </p>
      </div>

      <ul
        ref={trackRef}
        aria-label="Top-ranked university in each U.S. state"
        className="mt-6 flex cursor-grab select-none gap-4 overflow-x-auto pb-3 [scroll-behavior:auto] [scrollbar-width:none] active:cursor-grabbing motion-reduce:cursor-auto motion-reduce:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {[0, 1, 2].map((copy) =>
          STATE_UNIVERSITIES.map((s) => (
            <StateCard key={`${copy}-${s.slug}`} s={s} clone={copy !== 1} />
          )),
        )}
      </ul>
    </section>
  );
}

function StateCard({ s, clone }: { s: StateUniversity; clone: boolean }) {
  return (
    <li
      aria-hidden={clone || undefined}
      data-copy={clone ? undefined : "real"}
      className={`w-[72vw] max-w-[320px] shrink-0 sm:w-[44vw] md:w-[30vw] lg:w-[23vw] ${clone ? "motion-reduce:hidden" : ""}`}
    >
      <a
        href={`/universities/${s.slug}`}
        tabIndex={clone ? -1 : undefined}
        draggable={false}
        className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-blue-950"
      >
        {s.image ? (
          <img
            src={s.image.src}
            alt={clone ? "" : `${s.university} campus`}
            loading="lazy"
            decoding="async"
            draggable={false}
            width={640}
            height={800}
            style={{ objectPosition: s.imagePosition ?? "center 30%" }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-[1.04]"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_0%,rgb(43_109_166/0.55)_0%,transparent_60%),linear-gradient(180deg,var(--color-blue-900),var(--color-blue-950))]"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgb(4_28_49/0.88)_100%)]"
        />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="type-caption text-ice-300/90">{s.state}</div>
          <div className="mt-1 font-heading text-[1.35rem] font-light leading-tight tracking-[-0.02em] text-white">
            {s.university}
          </div>
          <div className="mt-2 flex items-center gap-1 font-text text-[13px] text-white/70">
            {s.rank.label}
            <ArrowUpRight
              aria-hidden
              className="h-3.5 w-3.5 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </a>
    </li>
  );
}

/** Slow continuous scroll on a native overflow-x track, looping over the middle copy. Pauses on
 *  hover, focus, drag, swipe or wheel and eases back in after RESUME_MS. Mouse drag is added by
 *  hand (touch and trackpads scroll natively); a drag past DRAG_THRESHOLD swallows the click. */
function useLoopingScroll(ref: RefObject<HTMLUListElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let copyW = 0;
    let pos = 0;
    let lastSet = 0;
    let velocity = 0;
    let lastInteract = 0;
    let hovered = false;
    let focused = false;
    let visible = true;
    let raf = 0;
    let last = performance.now();
    const drag = { id: -1, startX: 0, startScroll: 0, moved: false };

    const measure = () => {
      const real = el.querySelectorAll<HTMLElement>('[data-copy="real"]');
      const first = real[0];
      const next = real[real.length - 1]?.nextElementSibling as HTMLElement | null;
      if (!first || !next) return;
      const prev = copyW;
      copyW = next.offsetLeft - first.offsetLeft;
      pos = prev ? (pos / prev) * copyW : copyW; // start at the real copy
      set(pos);
    };
    const set = (x: number) => {
      el.scrollLeft = x;
      lastSet = el.scrollLeft;
    };
    // Keep the view within the middle copy so it can loop seamlessly in both directions.
    const wrap = () => {
      if (!copyW) return 0;
      let shift = 0;
      if (pos >= copyW * 1.5) shift = -copyW;
      else if (pos < copyW * 0.5) shift = copyW;
      if (shift) {
        pos += shift;
        set(pos);
      }
      return shift;
    };

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (Math.abs(el.scrollLeft - lastSet) > 1) {
        // Moved by the user (wheel, trackpad, swipe, keyboard focus): follow it and pause.
        pos = el.scrollLeft;
        lastSet = pos;
        lastInteract = now;
      }
      const running = !hovered && !focused && drag.id < 0 && now - lastInteract > RESUME_MS;
      velocity += ((running ? SPEED : 0) - velocity) * Math.min(1, dt / EASE_MS);
      if (velocity > 0.5) {
        pos += (velocity * dt) / 1000;
        set(pos);
      }
      wrap();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hovered = true;
    };
    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hovered = false;
    };
    const onPointerDown = (e: PointerEvent) => {
      drag.moved = false;
      if (e.pointerType !== "mouse" || e.button !== 0) {
        lastInteract = performance.now();
        return;
      }
      drag.id = e.pointerId;
      drag.startX = e.clientX;
      drag.startScroll = el.scrollLeft;
      pos = drag.startScroll;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.startX;
      if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD) return;
      if (!drag.moved) {
        drag.moved = true;
        el.setPointerCapture(e.pointerId);
      }
      pos = drag.startScroll - dx;
      set(pos);
      drag.startScroll += wrap();
      lastInteract = performance.now();
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== drag.id) return;
      drag.id = -1;
      lastInteract = performance.now();
    };
    const onClick = (e: MouseEvent) => {
      if (!drag.moved) return;
      e.preventDefault();
      e.stopPropagation();
      drag.moved = false;
    };
    // Only keyboard focus pauses; a mouse press also focuses the link but must not stop the loop.
    const onFocusIn = (e: FocusEvent) => {
      focused = (e.target as HTMLElement).matches(":focus-visible");
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) {
        focused = false;
        lastInteract = performance.now();
      }
    };

    el.addEventListener("pointerenter", onPointerEnter);
    el.addEventListener("pointerleave", onPointerLeave);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);

    const resize = new ResizeObserver(measure);
    resize.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(el);
    measure();
    start();

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      io.disconnect();
      el.removeEventListener("pointerenter", onPointerEnter);
      el.removeEventListener("pointerleave", onPointerLeave);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, [ref]);
}
