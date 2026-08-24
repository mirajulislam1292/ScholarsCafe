import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { LegalPage } from "@/components/scholars/LegalPage";
import { EMAIL } from "@/lib/scholars-data";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Scholars Cafe" },
      {
        name: "description",
        content:
          "How Scholars Cafe collects, uses, and protects the personal information of students and families using our admissions services.",
      },
      { property: "og:title", content: "Privacy Policy — Scholars Cafe" },
      {
        property: "og:description",
        content:
          "How Scholars Cafe collects, uses, and protects the personal information of students and families using our admissions services.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LegalPage
        kicker="Legal"
        title="Privacy Policy"
        updated="May 2026"
        intro="Scholars Cafe (we, us, our) is committed to protecting the privacy of every student and family that trusts us with their study abroad journey. This policy explains what we collect, why we collect it, and the choices you have."
      >
        <h2>1. Information we collect</h2>
        <p>
          To support your university applications we may collect: your name,
          date of birth, contact details (email, phone, WhatsApp number),
          academic transcripts and test scores (SAT, IELTS, TOEFL, DET),
          extracurricular history, family financial information required for
          need-based aid forms (CSS Profile, ISFAA, FAFSA), passport details
          for visa preparation, and any essays, statements, or recommendation
          letters you share with us.
        </p>

        <h2>2. How we use your information</h2>
        <p>
          We use your information solely to provide the admissions, scholarship,
          and test-prep services you requested — including building your college
          list, completing applications, submitting financial aid forms,
          coordinating with teachers and counselors, and preparing for visa
          interviews. We do <strong>not</strong> sell your data to third
          parties.
        </p>

        <h2>3. Sharing with third parties</h2>
        <p>
          We share information only when strictly necessary to advance your
          application — for example, with universities you apply to,
          standardized test agencies (College Board, ETS, IDP), the relevant
          consulate or embassy for visa filing, and our secure cloud storage
          and communication providers. Every partner is bound by
          confidentiality.
        </p>

        <h2>4. Data security</h2>
        <p>
          We protect your documents using encrypted storage, access controls,
          and authenticated communication channels. Sensitive financial
          documents are deleted from our active workspace within 90 days of
          your application cycle closing, unless you ask us to retain them for
          a future cycle.
        </p>

        <h2>5. Your rights</h2>
        <p>You can at any time:</p>
        <ul>
          <li>Request a copy of the personal data we hold about you.</li>
          <li>Ask us to correct or update inaccurate information.</li>
          <li>Withdraw consent and request deletion of your data.</li>
          <li>Opt out of marketing emails using the unsubscribe link.</li>
        </ul>

        <h2>6. Minors</h2>
        <p>
          Many of our students are under 18. In those cases, a parent or legal
          guardian must consent to our services and to the collection of the
          student's data. Parents may contact us at any time to review or
          delete information.
        </p>

        <h2>7. Updates to this policy</h2>
        <p>
          We may update this policy as our services evolve. The "last updated"
          date at the top will reflect the most recent change. Material changes
          will be communicated by email to active clients.
        </p>

        <h2>8. Contact us</h2>
        <p>
          For privacy questions, requests, or complaints, write to us at{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. We respond within 5 business
          days.
        </p>
      </LegalPage>
      <Footer />
    </div>
  );
}
