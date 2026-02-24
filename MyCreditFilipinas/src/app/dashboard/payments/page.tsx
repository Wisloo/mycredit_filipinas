"use client";

import { useEffect, useState } from "react";

interface Payment {
  payment_id: number;
  loan_id: number;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  payment_status: string;
  reference_number: string;
}

const statusColors: Record<string, string> = {
  Verified: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800",
};

export default function MyPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.user) return;
        const res = await fetch(`/api/payments?user_id=${data.user.id}`);
        const list = await res.json();
        setPayments(Array.isArray(list) ? list : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500 py-8 text-center">Loading payments...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">My Payments</h1>
          <p className="text-gray-500 text-sm">Track all your loan payment records</p>
        </div>
        <a
          href="/dashboard/payments/submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Make a Payment
        </a>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">💳</p>
          <p className="text-gray-600 font-medium">No payments found</p>
          <p className="text-gray-400 text-sm mt-1">
            Your payment history will appear here
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-4 lg:hidden">
            {payments.map((p) => (
              <div key={p.payment_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">Payment #{p.payment_id}</p>
                    <p className="text-sm text-gray-500">Loan #{p.loan_id}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[p.payment_status] || "bg-gray-100 text-gray-800"}`}>
                    {p.payment_status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Amount</p>
                    <p className="font-semibold text-gray-900">₱{Number(p.amount_paid).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Date</p>
                    <p className="font-medium text-gray-700">{new Date(p.payment_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Method</p>
                    <p className="font-medium text-gray-700">{p.payment_method || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Reference</p>
                    <p className="font-medium text-gray-700 truncate">{p.reference_number || "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Loan</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p) => (
                    <tr key={p.payment_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{p.payment_id}</td>
                      <td className="px-4 py-3 text-gray-700">#{p.loan_id}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ₱{Number(p.amount_paid).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(p.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{p.payment_method || "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{p.reference_number || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[p.payment_status] || "bg-gray-100 text-gray-800"}`}>
                          {p.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
