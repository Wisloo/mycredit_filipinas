export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream-100 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-4 text-gray-700 leading-relaxed">
          <p>
            MyCredit Filipinas is committed to protecting your personal information. This Privacy Policy
            explains how we collect, use, and safeguard your data when you use our lending platform.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-6">Information We Collect</h2>
          <p>
            We collect personal data you provide during registration, including your name, contact
            information, employment details, bank account information, and character references. We
            also collect loan application data and payment records.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-6">How We Use Your Information</h2>
          <p>
            Your information is used to process loan applications, manage your account, communicate
            with you, and comply with applicable laws and regulations.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-6">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information, including
            encrypted authentication, secure database storage, and restricted access controls.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-6">Contact Us</h2>
          <p>
            For questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:support@mycreditfilipinas.com" className="text-ph-blue-600 font-semibold hover:underline">
              support@mycreditfilipinas.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
