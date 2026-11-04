import { useEffect, useRef } from "react";
import { HERO_DESKTOP, HERO_MOBILE, HERO_POSTER, type HeroClip } from "@/lib/hero-media";

const FADE_MS = 1400;

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

/** Should we play video at all? Posters only for reduced motion, data saver and slow networks. */
function videoAllowed() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: NetworkInfo }).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType && /(^|-)2g|3g/.test(conn.effectiveType)) return false;
  return true;
}

/**
 * Full-bleed background footage: clips play one after another with a slow crossfade, in a loop.
 * Two stacked <video> layers; the hidden one preloads the next clip. No controls, always muted.
 */
export function HeroVideo({ onClip }: { onClip?: (clip: HeroClip | null) => void }) {
  const a = useRef<HTMLVideoElement>(null);
  const b = useRef<HTMLVideoElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layers = [a.current!, b.current!];
    if (!videoAllowed()) return;
    const portrait = window.matchMedia("(max-width: 767px) and (orientation: portrait)").matches;
    const clips = portrait ? HERO_MOBILE : HERO_DESKTOP;
    let index = 0;
    let front = 0;
    let switching = false;
    let stopped = false;
    let inView = true;
    let started = false;

    const load = (el: HTMLVideoElement, clip: HeroClip) => {
      el.muted = true; // required for autoplay; React does not always reflect the attribute
      el.src = clip.src;
      el.preload = "auto";
      el.load();
    };
    const tryPlay = (el: HTMLVideoElement) => el.play().catch(() => {});

    const crossfade = () => {
      if (switching || clips.length < 2) return;
      switching = true;
      const current = layers[front];
      const next = layers[1 - front];
      next.currentTime = 0;
      tryPlay(next);
      next.style.opacity = "1";
      current.style.opacity = "0";
      index = (index + 1) % clips.length;
      onClip?.(clips[index]);
      window.setTimeout(() => {
        current.pause();
        front = 1 - front;
        switching = false;
        if (!stopped) load(current, clips[(index + 1) % clips.length]);
      }, FADE_MS);
    };

    const onTime = (e: Event) => {
      const el = e.currentTarget as HTMLVideoElement;
      if (el !== layers[front] || !el.duration) return;
      if (el.duration - el.currentTime <= FADE_MS / 1000) crossfade();
    };
    const onEnded = (e: Event) => {
      // Single clip, or the fade window was missed: restart cleanly.
      if (clips.length < 2) {
        (e.currentTarget as HTMLVideoElement).currentTime = 0;
        tryPlay(e.currentTarget as HTMLVideoElement);
      } else crossfade();
    };
    const onError = () => {
      // Keep the poster if anything fails.
      stopped = true;
      layers.forEach((el) => (el.style.opacity = "0"));
      onClip?.(null);
    };

    layers.forEach((el) => {
      el.addEventListener("timeupdate", onTime);
      el.addEventListener("ended", onEnded);
      el.addEventListener("error", onError);
    });

    const start = () => {
      if (started || stopped) return;
      started = true;
      const first = layers[0];
      load(first, clips[0]);
      first.addEventListener(
        "playing",
        () => {
          first.style.opacity = "1";
          onClip?.(clips[0]);
          if (clips.length > 1) load(layers[1], clips[1]);
        },
        { once: true },
      );
      if (inView) tryPlay(first);
    };

    // Start after the page has loaded so footage never competes with the poster and text.
    const begin = () => window.setTimeout(start, 300);
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });

    // Pause off-screen and in background tabs.
    const sync = () => {
      const el = layers[front];
      if (!started || stopped) return;
      if (inView && !document.hidden) tryPlay(el);
      else el.pause();
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    if (root.current) io.observe(root.current);
    document.addEventListener("visibilitychange", sync);

    return () => {
      stopped = true;
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("load", begin);
      layers.forEach((el) => {
        el.removeEventListener("timeupdate", onTime);
        el.removeEventListener("ended", onEnded);
        el.removeEventListener("error", onError);
        el.pause();
        el.removeAttribute("src");
        el.load();
      });
    };
  }, [onClip]);

  const layer =
    "absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)]";
  return (
    <div ref={root} aria-hidden className="absolute inset-0 overflow-hidden">
      <picture>
        <source
          media="(max-width: 767px) and (orientation: portrait)"
          srcSet={HERO_POSTER.mobile}
        />
        <img
          src={HERO_POSTER.desktop}
          alt=""
          width={1600}
          height={900}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      {[a, b].map((ref, i) => (
        <video
          key={i}
          ref={ref}
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          preload="none"
          tabIndex={-1}
          className={layer}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        />
      ))}
    </div>
  );
}
