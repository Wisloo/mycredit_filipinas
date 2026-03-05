import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // Check if user exists (we don't reveal this to the caller for privacy)
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT user_id FROM users WHERE email_address = ? LIMIT 1",
      [email.toLowerCase().trim()]
    );

    // In a production app you would generate a token, store it, and send an email here.
    // For now we simply acknowledge the request without revealing whether the email exists.
    console.log(
      rows.length > 0
        ? `[ForgotPassword] Reset requested for existing user: ${email}`
        : `[ForgotPassword] Reset requested for unknown email: ${email}`
    );

    return NextResponse.json({
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (err) {
    console.error("[ForgotPassword] Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
