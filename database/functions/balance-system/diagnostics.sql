-- =====================================================================
-- BALANCE SYSTEM - DIAGNOSTIC FUNCTIONS
-- =====================================================================
-- Functions for diagnosing and monitoring balance system health
-- =====================================================================

-- =====================================================================
-- RUN_BALANCE_DIAGNOSTICS
-- =====================================================================
-- Purpose: Run comprehensive diagnostics on the balance system
-- Parameters: None
-- Returns: TABLE with diagnostic results for each check
-- =====================================================================

CREATE OR REPLACE FUNCTION run_balance_diagnostics()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  account_count INTEGER;
  balance_count INTEGER;
  missing_count INTEGER;
  discrepancy_count INTEGER;
  sync_issue_count INTEGER;
BEGIN
  -- Check 1: Account vs Balance record count
  SELECT COUNT(*) INTO account_count FROM public.accounts_real;
  SELECT COUNT(*) INTO balance_count FROM public.balance_real;
  
  check_name := 'Record Count Match';
  IF account_count = balance_count THEN
    status := '✅ PASS';
    details := format('Accounts: %s, Balance Records: %s', account_count, balance_count);
  ELSE
    status := '❌ FAIL';
    details := format('Accounts: %s, Balance Records: %s (MISMATCH)', account_count, balance_count);
  END IF;
  RETURN NEXT;
  
  -- Check 2: Missing balance records
  SELECT COUNT(*) INTO missing_count
  FROM public.accounts_real a
  LEFT JOIN public.balance_real b ON a.id = b.account_id
  WHERE b.account_id IS NULL;
  
  check_name := 'Missing Balance Records';
  IF missing_count = 0 THEN
    status := '✅ PASS';
    details := 'All accounts have balance records';
  ELSE
    status := '❌ FAIL';
    details := format('%s accounts missing balance records', missing_count);
  END IF;
  RETURN NEXT;
  
  -- Check 3: Balance discrepancies
  SELECT COUNT(*) INTO discrepancy_count
  FROM balance_verification 
  WHERE ABS(difference) > 0.01;
  
  check_name := 'Balance Accuracy';
  IF discrepancy_count = 0 THEN
    status := '✅ PASS';
    details := 'All balances match transaction history';
  ELSE
    status := '⚠️  WARNING';
    details := format('%s accounts have balance discrepancies', discrepancy_count);
  END IF;
  RETURN NEXT;
  
  -- Check 4: Data synchronization
  SELECT COUNT(*) INTO sync_issue_count
  FROM balance_verification 
  WHERE data_sync_status != 'OK';
  
  check_name := 'Data Synchronization';
  IF sync_issue_count = 0 THEN
    status := '✅ PASS';
    details := 'All denormalized data is synchronized';
  ELSE
    status := '⚠️  WARNING';
    details := format('%s accounts have data sync issues', sync_issue_count);
  END IF;
  RETURN NEXT;
  
  -- Check 5: Trigger existence
  check_name := 'Database Triggers';
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name IN ('trigger_create_balance_for_account', 'trigger_sync_balance_on_account_update', 'trigger_update_balance_from_transaction')
  ) THEN
    status := '✅ PASS';
    details := 'All required triggers are present';
  ELSE
    status := '❌ FAIL';
    details := 'Some required triggers are missing';
  END IF;
  RETURN NEXT;
  
END;
$$;

-- =====================================================================
-- BALANCE_VERIFICATION VIEW
-- =====================================================================
-- Purpose: View to check balance discrepancies between stored and calculated values
-- Note: This is referenced by the diagnostic functions above
-- =====================================================================

/*
CREATE OR REPLACE VIEW balance_verification AS
SELECT 
  a.id,
  a.name as account_name,
  a.type as account_type,
  br.current_balance as stored_balance,
  
  -- Calculate expected balance from transactions
  COALESCE(
    (SELECT SUM(amount) FROM transactions_real WHERE destination_account_id = a.id), 0
  ) - COALESCE(
    (SELECT SUM(amount) FROM transactions_real WHERE source_account_id = a.id), 0  
  ) as calculated_balance,
  
  -- Difference (should be 0 if everything is correct)
  br.current_balance - (
    COALESCE(
      (SELECT SUM(amount) FROM transactions_real WHERE destination_account_id = a.id), 0
    ) - COALESCE(
      (SELECT SUM(amount) FROM transactions_real WHERE source_account_id = a.id), 0
    )
  ) as difference,
  
  br.last_updated,
  
  -- Check if denormalized data is correct
  CASE 
    WHEN br.account_name != a.name THEN 'Name mismatch'
    WHEN br.account_type != a.type THEN 'Type mismatch'
    WHEN br.institution_name != a.institution THEN 'Institution mismatch'
    WHEN br.account_number != a.account_number THEN 'Account number mismatch'
    WHEN br.currency != COALESCE(a.currency, 'INR') THEN 'Currency mismatch'
    ELSE 'OK'
  END as data_sync_status
FROM public.accounts_real a
LEFT JOIN public.balance_real br ON a.id = br.account_id
ORDER BY a.name;
*/

-- =====================================================================
-- USAGE EXAMPLES
-- =====================================================================

/*
-- Run complete diagnostics
SELECT * FROM run_balance_diagnostics();

-- Check balance verification view
SELECT * FROM balance_verification WHERE difference != 0;

-- Fix all issues automatically
SELECT * FROM fix_all_balance_issues();

-- Check specific account balance
SELECT recalculate_account_balance('account-uuid-here');

-- Recalculate all balances and see changes
SELECT * FROM recalculate_all_balances();
*/
