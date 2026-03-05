const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgresql://postgres.hbwriubcrsyijaydefed:3ne0vKHWkVgUHBX0@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await pool.query(
      `INSERT INTO storage.buckets (id, name, public)
       VALUES ('receipts', 'receipts', true)
       ON CONFLICT (id) DO NOTHING`
    );
    console.log("Receipts bucket created successfully");

    // Allow anyone to read from receipts bucket
    try {
      await pool.query(`
        CREATE POLICY "receipts_select"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'receipts')
      `);
      console.log("Select policy created");
    } catch (e) {
      if (e.message.includes("already exists")) console.log("Select policy already exists");
      else console.error("Select policy error:", e.message);
    }

    // Allow inserts to receipts bucket
    try {
      await pool.query(`
        CREATE POLICY "receipts_insert"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'receipts')
      `);
      console.log("Insert policy created");
    } catch (e) {
      if (e.message.includes("already exists")) console.log("Insert policy already exists");
      else console.error("Insert policy error:", e.message);
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
  await pool.end();
}

run();
