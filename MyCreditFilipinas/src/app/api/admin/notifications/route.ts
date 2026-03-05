import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role === "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [pendingLoansRes, pendingPaymentsRes, overdueLoansRes] =
      await Promise.all([
        pool.query(
          "SELECT COUNT(*) AS count FROM loans WHERE loan_status = 'Pending'"
        ),
        pool.query(
          "SELECT COUNT(*) AS count FROM loan_payments WHERE payment_status = 'Pending'"
        ),
        pool.query(
          `SELECT COUNT(*) AS count
           FROM loan_schedules ls
           JOIN loans l ON ls.loan_id = l.loan_id
           WHERE ls.status IN ('Unpaid', 'Partial')
             AND ls.due_date < CURRENT_DATE
             AND l.loan_status = 'Active'`
        ),
      ]);

    return NextResponse.json({
      pendingLoans: Number(pendingLoansRes.rows[0]?.count ?? 0),
      pendingPayments: Number(pendingPaymentsRes.rows[0]?.count ?? 0),
      overdueSchedules: Number(overdueLoansRes.rows[0]?.count ?? 0),
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json(
      { pendingLoans: 0, pendingPayments: 0, overdueSchedules: 0 },
      { status: 200 }
    );
  }
}
