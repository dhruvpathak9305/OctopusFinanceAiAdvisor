-- ============================================================================
-- Single-Entry Transfer System Support Functions
-- ============================================================================
-- Created: 2025-10-20
-- Purpose: Support single-entry transfer system where transfers are stored
--          once in source account and linked via destination_account_id
-- ============================================================================

-- ============================================================================
-- Function: get_account_transactions
-- ============================================================================
-- Get all transactions for an account including incoming transfers
-- Returns combined result of:
--   1. Transactions where account is SOURCE (all types)
--   2. Transfers where account is DESTINATION (incoming)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_account_transactions(
    p_account_id UUID,
    p_limit INT DEFAULT NULL,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    name TEXT,
    description TEXT,
    amount NUMERIC,
    date TIMESTAMPTZ,
    type TEXT,
    direction TEXT,  -- 'outgoing' or 'incoming'
    source_account_id UUID,
    destination_account_id UUID,
    source_account_name TEXT,
    destination_account_name TEXT,
    category_id UUID,
    subcategory_id UUID,
    merchant TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH source_transactions AS (
        -- Get transactions where this account is SOURCE
        SELECT 
            t.id,
            t.user_id,
            t.name,
            t.description,
            t.amount,
            t.date,
            t.type,
            'outgoing'::TEXT as direction,
            t.source_account_id,
            t.destination_account_id,
            sa.name as source_account_name,
            da.name as destination_account_name,
            t.category_id,
            t.subcategory_id,
            t.merchant,
            t.metadata,
            t.created_at,
            t.updated_at
        FROM transactions_real t
        LEFT JOIN accounts_real sa ON t.source_account_id = sa.id
        LEFT JOIN accounts_real da ON t.destination_account_id = da.id
        WHERE t.source_account_id = p_account_id
    ),
    destination_transfers AS (
        -- Get transfers where this account is DESTINATION
        SELECT 
            t.id,
            t.user_id,
            t.name,
            t.description,
            t.amount,
            t.date,
            t.type,
            'incoming'::TEXT as direction,
            t.source_account_id,
            t.destination_account_id,
            sa.name as source_account_name,
            da.name as destination_account_name,
            t.category_id,
            t.subcategory_id,
            t.merchant,
            t.metadata,
            t.created_at,
            t.updated_at
        FROM transactions_real t
        LEFT JOIN accounts_real sa ON t.source_account_id = sa.id
        LEFT JOIN accounts_real da ON t.destination_account_id = da.id
        WHERE t.destination_account_id = p_account_id
          AND t.type = 'transfer'
    ),
    combined AS (
        SELECT * FROM source_transactions
        UNION ALL
        SELECT * FROM destination_transfers
    )
    SELECT 
        combined.id,
        combined.user_id,
        combined.name,
        combined.description,
        combined.amount,
        combined.date,
        combined.type,
        combined.direction,
        combined.source_account_id,
        combined.destination_account_id,
        combined.source_account_name,
        combined.destination_account_name,
        combined.category_id,
        combined.subcategory_id,
        combined.merchant,
        combined.metadata,
        combined.created_at,
        combined.updated_at
    FROM combined
    ORDER BY combined.date DESC, combined.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_account_transactions IS 
'Get all transactions for an account including incoming transfers. Returns combined result with direction indicator.';

-- ============================================================================
-- Function: calculate_account_balance
-- ============================================================================
-- Calculate current balance for an account using single-entry transfer system
-- Formula:
--   Balance = initial_balance 
--           + SUM(income where source = account)
--           - SUM(expenses where source = account)
--           - SUM(transfers OUT where source = account)
--           + SUM(transfers IN where destination = account)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_account_balance(
    p_account_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
    v_initial_balance NUMERIC;
    v_source_income NUMERIC;
    v_source_expenses NUMERIC;
    v_outgoing_transfers NUMERIC;
    v_incoming_transfers NUMERIC;
    v_calculated_balance NUMERIC;
BEGIN
    -- Get initial balance
    SELECT COALESCE(initial_balance, 0)
    INTO v_initial_balance
    FROM accounts_real
    WHERE id = p_account_id;

    IF v_initial_balance IS NULL THEN
        RAISE EXCEPTION 'Account not found: %', p_account_id;
    END IF;

    -- Get income from source transactions
    SELECT COALESCE(SUM(amount), 0)
    INTO v_source_income
    FROM transactions_real
    WHERE source_account_id = p_account_id
      AND type = 'income';

    -- Get expenses from source transactions
    SELECT COALESCE(SUM(amount), 0)
    INTO v_source_expenses
    FROM transactions_real
    WHERE source_account_id = p_account_id
      AND type = 'expense';

    -- Get outgoing transfers from source transactions
    SELECT COALESCE(SUM(amount), 0)
    INTO v_outgoing_transfers
    FROM transactions_real
    WHERE source_account_id = p_account_id
      AND type = 'transfer';

    -- Get incoming transfers (destination transactions)
    SELECT COALESCE(SUM(amount), 0)
    INTO v_incoming_transfers
    FROM transactions_real
    WHERE destination_account_id = p_account_id
      AND type = 'transfer';

    -- Calculate final balance
    v_calculated_balance := v_initial_balance 
                          + v_source_income 
                          - v_source_expenses 
                          - v_outgoing_transfers 
                          + v_incoming_transfers;

    RETURN v_calculated_balance;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calculate_account_balance IS 
'Calculate account balance using single-entry transfer system. Includes incoming transfers from destination_account_id.';

-- ============================================================================
-- Function: get_account_balance_breakdown
-- ============================================================================
-- Get detailed balance breakdown for an account
-- Shows all components: initial, income, expenses, transfers in/out, final
-- ============================================================================

CREATE OR REPLACE FUNCTION get_account_balance_breakdown(
    p_account_id UUID
)
RETURNS TABLE (
    account_id UUID,
    account_name TEXT,
    initial_balance NUMERIC,
    total_income NUMERIC,
    total_expenses NUMERIC,
    transfers_out NUMERIC,
    transfers_in NUMERIC,
    calculated_balance NUMERIC,
    stored_balance NUMERIC,
    balance_difference NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH balance_components AS (
        SELECT 
            a.id as account_id,
            a.name as account_name,
            COALESCE(a.initial_balance, 0) as initial_balance,
            COALESCE(a.current_balance, 0) as stored_balance,
            
            -- Income from source
            COALESCE((
                SELECT SUM(amount)
                FROM transactions_real
                WHERE source_account_id = p_account_id
                  AND type = 'income'
            ), 0) as total_income,
            
            -- Expenses from source
            COALESCE((
                SELECT SUM(amount)
                FROM transactions_real
                WHERE source_account_id = p_account_id
                  AND type = 'expense'
            ), 0) as total_expenses,
            
            -- Transfers out (source)
            COALESCE((
                SELECT SUM(amount)
                FROM transactions_real
                WHERE source_account_id = p_account_id
                  AND type = 'transfer'
            ), 0) as transfers_out,
            
            -- Transfers in (destination)
            COALESCE((
                SELECT SUM(amount)
                FROM transactions_real
                WHERE destination_account_id = p_account_id
                  AND type = 'transfer'
            ), 0) as transfers_in
            
        FROM accounts_real a
        WHERE a.id = p_account_id
    )
    SELECT 
        bc.account_id,
        bc.account_name,
        bc.initial_balance,
        bc.total_income,
        bc.total_expenses,
        bc.transfers_out,
        bc.transfers_in,
        (bc.initial_balance + bc.total_income - bc.total_expenses - bc.transfers_out + bc.transfers_in) as calculated_balance,
        bc.stored_balance,
        (bc.initial_balance + bc.total_income - bc.total_expenses - bc.transfers_out + bc.transfers_in) - bc.stored_balance as balance_difference
    FROM balance_components bc;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_account_balance_breakdown IS 
'Get detailed balance breakdown showing all components and comparing calculated vs stored balance.';

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_account_transactions(UUID, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_account_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_account_balance_breakdown(UUID) TO authenticated;

-- ============================================================================
-- Usage Examples
-- ============================================================================

-- Example 1: Get all transactions for ICICI account
-- SELECT * FROM get_account_transactions('fd551095-58a9-4f12-b00e-2fd182e68403', 50, 0);

-- Example 2: Calculate balance for IDFC account
-- SELECT calculate_account_balance('328c756a-b05e-4925-a9ae-852f7fb18b4e');

-- Example 3: Get detailed breakdown for ICICI account
-- SELECT * FROM get_account_balance_breakdown('fd551095-58a9-4f12-b00e-2fd182e68403');

-- Example 4: Compare balances for all accounts
-- SELECT 
--     name,
--     calculated_balance,
--     stored_balance,
--     balance_difference
-- FROM get_account_balance_breakdown((SELECT id FROM accounts_real LIMIT 1));

