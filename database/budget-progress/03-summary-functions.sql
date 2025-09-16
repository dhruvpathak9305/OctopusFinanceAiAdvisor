-- =====================================================
-- BUDGET SUMMARY FUNCTIONS
-- =====================================================
-- Purpose: High-level summary functions for dashboard cards and category details
-- Expected Outcome: Fast aggregated data for category totals and individual category details
-- Dependencies: 01-indexes.sql, 02-main-functions.sql (for consistency)
-- Usage: Main dashboard summary cards and individual category detail views
-- =====================================================

-- Function to get budget summary by category type (for main dashboard cards)
-- This powers the main summary cards for expense/income categories
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
) AS $$
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
    WITH budget_data AS (
        SELECT
            bc.category_type,
            SUM(bc.budget_limit) AS total_budget,
            COALESCE(SUM(tr_sum.spent), 0) AS total_spent,
            COUNT(bc.id) AS category_count,
            SUM(CASE WHEN COALESCE(tr_sum.spent, 0) > bc.budget_limit AND bc.budget_limit > 0 THEN 1 ELSE 0 END) AS over_budget_count,
            SUM(CASE WHEN COALESCE(tr_sum.spent, 0) <= bc.budget_limit OR bc.budget_limit = 0 THEN 1 ELSE 0 END) AS under_budget_count
        FROM 
            budget_categories_real bc
        LEFT JOIN (
            SELECT 
                category_id, 
                SUM(amount) AS spent
            FROM 
                transactions_real
            WHERE 
                user_id = p_user_id
                AND (p_transaction_type = 'all' OR type = p_transaction_type)
                AND date >= period_start_date
                AND date < period_end_date
            GROUP BY 
                category_id
        ) tr_sum ON bc.id = tr_sum.category_id
        WHERE 
            bc.user_id = p_user_id
            AND (p_transaction_type = 'all' OR bc.category_type = p_transaction_type)
            AND (bc.is_active IS NULL OR bc.is_active != 'false')
        GROUP BY 
            bc.category_type
    )
    SELECT
        bd.category_type,
        bd.total_budget,
        bd.total_spent,
        GREATEST(bd.total_budget - bd.total_spent, 0) AS total_remaining,
        CASE 
            WHEN bd.total_budget > 0 THEN 
                ROUND((bd.total_spent / bd.total_budget * 100)::numeric, 2)
            ELSE 0 
        END AS overall_percentage,
        bd.category_count,
        bd.over_budget_count,
        bd.under_budget_count
    FROM 
        budget_data bd;
END;
$$ LANGUAGE plpgsql;

-- Function to get detailed information for a specific category
-- Used when viewing individual category details
CREATE OR REPLACE FUNCTION get_category_details(
    p_user_id UUID,
    p_category_id UUID,
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
    subcategory_count INTEGER,
    active_subcategory_count INTEGER,
    recent_transactions_count INTEGER,
    period_start TEXT,
    period_end TEXT
) AS $$
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
        bc.id AS category_id,
        bc.name AS category_name,
        bc.category_type,
        bc.budget_limit,
        COALESCE(SUM(tr.amount), 0) AS spent_amount,
        GREATEST(bc.budget_limit - COALESCE(SUM(tr.amount), 0), 0) AS remaining_amount,
        CASE 
            WHEN bc.budget_limit > 0 THEN 
                ROUND((COALESCE(SUM(tr.amount), 0) / bc.budget_limit * 100)::numeric, 2)
            ELSE 0 
        END AS percentage_used,
        CASE 
            WHEN bc.budget_limit = 0 THEN 'not_set'
            WHEN COALESCE(SUM(tr.amount), 0) <= bc.budget_limit * 0.8 THEN 'under_budget'
            WHEN COALESCE(SUM(tr.amount), 0) <= bc.budget_limit THEN 'on_budget'
            ELSE 'over_budget'
        END AS status,
        bc.ring_color,
        bc.bg_color,
        bc.icon,
        (SELECT COUNT(*) FROM budget_subcategories_real WHERE category_id = p_category_id) AS subcategory_count,
        (SELECT COUNT(*) FROM budget_subcategories_real WHERE category_id = p_category_id AND (is_active IS NULL OR is_active != 'false')) AS active_subcategory_count,
        (SELECT COUNT(*) FROM transactions_real WHERE category_id = p_category_id AND user_id = p_user_id AND date >= period_start_date AND date < period_end_date) AS recent_transactions_count,
        TO_CHAR(period_start_date, 'YYYY-MM-DD') AS period_start,
        TO_CHAR(period_end_date, 'YYYY-MM-DD') AS period_end
    FROM
        budget_categories_real bc
    LEFT JOIN
        transactions_real tr ON bc.id = tr.category_id
            AND tr.user_id = p_user_id
            AND (p_transaction_type = 'all' OR tr.type = p_transaction_type)
            AND tr.date >= period_start_date
            AND tr.date < period_end_date
    WHERE
        bc.id = p_category_id
        AND bc.user_id = p_user_id
    GROUP BY
        bc.id, bc.name, bc.category_type, bc.budget_limit, bc.ring_color, bc.bg_color, bc.icon;
