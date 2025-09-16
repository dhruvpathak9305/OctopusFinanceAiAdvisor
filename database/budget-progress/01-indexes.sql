-- =====================================================
-- BUDGET PROGRESS OPTIMIZATION INDEXES
-- =====================================================
-- Purpose: Create essential database indexes for fast budget progress queries
-- Expected Outcome: 10-100x faster query performance for budget calculations
-- Run Time: 2-5 minutes (depending on data volume)
-- Dependencies: None (can run independently)
-- 
-- USAGE: Run this file with: psql -d your_database -f database/budget-progress/01-indexes.sql
-- 
-- NOTE: Using CREATE INDEX (not CONCURRENTLY) to avoid transaction block errors.
-- For production with large active tables, see the commented CONCURRENT versions below.
-- =====================================================

-- Essential composite index for main budget progress queries
-- This index covers the most common query pattern: user_id + category_id + type + date
CREATE INDEX IF NOT EXISTS idx_transactions_real_budget_progress 
ON public.transactions_real (user_id, category_id, type, date DESC);

-- Index for subcategory-level budget progress queries
-- Used when showing detailed breakdown in Budget Details modal
CREATE INDEX IF NOT EXISTS idx_transactions_real_subcategory_progress 
ON public.transactions_real (user_id, subcategory_id, type, date DESC);

-- Partial index for expense transactions (most common use case)
-- This index only includes expense transactions, making it smaller and faster
CREATE INDEX IF NOT EXISTS idx_transactions_real_expense_only 
ON public.transactions_real (user_id, category_id, date DESC) 
WHERE type = 'expense';

-- Partial index for income transactions
-- Used for income budget tracking and analysis
CREATE INDEX IF NOT EXISTS idx_transactions_real_income_only 
ON public.transactions_real (user_id, category_id, date DESC) 
WHERE type = 'income';

-- Category lookup optimization index
-- Speeds up category metadata retrieval
CREATE INDEX IF NOT EXISTS idx_budget_categories_real_lookup 
ON public.budget_categories_real (user_id, category_type, is_active);

-- Subcategory lookup optimization index
-- Speeds up subcategory metadata retrieval
CREATE INDEX IF NOT EXISTS idx_budget_subcategories_real_lookup 
ON public.budget_subcategories_real (category_id, is_active);

-- Additional index for date-range queries across all categories
-- Useful for dashboard-wide calculations
CREATE INDEX IF NOT EXISTS idx_transactions_real_user_date_type 
ON public.transactions_real (user_id, date DESC, type) 
INCLUDE (category_id, subcategory_id, amount);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify indexes were created successfully:

-- Check if all indexes exist
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('transactions_real', 'budget_categories_real', 'budget_subcategories_real')
    AND (indexname LIKE 'idx_%budget%' OR indexname LIKE 'idx_%progress%' OR indexname LIKE 'idx_%lookup%')
ORDER BY tablename, indexname;

-- Check index sizes (should be reasonable)
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
    AND (indexrelname LIKE 'idx_%budget%' OR indexrelname LIKE 'idx_%progress%' OR indexrelname LIKE 'idx_%lookup%')
ORDER BY pg_relation_size(indexrelid) DESC;

-- =====================================================
-- FOR PRODUCTION: CONCURRENT INDEX CREATION (OPTIONAL)
-- =====================================================
-- If you have a large production database with active users, you can use these
-- CONCURRENT versions instead. Run each command individually (NOT as a file):
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_real_budget_progress 
-- ON public.transactions_real (user_id, category_id, type, date DESC);
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_real_subcategory_progress 
-- ON public.transactions_real (user_id, subcategory_id, type, date DESC);
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_real_expense_only 
-- ON public.transactions_real (user_id, category_id, date DESC) WHERE type = 'expense';
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_real_income_only 
-- ON public.transactions_real (user_id, category_id, date DESC) WHERE type = 'income';
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_categories_real_lookup 
-- ON public.budget_categories_real (user_id, category_type, is_active);
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_subcategories_real_lookup 
-- ON public.budget_subcategories_real (category_id, is_active);
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_real_user_date_type 
-- ON public.transactions_real (user_id, date DESC, type) INCLUDE (category_id, subcategory_id, amount);
-- =====================================================
