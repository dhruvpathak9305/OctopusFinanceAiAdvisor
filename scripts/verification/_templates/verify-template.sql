-- Verify [BANK NAME] [MONTH] [YEAR] Upload
-- Generated: [DATE]
-- Bank: [BANK NAME]
-- Month: [MONTH YEAR]
-- Account: ****[LAST 4 DIGITS]

\echo '================================================'
\echo 'VERIFICATION REPORT'
\echo '[BANK NAME] - [MONTH YEAR]'
\echo '================================================'

-- ================================================
-- 1. TRANSACTION COUNT
-- ================================================

\echo ''
\echo '1. Transaction Count for [MONTH YEAR]'
\echo '----------------------------------------'

SELECT COUNT(*) as total_transactions
FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '[YYYY-MM-01]' AND date <= '[YYYY-MM-31]';

\echo 'Expected: [EXPECTED_COUNT]'

-- ================================================
-- 2. TRANSACTIONS BY TYPE
-- ================================================

\echo ''
\echo '2. Transactions by Type'
\echo '----------------------------------------'

SELECT 
  type,
  COUNT(*) as count,
  SUM(amount)::numeric(10,2) as total_amount
FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '[YYYY-MM-01]' AND date <= '[YYYY-MM-31]'
GROUP BY type
ORDER BY type;

-- ================================================
-- 3. FINANCIAL SUMMARY
-- ================================================

\echo ''
\echo '3. Financial Summary'
\echo '----------------------------------------'

SELECT 
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)::numeric(10,2) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)::numeric(10,2) as total_expenses,
  SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END)::numeric(10,2) as total_transfers,
  (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
   SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) - 
   SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END))::numeric(10,2) as net_change
FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '[YYYY-MM-01]' AND date <= '[YYYY-MM-31]';

-- ================================================
-- 4. ALL TRANSACTIONS (ORDERED BY DATE)
-- ================================================

\echo ''
\echo '4. All Transactions (Ordered by Date)'
\echo '----------------------------------------'

SELECT 
  date,
  name,
  type,
  amount::numeric(10,2),
  (metadata->>'balance_after_transaction')::numeric(10,2) as balance_after
FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '[YYYY-MM-01]' AND date <= '[YYYY-MM-31]'
ORDER BY date, created_at;

-- ================================================
-- 5. ENDING BALANCE VERIFICATION
-- ================================================

\echo ''
\echo '5. Ending Balance Verification'
\echo '----------------------------------------'

SELECT 
  date,
  name,
  amount::numeric(10,2),
  (metadata->>'balance_after_transaction')::numeric(10,2) as ending_balance
FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '[YYYY-MM-01]' AND date <= '[YYYY-MM-31]'
ORDER BY date DESC, created_at DESC
LIMIT 1;

\echo 'Expected Balance: ₹[EXPECTED_BALANCE]'

-- ================================================
-- 6. DUPLICATE CHECK
-- ================================================

\echo ''
\echo '6. Duplicate Bank References'
\echo '----------------------------------------'

SELECT 
  metadata->>'bank_reference' as bank_ref,
  COUNT(*) as occurrence_count
FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '[YYYY-MM-01]' AND date <= '[YYYY-MM-31]'
GROUP BY metadata->>'bank_reference'
HAVING COUNT(*) > 1;

\echo 'Expected: 0 duplicates'

-- ================================================
-- 7. TRANSFER VERIFICATION
-- ================================================

\echo ''
\echo '7. Transfer Transactions'
\echo '----------------------------------------'

SELECT 
  date,
  name,
  amount::numeric(10,2),
  destination_account_id,
  metadata->>'upi_reference' as upi_ref
FROM transactions_real
WHERE type = 'transfer'
  AND source_account_id = '[ACCOUNT_ID]'
  AND date >= '[YYYY-MM-01]' AND date <= '[YYYY-MM-31]'
ORDER BY date;

\echo ''
\echo 'Verify all transfers have destination_account_id set'

-- ================================================
-- 8. BALANCE PROGRESSION
-- ================================================

\echo ''
\echo '8. Balance Progression Check'
\echo '----------------------------------------'

SELECT 
  date,
  name,
  amount::numeric(10,2),
  (metadata->>'balance_after_transaction')::numeric(10,2) as balance
FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '[YYYY-MM-01]' AND date <= '[YYYY-MM-31]'
ORDER BY date, created_at;

\echo 'Verify balance progression is continuous'

-- ================================================
-- SUMMARY
-- ================================================

\echo ''
\echo '================================================'
\echo 'VERIFICATION SUMMARY'
\echo '================================================'
\echo 'Expected Transactions: [EXPECTED_COUNT]'
\echo 'Expected Ending Balance: ₹[EXPECTED_BALANCE]'
\echo 'Expected Duplicates: 0'
\echo '================================================'
\echo ''
\echo 'Review the output above to confirm:'
\echo '  ✓ Transaction count matches expected'
\echo '  ✓ Ending balance matches statement'
\echo '  ✓ No duplicate bank references'
\echo '  ✓ All transfers have destination IDs'
\echo '  ✓ Balance progression is correct'
\echo '================================================'

