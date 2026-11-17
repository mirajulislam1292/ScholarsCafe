import { SITE } from "@/lib/site-content";
import { useCmsList, useCmsValue, useCmsAuto } from "@/lib/cms";
import { Instagram, Linkedin } from "lucide-react";
import { Reveal } from "../scholars/Reveal";

type Member = {
  name: string;
  role: string;
  title?: string;
  line?: string;
  photo?: string;
  group?: string;
  linkedin?: string;
  instagram?: string;
};

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
    { href: safeLink(m.instagram), label: "Instagram", Icon: Instagram },
  ].filter((l) => l.href);
  if (!links.length) return null;
  return (
    <div className="-ml-2 mt-1 flex gap-1 sm:mt-2">
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${m.name} on ${label}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-blue-700"
        >
          <Icon className="h-5 w-5" aria-hidden />
        </a>
      ))}
    </div>
  );
}

/**
 * Person card. Phone: small photo on the left, name, title and profile links to its right.
 * Larger screens: the tall portrait with the text below. Initials on a brand gradient when no photo exists.
 */
function Portrait({ m, index }: { m: Member; index: number }) {
  const role = [m.title, m.role].filter(Boolean).join(" · ");
  return (
    <Reveal delay={index * 0.06}>
      <article className="group flex items-center gap-4 sm:block">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-blue-950 sm:aspect-[4/5] sm:h-auto sm:w-full sm:rounded-3xl">
          {m.photo ? (
            <img
              src={m.photo}
              alt={m.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-[1.03]"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-full w-full items-center justify-center bg-[radial-gradient(110%_80%_at_85%_0%,rgb(43_109_166/0.7)_0%,transparent_60%),linear-gradient(180deg,var(--color-blue-800),var(--color-blue-950))] sm:items-end sm:justify-start sm:p-5 md:p-7"
            >
              <span className="font-heading text-[1.75rem] font-light leading-none tracking-[-0.04em] text-ice-100/90 sm:text-[clamp(2.75rem,8vw,6.5rem)]">
                {initials(m.name)}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="type-h3 break-words text-neutral-900 sm:mt-6">{m.name}</h3>
          {role && <p className="type-caption mt-1 text-blue-700">{role}</p>}
          <SocialLinks m={m} />
          {m.line && (
            <p className="type-body mt-2 max-w-[32ch] text-neutral-600 sm:mt-3">{m.line}</p>
          )}
        </div>
      </article>
    </Reveal>
  );
}

function Group({ label, members }: { label: string; members: Member[] }) {
  const t = useCmsAuto("Team.group");
  const shown = members.filter((m) => m.name?.trim());
  if (!shown.length) return null;
  return (
    <div className="grid gap-10 border-t border-neutral-900/[0.08] pt-10 lg:grid-cols-[1fr_3fr] lg:gap-16">
      <h3 className="type-h3 text-neutral-500 lg:sticky lg:top-32 lg:self-start">{t(label)}</h3>
      <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 xl:grid-cols-3">
        {shown.map((m, i) => (
          <Portrait key={m.name} m={m} index={i} />
        ))}
      </div>
    </div>
  );
}

// Older entries say "founder"/"mentor"; show them as "Founders"/"Mentors". Any other group name is shown as typed.
const LEGACY: Record<string, string> = { founder: "Founders", mentor: "Mentors" };
const ORDER = ["founders", "mentors", "executive members"];
const groupName = (g?: string) => {
  const name = (g || "").trim();
  return LEGACY[name.toLowerCase()] || name || "Team";
};
/** Groups in a fixed order (founders, mentors, executive members), then any others as they first appear. */
function byGroup(members: Member[]) {
  const groups = new Map<string, { label: string; members: Member[] }>();
  for (const m of members) {
    const label = groupName(m.group);
    const key = label.toLowerCase();
    if (!groups.has(key)) groups.set(key, { label, members: [] });
    groups.get(key)!.members.push(m);
  }
  const rank = (k: string) => (ORDER.includes(k) ? ORDER.indexOf(k) : ORDER.length);
  return [...groups.entries()].sort((a, b) => rank(a[0]) - rank(b[0])).map(([, g]) => g);
}

/** "Our Team": one section per group (founders, mentors, executive members, …). Edited in the admin under Our Team. */
export function Team() {
  const team = { ...SITE.team, heading: useCmsValue("site.team.heading", SITE.team.heading) };
  const members = useCmsList<Member>("team", DEFAULT_TEAM);
  return (
    <section id="team" className="bg-white py-[clamp(72px,13vw,200px)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <Reveal>
          <h2 className="type-h2 text-neutral-900">{team.heading}</h2>
        </Reveal>
        <div className="mt-16 grid gap-20 md:mt-20">
          {byGroup(members).map((g) => (
            <Group key={g.label} label={g.label} members={g.members} />
          ))}
        </div>
      </div>
    </section>
  );
}
