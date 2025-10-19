-- =====================================================================
-- FINAL VERIFICATION BEFORE OCTOBER UPLOAD
-- =====================================================================

\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
\set icici_account_id 'fd551095-58a9-4f12-b00e-2fd182e68403'
\set idfc_account_id '328c756a-b05e-4925-a9ae-852f7fb18b4e'

\echo '========================================='
\echo 'FINAL VERIFICATION REPORT'
\echo '========================================='
\echo ''

-- 1. September Transaction Summary
\echo '📊 September 2025 - Transaction Summary:'
SELECT 
  type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM transactions_real
WHERE user_id = :'user_id'
  AND source_account_id = :'icici_account_id'
  AND date BETWEEN '2025-09-01' AND '2025-09-30'
GROUP BY type
ORDER BY type;

\echo ''

-- 2. Account Balances
\echo '💰 Current Account Balances:'
SELECT 
  name,
  institution,
  account_number,
  current_balance,
  account_status
FROM accounts_real
WHERE user_id = :'user_id'
  AND (id = :'icici_account_id' OR id = :'idfc_account_id')
ORDER BY name;

\echo ''

-- 3. Duplicate Check
\echo '🔍 Duplicate Check:'
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS: No duplicates found'
    ELSE '❌ FAIL: ' || COUNT(*) || ' duplicate groups found'
  END as result
FROM (
  SELECT transaction_hash
  FROM transactions_real
  WHERE user_id = :'user_id'
    AND date BETWEEN '2025-09-01' AND '2025-09-30'
  GROUP BY transaction_hash
  HAVING COUNT(*) > 1
) dups;

\echo ''

-- 4. Transfer Links
\echo '🔗 Transfer Link Status:'
SELECT 
  COUNT(*) as total_transfers,
  COUNT(destination_account_id) as linked_transfers,
  COUNT(*) - COUNT(destination_account_id) as unlinked_transfers,
  CASE 
    WHEN COUNT(*) = COUNT(destination_account_id) THEN '✅ All transfers linked'
    ELSE '⚠️ Some transfers not linked'
  END as status
FROM transactions_real
WHERE user_id = :'user_id'
  AND type = 'transfer'
  AND date BETWEEN '2025-09-01' AND '2025-09-30';

\echo ''

-- 5. ICICI Balance Calculation
\echo '🏦 ICICI Balance Calculation:'
WITH september_only AS (
  SELECT 
    (SELECT opening_balance FROM account_statements_real 
     WHERE user_id = :'user_id' AND statement_period_start = '2025-09-01') as opening_balance,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions_real 
     WHERE user_id = :'user_id' 
       AND destination_account_id = :'icici_account_id'
       AND type = 'income'
       AND date BETWEEN '2025-09-01' AND '2025-09-30') as income,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions_real 
     WHERE user_id = :'user_id' 
       AND source_account_id = :'icici_account_id'
       AND type = 'expense'
       AND date BETWEEN '2025-09-01' AND '2025-09-30') as expenses,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions_real 
     WHERE user_id = :'user_id' 
       AND source_account_id = :'icici_account_id'
       AND type = 'transfer'
       AND date BETWEEN '2025-09-01' AND '2025-09-30') as transfers_out
)
SELECT 
  opening_balance,
  income,
  expenses,
  transfers_out,
  opening_balance + income - expenses - transfers_out as calculated_closing,
  (SELECT closing_balance FROM account_statements_real 
   WHERE user_id = :'user_id' AND statement_period_start = '2025-09-01') as statement_closing,
  CASE 
    WHEN ABS((opening_balance + income - expenses - transfers_out) - 
        (SELECT closing_balance FROM account_statements_real 
         WHERE user_id = :'user_id' AND statement_period_start = '2025-09-01')) < 0.01 
    THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as status
FROM september_only;

\echo ''

-- 6. Transaction Hash Coverage
\echo '🔒 Transaction Hash Coverage:'
SELECT 
  COUNT(*) as total_transactions,
  COUNT(transaction_hash) as with_hash,
  ROUND((COUNT(transaction_hash)::numeric / COUNT(*) * 100), 2) || '%' as coverage,
  CASE 
    WHEN COUNT(*) = COUNT(transaction_hash) THEN '✅ 100% coverage'
    ELSE '⚠️ Incomplete coverage'
  END as status
