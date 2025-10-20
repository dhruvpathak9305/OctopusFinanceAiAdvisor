-- ================================================================
-- HDFC BANK - SEPTEMBER 2025 TRANSACTION UPLOAD (UPDATED)
-- ================================================================
-- 
-- Upload Details:
--   Bank: HDFC Bank
--   Account: 50100223596697 (last 4: 6697)
--   Period: September 1-30, 2025
--   Transactions: 14 (10 income + 4 expense)
--   Opening Balance: ₹31,755.73
--   Closing Balance: ₹9,116.44
--   Total Income: ₹553.17
--   Total Expense: ₹23,192.46
--   Net Change: -₹22,639.29
-- 
-- Upload Date: 2025-10-20
-- Verified: 100% accurate against bank statement
-- Update: Added source_account_type='bank' field
-- 
-- ================================================================

-- Show current transaction count for HDFC September 2025
SELECT 
    COUNT(*) as existing_september_transactions,
    COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
    COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
FROM transactions_real
WHERE source_account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233'
  AND date >= '2025-09-01'
  AND date <= '2025-09-30';

-- Execute bulk insert with duplicate checking
SELECT * FROM bulk_insert_transactions_with_duplicate_check('[
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Zerodha Trading Investment",
    "description": "UPI-ZERODHA BROKING LTD-ZERODHABROKING@HDFCBANK-HDFC0MERUPI-101338827809-9917811713610883",
    "amount": 5200.0,
    "date": "2025-09-01",
    "type": "expense",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-UPI-101338827809-20250901",
      "upi_reference": "101338827809-9917811713610883",
      "original_description": "UPI-ZERODHA BROKING LTD-ZERODHABROKING@HDFCBANK-HDFC0MERUPI-101338827809-9917811713610883 Z",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 26555.73,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "UPI"
    },
    "source_account_type": "bank"
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Zerodha Trading Investment",
    "description": "UPI-ZERODHA BROKING LTD-ZERODHABROKING@HDFCBANK-HDFC0MERUPI-101338835465-6473893385912931",
    "amount": 11000.0,
    "date": "2025-09-01",
    "type": "expense",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-UPI-101338835465-20250901",
      "upi_reference": "101338835465-6473893385912931",
      "original_description": "UPI-ZERODHA BROKING LTD-ZERODHABROKING@HDFCBANK-HDFC0MERUPI-101338835465-6473893385912931 Z",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 15555.73,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "UPI"
    },
    "source_account_type": "bank"
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Credit Card Payment - Autopay",
    "description": "CC 000526873XXXXXX7622 AUTOPAY SI-TAD",
    "amount": 5580.0,
    "date": "2025-09-03",
    "type": "expense",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-CC-688857259-20250903",
      "original_description": "CC 000526873XXXXXX7622 AUTOPAY SI-TAD",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 9975.73,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "AUTO_DEBIT",
      "credit_card_last_four": "7622"
    },
    "source_account_type": "bank"
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "ICICI BANK Dividend/Credit",
    "description": "ACH C- ICICI BANK LTD-9243609",
    "amount": 88.0,
    "date": "2025-09-03",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-ACH-9243609-20250903",
      "original_description": "ACH C- ICICI BANK LTD-9243609",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 10063.73,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "ACH_CREDIT"
    },
    "source_account_type": "bank"
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "GAIL Dividend",
    "description": "ACH C- GAIL (INDIA) LIMITED-793880",
    "amount": 22.0,
    "date": "2025-09-10",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-ACH-793880-20250910",
      "original_description": "ACH C- GAIL (INDIA) LIMITED-793880",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 10085.73,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "ACH_CREDIT"
    },
    "source_account_type": "bank"
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Power Grid Dividend",
    "description": "ACH C- POWER GRID CORPORATI-101252592",
    "amount": 26.25,
    "date": "2025-09-12",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-ACH-101252592-20250912",
      "original_description": "ACH C- POWER GRID CORPORATI-101252592",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 10111.98,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "ACH_CREDIT"
    },
    "source_account_type": "bank"
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Indian Energy Exchange Dividend",
    "description": "ACH C- INDIANENERGYEXCHAN-00000000000010",
    "amount": 64.5,
    "date": "2025-09-17",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-ACH-00000000000010-20250917",
      "original_description": "ACH C- INDIANENERGYEXCHAN-00000000000010",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 10176.48,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "ACH_CREDIT"
    },
    "source_account_type": "bank"
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Oil and Natural Gas Dividend",
    "description": "ACH C- OIL AND NATURAL GAS-694696",
    "amount": 25.0,
    "date": "2025-09-17",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-ACH-694696-20250917",
      "original_description": "ACH C- OIL AND NATURAL GAS-694696",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 10201.48,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "ACH_CREDIT"
    },
    "source_account_type": "bank"
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "ETMoney Investment",
    "description": "ACH D- ETMONEY-ETMONEYXXXRJBWNHQZ2526201",
    "amount": 1412.46,
    "date": "2025-09-19",
    "type": "expense",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-ACH-Q2526201-20250919",
      "original_description": "ACH D- ETMONEY-ETMONEYXXXRJBWNHQZ2526201",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 8789.02,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "ACH_DEBIT"
    },
    "source_account_type": "bank"
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Coal India Dividend",
    "description": "ACH C- COAL INDIA LTD-609433",
    "amount": 67.0,
    "date": "2025-09-22",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-ACH-609433-20250922",
      "original_description": "ACH C- COAL INDIA LTD-609433",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 8856.02,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "ACH_CREDIT"
    },
    "source_account_type": "bank"
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "NHPC Limited Dividend",
    "description": "ACH C- NHPC LIMITED-28694131",
    "amount": 23.97,
    "date": "2025-09-23",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-ACH-28694131-20250923",
      "original_description": "ACH C- NHPC LIMITED-28694131",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 8879.99,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "ACH_CREDIT"
    },
    "source_account_type": "bank"
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "BEL Financial Division Dividend 2024-25",
    "description": "ACH C- BEL FIN DIV 2024-25-1208160010073",
    "amount": 4.5,
    "date": "2025-09-23",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-ACH-1208160010073-20250923",
      "original_description": "ACH C- BEL FIN DIV 2024-25-1208160010073",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 8884.49,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "ACH_CREDIT"
    },
    "source_account_type": "bank"
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "NTPC Dividend 2024-25",
    "description": "ACH C- NTPC-FIN-DIV 24-25-NT040925199195",
    "amount": 56.95,
    "date": "2025-09-25",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-ACH-NT040925199195-20250925",
      "original_description": "ACH C- NTPC-FIN-DIV 24-25-NT040925199195",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 8941.44,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "ACH_CREDIT"
    },
    "source_account_type": "bank"
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Interest Credited",
    "description": "INTEREST PAID TILL 30-SEP-2025",
    "amount": 175.0,
    "date": "2025-09-30",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "metadata": {
      "bank_reference": "HDFC-INT-SEP2025-20250930",
      "original_description": "INTEREST PAID TILL 30-SEP-2025",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 9116.44,
      "bank_name": "HDFC Bank",
      "statement_period": "September 2025",
      "transaction_mode": "INTEREST_CREDIT"
    },
    "source_account_type": "bank"
  }
]'::jsonb);

-- Show final transaction count for HDFC September 2025
SELECT 
    COUNT(*) as final_september_transactions,
    COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
    COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
FROM transactions_real
WHERE source_account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233'
  AND date >= '2025-09-01'
  AND date <= '2025-09-30';
