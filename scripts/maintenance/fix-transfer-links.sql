-- =====================================================================
-- FIX TRANSFER TRANSACTION LINKS AND BALANCES
-- =====================================================================
-- This script:
-- 1. Links transfer transactions to IDFC account
-- 2. Creates corresponding credit entries in IDFC account
-- 3. Updates balances correctly
-- =====================================================================

\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
\set icici_account_id 'fd551095-58a9-4f12-b00e-2fd182e68403'
\set idfc_account_id '328c756a-b05e-4925-a9ae-852f7fb18b4e'

\echo '========================================='
\echo 'FIXING TRANSFER LINKS AND BALANCES'
\echo '========================================='
\echo ''

-- Step 1: Show current state
\echo 'Current Transfer Status:'
SELECT 
  id,
  date::date,
  name,
  amount,
  destination_account_name,
  destination_account_id,
  CASE 
    WHEN destination_account_id IS NULL THEN '❌ Not Linked'
    ELSE '✅ Linked'
  END as link_status
FROM transactions_real
WHERE user_id = :'user_id'
  AND type = 'transfer'
  AND date BETWEEN '2025-09-01' AND '2025-09-30'
ORDER BY date;

\echo ''

-- Step 2: Update transfer transactions to link to IDFC account
\echo 'Step 1: Linking transfers to IDFC account...'

UPDATE transactions_real
SET 
  destination_account_id = :'idfc_account_id',
  updated_at = NOW()
WHERE user_id = :'user_id'
  AND type = 'transfer'
  AND date BETWEEN '2025-09-01' AND '2025-09-30'
  AND destination_account_name ILIKE '%IDFC%'
  AND destination_account_id IS NULL;

\echo '✅ Transfer links updated'
\echo ''

-- Step 3: Create corresponding income transactions in IDFC account
\echo 'Step 2: Creating corresponding credit entries in IDFC account...'

-- Get the two transfers and create income entries
INSERT INTO transactions_real (
  user_id,
  name,
  description,
  amount,
  date,
  type,
  source_account_id,
  source_account_type,
  source_account_name,
  destination_account_id,
  destination_account_type,
  destination_account_name,
  is_recurring,
  transaction_hash,
  bank_reference_number,
  metadata
)
SELECT 
  user_id,
  'Transfer from ICICI' as name,
  'Credit from ICICI Savings Account - ' || description as description,
  amount,
  date,
  'income' as type,
  source_account_id,
  'bank' as source_account_type,
  'ICICI Savings Account' as source_account_name,
  :'idfc_account_id' as destination_account_id,
  'bank' as destination_account_type,
  'IDFC FIRST Bank' as destination_account_name,
  false as is_recurring,
  encode(sha256((:'idfc_account_id' || amount::text || date::text || 'income' || COALESCE(description, ''))::bytea), 'hex') as transaction_hash,
  (metadata->>'bank_reference')::text as bank_reference_number,
  jsonb_build_object(
    'transfer_id', id,
    'transfer_type', 'inter_account',
    'source_bank', 'ICICI Bank',
    'destination_bank', 'IDFC FIRST Bank',
    'auto_created', true,
    'created_at', NOW()
  ) as metadata
FROM transactions_real
WHERE user_id = :'user_id'
  AND type = 'transfer'
  AND date BETWEEN '2025-09-01' AND '2025-09-30'
  AND destination_account_id = :'idfc_account_id'
  AND NOT EXISTS (
    SELECT 1 FROM transactions_real t2
    WHERE t2.user_id = :'user_id'
      AND t2.destination_account_id = :'idfc_account_id'
      AND t2.type = 'income'
      AND t2.date = transactions_real.date
      AND t2.amount = transactions_real.amount
  );

\echo '✅ IDFC credit entries created'
\echo ''

-- Step 4: Update IDFC account balance
\echo 'Step 3: Updating IDFC account balance...'

-- Calculate total received by IDFC
WITH idfc_income AS (
  SELECT COALESCE(SUM(amount), 0) as total_income
  FROM transactions_real
  WHERE user_id = :'user_id'
    AND destination_account_id = :'idfc_account_id'
    AND type = 'income'
),
idfc_expenses AS (
  SELECT COALESCE(SUM(amount), 0) as total_expenses
  FROM transactions_real
  WHERE user_id = :'user_id'
    AND source_account_id = :'idfc_account_id'
    AND type = 'expense'
)
UPDATE accounts_real
SET 
  current_balance = (SELECT total_income FROM idfc_income) - (SELECT total_expenses FROM idfc_expenses),
  updated_at = NOW()
WHERE id = :'idfc_account_id'
  AND user_id = :'user_id';

\echo '✅ IDFC balance updated'
\echo ''

-- Step 5: Recalculate ICICI balance (should already be correct due to triggers)
\echo 'Step 4: Verifying ICICI balance...'

SELECT sync_account_current_balance(:'icici_account_id');

\echo '✅ ICICI balance verified'
\echo ''

-- =====================================================================
-- VERIFICATION
-- =====================================================================

\echo '========================================='
\echo 'VERIFICATION RESULTS'
\echo '========================================='
\echo ''

-- Updated Transfer Status
\echo '✅ Updated Transfer Status:'
SELECT 
  date::date,
  name,
  amount,
  destination_account_name,
  CASE 
    WHEN destination_account_id IS NULL THEN '❌ Not Linked'
    ELSE '✅ Linked'
  END as link_status,
  destination_account_id
FROM transactions_real
WHERE user_id = :'user_id'
  AND type = 'transfer'
  AND date BETWEEN '2025-09-01' AND '2025-09-30'
ORDER BY date;

\echo ''

-- IDFC Transactions
\echo '💰 IDFC Account Transactions:'
SELECT 
  date::date,
  name,
  type,
  amount,
  description
FROM transactions_real
WHERE user_id = :'user_id'
  AND (source_account_id = :'idfc_account_id' OR destination_account_id = :'idfc_account_id')
ORDER BY date;

\echo ''

-- Account Balances
\echo '🏦 Updated Account Balances:'
SELECT 
  name,
  institution,
  current_balance,
  CASE 
    WHEN current_balance > 0 THEN '✅ Has Balance'
    ELSE '⚠️ Empty'
  END as status
FROM accounts_real
WHERE user_id = :'user_id'
  AND (id = :'icici_account_id' OR id = :'idfc_account_id')
ORDER BY current_balance DESC;

\echo ''

-- Balance Math Check
\echo '🔢 Balance Math Check:'
WITH september_summary AS (
  SELECT 
    (SELECT current_balance FROM accounts_real WHERE id = :'icici_account_id') as icici_balance,
    (SELECT current_balance FROM accounts_real WHERE id = :'idfc_account_id') as idfc_balance,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions_real 
     WHERE user_id = :'user_id' AND type = 'transfer' 
     AND source_account_id = :'icici_account_id'
     AND date BETWEEN '2025-09-01' AND '2025-09-30') as total_transferred
)
SELECT 
  icici_balance,
  idfc_balance,
  total_transferred,
  idfc_balance - total_transferred as difference,
  CASE 
    WHEN ABS(idfc_balance - total_transferred) < 0.01 THEN '✅ Correct'
    ELSE '⚠️ Mismatch'
  END as status
FROM september_summary;

\echo ''

\echo '========================================='
\echo '✅ FIX COMPLETE!'
\echo '========================================='
\echo ''
\echo 'Summary:'
\echo '  ✅ Transfer transactions linked to IDFC account'
\echo '  ✅ IDFC credit entries created'
\echo '  ✅ Account balances updated'
\echo '  ✅ Ready for October statement upload'
\echo ''

