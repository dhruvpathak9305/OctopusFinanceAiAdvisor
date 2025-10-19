-- =====================================================================
-- COMPLETE BULK UPLOAD SCRIPT FOR SEPTEMBER 2025 STATEMENT
-- =====================================================================
-- This script uploads transactions, fixed deposits, statement metadata,
-- and merchants all in one go
-- =====================================================================

-- User ID (replace if different)
\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'

-- Account ID for ICICI Savings (get from accounts_real table)
-- SELECT id FROM accounts_real WHERE user_id = :'user_id' AND name = 'ICICI Savings Account';
\set account_id 'fd551095-58a9-4f12-b00e-2fd182e68403'

-- =====================================================================
-- STEP 1: INSERT FIXED DEPOSIT
-- =====================================================================

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
  'XXXXXXXXX2899',
  1.00,
  true,
  '{
    "statement_period": "September 2025",
    "customer_id": "XXXXXX7947",
    "customer_name": "MR.DHRUV PATHAK",
    "address": "E - 146 NEAR INDIRA PARKSECTOR -B ALIGANJ, LUCKNOW, UTTAR PRADESH-INDIA - 226024",
    "linked_payback_number": "My Savings REWARD",
    "ifsc_code": "ICIC0003881",
    "micr_code": "700229137",
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "2025-10-18"
  }'::jsonb
)
ON CONFLICT (user_id, deposit_number) DO UPDATE 
SET 
  current_value = EXCLUDED.current_value,
  interest_accrued = EXCLUDED.interest_accrued,
  updated_at = NOW();

-- =====================================================================
-- STEP 2: INSERT ACCOUNT STATEMENT METADATA
-- =====================================================================

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
  transactions_inserted,
  transactions_failed,
  validation_errors,
  duplicate_transactions,
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
  5381584.77,
  5525174.87,
  261244.53,
  117654.43,
  261244.53,
  117654.43,
  10,
  'ICICI_Statement_September_2025.xlsx',
  NOW(),
  NOW(),
  'processed',
  'chatgpt',
  10,
  0,
  '[]'::jsonb,
  0,
  'ICICI Bank',
  'XXXXXXXXX2899',
  'Savings A/c',
  'XXXXXX7947',
  32583.00,
  0,
  520714.00,
  'September 2025 statement - includes salary, FD interest, and transfers to IDFC',
  ARRAY['september', '2025', 'salary-month', 'fd-interest'],
  '{
    "customer_name": "MR. DHRUV PATHAK",
    "address": "E - 146 NEAR INDIRA PARKSECTOR -B ALIGANJ",
    "city": "LUCKNOW",
    "state": "UTTAR PRADESH",
    "pincode": "226024",
    "savings_account_balance": 5525174.67,
    "fixed_deposits_balance": 520714.00,
    "total_savings_balance": 6045888.67,
    "ifsc_code": "ICIC0003881",
    "micr_code": "700229137",
    "linked_payback_number": "My Savings REWARD",
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "2025-10-18"
  }'::jsonb
)
ON CONFLICT (user_id, account_id, statement_period_start, statement_period_end) DO UPDATE
SET
  status = 'processed',
  processed_date = NOW(),
  transactions_inserted = EXCLUDED.transactions_inserted,
  updated_at = NOW();

-- =====================================================================
-- STEP 3: INSERT MERCHANTS
-- =====================================================================

-- PolicyBazaar
INSERT INTO merchants_real (
  merchant_name,
  merchant_name_variations,
  merchant_display_name,
  merchant_type,
  merchant_category,
  industry,
  brand_color,
  website,
  is_recurring_merchant,
  typical_transaction_frequency,
  average_transaction_amount,
  transaction_count,
  upi_vpa_patterns,
  description_patterns,
  is_verified,
  is_user_created,
  metadata
) VALUES (
  'PolicyBazaar',
  ARRAY['Policy Bazaar', 'POLICYBAZAAR', 'PolicyBazaar.com'],
  'PolicyBazaar',
  'online',
  'insurance',
  'insurance',
  '#3654ff',
  'https://www.policybazaar.com',
  false,
  'yearly',
  2230.00,
  1,
  ARRAY['policybazaar@', '@policybazaar'],
  ARRAY['POLICYBAZAAR', 'POLICY BAZAR', 'Deptm-'],
  true,
  false,
  '{
    "bank_references": ["525102198668"],
    "payment_methods": ["UPI"],
    "statement_period": "September 2025"
  }'::jsonb
)
ON CONFLICT (merchant_name) DO UPDATE
SET
  transaction_count = merchants_real.transaction_count + 1,
  total_spent = merchants_real.total_spent + 2230.00,
  last_transaction_date = '2025-09-08',
  updated_at = NOW();

