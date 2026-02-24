"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

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
          recentLoans: loanList.slice(0, 5),
          recentPayments: paymentList.slice(0, 5),
          recentUsers: userList.slice(0, 5),
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

  const summaryCards = [
    {
      label: "Total Disbursed",
      value: `₱${stats.totalDisbursed.toLocaleString()}`,
      icon: "💰",
      color: "from-ph-blue-500 to-ph-blue-700",
      sub: `${stats.activeLoans} active loans`,
    },
    {
      label: "Total Collected",
      value: `₱${stats.totalCollected.toLocaleString()}`,
      icon: "📥",
      color: "from-green-500 to-green-700",
      sub: `${stats.verifiedPayments} verified payments`,
    },
    {
      label: "Outstanding Balance",
      value: `₱${stats.totalOutstanding.toLocaleString()}`,
      icon: "📊",
      color: "from-ph-gold-500 to-ph-gold-700",
      sub: `across active & frozen loans`,
    },
    {
      label: "Revenue (Fees + Profit)",
      value: `₱${(stats.totalFees + stats.totalProfit).toLocaleString()}`,
      icon: "📈",
      color: "from-purple-500 to-purple-700",
      sub: `₱${stats.totalFees.toLocaleString()} fees · ₱${stats.totalProfit.toLocaleString()} profit`,
    },
  ];

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
      gradient: "from-ph-blue-500 to-ph-blue-700",
      detail: `${stats.activeUsers} active · ${stats.inactiveUsers} inactive`,
    },
    {
      label: "Total Loans",
      value: stats.totalLoans,
      icon: "📋",
      gradient: "from-ph-blue-400 to-ph-blue-600",
      detail: `${stats.pendingLoans} pending · ${stats.activeLoans} active`,
    },
    {
      label: "Frozen Loans",
      value: stats.frozenLoans,
      icon: "🧊",
      gradient: "from-cyan-400 to-cyan-600",
      detail: "Deactivated user loans",
    },
    {
      label: "Payments",
      value: stats.totalPayments,
      icon: "💳",
      gradient: "from-ph-gold-400 to-ph-gold-600",
      detail: `${stats.pendingPayments} pending verification`,
    },
    {
      label: "Staff Members",
      value: stats.totalStaff,
      icon: "🛡️",
      gradient: "from-purple-400 to-purple-600",
      detail: "Admins & approvers",
    },
    {
      label: "Pending Actions",
      value: stats.pendingLoans + stats.pendingPayments,
      icon: "⚡",
      gradient: "from-ph-red-400 to-ph-red-600",
      detail: `${stats.pendingLoans} loans · ${stats.pendingPayments} payments`,
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Admin Overview
          </h1>
          <p className="text-gray-500 text-sm">
            System-wide statistics at a glance
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/loans"
            className="px-4 py-2 bg-ph-blue-500 text-white text-sm font-medium rounded-xl hover:bg-ph-blue-600 transition-colors"
          >
            Manage Loans
          </Link>
          <Link
            href="/admin/payments"
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Manage Payments
          </Link>
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

      {/* Three column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Recent Loans */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              📋 Recent Loans
            </h3>
            <Link
              href="/admin/loans"
              className="text-xs text-ph-blue-500 hover:text-ph-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentLoans.map((l) => (
              <Link
                key={l.loan_id}
                href={`/admin/loans/${l.loan_id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {l.borrower_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₱{Number(l.principal_amt).toLocaleString()} · {l.loan_type}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
                    statusColors[l.loan_status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {l.loan_status}
                </span>
              </Link>
            ))}
            {stats.recentLoans.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No loans yet
              </p>
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
              href="/admin/payments"
              className="text-xs text-ph-blue-500 hover:text-ph-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentPayments.map((p) => (
              <div
                key={p.payment_id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {p.borrower_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₱{Number(p.amount_paid).toLocaleString()} · {p.payment_method}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
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
            ))}
            {stats.recentPayments.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No payments yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              👥 Recent Users
            </h3>
            <Link
              href="/admin/users"
              className="text-xs text-ph-blue-500 hover:text-ph-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentUsers.map((u) => (
              <Link
                key={u.user_id}
                href={`/admin/users/${u.user_id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-ph-blue-100 text-ph-blue-700 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0">
                    {u.first_name.charAt(0)}
                    {u.last_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {u.first_name} {u.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {u.email_address}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    u.is_inactive
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {u.is_inactive ? "Inactive" : "Active"}
                </span>
              </Link>
            ))}
            {stats.recentUsers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No users yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Management Links */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
          Quick Management
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              href: "/admin/users",
              label: "Users",
              icon: "👥",
              desc: "Manage borrower accounts",
              count: stats.totalUsers,
            },
            {
              href: "/admin/loans",
              label: "Loans",
              icon: "📋",
              desc: "Review & approve applications",
              count: stats.pendingLoans,
              badge: stats.pendingLoans > 0 ? `${stats.pendingLoans} pending` : undefined,
            },
            {
              href: "/admin/payments",
              label: "Payments",
              icon: "💳",
              desc: "Verify payment records",
              count: stats.pendingPayments,
              badge:
                stats.pendingPayments > 0
                  ? `${stats.pendingPayments} pending`
                  : undefined,
            },
            {
              href: "/admin/staff",
              label: "Staff",
              icon: "🛡️",
              desc: "Admin & approver accounts",
              count: stats.totalStaff,
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-ph-blue-300 hover:bg-ph-blue-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">
                  {item.label}
                </p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              {item.badge && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-ph-red-500 text-white text-[10px] font-bold rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
