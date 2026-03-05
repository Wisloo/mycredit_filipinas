"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  ChevronRight,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Snowflake,
  XCircle,
  CreditCard,
} from "lucide-react";

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
  created_at: string;
}

const STATUS_META: Record<string, { chip: string; icon: React.ReactNode }> = {
  Pending:   { chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",      icon: <Clock size={12} /> },
  Approved:  { chip: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",   icon: <CheckCircle size={12} /> },
  Active:    { chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", icon: <CheckCircle size={12} /> },
  Paid:      { chip: "bg-gray-100 text-gray-600",                              icon: <CheckCircle size={12} /> },
  Defaulted: { chip: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",         icon: <AlertCircle size={12} /> },
  Denied:    { chip: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",         icon: <XCircle size={12} /> },
  Frozen:    { chip: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",            icon: <Snowflake size={12} /> },
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-32 bg-gray-200 rounded-full" />
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div className="h-3 w-16 bg-gray-100 rounded-full mb-1" />
            <div className="h-4 w-24 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyLoansPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.user) return;
        const res = await fetch(`/api/loans?user_id=${data.user.id}`);
        const list = await res.json();
        const sorted = (Array.isArray(list) ? list : []).sort(
          (a: Loan, b: Loan) =>
            new Date(b.created_at ?? b.application_date ?? 0).getTime() -
            new Date(a.created_at ?? a.application_date ?? 0).getTime()
        );
        setLoans(sorted);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  const statuses = ["all", "Pending", "Approved", "Active", "Paid", "Denied", "Frozen", "Defaulted"];

  const filtered = loans.filter((l) => {
    const matchStatus = statusFilter === "all" || l.loan_status === statusFilter;
    const matchSearch = `${l.loan_type} ${l.loan_purpose} ${l.loan_id}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="animate-fade-in space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-28 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-48 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <AlertCircle size={36} className="text-rose-400" />
        <p className="text-gray-700 font-semibold text-lg">Failed to load loans</p>
        <p className="text-gray-500 text-sm">Could not retrieve your loan data. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Loans</h1>
          <p className="text-gray-500 text-sm">
            {loans.length} loan{loans.length !== 1 ? "s" : ""} on record
          </p>
        </div>
        <Link
          href="/dashboard/loans/apply"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Apply for a Loan
        </Link>
      </div>

      {/* ── Search + Filter ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by type, purpose or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-900 placeholder-gray-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All Statuses" : s}</option>
          ))}
        </select>
      </div>

      {/* ── Status quick-filter chips ───────────────────── */}
      {loans.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(["Active", "Pending", "Paid", "Frozen"] as const).map((s) => {
            const count = loans.filter((l) => l.loan_status === s).length;
            if (!count) return null;
            const meta = STATUS_META[s];
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? meta.chip + " shadow-sm scale-105"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {meta.icon}{s} ({count})
              </button>
            );
          })}
        </div>
      )}

      {loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FileText size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">No loans yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">
            You haven&apos;t applied for any loans yet.
          </p>
          <Link
            href="/dashboard/loans/apply"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus size={15} />
            Apply for Your First Loan
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <Search size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No loans match your search</p>
          <button
            onClick={() => { setSearch(""); setStatusFilter("all"); }}
            className="mt-3 text-sm text-indigo-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((loan) => {
              const principal = Number(loan.principal_amt) || 0;
              const balance = Number(loan.current_balance) || 0;
              const progress = principal > 0
                ? Math.min(100, Math.round(((principal - balance) / principal) * 100))
                : 0;
              const meta = STATUS_META[loan.loan_status] ?? { chip: "bg-gray-100 text-gray-600", icon: null };
              const showBar = loan.loan_status === "Active" || loan.loan_status === "Paid";
              return (
                <Link
                  key={loan.loan_id}
                  href={`/dashboard/loans/${loan.loan_id}`}
                  className="block bg-white rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {loan.loan_type || "Loan"} &mdash; #{loan.loan_id}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{loan.loan_purpose || "—"}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${meta.chip}`}>
                      {meta.icon} {loan.loan_status}
                    </span>
                  </div>
                  {showBar && (
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>Repaid</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${progress >= 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <p className="text-gray-400">Principal</p>
                      <p className="font-semibold text-gray-900">&#8369;{principal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Balance</p>
                      <p className="font-semibold text-gray-900">&#8369;{balance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Interest</p>
                      <p className="text-gray-700">{(Number(loan.interest_rate) * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Term</p>
                      <p className="text-gray-700">{loan.loan_term_months} months</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-3 text-indigo-600 text-xs font-semibold">
                    View details <ChevronRight size={14} className="ml-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Loan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Purpose</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Principal</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Balance</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Rate</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Term</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((loan) => {
                  const principal = Number(loan.principal_amt) || 0;
                  const balance = Number(loan.current_balance) || 0;
                  const progress = principal > 0
                    ? Math.min(100, Math.round(((principal - balance) / principal) * 100))
                    : 0;
                  const meta = STATUS_META[loan.loan_status] ?? { chip: "bg-gray-100 text-gray-600", icon: null };
                  const showBar = loan.loan_status === "Active" || loan.loan_status === "Paid";
                  return (
                    <tr
                      key={loan.loan_id}
                      className="hover:bg-indigo-50/30 cursor-pointer transition-colors"
                      onClick={() => router.push(`/dashboard/loans/${loan.loan_id}`)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {loan.loan_type || "Loan"} <span className="text-gray-400 font-normal">#{loan.loan_id}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{loan.loan_purpose || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">&#8369;{principal.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-700">&#8369;{balance.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{(Number(loan.interest_rate) * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-center text-gray-600">{loan.loan_term_months}mo</td>
                      <td className="px-4 py-3">
                        {showBar ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${progress >= 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">{progress}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${meta.chip}`}>
                          {meta.icon} {loan.loan_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight size={16} className="text-gray-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>Showing {filtered.length} of {loans.length} loans</span>
              <span>Click a row to view details</span>
            </div>
          </div>

          {loans.filter((l) => l.loan_status === "Active").length === 0 && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                <TrendingDown size={20} className="text-indigo-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-900">No active loans</p>
                <p className="text-xs text-indigo-600 mt-0.5">Apply for a loan to get started with MyCreditFilipinas.</p>
              </div>
              <Link
                href="/dashboard/loans/apply"
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                Apply Now
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