-- Apple
INSERT INTO merchants_real (
  merchant_name,
  merchant_name_variations,
  merchant_display_name,
  merchant_type,
  merchant_category,
  industry,
  brand_color,
  website,
  is_recurring_merchant,
  typical_transaction_frequency,
  average_transaction_amount,
  transaction_count,
  upi_vpa_patterns,
  description_patterns,
  is_verified,
  is_user_created,
  metadata
) VALUES (
  'Apple',
  ARRAY['Apple Services', 'APPLE', 'Apple.com', 'Apple Inc'],
  'Apple',
  'subscription',
  'entertainment',
  'digital_services',
  '#000000',
  'https://www.apple.com',
  true,
  'monthly',
  179.00,
  1,
  ARRAY['@apple', 'apple@'],
  ARRAY['APPLE', 'Apple Ser', 'MandateReq'],
  true,
  false,
  '{
    "bank_references": ["524813089864"],
    "payment_methods": ["UPI", "Auto Debit"],
    "statement_period": "September 2025"
  }'::jsonb
)
ON CONFLICT (merchant_name) DO NOTHING;

-- VIM Global Technology Services
INSERT INTO merchants_real (
  merchant_name,
  merchant_name_variations,
  merchant_display_name,
  merchant_type,
  merchant_category,
  industry,
  is_recurring_merchant,
  typical_transaction_frequency,
  average_transaction_amount,
  transaction_count,
  description_patterns,
  user_notes,
  is_favorite,
  is_verified,
  is_user_created,
  metadata
) VALUES (
  'VIM Global Technology Services',
  ARRAY['VIM GLOBAL', 'GTS', 'VIM Global Tech'],
  'VIM Global Technology Services',
  'service',
  'salary',
  'employer',
  true,
  'monthly',
  225881.00,
  1,
  ARRAY['VIM GLOBAL TECHNOLOGY SERVICES', 'GTS SALARY PAY'],
  'Employer - monthly salary',
  true,
  true,
  false,
  '{
    "bank_references": ["0520551016"],
    "payment_methods": ["NEFT"],
    "statement_period": "September 2025",
    "transaction_type": "income"
  }'::jsonb
)
ON CONFLICT (merchant_name) DO NOTHING;

-- =====================================================================
-- STEP 4: INSERT TRANSACTIONS
-- =====================================================================

