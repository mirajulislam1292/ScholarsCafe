import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { LegalPage } from "@/components/scholars/LegalPage";
import { EMAIL } from "@/lib/scholars-data";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Notice — Scholars Cafe" },
      {
        name: "description",
        content:
          "How Scholars Cafe uses cookies and similar technologies on its website, and how you can control them.",
      },
      { property: "og:title", content: "Cookie Notice — Scholars Cafe" },
      {
        property: "og:description",
        content:
          "How Scholars Cafe uses cookies and similar technologies on its website, and how you can control them.",
      },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LegalPage
        kicker="Legal"
        title="Cookie Notice"
        updated="May 2026"
        intro="This notice explains how scholarscafe.com uses cookies and similar technologies to make the site work, remember your preferences, and help us improve."
      >
        <h2>1. What is a cookie?</h2>
        <p>
          A cookie is a small text file stored on your device when you visit a
          website. Cookies let sites remember things like your theme
          preference (light or dark), the last page you saw, or whether you've
          already dismissed a banner. We also use similar technologies like
          local storage and analytics scripts.
        </p>

        <h2>2. The cookies we use</h2>

        <h3>Strictly necessary</h3>
        <p>
          Required for the site to function — for example, remembering your
          theme choice (light / dark mode) and that you've closed the
          floating WhatsApp prompt. These cannot be turned off.
        </p>

        <h3>Performance &amp; analytics</h3>
        <p>
          We may use privacy-respecting analytics (like Plausible or Vercel
          Analytics) to understand which pages and resources are most useful.
          These tools record only aggregate, anonymous data — no personal
          identifiers, no cross-site tracking.
        </p>

        <h3>Functional</h3>
        <p>
          If you submit our contact or newsletter forms, a small cookie may be
          set so we can show a "thanks, we got it" confirmation on your next
          visit.
        </p>

        <h3>Third-party</h3>
        <p>
          When you click WhatsApp, social, or YouTube links, those services
          may set their own cookies governed by their own policies. We do not
          control those cookies.
        </p>

        <h2>3. Managing your preferences</h2>
        <p>
          You can clear cookies and disable them at any time through your
          browser settings. Disabling strictly necessary cookies may break
          parts of the site (for example, your theme will reset every page).
        </p>

        <h2>4. Children</h2>
        <p>
          Our site is not directed at children under 13. We do not knowingly
          set cookies for tracking purposes on minors.
        </p>

        <h2>5. Updates</h2>
        <p>
          When we add or remove cookies we update this notice. The "last
          updated" date at the top reflects the most recent change.
        </p>

        <h2>6. Contact</h2>
        <p>
          Questions? Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
        </p>
      </LegalPage>
      <Footer />
    </div>
  );
}
