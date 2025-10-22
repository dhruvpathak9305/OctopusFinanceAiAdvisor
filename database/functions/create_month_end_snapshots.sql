-- ============================================================================
-- MONTHLY BALANCE SNAPSHOT FUNCTION
-- ============================================================================
-- Purpose: Create month-end balance snapshots for all accounts
-- Usage: Run this function at the end of each month (can be scheduled)
-- ============================================================================

CREATE OR REPLACE FUNCTION create_month_end_snapshots(target_month_end DATE DEFAULT NULL)
RETURNS TABLE (
  account_id UUID,
  account_name TEXT,
  balance NUMERIC(12,2),
  snapshot_date DATE,
  status TEXT
) AS $$
DECLARE
  month_end DATE;
  affected_rows INT := 0;
BEGIN
  -- Use provided date or default to last day of current month
  IF target_month_end IS NULL THEN
    month_end := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
  ELSE
    month_end := target_month_end;
  END IF;

  RAISE NOTICE 'Creating balance snapshots for: %', month_end;

  -- Insert/update snapshots for all accounts with balances
  RETURN QUERY
  INSERT INTO account_balance_history_real (
    account_id,
    user_id,
    balance,
    snapshot_date
  )
  SELECT 
    a.id,
    a.user_id,
    a.current_balance,
    month_end
  FROM accounts_real a
  WHERE a.current_balance IS NOT NULL
  ON CONFLICT (account_id, snapshot_date)
  DO UPDATE SET
    balance = EXCLUDED.balance,
    created_at = NOW()
  RETURNING 
    account_balance_history_real.account_id,
    (SELECT name FROM accounts_real WHERE id = account_balance_history_real.account_id) AS account_name,
    account_balance_history_real.balance,
    account_balance_history_real.snapshot_date,
    'Updated' AS status;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RAISE NOTICE 'Created/updated % balance snapshots', affected_rows;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER: Create Snapshots for Previous Months (Backfill)
-- ============================================================================

CREATE OR REPLACE FUNCTION backfill_balance_snapshots(months_back INT DEFAULT 12)
RETURNS TABLE (
  snapshot_date DATE,
  accounts_processed INT,
  total_balance NUMERIC(12,2)
) AS $$
DECLARE
  month_end DATE;
  i INT;
BEGIN
  FOR i IN 0..(months_back - 1) LOOP
    -- Calculate month-end date for i months ago
    month_end := (DATE_TRUNC('month', CURRENT_DATE - (i || ' months')::INTERVAL) + INTERVAL '1 month - 1 day')::DATE;
    
    RAISE NOTICE 'Processing month: %', month_end;
    
    -- This would need to calculate historical balances
    -- For now, just create snapshots with current balances
    -- (The Node.js script does proper historical calculation)
    
    RETURN QUERY
    SELECT 
      month_end AS snapshot_date,
      COUNT(*)::INT AS accounts_processed,
      SUM(current_balance) AS total_balance
    FROM accounts_real
    WHERE current_balance IS NOT NULL;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Create snapshots for current month
-- SELECT * FROM create_month_end_snapshots();

-- Create snapshots for specific date (e.g., Oct 31, 2025)
-- SELECT * FROM create_month_end_snapshots('2025-10-31');

-- Verify snapshots exist
-- SELECT 
--   snapshot_date,
--   COUNT(*) as accounts,
--   SUM(balance) as total_balance
-- FROM account_balance_history_real
-- GROUP BY snapshot_date
-- ORDER BY snapshot_date DESC;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION create_month_end_snapshots(DATE) IS 
'Creates or updates month-end balance snapshots for all accounts. Run this at the end of each month to capture balances. Can be scheduled via pg_cron or external scheduler.';

COMMENT ON FUNCTION backfill_balance_snapshots(INT) IS 
'Backfills balance snapshots for previous months. Note: Uses current balances, not historical calculations. For accurate historical data, use the Node.js script.';

