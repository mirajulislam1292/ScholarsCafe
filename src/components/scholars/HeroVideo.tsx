import { useEffect, useMemo, useRef } from "react";
import { useCmsList } from "@/lib/cms";
import { HERO_DESKTOP, HERO_MOBILE, type HeroClip } from "@/lib/hero-media";

type AdminClip = HeroClip & { device?: "desktop" | "mobile"; enabled?: boolean };

/** Playlist from the admin ("Hero videos"), falling back to the built-in clips. */
function usePlaylist() {
  const fallback = useMemo<AdminClip[]>(
    () => [
      ...HERO_DESKTOP.map((c) => ({ ...c, device: "desktop" as const, enabled: true })),
      ...HERO_MOBILE.map((c) => ({ ...c, device: "mobile" as const, enabled: true })),
    ],
    [],
  );
  const all = useCmsList<AdminClip>("hero", fallback).filter((c) => c.enabled !== false && c.mp4);
  const desktop = all.filter((c) => c.device !== "mobile");
  const mobile = all.filter((c) => c.device === "mobile");
  // Stable identity so the player only restarts when the playlist really changes.
  const key = JSON.stringify([desktop, mobile]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ desktop, mobile: mobile.length ? mobile : desktop }), [key]);
}

// Timing (tweak freely)
/** Seconds each clip stays on screen before the next one starts fading in. */
export const HOLD_SECONDS = 12;
/** Crossfade length between clips, in milliseconds. */
export const FADE_MS = 1800;
/** Default playback speed; slower feels calmer. A clip can override it with `rate`. */
export const DEFAULT_RATE = 0.85;

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
  const playlist = usePlaylist();
  const a = useRef<HTMLVideoElement>(null);
  const b = useRef<HTMLVideoElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layers = [a.current!, b.current!];
    if (!videoAllowed()) return;
    const portrait = window.matchMedia("(max-width: 767px) and (orientation: portrait)").matches;
    const clips = portrait ? playlist.mobile : playlist.desktop;
    if (!clips.length) return;
    const webm = layers[0].canPlayType('video/webm; codecs="vp9"') === "probably";
    let index = 0;
    let front = 0;
    let switching = false;
    let stopped = false;
    let inView = true;
    let started = false;

    const load = (el: HTMLVideoElement, clip: HeroClip) => {
      el.muted = true; // required for autoplay; React does not always reflect the attribute
      el.poster = clip.poster;
      el.dataset.rate = String(clip.rate ?? DEFAULT_RATE);
      el.src = webm && clip.webm ? clip.webm : clip.mp4;
      el.preload = "auto";
      el.load();
    };
    const rateOf = (el: HTMLVideoElement) => Number(el.dataset.rate) || DEFAULT_RATE;
    const tryPlay = (el: HTMLVideoElement) => {
      el.playbackRate = rateOf(el); // load() resets the rate, so set it on every play
      return el.play().catch(() => {});
    };

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
      const rate = rateOf(el);
      // Hand over after HOLD_SECONDS of screen time, or just before the clip runs out.
      const at = Math.min(HOLD_SECONDS * rate, el.duration - (FADE_MS / 1000) * rate);
      if (el.currentTime >= at) crossfade();
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
  }, [onClip, playlist]);

  const layer =
    "absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)]";
  return (
    <div ref={root} aria-hidden className="absolute inset-0 overflow-hidden">
      <picture>
        <source
          media="(max-width: 767px) and (orientation: portrait)"
          srcSet={playlist.mobile[0]?.poster}
        />
        <img
          src={playlist.desktop[0]?.poster}
          alt=""
          width={1920}
          height={1080}
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
