-- =====================================================================
-- NET WORTH - SYNC FUNCTIONS
-- =====================================================================
-- Functions for syncing account and credit card data to net worth entries
-- =====================================================================

-- =====================================================================
-- SYNC_ACCOUNTS_TO_NET_WORTH (Demo Version)
-- =====================================================================
-- Purpose: Sync bank account balances to net worth entries
-- Parameters: None (uses all active accounts)
-- Returns: VOID
-- Notes: Automatically creates/updates net worth entries for bank accounts
-- =====================================================================

CREATE OR REPLACE FUNCTION sync_accounts_to_net_worth()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert or update entries for active accounts
    INSERT INTO net_worth_entries (
        user_id,
        asset_name,
        category_id,
        subcategory_id,
        value,
        linked_source_type,
        linked_source_id,
        last_synced_at
    )
    SELECT 
        a.user_id,
        a.name as asset_name,
        (SELECT id FROM net_worth_categories WHERE name = 'Liquid Assets') as category_id,
        (SELECT id FROM net_worth_subcategories WHERE name = 'Cash & Bank Accounts') as subcategory_id,
        a.balance as value,
        'account'::linked_source_type,
        a.id as linked_source_id,
        now() as last_synced_at
    FROM accounts a
    WHERE a.type NOT IN ('Credit Card', 'Credit', 'Loan')
    ON CONFLICT (user_id, linked_source_type, linked_source_id)
    DO UPDATE SET
        asset_name = EXCLUDED.asset_name,
        value = EXCLUDED.value,
        last_synced_at = now();
END;
$$;

-- =====================================================================
-- SYNC_ACCOUNTS_TO_NET_WORTH_REAL (Production Version)
-- =====================================================================
-- Purpose: Sync bank account balances to net worth entries using production tables
-- Parameters: None (uses all active accounts)
-- Returns: VOID
-- Notes: Automatically creates/updates net worth entries for bank accounts
-- =====================================================================

CREATE OR REPLACE FUNCTION sync_accounts_to_net_worth_real()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert or update entries for active accounts from accounts_real
    INSERT INTO net_worth_entries_real (
        user_id,
        asset_name,
        category_id,
        subcategory_id,
        value,
        linked_source_type,
        linked_source_id,
        last_synced_at
    )
    SELECT 
        a.user_id,
        a.name as asset_name,
        (SELECT id FROM net_worth_categories_real WHERE name = 'Liquid Assets') as category_id,
        (SELECT id FROM net_worth_subcategories_real WHERE name = 'Cash & Bank Accounts') as subcategory_id,
        a.balance as value,
        'account'::linked_source_type,
        a.id as linked_source_id,
        now() as last_synced_at
    FROM accounts_real a
    WHERE a.type NOT IN ('Credit Card', 'Credit', 'Loan')
    ON CONFLICT (user_id, linked_source_type, linked_source_id)
    DO UPDATE SET
        asset_name = EXCLUDED.asset_name,
        value = EXCLUDED.value,
        last_synced_at = now();
END;
$$;

-- =====================================================================
-- SYNC_CREDIT_CARDS_TO_NET_WORTH (Demo Version)
-- =====================================================================
-- Purpose: Sync credit card balances to net worth entries as liabilities
-- Parameters: None (uses all credit cards with balances)
-- Returns: VOID
-- Notes: Only syncs cards with positive balances (debt)
-- =====================================================================

CREATE OR REPLACE FUNCTION sync_credit_cards_to_net_worth()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert or update entries for credit card liabilities
    INSERT INTO net_worth_entries (
        user_id,
        asset_name,
        category_id,
        subcategory_id,
        value,
        linked_source_type,
        linked_source_id,
        last_synced_at
    )
    SELECT 
        cc.user_id,
        cc.name as asset_name,
        (SELECT id FROM net_worth_categories WHERE name = 'Liabilities') as category_id,
        (SELECT id FROM net_worth_subcategories WHERE name = 'Unsecured Loans') as subcategory_id,
        cc.current_balance as value,
        'credit_card'::linked_source_type,
        cc.id as linked_source_id,
        now() as last_synced_at
    FROM credit_cards cc
    WHERE cc.current_balance > 0
    ON CONFLICT (user_id, linked_source_type, linked_source_id)
    DO UPDATE SET
        asset_name = EXCLUDED.asset_name,
        value = EXCLUDED.value,
        last_synced_at = now();
END;
$$;

-- =====================================================================
-- SYNC_CREDIT_CARDS_TO_NET_WORTH_REAL (Production Version)
-- =====================================================================
-- Purpose: Sync credit card balances to net worth entries as liabilities using production tables
-- Parameters: None (uses all credit cards with balances)
-- Returns: VOID
-- Notes: Only syncs cards with positive balances (debt)
-- =====================================================================

CREATE OR REPLACE FUNCTION sync_credit_cards_to_net_worth_real()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert or update entries for credit card liabilities from credit_cards_real
    INSERT INTO net_worth_entries_real (
        user_id,
        asset_name,
        category_id,
        subcategory_id,
        value,
        linked_source_type,
        linked_source_id,
        last_synced_at
    )
    SELECT 
        cc.user_id,
        cc.name as asset_name,
        (SELECT id FROM net_worth_categories_real WHERE name = 'Liabilities') as category_id,
        (SELECT id FROM net_worth_subcategories_real WHERE name = 'Unsecured Loans') as subcategory_id,
        cc.current_balance as value,
        'credit_card'::linked_source_type,
        cc.id as linked_source_id,
        now() as last_synced_at
    FROM credit_cards_real cc
    WHERE cc.current_balance > 0
    ON CONFLICT (user_id, linked_source_type, linked_source_id)
    DO UPDATE SET
        asset_name = EXCLUDED.asset_name,
        value = EXCLUDED.value,
        last_synced_at = now();
END;
$$;

-- =====================================================================
-- USAGE EXAMPLES
-- =====================================================================

/*
-- Sync all accounts to net worth (production)
SELECT sync_accounts_to_net_worth_real();

-- Sync all credit cards to net worth (production)  
SELECT sync_credit_cards_to_net_worth_real();

-- Calculate current net worth after sync
SELECT * FROM calculate_user_net_worth_real('your-user-id');

-- Create a snapshot after sync
SELECT create_net_worth_snapshot_real('your-user-id');
*/
