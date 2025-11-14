# Apply Migrations #14 & #15: Full Guest Payer Support

## ⚠️ IMPORTANT: Constraint Violation Error?

If you're seeing this error:
```
ERROR: check constraint "transaction_splits_payer_check" of relation "transaction_splits" is violated by some row
```

**Use the FIXED version**: See `APPLY_MIGRATION_14_FIXED.md` for detailed troubleshooting and the corrected migration.

---

## 🎯 What This Fixes

**Problem**: When a guest user is selected as the payer, balances show incorrectly because we don't track which guest paid.

**Solution**: Add `paid_by_guest_name`, `paid_by_guest_email`, and `paid_by_guest_mobile` columns to accurately track guest payers.

---

## 📊 Before vs After

### Before (Phase 1 - Immediate Fix):
```
User selects "Test Guest" as payer
→ paid_by = NULL
→ Balance calculation: Uses transaction creator as fallback
→ ❌ Wrong balances!
```

### After (Phase 2 - Full Solution):
```
User selects "Test Guest" as payer
→ paid_by = NULL
→ paid_by_guest_name = "Test Guest"
→ paid_by_guest_email = "test@gmail.com"
→ paid_by_guest_mobile = "+1234567890"
→ Balance calculation: Correctly attributes to "Test Guest"
→ ✅ Accurate balances!
```

---

## 🚀 How to Apply

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com
2. Navigate to your **OctopusFinanceAiAdvisor** project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run Migration #14 (Add Columns)
1. Click **New Query**
2. Open file: `database/group-expense-splitting/14_add_guest_payer_tracking.sql`
3. Copy **ALL** the SQL code
4. Paste into Supabase SQL Editor
5. Click **Run** (or `Cmd+Enter`)
6. Wait for "✅ Success. No rows returned"

### Step 3: Run Migration #15 (Update Balance Function)
1. Click **New Query** (or clear existing)
2. Open file: `database/group-expense-splitting/15_update_group_balances_guest_payer.sql`
3. Copy **ALL** the SQL code
4. Paste into Supabase SQL Editor
5. Click **Run** (or `Cmd+Enter`)
6. Wait for "✅ Success. No rows returned"

### Step 4: Reload Your App
1. **Fully reload** your React Native app
2. Or restart: `Ctrl+C` then `npm start`

---

## 🧪 Test the Changes

### Test 1: Create Split Transaction with Guest Payer
```
1. Open app → Add Transaction
2. Enable "Split"
3. Select group: "Test"
4. Select guest user as payer: "Test Guest"
5. Click "Add Transaction"
6. ✅ Should create successfully
7. ✅ Should auto-refresh UI
```

### Test 2: Check Console Logs
After creating the transaction, you should see:
```
✅ Guest user selected as payer: Test Guest (test@gmail.com)
📤 Sending to database function:
  ...
  Splits paid_by values: [
    { user: "Test Guest", is_guest: true, paid_by: null }
  ]
✅ Transaction created successfully: <transaction-id>
```

### Test 3: Verify in Database
Run this in Supabase SQL Editor:
```sql
-- Check that guest payer fields are populated
SELECT 
  id,
  user_id,
  is_guest_user,
  guest_name,
  paid_by,
  paid_by_guest_name,
  paid_by_guest_email,
  paid_by_guest_mobile,
  share_amount
FROM transaction_splits
WHERE transaction_id = '<your-transaction-id>'
ORDER BY created_at DESC;
```

**Expected Result**:
| user_id | is_guest_user | guest_name | paid_by | paid_by_guest_name | paid_by_guest_email | paid_by_guest_mobile | share_amount |
|---------|---------------|------------|---------|---------------------|---------------------|----------------------|--------------|
| NULL    | TRUE          | Test Guest | NULL    | Test Guest          | test@gmail.com      | +1234567890          | 33.33        |
| NULL    | TRUE          | Test 2     | NULL    | Test Guest          | test@gmail.com      | +1234567890          | 33.33        |
| <your-id> | FALSE       | NULL       | NULL    | Test Guest          | test@gmail.com      | +1234567890          | 33.34        |

**Key Points**:
- ✅ `paid_by = NULL` (because guest paid)
- ✅ `paid_by_guest_name = "Test Guest"` (identifies which guest)
- ✅ `paid_by_guest_email` populated
- ✅ `paid_by_guest_mobile` populated (if provided)
- ✅ **ALL splits** have the same guest payer info

### Test 4: Check Group Balances
```sql
-- Get group balances (should now be accurate!)
SELECT * FROM get_group_balances('<your-test-group-id>');
```

**Expected Result**:
| user_name | user_email | total_paid | total_owed | net_balance |
|-----------|------------|------------|------------|-------------|
| Test Guest | test@gmail.com | 100.00 | 33.33 | 66.67 |
| Test 2 | test2@gmail.com | 0.00 | 33.33 | -33.33 |
| dhruvpathak9305 | your@email.com | 0.00 | 33.34 | -33.34 |

**Interpretation**:
- ✅ Test Guest paid ₹100, owes ₹33.33 → Others owe them ₹66.67
- ✅ Test 2 paid ₹0, owes ₹33.33 → They owe ₹33.33
- ✅ You paid ₹0, owe ₹33.34 → You owe ₹33.34

