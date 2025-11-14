# 🚀 Portfolio Database Migrations - Safe Execution Guide

## ✅ Pre-Migration Safety Check

Run this query first to verify no existing portfolio tables will be affected:

```sql
-- Check for existing portfolio-related tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND (tablename LIKE '%portfolio%' 
    OR tablename LIKE '%stock%' 
    OR tablename LIKE '%mutual%' 
    OR tablename LIKE '%ipo%')
ORDER BY tablename;
```

**Expected Result:** Empty (no rows) - Safe to proceed!

If you see existing tables, review them first to ensure they won't conflict.

---

## 🏃 Run Migrations

### Option 1: Using your quick-connect script

```bash
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Run table creation
./scripts/quick-connect.sh upload database/portfolio/001_create_portfolio_tables.sql

# Run functions creation
./scripts/quick-connect.sh upload database/portfolio/002_create_portfolio_functions.sql
```

### Option 2: Direct psql

```bash
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor
source config/database.env

# Run migrations
psql "$DATABASE_URL" -f database/portfolio/001_create_portfolio_tables.sql
psql "$DATABASE_URL" -f database/portfolio/002_create_portfolio_functions.sql
```

### Option 3: Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy contents of `001_create_portfolio_tables.sql`
4. Run it
5. Copy contents of `002_create_portfolio_functions.sql`
6. Run it

---

## ✅ Verify Migration Success

After running, verify with:

```sql
-- Should show 11 new tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND (tablename IN (
    'portfolios', 'holdings', 'transactions', 'stocks', 'mutual_funds',
    'ipos', 'ipo_applications', 'portfolio_alerts', 'dividends',
    'portfolio_performance', 'sips'
  ))
ORDER BY tablename;

-- Should show 12+ functions
SELECT proname 
FROM pg_proc 
WHERE proname LIKE '%portfolio%' 
   OR proname LIKE '%holding%'
ORDER BY proname;
```

**Expected:** 11 tables and 12+ functions created!

---

## 🎯 What Gets Created

### Tables (11)
1. ✅ portfolios
2. ✅ holdings
3. ✅ transactions
4. ✅ stocks
5. ✅ mutual_funds
6. ✅ ipos
7. ✅ ipo_applications
8. ✅ portfolio_alerts
9. ✅ dividends
10. ✅ portfolio_performance
11. ✅ sips

### Functions (12)
1. ✅ update_holding_from_transaction()
2. ✅ update_updated_at_column()
3. ✅ get_portfolio_summary()
4. ✅ calculate_xirr()
5. ✅ get_holdings_with_prices()
6. ✅ get_asset_allocation()
7. ✅ get_sector_allocation()
8. ✅ get_top_performers()
9. ✅ get_portfolio_performance_history()
10. ✅ calculate_capital_gains_tax()
11. ✅ create_portfolio_snapshot()
12. ✅ check_portfolio_alerts()

### Security
- ✅ Row Level Security (RLS) enabled on all user tables
- ✅ RLS policies for user isolation
- ✅ Proper grants for authenticated users

---

## ⚠️ Safety Notes

1. **No existing data affected** - These are new tables only
2. **Existing tables untouched** - Your accounts_real, transactions_real, etc. remain unchanged
3. **Rollback available** - If needed, you can drop these tables:

```sql
-- Emergency rollback (only if needed)
DROP TABLE IF EXISTS sips CASCADE;
DROP TABLE IF EXISTS portfolio_performance CASCADE;
DROP TABLE IF EXISTS dividends CASCADE;
DROP TABLE IF EXISTS portfolio_alerts CASCADE;
DROP TABLE IF EXISTS ipo_applications CASCADE;
DROP TABLE IF EXISTS ipos CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS holdings CASCADE;
DROP TABLE IF EXISTS portfolios CASCADE;
DROP TABLE IF EXISTS mutual_funds CASCADE;
DROP TABLE IF EXISTS stocks CASCADE;
```

---

**Ready? Run the migrations and your portfolio system will be live!** 🚀

