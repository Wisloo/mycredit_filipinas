"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface LoanDetail {
  loan_id: number;
  user_id: number;
  borrower_name: string;
  email_address: string;
  gender: string;
  loan_type: string;
  loan_purpose: string;
  principal_amt: number;
  term_months: number;
  amortization: number;
  fees: number;
  profit: number;
  interest_rate: number;
  current_balance: number;
  loan_status: string;
  release_frequency: string;
  processed_by_name: string | null;
  decision_date: string | null;
  date_released: string | null;
  term_due: string | null;
  remarks: string | null;
  created_at: string;
  payments: {
    payment_id: number;
    payment_date: string;
    amount_paid: number;
    penalty_amount: number;
    payment_method: string;
    payment_status: string;
    transaction_id: string;
    attachment_url: string | null;
    remarks: string;
    created_at: string;
  }[];
  schedules: {
    schedule_id: number;
    due_date: string;
    scheduled_amount: number;
    paid_amount: number;
    status: string;
  }[];
  releases: {
    release_id: number;
    release_date: string;
    amount_released: number;
    reference_no: string;
  }[];
  rejection: {
    date_rejected: string;
    rejected_reason: string;
  } | null;
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Approved: "bg-blue-100 text-blue-800 border-blue-200",
  Active: "bg-green-100 text-green-800 border-green-200",
  Paid: "bg-gray-100 text-gray-800 border-gray-200",
  Defaulted: "bg-red-100 text-red-800 border-red-200",
  Denied: "bg-red-100 text-red-800 border-red-200",
  Frozen: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

const paymentStatusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Verified: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const scheduleStatusColors: Record<string, string> = {
  Unpaid: "bg-gray-100 text-gray-700",
  Partial: "bg-yellow-100 text-yellow-700",
  Paid: "bg-green-100 text-green-700",
  Overdue: "bg-red-100 text-red-700",
};

