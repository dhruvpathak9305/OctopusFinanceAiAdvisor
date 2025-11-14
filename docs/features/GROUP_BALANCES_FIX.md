# Group Member Balances - Database Function Fix

## 🐛 The Problem

**Error**: `column u.name does not exist`

When clicking on a group to view member balances, the app crashed with:
```
[GroupFinancialService] Error fetching group member balances: 
{"code": "42703", "message": "column u.name does not exist"}
```

### Root Cause
The database function `get_group_balances()` was trying to access:
```sql
SELECT u.name as user_name
FROM auth.users u
```

**But Supabase's `auth.users` table doesn't have a `name` column!**

It has:
- ✅ `id`
- ✅ `email`
- ✅ `raw_user_meta_data` (JSONB - where name might be stored)
- ❌ `name` (doesn't exist)

---

## ✅ The Fix

Updated the `get_group_balances()` function to get user names from multiple sources with a fallback chain:

### Name Resolution Strategy

1. **First**: Check `group_members.user_name`
   - Stored when adding members to group
   - Most reliable source

2. **Second**: Check `auth.users.raw_user_meta_data->>'name'`
   - From user signup metadata
   - Common field

3. **Third**: Check `auth.users.raw_user_meta_data->>'full_name'`
   - Alternative metadata field
   - Some auth providers use this

4. **Fallback**: Extract from email
   - `split_part(u.email, '@', 1)`
   - E.g., "john.doe@example.com" → "john.doe"

### Updated SQL

**Before (Broken)**:
```sql
SELECT 
  COALESCE(up.user_id, us.user_id) as user_id,
  u.name as user_name,  ❌ ERROR: column doesn't exist
  u.email as user_email,
  ...
FROM user_payments up
FULL OUTER JOIN user_shares us ON up.user_id = us.user_id
LEFT JOIN auth.users u ON COALESCE(up.user_id, us.user_id) = u.id
ORDER BY net_balance DESC;
```

**After (Fixed)**:
```sql
SELECT 
  COALESCE(up.user_id, us.user_id) as user_id,
  COALESCE(
    gm.user_name,                           ✅ From group_members
    u.raw_user_meta_data->>'name',          ✅ From auth metadata
    u.raw_user_meta_data->>'full_name',     ✅ Alternative field
    split_part(u.email, '@', 1)             ✅ Email fallback
  ) as user_name,
  COALESCE(gm.user_email, u.email) as user_email,
  ...
FROM user_payments up
FULL OUTER JOIN user_shares us ON up.user_id = us.user_id
LEFT JOIN auth.users u ON COALESCE(up.user_id, us.user_id) = u.id
LEFT JOIN public.group_members gm ON gm.user_id = COALESCE(up.user_id, us.user_id) 
                                  AND gm.group_id = p_group_id  ✅ New join
ORDER BY net_balance DESC;
```

---

## 📁 Files Modified

### 1. Database Function
**File**: `database/group-expense-splitting/04_splitting_functions.sql`
- Updated `get_group_balances()` function
- Added `group_members` join
- Implemented name fallback chain

### 2. Migration Script
**File**: `database/group-expense-splitting/12_fix_group_balances_user_name.sql`
- Standalone migration to apply the fix
- Can be run via Supabase Dashboard or psql

### 3. Documentation
**File**: `database/group-expense-splitting/APPLY_FIX_12.md`
- Step-by-step instructions to apply the fix
- Multiple connection options

---

## 🔧 How to Apply the Fix

### **Method 1: Supabase Dashboard** (Easiest ⭐)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in sidebar
4. Click "+ New query"
5. Open `database/group-expense-splitting/12_fix_group_balances_user_name.sql`
6. Copy all contents and paste into SQL Editor
7. Click "Run" (or Ctrl+Enter)
8. Should see "Success. No rows returned"

### **Method 2: Command Line**

```bash
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

PGGSSENCMODE=disable psql \
  "postgres://postgres.zluxacakgtqovlxptdad:Ashwani%40123@aws-0-ap-south-1.pooler.supabase.com:5432/postgres" \
  -f database/group-expense-splitting/12_fix_group_balances_user_name.sql
```

---

## ✅ After Applying the Fix

### Expected Behavior

1. **Reload your app**
2. **Navigate to Money Ties** → Relationships → Groups
3. **Click on "Test" group**

**You should see**:
- ✅ **Member cards** with names and emails
- ✅ **"Paid"**, **"Share"**, **"Net Balance"** for each member
- ✅ **No errors** in console

### Expected Console Logs

```
[RelationshipDetail] Loading group data for: <group_id>
[GroupFinancialService] Fetching groups for user: <user_id>
[GroupFinancialService] Fetched splits for group: <group_id> Count: 9
[GroupFinancialService] Processing 9 splits for user: <user_id>
[GroupFinancialService] Calculated financials for group: <group_id> {
  net_balance: 199.98,
  total_owed_to_you: 199.98,
  total_splits: 9,
  total_you_owe: 0
}
[GroupFinancialService] Fetching member balances for group: <group_id>
[GroupFinancialService] Fetched 3 member balances  ✅ SUCCESS!
```

**No more errors!** ❌ `column u.name does not exist`

---

## 🎯 What This Enables

With this fix, you can now:
- ✅ **View group member balances** without errors
- ✅ **See who paid what** in each group
- ✅ **Track who owes whom** with accurate calculations
- ✅ **Display proper member names** from various sources

---

## 📊 Example Output

### Member Balance Card
```
👤 dhruvpathak9305
   dhruv@example.com

Paid:  ₹100.00
Share: ₹33.34

Others owe them: ₹66.66 (green)
```

---

## 🔍 Technical Details

### Why Multiple Name Sources?

Different scenarios for user names:
1. **Group Members**: Names stored when adding to group (custom names)
2. **Auth Metadata**: Names from signup (OAuth, email signup)
3. **Email Username**: Fallback when no name provided

### COALESCE Chain
The `COALESCE()` function returns the **first non-null value**:
- Tries `gm.user_name` first (most specific)
- Falls back to `raw_user_meta_data->>'name'`
- Then `raw_user_meta_data->>'full_name'`
- Finally extracts from email as last resort

---

## 🚀 Testing Checklist

After applying the fix, verify:

- [ ] No errors in console when clicking group
- [ ] Member names display correctly
- [ ] Member balances show (Paid, Share, Net)
- [ ] Color coding works (green/red for balances)
- [ ] Group info section shows correct data
- [ ] Can navigate back without issues

---

## 📝 Related Issues Fixed

This fix also resolves:
1. ✅ Empty member cards (no name displayed)
2. ✅ Crashes when viewing group details
3. ✅ Database query failures
4. ✅ Incomplete member information

---

**Fixed**: October 25, 2025  
**Impact**: Critical - Enables group member balance viewing  
**Complexity**: Database function update  
**Files**: 3 modified, 2 documentation files created  
**Apply**: Via Supabase Dashboard SQL Editor

