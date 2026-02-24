import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";

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
    const [userRows]: any = await pool.query(
      `SELECT user_id, first_name, middle_name, last_name, suffix, gender,
              birthdate, facebook, email_address, is_inactive, created_at, updated_at
       FROM users WHERE user_id = ?`,
      [userId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userRows[0];

    // Fetch all related data in parallel
    const [
      [profileRows],
      [contactRows],
      [bankRows],
      [addressRows],
      [referenceRows],
      [loanRows],
    ]: any = await Promise.all([
      pool.query(
        `SELECT user_profile_id, occupation, employer_agency, previous_employer,
                educational_attainment, income, created_at
         FROM user_profiles WHERE user_id = ?`,
        [userId]
      ),
      pool.query(
        `SELECT contact_number_id, contact_number, contact_type, created_at
         FROM contact_numbers WHERE user_id = ?`,
        [userId]
      ),
      pool.query(
        `SELECT bank_account_id, bank_name, card_number, card_expiry_date, created_at
         FROM bank_accounts WHERE user_id = ?`,
        [userId]
      ),
      pool.query(
        `SELECT ua.user_address_id, ua.address_type, ua.residence_type, ua.is_primary,
                ua.is_active, ua.moved_out_at,
                a.address_id, a.building_floor, a.lot, a.blk, a.purok,
                a.barangay, a.city, a.full_address_string, a.landmarks
         FROM user_addresses ua
         JOIN addresses a ON ua.address_id = a.address_id
         WHERE ua.user_id = ?`,
        [userId]
      ),
      pool.query(
        `SELECT reference_id, reference_type, name, address, contact_number,
                verification_notes, verified_by, created_at
         FROM \`references\` WHERE user_id = ?`,
        [userId]
      ),
      pool.query(
        `SELECT l.loan_id, l.principal_amt, l.term_months, l.loan_status,
                l.interest_rate, l.current_balance, l.created_at,
                lt.loan_type_name AS loan_type, lp.loan_purpose_description AS loan_purpose
         FROM loans l
         LEFT JOIN loan_types lt ON l.loan_type_id = lt.loan_type_id
         LEFT JOIN loan_purposes lp ON l.loan_purpose_id = lp.loan_purpose_id
         WHERE l.user_id = ?
         ORDER BY l.created_at DESC`,
        [userId]
      ),
    ]);

    return NextResponse.json({
      ...user,
      profile: profileRows[0] || null,
      contacts: contactRows,
      bank_accounts: bankRows,
      addresses: addressRows,
      references: referenceRows,
      loans: loanRows,
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
    const [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT user_id, is_inactive FROM users WHERE user_id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newStatus = action === "deactivate" ? 1 : 0;

    // Use transaction to update user + freeze/unfreeze loans
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query<ResultSetHeader>(
        "UPDATE users SET is_inactive = ?, updated_at = NOW() WHERE user_id = ?",
        [newStatus, userId]
      );

      if (action === "deactivate") {
        // Freeze all Active/Approved loans
        await conn.query<ResultSetHeader>(
          "UPDATE loans SET loan_status = 'Frozen', updated_at = NOW() WHERE user_id = ? AND loan_status IN ('Active', 'Approved')",
          [userId]
        );
      } else {
        // Reactivate Frozen loans back to Active
        await conn.query<ResultSetHeader>(
          "UPDATE loans SET loan_status = 'Active', updated_at = NOW() WHERE user_id = ? AND loan_status = 'Frozen'",
          [userId]
        );
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
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
