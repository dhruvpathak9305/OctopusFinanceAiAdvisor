-- ============================================================
-- October 2025 Upload Verification
-- ============================================================

\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
\set icici_account_id 'fd551095-58a9-4f12-b00e-2fd182e68403'

\echo '========================================='
\echo 'OCTOBER 2025 UPLOAD VERIFICATION'
\echo '========================================='

\echo '\n1. TOTAL OCTOBER TRANSACTIONS:'
SELECT COUNT(*) as october_transaction_count
FROM transactions
WHERE (source_account_id = :'icici_account_id' OR destination_account_id = :'icici_account_id')
  AND date >= '2025-10-01'
  AND date <= '2025-10-31';

\echo '\n2. TRANSACTIONS BY TYPE:'
SELECT 
    type,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM transactions
WHERE (source_account_id = :'icici_account_id' OR destination_account_id = :'icici_account_id')
  AND date >= '2025-10-01'
  AND date <= '2025-10-31'
GROUP BY type
ORDER BY type;

\echo '\n3. OCTOBER FINANCIAL SUMMARY:'
SELECT 
    COUNT(*) as total_transactions,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN type = 'transfer' AND source_account_id = :'icici_account_id' THEN amount ELSE 0 END) as total_transfers_out
FROM transactions
WHERE (source_account_id = :'icici_account_id' OR destination_account_id = :'icici_account_id')
  AND date >= '2025-10-01'
  AND date <= '2025-10-31';

\echo '\n4. ALL OCTOBER TRANSACTIONS (Ordered by Date):'
SELECT 
    date,
    name,
    type,
    amount,
    (metadata->>'balance_after_transaction')::numeric as balance_after
FROM transactions
WHERE (source_account_id = :'icici_account_id' OR destination_account_id = :'icici_account_id')
  AND date >= '2025-10-01'
  AND date <= '2025-10-31'
ORDER BY date, created_at;

\echo '\n5. SEPTEMBER 30 TRANSACTIONS (Check for Duplicates):'
SELECT 
    date,
    name,
    type,
    amount,
    (metadata->>'balance_after_transaction')::numeric as balance_after,
    (metadata->>'bank_reference') as bank_ref
FROM transactions
WHERE (source_account_id = :'icici_account_id' OR destination_account_id = :'icici_account_id')
  AND date = '2025-09-30'
ORDER BY created_at;

\echo '\n6. TRANSFER TRANSACTIONS (Check Links):'
SELECT 
    id,
    date,
    name,
    type,
    amount,
    source_account_id,
    destination_account_id
FROM transactions
WHERE type = 'transfer'
  AND source_account_id = :'icici_account_id'
  AND date >= '2025-10-01'
  AND date <= '2025-10-31'
ORDER BY date;

\echo '\n7. CHECK FOR DUPLICATE BANK REFERENCES:'
SELECT 
    metadata->>'bank_reference' as bank_reference,
    COUNT(*) as occurrence_count,
    array_agg(id) as transaction_ids
FROM transactions
WHERE (source_account_id = :'icici_account_id' OR destination_account_id = :'icici_account_id')
  AND metadata->>'bank_reference' IS NOT NULL
GROUP BY metadata->>'bank_reference'
HAVING COUNT(*) > 1
ORDER BY occurrence_count DESC;

\echo '\n8. RECENT TRANSACTIONS (Last 15):'
SELECT 
    date,
    name,
    type,
    amount,
    (metadata->>'statement_period') as period
FROM transactions
WHERE (source_account_id = :'icici_account_id' OR destination_account_id = :'icici_account_id')
ORDER BY date DESC, created_at DESC
LIMIT 15;

\echo '\n========================================='
\echo 'VERIFICATION COMPLETE'
\echo '========================================='

