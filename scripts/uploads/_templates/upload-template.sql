-- Upload [BANK NAME] [MONTH] [YEAR] Transactions
-- Generated: [DATE]
-- Bank: [BANK NAME]
-- Month: [MONTH YEAR]
-- Transactions: [COUNT]
-- Account: ****[LAST 4 DIGITS]

-- ================================================
-- TRANSACTION DATA
-- ================================================

-- Using ENHANCED function with transfer duplicate prevention
SELECT * FROM enhanced_bulk_insert_with_transfer_check('[
  {
    "user_id": "[USER_ID]",
    "name": "[TRANSACTION NAME]",
    "description": "[DESCRIPTION]",
    "amount": [AMOUNT],
    "date": "[YYYY-MM-DD]",
    "type": "[income/expense/transfer]",
    "category_id": "[CATEGORY_ID]",
    "source_account_id": "[SOURCE_ACCOUNT_ID]",
    "destination_account_id": "[DESTINATION_ACCOUNT_ID or null]",
    "metadata": {
      "bank_reference": "[UNIQUE_REFERENCE]",
      "original_description": "[ORIGINAL_TEXT]",
      "upload_source": "manual_bank_statement",
      "upload_date": "[YYYY-MM-DD]",
      "account_last_four": "[LAST_4]",
      "balance_after_transaction": [BALANCE],
      "bank_name": "[BANK_NAME]",
      "statement_period": "[MONTH_YEAR]",
      "upi_reference": "[UPI_REF if applicable]",
      "neft_reference": "[NEFT_REF if applicable]",
      "imps_reference": "[IMPS_REF if applicable]"
    }
  }
]'::jsonb);

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- 1. Check total transactions uploaded
SELECT COUNT(*) as total_[month]_transactions
FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '[YYYY-MM-01]' AND date <= '[YYYY-MM-31]';

-- 2. Check by transaction type
SELECT 
  type,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '[YYYY-MM-01]' AND date <= '[YYYY-MM-31]'
GROUP BY type
ORDER BY type;

-- 3. Verify ending balance
SELECT 
  date,
  name,
  amount,
  (metadata->>'balance_after_transaction')::numeric as balance_after
FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '[YYYY-MM-01]' AND date <= '[YYYY-MM-31]'
ORDER BY date DESC, created_at DESC
LIMIT 1;

-- 4. Check for duplicates
SELECT 
  metadata->>'bank_reference' as bank_ref,
  COUNT(*) as duplicate_count
FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '[YYYY-MM-01]' AND date <= '[YYYY-MM-31]'
GROUP BY metadata->>'bank_reference'
HAVING COUNT(*) > 1;

-- ================================================
-- UPLOAD SUMMARY
-- ================================================

\echo '================================================'
\echo 'Upload Summary'
\echo '================================================'
\echo 'Bank: [BANK NAME]'
\echo 'Month: [MONTH YEAR]'
\echo 'Account: ****[LAST 4]'
\echo 'Expected Transactions: [COUNT]'
\echo '================================================'
\echo 'Run verification script to confirm upload'
\echo 'scripts/verification/verify-[bank]-[month]-[year].sql'
\echo '================================================'

