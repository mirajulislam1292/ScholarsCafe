import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  Check,
  CreditCard,
  Facebook,
  Flag,
  Globe,
  Instagram,
  Layers,
  Lightbulb,
  Linkedin,
  Link2,
  Mail,
  Megaphone,
  Music2,
  Pin,
  Smartphone,
  Trophy,
  Wallet,
  X,
  XCircle,
  Youtube,
  CheckCircle2,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

// Form introductions are written like Google Form descriptions: emoji-led lines, "Heading:" lines followed
// by plain list lines, and "Name: https://link" lines. This turns them into an aligned layout with the
// site's line icons instead of emojis: emojis at the start of a line become a matching icon, other emojis
// are left out, a heading's following lines become an aligned list, and links become buttons.

const ICONS: [RegExp, LucideIcon][] = [
  [/^✅/u, CheckCircle2],
  [/^(⛔|❌|🚫)/u, XCircle],
  [/^(⚠|🚨|‼)/u, AlertTriangle],
  [/^💰/u, Wallet],
  [/^(💲|💵)/u, Banknote],
  [/^🔷/u, Layers],
  [/^(📌|📍)/u, Pin],
  [/^🚩/u, Flag],
  [/^💡/u, Lightbulb],
  [/^(📢|📣)/u, Megaphone],
  [/^👉/u, ChevronRight],
  [/^💳/u, CreditCard],
  [/^(🚀|📱)/u, Smartphone],
  [/^(📩|📧|✉)/u, Mail],
  [/^🔗/u, Link2],
  [/^🏆/u, Trophy],
  [/^(📅|🗓)/u, CalendarDays],
];
const EMOJI =
  /(\p{Extended_Pictographic}|\p{Regional_Indicator})(️|‍|\p{Emoji_Modifier}|\p{Extended_Pictographic})*/gu;
const LEAD =
  /^\s*((\p{Extended_Pictographic}|‼)(️|‍|\p{Emoji_Modifier}|\p{Extended_Pictographic})*)\s*/u;

/** Removes emojis and fancy Unicode letters (𝐅𝐞𝐞𝐬 → Fees). */
export const plain = (s: string) =>
  s.normalize("NFKC").replace(EMOJI, "").replace(/\s+$/g, "").replace(/^\s+/, "");

const LINK = /(https:\/\/[^\s<>"')]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;
const short = (url: string) =>
  url
    .replace(/^https:\/\/(www\.)?/, "")
    .replace(/\?.*$/, "")
    .replace(/\/$/, "");
/** Inline text: **bold**, *bold* and clickable https links. */
export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  text.split(LINK).forEach((part, i) => {
    if (i % 2)
      return out.push(
        <a
          key={i}
          href={part.startsWith("https://") ? part : "mailto:" + part}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-blue-700 underline underline-offset-2"
        >
          {part.startsWith("https://") ? short(part) : part}
        </a>,
      );
    part.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).forEach((bit, j) => {
      if (/^\*\*?[^*]/.test(bit) && /\*$/.test(bit))
        out.push(
          <strong key={i + "-" + j} className="font-semibold text-neutral-900">
            {bit.replace(/^\*\*?|\*\*?$/g, "")}
          </strong>,
        );
      else if (bit) out.push(bit);
    });
  });
  return <>{out}</>;
}

const SOCIAL: [RegExp, LucideIcon][] = [
  [/facebook/i, Facebook],
  [/instagram/i, Instagram],
  [/linkedin/i, Linkedin],
  [/youtube/i, Youtube],
  [/tiktok/i, Music2],
];
function SocialLink({ label, url }: { label: string; url: string }) {
  const Icon = SOCIAL.find(([re]) => re.test(label + url))?.[1] ?? Globe;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="type-caption inline-flex items-center gap-2 rounded-full border border-neutral-900/10 bg-white px-3.5 py-2 text-neutral-800 transition-colors hover:border-blue-700 hover:text-blue-700"
    >
      <Icon aria-hidden className="size-4" strokeWidth={1.75} />
      {label}
    </a>
  );
}

