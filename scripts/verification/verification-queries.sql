-- =====================================================================
-- VERIFICATION QUERIES FOR SEPTEMBER 2025 UPLOAD
-- =====================================================================

\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'

\echo '========================================='
\echo 'VERIFICATION REPORT'
\echo '========================================='
\echo ''

-- 1. Summary of all data
\echo '📊 Data Count Summary:'
SELECT 
  'Accounts' as table_name,
  COUNT(*) as count
FROM accounts_real
WHERE user_id = :'user_id'

UNION ALL

SELECT 
  'Transactions',
  COUNT(*)
FROM transactions_real
WHERE user_id = :'user_id'
  AND date BETWEEN '2025-09-01' AND '2025-09-30'

UNION ALL

SELECT 
  'Fixed Deposits',
  COUNT(*)
FROM fixed_deposits_real
WHERE user_id = :'user_id'

UNION ALL

SELECT 
  'Statements',
  COUNT(*)
FROM account_statements_real
WHERE user_id = :'user_id'
  AND statement_period_start = '2025-09-01'

UNION ALL

SELECT 
  'Merchants',
  COUNT(*)
FROM merchants_real
WHERE merchant_name IN ('PolicyBazaar', 'Apple', 'VIM Global Technology Services');

\echo ''
\echo 'Expected: Accounts=1, Transactions=10, Fixed Deposits=1, Statements=1, Merchants=3'
\echo ''

-- 2. Balance Verification
\echo '💰 Balance Calculation Verification:'
SELECT 
  (SELECT opening_balance FROM account_statements_real 
   WHERE user_id = :'user_id'
     AND statement_period_start = '2025-09-01') as opening_balance,
  
  (SELECT SUM(amount) FROM transactions_real 
   WHERE user_id = :'user_id'
     AND date BETWEEN '2025-09-01' AND '2025-09-30'
     AND type = 'income') as total_income,
  
  (SELECT SUM(amount) FROM transactions_real 
   WHERE user_id = :'user_id'
     AND date BETWEEN '2025-09-01' AND '2025-09-30'
     AND type = 'expense') as total_expenses,
  
  (SELECT SUM(amount) FROM transactions_real 
   WHERE user_id = :'user_id'
     AND date BETWEEN '2025-09-01' AND '2025-09-30'
     AND type = 'transfer') as total_transfers,
  
  (SELECT closing_balance FROM account_statements_real 
   WHERE user_id = :'user_id'
     AND statement_period_start = '2025-09-01') as closing_balance,
  
  -- Calculated closing (transfers don't affect balance)
  (SELECT opening_balance FROM account_statements_real 
   WHERE user_id = :'user_id'
     AND statement_period_start = '2025-09-01') +
  (SELECT COALESCE(SUM(amount), 0) FROM transactions_real 
   WHERE user_id = :'user_id'
     AND date BETWEEN '2025-09-01' AND '2025-09-30'
     AND type = 'income') -
  (SELECT COALESCE(SUM(amount), 0) FROM transactions_real 
   WHERE user_id = :'user_id'
     AND date BETWEEN '2025-09-01' AND '2025-09-30'
     AND type = 'expense') as calculated_closing;

\echo ''
\echo 'Expected: Opening=5381584.77, Calculated=5525174.87 (should match closing)'
\echo ''

-- 3. Transaction Hash Coverage
\echo '🔒 Transaction Hash Coverage:'
SELECT 
  COUNT(*) as total_transactions,
  COUNT(transaction_hash) as with_hash,
  COUNT(*) - COUNT(transaction_hash) as missing_hash,
  COUNT(bank_reference_number) as with_bank_ref,
  COUNT(upi_reference_number) as with_upi_ref,
  COUNT(neft_reference_number) as with_neft_ref
FROM transactions_real
WHERE user_id = :'user_id'
  AND date BETWEEN '2025-09-01' AND '2025-09-30';

\echo ''
\echo 'Expected: All 10 transactions should have transaction_hash'
\echo ''

-- 4. Detailed Transaction List
\echo '📋 Transaction Details:'
SELECT 
  date::date as transaction_date,
  name,
  type,
  amount,
  CASE 
    WHEN transaction_hash IS NOT NULL THEN '✅ Yes'
    ELSE '❌ No'
  END as has_hash,
  COALESCE(bank_reference_number, upi_reference_number, neft_reference_number, 'N/A') as reference
FROM transactions_real
WHERE user_id = :'user_id'
  AND date BETWEEN '2025-09-01' AND '2025-09-30'
ORDER BY date, created_at;

\echo ''

-- 5. Account Status
\echo '🏦 Account Status:'
SELECT 
  name,
  account_number,
  institution,
  current_balance,
  nomination_status,
  account_status,
  account_category
FROM accounts_real
WHERE user_id = :'user_id';

\echo ''

-- 6. Fixed Deposit Details
\echo '💎 Fixed Deposit Details:'
SELECT 
  deposit_name,
  deposit_number,
  principal_amount,
  interest_rate,
  current_value,
  maturity_amount,
  maturity_date::date,
  status,
  nomination_status
FROM fixed_deposits_real
WHERE user_id = :'user_id';

\echo ''

-- 7. Statement Status
\echo '📄 Statement Status:'
SELECT 
  statement_period_start::date,
  statement_period_end::date,
  opening_balance,
  closing_balance,
  total_credits,
  total_debits,
  transaction_count,
  transactions_inserted,
  status,
  processing_method
FROM account_statements_real
WHERE user_id = :'user_id'
  AND statement_period_start = '2025-09-01';

\echo ''

-- 8. Merchant Details
\echo '🏪 Merchants Created:'
SELECT 
  merchant_name,
  merchant_category,
  industry,
  is_recurring_merchant,
  is_verified
FROM merchants_real
WHERE merchant_name IN ('PolicyBazaar', 'Apple', 'VIM Global Technology Services')
ORDER BY merchant_name;

\echo ''

-- 9. Test Duplicate Detection
\echo '🔍 Duplicate Detection Test:'
\echo 'Attempting to re-insert first transaction (should be detected as duplicate)...'

SELECT bulk_insert_transactions_with_duplicate_check('[
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Credit Card Payment",
    "description": "ATD/Auto Debit CC0xx0318",
    "amount": 13701.2,
    "date": "2025-09-07T00:00:00Z",
    "type": "expense",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "CC0318",
      "original_description": "ATD/Auto Debit CC0xx0318",
      "balance_after_transaction": 5367883.57
    }
  }
]'::jsonb);

\echo ''
\echo 'Expected: duplicate_count=1, inserted_count=0'
\echo ''

\echo '========================================='
\echo '✅ VERIFICATION COMPLETE'
\echo '========================================='
\echo ''
\echo '🎯 Success Criteria:'
\echo '  ✓ All counts match expected values'
\echo '  ✓ Balance calculation is correct'
\echo '  ✓ All transactions have hashes'
\echo '  ✓ Duplicate detection works'
\echo ''

