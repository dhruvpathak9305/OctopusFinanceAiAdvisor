# Apply Database Fix #13: Correct "Who Paid" Calculations

## 🎯 What This Fixes

**Problem**: Group balances showing incorrectly because the system was using who **created** the transaction instead of who actually **paid** for it.

**Before**: 
- All payments attributed to the person who added the transaction
- Wrong balances in the "Test" group screen

**After**:
- Payments correctly attributed to the person selected in "Who paid for this expense?"
- Accurate "Others owe them" calculations

---

## 📊 How to Apply

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com
2. Navigate to your project: **OctopusFinanceAiAdvisor**
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Migration
1. Click **New Query**
2. Copy the entire contents of `13_fix_paid_by_calculations.sql`
3. Paste into the SQL editor
4. Click **Run** (or press `Cmd+Enter` / `Ctrl+Enter`)

### Step 3: Verify Success
You should see:
```
Success. No rows returned
```

---

## 🧪 Test the Fix

### Quick Test Query
Run this to check your "Test" group balances:

```sql
-- Replace 'your-test-group-id' with actual group ID
SELECT * FROM get_group_balances('your-test-group-id');
```

### Expected Results
For your 3 transactions (₹100 each, 3 people split):

| user_name         | total_paid | total_owed | net_balance |
|-------------------|------------|------------|-------------|
| dhruvpathak9305   | 300.00     | 99.99      | 200.01      |
| Test              | 300.00     | 99.99      | 200.01      |
| Test 2            | 300.00     | 99.99      | 200.01      |

**Explanation**:
- Each person paid ₹300 (3 transactions × ₹100)
- Each person owes ₹99.99 (their 1/3 share × 3 transactions)
- Net: Each person should receive ₹200.01 from others

---

## 🔍 What Changed in the Function

### Before (WRONG):
```sql
user_payments AS (
  SELECT 
    t.user_id,  -- ❌ Transaction creator
    COALESCE(SUM(t.amount), 0) as total_paid
  FROM public.transactions_real t
  ...
)
```

### After (CORRECT):
```sql
payments_by_participant AS (
  SELECT 
    ...
    COALESCE(SUM(
      CASE 
        WHEN ap.user_id IS NOT NULL AND ts.paid_by = ap.user_id 
          THEN t.amount  -- ✅ Actual payer
        ...
      END
    ), 0) as total_paid
  FROM all_participants ap
  LEFT JOIN transaction_splits ts ON ts.paid_by = ap.user_id
  ...
)
```

---

## 🎬 What Happens Next

After applying this fix:

1. **Reload your app**
2. **Go to Financial Relationships → Test group**
3. **Check Member Balances section**

You should now see correct calculations for:
- ✅ How much each person paid
- ✅ How much each person owes (their share)
- ✅ Net balance (paid - owed)

---

## ⚠️ Important Notes

1. **Historical Data**: This fix applies to ALL transactions, including existing ones. The `paid_by` field is already being populated correctly by our UI, so new transactions already have the right data.

2. **Existing Transactions**: If you have old transactions where `paid_by` is NULL, the function will treat them as if no one paid (total_paid = 0). You may want to:
   - Delete test data and recreate
   - Or manually update `paid_by` for existing splits

3. **UI Already Works**: Your UI changes are already saving `paid_by` correctly! This fix just makes the balance calculations use that data.

---

## 🐛 Troubleshooting

### Issue: Still seeing "₹0.0 R"
**Solution**: 
```sql
-- Check if paid_by is populated
SELECT id, transaction_id, user_id, paid_by, share_amount, is_guest_user, guest_name
FROM transaction_splits
WHERE group_id = 'your-group-id';

-- If paid_by is NULL, update it:
UPDATE transaction_splits
SET paid_by = user_id  -- or the actual payer's ID
WHERE group_id = 'your-group-id' AND paid_by IS NULL;
```

### Issue: Guest users not showing
**Solution**: Function already handles guests! Make sure:
- `is_guest_user = true` in the splits
- `guest_name` and `guest_email` are filled

---

## 📚 Related Files

- **Migration SQL**: `13_fix_paid_by_calculations.sql`
- **UI Implementation**: `src/mobile/components/ExpenseSplitting/SplitCalculator.tsx`
- **Service Layer**: `services/expenseSplittingService.ts`
- **Documentation**: `docs/features/transaction-splitting/WHO_PAID_UI_SIMPLIFICATION.md`

---

## ✅ Checklist

- [ ] Backed up database (optional but recommended)
- [ ] Opened Supabase SQL Editor
- [ ] Ran `13_fix_paid_by_calculations.sql`
- [ ] Saw "Success" message
- [ ] Tested with verification query
- [ ] Reloaded mobile app
- [ ] Checked group balances - showing correctly!

---

**Last Updated**: October 25, 2025  
**Migration Number**: 13  
**Status**: Ready to apply

