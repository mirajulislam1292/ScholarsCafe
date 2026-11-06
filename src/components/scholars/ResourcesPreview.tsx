import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CmsText, useCmsValue } from "@/lib/cms";
import { RESOURCES as CMS_DEFAULT_RESOURCES } from "@/lib/scholars-data";
import { Reveal } from "./Reveal";

const clean = (s: string) => s.replace(/^[^\p{L}\p{N}]+/u, "").trim();

/** Home: three guides from the Resources page (featured first), linking to the full list. */
export function ResourcesPreview() {
  const RESOURCES = useCmsValue("data.RESOURCES", CMS_DEFAULT_RESOURCES);
  const picks = [
    ...RESOURCES.filter((r) => r.featured),
    ...RESOURCES.filter((r) => !r.featured),
  ].slice(0, 3);
  if (!picks.length) return null;
  return (
    <section className="bg-ice-50 py-[clamp(72px,12vw,160px)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <h2 className="type-h2 max-w-[18ch] text-neutral-900">
            <CmsText id="ResourcesPreview.title">Free guides, written for you.</CmsText>
          </h2>
          <Link
            to="/resources"
            className="type-button group inline-flex items-center gap-2 text-blue-700"
          >
            <CmsText id="ResourcesPreview.all">All resources</CmsText>
            <ArrowUpRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {picks.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.06}>
              <Link
                to="/resources"
                className="group flex h-full flex-col justify-between gap-10 rounded-3xl border border-neutral-900/[0.06] bg-white p-8 transition-[transform,box-shadow] duration-700 ease-premium hover:-translate-y-1 hover:shadow-[0_24px_60px_rgb(15_40_70/0.08)]"
              >
                <div>
                  <p className="type-caption text-blue-700">{clean(r.tag)}</p>
                  <h3 className="type-h3 mt-4 text-neutral-900">{r.title}</h3>
                </div>
                <span className="type-caption text-neutral-500">{r.readTime}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
