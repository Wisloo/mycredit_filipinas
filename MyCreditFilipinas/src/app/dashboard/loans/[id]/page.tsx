"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

/* ── Types ── */
interface Schedule {
  schedule_id: number;
  due_date: string;
  scheduled_amount: number;
  paid_amount: number | null;
  status: string;
}
interface Payment {
  payment_id: number;
  payment_date: string | null;
  amount_paid: number;
  payment_method: string | null;
  payment_status: string;
  transaction_id: string | null;
}
interface Release {
  release_id: number;
  release_date: string;
  amount_released: number;
  reference_no: string | null;
}
interface Rejection {
  date_rejected: string;
  rejected_reason: string;
}
interface LoanDetail {
  loan_id: number;
  loan_type: string;
  loan_purpose: string;
  principal_amt: number;
  term_months: number;
  amortization: number;
  interest_rate: number;
  current_balance: number;
  loan_status: string;
  release_frequency: string | null;
  fees: number | null;
  date_released: string | null;
  term_due: string | null;
  created_at: string;
  decision_date: string | null;
  remarks: string | null;
  processed_by_name: string | null;
  schedules: Schedule[];
  payments: Payment[];
  releases: Release[];
  rejection: Rejection | null;
}

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-blue-100 text-blue-700",
  Active: "bg-green-100 text-green-700",
  Paid: "bg-emerald-100 text-emerald-700",
  Denied: "bg-red-100 text-red-700",
  Defaulted: "bg-gray-100 text-gray-700",
  Frozen: "bg-cyan-100 text-cyan-700",
};

const scheduleStatusColors: Record<string, string> = {
  Unpaid: "bg-amber-100 text-amber-700",
  Partial: "bg-blue-100 text-blue-700",
  Paid: "bg-green-100 text-green-700",
  Overdue: "bg-red-100 text-red-700",
};

const paymentStatusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Verified: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50/80 rounded-xl p-4">
      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</p>
      <p className="text-gray-900 font-semibold text-sm">{value}</p>
    </div>
  );
}