type Block =
  | { kind: "para"; lines: string[]; icon?: LucideIcon }
  | { kind: "list"; title: string; icon?: LucideIcon; items: string[]; tone: "yes" | "no" | "dot" }
  | { kind: "links"; title: string; icon?: LucideIcon; links: { label: string; url: string }[] };

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  let open: Block | null = null;
  for (const raw of text.normalize("NFKC").split("\n")) {
    const lead = raw.match(LEAD);
    const icon = lead ? ICONS.find(([re]) => re.test(lead[1]))?.[1] : undefined;
    const line = plain(raw);
    if (!line) {
      open = null; // a blank line ends a list or paragraph
      continue;
    }
    const link = line.match(/^([^:]{2,30}):\s*(https:\/\/\S+)$/);
    if (link && open && (open.kind === "links" || open.kind === "list") && !lead) {
      if (open.kind === "list" && !open.items.length) {
        const links: Block = { kind: "links", title: open.title, icon: open.icon, links: [] };
        blocks.pop();
        blocks.push(links);
        open = links;
      }
      if (open.kind === "links") {
        open.links.push({ label: link[1].trim(), url: link[2] });
        continue;
      }
    }
    if (lead && /:$/.test(line)) {
      const tone = /^(⛔|❌|🚫)/u.test(lead[1]) ? "no" : /^✅/u.test(lead[1]) ? "yes" : "dot";
      open = { kind: "list", title: line, icon, items: [], tone };
      blocks.push(open);
      continue;
    }
    if (lead) {
      open = { kind: "para", lines: [line], icon };
      blocks.push(open);
      continue;
    }
    if (open?.kind === "list" && !/^(N\.?B\.?|Note)\b/i.test(line)) {
      open.items.push(line);
      continue;
    }
    if (open?.kind === "para") {
      open.lines.push(line);
      continue;
    }
    open = { kind: "para", lines: [line] };
    blocks.push(open);
  }
  return blocks;
}

function IconDot({ icon: Icon }: { icon?: LucideIcon }) {
  return (
    <span
      aria-hidden
      className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-ice-50 text-blue-700"
    >
      {Icon ? (
        <Icon className="size-4" strokeWidth={1.75} />
      ) : (
        <span className="size-1.5 rounded-full bg-blue-700" />
      )}
    </span>
  );
}

/** A form introduction or a long description, laid out with aligned icons. */
export function FormRichText({ text, compact = false }: { text: string; compact?: boolean }) {
  const blocks = parse(text);
  const body = compact ? "type-caption text-neutral-500" : "type-body text-neutral-600";
  return (
    <div className={compact ? "grid gap-2" : "grid gap-5"}>
      {blocks.map((b, i) => {
        if (b.kind === "para") {
          const content = (
            <div className={body + " min-w-0 break-words"}>
              {b.lines.map((l, j) => (
                <p
                  key={j}
                  className={
                    (j ? "mt-1" : "") +
                    (i === 0 && j === 0 && !compact
                      ? " type-lead font-medium text-neutral-900"
                      : "")
                  }
                >
                  <Inline text={l} />
                </p>
              ))}
            </div>
          );
          return b.icon && !compact ? (
            <div key={i} className="flex gap-3">
              <IconDot icon={b.icon} />
              <div className="pt-1">{content}</div>
            </div>
          ) : (
            <div key={i}>{content}</div>
          );
        }
        const head = (
          <div className="flex items-center gap-3">
            {!compact && <IconDot icon={b.icon} />}
            <p
              className={
                (compact ? "type-caption" : "type-body") + " font-semibold text-neutral-900"
              }
            >
              <Inline text={b.title} />
            </p>
          </div>
        );
        if (b.kind === "links")
          return (
            <div key={i} className="grid gap-3">
              {head}
              <div className={"flex flex-wrap gap-2 " + (compact ? "" : "pl-11")}>
                {b.links.map((l) => (
                  <SocialLink key={l.url} {...l} />
                ))}
              </div>
            </div>
          );
        const Mark = b.tone === "yes" ? Check : b.tone === "no" ? X : null;
        return (
          <div key={i} className="grid gap-2">
            {head}
            {b.items.length > 0 && (
              <ul className={"grid gap-1.5 " + (compact ? "" : "pl-11")}>
                {b.items.map((item, j) =>
                  /:$/.test(item) ? (
                    <li key={j} className={body + " mt-1 font-medium text-neutral-800"}>
                      <Inline text={item} />
                    </li>
                  ) : (
                    <li key={j} className={body + " flex gap-2.5"}>
                      {Mark ? (
                        <Mark
                          aria-hidden
                          className={
                            "mt-[0.3em] size-4 shrink-0 " +
                            (b.tone === "no" ? "text-neutral-400" : "text-blue-700")
                          }
                          strokeWidth={2}
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-blue-700/60"
                        />
                      )}
                      <span className="min-w-0 break-words">
                        <Inline text={item} />
                      </span>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
