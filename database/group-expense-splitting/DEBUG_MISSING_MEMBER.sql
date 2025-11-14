-- Debug: Why is "TEst 2" not showing in Member Balances?

-- Step 1: Check all group members
SELECT 
  'Group Members' as section,
  user_name,
  user_email,
  is_registered_user,
  role
FROM public.group_members
WHERE group_id = 'acaf8cbe-5a88-4372-8ee9-6e87a0d252e5' -- Test group ID
ORDER BY user_name;

-- Step 2: Check all transaction splits for this group
SELECT 
  'Transaction Splits' as section,
  ts.id,
  ts.user_id,
  ts.is_guest_user,
  ts.guest_name,
  ts.guest_email,
  ts.share_amount,
  ts.paid_by,
  ts.paid_by_guest_name,
  ts.paid_by_guest_email,
  t.name as transaction_name,
  t.amount as transaction_amount
FROM public.transaction_splits ts
LEFT JOIN public.transactions_real t ON t.id = ts.transaction_id
WHERE ts.group_id = 'acaf8cbe-5a88-4372-8ee9-6e87a0d252e5'
ORDER BY t.created_at DESC, ts.guest_name;

-- Step 3: Check what get_group_balances returns
SELECT 
  'Group Balances' as section,
  user_name,
  user_email,
  total_paid,
  total_owed,
  net_balance
FROM get_group_balances('acaf8cbe-5a88-4372-8ee9-6e87a0d252e5')
ORDER BY user_name;

-- Step 4: Check if columns exist (verify migrations)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'transaction_splits'
  AND column_name IN (
    'paid_by', 
    'paid_by_guest_name', 
    'paid_by_guest_email', 
    'paid_by_guest_mobile'
  )
ORDER BY column_name;

