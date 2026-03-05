"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
} from "lucide-react";

interface Payment {
  payment_id: number;
  loan_id: number;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  payment_status: string;
  reference_number: string;
  remarks: string | null;
}

const STATUS_META: Record<string, { chip: string; icon: React.ReactNode }> = {
  Verified: {
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    icon: <CheckCircle size={12} />,
  },
  Pending: {
    chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    icon: <Clock size={12} />,
  },
  Rejected: {
    chip: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    icon: <XCircle size={12} />,
  },
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-2.5 w-14 bg-gray-100 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = () => {
    setLoading(true);
    setFetchError(false);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.user) return;
        const res = await fetch(`/api/payments?user_id=${data.user.id}`);
        const list = await res.json();
        const sorted = (Array.isArray(list) ? list : []).sort(
          (a: Payment, b: Payment) =>
            new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
        );
        setPayments(sorted);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const statuses = ["all", "Pending", "Verified", "Rejected"];

  const filtered = payments.filter((p) => {
    const matchStatus = statusFilter === "all" || p.payment_status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      String(p.payment_id).includes(q) ||
      String(p.loan_id).includes(q) ||
      (p.payment_method || "").toLowerCase().includes(q) ||
      (p.reference_number || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-56 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <CreditCard size={40} className="text-gray-300" />
        <p className="text-gray-500 font-medium">Failed to load payments</p>
        <button
          onClick={load}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Payments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track all your loan payment records</p>
        </div>
        <Link
          href="/dashboard/payments/submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Make a Payment
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by loan, method, or reference&hellip;"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Statuses" : s}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All" },
          { key: "Pending", label: "Pending" },
          { key: "Verified", label: "Verified" },
          { key: "Rejected", label: "Rejected" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              statusFilter === key
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
            {key !== "all" && (
              <span className="ml-1 opacity-70">
                ({payments.filter((p) => p.payment_status === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="mx-auto mb-4 w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
            <CreditCard size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-700 font-semibold">No payments yet</p>
          <p className="text-gray-400 text-sm mt-1">Your payment history will appear here.</p>
          <Link
            href="/dashboard/payments/submit"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={14} /> Make a Payment
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="mx-auto mb-4 w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
            <Search size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-700 font-semibold">No matching payments</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter.</p>
          <button
            onClick={() => { setSearch(""); setStatusFilter("all"); }}
            className="mt-4 text-sm text-indigo-600 hover:underline font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((p) => {
              const meta = STATUS_META[p.payment_status] ?? { chip: "bg-gray-100 text-gray-600", icon: null };
              return (
                <div
                  key={p.payment_id}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Payment #{p.payment_id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Loan #{p.loan_id}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${meta.chip}`}>
                      {meta.icon} {p.payment_status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <p className="text-gray-400">Amount</p>
                      <p className="font-semibold text-gray-900 text-sm">&#8369;{Number(p.amount_paid).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Date</p>
                      <p className="text-gray-700">{new Date(p.payment_date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Method</p>
                      <p className="text-gray-700">{p.payment_method || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Reference</p>
                      <p className="text-gray-700 truncate">{p.reference_number || "—"}</p>
                    </div>
                    {p.payment_status === "Rejected" && p.remarks && (
                      <div className="col-span-2 mt-1">
                        <p className="text-gray-400">Reason for Rejection</p>
                        <p className="text-rose-600 text-sm font-medium">{p.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Loan</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const meta = STATUS_META[p.payment_status] ?? { chip: "bg-gray-100 text-gray-600", icon: null };
                  return (
                    <tr key={p.payment_id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        #{p.payment_id}
                      </td>
                      <td className="px-4 py-3 text-gray-600">Loan #{p.loan_id}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        &#8369;{Number(p.amount_paid).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(p.payment_date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.payment_method || "—"}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.reference_number || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${meta.chip}`}>
                          {meta.icon} {p.payment_status}
                        </span>
                        {p.payment_status === "Rejected" && p.remarks && (
                          <p className="text-rose-500 text-[10px] mt-1 max-w-[180px] mx-auto" title={p.remarks}>
                            {p.remarks}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>Showing {filtered.length} of {payments.length} payments</span>
              <span>Sorted by most recent</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
