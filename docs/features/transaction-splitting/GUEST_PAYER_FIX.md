# Guest Payer Foreign Key Fix

## 🐛 The Bug

When selecting a **guest user** as the payer for a split transaction, the app crashes with:

```
ERROR: insert or update on table "transaction_splits" violates 
foreign key constraint "transaction_splits_paid_by_fkey"

Key (paid_by)=(xxx) is not present in table "users"
```

**Root Cause**: 
- Guest users don't exist in `auth.users` table (they're stored inline in `transaction_splits`)
- The `paid_by` column has a foreign key constraint: `REFERENCES auth.users (id)`
- When trying to use a guest's ID in `paid_by`, the constraint fails

---

## ✅ The Fix

### Code Changes
**File**: `services/expenseSplittingService.ts` (Lines 264-286)

```typescript
// Check if paidByUserId is a guest user
const isPayerGuest = paidByUserId && splits.some(
  s => (s.is_guest || !s.user_id) && s.user_id === paidByUserId
);

// Determine actual paid_by value:
// - If payer is a guest: NULL (guests can't be referenced in auth.users)
// - If payer is specified and registered: use paidByUserId
// - Default: current user
const actualPaidBy = isPayerGuest ? null : (paidByUserId || user.id);

// Log warning if guest is payer
if (isPayerGuest) {
  console.warn(
    "⚠️ Guest user selected as payer. paid_by will be NULL. " +
    "Balance calculations will use transaction creator as fallback."
  );
}
```

### What It Does
1. ✅ Checks if the selected payer is a guest user
2. ✅ Sets `paid_by = NULL` for guest payers (avoids foreign key error)
3. ✅ Sets `paid_by = paidByUserId` for registered users (works as intended)
4. ✅ Defaults to current user if no payer specified
5. ✅ Logs helpful warnings for debugging

---

## ⚠️ Current Limitation

### When Guest is Payer:
- ✅ **Transaction creates successfully** (no more error!)
- ⚠️ **Balance calculations use transaction creator** as fallback
- ⚠️ **Guest's payment not tracked** in `paid_by` column

### Example:
```
Transaction: "Dinner" ₹300
Split: 3 people (You, Test Guest, Test 2 Guest)
Payer: Test Guest ← Selected by user

Result:
✅ Transaction created
✅ Splits created
⚠️ paid_by = NULL (not Test Guest's ID)
⚠️ Balance calculation: Attributes payment to you (transaction creator)
```

---

## 🎯 Full Solution (Future Enhancement)

To properly track guest payers, we need:

### Option A: Add Guest Payer Columns (Recommended)
```sql
-- Add to transaction_splits table
ALTER TABLE transaction_splits
  ADD COLUMN paid_by_guest_name TEXT,
  ADD COLUMN paid_by_guest_email TEXT;

-- Check constraint: either paid_by OR guest payer fields
ALTER TABLE transaction_splits
  ADD CONSTRAINT check_payer_type CHECK (
    (paid_by IS NOT NULL AND paid_by_guest_name IS NULL) OR
    (paid_by IS NULL AND paid_by_guest_name IS NOT NULL)
  );
```

**Service Layer Update:**
```typescript
if (isPayerGuest) {
  // Find the guest who paid
  const payerGuest = splits.find(s => s.user_id === paidByUserId);
  return {
    // ...
    paid_by: null,
    paid_by_guest_name: payerGuest?.user_name,
    paid_by_guest_email: payerGuest?.user_email,
    // ...
  };
}
```

**Balance Calculation Update:**
```sql
-- Update get_group_balances to check both columns
payments_by_participant AS (
  SELECT 
    ap.participant_key,
    COALESCE(SUM(
      CASE 
        -- Registered user paid
        WHEN ts.paid_by = ap.user_id THEN t.amount
        -- Guest user paid (match by name & email)
        WHEN ts.paid_by IS NULL 
         AND ts.paid_by_guest_name = ap.guest_name 
         AND ts.paid_by_guest_email = ap.guest_email 
         THEN t.amount
        ELSE 0
      END
    ), 0) as total_paid
  FROM all_participants ap
  ...
)
```

