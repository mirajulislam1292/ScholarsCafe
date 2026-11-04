// Hero footage (USA only). Sources and licenses are in CREDITS.md; CC BY clips carry an on-screen credit.
// To replace a clip, see USER_MANUAL.md ("Replace the hero videos").
export type HeroClip = {
  mp4: string;
  webm?: string;
  poster: string;
  place: string;
  credit?: string;
  /** Playback speed for this clip (default DEFAULT_RATE in HeroVideo.tsx). */
  rate?: number;
};

const clip = (name: string, place: string, extra: Partial<HeroClip> = {}): HeroClip => ({
  mp4: `/media/hero/${name}.mp4`,
  webm: `/media/hero/${name}.webm`,
  poster: `/media/hero/${name}.webp`,
  place,
  ...extra,
});

/** 1920×1080 landscape clips for tablets and desktops. */
export const HERO_DESKTOP: HeroClip[] = [
  clip("d1-new-haven", "New Haven, Connecticut", {
    credit: "Footage: Gabriel M. M. Mendes, CC BY 3.0",
  }),
  clip("d2-columbia", "Columbia University, New York", { rate: 0.9 }),
  clip("d3-philadelphia-university", "Philadelphia, Pennsylvania"),
  clip("d4-philadelphia-campus", "Philadelphia, Pennsylvania"),
];

/** 720×1280 portrait clips for phones. */
export const HERO_MOBILE: HeroClip[] = [
  clip("m1-columbia", "Columbia University, New York", { rate: 0.9 }),
  clip("m2-philadelphia-university", "Philadelphia, Pennsylvania"),
  clip("m3-philadelphia-campus", "Philadelphia, Pennsylvania"),
];
