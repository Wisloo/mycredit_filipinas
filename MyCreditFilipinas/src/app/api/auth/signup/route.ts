import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { hashPassword, createToken } from "@/lib/auth";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  const conn = await pool.getConnection();
  try {
    const body = await req.json();
    const {
      first_name,
      last_name,
      middle_name,
      email,
      password,
      suffix,
      birthdate,
      gender,
      facebook,
      contact,
      employment,
      bank,
      reference,
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { error: "First name, last name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existing] = await conn.query<RowDataPacket[]>(
      "SELECT user_id FROM users WHERE email_address = ?",
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Start transaction
    await conn.beginTransaction();

    // 1. Create user
    const [userResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO users (first_name, middle_name, last_name, suffix, gender, birthdate, email_address, facebook, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        first_name,
        middle_name || null,
        last_name,
        suffix || null,
        gender || null,
        birthdate || null,
        email,
        facebook || null,
        hashedPassword,
      ]
    );

    const userId = userResult.insertId;

    // 2. Create contact number
    if (contact?.contact_number) {
      await conn.query<ResultSetHeader>(
        `INSERT INTO contact_numbers (user_id, contact_number, contact_type, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [userId, contact.contact_number, contact.contact_type || "Personal"]
      );
    }

    // 3. Create address
    if (contact?.barangay || contact?.city || contact?.full_address_string) {
      const [addrResult] = await conn.query<ResultSetHeader>(
        `INSERT INTO addresses (barangay, city, full_address_string, landmarks, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [
          contact.barangay || null,
          contact.city || null,
          contact.full_address_string || null,
          contact.landmarks || null,
        ]
      );

      await conn.query<ResultSetHeader>(
        `INSERT INTO user_addresses (user_id, address_id, address_type, residence_type, is_primary, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, 1, NOW(), NOW())`,
        [
          userId,
          addrResult.insertId,
          contact.address_type || "present",
          contact.residence_type || null,
        ]
      );
    }

    // 4. Create employment/education profile
    if (
      employment?.occupation ||
      employment?.employer_agency ||
      employment?.educational_attainment ||
      employment?.income
    ) {
      await conn.query<ResultSetHeader>(
        `INSERT INTO user_profiles (user_id, occupation, employer_agency, previous_employer, educational_attainment, income, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          employment.occupation || null,
          employment.employer_agency || null,
          employment.previous_employer || null,
          employment.educational_attainment || null,
          employment.income ? Number(employment.income) : null,
        ]
      );
    }

    // 5. Create bank account
    if (bank?.bank_name) {
      await conn.query<ResultSetHeader>(
        `INSERT INTO bank_accounts (user_id, bank_name, card_number, card_expiry_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          bank.bank_name,
          bank.card_number || null,
          bank.card_expiry_date ? `${bank.card_expiry_date}-01` : null,
        ]
      );
    }

    // 6. Create reference
    if (reference?.reference_name) {
      await conn.query<ResultSetHeader>(
        "INSERT INTO `references` (user_id, reference_type, name, address, contact_number, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
        [
          userId,
          reference.reference_type || "relative",
          reference.reference_name,
          reference.reference_address || null,
          reference.reference_contact || null,
        ]
      );
    }

    await conn.commit();

    const token = await createToken({
      id: userId,
      role: "user",
      name: `${first_name} ${last_name}`,
    });

    const response = NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: userId,
          name: `${first_name} ${last_name}`,
          role: "user",
        },
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    await conn.rollback();
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
