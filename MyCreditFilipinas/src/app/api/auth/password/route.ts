import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Fetch current password hash based on role
    let rows: RowDataPacket[];
    if (session.role === "user") {
      [rows] = await pool.query<RowDataPacket[]>(
        "SELECT password_hash FROM users WHERE user_id = ?",
        [session.id]
      );
    } else {
      [rows] = await pool.query<RowDataPacket[]>(
        "SELECT password_hash FROM staff WHERE staff_id = ?",
        [session.id]
      );
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Verify current password
    const valid = await verifyPassword(current_password, rows[0].password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 403 }
      );
    }

    // Hash and update
    const newHash = await hashPassword(new_password);
    if (session.role === "user") {
      await pool.query(
        "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?",
        [newHash, session.id]
      );
    } else {
      await pool.query(
        "UPDATE staff SET password_hash = ?, updated_at = NOW() WHERE staff_id = ?",
        [newHash, session.id]
      );
    }

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
