"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Loan {
  loan_id: number;
  borrower_name: string;
  loan_type: string;
  loan_purpose: string;
  principal_amt: number;
  interest_rate: number;
  loan_term_months: number;
  current_balance: number;
  loan_status: string;
  created_at: string;
  release_frequency: string;
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-blue-100 text-blue-800",
  Active: "bg-green-100 text-green-800",
  Paid: "bg-gray-100 text-gray-800",
  Defaulted: "bg-red-100 text-red-800",
  Denied: "bg-red-100 text-red-800",
  Frozen: "bg-cyan-100 text-cyan-800",
};

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionModal, setActionModal] = useState<{
    loan: Loan;
    action: "approve" | "deny";
  } | null>(null);
  const [denyReason, setDenyReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchLoans = () => {
    fetch("/api/loans")
      .then((r) => r.json())
      .then((data) => setLoans(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleAction = async () => {
    if (!actionModal) return;
    setProcessing(true);

    try {
      const res = await fetch(`/api/loans/${actionModal.loan.loan_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionModal.action,
          reason: denyReason || undefined,
        }),
      });

      if (res.ok) {
        setActionModal(null);
        setDenyReason("");
        fetchLoans();
      }
    } catch {
      // silent
    } finally {
      setProcessing(false);
    }
  };

  const filtered = loans.filter((l) => {
    const matchStatus = filter === "all" || l.loan_status === filter;
    const matchSearch = `${l.borrower_name} ${l.loan_type} ${l.loan_purpose}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statuses = [
    "all",
    "Pending",
    "Approved",
    "Active",
    "Paid",
    "Defaulted",
    "Denied",
    "Frozen",
  ];

  const pendingCount = loans.filter((l) => l.loan_status === "Pending").length;

  if (loading) {
    return (
      <div className="text-gray-500 py-8 text-center">Loading loans...</div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Loans Management</h1>
          <p className="text-gray-500 text-sm">
            {loans.length} total loans
            {pendingCount > 0 && (
              <span className="ml-2 text-yellow-600 font-medium">
                · {pendingCount} pending review
              </span>
            )}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search loans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-sm w-full sm:w-64 text-gray-900"
        />
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === s
                ? "bg-ph-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
            {s === "Pending" && pendingCount > 0 && (
              <span className="ml-1 bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile: cards */}
      <div className="space-y-3 lg:hidden">
        {filtered.map((l) => (
          <div
            key={l.loan_id}
            className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-gray-900">
                  Loan #{l.loan_id}
                </p>
                <p className="text-sm text-gray-500">
                  {l.borrower_name || "Unknown"}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-sm font-semibold ${
                  statusColors[l.loan_status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {l.loan_status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Type</p>
                <p className="text-gray-700">{l.loan_type || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Purpose</p>
                <p className="text-gray-700">{l.loan_purpose || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Principal</p>
                <p className="font-semibold text-gray-900">
                  ₱{Number(l.principal_amt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Term</p>
                <p className="text-gray-700">{l.loan_term_months} months</p>
              </div>
            </div>
            {l.loan_status === "Pending" ? (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link href={`/admin/loans/${l.loan_id}`} className="flex-1 py-2 bg-ph-blue-500 text-white text-sm font-medium rounded-lg hover:bg-ph-blue-600 transition-colors text-center">View</Link>
                <button
                  onClick={() =>
                    setActionModal({ loan: l, action: "approve" })
                  }
                  className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    setActionModal({ loan: l, action: "deny" })
                  }
                  className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Deny
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link href={`/admin/loans/${l.loan_id}`} className="flex-1 py-2 bg-ph-blue-500 text-white text-sm font-medium rounded-lg hover:bg-ph-blue-600 transition-colors text-center">View Details</Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">
                  Borrower
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">
                  Purpose
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-500 uppercase">
                  Principal
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-500 uppercase">
                  Balance
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500 uppercase">
                  Term
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((l) => (
                <tr key={l.loan_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {l.loan_id}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {l.borrower_name || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {l.loan_type || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {l.loan_purpose || "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ₱{Number(l.principal_amt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ₱{Number(l.current_balance).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {l.loan_term_months}mo
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-sm font-semibold ${
                        statusColors[l.loan_status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {l.loan_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <Link href={`/admin/loans/${l.loan_id}`} className="px-3 py-1.5 bg-ph-blue-600 text-white text-xs font-medium rounded-lg hover:bg-ph-blue-700 transition-colors">
                        View
                      </Link>
                      {l.loan_status === "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              setActionModal({ loan: l, action: "approve" })
                            }
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setActionModal({ loan: l, action: "deny" })
                            }
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Deny
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No loans match your filters
          </div>
        )}
      </div>

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !processing && setActionModal(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {actionModal.action === "approve"
                ? "Approve Loan"
                : "Deny Loan"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {actionModal.action === "approve" ? (
                <>
                  Are you sure you want to <strong>approve</strong> Loan #
                  {actionModal.loan.loan_id} for{" "}
                  <strong>{actionModal.loan.borrower_name}</strong> of{" "}
                  <strong>
                    ₱{Number(actionModal.loan.principal_amt).toLocaleString()}
                  </strong>
                  ? The loan will be activated immediately.
                </>
              ) : (
                <>
                  Are you sure you want to <strong>deny</strong> Loan #
                  {actionModal.loan.loan_id} for{" "}
                  <strong>{actionModal.loan.borrower_name}</strong>?
                </>
              )}
            </p>

            {actionModal.action === "deny" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for denial (optional)
                </label>
                <textarea
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm text-gray-900"
                  placeholder="Enter the reason..."
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setActionModal(null);
                  setDenyReason("");
                }}
                disabled={processing}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={processing}
                className={`flex-1 py-2.5 text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 ${
                  actionModal.action === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {processing
                  ? "Processing..."
                  : actionModal.action === "approve"
                  ? "Yes, Approve"
                  : "Yes, Deny"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
