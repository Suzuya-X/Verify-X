-- VerifyX Supabase MVP Schema

-- 1. Synthetic Registry Table
CREATE TABLE synthetic_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type VARCHAR(50) DEFAULT 'verifyx_demo_id',
  document_number VARCHAR(100) UNIQUE NOT NULL,
  surname VARCHAR(100) NOT NULL,
  given_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality VARCHAR(10) NOT NULL,
  sex VARCHAR(1) NOT NULL,
  date_of_issue DATE NOT NULL,
  date_of_expiry DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert synthetic records
INSERT INTO synthetic_registry (document_type, document_number, surname, given_name, date_of_birth, nationality, sex, date_of_issue, date_of_expiry, status)
VALUES 
  ('passport', 'VX1234567', 'SHARMA', 'RAHUL', '2002-08-14', 'IND', 'M', '2022-06-13', '2032-06-12', 'ACTIVE'),
  ('passport', 'VX8392014', 'DAS', 'ANANYA', '2001-03-21', 'IND', 'F', '2021-11-10', '2031-11-09', 'ACTIVE'),
  ('passport', 'VX5518239', 'PATEL', 'ARJUN', '1999-12-04', 'IND', 'M', '2019-02-19', '2025-02-18', 'EXPIRED'),
  ('passport', 'P1234567', 'Sharma', 'Rahul', '2002-08-14', 'IND', 'M', '2022-06-13', '2032-06-12', 'ACTIVE');


-- 2. Verification Audit Table
CREATE TABLE verification_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  verification_id VARCHAR(50) UNIQUE NOT NULL,
  document_number VARCHAR(100) NOT NULL,
  document_type VARCHAR(50),
  status VARCHAR(20) NOT NULL,
  verification_score INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  result_hash VARCHAR(64) NOT NULL,
  matches JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add Fabric Fields
ALTER TABLE verification_audits ADD COLUMN IF NOT EXISTS fabric_transaction_id VARCHAR(255);
ALTER TABLE verification_audits ADD COLUMN IF NOT EXISTS fabric_status VARCHAR(50);

-- Set up Row Level Security (RLS) - Optional for MVP but good practice
ALTER TABLE synthetic_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_audits ENABLE ROW LEVEL SECURITY;

-- Service Role Key bypasses RLS naturally, so no policies needed if only accessed securely from Server Actions.
