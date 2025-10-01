-- =====================================================================
-- BALANCE SYSTEM - BALANCE MANAGEMENT FUNCTIONS
-- =====================================================================
-- Functions for managing account balances, recalculation, and diagnostics
-- =====================================================================

-- =====================================================================
-- RECALCULATE_ACCOUNT_BALANCE
-- =====================================================================
-- Purpose: Recalculate account balance from transaction history
-- Parameters:
--   account_uuid: UUID - Account ID to recalculate
-- Returns: NUMERIC - The calculated balance
-- Formula: Opening Balance + Income - Expenses
-- =====================================================================

CREATE OR REPLACE FUNCTION recalculate_account_balance(account_uuid UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  opening_bal NUMERIC := 0;
  income_total NUMERIC := 0;
  expense_total NUMERIC := 0;
  calculated_balance NUMERIC := 0;
BEGIN
  -- Get the opening balance from balance_real table
  SELECT COALESCE(opening_balance, 0) 
  INTO opening_bal
  FROM public.balance_real 
  WHERE account_id = account_uuid;
  
  -- Calculate total income (destination account)
  SELECT COALESCE(SUM(amount), 0) 
  INTO income_total
  FROM public.transactions_real 
  WHERE destination_account_id = account_uuid;
  
  -- Calculate total expenses/transfers (source account)  
  SELECT COALESCE(SUM(amount), 0)
  INTO expense_total
  FROM public.transactions_real 
  WHERE source_account_id = account_uuid;
  
  -- CORRECT FORMULA: Current balance = Opening Balance + Income - Expenses
  calculated_balance := opening_bal + income_total - expense_total;
  
  -- Update balance_real table with the correct current balance
  UPDATE public.balance_real 
  SET 
    current_balance = calculated_balance,
    last_updated = now()
  WHERE account_id = account_uuid;
  
  RETURN calculated_balance;
END;
$$;

-- =====================================================================
-- RECALCULATE_ALL_BALANCES
-- =====================================================================
-- Purpose: Recalculate balances for all accounts and return changes
-- Parameters: None
-- Returns: TABLE showing old vs new balances for each account
-- =====================================================================

CREATE OR REPLACE FUNCTION recalculate_all_balances()
RETURNS TABLE(
  account_id UUID,
  account_name TEXT,
  old_balance NUMERIC,
  new_balance NUMERIC,
  difference NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  account_record RECORD;
  old_bal NUMERIC;
  new_bal NUMERIC;
BEGIN
  -- Loop through all accounts
  FOR account_record IN 
    SELECT a.id, a.name, b.current_balance
    FROM public.accounts_real a
    JOIN public.balance_real b ON a.id = b.account_id
    ORDER BY a.name
  LOOP
    old_bal := account_record.current_balance;
    new_bal := recalculate_account_balance(account_record.id);
    
    -- Return row showing the changes
    account_id := account_record.id;
    account_name := account_record.name;
    old_balance := old_bal;
    new_balance := new_bal; 
    difference := new_bal - old_bal;
    
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$;

-- =====================================================================
-- FIX_MISSING_BALANCE_RECORDS
-- =====================================================================
-- Purpose: Create balance records for accounts that don't have them
-- Parameters: None
-- Returns: INTEGER - Number of records created
-- =====================================================================

CREATE OR REPLACE FUNCTION fix_missing_balance_records()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  records_created INTEGER := 0;
BEGIN
  -- Insert balance records for accounts that don't have them
  WITH missing_accounts AS (
    SELECT 
      a.id as account_id,
      a.user_id,
      a.name as account_name,
      a.type as account_type,
      a.institution as institution_name,
      a.account_number,
      COALESCE(a.currency, 'INR') as currency
    FROM public.accounts_real a
    LEFT JOIN public.balance_real b ON a.id = b.account_id
    WHERE b.account_id IS NULL
  )
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
  )
  SELECT 
    account_id,
    user_id,
    account_name,
    account_type,
    institution_name,
    account_number,
    currency,
    0,  -- opening_balance
    0   -- current_balance (will be calculated)
  FROM missing_accounts;
  
  GET DIAGNOSTICS records_created = ROW_COUNT;
  
  -- Recalculate balances for newly created records
  IF records_created > 0 THEN
    PERFORM recalculate_account_balance(a.id)
    FROM public.accounts_real a
    LEFT JOIN public.balance_real b ON a.id = b.account_id
    WHERE b.created_at >= now() - interval '1 minute';  -- Recently created
  END IF;
  
  RETURN records_created;
END;
$$;

-- =====================================================================
-- SYNC_ALL_ACCOUNT_DETAILS
-- =====================================================================
-- Purpose: Update balance records with current account details
-- Parameters: None
-- Returns: INTEGER - Number of records updated
-- =====================================================================

CREATE OR REPLACE FUNCTION sync_all_account_details()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  records_updated INTEGER := 0;
BEGIN
  -- Update all balance records with current account details
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
    AND (
      balance_real.account_name != a.name OR
      balance_real.account_type != a.type OR
      balance_real.institution_name != a.institution OR
      balance_real.account_number != a.account_number OR
      balance_real.currency != COALESCE(a.currency, 'INR')
    );
  
  GET DIAGNOSTICS records_updated = ROW_COUNT;
  RETURN records_updated;
END;
$$;

-- =====================================================================
-- FIX_ALL_BALANCE_ISSUES
-- =====================================================================
-- Purpose: Comprehensive function to fix all balance-related issues
-- Parameters: None
-- Returns: TABLE with action taken and results
-- =====================================================================

CREATE OR REPLACE FUNCTION fix_all_balance_issues()
RETURNS TABLE(
  action TEXT,
  result TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  missing_records INTEGER;
  updated_records INTEGER;
  discrepancy_count INTEGER;
BEGIN
  -- Fix 1: Create missing balance records
  SELECT fix_missing_balance_records() INTO missing_records;
  action := 'Create Missing Records';
  result := format('Created %s missing balance records', missing_records);
  RETURN NEXT;
  
  -- Fix 2: Sync account details
  SELECT sync_all_account_details() INTO updated_records;
  action := 'Sync Account Details';
  result := format('Updated %s records with latest account details', updated_records);
  RETURN NEXT;
  
  -- Fix 3: Recalculate all balances
  PERFORM recalculate_account_balance(a.id) 
  FROM public.accounts_real a;
  action := 'Recalculate Balances';
  result := 'Recalculated all account balances from transaction history';
  RETURN NEXT;
  
  -- Fix 4: Check remaining discrepancies
  SELECT COUNT(*) INTO discrepancy_count
  FROM balance_verification 
  WHERE ABS(difference) > 0.01;
  
  action := 'Final Verification';
  IF discrepancy_count = 0 THEN
    result := '✅ All balance issues resolved!';
  ELSE
    result := format('⚠️  %s accounts still have discrepancies - manual review needed', discrepancy_count);
  END IF;
  RETURN NEXT;
  
END;
$$;
