-- ============================================================
-- KOTAK MAHINDRA BANK - JULY TO OCTOBER 2025 TRANSACTION UPLOAD
-- ============================================================
-- 
-- Upload Details:
--   Bank: Kotak Mahindra Bank
--   Accounts: 
--     1. 3712733310 (PUSHPA PATHAK) - Savings Account
--     2. 7246166101 (ASHOK PATHAK - Joint Account)
--   Period: July 22, 2025 to October 22, 2025
--   Transactions: 7 (6 from account 3712733310 + 1 from account 7246166101)
-- 
-- Account 3712733310 (PUSHPA PATHAK):
--   Opening Balance: ₹29,242.74
--   Closing Balance: ₹51,723.74
--   Net Change: +₹22,481.00
--   Total Credits: ₹533,071.00 (3 transactions)
--   Total Debits: ₹510,590.00 (3 transactions)
-- 
-- Account 7246166101 (ASHOK PATHAK - Joint):
--   Closing Balance: ₹16,250.24
--   Total Credits: ₹16,250.24 (1 transaction - Interest)
-- 
-- Upload Date: 2025-10-22
-- Statement Period: July 22 - October 22, 2025
-- 
-- ============================================================

\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
\set kotak_pushpa_account_id 'db0683f0-4a26-45bf-8943-98755f6f7aa2'
\set kotak_joint_account_id 'f288c939-4ba1-4bd4-abd0-31951e19ee08'

-- Pre-Upload Verification
\echo '========================================='
\echo 'PRE-UPLOAD VERIFICATION'
\echo '========================================='

\echo '\nCurrent Kotak Accounts Status:'
SELECT 
    a.name,
    a.account_number,
    a.balance as current_balance,
    COUNT(t.id) as transaction_count,
    MAX(t.date) as last_transaction_date
FROM accounts a
LEFT JOIN transactions t ON t.source_account_id = a.id OR t.destination_account_id = a.id
WHERE a.id IN (:'kotak_pushpa_account_id', :'kotak_joint_account_id')
GROUP BY a.id, a.name, a.account_number, a.balance
ORDER BY a.name;

\echo '\nExisting Kotak Transactions (July-October 2025):'
SELECT 
    a.name,
    COUNT(t.id) as transaction_count
FROM accounts a
LEFT JOIN transactions t ON (t.source_account_id = a.id OR t.destination_account_id = a.id)
  AND t.date >= '2025-07-01' AND t.date <= '2025-10-31'
WHERE a.id IN (:'kotak_pushpa_account_id', :'kotak_joint_account_id')
GROUP BY a.id, a.name
ORDER BY a.name;

-- ============================================================
-- BULK INSERT WITH DUPLICATE CHECK
-- ============================================================

\echo '\n========================================='
\echo 'UPLOADING KOTAK TRANSACTIONS (July-October 2025)'
\echo '========================================='

