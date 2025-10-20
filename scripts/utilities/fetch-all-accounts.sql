-- =====================================================================
-- FETCH ALL ACCOUNTS AND RELATED INFORMATION
-- =====================================================================

\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'

\echo '========================================='
\echo 'FETCHING ALL ACCOUNT INFORMATION'
\echo '========================================='
\echo ''

-- 1. All Accounts with Full Details
\echo '📊 All Accounts:'
SELECT 
  id,
  name,
  institution,
  account_number,
  type,
  current_balance,
  account_status,
  ifsc_code,
  branch_address,
  created_at::date as created_on
FROM accounts_real
WHERE user_id = :'user_id'
ORDER BY current_balance DESC, name;

\echo ''

-- 2. Accounts Summary for Mapping
\echo '📋 Accounts Summary (for mapping):'
SELECT 
  id as account_id,
  name as account_name,
  institution,
  account_number,
  type as account_type,
  current_balance,
  CASE 
    WHEN current_balance > 0 THEN '✅ Has Balance'
    ELSE '⚠️ Empty'
  END as status
FROM accounts_real
WHERE user_id = :'user_id'
ORDER BY name;

\echo ''

-- 3. Transfer Analysis
\echo '🔄 Transfer Transactions Analysis:'
SELECT 
  t.id,
  t.date::date,
  t.name,
  t.amount,
  t.source_account_type,
  t.source_account_name,
  t.destination_account_type,
  t.destination_account_name,
  sa.name as actual_source_account,
  sa.current_balance as source_balance
FROM transactions_real t
LEFT JOIN accounts_real sa ON t.source_account_id = sa.id
WHERE t.user_id = :'user_id'
  AND t.type = 'transfer'
ORDER BY t.date DESC;

\echo ''

-- 4. Check for IDFC Account
\echo '🏦 IDFC Account Details:'
SELECT 
  id,
  name,
  institution,
  account_number,
  current_balance,
  type,
  account_status,
  branch_address,
  ifsc_code
FROM accounts_real
WHERE user_id = :'user_id'
  AND (name ILIKE '%IDFC%' OR institution ILIKE '%IDFC%');

\echo ''

-- 5. Balance Flow Check
\echo '💰 Balance Flow (September Transfers):'
WITH transfer_summary AS (
  SELECT 
    date::date,
    name,
    amount,
    source_account_name as from_account,
    destination_account_name as to_account,
    source_account_id,
    destination_account_id
  FROM transactions_real
  WHERE user_id = :'user_id'
    AND type = 'transfer'
    AND date BETWEEN '2025-09-01' AND '2025-09-30'
)
SELECT 
  ts.*,
  sa.current_balance as source_current_balance,
  CASE 
    WHEN ts.destination_account_id IS NOT NULL THEN 'Linked'
    ELSE '⚠️ Not Linked'
  END as destination_status
FROM transfer_summary ts
LEFT JOIN accounts_real sa ON ts.source_account_id = sa.id
ORDER BY ts.date;

\echo ''

-- 6. Account IDs for Mapping
\echo '🔑 Account ID Mapping (for JSON):'
SELECT 
  name,
  id,
  institution,
  COALESCE(account_number, 'N/A') as account_number
FROM accounts_real
WHERE user_id = :'user_id'
ORDER BY name;

\echo ''

\echo '========================================='
\echo '✅ FETCH COMPLETE'
\echo '========================================='

