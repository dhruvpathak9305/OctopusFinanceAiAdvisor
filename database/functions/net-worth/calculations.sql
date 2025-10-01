-- =====================================================================
-- NET WORTH - CALCULATION FUNCTIONS
-- =====================================================================
-- Functions for calculating net worth, creating snapshots, and syncing data
-- =====================================================================

-- =====================================================================
-- CALCULATE_USER_NET_WORTH (Demo Version)
-- =====================================================================
-- Purpose: Calculate total net worth for a user using demo tables
-- Parameters:
--   user_uuid: UUID - User ID to calculate net worth for
-- Returns: TABLE with total_assets, total_liabilities, net_worth
-- =====================================================================

CREATE OR REPLACE FUNCTION calculate_user_net_worth(user_uuid UUID)
RETURNS TABLE(
  total_assets NUMERIC,
  total_liabilities NUMERIC,
  net_worth NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE 
            WHEN nwc.type = 'asset' AND nwe.is_included_in_net_worth = true 
            THEN nwe.value 
            ELSE 0 
        END), 0) as total_assets,
        COALESCE(SUM(CASE 
            WHEN nwc.type = 'liability' AND nwe.is_included_in_net_worth = true 
            THEN nwe.value 
            ELSE 0 
        END), 0) as total_liabilities,
        COALESCE(SUM(CASE 
            WHEN nwc.type = 'asset' AND nwe.is_included_in_net_worth = true 
            THEN nwe.value 
            WHEN nwc.type = 'liability' AND nwe.is_included_in_net_worth = true 
            THEN -nwe.value 
            ELSE 0 
        END), 0) as net_worth
    FROM net_worth_entries nwe
    JOIN net_worth_categories nwc ON nwe.category_id = nwc.id
    WHERE nwe.user_id = user_uuid AND nwe.is_active = true;
END;
$$;

-- =====================================================================
-- CALCULATE_USER_NET_WORTH_REAL (Production Version)
-- =====================================================================
-- Purpose: Calculate total net worth for a user using production tables
-- Parameters:
--   user_uuid: UUID - User ID to calculate net worth for
-- Returns: TABLE with total_assets, total_liabilities, net_worth
-- =====================================================================

CREATE OR REPLACE FUNCTION calculate_user_net_worth_real(user_uuid UUID)
RETURNS TABLE(
  total_assets NUMERIC,
  total_liabilities NUMERIC,
  net_worth NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE 
            WHEN nwc.type = 'asset' AND nwe.is_included_in_net_worth = true 
            THEN nwe.value 
            ELSE 0 
        END), 0) as total_assets,
        COALESCE(SUM(CASE 
            WHEN nwc.type = 'liability' AND nwe.is_included_in_net_worth = true 
            THEN nwe.value 
            ELSE 0 
        END), 0) as total_liabilities,
        COALESCE(SUM(CASE 
            WHEN nwc.type = 'asset' AND nwe.is_included_in_net_worth = true 
            THEN nwe.value 
            WHEN nwc.type = 'liability' AND nwe.is_included_in_net_worth = true 
            THEN -nwe.value 
            ELSE 0 
        END), 0) as net_worth
    FROM net_worth_entries_real nwe
    JOIN net_worth_categories_real nwc ON nwe.category_id = nwc.id
    WHERE nwe.user_id = user_uuid AND nwe.is_active = true;
END;
$$;

-- =====================================================================
-- CREATE_NET_WORTH_SNAPSHOT (Demo Version)
-- =====================================================================
-- Purpose: Create a historical snapshot of user's net worth
-- Parameters:
--   user_uuid: UUID - User ID to create snapshot for
-- Returns: UUID - The created snapshot ID
-- =====================================================================

CREATE OR REPLACE FUNCTION create_net_worth_snapshot(user_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    snapshot_id uuid;
    net_worth_data record;
    category_data jsonb;
BEGIN
    -- Calculate current net worth
    SELECT * INTO net_worth_data FROM calculate_user_net_worth(user_uuid);
    
    -- Get category breakdown
    SELECT jsonb_object_agg(nwc.name, category_totals.total) INTO category_data
    FROM (
        SELECT 
            nwe.category_id,
            SUM(CASE 
                WHEN nwc.type = 'asset' THEN nwe.value 
                ELSE -nwe.value 
            END) as total
        FROM net_worth_entries nwe
        JOIN net_worth_categories nwc ON nwe.category_id = nwc.id
        WHERE nwe.user_id = user_uuid 
          AND nwe.is_active = true 
          AND nwe.is_included_in_net_worth = true
        GROUP BY nwe.category_id
    ) category_totals
    JOIN net_worth_categories nwc ON category_totals.category_id = nwc.id;
    
    -- Insert snapshot
    INSERT INTO net_worth_snapshots (
        user_id, 
        total_assets, 
        total_liabilities, 
        net_worth, 
        category_breakdown
    ) VALUES (
        user_uuid,
        net_worth_data.total_assets,
        net_worth_data.total_liabilities,
        net_worth_data.net_worth,
        category_data
    ) ON CONFLICT (user_id, snapshot_date) 
    DO UPDATE SET
        total_assets = EXCLUDED.total_assets,
        total_liabilities = EXCLUDED.total_liabilities,
        net_worth = EXCLUDED.net_worth,
        category_breakdown = EXCLUDED.category_breakdown
    RETURNING id INTO snapshot_id;
    
    RETURN snapshot_id;
END;
$$;

-- =====================================================================
-- CREATE_NET_WORTH_SNAPSHOT_REAL (Production Version)
-- =====================================================================
-- Purpose: Create a historical snapshot of user's net worth using production tables
-- Parameters:
--   user_uuid: UUID - User ID to create snapshot for
-- Returns: UUID - The created snapshot ID
-- =====================================================================

CREATE OR REPLACE FUNCTION create_net_worth_snapshot_real(user_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    snapshot_id uuid;
    net_worth_data record;
    category_data jsonb;
BEGIN
    -- Calculate current net worth
    SELECT * INTO net_worth_data FROM calculate_user_net_worth_real(user_uuid);
    
    -- Get category breakdown
    SELECT jsonb_object_agg(nwc.name, category_totals.total) INTO category_data
    FROM (
        SELECT 
            nwe.category_id,
            SUM(CASE 
                WHEN nwc.type = 'asset' THEN nwe.value 
                ELSE -nwe.value 
            END) as total
        FROM net_worth_entries_real nwe
        JOIN net_worth_categories_real nwc ON nwe.category_id = nwc.id
        WHERE nwe.user_id = user_uuid 
          AND nwe.is_active = true 
          AND nwe.is_included_in_net_worth = true
        GROUP BY nwe.category_id
    ) category_totals
    JOIN net_worth_categories_real nwc ON category_totals.category_id = nwc.id;
    
    -- Insert snapshot
    INSERT INTO net_worth_snapshots_real (
        user_id, 
        total_assets, 
        total_liabilities, 
        net_worth, 
        category_breakdown
    ) VALUES (
        user_uuid,
        net_worth_data.total_assets,
        net_worth_data.total_liabilities,
        net_worth_data.net_worth,
        category_data
    ) ON CONFLICT (user_id, snapshot_date) 
    DO UPDATE SET
        total_assets = EXCLUDED.total_assets,
        total_liabilities = EXCLUDED.total_liabilities,
        net_worth = EXCLUDED.net_worth,
        category_breakdown = EXCLUDED.category_breakdown
    RETURNING id INTO snapshot_id;
    
    RETURN snapshot_id;
END;
$$;
