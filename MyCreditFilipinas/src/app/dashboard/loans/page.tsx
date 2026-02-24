"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Loan {
  loan_id: number;
  loan_type: string;
  loan_purpose: string;
  principal_amt: number;
  interest_rate: number;
  loan_term_months: number;
  current_balance: number;
  loan_status: string;
  application_date: string;
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

export default function MyLoansPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.user) return;
        const res = await fetch(`/api/loans?user_id=${data.user.id}`);
        const list = await res.json();
        setLoans(Array.isArray(list) ? list : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500 py-8 text-center">Loading loans...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">My Loans</h1>
          <p className="text-gray-500 text-sm">View all your loan applications and their status</p>
        </div>
        <a
          href="/dashboard/loans/apply"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ph-blue-500 text-white text-sm font-medium rounded-xl hover:bg-ph-blue-600 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Apply for a Loan
        </a>
      </div>

      {loans.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-600 font-medium">No loans found</p>
          <p className="text-gray-400 text-sm mt-1">
            You haven&apos;t applied for any loans yet
          </p>
          <a
            href="/dashboard/loans/apply"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-ph-blue-500 text-white text-sm font-medium rounded-lg hover:bg-ph-blue-600 transition-colors"
          >
            Apply for Your First Loan
          </a>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-4 lg:hidden">
            {loans.map((loan) => (
              <Link href={`/dashboard/loans/${loan.loan_id}`} key={loan.loan_id} className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {loan.loan_type || "Loan"} #{loan.loan_id}
                    </p>
                    <p className="text-sm text-gray-500">{loan.loan_purpose || "—"}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-sm font-semibold ${statusColors[loan.loan_status] || "bg-gray-100 text-gray-800"}`}>
                    {loan.loan_status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Principal</p>
                    <p className="font-semibold text-gray-900">₱{Number(loan.principal_amt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Balance</p>
                    <p className="font-semibold text-gray-900">₱{Number(loan.current_balance).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Interest Rate</p>
                    <p className="font-medium text-gray-700">{(Number(loan.interest_rate) * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Term</p>
                    <p className="font-medium text-gray-700">{loan.loan_term_months} months</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Purpose</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-500 uppercase">Principal</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-500 uppercase">Balance</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500 uppercase">Rate</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500 uppercase">Term</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loans.map((loan) => (
                    <tr key={loan.loan_id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/loans/${loan.loan_id}`)}>
                      <td className="px-4 py-3 font-medium text-gray-900">{loan.loan_id}</td>
                      <td className="px-4 py-3 text-gray-700">{loan.loan_type || "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{loan.loan_purpose || "—"}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ₱{Number(loan.principal_amt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ₱{Number(loan.current_balance).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">{(Number(loan.interest_rate) * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-center text-gray-700">{loan.loan_term_months}mo</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-sm font-semibold ${statusColors[loan.loan_status] || "bg-gray-100 text-gray-800"}`}>
                          {loan.loan_status}
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
