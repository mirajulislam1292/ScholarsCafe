import {useCmsLookup} from "@/lib/cms";
import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/scholars/Navbar";
import { Footer } from "@/components/scholars/Footer";
import { LegalPage } from "@/components/scholars/LegalPage";
import { EMAIL as CMS_DEFAULT_EMAIL } from "@/lib/scholars-data";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - Scholars Cafe" },
      {
        name: "description",
        content:
          "How Scholars Cafe collects, uses, and protects the personal information of students and families using our admissions services.",
      },
      { property: "og:title", content: "Privacy Policy - Scholars Cafe" },
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
 const cmsLabel = useCmsLookup();

  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LegalPage
        kicker="Legal"
        title={cmsLabel("privacy.label.506ff3946215","Privacy Policy")}
        updated="September 2026"
        intro={cmsLabel("privacy.label.f452be0c5041","Scholars Cafe (we, us, our) is committed to protecting the privacy of every student and family that trusts us with their study abroad journey. This policy explains what we collect, why we collect it, and the choices you have.")}
      >
        <h2>Website messages, feedback, and newsletter signups</h2>
        <p>Contact forms store your name, email, phone number, and message in our Hostinger database. Feedback is private and is not automatically published. Newsletter signups record your email and consent time. Authorized owners and admins can review these records. Notifications may also be sent to our contact@scholarscafe.com mailbox. To unsubscribe or request removal of a website submission, email contact@scholarscafe.com.</p>
        <h2><CmsText id="privacy.331e44fd15c9">1. Information we collect</CmsText></h2>
        <p><CmsText id="privacy.99a90c40c9ee">
          To support your university applications we may collect: your name,
          date of birth, contact details (email, phone, WhatsApp number),
          academic transcripts and test scores (SAT, IELTS, TOEFL, DET),
          extracurricular history, family financial information required for
          need-based aid forms (CSS Profile, ISFAA, FAFSA), passport details
          for visa preparation, and any essays, statements, or recommendation
          letters you share with us.
        </CmsText></p>

        <h2><CmsText id="privacy.dcb6d231a42c">2. How we use your information</CmsText></h2>
        <p><CmsText id="privacy.0a282ce1e3dc">
          We use your information solely to provide the admissions, scholarship,
          and test-prep services you requested, including building your college
          list, completing applications, submitting financial aid forms,
          coordinating with teachers and counselors, and preparing for visa
          interviews. We do </CmsText><strong><CmsText id="privacy.254bb97b57f1">not</CmsText></strong><CmsText id="privacy.ab594191cee4"> sell your data to third
          parties.
        </CmsText></p>

        <h2><CmsText id="privacy.3048a3869a59">3. Sharing with third parties</CmsText></h2>
        <p><CmsText id="privacy.c235596b6724">
          We share information only when strictly necessary to advance your
          application, for example, with universities you apply to,
          standardized test agencies (College Board, ETS, IDP), the relevant
          consulate or embassy for visa filing, and our secure cloud storage
          and communication providers. Every partner is bound by
          confidentiality.
        </CmsText></p>

        <h2><CmsText id="privacy.80d215a82054">4. Data security</CmsText></h2>
        <p><CmsText id="privacy.582832b81cdd">
          We protect your documents using encrypted storage, access controls,
          and authenticated communication channels. Sensitive financial
          documents are deleted from our active workspace within 90 days of
          your application cycle closing, unless you ask us to retain them for
          a future cycle.
        </CmsText></p>

        <h2><CmsText id="privacy.23966dc2bc07">5. Your rights</CmsText></h2>
        <p><CmsText id="privacy.308993e7aba2">You can at any time:</CmsText></p>
        <ul>
          <li><CmsText id="privacy.57e6671b19a6">Request a copy of the personal data we hold about you.</CmsText></li>
          <li><CmsText id="privacy.41c42b9d616a">Ask us to correct or update inaccurate information.</CmsText></li>
          <li><CmsText id="privacy.d12d70cf4245">Withdraw consent and request deletion of your data.</CmsText></li>
          <li><CmsText id="privacy.ce63362b2d1e">Opt out of marketing emails using the unsubscribe link.</CmsText></li>
        </ul>

        <h2><CmsText id="privacy.32d69568a21b">6. Minors</CmsText></h2>
        <p><CmsText id="privacy.0f82bdb3f0e0">
          Many of our students are under 18. In those cases, a parent or legal
          guardian must consent to our services and to the collection of the
          student's data. Parents may contact us at any time to review or
          delete information.
        </CmsText></p>

        <h2><CmsText id="privacy.15a4263aea4a">7. Updates to this policy</CmsText></h2>
        <p><CmsText id="privacy.69fb198c8ac9">
          We may update this policy as our services evolve. The "last updated"
          date at the top will reflect the most recent change. Material changes
          will be communicated by email to active clients.
        </CmsText></p>

        <h2><CmsText id="privacy.e8ea2653ca03">8. Contact us</CmsText></h2>
        <p><CmsText id="privacy.59c53670f218">
          For privacy questions, requests, or complaints, write to us at</CmsText>{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a><CmsText id="privacy.33fed8aa684a">. We respond within 5 business
          days.
        </CmsText></p>
      </LegalPage>
      <Footer />
    </div>
  );
}

const EMAIL = CMS_DEFAULT_EMAIL;
