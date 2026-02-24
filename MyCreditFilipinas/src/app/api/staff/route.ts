import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role === "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [rows] = await pool.query(
      "SELECT staff_id, full_name, role, username, is_inactive, created_at FROM staff ORDER BY created_at DESC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Staff GET error:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { full_name, role, username, password } = body;

    if (!full_name || !role || !username || !password) {
      return NextResponse.json(
        { error: "Full name, role, username, and password are required" },
        { status: 400 }
      );
    }

    if (!["Admin", "Approver"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be 'Admin' or 'Approver'" },
        { status: 400 }
      );
    }

    // Check for duplicate username
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT staff_id FROM staff WHERE username = ?",
      [username]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const [result]: any = await pool.query(
      "INSERT INTO staff (full_name, role, username, password_hash, created_at, updated_at) VALUES (?,?,?,?,NOW(),NOW())",
      [full_name, role, username, hashedPassword]
    );
    return NextResponse.json({ staff_id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error("Staff POST error:", error);
    return NextResponse.json({ error: "Failed to create staff" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { staff_id, action } = body;

    if (!staff_id || !["deactivate", "reactivate"].includes(action)) {
      return NextResponse.json(
        { error: "staff_id and action (deactivate/reactivate) are required" },
        { status: 400 }
      );
    }

    // Prevent admin from deactivating themselves
    if (staff_id === session.id) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT staff_id, is_inactive FROM staff WHERE staff_id = ?",
      [staff_id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const newStatus = action === "deactivate" ? 1 : 0;
    await pool.query<ResultSetHeader>(
      "UPDATE staff SET is_inactive = ?, updated_at = NOW() WHERE staff_id = ?",
      [newStatus, staff_id]
    );

    return NextResponse.json({
      message: `Staff ${action === "deactivate" ? "deactivated" : "reactivated"} successfully`,
      is_inactive: newStatus,
    });
  } catch (error) {
    console.error("Staff PATCH error:", error);
    return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
  }
}
