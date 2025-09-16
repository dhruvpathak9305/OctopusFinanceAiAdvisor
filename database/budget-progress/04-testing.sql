-- =====================================================
-- BUDGET PROGRESS TESTING AND VERIFICATION
-- =====================================================
-- Purpose: Comprehensive testing suite to verify all budget progress functions work correctly
-- Expected Outcome: Validation that all functions return correct data and perform well
-- Dependencies: All previous SQL files (01-indexes.sql, 02-main-functions.sql, 03-summary-functions.sql)
-- Usage: Run these queries to test and verify your implementation
-- =====================================================

-- =====================================================
-- SECTION 1: BASIC FUNCTIONALITY TESTS
-- =====================================================

-- Test 1: Verify all functions exist
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN (
        'get_budget_progress',
        'get_budget_summary', 
        'get_category_details',
        'get_subcategory_progress',
        'get_budget_overview',
        'get_subcategory_transactions'
    )
ORDER BY routine_name;

-- Test 2: Verify all indexes exist
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('transactions_real', 'budget_categories_real', 'budget_subcategories_real')
    AND (indexname LIKE 'idx_%budget%' OR indexname LIKE 'idx_%progress%' OR indexname LIKE 'idx_%lookup%')
ORDER BY tablename, indexname;

-- =====================================================
-- SECTION 2: SAMPLE DATA TESTS (Replace with your user ID)
-- =====================================================

-- Replace 'your-user-id-here' with a real user ID from your database
-- \set user_id 'your-user-id-here'

-- Test 3: Get budget progress for all expense categories
-- SELECT * FROM get_budget_progress(:'user_id', 'expense', 'monthly');

-- Test 4: Get budget summary for expense categories
-- SELECT * FROM get_budget_summary(:'user_id', 'expense', 'monthly');

-- Test 5: Get budget overview
-- SELECT * FROM get_budget_overview(:'user_id', 'monthly');

-- =====================================================
-- SECTION 3: PERFORMANCE TESTS
-- =====================================================

-- Test 6: Check query plan for main budget progress function
-- EXPLAIN ANALYZE SELECT * FROM get_budget_progress(:'user_id', 'expense', 'monthly');

-- Test 7: Check query plan for budget summary function
-- EXPLAIN ANALYZE SELECT * FROM get_budget_summary(:'user_id', 'expense', 'monthly');

-- Test 8: Check query plan for budget overview function
-- EXPLAIN ANALYZE SELECT * FROM get_budget_overview(:'user_id', 'monthly');

-- =====================================================
-- SECTION 4: EDGE CASE TESTS
-- =====================================================

-- Test 9: Empty budget categories (should return empty result, not error)
-- SELECT * FROM get_budget_progress('00000000-0000-0000-0000-000000000000', 'expense', 'monthly');

-- Test 10: Invalid period type (should return error)
-- SELECT * FROM get_budget_progress(:'user_id', 'expense', 'invalid_period');

-- Test 11: Categories with zero budget (should show percentage as 0)
-- SELECT * FROM get_budget_progress(:'user_id', 'expense', 'monthly') 
-- WHERE budget_limit = 0;

-- =====================================================
-- SECTION 5: DATA INTEGRITY TESTS
-- =====================================================

-- Test 12: Verify percentage calculations are correct
-- WITH test_data AS (
--     SELECT * FROM get_budget_progress(:'user_id', 'expense', 'monthly')
-- )
-- SELECT 
--     category_name,
--     budget_limit,
--     spent_amount,
--     percentage_used,
--     CASE 
--         WHEN budget_limit > 0 THEN 
--             ROUND((spent_amount / budget_limit * 100)::numeric, 2) = percentage_used
--         ELSE 
--             percentage_used = 0
--     END AS percentage_check
-- FROM test_data;

-- Test 13: Verify remaining amount calculations are correct
-- WITH test_data AS (
--     SELECT * FROM get_budget_progress(:'user_id', 'expense', 'monthly')
-- )
-- SELECT 
--     category_name,
--     budget_limit,
--     spent_amount,
--     remaining_amount,
--     GREATEST(budget_limit - spent_amount, 0) = remaining_amount AS remaining_check
-- FROM test_data;

