import { ArrowUpRight, FileCheck2, MessageCircle, PlayCircle, Radio } from "lucide-react";
import { CmsText, useCmsLookup, useCmsValue } from "@/lib/cms";
import { STUDENT_PORTAL_URL } from "@/lib/scholars-data";
import { Reveal } from "./Reveal";

/** Home: what enrolled students get in the portal, with a single way in. No account area on this site. */
export function PortalCta() {
  const label = useCmsLookup();
  const url = useCmsValue("data.STUDENT_PORTAL_URL", STUDENT_PORTAL_URL);
  const benefits = [
    { icon: PlayCircle, id: "videos", text: "Exclusive videos" },
    { icon: Radio, id: "live", text: "Live sessions" },
    { icon: MessageCircle, id: "mentor", text: "Messages with your mentor" },
    { icon: FileCheck2, id: "reviews", text: "Essay and document reviews" },
  ];
  return (
    <section className="bg-white py-[clamp(72px,12vw,160px)]">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 md:grid-cols-[1fr_1fr] md:items-end md:px-12">
        <Reveal>
          <p className="type-caption text-blue-700">
            <CmsText id="PortalCta.eyebrow">For our students</CmsText>
          </p>
          <h2 className="type-h2 mt-4 max-w-[16ch] text-neutral-900">
            <CmsText id="PortalCta.title">Everything you need, in one portal.</CmsText>
          </h2>
          <a
            href={url}
            className="type-button group mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-blue-950 px-6 text-white transition-[background-color,box-shadow] duration-500 ease-premium hover:bg-blue-900 hover:shadow-[0_16px_40px_rgb(10_30_60/0.25)]"
          >
            <CmsText id="PortalCta.button">Log in to the portal</CmsText>
            <ArrowUpRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </Reveal>
        <ul className="grid gap-px overflow-hidden rounded-3xl border border-neutral-900/[0.06] bg-neutral-900/[0.06] sm:grid-cols-2">
          {benefits.map(({ icon: Icon, id, text }, i) => (
            <Reveal key={id} delay={i * 0.05} className="bg-white">
              <li className="flex h-full items-center gap-4 p-7">
                <Icon aria-hidden className="h-5 w-5 shrink-0 text-blue-700" />
                <span className="type-body text-neutral-800">
                  {label("PortalCta.benefit." + id, text)}
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
