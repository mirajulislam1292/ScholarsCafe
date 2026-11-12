import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import {
  ArrowUpRight,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Play,
  Youtube,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { CmsText, useCmsList, useCmsReady, useCmsValue, useCmsAuto } from "@/lib/cms";
import { EMAIL, STUDENT_PORTAL_URL, WA_LINK } from "@/lib/scholars-data";

// Link-in-bio page (scholarscafe.com/links). Everything is edited in the admin under Website → Link page.
export const Route = createFileRoute("/links")({
  head: () =>
    seo({
      path: "/links",
      title: "Scholars Cafe \u00b7 Links",
      description:
        "Scholars Cafe on YouTube, Instagram, Facebook, LinkedIn, TikTok and WhatsApp, plus our website and student portal.",
    }),
  component: LinksPage,
});

type Item = {
  id: string;
  type?: "link" | "social" | "youtube";
  platform?: string;
  label: string;
  url: string;
  note?: string;
  highlight?: boolean;
  enabled?: boolean;
};
const API = import.meta.env.VITE_CONTENT_API || "https://admin.scholarscafe.com";
function TikTok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  email: Mail,
  website: Globe,
  tiktok: TikTok,
};
// Until links are published in the admin, show the links the site already uses (footer and contact).
const FALLBACK: Item[] = [
  {
    id: "fb",
    type: "social",
    platform: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61571394902795",
  },
  {
    id: "ig",
    type: "social",
    platform: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/scholars_cafe_/",
  },
  {
    id: "li",
    type: "social",
    platform: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/scholars-cafe09/",
  },
  { id: "em", type: "social", platform: "email", label: "Email", url: "mailto:" + EMAIL },
  { id: "call", type: "link", label: "Book a free strategy call", url: WA_LINK, highlight: true },
  { id: "res", type: "link", label: "Free guides", url: "/resources" },
  { id: "portal", type: "link", label: "Student portal", url: STUDENT_PORTAL_URL },
  { id: "site", type: "link", label: "Our website", url: "/" },
];
const youtubeId = (url: string) =>
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/.exec(url)?.[1];
const external = (url: string) => /^https?:/.test(url);
/** wa.me links only work with digits ("https://wa.me/8801…"); remove spaces, "+", dashes and hidden characters. */
const fixLink = (url: string) => {
  const m = /^https:\/\/wa\.me\/([^?]*)(\?.*)?$/.exec(url.trim());
  if (!m) return url;
  const query = (m[2] || "").replace(/^\?text=$/, "");
  return "https://wa.me/" + m[1].replace(/\D/g, "") + query;
};

function track(item: Item) {
  // Only admin-published links are counted; one anonymous counter per link per day.
  if (FALLBACK.some((f) => f.id === item.id)) return;
  try {
    navigator.sendBeacon?.(`${API}/public/links/${encodeURIComponent(item.id)}/click`);
  } catch {
    /* counting must never block the click */
  }
}

function LinksPage() {
  const t = useCmsAuto("Links");
  const withIds = useCmsList<Item>("links", FALLBACK, (d, id) => ({
    ...(d as Omit<Item, "id">),
    id,
  })).filter((i) => i.enabled !== false);
  // YouTube *videos* get cards below; everything else (including a YouTube channel link) is a list button.
  const videos = withIds.filter((i) => i.type === "youtube" && youtubeId(i.url));
  const rows = withIds
    .filter((i) => !videos.includes(i))
    .map((i) => (i.type === "youtube" && !i.platform ? { ...i, platform: "youtube" } : i));
  // The page is pre-built before your links load: show quiet placeholders instead of the built-in
  // starter links, so nothing jumps. The starter links appear only if loading fails (e.g. offline).
  const ready = useCmsReady();
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 4000);
    return () => clearTimeout(t);
  }, []);
  const loading = !ready && !waited;
  // Always end with a button to the main website (unless the admin already added one).
  const hasSite = rows.some(
    (r) => r.url === "/" || /^https:\/\/(www\.)?scholarscafe\.com\/?$/.test(r.url),
  );
  const list = hasSite
    ? rows
    : [
        ...rows,
        {
          id: "site",
          type: "link" as const,
          platform: "website",
          label: t("Scholars Cafe website"),
          url: "/",
        },
      ];
  const tagline = useCmsValue("links.tagline", "");
  const go = (i: Item) => ({
    href: fixLink(i.url),
    onClick: () => track(i),
    ...(external(i.url) ? { target: "_blank", rel: "noopener noreferrer" } : {}),
  });
  return (
    <main className="relative min-h-svh overflow-hidden bg-blue-950 px-5 pb-16 pt-14 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgb(43_109_166/0.45)_0%,transparent_70%)]"
      />
      <div className="relative mx-auto flex max-w-[480px] flex-col items-center">
        <img
          src="/brand/mark-ice.webp"
          alt=""
          width={72}
          height={72}
          className="h-[72px] w-[72px]"
        />
        <h1 className="type-h3 mt-5 text-center">
          <CmsText id="Links.heading">Scholars Cafe</CmsText>
        </h1>
        <p className="type-body mt-2 max-w-[34ch] text-center text-ice-300/90">
          {tagline || (
            <CmsText id="Links.tagline">
              Mentor-led guidance for studying abroad, from Bangladesh.
            </CmsText>
          )}
        </p>
        {/* One list of buttons in the admin's order, each with its network's icon; featured ones get an outline. */}
        <div className="mt-10 grid w-full gap-3" aria-busy={loading}>
          {loading &&
            [0, 1, 2, 3].map((n) => (
              <div key={n} aria-hidden className="h-16 animate-pulse rounded-3xl bg-white/[0.06]" />
            ))}
          {!loading &&
            list.map((l) => {
              const Icon = l.platform ? ICONS[l.platform] || Globe : null;
              return (
                <a
                  key={l.id}
                  {...go(l)}
                  className={`group flex min-h-16 items-center gap-4 rounded-3xl bg-ice-100 px-5 py-4 text-blue-950 transition-[transform,box-shadow] duration-500 ease-premium hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgb(0_0_0/0.35)] ${l.highlight ? "ring-2 ring-ice-300 ring-offset-2 ring-offset-blue-950" : ""}`}
                >
                  {Icon && (
                    <span
                      aria-hidden
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-950/[0.08]"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="type-button block">{l.label}</span>
                    {l.note && (
                      <span className="type-caption mt-1 block text-blue-900/70">{l.note}</span>
                    )}
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="h-4 w-4 shrink-0 opacity-70 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              );
            })}
        </div>
        {!loading && videos.length > 0 && (
          <section className="mt-12 w-full">
            <h2 className="type-caption text-ice-400">Watch</h2>
            <div className="mt-4 grid gap-4">
              {videos.map((v) => (
                <a
                  key={v.id}
                  {...go(v)}
                  className="group block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
                >
                  <span className="relative block aspect-video">
                    <img
                      src={`https://i.ytimg.com/vi/${youtubeId(v.url)}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-blue-950">
                        <Play className="ml-0.5 h-6 w-6" />
                      </span>
                    </span>
                  </span>
                  <span className="type-button block px-5 py-4">{v.label}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
