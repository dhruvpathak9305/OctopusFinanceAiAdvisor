-- ============================================================================
-- Single-Entry Transfer System Verification
-- ============================================================================
-- Purpose: Verify that the single-entry transfer system is working correctly
-- Date: 2025-10-20
-- ============================================================================

\echo '================================================================================'
\echo 'SINGLE-ENTRY TRANSFER SYSTEM VERIFICATION'
\echo '================================================================================'
\echo ''

-- ============================================================================
-- Test 1: Verify No Duplicate Transfers
-- ============================================================================
\echo '=== TEST 1: Check for Duplicate Transfers ==='
\echo ''

SELECT 
    COUNT(*) as transfer_count,
    date,
    amount,
    upi_reference_number,
    CASE 
        WHEN COUNT(*) = 1 THEN '✅ No Duplicate'
        ELSE '❌ DUPLICATE FOUND'
    END as status
FROM transactions_real
WHERE date = '2025-09-08'
  AND type = 'transfer'
  AND amount IN (50000, 48000)
GROUP BY date, amount, upi_reference_number
ORDER BY amount DESC;

\echo ''

-- ============================================================================
-- Test 2: Verify ICICI Transactions (Sep 8)
-- ============================================================================
\echo '=== TEST 2: ICICI Transactions (Sep 8, 2025) ==='
\echo ''

SELECT 
    name,
    type,
    'outgoing' as expected_direction,
    amount,
    destination_account_name
FROM get_account_transactions('fd551095-58a9-4f12-b00e-2fd182e68403', 100, 0)
WHERE date = '2025-09-08'
  AND amount IN (50000, 48000)
ORDER BY amount DESC;

\echo ''
\echo 'Expected: 2 outgoing transfers (-₹50K, -₹48K)'
\echo ''

-- ============================================================================
-- Test 3: Verify IDFC Transactions (Sep 8)
-- ============================================================================
\echo '=== TEST 3: IDFC Transactions (Sep 8, 2025) ==='
\echo ''

SELECT 
    name,
    type,
    direction,
    amount,
    source_account_name
FROM get_account_transactions('328c756a-b05e-4925-a9ae-852f7fb18b4e', 100, 0)
WHERE date = '2025-09-08'
  AND type = 'transfer'
ORDER BY amount DESC;

\echo ''
\echo 'Expected: 2 incoming transfers (+₹50K, +₹48K)'
\echo ''

-- ============================================================================
-- Test 4: Verify Transaction Linking
-- ============================================================================
\echo '=== TEST 4: Verify Transfer Linking ==='
\echo ''

SELECT 
    t.id,
    t.name,
    t.amount,
    sa.name as from_account,
    da.name as to_account,
    CASE 
        WHEN sa.name = 'ICICI' AND da.name = 'IDFC Savings Account' THEN '✅ Linked'
        ELSE '❌ NOT LINKED'
    END as link_status
FROM transactions_real t
JOIN accounts_real sa ON t.source_account_id = sa.id
LEFT JOIN accounts_real da ON t.destination_account_id = da.id
WHERE t.date = '2025-09-08'
  AND t.type = 'transfer'
  AND t.amount IN (50000, 48000)
ORDER BY t.amount DESC;

\echo ''

-- ============================================================================
-- Test 5: Count Check
-- ============================================================================
\echo '=== TEST 5: Transaction Count Verification ==='
\echo ''

WITH transfer_counts AS (
    SELECT 
        'ICICI' as account,
        COUNT(*) as transfer_count
    FROM transactions_real
    WHERE source_account_id = 'fd551095-58a9-4f12-b00e-2fd182e68403'
      AND date = '2025-09-08'
      AND type = 'transfer'
      AND amount IN (50000, 48000)
    
    UNION ALL
    
    SELECT 
        'IDFC' as account,
        COUNT(*) as transfer_count
    FROM transactions_real
    WHERE destination_account_id = '328c756a-b05e-4925-a9ae-852f7fb18b4e'
      AND date = '2025-09-08'
      AND type = 'transfer'
      AND amount IN (50000, 48000)
)
SELECT 
    account,
    transfer_count,
    CASE 
        WHEN transfer_count = 2 THEN '✅ Correct (2 transfers)'
        ELSE '❌ INCORRECT'
    END as status
