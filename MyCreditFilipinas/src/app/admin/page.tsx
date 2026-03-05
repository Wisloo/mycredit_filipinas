"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Snowflake,
  AlertCircle,
  Banknote,
  BarChart3,
  UserPlus,
} from "lucide-react";

interface Loan {
  loan_id: number;
  borrower_name: string;
  loan_type: string;
  principal_amt: number;
  current_balance: number;
  loan_status: string;
  interest_rate: number;
  fees: number;
  profit: number;
  created_at: string;
}

interface Payment {
  payment_id: number;
  loan_id: number;
  amount_paid: number;
  payment_status: string;
  payment_method: string;
  borrower_name: string;
  payment_date: string;
  created_at: string;
}

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email_address: string;
  is_inactive: number;
  created_at: string;
}

interface OverviewStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalLoans: number;
  pendingLoans: number;
  activeLoans: number;
  frozenLoans: number;
  paidLoans: number;
  deniedLoans: number;
  defaultedLoans: number;
  totalPayments: number;
  pendingPayments: number;
  verifiedPayments: number;
  totalStaff: number;
  totalDisbursed: number;
  totalCollected: number;
  totalOutstanding: number;
  totalProfit: number;
  totalFees: number;
  recentLoans: Loan[];
  recentPayments: Payment[];
  recentUsers: User[];
  monthlyCollections: { month: string; amount: number }[];
}

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/loans").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
    ])
      .then(([users, loans, payments, staff]) => {
        const userList: User[] = Array.isArray(users) ? users : [];
        const loanList: Loan[] = Array.isArray(loans) ? loans : [];
        const paymentList: Payment[] = Array.isArray(payments) ? payments : [];
        const staffList = Array.isArray(staff) ? staff : [];

        const verifiedPayments = paymentList.filter(
          (p) => p.payment_status === "Verified"
        );

        setStats({
          totalUsers: userList.length,
          activeUsers: userList.filter((u) => !u.is_inactive).length,
          inactiveUsers: userList.filter((u) => u.is_inactive).length,
          totalLoans: loanList.length,
          pendingLoans: loanList.filter((l) => l.loan_status === "Pending")
            .length,
          activeLoans: loanList.filter(
            (l) =>
              l.loan_status === "Active" || l.loan_status === "Approved"
          ).length,
          frozenLoans: loanList.filter((l) => l.loan_status === "Frozen")
            .length,
          paidLoans: loanList.filter((l) => l.loan_status === "Paid").length,
          deniedLoans: loanList.filter((l) => l.loan_status === "Denied")
            .length,
          defaultedLoans: loanList.filter((l) => l.loan_status === "Defaulted")
            .length,
          totalPayments: paymentList.length,
          pendingPayments: paymentList.filter(
            (p) => p.payment_status === "Pending"
          ).length,
          verifiedPayments: verifiedPayments.length,
          totalStaff: staffList.length,
          totalDisbursed: loanList
            .filter((l) =>
              ["Active", "Paid", "Defaulted", "Frozen"].includes(
                l.loan_status
              )
            )
            .reduce((s, l) => s + (Number(l.principal_amt) || 0), 0),
          totalCollected: verifiedPayments.reduce(
            (s, p) => s + (Number(p.amount_paid) || 0),
            0
          ),
          totalOutstanding: loanList
            .filter((l) =>
              ["Active", "Frozen"].includes(l.loan_status)
            )
            .reduce((s, l) => s + (Number(l.current_balance) || 0), 0),
          totalProfit: loanList
            .filter((l) =>
              ["Active", "Paid", "Defaulted", "Frozen"].includes(
                l.loan_status
              )
            )
            .reduce((s, l) => s + (Number(l.profit) || 0), 0),
          totalFees: loanList
            .filter((l) =>
              ["Active", "Paid", "Defaulted", "Frozen"].includes(
                l.loan_status
              )
            )
            .reduce((s, l) => s + (Number(l.fees) || 0), 0),
          recentLoans: [...loanList]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5),
          recentPayments: [...paymentList]
            .sort((a, b) => {
              const da = a.payment_date ? new Date(a.payment_date).getTime() : new Date(a.created_at).getTime();
              const db = b.payment_date ? new Date(b.payment_date).getTime() : new Date(b.created_at).getTime();
              return db - da;
            })
            .slice(0, 5),
          recentUsers: [...userList]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5),
          monthlyCollections: (() => {
            const now = new Date();
            return Array.from({ length: 6 }, (_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
              const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
              const amount = verifiedPayments
                .filter((p) => {
                  const pd = new Date(p.payment_date || p.created_at);
                  return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth();
                })
                .reduce((s, p) => s + (Number(p.amount_paid) || 0), 0);
              return { month: label, amount };
            });
          })(),
        });
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-ph-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (fetchError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <AlertCircle size={36} className="text-rose-400" />
        <p className="text-gray-700 font-semibold text-lg">Failed to load admin overview</p>
        <p className="text-gray-500 text-sm">Could not retrieve system data. Please refresh the page and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const statusStyle: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    Approved: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
    Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    Frozen: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    Defaulted: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    Paid: "bg-gray-100 text-gray-600",
    Denied: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-500 text-sm">
            System-wide statistics at a glance
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/loans"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Manage Loans
          </Link>
          <Link
            href="/admin/payments"
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Manage Payments
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Disbursed */}
        <div className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-indigo-500 p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <Banknote size={18} className="text-indigo-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Disbursed</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              &#8369;{stats.totalDisbursed.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {stats.activeLoans} active loan{stats.activeLoans !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {/* Total Collected */}
        <div className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-emerald-500 p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={18} className="text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Collected</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              &#8369;{stats.totalCollected.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {stats.verifiedPayments} verified
            </p>
          </div>
        </div>
        {/* Outstanding */}
        <div className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-amber-500 p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Outstanding</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              &#8369;{stats.totalOutstanding.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">active &amp; frozen loans</p>
          </div>
        </div>
        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-purple-500 p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <BarChart3 size={18} className="text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              &#8369;{(stats.totalFees + stats.totalProfit).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              &#8369;{stats.totalFees.toLocaleString()} fees &middot; &#8369;{stats.totalProfit.toLocaleString()} profit
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat Chips ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Total Users",
            value: stats.totalUsers,
            icon: <Users size={15} className="text-indigo-500" />,
            color: "text-indigo-600",
          },
          {
            label: "Total Loans",
            value: stats.totalLoans,
            icon: <FileText size={15} className="text-blue-500" />,
            color: "text-blue-600",
          },
          {
            label: "Frozen Loans",
            value: stats.frozenLoans,
            icon: <Snowflake size={15} className="text-sky-500" />,
            color: "text-sky-600",
          },
          {
            label: "Payments",
            value: stats.totalPayments,
            icon: <CreditCard size={15} className="text-emerald-500" />,
            color: "text-emerald-600",
          },
          {
            label: "Staff",
            value: stats.totalStaff,
            icon: <ShieldCheck size={15} className="text-purple-500" />,
            color: "text-purple-600",
          },
          {
            label: "Pending Actions",
            value: stats.pendingLoans + stats.pendingPayments,
            icon: <AlertCircle size={15} className="text-rose-500" />,
            color: "text-rose-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              {s.icon}
            </div>
            <div>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-500 leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Attention strip ────────────────────────────── */}
      {(stats.pendingLoans > 0 ||
        stats.pendingPayments > 0 ||
        stats.frozenLoans > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex flex-wrap gap-3 items-center">
          <AlertTriangle size={16} className="text-amber-600" />
          <span className="text-amber-800 text-sm font-semibold">
            Needs Attention
          </span>
          {stats.pendingLoans > 0 && (
            <Link
              href="/admin/loans"
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-sm text-amber-800 hover:bg-amber-100 transition-colors font-medium"
            >
              <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                {stats.pendingLoans}
              </span>
              Pending Loans
            </Link>
          )}
          {stats.pendingPayments > 0 && (
            <Link
              href="/admin/payments"
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-sm text-amber-800 hover:bg-amber-100 transition-colors font-medium"
            >
              <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                {stats.pendingPayments}
              </span>
              Pending Payments
            </Link>
          )}
          {stats.frozenLoans > 0 && (
            <Link
              href="/admin/loans"
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-sm text-amber-800 hover:bg-amber-100 transition-colors font-medium"
            >
              <span className="w-5 h-5 bg-sky-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                {stats.frozenLoans}
              </span>
              Frozen Loans
            </Link>
          )}
        </div>
      )}

      {/* ── Charts Row ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Collections Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">Monthly Collections</p>
            <span className="text-xs text-gray-400">Last 6 months &bull; verified only</span>
          </div>
          {stats.monthlyCollections.every((m) => m.amount === 0) ? (
            <div className="flex items-center justify-center h-28 text-gray-400 text-xs">
              No collections recorded yet
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2" style={{ height: 96 }}>
                {(() => {
                  const max = Math.max(...stats.monthlyCollections.map((m) => m.amount), 1);
                  return stats.monthlyCollections.map((m) => {
                    const h = Math.max((m.amount / max) * 88, 3);
                    return (
                      <div
                        key={m.month}
                        className="flex-1 flex flex-col items-center justify-end gap-1 group relative"
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10 transition-opacity">
                          &#8369;{m.amount.toLocaleString()}
                        </span>
                        <div
                          className="w-full bg-indigo-400 hover:bg-indigo-500 rounded-t-md transition-all duration-200 cursor-default"
                          style={{ height: h }}
                        />
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="flex gap-2 mt-1.5">
                {stats.monthlyCollections.map((m) => (
                  <div key={m.month} className="flex-1 text-center">
                    <p className="text-[9px] text-gray-400 leading-none">{m.month}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Loan Status Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">Loan Status Distribution</p>
            <span className="text-xs text-gray-400">{stats.totalLoans} total</span>
          </div>
          {stats.totalLoans === 0 ? (
            <div className="flex items-center justify-center h-28 text-gray-400 text-xs">
              No loans recorded yet
            </div>
          ) : (
            <div className="space-y-3">
              {([
                { label: "Active / Approved", count: stats.activeLoans, color: "bg-emerald-400" },
                { label: "Pending Review",    count: stats.pendingLoans, color: "bg-amber-400" },
                { label: "Paid Off",          count: stats.paidLoans,    color: "bg-indigo-400" },
                { label: "Denied",            count: stats.deniedLoans,  color: "bg-rose-400" },
                { label: "Defaulted",         count: stats.defaultedLoans, color: "bg-gray-400" },
                { label: "Frozen",            count: stats.frozenLoans,  color: "bg-sky-400" },
              ] as const).map((row) => {
                const pct = stats.totalLoans > 0
                  ? Math.round((row.count / stats.totalLoans) * 100)
                  : 0;
                return (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{row.label}</span>
                      <span className="font-semibold text-gray-900">
                        {row.count}
                        <span className="text-gray-400 font-normal ml-1">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${row.color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Activity ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Loans */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" />
              <p className="font-semibold text-gray-900 text-sm">Recent Loans</p>
            </div>
            <Link
              href="/admin/loans"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentLoans.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No loans yet
              </p>
            ) : (
              stats.recentLoans.map((l) => (
                <Link
                  key={l.loan_id}
                  href={`/admin/loans/${l.loan_id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {l.borrower_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      &#8369;{Number(l.principal_amt).toLocaleString()} &middot;{" "}
                      {l.loan_type}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ml-3 ${
                      statusStyle[l.loan_status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {l.loan_status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-emerald-500" />
              <p className="font-semibold text-gray-900 text-sm">
                Recent Payments
              </p>
            </div>
            <Link
              href="/admin/payments"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentPayments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No payments yet
              </p>
            ) : (
              stats.recentPayments.map((p) => (
                <div
                  key={p.payment_id}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        p.payment_status === "Verified"
                          ? "bg-emerald-100"
                          : p.payment_status === "Pending"
                          ? "bg-amber-100"
                          : "bg-rose-100"
                      }`}
                    >
                      {p.payment_status === "Verified" ? (
                        <CheckCircle size={15} className="text-emerald-600" />
                      ) : p.payment_status === "Pending" ? (
                        <Clock size={15} className="text-amber-600" />
                      ) : (
                        <XCircle size={15} className="text-rose-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {p.borrower_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        &#8369;{Number(p.amount_paid).toLocaleString()} &middot;{" "}
                        {p.payment_method}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ml-3 ${
                      p.payment_status === "Verified"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : p.payment_status === "Pending"
                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                        : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                    }`}
                  >
                    {p.payment_status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Portfolio Metrics */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            Portfolio Metrics
          </p>
          <div className="space-y-3">
            {[
              { label: "Active Loans", current: stats.activeLoans, total: stats.totalLoans },
              { label: "Paid Off", current: stats.paidLoans, total: stats.totalLoans },
              { label: "Pending", current: stats.pendingLoans, total: stats.totalLoans },
              { label: "Defaulted / Frozen", current: stats.defaultedLoans + stats.frozenLoans, total: stats.totalLoans },
            ].map((m) => {
              const pct = stats.totalLoans > 0 ? Math.round((m.current / stats.totalLoans) * 100) : 0;
              return (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{m.label}</span>
                    <span className="font-medium text-gray-900">
                      {m.current}
                      <span className="text-gray-400 ml-1">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-indigo-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Users (NEW) */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="text-indigo-500" />
              <p className="font-semibold text-gray-900 text-sm">Recent Users</p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No users yet
              </p>
            ) : (
              stats.recentUsers.map((u) => (
                <Link
                  key={u.user_id}
                  href={`/admin/users/${u.user_id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0">
                    {u.first_name.charAt(0)}{u.last_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {u.first_name} {u.last_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {u.email_address}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      u.is_inactive
                        ? "bg-rose-50 text-rose-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {u.is_inactive ? "Inactive" : "Active"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Management */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            Quick Management
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                href: "/admin/users",
                label: "Users",
                desc: `${stats.totalUsers} total`,
                icon: <Users size={16} className="text-indigo-500" />,
                bg: "bg-indigo-50",
                badge: undefined as string | undefined,
              },
              {
                href: "/admin/loans",
                label: "Loans",
                desc: `${stats.totalLoans} total`,
                icon: <FileText size={16} className="text-amber-500" />,
                bg: "bg-amber-50",
                badge:
                  stats.pendingLoans > 0
                    ? `${stats.pendingLoans}`
                    : undefined,
              },
              {
                href: "/admin/payments",
                label: "Payments",
                desc: `${stats.totalPayments} total`,
                icon: <CreditCard size={16} className="text-emerald-500" />,
                bg: "bg-emerald-50",
                badge:
                  stats.pendingPayments > 0
                    ? `${stats.pendingPayments}`
                    : undefined,
              },
              {
                href: "/admin/staff",
                label: "Staff",
                desc: `${stats.totalStaff} members`,
                icon: <ShieldCheck size={16} className="text-purple-500" />,
                bg: "bg-purple-50",
                badge: undefined as string | undefined,
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}
                >
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                {item.badge && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
