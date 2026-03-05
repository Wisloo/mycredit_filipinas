import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | MyCredit Filipinas",
  description: "Read the Terms of Service for MyCredit Filipinas lending platform.",
};

export default function TermsPage() {
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
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Terms of Service</h1>
          <p className="text-gray-500 text-sm">
            Last updated: <span className="font-medium text-gray-700">March 1, 2026</span>
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            Please read these Terms carefully before using the MyCredit Filipinas platform.
            By creating an account or applying for a loan, you agree to be bound by these terms.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          <Section num="1" title="Eligibility">
            <p>To apply for a loan through MyCredit Filipinas you must be:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>At least <strong>18 years of age</strong>.</li>
              <li>A Filipino citizen or a permanent resident of the Philippines.</li>
              <li>Employed, self-employed, or operating an eligible business.</li>
              <li>Able to provide valid government-issued identification.</li>
            </ul>
            <p>
              We reserve the right to decline applications that do not meet our internal credit and
              risk criteria, regardless of whether the basic eligibility requirements are satisfied.
            </p>
          </Section>

          <Section num="2" title="Loan Application and Approval">
            <p>
              Submitting a loan application does not guarantee approval. All applications are assessed
              on a case-by-case basis considering factors including creditworthiness, income, existing
              obligations, and the purpose of the loan.
            </p>
            <p>
              All loan amounts, interest rates, repayment schedules, and fees will be clearly
              communicated before you accept any offer. By submitting an application you authorise
              MyCredit Filipinas to verify the accuracy of the information you provide.
            </p>
          </Section>

          <Section num="3" title="Repayment Obligations">
            <p>
              You are solely responsible for making loan repayments on or before each due date.
              Failure to do so may result in:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Late payment penalties and additional interest charges.</li>
              <li>Notification to credit-reporting agencies.</li>
              <li>Legal action to recover the outstanding balance.</li>
              <li>Reduced eligibility for future loans.</li>
            </ul>
            <p>
              If you anticipate difficulty making a payment, please contact our support team as early
              as possible &mdash; we may be able to discuss restructuring options.
            </p>
          </Section>

          <Section num="4" title="Interest Rates and Fees">
            <p>
              All applicable interest rates and fees are disclosed at the time of your loan offer.
              Rates vary based on loan type, term, and your borrower profile. MyCredit Filipinas
              complies with all applicable Philippine lending regulations, including the Truth in
              Lending Act (Republic Act No. 3765). No hidden fees will be charged without prior
              disclosure.
            </p>
          </Section>

          <Section num="5" title="Account Responsibilities">
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and
              must not share your password with any third party. Notify us immediately at{" "}
              <a href="mailto:support@mycreditfilipinas.com" className="text-ph-blue-600 font-semibold hover:underline">support@mycreditfilipinas.com</a>{" "}
              if you suspect any unauthorised access.
            </p>
            <p>
              You agree to provide accurate, current, and complete information during registration and
              throughout the duration of any active loan. Providing false information may result in
              immediate account termination and legal action.
            </p>
          </Section>

          <Section num="6" title="Prohibited Uses">
            <p>You agree that you will not:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Use loan proceeds for any illegal activity.</li>
              <li>Attempt to defraud or misrepresent yourself to MyCredit Filipinas.</li>
              <li>Reverse-engineer or interfere with the functioning of our platform.</li>
              <li>Access another borrower&apos;s account or data without authorisation.</li>
            </ul>
          </Section>

          <Section num="7" title="Limitation of Liability">
            <p>
              To the maximum extent permitted by Philippine law, MyCredit Filipinas shall not be
              liable for any indirect, incidental, special, or consequential damages arising out of or
              in connection with your use of our platform.
            </p>
          </Section>

          <Section num="8" title="Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              Republic of the Philippines. Any dispute arising hereunder shall be subject to the
              exclusive jurisdiction of the courts of Davao City.
            </p>
          </Section>

          <Section num="9" title="Changes to These Terms">
            <p>
              We may update these Terms from time to time. Material changes will be communicated via
              email or a platform notice at least 14 days before they take effect. Continued use
              after the effective date constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <section className="px-8 py-7 rounded-b-2xl bg-gray-50/60">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-ph-blue-100 text-ph-blue-700 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0">10</span>
              Contact Us
            </h2>
            <div className="text-gray-600 space-y-2 text-sm">
              <p><strong className="text-gray-800">Email:</strong>{" "}
                <a href="mailto:support@mycreditfilipinas.com" className="text-ph-blue-600 font-semibold hover:underline">support@mycreditfilipinas.com</a>
              </p>
              <p><strong className="text-gray-800">Address:</strong> Davao City, Davao del Sur, Philippines</p>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/privacy" className="text-ph-blue-600 hover:underline font-medium">Privacy Policy</Link>
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
