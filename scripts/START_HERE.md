# 🚀 START HERE - Getting Your UUIDs

## Choose Your Method

You have **two ways** to get your UUIDs:

---

## 🎯 **Method 1: Automatic (Recommended)** - 2 Minutes

### Step 1: Log into the App
```bash
# Make sure the app is running
npm start
```

Then **log in** to the app with your credentials.

### Step 2: Run the Auto-Fetch Script
```bash
npx tsx scripts/fetch-mapping-data.ts
```

**What happens**:
- ✅ Automatically fetches your user UUID
- ✅ Fetches all your accounts
- ✅ Fetches all your categories
- ✅ Generates 3 ready-to-use files:
  - `account-bank-mapping.json` (with real UUIDs)
  - `READY_TO_USE_PROMPT.md` (ChatGPT prompt)
  - `READY_TO_USE_QUERIES.sql` (SQL with your UUIDs)

**That's it!** Everything is ready to use.

---

## 🔧 **Method 2: Manual (SQL)** - 5 Minutes

If you prefer to get the data manually via SQL:

### Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor**
4. Click **New Query**

### Step 2: Run the Query

Open `GET_ALL_MAPPING_DATA.sql` and run it in Supabase SQL Editor.

**Or** copy this quick query:

```sql
-- Get your user ID
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Get your accounts
SELECT id, name, type, balance FROM accounts_real 
WHERE user_id = 'YOUR_USER_UUID_FROM_ABOVE'
ORDER BY name;

-- Get your categories  
SELECT id, name, type FROM budget_categories_real
WHERE user_id = 'YOUR_USER_UUID_FROM_ABOVE'
ORDER BY name;
```

### Step 3: Copy the Results

1. Copy your **user_id** from the first query
2. Replace `YOUR_USER_UUID_FROM_ABOVE` in queries 2 and 3
3. Save the UUIDs you get

### Step 4: Manually Update Files

1. Open `account-bank-mapping.json`
2. Replace `YOUR_USER_UUID_HERE` with your actual UUID
3. Add your account UUIDs if you want

---

## ✅ Verification

After either method, verify you have:

- [ ] Your user UUID (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
- [ ] List of your accounts with names
- [ ] Updated `account-bank-mapping.json` OR notes with your UUIDs

---

## 🎯 What's Next?

### If You Used Method 1 (Automatic):
✅ Everything is ready!
1. Open `READY_TO_USE_PROMPT.md`
2. Copy the ChatGPT prompt
3. Add your bank CSV
4. Go!

### If You Used Method 2 (Manual):
1. Open `QUICK_START_GUIDE.md`
2. Follow the steps with your UUID
3. Use `chatgpt-bank-transform-prompt.md`
4. Remember to replace `YOUR_USER_UUID_HERE` with your actual UUID

---

## 🆘 Troubleshooting

### "App won't start"
```bash
npm install
npm start
```

### "Script fails even after login"
Make sure you're logged in through the app's UI, not just running it.

### "Can't access Supabase SQL Editor"
- Make sure you have access to your Supabase project
- Check you're using the correct project
- Try refreshing the page

### "No accounts found"
You need to create accounts in the app first!
1. Open the app
2. Go to Accounts section
3. Add at least one account
4. Run the script/query again

---

## 📁 Quick File Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| `START_HERE.md` | This file - setup guide | First time |
| `fetch-mapping-data.ts` | Auto-fetch script | If logged in |
| `GET_ALL_MAPPING_DATA.sql` | Manual SQL query | Alternative method |
| `READY_TO_USE_PROMPT.md` | ChatGPT prompt (auto-generated) | After Method 1 |
| `READY_TO_USE_QUERIES.sql` | SQL queries (auto-generated) | After Method 1 |
| `account-bank-mapping.json` | Your config | After setup |
| `QUICK_START_GUIDE.md` | First upload guide | After getting UUID |

---

## 🎉 Success Criteria

You're ready to upload when you:
- ✅ Have your user UUID
- ✅ Know your account names
- ✅ Have either auto-generated files OR manual notes with UUIDs
- ✅ Have a bank statement CSV ready

---

**Choose your method above and let's get started! 🚀**

