-- Query to check what's in the Test group
-- This will help us understand why members are showing as "Unknown"

-- 1. Check group members
SELECT 
  'Group Members' as source,
  gm.id,
  gm.user_id,
  gm.user_name,
  gm.user_email,
  gm.role,
  gm.is_registered_user
FROM public.group_members gm
WHERE gm.group_id = (SELECT id FROM public.groups WHERE name = 'Test' LIMIT 1);

-- 2. Check transaction splits for this group
SELECT 
  'Transaction Splits' as source,
  ts.id,
  ts.user_id,
  ts.is_guest_user,
  ts.guest_name,
  ts.guest_email,
  ts.share_amount,
  ts.is_paid,
  t.amount as transaction_amount,
  t.name as transaction_name
FROM public.transaction_splits ts
LEFT JOIN public.transactions_real t ON t.id = ts.transaction_id
WHERE ts.group_id = (SELECT id FROM public.groups WHERE name = 'Test' LIMIT 1)
ORDER BY ts.created_at DESC;

-- 3. Check auth.users info
SELECT 
  'Auth Users' as source,
  u.id,
  u.email,
  u.raw_user_meta_data->>'name' as metadata_name,
  u.raw_user_meta_data->>'full_name' as metadata_full_name
FROM auth.users u
WHERE u.id IN (
  SELECT DISTINCT user_id 
  FROM public.group_members 
  WHERE group_id = (SELECT id FROM public.groups WHERE name = 'Test' LIMIT 1)
    AND user_id IS NOT NULL
);