END;
$$ LANGUAGE plpgsql;

-- Function to get complete budget overview (powers high-level dashboard metrics)
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
) AS $$
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

    -- Calculate budget overview metrics
    WITH expense_summary AS (
        SELECT
            SUM(bc.budget_limit) AS budget_sum,
            COALESCE(SUM(tr_sum.spent), 0) AS actual_sum,
            COUNT(bc.id) AS category_count_total,
            SUM(CASE WHEN COALESCE(tr_sum.spent, 0) > bc.budget_limit AND bc.budget_limit > 0 THEN 1 ELSE 0 END) AS over_budget_count,
            SUM(CASE WHEN COALESCE(tr_sum.spent, 0) <= bc.budget_limit OR bc.budget_limit = 0 THEN 1 ELSE 0 END) AS under_budget_count
        FROM 
            budget_categories_real bc
        LEFT JOIN (
            SELECT 
                category_id, 
                SUM(amount) AS spent
            FROM 
                transactions_real
            WHERE 
                user_id = p_user_id
                AND type = 'expense'
                AND date >= period_start_date
                AND date < period_end_date
            GROUP BY 
                category_id
        ) tr_sum ON bc.id = tr_sum.category_id
        WHERE 
            bc.user_id = p_user_id
            AND bc.category_type = 'expense'
            AND (bc.is_active IS NULL OR bc.is_active != 'false')
    ),
    income_summary AS (
        SELECT
            SUM(bc.budget_limit) AS budget_sum,
            COALESCE(SUM(tr_sum.earned), 0) AS actual_sum
        FROM 
            budget_categories_real bc
        LEFT JOIN (
            SELECT 
                category_id, 
                SUM(amount) AS earned
            FROM 
                transactions_real
            WHERE 
                user_id = p_user_id
                AND type = 'income'
                AND date >= period_start_date
                AND date < period_end_date
            GROUP BY 
                category_id
        ) tr_sum ON bc.id = tr_sum.category_id
        WHERE 
            bc.user_id = p_user_id
            AND bc.category_type = 'income'
            AND (bc.is_active IS NULL OR bc.is_active != 'false')
    )
    SELECT
        COALESCE(i.budget_sum, 0) AS total_income_budget,
        COALESCE(i.actual_sum, 0) AS total_income_actual,
        COALESCE(e.budget_sum, 0) AS total_expense_budget,
        COALESCE(e.actual_sum, 0) AS total_expense_actual,
        COALESCE(i.budget_sum, 0) - COALESCE(e.budget_sum, 0) AS net_budget,
        COALESCE(i.actual_sum, 0) - COALESCE(e.actual_sum, 0) AS net_actual,
        CASE 
            WHEN COALESCE(i.actual_sum, 0) > 0 THEN 
                ROUND(((COALESCE(i.actual_sum, 0) - COALESCE(e.actual_sum, 0)) / COALESCE(i.actual_sum, 0) * 100)::numeric, 2)
            ELSE 0
        END AS savings_rate,
        COALESCE(e.over_budget_count, 0) AS categories_over_budget,
        COALESCE(e.under_budget_count, 0) AS categories_under_budget,
        COALESCE(e.category_count_total, 0) AS total_categories
    FROM
        expense_summary e
    CROSS JOIN
        income_summary i;
