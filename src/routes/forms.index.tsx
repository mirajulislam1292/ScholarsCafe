import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { seo } from "@/lib/seo";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";

// scholarscafe.com/forms: every form that is live right now, each with a short line on what it is for.
// The list comes from the admin (Forms → Published), so a form appears here as soon as it is published.
export const Route = createFileRoute("/forms/")({
  head: () =>
    seo({
      path: "/forms",
      title: "Apply or Register | Scholars Cafe",
      description:
        "All open Scholars Cafe forms: mentorship programs, cohorts, F-1 visa help and individual application services. Pick one and fill it in.",
    }),
  component: FormsList,
});

type Entry = { slug: string; title: string; summary: string };
const API = import.meta.env.VITE_CONTENT_API || "https://admin.scholarscafe.com";

function FormsList() {
  const [items, setItems] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(API + "/public/forms", { signal: controller.signal, credentials: "omit" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => setItems(Array.isArray(d.items) ? d.items : []))
      .catch((e) => {
        if (e?.name !== "AbortError") setFailed(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-ice-50">
      <Navbar />
      <div aria-hidden className="relative h-[clamp(330px,36vw,440px)] overflow-hidden bg-blue-950">
        <img
          src="/media/pages/campus-early-fall.webp"
          srcSet="/media/pages/campus-early-fall-sm.webp 960w, /media/pages/campus-early-fall.webp 1920w"
          sizes="100vw"
          alt=""
          className="absolute inset-0 size-full scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/85 via-blue-950/45 to-blue-950/75" />
      </div>
      <main className="relative mx-auto -mt-[clamp(120px,16vw,210px)] max-w-[720px] px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-neutral-900/[0.06] bg-white p-7 md:p-12">
          <p className="type-caption font-semibold uppercase tracking-[0.14em] text-blue-700">
            Scholars Cafe
          </p>
          <h1 className="type-h2 mt-3 text-balance text-neutral-900">Forms</h1>
          <p className="type-body mt-4 text-neutral-600">
            Pick the one that fits what you need and fill it in. We reply by email.
          </p>

          <div className="mt-10 grid gap-4" aria-busy={items === null && !failed}>
            {items === null &&
              !failed &&
              [0, 1, 2].map((i) => (
                <div key={i} className="h-[118px] animate-pulse rounded-2xl bg-ice-50" />
              ))}
            {failed && (
              <p className="type-body text-neutral-600">
                The list couldn't load. Refresh the page, or{" "}
                <a href="/contact" className="text-blue-700 underline">
                  contact us
                </a>
                .
              </p>
            )}
            {items && !items.length && (
              <p className="type-body text-neutral-600">
                No forms are open right now. You can always{" "}
                <a href="/contact" className="text-blue-700 underline">
                  contact us
                </a>
                .
              </p>
            )}
            {items?.map((f) => (
              <a
                key={f.slug}
                href={"/forms/" + f.slug}
                className="group block rounded-2xl border border-neutral-900/10 p-5 transition-[border-color,box-shadow] duration-300 hover:border-blue-700 hover:shadow-[0_0_0_4px_rgb(43_109_166/0.12)] focus-visible:border-blue-700 focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_rgb(43_109_166/0.12)] md:p-6"
              >
                <h2 className="type-h4 text-balance text-neutral-900">
                  {f.title.replace(/^Scholars Cafe\s+/i, "")}
                </h2>
                {f.summary && <p className="type-body mt-2 text-neutral-600">{f.summary}</p>}
                <span className="type-button mt-4 inline-flex text-blue-700">
                  Fill in this form{" "}
                  <span
                    aria-hidden
                    className="ml-1 transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
