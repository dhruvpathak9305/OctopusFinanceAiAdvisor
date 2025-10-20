-- Script to populate balance_real table with current account balances
-- This should be run if the balance_real table is empty or has incorrect data

-- First, let's see what we have
SELECT 'Current balance_real records:' as info;
SELECT account_id, account_name, current_balance, opening_balance FROM balance_real;

SELECT 'Current accounts_real records:' as info;
SELECT id, name, institution, type FROM accounts_real;

-- Create balance records for accounts that don't have them
INSERT INTO balance_real (
  account_id,
  user_id,
  account_name,
  account_type,
  institution_name,
  account_number,
  currency,
  opening_balance,
  current_balance,
  last_updated,
  created_at
)
SELECT 
  a.id as account_id,
  a.user_id,
  a.name as account_name,
  a.type as account_type,
  a.institution as institution_name,
  a.account_number,
  COALESCE(a.currency, 'INR') as currency,
  0 as opening_balance,  -- Default to 0 for now
  0 as current_balance,  -- Will be calculated next
  now() as last_updated,
  now() as created_at
FROM accounts_real a
LEFT JOIN balance_real b ON a.id = b.account_id
WHERE b.account_id IS NULL;  -- Only insert for accounts without balance records

-- Now let's set some sample balances based on the account names
-- (This is just for testing - in real scenario, balances would come from transactions)
UPDATE balance_real 
SET 
  current_balance = CASE 
    WHEN account_name ILIKE '%jupiter%' THEN 150000.00
    WHEN account_name ILIKE '%sample%' THEN 250000.00
    WHEN account_name ILIKE '%kotak%mahindra%joint%' THEN 500000.00
    WHEN account_name ILIKE '%kotak%mahindra%' THEN 750000.00
    WHEN account_name ILIKE '%axis%' THEN 1000000.00
    WHEN account_name ILIKE '%hdfc%' THEN 1250000.00
    WHEN account_name ILIKE '%icici%' THEN 800000.00
    WHEN account_name ILIKE '%punjab%' THEN 433017.00
    ELSE 100000.00  -- Default balance for any other accounts
  END,
  opening_balance = CASE 
    WHEN account_name ILIKE '%jupiter%' THEN 100000.00
    WHEN account_name ILIKE '%sample%' THEN 200000.00
    WHEN account_name ILIKE '%kotak%mahindra%joint%' THEN 450000.00
    WHEN account_name ILIKE '%kotak%mahindra%' THEN 700000.00
    WHEN account_name ILIKE '%axis%' THEN 950000.00
    WHEN account_name ILIKE '%hdfc%' THEN 1200000.00
    WHEN account_name ILIKE '%icici%' THEN 750000.00
    WHEN account_name ILIKE '%punjab%' THEN 400000.00
    ELSE 80000.00  -- Default opening balance
  END,
  last_updated = now()
WHERE current_balance = 0;  -- Only update accounts with 0 balance

-- Show the results
SELECT 'Updated balance_real records:' as info;
SELECT 
  account_name,
  institution_name,
  account_type,
  opening_balance,
  current_balance,
  last_updated
FROM balance_real 
ORDER BY current_balance DESC;
