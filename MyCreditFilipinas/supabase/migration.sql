-- ============================================================
-- MyCreditFilipinas: MySQL → PostgreSQL (Supabase) Migration
-- ============================================================

-- 1. Create ENUM types
CREATE TYPE contact_type_enum AS ENUM ('Personal', 'Work', 'Parent');
CREATE TYPE payment_status_enum AS ENUM ('Pending', 'Verified', 'Rejected');
CREATE TYPE schedule_status_enum AS ENUM ('Unpaid', 'Partial', 'Paid', 'Overdue');
CREATE TYPE loan_status_enum AS ENUM ('Pending', 'Approved', 'Denied', 'Active', 'Paid', 'Defaulted', 'Frozen');
CREATE TYPE release_frequency_enum AS ENUM ('bi-monthly', 'monthly');
CREATE TYPE staff_role_enum AS ENUM ('Admin', 'Approver');
CREATE TYPE address_type_enum AS ENUM ('birth_place', 'present', 'other');
CREATE TYPE residence_type_enum AS ENUM ('Owned(personal)', 'Owned but living with parents/relatives', 'Rented', 'Rented but living with parents/relatives');
CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE reference_type_enum AS ENUM ('relative', 'friend', 'work friend');

-- 2. Create tables

-- users
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  first_name VARCHAR(100),
  middle_name VARCHAR(100),
  last_name VARCHAR(100),
  suffix VARCHAR(20),
  gender gender_enum,
  birthdate DATE,
  facebook VARCHAR(255),
  email_address VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  is_inactive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- staff
CREATE TABLE staff (
  staff_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100),
  role staff_role_enum,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  is_inactive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- addresses
CREATE TABLE addresses (
  address_id SERIAL PRIMARY KEY,
  building_floor VARCHAR(255),
  lot VARCHAR(255),
  blk VARCHAR(255),
  purok VARCHAR(255),
  barangay VARCHAR(255),
  city VARCHAR(255),
  full_address_string VARCHAR(512),
  landmarks VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- user_addresses
CREATE TABLE user_addresses (
  user_address_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  address_id INTEGER NOT NULL REFERENCES addresses(address_id),
  address_type address_type_enum,
  residence_type residence_type_enum,
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  moved_out_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE INDEX idx_ua_user ON user_addresses(user_id);
CREATE INDEX idx_ua_address ON user_addresses(address_id);

-- contact_numbers
CREATE TABLE contact_numbers (
  contact_number_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  contact_number VARCHAR(15),
  contact_type contact_type_enum,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE INDEX idx_contact_user ON contact_numbers(user_id);

-- user_profiles
CREATE TABLE user_profiles (
  user_profile_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id),
  occupation VARCHAR(100),
  employer_agency VARCHAR(100),
  previous_employer VARCHAR(100),
  educational_attainment VARCHAR(255),
  income NUMERIC(15,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- bank_accounts
CREATE TABLE bank_accounts (
  bank_account_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  bank_name VARCHAR(100),
  card_number VARCHAR(16),
  card_expiry_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE INDEX idx_bank_user ON bank_accounts(user_id);

-- "references" (reserved word — always double-quote)
CREATE TABLE "references" (
  reference_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  reference_type reference_type_enum,
  name VARCHAR(100),
  address VARCHAR(256),
  contact_number VARCHAR(15),
  verification_notes TEXT,
  verified_by INTEGER REFERENCES staff(staff_id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE INDEX idx_ref_user ON "references"(user_id);
CREATE INDEX idx_ref_staff ON "references"(verified_by);

-- loan_types
CREATE TABLE loan_types (
  loan_type_id SERIAL PRIMARY KEY,
  loan_type_name VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- loan_purposes
CREATE TABLE loan_purposes (
  loan_purpose_id SERIAL PRIMARY KEY,
  loan_purpose_description VARCHAR(256),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- loans
CREATE TABLE loans (
  loan_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  loan_type_id INTEGER NOT NULL REFERENCES loan_types(loan_type_id),
  loan_purpose_id INTEGER NOT NULL REFERENCES loan_purposes(loan_purpose_id),
  principal_amt NUMERIC(15,2),
  term_months INTEGER,
  amortization NUMERIC(15,2),
  fees NUMERIC(15,2),
  profit NUMERIC(15,2),
  interest_rate NUMERIC(15,2) DEFAULT 0.04,
  current_balance NUMERIC(15,2),
  loan_status loan_status_enum NOT NULL DEFAULT 'Pending',
  processed_by INTEGER REFERENCES staff(staff_id),
  decision_date TIMESTAMP,
  date_released TIMESTAMP,
  term_due TIMESTAMP,
  release_frequency release_frequency_enum,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  remarks TEXT
);
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_type ON loans(loan_type_id);
CREATE INDEX idx_loans_purpose ON loans(loan_purpose_id);
CREATE INDEX idx_loans_staff ON loans(processed_by);

-- loan_payments
CREATE TABLE loan_payments (
  payment_id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(loan_id),
  payment_date TIMESTAMP,
  amount_paid NUMERIC(15,2),
  penalty_amount NUMERIC(15,2),
  payment_method VARCHAR(50),
  payment_status payment_status_enum,
  verified_by INTEGER REFERENCES staff(staff_id),
  transaction_id VARCHAR(50),
  attachment_url VARCHAR(255),
  remarks VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE INDEX idx_payment_loan ON loan_payments(loan_id);
CREATE INDEX idx_payment_staff ON loan_payments(verified_by);

-- loan_schedules
CREATE TABLE loan_schedules (
  schedule_id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(loan_id),
  due_date DATE,
  scheduled_amount NUMERIC(15,2),
  paid_amount NUMERIC(15,2),
  status schedule_status_enum
);
CREATE INDEX idx_schedule_loan ON loan_schedules(loan_id);

-- loan_releases
CREATE TABLE loan_releases (
  release_id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(loan_id),
  release_date DATE,
  amount_released NUMERIC(15,2),
  bank_account_id INTEGER REFERENCES bank_accounts(bank_account_id),
  reference_no VARCHAR(100),
  released_by_ceo_id INTEGER REFERENCES staff(staff_id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE INDEX idx_release_loan ON loan_releases(loan_id);
CREATE INDEX idx_release_bank ON loan_releases(bank_account_id);
CREATE INDEX idx_release_ceo ON loan_releases(released_by_ceo_id);

-- "reject" (reserved-ish word — double-quote for safety)
CREATE TABLE "reject" (
  loan_id INTEGER PRIMARY KEY REFERENCES loans(loan_id),
  date_rejected TIMESTAMP,
  rejected_reason VARCHAR(255)
);

-- ============================================================
-- Enable Supabase Storage for receipts bucket (run separately)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);
-- ============================================================
