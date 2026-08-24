import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { LegalPage } from "@/components/scholars/LegalPage";
import { EMAIL } from "@/lib/scholars-data";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Scholars Cafe" },
      {
        name: "description",
        content:
          "The terms that govern your use of Scholars Cafe's admissions consultancy, test prep, and related services.",
      },
      { property: "og:title", content: "Terms of Service — Scholars Cafe" },
      {
        property: "og:description",
        content:
          "The terms that govern your use of Scholars Cafe's admissions consultancy, test prep, and related services.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LegalPage
        kicker="Legal"
        title="Terms of Service"
        updated="May 2026"
        intro="By engaging Scholars Cafe — for a consultation, test prep, or any of our admissions programs — you agree to the following terms. They are written in plain language so you know exactly what to expect from us, and what we expect from you."
      >
        <h2>1. The services we provide</h2>
        <p>
          Scholars Cafe offers university admissions consultancy, scholarship
          strategy, standardized test preparation (SAT, IELTS, TOEFL, DET),
          essay coaching, financial aid form support (CSS Profile, ISFAA,
          FAFSA), and visa preparation. The exact deliverables for your
          program are listed in your service agreement.
        </p>

        <h2>2. No guarantee of admission</h2>
        <p>
          We will work tirelessly to maximize your chances of acceptance and
          financial aid, but final admissions decisions and scholarship awards
          are made solely by universities and funding agencies. No consultancy
          can guarantee admission to a specific institution or a specific aid
          amount.
        </p>

        <h2>3. Your responsibilities</h2>
        <ul>
          <li>Provide accurate and truthful information at every stage.</li>
          <li>Submit drafts, documents, and decisions by the agreed deadlines.</li>
          <li>
            Communicate honestly with universities, test agencies, and
            consulates. We will not assist with any form of fraud or
            misrepresentation.
          </li>
          <li>Pay invoices according to your service agreement.</li>
        </ul>

        <h2>4. Fees and refunds</h2>
        <p>
          Program fees are stated in your written service agreement. Initial
          consultations are free. Once a program begins, fees paid for
          completed milestones are non-refundable. Unstarted milestones may be
          refunded on a pro-rata basis if the engagement is ended.
        </p>

        <h2>5. Confidentiality</h2>
        <p>
          We treat everything you share — academic records, family finances,
          personal essays — as confidential. We will never use your story or
          documents publicly without explicit written permission. (See our
          Privacy Policy for full details.)
        </p>

        <h2>6. Intellectual property</h2>
        <p>
          Strategy templates, essay frameworks, mock tests, and other
          materials we provide remain our intellectual property and are
          licensed to you for personal use only. They may not be redistributed.
        </p>

        <h2>7. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Scholars Cafe is not liable
          for indirect or consequential losses arising from admissions
          outcomes, visa decisions, or third-party actions. Our total
          liability for any claim is limited to the fees you paid for the
          relevant service.
        </p>

        <h2>8. Governing law</h2>
        <p>
          These terms are governed by the laws of Bangladesh. Any dispute will
          be resolved in good faith between us first; if that fails, the
          courts of Dhaka will have exclusive jurisdiction.
        </p>

        <h2>9. Changes</h2>
        <p>
          We may revise these terms from time to time. Active clients will be
          notified by email of material changes at least 30 days before they
          take effect.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions about these terms? Email{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we'll get back to you
          within 5 business days.
        </p>
      </LegalPage>
      <Footer />
    </div>
  );
}
