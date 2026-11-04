import { useEffect, useRef } from "react";

/** Gently pulls an element toward the pointer (fine pointers only, off for reduced motion). */
export function useMagnetic<T extends HTMLElement>(strength = 0.25, max = 8) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = Math.max(-max, Math.min(max, (e.clientX - (r.left + r.width / 2)) * strength));
      const y = Math.max(-max, Math.min(max, (e.clientY - (r.top + r.height / 2)) * strength));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => (el.style.translate = `${x}px ${y}px`));
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      el.style.translate = "0px 0px";
    };
    el.style.transition = "translate 600ms cubic-bezier(0.22, 1, 0.36, 1)";
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength, max]);
  return ref;
}
