# 🚀 Complete Execution Guide - ICICI September 2025 Upload

## 📋 Prerequisites

Before running the upload, ensure these migrations are executed in order:

### Phase 1: Base Tables (If not already done)
```bash
# These should already be in your database
# Only run if starting fresh

1. accounts_real table
2. transactions_real table  
3. balance_real table
4. budget_categories_real table
5. budget_subcategories_real table
```

### Phase 2: Enhancement Migrations (MUST RUN)
```bash
# Run these in order - they add new fields and functions

cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Step 1: Enhance accounts table
psql -f database/migrations/enhance_accounts_real_table.sql

# Step 2: Add duplicate prevention to transactions
psql -f database/migrations/enhance_duplicate_prevention.sql

# Step 3: Create fixed deposits table
psql -f database/migrations/create_fixed_deposits_table.sql

# Step 4: Create account statements table
psql -f database/migrations/create_account_statements_table.sql

# Step 5: Create merchants table
psql -f database/migrations/create_merchants_table.sql

# Step 6: Create reward points table (optional)
psql -f database/migrations/create_reward_points_table.sql
```

### Phase 3: Verification
```sql
-- Verify all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'accounts_real',
    'transactions_real',
    'fixed_deposits_real',
    'account_statements_real', 
    'merchants_real',
    'reward_points_real'
  )
ORDER BY table_name;

-- Expected result: 6 tables
```

## 🎯 Data Upload Process

### Option A: Full Enhanced Upload (Recommended)

This is the **complete, all-in-one** script that:
- Updates account with enhancements
- Inserts fixed deposit
- Records statement metadata
- Creates merchants
- Inserts transactions with duplicate detection
- Syncs balances

```bash
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Connect to your Supabase database
psql -h YOUR_SUPABASE_HOST \
     -U postgres \
     -d postgres \
     -f scripts/upload-transactions-enhanced.sql
```

**What It Does:**
1. ✅ Updates `accounts_real` with all enhancements
2. ✅ Inserts into `fixed_deposits_real`
3. ✅ Inserts into `account_statements_real`
4. ✅ Inserts into `merchants_real` (3 merchants)
5. ✅ Bulk inserts into `transactions_real` (10 transactions)
   - Auto-generates transaction hashes
   - Extracts bank references
   - Detects and skips duplicates
6. ✅ Syncs current balance
7. ✅ Displays verification results

**Expected Output:**
```
=========================================
Starting Enhanced Bulk Upload Process
=========================================

Step 1: Updating account with enhanced fields...
✅ Account updated successfully

Step 2: Inserting/Updating Fixed Deposit...
✅ Fixed Deposit inserted/updated

Step 3: Recording statement metadata...
✅ Statement metadata recorded

Step 4: Inserting/Updating merchants...
✅ Merchants inserted/updated

Step 5: Inserting transactions with duplicate detection...
This may take a moment...

 status  | inserted_count | duplicate_count | error_count | errors 
---------+----------------+-----------------+-------------+--------
 SUCCESS |             10 |               0 |           0 | []

=========================================

Step 6: Updating statement status...
✅ Statement status updated

Step 7: Syncing account current balance...
✅ Account balance synced

=========================================
VERIFICATION RESULTS
=========================================

📊 Transaction Summary:
 total_transactions | total_income | total_expenses | total_transfers 
--------------------+--------------+----------------+-----------------
                 10 |    261244.53 |      117654.43 |        98000.00

🏦 Account Details:
 name                  | account_number | current_balance | nomination_status | account_status 
-----------------------+----------------+-----------------+-------------------+----------------
 ICICI Savings Account | 388101502899   |     5525174.87  | registered        | active

💰 Fixed Deposit:
 deposit_number | principal_amount | interest_rate | current_value | maturity_amount | status 
----------------+------------------+---------------+---------------+-----------------+--------
 388113E+11     |        500000.00 |          7.25 |     520714.00 |       546985.00 | active

📄 Statement:
 statement_period_start | statement_period_end | opening_balance | closing_balance | transaction_count | transactions_inserted | status    
------------------------+----------------------+-----------------+-----------------+-------------------+-----------------------+-----------
 2025-09-01             | 2025-09-30           |     5381584.77  |     5525174.87  |                10 |                    10 | processed

=========================================
✅ UPLOAD COMPLETE!
=========================================
```

