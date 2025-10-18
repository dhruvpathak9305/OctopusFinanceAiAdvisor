# 🎯 Setup Instructions - Get Your UUIDs

## ⚡ Quick Setup (5 Minutes)

This guide helps you get all the UUIDs you need from Supabase to start uploading transactions.

---

## 📋 Step-by-Step Process

### Step 1: Open Supabase SQL Editor (30 seconds)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

---

### Step 2: Run the Mapping Query (1 minute)

1. Open the file: `GET_ALL_MAPPING_DATA.sql`
2. Copy the **entire contents** of the file
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

**Wait for results to appear** (should take 2-3 seconds)

---

### Step 3: Copy Your User UUID (30 seconds)

Look at **Section 1** in the results:

```
=== YOUR USER UUID ===
user_uuid: a1b2c3d4-e5f6-7890-abcd-ef1234567890
email: your@email.com
```

**📝 Copy your `user_uuid`** - You'll need this for everything!

---

### Step 4: Review Your Accounts (1 minute)

Look at **Section 2** in the results:

```
=== YOUR ACCOUNTS ===
account_uuid: abc123...
account_name: ICICI Savings Account
account_type: bank
balance: 50000.00
```

**📝 Note down:**
- Which accounts you have
- Their names
- Their UUIDs (if you want to link transactions to specific accounts)

---

### Step 5: Get the Complete Mapping JSON (1 minute)

Look at **Section 5** in the results - you'll see a complete JSON object:

```json
{
  "user_id": "your-actual-uuid-here",
  "user_email": "your@email.com",
  "accounts": [...],
  "categories": [...],
  "generated_at": "2025-10-18...",
  "instructions": "..."
}
```

**📋 Copy this entire JSON** and save it temporarily.

---

### Step 6: Update Your Mapping File (1 minute)

1. Open `account-bank-mapping.json`
2. Replace `YOUR_USER_UUID_HERE` with your actual UUID
3. **Optional**: Add your account details from Section 2
4. Save the file

---

### Step 7: Update ChatGPT Prompt (30 seconds)

1. Open `chatgpt-bank-transform-prompt.md`
2. Find where it says `YOUR_USER_UUID_HERE`
3. Replace with your actual UUID
4. Save the file

**Or**: Just remember to replace it each time you use the prompt.

---

## ✅ Verification Checklist

After running the SQL script, check Section 10 results:

- [ ] ✅ Account Check: Should show you have accounts
- [ ] ✅ Category Check: Should show you have categories
- [ ] ✅ Transaction Check: Shows existing transaction count

### If Any Check Fails:

#### ❌ "No accounts found"
→ You need to create accounts in your app first!
→ Go to app → Add at least one bank account

#### ❌ "No categories found"
→ You need to create budget categories first!
→ Go to app → Budget → Create categories

#### ❌ "No user found"
→ Make sure you're logged into the app
→ Check that your email is correct

---

## 🎯 Quick Reference

### What You Absolutely Need:

1. **User UUID** ← Most important!
2. **Account names** (to match bank statements)
3. **Optional**: Account UUIDs (for linking)
4. **Optional**: Category UUIDs (for auto-categorization)

### Where to Use These:

| UUID Type | Used In | Required? |
|-----------|---------|-----------|
| User UUID | ChatGPT prompt, all uploads | ✅ YES |
| Account UUID | Linking transactions to accounts | ⚠️ Optional |
| Category UUID | Auto-categorization | ⚠️ Optional |
| Subcategory UUID | Auto-categorization | ⚠️ Optional |

---

## 🚀 You're Ready When...

✅ You have your user UUID copied  
✅ You know your account names  
✅ `account-bank-mapping.json` is updated  
✅ You've reviewed the validation checks  

**→ Next: Go to `QUICK_START_GUIDE.md` for your first upload!**

---

## 💡 Pro Tips

### Save Your UUID Somewhere Safe
Create a note with:
```
My Supabase User UUID: a1b2c3d4-e5f6-7890-abcd-ef1234567890

My Accounts:
- ICICI Savings: abc123-uuid-here
- HDFC Credit Card: def456-uuid-here
```

### Test with Sample Data First
Use the sample transaction JSON from Section 9 to test the upload process.

### Update Mapping as You Add Accounts
Whenever you add a new bank account, re-run the SQL script and update your mapping.

---

## 🆘 Troubleshooting

### "No results returned"
→ Make sure you're logged into Supabase with the correct project
→ Check that your project has data

### "Permission denied"
→ You might not have access to `auth.users` table
→ Try this alternative:
```sql
SELECT 
  id as user_id,
  email
FROM auth.users
WHERE email = 'your@email.com'; -- Replace with your email
```

### "User not found"
→ Make sure you've logged into the app at least once
→ Check the email address is correct

### "Accounts table is empty"
→ You need to create accounts in the app first
→ Open the app → Go to Accounts → Add Account

---

## 📞 Need Help?

1. **Check Section 10** of the SQL results for validation
2. **Review the error messages** - they tell you what's missing
3. **Make sure you're logged in** to the app
4. **Create accounts/categories** if you don't have any

---

## ✨ What's Next?

Once you have your UUID:
1. ✅ Update `account-bank-mapping.json`
2. ✅ Go to `QUICK_START_GUIDE.md`
3. ✅ Do your first upload!

**Time to complete**: 5 minutes total

---

**🎉 You're all set! Let's upload some transactions!**

