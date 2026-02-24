import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [types] = await pool.query(
      "SELECT loan_type_id, loan_type_name FROM loan_types ORDER BY loan_type_name"
    );
    const [purposes] = await pool.query(
      "SELECT loan_purpose_id, loan_purpose_description FROM loan_purposes ORDER BY loan_purpose_description"
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