### Option B: Manual Step-by-Step Upload

If you prefer to upload one table at a time:

#### Step 1: Update Account
```sql
UPDATE accounts_real SET 
  account_number = '388101502899',
  bank_holder_name = 'MR. DHRUV PATHAK',
  current_balance = 5525174.87,
  nomination_status = 'registered',
  account_status = 'active'
WHERE id = 'fd551095-58a9-4f12-b00e-2fd182e68403';
```

#### Step 2: Insert Fixed Deposit
```bash
# Use content from: fixed_deposits_ICICI_September_2025.json
# Convert to SQL INSERT or use JSON function
```

#### Step 3: Insert Statement
```bash
# Use content from: account_statement_ICICI_September_2025.json
```

#### Step 4: Insert Merchants
```bash
# Use content from: merchants_ICICI_September_2025.json
```

#### Step 5: Insert Transactions
```sql
-- Use the enhanced bulk insert function
SELECT * FROM bulk_insert_transactions_with_duplicate_check(
  -- Paste JSON from transactions_ICICI_September_2025_ENHANCED.json
);
```

### Option C: Supabase Dashboard Upload

1. **Go to SQL Editor** in Supabase Dashboard
2. **Copy** contents from `scripts/upload-transactions-enhanced.sql`
3. **Replace** `\set user_id` and `\set account_id` with actual values:
   ```sql
   -- Replace these lines:
   \set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
   \set account_id 'fd551095-58a9-4f12-b00e-2fd182e68403'
   
   -- With these:
   DO $$
   DECLARE
     v_user_id UUID := '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9';
     v_account_id UUID := 'fd551095-58a9-4f12-b00e-2fd182e68403';
   BEGIN
     -- Rest of the script here
   END $$;
   ```
4. **Run** the script
5. **Verify** results in the output

## 🧪 Testing Duplicate Prevention

### Test 1: Run Upload Twice
```bash
# First run
psql -f scripts/upload-transactions-enhanced.sql
# Result: 10 inserted, 0 duplicates

# Second run (immediate)
psql -f scripts/upload-transactions-enhanced.sql
# Result: 0 inserted, 10 duplicates ✅
```

### Test 2: Manual Duplicate Check
```sql
-- Check if a specific transaction exists
SELECT * FROM check_duplicate_transaction(
  '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'::UUID,
  'fd551095-58a9-4f12-b00e-2fd182e68403'::UUID,
  '2025-09-07'::TIMESTAMPTZ,
  13701.2,
  'ATD/Auto Debit CC0xx0318',
  'CC0318' -- bank reference
);

-- Expected result: is_duplicate = true (after first upload)
```

### Test 3: Check Transaction Hashes
```sql
SELECT 
  id,
  name,
  amount,
  transaction_hash,
  bank_reference_number,
  upi_reference_number,
  neft_reference_number
FROM transactions_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
  AND date BETWEEN '2025-09-01' AND '2025-09-30'
ORDER BY date;

-- All transactions should have transaction_hash populated
```

## 🔍 Verification Queries

### Check All Data
```sql
-- Summary
SELECT 
  'Accounts' as table_name,
  COUNT(*) as count
FROM accounts_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'

UNION ALL

SELECT 
  'Transactions',
  COUNT(*)
FROM transactions_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
  AND date BETWEEN '2025-09-01' AND '2025-09-30'

UNION ALL

SELECT 
  'Fixed Deposits',
  COUNT(*)
FROM fixed_deposits_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'

UNION ALL

SELECT 
  'Statements',
  COUNT(*)
FROM account_statements_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
  AND statement_period_start = '2025-09-01'

UNION ALL

SELECT 
  'Merchants',
  COUNT(*)
FROM merchants_real
WHERE merchant_name IN ('PolicyBazaar', 'Apple', 'VIM Global Technology Services');

-- Expected Results:
-- Accounts: 1
-- Transactions: 10
-- Fixed Deposits: 1
-- Statements: 1
-- Merchants: 3
```

