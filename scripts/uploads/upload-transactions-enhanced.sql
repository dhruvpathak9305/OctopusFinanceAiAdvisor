-- =====================================================================
-- ENHANCED BULK UPLOAD SCRIPT WITH DUPLICATE PREVENTION
-- =====================================================================
-- This script uses the enhanced features:
-- 1. Account enhancements (RM details, nomination, balance tracking)
-- 2. Duplicate prevention (transaction hash, bank references)
-- 3. Fixed deposits, statements, and merchants
-- =====================================================================

-- User ID
\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'

-- Account ID for ICICI Savings
\set account_id 'fd551095-58a9-4f12-b00e-2fd182e68403'

\echo '========================================='
\echo 'Starting Enhanced Bulk Upload Process'
\echo '========================================='
\echo ''

-- =====================================================================
-- STEP 1: UPDATE ACCOUNT WITH ENHANCEMENTS
-- =====================================================================

\echo 'Step 1: Updating account with enhanced fields...'

UPDATE accounts_real
SET 
  account_number = '388101502899',
  bank_holder_name = 'MR. DHRUV PATHAK',
  branch_address = 'E - 146 NEAR INDIRA PARK SECTOR - B ALIGANJ, LUCKNOW, UTTAR PRADESH - 226024',
  institution = 'ICICI Bank',
  ifsc_code = 'ICIC0003881',
  micr_code = '700229137',
  currency = 'INR',
  type = 'savings',
  crn = 'XXXXXX7947',
  current_balance = 5525174.87, -- Latest balance from September statement
  nomination_status = 'registered',
  account_status = 'active',
  account_category = 'savings',
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{statement_update}',
    jsonb_build_object(
      'last_statement_period', 'September 2025',
      'last_statement_closing_balance', 5525174.87,
      'linked_fd_value', 520714.00,
      'total_balance', 6045888.67,
      'updated_date', '2025-10-18'
    )
  ),
  updated_at = NOW()
WHERE id = :'account_id'
  AND user_id = :'user_id';

\echo '✅ Account updated successfully'
\echo ''

-- =====================================================================
-- STEP 2: INSERT FIXED DEPOSIT
-- =====================================================================

\echo 'Step 2: Inserting/Updating Fixed Deposit...'

INSERT INTO fixed_deposits_real (
  user_id,
  account_id,
  deposit_number,
  deposit_name,
  principal_amount,
  interest_rate,
  interest_type,
  interest_payout_frequency,
  period_months,
  opening_date,
  maturity_date,
  maturity_amount,
  current_value,
  interest_accrued,
  status,
  auto_renewal,
  nomination_status,
  institution,
  branch_name,
  linked_account_number,
  premature_withdrawal_penalty,
  tds_applicable,
  metadata
) VALUES (
  :'user_id',
  :'account_id',
  '388113E+11',
  'ICICI Fixed Deposit - 15 Months',
  500000.00,
  7.25,
  'simple',
  'quarterly',
  15,
  '2024-08-09',
  '2025-08-12',
  546985.00,
  520714.00,
  20714.00,
  'active',
  false,
  'registered',
  'ICICI Bank',
  'Lucknow, Uttar Pradesh',
  '388101502899',
  1.00,
  true,
  jsonb_build_object(
    'statement_period', 'September 2025',
    'customer_id', 'XXXXXX7947',
    'customer_name', 'MR.DHRUV PATHAK',
    'ifsc_code', 'ICIC0003881',
    'micr_code', '700229137',
    'upload_source', 'enhanced_bulk_upload',
    'upload_date', '2025-10-18'
  )
)
ON CONFLICT ON CONSTRAINT fixed_deposits_real_pkey 
DO UPDATE SET
  current_value = EXCLUDED.current_value,
  interest_accrued = EXCLUDED.interest_accrued,
  status = EXCLUDED.status,
  updated_at = NOW();

\echo '✅ Fixed Deposit inserted/updated'
\echo ''

-- =====================================================================
-- STEP 3: INSERT ACCOUNT STATEMENT METADATA
-- =====================================================================

