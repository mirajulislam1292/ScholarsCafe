import {useCmsLookup} from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { LegalPage } from "@/components/scholars/LegalPage";
import { EMAIL } from "@/lib/scholars-data";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service - Scholars Cafe" },
      {
        name: "description",
        content:
          "The terms that govern your use of Scholars Cafe's admissions consultancy, test prep, and related services.",
      },
      { property: "og:title", content: "Terms of Service - Scholars Cafe" },
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
 const cmsLabel = useCmsLookup();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LegalPage
        kicker="Legal"
        title={cmsLabel("terms.label.4afa55bf7aec","Terms of Service")}
        updated="May 2026"
        intro={cmsLabel("terms.label.e4aaf89bded9","By engaging Scholars Cafe, for a consultation, test prep, or any of our admissions programs, you agree to the following terms. They are written in plain language so you know exactly what to expect from us, and what we expect from you.")}
      >
        <h2>
          <CmsText id="terms.dec38f4494e4">1. The services we provide</CmsText>
        </h2>
        <p>
          <CmsText id="terms.b4f921fcf884">
            Scholars Cafe offers university admissions consultancy, scholarship strategy,
            standardized test preparation (SAT, IELTS, TOEFL, DET), essay coaching, financial aid
            form support (CSS Profile, ISFAA, FAFSA), and visa preparation. The exact deliverables
            for your program are listed in your service agreement.
          </CmsText>
        </p>

        <h2>
          <CmsText id="terms.fab830d24d95">2. No guarantee of admission</CmsText>
        </h2>
        <p>
          <CmsText id="terms.db553aa231fc">
            We will work tirelessly to maximize your chances of acceptance and financial aid, but
            final admissions decisions and scholarship awards are made solely by universities and
            funding agencies. No consultancy can guarantee admission to a specific institution or a
            specific aid amount.
          </CmsText>
        </p>

        <h2>
          <CmsText id="terms.359bb0cab9ff">3. Your responsibilities</CmsText>
        </h2>
        <ul>
          <li>
            <CmsText id="terms.d12b00548596">
              Provide accurate and truthful information at every stage.
            </CmsText>
          </li>
          <li>
            <CmsText id="terms.c813c13cb5ee">
              Submit drafts, documents, and decisions by the agreed deadlines.
            </CmsText>
          </li>
          <li>
            <CmsText id="terms.5790424f852b">
              Communicate honestly with universities, test agencies, and consulates. We will not
              assist with any form of fraud or misrepresentation.
            </CmsText>
          </li>
          <li>
            <CmsText id="terms.d03a3137f31d">
              Pay invoices according to your service agreement.
            </CmsText>
          </li>
        </ul>

        <h2>
          <CmsText id="terms.e18f4ec3780d">4. Fees and refunds</CmsText>
        </h2>
        <p>
          <CmsText id="terms.811b80eade69">
            Program fees are stated in your written service agreement. Initial consultations are
            free. Once a program begins, fees paid for completed milestones are non-refundable.
            Unstarted milestones may be refunded on a pro-rata basis if the engagement is ended.
          </CmsText>
        </p>

        <h2>
          <CmsText id="terms.d209739ac7ad">5. Confidentiality</CmsText>
        </h2>
        <p>
          <CmsText id="terms.be6784e3c0a5">
            We treat everything you share, including academic records, family finances, and personal
            essays, as confidential. We will never use your story or documents publicly without
            explicit written permission. (See our Privacy Policy for full details.)
          </CmsText>
        </p>

        <h2>
          <CmsText id="terms.6b64ac8feb92">6. Intellectual property</CmsText>
        </h2>
        <p>
          <CmsText id="terms.5f8d045a217b">
            Strategy templates, essay frameworks, mock tests, and other materials we provide remain
            our intellectual property and are licensed to you for personal use only. They may not be
            redistributed.
          </CmsText>
        </p>

        <h2>
          <CmsText id="terms.f145229f542d">7. Limitation of liability</CmsText>
        </h2>
        <p>
          <CmsText id="terms.ac0b0aa89956">
            To the fullest extent permitted by law, Scholars Cafe is not liable for indirect or
            consequential losses arising from admissions outcomes, visa decisions, or third-party
            actions. Our total liability for any claim is limited to the fees you paid for the
            relevant service.
          </CmsText>
        </p>

        <h2>
          <CmsText id="terms.a1f79986f68c">8. Governing law</CmsText>
        </h2>
        <p>
          <CmsText id="terms.eb762c233d2f">
            These terms are governed by the laws of Bangladesh. Any dispute will be resolved in good
            faith between us first; if that fails, the courts of Dhaka will have exclusive
            jurisdiction.
          </CmsText>
        </p>

        <h2>
          <CmsText id="terms.e369ec3c2986">9. Changes</CmsText>
        </h2>
        <p>
          <CmsText id="terms.68fb6c863ba2">
            We may revise these terms from time to time. Active clients will be notified by email of
            material changes at least 30 days before they take effect.
          </CmsText>
        </p>

        <h2>
          <CmsText id="terms.2f41786a75a2">10. Contact</CmsText>
        </h2>
        <p>
          <CmsText id="terms.848f6cc06630">Questions about these terms? Email</CmsText>{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <CmsText id="terms.d081278dd35e">
            {" "}
            and we'll get back to you within 5 business days.
          </CmsText>
        </p>
      </LegalPage>
      <Footer />
    </div>
  );
}