### Option B: Redesign `paid_by` (More Complex)
- Remove foreign key constraint on `paid_by`
- Store both registered and guest IDs in same column
- Add `paid_by_is_guest` boolean flag
- More breaking changes required

---

## 🧪 Testing

### Test 1: Registered User as Payer ✅
```
1. Create split transaction
2. Select registered user as payer
3. Result: paid_by = user's ID, saves correctly
```

### Test 2: Guest User as Payer (Current Fix)
```
1. Create split transaction
2. Select guest user as payer
3. Result: 
   ✅ Transaction creates (no error!)
   ⚠️ paid_by = NULL
   ⚠️ Balance may be incorrect
```

### Test 3: No Payer Selected ✅
```
1. Create split transaction
2. Don't select payer (default)
3. Result: paid_by = current user's ID, saves correctly
```

---

## 📊 Impact Assessment

### Immediate (Current Fix):
- ✅ **No more crashes** when selecting guest as payer
- ✅ **Transactions create successfully**
- ⚠️ **Balance calculations** may attribute to wrong person
- ⚠️ **Group detail screen** may show incorrect "paid" amounts

### After Full Solution:
- ✅ Guest payers tracked correctly
- ✅ Accurate balance calculations
- ✅ Correct group detail displays
- ✅ Proper "who owes whom" calculations

---

## 🔄 Migration Path

### Phase 1: Immediate Fix ✅ (DONE)
- Prevent foreign key error
- Allow guest payers (with limitation)
- Transaction creation works

### Phase 2: Database Schema (TODO)
- Add `paid_by_guest_name` and `paid_by_guest_email` columns
- Add check constraint
- Test with new split transactions

### Phase 3: Service Layer (TODO)
- Update `createTransactionWithSplits` to populate guest payer fields
- Test guest payer flow end-to-end

### Phase 4: Balance Calculations (TODO)
- Update `get_group_balances` SQL function
- Update `groupFinancialService.ts` if needed
- Test balance accuracy

### Phase 5: UI Polish (TODO)
- Update group detail screen to show guest payers correctly
- Add visual indicator when guest is payer
- Test all payment scenarios

---

## 📝 Workaround for Users (Current)

Until full solution is implemented:

**Recommended**: 
- Only select **registered users** as payers
- If a guest paid, select yourself or another registered user as payer
- Manually track guest payments externally

**Acceptable**:
- Select guest as payer (transaction will create)
- Be aware balance may show incorrect "paid" amounts
- Manually verify/adjust splits as needed

---

## 🔗 Related Files

- **Service Fix**: `services/expenseSplittingService.ts` (Lines 264-286)
- **Database Schema**: `database/group-expense-splitting/03_create_transaction_splits_table.sql`
- **Balance Function**: `database/group-expense-splitting/13_fix_paid_by_calculations.sql`
- **UI Component**: `src/mobile/components/ExpenseSplitting/SplitCalculator.tsx`

---

## ✅ Checklist

### Immediate Fix (Phase 1):
- [x] Detect guest payers in service layer
- [x] Set `paid_by = NULL` for guests
- [x] Add logging for debugging
- [x] Test transaction creation (no more errors!)

### Full Solution (Future):
- [ ] Design database schema changes
- [ ] Add guest payer columns
- [ ] Update service layer logic
- [ ] Modify balance calculation SQL
- [ ] Test all scenarios thoroughly
- [ ] Update documentation

---

**Status**: ✅ **Immediate fix applied** - Transactions with guest payers now work!  
**Future Work**: Full guest payer tracking (see Phase 2-5 above)  
**Priority**: Medium (workaround exists, but full solution improves accuracy)  
**Last Updated**: October 25, 2025

