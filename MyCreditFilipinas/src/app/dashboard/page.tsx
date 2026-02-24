"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-blue-100 text-blue-800",
  Active: "bg-green-100 text-green-800",
  Paid: "bg-gray-100 text-gray-800",
  Defaulted: "bg-red-100 text-red-800",
  Denied: "bg-red-100 text-red-800",
  Frozen: "bg-cyan-100 text-cyan-800",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

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
          recentPayments: payments.slice(0, 5),
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-ph-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const summaryCards = [
    {
      label: "Total Borrowed",
      value: `₱${stats.totalBorrowed.toLocaleString()}`,
      icon: "💰",
      color: "from-ph-blue-500 to-ph-blue-700",
      sub: `${stats.totalLoans} loan${stats.totalLoans !== 1 ? "s" : ""} total`,
    },
    {
      label: "Total Paid",
      value: `₱${stats.totalPaid.toLocaleString()}`,
      icon: "📥",
      color: "from-green-500 to-green-700",
      sub: `${stats.verifiedPayments} verified payment${stats.verifiedPayments !== 1 ? "s" : ""}`,
    },
    {
      label: "Outstanding Balance",
      value: `₱${stats.totalBalance.toLocaleString()}`,
      icon: "📊",
      color: "from-ph-gold-500 to-ph-gold-700",
      sub: `across ${stats.activeLoans + stats.frozenLoans} active loan${stats.activeLoans + stats.frozenLoans !== 1 ? "s" : ""}`,
    },
    {
      label: "Next Payment Due",
      value: stats.nextDue
        ? new Date(stats.nextDue).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "None",
      icon: "📅",
      color: "from-ph-red-500 to-ph-red-700",
      sub: stats.nextDueAmount
        ? `₱${Number(stats.nextDueAmount).toLocaleString()} · Loan #${stats.nextDueLoanId}`
        : "No upcoming dues",
    },
  ];

  const statCards = [
    {
      label: "Active Loans",
      value: stats.activeLoans,
      icon: "📋",
      gradient: "from-green-400 to-green-600",
      detail: stats.pendingLoans > 0 ? `${stats.pendingLoans} pending approval` : "Currently active",
    },
    {
      label: "Frozen Loans",
      value: stats.frozenLoans,
      icon: "🧊",
      gradient: "from-cyan-400 to-cyan-600",
      detail: "Account-related freeze",
    },
    {
      label: "Paid Off",
      value: stats.paidLoans,
      icon: "🎉",
      gradient: "from-purple-400 to-purple-600",
      detail: "Fully settled loans",
    },
    {
      label: "Payments Made",
      value: stats.totalPayments,
      icon: "💳",
      gradient: "from-ph-blue-400 to-ph-blue-600",
      detail: `${stats.pendingPayments} pending verification`,
    },
    {
      label: "Pending Loans",
      value: stats.pendingLoans,
      icon: "⏳",
      gradient: "from-yellow-400 to-yellow-600",
      detail: "Awaiting review",
    },
    {
      label: "Repayment",
      value: `${stats.repaymentProgress}%`,
      icon: "📈",
      gradient: "from-ph-red-400 to-ph-red-600",
      detail: "Overall progress",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Greeting */}
      <div className="bg-gradient-to-r from-ph-blue-600 to-ph-blue-800 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-1/2 w-60 h-60 bg-white/5 rounded-full translate-y-40 -translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-ph-blue-200 text-sm font-medium">{greeting},</p>
          <h1 className="text-2xl font-extrabold mt-0.5">
            {user?.name || "User"}
          </h1>
          <p className="text-ph-blue-200 text-sm mt-1">
            Here&apos;s your account overview
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((c) => (
          <div
            key={c.label}
            className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
            <div className="relative z-10">
              <span className="text-2xl">{c.icon}</span>
              <p className="text-white/80 text-xs font-medium mt-2 uppercase tracking-wide">
                {c.label}
              </p>
              <p className="text-2xl font-extrabold mt-1">{c.value}</p>
              <p className="text-white/70 text-xs mt-1">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {statCards.map((c) => (
          <div
            key={c.label}
            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{c.icon}</span>
              <span
                className={`w-2 h-2 rounded-full bg-gradient-to-br ${c.gradient}`}
              />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {c.label}
            </p>
            <p className="text-xl font-extrabold text-gray-900 mt-0.5">
              {c.value}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 leading-tight">
              {c.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Repayment Progress */}
      {stats.totalBorrowed > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              📈 Overall Repayment Progress
            </h3>
            <span className="text-sm font-extrabold text-gray-900">
              {stats.repaymentProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-700 ${
                stats.repaymentProgress >= 100
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : stats.repaymentProgress >= 50
                  ? "bg-gradient-to-r from-ph-blue-400 to-ph-blue-600"
                  : "bg-gradient-to-r from-ph-gold-400 to-ph-gold-600"
              }`}
              style={{ width: `${stats.repaymentProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>₱{stats.totalPaid.toLocaleString()} paid</span>
            <span>₱{stats.totalBorrowed.toLocaleString()} total</span>
          </div>
        </div>
      )}

      {/* Two Column: Loans + Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* My Loans */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              📋 My Loans
            </h3>
            <Link
              href="/dashboard/loans"
              className="text-xs text-ph-blue-500 hover:text-ph-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.loans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-sm text-gray-500">No loans yet</p>
                <Link
                  href="/dashboard/loans/apply"
                  className="inline-block mt-3 px-4 py-2 bg-ph-blue-500 text-white text-xs font-medium rounded-lg hover:bg-ph-blue-600"
                >
                  Apply for a Loan
                </Link>
              </div>
            ) : (
              stats.loans.slice(0, 5).map((l) => {
                const principal = Number(l.principal_amt) || 0;
                const balance = Number(l.current_balance) || 0;
                const loanProgress =
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
                    className="block px-5 py-3 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-ph-blue-700 truncate">
                        Loan #{l.loan_id} — {l.loan_type || "Loan"}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ml-2 ${
                          statusColors[l.loan_status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {l.loan_status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>₱{principal.toLocaleString()} principal</span>
                      <span>₱{balance.toLocaleString()} remaining</span>
                    </div>
                    {(l.loan_status === "Active" ||
                      l.loan_status === "Paid") && (
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            loanProgress >= 100
                              ? "bg-green-500"
                              : "bg-ph-blue-500"
                          }`}
                          style={{ width: `${loanProgress}%` }}
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              💳 Recent Payments
            </h3>
            <Link
              href="/dashboard/payments"
              className="text-xs text-ph-blue-500 hover:text-ph-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">💳</p>
                <p className="text-sm text-gray-500">No payments yet</p>
                {stats.activeLoans > 0 && (
                  <Link
                    href="/dashboard/payments/submit"
                    className="inline-block mt-3 px-4 py-2 bg-ph-blue-500 text-white text-xs font-medium rounded-lg hover:bg-ph-blue-600"
                  >
                    Make a Payment
                  </Link>
                )}
              </div>
            ) : (
              stats.recentPayments.map((p) => (
                <div
                  key={p.payment_id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                        p.payment_status === "Verified"
                          ? "bg-green-100 text-green-700"
                          : p.payment_status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.payment_status === "Verified"
                        ? "✓"
                        : p.payment_status === "Pending"
                        ? "⏳"
                        : "✗"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        ₱{Number(p.amount_paid).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.payment_method} · Loan #{p.loan_id} ·{" "}
                        {p.payment_date
                          ? new Date(p.payment_date).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ml-2 ${
                      p.payment_status === "Verified"
                        ? "bg-green-100 text-green-800"
                        : p.payment_status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
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

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/dashboard/loans/apply"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-ph-red-300 hover:bg-ph-red-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative"
          >
            <span className="text-2xl">🏦</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">Apply for Loan</p>
              <p className="text-xs text-gray-500">New application</p>
            </div>
          </Link>
          <Link
            href="/dashboard/payments/submit"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-ph-blue-300 hover:bg-ph-blue-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative"
          >
            <span className="text-2xl">💸</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">Make Payment</p>
              <p className="text-xs text-gray-500">Submit for active loan</p>
            </div>
            {stats.activeLoans > 0 && (
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-ph-blue-500 text-white text-[10px] font-bold rounded-full">
                {stats.activeLoans} active
              </span>
            )}
          </Link>
          <Link
            href="/dashboard/loans"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-ph-gold-300 hover:bg-ph-gold-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative"
          >
            <span className="text-2xl">📋</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">Loan History</p>
              <p className="text-xs text-gray-500">View all loans</p>
            </div>
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="text-2xl">👤</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">My Profile</p>
              <p className="text-xs text-gray-500">Edit your information</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
