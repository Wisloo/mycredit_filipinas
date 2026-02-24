import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyPassword, createToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email/username, password, and role are required" },
        { status: 400 }
      );
    }

    if (role === "user") {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT user_id, first_name, last_name, email_address, password_hash, is_inactive FROM users WHERE email_address = ?",
        [email]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const user = rows[0];
      if (!user.password_hash) {
        return NextResponse.json(
          { error: "Account not set up. Please sign up first." },
          { status: 401 }
        );
      }

      if (user.is_inactive) {
        return NextResponse.json(
          { error: "Your account has been deactivated. Please contact the administrator." },
          { status: 403 }
        );
      }

      const valid = await verifyPassword(password, user.password_hash);
      if (!valid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const token = await createToken({
        id: user.user_id,
        role: "user",
        name: `${user.first_name} ${user.last_name}`,
      });

      const response = NextResponse.json({
        message: "Login successful",
        user: {
          id: user.user_id,
          name: `${user.first_name} ${user.last_name}`,
          role: "user",
        },
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    if (role === "staff") {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT staff_id, full_name, username, password_hash, role, is_inactive FROM staff WHERE username = ?",
        [email]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Invalid username or password" },
          { status: 401 }
        );
      }

      const staff = rows[0];

      if (staff.is_inactive) {
        return NextResponse.json(
          { error: "Your staff account has been deactivated." },
          { status: 403 }
        );
      }

      if (!staff.password_hash || staff.password_hash.length < 20) {
        return NextResponse.json(
          { error: "Account password not set. Run the setup migration." },
          { status: 401 }
        );
      }

      const valid = await verifyPassword(password, staff.password_hash);
      if (!valid) {
        return NextResponse.json(
          { error: "Invalid username or password" },
          { status: 401 }
        );
      }

      const staffRole = staff.role === "Admin" ? "admin" : "approver";
      const token = await createToken({
        id: staff.staff_id,
        role: staffRole as "admin" | "approver",
        name: staff.full_name,
      });

      const response = NextResponse.json({
        message: "Login successful",
        user: {
          id: staff.staff_id,
          name: staff.full_name,
          role: staffRole,
        },
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
