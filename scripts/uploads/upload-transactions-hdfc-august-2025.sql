-- ================================================================
-- HDFC BANK - AUGUST 2025 TRANSACTION UPLOAD
-- ================================================================
-- 
-- Upload Details:
--   Bank: HDFC Bank
--   Account: 50100223596697 (last 4: 6697)
--   Period: August 1-31, 2025 (COMPLETE MONTH)
--   Transactions: 10 (9 income + 1 expense)
--   Opening Balance: ₹40,307.73
--   Closing Balance: ₹31,755.73
--   Total Income: ₹564.00
--   Total Expense: ₹9,116.00
--   Net Change: -₹8,552.00
-- 
-- Upload Date: 2025-10-20
-- Verified: 100% accurate against bank statement
-- Connects: August closing (31,755.73) = September opening (31,755.73)
-- 
-- ================================================================

-- Show current transaction count for HDFC August 2025
SELECT 
    COUNT(*) as existing_august_transactions,
    COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
    COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
FROM transactions_real
WHERE source_account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233'
  AND date >= '2025-08-01'
  AND date <= '2025-08-31';

-- Execute bulk insert with duplicate checking
SELECT * FROM bulk_insert_transactions_with_duplicate_check('[
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Credit Card Payment - Autopay",
    "description": "CC 000526873XXXXXX7622 AUTOPAY SI-TAD",
    "amount": 9116.0,
    "date": "2025-08-03",
    "type": "expense",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-CC-682119877-20250803",
      "original_description": "CC 000526873XXXXXX7622 AUTOPAY SI-TAD",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 31191.73,
      "bank_name": "HDFC Bank",
      "statement_period": "August 2025",
      "transaction_mode": "AUTO_DEBIT",
      "credit_card_last_four": "7622"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "TCS 1st Interim Dividend",
    "description": "ACH C- TCS1STINTDIV04082025-803828",
    "amount": 99.0,
    "date": "2025-08-04",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-ACH-803828-20250804",
      "original_description": "ACH C- TCS1STINTDIV04082025-803828",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 31290.73,
      "bank_name": "HDFC Bank",
      "statement_period": "August 2025",
      "transaction_mode": "ACH_CREDIT"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Kotak Mahindra Bank Dividend",
    "description": "ACH C- KOTAK MAHINDRA BANK-6417280",
    "amount": 10.0,
    "date": "2025-08-04",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-ACH-6417280-20250804",
      "original_description": "ACH C- KOTAK MAHINDRA BANK-6417280",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 31300.73,
      "bank_name": "HDFC Bank",
      "statement_period": "August 2025",
      "transaction_mode": "ACH_CREDIT"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "HDFC Bank Special Interest Dividend 2025-26",
    "description": "HDFC BANK SPL INT DIV 2025-26",
    "amount": 40.0,
    "date": "2025-08-11",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-DIV-60825141593-20250811",
      "original_description": "HDFC BANK SPL INT DIV 2025-26",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 31340.73,
      "bank_name": "HDFC Bank",
      "statement_period": "August 2025",
      "transaction_mode": "DIVIDEND_CREDIT"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "HDFC Bank Final Dividend 2024-2025",
    "description": "0808046740 HDFC BANK FINAL DIV 2024-2025",
    "amount": 176.0,
    "date": "2025-08-11",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-DIV-80825141703-20250811",
      "original_description": "0808046740 HDFC BANK FINAL DIV 2024-2025",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 31516.73,
      "bank_name": "HDFC Bank",
      "statement_period": "August 2025",
      "transaction_mode": "DIVIDEND_CREDIT"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Torrent Power Final Dividend",
    "description": "ACH C- TORRENTPOWERFNL 2425-49735",
    "amount": 20.0,
    "date": "2025-08-11",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-ACH-49735-20250811",
      "original_description": "ACH C- TORRENTPOWERFNL 2425-49735",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 31536.73,
      "bank_name": "HDFC Bank",
      "statement_period": "August 2025",
      "transaction_mode": "ACH_CREDIT"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Lupin Ltd Final Dividend 2024-25",
    "description": "ACH C- LUPINLTD FNLDIV24 25-59752",
    "amount": 24.0,
    "date": "2025-08-14",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-ACH-59752-20250814",
      "original_description": "ACH C- LUPINLTD FNLDIV24 25-59752",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 31560.73,
      "bank_name": "HDFC Bank",
      "statement_period": "August 2025",
      "transaction_mode": "ACH_CREDIT"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Coal India Dividend",
    "description": "ACH C- COAL INDIA LTD-610913",
    "amount": 72.0,
    "date": "2025-08-25",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-ACH-610913-20250825",
      "original_description": "ACH C- COAL INDIA LTD-610913",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 31632.73,
      "bank_name": "HDFC Bank",
      "statement_period": "August 2025",
      "transaction_mode": "ACH_CREDIT"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Bharat Petroleum Dividend",
    "description": "ACH C- BHARAT PETROLEUM COR-BPCL12081600",
    "amount": 90.0,
    "date": "2025-08-27",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-ACH-BPCL12081600-20250827",
      "original_description": "ACH C- BHARAT PETROLEUM COR-BPCL12081600",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 31722.73,
      "bank_name": "HDFC Bank",
      "statement_period": "August 2025",
      "transaction_mode": "ACH_CREDIT"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Reliance Industries Dividend",
    "description": "ACH C- RELIANCE INDUSTRIES-251476090",
    "amount": 33.0,
    "date": "2025-08-29",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-ACH-251476090-20250829",
      "original_description": "ACH C- RELIANCE INDUSTRIES-251476090",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 31755.73,
      "bank_name": "HDFC Bank",
      "statement_period": "August 2025",
      "transaction_mode": "ACH_CREDIT"
    }
  }
]'::jsonb);

-- Show final transaction count for HDFC August 2025
SELECT 
    COUNT(*) as final_august_transactions,
    COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
    COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
FROM transactions_real
WHERE source_account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233'
  AND date >= '2025-08-01'
  AND date <= '2025-08-31';
