# Transaction Split SQL Test Queries

## Quick Test - Verify Database Schema

Run these queries to verify the database is ready for split transactions:

### 1. Check Transaction Splits Table Structure
```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'transaction_splits'
ORDER BY ordinal_position;
```

**Expected Output:** Should include these columns:
- `is_guest_user` (boolean)
- `guest_name` (text)
- `guest_email` (text)
- `guest_mobile` (text)
- `guest_relationship` (text)

---

### 2. Check Group Members Table Structure
```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'group_members'
  AND column_name IN ('mobile_number', 'relationship')
ORDER BY ordinal_position;
```

**Expected Output:** Should show:
- `mobile_number` (text, nullable)
- `relationship` (text, nullable)

---

### 3. Verify Functions Exist
```sql
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'create_transaction_with_splits',
    'get_group_balances',
    'settle_transaction_split',
    'get_user_unsettled_splits',
    'create_guest_split',
    'get_guest_split_details'
  )
ORDER BY routine_name;
```

**Expected Output:** All 6 functions should be present.

---

## Simulation Test - Create a Mock Split Transaction

### 4. Create Test Group
```sql
-- Create a test group
INSERT INTO public.groups (name, description, created_by, is_active)
VALUES (
  'Test GOB Group',
  'Test group for split verification',
  auth.uid(),
  true
)
RETURNING id, name, created_by;
```

**Save the returned group ID** for the next steps.

---

### 5. Add Test Members to Group
```sql
-- Replace <GROUP_ID> with the ID from step 4
-- Add Shivam
INSERT INTO public.group_members (
  group_id, 
  user_id, 
  user_name, 
  user_email, 
  mobile_number, 
  relationship, 
  role, 
  is_active
)
VALUES (
  '<GROUP_ID>',
  gen_random_uuid(),
  'Shivam',
  'shivam@gmail.com',
  '9123456789',
  'Friend',
  'member',
  true
)
RETURNING id, user_name, mobile_number, relationship;

-- Add Yash
INSERT INTO public.group_members (
  group_id, 
  user_id, 
  user_name, 
  user_email, 
  mobile_number, 
  relationship, 
  role, 
  is_active
)
VALUES (
  '<GROUP_ID>',
  gen_random_uuid(),
  'Yash',
  'yash@gmail.com',
  '9987654321',
  'Friend',
  'member',
  true
)
RETURNING id, user_name, mobile_number, relationship;
```

---

### 6. Test Split Transaction Creation
```sql
-- Test the create_transaction_with_splits function
SELECT create_transaction_with_splits(
  -- Transaction data
  jsonb_build_object(
    'name', 'Test Society Maintenance',
    'description', 'Testing split functionality',
    'amount', 5535.9,
    'date', now(),
    'type', 'expense',
    'merchant', 'MyGate',
    'source_account_type', 'bank',
    'source_account_name', 'IDFC Bank',
    'metadata', jsonb_build_object('test', true)
  ),
  -- Splits array
  ARRAY[
    -- Your split
    jsonb_build_object(
      'is_guest', false,
      'user_id', auth.uid()::text,
      'share_amount', 1845.30,
      'share_percentage', 33.33,
      'split_type', 'equal',
      'paid_by', auth.uid()::text
    ),
    -- Shivam's split (guest)
    jsonb_build_object(
      'is_guest', true,
      'user_name', 'Shivam',
      'user_email', 'shivam@gmail.com',
      'mobile_number', '9123456789',
      'relationship', 'Friend',
      'group_id', '<GROUP_ID>',
      'share_amount', 1845.30,
      'share_percentage', 33.33,
      'split_type', 'equal',
      'paid_by', auth.uid()::text
    ),
    -- Yash's split (guest)
    jsonb_build_object(
      'is_guest', true,
      'user_name', 'Yash',
      'user_email', 'yash@gmail.com',
      'mobile_number', '9987654321',
      'relationship', 'Friend',
      'group_id', '<GROUP_ID>',
      'share_amount', 1845.30,
      'share_percentage', 33.34,
      'split_type', 'equal',
      'paid_by', auth.uid()::text
    )
  ]::jsonb[]
) AS transaction_id;
```

**Expected Result:** Should return a UUID (the transaction ID).

---

### 7. Verify Transaction Created
```sql
-- Replace <TRANSACTION_ID> with the ID from step 6
SELECT 
  id,
  name,
  amount,
  type,
  metadata->>'has_splits' as has_splits,
  metadata->>'split_count' as split_count,
  date
FROM transactions_real
WHERE id = '<TRANSACTION_ID>';
```

**Expected Output:**
- `name`: "Test Society Maintenance"
- `amount`: 5535.9
- `has_splits`: "true"
- `split_count`: "3"

---

