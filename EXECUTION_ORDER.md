# 🚀 BANK STATEMENT UPLOAD - EXECUTION ORDER

## Your IDs
```
User ID:  6679ae58-a6fb-4d2f-8f23-dd7fafe973d9
ICICI ID: fd551095-58a9-4f12-b00e-2fd182e68403
```

---

## 📋 ONE-TIME SETUP (Run Once)

Open **Supabase SQL Editor** and run these files **in exact order**:

### Step 1: Enhance accounts_real table
```
File: database/migrations/enhance_accounts_real_table.sql
What it does: Adds columns for initial_balance, relationship manager, nomination, etc.
```

### Step 2: Add duplicate prevention
```
File: database/migrations/enhance_duplicate_prevention.sql
What it does: Adds transaction_hash, bank reference columns, duplicate detection
```

### Step 3: Create fixed deposits table
```
File: database/migrations/create_fixed_deposits_table.sql
What it does: Creates table to store FD details
```

### Step 4: Create account statements table
```
File: database/migrations/create_account_statements_table.sql
What it does: Tracks which statements you've uploaded (prevents duplicates)
```

### Step 5: Create reward points table
```
File: database/migrations/create_reward_points_table.sql
What it does: Stores reward points data
```

### Step 6: Create merchants table
```
File: database/migrations/create_merchants_table.sql
What it does: Master data for merchants (Amazon, Flipkart, etc.)
```

**✅ Setup Complete! You only do this once.**

---

## 📊 MONTHLY WORKFLOW (Every Month)

### Step 1: Download Bank Statement
- Log into ICICI bank
- Download statement as CSV/Excel
- Save it locally

### Step 2: Transform with ChatGPT
1. Open `scripts/chatgpt-bank-transform-prompt.md`
2. Copy the **entire prompt**
3. Go to ChatGPT
4. Paste prompt + your CSV data
5. ChatGPT outputs JSON with your user_id already set

### Step 3: Upload to Supabase
1. Open `scripts/upload-bulk-transactions.sql` in Supabase SQL Editor
2. Replace the example JSON array with ChatGPT's output
3. Run the query
4. Done!

---

## 📁 ESSENTIAL FILES (Keep These)

### Migration Scripts (One-time setup)
```
database/migrations/
  ├── enhance_accounts_real_table.sql          (Step 1)
  ├── enhance_duplicate_prevention.sql         (Step 2)
  ├── create_fixed_deposits_table.sql          (Step 3)
  ├── create_account_statements_table.sql      (Step 4)
  ├── create_reward_points_table.sql           (Step 5)
  └── create_merchants_table.sql               (Step 6)
```

### Monthly Use Scripts
```
scripts/
  ├── chatgpt-bank-transform-prompt.md   (For ChatGPT transformation)
  ├── upload-bulk-transactions.sql       (For uploading to Supabase)
  └── account-bank-mapping.json          (Your account IDs reference)
```

---

## ⚠️ IMPORTANT NOTES

1. **Run migrations in order** - Don't skip steps
2. **Run migrations only once** - They modify your database structure
3. **Your IDs are already set** - No need to replace anything
4. **Test with small data first** - Upload 5-10 transactions to test
5. **Check for duplicates** - The system auto-detects duplicates

---

## 🆘 QUICK COMMANDS

### Verify your account:
```sql
SELECT id, name, institution, account_number, current_balance
FROM accounts_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9';
```

### Check last upload:
```sql
SELECT statement_period_start, statement_period_end, 
       transaction_count, upload_status
FROM account_statements_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
ORDER BY created_at DESC
LIMIT 5;
```

### Count transactions:
```sql
SELECT COUNT(*) as total_transactions
FROM transactions_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9';
```

---

## 📞 NEED HELP?

1. **First upload?** - Start with Step 1 of ONE-TIME SETUP
2. **Already set up?** - Use MONTHLY WORKFLOW
3. **Errors?** - Check that migrations ran in correct order
4. **Duplicates?** - System auto-detects, you'll see skip count

---

*Last Updated: October 18, 2025*

