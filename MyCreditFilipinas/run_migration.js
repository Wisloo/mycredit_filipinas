// Run PostgreSQL migration against Supabase
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: `postgresql://postgres.hbwriubcrsyijaydefed:3ne0vKHWkVgUHBX0@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const sql = fs.readFileSync(
    path.join(__dirname, "supabase", "migration.sql"),
    "utf8"
  );

  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log("Migration completed successfully!");

    // Verify tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log("Tables created:", res.rows.map((r) => r.table_name));
  } catch (err) {
    console.error("Migration error:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