\echo 'Step 3: Recording statement metadata...'

INSERT INTO account_statements_real (
  user_id,
  account_id,
  statement_period_start,
  statement_period_end,
  statement_type,
  statement_format,
  opening_balance,
  closing_balance,
  total_deposits,
  total_withdrawals,
  total_credits,
  total_debits,
  transaction_count,
  file_name,
  upload_date,
  processed_date,
  status,
  processing_method,
  institution,
  account_number,
  account_type,
  customer_id,
  interest_earned,
  fees_charged,
  fixed_deposits_linked,
  notes,
  tags,
  metadata
) VALUES (
  :'user_id',
  :'account_id',
  '2025-09-01',
  '2025-09-30',
  'savings',
  'excel',
  5381584.77, -- Opening balance on Sep 1
  5525174.87, -- Closing balance on Sep 30
  261244.53,  -- Total deposits (credits)
  117654.43,  -- Total withdrawals (debits)
  261244.53,
  117654.43,
  10,         -- Number of transactions
  'ICICI_Statement_September_2025.xlsx',
  NOW(),
  NOW(),
  'processing', -- Will be updated to 'processed' after transactions insert
  'chatgpt',
  'ICICI Bank',
  'XXXXXXXXX2899',
  'Savings A/c',
  'XXXXXX7947',
  32583.00,   -- FD Interest earned
  0,
  520714.00,  -- FD value linked
  'September 2025 statement - includes salary, FD interest, and transfers to IDFC',
  ARRAY['september', '2025', 'salary-month', 'fd-interest'],
  jsonb_build_object(
    'customer_name', 'MR. DHRUV PATHAK',
    'savings_account_balance', 5525174.87,
    'fixed_deposits_balance', 520714.00,
    'total_balance', 6045888.67,
    'ifsc_code', 'ICIC0003881',
    'micr_code', '700229137',
    'upload_source', 'enhanced_bulk_upload'
  )
)
ON CONFLICT (user_id, account_id, statement_period_start, statement_period_end) 
DO UPDATE SET
  status = 'processing',
  updated_at = NOW();

\echo '✅ Statement metadata recorded'
\echo ''

-- =====================================================================
-- STEP 4: INSERT MERCHANTS
-- =====================================================================

\echo 'Step 4: Inserting/Updating merchants...'

-- PolicyBazaar
INSERT INTO merchants_real (
  merchant_name, merchant_name_variations, merchant_display_name,
  merchant_type, merchant_category, industry, brand_color, website,
  is_recurring_merchant, typical_transaction_frequency,
  upi_vpa_patterns, description_patterns, is_verified, is_user_created
) VALUES (
  'PolicyBazaar',
  ARRAY['Policy Bazaar', 'POLICYBAZAAR', 'PolicyBazaar.com'],
  'PolicyBazaar', 'online', 'insurance', 'insurance',
  '#3654ff', 'https://www.policybazaar.com', false, 'yearly',
  ARRAY['policybazaar@', '@policybazaar'],
  ARRAY['POLICYBAZAAR', 'POLICY BAZAR', 'Deptm-'],
  true, false
)
ON CONFLICT (merchant_name) DO NOTHING;

-- Apple
INSERT INTO merchants_real (
  merchant_name, merchant_name_variations, merchant_display_name,
  merchant_type, merchant_category, industry, brand_color, website,
  is_recurring_merchant, typical_transaction_frequency,
  upi_vpa_patterns, description_patterns, is_verified, is_user_created
) VALUES (
  'Apple',
  ARRAY['Apple Services', 'APPLE', 'Apple.com', 'Apple Inc'],
  'Apple', 'subscription', 'entertainment', 'digital_services',
  '#000000', 'https://www.apple.com', true, 'monthly',
  ARRAY['@apple', 'apple@'],
  ARRAY['APPLE', 'Apple Ser', 'MandateReq'],
  true, false
)
ON CONFLICT (merchant_name) DO NOTHING;

