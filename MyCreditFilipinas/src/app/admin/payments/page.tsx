"use client";

import { useEffect, useState } from "react";

interface Payment {
  payment_id: number;
  loan_id: number;
  borrower_name: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  payment_status: string;
  reference_number: string;
  attachment_url: string | null;
}

const statusColors: Record<string, string> = {
  Verified: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionModal, setActionModal] = useState<{
    payment: Payment;
    action: "verify" | "reject";
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchPayments = () => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((data) => setPayments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAction = async () => {
    if (!actionModal) return;
    setProcessing(true);

    try {
      const res = await fetch(
        `/api/payments/${actionModal.payment.payment_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: actionModal.action }),
        }
      );

      if (res.ok) {
        setActionModal(null);
        fetchPayments();
      }
    } catch {
      // silent
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = payments.filter(
    (p) => p.payment_status === "Pending"
  ).length;

  const filtered = payments.filter((p) => {
    const matchStatus = filter === "all" || p.payment_status === filter;
    const matchSearch =
      `${p.borrower_name} ${p.reference_number} ${p.payment_method}`
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="text-gray-500 py-8 text-center">Loading payments...</div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Payments Management
          </h1>
          <p className="text-gray-500 text-sm">
            {payments.length} total payments
            {pendingCount > 0 && (
              <span className="ml-2 text-yellow-600 font-medium">
                · {pendingCount} pending verification
              </span>
            )}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search payments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-sm w-full sm:w-64 text-gray-900"
        />
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "Pending", "Verified", "Rejected"].map((s) => (
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
        {filtered.map((p) => (
          <div
            key={p.payment_id}
            className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-gray-900">
                  Payment #{p.payment_id}
                </p>
                <p className="text-sm text-gray-500">
                  {p.borrower_name || "—"} · Loan #{p.loan_id}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-sm font-semibold ${
                  statusColors[p.payment_status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {p.payment_status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Amount</p>
                <p className="font-semibold text-gray-900">
                  ₱{Number(p.amount_paid).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Date</p>
                <p className="text-gray-700">
                  {new Date(p.payment_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Method</p>
                <p className="text-gray-700">{p.payment_method || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Reference</p>
                <p className="text-gray-700 truncate">
                  {p.reference_number || "—"}
                </p>
              </div>              {p.attachment_url && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">Receipt</p>
                  <a
                    href={p.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ph-blue-600 hover:underline text-sm font-medium"
                  >
                    View Receipt
                  </a>
                </div>
              )}            </div>
            {p.payment_status === "Pending" && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() =>
                    setActionModal({ payment: p, action: "verify" })
                  }
                  className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Verify
                </button>
                <button
                  onClick={() =>
                    setActionModal({ payment: p, action: "reject" })
                  }
                  className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
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
                  Loan
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">
                  Reference
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500 uppercase">
                  Receipt
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
              {filtered.map((p) => (
                <tr key={p.payment_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.payment_id}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.borrower_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">#{p.loan_id}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ₱{Number(p.amount_paid).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(p.payment_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.payment_method || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.reference_number || "—"}
                  </td>
                  <td className="px-4 py-3 text-center">                    {p.attachment_url ? (
                      <a
                        href={p.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ph-blue-600 hover:underline text-xs font-medium"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">                    <span
                      className={`px-2.5 py-1 rounded-full text-sm font-semibold ${
                        statusColors[p.payment_status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {p.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.payment_status === "Pending" ? (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() =>
                            setActionModal({ payment: p, action: "verify" })
                          }
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() =>
                            setActionModal({ payment: p, action: "reject" })
                          }
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No payments match your search
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
              {actionModal.action === "verify"
                ? "Verify Payment"
                : "Reject Payment"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {actionModal.action === "verify" ? (
                <>
                  Confirm that Payment #{actionModal.payment.payment_id} of{" "}
                  <strong>
                    ₱
                    {Number(
                      actionModal.payment.amount_paid
                    ).toLocaleString()}
                  </strong>{" "}
                  from <strong>{actionModal.payment.borrower_name}</strong> via{" "}
                  <strong>{actionModal.payment.payment_method}</strong> has been
                  received? The loan balance will be reduced accordingly.
                </>
              ) : (
                <>
                  Are you sure you want to reject Payment #
                  {actionModal.payment.payment_id} from{" "}
                  <strong>{actionModal.payment.borrower_name}</strong>?
                </>
              )}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setActionModal(null)}
                disabled={processing}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={processing}
                className={`flex-1 py-2.5 text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 ${
                  actionModal.action === "verify"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {processing
                  ? "Processing..."
                  : actionModal.action === "verify"
                  ? "Yes, Verify"
                  : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
