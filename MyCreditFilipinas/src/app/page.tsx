import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      {/* Navbar */}
      <nav className="bg-ph-blue-500/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-ph-gold-500 rounded-lg flex items-center justify-center text-ph-blue-900 font-extrabold text-sm">
              MC
            </div>
            <span className="hidden sm:inline">MyCredit Filipinas</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 text-sm font-bold bg-ph-gold-500 text-ph-blue-900 rounded-xl hover:bg-ph-gold-400 transition-all duration-200 shadow-lg shadow-ph-gold-500/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-br from-ph-blue-600 via-ph-blue-700 to-ph-blue-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ph-gold-500/10 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4 animate-pulse-soft" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-ph-red-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 animate-pulse-soft" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-ph-blue-400/5 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMkgyVjBoMzRWNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-ph-gold-400 text-sm font-medium rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-ph-gold-500 rounded-full animate-pulse" />
                Trusted by Davaoeños
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                Fast & Reliable{" "}
                <span className="text-ph-gold-500 relative">
                  Lending
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8c40-6 80-6 120-3s60 5 76 2" stroke="#FCD116" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                  </svg>
                </span>{" "}
                Services
              </h1>
              <p className="mt-6 text-lg md:text-xl text-ph-blue-200/90 max-w-lg leading-relaxed">
                MyCredit Filipinas provides accessible personal, salary, and
                business loans for Filipinos in Davao and beyond. Apply online,
                get approved fast.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="group px-8 py-4 bg-ph-red-500 text-white font-bold rounded-2xl text-center hover:bg-ph-red-600 transition-all duration-300 shadow-xl shadow-ph-red-500/30 hover:shadow-ph-red-500/50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Apply Now — It&apos;s Free
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 border-2 border-white/20 text-white font-medium rounded-2xl text-center hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
                >
                  Already a member? Login
                </Link>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "🏦", title: "Low Interest", desc: "Competitive rates starting at 4% monthly" },
                { icon: "⚡", title: "Fast Approval", desc: "Get approved within 24 hours" },
                { icon: "📱", title: "100% Online", desc: "Apply and manage loans from anywhere" },
                { icon: "🛡️", title: "Secure", desc: "Bank-level security for your data" },
              ].map((f) => (
                <div
                  key={f.title}
                  className="bg-white/[0.07] backdrop-blur-md rounded-2xl p-6 border border-white/[0.12] hover:bg-white/[0.14] hover:border-white/25 transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                  <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-ph-blue-200/80 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-b border-cream-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-ph-blue-50/30 via-transparent to-ph-gold-50/30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: "300+", label: "Active Borrowers", icon: "👥" },
              { value: "98%", label: "Approval Rate", icon: "✅" },
              { value: "24hrs", label: "Avg. Processing", icon: "⚡" },
              { value: "4%", label: "Monthly Interest", icon: "📊" },
            ].map((s) => (
              <div key={s.label} className="text-center group">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                <div className="text-2xl md:text-4xl font-extrabold text-ph-blue-600 tracking-tight">
                  {s.value}
                </div>
                <div className="text-sm text-gray-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-cream-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-ph-blue-500 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
              How It <span className="text-ph-red-500">Works</span>
            </h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">Get your loan in three simple steps. No paperwork, no hassle.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { step: "1", title: "Create Account", desc: "Sign up for free in less than 2 minutes with just your basic info", color: "from-ph-blue-500 to-ph-blue-600", iconBg: "bg-ph-blue-50 text-ph-blue-600" },
              { step: "2", title: "Apply for a Loan", desc: "Choose your amount from ₱5,000–₱30,000 and submit your application", color: "from-ph-red-500 to-ph-red-600", iconBg: "bg-ph-red-50 text-ph-red-600" },
              { step: "3", title: "Get Your Money", desc: "Once approved, funds are released immediately to your account", color: "from-ph-gold-500 to-ph-gold-600", iconBg: "bg-ph-gold-50 text-ph-gold-700" },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group relative">
                <div className={`absolute top-0 left-6 right-6 h-1 bg-gradient-to-r ${s.color} rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className={`${s.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold mb-5`}>
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-ph-blue-600 to-ph-blue-800 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMkgyVjBoMzRWNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-ph-blue-200 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of Davaoeños who trust MyCredit Filipinas for their lending needs. Apply in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-ph-gold-500 text-ph-blue-900 font-bold rounded-2xl hover:bg-ph-gold-400 transition-all duration-300 shadow-xl shadow-ph-gold-500/30 hover:shadow-ph-gold-500/50 hover:-translate-y-0.5 text-lg"
          >
            Create Free Account
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ph-blue-950 text-ph-blue-300 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="font-bold text-white text-lg mb-1 flex items-center gap-2">
              <span className="w-8 h-8 bg-ph-gold-500 rounded-lg flex items-center justify-center text-ph-blue-900 font-extrabold text-xs">MC</span>
              MyCredit Filipinas
            </p>
            <p className="text-sm text-ph-blue-400">
              &copy; 2026 MyCredit Filipinas. Davao City, Philippines.
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link>
            <a href="mailto:support@mycreditfilipinas.com" className="hover:text-white transition-colors duration-200">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

