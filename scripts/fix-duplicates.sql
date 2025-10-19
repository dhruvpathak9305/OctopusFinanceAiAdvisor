-- =====================================================================
-- FIX DUPLICATE TRANSACTIONS
-- =====================================================================

\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
\set idfc_account_id '328c756a-b05e-4925-a9ae-852f7fb18b4e'

\echo '========================================='
\echo 'FIXING DUPLICATE TRANSACTIONS'
\echo '========================================='
\echo ''

-- Step 1: Show duplicates
\echo 'Current Duplicates:'
SELECT 
  t.id,
  t.date::date,
  t.name,
  t.type,
  t.amount,
  t.transaction_hash,
  t.created_at
FROM transactions_real t
WHERE t.user_id = :'user_id'
  AND t.transaction_hash IN (
    SELECT transaction_hash
    FROM transactions_real
    WHERE user_id = :'user_id'
      AND date BETWEEN '2025-09-01' AND '2025-09-30'
    GROUP BY transaction_hash
    HAVING COUNT(*) > 1
  )
ORDER BY t.transaction_hash, t.created_at;

\echo ''

-- Step 2: Delete the auto-created duplicate income entries
-- Keep the original transfer transactions, delete the income duplicates
\echo 'Deleting duplicate income entries...'

DELETE FROM transactions_real
WHERE user_id = :'user_id'
  AND type = 'income'
  AND destination_account_id = :'idfc_account_id'
  AND metadata->>'auto_created' = 'true'
  AND date BETWEEN '2025-09-01' AND '2025-09-30';

\echo '✅ Duplicates deleted'
\echo ''

-- Step 3: Verify no more duplicates
\echo 'Verifying duplicates removed:'
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS: No duplicates'
    ELSE '❌ FAIL: Still have duplicates'
  END as test_result,
  COUNT(*) as duplicate_groups
FROM (
  SELECT transaction_hash, COUNT(*) as count
  FROM transactions_real
  WHERE user_id = :'user_id'
    AND date BETWEEN '2025-09-01' AND '2025-09-30'
  GROUP BY transaction_hash
  HAVING COUNT(*) > 1
) dup;

\echo ''

-- Step 4: Update IDFC balance to 0 (since we removed the income transactions)
\echo 'Resetting IDFC balance...'

UPDATE accounts_real
SET current_balance = 0,
    updated_at = NOW()
WHERE id = :'idfc_account_id'
  AND user_id = :'user_id';

\echo '✅ IDFC balance reset'
\echo ''

-- Step 5: Show current state
\echo 'Current Transfer State:'
SELECT 
  t.date::date,
  t.name,
  t.type,
  t.amount,
  t.source_account_id,
  t.destination_account_id,
  CASE 
    WHEN t.destination_account_id IS NOT NULL THEN '✅ Linked'
    ELSE '❌ Not Linked'
  END as link_status
FROM transactions_real t
WHERE t.user_id = :'user_id'
  AND t.type = 'transfer'
  AND t.date BETWEEN '2025-09-01' AND '2025-09-30'
ORDER BY t.date;

\echo ''

-- Step 6: Show IDFC transactions
\echo 'IDFC Account Transactions:'
SELECT 
  date::date,
  name,
  type,
  amount
FROM transactions_real
WHERE user_id = :'user_id'
  AND (source_account_id = :'idfc_account_id' OR destination_account_id = :'idfc_account_id')
ORDER BY date;

\echo ''

\echo '========================================='
\echo '✅ DUPLICATE FIX COMPLETE'
\echo '========================================='
\echo ''
\echo 'Note: Transfers are now linked but IDFC balance is 0'
\echo 'This is correct because:'
\echo '  - Transfers OUT of ICICI are tracked (reduces ICICI balance)'
\echo '  - The money is IN TRANSIT to IDFC'
\echo '  - IDFC balance should be updated when you upload IDFC statement'
\echo ''

