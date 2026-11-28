import { SITE } from "@/lib/site-content";
import { useCmsList, useCmsValue } from "@/lib/cms";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { Reveal } from "../scholars/Reveal";

type Member = {
  id?: string;
  name: string;
  role: string;
  title?: string;
  line?: string;
  photo?: string;
  group?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  /** Section (a "teamSections" entry id) and order inside it, set in the visual editor. */
  section?: string;
  rank?: number;
};
type Section = { id: string; name: string };

const DEFAULT_TEAM: Member[] = [
  ...SITE.team.founders.map((m) => ({ ...m, group: "founder" })),
  ...SITE.team.mentors.map((m) => ({ ...m, group: "mentor" })),
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** Only real HTTPS profile links are shown; anything else hides the icon. */
const safeLink = (u?: string) => (u && /^https:\/\//i.test(u.trim()) ? u.trim() : "");

function SocialLinks({ m }: { m: Member }) {
  const links = [
    { href: safeLink(m.linkedin), label: "LinkedIn", Icon: Linkedin },
    { href: safeLink(m.facebook), label: "Facebook", Icon: Facebook },
    { href: safeLink(m.instagram), label: "Instagram", Icon: Instagram },
  ].filter((l) => l.href);
  if (!links.length) return null;
  return (
    <div className="-ml-2 mt-1 flex gap-0.5">
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${m.name} on ${label}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-blue-700"
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </a>
      ))}
    </div>
  );
}

/** One row: rounded square photo (initials on a brand gradient when none), name, position, profile links. */
function Person({ m, index }: { m: Member; index: number }) {
  const role = [m.title, m.role].filter(Boolean).join(" · ");
  return (
    <li className="border-b border-neutral-900/[0.08] py-5 first:pt-0 last:border-b-0 last:pb-0 md:py-6">
      <Reveal delay={Math.min(index, 6) * 0.04}>
        <article className="flex items-center gap-4 sm:gap-6">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-blue-950 sm:h-24 sm:w-24">
            {m.photo ? (
              <img
                src={m.photo}
                alt={m.name}
                width={96}
                height={96}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="flex h-full w-full items-center justify-center bg-[radial-gradient(110%_80%_at_85%_0%,rgb(43_109_166/0.7)_0%,transparent_60%),linear-gradient(180deg,var(--color-blue-800),var(--color-blue-950))]"
              >
                <span className="font-heading text-[1.75rem] font-light leading-none tracking-[-0.04em] text-ice-100/90">
                  {initials(m.name)}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="type-h3 break-words text-neutral-900">{m.name}</h4>
            {role && <p className="type-caption mt-1 text-blue-700">{role}</p>}
            {m.line && <p className="type-body mt-1 max-w-[52ch] text-neutral-600">{m.line}</p>}
            <SocialLinks m={m} />
          </div>
        </article>
      </Reveal>
    </li>
  );
}

// Earlier order (before sections): founders, then mentors, then executive members, then any other
// group as it first appears. People the owner hasn't placed yet keep this order.
const LEGACY: Record<string, string> = { founder: "founders", mentor: "mentors" };
const ORDER = ["founders", "mentors", "executive members"];
const groupKey = (g?: string) => {
  const name = (g || "").trim().toLowerCase();
  return LEGACY[name] || name;
};
function inOrder(members: Member[]) {
  const seen: string[] = [];
  for (const m of members) if (!seen.includes(groupKey(m.group))) seen.push(groupKey(m.group));
  const rank = (k: string) =>
    ORDER.includes(k) ? ORDER.indexOf(k) : ORDER.length + seen.indexOf(k);
  // Stable sort keeps the admin's order (position) inside each group.
  return [...members].sort((a, b) => rank(groupKey(a.group)) - rank(groupKey(b.group)));
}

/** Until the owner arranges the team, everyone is in one "Leadership" section, in the earlier order. */
const DEFAULT_SECTIONS: Section[] = [{ id: "team-section-leadership", name: "Leadership" }];

/**
 * The team split into its sections, in the owner's order. People without a (known) section go in
 * the first one; inside a section, placed people come first in their order, the rest after them.
 * Sections with nobody in them are left out. Same rules as the visual editor (backend/public/app.js).
 */
function teamSections(sections: Section[], members: Member[]) {
  const list = sections.length ? sections : DEFAULT_SECTIONS;
  const blocks = list.map((s) => ({ ...s, members: [] as Member[] }));
  for (const m of inOrder(members))
    (blocks.find((b) => b.id === m.section) || blocks[0]).members.push(m);
  const order = (m: Member) => (typeof m.rank === "number" ? m.rank : 1e9);
  for (const b of blocks) b.members.sort((a, b2) => order(a) - order(b2));
  return blocks.filter((b) => b.members.length);
}

/** "Our Team": one block per section (Leadership, Mentors…). Arranged in the visual editor. */
export function Team() {
  const team = { ...SITE.team, heading: useCmsValue("site.team.heading", SITE.team.heading) };
  const members = useCmsList<Member>("team", DEFAULT_TEAM, (d, id) => ({
    ...(d as Member),
    id,
  })).filter((m) => m.name?.trim());
  const sections = useCmsList<Section>("teamSections", DEFAULT_SECTIONS, (d, id) => ({
    id,
    name: typeof d.name === "string" ? d.name : "",
  }));
  const blocks = teamSections(sections, members);
  return (
    <section id="team" className="tone-tint section-y">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <Reveal>
          <h2 className="type-h2 text-neutral-900">{team.heading}</h2>
        </Reveal>
        {blocks.map((b) => (
          <div key={b.id} className="section-body max-w-3xl">
            <Reveal>
              <h3 className="type-caption border-b border-neutral-900/[0.12] pb-3 font-medium uppercase tracking-wider text-blue-700">
                {b.name}
              </h3>
            </Reveal>
            <ul className="mt-5 md:mt-6">
              {b.members.map((m, i) => (
                <Person key={(m.id || m.name) + i} m={m} index={i} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
