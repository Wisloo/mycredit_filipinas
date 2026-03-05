import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role === "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = Number(id);
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Fetch user basic info
    const { rows: userRows } = await pool.query(
      `SELECT user_id, first_name, middle_name, last_name, suffix, gender,
              birthdate, facebook, email_address, is_inactive, created_at, updated_at
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userRows[0];

    // Fetch all related data in parallel
    const [profileRes, contactRes, bankRes, addressRes, referenceRes, loanRes] =
      await Promise.all([
        pool.query(
          `SELECT user_profile_id, occupation, employer_agency, previous_employer,
                  educational_attainment, income, created_at
           FROM user_profiles WHERE user_id = $1`,
          [userId]
        ),
        pool.query(
          `SELECT contact_number_id, contact_number, contact_type, created_at
           FROM contact_numbers WHERE user_id = $1`,
          [userId]
        ),
        pool.query(
          `SELECT bank_account_id, bank_name, card_number, card_expiry_date, created_at
           FROM bank_accounts WHERE user_id = $1`,
          [userId]
        ),
        pool.query(
          `SELECT ua.user_address_id, ua.address_type, ua.residence_type, ua.is_primary,
                  ua.is_active, ua.moved_out_at,
                  a.address_id, a.building_floor, a.lot, a.blk, a.purok,
                  a.barangay, a.city, a.full_address_string, a.landmarks
           FROM user_addresses ua
           JOIN addresses a ON ua.address_id = a.address_id
           WHERE ua.user_id = $1`,
          [userId]
        ),
        pool.query(
          `SELECT reference_id, reference_type, name, address, contact_number,
                  verification_notes, verified_by, created_at
           FROM "references" WHERE user_id = $1`,
          [userId]
        ),
        pool.query(
          `SELECT l.loan_id, l.principal_amt, l.term_months, l.loan_status,
                  l.interest_rate, l.current_balance, l.created_at,
                  lt.loan_type_name AS loan_type, lp.loan_purpose_description AS loan_purpose
           FROM loans l
           LEFT JOIN loan_types lt ON l.loan_type_id = lt.loan_type_id
           LEFT JOIN loan_purposes lp ON l.loan_purpose_id = lp.loan_purpose_id
           WHERE l.user_id = $1
           ORDER BY l.created_at DESC`,
          [userId]
        ),
      ]);

    return NextResponse.json({
      ...user,
      profile: profileRes.rows[0] || null,
      contacts: contactRes.rows,
      bank_accounts: bankRes.rows,
      addresses: addressRes.rows,
      references: referenceRes.rows,
      loans: loanRes.rows,
    });
  } catch (error) {
    console.error("User detail GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
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
    // Only admin can soft-delete users (not approver)
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Only admins can modify user status" }, { status: 403 });
    }

    const { id } = await params;
    const userId = Number(id);
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await req.json();
    const { action } = body; // "deactivate" | "reactivate"

    if (!["deactivate", "reactivate"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'deactivate' or 'reactivate'" },
        { status: 400 }
      );
    }

    // Check user exists
    const { rows: userRows } = await pool.query(
      "SELECT user_id, is_inactive FROM users WHERE user_id = $1",
      [userId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newStatus = action === "deactivate";

    // Use transaction to update user + freeze/unfreeze loans
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        "UPDATE users SET is_inactive = $1, updated_at = NOW() WHERE user_id = $2",
        [newStatus, userId]
      );

      if (action === "deactivate") {
        // Freeze all Active/Approved loans
        await client.query(
          "UPDATE loans SET loan_status = 'Frozen', updated_at = NOW() WHERE user_id = $1 AND loan_status IN ('Active', 'Approved')",
          [userId]
        );
      } else {
        // Reactivate Frozen loans back to Active
        await client.query(
          "UPDATE loans SET loan_status = 'Active', updated_at = NOW() WHERE user_id = $1 AND loan_status = 'Frozen'",
          [userId]
        );
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({
      message: `User ${action === "deactivate" ? "deactivated" : "reactivated"} successfully`,
      is_inactive: newStatus,
    });
  } catch (error) {
    console.error("User PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
