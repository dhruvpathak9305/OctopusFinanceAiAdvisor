-- =====================================================================
-- GET ALL MAPPING DATA FROM SUPABASE
-- =====================================================================
-- Run this query in Supabase SQL Editor to get all your UUIDs
-- Copy the results and use them to update your mapping files
-- =====================================================================

-- =====================================================================
-- SECTION 1: GET YOUR USER UUID
-- =====================================================================
-- This is the most important UUID you need for everything

SELECT 
  '=== YOUR USER UUID ===' as section,
  id as user_uuid,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;

-- Copy the user_uuid from above and use it in all other queries below
-- Replace 'YOUR_USER_UUID' with your actual UUID

-- =====================================================================
-- SECTION 2: GET ALL YOUR ACCOUNTS
-- =====================================================================
-- These are your bank accounts, credit cards, etc.

SELECT 
  '=== YOUR ACCOUNTS ===' as section,
  id as account_uuid,
  name as account_name,
  type as account_type,
  currency,
  balance,
  created_at
FROM accounts_real
WHERE user_id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
ORDER BY name;

-- =====================================================================
-- SECTION 3: GET ALL YOUR BUDGET CATEGORIES
-- =====================================================================
-- These are your top-level budget categories

SELECT 
  '=== YOUR BUDGET CATEGORIES ===' as section,
  id as category_uuid,
  name as category_name,
  type as category_type,
  created_at
FROM budget_categories_real
WHERE user_id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
ORDER BY name;

-- =====================================================================
-- SECTION 4: GET ALL YOUR BUDGET SUBCATEGORIES
-- =====================================================================
-- These are your subcategories under each category

SELECT 
  '=== YOUR BUDGET SUBCATEGORIES ===' as section,
  bs.id as subcategory_uuid,
  bs.name as subcategory_name,
  bc.name as parent_category_name,
  bs.category_id as parent_category_uuid,
  bs.created_at
FROM budget_subcategories_real bs
LEFT JOIN budget_categories_real bc ON bs.category_id = bc.id
WHERE bs.user_id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
ORDER BY bc.name, bs.name;

-- =====================================================================
-- SECTION 5: GET COMPLETE MAPPING JSON (READY TO USE!)
-- =====================================================================
-- This generates a complete mapping JSON you can copy-paste

WITH user_info AS (
  SELECT id as user_id, email FROM auth.users ORDER BY created_at DESC LIMIT 1
),
accounts AS (
  SELECT 
    jsonb_build_object(
      'account_id', id,
      'account_name', name,
      'account_type', type,
      'balance', balance,
      'currency', currency
    ) as account_data
  FROM accounts_real
  WHERE user_id = (SELECT user_id FROM user_info)
),
categories AS (
  SELECT 
    jsonb_build_object(
      'category_id', id,
      'category_name', name,
      'category_type', type
    ) as category_data
  FROM budget_categories_real
  WHERE user_id = (SELECT user_id FROM user_info)
)
SELECT jsonb_pretty(
  jsonb_build_object(
    'user_id', (SELECT user_id FROM user_info),
    'user_email', (SELECT email FROM user_info),
    'accounts', (SELECT jsonb_agg(account_data) FROM accounts),
    'categories', (SELECT jsonb_agg(category_data) FROM categories),
    'generated_at', NOW(),
    'instructions', 'Copy this JSON and use it to update your account-bank-mapping.json file'
  )
) as complete_mapping_json;

-- =====================================================================
-- SECTION 6: GENERATE CHATGPT PROMPT WITH YOUR UUID
-- =====================================================================
-- This creates a ready-to-use ChatGPT prompt with your UUID

