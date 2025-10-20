-- ================================================================
-- HDFC BANK - OCTOBER 2025 TRANSACTION UPLOAD (PARTIAL MONTH)
-- ================================================================
-- 
-- Upload Details:
--   Bank: HDFC Bank
--   Account: 50100223596697 (last 4: 6697)
--   Period: October 1-19, 2025 (PARTIAL MONTH - 19 days)
--   Transactions: 5 (4 income + 1 expense)
--   Opening Balance: ₹9,116.44
--   Closing Balance: ₹50,780.37
--   Total Income: ₹50,201.93
--   Total Expense: ₹8,538.00
--   Net Change: +₹41,663.93
-- 
-- Upload Date: 2025-10-20
-- Verified: 100% accurate against bank statement
-- Note: This is partial month data (Oct 1-19 only)
-- 
-- ================================================================

-- Show current transaction count for HDFC October 2025
SELECT 
    COUNT(*) as existing_october_transactions,
    COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
    COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
FROM transactions_real
WHERE source_account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233'
  AND date >= '2025-10-01'
  AND date <= '2025-10-31';

-- Execute bulk insert with duplicate checking
SELECT * FROM bulk_insert_transactions_with_duplicate_check('[
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Zerodha NEFT Credit/Refund",
    "description": "NEFT CR-YESB0000001-ZERODHA BROKING LTD-DSCNB A/C-DHRUV PATHAK-YESBN12025100405414930",
    "amount": 173.7,
    "date": "2025-10-04",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-NEFT-YESBN12025100405414930-20251004",
      "neft_reference": "YESBN12025100405414930",
      "original_description": "NEFT CR-YESB0000001-ZERODHA BROKING LTD-DSCNB A/C-DHRUV PATHAK-YESBN12025100405414930",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 9290.14,
      "bank_name": "HDFC Bank",
      "statement_period": "October 2025",
      "transaction_mode": "NEFT_CREDIT"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Credit Card Payment - Autopay",
    "description": "CC 000526873XXXXXX7622 AUTOPAY SI-TAD",
    "amount": 8538.0,
    "date": "2025-10-04",
    "type": "expense",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-CC-695202295-20251004",
      "original_description": "CC 000526873XXXXXX7622 AUTOPAY SI-TAD",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 752.14,
      "bank_name": "HDFC Bank",
      "statement_period": "October 2025",
      "transaction_mode": "AUTO_DEBIT",
      "credit_card_last_four": "7622"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Oil India Limited Dividend",
    "description": "ACH C- OIL INDIA LIMITED-12185891",
    "amount": 18.0,
    "date": "2025-10-06",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-ACH-12185891-20251006",
      "original_description": "ACH C- OIL INDIA LIMITED-12185891",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 770.14,
      "bank_name": "HDFC Bank",
      "statement_period": "October 2025",
      "transaction_mode": "ACH_CREDIT"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "UPI Self Transfer from Jupiter/ICICI",
    "description": "UPI-DHRUV PATHAK-9717564406@JUPITERAXIS-ICIC0003881-228916592815-SELF TRANSFER",
    "amount": 50000.0,
    "date": "2025-10-08",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-UPI-228916592815-20251008",
      "upi_reference": "228916592815",
      "original_description": "UPI-DHRUV PATHAK-9717564406@JUPITERAXIS-ICIC0003881-228916592815-SELF TRANSFER",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 50770.14,
      "bank_name": "HDFC Bank",
      "statement_period": "October 2025",
      "transaction_mode": "UPI",
      "transfer_type": "self_transfer",
      "transfer_from": "Jupiter/ICICI"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "SJVN Limited Dividend",
    "description": "ACH C- SJVN LTD-369478",
    "amount": 10.23,
    "date": "2025-10-17",
    "type": "income",
    "category_id": null,
    "source_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "destination_account_id": null,
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "HDFC-ACH-369478-20251017",
      "original_description": "ACH C- SJVN LTD-369478",
      "upload_source": "manual_bank_statement",
      "upload_date": "2025-10-20",
      "account_last_four": "6697",
      "balance_after_transaction": 50780.37,
      "bank_name": "HDFC Bank",
      "statement_period": "October 2025",
      "transaction_mode": "ACH_CREDIT"
    }
  }
]'::jsonb);

-- Show final transaction count for HDFC October 2025
SELECT 
    COUNT(*) as final_october_transactions,
    COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
    COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
FROM transactions_real
WHERE source_account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233'
  AND date >= '2025-10-01'
  AND date <= '2025-10-31';
