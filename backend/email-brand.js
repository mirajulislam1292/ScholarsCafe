// Brand values for every email the app sends. Change them here and every email follows.
// Colours and fonts match the website (src/styles.css); links match the website footer.

export const BRAND_NAME = "Scholars Cafe";
export const TAGLINE = "A Cafe to Ease Your Study Abroad Journey";
export const SITE = "https://scholarscafe.com";
export const SITE_LABEL = "scholarscafe.com";
export const CONTACT = "contact@scholarscafe.com";

// Absolute PNG URLs (mail apps block SVG, webp and embedded images). Served from public/brand/.
export const LOGO = {
  light: SITE + "/brand/mark-blue.png",
  dark: SITE + "/brand/mark-ice.png",
  // Width / height of the mark (160 x 144 source files).
  ratio: 160 / 144,
};

export const SOCIAL = [
  ["Facebook", "https://www.facebook.com/profile.php?id=61571394902795"],
  ["Instagram", "https://www.instagram.com/scholars_cafe_/"],
  ["LinkedIn", "https://www.linkedin.com/company/scholars-cafe09/"],
  ["YouTube", "https://youtube.com/@scholarscafe09"],
  ["TikTok", "https://www.tiktok.com/@scholars.cafe"],
];

export const COLORS = {
  navy: "#041c31", // headings and body text
  blue: "#0b426d", // buttons
  link: "#2b6da6",
  ice: "#e8f3f9", // footer panel and code box
  page: "#f1f5f8",
  line: "#e3e8ee",
  muted: "#5b6876",
  card: "#ffffff",
};

export const DARK = {
  page: "#0b1622",
  card: "#13202d",
  footer: "#0f1b27",
  line: "#24364a",
  text: "#e6edf3",
  muted: "#9fb0c0",
  link: "#8cc2f0", // also the button colour in dark mode, with navy text
};

export const FONTS = {
  heading: "'Funnel Display','Segoe UI',Helvetica,Arial,sans-serif",
  body: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  mono: "'SFMono-Regular',Menlo,Consolas,'Courier New',monospace",
  googleCss:
    "https://fonts.googleapis.com/css2?family=Funnel+Display:wght@500;600;700&display=swap",
};