-- =====================================================
-- SECTION 6: CROSS-FUNCTION CONSISTENCY TESTS
-- =====================================================

-- Test 14: Compare get_budget_progress and get_category_details for consistency
-- SELECT 
--     bp.category_id,
--     bp.category_name,
--     bp.spent_amount AS bp_spent,
--     cd.spent_amount AS cd_spent,
--     bp.spent_amount = cd.spent_amount AS amount_match,
--     bp.percentage_used = cd.percentage_used AS percentage_match
-- FROM 
--     get_budget_progress(:'user_id', 'expense', 'monthly') bp
-- JOIN 
--     LATERAL get_category_details(:'user_id', bp.category_id, 'expense', 'monthly') cd ON true
-- LIMIT 5;

-- Test 15: Compare get_budget_summary totals with sum of get_budget_progress
-- WITH 
--     summary AS (
--         SELECT * FROM get_budget_summary(:'user_id', 'expense', 'monthly')
--     ),
--     progress_sum AS (
--         SELECT 
--             SUM(budget_limit) AS total_budget,
--             SUM(spent_amount) AS total_spent
--         FROM 
--             get_budget_progress(:'user_id', 'expense', 'monthly')
--     )
-- SELECT 
--     s.total_budget AS summary_budget,
--     p.total_budget AS progress_budget,
--     s.total_budget = p.total_budget AS budget_match,
--     s.total_spent AS summary_spent,
--     p.total_spent AS progress_spent,
--     s.total_spent = p.total_spent AS spent_match
-- FROM 
--     summary s, progress_sum p;

-- =====================================================
-- SECTION 7: PERIOD TYPE TESTS
-- =====================================================

-- Test 16: Compare monthly, quarterly, and yearly data
-- SELECT 
--     'Monthly' AS period,
--     SUM(spent_amount) AS total_spent,
--     SUM(budget_limit) AS total_budget
-- FROM 
--     get_budget_progress(:'user_id', 'expense', 'monthly')
-- UNION ALL
-- SELECT 
--     'Quarterly' AS period,
--     SUM(spent_amount) AS total_spent,
--     SUM(budget_limit) AS total_budget
-- FROM 
--     get_budget_progress(:'user_id', 'expense', 'quarterly')
-- UNION ALL
-- SELECT 
--     'Yearly' AS period,
--     SUM(spent_amount) AS total_spent,
--     SUM(budget_limit) AS total_budget
-- FROM 
--     get_budget_progress(:'user_id', 'expense', 'yearly');

-- =====================================================
-- SECTION 8: TRANSACTION TYPE TESTS
-- =====================================================

-- Test 17: Compare expense, income, and all transaction types
-- SELECT 
--     'Expense' AS type,
--     COUNT(*) AS category_count,
--     SUM(budget_limit) AS total_budget,
--     SUM(spent_amount) AS total_spent
-- FROM 
--     get_budget_progress(:'user_id', 'expense', 'monthly')
-- UNION ALL
-- SELECT 
--     'Income' AS type,
--     COUNT(*) AS category_count,
--     SUM(budget_limit) AS total_budget,
--     SUM(spent_amount) AS total_spent
-- FROM 
--     get_budget_progress(:'user_id', 'income', 'monthly')
-- UNION ALL
-- SELECT 
--     'All' AS type,
--     COUNT(*) AS category_count,
--     SUM(budget_limit) AS total_budget,
--     SUM(spent_amount) AS total_spent
-- FROM 
--     get_budget_progress(:'user_id', 'all', 'monthly');

-- =====================================================
-- SECTION 9: TROUBLESHOOTING GUIDE
-- =====================================================

-- If any tests fail, here are some common issues and solutions:

-- Issue 1: Functions not found
-- Solution: Verify that you ran all SQL files in the correct order

-- Issue 2: Slow performance
-- Solution: Verify that indexes were created successfully

-- Issue 3: No data returned
-- Solution: Check if you have budget categories and transactions for the test user

-- Issue 4: Percentage calculations wrong
-- Solution: Check for division by zero handling in budget_limit

-- Issue 5: Date range issues
-- Solution: Verify transaction dates are within expected periods
