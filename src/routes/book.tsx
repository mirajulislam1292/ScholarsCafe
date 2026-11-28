import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { Booking } from "@/components/scholars/Booking";

// scholarscafe.com/book: book a 1-on-1 mentor session. Open times load from the admin in the browser.
export const Route = createFileRoute("/book")({
  head: () =>
    seo({
      path: "/book",
      title: "Book a 1-on-1 Mentor Session | Scholars Cafe",
      crumb: "Book a Meeting",
      description:
        "Pick an open day and time for a 1-on-1 online session with a Scholars Cafe mentor. Times are shown in Bangladesh time.",
    }),
  component: BookPage,
});

function BookPage() {
  return (
    <div className="min-h-screen bg-ice-50">
      <Navbar />
      <div aria-hidden className="relative h-[clamp(330px,36vw,440px)] overflow-hidden bg-blue-950">
        <img
          src="/media/pages/library.webp"
          srcSet="/media/pages/library-sm.webp 960w, /media/pages/library.webp 1920w"
          sizes="100vw"
          alt=""
          width={1920}
          height={1280}
          className="absolute inset-0 size-full scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/85 via-blue-950/45 to-blue-950/75" />
      </div>
      <main className="relative mx-auto -mt-[clamp(120px,16vw,210px)] max-w-[720px] px-4 pb-(--space-section) sm:px-6">
        <div className="rounded-3xl border border-neutral-900/[0.06] bg-white p-7 md:p-12">
          <p className="type-caption font-semibold uppercase tracking-[0.14em] text-blue-700">
            Scholars Cafe
          </p>
          <h1 className="type-h2 mt-3 text-balance text-neutral-900">1-on-1 mentor session</h1>
          <p className="type-body mt-4 text-neutral-600">
            Pick an open day and time, tell us what you'd like to talk about, and we'll email you
            the meeting link.
          </p>
        </div>
        <div className="mt-4">
          <Booking />
        </div>
      </main>
      <Footer />
    </div>
  );
}
