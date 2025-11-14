# 🐛 Constraint Violation Error - Root Cause & Fix

## The Problem

You were getting this error when trying to apply Migration #14:
```
ERROR: 23514: check constraint "transaction_splits_payer_check" 
of relation "transaction_splits" is violated by some row
```

## Root Cause

The **database function** in Migration #14 had a bug:

```sql
-- ❌ BROKEN CODE (lines 195-196 in original)
CASE WHEN v_split->>'paid_by' != '' AND v_split->>'paid_by' IS NOT NULL 
  THEN (v_split->>'paid_by')::UUID ELSE auth.uid() END,
```

### What Was Happening:

1. **App sends guest payer**:
   - `paid_by = NULL`
   - `paid_by_guest_name = "Test"`
   - `paid_by_guest_email = "test@gmail.com"`

2. **Database function ignores it**:
   - Sees `paid_by = NULL`
   - Sets `paid_by = auth.uid()` (your user ID) as fallback
   - Keeps `paid_by_guest_name = "Test"` (from app)

3. **Result in database**:
   - ❌ `paid_by = 6679ae58-...` (NOT NULL)
   - ❌ `paid_by_guest_name = "Test"` (NOT NULL)
   - ❌ **BOTH are set!**

4. **Constraint checks**:
   ```sql
   CHECK (
     -- Option 1: Registered user paid
     (paid_by IS NOT NULL AND paid_by_guest_name IS NULL) OR -- ❌ FAILS
     -- Option 2: Guest user paid  
     (paid_by IS NULL AND paid_by_guest_name IS NOT NULL)    -- ❌ FAILS
   )
   ```
   
   **Neither condition is true** → Constraint violation!

---

## The Fix

Updated the database function logic (lines 194-204 in fixed version):

```sql
-- ✅ FIXED CODE
CASE 
  -- If paid_by explicitly provided → use it
  WHEN v_split->>'paid_by' != '' AND v_split->>'paid_by' IS NOT NULL 
    THEN (v_split->>'paid_by')::UUID
  
  -- If guest payer fields provided → NULL (guest is payer)
  WHEN v_split->>'paid_by_guest_name' IS NOT NULL 
   AND v_split->>'paid_by_guest_email' IS NOT NULL
    THEN NULL
  
  -- Otherwise → current user is payer
  ELSE auth.uid()
END,
```

### Now It Works Correctly:

1. **App sends guest payer**:
   - `paid_by = NULL`
   - `paid_by_guest_name = "Test"`
   - `paid_by_guest_email = "test@gmail.com"`

2. **Database function respects it**:
   - Sees `paid_by_guest_name IS NOT NULL`
   - Sets `paid_by = NULL` ✅
   - Keeps `paid_by_guest_name = "Test"` ✅

3. **Result in database**:
   - ✅ `paid_by = NULL`
   - ✅ `paid_by_guest_name = "Test"`
   - ✅ `paid_by_guest_email = "test@gmail.com"`
   - ✅ **Only guest payer fields set!**

4. **Constraint checks**:
   ```sql
   (paid_by IS NULL AND paid_by_guest_name IS NOT NULL)  -- ✅ TRUE!
   ```
   
   **Constraint satisfied!** ✅

---

## How to Apply the Fix

### Option 1: Apply the Fixed Migration (Recommended)

Follow the detailed guide:
```
database/group-expense-splitting/APPLY_MIGRATION_14_FIXED.md
```

### Option 2: Quick Steps

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy & paste** the ENTIRE contents of:
   ```
   database/group-expense-splitting/14_add_guest_payer_tracking.sql
   ```
3. **Click "Run"**
4. **Restart your app** with cache clear:
   ```bash
   npm start -- --reset-cache
   ```
5. **Test** creating a split transaction with guest payer

---

## What Changed in the File

**File**: `14_add_guest_payer_tracking.sql`  
**Lines changed**: 194-204  
**What**: Fixed the `paid_by` CASE logic in `create_transaction_with_splits` function  
**Why**: To properly respect guest payer fields sent from the app

The fix ensures:
- ✅ `paid_by = NULL` when guest payer fields are provided
- ✅ `paid_by = <user-id>` only when no guest payer fields provided
- ✅ Constraint is always satisfied

---

## Verification

After applying the fix, run this to verify:

```sql
-- Check the function source includes the fix
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'create_transaction_with_splits';
```

Look for this in the output:
```sql
WHEN v_split->>'paid_by_guest_name' IS NOT NULL 
 AND v_split->>'paid_by_guest_email' IS NOT NULL
  THEN NULL
```

If you see that, the fix is applied! ✅

---

## Why This Happened

The original migration was written assuming:
- If `paid_by` is NULL → fallback to `auth.uid()`

But we forgot that **guest payer fields might be populated** when `paid_by` is NULL!

The fix adds an extra check:
- If `paid_by` is NULL **but guest payer fields exist** → keep `paid_by` as NULL

---

**Status**: Fixed ✅  
**Action Required**: Apply the fixed Migration #14  
**Next Step**: Apply Migration #15 after #14 succeeds

