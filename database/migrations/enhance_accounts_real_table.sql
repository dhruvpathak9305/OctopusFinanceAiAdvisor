-- =====================================================================
-- ENHANCE ACCOUNTS_REAL TABLE
-- =====================================================================
-- Add columns for:
-- 1. Initial balance (when account was first opened)
-- 2. Relationship Manager details
-- 3. Customer Service Manager details
-- 4. Nomination details
-- 5. Additional tracking fields
-- =====================================================================

-- =====================================================================
-- STEP 1: Add Balance Tracking Columns
-- =====================================================================

-- Initial balance when account was first opened (one-time historical value)
ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS initial_balance DECIMAL(15, 2) DEFAULT 0;

-- Date when account was opened
ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS account_opening_date DATE;

-- Current balance (may differ from balance_real table)
ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS current_balance DECIMAL(15, 2) DEFAULT 0;

COMMENT ON COLUMN accounts_real.initial_balance IS 
'One-time initial deposit when account was first opened (historical value)';

COMMENT ON COLUMN accounts_real.account_opening_date IS 
'Date when the account was first opened at the bank';

COMMENT ON COLUMN accounts_real.current_balance IS 
'Current balance - synced from latest transaction or statement';

-- =====================================================================
-- STEP 2: Add Relationship Manager Details
-- =====================================================================

ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS relationship_manager_name TEXT;

ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS relationship_manager_contact TEXT;

ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS relationship_manager_email TEXT;

ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS customer_service_manager_name TEXT;

ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS customer_service_manager_contact TEXT;

ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS customer_service_manager_email TEXT;

COMMENT ON COLUMN accounts_real.relationship_manager_name IS 
'Name of assigned Relationship Manager from bank';

COMMENT ON COLUMN accounts_real.relationship_manager_contact IS 
'Contact number of Relationship Manager';

COMMENT ON COLUMN accounts_real.customer_service_manager_name IS 
'Name of Customer Service Manager';

-- =====================================================================
-- STEP 3: Add Nomination & Account Status
-- =====================================================================

ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS nomination_status TEXT DEFAULT 'not_registered';

ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS nominee_name TEXT;

ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS nominee_relationship TEXT;

ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';

ALTER TABLE accounts_real 
ADD COLUMN IF NOT EXISTS account_category TEXT; -- 'regular', 'premium', 'wealth', 'salary'

COMMENT ON COLUMN accounts_real.nomination_status IS 
'Nomination status: registered, not_registered, pending';

COMMENT ON COLUMN accounts_real.account_status IS 
'Current status: active, inactive, dormant, closed';

COMMENT ON COLUMN accounts_real.account_category IS 
'Account category: regular, premium, wealth, salary';

-- =====================================================================
-- STEP 4: Add Constraints
-- =====================================================================

-- Add check constraint for nomination_status
ALTER TABLE accounts_real 
DROP CONSTRAINT IF EXISTS check_nomination_status;

ALTER TABLE accounts_real 
ADD CONSTRAINT check_nomination_status 
CHECK (nomination_status IN ('registered', 'not_registered', 'pending'));

-- Add check constraint for account_status
ALTER TABLE accounts_real 
DROP CONSTRAINT IF EXISTS check_account_status;

ALTER TABLE accounts_real 
ADD CONSTRAINT check_account_status 
CHECK (account_status IN ('active', 'inactive', 'dormant', 'closed'));

-- Add check constraint for account_category
ALTER TABLE accounts_real 
DROP CONSTRAINT IF EXISTS check_account_category;

ALTER TABLE accounts_real 
ADD CONSTRAINT check_account_category 
CHECK (account_category IN ('regular', 'premium', 'wealth', 'salary', 'business', 'savings'));

-- =====================================================================
-- STEP 5: Update Existing ICICI Record
-- =====================================================================

-- Example: Update ICICI account with data from statement
-- Replace with actual values from your statement

UPDATE accounts_real
SET 
  account_number = '388101502899',
  bank_holder_name = 'MR. DHRUV PATHAK',
  branch_address = 'E - 146 NEAR INDIRA PARK SECTOR - B ALIGANJ, LUCKNOW, UTTAR PRADESH - 226024',
  institution = 'ICICI Bank',
  ifsc_code = '700229137',
  micr_code = 'ICIC0008881',
  currency = 'INR',
  type = 'savings',
  nomination_status = 'registered',
  account_status = 'active',
  crn = 'XXXX07947', -- Customer ID
  current_balance = 5525174.67, -- Latest balance from statement
  updated_at = NOW()
WHERE id = 'fd551095-58a9-4f12-b00e-2fd182e68403'
  AND user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9';

-- If no existing ICICI record, insert new one
INSERT INTO accounts_real (
  id,
  user_id,
  name,
  account_number,
  bank_holder_name,
  branch_address,
  institution,
  ifsc_code,
  micr_code,
  currency,
  type,
  nomination_status,
  account_status,
  crn,
  current_balance
)
SELECT 
  'fd551095-58a9-4f12-b00e-2fd182e68403',
  '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9',
  'ICICI Savings Account',
  '388101502899',
  'MR. DHRUV PATHAK',
  'E - 146 NEAR INDIRA PARK SECTOR - B ALIGANJ, LUCKNOW, UTTAR PRADESH - 226024',
  'ICICI Bank',
  '700229137',
  'ICIC0008881',
  'INR',
  'savings',
  'registered',
  'active',
  'XXXX07947',
  5525174.67
