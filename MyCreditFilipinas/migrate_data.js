/**
 * Migrate data from Railway MySQL to Supabase PostgreSQL
 * Tables must be created first via migration.sql
 */
const mysql = require("mysql2/promise");
const { Pool } = require("pg");

const mysqlPool = mysql.createPool({
  host: "ballast.proxy.rlwy.net",
  port: 43489,
  user: "root",
  password: "RHrkZaecrHVHiaGzqEflksuDPcuMEaJy",
  database: "railway",
});

const pgPool = new Pool({
  connectionString:
    "postgresql://postgres.hbwriubcrsyijaydefed:3ne0vKHWkVgUHBX0@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

// Tables in dependency order (parents first)
const TABLES = [
  "users",
  "staff",
  "addresses",
  "loan_types",
  "loan_purposes",
  "user_profiles",
  "contact_numbers",
  "bank_accounts",
  "user_addresses",
  "loans",
  "loan_payments",
  "loan_schedules",
  "loan_releases",
];
// "references" and "reject" handled specially (reserved words)

function pgValue(val, colName) {
  if (val === null || val === undefined) return null;
  // Convert MySQL tinyint(1) booleans
  if (
    colName === "is_inactive" ||
    colName === "is_primary" ||
    colName === "is_active"
  ) {
    return val === 1 || val === true;
  }
  // Convert Date objects to ISO strings for timestamps
  if (val instanceof Date) {
    return val.toISOString();
  }
  return val;
}

async function migrateTable(tableName, pgTableName) {
  const display = pgTableName || tableName;
  pgTableName = pgTableName || tableName;

  const [rows] = await mysqlPool.query(`SELECT * FROM \`${tableName}\``);
  if (rows.length === 0) {
    console.log(`  ${display}: 0 rows (skipped)`);
    return;
  }

  const columns = Object.keys(rows[0]);
  const pgColumns = columns.map((c) => `"${c}"`).join(", ");

  for (const row of rows) {
    const values = columns.map((c) => pgValue(row[c], c));
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    try {
      await pgPool.query(
        `INSERT INTO ${pgTableName} (${pgColumns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
        values
      );
    } catch (err) {
      console.error(`  Error inserting into ${display}:`, err.message);
      console.error(`  Row:`, JSON.stringify(row));
    }
  }

  console.log(`  ${display}: ${rows.length} rows migrated`);
}

async function resetSequences() {
  // Reset all serial sequences to max(id) + 1
  const seqMap = {
    users: "user_id",
    staff: "staff_id",
    addresses: "address_id",
    loan_types: "loan_type_id",
    loan_purposes: "loan_purpose_id",
    user_profiles: "user_profile_id",
    contact_numbers: "contact_number_id",
    bank_accounts: "bank_account_id",
    user_addresses: "user_address_id",
    loans: "loan_id",
    loan_payments: "payment_id",
    loan_schedules: "schedule_id",
    loan_releases: "release_id",
  };

  // "references" has reference_id
  const { rows: refMax } = await pgPool.query(
    `SELECT COALESCE(MAX(reference_id), 0) + 1 AS next FROM "references"`
  );
  await pgPool.query(
    `SELECT setval(pg_get_serial_sequence('"references"', 'reference_id'), $1, false)`,
    [refMax[0].next]
  );

  for (const [table, col] of Object.entries(seqMap)) {
    const { rows } = await pgPool.query(
      `SELECT COALESCE(MAX(${col}), 0) + 1 AS next FROM ${table}`
    );
    await pgPool.query(
      `SELECT setval(pg_get_serial_sequence('${table}', '${col}'), $1, false)`,
      [rows[0].next]
    );
  }
  console.log("  Sequences reset to max(id)+1");
}

async function run() {
  console.log("=== MySQL → Supabase Data Migration ===\n");

  // Disable FK checks during migration
  await pgPool.query("SET session_replication_role = 'replica'");

  for (const table of TABLES) {
    await migrateTable(table);
  }

  // Handle reserved-word tables
  await migrateTable("references", '"references"');
  await migrateTable("reject", '"reject"');

  // Re-enable FK checks
  await pgPool.query("SET session_replication_role = 'origin'");

  // Reset auto-increment sequences
  await resetSequences();

  console.log("\n=== Migration complete ===");
  await mysqlPool.end();
  await pgPool.end();
}

run().catch(console.error);
