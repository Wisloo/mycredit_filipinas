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

    // Regular users can only see their own loans
    if (session.role === "user" && userId && userId !== String(session.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // For regular users, always scope to their own ID
    const effectiveUserId = session.role === "user" ? String(session.id) : userId;

    if (effectiveUserId) {
      const [rows] = await pool.query(
        `SELECT l.loan_id, l.principal_amt, l.term_months AS loan_term_months, l.loan_status,
                l.interest_rate, l.current_balance, l.release_frequency, l.amortization,
                l.date_released, l.term_due, l.created_at,
                lt.loan_type_name AS loan_type, lp.loan_purpose_description AS loan_purpose
         FROM loans l
         LEFT JOIN loan_types lt ON l.loan_type_id = lt.loan_type_id
         LEFT JOIN loan_purposes lp ON l.loan_purpose_id = lp.loan_purpose_id
         WHERE l.user_id = ?
         ORDER BY l.created_at DESC`,
        [effectiveUserId]
      );
      return NextResponse.json(rows);
    }

    // Only staff/admin can list all loans
    if (session.role === "user") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [rows] = await pool.query(
      `SELECT l.loan_id, l.principal_amt, l.term_months AS loan_term_months, l.loan_status,
              l.interest_rate, l.current_balance, l.release_frequency,
              l.date_released, l.term_due, l.created_at,
              CONCAT(u.first_name, ' ', u.last_name) AS borrower_name,
              lt.loan_type_name AS loan_type, lp.loan_purpose_description AS loan_purpose
       FROM loans l
       LEFT JOIN users u ON l.user_id = u.user_id
       LEFT JOIN loan_types lt ON l.loan_type_id = lt.loan_type_id
       LEFT JOIN loan_purposes lp ON l.loan_purpose_id = lp.loan_purpose_id
       ORDER BY l.created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Loans GET error:", error);
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role === "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      user_id, loan_type_id, loan_purpose_id, principal_amt,
      term_months, amortization, fees, profit, interest_rate,
      current_balance, loan_status, release_frequency
    } = body;
    const [result]: any = await pool.query(
      `INSERT INTO loans (user_id, loan_type_id, loan_purpose_id, principal_amt,
        term_months, amortization, fees, profit, interest_rate, current_balance,
        loan_status, release_frequency, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
      [user_id, loan_type_id, loan_purpose_id, principal_amt,
       term_months, amortization, fees, profit, interest_rate,
       current_balance, loan_status, release_frequency]
    );
    return NextResponse.json({ loan_id: result.insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 });
  }
}
