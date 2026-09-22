import {useCmsLookup} from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { LegalPage } from "@/components/scholars/LegalPage";
import { EMAIL } from "@/lib/scholars-data";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Notice - Scholars Cafe" },
      {
        name: "description",
        content:
          "How Scholars Cafe uses cookies and similar technologies on its website, and how you can control them.",
      },
      { property: "og:title", content: "Cookie Notice - Scholars Cafe" },
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
 const cmsLabel = useCmsLookup();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LegalPage
        kicker="Legal"
        title={cmsLabel("cookies.label.eb095f90a1f1","Cookie Notice")}
        updated="May 2026"
        intro={cmsLabel("cookies.label.a5932ebdfe39","This notice explains how scholarscafe.com uses cookies and similar technologies to make the site work, remember your preferences, and help us improve.")}
      >
        <h2>
          <CmsText id="cookies.c1f30d809e15">1. What is a cookie?</CmsText>
        </h2>
        <p>
          <CmsText id="cookies.c3bf6a1a15e0">
            A cookie is a small text file stored on your device when you visit a website. Cookies
            let sites remember things like your theme preference (light or dark), the last page you
            saw, or whether you've already dismissed a banner. We also use similar technologies like
            local storage and analytics scripts.
          </CmsText>
        </p>

        <h2>
          <CmsText id="cookies.b96eb84ddad5">2. The cookies we use</CmsText>
        </h2>

        <h3>
          <CmsText id="cookies.1815beefcae4">Strictly necessary</CmsText>
        </h3>
        <p>
          <CmsText id="cookies.4f93e6aa393f">
            Required for the site to function, for example, remembering your theme choice (light /
            dark mode) and that you've closed the floating WhatsApp prompt. These cannot be turned
            off.
          </CmsText>
        </p>

        <h3>
          <CmsText id="cookies.f7afbbbdba6f">Performance &amp; analytics</CmsText>
        </h3>
        <p>
          <CmsText id="cookies.0648a8032fab">
            We may use privacy-respecting analytics (like Plausible or Vercel Analytics) to
            understand which pages and resources are most useful. These tools record only aggregate,
            anonymous data. No personal identifiers, no cross-site tracking.
          </CmsText>
        </p>

        <h3>
          <CmsText id="cookies.b6656595756e">Functional</CmsText>
        </h3>
        <p>
          <CmsText id="cookies.a2a9239e9ace">
            If you submit our contact or newsletter forms, a small cookie may be set so we can show
            a "thanks, we got it" confirmation on your next visit.
          </CmsText>
        </p>

        <h3>
          <CmsText id="cookies.e4696640127b">Third-party</CmsText>
        </h3>
        <p>
          <CmsText id="cookies.d9796544327c">
            When you click WhatsApp, social, or YouTube links, those services may set their own
            cookies governed by their own policies. We do not control those cookies.
          </CmsText>
        </p>

        <h2>
          <CmsText id="cookies.a1fe5433022c">3. Managing your preferences</CmsText>
        </h2>
        <p>
          <CmsText id="cookies.3360098d9326">
            You can clear cookies and disable them at any time through your browser settings.
            Disabling strictly necessary cookies may break parts of the site (for example, your
            theme will reset every page).
          </CmsText>
        </p>

        <h2>
          <CmsText id="cookies.4551a35576be">4. Children</CmsText>
        </h2>
        <p>
          <CmsText id="cookies.be6944417871">
            Our site is not directed at children under 13. We do not knowingly set cookies for
            tracking purposes on minors.
          </CmsText>
        </p>

        <h2>
          <CmsText id="cookies.74e470214dff">5. Updates</CmsText>
        </h2>
        <p>
          <CmsText id="cookies.ab9b133e5e4e">
            When we add or remove cookies we update this notice. The "last updated" date at the top
            reflects the most recent change.
          </CmsText>
        </p>

        <h2>
          <CmsText id="cookies.a65495406f80">6. Contact</CmsText>
        </h2>
        <p>
          <CmsText id="cookies.8ffcb9af27d1">Questions? Email </CmsText>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <CmsText id="cookies.cdb4ee2aea69">.</CmsText>
        </p>
      </LegalPage>
      <Footer />
    </div>
  );
}
