const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  const c = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    database: 'mycreditfilipinas_database',
  });

  const staffPw = await bcrypt.hash('admin123', 12);
  const userPw = await bcrypt.hash('user123', 12);

  // Insert staff
  await c.query(
    `INSERT INTO staff (full_name, role, username, password_hash, is_inactive, created_at)
     VALUES ('Admin User', 'Admin', 'admin', ?, 0, NOW()),
            ('Approver One', 'Approver', 'approver1', ?, 0, NOW())`,
    [staffPw, staffPw]
  );
  console.log('Staff inserted');

  // Insert users
  await c.query(
    `INSERT INTO users (first_name, middle_name, last_name, gender, birthdate, email_address, password_hash, created_at)
     VALUES ('Alice', NULL, 'Smith', 'Female', '1990-05-12', 'alice@example.com', ?, NOW()),
            ('Bob', NULL, 'Jones', 'Male', '1985-11-23', 'bob@example.com', ?, NOW()),
            ('Carol', NULL, 'Black', 'Female', '1998-02-14', 'carol@example.com', ?, NOW())`,
    [userPw, userPw, userPw]
  );
  console.log('Users inserted');

  // Insert loan types
  await c.query(
    `INSERT INTO loan_types (loan_type_name, created_at)
     VALUES ('Personal Loan', NOW()), ('Salary Loan', NOW())`
  );
  console.log('Loan types inserted');

  // Insert loan purposes
  await c.query(
    `INSERT INTO loan_purposes (loan_purpose_description, created_at)
     VALUES ('Medical', NOW()), ('Car purchase', NOW())`
  );
  console.log('Loan purposes inserted');

  // Get IDs
  const [users] = await c.query('SELECT user_id FROM users ORDER BY user_id LIMIT 3');
  const [ltypes] = await c.query('SELECT loan_type_id FROM loan_types LIMIT 1');
  const [lpurp] = await c.query('SELECT loan_purpose_id FROM loan_purposes LIMIT 1');

  const uid1 = users[0].user_id;
  const uid2 = users[1].user_id;
  const ltid = ltypes[0].loan_type_id;
  const lpid = lpurp[0].loan_purpose_id;

  // Insert loans
  await c.query(
    `INSERT INTO loans (user_id, loan_type_id, loan_purpose_id, principal_amt, term_months, interest_rate, current_balance, loan_status, release_frequency, created_at)
     VALUES (?, ?, ?, 50000, 12, 0.04, 48000, 'Active', 'monthly', NOW()),
            (?, ?, ?, 100000, 24, 0.035, 95000, 'Pending', 'monthly', NOW())`,
    [uid1, ltid, lpid, uid2, ltid, lpid]
  );
  console.log('Loans inserted');

  // Insert payments
  const [loans] = await c.query('SELECT loan_id FROM loans LIMIT 1');
  await c.query(
    `INSERT INTO loan_payments (loan_id, payment_date, amount_paid, payment_method, payment_status, created_at)
     VALUES (?, NOW(), 2000, 'Cash', 'Verified', NOW()),
            (?, NOW(), 2000, 'GCash', 'Pending', NOW())`,
    [loans[0].loan_id, loans[0].loan_id]
  );
  console.log('Payments inserted');

  await c.end();
  console.log('Done! Sample credentials:');
  console.log('  User login: alice@example.com / user123');
  console.log('  Staff login: admin / admin123');
})().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
