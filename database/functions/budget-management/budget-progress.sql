-- =====================================================================
-- BUDGET MANAGEMENT - BUDGET PROGRESS FUNCTIONS
-- =====================================================================
-- Comprehensive budget tracking, progress monitoring, and analysis
-- =====================================================================

-- =====================================================================
-- GET_BUDGET_PROGRESS
-- =====================================================================
-- Purpose: Get detailed budget progress for all categories
-- Parameters:
--   p_user_id: UUID - User ID to get budget for
--   p_transaction_type: TEXT - 'expense', 'income', or 'all' (default: 'expense')
--   p_period_type: TEXT - 'monthly', 'quarterly', or 'yearly' (default: 'monthly')
-- Returns: TABLE with budget progress details
-- =====================================================================

CREATE OR REPLACE FUNCTION get_budget_progress(
  p_user_id UUID,
  p_transaction_type TEXT DEFAULT 'expense',
  p_period_type TEXT DEFAULT 'monthly'
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
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    period_start_date TIMESTAMP WITH TIME ZONE;
    period_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate date range based on period type
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
        AND (bc.is_active IS NULL OR bc.is_active != 'false')
    GROUP BY bc.id, bc.name, bc.category_type, bc.budget_limit, bc.ring_color, bc.bg_color, bc.icon, bc.display_order
    ORDER BY bc.display_order, bc.name;
END;
$$;

-- =====================================================================
-- GET_BUDGET_SUMMARY
-- =====================================================================
-- Purpose: Get budget summary totals by category type
-- Parameters:
--   p_user_id: UUID - User ID
--   p_transaction_type: TEXT - Transaction type to summarize
--   p_period_type: TEXT - Time period for summary
-- Returns: TABLE with summary statistics
-- =====================================================================

CREATE OR REPLACE FUNCTION get_budget_summary(
  p_user_id UUID,
  p_transaction_type TEXT DEFAULT 'expense',
  p_period_type TEXT DEFAULT 'monthly'
)
RETURNS TABLE(
  category_type TEXT,
  total_budget NUMERIC,
  total_spent NUMERIC,
  total_remaining NUMERIC,
  overall_percentage NUMERIC,
  category_count INTEGER,
  over_budget_count INTEGER,
  under_budget_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    period_start_date TIMESTAMP WITH TIME ZONE;
    period_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate date range based on period type
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
        bc.category_type,
        SUM(bc.budget_limit) as total_budget,
        COALESCE(SUM(transaction_totals.spent_amount), 0) as total_spent,
        GREATEST(SUM(bc.budget_limit) - COALESCE(SUM(transaction_totals.spent_amount), 0), 0) as total_remaining,
        CASE 
            WHEN SUM(bc.budget_limit) > 0 THEN 
                ROUND((COALESCE(SUM(transaction_totals.spent_amount), 0) / SUM(bc.budget_limit) * 100)::numeric, 2)
            ELSE 0 
        END as overall_percentage,
        COUNT(bc.id)::INTEGER as category_count,
        COUNT(CASE WHEN COALESCE(transaction_totals.spent_amount, 0) > bc.budget_limit THEN 1 END)::INTEGER as over_budget_count,
        COUNT(CASE WHEN COALESCE(transaction_totals.spent_amount, 0) <= bc.budget_limit * 0.8 THEN 1 END)::INTEGER as under_budget_count
    FROM budget_categories_real bc
    LEFT JOIN (
        SELECT 
            tr.category_id,
            SUM(tr.amount) as spent_amount
        FROM transactions_real tr
        WHERE tr.user_id = p_user_id
            AND tr.type = p_transaction_type
            AND tr.date >= period_start_date
            AND tr.date < period_end_date
        GROUP BY tr.category_id
    ) transaction_totals ON bc.id = transaction_totals.category_id
    WHERE bc.user_id = p_user_id
        AND bc.category_type = p_transaction_type
        AND (bc.is_active IS NULL OR bc.is_active != 'false')
    GROUP BY bc.category_type;
END;
$$;

-- =====================================================================
-- GET_BUDGET_OVERVIEW
-- =====================================================================
-- Purpose: Get comprehensive financial overview with income/expense totals
-- Parameters:
--   p_user_id: UUID - User ID
--   p_period_type: TEXT - Time period for overview
-- Returns: TABLE with complete financial overview
-- =====================================================================

CREATE OR REPLACE FUNCTION get_budget_overview(
  p_user_id UUID,
  p_period_type TEXT DEFAULT 'monthly'
)
RETURNS TABLE(
  total_income_budget NUMERIC,
  total_income_actual NUMERIC,
  total_expense_budget NUMERIC,
  total_expense_actual NUMERIC,
  net_budget NUMERIC,
  net_actual NUMERIC,
  savings_rate NUMERIC,
  categories_over_budget INTEGER,
  categories_under_budget INTEGER,
  total_categories INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    WITH budget_summary AS (
        SELECT 
            bc.category_type,
            SUM(bc.budget_limit) as budget_sum,
            COALESCE(SUM(tr_totals.spent_amount), 0) as actual_sum
        FROM budget_categories_real bc
        LEFT JOIN (
            SELECT 
                tr.category_id,
                SUM(tr.amount) as spent_amount
            FROM transactions_real tr
            WHERE tr.user_id = p_user_id
                AND tr.date >= period_start_date
                AND tr.date < period_end_date
            GROUP BY tr.category_id
        ) tr_totals ON bc.id = tr_totals.category_id
        WHERE bc.user_id = p_user_id
            AND (bc.is_active IS NULL OR bc.is_active != 'false')
        GROUP BY bc.category_type
    ),
    category_status AS (
        SELECT 
            COUNT(CASE WHEN COALESCE(tr_totals.spent_amount, 0) > bc.budget_limit THEN 1 END)::INTEGER as over_budget_count,
            COUNT(CASE WHEN COALESCE(tr_totals.spent_amount, 0) <= bc.budget_limit * 0.8 THEN 1 END)::INTEGER as under_budget_count,
            COUNT(*)::INTEGER as category_count_total
        FROM budget_categories_real bc
        LEFT JOIN (
            SELECT 
                tr.category_id,
                SUM(tr.amount) as spent_amount
            FROM transactions_real tr
            WHERE tr.user_id = p_user_id
                AND tr.date >= period_start_date
                AND tr.date < period_end_date
            GROUP BY tr.category_id
        ) tr_totals ON bc.id = tr_totals.category_id
        WHERE bc.user_id = p_user_id
            AND (bc.is_active IS NULL OR bc.is_active != 'false')
    )
    SELECT 
        COALESCE((SELECT budget_sum FROM budget_summary WHERE category_type = 'income'), 0) as total_income_budget,
        COALESCE((SELECT actual_sum FROM budget_summary WHERE category_type = 'income'), 0) as total_income_actual,
        COALESCE((SELECT budget_sum FROM budget_summary WHERE category_type = 'expense'), 0) as total_expense_budget,
        COALESCE((SELECT actual_sum FROM budget_summary WHERE category_type = 'expense'), 0) as total_expense_actual,
        COALESCE((SELECT budget_sum FROM budget_summary WHERE category_type = 'income'), 0) - 
        COALESCE((SELECT budget_sum FROM budget_summary WHERE category_type = 'expense'), 0) as net_budget,
        COALESCE((SELECT actual_sum FROM budget_summary WHERE category_type = 'income'), 0) - 
        COALESCE((SELECT actual_sum FROM budget_summary WHERE category_type = 'expense'), 0) as net_actual,
        CASE 
            WHEN COALESCE((SELECT actual_sum FROM budget_summary WHERE category_type = 'income'), 0) > 0 THEN
                ROUND(((COALESCE((SELECT actual_sum FROM budget_summary WHERE category_type = 'income'), 0) - 
                       COALESCE((SELECT actual_sum FROM budget_summary WHERE category_type = 'expense'), 0)) / 
                       COALESCE((SELECT actual_sum FROM budget_summary WHERE category_type = 'income'), 0) * 100)::numeric, 2)
            ELSE 0
        END as savings_rate,
        (SELECT over_budget_count FROM category_status) as categories_over_budget,
        (SELECT under_budget_count FROM category_status) as categories_under_budget,
        (SELECT category_count_total FROM category_status) as total_categories;
END;
$$;