END;
$$ LANGUAGE plpgsql;

-- Function to get subcategory transactions (for transaction lists in Budget Details modal)
CREATE OR REPLACE FUNCTION get_subcategory_transactions(
    p_user_id UUID,
    p_subcategory_id UUID,
    p_transaction_type TEXT DEFAULT 'expense',
    p_period_type TEXT DEFAULT 'monthly',
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    transaction_id UUID,
    transaction_name TEXT,
    amount NUMERIC,
    date TIMESTAMP WITH TIME ZONE,
    merchant TEXT,
    description TEXT
) AS $$
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
        tr.id AS transaction_id,
        tr.name AS transaction_name,
        tr.amount,
        tr.date,
        tr.merchant,
        tr.description
    FROM
        transactions_real tr
    WHERE
        tr.user_id = p_user_id
        AND tr.subcategory_id = p_subcategory_id
        AND (p_transaction_type = 'all' OR tr.type = p_transaction_type)
        AND tr.date >= period_start_date
        AND tr.date < period_end_date
    ORDER BY
        tr.date DESC
    LIMIT
        p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get subcategory progress within a category (for Budget Details modal)
CREATE OR REPLACE FUNCTION get_subcategory_progress(
    p_user_id UUID,
    p_category_id UUID,
    p_transaction_type TEXT DEFAULT 'expense',
    p_period_type TEXT DEFAULT 'monthly'
)
RETURNS TABLE(
    subcategory_id UUID,
    subcategory_name TEXT,
    budget_limit NUMERIC,
    spent_amount NUMERIC,
    remaining_amount NUMERIC,
    percentage_used NUMERIC,
    color TEXT,
    icon TEXT,
    display_order INTEGER,
    is_active BOOLEAN,
    transaction_count INTEGER
) AS $$
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
        bs.id AS subcategory_id,
        bs.name AS subcategory_name,
        bs.budget_limit,
        COALESCE(SUM(tr.amount), 0) AS spent_amount,
        GREATEST(bs.budget_limit - COALESCE(SUM(tr.amount), 0), 0) AS remaining_amount,
        CASE 
            WHEN bs.budget_limit > 0 THEN 
                ROUND((COALESCE(SUM(tr.amount), 0) / bs.budget_limit * 100)::numeric, 2)
            ELSE 0 
        END AS percentage_used,
        bs.color,
        bs.icon,
        bs.display_order,
        CASE WHEN bs.is_active IS NULL OR bs.is_active != 'false' THEN TRUE ELSE FALSE END AS is_active,
        COUNT(tr.id) AS transaction_count
    FROM
        budget_subcategories_real bs
    LEFT JOIN
        transactions_real tr ON bs.id = tr.subcategory_id
            AND tr.user_id = p_user_id
            AND (p_transaction_type = 'all' OR tr.type = p_transaction_type)
            AND tr.date >= period_start_date
            AND tr.date < period_end_date
    WHERE
        bs.category_id = p_category_id
    GROUP BY
        bs.id, bs.name, bs.budget_limit, bs.color, bs.icon, bs.display_order, bs.is_active
    ORDER BY
        bs.display_order, bs.name;
END;
$$ LANGUAGE plpgsql;
