-- ================================================================
-- MIGRATION: Add Complete Account Metadata Columns
-- ================================================================
-- 
-- Purpose: Add all missing metadata fields to accounts_real table
--          to eliminate need for external JSON files
-- 
-- Date: 2025-10-20
-- Author: System Migration
-- 
-- What this adds:
--   - Account holder contact information (email, phone)
--   - Account holder personal details (father's name)
--   - Complete address fields (street, city, state, postal, country)
--   - Complete branch address fields
--   - GSTIN (Tax ID)
--   - Overdraft limit
--   - Detailed account type description
-- 
-- ================================================================

-- Start transaction
BEGIN;

-- Add account holder contact information
ALTER TABLE accounts_real
ADD COLUMN IF NOT EXISTS holder_email TEXT,
ADD COLUMN IF NOT EXISTS holder_phone TEXT,
ADD COLUMN IF NOT EXISTS holder_father_name TEXT;

-- Add account holder address fields
ALTER TABLE accounts_real
ADD COLUMN IF NOT EXISTS holder_address_street TEXT,
ADD COLUMN IF NOT EXISTS holder_address_city TEXT,
ADD COLUMN IF NOT EXISTS holder_address_state TEXT,
ADD COLUMN IF NOT EXISTS holder_address_postal_code TEXT,
ADD COLUMN IF NOT EXISTS holder_address_country TEXT DEFAULT 'India';

-- Add complete branch address fields
ALTER TABLE accounts_real
ADD COLUMN IF NOT EXISTS branch_city TEXT,
ADD COLUMN IF NOT EXISTS branch_state TEXT,
ADD COLUMN IF NOT EXISTS branch_postal_code TEXT,
ADD COLUMN IF NOT EXISTS branch_country TEXT DEFAULT 'India';

-- Add banking details
ALTER TABLE accounts_real
ADD COLUMN IF NOT EXISTS gstin TEXT,
ADD COLUMN IF NOT EXISTS overdraft_limit NUMERIC(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS account_type_details TEXT;

-- Add branch code (extracted from IFSC)
ALTER TABLE accounts_real
ADD COLUMN IF NOT EXISTS branch_code TEXT;

-- Add comments for documentation
COMMENT ON COLUMN accounts_real.holder_email IS 'Account holder email address';
COMMENT ON COLUMN accounts_real.holder_phone IS 'Account holder phone number';
COMMENT ON COLUMN accounts_real.holder_father_name IS 'Account holder father/guardian name';
COMMENT ON COLUMN accounts_real.holder_address_street IS 'Account holder street address';
COMMENT ON COLUMN accounts_real.holder_address_city IS 'Account holder city';
COMMENT ON COLUMN accounts_real.holder_address_state IS 'Account holder state';
COMMENT ON COLUMN accounts_real.holder_address_postal_code IS 'Account holder postal/PIN code';
COMMENT ON COLUMN accounts_real.holder_address_country IS 'Account holder country';
COMMENT ON COLUMN accounts_real.branch_city IS 'Branch city';
COMMENT ON COLUMN accounts_real.branch_state IS 'Branch state';
COMMENT ON COLUMN accounts_real.branch_postal_code IS 'Branch postal/PIN code';
COMMENT ON COLUMN accounts_real.branch_country IS 'Branch country';
COMMENT ON COLUMN accounts_real.gstin IS 'GST Identification Number (Tax ID)';
COMMENT ON COLUMN accounts_real.overdraft_limit IS 'Overdraft limit amount';
COMMENT ON COLUMN accounts_real.account_type_details IS 'Detailed account type description (e.g., Virtual Preferred)';
COMMENT ON COLUMN accounts_real.branch_code IS 'Branch code (extracted from IFSC)';

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_accounts_real_holder_email ON accounts_real(holder_email);
CREATE INDEX IF NOT EXISTS idx_accounts_real_gstin ON accounts_real(gstin);
CREATE INDEX IF NOT EXISTS idx_accounts_real_holder_city ON accounts_real(holder_address_city);
CREATE INDEX IF NOT EXISTS idx_accounts_real_branch_code ON accounts_real(branch_code);

-- Commit transaction
COMMIT;

-- Display summary
SELECT 
    'Migration completed successfully!' as status,
    COUNT(*) as total_accounts,
    COUNT(holder_email) as accounts_with_email,
    COUNT(gstin) as accounts_with_gstin
FROM accounts_real;

-- Show updated schema for accounts_real
\d accounts_real

