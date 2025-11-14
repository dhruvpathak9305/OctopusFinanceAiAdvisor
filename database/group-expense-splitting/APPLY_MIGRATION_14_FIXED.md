# Apply Migration #14 (FIXED VERSION) - Guest Payer Tracking

## 🐛 What Was Wrong

The original Migration #14 had a bug in the `create_transaction_with_splits` function:

```sql
-- ❌ OLD (BROKEN) - Always sets paid_by to current user when NULL
CASE WHEN v_split->>'paid_by' != '' AND v_split->>'paid_by' IS NOT NULL 
  THEN (v_split->>'paid_by')::UUID ELSE auth.uid() END,
```

This caused the constraint violation error because:
1. App sends `paid_by = NULL` + guest payer fields when guest is payer
2. Database function ignored the guest payer fields and set `paid_by = auth.uid()` instead
3. Constraint failed: `paid_by` was NOT NULL, but guest payer fields were NULL

## ✅ What's Fixed Now

```sql
-- ✅ NEW (FIXED) - Respects guest payer fields
CASE 
  WHEN v_split->>'paid_by' != '' AND v_split->>'paid_by' IS NOT NULL 
    THEN (v_split->>'paid_by')::UUID       -- Use provided registered user
  WHEN v_split->>'paid_by_guest_name' IS NOT NULL AND v_split->>'paid_by_guest_email' IS NOT NULL
    THEN NULL                               -- Guest is payer, paid_by = NULL
  ELSE auth.uid()                          -- Fallback: current user is payer
END,
```

Now the function correctly:
1. Sets `paid_by = NULL` when guest payer fields are provided
2. Populates `paid_by_guest_name`, `paid_by_guest_email`, `paid_by_guest_mobile`
3. Satisfies the constraint! ✅

---

## 📋 How to Apply Migration #14 (Fixed Version)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Migration

Copy the **ENTIRE contents** of `14_add_guest_payer_tracking.sql` and paste it into the SQL Editor.

**Click "Run"**

### Step 3: Verify Success

You should see:
```
✅ Success. No rows returned
```

### Step 4: Verify the Constraint

Run this query to confirm the constraint is in place:

```sql
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname = 'transaction_splits_payer_check';
```

**Expected output:**
```
constraint_name: transaction_splits_payer_check
definition: CHECK ((paid_by IS NOT NULL AND paid_by_guest_name IS NULL AND paid_by_guest_email IS NULL) OR (paid_by IS NULL AND paid_by_guest_name IS NOT NULL AND paid_by_guest_email IS NOT NULL))
```

---

## 🧪 Test It

After applying the migration:

1. **Restart your app** (clear cache):
   ```bash
   npm start -- --reset-cache
   # or
   npx expo start -c
   ```

2. **Create a split transaction** with a guest as the payer

3. **Check the console** - you should see:
   ```
   ✅ Guest user selected as payer: Test (test@gmail.com)
   📤 Sending to database function:
   ✅ Transaction created successfully!
   ```

4. **Verify in database**:
   ```sql
   SELECT 
     user_id,
     paid_by,
     paid_by_guest_name,
     paid_by_guest_email,
     paid_by_guest_mobile
   FROM transaction_splits
   ORDER BY created_at DESC
   LIMIT 3;
   ```

   **Expected for guest payer:**
   - `paid_by = NULL`
   - `paid_by_guest_name = "Test"`
   - `paid_by_guest_email = "test@gmail.com"`
   - `paid_by_guest_mobile = "9717564406"`

---

## 🚨 Troubleshooting

### Error: "constraint violation"
**Cause:** Migration #14 wasn't applied, or old version is still cached.

**Fix:**
1. Re-run the fixed Migration #14 SQL in Supabase Dashboard
2. Restart your app with cache clear
3. Try creating transaction again

### Error: "function does not exist"
**Cause:** The function wasn't created/updated.

**Fix:**
1. Check Supabase Dashboard → SQL Editor for errors
2. Make sure you ran the **entire** migration file
3. Verify function exists:
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name = 'create_transaction_with_splits';
   ```

---

## 📚 Next Step

After Migration #14 is successfully applied, apply **Migration #15**:
- See `APPLY_MIGRATIONS_14_15.md` for instructions
- Migration #15 updates `get_group_balances` to use the new guest payer fields

---

## 🎉 What This Enables

Once both migrations are applied:
- ✅ Guests can be selected as payers
- ✅ Balances correctly track who paid what (registered or guest)
- ✅ Group detail screen shows accurate member balances
- ✅ No more foreign key errors!

