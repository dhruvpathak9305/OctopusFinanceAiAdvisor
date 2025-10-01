-- =====================================================================
-- TRIGGERS - ACCOUNT MANAGEMENT TRIGGERS
-- =====================================================================
-- Triggers for automatic account and balance management
-- =====================================================================

-- =====================================================================
-- CREATE_BALANCE_FOR_NEW_ACCOUNT (Trigger Function)
-- =====================================================================
-- Purpose: Automatically create balance record when new account is created
-- Trigger: trigger_create_balance_for_account
-- Event: AFTER INSERT on accounts_real
-- =====================================================================

CREATE OR REPLACE FUNCTION create_balance_for_new_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create balance record with all account details included
  INSERT INTO public.balance_real (
    account_id,
    user_id,
    account_name,
    institution_name,
    account_type,
    account_number,
    currency,
    opening_balance,
    current_balance
  ) VALUES (
    NEW.id,
    NEW.user_id,
    NEW.name,                           -- Include account name
    NEW.institution,                    -- Include institution name
    NEW.type,                           -- Include account type
    NEW.account_number,                 -- Include account number
    COALESCE(NEW.currency, 'INR'),      -- Include currency with default
    0,                                  -- Default opening balance
    0                                   -- Default current balance
  );
  
  RAISE NOTICE 'Created balance_real record for account: % (Type: %, Institution: %)', NEW.name, NEW.type, NEW.institution;
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER trigger_create_balance_for_account
  AFTER INSERT ON accounts_real
  FOR EACH ROW
  EXECUTE FUNCTION create_balance_for_new_account();

-- =====================================================================
-- SYNC_BALANCE_ON_ACCOUNT_UPDATE (Trigger Function)
-- =====================================================================
-- Purpose: Sync balance record when account details are updated
-- Trigger: trigger_sync_balance_on_account_update
-- Event: AFTER UPDATE on accounts_real
-- =====================================================================

CREATE OR REPLACE FUNCTION sync_balance_on_account_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update balance_real with all new account details
  UPDATE public.balance_real 
  SET 
    account_name = NEW.name,
    institution_name = NEW.institution,
    account_type = NEW.type,
    account_number = NEW.account_number,
    currency = COALESCE(NEW.currency, 'INR'),
    last_updated = now()
  WHERE account_id = NEW.id;
  
  RAISE NOTICE 'Updated balance_real details for account: % (Type: %, Institution: %)', NEW.name, NEW.type, NEW.institution;
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER trigger_sync_balance_on_account_update
  AFTER UPDATE ON accounts_real
  FOR EACH ROW
  EXECUTE FUNCTION sync_balance_on_account_update();

-- =====================================================================
-- USAGE EXAMPLES
-- =====================================================================

/*
-- When you insert a new account:
INSERT INTO accounts_real (user_id, name, type, institution, account_number, currency)
VALUES (
  'user-uuid',
  'My Checking Account',
  'Checking',
  'Chase Bank',
  '****1234',
  'USD'
);
-- → Automatically creates corresponding balance_real record

-- When you update account details:
UPDATE accounts_real 
SET name = 'Updated Account Name', institution = 'New Bank'
WHERE id = 'account-uuid';
-- → Automatically syncs changes to balance_real record

-- Check if triggers are active:
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name IN (
  'trigger_create_balance_for_account',
  'trigger_sync_balance_on_account_update'
);
*/
