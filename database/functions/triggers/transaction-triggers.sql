-- =====================================================================
-- TRIGGERS - TRANSACTION MANAGEMENT TRIGGERS
-- =====================================================================
-- Triggers for automatic transaction validation and balance updates
-- =====================================================================

-- =====================================================================
-- VALIDATE_ACCOUNT_IDS (Trigger Function)
-- =====================================================================
-- Purpose: Validate that account IDs exist before inserting/updating transactions
-- Trigger: check_account_ids
-- Event: BEFORE INSERT/UPDATE on transactions_real
-- =====================================================================

CREATE OR REPLACE FUNCTION validate_account_ids()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    src_exists BOOLEAN;
    dest_exists BOOLEAN;
BEGIN
    -- Check Source
    IF NEW.source_account_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM accounts_real WHERE id = NEW.source_account_id
            UNION
            SELECT 1 FROM credit_cards_real WHERE id = NEW.source_account_id
        ) INTO src_exists;

        IF NOT src_exists THEN
            RAISE EXCEPTION 
                'Invalid source_account_id: % (not found in accounts_real or credit_cards_real)', 
                NEW.source_account_id;
        END IF;
    END IF;

    -- Check Destination
    IF NEW.destination_account_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM accounts_real WHERE id = NEW.destination_account_id
            UNION
            SELECT 1 FROM credit_cards_real WHERE id = NEW.destination_account_id
        ) INTO dest_exists;

        IF NOT dest_exists THEN
            RAISE EXCEPTION 
                'Invalid destination_account_id: % (not found in accounts_real or credit_cards_real)', 
                NEW.destination_account_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER check_account_ids
  BEFORE INSERT OR UPDATE ON transactions_real
  FOR EACH ROW
  EXECUTE FUNCTION validate_account_ids();

-- =====================================================================
-- UPDATE_BALANCE_FROM_TRANSACTION (Trigger Function)
-- =====================================================================
-- Purpose: Automatically update account balances when transactions change
-- Trigger: trigger_update_balance_from_transaction
-- Event: AFTER INSERT/UPDATE/DELETE on transactions_real
-- =====================================================================

CREATE OR REPLACE FUNCTION update_balance_from_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  source_account_balance numeric(12, 2);
  dest_account_balance numeric(12, 2);
BEGIN
  -- Handle INSERT (new transaction)
  IF TG_OP = 'INSERT' THEN
    -- Update source account balance (subtract for expense/transfer)
    IF NEW.source_account_id IS NOT NULL THEN
      UPDATE public.balance_real 
      SET 
        current_balance = current_balance - NEW.amount,
        last_updated = now()
      WHERE account_id = NEW.source_account_id;
    END IF;
    
    -- Update destination account balance (add for income/transfer)
    IF NEW.destination_account_id IS NOT NULL THEN
      UPDATE public.balance_real 
      SET 
        current_balance = current_balance + NEW.amount,
        last_updated = now()
      WHERE account_id = NEW.destination_account_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Handle UPDATE (transaction modified)
  IF TG_OP = 'UPDATE' THEN
    -- Revert old transaction effects
    IF OLD.source_account_id IS NOT NULL THEN
      UPDATE public.balance_real 
      SET 
        current_balance = current_balance + OLD.amount,
        last_updated = now()
      WHERE account_id = OLD.source_account_id;
    END IF;
    
    IF OLD.destination_account_id IS NOT NULL THEN
      UPDATE public.balance_real 
      SET 
        current_balance = current_balance - OLD.amount,
        last_updated = now()
      WHERE account_id = OLD.destination_account_id;
    END IF;
    
    -- Apply new transaction effects
    IF NEW.source_account_id IS NOT NULL THEN
      UPDATE public.balance_real 
      SET 
        current_balance = current_balance - NEW.amount,
        last_updated = now()
      WHERE account_id = NEW.source_account_id;
    END IF;
    
    IF NEW.destination_account_id IS NOT NULL THEN
      UPDATE public.balance_real 
      SET 
        current_balance = current_balance + NEW.amount,
        last_updated = now()
      WHERE account_id = NEW.destination_account_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Handle DELETE (transaction removed)
  IF TG_OP = 'DELETE' THEN
    -- Revert transaction effects
    IF OLD.source_account_id IS NOT NULL THEN
      UPDATE public.balance_real 
      SET 
        current_balance = current_balance + OLD.amount,
        last_updated = now()
      WHERE account_id = OLD.source_account_id;
    END IF;
    
    IF OLD.destination_account_id IS NOT NULL THEN
      UPDATE public.balance_real 
      SET 
        current_balance = current_balance - OLD.amount,
        last_updated = now()
      WHERE account_id = OLD.destination_account_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create the trigger
CREATE TRIGGER trigger_update_balance_from_transaction
  AFTER INSERT OR UPDATE OR DELETE ON transactions_real
  FOR EACH ROW
  EXECUTE FUNCTION update_balance_from_transaction();

-- =====================================================================
-- USAGE EXAMPLES
-- =====================================================================

/*
-- Example: Insert a transaction (triggers automatic balance update)
INSERT INTO transactions_real (
  user_id, name, amount, date, type,
  source_account_id, destination_account_id
) VALUES (
  'user-uuid',
  'Transfer to Savings',
  500.00,
  NOW(),
  'transfer',
  'checking-account-uuid',
  'savings-account-uuid'
);
-- → Automatically validates account IDs exist
-- → Automatically updates both account balances

-- Example: Update a transaction (triggers balance recalculation)
UPDATE transactions_real 
SET amount = 750.00 
WHERE id = 'transaction-uuid';
-- → Automatically reverts old amount and applies new amount

-- Example: Delete a transaction (triggers balance reversal)
DELETE FROM transactions_real WHERE id = 'transaction-uuid';
-- → Automatically reverts the transaction's effect on balances

-- Check trigger status:
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'transactions_real'
ORDER BY trigger_name, event_manipulation;
*/
