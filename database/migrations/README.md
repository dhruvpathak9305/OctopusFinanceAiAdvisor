# 🗄️ Database Migrations

## ⚠️ RUN ONCE IN THIS EXACT ORDER

Open Supabase SQL Editor and run each file:

### 1. `enhance_accounts_real_table.sql`
Adds columns: initial_balance, relationship_manager, nomination, account_status

### 2. `enhance_duplicate_prevention.sql`
Adds columns: transaction_hash, bank_reference_number, upi_reference_number
Creates duplicate detection functions

### 3. `create_fixed_deposits_table.sql`
Creates: fixed_deposits_real table

### 4. `create_account_statements_table.sql`
Creates: account_statements_real table (tracks uploads)

### 5. `create_reward_points_table.sql`
Creates: reward_points_real table

### 6. `create_merchants_table.sql`
Creates: merchants_real table (with pre-seeded merchants)

---

## ✅ Your IDs Are Already Set

All files contain your actual IDs:
- User ID: `6679ae58-a6fb-4d2f-8f23-dd7fafe973d9`
- ICICI ID: `fd551095-58a9-4f12-b00e-2fd182e68403`

**No need to replace anything - just copy and run!**

---

## 🔍 After Running

Verify with:
```sql
-- Check if ICICI account was updated
SELECT * FROM accounts_real 
WHERE id = 'fd551095-58a9-4f12-b00e-2fd182e68403';

-- Check if new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'fixed_deposits_real',
    'account_statements_real', 
    'reward_points_real',
    'merchants_real'
  );
```

---

For complete instructions, see: `/EXECUTION_ORDER.md`

