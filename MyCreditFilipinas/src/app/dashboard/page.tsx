"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  CreditCard,
  CalendarClock,
  Wallet,
  FileText,
  User,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  Landmark,
  SendHorizonal,
  History,
  AlertCircle,
} from "lucide-react";

interface Loan {
  loan_id: number;
  loan_type: string;
  loan_purpose: string;
  principal_amt: number;
  current_balance: number;
  loan_status: string;
  amortization: number | null;
  interest_rate: number | null;
  release_frequency: string | null;
  term_due: string | null;
  date_released: string | null;
  loan_term_months: number;
  created_at: string;
}

interface Payment {
  payment_id: number;
  loan_id: number;
  amount_paid: number;
  payment_status: string;
  payment_method: string;
  payment_date: string;
}

interface UserInfo {
  id: number;
  name: string;
}

interface DashStats {
  totalLoans: number;
  activeLoans: number;
  frozenLoans: number;
  pendingLoans: number;
  paidLoans: number;
  deniedLoans: number;
  totalPayments: number;
  verifiedPayments: number;
  pendingPayments: number;
  rejectedPayments: number;
  totalBorrowed: number;
  totalBalance: number;
  totalPaid: number;
  nextDue: string | null;
  nextDueAmount: number | null;
  nextDueLoanId: number | null;
  repaymentProgress: number;
  loans: Loan[];
  recentPayments: Payment[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.user) return;
        setUser(data.user);
        const userId = data.user.id;

        const [loansRes, paymentsRes] = await Promise.all([
          fetch(`/api/loans?user_id=${userId}`),
          fetch(`/api/payments?user_id=${userId}`),
        ]);
        const loansData = await loansRes.json();
        const paymentsData = await paymentsRes.json();

        const loans: Loan[] = Array.isArray(loansData) ? loansData : [];
        const payments: Payment[] = Array.isArray(paymentsData)
          ? paymentsData
          : [];

        const activeLoans = loans.filter(
          (l) => l.loan_status === "Active" || l.loan_status === "Approved"
        );
        const verifiedPayments = payments.filter(
          (p) => p.payment_status === "Verified"
        );

        // Total principal across all disbursed loans (Active, Paid, Defaulted, Frozen)
        const disbursedLoans = loans.filter((l) =>
          ["Active", "Paid", "Defaulted", "Frozen"].includes(l.loan_status)
        );
        const totalBorrowed = disbursedLoans.reduce(
          (s, l) => s + (Number(l.principal_amt) || 0),
          0
        );
        const totalBalance = loans
          .filter((l) => ["Active", "Frozen"].includes(l.loan_status))
          .reduce((s, l) => s + (Number(l.current_balance) || 0), 0);
        const totalPaid = verifiedPayments.reduce(
          (s, p) => s + (Number(p.amount_paid) || 0),
          0
        );

        // Repayment progress
        const repaymentProgress =
          totalBorrowed > 0
            ? Math.min(100, Math.round((totalPaid / totalBorrowed) * 100))
            : 0;

        // Find next payment due date based on release frequency & date_released
        let nextDue: string | null = null;
        let nextDueAmount: number | null = null;
        let nextDueLoanId: number | null = null;
        const now = new Date();
        for (const loan of activeLoans) {
          if (loan.date_released) {
            const released = new Date(loan.date_released);
            const frequency = loan.release_frequency || "monthly";
            let nextPaymentDate: Date;

            if (frequency === "bi-monthly") {
              // Every 15 days from release date
              nextPaymentDate = new Date(released);
              nextPaymentDate.setDate(nextPaymentDate.getDate() + 15);
              while (nextPaymentDate <= now) {
                nextPaymentDate.setDate(nextPaymentDate.getDate() + 15);
              }
            } else {
              // Monthly: same day each month
              nextPaymentDate = new Date(released);
              nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
              while (nextPaymentDate <= now) {
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
              }
            }

            // Only consider if before the loan term ends
            const termEnd = loan.term_due ? new Date(loan.term_due) : null;
            if (!termEnd || nextPaymentDate <= termEnd) {
              if (!nextDue || nextPaymentDate < new Date(nextDue)) {
                nextDue = nextPaymentDate.toISOString();
                nextDueAmount = frequency === "bi-monthly" && loan.amortization
                  ? loan.amortization / 2
                  : loan.amortization;
                nextDueLoanId = loan.loan_id;
              }
            }
          }
        }

