const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

(async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const staffPw = await bcrypt.hash('admin123', 12);
    const userPw = await bcrypt.hash('user123', 12);

    // Insert staff
    await client.query(
      `INSERT INTO staff (full_name, role, username, password_hash, is_inactive, created_at)
       VALUES ('Admin User', 'Admin', 'admin', $1, false, NOW()),
              ('Approver One', 'Approver', 'approver1', $2, false, NOW())`,
      [staffPw, staffPw]
    );
    console.log('Staff inserted');

    // Insert users
    await client.query(
      `INSERT INTO users (first_name, middle_name, last_name, gender, birthdate, email_address, password_hash, created_at)
       VALUES ('Alice', NULL, 'Smith', 'Female', '1990-05-12', 'alice@example.com', $1, NOW()),
              ('Bob', NULL, 'Jones', 'Male', '1985-11-23', 'bob@example.com', $2, NOW()),
              ('Carol', NULL, 'Black', 'Female', '1998-02-14', 'carol@example.com', $3, NOW())`,
      [userPw, userPw, userPw]
    );
    console.log('Users inserted');

    // Insert loan types
    await client.query(
      `INSERT INTO loan_types (loan_type_name, created_at)
       VALUES ('Personal Loan', NOW()), ('Salary Loan', NOW())`
    );
    console.log('Loan types inserted');

    // Insert loan purposes
    await client.query(
      `INSERT INTO loan_purposes (loan_purpose_description, created_at)
       VALUES ('Medical', NOW()), ('Car purchase', NOW())`
    );
    console.log('Loan purposes inserted');

    // Get IDs
    const { rows: users } = await client.query('SELECT user_id FROM users ORDER BY user_id LIMIT 3');
    const { rows: ltypes } = await client.query('SELECT loan_type_id FROM loan_types LIMIT 1');
    const { rows: lpurp } = await client.query('SELECT loan_purpose_id FROM loan_purposes LIMIT 1');

    const uid1 = users[0].user_id;
    const uid2 = users[1].user_id;
    const ltid = ltypes[0].loan_type_id;
    const lpid = lpurp[0].loan_purpose_id;

    // Insert loans
    await client.query(
      `INSERT INTO loans (user_id, loan_type_id, loan_purpose_id, principal_amt, term_months, interest_rate, current_balance, loan_status, release_frequency, created_at)
       VALUES ($1, $2, $3, 50000, 12, 0.04, 48000, 'Active', 'monthly', NOW()),
              ($4, $5, $6, 100000, 24, 0.035, 95000, 'Pending', 'monthly', NOW())`,
      [uid1, ltid, lpid, uid2, ltid, lpid]
    );
    console.log('Loans inserted');

    // Insert payments
    const { rows: loans } = await client.query('SELECT loan_id FROM loans LIMIT 1');
    await client.query(
      `INSERT INTO loan_payments (loan_id, payment_date, amount_paid, payment_method, payment_status, created_at)
       VALUES ($1, NOW(), 2000, 'Cash', 'Verified', NOW()),
              ($2, NOW(), 2000, 'GCash', 'Pending', NOW())`,
      [loans[0].loan_id, loans[0].loan_id]
    );
    console.log('Payments inserted');

    await client.query('COMMIT');
    console.log('Done! Sample credentials:');
    console.log('  User login: alice@example.com / user123');
    console.log('  Staff login: admin / admin123');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
})().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
