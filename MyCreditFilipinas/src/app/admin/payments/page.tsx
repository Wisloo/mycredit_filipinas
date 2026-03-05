"use client";

import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import Pagination from "@/components/Pagination";
import { useToast } from "@/components/Toast";

const PAGE_SIZE = 15;

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
  remarks: string | null;
}

const statusColors: Record<string, string> = {
  Verified: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800",
};

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [actionModal, setActionModal] = useState<{
    payment: Payment;
    action: "verify" | "reject";
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [receiptModal, setReceiptModal] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<Payment | null>(null);

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
    setActionError("");

    try {
      const res = await fetch(
        `/api/payments/${actionModal.payment.payment_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: actionModal.action,
            ...(actionModal.action === "reject" && rejectReason.trim() ? { reject_reason: rejectReason.trim() } : {}),
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast(
          actionModal.action === "verify"
            ? `Payment #${actionModal.payment.payment_id} verified.`
            : `Payment #${actionModal.payment.payment_id} rejected.`,
          actionModal.action === "verify" ? "success" : "warning"
        );
        setActionModal(null);
        setActionError("");
        setRejectReason("");
        fetchPayments();
      } else {
        setActionError(data.error || "Action failed. Please try again.");
      }
    } catch {
      setActionError("Network error. Please try again.");
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
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const downloadCSV = () => {
    const headers = ["ID", "Loan ID", "Borrower", "Amount", "Date", "Method", "Reference", "Status", "Remarks"];
    const rows = filtered.map((p) => [
      p.payment_id,
      p.loan_id,
      `"${p.borrower_name || ""}"`,
      Number(p.amount_paid),
      new Date(p.payment_date).toLocaleDateString(),
      `"${p.payment_method || ""}"`,
      `"${p.reference_number || ""}"`,
      p.payment_status,
      `"${(p as any).remarks || ""}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <div className="flex gap-2 items-center">
          <button
            onClick={downloadCSV}
            className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            ⬇ Export CSV
          </button>
          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ph-blue-500 focus:border-transparent outline-none text-sm w-full sm:w-64 text-gray-900"
          />
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "Pending", "Verified", "Rejected"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
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
        {paginated.map((p) => (
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
                  {p.borrower_name || "—"} · Loan #{p.loan_id}
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
                <p className="text-gray-700">{p.payment_method || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Reference</p>
                <p className="text-gray-700 truncate">
                  {p.reference_number || "—"}
                </p>
              </div>              <div className="col-span-2">
                <p className="text-gray-500 text-xs">Receipt</p>
                {p.attachment_url ? (
                  <button
                    onClick={() => setReceiptModal(p.attachment_url!)}
                    className="text-ph-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                  >
                    <ZoomIn className="w-3.5 h-3.5" /> View Receipt
                  </button>
                ) : (
                  <span className="text-gray-400 text-xs">No receipt</span>
                )}
              </div>            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setViewModal(p)}
                  className="flex-1 py-2 bg-ph-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View
                </button>
                {p.payment_status === "Pending" && (
                  <>
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
                  </>
                )}
              </div>
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">
                  Remarks
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
              {paginated.map((p) => (
                <tr key={p.payment_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.payment_id}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.borrower_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">#{p.loan_id}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ₱{Number(p.amount_paid).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(p.payment_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.payment_method || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.reference_number || "—"}
                  </td>                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate" title={p.remarks || ""}>
                    {p.remarks || "—"}
                  </td>                  <td className="px-4 py-3 text-center">
                    {p.attachment_url ? (
                      <button
                        onClick={() => setReceiptModal(p.attachment_url!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-ph-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <ZoomIn className="w-3.5 h-3.5" /> View
                      </button>
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
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => setViewModal(p)}
                        className="px-3 py-1.5 bg-ph-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                      {p.payment_status === "Pending" && (
                        <>
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
            No payments match your search
          </div>
        )}
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onPage={setPage}
      />

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => { if (!processing) { setActionModal(null); setActionError(""); } }}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {actionModal.action === "verify"
                ? "Verify Payment"
                : "Reject Payment"}
            </h3>

            {actionModal.payment.attachment_url && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Receipt / Proof of Payment</p>
                <div
                  className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 cursor-zoom-in"
                  onClick={() => setReceiptModal(actionModal.payment.attachment_url!)}
                >
                  <img
                    src={actionModal.payment.attachment_url}
                    alt="Receipt"
                    className="w-full max-h-48 object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
                    <span className="text-white text-xs font-medium flex items-center gap-1"><ZoomIn className="w-4 h-4" /> Click to enlarge</span>
                  </div>
                </div>
              </div>
            )}

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

            {actionModal.action === "reject" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Receipt does not match the amount, invalid reference number..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none resize-none text-gray-900"
                />
              </div>
            )}

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {actionError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setActionModal(null); setActionError(""); setRejectReason(""); }}
                disabled={processing}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={processing || (actionModal.action === "reject" && !rejectReason.trim())}
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

      {/* Payment Detail Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setViewModal(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setViewModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Payment ID</p>
                <p className="font-medium text-gray-800">#{viewModal.payment_id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Loan ID</p>
                <p className="font-medium text-gray-800">#{viewModal.loan_id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Borrower</p>
                <p className="font-medium text-gray-800">{viewModal.borrower_name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Amount Paid</p>
                <p className="font-medium text-gray-800">₱{Number(viewModal.amount_paid).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Date</p>
                <p className="font-medium text-gray-800">{new Date(viewModal.payment_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Method</p>
                <p className="font-medium text-gray-800">{viewModal.payment_method || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Reference #</p>
                <p className="font-medium text-gray-800">{viewModal.reference_number || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Status</p>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    statusColors[viewModal.payment_status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {viewModal.payment_status}
                </span>
              </div>
              {viewModal.remarks && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">
                    {viewModal.payment_status === "Rejected" ? "Reason for Rejection" : "Remarks"}
                  </p>
                  <p className={`font-medium ${viewModal.payment_status === "Rejected" ? "text-red-600" : "text-gray-800"}`}>
                    {viewModal.remarks}
                  </p>
                </div>
              )}
              {viewModal.attachment_url && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs mb-2">Receipt / Proof of Payment</p>
                  <div
                    className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 cursor-zoom-in"
                    onClick={() => setReceiptModal(viewModal.attachment_url!)}
                  >
                    <img
                      src={viewModal.attachment_url}
                      alt="Receipt"
                      className="w-full max-h-48 object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
                      <span className="text-white text-xs font-medium flex items-center gap-1">
                        <ZoomIn className="w-4 h-4" /> Click to enlarge
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Lightbox Modal */}
      {receiptModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80"
          onClick={() => setReceiptModal(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setReceiptModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={receiptModal}
              alt="Receipt"
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
            <a
              href={receiptModal}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-3 flex items-center justify-center gap-2 text-white text-sm hover:underline"
            >
              Open in new tab ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