function Section({
  title,
  icon,
  children,
  empty,
  action,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  empty?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
        {action}
      </div>
      <div className="p-6">
        {empty ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No records found
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default function AdminLoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [denyReason, setDenyReason] = useState("");
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ fees: "", profit: "" });

  const fetchLoan = useCallback(() => {
    setLoading(true);
    fetch(`/api/loans/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setLoan(data);
        setEditForm({
          fees: data.fees ? String(data.fees) : "",
          profit: data.profit ? String(data.profit) : "",
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    fetchLoan();
  }, [fetchLoan]);

  const handleAction = async (action: "approve" | "deny", reason?: string) => {
    setActionLoading(action);
    setActionMessage("");
    try {
      const res = await fetch(`/api/loans/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage(data.error || "Failed");
      } else {
        setActionMessage(data.message);
        setShowDenyModal(false);
        fetchLoan();
      }
    } catch {
      setActionMessage("Network error");
    } finally {
      setActionLoading("");
    }
  };

  const handleVerifyPayment = async (paymentId: number, action: "verify" | "reject") => {
    setActionLoading(`payment-${paymentId}`);
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage(data.error || "Failed");
      } else {
        fetchLoan();
      }
    } catch {
      setActionMessage("Network error");
    } finally {
      setActionLoading("");
    }
  };

  const handleUpdateLoan = async () => {
    setActionLoading("update");
    try {
      const res = await fetch(`/api/loans/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          fees: editForm.fees ? Number(editForm.fees) : undefined,
          profit: editForm.profit ? Number(editForm.profit) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage(data.error || "Failed");
      } else {
        setActionMessage("Loan updated successfully");
        setShowEditModal(false);
        fetchLoan();
      }
    } catch {
      setActionMessage("Network error");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-ph-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Loan not found
        </h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-ph-blue-500 text-white text-sm rounded-lg hover:bg-ph-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  const totalPaid = loan.payments
    .filter((p) => p.payment_status === "Verified")
    .reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const progressPct =
    Number(loan.principal_amt) > 0
      ? Math.min(
          ((totalPaid / Number(loan.principal_amt)) * 100),
          100
        )
      : 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Action message toast */}
      {actionMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-lg text-sm font-medium text-gray-900 flex items-center gap-3 animate-fade-in">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage("")} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* Deny Modal */}
      {showDenyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Deny Loan Application</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason for denying this loan application.</p>
            <textarea
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="Reason for denial..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDenyModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={() => handleAction("deny", denyReason)} disabled={actionLoading === "deny" || !denyReason.trim()} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50">
                {actionLoading === "deny" ? "Denying..." : "Confirm Deny"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Fees/Profit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Loan Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fees (₱)</label>
                <input type="number" step="0.01" min="0" value={editForm.fees} onChange={(e) => setEditForm({ ...editForm, fees: e.target.value })} placeholder="e.g. 500" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profit (₱)</label>
                <input type="number" step="0.01" min="0" value={editForm.profit} onChange={(e) => setEditForm({ ...editForm, profit: e.target.value })} placeholder="e.g. 2000" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-gray-900" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleUpdateLoan} disabled={actionLoading === "update"} className="px-4 py-2 text-sm font-medium text-white bg-ph-blue-500 rounded-lg hover:bg-ph-blue-600 disabled:opacity-50">
                {actionLoading === "update" ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-ph-blue-500 hover:text-ph-blue-700 font-medium mb-3 flex items-center gap-1"
        >
          ← Back to Loans
        </button>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">
                  Loan #{loan.loan_id}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    statusColors[loan.loan_status] ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {loan.loan_status}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {loan.loan_type} · {loan.loan_purpose}
                {loan.remarks && ` — ${loan.remarks}`}
              </p>
              <Link
                href={`/admin/users/${loan.user_id}`}
                className="text-sm text-ph-blue-500 hover:text-ph-blue-700 font-medium mt-1 inline-block"
              >
                👤 {loan.borrower_name} ({loan.email_address})
              </Link>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ₱{Number(loan.principal_amt).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Principal Amount</p>
              </div>

              {/* ACTION BUTTONS */}
              {loan.loan_status === "Pending" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={!!actionLoading}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 disabled:opacity-50 shadow-lg shadow-green-500/25 transition-all"
                  >
                    {actionLoading === "approve" ? "Approving..." : "✓ Approve & Activate"}
                  </button>
                  <button
                    onClick={() => setShowDenyModal(true)}
                    disabled={!!actionLoading}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 shadow-lg shadow-red-500/25 transition-all"
                  >
                    ✕ Deny
                  </button>
                </div>
              )}

              {["Active", "Approved", "Pending"].includes(loan.loan_status) && (
                <button onClick={() => setShowEditModal(true)} className="px-4 py-2 text-xs font-medium text-ph-blue-600 bg-ph-blue-50 rounded-lg hover:bg-ph-blue-100 transition-colors">
                  ✎ Edit Fees & Profit
                </button>
              )}
            </div>
          </div>

          {/* Progress for active loans */}
          {(loan.loan_status === "Active" || loan.loan_status === "Paid") && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Repayment Progress</span>
                <span className="font-semibold text-gray-900">
                  ₱{totalPaid.toLocaleString()} / ₱
                  {Number(loan.principal_amt).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-ph-blue-500 to-green-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {progressPct.toFixed(1)}% paid · Balance: ₱
                {Number(loan.current_balance).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Loan Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Section title="Loan Terms" icon="📝">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Principal
              </p>
              <p className="text-sm font-semibold text-gray-900">
                ₱{Number(loan.principal_amt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Interest Rate
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {(Number(loan.interest_rate) * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Term
              </p>
              <p className="text-sm text-gray-900">
                {loan.term_months} months
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Frequency
              </p>
              <p className="text-sm text-gray-900 capitalize">
                {loan.release_frequency || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Amortization
              </p>
              <p className="text-sm text-gray-900">
                {loan.amortization
                  ? `₱${Number(loan.amortization).toLocaleString()}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Current Balance
              </p>
              <p className="text-sm font-semibold text-gray-900">
                ₱{Number(loan.current_balance).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Fees
              </p>
              <p className="text-sm text-gray-900">
                {loan.fees
                  ? `₱${Number(loan.fees).toLocaleString()}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Profit
              </p>
              <p className="text-sm text-gray-900">
                {loan.profit
                  ? `₱${Number(loan.profit).toLocaleString()}`
                  : "—"}
              </p>
            </div>
          </div>
        </Section>

        <Section title="Processing Details" icon="⚙️">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Applied On
              </p>
              <p className="text-sm text-gray-900">
                {loan.created_at
                  ? new Date(loan.created_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Decision Date
              </p>
              <p className="text-sm text-gray-900">
                {loan.decision_date
                  ? new Date(loan.decision_date).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Released On
              </p>
              <p className="text-sm text-gray-900">
                {loan.date_released
                  ? new Date(loan.date_released).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Due Date
              </p>
              <p className="text-sm text-gray-900">
                {loan.term_due
                  ? new Date(loan.term_due).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Processed By
              </p>
              <p className="text-sm text-gray-900">
                {loan.processed_by_name || "—"}
              </p>
            </div>
          </div>

          {/* Rejection info */}
          {loan.rejection && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs font-semibold text-red-800 mb-1">
                Denial Reason
              </p>
              <p className="text-sm text-red-700">
                {loan.rejection.rejected_reason}
              </p>
              <p className="text-xs text-red-500 mt-1">
                {loan.rejection.date_rejected
                  ? new Date(
                      loan.rejection.date_rejected
                    ).toLocaleDateString()
                  : ""}
              </p>
            </div>
          )}
        </Section>
      </div>

      {/* Payment History */}
      <div className="mb-4">
        <Section
          title={`Payment History (${loan.payments.length})`}
          icon="💳"
          empty={loan.payments.length === 0}
        >
          {/* Mobile: cards */}
          <div className="space-y-3 lg:hidden">
            {loan.payments.map((p) => (
              <div key={p.payment_id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold text-gray-900">₱{Number(p.amount_paid).toLocaleString()}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[p.payment_status] || "bg-gray-100 text-gray-800"}`}>
                    {p.payment_status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <p className="text-gray-500 text-xs">Date</p>
                    <p className="font-medium text-gray-700">{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Method</p>
                    <p className="font-medium text-gray-700">{p.payment_method || "—"}</p>
                  </div>
                  {p.transaction_id && (
                    <div>
                      <p className="text-gray-500 text-xs">Reference</p>
                      <p className="font-medium text-gray-700 text-xs">{p.transaction_id}</p>
                    </div>
                  )}
                  {p.attachment_url && (
                    <div>
                      <a href={p.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-ph-blue-600 bg-ph-blue-50 rounded-lg hover:bg-ph-blue-100 transition-colors">
                        📸 View Receipt
                      </a>
                    </div>
                  )}
                </div>
                {p.payment_status === "Pending" && (
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleVerifyPayment(p.payment_id, "verify")}
                      disabled={actionLoading === `payment-${p.payment_id}`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      ✓ Verify
                    </button>
                    <button
                      onClick={() => handleVerifyPayment(p.payment_id, "reject")}
                      disabled={actionLoading === `payment-${p.payment_id}`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                  <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase">Reference</th>
                  <th className="pb-2 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="pb-2 text-center text-xs font-semibold text-gray-500 uppercase">Receipt</th>
                  <th className="pb-2 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loan.payments.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-gray-50/50">
                    <td className="py-3 text-gray-700">
                      {p.payment_date
                        ? new Date(p.payment_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      ₱{Number(p.amount_paid).toLocaleString()}
                    </td>
                    <td className="py-3 text-gray-700">
                      {p.payment_method || "—"}
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {p.transaction_id || "—"}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          paymentStatusColors[p.payment_status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {p.payment_status}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {p.attachment_url ? (
                        <a
                          href={p.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-ph-blue-600 bg-ph-blue-50 rounded-lg hover:bg-ph-blue-100 transition-colors"
                        >
                          📸 View
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {p.payment_status === "Pending" && (
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleVerifyPayment(p.payment_id, "verify")}
                            disabled={actionLoading === `payment-${p.payment_id}`}
                            className="px-2.5 py-1 text-xs font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleVerifyPayment(p.payment_id, "reject")}
                            disabled={actionLoading === `payment-${p.payment_id}`}
                            className="px-2.5 py-1 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* Payment Schedule */}
      <div className="mb-4">
        <Section
          title={`Payment Schedule (${loan.schedules.length})`}
          icon="📅"
          empty={loan.schedules.length === 0}
        >
          {/* Mobile: cards */}
          <div className="space-y-3 lg:hidden">
            {loan.schedules.map((s, i) => (
              <div key={s.schedule_id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold text-gray-900">Payment #{i + 1}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${scheduleStatusColors[s.status] || "bg-gray-100 text-gray-800"}`}>
                    {s.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Due Date</p>
                    <p className="font-medium text-gray-900">{s.due_date ? new Date(s.due_date).toLocaleDateString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Scheduled</p>
                    <p className="font-medium text-gray-900">₱{Number(s.scheduled_amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Paid</p>
                    <p className="font-medium text-gray-700">₱{Number(s.paid_amount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">Scheduled</th>
                  <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">Paid</th>
                  <th className="pb-2 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loan.schedules.map((s) => (
                  <tr key={s.schedule_id} className="hover:bg-gray-50/50">
                    <td className="py-3 text-gray-700">
                      {s.due_date ? new Date(s.due_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      ₱{Number(s.scheduled_amount).toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      ₱{Number(s.paid_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${scheduleStatusColors[s.status] || "bg-gray-100 text-gray-800"}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* Loan Releases */}
      <div className="mb-4">
        <Section
          title="Loan Releases"
          icon="💵"
          empty={loan.releases.length === 0}
        >
          <div className="space-y-3">
            {loan.releases.map((r) => (
              <div
                key={r.release_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ₱{Number(r.amount_released).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ref: {r.reference_no || "—"}
                  </p>
                </div>
                <p className="text-sm text-gray-700">
                  {r.release_date
                    ? new Date(r.release_date).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
