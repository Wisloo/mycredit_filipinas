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
    const id = searchParams.get("id");

    // Regular users can only fetch their own profile — ignore id param
    if (session.role === "user") {
      const userId = session.id;
      const [rows] = await pool.query(
        "SELECT user_id, first_name, middle_name, last_name, suffix, gender, birthdate, email_address, created_at FROM users WHERE user_id = ?",
        [userId]
      );
      return NextResponse.json(rows);
    }

    // Staff can fetch any user or list all (admin/approver)
    if (id) {
      const [rows] = await pool.query(
        "SELECT user_id, first_name, middle_name, last_name, suffix, gender, birthdate, email_address, created_at FROM users WHERE user_id = ?",
        [id]
      );
      return NextResponse.json(rows);
    }

    const [rows] = await pool.query(
      "SELECT user_id, first_name, middle_name, last_name, suffix, gender, birthdate, email_address, is_inactive, created_at FROM users ORDER BY created_at DESC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role === "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { first_name, middle_name, last_name, suffix, gender, birthdate, facebook, email_address } = body;

    if (!first_name || !last_name || !email_address) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 }
      );
    }

    const [result]: any = await pool.query(
      "INSERT INTO users (first_name, middle_name, last_name, suffix, gender, birthdate, facebook, email_address, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,NOW(),NOW())",
      [first_name, middle_name, last_name, suffix, gender, birthdate, facebook, email_address]
    );
    return NextResponse.json({ user_id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error("Users POST error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
