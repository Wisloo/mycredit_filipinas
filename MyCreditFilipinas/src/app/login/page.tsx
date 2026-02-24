"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"user" | "staff">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push(data.user.role === "user" ? "/dashboard" : "/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ph-blue-600 via-ph-blue-700 to-ph-blue-900 flex flex-col relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-ph-gold-500/10 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-ph-red-500/8 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-ph-gold-500/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-white/5 rounded-full blur-lg animate-float-slow" />

      {/* Simple top nav */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <Link href="/" className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-ph-gold-500 rounded-lg flex items-center justify-center text-ph-blue-900 font-extrabold text-sm">MC</div>
          <span>MyCredit Filipinas</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-8 border border-white/50">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-ph-blue-500 to-ph-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-ph-blue-500/30">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Welcome Back
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Sign in to your MyCredit Filipinas account
              </p>
            </div>

            {/* Role toggle */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
              <button
                onClick={() => setRole("user")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  role === "user"
                    ? "bg-white text-ph-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Borrower
              </button>
              <button
                onClick={() => setRole("staff")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  role === "staff"
                    ? "bg-white text-ph-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Employee
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {role === "user" ? "Email Address" : "Username"}
                </label>
                <input
                  type={role === "user" ? "email" : "text"}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 outline-none transition-all duration-200 text-gray-900 bg-gray-50/50 hover:bg-white"
                  placeholder={role === "user" ? "your@email.com" : "admin"}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 outline-none transition-all duration-200 text-gray-900 bg-gray-50/50 hover:bg-white pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-ph-red-500 to-ph-red-600 text-white font-bold rounded-xl hover:from-ph-red-600 hover:to-ph-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-ph-red-500/25 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  `Sign In as ${role === "user" ? "Borrower" : "Employee"}`
                )}
              </button>
            </form>

            {role === "user" && (
              <p className="text-center text-sm text-gray-500 mt-6">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-ph-blue-600 font-semibold hover:text-ph-blue-700 transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
