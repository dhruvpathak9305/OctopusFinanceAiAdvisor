-- ================================================================
-- POPULATE COMPLETE ACCOUNT METADATA
-- ================================================================
-- 
-- Purpose: Migrate all metadata from JSON files to database
-- Date: 2025-10-20
-- 
-- Accounts being updated:
--   1. HDFC Bank (c5b2eb82-1159-4710-8d5d-de16ee0e6233)
--   2. ICICI Bank (fd551095-58a9-4f12-b00e-2fd182e68403)
-- 
-- ================================================================

BEGIN;

-- ================================================================
-- UPDATE HDFC BANK ACCOUNT - Complete Metadata
-- ================================================================

UPDATE accounts_real
SET
    -- Account holder contact
    holder_email = 'dhruvpathak9305@gmail.com',
    holder_phone = '18002600 / 18001600',
    holder_father_name = 'Ashok Pathak',
    
    -- Account holder address
    holder_address_street = 'E-1/46, Sector B, Aliganj, Indira Park',
    holder_address_city = 'Lucknow',
    holder_address_state = 'Uttar Pradesh',
    holder_address_postal_code = '226024',
    holder_address_country = 'India',
    
    -- Branch address details
    branch_city = 'Kolkata',
    branch_state = 'West Bengal',
    branch_postal_code = '700102',
    branch_country = 'India',
    branch_code = '2058',
    
    -- Banking details
    gstin = '19AAACH2702H1ZX',
    overdraft_limit = 0.00,
    account_type_details = 'Virtual Preferred',
    
    -- Update timestamp
    updated_at = NOW()
    
WHERE id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233';

-- ================================================================
-- UPDATE ICICI BANK ACCOUNT - Complete Metadata
-- ================================================================

UPDATE accounts_real
SET
    -- Account holder contact (using same as HDFC since same holder)
    holder_email = 'dhruvpathak9305@gmail.com',
    holder_phone = '18002600 / 18001600',
    holder_father_name = 'Ashok Pathak',
    
    -- Account holder address (from ICICI statement)
    holder_address_street = 'E-146 Near Indira Park Sector-B Aliganj',
    holder_address_city = 'Lucknow',
    holder_address_state = 'Uttar Pradesh',
    holder_address_postal_code = '226024',
    holder_address_country = 'India',
    
    -- Branch address details (same as holder address for ICICI)
    branch_city = 'Lucknow',
    branch_state = 'Uttar Pradesh',
    branch_postal_code = '226024',
    branch_country = 'India',
    branch_code = '3881',
    
    -- Banking details
    gstin = NULL,  -- Not provided in ICICI statement
    overdraft_limit = 0.00,
    account_type_details = 'Savings Account',
    
    -- Update timestamp
    updated_at = NOW()
    
WHERE id = 'fd551095-58a9-4f12-b00e-2fd182e68403';

COMMIT;

-- ================================================================
-- VERIFICATION - Show updated accounts
-- ================================================================

SELECT 
    '=== HDFC BANK ACCOUNT ===' as section;

SELECT
    id,
    name,
    bank_holder_name,
    account_number,
    holder_email,
    holder_phone,
    holder_father_name,
    holder_address_street,
    holder_address_city || ', ' || holder_address_state || ' ' || holder_address_postal_code as holder_address,
    branch_name,
    branch_city || ', ' || branch_state || ' ' || branch_postal_code as branch_address,
    gstin,
    overdraft_limit,
    account_type_details,
    updated_at
FROM accounts_real
WHERE id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233';

SELECT 
    '=== ICICI BANK ACCOUNT ===' as section;

SELECT
    id,
    name,
    bank_holder_name,
    account_number,
    holder_email,
    holder_phone,
    holder_father_name,
    holder_address_street,
    holder_address_city || ', ' || holder_address_state || ' ' || holder_address_postal_code as holder_address,
    branch_name,
    branch_city || ', ' || branch_state || ' ' || branch_postal_code as branch_address,
    gstin,
    overdraft_limit,
    account_type_details,
    updated_at
FROM accounts_real
WHERE id = 'fd551095-58a9-4f12-b00e-2fd182e68403';

-- ================================================================
-- SUMMARY
-- ================================================================

SELECT
    '=== METADATA COVERAGE SUMMARY ===' as section;

SELECT
    name as account,
    CASE WHEN holder_email IS NOT NULL THEN '✅' ELSE '❌' END as email,
    CASE WHEN holder_phone IS NOT NULL THEN '✅' ELSE '❌' END as phone,
    CASE WHEN holder_father_name IS NOT NULL THEN '✅' ELSE '❌' END as father_name,
    CASE WHEN holder_address_street IS NOT NULL THEN '✅' ELSE '❌' END as address,
    CASE WHEN gstin IS NOT NULL THEN '✅' ELSE '❌' END as gstin,
    CASE WHEN account_type_details IS NOT NULL THEN '✅' ELSE '❌' END as type_details
FROM accounts_real
WHERE id IN ('c5b2eb82-1159-4710-8d5d-de16ee0e6233', 'fd551095-58a9-4f12-b00e-2fd182e68403')
ORDER BY name;

