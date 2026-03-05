import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const loan_id = formData.get("loan_id");
    const amount_paid = formData.get("amount_paid");
    const payment_method = formData.get("payment_method");
    const transaction_id = formData.get("transaction_id") as string | null;
    const remarks = formData.get("remarks") as string | null;
    const receiptFile = formData.get("receipt") as File | null;

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
    const { rows: loans } = await pool.query(
      "SELECT loan_id, current_balance, loan_status FROM loans WHERE loan_id = $1 AND user_id = $2",
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

    // Handle receipt image upload via Supabase Storage
    let attachmentUrl: string | null = null;
    if (receiptFile && receiptFile.size > 0) {
      try {
        if (receiptFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Receipt image must be less than 5MB" },
            { status: 400 }
          );
        }

        const mimeToExt: Record<string, string> = {
          "image/png": "png",
          "image/jpeg": "jpg",
          "image/jpg": "jpg",
          "image/gif": "gif",
          "image/webp": "webp",
        };
        const ext = mimeToExt[receiptFile.type] || "jpg";

        const buffer = Buffer.from(await receiptFile.arrayBuffer());
        const filename = `receipt_${session.id}_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(filename, buffer, {
            contentType: receiptFile.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          // Fall back: continue without attachment
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("receipts")
            .getPublicUrl(filename);
          attachmentUrl = publicUrlData.publicUrl;
        }
      } catch (uploadErr) {
        console.error("Receipt upload error:", uploadErr);
        // Continue without attachment — don't fail the payment
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO loan_payments (
        loan_id, payment_date, amount_paid, payment_method,
        payment_status, transaction_id, remarks, attachment_url, created_at, updated_at
      ) VALUES ($1, NOW(), $2, $3, 'Pending', $4, $5, $6, NOW(), NOW())
      RETURNING payment_id`,
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
        payment_id: rows[0].payment_id,
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
