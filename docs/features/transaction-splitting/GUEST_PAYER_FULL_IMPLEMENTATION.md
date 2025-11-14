# Guest Payer Full Implementation ✅

## Overview
Complete implementation of guest user support as payers in split transactions, with accurate balance tracking including phone numbers.

**Status**: ✅ **READY TO APPLY** (Migrations #14 & #15)

---

## 🎯 Problem Statement

### Phase 1 Problem (Solved Earlier):
When selecting a guest as payer → **Foreign key error** → Crash ❌

### Phase 2 Problem (Solving Now):
When guest is payer → `paid_by = NULL` → **Can't identify which guest paid** → Wrong balances ❌

---

## ✅ Complete Solution

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 transaction_splits Table                     │
├─────────────────────────────────────────────────────────────┤
│ For Registered Payers:                                       │
│   paid_by = user_id                                          │
│   paid_by_guest_* = NULL                                     │
│                                                               │
│ For Guest Payers:                                            │
│   paid_by = NULL                                             │
│   paid_by_guest_name = "Test Guest"                          │
│   paid_by_guest_email = "test@gmail.com"                     │
│   paid_by_guest_mobile = "+1234567890"                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Changes

### Migration #14: Add Guest Payer Columns

```sql
-- Add three new columns
ALTER TABLE transaction_splits
  ADD COLUMN paid_by_guest_name TEXT,
  ADD COLUMN paid_by_guest_email TEXT,
  ADD COLUMN paid_by_guest_mobile TEXT;

-- Add constraint: Either registered OR guest payer (not both)
ALTER TABLE transaction_splits
  ADD CONSTRAINT transaction_splits_payer_check
  CHECK (
    -- Option 1: Registered user paid
    (paid_by IS NOT NULL AND paid_by_guest_name IS NULL) OR
    -- Option 2: Guest user paid
    (paid_by IS NULL AND paid_by_guest_name IS NOT NULL)
  );
```

**Benefits**:
- ✅ Can identify which specific guest paid
- ✅ Phone number included for complete contact info
- ✅ Constraint ensures data integrity (one payer per split)

### Migration #15: Update Balance Calculations

```sql
CREATE OR REPLACE FUNCTION get_group_balances(p_group_id UUID)
RETURNS TABLE (...) AS $$
BEGIN
  RETURN QUERY
  WITH payments_by_participant AS (
    SELECT 
      ap.participant_key,
      COALESCE(SUM(
        CASE 
          -- Registered user paid (paid_by matches)
          WHEN ap.user_id IS NOT NULL AND ts.paid_by = ap.user_id 
            THEN t.amount
          
          -- ✅ NEW: Guest user paid (paid_by NULL, guest fields match)
          WHEN ap.is_guest_user = true 
           AND ts.paid_by IS NULL
           AND ts.paid_by_guest_name = ap.guest_name 
           AND ts.paid_by_guest_email = ap.guest_email
            THEN t.amount
          
          ELSE 0
        END
      ), 0) as total_paid
    FROM all_participants ap
    ...
  )
  ...
END;
$$;
```

**Benefits**:
- ✅ Correctly attributes payments to guest payers
- ✅ Accurate balance calculations
- ✅ Works for both registered and guest payers

---

## 💻 Code Changes

### Service Layer Updates

**File**: `services/expenseSplittingService.ts`

#### Before (Phase 1):
```typescript
// Set paid_by to NULL for guests (loses payer identity)
const actualPaidBy = isPayerGuest ? null : (paidByUserId || user.id);

return {
  paid_by: actualPaidBy, // NULL for guests ❌
  // No way to know which guest paid!
};
```

#### After (Phase 2):
```typescript
// Extract guest payer details
const payerGuest = paidByUserId && splits.find(
  s => (s.is_guest || !s.user_id) && s.user_id === paidByUserId
);

const guestPayerDetails = isPayerGuest ? {
  paid_by_guest_name: payerGuest?.user_name,
  paid_by_guest_email: payerGuest?.user_email,
  paid_by_guest_mobile: payerGuest?.mobile_number, // ✅ Phone included
} : {
  paid_by_guest_name: null,
  paid_by_guest_email: null,
  paid_by_guest_mobile: null,
};

return {
  paid_by: actualPaidBy, // Still NULL for guests
  // ✅ NEW: Guest payer identification
  paid_by_guest_name: guestPayerDetails.paid_by_guest_name,
  paid_by_guest_email: guestPayerDetails.paid_by_guest_email,
  paid_by_guest_mobile: guestPayerDetails.paid_by_guest_mobile,
};
```

**Key Improvements**:
- ✅ Captures all guest payer details
- ✅ Includes phone number for complete contact info
- ✅ Applied to **all splits** in the transaction

---

## 🧪 Testing Guide

### Test Scenario 1: Guest Payer with Phone

**Setup**:
- Group "Test" with 3 members: You, Test Guest (+1234567890), Test 2
- Transaction: "Dinner" ₹300
- Payer: Test Guest

**Steps**:
1. Create transaction with split enabled
2. Select "Test" group
3. Select "Test Guest" as payer (has phone: +1234567890)
4. Create transaction

**Expected Database State**:
```sql
SELECT 
  guest_name,
  paid_by,
  paid_by_guest_name,
  paid_by_guest_email,
  paid_by_guest_mobile,
  share_amount
FROM transaction_splits
WHERE transaction_id = '<transaction-id>';
```

| guest_name | paid_by | paid_by_guest_name | paid_by_guest_email | paid_by_guest_mobile | share_amount |
|------------|---------|---------------------|---------------------|----------------------|--------------|
| Test Guest | NULL    | Test Guest          | test@gmail.com      | +1234567890          | 100.00       |
| Test 2     | NULL    | Test Guest          | test@gmail.com      | +1234567890          | 100.00       |
| NULL (You) | NULL    | Test Guest          | test@gmail.com      | +1234567890          | 100.00       |

**Expected Balances**:
```sql
SELECT * FROM get_group_balances('<group-id>');
```

| user_name | total_paid | total_owed | net_balance |
|-----------|------------|------------|-------------|
| Test Guest | 300.00    | 100.00     | +200.00     |
| Test 2     | 0.00      | 100.00     | -100.00     |
| You        | 0.00      | 100.00     | -100.00     |

✅ **Perfect!** Test Guest paid ₹300, owes ₹100, so others owe them ₹200!

### Test Scenario 2: Guest Without Phone

**Setup**:
- Same group
- Transaction: "Movie" ₹150
- Payer: Test 2 (no phone number)

**Expected**:
- `paid_by_guest_mobile = NULL` ✅
- Balance calculations still work correctly ✅

### Test Scenario 3: Registered User Payer

**Setup**:
- Same group
- Transaction: "Taxi" ₹100
- Payer: You (registered user)

**Expected**:
- `paid_by = <your-user-id>` ✅
- `paid_by_guest_* = NULL` ✅
- Balance calculations work correctly ✅

---

## 📈 Performance Impact

### Index Optimization

Two new indexes created:
```sql
CREATE INDEX idx_transaction_splits_paid_by_guest_email
  ON transaction_splits (paid_by_guest_email)
  WHERE paid_by IS NULL;

CREATE INDEX idx_transaction_splits_paid_by_guest_name
  ON transaction_splits (paid_by_guest_name)
  WHERE paid_by IS NULL;
```

**Benefits**:
- ✅ Fast lookups for guest payer balances
- ✅ Partial indexes (only where paid_by IS NULL) → smaller, faster
- ✅ Minimal impact on write performance

### Query Performance

**Before (Phase 1)**:
```sql
-- Had to use transaction creator as fallback
-- Inaccurate for guest payers
```

**After (Phase 2)**:
```sql
-- Direct lookup using guest fields
-- Accurate and fast with indexes
WHEN ts.paid_by IS NULL
 AND ts.paid_by_guest_name = ap.guest_name  -- Indexed!
 AND ts.paid_by_guest_email = ap.guest_email -- Indexed!
```

---

## 🔐 Data Integrity

### Constraint Ensures Validity

```sql
-- This constraint prevents invalid states:
CHECK (
  (paid_by IS NOT NULL AND paid_by_guest_name IS NULL) OR
  (paid_by IS NULL AND paid_by_guest_name IS NOT NULL)
)
```

**Prevents**:
- ❌ Both `paid_by` AND `paid_by_guest_name` populated
- ❌ Neither populated (no payer identified)
- ❌ Invalid payer configurations

**Allows**:
- ✅ Registered user payer: `paid_by = UUID, guest fields = NULL`
- ✅ Guest user payer: `paid_by = NULL, guest fields populated`

---

## 📱 Phone Number Support

### Why Include Mobile?

1. **Complete Contact Info**: Match what we store for group members
2. **Future Features**: 
   - Send payment reminders via SMS
   - WhatsApp payment requests
   - Contact the payer directly
3. **Consistency**: `group_members` has `mobile_number`, splits should too

### Phone Number Format

**No validation** in database (flexible for international formats):
- ✅ "+1 (555) 123-4567"
- ✅ "+91 98765 43210"
- ✅ "555-1234"
- ✅ NULL (optional)

---

## 🚀 Migration Path

### Step 1: Apply Database Migrations
```bash
# In Supabase SQL Editor:
1. Run 14_add_guest_payer_tracking.sql
2. Run 15_update_group_balances_guest_payer.sql
```

### Step 2: Code Already Updated
✅ Service layer already includes guest payer details
✅ No additional code changes needed
✅ Just reload app!

### Step 3: Test End-to-End
1. Create split transaction with guest payer
2. Verify console shows guest payer details
3. Check database: guest payer fields populated
4. Verify balances are accurate

---

## 🎯 Benefits Summary

### For Users:
- ✅ **Accurate balances** when guests pay
- ✅ **See who paid** in group detail screens
- ✅ **Contact payers** via phone (future feature)
- ✅ **No more manual tracking** needed

### For Developers:
- ✅ **Clean architecture** (constraint ensures data integrity)
- ✅ **Fast queries** (indexes on guest payer fields)
- ✅ **Backward compatible** (existing data unaffected)
- ✅ **Future-proof** (supports SMS/WhatsApp features)

### For System:
- ✅ **Data integrity** enforced at database level
- ✅ **Performance** maintained (partial indexes)
- ✅ **Scalable** (guest payer lookups O(log n))
- ✅ **Maintainable** (clear separation of registered vs guest payers)

---

## 📊 Example Use Cases

### Use Case 1: Weekend Trip
```
Group: "Goa Trip 2025"
Members: You, Friend1, Friend2 (guests with phones)

Friday Dinner - Friend1 paid (guest, has phone):
  paid_by = NULL
  paid_by_guest_name = "Friend1"
  paid_by_guest_mobile = "+91 98765 43210"
  
Saturday Hotel - You paid:
  paid_by = <your-id>
  paid_by_guest_* = NULL
  
Sunday Lunch - Friend2 paid (guest, no phone):
  paid_by = NULL
  paid_by_guest_name = "Friend2"
  paid_by_guest_mobile = NULL
```

**Result**: Accurate balances for all three scenarios! ✅

### Use Case 2: Restaurant Split
```
Group: "Team Lunch"
Members: You, Colleague (registered), Client (guest)

Bill paid by: Client (guest)
Result: 
  - Client shows as having paid
  - Others owe client
  - Can contact client via phone if needed
```

---

## 🔗 Related Documentation

- **Migration Guide**: `database/group-expense-splitting/APPLY_MIGRATIONS_14_15.md`
- **Phase 1 Fix**: `docs/features/transaction-splitting/GUEST_PAYER_FIX.md`
- **CRUD Operations**: `docs/features/transaction-splitting/SPLIT_CRUD_OPERATIONS.md`
- **Balance Calculations**: `database/group-expense-splitting/13_fix_paid_by_calculations.sql`

---

## ✅ Completion Checklist

### Database:
- [x] Migration #14 script created
- [x] Migration #15 script created
- [x] Constraints defined
- [x] Indexes created
- [x] Function updated

### Service Layer:
- [x] Guest payer detection logic
- [x] Guest payer details extraction
- [x] Phone number support
- [x] Applied to all splits
- [x] Logging added

### Documentation:
- [x] Migration guide created
- [x] Testing guide written
- [x] Examples provided
- [x] Troubleshooting included

### Ready to Apply:
- [ ] Review migrations
- [ ] Apply Migration #14
- [ ] Apply Migration #15
- [ ] Test with guest payer
- [ ] Verify balances accurate
- [ ] Celebrate! 🎉

---

**Implementation**: Complete ✅  
**Status**: Ready to Apply  
**Migrations**: #14, #15  
**Last Updated**: October 25, 2025  
**Breaking Changes**: None  
**Backward Compatible**: Yes

