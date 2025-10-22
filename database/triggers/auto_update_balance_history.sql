-- ============================================================================
-- AUTO-UPDATE BALANCE HISTORY TRIGGERS
-- ============================================================================
-- Purpose: Automatically update account_balance_history_real when:
--   1. New transactions are added
--   2. Transactions are updated or deleted
--   3. Account balances change
-- ============================================================================

-- Function to update current month's balance snapshot
CREATE OR REPLACE FUNCTION update_current_month_balance_snapshot()
RETURNS TRIGGER AS $$
DECLARE
  current_month_end DATE;
  account_balance NUMERIC(12,2);
  affected_account_id UUID;
  affected_user_id UUID;
BEGIN
  -- Determine which account was affected
  IF TG_OP = 'DELETE' THEN
    affected_account_id := OLD.source_account_id;
  ELSE
    affected_account_id := NEW.source_account_id;
  END IF;

  -- Get current month-end date
  current_month_end := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;

  -- Get the current balance from accounts_real
  SELECT current_balance, user_id 
  INTO account_balance, affected_user_id
  FROM accounts_real 
  WHERE id = affected_account_id;

  -- If account doesn't exist or has no balance, skip
  IF account_balance IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Upsert the balance snapshot for current month
  INSERT INTO account_balance_history_real (
    account_id,
    user_id,
    balance,
    snapshot_date
  )
  VALUES (
    affected_account_id,
    affected_user_id,
    account_balance,
    current_month_end
  )
  ON CONFLICT (account_id, snapshot_date) 
  DO UPDATE SET 
    balance = EXCLUDED.balance,
    created_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER 1: On Transaction Insert
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_update_balance_on_transaction_insert ON transactions_real;

CREATE TRIGGER trigger_update_balance_on_transaction_insert
AFTER INSERT ON transactions_real
FOR EACH ROW
EXECUTE FUNCTION update_current_month_balance_snapshot();

-- ============================================================================
-- TRIGGER 2: On Transaction Update
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_update_balance_on_transaction_update ON transactions_real;

CREATE TRIGGER trigger_update_balance_on_transaction_update
AFTER UPDATE ON transactions_real
FOR EACH ROW
WHEN (
  OLD.amount IS DISTINCT FROM NEW.amount OR
  OLD.type IS DISTINCT FROM NEW.type OR
  OLD.source_account_id IS DISTINCT FROM NEW.source_account_id
)
EXECUTE FUNCTION update_current_month_balance_snapshot();

-- ============================================================================
-- TRIGGER 3: On Transaction Delete
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_update_balance_on_transaction_delete ON transactions_real;

CREATE TRIGGER trigger_update_balance_on_transaction_delete
AFTER DELETE ON transactions_real
FOR EACH ROW
EXECUTE FUNCTION update_current_month_balance_snapshot();

-- ============================================================================
-- TRIGGER 4: On Account Balance Update (Direct)
-- ============================================================================
-- This handles cases where current_balance is updated directly on accounts_real

CREATE OR REPLACE FUNCTION update_balance_snapshot_on_account_change()
RETURNS TRIGGER AS $$
DECLARE
  current_month_end DATE;
BEGIN
  -- Skip if balance hasn't changed
  IF OLD.current_balance = NEW.current_balance THEN
    RETURN NEW;
  END IF;

  -- Get current month-end date
  current_month_end := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;

  -- Upsert the balance snapshot for current month
  INSERT INTO account_balance_history_real (
    account_id,
    user_id,
    balance,
    snapshot_date
  )
  VALUES (
    NEW.id,
    NEW.user_id,
    NEW.current_balance,
    current_month_end
  )
  ON CONFLICT (account_id, snapshot_date) 
  DO UPDATE SET 
    balance = EXCLUDED.balance,
    created_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_balance_on_account_update ON accounts_real;

CREATE TRIGGER trigger_update_balance_on_account_update
AFTER UPDATE ON accounts_real
FOR EACH ROW
WHEN (OLD.current_balance IS DISTINCT FROM NEW.current_balance)
EXECUTE FUNCTION update_balance_snapshot_on_account_change();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify triggers are created
SELECT 
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  tgenabled AS enabled,
  CASE 
    WHEN tgtype & 1 = 1 THEN 'ROW'
    ELSE 'STATEMENT'
  END AS level,
  CASE 
    WHEN tgtype & 2 = 2 THEN 'BEFORE'
    ELSE 'AFTER'
  END AS timing,
  CASE
    WHEN tgtype & 4 = 4 THEN 'INSERT '
    ELSE ''
  END ||
  CASE
    WHEN tgtype & 8 = 8 THEN 'DELETE '
    ELSE ''
  END ||
  CASE
    WHEN tgtype & 16 = 16 THEN 'UPDATE'
    ELSE ''
  END AS events
FROM pg_trigger
WHERE tgname LIKE '%balance%'
ORDER BY tgname;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION update_current_month_balance_snapshot() IS 
'Automatically updates account_balance_history_real when transactions change. Updates current month snapshot with latest account balance.';

COMMENT ON FUNCTION update_balance_snapshot_on_account_change() IS 
'Automatically updates account_balance_history_real when account current_balance is directly modified.';

COMMENT ON TRIGGER trigger_update_balance_on_transaction_insert ON transactions_real IS 
'Updates balance history when new transactions are inserted';

COMMENT ON TRIGGER trigger_update_balance_on_transaction_update ON transactions_real IS 
'Updates balance history when transactions are modified';

COMMENT ON TRIGGER trigger_update_balance_on_transaction_delete ON transactions_real IS 
'Updates balance history when transactions are deleted';

COMMENT ON TRIGGER trigger_update_balance_on_account_update ON accounts_real IS 
'Updates balance history when account balance is directly updated';

