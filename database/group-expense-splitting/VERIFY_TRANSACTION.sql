-- Verify the "Test" transaction was created successfully
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check if transaction exists
SELECT 
  id,
  name,
  amount,
  date,
  type,
  created_at,
  metadata
FROM transactions_real
WHERE id = '8ea73999-cfac-490f-aa9c-de7db362fd2c';

-- 2. Check splits for this transaction
SELECT 
  id,
  user_id,
  is_guest_user,
  guest_name,
  guest_email,
  share_amount,
  paid_by,
  group_id
FROM transaction_splits
WHERE transaction_id = '8ea73999-cfac-490f-aa9c-de7db362fd2c';

-- 3. Check all recent transactions
SELECT 
  id,
  name,
  amount,
  date,
  created_at,
  metadata->'has_splits' as has_splits
FROM transactions_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
ORDER BY created_at DESC
LIMIT 10;

