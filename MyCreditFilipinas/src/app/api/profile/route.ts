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

    const [userRes, profileRes, contactRes, bankRes, addressRes, referenceRes] =
      await Promise.all([
        pool.query(
          `SELECT user_id, first_name, middle_name, last_name, suffix, gender,
                  birthdate, facebook, email_address, created_at
           FROM users WHERE user_id = $1`,
          [userId]
        ),
        pool.query(
          `SELECT user_profile_id, occupation, employer_agency, previous_employer,
                  educational_attainment, income
           FROM user_profiles WHERE user_id = $1`,
          [userId]
        ),
        pool.query(
          `SELECT contact_number_id, contact_number, contact_type
           FROM contact_numbers WHERE user_id = $1 ORDER BY contact_number_id`,
          [userId]
        ),
        pool.query(
          `SELECT bank_account_id, bank_name, card_number, card_expiry_date
           FROM bank_accounts WHERE user_id = $1 ORDER BY bank_account_id`,
          [userId]
        ),
        pool.query(
          `SELECT ua.user_address_id, ua.address_type, ua.residence_type, ua.is_primary,
                  a.address_id, a.building_floor, a.lot, a.blk, a.purok,
                  a.barangay, a.city, a.full_address_string, a.landmarks
           FROM user_addresses ua
           JOIN addresses a ON ua.address_id = a.address_id
           WHERE ua.user_id = $1 AND ua.is_active = true
           ORDER BY ua.user_address_id`,
          [userId]
        ),
        pool.query(
          `SELECT reference_id, reference_type, name, address, contact_number
           FROM "references" WHERE user_id = $1 ORDER BY reference_id`,
          [userId]
        ),
      ]);

    if (!userRes.rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...userRes.rows[0],
      profile: profileRes.rows[0] || null,
      contacts: contactRes.rows,
      bank_accounts: bankRes.rows,
      addresses: addressRes.rows,
      references: referenceRes.rows,
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
        `UPDATE users SET first_name=$1, middle_name=$2, last_name=$3, suffix=$4,
         gender=$5, birthdate=$6, facebook=$7, updated_at=NOW() WHERE user_id=$8`,
        [first_name, middle_name || null, last_name, suffix || null, gender || null, birthdate || null, facebook || null, userId]
      );
    }

    // Upsert employment/education profile
    if (body.employment) {
      const { occupation, employer_agency, previous_employer, educational_attainment, income } = body.employment;
      const { rows: existing } = await pool.query(
        "SELECT user_profile_id FROM user_profiles WHERE user_id = $1",
        [userId]
      );
      if (existing.length > 0) {
        await pool.query(
          `UPDATE user_profiles SET occupation=$1, employer_agency=$2, previous_employer=$3,
           educational_attainment=$4, income=$5, updated_at=NOW() WHERE user_id=$6`,
          [occupation || null, employer_agency || null, previous_employer || null, educational_attainment || null, income || null, userId]
        );
      } else {
        await pool.query(
          `INSERT INTO user_profiles (user_id, occupation, employer_agency, previous_employer,
           educational_attainment, income, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())`,
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
        const { rows } = await pool.query(
          "INSERT INTO contact_numbers (user_id, contact_number, contact_type, created_at) VALUES ($1,$2,$3,NOW()) RETURNING contact_number_id",
          [userId, contact_number, contact_type]
        );
        return NextResponse.json({ id: rows[0].contact_number_id }, { status: 201 });
      }
      if (action === "update") {
        const { contact_number_id, contact_number, contact_type } = data;
        await pool.query(
          "UPDATE contact_numbers SET contact_number=$1, contact_type=$2, updated_at=NOW() WHERE contact_number_id=$3 AND user_id=$4",
          [contact_number, contact_type, contact_number_id, userId]
        );
        return NextResponse.json({ success: true });
      }
      if (action === "delete") {
        await pool.query(
          "DELETE FROM contact_numbers WHERE contact_number_id=$1 AND user_id=$2",
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
        const { rows } = await pool.query(
          "INSERT INTO bank_accounts (user_id, bank_name, card_number, card_expiry_date, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING bank_account_id",
          [userId, bank_name, card_number || null, card_expiry_date || null]
        );
        return NextResponse.json({ id: rows[0].bank_account_id }, { status: 201 });
      }
      if (action === "update") {
        const { bank_account_id, bank_name, card_number, card_expiry_date } = data;
        await pool.query(
          "UPDATE bank_accounts SET bank_name=$1, card_number=$2, card_expiry_date=$3, updated_at=NOW() WHERE bank_account_id=$4 AND user_id=$5",
          [bank_name, card_number || null, card_expiry_date || null, bank_account_id, userId]
        );
        return NextResponse.json({ success: true });
      }
      if (action === "delete") {
        await pool.query(
          "DELETE FROM bank_accounts WHERE bank_account_id=$1 AND user_id=$2",
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
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const { rows: addrRows } = await client.query(
            `INSERT INTO addresses (building_floor, lot, blk, purok, barangay, city, full_address_string, landmarks, created_at, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW()) RETURNING address_id`,
            [building_floor || null, lot || null, blk || null, purok || null, barangay, city, fullAddress, landmarks || null]
          );
          const { rows: uaRows } = await client.query(
            `INSERT INTO user_addresses (user_id, address_id, address_type, residence_type, is_primary, is_active, created_at, updated_at)
             VALUES ($1,$2,$3,$4,false,true,NOW(),NOW()) RETURNING user_address_id`,
            [userId, addrRows[0].address_id, address_type || "present", residence_type || null]
          );
          await client.query("COMMIT");
          return NextResponse.json({ id: uaRows[0].user_address_id, address_id: addrRows[0].address_id }, { status: 201 });
        } catch (err) {
          await client.query("ROLLBACK");
          throw err;
        } finally {
          client.release();
        }
      }
      if (action === "update") {
        const { user_address_id, address_id, address_type, residence_type, building_floor, lot, blk, purok, barangay, city, landmarks } = data;
        const fullAddress = [lot, blk, purok, barangay, city].filter(Boolean).join(", ");
        // Verify ownership
        const { rows: check } = await pool.query(
          "SELECT user_address_id FROM user_addresses WHERE user_address_id=$1 AND user_id=$2",
          [user_address_id, userId]
        );
        if (!check.length) {
          return NextResponse.json({ error: "Address not found" }, { status: 404 });
        }
        await pool.query(
          `UPDATE addresses SET building_floor=$1, lot=$2, blk=$3, purok=$4, barangay=$5, city=$6,
           full_address_string=$7, landmarks=$8, updated_at=NOW() WHERE address_id=$9`,
          [building_floor || null, lot || null, blk || null, purok || null, barangay, city, fullAddress, landmarks || null, address_id]
        );
        await pool.query(
          "UPDATE user_addresses SET address_type=$1, residence_type=$2, updated_at=NOW() WHERE user_address_id=$3",
          [address_type, residence_type || null, user_address_id]
        );
        return NextResponse.json({ success: true });
      }
      if (action === "delete") {
        const { user_address_id } = data;
        // Soft-delete: set is_active = false
        await pool.query(
          "UPDATE user_addresses SET is_active=false, moved_out_at=NOW(), updated_at=NOW() WHERE user_address_id=$1 AND user_id=$2",
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
        const { rows } = await pool.query(
          `INSERT INTO "references" (user_id, reference_type, name, address, contact_number, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING reference_id`,
          [userId, reference_type, name, address || null, contact_number || null]
        );
        return NextResponse.json({ id: rows[0].reference_id }, { status: 201 });
      }
      if (action === "update") {
        const { reference_id, reference_type, name, address, contact_number } = data;
        await pool.query(
          `UPDATE "references" SET reference_type=$1, name=$2, address=$3, contact_number=$4, updated_at=NOW() WHERE reference_id=$5 AND user_id=$6`,
          [reference_type, name, address || null, contact_number || null, reference_id, userId]
        );
        return NextResponse.json({ success: true });
      }
      if (action === "delete") {
        await pool.query(
          `DELETE FROM "references" WHERE reference_id=$1 AND user_id=$2`,
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
