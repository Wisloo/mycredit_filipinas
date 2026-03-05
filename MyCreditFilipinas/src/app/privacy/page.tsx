import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | MyCredit Filipinas",
  description: "Read the Privacy Policy for MyCredit Filipinas lending platform.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream-100">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
            <div className="w-8 h-8 bg-ph-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm">
              MC
            </div>
            MyCredit Filipinas
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={15} />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">
            Last updated: <span className="font-medium text-gray-700">March 1, 2026</span>
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            MyCredit Filipinas is committed to protecting your personal information. This Privacy
            Policy explains how we collect, use, and safeguard your data in compliance with the
            Data Privacy Act of 2012 (Republic Act No. 10173).
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          <Section num="1" title="Information We Collect">
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Identity data:</strong> full name, birthdate, gender, civil status, government ID numbers.</li>
              <li><strong>Contact data:</strong> email address, mobile and landline numbers, home address.</li>
              <li><strong>Financial data:</strong> employment details, income information, bank account numbers, credit history.</li>
              <li><strong>Transaction data:</strong> loan applications, disbursements, payment records, and receipts.</li>
              <li><strong>Reference data:</strong> names and contact details of character references you provide.</li>
              <li><strong>Technical data:</strong> IP address, browser type, and access logs collected automatically when you use our platform.</li>
            </ul>
          </Section>

          <Section num="2" title="How We Use Your Information">
            <p>Your personal data is used for the following purposes:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Assessing, processing, and managing loan applications and disbursements.</li>
              <li>Verifying your identity and preventing fraud.</li>
              <li>Communicating with you about your account, loan status, and payment reminders.</li>
              <li>Complying with applicable laws, regulations, and reporting obligations.</li>
              <li>Improving our platform and services through aggregated analytics.</li>
            </ul>
          </Section>

          <Section num="3" title="Legal Basis for Processing">
            <p>
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Contract performance:</strong> processing necessary to fulfil your loan agreement.</li>
              <li><strong>Legal obligation:</strong> compliance with BSP regulations and the Anti-Money Laundering Act.</li>
              <li><strong>Legitimate interests:</strong> fraud prevention and security of our platform.</li>
              <li><strong>Consent:</strong> for marketing communications (you may withdraw consent at any time).</li>
            </ul>
          </Section>

          <Section num="4" title="Sharing of Information">
            <p>
              We do not sell your personal data. We may share it only with:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Our authorised staff and agents who require it to process your loan.</li>
              <li>Credit bureaus and government agencies as required by law.</li>
              <li>Third-party service providers under strict data-processing agreements.</li>
              <li>Legal or regulatory authorities when required by court order or applicable law.</li>
            </ul>
          </Section>

          <Section num="5" title="Data Retention">
            <p>
              We retain your personal data for as long as necessary to fulfil the purposes outlined in
              this Policy, or as required by applicable law. Loan records are typically retained for
              a minimum of 5 years after loan closure in accordance with Bangko Sentral ng Pilipinas
              regulations. You may request deletion of data that is no longer legally required to be
              retained.
            </p>
          </Section>

          <Section num="6" title="Data Security">
            <p>
              We implement industry-standard security measures to protect your personal information,
              including:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Encrypted password storage using bcrypt hashing.</li>
              <li>HTTPS encryption for all data in transit.</li>
              <li>Role-based access controls limiting staff exposure to sensitive data.</li>
              <li>Regular security reviews and access audits.</li>
            </ul>
            <p>
              While we take all reasonable precautions, no internet transmission is 100% secure.
              Please notify us immediately if you believe your account has been compromised.
            </p>
          </Section>

          <Section num="7" title="Your Rights">
            <p>
              Under the Data Privacy Act of 2012, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Access</strong> the personal data we hold about you.</li>
              <li><strong>Rectify</strong> inaccurate or incomplete data.</li>
              <li><strong>Erasure</strong> of data no longer necessary for the original purpose (subject to legal retention requirements).</li>
              <li><strong>Object</strong> to certain types of processing.</li>
              <li><strong>Data portability</strong> — receive your data in a structured, machine-readable format.</li>
              <li><strong>File a complaint</strong> with the National Privacy Commission (NPC) if you believe your rights have been violated.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:support@mycreditfilipinas.com" className="text-ph-blue-600 font-semibold hover:underline">support@mycreditfilipinas.com</a>.
            </p>
          </Section>

          <Section num="8" title="Cookies">
            <p>
              MyCredit Filipinas uses session cookies solely for authentication purposes. We do not
              use tracking or advertising cookies. You may disable cookies in your browser settings,
              though this may affect platform functionality.
            </p>
          </Section>

          <Section num="9" title="Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. We will notify you of material changes
              via email or a prominent notice on the platform. Continued use of the platform after
              the effective date constitutes acceptance of the updated Policy.
            </p>
          </Section>

          <section className="px-8 py-7 rounded-b-2xl bg-gray-50/60">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-ph-blue-100 text-ph-blue-700 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0">10</span>
              Contact &amp; Data Protection Officer
            </h2>
            <div className="text-gray-600 space-y-2 text-sm">
              <p><strong className="text-gray-800">Email:</strong>{" "}
                <a href="mailto:support@mycreditfilipinas.com" className="text-ph-blue-600 font-semibold hover:underline">support@mycreditfilipinas.com</a>
              </p>
              <p><strong className="text-gray-800">Address:</strong> Davao City, Davao del Sur, Philippines</p>
              <p className="text-xs text-gray-400 mt-3">
                You may also lodge a complaint with the{" "}
                <a href="https://www.privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="text-ph-blue-600 hover:underline">National Privacy Commission (NPC)</a>.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/terms" className="text-ph-blue-600 hover:underline font-medium">Terms of Service</Link>
          <span>&middot;</span>
          <Link href="/" className="hover:text-gray-700 transition-colors">Return to Home</Link>
        </div>
      </main>
    </div>
  );
}

function Section({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-8 py-7">
      <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 bg-ph-blue-100 text-ph-blue-700 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 select-none">
          {num}
        </span>
        {title}
      </h2>
      <div className="text-gray-600 leading-relaxed space-y-3 text-sm">{children}</div>
    </section>
  );
}