INSERT INTO transactions_real (
  user_id,
  name,
  description,
  amount,
  date,
  type,
  source_account_type,
  source_account_name,
  destination_account_type,
  destination_account_name,
  merchant,
  is_credit_card,
  metadata
) VALUES
-- Transaction 1: Credit Card Payment (7/9/25)
(
  :'user_id',
  'Credit Card Payment',
  'ATD/Auto Debit CC0xx0318',
  13701.2,
  '2025-09-07',
  'expense',
  'bank',
  'ICICI Savings Account',
  'credit_card',
  'ICICI Credit Card',
  null,
  true,
  '{
    "bank_reference": "CC0318",
    "original_description": "ATD/Auto Debit CC0xx0318",
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "2025-10-18",
    "account_last_four": "2899",
    "balance_after_transaction": 5367883.57,
    "bank_name": "ICICI",
    "statement_period": "September 2025"
  }'::jsonb
),
-- Transaction 2: PolicyBazaar Payment (8/9/25)
(
  :'user_id',
  'PolicyBazaar Insurance Payment',
  'UPI/PolicyBazaar/Deptm-87354850/SBIIPSB33SUPR583E5/YES BANK/525102198668/PAYTM56908802023314586303812925090807',
  2230,
  '2025-09-08',
  'expense',
  'bank',
  'ICICI Savings Account',
  null,
  null,
  'PolicyBazaar',
  false,
  '{
    "bank_reference": "525102198668",
    "original_description": "UPI/PolicyBazaar/Deptm-87354850/SBIIPSB33SUPR583E5/YES BANK/525102198668/PAYTM56908802023314586303812925090807",
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "2025-10-18",
    "account_last_four": "2899",
    "balance_after_transaction": 5365653.57,
    "bank_name": "ICICI",
    "statement_period": "September 2025"
  }'::jsonb
),
-- Transaction 3: Transfer to IDFC #1 (8/9/25)
(
  :'user_id',
  'Transfer to IDFC FIRST',
  'UPI/Dhruv Path/97156440069@ybl/Self trans/IDFC FIRST/279045882515/AXIIUP59037399627697688436492955336',
  50000,
  '2025-09-08',
  'transfer',
  'bank',
  'ICICI Savings Account',
  'bank',
  'IDFC FIRST Bank',
  null,
  false,
  '{
    "bank_reference": "279045882515",
    "original_description": "UPI/Dhruv Path/97156440069@ybl/Self trans/IDFC FIRST/279045882515/AXIIUP59037399627697688436492955336",
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "2025-10-18",
    "account_last_four": "2899",
    "balance_after_transaction": 5315653.57,
    "bank_name": "ICICI",
    "statement_period": "September 2025"
  }'::jsonb
),
-- Transaction 4: Transfer to IDFC #2 (8/9/25)
(
  :'user_id',
  'Transfer to IDFC FIRST',
  'UPI/Dhruv Path/97156440069@ybl/Self trans/IDFC FIRST/279145882515/AXIIUP13826988323917184867926106272',
  48000,
  '2025-09-08',
  'transfer',
  'bank',
  'ICICI Savings Account',
  'bank',
  'IDFC FIRST Bank',
  null,
  false,
  '{
    "bank_reference": "279145882515",
    "original_description": "UPI/Dhruv Path/97156440069@ybl/Self trans/IDFC FIRST/279145882515/AXIIUP13826988323917184867926106272",
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "2025-10-18",
    "account_last_four": "2899",
    "balance_after_transaction": 5267653.57,
    "bank_name": "ICICI",
    "statement_period": "September 2025"
  }'::jsonb
),
-- Transaction 5: Apple Services (11/9/25)
(
  :'user_id',
  'Apple Services Subscription',
  'UPI/Apple Ser/vices/services./MandateReq/ICICI Bank/524813089864/JClCdub8f1455e27414b6e5986ee90ecb066',
  179,
  '2025-09-11',
  'expense',
  'bank',
  'ICICI Savings Account',
  null,
  null,
  'Apple',
  false,
  '{
    "bank_reference": "524813089864",
    "original_description": "UPI/Apple Ser/vices/services./MandateReq/ICICI Bank/524813089864/JClCdub8f1455e27414b6e5986ee90ecb066",
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "2025-10-18",
    "account_last_four": "2899",
    "balance_after_transaction": 5267474.57,
    "bank_name": "ICICI",
    "statement_period": "September 2025"
  }'::jsonb
),
-- Transaction 6: Payment to Rakesh M (14/9/25)
(
  :'user_id',
  'Payment to Rakesh M',
  'UPI/RAKESH M/Qkd/ees/m4@okaxis.cb/INDIAN OYF/522789068513/JClC3c12s6af9bc44857b2a4f6Bkcacce97a8f/',
  420,
  '2025-09-14',
  'expense',
  'bank',
  'ICICI Savings Account',
  'digital_wallet',
  null,
  null,
  false,
  '{
    "bank_reference": "522789068513",
    "original_description": "UPI/RAKESH M/Qkd/ees/m4@okaxis.cb/INDIAN OYF/522789068513/JClC3c12s6af9bc44857b2a4f6Bkcacce97a8f/",
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "2025-10-18",
    "account_last_four": "2899",
    "balance_after_transaction": 5267054.57,
    "bank_name": "ICICI",
    "statement_period": "September 2025"
  }'::jsonb
),
-- Transaction 7: Payment from Shivam Kumar (27/9/25)
(
  :'user_id',
  'Payment from Shivam Kumar',
  'UPI/SHIVAM KUM/Ashvam/0296-1@u/UPHDFCHC BANK/111826104977/15P2ebda67309944d1aa8737d3b7826b2ac1',
  2780.53,
  '2025-09-27',
  'income',
  'digital_wallet',
  null,
  'bank',
  'ICICI Savings Account',
  null,
  false,
  '{
    "bank_reference": "111826104977",
    "original_description": "UPI/SHIVAM KUM/Ashvam/0296-1@u/UPHDFCHC BANK/111826104977/15P2ebda67309944d1aa8737d3b7826b2ac1",
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "2025-10-18",
    "account_last_four": "2899",
    "balance_after_transaction": 5269835.1,
    "bank_name": "ICICI",
    "statement_period": "September 2025"
  }'::jsonb
),
-- Transaction 8: Salary Credit (30/9/25)
(
  :'user_id',
  'Salary Credit',
  'NEFT-GITINS2025030332689904-VIM GLOBAL TECHNOLOGY SERVICES |P | -GTS SALARY PAY SEP25-0520551016-CIT',
  225881,
  '2025-09-30',
  'income',
  'bank',
  'VIM Global Technology Services',
  'bank',
  'ICICI Savings Account',
  'VIM Global Technology Services',
  false,
  '{
    "bank_reference": "0520551016",
    "original_description": "NEFT-GITINS2025030332689904-VIM GLOBAL TECHNOLOGY SERVICES |P | -GTS SALARY PAY SEP25-0520551016-CIT",
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "2025-10-18",
    "account_last_four": "2899",
    "balance_after_transaction": 5495616.1,
    "bank_name": "ICICI",
    "statement_period": "September 2025"
  }'::jsonb
),
-- Transaction 9: Credit Card Payment #2 (30/9/25)
(
  :'user_id',
  'Credit Card Payment',
  'ATD/Auto Debit CC0xx0640',
  3224.43,
  '2025-09-30',
  'expense',
  'bank',
  'ICICI Savings Account',
  'credit_card',
  'ICICI Credit Card',
  null,
  true,
  '{
    "bank_reference": "CC0640",
    "original_description": "ATD/Auto Debit CC0xx0640",
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "2025-10-18",
    "account_last_four": "2899",
    "balance_after_transaction": 5492391.67,
    "bank_name": "ICICI",
    "statement_period": "September 2025"
  }'::jsonb
),
-- Transaction 10: FD Interest (30/9/25)
(
  :'user_id',
  'Fixed Deposit Interest',
  '388101502899/int. Pd-30 06 2025 to 29-09 2025',
  32583,
  '2025-09-30',
  'income',
  'investment',
  'ICICI Fixed Deposit',
  'bank',
  'ICICI Savings Account',
  null,
  false,
  '{
    "bank_reference": "388101502899",
    "original_description": "388101502899/int. Pd-30 06 2025 to 29-09 2025",
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "2025-10-18",
    "account_last_four": "2899",
    "balance_after_transaction": 5525174.87,
    "bank_name": "ICICI",
    "statement_period": "September 2025",
    "interest_period": "30-06-2025 to 29-09-2025",
    "fd_number": "388101502899"
  }'::jsonb
);

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Verify transactions inserted
SELECT COUNT(*) as total_transactions,
       SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
       SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END) as total_transfers
FROM transactions_real
WHERE user_id = :'user_id'
  AND date BETWEEN '2025-09-01' AND '2025-09-30';

-- Verify fixed deposit
SELECT * FROM fixed_deposits_real
WHERE user_id = :'user_id'
  AND deposit_number = '388113E+11';

-- Verify statement
SELECT * FROM account_statements_real
WHERE user_id = :'user_id'
  AND statement_period_start = '2025-09-01'
  AND statement_period_end = '2025-09-30';

-- Verify merchants
SELECT merchant_name, transaction_count, total_spent
FROM merchants_real
WHERE merchant_name IN ('PolicyBazaar', 'Apple', 'VIM Global Technology Services');

-- =====================================================================
-- SUCCESS MESSAGE
-- =====================================================================

\echo '✅ Successfully uploaded:'
\echo '   - 10 transactions'
\echo '   - 1 fixed deposit'
\echo '   - 1 account statement'
\echo '   - 3 merchants'
\echo ''
\echo '🎯 Next Steps:'
\echo '   1. Review the data in Supabase dashboard'
\echo '   2. Link transactions to categories/subcategories'
\echo '   3. Upload next month statement'