        setStats({
          totalLoans: loans.length,
          activeLoans: activeLoans.length,
          frozenLoans: loans.filter((l) => l.loan_status === "Frozen").length,
          pendingLoans: loans.filter((l) => l.loan_status === "Pending").length,
          paidLoans: loans.filter((l) => l.loan_status === "Paid").length,
          deniedLoans: loans.filter((l) => l.loan_status === "Denied").length,
          totalPayments: payments.length,
          verifiedPayments: verifiedPayments.length,
          pendingPayments: payments.filter(
            (p) => p.payment_status === "Pending"
          ).length,
          rejectedPayments: payments.filter(
            (p) => p.payment_status === "Rejected"
          ).length,
          totalBorrowed,
          totalBalance,
          totalPaid,
          nextDue,
          nextDueAmount,
          nextDueLoanId,
          repaymentProgress,
          loans,
          recentPayments: [...payments]
            .sort((a, b) => {
              const da = a.payment_date ? new Date(a.payment_date).getTime() : 0;
              const db = b.payment_date ? new Date(b.payment_date).getTime() : 0;
              return db - da;
            })
            .slice(0, 5),
        });
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  // ── Memoized upcoming-payments computation ────────────
  // Must stay ABOVE all early returns so hooks are always called in the same order.
  const { nextThree, daysUntil } = useMemo(() => {
    const loans = stats?.loans ?? [];
    const now2 = new Date();
    const upcoming: { date: Date; amount: number; loanId: number; loanType: string }[] = [];
    for (const loan of loans.filter(
      (l) => (l.loan_status === "Active" || l.loan_status === "Approved") && l.date_released
    )) {
      const released = new Date(loan.date_released!);
      const frequency = loan.release_frequency || "monthly";
      let nextPaymentDate = new Date(released);
      if (frequency === "bi-monthly") {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 15);
        while (nextPaymentDate <= now2) nextPaymentDate.setDate(nextPaymentDate.getDate() + 15);
      } else {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        while (nextPaymentDate <= now2) nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
      const termEnd = loan.term_due ? new Date(loan.term_due) : null;
      if (!termEnd || nextPaymentDate <= termEnd) {
        upcoming.push({
          date: nextPaymentDate,
          amount: frequency === "bi-monthly" && loan.amortization
            ? loan.amortization / 2
            : (loan.amortization || 0),
          loanId: loan.loan_id,
          loanType: loan.loan_type || "Loan",
        });
      }
    }
    upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());
    return {
      nextThree: upcoming.slice(0, 3),
      daysUntil: (d: Date) =>
        Math.ceil((d.getTime() - now2.getTime()) / 86400000),
    };
  }, [stats?.loans]);

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
        <p className="text-gray-700 font-semibold text-lg">Failed to load dashboard</p>
        <p className="text-gray-500 text-sm">Could not retrieve your account data. Please check your connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

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
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <p className="text-slate-400 text-sm font-medium">{greeting},</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name || "User"}</h1>
        <p className="text-slate-500 text-xs mt-0.5 mb-5">
          Here&apos;s your financial snapshot
        </p>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-slate-400 text-xs mb-1">Outstanding</p>
            <p className="text-xl font-bold">
              &#8369;{stats.totalBalance.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Total Paid</p>
            <p className="text-xl font-bold">
              &#8369;{stats.totalPaid.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Next Payment</p>
            <p className="text-xl font-bold">
              {stats.nextDue
                ? new Date(stats.nextDue).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                  })
                : "None"}
            </p>
            {stats.nextDueAmount && (
              <p className="text-slate-400 text-[11px] mt-0.5">
                &#8369;{Number(stats.nextDueAmount).toLocaleString()} &middot;
                Loan #{stats.nextDueLoanId}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Chips ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Active Loans",
            value: stats.activeLoans,
            icon: <FileText size={16} className="text-indigo-500" />,
            color: "text-indigo-600",
          },
          {
            label: "Pending",
            value: stats.pendingLoans,
            icon: <Clock size={16} className="text-amber-500" />,
            color: "text-amber-600",
          },
          {
            label: "Paid Off",
            value: stats.paidLoans,
            icon: <CheckCircle size={16} className="text-emerald-500" />,
            color: "text-emerald-600",
          },
          {
            label: "Payments Made",
            value: stats.totalPayments,
            icon: <CreditCard size={16} className="text-sky-500" />,
            color: "text-sky-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              {s.icon}
            </div>
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Repayment Progress ───────────────────────────── */}
      {stats.totalBorrowed > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Repayment Progress
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                &#8369;{stats.totalPaid.toLocaleString()} paid of &#8369;
                {stats.totalBorrowed.toLocaleString()} total
              </p>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.repaymentProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                stats.repaymentProgress >= 100
                  ? "bg-emerald-500"
                  : stats.repaymentProgress >= 50
                  ? "bg-indigo-500"
                  : "bg-amber-500"
              }`}
              style={{ width: `${stats.repaymentProgress}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {stats.activeLoans > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                {stats.activeLoans} active
              </span>
            )}
            {stats.pendingLoans > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                {stats.pendingLoans} pending
              </span>
            )}
            {stats.paidLoans > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {stats.paidLoans} paid off
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Upcoming Payment Schedule (NEW) ─────────────── */}
      {nextThree.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock size={16} className="text-indigo-500" />
              <p className="font-semibold text-gray-900 text-sm">
                Upcoming Payments
              </p>
            </div>
            <Link
              href="/dashboard/payments/submit"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              Pay now <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {nextThree.map((p, i) => {
              const days = daysUntil(p.date);
              const overdue = days < 0;
              const urgent = !overdue && days <= 7;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-5 py-3.5 ${
                    overdue ? "bg-rose-50/50" : urgent ? "bg-amber-50/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        overdue
                          ? "bg-rose-100 text-rose-700"
                          : urgent
                          ? "bg-amber-100 text-amber-700"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      {p.date.getDate()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Loan #{p.loanId} &mdash; {p.loanType}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.date.toLocaleDateString("en-PH", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {overdue ? (
                          <span className="ml-2 text-rose-600 font-medium">
                            Overdue!
                          </span>
                        ) : urgent ? (
                          <span className="ml-2 text-amber-600 font-medium">
                            {days === 0
                              ? "Due today!"
                              : `${days} day${days !== 1 ? "s" : ""} away`}
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    &#8369;{p.amount.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Activity: Loans + Payments ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Loans */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" />
              <p className="font-semibold text-gray-900 text-sm">My Loans</p>
            </div>
            <Link
              href="/dashboard/loans"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.loans.length === 0 ? (
              <div className="text-center py-10">
                <FileText size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm mb-3">No loans yet</p>
                <Link
                  href="/dashboard/loans/apply"
                  className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                >
                  Apply for a Loan
                </Link>
              </div>
            ) : (
              stats.loans.slice(0, 4).map((l) => {
                const principal = Number(l.principal_amt) || 0;
                const balance = Number(l.current_balance) || 0;
                const progress =
                  principal > 0
                    ? Math.min(
                        100,
                        Math.round(((principal - balance) / principal) * 100)
                      )
                    : 0;
                return (
                  <Link
                    key={l.loan_id}
                    href={`/dashboard/loans/${l.loan_id}`}
                    className="block px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Loan #{l.loan_id} &mdash; {l.loan_type || "Loan"}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ml-2 ${
                          statusStyle[l.loan_status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {l.loan_status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span>&#8369;{principal.toLocaleString()} principal</span>
                      <span>&#8369;{balance.toLocaleString()} remaining</span>
                    </div>
                    {(l.loan_status === "Active" ||
                      l.loan_status === "Paid") && (
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${
                            progress >= 100 ? "bg-emerald-500" : "bg-indigo-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-indigo-500" />
              <p className="font-semibold text-gray-900 text-sm">
                Recent Payments
              </p>
            </div>
            <Link
              href="/dashboard/payments"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentPayments.length === 0 ? (
              <div className="text-center py-10">
                <CreditCard
                  size={28}
                  className="text-gray-200 mx-auto mb-2"
                />
                <p className="text-gray-400 text-sm mb-3">No payments yet</p>
                {stats.activeLoans > 0 && (
                  <Link
                    href="/dashboard/payments/submit"
                    className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                  >
                    Make a Payment
                  </Link>
                )}
              </div>
            ) : (
              stats.recentPayments.map((p) => {
                const isVerified = p.payment_status === "Verified";
                const isPending = p.payment_status === "Pending";
                return (
                  <div
                    key={p.payment_id}
                    className="flex items-center gap-3 px-5 py-3.5"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isVerified
                          ? "bg-emerald-100"
                          : isPending
                          ? "bg-amber-100"
                          : "bg-rose-100"
                      }`}
                    >
                      {isVerified ? (
                        <CheckCircle
                          size={15}
                          className="text-emerald-600"
                        />
                      ) : isPending ? (
                        <Clock size={15} className="text-amber-600" />
                      ) : (
                        <XCircle size={15} className="text-rose-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        &#8369;{Number(p.amount_paid).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.payment_method} &middot; Loan #{p.loan_id} &middot;{" "}
                        {p.payment_date
                          ? new Date(p.payment_date).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        isVerified
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : isPending
                          ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                          : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                      }`}
                    >
                      {p.payment_status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            href: "/dashboard/loans/apply",
            label: "Apply for Loan",
            sub: "New application",
            icon: <Landmark size={20} className="text-indigo-500" />,
            bg: "bg-indigo-50",
            hover: "hover:border-indigo-300",
            badge: undefined as number | undefined,
          },
          {
            href: "/dashboard/payments/submit",
            label: "Make Payment",
            sub: "Submit for active loan",
            icon: <SendHorizonal size={20} className="text-emerald-500" />,
            bg: "bg-emerald-50",
            hover: "hover:border-emerald-300",
            badge:
              stats.activeLoans > 0 ? stats.activeLoans : undefined,
          },
          {
            href: "/dashboard/loans",
            label: "Loan History",
            sub: `${stats.totalLoans} total`,
            icon: <FileText size={20} className="text-amber-500" />,
            bg: "bg-amber-50",
            hover: "hover:border-amber-300",
            badge: undefined as number | undefined,
          },
          {
            href: "/dashboard/profile",
            label: "My Profile",
            sub: "Edit your information",
            icon: <User size={20} className="text-rose-500" />,
            bg: "bg-rose-50",
            hover: "hover:border-rose-300",
            badge: undefined as number | undefined,
          },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`relative flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 ${a.hover} hover:shadow-sm transition-all duration-200`}
          >
            <div
              className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center flex-shrink-0`}
            >
              {a.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {a.label}
              </p>
              <p className="text-xs text-gray-500 truncate">{a.sub}</p>
            </div>
            {a.badge != null && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {a.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* ── Pending Application Notice (NEW) ─────────────── */}
      {stats.pendingLoans > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Application Under Review
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              You have {stats.pendingLoans} loan application
              {stats.pendingLoans !== 1 ? "s" : ""} pending approval. We will
              notify you once a decision is made.
            </p>
          </div>
          <Link
            href="/dashboard/loans"
            className="flex-shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
          >
            View <ChevronRight size={12} />
          </Link>
        </div>
      )}

      {/* ── Wallet Summary (NEW) ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-900 mb-4">
          Account Summary
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Borrowed",
              amount: stats.totalBorrowed,
              sub: `${stats.totalLoans} loan${stats.totalLoans !== 1 ? "s" : ""}`,
              icon: <Wallet size={15} className="text-gray-400" />,
            },
            {
              label: "Amount Repaid",
              amount: stats.totalPaid,
              sub: `${stats.verifiedPayments} verified`,
              icon: <CheckCircle size={15} className="text-gray-400" />,
            },
            {
              label: "Still Owed",
              amount: stats.totalBalance,
              sub: "remaining balance",
              icon: <TrendingUp size={15} className="text-gray-400" />,
            },
          ].map((m) => (
            <div key={m.label} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                {m.icon}
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">
                  &#8369;{m.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{m.label}</p>
                <p className="text-[10px] text-gray-400">{m.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Frozen / Denied Notice (NEW) ─────────────────── */}
      {stats.frozenLoans > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-sky-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-sky-800">
              Frozen Account Notice
            </p>
            <p className="text-xs text-sky-700 mt-0.5">
              {stats.frozenLoans} of your loan
              {stats.frozenLoans !== 1 ? "s are" : " is"} currently frozen.
              Please contact support to resolve this.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