-- VIM Global Technology Services
INSERT INTO merchants_real (
  merchant_name, merchant_name_variations, merchant_display_name,
  merchant_type, merchant_category, industry,
  is_recurring_merchant, typical_transaction_frequency,
  description_patterns, user_notes, is_favorite, is_verified, is_user_created
) VALUES (
  'VIM Global Technology Services',
  ARRAY['VIM GLOBAL', 'GTS', 'VIM Global Tech'],
  'VIM Global Technology Services', 'service', 'salary', 'employer',
  true, 'monthly',
  ARRAY['VIM GLOBAL TECHNOLOGY SERVICES', 'GTS SALARY PAY'],
  'Employer - monthly salary', true, true, false
)
ON CONFLICT (merchant_name) DO NOTHING;

\echo '✅ Merchants inserted/updated'
\echo ''

-- =====================================================================
-- STEP 5: BULK INSERT TRANSACTIONS WITH DUPLICATE CHECK
-- =====================================================================

\echo 'Step 5: Inserting transactions with duplicate detection...'
\echo 'This may take a moment...'
\echo ''

SELECT * FROM bulk_insert_transactions_with_duplicate_check('[
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Credit Card Payment",
    "description": "ATD/Auto Debit CC0xx0318",
    "amount": 13701.2,
    "date": "2025-09-07T00:00:00Z",
    "type": "expense",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "destination_account_type": "credit_card",
    "destination_account_name": "ICICI Credit Card",
    "merchant": null,
    "is_recurring": false,
    "metadata": {
      "bank_reference": "CC0318",
      "original_description": "ATD/Auto Debit CC0xx0318",
      "balance_after_transaction": 5367883.57,
      "bank_name": "ICICI",
      "statement_period": "September 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "PolicyBazaar Insurance Payment",
    "description": "UPI/PolicyBazaar/Deptm-87354850/SBIIPSB33SUPR583E5/YES BANK/525102198668/PAYTM56908802023314586303812925090807",
    "amount": 2230,
    "date": "2025-09-08T00:00:00Z",
    "type": "expense",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "merchant": "PolicyBazaar",
    "is_recurring": false,
    "metadata": {
      "bank_reference": "525102198668",
      "upi_reference": "PAYTM56908802023314586303812925090807",
      "original_description": "UPI/PolicyBazaar/Deptm-87354850/SBIIPSB33SUPR583E5/YES BANK/525102198668/PAYTM56908802023314586303812925090807",
      "balance_after_transaction": 5365653.57,
      "bank_name": "ICICI",
      "statement_period": "September 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Transfer to IDFC FIRST",
    "description": "UPI/Dhruv Path/97156440069@ybl/Self trans/IDFC FIRST/279045882515/AXIIUP59037399627697688436492955336",
    "amount": 50000,
    "date": "2025-09-08T00:00:00Z",
    "type": "transfer",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "destination_account_type": "bank",
    "destination_account_name": "IDFC FIRST Bank",
    "is_recurring": false,
    "metadata": {
      "bank_reference": "279045882515",
      "upi_reference": "AXIIUP59037399627697688436492955336",
      "original_description": "UPI/Dhruv Path/97156440069@ybl/Self trans/IDFC FIRST/279045882515/AXIIUP59037399627697688436492955336",
      "balance_after_transaction": 5315653.57,
      "bank_name": "ICICI",
      "statement_period": "September 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Transfer to IDFC FIRST",
    "description": "UPI/Dhruv Path/97156440069@ybl/Self trans/IDFC FIRST/279145882515/AXIIUP13826988323917184867926106272",
    "amount": 48000,
    "date": "2025-09-08T00:00:00Z",
    "type": "transfer",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "destination_account_type": "bank",
    "destination_account_name": "IDFC FIRST Bank",
    "is_recurring": false,
    "metadata": {
      "bank_reference": "279145882515",
      "upi_reference": "AXIIUP13826988323917184867926106272",
      "original_description": "UPI/Dhruv Path/97156440069@ybl/Self trans/IDFC FIRST/279145882515/AXIIUP13826988323917184867926106272",
      "balance_after_transaction": 5267653.57,
      "bank_name": "ICICI",
      "statement_period": "September 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Apple Services Subscription",
    "description": "UPI/Apple Ser/vices/services./MandateReq/ICICI Bank/524813089864/JClCdub8f1455e27414b6e5986ee90ecb066",
    "amount": 179,
    "date": "2025-09-11T00:00:00Z",
    "type": "expense",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "merchant": "Apple",
    "is_recurring": true,
    "metadata": {
      "bank_reference": "524813089864",
      "upi_reference": "JClCdub8f1455e27414b6e5986ee90ecb066",
      "original_description": "UPI/Apple Ser/vices/services./MandateReq/ICICI Bank/524813089864/JClCdub8f1455e27414b6e5986ee90ecb066",
      "balance_after_transaction": 5267474.57,
      "bank_name": "ICICI",
      "statement_period": "September 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Payment to Rakesh M",
    "description": "UPI/RAKESH M/Qkd/ees/m4@okaxis.cb/INDIAN OYF/522789068513/JClC3c12s6af9bc44857b2a4f6Bkcacce97a8f/",
    "amount": 420,
    "date": "2025-09-14T00:00:00Z",
    "type": "expense",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "destination_account_type": "digital_wallet",
    "is_recurring": false,
    "metadata": {
      "bank_reference": "522789068513",
      "upi_reference": "JClC3c12s6af9bc44857b2a4f6Bkcacce97a8f",
      "original_description": "UPI/RAKESH M/Qkd/ees/m4@okaxis.cb/INDIAN OYF/522789068513/JClC3c12s6af9bc44857b2a4f6Bkcacce97a8f/",
      "balance_after_transaction": 5267054.57,
      "bank_name": "ICICI",
      "statement_period": "September 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Payment from Shivam Kumar",
    "description": "UPI/SHIVAM KUM/Ashvam/0296-1@u/UPHDFCHC BANK/111826104977/15P2ebda67309944d1aa8737d3b7826b2ac1",
    "amount": 2780.53,
    "date": "2025-09-27T00:00:00Z",
    "type": "income",
    "source_account_type": "digital_wallet",
    "destination_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "destination_account_type": "bank",
    "destination_account_name": "ICICI Savings Account",
    "is_recurring": false,
    "metadata": {
      "bank_reference": "111826104977",
      "upi_reference": "15P2ebda67309944d1aa8737d3b7826b2ac1",
      "original_description": "UPI/SHIVAM KUM/Ashvam/0296-1@u/UPHDFCHC BANK/111826104977/15P2ebda67309944d1aa8737d3b7826b2ac1",
      "balance_after_transaction": 5269835.1,
      "bank_name": "ICICI",
      "statement_period": "September 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Salary Credit",
    "description": "NEFT-GITINS2025030332689904-VIM GLOBAL TECHNOLOGY SERVICES |P | -GTS SALARY PAY SEP25-0520551016-CIT",
    "amount": 225881,
    "date": "2025-09-30T00:00:00Z",
    "type": "income",
    "source_account_type": "bank",
    "source_account_name": "VIM Global Technology Services",
    "destination_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "destination_account_type": "bank",
    "destination_account_name": "ICICI Savings Account",
    "merchant": "VIM Global Technology Services",
    "is_recurring": true,
    "metadata": {
      "bank_reference": "0520551016",
      "neft_reference": "GITINS2025030332689904",
      "original_description": "NEFT-GITINS2025030332689904-VIM GLOBAL TECHNOLOGY SERVICES |P | -GTS SALARY PAY SEP25-0520551016-CIT",
      "balance_after_transaction": 5495616.1,
      "bank_name": "ICICI",
      "statement_period": "September 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Credit Card Payment",
    "description": "ATD/Auto Debit CC0xx0640",
    "amount": 3224.43,
    "date": "2025-09-30T00:00:00Z",
    "type": "expense",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "destination_account_type": "credit_card",
    "destination_account_name": "ICICI Credit Card",
    "is_recurring": false,
    "metadata": {
      "bank_reference": "CC0640",
      "original_description": "ATD/Auto Debit CC0xx0640",
      "balance_after_transaction": 5492391.67,
      "bank_name": "ICICI",
      "statement_period": "September 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Fixed Deposit Interest",
    "description": "388101502899/int. Pd-30 06 2025 to 29-09 2025",
    "amount": 32583,
    "date": "2025-09-30T00:00:00Z",
    "type": "income",
    "source_account_type": "investment",
    "source_account_name": "ICICI Fixed Deposit",
    "destination_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "destination_account_type": "bank",
    "destination_account_name": "ICICI Savings Account",
    "is_recurring": true,
    "metadata": {
      "bank_reference": "388101502899",
      "original_description": "388101502899/int. Pd-30 06 2025 to 29-09 2025",
      "balance_after_transaction": 5525174.87,
      "bank_name": "ICICI",
      "statement_period": "September 2025",
      "interest_period": "30-06-2025 to 29-09-2025",
      "fd_number": "388101502899"
    }
  }
]'::jsonb);

\echo ''
\echo '========================================='

-- =====================================================================
-- STEP 6: UPDATE STATEMENT STATUS
-- =====================================================================

\echo 'Step 6: Updating statement status...'

UPDATE account_statements_real
SET 
  status = 'processed',
  processed_date = NOW(),
  transactions_inserted = (
    SELECT COUNT(*)
    FROM transactions_real
    WHERE user_id = :'user_id'
      AND date BETWEEN '2025-09-01' AND '2025-09-30'
  ),
  updated_at = NOW()
WHERE user_id = :'user_id'
  AND account_id = :'account_id'
  AND statement_period_start = '2025-09-01'
  AND statement_period_end = '2025-09-30';

\echo '✅ Statement status updated'
\echo ''

-- =====================================================================
-- STEP 7: SYNC ACCOUNT CURRENT BALANCE
-- =====================================================================

\echo 'Step 7: Syncing account current balance...'

SELECT sync_account_current_balance(:'account_id');

\echo '✅ Account balance synced'
\echo ''

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

\echo '========================================='
\echo 'VERIFICATION RESULTS'
\echo '========================================='
\echo ''

\echo '📊 Transaction Summary:'
SELECT 
  COUNT(*) as total_transactions,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
  SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END) as total_transfers
FROM transactions_real
WHERE user_id = :'user_id'
  AND date BETWEEN '2025-09-01' AND '2025-09-30';

\echo ''
\echo '🏦 Account Details:'
SELECT 
  name,
  account_number,
  current_balance,
  nomination_status,
  account_status
FROM accounts_real
WHERE id = :'account_id';

\echo ''
\echo '💰 Fixed Deposit:'
SELECT 
  deposit_number,
  principal_amount,
  interest_rate,
  current_value,
  maturity_amount,
  status
FROM fixed_deposits_real
WHERE user_id = :'user_id';

\echo ''
\echo '📄 Statement:'
SELECT 
  statement_period_start,
  statement_period_end,
  opening_balance,
  closing_balance,
  transaction_count,
  transactions_inserted,
  status
FROM account_statements_real
WHERE user_id = :'user_id'
  AND statement_period_start = '2025-09-01';

\echo ''
\echo '========================================='
\echo '✅ UPLOAD COMPLETE!'
\echo '========================================='
\echo ''
\echo 'Summary:'
\echo '  ✅ Account updated with enhancements'
\echo '  ✅ Fixed deposit recorded'
\echo '  ✅ Statement metadata saved'
\echo '  ✅ Merchants created'
\echo '  ✅ Transactions inserted (with duplicate detection)'
\echo '  ✅ Account balance synced'
\echo ''
\echo '🔒 Duplicate Prevention Active:'
\echo '  - Transaction hashes generated'
\echo '  - Bank references stored'
\echo '  - UPI/NEFT references captured'
\echo '  - Re-uploading will auto-detect duplicates'
\echo ''
\echo '🎯 Next Steps:'
\echo '  1. Review data in Supabase dashboard'
\echo '  2. Link transactions to categories'
\echo '  3. Add Relationship Manager details (optional)'
\echo '  4. Upload next month statement'
\echo ''

