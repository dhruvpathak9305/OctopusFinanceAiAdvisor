-- =====================================================================
-- BALANCE SYSTEM UTILITIES
-- =====================================================================
-- Maintenance and troubleshooting functions for the balance system
-- Use these for data integrity checks, recalculations, and debugging
-- =====================================================================

-- =====================================================================
-- UTILITY FUNCTIONS
-- =====================================================================

-- Function to recalculate a single account's balance from opening balance + transaction history
CREATE OR REPLACE FUNCTION recalculate_account_balance(account_uuid UUID)
RETURNS NUMERIC AS $$
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
$$ LANGUAGE plpgsql;

-- Function to recalculate ALL account balances and return summary
CREATE OR REPLACE FUNCTION recalculate_all_balances()
RETURNS TABLE(
  account_id UUID,
  account_name TEXT,
  old_balance NUMERIC,
  new_balance NUMERIC,
  difference NUMERIC
) AS $$
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
$$ LANGUAGE plpgsql;

-- Function to fix missing balance records
CREATE OR REPLACE FUNCTION fix_missing_balance_records()
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql;

-- Function to sync denormalized account details
CREATE OR REPLACE FUNCTION sync_all_account_details()
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql;

-- =====================================================================
-- VERIFICATION VIEWS
-- =====================================================================

-- View to check balance discrepancies
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

-- View for balance system health check
CREATE OR REPLACE VIEW balance_system_health AS
SELECT 
  'Total Accounts' as metric,
  COUNT(*)::TEXT as value
FROM public.accounts_real
UNION ALL
SELECT 
  'Total Balance Records' as metric,
  COUNT(*)::TEXT as value
FROM public.balance_real
UNION ALL
SELECT 
  'Missing Balance Records' as metric,
  COUNT(*)::TEXT as value
FROM public.accounts_real a
LEFT JOIN public.balance_real b ON a.id = b.account_id
WHERE b.account_id IS NULL
UNION ALL
SELECT 
  'Balance Discrepancies' as metric,
  COUNT(*)::TEXT as value
FROM balance_verification 
WHERE ABS(difference) > 0.01
UNION ALL
SELECT 
  'Data Sync Issues' as metric,
  COUNT(*)::TEXT as value
FROM balance_verification 
WHERE data_sync_status != 'OK'
UNION ALL
SELECT 
  'Total System Balance' as metric,
  COALESCE(SUM(current_balance), 0)::TEXT as value
FROM public.balance_real
UNION ALL
SELECT 
  'Last Balance Update' as metric,
  MAX(last_updated)::TEXT as value
FROM public.balance_real;

-- =====================================================================
-- DIAGNOSTIC FUNCTIONS
-- =====================================================================

-- Function to run complete system diagnostics
CREATE OR REPLACE FUNCTION run_balance_diagnostics()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
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
$$ LANGUAGE plpgsql;

-- =====================================================================
-- QUICK FIX FUNCTIONS
-- =====================================================================

-- Function to fix all common issues at once
CREATE OR REPLACE FUNCTION fix_all_balance_issues()
RETURNS TABLE(
  action TEXT,
  result TEXT
) AS $$
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
$$ LANGUAGE plpgsql;

-- =====================================================================
-- USAGE EXAMPLES
-- =====================================================================

/*

-- Example 1: Check system health
SELECT * FROM balance_system_health;

-- Example 2: Find balance discrepancies  
SELECT * FROM balance_verification WHERE ABS(difference) > 0.01;

-- Example 3: Run full diagnostics
SELECT * FROM run_balance_diagnostics();

-- Example 4: Fix all issues automatically
SELECT * FROM fix_all_balance_issues();

-- Example 5: Recalculate specific account balance
SELECT recalculate_account_balance('your-account-id-here');

-- Example 6: Recalculate all balances and see changes
SELECT * FROM recalculate_all_balances();

-- Example 7: Fix missing balance records only
SELECT fix_missing_balance_records();

-- Example 8: Sync denormalized data only
SELECT sync_all_account_details();

*/

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON FUNCTION recalculate_account_balance(UUID) IS 
'Recalculates current balance as: Opening Balance + Income - Expenses and updates balance_real table';

COMMENT ON FUNCTION recalculate_all_balances() IS 
'Recalculates all account balances and returns a summary of changes made';

COMMENT ON FUNCTION fix_missing_balance_records() IS 
'Creates balance_real records for accounts that are missing them';

COMMENT ON FUNCTION sync_all_account_details() IS 
'Updates all denormalized account details in balance_real from accounts_real';

COMMENT ON FUNCTION run_balance_diagnostics() IS 
'Runs comprehensive diagnostics on the balance system and reports issues';

COMMENT ON FUNCTION fix_all_balance_issues() IS 
'Automatically fixes common balance system issues in one operation';

COMMENT ON VIEW balance_verification IS 
'Shows account balances vs calculated balances to verify data integrity';

COMMENT ON VIEW balance_system_health IS 
'Provides an overview of balance system health metrics';

-- Success message
SELECT 'Balance system utilities installed successfully! Use run_balance_diagnostics() to check system health.' as status;
