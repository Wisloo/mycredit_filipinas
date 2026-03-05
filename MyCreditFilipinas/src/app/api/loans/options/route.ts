import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows: types } = await pool.query(
      "SELECT loan_type_id, loan_type_name FROM loan_types ORDER BY loan_type_name"
    );
    const { rows: purposes } = await pool.query(
      "SELECT loan_purpose_id, loan_purpose_description FROM loan_purposes ORDER BY CASE WHEN loan_purpose_description = 'Others' THEN 1 ELSE 0 END, loan_purpose_description"
    );
    return NextResponse.json({ types, purposes });
  } catch (error) {
    console.error("Loan options error:", error);
    return NextResponse.json(
      { error: "Failed to fetch loan options" },
      { status: 500 }
    );
  }
}
