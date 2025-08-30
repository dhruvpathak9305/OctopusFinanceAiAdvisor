-- =====================================================================
-- COMPLETE BALANCE SYSTEM MIGRATION
-- =====================================================================
-- This single file sets up the entire optimized balance tracking system
-- Run this ONCE to get everything working perfectly
-- =====================================================================

-- =====================================================================
-- PART 1: CREATE OPTIMIZED BALANCE TABLE
-- =====================================================================

-- Create the balance_real table with denormalized account details
CREATE TABLE IF NOT EXISTS public.balance_real (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  user_id uuid NOT NULL,
  
  -- Balance fields
  opening_balance numeric(12, 2) NOT NULL DEFAULT 0,
  current_balance numeric(12, 2) NOT NULL DEFAULT 0,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Denormalized account details (for performance)
  account_name TEXT,
  account_type TEXT,
  institution_name TEXT,
  account_number TEXT,
  currency TEXT DEFAULT 'INR',
  
  -- Constraints
  CONSTRAINT balance_real_pkey PRIMARY KEY (id),
  CONSTRAINT balance_real_account_id_fkey FOREIGN KEY (account_id) REFERENCES accounts_real(id) ON DELETE CASCADE,
  CONSTRAINT balance_real_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT balance_real_account_unique UNIQUE (account_id),
  CONSTRAINT balance_real_opening_balance_check CHECK (opening_balance >= -999999999.99),
  CONSTRAINT balance_real_current_balance_check CHECK (current_balance >= -999999999.99)
) TABLESPACE pg_default;

-- Add required fields constraints after data population
-- (Will be added later in the migration)

