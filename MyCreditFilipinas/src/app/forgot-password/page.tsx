"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ph-blue-600 via-ph-blue-700 to-ph-blue-900 flex flex-col relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-ph-gold-500/10 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-ph-red-500/8 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />

      {/* Nav */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <Link href="/" className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-ph-gold-500 rounded-lg flex items-center justify-center text-ph-blue-900 font-extrabold text-sm">
            MC
          </div>
          <span>MyCredit Filipinas</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-8 border border-white/50">
            {sent ? (
              /* ── Success state ── */
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                  Check your email
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  If an account exists for{" "}
                  <span className="font-semibold text-gray-700">{email}</span>,
                  we&apos;ve sent a password reset link. Check your inbox and
                  spam folder.
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  The link will expire in 30 minutes.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-ph-blue-600 text-white font-semibold rounded-xl hover:bg-ph-blue-700 transition-colors text-sm"
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </Link>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div className="mb-6">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-5"
                  >
                    <ArrowLeft size={15} />
                    Back to Login
                  </Link>
                  <div className="w-12 h-12 bg-ph-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Mail size={22} className="text-ph-blue-600" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    Forgot password?
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Enter your registered email address and we&apos;ll send you a
                    reset link.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 outline-none transition-all duration-200 text-gray-900 bg-gray-50/50 hover:bg-white"
                      placeholder="your@email.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-ph-red-500 to-ph-red-600 text-white font-bold rounded-xl hover:from-ph-red-600 hover:to-ph-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-ph-red-500/25 active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                  Remembered your password?{" "}
                  <Link
                    href="/login"
                    className="text-ph-blue-600 font-semibold hover:text-ph-blue-700 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
