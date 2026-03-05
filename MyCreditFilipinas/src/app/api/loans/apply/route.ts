import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      loan_type_id,
      loan_purpose_id,
      principal_amt,
      term_months,
      release_frequency,
      custom_purpose,
    } = body;

    const ALLOWED_AMOUNTS = [5000, 10000, 15000, 20000, 25000, 30000];

    // Validate required fields
    if (!loan_type_id || !loan_purpose_id || !principal_amt || !term_months) {
      return NextResponse.json(
        { error: "Loan type, purpose, amount, and term are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_AMOUNTS.includes(Number(principal_amt))) {
      return NextResponse.json(
        { error: "Loan amount must be one of: ₱5,000, ₱10,000, ₱15,000, ₱20,000, ₱25,000, or ₱30,000" },
        { status: 400 }
      );
    }

    if (!["monthly", "bi-monthly"].includes(release_frequency || "monthly")) {
      return NextResponse.json(
        { error: "Release frequency must be 'monthly' or 'bi-monthly'" },
        { status: 400 }
      );
    }

    // Prevent applying if user already has a Pending or Active loan
    const { rows: existingLoans } = await pool.query(
      "SELECT loan_id, loan_status FROM loans WHERE user_id = $1 AND loan_status IN ('Pending', 'Active', 'Approved') LIMIT 1",
      [session.id]
    );
    if (existingLoans.length > 0) {
      const existing = existingLoans[0];
      return NextResponse.json(
        {
          error: `You already have a ${existing.loan_status.toLowerCase()} loan (Loan #${existing.loan_id}). Please wait until it is resolved before applying for a new one.`,
        },
        { status: 409 }
      );
    }

    const interest_rate = 0.04; // 4% default
    const monthly_rate = interest_rate;
    const amortization =
      (Number(principal_amt) * monthly_rate) /
      (1 - Math.pow(1 + monthly_rate, -Number(term_months)));

    const { rows } = await pool.query(
      `INSERT INTO loans (
        user_id, loan_type_id, loan_purpose_id, principal_amt,
        term_months, amortization, interest_rate, current_balance,
        loan_status, release_frequency, remarks, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending', $9, $10, NOW(), NOW())
      RETURNING loan_id`,
      [
        session.id,
        loan_type_id,
        loan_purpose_id,
        principal_amt,
        term_months,
        amortization.toFixed(2),
        interest_rate,
        principal_amt, // current_balance starts at principal
        release_frequency || "monthly",
        custom_purpose || null,
      ]
    );

    return NextResponse.json(
      {
        message: "Loan application submitted successfully",
        loan_id: rows[0].loan_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Loan apply error:", error);
    return NextResponse.json(
      { error: "Failed to submit loan application" },
      { status: 500 }
    );
  }
}
