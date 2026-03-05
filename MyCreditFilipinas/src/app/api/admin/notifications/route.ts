import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role === "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [[pendingLoansRow], [pendingPaymentsRow], [overdueLoansRow]] =
      await Promise.all([
        pool.query<RowDataPacket[]>(
          "SELECT COUNT(*) AS count FROM loans WHERE loan_status = 'Pending'",
          []
        ),
        pool.query<RowDataPacket[]>(
          "SELECT COUNT(*) AS count FROM loan_payments WHERE payment_status = 'Pending'",
          []
        ),
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) AS count
           FROM loan_schedules ls
           JOIN loans l ON ls.loan_id = l.loan_id
           WHERE ls.status IN ('Unpaid', 'Partial')
             AND ls.due_date < CURDATE()
             AND l.loan_status = 'Active'`,
          []
        ),
      ]) as [RowDataPacket[], RowDataPacket[], RowDataPacket[]];

    return NextResponse.json({
      pendingLoans: Number((pendingLoansRow as RowDataPacket[])[0]?.count ?? 0),
      pendingPayments: Number(
        (pendingPaymentsRow as RowDataPacket[])[0]?.count ?? 0
      ),
      overdueSchedules: Number(
        (overdueLoansRow as RowDataPacket[])[0]?.count ?? 0
      ),
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json(
      { pendingLoans: 0, pendingPayments: 0, overdueSchedules: 0 },
      { status: 200 }
    );
  }
}
