import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { loan_id, amount_paid, payment_method, transaction_id, remarks, receipt_image } =
      body;

    if (!loan_id || !amount_paid || !payment_method) {
      return NextResponse.json(
        { error: "Loan, amount, and payment method are required" },
        { status: 400 }
      );
    }

    if (Number(amount_paid) <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero" },
        { status: 400 }
      );
    }

    // Verify this loan belongs to the user and is Active
    const [loans] = await pool.query<RowDataPacket[]>(
      "SELECT loan_id, current_balance, loan_status FROM loans WHERE loan_id = ? AND user_id = ?",
      [loan_id, session.id]
    );

    if (loans.length === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    if (loans[0].loan_status !== "Active") {
      return NextResponse.json(
        { error: "Can only make payments on active loans" },
        { status: 400 }
      );
    }

    // Handle receipt image upload
    let attachmentUrl: string | null = null;
    if (receipt_image && typeof receipt_image === "string" && receipt_image.startsWith("data:image/")) {
      try {
        // Extract mimetype and base64 data
        const matches = receipt_image.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");

          // Limit file size to 5MB
          if (buffer.length > 5 * 1024 * 1024) {
            return NextResponse.json(
              { error: "Receipt image must be less than 5MB" },
              { status: 400 }
            );
          }

          const uploadsDir = path.join(process.cwd(), "public", "uploads", "receipts");
          await mkdir(uploadsDir, { recursive: true });

          const filename = `receipt_${session.id}_${Date.now()}.${ext}`;
          const filePath = path.join(uploadsDir, filename);
          await writeFile(filePath, buffer);

          attachmentUrl = `/uploads/receipts/${filename}`;
        }
      } catch (uploadErr) {
        console.error("Receipt upload error:", uploadErr);
        // Continue without attachment — don't fail the payment
      }
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO loan_payments (
        loan_id, payment_date, amount_paid, payment_method,
        payment_status, transaction_id, remarks, attachment_url, created_at, updated_at
      ) VALUES (?, NOW(), ?, ?, 'Pending', ?, ?, ?, NOW(), NOW())`,
      [
        loan_id,
        amount_paid,
        payment_method,
        transaction_id || null,
        remarks || null,
        attachmentUrl,
      ]
    );

    return NextResponse.json(
      {
        message: "Payment submitted successfully. It will be verified by staff.",
        payment_id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Payment submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit payment" },
      { status: 500 }
    );
  }
}
