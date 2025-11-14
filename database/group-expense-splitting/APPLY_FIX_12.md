# Apply Database Fix: get_group_balances User Name Column

## 🐛 Issue
Error: `column u.name does not exist`

The `get_group_balances` function was trying to access `auth.users.name` which doesn't exist in Supabase's auth schema.

## ✅ Fix
Updated the function to get user names from:
1. `group_members.user_name` (stored when adding members)
2. `auth.users.raw_user_meta_data->>'name'` (from auth signup)
3. `auth.users.raw_user_meta_data->>'full_name'` (alternative field)
4. Email username as fallback

## 🔧 How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Copy & Paste the SQL**
   - Open: `database/group-expense-splitting/12_fix_group_balances_user_name.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the Query**
   - Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)
   - You should see: "Success. No rows returned"

### Option 2: Command Line (if psql works)

```bash
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Try with gssencmode=disable
PGGSSENCMODE=disable psql "postgres://postgres.zluxacakgtqovlxptdad:Ashwani%40123@aws-0-ap-south-1.pooler.supabase.com:5432/postgres" \
  -f database/group-expense-splitting/12_fix_group_balances_user_name.sql
```

### Option 3: Supabase CLI

```bash
# If you have supabase CLI installed
supabase db push
```

## ✅ Verification

After applying the fix, test by:

1. **Reload your app**
2. **Go to Money Ties** → Relationships → Groups
3. **Click on "Test" group**
4. **Check console** - Should see:
   ```
   [GroupFinancialService] Fetching member balances for group: <id>
   [GroupFinancialService] Fetched 3 member balances
   ```
5. **Check UI** - Should see member names and balances without errors

## 📋 What Changed

**Before:**
```sql
SELECT 
  u.name as user_name,  ❌ Column doesn't exist
  u.email as user_email,
  ...
FROM ...
LEFT JOIN auth.users u ON ...
```

**After:**
```sql
SELECT 
  COALESCE(
    gm.user_name,                           -- From group_members
    u.raw_user_meta_data->>'name',          -- From auth metadata
    u.raw_user_meta_data->>'full_name',     -- Alternative field
    split_part(u.email, '@', 1)             -- Email username fallback
  ) as user_name,
  COALESCE(gm.user_email, u.email) as user_email,
  ...
FROM ...
LEFT JOIN auth.users u ON ...
LEFT JOIN public.group_members gm ON ...  ✅ Added join
```

---

**Please apply this fix using the Supabase Dashboard (Option 1) and then reload your app!**