SELECT * FROM bulk_insert_transactions_with_duplicate_check('[
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "FD Maturity - 8280309098",
    "description": "FD MATURITY PROCEEDS :8280309098/23-07-25/PUSHPA TO",
    "amount": 522433.00,
    "date": "2025-07-23",
    "type": "income",
    "source_account_type": "investment",
    "source_account_name": "Kotak Fixed Deposit",
    "destination_account_type": "bank",
    "destination_account_name": "Kotak Mahindra Bank - Pushpa",
    "destination_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
    "is_recurring": false,
    "is_credit_card": false,
    "bank_reference_number": "8280309098-20250723",
    "metadata": {
      "bank_reference": "8280309098-20250723",
      "fd_number": "8280309098",
      "fd_maturity_date": "2025-07-23",
      "original_description": "FD MATURITY PROCEEDS :8280309098/23-07-25/PUSHPA TO",
      "upload_source": "kotak_statement_upload",
      "upload_date": "2025-10-22",
      "account_number": "3712733310",
      "account_last_four": "3310",
      "balance_after_transaction": 551675.74,
      "bank_name": "Kotak Mahindra Bank",
      "statement_period": "July-October 2025",
      "transaction_time": "04:21:52",
      "value_date": "2025-07-23"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Auto Sweep Transfer to FD",
    "description": "SWEEP TRANSFER TO [8291582858]",
    "amount": 500000.00,
    "date": "2025-07-24",
    "type": "expense",
    "source_account_type": "bank",
    "source_account_name": "Kotak Mahindra Bank - Pushpa",
    "source_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
    "destination_account_type": "investment",
    "destination_account_name": "Kotak Fixed Deposit - 8291582858",
    "is_recurring": false,
    "is_credit_card": false,
    "metadata": {
      "bank_reference": "SWEEP-8291582858-20250724",
      "sweep_account": "8291582858",
      "original_description": "SWEEP TRANSFER TO [8291582858]",
      "upload_source": "kotak_statement_upload",
      "upload_date": "2025-10-22",
      "account_number": "3712733310",
      "account_last_four": "3310",
      "balance_after_transaction": 51675.74,
      "bank_name": "Kotak Mahindra Bank",
      "statement_period": "July-October 2025",
      "transaction_time": "00:22:13",
      "value_date": "2025-07-23",
      "transaction_type": "auto_sweep",
      "category": "Investment"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Credit Card Bill Payment",
    "description": "BILL PAID TO CREDIT CARD 9856 811CC-737895d5-58e9-",
    "amount": 590.00,
    "date": "2025-08-07",
    "type": "expense",
    "source_account_type": "bank",
    "source_account_name": "Kotak Mahindra Bank - Pushpa",
    "source_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
    "destination_account_type": "credit_card",
    "destination_account_name": "Kotak Credit Card - 9856",
    "is_recurring": false,
    "is_credit_card": true,
    "bank_reference_number": "811CC-737895d5-58e9-20250807",
    "metadata": {
      "bank_reference": "811CC-737895d5-58e9-20250807",
      "credit_card_last_four": "9856",
      "transaction_id": "811CC-737895d5-58e9-",
      "original_description": "BILL PAID TO CREDIT CARD 9856 811CC-737895d5-58e9-",
      "upload_source": "kotak_statement_upload",
      "upload_date": "2025-10-22",
      "account_number": "3712733310",
      "account_last_four": "3310",
      "balance_after_transaction": 51085.74,
      "bank_name": "Kotak Mahindra Bank",
      "statement_period": "July-October 2025",
      "transaction_time": "12:36",
      "value_date": "2025-08-07"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "FD Maturity - 8281787054",
    "description": "FD MATURITY PROCEEDS :8281787054/16-08-25/PUSHPA TO",
    "amount": 10345.00,
    "date": "2025-08-16",
    "type": "income",
    "source_account_type": "investment",
    "source_account_name": "Kotak Fixed Deposit",
    "destination_account_type": "bank",
    "destination_account_name": "Kotak Mahindra Bank - Pushpa",
    "destination_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
    "is_recurring": false,
    "is_credit_card": false,
    "bank_reference_number": "8281787054-20250816",
    "metadata": {
      "bank_reference": "8281787054-20250816",
      "fd_number": "8281787054",
      "fd_maturity_date": "2025-08-16",
      "original_description": "FD MATURITY PROCEEDS :8281787054/16-08-25/PUSHPA TO",
      "upload_source": "kotak_statement_upload",
      "upload_date": "2025-10-22",
      "account_number": "3712733310",
      "account_last_four": "3310",
      "balance_after_transaction": 61430.74,
      "bank_name": "Kotak Mahindra Bank",
      "statement_period": "July-October 2025",
      "transaction_time": "02:57:00",
      "value_date": "2025-08-16"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Auto Sweep Transfer to FD",
    "description": "SWEEP TRANSFER TO [8292936870]",
    "amount": 10000.00,
    "date": "2025-08-17",
    "type": "expense",
    "source_account_type": "bank",
    "source_account_name": "Kotak Mahindra Bank - Pushpa",
    "source_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
    "destination_account_type": "investment",
    "destination_account_name": "Kotak Fixed Deposit - 8292936870",
    "is_recurring": false,
    "is_credit_card": false,
    "metadata": {
      "bank_reference": "SWEEP-8292936870-20250817",
      "sweep_account": "8292936870",
      "original_description": "SWEEP TRANSFER TO [8292936870]",
      "upload_source": "kotak_statement_upload",
      "upload_date": "2025-10-22",
      "account_number": "3712733310",
      "account_last_four": "3310",
      "balance_after_transaction": 51430.74,
      "bank_name": "Kotak Mahindra Bank",
      "statement_period": "July-October 2025",
      "transaction_time": "00:33:17",
      "value_date": "2025-08-16",
      "transaction_type": "auto_sweep",
      "category": "Investment"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Quarterly Interest - Savings Account",
    "description": "Int.Pd:3712733310:01-07-2025 to 30-09-2025",
    "amount": 293.00,
    "date": "2025-10-01",
    "type": "income",
    "source_account_type": "bank",
    "source_account_name": "Kotak Mahindra Bank",
    "destination_account_type": "bank",
    "destination_account_name": "Kotak Mahindra Bank - Pushpa",
    "destination_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
    "is_recurring": true,
    "is_credit_card": false,
    "bank_reference_number": "3712733310-INT-20251001",
    "metadata": {
      "bank_reference": "3712733310-INT-20251001",
      "cheque_ref_no": "293",
      "interest_period_from": "2025-07-01",
      "interest_period_to": "2025-09-30",
      "original_description": "Int.Pd:3712733310:01-07-2025 to 30-09-2025",
      "upload_source": "kotak_statement_upload",
      "upload_date": "2025-10-22",
      "account_number": "3712733310",
      "account_last_four": "3310",
      "balance_after_transaction": 51723.74,
      "bank_name": "Kotak Mahindra Bank",
      "statement_period": "July-October 2025",
      "transaction_time": "02:49",
      "value_date": "2025-09-30",
      "transaction_category": "interest_paid"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Quarterly Interest - Joint Account",
    "description": "Int.Pd:7246166101:01-07-2025 to 30-09-2025",
    "amount": 16250.24,
    "date": "2025-10-01",
    "type": "income",
    "source_account_type": "investment",
    "source_account_name": "Kotak Fixed Deposit - Joint Account",
    "destination_account_type": "bank",
    "destination_account_name": "Kotak Mahindra Joint Account",
    "destination_account_id": "f288c939-4ba1-4bd4-abd0-31951e19ee08",
    "is_recurring": true,
    "is_credit_card": false,
    "bank_reference_number": "7246166101-INT-20251001",
    "metadata": {
      "bank_reference": "7246166101-INT-20251001",
      "cheque_ref_no": "103",
      "interest_period_from": "2025-07-01",
      "interest_period_to": "2025-09-30",
      "original_description": "Int.Pd:7246166101:01-07-2025 to 30-09-2025",
      "upload_source": "kotak_statement_upload",
      "upload_date": "2025-10-22",
      "account_number": "7246166101",
      "account_last_four": "6101",
      "balance_after_transaction": 16250.24,
      "bank_name": "Kotak Mahindra Bank",
      "statement_period": "July-October 2025",
      "transaction_time": "02:26",
      "value_date": "2025-09-30",
      "transaction_category": "interest_paid",
      "account_type": "Fixed Deposit",
      "account_holders": "ASHOK PATHAK & PUSHPA PATHAK (Joint)",
      "nominee": "Dhruv Pathak"
    }
  }
]'::jsonb);

-- ============================================================
-- POST-UPLOAD VERIFICATION
-- ============================================================

\echo '\n========================================='
\echo 'POST-UPLOAD VERIFICATION'
\echo '========================================='

\echo '\nAccount 3712733310 (PUSHPA PATHAK) - Transactions by Type:'
SELECT 
    type,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM transactions
WHERE (source_account_id = :'kotak_pushpa_account_id' OR destination_account_id = :'kotak_pushpa_account_id')
  AND date >= '2025-07-22'
  AND date <= '2025-10-22'
GROUP BY type
ORDER BY type;

\echo '\nAccount 7246166101 (ASHOK PATHAK - Joint) - Transactions:'
SELECT 
    date,
    name,
    type,
    amount,
    (metadata->>'balance_after_transaction')::numeric as balance_after
FROM transactions
WHERE (source_account_id = :'kotak_joint_account_id' OR destination_account_id = :'kotak_joint_account_id')
  AND date >= '2025-07-22'
  AND date <= '2025-10-22'
ORDER BY date;

\echo '\nAccount 3712733310 Summary:'
SELECT 
    COUNT(*) as total_transactions,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN type = 'transfer' AND source_account_id = :'kotak_pushpa_account_id' THEN amount ELSE 0 END) as total_transfers_out
FROM transactions
WHERE (source_account_id = :'kotak_pushpa_account_id' OR destination_account_id = :'kotak_pushpa_account_id')
  AND date >= '2025-07-22'
  AND date <= '2025-10-22';

\echo '\nBalance Verification - Account 3712733310:'
SELECT 
    'Expected Ending Balance' as description,
    51723.74 as amount
UNION ALL
SELECT 
    'Current Account Balance',
    balance
FROM accounts
WHERE id = :'kotak_pushpa_account_id';

\echo '\nBalance Verification - Account 7246166101:'
SELECT 
    'Expected Ending Balance' as description,
    16250.24 as amount
UNION ALL
SELECT 
    'Current Account Balance',
    balance
FROM accounts
WHERE id = :'kotak_joint_account_id';

\echo '\nCheck for Duplicates (by bank reference in metadata):'
SELECT 
    metadata->>'bank_reference' as bank_reference,
    COUNT(*) as occurrence_count
FROM transactions
WHERE (source_account_id IN (:'kotak_pushpa_account_id', :'kotak_joint_account_id') 
   OR destination_account_id IN (:'kotak_pushpa_account_id', :'kotak_joint_account_id'))
  AND metadata->>'bank_reference' IS NOT NULL
GROUP BY metadata->>'bank_reference'
HAVING COUNT(*) > 1;

\echo '\nAll Kotak Transactions (July-October 2025, Ordered by Date):'
SELECT 
    a.name as account_name,
    t.date,
    t.name as transaction_name,
    t.type,
    t.amount,
    (t.metadata->>'balance_after_transaction')::numeric as balance_after
FROM transactions t
LEFT JOIN accounts a ON (t.source_account_id = a.id OR t.destination_account_id = a.id)
WHERE (t.source_account_id IN (:'kotak_pushpa_account_id', :'kotak_joint_account_id')
   OR t.destination_account_id IN (:'kotak_pushpa_account_id', :'kotak_joint_account_id'))
  AND t.date >= '2025-07-22'
  AND t.date <= '2025-10-22'
ORDER BY t.date, t.id;

\echo '\nFD Maturity Summary:'
SELECT 
    name,
    date,
    amount,
    metadata->>'fd_number' as fd_number,
    metadata->>'fd_maturity_date' as maturity_date
FROM transactions
WHERE (source_account_id IN (:'kotak_pushpa_account_id', :'kotak_joint_account_id')
   OR destination_account_id IN (:'kotak_pushpa_account_id', :'kotak_joint_account_id'))
  AND date >= '2025-07-22'
  AND date <= '2025-10-22'
  AND metadata->>'fd_number' IS NOT NULL
ORDER BY date;

\echo '\nSweep Transfer Summary:'
SELECT 
    name,
    date,
    amount,
    metadata->>'sweep_account' as sweep_to_account,
    (metadata->>'balance_after_transaction')::numeric as balance_after
FROM transactions
WHERE (source_account_id IN (:'kotak_pushpa_account_id', :'kotak_joint_account_id')
   OR destination_account_id IN (:'kotak_pushpa_account_id', :'kotak_joint_account_id'))
  AND date >= '2025-07-22'
  AND date <= '2025-10-22'
  AND metadata->>'sweep_account' IS NOT NULL
ORDER BY date;

\echo '\n========================================='
\echo 'UPLOAD COMPLETE!'
\echo '========================================='
\echo 'Review the results above to ensure:'
\echo '1. Account 3712733310: 6 transactions uploaded'
\echo '2. Account 7246166101: 1 transaction uploaded'
\echo '3. No duplicate bank references'
\echo '4. Balance progression matches statements'
\echo '5. Account 3712733310 Ending Balance: ₹51,723.74'
\echo '6. Account 7246166101 Ending Balance: ₹16,250.24'
\echo '7. FD maturities and sweep transfers recorded correctly'
\echo '========================================='
\echo ''
\echo 'KOTAK ACCOUNT SUMMARY:'
\echo '----------------------'
\echo 'Account 3712733310 (PUSHPA PATHAK):'
\echo '  - 2 FD Maturities: ₹532,778.00'
\echo '  - 2 Auto Sweep Transfers: ₹510,000.00'
\echo '  - 1 Credit Card Payment: ₹590.00'
\echo '  - 1 Quarterly Interest: ₹293.00'
\echo ''
\echo 'Account 7246166101 (ASHOK & PUSHPA PATHAK - Joint):'
\echo '  - 1 Quarterly FD Interest: ₹16,250.24'
\echo '  - Account Type: Fixed Deposit'
\echo '  - Interest Frequency: Quarterly'
\echo '========================================='