FROM transactions_real
WHERE user_id = :'user_id'
  AND date BETWEEN '2025-09-01' AND '2025-09-30';

\echo ''

-- 7. Fixed Deposit Status
\echo '💎 Fixed Deposit Status:'
SELECT 
  deposit_name,
  principal_amount,
  current_value,
  maturity_date::date,
  status
FROM fixed_deposits_real
WHERE user_id = :'user_id';

\echo ''

-- 8. Account Statement Status
\echo '📄 September Statement Status:'
SELECT 
  statement_period_start::date,
  statement_period_end::date,
  transaction_count,
  transactions_inserted,
  status,
  CASE 
    WHEN transaction_count = transactions_inserted THEN '✅ Complete'
    ELSE '⚠️ Mismatch'
  END as completion_status
FROM account_statements_real
WHERE user_id = :'user_id'
  AND statement_period_start = '2025-09-01';

\echo ''

-- 9. Recent Transaction Details
\echo '📋 September Transactions (Latest 10):'
SELECT 
  date::date,
  name,
  type,
  amount,
  CASE 
    WHEN transaction_hash IS NOT NULL THEN '✅'
    ELSE '❌'
  END as has_hash
FROM transactions_real
WHERE user_id = :'user_id'
  AND source_account_id = :'icici_account_id'
  AND date BETWEEN '2025-09-01' AND '2025-09-30'
ORDER BY date DESC, created_at DESC
LIMIT 10;

\echo ''

-- 10. System Readiness Check
\echo '========================================='
\echo 'SYSTEM READINESS FOR OCTOBER UPLOAD'
\echo '========================================='
\echo ''

WITH readiness_checks AS (
  SELECT 
    -- No duplicates
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM transactions_real
      WHERE user_id = :'user_id'
        AND date BETWEEN '2025-09-01' AND '2025-09-30'
      GROUP BY transaction_hash
      HAVING COUNT(*) > 1
    ) THEN 1 ELSE 0 END as no_duplicates,
    
    -- All transfers linked
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM transactions_real
      WHERE user_id = :'user_id'
        AND type = 'transfer'
        AND date BETWEEN '2025-09-01' AND '2025-09-30'
        AND destination_account_id IS NULL
    ) THEN 1 ELSE 0 END as transfers_linked,
    
    -- All transactions have hashes
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM transactions_real
      WHERE user_id = :'user_id'
        AND date BETWEEN '2025-09-01' AND '2025-09-30'
        AND transaction_hash IS NULL
    ) THEN 1 ELSE 0 END as all_have_hashes,
    
    -- Statement processed
    CASE WHEN EXISTS (
      SELECT 1 FROM account_statements_real
      WHERE user_id = :'user_id'
        AND statement_period_start = '2025-09-01'
        AND status = 'processed'
    ) THEN 1 ELSE 0 END as statement_processed,
    
    -- Account active
    CASE WHEN EXISTS (
      SELECT 1 FROM accounts_real
      WHERE id = :'icici_account_id'
        AND account_status = 'active'
    ) THEN 1 ELSE 0 END as account_active
)
SELECT 
  CASE WHEN no_duplicates = 1 THEN '✅' ELSE '❌' END || ' No Duplicates' as check_1,
  CASE WHEN transfers_linked = 1 THEN '✅' ELSE '❌' END || ' Transfers Linked' as check_2,
  CASE WHEN all_have_hashes = 1 THEN '✅' ELSE '❌' END || ' All Have Hashes' as check_3,
  CASE WHEN statement_processed = 1 THEN '✅' ELSE '❌' END || ' Statement Processed' as check_4,
  CASE WHEN account_active = 1 THEN '✅' ELSE '❌' END || ' Account Active' as check_5,
  CASE 
    WHEN (no_duplicates + transfers_linked + all_have_hashes + statement_processed + account_active) = 5
    THEN '🎉 SYSTEM READY FOR OCTOBER UPLOAD!'
    ELSE '⚠️ Please fix issues before proceeding'
  END as overall_status
FROM readiness_checks;

\echo ''
\echo '========================================='
\echo '✅ VERIFICATION COMPLETE'
\echo '========================================='
\echo ''

