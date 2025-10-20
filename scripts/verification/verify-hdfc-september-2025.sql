-- ================================================================
-- HDFC BANK - SEPTEMBER 2025 VERIFICATION SCRIPT
-- ================================================================
-- 
-- Verification Details:
--   Bank: HDFC Bank
--   Account: 50100223596697 (last 4: 6697)
--   Period: September 1-30, 2025
--   Expected: 14 transactions (10 income + 4 expense)
-- 
-- ================================================================

\echo '============================================================'
\echo 'HDFC BANK - SEPTEMBER 2025 TRANSACTION VERIFICATION'
\echo '============================================================'
\echo ''

-- ================================================================
-- 1. TRANSACTION COUNT VERIFICATION
-- ================================================================
\echo '1. TRANSACTION COUNT VERIFICATION'
\echo '------------------------------------------------------------'

SELECT 
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
    COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
FROM transactions_real
WHERE source_account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233'
  AND date >= '2025-09-01'
  AND date <= '2025-09-30';

\echo ''
\echo 'Expected: 14 total (10 income + 4 expense)'
\echo ''

-- ================================================================
-- 2. FINANCIAL SUMMARY
-- ================================================================
\echo '2. FINANCIAL SUMMARY'
\echo '------------------------------------------------------------'

SELECT 
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_change
FROM transactions_real
WHERE source_account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233'
  AND date >= '2025-09-01'
  AND date <= '2025-09-30';

\echo ''
\echo 'Expected: Income=₹553.17, Expense=₹23,192.46, Net=-₹22,639.29'
\echo ''

-- ================================================================
-- 3. ALL TRANSACTIONS (CHRONOLOGICAL ORDER)
-- ================================================================
\echo '3. ALL TRANSACTIONS (CHRONOLOGICAL ORDER)'
\echo '------------------------------------------------------------'

SELECT 
    date,
    type,
    amount,
    name,
    metadata->>'balance_after_transaction' as balance_after,
    metadata->>'bank_reference' as bank_ref
FROM transactions_real
WHERE source_account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233'
  AND date >= '2025-09-01'
  AND date <= '2025-09-30'
ORDER BY date, created_at;

\echo ''

-- ================================================================
-- 4. BALANCE PROGRESSION VERIFICATION
-- ================================================================
\echo '4. BALANCE PROGRESSION VERIFICATION'
\echo '------------------------------------------------------------'

WITH transactions_ordered AS (
    SELECT 
        date,
        type,
        amount,
        name,
        (metadata->>'balance_after_transaction')::numeric as stated_balance,
        ROW_NUMBER() OVER (ORDER BY date, created_at) as seq
    FROM transactions_real
    WHERE source_account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233'
      AND date >= '2025-09-01'
      AND date <= '2025-09-30'
),
running_balance AS (
    SELECT 
        t.date,
        t.type,
        t.amount,
        t.name,
        t.stated_balance,
        31755.73 + SUM(
            CASE 
                WHEN t2.type = 'income' THEN t2.amount 
                ELSE -t2.amount 
            END
        ) as calculated_balance
    FROM transactions_ordered t
    LEFT JOIN transactions_ordered t2 ON t2.seq <= t.seq
    GROUP BY t.date, t.type, t.amount, t.name, t.stated_balance, t.seq
    ORDER BY t.seq
)
SELECT 
    date,
    type,
    amount,
    SUBSTRING(name, 1, 30) as description,
    calculated_balance::numeric(10,2),
    stated_balance::numeric(10,2),
    CASE 
        WHEN ABS(calculated_balance - stated_balance) < 0.01 THEN '✅ MATCH'
        ELSE '❌ MISMATCH'
    END as status
FROM running_balance;

\echo ''

-- ================================================================
-- 5. TRANSACTION TYPE BREAKDOWN
-- ================================================================
\echo '5. TRANSACTION TYPE BREAKDOWN'
\echo '------------------------------------------------------------'

SELECT 
    metadata->>'transaction_mode' as transaction_mode,
    type,
    COUNT(*) as count,
    SUM(amount)::numeric(10,2) as total_amount
FROM transactions_real
WHERE source_account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233'
  AND date >= '2025-09-01'
  AND date <= '2025-09-30'
GROUP BY metadata->>'transaction_mode', type
ORDER BY type, transaction_mode;

\echo ''

-- ================================================================
-- 6. DUPLICATE CHECK
-- ================================================================
\echo '6. DUPLICATE CHECK (should show no results)'
\echo '------------------------------------------------------------'

SELECT 
    metadata->>'bank_reference' as bank_ref,
    COUNT(*) as occurrence_count,
    ARRAY_AGG(date) as dates
FROM transactions_real
WHERE source_account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233'
  AND date >= '2025-09-01'
  AND date <= '2025-09-30'
GROUP BY metadata->>'bank_reference'
HAVING COUNT(*) > 1;

\echo ''

-- ================================================================
-- 7. ACCOUNT BALANCE VERIFICATION
-- ================================================================
\echo '7. HDFC ACCOUNT STATUS'
\echo '------------------------------------------------------------'

SELECT 
    name,
    account_number,
    current_balance,
    status,
    updated_at
FROM accounts_real
WHERE account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233';

\echo ''
\echo '============================================================'
\echo 'VERIFICATION COMPLETE'
\echo '============================================================'
\echo ''

