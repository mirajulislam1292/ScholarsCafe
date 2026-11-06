import { createFileRoute } from "@tanstack/react-router";
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
import type { ComponentType } from "react";
import { CmsText, useCmsList, useCmsValue } from "@/lib/cms";
import { EMAIL, STUDENT_PORTAL_URL, WA_LINK } from "@/lib/scholars-data";

// Link-in-bio page (scholarscafe.com/links). Everything is edited in the admin under Website → Link page.
export const Route = createFileRoute("/links")({
  head: () => ({
    meta: [
      { title: "Scholars Cafe · Links" },
      {
        name: "description",
        content: "Guides, free strategy calls and the student portal from Scholars Cafe.",
      },
    ],
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
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  email: Mail,
  website: Globe,
  tiktok: Play,
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
  const withIds = useCmsList<Item>("links", FALLBACK, (d, id) => ({
    ...(d as Omit<Item, "id">),
    id,
  })).filter((i) => i.enabled !== false);
  const social = withIds.filter((i) => i.type === "social");
  const featured = withIds.filter((i) => (i.type ?? "link") === "link" && i.highlight);
  const links = withIds.filter((i) => (i.type ?? "link") === "link" && !i.highlight);
  const videos = withIds.filter((i) => i.type === "youtube" && youtubeId(i.url));
  const tagline = useCmsValue("links.tagline", "");
  const go = (i: Item) => ({
    href: i.url,
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
        <h1 className="type-h3 mt-5 text-center">Scholars Cafe</h1>
        <p className="type-body mt-2 max-w-[34ch] text-center text-ice-300/90">
          {tagline || (
            <CmsText id="Links.tagline">
              Mentor-led guidance for studying abroad, from Bangladesh.
            </CmsText>
          )}
        </p>
        {social.length > 0 && (
          <ul className="mt-6 flex flex-wrap justify-center gap-3">
            {social.map((s) => {
              const Icon = ICONS[s.platform || "website"] || Globe;
              return (
                <li key={s.id}>
                  <a
                    {...go(s)}
                    aria-label={s.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] transition-[background-color,border-color] duration-500 ease-premium hover:border-white/30 hover:bg-white/[0.1]"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-10 grid w-full gap-3">
          {featured.map((l) => (
            <a
              key={l.id}
              {...go(l)}
              className="group flex min-h-16 items-center justify-between gap-4 rounded-3xl bg-ice-100 px-6 py-4 text-blue-950 transition-[transform,box-shadow] duration-500 ease-premium hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgb(0_0_0/0.35)]"
            >
              <span>
                <span className="type-button block">{l.label}</span>
                {l.note && (
                  <span className="type-caption mt-1 block text-blue-900/70">{l.note}</span>
                )}
              </span>
              <ArrowUpRight
                aria-hidden
                className="h-4 w-4 shrink-0 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          ))}
          {links.map((l) => (
            <a
              key={l.id}
              {...go(l)}
              className="flex min-h-14 items-center justify-between gap-4 rounded-3xl border border-white/12 bg-white/[0.04] px-6 py-3.5 transition-[background-color,border-color] duration-500 ease-premium hover:border-white/25 hover:bg-white/[0.08]"
            >
              <span>
                <span className="type-button block">{l.label}</span>
                {l.note && (
                  <span className="type-caption mt-1 block text-ice-300/80">{l.note}</span>
                )}
              </span>
              <ArrowUpRight aria-hidden className="h-4 w-4 shrink-0 opacity-70" />
            </a>
          ))}
        </div>
        {videos.length > 0 && (
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
        <a href="/" className="type-caption mt-14 text-ice-400 hover:text-ice-100">
          scholarscafe.com
        </a>
      </div>
    </main>
  );
}
