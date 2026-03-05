import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const loanId = Number(id);
    if (!loanId) {
      return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 });
    }

    // Fetch loan with type, purpose, borrower info
    const { rows: loanRows } = await pool.query(
      `SELECT l.*,
              lt.loan_type_name AS loan_type,
              lp.loan_purpose_description AS loan_purpose,
              CONCAT(u.first_name, ' ', u.last_name) AS borrower_name,
              u.user_id, u.email_address, u.gender,
              s.full_name AS processed_by_name
       FROM loans l
       LEFT JOIN loan_types lt ON l.loan_type_id = lt.loan_type_id
       LEFT JOIN loan_purposes lp ON l.loan_purpose_id = lp.loan_purpose_id
       LEFT JOIN users u ON l.user_id = u.user_id
       LEFT JOIN staff s ON l.processed_by = s.staff_id
       WHERE l.loan_id = $1`,
      [loanId]
    );

    if (loanRows.length === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const loan = loanRows[0];

    // Users can only view their own loans
    if (session.role === "user" && loan.user_id !== session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch payments, schedules, releases, rejection in parallel
    const [paymentRes, scheduleRes, releaseRes, rejectRes] = await Promise.all([
      pool.query(
        `SELECT payment_id, payment_date, amount_paid, penalty_amount,
                payment_method, payment_status, transaction_id, attachment_url, remarks, created_at
         FROM loan_payments WHERE loan_id = $1 ORDER BY payment_date DESC`,
        [loanId]
      ),
      pool.query(
        `SELECT schedule_id, due_date, scheduled_amount, paid_amount, status
         FROM loan_schedules WHERE loan_id = $1 ORDER BY due_date ASC`,
        [loanId]
      ),
      pool.query(
        `SELECT release_id, release_date, amount_released, reference_no, created_at
         FROM loan_releases WHERE loan_id = $1 ORDER BY release_date DESC`,
        [loanId]
      ),
      pool.query(
        `SELECT date_rejected, rejected_reason FROM "reject" WHERE loan_id = $1`,
        [loanId]
      ),
    ]);

    return NextResponse.json({
      ...loan,
      payments: paymentRes.rows,
      schedules: scheduleRes.rows,
      releases: releaseRes.rows,
      rejection: rejectRes.rows[0] || null,
    });
  } catch (error) {
    console.error("Loan detail GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch loan details" },
      { status: 500 }
    );
  }
}

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
    const loanId = Number(id);
    if (!loanId) {
      return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 });
    }

    const body = await req.json();
    const { action } = body; // "approve" | "deny" | "update" | "default" | "unfreeze"

    if (!["approve", "deny", "update", "default", "unfreeze"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approve', 'deny', 'update', 'default', or 'unfreeze'" },
        { status: 400 }
      );
    }

    // Fetch full loan details
    const { rows } = await pool.query(
      "SELECT * FROM loans WHERE loan_id = $1",
      [loanId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const loan = rows[0];

    // Handle fee/profit update
    if (action === "update") {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIdx = 1;

      if (body.fees !== undefined) {
        updates.push(`fees = $${paramIdx++}`);
        values.push(Number(body.fees));
      }
      if (body.profit !== undefined) {
        updates.push(`profit = $${paramIdx++}`);
        values.push(Number(body.profit));
      }
      if (body.amortization !== undefined) {
        updates.push(`amortization = $${paramIdx++}`);
        values.push(Number(body.amortization));
      }
      if (body.interest_rate !== undefined) {
        updates.push(`interest_rate = $${paramIdx++}`);
        values.push(Number(body.interest_rate));
      }

      if (updates.length === 0) {
        return NextResponse.json({ error: "No fields to update" }, { status: 400 });
      }

      updates.push("updated_at = NOW()");
      values.push(loanId);

      await pool.query(
        `UPDATE loans SET ${updates.join(", ")} WHERE loan_id = $${paramIdx}`,
        values
      );

      return NextResponse.json({ message: "Loan updated successfully", loan_id: loanId });
    }

    // Mark active loan as Defaulted
    if (action === "default") {
      if (!["Active", "Frozen"].includes(loan.loan_status)) {
        return NextResponse.json(
          { error: `Cannot mark a ${loan.loan_status} loan as defaulted` },
          { status: 400 }
        );
      }
      await pool.query(
        `UPDATE loans SET loan_status = 'Defaulted', updated_at = NOW() WHERE loan_id = $1`,
        [loanId]
      );
      return NextResponse.json({
        message: "Loan marked as defaulted",
        loan_id: loanId,
        new_status: "Defaulted",
      });
    }

    // Unfreeze a frozen loan back to Active
    if (action === "unfreeze") {
      if (loan.loan_status !== "Frozen") {
        return NextResponse.json(
          { error: "Only Frozen loans can be unfrozen" },
          { status: 400 }
        );
      }
      await pool.query(
        `UPDATE loans SET loan_status = 'Active', updated_at = NOW() WHERE loan_id = $1`,
        [loanId]
      );
      return NextResponse.json({
        message: "Loan unfrozen and set back to Active",
        loan_id: loanId,
        new_status: "Active",
      });
    }

    // Approve/deny requires Pending status
    if (loan.loan_status !== "Pending") {
      return NextResponse.json(
        { error: `Loan is already ${loan.loan_status}` },
        { status: 400 }
      );
    }

    // If denied
    if (action === "deny") {
      const reason = body.reason?.trim();
      if (!reason) {
        return NextResponse.json(
          { error: "A reason is required when denying a loan" },
          { status: 400 }
        );
      }

      await pool.query(
        `UPDATE loans SET loan_status = 'Denied', processed_by = $1, decision_date = NOW(), updated_at = NOW() WHERE loan_id = $2`,
        [session.id, loanId]
      );

      try {
        await pool.query(
          `INSERT INTO "reject" (loan_id, date_rejected, rejected_reason)
           VALUES ($1, NOW(), $2)
           ON CONFLICT (loan_id) DO UPDATE SET date_rejected = NOW(), rejected_reason = $2`,
          [loanId, reason]
        );
      } catch {
        // reject table insert is optional
      }

      return NextResponse.json({
        message: "Loan denied successfully",
        loan_id: loanId,
        new_status: "Denied",
      });
    }

    // If approved: set Active, generate schedule, create release record
    // First check if user is inactive — cannot approve loan for deactivated user
    const { rows: userCheck } = await pool.query(
      "SELECT is_inactive FROM users WHERE user_id = $1",
      [loan.user_id]
    );
    if (userCheck.length > 0 && userCheck[0].is_inactive) {
      return NextResponse.json(
        { error: "Cannot approve loan for an inactive/deactivated user" },
        { status: 400 }
      );
    }

    const principal = Number(loan.principal_amt);
    const termMonths = Number(loan.term_months);
    const interestRate = Number(loan.interest_rate) || 0.04;
    const frequency = loan.release_frequency || "monthly";

    // Calculate amortization
    const amortization =
      (principal * interestRate) /
      (1 - Math.pow(1 + interestRate, -termMonths));

    // Calculate fees (2% service fee) and profit
    const fees = body.fees !== undefined ? Number(body.fees) : Math.round(principal * 0.02 * 100) / 100;
    const totalInterest = amortization * termMonths - principal;
    const profit = body.profit !== undefined ? Number(body.profit) : Math.round(totalInterest * 100) / 100;

    await pool.query(
      `UPDATE loans SET
        loan_status = 'Active',
        processed_by = $1,
        decision_date = NOW(),
        date_released = NOW(),
        term_due = NOW() + make_interval(months => $2),
        amortization = $3,
        fees = $4,
        profit = $5,
        updated_at = NOW()
       WHERE loan_id = $6`,
      [session.id, termMonths, amortization.toFixed(2), fees, profit, loanId]
    );

    // Generate payment schedule
    const now = new Date();
    const scheduledAmount = frequency === "bi-monthly" ? amortization / 2 : amortization;
    const totalPayments = frequency === "bi-monthly" ? termMonths * 2 : termMonths;

    for (let i = 1; i <= totalPayments; i++) {
      const dueDate = new Date(now);
      if (frequency === "bi-monthly") {
        dueDate.setDate(dueDate.getDate() + Math.round(i * 15.22));
      } else {
        dueDate.setMonth(dueDate.getMonth() + i);
      }
      const dueDateStr = dueDate.toISOString().split("T")[0];

      await pool.query(
        `INSERT INTO loan_schedules (loan_id, due_date, scheduled_amount, paid_amount, status)
         VALUES ($1, $2, $3, 0, 'Unpaid')`,
        [loanId, dueDateStr, scheduledAmount.toFixed(2)]
      );
    }

    // Create loan release record
    const refNo = `REL-${loanId}-${Date.now().toString(36).toUpperCase()}`;
    await pool.query(
      `INSERT INTO loan_releases (loan_id, release_date, amount_released, reference_no, released_by_ceo_id, created_at, updated_at)
       VALUES ($1, CURRENT_DATE, $2, $3, $4, NOW(), NOW())`,
      [loanId, principal, refNo, session.id]
    );

    return NextResponse.json({
      message: "Loan approved and activated successfully. Payment schedule generated.",
      loan_id: loanId,
      new_status: "Active",
    });
  } catch (error) {
    console.error("Loan status update error:", error);
    return NextResponse.json(
      { error: "Failed to update loan status" },
      { status: 500 }
    );
  }
}
