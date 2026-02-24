import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/profile — fetch the current user's full profile
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.id;

    const [
      [userRows],
      [profileRows],
      [contactRows],
      [bankRows],
      [addressRows],
      [referenceRows],
    ]: any = await Promise.all([
      pool.query(
        `SELECT user_id, first_name, middle_name, last_name, suffix, gender,
                birthdate, facebook, email_address, created_at
         FROM users WHERE user_id = ?`,
        [userId]
      ),
      pool.query(
        `SELECT user_profile_id, occupation, employer_agency, previous_employer,
                educational_attainment, income
         FROM user_profiles WHERE user_id = ?`,
        [userId]
      ),
      pool.query(
        `SELECT contact_number_id, contact_number, contact_type
         FROM contact_numbers WHERE user_id = ? ORDER BY contact_number_id`,
        [userId]
      ),
      pool.query(
        `SELECT bank_account_id, bank_name, card_number, card_expiry_date
         FROM bank_accounts WHERE user_id = ? ORDER BY bank_account_id`,
        [userId]
      ),
      pool.query(
        `SELECT ua.user_address_id, ua.address_type, ua.residence_type, ua.is_primary,
                a.address_id, a.building_floor, a.lot, a.blk, a.purok,
                a.barangay, a.city, a.full_address_string, a.landmarks
         FROM user_addresses ua
         JOIN addresses a ON ua.address_id = a.address_id
         WHERE ua.user_id = ? AND ua.is_active = 1
         ORDER BY ua.user_address_id`,
        [userId]
      ),
      pool.query(
        `SELECT reference_id, reference_type, name, address, contact_number
         FROM \`references\` WHERE user_id = ? ORDER BY reference_id`,
        [userId]
      ),
    ]);

    if (!userRows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...userRows[0],
      profile: profileRows[0] || null,
      contacts: contactRows,
      bank_accounts: bankRows,
      addresses: addressRows,
      references: referenceRows,
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PUT /api/profile — update basic info & employment/education
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.id;
    const body = await req.json();

    // Update basic user fields
    if (body.basic) {
      const { first_name, middle_name, last_name, suffix, gender, birthdate, facebook } = body.basic;
      await pool.query(
        `UPDATE users SET first_name=?, middle_name=?, last_name=?, suffix=?,
         gender=?, birthdate=?, facebook=?, updated_at=NOW() WHERE user_id=?`,
        [first_name, middle_name || null, last_name, suffix || null, gender || null, birthdate || null, facebook || null, userId]
      );
    }

    // Upsert employment/education profile
    if (body.employment) {
      const { occupation, employer_agency, previous_employer, educational_attainment, income } = body.employment;
      const [existing]: any = await pool.query(
        "SELECT user_profile_id FROM user_profiles WHERE user_id = ?",
        [userId]
      );
      if (existing.length > 0) {
        await pool.query(
          `UPDATE user_profiles SET occupation=?, employer_agency=?, previous_employer=?,
           educational_attainment=?, income=?, updated_at=NOW() WHERE user_id=?`,
          [occupation || null, employer_agency || null, previous_employer || null, educational_attainment || null, income || null, userId]
        );
      } else {
        await pool.query(
          `INSERT INTO user_profiles (user_id, occupation, employer_agency, previous_employer,
           educational_attainment, income, created_at, updated_at) VALUES (?,?,?,?,?,?,NOW(),NOW())`,
          [userId, occupation || null, employer_agency || null, previous_employer || null, educational_attainment || null, income || null]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

// POST /api/profile — CRUD for sub-resources (contacts, addresses, banks, references)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.id;
    const body = await req.json();
    const { section, action, data } = body;

    if (!section || !action) {
      return NextResponse.json({ error: "section and action are required" }, { status: 400 });
    }

    // ── Contact Numbers ──
    if (section === "contacts") {
      if (action === "add") {
        const { contact_number, contact_type } = data;
        if (!contact_number || !contact_type) {
          return NextResponse.json({ error: "contact_number and contact_type are required" }, { status: 400 });
        }
        const [result]: any = await pool.query(
          "INSERT INTO contact_numbers (user_id, contact_number, contact_type, created_at) VALUES (?,?,?,NOW())",
          [userId, contact_number, contact_type]
        );
        return NextResponse.json({ id: result.insertId }, { status: 201 });
      }
      if (action === "update") {
        const { contact_number_id, contact_number, contact_type } = data;
        await pool.query(
          "UPDATE contact_numbers SET contact_number=?, contact_type=?, updated_at=NOW() WHERE contact_number_id=? AND user_id=?",
          [contact_number, contact_type, contact_number_id, userId]
        );
        return NextResponse.json({ success: true });
      }
      if (action === "delete") {
        await pool.query(
          "DELETE FROM contact_numbers WHERE contact_number_id=? AND user_id=?",
          [data.contact_number_id, userId]
        );
        return NextResponse.json({ success: true });
      }
    }

    // ── Bank Accounts ──
    if (section === "banks") {
      if (action === "add") {
        const { bank_name, card_number, card_expiry_date } = data;
        if (!bank_name) {
          return NextResponse.json({ error: "bank_name is required" }, { status: 400 });
        }
        const [result]: any = await pool.query(
          "INSERT INTO bank_accounts (user_id, bank_name, card_number, card_expiry_date, created_at) VALUES (?,?,?,?,NOW())",
          [userId, bank_name, card_number || null, card_expiry_date || null]
        );
        return NextResponse.json({ id: result.insertId }, { status: 201 });
      }
      if (action === "update") {
        const { bank_account_id, bank_name, card_number, card_expiry_date } = data;
        await pool.query(
          "UPDATE bank_accounts SET bank_name=?, card_number=?, card_expiry_date=?, updated_at=NOW() WHERE bank_account_id=? AND user_id=?",
          [bank_name, card_number || null, card_expiry_date || null, bank_account_id, userId]
        );
        return NextResponse.json({ success: true });
      }
      if (action === "delete") {
        await pool.query(
          "DELETE FROM bank_accounts WHERE bank_account_id=? AND user_id=?",
          [data.bank_account_id, userId]
        );
        return NextResponse.json({ success: true });
      }
    }

    // ── Addresses ──
    if (section === "addresses") {
      if (action === "add") {
        const { address_type, residence_type, building_floor, lot, blk, purok, barangay, city, landmarks } = data;
        if (!barangay || !city) {
          return NextResponse.json({ error: "barangay and city are required" }, { status: 400 });
        }
        const fullAddress = [lot, blk, purok, barangay, city].filter(Boolean).join(", ");
        // Use transaction for two related inserts
        const conn = await pool.getConnection();
        try {
          await conn.beginTransaction();
          const [addrResult]: any = await conn.query(
            `INSERT INTO addresses (building_floor, lot, blk, purok, barangay, city, full_address_string, landmarks, created_at, updated_at)
             VALUES (?,?,?,?,?,?,?,?,NOW(),NOW())`,
            [building_floor || null, lot || null, blk || null, purok || null, barangay, city, fullAddress, landmarks || null]
          );
          const [uaResult]: any = await conn.query(
            `INSERT INTO user_addresses (user_id, address_id, address_type, residence_type, is_primary, is_active, created_at, updated_at)
             VALUES (?,?,?,?,0,1,NOW(),NOW())`,
            [userId, addrResult.insertId, address_type || "present", residence_type || null]
          );
          await conn.commit();
          return NextResponse.json({ id: uaResult.insertId, address_id: addrResult.insertId }, { status: 201 });
        } catch (err) {
          await conn.rollback();
          throw err;
        } finally {
          conn.release();
        }
      }
      if (action === "update") {
        const { user_address_id, address_id, address_type, residence_type, building_floor, lot, blk, purok, barangay, city, landmarks } = data;
        const fullAddress = [lot, blk, purok, barangay, city].filter(Boolean).join(", ");
        // Verify ownership
        const [check]: any = await pool.query(
          "SELECT user_address_id FROM user_addresses WHERE user_address_id=? AND user_id=?",
          [user_address_id, userId]
        );
        if (!check.length) {
          return NextResponse.json({ error: "Address not found" }, { status: 404 });
        }
        await pool.query(
          `UPDATE addresses SET building_floor=?, lot=?, blk=?, purok=?, barangay=?, city=?,
           full_address_string=?, landmarks=?, updated_at=NOW() WHERE address_id=?`,
          [building_floor || null, lot || null, blk || null, purok || null, barangay, city, fullAddress, landmarks || null, address_id]
        );
        await pool.query(
          "UPDATE user_addresses SET address_type=?, residence_type=?, updated_at=NOW() WHERE user_address_id=?",
          [address_type, residence_type || null, user_address_id]
        );
        return NextResponse.json({ success: true });
      }
      if (action === "delete") {
        const { user_address_id } = data;
        // Soft-delete: set is_active = 0
        await pool.query(
          "UPDATE user_addresses SET is_active=0, moved_out_at=NOW(), updated_at=NOW() WHERE user_address_id=? AND user_id=?",
          [user_address_id, userId]
        );
        return NextResponse.json({ success: true });
      }
    }

    // ── References ──
    if (section === "references") {
      if (action === "add") {
        const { reference_type, name, address, contact_number } = data;
        if (!name || !reference_type) {
          return NextResponse.json({ error: "name and reference_type are required" }, { status: 400 });
        }
        const [result]: any = await pool.query(
          "INSERT INTO `references` (user_id, reference_type, name, address, contact_number, created_at) VALUES (?,?,?,?,?,NOW())",
          [userId, reference_type, name, address || null, contact_number || null]
        );
        return NextResponse.json({ id: result.insertId }, { status: 201 });
      }
      if (action === "update") {
        const { reference_id, reference_type, name, address, contact_number } = data;
        await pool.query(
          "UPDATE `references` SET reference_type=?, name=?, address=?, contact_number=?, updated_at=NOW() WHERE reference_id=? AND user_id=?",
          [reference_type, name, address || null, contact_number || null, reference_id, userId]
        );
        return NextResponse.json({ success: true });
      }
      if (action === "delete") {
        await pool.query(
          "DELETE FROM `references` WHERE reference_id=? AND user_id=?",
          [data.reference_id, userId]
        );
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: "Invalid section or action" }, { status: 400 });
  } catch (error) {
    console.error("Profile POST error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
