import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    // Regular users can only see their own payments
    if (session.role === "user" && userId && userId !== String(session.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const effectiveUserId = session.role === "user" ? String(session.id) : userId;

    if (effectiveUserId) {
      const [rows] = await pool.query(
        `SELECT lp.payment_id, lp.loan_id, lp.payment_date, lp.amount_paid,
                lp.penalty_amount, lp.payment_method, lp.payment_status,
                lp.transaction_id AS reference_number, lp.remarks, lp.created_at
         FROM loan_payments lp
         JOIN loans l ON lp.loan_id = l.loan_id
         WHERE l.user_id = ?
         ORDER BY lp.payment_date DESC`,
        [effectiveUserId]
      );
      return NextResponse.json(rows);
    }

    // Only staff/admin can list all payments
    if (session.role === "user") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [rows] = await pool.query(
      `SELECT lp.payment_id, lp.loan_id, lp.payment_date, lp.amount_paid,
              lp.penalty_amount, lp.payment_method, lp.payment_status,
              lp.transaction_id AS reference_number, lp.attachment_url,
              lp.remarks, lp.created_at,
              CONCAT(u.first_name, ' ', u.last_name) AS borrower_name
       FROM loan_payments lp
       JOIN loans l ON lp.loan_id = l.loan_id
       LEFT JOIN users u ON l.user_id = u.user_id
       ORDER BY lp.payment_date DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Payments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role === "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { loan_id, payment_date, amount_paid, penalty_amount, payment_method, payment_status, transaction_id, remarks } = body;
    const [result]: any = await pool.query(
      `INSERT INTO loan_payments (loan_id, payment_date, amount_paid, penalty_amount,
        payment_method, payment_status, transaction_id, remarks, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,NOW(),NOW())`,
      [loan_id, payment_date, amount_paid, penalty_amount, payment_method, payment_status, transaction_id, remarks]
    );
    return NextResponse.json({ payment_id: result.insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