### 8. Verify Splits Created with Guest Data
```sql
-- Replace <TRANSACTION_ID> with the ID from step 6
SELECT 
  id,
  is_guest_user,
  COALESCE(guest_name, 'Current User') as participant_name,
  guest_email,
  guest_mobile,
  guest_relationship,
  share_amount,
  is_paid,
  split_type
FROM transaction_splits
WHERE transaction_id = '<TRANSACTION_ID>'
ORDER BY is_guest_user, guest_name;
```

**Expected Output:** 3 rows
1. Current user: `is_guest_user = false`, `is_paid = true`, `share_amount = 1845.30`
2. Shivam: `is_guest_user = true`, `mobile = 9123456789`, `relationship = Friend`, `share_amount = 1845.30`
3. Yash: `is_guest_user = true`, `mobile = 9987654321`, `relationship = Friend`, `share_amount = 1845.30`

---

### 9. Verify Split Amounts Sum Correctly
```sql
-- Replace <TRANSACTION_ID> with the ID from step 6
SELECT 
  t.amount as transaction_amount,
  SUM(ts.share_amount) as split_total,
  t.amount - SUM(ts.share_amount) as difference
FROM transactions_real t
JOIN transaction_splits ts ON t.id = ts.transaction_id
WHERE t.id = '<TRANSACTION_ID>'
GROUP BY t.id, t.amount;
```

**Expected Output:**
- `difference`: 0.00 (or within -0.01 to +0.01 for rounding)

---

## Cleanup Test Data

### 10. Remove Test Data
```sql
-- Delete test splits (cascades will handle this)
DELETE FROM transaction_splits 
WHERE transaction_id = '<TRANSACTION_ID>';

-- Delete test transaction
DELETE FROM transactions_real 
WHERE id = '<TRANSACTION_ID>';

-- Delete test group members
DELETE FROM group_members 
WHERE group_id = '<GROUP_ID>';

-- Delete test group
DELETE FROM groups 
WHERE id = '<GROUP_ID>';
```

---

## Real Data Queries

### View All Split Transactions
```sql
SELECT 
  t.id,
  t.name,
  t.amount,
  t.date,
  t.metadata->>'split_count' as participants,
  COUNT(ts.id) as actual_splits,
  SUM(CASE WHEN ts.is_paid THEN ts.share_amount ELSE 0 END) as paid_amount,
  SUM(CASE WHEN NOT ts.is_paid THEN ts.share_amount ELSE 0 END) as pending_amount
FROM transactions_real t
JOIN transaction_splits ts ON t.id = ts.transaction_id
WHERE t.metadata->>'has_splits' = 'true'
GROUP BY t.id, t.name, t.amount, t.date, t.metadata
ORDER BY t.date DESC;
```

---

### View All Guest Participants
```sql
SELECT 
  guest_name,
  guest_email,
  guest_mobile,
  guest_relationship,
  COUNT(*) as transaction_count,
  SUM(share_amount) as total_split_amount,
  SUM(CASE WHEN is_paid THEN share_amount ELSE 0 END) as paid_amount,
  SUM(CASE WHEN NOT is_paid THEN share_amount ELSE 0 END) as pending_amount
FROM transaction_splits
WHERE is_guest_user = true
GROUP BY guest_name, guest_email, guest_mobile, guest_relationship
ORDER BY transaction_count DESC;
```

---

### Check for Data Integrity Issues
```sql
-- Find transactions where splits don't match transaction amount
SELECT 
  t.id,
  t.name,
  t.amount as transaction_amount,
  SUM(ts.share_amount) as split_total,
  ABS(t.amount - SUM(ts.share_amount)) as difference
FROM transactions_real t
JOIN transaction_splits ts ON t.id = ts.transaction_id
GROUP BY t.id, t.name, t.amount
HAVING ABS(t.amount - SUM(ts.share_amount)) > 0.01
ORDER BY difference DESC;
```

**Expected Result:** Should return 0 rows (no mismatches).

---

## Performance Check

### Index Usage Verification
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('transaction_splits', 'group_members')
ORDER BY tablename, indexname;
```

**Expected:** Should see indexes on:
- `transaction_splits.transaction_id`
- `transaction_splits.user_id`
- `transaction_splits.guest_email`
- `transaction_splits.is_guest_user`
- `group_members.mobile_number`

---

## Success Criteria ✅

All tests pass if:

1. ✅ Schema includes all guest user fields
2. ✅ All 6 functions exist
3. ✅ Test transaction creates successfully
4. ✅ 3 split records created (1 registered + 2 guests)
5. ✅ Guest fields (mobile, relationship) are populated
6. ✅ Split amounts sum to transaction amount exactly
7. ✅ No data integrity issues found
8. ✅ All indexes exist

---

**Ready for Production! 🚀**

