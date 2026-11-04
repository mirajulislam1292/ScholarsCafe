// Hero footage. Sources and licenses are listed in CREDITS.md; CC BY clips carry an on-screen credit.
export type HeroClip = { src: string; place: string; credit?: string };

export const HERO_DESKTOP: HeroClip[] = [
  {
    src: "/media/hero/d1-new-haven.mp4",
    place: "New Haven, Connecticut",
    credit: "Footage: Gabriel M. M. Mendes, CC BY 3.0",
  },
  { src: "/media/hero/d2-cambridge.mp4", place: "King's College, Cambridge" },
  { src: "/media/hero/d3-philadelphia.mp4", place: "Philadelphia, Pennsylvania" },
  { src: "/media/hero/d4-stanford.mp4", place: "Stanford University" },
];

export const HERO_MOBILE: HeroClip[] = [
  { src: "/media/hero/m1-oxford-radcliffe.mp4", place: "Radcliffe Camera, Oxford" },
  { src: "/media/hero/m2-oxford-all-souls.mp4", place: "Oxford" },
];

export const HERO_POSTER = {
  desktop: "/media/hero/poster-desktop.webp",
  mobile: "/media/hero/poster-mobile.webp",
};