WHERE NOT EXISTS (
  SELECT 1 FROM accounts_real 
  WHERE id = 'fd551095-58a9-4f12-b00e-2fd182e68403'
);

-- =====================================================================
-- STEP 6: Create Function to Distinguish Balances
-- =====================================================================

-- Function to explain balance types
CREATE OR REPLACE FUNCTION get_balance_explanation()
RETURNS TABLE(
  balance_type TEXT,
  description TEXT,
  example TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'initial_balance'::TEXT,
    'One-time balance when account was first opened at the bank'::TEXT,
    'If you opened ICICI account on Jan 1, 2020 with ₹10,000, that is initial_balance'::TEXT
  UNION ALL
  SELECT 
    'monthly_opening_balance'::TEXT,
    'Balance at the start of each monthly statement period'::TEXT,
    'Balance on Sep 1, 2025 in statement = ₹53,61,584.77 (from balance_real table)'::TEXT
  UNION ALL
  SELECT 
    'current_balance'::TEXT,
    'Latest balance after most recent transaction'::TEXT,
    'Balance on Sep 30, 2025 = ₹55,25,174.67 (synced to accounts_real)'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- STEP 7: Function to Sync Current Balance
-- =====================================================================

CREATE OR REPLACE FUNCTION sync_account_current_balance(
  p_account_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  latest_balance DECIMAL;
BEGIN
  -- Get latest balance from balance_real
  SELECT current_balance INTO latest_balance
  FROM balance_real
  WHERE account_id = p_account_id
  ORDER BY last_updated DESC
  LIMIT 1;
  
  -- If no balance found, try from latest transaction
  IF latest_balance IS NULL THEN
    SELECT (metadata->>'balance_after_transaction')::DECIMAL INTO latest_balance
    FROM transactions_real
    WHERE source_account_id = p_account_id
      OR destination_account_id = p_account_id
    ORDER BY date DESC
    LIMIT 1;
  END IF;
  
  -- Update accounts_real
  IF latest_balance IS NOT NULL THEN
    UPDATE accounts_real
    SET current_balance = latest_balance,
        updated_at = NOW()
    WHERE id = p_account_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON TABLE accounts_real IS 
'Enhanced accounts table with RM details, nomination, and balance tracking';

-- =====================================================================
-- EXAMPLE USAGE
-- =====================================================================

/*
-- View balance explanation
SELECT * FROM get_balance_explanation();

-- Sync current balance
SELECT sync_account_current_balance('fd551095-58a9-4f12-b00e-2fd182e68403');

-- Update RM details
UPDATE accounts_real
SET relationship_manager_name = 'Rajesh Kumar',
    relationship_manager_contact = '+91-9876543210',
    relationship_manager_email = 'rajesh.kumar@icicibank.com'
WHERE id = 'fd551095-58a9-4f12-b00e-2fd182e68403';

-- Update nomination
UPDATE accounts_real
SET nomination_status = 'registered',
    nominee_name = 'Mrs. Priya Pathak',
    nominee_relationship = 'Spouse'
WHERE id = 'fd551095-58a9-4f12-b00e-2fd182e68403';

-- Query accounts with all new fields
SELECT 
  name,
  account_number,
  initial_balance,
  current_balance,
  account_opening_date,
  relationship_manager_name,
  nomination_status,
  account_status
FROM accounts_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9';
*/

-- =====================================================================
-- BALANCE TRACKING SUMMARY
-- =====================================================================

/*
UNDERSTANDING DIFFERENT BALANCES:

1. initial_balance (accounts_real)
   - When: One-time, when account was first opened
   - Example: You opened ICICI account in 2020 with ₹10,000
   - Purpose: Historical record of how much you started with
   - Updated: Never (historical value)

2. monthly_opening_balance (balance_real)
   - When: Start of each monthly statement
   - Example: On Sep 1, 2025, balance was ₹53,61,584.77
   - Purpose: Track monthly statement opening balances
   - Updated: Once per month (from statement)

3. current_balance (accounts_real)
   - When: After every transaction
   - Example: On Sep 30, 2025, balance is ₹55,25,174.67
   - Purpose: Show real-time current balance
   - Updated: After each transaction or statement upload

4. balance_after_transaction (transactions_real.metadata)
   - When: After each individual transaction
   - Example: After Amazon payment, balance = ₹51,85,634.57
   - Purpose: Track balance after each transaction
   - Updated: Per transaction

WHY THIS MATTERS:

- initial_balance: Helps calculate total returns/growth over account lifetime
- monthly_opening_balance: Required for monthly statement reconciliation
- current_balance: Shows latest balance for dashboard/net worth
- balance_after_transaction: Audit trail and balance verification
*/

