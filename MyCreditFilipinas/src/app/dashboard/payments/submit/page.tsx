"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ActiveLoan {
  loan_id: number;
  loan_type: string;
  loan_purpose: string;
  principal_amt: number;
  current_balance: number;
  loan_status: string;
  amortization: number | null;
  release_frequency: string | null;
}

export default function SubmitPaymentPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    loan_id: "",
    amount_paid: "",
    payment_method: "",
    transaction_id: "",
    remarks: "",
  });
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.user) return;
        const res = await fetch(`/api/loans?user_id=${data.user.id}`);
        const list = await res.json();
        const activeLoans = (Array.isArray(list) ? list : []).filter(
          (l: ActiveLoan) => l.loan_status === "Active"
        );
        setLoans(activeLoans);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedLoan = loans.find(
    (l) => l.loan_id === Number(form.loan_id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loan_id: Number(form.loan_id),
          amount_paid: Number(form.amount_paid),
          payment_method: form.payment_method,
          transaction_id: form.transaction_id || undefined,
          remarks: form.remarks || undefined,
          receipt_image: receiptPreview || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit payment");
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
      <div className="text-gray-500 py-8 text-center">Loading...</div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">
            Payment Submitted!
          </h2>
          <p className="text-green-700 text-sm mb-6">
            Your payment has been recorded and is pending verification by our
            staff.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard/payments"
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
            >
              View My Payments
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 bg-white border border-green-300 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors text-sm"
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
          href="/dashboard/payments"
          className="text-gray-400 hover:text-gray-600 transition-colors"
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
          <h1 className="text-2xl font-extrabold text-gray-900">Make a Payment</h1>
          <p className="text-gray-500 text-sm">
            Submit a payment for one of your active loans
          </p>
        </div>
      </div>

      {loans.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-600 font-medium">No Active Loans</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            You don&apos;t have any active loans to make payments on.
          </p>
          <Link
            href="/dashboard/loans/apply"
            className="inline-block px-6 py-2.5 bg-ph-blue-500 text-white rounded-lg font-medium hover:bg-ph-blue-600 transition-colors text-sm"
          >
            Apply for a Loan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Loan *
                  </label>
                  <select
                    required
                    value={form.loan_id}
                    onChange={(e) =>
                      setForm({ ...form, loan_id: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  >
                    <option value="">Choose a loan</option>
                    {loans.map((l) => (
                      <option key={l.loan_id} value={l.loan_id}>
                        Loan #{l.loan_id} — {l.loan_type || "Loan"} (Balance: ₱
                        {Number(l.current_balance).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Amount (₱) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={form.amount_paid}
                    onChange={(e) =>
                      setForm({ ...form, amount_paid: e.target.value })
                    }
                    placeholder="e.g. 2000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    required
                    value={form.payment_method}
                    onChange={(e) =>
                      setForm({ ...form, payment_method: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  >
                    <option value="">Select method</option>
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Maya">Maya</option>
                    <option value="Check">Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference / Transaction ID
                  </label>
                  <input
                    type="text"
                    value={form.transaction_id}
                    onChange={(e) =>
                      setForm({ ...form, transaction_id: e.target.value })
                    }
                    placeholder="e.g. GCash ref number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-gray-900"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Required for GCash, bank transfers, etc.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    value={form.remarks}
                    onChange={(e) =>
                      setForm({ ...form, remarks: e.target.value })
                    }
                    rows={2}
                    placeholder="Optional notes..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-gray-900"
                  />
                </div>

                {/* Receipt Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Receipt (optional)
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-ph-blue-400 transition-colors cursor-pointer"
                    onPaste={(e) => {
                      const items = e.clipboardData?.items;
                      if (!items) return;
                      for (let i = 0; i < items.length; i++) {
                        if (items[i].type.startsWith("image/")) {
                          const file = items[i].getAsFile();
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setReceiptPreview(ev.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                          break;
                        }
                      }
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="receipt-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setError("Receipt image must be less than 5MB");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setReceiptPreview(ev.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {receiptPreview ? (
                      <div className="space-y-2">
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          className="max-h-48 mx-auto rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReceiptPreview(null);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove receipt
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="receipt-upload" className="cursor-pointer">
                        <div className="text-3xl mb-2">📸</div>
                        <p className="text-sm text-gray-600 font-medium">
                          Click to upload or paste screenshot
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, GIF up to 5MB — You can also Ctrl+V to paste
                        </p>
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-ph-blue-500 to-ph-blue-600 text-white font-bold rounded-xl hover:from-ph-blue-600 hover:to-ph-blue-700 shadow-lg shadow-ph-blue-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    "Submit Payment"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Loan Info Card */}
          <div className="lg:col-span-1">
            {selectedLoan ? (
              <div className="bg-gradient-to-br from-ph-blue-600 to-ph-blue-800 rounded-2xl shadow-xl p-6 text-white sticky top-24">
                <h3 className="font-bold text-lg mb-4">
                  Loan #{selectedLoan.loan_id}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-ph-blue-200">Type</span>
                    <span className="font-semibold">
                      {selectedLoan.loan_type || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ph-blue-200">Purpose</span>
                    <span className="font-semibold">
                      {selectedLoan.loan_purpose || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ph-blue-200">Principal</span>
                    <span className="font-semibold">
                      ₱{Number(selectedLoan.principal_amt).toLocaleString()}
                    </span>
                  </div>
                  {selectedLoan.amortization && (
                    <div className="flex justify-between text-sm">
                      <span className="text-ph-blue-200">Amortization</span>
                      <span className="font-semibold">
                        ₱{Number(selectedLoan.amortization).toLocaleString()}
                        {selectedLoan.release_frequency === "bi-monthly" ? "/bi-mo" : "/mo"}
                      </span>
                    </div>
                  )}
                  <hr className="border-white/20" />
                  <div className="flex justify-between text-sm">
                    <span className="text-ph-blue-200">Current Balance</span>
                    <span className="font-bold text-lg">
                      ₱{Number(selectedLoan.current_balance).toLocaleString()}
                    </span>
                  </div>
                  {selectedLoan.amortization && (
                    <p className="text-xs text-ph-blue-200 mt-2">
                      Suggested payment: ₱{Number(selectedLoan.amortization).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
                <p className="text-gray-400 text-sm">
                  Select a loan to see details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
