"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ChevronLeft, CreditCard, FileText } from "lucide-react";

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
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

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
      const formData = new FormData();
      formData.append("loan_id", form.loan_id);
      formData.append("amount_paid", form.amount_paid);
      formData.append("payment_method", form.payment_method);
      if (form.transaction_id) formData.append("transaction_id", form.transaction_id);
      if (form.remarks) formData.append("remarks", form.remarks);
      if (receiptFile) formData.append("receipt", receiptFile);

      const res = await fetch("/api/payments/submit", {
        method: "POST",
        body: formData,
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
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
          <div className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 animate-fade-in">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10">
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm">
              <CheckCircle size={42} className="text-emerald-500" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-emerald-900 mb-2">
            Payment Submitted!
          </h2>
          <p className="text-emerald-700 text-sm mb-7 leading-relaxed">
            Your payment has been recorded and is pending verification by our
            staff. You&apos;ll be notified once it&apos;s confirmed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard/payments"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-sm shadow-sm"
            >
              <CreditCard size={15} /> View My Payments
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
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
          className="text-gray-400 hover:text-indigo-500 transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Make a Payment</h1>
          <p className="text-gray-500 text-sm">
            Submit a payment for one of your active loans
          </p>
        </div>
      </div>

      {loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="mx-auto mb-4 w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
            <FileText size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-700 font-semibold">No Active Loans</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">
            You don&apos;t have any active loans to make payments on.
          </p>
          <Link
            href="/dashboard/loans/apply"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-sm"
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
                    onChange={(e) => {
                      const loanId = e.target.value;
                      const chosen = loans.find((l) => l.loan_id === Number(loanId));
                      // Auto-fill the amortization amount when a loan is selected
                      setForm((prev) => ({
                        ...prev,
                        loan_id: loanId,
                        amount_paid: chosen?.amortization
                          ? String(Number(chosen.amortization).toFixed(2))
                          : prev.amount_paid,
                      }));
                    }}
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
                  {selectedLoan?.amortization != null && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-400">
                        Suggested: ₱{Number(selectedLoan.amortization).toLocaleString()}
                      </p>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, amount_paid: String(Number(selectedLoan!.amortization).toFixed(2)) })}
                        className="text-xs text-ph-blue-500 hover:text-ph-blue-700 font-medium underline"
                      >
                        Use this
                      </button>
                    </div>
                  )}
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
                            setReceiptFile(file);
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
                          setReceiptFile(file);
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
                            setReceiptFile(null);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove receipt
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="receipt-upload" className="cursor-pointer">
                        <div className="flex justify-center mb-2">
                          <CreditCard size={28} className="text-gray-300" />
                        </div>
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
