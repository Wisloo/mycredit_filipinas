import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role === "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const paymentId = Number(id);
    if (!paymentId) {
      return NextResponse.json(
        { error: "Invalid payment ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { action } = body; // "verify" | "reject"

    if (!["verify", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'verify' or 'reject'" },
        { status: 400 }
      );
    }

    // Use a transaction to prevent race conditions
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Lock the payment row
      const [rows]: any = await conn.query(
        "SELECT payment_id, payment_status, loan_id, amount_paid FROM loan_payments WHERE payment_id = ? FOR UPDATE",
        [paymentId]
      );

      if (rows.length === 0) {
        await conn.rollback();
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }

      if (rows[0].payment_status !== "Pending") {
        await conn.rollback();
        return NextResponse.json(
          { error: `Payment is already ${rows[0].payment_status}` },
          { status: 400 }
        );
      }

      const newStatus = action === "verify" ? "Verified" : "Rejected";

      await conn.query(
        `UPDATE loan_payments SET
          payment_status = ?,
          verified_by = ?,
          updated_at = NOW()
         WHERE payment_id = ?`,
        [newStatus, session.id, paymentId]
      );

      // If verified, reduce only the principal portion from current_balance
      if (action === "verify") {
        // Lock and fetch the loan row
        const [loanRows]: any = await conn.query(
          "SELECT loan_id, current_balance, interest_rate, release_frequency FROM loans WHERE loan_id = ? FOR UPDATE",
          [rows[0].loan_id]
        );

        if (loanRows.length > 0) {
          const loan = loanRows[0];
          const currentBalance = Number(loan.current_balance);
          const monthlyRate = Number(loan.interest_rate) || 0.04;
          const frequency = loan.release_frequency || "monthly";

          // Calculate interest portion for this period
          const periodRate = frequency === "bi-monthly" ? monthlyRate / 2 : monthlyRate;
          const interestPortion = currentBalance * periodRate;

          // Principal portion = amount paid - interest
          const amountPaid = Number(rows[0].amount_paid);
          const principalPortion = Math.max(amountPaid - interestPortion, 0);

          const newBalance = Math.max(currentBalance - principalPortion, 0);

          await conn.query(
            `UPDATE loans SET
              current_balance = ?,
              updated_at = NOW()
             WHERE loan_id = ?`,
            [newBalance.toFixed(2), rows[0].loan_id]
          );

          // Check if loan is fully paid (balance within 1 peso tolerance for rounding)
          if (newBalance < 1) {
            await conn.query(
              "UPDATE loans SET loan_status = 'Paid', current_balance = 0, updated_at = NOW() WHERE loan_id = ?",
              [rows[0].loan_id]
            );
          }
        }
      }

      await conn.commit();

      return NextResponse.json({
        message: `Payment ${action === "verify" ? "verified" : "rejected"} successfully`,
        payment_id: paymentId,
        new_status: newStatus,
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Payment status update error:", error);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}
