-- ================================================================
-- UPDATE IDFC BANK ACCOUNT - COMPLETE METADATA
-- ================================================================
-- 
-- Purpose: Update IDFC account with complete metadata from Sept 2025 statement
-- Date: 2025-10-20
-- Account ID: 328c756a-b05e-4925-a9ae-852f7fb18b4e
-- 
-- ================================================================

BEGIN;

UPDATE accounts_real
SET
    -- Basic Account Information
    account_number = '10167677504',  -- Updated from statement
    bank_holder_name = 'Mr. Dhruv Pathak',
    crn = '5734305184',  -- Customer ID
    
    -- Account holder contact
    holder_email = 'dhruvpathak9305@gmail.com',
    holder_phone = '*******4408',
    holder_father_name = 'Ashok Pathak',  -- Same as other accounts
    
    -- Account holder address
    holder_address_street = 'E - 1 / 68 Near Indira Park Sector-B Aliganj',
    holder_address_city = 'Lucknow',
    holder_address_state = 'Uttar Pradesh',
    holder_address_postal_code = '226024',
    holder_address_country = 'India',
    
    -- Branch information
    branch_name = 'LUCKNOW - MUNSHIPULIA BRANCH',
    branch_address = 'UPPER GROUND FLOOR, 17/1, KM-1, SECTOR-17, INDIRA NAGAR, MUNSHIPULIA, LUCKNOW, UTTAR PRADESH - 226016',
    branch_city = 'Lucknow',
    branch_state = 'Uttar Pradesh',
    branch_postal_code = '226016',
    branch_country = 'India',
    branch_code = '1335',
    
    -- Banking details
    ifsc_code = 'I0FB0001335',
    micr_code = '226607001',
    account_opening_date = '2024-01-26',
    account_type_details = 'Saving Regular',
    account_category = 'savings',
    account_status = 'active',
    currency = 'INR',
    overdraft_limit = 0.00,
    
    -- Nomination details
    nomination_status = 'registered',
    nominee_name = 'Pushpa Pathak',
    nominee_relationship = NULL,  -- Not specified in statement
    
    -- Current status from Sept statement
    current_balance = 61061.82,
    last_sync = '2025-09-30',
    updated_at = NOW()
    
WHERE id = '328c756a-b05e-4925-a9ae-852f7fb18b4e';

COMMIT;

-- ================================================================
-- VERIFICATION - Show updated IDFC account
-- ================================================================

SELECT 
    '=== IDFC BANK ACCOUNT - UPDATED ===' as section;

SELECT
    id,
    name,
    bank_holder_name,
    account_number,
    crn as customer_id,
    holder_email,
    holder_phone,
    holder_father_name,
    holder_address_street || ', ' || holder_address_city || ', ' || 
    holder_address_state || ' ' || holder_address_postal_code as holder_address,
    branch_name,
    branch_city || ', ' || branch_state || ' ' || branch_postal_code as branch_address,
    ifsc_code,
    micr_code,
    account_type_details,
    account_opening_date,
    nomination_status,
    nominee_name,
    current_balance,
    last_sync,
    updated_at
FROM accounts_real
WHERE id = '328c756a-b05e-4925-a9ae-852f7fb18b4e';

-- ================================================================
-- METADATA COVERAGE CHECK
-- ================================================================

SELECT
    '=== METADATA COMPLETENESS ===' as section;

SELECT
    name as account,
    CASE WHEN holder_email IS NOT NULL THEN '✅' ELSE '❌' END as email,
    CASE WHEN holder_phone IS NOT NULL THEN '✅' ELSE '❌' END as phone,
    CASE WHEN holder_father_name IS NOT NULL THEN '✅' ELSE '❌' END as father_name,
    CASE WHEN holder_address_street IS NOT NULL THEN '✅' ELSE '❌' END as address,
    CASE WHEN ifsc_code IS NOT NULL THEN '✅' ELSE '❌' END as ifsc,
    CASE WHEN account_type_details IS NOT NULL THEN '✅' ELSE '❌' END as type_details,
    CASE WHEN nominee_name IS NOT NULL THEN '✅' ELSE '❌' END as nominee
FROM accounts_real
WHERE id = '328c756a-b05e-4925-a9ae-852f7fb18b4e';

