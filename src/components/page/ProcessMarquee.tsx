import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCmsAuto } from "@/lib/cms";

type Step = { n: number | string; title: string; desc: string };

const SPEED = 28; // px per second: a slow drift
const IDLE_AFTER_TOUCH = 2500; // ms before the drift resumes after a swipe or button press

/**
 * "From conversation to acceptance" steps as a slow, endless horizontal drift.
 * Pauses on hover, focus and touch; drag/swipe, Prev/Next buttons and arrow keys move faster.
 * Reduced motion: no drift, a plain swipeable row with the same buttons.
 */
export function ProcessMarquee({ steps }: { steps: Step[] }) {
  const t = useCmsAuto("Process");
  const reduce = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const firstSet = useRef<HTMLOListElement>(null);
  const secondSet = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false); // the Pause button
  const state = useRef({
    pos: 0, // our own float position (scrollLeft rounds on some browsers)
    lastSet: -1,
    setWidth: 0,
    hover: false,
    focus: false,
    holdUntil: 0,
    boost: 0, // remaining px from Prev/Next, eased out
    drag: null as null | { x: number; pos: number; moved: boolean },
  });
  const animate = !reduce;

  // Width of one full set of cards (the copies repeat at this distance).
  useEffect(() => {
    const el = scroller.current;
    if (!el || !animate) return;
    const measure = () => {
      const s = state.current;
      s.setWidth = (secondSet.current?.offsetLeft ?? 0) - (firstSet.current?.offsetLeft ?? 0);
      if (s.pos === 0 && s.setWidth) s.pos = s.setWidth; // start on the middle copy
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [animate, steps.length]);

  // The drift loop.
  useEffect(() => {
    const el = scroller.current;
    if (!el || !animate) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const s = state.current;
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      const w = s.setWidth;
      if (w > 0 && !s.drag) {
        // A swipe/scroll by the user moved it: follow them.
        if (s.lastSet >= 0 && Math.abs(el.scrollLeft - s.lastSet) > 2) {
          s.pos = el.scrollLeft;
          s.holdUntil = now + IDLE_AFTER_TOUCH;
        }
        const idle = now >= s.holdUntil;
        let move = 0;
        if (s.boost) {
          const step = s.boost * Math.min(1, dt * 7);
          move += Math.abs(s.boost - step) < 0.5 ? s.boost : step;
          s.boost = Math.abs(s.boost - step) < 0.5 ? 0 : s.boost - step;
        }
        if (idle && !paused && !s.hover && !s.focus) move += SPEED * dt;
        if (move || idle) {
          s.pos += move;
          // Stay on the middle copy so there is always content on both sides.
          if (s.pos >= 2 * w) s.pos -= w;
          if (s.pos < w) s.pos += w;
          el.scrollLeft = s.pos;
          s.lastSet = el.scrollLeft;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, paused]);

  const stepWidth = () => {
    const li = firstSet.current?.querySelector("li");
    return li ? li.getBoundingClientRect().width + 20 : 320;
  };
  const go = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    if (animate) {
      const s = state.current;
      s.boost += dir * stepWidth();
      s.holdUntil = performance.now() + IDLE_AFTER_TOUCH;
    } else {
      el.scrollBy({ left: dir * stepWidth(), behavior: "auto" });
    }
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };
  // Mouse drag (touch uses native swiping).
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const s = state.current;
    s.drag = { x: e.clientX, pos: scroller.current?.scrollLeft ?? 0, moved: false };
  };
  const onPointerMove = (e: PointerEvent) => {
    const s = state.current;
    const el = scroller.current;
    if (!s.drag || !el) return;
    const dx = e.clientX - s.drag.x;
    if (Math.abs(dx) > 3) s.drag.moved = true;
    el.scrollLeft = s.drag.pos - dx;
  };
  const endDrag = () => {
    const s = state.current;
    const el = scroller.current;
    if (!s.drag || !el) return;
    s.drag = null;
    s.pos = el.scrollLeft;
    s.lastSet = el.scrollLeft;
    s.holdUntil = performance.now() + IDLE_AFTER_TOUCH;
  };

  const card = (step: Step) => (
    <>
      <span className="font-heading text-[3.5rem] font-light leading-none text-ice-500 transition-colors duration-700 group-hover:text-ice-200">
        {String(step.n).padStart(2, "0")}
      </span>
      <h3 className="type-h3 mt-8 text-white">{step.title}</h3>
      <p className="type-body mt-3 text-ice-300/80">{step.desc}</p>
    </>
  );
  const cardClass =
    "group w-[min(78vw,300px)] shrink-0 select-none rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-[background-color,border-color] duration-700 ease-premium hover:border-white/20 hover:bg-white/[0.06] sm:w-[320px] lg:w-[360px] md:p-8";
  const btn =
    "inline-flex h-11 w-11 items-center justify-center rounded-full text-white ring-1 ring-white/25 transition-colors duration-500 ease-premium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ice-200";

  return (
    <div className="section-body">
      <div
        ref={scroller}
        role="region"
        aria-roledescription="carousel"
        aria-label={t("Our process, six steps. Use the arrow keys to move.")}
        tabIndex={0}
        onKeyDown={onKey}
        onMouseEnter={() => (state.current.hover = true)}
        onMouseLeave={() => {
          state.current.hover = false;
          endDrag();
        }}
        onFocus={() => (state.current.focus = true)}
        onBlur={() => (state.current.focus = false)}
        onTouchStart={() => (state.current.holdUntil = performance.now() + 60_000)}
        onTouchEnd={() => (state.current.holdUntil = performance.now() + IDLE_AFTER_TOUCH)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        className={`flex gap-5 overflow-x-auto py-2 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ice-200 [&::-webkit-scrollbar]:hidden ${
          animate
            ? "cursor-grab active:cursor-grabbing [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
            : "snap-x snap-mandatory scroll-px-6 px-6 md:scroll-px-12 md:px-12 xl:scroll-px-[calc((100vw-1200px)/2+3rem)] xl:px-[calc((100vw-1200px)/2+3rem)]"
        }`}
      >
        {animate && (
          <div aria-hidden className="flex shrink-0 gap-5">
            {steps.map((s) => (
              <div key={s.n} className={cardClass}>
                {card(s)}
              </div>
            ))}
          </div>
        )}
        <ol ref={firstSet} aria-label={t("Our process")} className="flex shrink-0 gap-5">
          {steps.map((s) => (
            <li key={s.n} className={`${cardClass} ${animate ? "" : "snap-start"}`}>
              {card(s)}
            </li>
          ))}
        </ol>
        {animate && (
          <div ref={secondSet} aria-hidden className="flex shrink-0 gap-5">
            {steps.map((s) => (
              <div key={s.n} className={cardClass}>
                {card(s)}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mx-auto mt-6 flex max-w-[1200px] justify-end gap-2 px-6 md:px-12">
        {animate && (
          <button
            type="button"
            className={btn}
            aria-pressed={paused}
            aria-label={paused ? t("Play the steps") : t("Pause the steps")}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? (
              <Play aria-hidden className="h-4 w-4" />
            ) : (
              <Pause aria-hidden className="h-4 w-4" />
            )}
          </button>
        )}
        <button
          type="button"
          className={btn}
          aria-label={t("Previous step")}
          onClick={() => go(-1)}
        >
          <ChevronLeft aria-hidden className="h-5 w-5" />
        </button>
        <button type="button" className={btn} aria-label={t("Next step")} onClick={() => go(1)}>
          <ChevronRight aria-hidden className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
