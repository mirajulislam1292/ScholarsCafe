import { useEffect, useRef, useState } from "react";

export function CountUp({
  end,
  suffix = "",
  duration = 2000,
  text,
}: {
  end: number;
  suffix?: string;
  duration?: number;
  text?: string;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (t: number) => {
              const p = Math.min((t - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(Math.floor(eased * end));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.15 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [end, duration]);

  if (text) return <span ref={ref}>{text}</span>;
  return (
    <span ref={ref}>
      {val}
      <span className="text-sky">{suffix}</span>
    </span>
  );
}
