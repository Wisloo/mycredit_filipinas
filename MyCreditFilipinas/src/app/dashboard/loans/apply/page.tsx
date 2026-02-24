"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LoanType {
  loan_type_id: number;
  loan_type_name: string;
}

interface LoanPurpose {
  loan_purpose_id: number;
  loan_purpose_description: string;
}

const LOAN_AMOUNTS = [5000, 10000, 15000, 20000, 25000, 30000];

export default function ApplyLoanPage() {
  const router = useRouter();
  const [types, setTypes] = useState<LoanType[]>([]);
  const [purposes, setPurposes] = useState<LoanPurpose[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    loan_type_id: "",
    loan_purpose_id: "",
    principal_amt: "",
    term_months: "",
    release_frequency: "monthly",
    custom_purpose: "",
  });

  useEffect(() => {
    fetch("/api/loans/options")
      .then((r) => r.json())
      .then((data) => {
        setTypes(data.types || []);
        setPurposes(data.purposes || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedPurpose = purposes.find(
    (p) => String(p.loan_purpose_id) === form.loan_purpose_id
  );
  const isOthersPurpose =
    selectedPurpose?.loan_purpose_description === "Others";

  const interestRate = 0.04;
  const principal = Number(form.principal_amt) || 0;
  const term = Number(form.term_months) || 0;
  const monthlyPayment =
    principal > 0 && term > 0
      ? (principal * interestRate) / (1 - Math.pow(1 + interestRate, -term))
      : 0;
  const totalPayment = monthlyPayment * term;
  const totalInterest = totalPayment - principal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isOthersPurpose && !form.custom_purpose.trim()) {
      setError("Please specify your loan purpose");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/loans/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loan_type_id: Number(form.loan_type_id),
          loan_purpose_id: Number(form.loan_purpose_id),
          principal_amt: Number(form.principal_amt),
          term_months: Number(form.term_months),
          release_frequency: form.release_frequency,
          custom_purpose: isOthersPurpose ? form.custom_purpose.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit application");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-gray-500 py-8 text-center">
        Loading loan options...
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">
            Application Submitted!
          </h2>
          <p className="text-green-700 text-sm mb-6">
            Your loan application has been submitted for review. You&apos;ll be
            notified once it&apos;s approved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard/loans"
              className="px-6 py-2.5 bg-ph-blue-500 text-white rounded-lg font-medium hover:bg-ph-blue-600 transition-colors text-sm"
            >
              View My Loans
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 bg-white border border-ph-blue-200 text-ph-blue-600 rounded-lg font-medium hover:bg-ph-blue-50 transition-colors text-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/loans"
          className="text-gray-400 hover:text-ph-blue-500 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Apply for a Loan</h1>
          <p className="text-gray-500 text-sm">
            Fill in the details below to submit your loan application
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {error && (
              <div className="mb-4 p-3 bg-ph-red-50 border border-ph-red-200 rounded-lg text-ph-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Type *
                  </label>
                  <select
                    required
                    value={form.loan_type_id}
                    onChange={(e) =>
                      setForm({ ...form, loan_type_id: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  >
                    <option value="">Select loan type</option>
                    {types.map((t) => (
                      <option key={t.loan_type_id} value={t.loan_type_id}>
                        {t.loan_type_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Purpose *
                  </label>
                  <select
                    required
                    value={form.loan_purpose_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        loan_purpose_id: e.target.value,
                        custom_purpose: "",
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  >
                    <option value="">Select purpose</option>
                    {purposes.map((p) => (
                      <option
                        key={p.loan_purpose_id}
                        value={p.loan_purpose_id}
                      >
                        {p.loan_purpose_description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Show custom purpose input when "Others" is selected */}
              {isOthersPurpose && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specify Loan Purpose *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={form.custom_purpose}
                    onChange={(e) =>
                      setForm({ ...form, custom_purpose: e.target.value })
                    }
                    placeholder="e.g. Wedding expenses, Appliance purchase..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-gray-900"
                  />
                </div>
              )}

              {/* Loan Amount - Fixed buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {LOAN_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, principal_amt: String(amt) })
                      }
                      className={`py-3 px-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        form.principal_amt === String(amt)
                          ? "border-ph-blue-500 bg-ph-blue-50 text-ph-blue-700 ring-2 ring-ph-blue-200"
                          : "border-gray-200 bg-white text-gray-700 hover:border-ph-blue-300 hover:bg-ph-blue-50/50"
                      }`}
                    >
                      ₱{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Select your desired loan amount (₱5,000 — ₱30,000)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Term (months) *
                  </label>
                  <select
                    required
                    value={form.term_months}
                    onChange={(e) =>
                      setForm({ ...form, term_months: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  >
                    <option value="">Select term</option>
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Frequency
                  </label>
                  <select
                    value={form.release_frequency}
                    onChange={(e) =>
                      setForm({ ...form, release_frequency: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bi-monthly">Bi-Monthly</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !form.principal_amt}
                  className="w-full py-3 bg-gradient-to-r from-ph-red-500 to-ph-red-600 text-white font-bold rounded-xl hover:from-ph-red-600 hover:to-ph-red-700 shadow-lg shadow-ph-red-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                      >
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
                      Submitting...
                    </span>
                  ) : (
                    "Submit Loan Application"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Loan Calculator Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-ph-blue-600 to-ph-blue-800 rounded-2xl shadow-xl p-6 text-white sticky top-24">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-ph-gold-400">★</span> Loan Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ph-blue-200">Loan Amount</span>
                <span className="font-semibold">
                  ₱{principal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ph-blue-200">Interest Rate</span>
                <span className="font-semibold">4% / month</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ph-blue-200">Loan Term</span>
                <span className="font-semibold">
                  {term > 0 ? `${term} months` : "—"}
                </span>
              </div>
              <hr className="border-white/20" />
              <div className="flex justify-between text-sm">
                <span className="text-ph-blue-200">Monthly Payment</span>
                <span className="font-bold text-lg text-ph-gold-400">
                  ₱
                  {monthlyPayment > 0
                    ? monthlyPayment.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ph-blue-200">Total Interest</span>
                <span className="font-semibold">
                  ₱
                  {totalInterest > 0
                    ? totalInterest.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ph-blue-200">Total Payment</span>
                <span className="font-bold">
                  ₱
                  {totalPayment > 0
                    ? totalPayment.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"}
                </span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-white/10 rounded-lg">
              <p className="text-xs text-ph-blue-200">
                <strong className="text-ph-gold-400">Note:</strong> This is an
                estimate. Final terms will be confirmed upon approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