export default function UserLoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLoan = useCallback(async () => {
    try {
      const res = await fetch(`/api/loans/${params.id}`);
      if (!res.ok) throw new Error();
      setLoan(await res.json());
    } catch {
      setLoan(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchLoan();
  }, [fetchLoan]);

  if (loading) {
    return (
      <div className="text-gray-500 py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ph-blue-500 mx-auto mb-3" />
        Loading loan details...
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-600 font-medium">Loan not found</p>
        <button onClick={() => router.back()} className="mt-4 text-ph-blue-600 text-sm hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/loans" className="text-ph-blue-600 text-sm hover:underline mb-1 inline-block">
            &larr; Back to My Loans
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Loan #{loan.loan_id}
          </h1>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${statusColors[loan.loan_status] || "bg-gray-100 text-gray-800"}`}>
          {loan.loan_status}
        </span>
      </div>

      {/* Denied Notice */}
      {loan.loan_status === "Denied" && loan.rejection && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-semibold text-sm">Loan Denied</p>
          <p className="text-red-700 text-sm mt-1">{loan.rejection.rejected_reason || "No reason provided"}</p>
          {loan.rejection.date_rejected && (
            <p className="text-red-500 text-xs mt-1">
              Denied on {new Date(loan.rejection.date_rejected).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Loan Details */}
      <Section title="Loan Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field label="Loan Type" value={loan.loan_type || "—"} />
          <Field label="Loan Purpose" value={loan.loan_purpose || "—"} />
          <Field label="Principal Amount" value={`₱${Number(loan.principal_amt).toLocaleString()}`} />
          <Field label="Current Balance" value={`₱${Number(loan.current_balance).toLocaleString()}`} />
          <Field label="Interest Rate" value={`${(Number(loan.interest_rate) * 100).toFixed(0)}%`} />
          <Field label="Term" value={`${loan.term_months} months`} />
          <Field label="Monthly Amortization" value={loan.amortization ? `₱${Number(loan.amortization).toLocaleString()}` : "—"} />
          <Field label="Frequency" value={loan.release_frequency || "—"} />
          <Field label="Fees" value={loan.fees ? `₱${Number(loan.fees).toLocaleString()}` : "—"} />
          <Field label="Applied On" value={new Date(loan.created_at).toLocaleDateString()} />
          {loan.decision_date && (
            <Field label="Decision Date" value={new Date(loan.decision_date).toLocaleDateString()} />
          )}
          {loan.date_released && (
            <Field label="Date Released" value={new Date(loan.date_released).toLocaleDateString()} />
          )}
          {loan.term_due && (
            <Field label="Term Due" value={new Date(loan.term_due).toLocaleDateString()} />
          )}
          {loan.remarks && <Field label="Remarks" value={loan.remarks} />}
        </div>
      </Section>

      {/* Release Information */}
      {loan.releases.length > 0 && (
        <Section title="Release Information">
          <div className="space-y-3">
            {loan.releases.map((r) => (
              <div key={r.release_id} className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 font-bold">₱{Number(r.amount_released).toLocaleString()}</p>
                    <p className="text-green-600 text-xs mt-0.5">
                      Released on {new Date(r.release_date).toLocaleDateString()}
                    </p>
                  </div>
                  {r.reference_no && (
                    <span className="text-xs text-green-600 bg-green-100 px-2.5 py-1 rounded-full font-medium">
                      Ref: {r.reference_no}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Payment Schedule */}
      {loan.schedules.length > 0 && (
        <Section title="Payment Schedule">
          {/* Mobile: cards */}
          <div className="space-y-3 lg:hidden">
            {loan.schedules.map((s, i) => (
              <div key={s.schedule_id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold text-gray-900">Payment #{i + 1}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${scheduleStatusColors[s.status] || "bg-gray-100 text-gray-800"}`}>
                    {s.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Due Date</p>
                    <p className="font-medium text-gray-900">{new Date(s.due_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Amount Due</p>
                    <p className="font-medium text-gray-900">₱{Number(s.scheduled_amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Paid</p>
                    <p className="font-medium text-gray-700">{s.paid_amount ? `₱${Number(s.paid_amount).toLocaleString()}` : "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">Amount Due</th>
                  <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">Paid</th>
                  <th className="pb-2 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loan.schedules.map((s, i) => (
                  <tr key={s.schedule_id} className="hover:bg-gray-50/50">
                    <td className="py-3 text-gray-500">{i + 1}</td>
                    <td className="py-3 text-gray-700">{new Date(s.due_date).toLocaleDateString()}</td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      ₱{Number(s.scheduled_amount).toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {s.paid_amount ? `₱${Number(s.paid_amount).toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${scheduleStatusColors[s.status] || "bg-gray-100 text-gray-800"}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Payment History */}
      {loan.payments.length > 0 && (
        <Section title="Payment History">
          {/* Mobile: cards */}
          <div className="space-y-3 lg:hidden">
            {loan.payments.map((p) => (
              <div key={p.payment_id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold text-gray-900">
                    ₱{Number(p.amount_paid).toLocaleString()}
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[p.payment_status] || "bg-gray-100 text-gray-800"}`}>
                    {p.payment_status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Date</p>
                    <p className="font-medium text-gray-700">{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Method</p>
                    <p className="font-medium text-gray-700">{p.payment_method || "—"}</p>
                  </div>
                  {p.transaction_id && (
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Reference</p>
                      <p className="font-medium text-gray-700 text-xs">{p.transaction_id}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                  <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase">Reference</th>
                  <th className="pb-2 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loan.payments.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-gray-50/50">
                    <td className="py-3 text-gray-700">
                      {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      ₱{Number(p.amount_paid).toLocaleString()}
                    </td>
                    <td className="py-3 text-gray-700">{p.payment_method || "—"}</td>
                    <td className="py-3 text-gray-500 text-xs">{p.transaction_id || "—"}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[p.payment_status] || "bg-gray-100 text-gray-800"}`}>
                        {p.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Quick Actions */}
      {loan.loan_status === "Active" && (
        <div className="flex justify-center">
          <Link
            href="/dashboard/payments/submit"
            className="px-6 py-3 bg-ph-blue-600 text-white rounded-xl font-semibold hover:bg-ph-blue-700 transition-colors shadow-sm"
          >
            Make a Payment
          </Link>
        </div>
      )}
    </div>
  );
}