### Verify Balance Calculation
```sql
SELECT 
  (SELECT opening_balance FROM account_statements_real 
   WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9' 
     AND statement_period_start = '2025-09-01') as opening_balance,
  
  (SELECT SUM(amount) FROM transactions_real 
   WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
     AND date BETWEEN '2025-09-01' AND '2025-09-30'
     AND type = 'income') as total_income,
  
  (SELECT SUM(amount) FROM transactions_real 
   WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
     AND date BETWEEN '2025-09-01' AND '2025-09-30'
     AND type = 'expense') as total_expenses,
  
  (SELECT closing_balance FROM account_statements_real 
   WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9' 
     AND statement_period_start = '2025-09-01') as closing_balance,
  
  -- Verify: opening + income - expenses = closing
  (SELECT opening_balance FROM account_statements_real 
   WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9' 
     AND statement_period_start = '2025-09-01') +
  (SELECT SUM(amount) FROM transactions_real 
   WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
     AND date BETWEEN '2025-09-01' AND '2025-09-30'
     AND type = 'income') -
  (SELECT SUM(amount) FROM transactions_real 
   WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
     AND date BETWEEN '2025-09-01' AND '2025-09-30'
     AND type = 'expense') as calculated_closing;

-- calculated_closing should equal closing_balance (₹5,525,174.87)
```

## 🎉 Success Criteria

✅ **Upload is successful if:**

1. No SQL errors during execution
2. Transaction count = 10
3. Fixed deposit created with correct values
4. Statement status = 'processed'
5. Account current_balance = 5525174.87
6. All transactions have `transaction_hash` populated
7. Bank references extracted correctly
8. Re-running shows 10 duplicates, 0 inserted
9. Balance math checks out:
   - Opening: 5,381,584.77
   - +Income: 261,244.53
   - -Expenses: 117,654.43
   - =Closing: 5,525,174.87 ✓

## 🔄 Re-Running / Recovery

### If Upload Fails Midway:
```sql
-- Check what was inserted
SELECT COUNT(*) FROM transactions_real 
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
  AND date BETWEEN '2025-09-01' AND '2025-09-30';

-- If partial insert, just re-run the script
-- Duplicate detection will skip already-inserted transactions
```

### To Start Fresh (Delete September Data):
```sql
-- WARNING: This deletes all September 2025 data
DELETE FROM transactions_real 
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
  AND date BETWEEN '2025-09-01' AND '2025-09-30';

DELETE FROM account_statements_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
  AND statement_period_start = '2025-09-01';

DELETE FROM fixed_deposits_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
  AND deposit_number = '388113E+11';

-- Then re-run upload script
```

## 📚 Files Reference

| File | Purpose | Use When |
|------|---------|----------|
| `scripts/upload-transactions-enhanced.sql` | Complete upload script | ✅ **Main upload** |
| `scripts/upload-transactions-complete.sql` | Basic upload (no dup check) | ❌ Not recommended |
| `transactions_ICICI_September_2025_ENHANCED.json` | Enhanced transaction data | ✅ For bulk function |
| `transactions_ICICI_September_2025.json` | Basic transaction data | ❌ Use enhanced version |
| `TRANSACTION_VERIFICATION.md` | Verification details | ✅ For review |
| `UPLOAD_READY_SUMMARY.md` | Quick reference | ✅ For overview |

## 🎯 Quick Start (TL;DR)

```bash
# 1. Ensure migrations are run
psql -f database/migrations/enhance_accounts_real_table.sql
psql -f database/migrations/enhance_duplicate_prevention.sql
psql -f database/migrations/create_fixed_deposits_table.sql
psql -f database/migrations/create_account_statements_table.sql
psql -f database/migrations/create_merchants_table.sql

# 2. Run enhanced upload
psql -f scripts/upload-transactions-enhanced.sql

# 3. Verify (should show 10 transactions, etc.)
# Check output for verification results

# Done! 🎉
```

## ✅ You're Ready to Upload!

All systems are **GO**! Use the enhanced upload script for the best experience with full duplicate protection and account enhancements.

