-- =====================================================================
-- BULK TRANSACTION UPLOAD SCRIPT
-- =====================================================================
-- Use this script to upload ChatGPT-transformed transactions to Supabase
-- =====================================================================

-- STEP 1: VALIDATE YOUR JSON DATA (OPTIONAL BUT RECOMMENDED)
-- Copy-paste the JSON array from ChatGPT and test validation

SELECT * FROM validate_bulk_transactions('
[
  {
    "user_id": "YOUR_USER_UUID",
    "name": "Test Transaction",
    "amount": 100.00,
    "type": "expense",
    "source_account_type": "bank"
  }
]'::jsonb);

-- Expected output:
-- is_valid | total_count | validation_errors
-- true     | 1           | []


-- STEP 2: CHECK FOR DUPLICATES (OPTIONAL BUT RECOMMENDED)
-- This helps prevent duplicate uploads

SELECT * FROM detect_duplicate_transactions('
[
  {
    "user_id": "YOUR_USER_UUID",
    "name": "Amazon Purchase",
    "description": "UPI/Amazon/Payment",
    "amount": 1549.00,
    "date": "2025-09-12T00:00:00Z",
    "type": "expense",
    "source_account_type": "bank"
  }
]'::jsonb, 'YOUR_USER_UUID'::uuid);

-- Expected output:
-- duplicate_count | duplicates
-- 0               | []


-- STEP 3: UPLOAD TRANSACTIONS
-- Replace the JSON array below with the output from ChatGPT

SELECT * FROM bulk_insert_transactions('
[
  {
    "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Amazon Purchase",
    "description": "UPI/Amazon/401234567890/Payment",
    "amount": 1549.00,
    "date": "2025-09-12T00:00:00Z",
    "type": "expense",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings",
    "source_account_id": null,
    "destination_account_type": null,
    "destination_account_name": null,
    "destination_account_id": null,
    "category_id": null,
    "subcategory_id": null,
    "merchant": "Amazon",
    "icon": null,
    "is_recurring": false,
    "recurrence_pattern": null,
    "recurrence_end_date": null,
    "parent_transaction_id": null,
    "interest_rate": null,
    "loan_term_months": null,
    "is_credit_card": false,
    "metadata": {
      "bank_reference": "123456789",
      "original_description": "UPI/Amazon/401234567890/Payment",
      "upload_source": "chatgpt_bulk_upload",
      "upload_date": "2025-10-18",
      "bank_name": "ICICI"
    }
  },
  {
    "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Salary Credit",
    "description": "NEFT CR-HDFC0003861-Company Name-Salary for Sep",
    "amount": 75000.00,
    "date": "2025-09-01T00:00:00Z",
    "type": "income",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings",
    "destination_account_name": "ICICI Savings",
    "merchant": null,
    "is_recurring": false,
    "metadata": {
      "bank_reference": "987654321",
      "original_description": "NEFT CR-HDFC0003861-Company Name-Salary for Sep",
      "upload_source": "chatgpt_bulk_upload",
      "upload_date": "2025-10-18",
      "bank_name": "ICICI"
    }
  }
]'::jsonb);

-- Expected output:
-- status  | inserted_count | error_count | errors
-- SUCCESS | 2              | 0           | []


-- STEP 4: VERIFY UPLOADED TRANSACTIONS
-- Check that your transactions were uploaded correctly

SELECT 
  id,
  name,
  description,
  amount,
  date,
  type,
  source_account_type,
  source_account_name,
  merchant,
  created_at,
  metadata->>'upload_source' as upload_source
FROM transactions_real
WHERE user_id = 'YOUR_USER_UUID'
  AND metadata->>'upload_source' = 'chatgpt_bulk_upload'
ORDER BY date DESC
LIMIT 50;


-- STEP 5: VIEW UPLOAD SUMMARY BY MONTH
-- Get a summary of uploaded transactions grouped by month

SELECT 
  TO_CHAR(date, 'YYYY-MM') as month,
  COUNT(*) as transaction_count,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
  metadata->>'bank_name' as bank_name
FROM transactions_real
WHERE user_id = 'YOUR_USER_UUID'
  AND metadata->>'upload_source' = 'chatgpt_bulk_upload'
GROUP BY TO_CHAR(date, 'YYYY-MM'), metadata->>'bank_name'
ORDER BY month DESC, bank_name;


-- =====================================================================
-- TROUBLESHOOTING
-- =====================================================================

-- If upload fails, check common issues:

-- 1. Check if user_id exists
SELECT id, email FROM auth.users WHERE id = 'YOUR_USER_UUID';

-- 2. Check if source_account_id exists (if provided)
SELECT id, name FROM accounts_real WHERE id = 'YOUR_ACCOUNT_UUID';

-- 3. Check if category_id exists (if provided)
SELECT id, name FROM budget_categories_real WHERE id = 'YOUR_CATEGORY_UUID';

-- 4. View recent transactions
SELECT * FROM transactions_real 
WHERE user_id = 'YOUR_USER_UUID' 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Delete test transactions if needed
DELETE FROM transactions_real
WHERE user_id = 'YOUR_USER_UUID'
  AND metadata->>'upload_source' = 'chatgpt_bulk_upload'
  AND date >= '2025-10-18'; -- Be specific with date range!

-- 6. Check transaction count
SELECT COUNT(*) as total_transactions
FROM transactions_real
WHERE user_id = 'YOUR_USER_UUID';


-- =====================================================================
-- ADVANCED: BULK UPDATE AFTER UPLOAD
-- =====================================================================

-- Update category_id for specific merchant patterns
UPDATE transactions_real
SET category_id = 'YOUR_SHOPPING_CATEGORY_UUID',
    subcategory_id = 'YOUR_ONLINE_SHOPPING_SUBCATEGORY_UUID'
WHERE user_id = 'YOUR_USER_UUID'
  AND merchant IN ('Amazon', 'Flipkart', 'Myntra')
  AND category_id IS NULL;

-- Update is_recurring for known recurring transactions
UPDATE transactions_real
SET is_recurring = true,
    recurrence_pattern = 'monthly'
WHERE user_id = 'YOUR_USER_UUID'
  AND (
    name ILIKE '%netflix%' OR
    name ILIKE '%amazon prime%' OR
    name ILIKE '%spotify%'
  );

-- Link credit card payments to credit card accounts
UPDATE transactions_real t
SET destination_account_id = cc.id,
    destination_account_type = 'credit_card'
FROM credit_cards_real cc
WHERE t.user_id = 'YOUR_USER_UUID'
  AND t.name ILIKE '%credit card payment%'
  AND cc.user_id = t.user_id
  AND t.description ILIKE '%' || cc.last_four_digits || '%';


-- =====================================================================
-- CLEANUP: REMOVE DUPLICATE TRANSACTIONS
-- =====================================================================

-- WARNING: Use with caution! This will permanently delete data.

-- View potential duplicates first
WITH duplicate_transactions AS (
  SELECT 
    id,
    name,
    amount,
    date,
    description,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, amount, date::date, description 
      ORDER BY created_at DESC
    ) as row_num
  FROM transactions_real
  WHERE user_id = 'YOUR_USER_UUID'
)
SELECT * FROM duplicate_transactions
WHERE row_num > 1;

-- Delete duplicates (keeps the most recent one)
WITH duplicate_transactions AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, amount, date::date, description 
      ORDER BY created_at DESC
    ) as row_num
  FROM transactions_real
  WHERE user_id = 'YOUR_USER_UUID'
)
DELETE FROM transactions_real
WHERE id IN (
  SELECT id FROM duplicate_transactions WHERE row_num > 1
);