FROM transfer_counts;

\echo ''

-- ============================================================================
-- Test 6: Function Availability
-- ============================================================================
\echo '=== TEST 6: Verify Functions Exist ==='
\echo ''

SELECT 
    routine_name as function_name,
    '✅ Available' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
      'get_account_transactions',
      'calculate_account_balance',
      'get_account_balance_breakdown'
  )
ORDER BY routine_name;

\echo ''

-- ============================================================================
-- Test 7: Balance Calculation Test
-- ============================================================================
\echo '=== TEST 7: Balance Calculation Test ==='
\echo ''

SELECT 
    'ICICI' as account,
    calculate_account_balance('fd551095-58a9-4f12-b00e-2fd182e68403') as calculated_balance,
    (SELECT current_balance FROM accounts_real WHERE id = 'fd551095-58a9-4f12-b00e-2fd182e68403') as stored_balance
    
UNION ALL

SELECT 
    'IDFC' as account,
    calculate_account_balance('328c756a-b05e-4925-a9ae-852f7fb18b4e') as calculated_balance,
    (SELECT current_balance FROM accounts_real WHERE id = '328c756a-b05e-4925-a9ae-852f7fb18b4e') as stored_balance;

\echo ''
\echo 'Note: Differences are expected if initial_balance needs adjustment'
\echo ''

-- ============================================================================
-- Test 8: Detailed Balance Breakdown
-- ============================================================================
\echo '=== TEST 8: ICICI Balance Breakdown ==='
\echo ''

SELECT * FROM get_account_balance_breakdown('fd551095-58a9-4f12-b00e-2fd182e68403');

\echo ''
\echo '=== TEST 8b: IDFC Balance Breakdown ==='
\echo ''

SELECT * FROM get_account_balance_breakdown('328c756a-b05e-4925-a9ae-852f7fb18b4e');

\echo ''

-- ============================================================================
-- Final Summary
-- ============================================================================
\echo '================================================================================'
\echo 'VERIFICATION SUMMARY'
\echo '================================================================================'
\echo ''

WITH summary AS (
    SELECT 
        'No Duplicate Transfers' as check_name,
        CASE 
            WHEN COUNT(*) = 2 THEN '✅ PASS'
            ELSE '❌ FAIL'
        END as result
    FROM transactions_real
    WHERE date = '2025-09-08'
      AND type = 'transfer'
      AND amount IN (50000, 48000)
    GROUP BY date, amount
    HAVING COUNT(*) = 1
    
    UNION ALL
    
    SELECT 
        'ICICI Transfer Count' as check_name,
        CASE 
            WHEN COUNT(*) = 2 THEN '✅ PASS'
            ELSE '❌ FAIL'
        END as result
    FROM transactions_real
    WHERE source_account_id = 'fd551095-58a9-4f12-b00e-2fd182e68403'
      AND date = '2025-09-08'
      AND type = 'transfer'
      AND amount IN (50000, 48000)
    
    UNION ALL
    
    SELECT 
        'Transfer Linking' as check_name,
        CASE 
            WHEN COUNT(*) = 2 THEN '✅ PASS'
            ELSE '❌ FAIL'
        END as result
    FROM transactions_real
    WHERE source_account_id = 'fd551095-58a9-4f12-b00e-2fd182e68403'
      AND destination_account_id = '328c756a-b05e-4925-a9ae-852f7fb18b4e'
      AND date = '2025-09-08'
      AND type = 'transfer'
      AND amount IN (50000, 48000)
    
    UNION ALL
    
    SELECT 
        'Functions Available' as check_name,
        CASE 
            WHEN COUNT(*) = 3 THEN '✅ PASS'
            ELSE '❌ FAIL'
        END as result
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name IN (
          'get_account_transactions',
          'calculate_account_balance',
          'get_account_balance_breakdown'
      )
)
SELECT * FROM summary;

\echo ''
\echo '================================================================================'
\echo 'If all tests show ✅ PASS, the single-entry transfer system is working!'
\echo 'Next: Update app code using APP_CODE_UPDATE_CHECKLIST.md'
\echo '================================================================================'