**Perfect!** Balances are now accurate! 🎉

---

## 🔍 What Changed

### Database Schema
```sql
-- NEW COLUMNS in transaction_splits table:
ALTER TABLE transaction_splits
  ADD COLUMN paid_by_guest_name TEXT,
  ADD COLUMN paid_by_guest_email TEXT,
  ADD COLUMN paid_by_guest_mobile TEXT;

-- NEW CONSTRAINT (either registered OR guest payer, not both):
CHECK (
  (paid_by IS NOT NULL AND paid_by_guest_name IS NULL) OR
  (paid_by IS NULL AND paid_by_guest_name IS NOT NULL)
);
```

### Database Function (create_transaction_with_splits)
```sql
-- NOW INSERTS guest payer fields:
INSERT INTO transaction_splits (
  ...,
  paid_by,                    -- NULL for guests
  paid_by_guest_name,         -- ✅ NEW
  paid_by_guest_email,        -- ✅ NEW
  paid_by_guest_mobile,       -- ✅ NEW
  ...
);
```

### Balance Calculation (get_group_balances)
```sql
-- NOW CHECKS both paid_by AND guest payer fields:
CASE 
  -- Registered user paid
  WHEN ts.paid_by = ap.user_id THEN t.amount
  
  -- ✅ NEW: Guest user paid
  WHEN ts.paid_by IS NULL
   AND ts.paid_by_guest_name = ap.guest_name 
   AND ts.paid_by_guest_email = ap.guest_email
   THEN t.amount
  
  ELSE 0
END
```

### Service Layer (expenseSplittingService.ts)
```typescript
// ✅ NEW: Extract guest payer details
const guestPayerDetails = isPayerGuest ? {
  paid_by_guest_name: payerGuest?.user_name,
  paid_by_guest_email: payerGuest?.user_email,
  paid_by_guest_mobile: payerGuest?.mobile_number,
} : null;

// ✅ NEW: Include in split data
return {
  ...,
  paid_by: actualPaidBy, // NULL for guests
  paid_by_guest_name: guestPayerDetails?.paid_by_guest_name,
  paid_by_guest_email: guestPayerDetails?.paid_by_guest_email,
  paid_by_guest_mobile: guestPayerDetails?.paid_by_guest_mobile,
};
```

---

## ✅ Checklist

### Before Starting:
- [ ] Backed up database (optional but recommended)
- [ ] Closed any split transactions in progress

### Migration #14:
- [ ] Opened Supabase SQL Editor
- [ ] Ran `14_add_guest_payer_tracking.sql`
- [ ] Saw "Success" message
- [ ] Verified columns added: `SELECT * FROM transaction_splits LIMIT 1;`

### Migration #15:
- [ ] Opened Supabase SQL Editor
- [ ] Ran `15_update_group_balances_guest_payer.sql`
- [ ] Saw "Success" message
- [ ] Tested balance function: `SELECT * FROM get_group_balances('group-id');`

### Post-Migration:
- [ ] Reloaded React Native app
- [ ] Created test split transaction with guest payer
- [ ] Verified console logs show guest payer details
- [ ] Checked database: guest payer fields populated
- [ ] Verified group balances are accurate
- [ ] Deleted test data (optional)

---

## 🐛 Troubleshooting

### Issue: "Column already exists"
**Solution**: Migration #14 was already run partially. That's okay! Continue with Migration #15.

### Issue: "Constraint already exists"
**Solution**: Run this to drop old constraint first:
```sql
ALTER TABLE transaction_splits
  DROP CONSTRAINT IF EXISTS transaction_splits_payer_check;
```
Then re-run Migration #14.

### Issue: paid_by_guest_* fields are NULL
**Possible Causes**:
1. **App not reloaded** → Reload app to get new code
2. **Registered user selected as payer** → That's correct! Guest fields only populate for guest payers
3. **Old transaction** → Create a new one to test

### Issue: Balances still wrong
**Check**:
```sql
-- Verify which migrations are applied
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'transaction_splits' 
  AND column_name = 'paid_by_guest_name'
) as migration_14_applied;

SELECT EXISTS (
  SELECT 1 FROM pg_proc 
  WHERE proname = 'get_group_balances'
  AND prosrc LIKE '%paid_by_guest%'
) as migration_15_applied;
```

Both should return `TRUE`.

---

## 📚 Related Files

- **Migration SQL**:
  - `database/group-expense-splitting/14_add_guest_payer_tracking.sql`
  - `database/group-expense-splitting/15_update_group_balances_guest_payer.sql`
- **Service Layer**: `services/expenseSplittingService.ts`
- **Documentation**: 
  - `docs/features/transaction-splitting/GUEST_PAYER_FULL_IMPLEMENTATION.md`
  - `docs/features/transaction-splitting/GUEST_PAYER_FIX.md` (Phase 1)

---

**Migration Numbers**: 14, 15  
**Created**: October 25, 2025  
**Status**: Ready to Apply  
**Priority**: High (Completes guest payer support)  
**Breaking Changes**: None (backward compatible)

