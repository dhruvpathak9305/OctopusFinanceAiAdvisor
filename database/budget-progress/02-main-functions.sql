-- =====================================================
-- MAIN BUDGET PROGRESS FUNCTION
-- =====================================================
-- Purpose: Core function that powers the Budget Progress section
-- Expected Outcome: Fast retrieval of all category budget data with spending calculations
-- Dependencies: 01-indexes.sql (recommended for optimal performance)
-- Usage: Main dashboard Budget Progress cards
-- =====================================================

-- Main function to get budget progress for all categories
-- This function calculates spending vs budget for each category over specified periods
CREATE OR REPLACE FUNCTION get_budget_progress(
    p_user_id UUID,
    p_transaction_type TEXT DEFAULT 'expense', -- 'expense', 'income', 'all'
    p_period_type TEXT DEFAULT 'monthly' -- 'monthly', 'quarterly', 'yearly'
)
RETURNS TABLE(
    category_id UUID,
    category_name TEXT,
    category_type TEXT,
    budget_limit NUMERIC,
    spent_amount NUMERIC,
    remaining_amount NUMERIC,
    percentage_used NUMERIC,
    status TEXT,
    ring_color TEXT,
    bg_color TEXT,
    icon TEXT,
    display_order INTEGER
) AS $$
DECLARE
    period_start_date TIMESTAMP WITH TIME ZONE;
    period_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate date range based on period type
    -- This ensures we always get current period data
    CASE p_period_type
        WHEN 'monthly' THEN
            period_start_date := DATE_TRUNC('month', CURRENT_DATE);
            period_end_date := period_start_date + INTERVAL '1 month';
        WHEN 'quarterly' THEN
            period_start_date := DATE_TRUNC('quarter', CURRENT_DATE);
            period_end_date := period_start_date + INTERVAL '3 months';
        WHEN 'yearly' THEN
            period_start_date := DATE_TRUNC('year', CURRENT_DATE);
            period_end_date := period_start_date + INTERVAL '1 year';
        ELSE
            RAISE EXCEPTION 'Invalid period_type. Use: monthly, quarterly, yearly';
    END CASE;

    RETURN QUERY
    SELECT 
        bc.id as category_id,
        bc.name as category_name,
        bc.category_type,
        bc.budget_limit,
        COALESCE(SUM(tr.amount), 0) as spent_amount,
        GREATEST(bc.budget_limit - COALESCE(SUM(tr.amount), 0), 0) as remaining_amount,
        CASE 
            WHEN bc.budget_limit > 0 THEN 
                ROUND((COALESCE(SUM(tr.amount), 0) / bc.budget_limit * 100)::numeric, 2)
            ELSE 0 
        END as percentage_used,
        CASE 
            WHEN bc.budget_limit = 0 THEN 'not_set'
            WHEN COALESCE(SUM(tr.amount), 0) <= bc.budget_limit * 0.8 THEN 'under_budget'
            WHEN COALESCE(SUM(tr.amount), 0) <= bc.budget_limit THEN 'on_budget'
            ELSE 'over_budget'
        END as status,
        bc.ring_color,
        bc.bg_color,
        bc.icon,
        bc.display_order
    FROM budget_categories_real bc
    LEFT JOIN transactions_real tr ON bc.id = tr.category_id 
        AND tr.user_id = p_user_id
        AND (p_transaction_type = 'all' OR tr.type = p_transaction_type)
        AND tr.date >= period_start_date
        AND tr.date < period_end_date
    WHERE bc.user_id = p_user_id
        AND (p_transaction_type = 'all' OR bc.category_type = p_transaction_type)
        AND (bc.is_active IS NULL OR bc.is_active != 'false') -- Handle text field: NULL or not 'false'
    GROUP BY bc.id, bc.name, bc.category_type, bc.budget_limit, bc.ring_color, bc.bg_color, bc.icon, bc.display_order
    ORDER BY bc.display_order, bc.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HELPER FUNCTION: Get Budget Progress for Specific Categories
-- =====================================================
-- Purpose: Get budget progress for a subset of categories (optimization for filtered views)
CREATE OR REPLACE FUNCTION get_budget_progress_filtered(
    p_user_id UUID,
    p_category_ids UUID[],
    p_transaction_type TEXT DEFAULT 'expense',
    p_period_type TEXT DEFAULT 'monthly'
)
RETURNS TABLE(
    category_id UUID,
    category_name TEXT,
    spent_amount NUMERIC,
    budget_limit NUMERIC,
    percentage_used NUMERIC
) AS $$
DECLARE
    period_start_date TIMESTAMP WITH TIME ZONE;
    period_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate date range
    CASE p_period_type
        WHEN 'monthly' THEN
            period_start_date := DATE_TRUNC('month', CURRENT_DATE);
            period_end_date := period_start_date + INTERVAL '1 month';
        WHEN 'quarterly' THEN
            period_start_date := DATE_TRUNC('quarter', CURRENT_DATE);
            period_end_date := period_start_date + INTERVAL '3 months';
        WHEN 'yearly' THEN
            period_start_date := DATE_TRUNC('year', CURRENT_DATE);
            period_end_date := period_start_date + INTERVAL '1 year';
    END CASE;

    RETURN QUERY
    SELECT 
        bc.id as category_id,
        bc.name as category_name,
        COALESCE(SUM(tr.amount), 0) as spent_amount,
        bc.budget_limit,
        CASE 
            WHEN bc.budget_limit > 0 THEN 
                ROUND((COALESCE(SUM(tr.amount), 0) / bc.budget_limit * 100)::numeric, 2)
            ELSE 0 
        END as percentage_used
    FROM budget_categories_real bc
    LEFT JOIN transactions_real tr ON bc.id = tr.category_id 
        AND tr.user_id = p_user_id
        AND tr.type = p_transaction_type
        AND tr.date >= period_start_date
        AND tr.date < period_end_date
    WHERE bc.id = ANY(p_category_ids)
        AND bc.user_id = p_user_id
    GROUP BY bc.id, bc.name, bc.budget_limit
    ORDER BY bc.display_order, bc.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================
-- Replace 'your-user-id-here' with actual UUID for testing

-- Example 1: Get all expense categories for current month
-- SELECT * FROM get_budget_progress('your-user-id-here', 'expense', 'monthly');

-- Example 2: Get all income categories for current quarter
-- SELECT * FROM get_budget_progress('your-user-id-here', 'income', 'quarterly');

-- Example 3: Get all categories (expense + income) for current year
-- SELECT * FROM get_budget_progress('your-user-id-here', 'all', 'yearly');
