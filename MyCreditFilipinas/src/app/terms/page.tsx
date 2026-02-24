export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream-100 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Terms of Service</h1>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-4 text-gray-700 leading-relaxed">
          <p>
            By using MyCredit Filipinas, you agree to the following terms and conditions. Please read
            them carefully before using our services.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-6">Eligibility</h2>
          <p>
            You must be at least 18 years old and a Filipino citizen or resident to apply for a loan
            through our platform.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-6">Loan Terms</h2>
          <p>
            Loan amounts, interest rates, and repayment schedules are determined based on your
            application and our approval process. All loan terms will be clearly communicated before
            you accept any loan offer.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-6">Repayment</h2>
          <p>
            You are responsible for making timely payments according to your loan schedule. Late or
            missed payments may result in additional charges and may affect your eligibility for
            future loans.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-6">Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the security of your account credentials. Do not share
            your password with others. Report any unauthorized access immediately.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-6">Contact</h2>
          <p>
            For questions about these terms, contact us at{" "}
            <a href="mailto:support@mycreditfilipinas.com" className="text-ph-blue-600 font-semibold hover:underline">
              support@mycreditfilipinas.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