WITH user_info AS (
  SELECT id as user_id, email FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT 
  '=== COPY THIS INTO CHATGPT PROMPT ===' as section,
  CONCAT(
    'Replace YOUR_USER_UUID_HERE with: ', 
    user_id::text
  ) as instruction,
  user_id::text as your_user_uuid
FROM user_info;

-- =====================================================================
-- SECTION 7: ACCOUNT SUMMARY FOR QUICK REFERENCE
-- =====================================================================
-- Easy-to-read summary of your accounts

WITH user_info AS (
  SELECT id as user_id FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT 
  name as account_name,
  type as account_type,
  balance as current_balance,
  currency,
  SUBSTRING(id::text, 1, 8) || '...' as uuid_preview,
  id as full_uuid
FROM accounts_real
WHERE user_id = (SELECT user_id FROM user_info)
ORDER BY type, name;

-- =====================================================================
-- SECTION 8: CATEGORY SUMMARY FOR QUICK REFERENCE
-- =====================================================================
-- Easy-to-read summary of your categories with subcategories

WITH user_info AS (
  SELECT id as user_id FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT 
  bc.name as category_name,
  bc.type as category_type,
  COUNT(bs.id) as subcategory_count,
  SUBSTRING(bc.id::text, 1, 8) || '...' as category_uuid_preview,
  bc.id as full_category_uuid
FROM budget_categories_real bc
LEFT JOIN budget_subcategories_real bs ON bc.id = bs.category_id
WHERE bc.user_id = (SELECT user_id FROM user_info)
GROUP BY bc.id, bc.name, bc.type
ORDER BY bc.type, bc.name;

-- =====================================================================
-- SECTION 9: SAMPLE TRANSACTION JSON WITH YOUR UUIDS
-- =====================================================================
-- Generate a sample transaction JSON using your actual UUIDs

WITH user_info AS (
  SELECT id as user_id FROM auth.users ORDER BY created_at DESC LIMIT 1
),
sample_account AS (
  SELECT id as account_id, name as account_name
  FROM accounts_real
  WHERE user_id = (SELECT user_id FROM user_info)
  AND type = 'bank'
  LIMIT 1
)
SELECT jsonb_pretty(
  jsonb_build_array(
    jsonb_build_object(
      'user_id', (SELECT user_id FROM user_info),
      'name', 'Sample Transaction',
      'description', 'This is a sample transaction with your actual UUIDs',
      'amount', 1000.00,
      'date', NOW()::date || 'T00:00:00Z',
      'type', 'expense',
      'source_account_type', 'bank',
      'source_account_name', COALESCE((SELECT account_name FROM sample_account), 'Your Bank Account'),
      'source_account_id', (SELECT account_id FROM sample_account),
      'merchant', 'Sample Merchant',
      'metadata', jsonb_build_object(
        'upload_source', 'chatgpt_bulk_upload',
        'upload_date', NOW()::date::text,
        'note', 'This is a test transaction with your real user_id and account_id'
      )
    )
  )
) as sample_transaction_json;

-- =====================================================================
-- SECTION 10: VALIDATION QUERIES
-- =====================================================================
-- Verify your setup is correct

-- Check if you have accounts
WITH user_info AS (
  SELECT id as user_id FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT 
  'Account Check' as validation_type,
  COUNT(*) as total_accounts,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ No accounts found! Create some accounts first.'
    WHEN COUNT(*) < 3 THEN '⚠️ Few accounts. Add more if needed.'
    ELSE '✅ Good number of accounts!'
  END as status
FROM accounts_real
WHERE user_id = (SELECT user_id FROM user_info);

-- Check if you have categories
WITH user_info AS (
  SELECT id as user_id FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT 
  'Category Check' as validation_type,
  COUNT(*) as total_categories,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ No categories found! Create some categories first.'
    WHEN COUNT(*) < 5 THEN '⚠️ Few categories. Add more for better organization.'
    ELSE '✅ Good number of categories!'
  END as status
FROM budget_categories_real
WHERE user_id = (SELECT user_id FROM user_info);

-- Check if you have existing transactions
WITH user_info AS (
  SELECT id as user_id FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT 
  'Transaction Check' as validation_type,
  COUNT(*) as total_transactions,
  SUM(CASE WHEN type = 'income' THEN 1 ELSE 0 END) as income_transactions,
  SUM(CASE WHEN type = 'expense' THEN 1 ELSE 0 END) as expense_transactions,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ No transactions yet. Ready for first upload!'
    ELSE '✅ ' || COUNT(*) || ' existing transactions found.'
  END as status
FROM transactions_real
WHERE user_id = (SELECT user_id FROM user_info);

-- =====================================================================
-- HOW TO USE THIS SCRIPT
-- =====================================================================
-- 
-- 1. Copy this entire script
-- 2. Open Supabase SQL Editor
-- 3. Paste and run the entire script
-- 4. Review all the results below
-- 5. Copy your user_id from Section 1
-- 6. Copy the complete mapping JSON from Section 5
-- 7. Use the data to update your mapping files
-- 
-- =====================================================================