-- =====================================================================
-- PART 2: CREATE PERFORMANCE INDEXES
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_balance_real_account_id ON public.balance_real(account_id);
CREATE INDEX IF NOT EXISTS idx_balance_real_user_id ON public.balance_real(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_real_last_updated ON public.balance_real(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_balance_real_account_name ON public.balance_real(account_name);
CREATE INDEX IF NOT EXISTS idx_balance_real_account_type ON public.balance_real(account_type);
CREATE INDEX IF NOT EXISTS idx_balance_real_institution_name ON public.balance_real(institution_name) WHERE institution_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_balance_real_currency ON public.balance_real(currency);

-- =====================================================================
-- PART 3: ENABLE ROW LEVEL SECURITY
-- =====================================================================

ALTER TABLE public.balance_real ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own balances" ON public.balance_real;
DROP POLICY IF EXISTS "Users can insert their own balances" ON public.balance_real;
DROP POLICY IF EXISTS "Users can update their own balances" ON public.balance_real;
DROP POLICY IF EXISTS "Users can delete their own balances" ON public.balance_real;

-- Create RLS policies
CREATE POLICY "Users can view their own balances" ON public.balance_real
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balances" ON public.balance_real
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balances" ON public.balance_real
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own balances" ON public.balance_real
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================
-- PART 4: ENABLE REAL-TIME SUBSCRIPTIONS
-- =====================================================================

-- Enable realtime for balance_real table
ALTER PUBLICATION supabase_realtime ADD TABLE public.balance_real;

-- =====================================================================
-- PART 5: CREATE AUTOMATIC TRIGGERS
-- =====================================================================

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS trigger_create_balance_for_account ON public.accounts_real;
DROP TRIGGER IF EXISTS trigger_sync_balance_on_account_update ON public.accounts_real;
DROP TRIGGER IF EXISTS trigger_update_balance_from_transaction ON public.transactions_real;
DROP FUNCTION IF EXISTS create_balance_for_new_account();
DROP FUNCTION IF EXISTS sync_balance_on_account_update();
DROP FUNCTION IF EXISTS update_balance_from_transaction();

-- Function 1: Create balance record when account is created
CREATE OR REPLACE FUNCTION create_balance_for_new_account()
RETURNS TRIGGER AS $$
BEGIN
  -- Create balance record with all account details included
  INSERT INTO public.balance_real (
    account_id,
    user_id,
    account_name,
    account_type,
    institution_name,
    account_number,
    currency,
    opening_balance,
    current_balance
  ) VALUES (
    NEW.id,
    NEW.user_id,
    NEW.name,                           -- Include account name
    NEW.type,                           -- Include account type
    NEW.institution,                    -- Include institution name
    NEW.account_number,                 -- Include account number
    COALESCE(NEW.currency, 'INR'),      -- Include currency with default
    0,                                  -- Default opening balance
    0                                   -- Default current balance
  );
  
  RAISE NOTICE 'Created balance_real record for account: % (Type: %, Institution: %)', NEW.name, NEW.type, NEW.institution;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Sync account details when accounts_real is updated
CREATE OR REPLACE FUNCTION sync_balance_on_account_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update balance_real with all new account details
  UPDATE public.balance_real 
  SET 
    account_name = NEW.name,
    account_type = NEW.type,
    institution_name = NEW.institution,
    account_number = NEW.account_number,
    currency = COALESCE(NEW.currency, 'INR'),
    last_updated = now()
  WHERE account_id = NEW.id;
  
  RAISE NOTICE 'Updated balance_real details for account: % (Type: %, Institution: %)', NEW.name, NEW.type, NEW.institution;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Update balances when transactions change
CREATE OR REPLACE FUNCTION update_balance_from_transaction()
RETURNS TRIGGER AS $$
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
      
      -- Log for debugging
      RAISE NOTICE 'Balance updated for source account %: -% (transaction: %)', NEW.source_account_id, NEW.amount, NEW.id;
    END IF;
    
    -- Update destination account balance (add for income/transfer)
    IF NEW.destination_account_id IS NOT NULL THEN
      UPDATE public.balance_real 
      SET 
        current_balance = current_balance + NEW.amount,
        last_updated = now()
      WHERE account_id = NEW.destination_account_id;
      
      -- Log for debugging
      RAISE NOTICE 'Balance updated for destination account %: +% (transaction: %)', NEW.destination_account_id, NEW.amount, NEW.id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Handle UPDATE (transaction modified)
  IF TG_OP = 'UPDATE' THEN
    -- Only process if amount or account changed
    IF OLD.amount != NEW.amount OR 
       OLD.source_account_id != NEW.source_account_id OR 
       OLD.destination_account_id != NEW.destination_account_id THEN
       
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
      
      RAISE NOTICE 'Balance updated due to transaction modification: %', NEW.id;
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
    
    RAISE NOTICE 'Balance updated due to transaction deletion: %', OLD.id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the triggers
CREATE TRIGGER trigger_create_balance_for_account
  AFTER INSERT ON public.accounts_real
  FOR EACH ROW
  EXECUTE FUNCTION create_balance_for_new_account();

CREATE TRIGGER trigger_sync_balance_on_account_update
  AFTER UPDATE ON public.accounts_real
  FOR EACH ROW
  EXECUTE FUNCTION sync_balance_on_account_update();

CREATE TRIGGER trigger_update_balance_from_transaction
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions_real
  FOR EACH ROW
  EXECUTE FUNCTION update_balance_from_transaction();

-- =====================================================================
-- PART 6: POPULATE EXISTING DATA
-- =====================================================================

-- Step 1: Create balance_real records for accounts that don't have them
INSERT INTO public.balance_real (
  account_id,
  user_id,
  account_name,
  account_type,
  institution_name,
  account_number,
  currency,
  opening_balance,
  current_balance,
  last_updated,
  created_at
)
SELECT 
  a.id as account_id,
  a.user_id,
  a.name as account_name,
  a.type as account_type,
  a.institution as institution_name,
  a.account_number,
  COALESCE(a.currency, 'INR') as currency,
  0 as opening_balance,  -- Default to 0 since we don't have historical opening balance
  0 as current_balance,  -- Will be calculated in next step
  now() as last_updated,
  now() as created_at
FROM public.accounts_real a
LEFT JOIN public.balance_real b ON a.id = b.account_id
WHERE b.account_id IS NULL;  -- Only insert for accounts without balance records

-- Step 2: Update denormalized fields for existing balance records
UPDATE public.balance_real 
SET 
  account_name = a.name,
  account_type = a.type,
  institution_name = a.institution,
  account_number = a.account_number,
  currency = COALESCE(a.currency, 'INR'),
  last_updated = now()
FROM public.accounts_real a
WHERE balance_real.account_id = a.id
  AND (balance_real.account_name IS NULL OR balance_real.account_type IS NULL);

-- Step 3: Calculate current balance for each account based on transactions
UPDATE public.balance_real 
SET 
  current_balance = (
    SELECT COALESCE(
      -- Income transactions (destination account receives money)
      (SELECT SUM(amount) FROM public.transactions_real 
       WHERE destination_account_id = balance_real.account_id),
      0
    ) - COALESCE(
      -- Expense/transfer transactions (source account loses money)  
      (SELECT SUM(amount) FROM public.transactions_real 
       WHERE source_account_id = balance_real.account_id),
      0
    )
  ),
  last_updated = now()
WHERE account_id IN (
  SELECT id FROM public.accounts_real
);

-- Step 4: Set opening balance to current balance for existing accounts
UPDATE public.balance_real 
SET 
  opening_balance = current_balance,
  last_updated = now()
WHERE opening_balance = 0  -- Only update accounts that had default opening balance
  AND current_balance != 0;  -- And have actual transaction history

-- =====================================================================
-- PART 7: ADD NOT NULL CONSTRAINTS
-- =====================================================================

-- Add NOT NULL constraints after data is populated
ALTER TABLE public.balance_real 
ALTER COLUMN account_name SET NOT NULL,
ALTER COLUMN account_type SET NOT NULL;

-- =====================================================================
-- PART 8: ADD COMMENTS
-- =====================================================================

COMMENT ON TABLE public.balance_real IS 'Optimized balance table with denormalized account details for performance';
COMMENT ON COLUMN public.balance_real.opening_balance IS 'Initial balance when account was created';
COMMENT ON COLUMN public.balance_real.current_balance IS 'Current balance, automatically updated with transactions';
COMMENT ON COLUMN public.balance_real.account_name IS 'Account name (denormalized from accounts_real.name for performance)';
COMMENT ON COLUMN public.balance_real.account_type IS 'Account type (denormalized from accounts_real.type for performance)';
COMMENT ON COLUMN public.balance_real.institution_name IS 'Institution name (denormalized from accounts_real.institution for performance)';
COMMENT ON COLUMN public.balance_real.account_number IS 'Account number (denormalized from accounts_real.account_number for performance)';
COMMENT ON COLUMN public.balance_real.currency IS 'Currency (denormalized from accounts_real.currency for performance)';

COMMENT ON FUNCTION create_balance_for_new_account() IS 'Creates balance_real record with all account details when new account is created';
COMMENT ON FUNCTION sync_balance_on_account_update() IS 'Syncs all account details to balance_real when accounts_real is updated';
COMMENT ON FUNCTION update_balance_from_transaction() IS 'Automatically updates balance_real records when transactions are created, updated, or deleted';

-- =====================================================================
-- PART 9: VERIFICATION
-- =====================================================================

DO $$
DECLARE
  total_accounts INTEGER;
  total_balances INTEGER;
  balances_with_names INTEGER;
  balances_with_types INTEGER;
  total_balance NUMERIC;
BEGIN
  SELECT COUNT(*) INTO total_accounts FROM public.accounts_real;
  SELECT COUNT(*) INTO total_balances FROM public.balance_real;
  
  SELECT COUNT(*) INTO balances_with_names 
  FROM public.balance_real 
  WHERE account_name IS NOT NULL;
  
  SELECT COUNT(*) INTO balances_with_types 
  FROM public.balance_real 
  WHERE account_type IS NOT NULL;
  
  SELECT SUM(current_balance) INTO total_balance FROM public.balance_real;
  
  RAISE NOTICE '=== BALANCE SYSTEM SETUP COMPLETE ===';
  RAISE NOTICE 'Total accounts: %', total_accounts;
  RAISE NOTICE 'Total balance records: %', total_balances;
  RAISE NOTICE 'Records with account names: %', balances_with_names;
  RAISE NOTICE 'Records with account types: %', balances_with_types;
  RAISE NOTICE 'Total current balance across all accounts: %', total_balance;
  
  IF total_accounts = total_balances THEN
    RAISE NOTICE '✅ Every account has a corresponding balance record';
  ELSE
    RAISE WARNING '❌ Mismatch: % accounts vs % balance records', total_accounts, total_balances;
  END IF;
  
  IF balances_with_names = total_balances AND balances_with_types = total_balances THEN
    RAISE NOTICE '✅ All balance records have complete account details';
  ELSE
    RAISE WARNING '❌ Some balance records missing account details';
  END IF;
  
  RAISE NOTICE '🚀 Balance system is ready! Balances will update automatically with transactions.';
END $$;
