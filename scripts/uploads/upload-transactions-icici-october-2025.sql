-- ============================================================
-- ICICI October 2025 Transaction Upload Script
-- ============================================================
-- Date: October 19, 2025
-- Account: ICICI Savings (388101502899)
-- Period: September 30 - October 18, 2025
-- Total Transactions: 12
-- ============================================================

\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
\set icici_account_id 'fd551095-58a9-4f12-b00e-2fd182e68403'

-- Pre-Upload Verification
\echo '========================================='
\echo 'PRE-UPLOAD VERIFICATION'
\echo '========================================='

\echo '\nCurrent ICICI Account Balance:'
SELECT 
    a.name,
    a.current_balance,
    COUNT(t.id) as transaction_count,
    MAX(t.date) as last_transaction_date
FROM accounts a
LEFT JOIN transactions t ON t.source_account_id = a.id OR t.destination_account_id = a.id
WHERE a.id = :'icici_account_id'
GROUP BY a.id, a.name, a.current_balance;

\echo '\nExisting October 2025 Transactions:'
SELECT COUNT(*) as october_transaction_count
FROM transactions
WHERE (source_account_id = :'icici_account_id' OR destination_account_id = :'icici_account_id')
  AND date >= '2025-10-01'
  AND date <= '2025-10-31';

-- ============================================================
-- BULK INSERT WITH DUPLICATE CHECK
-- ============================================================

\echo '\n========================================='
\echo 'UPLOADING OCTOBER TRANSACTIONS'
\echo '========================================='

SELECT * FROM bulk_insert_transactions_with_duplicate_check('[
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Salary Credit",
    "description": "NEFT-CITINS20250930332689994-WM GLOBAL TECHNOLOGY SERVICES I P L-GTS SALARY PAY",
    "amount": 225981.00,
    "date": "2025-09-30",
    "type": "income",
    "source_account_type": "bank",
    "source_account_name": "WM Global Technology Services",
    "destination_account_type": "bank",
    "destination_account_name": "ICICI Savings Account",
    "destination_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "merchant": "WM Global Technology Services",
    "is_recurring": true,
    "is_credit_card": false,
    "bank_reference_number": "CITINS20250930332689994",
    "neft_reference_number": "CITINS20250930332689994",
    "metadata": {
      "bank_reference": "CITINS20250930332689994",
      "neft_reference": "CITINS20250930332689994",
      "original_description": "NEFT-CITINS20250930332689994-WM GLOBAL TECHNOLOGY SERVICES I P L-GTS SALARY PAY",
      "upload_source": "october_statement_upload",
      "upload_date": "2025-10-19",
      "account_last_four": "2899",
      "balance_after_transaction": 5495816.10,
      "bank_name": "ICICI",
      "statement_period": "October 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Credit Card Payment",
    "description": "ATD/Auto Debit CC0xx6040",
    "amount": 3224.43,
    "date": "2025-09-30",
    "type": "expense",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "destination_account_type": "credit_card",
    "destination_account_name": "ICICI Credit Card",
    "is_recurring": false,
    "is_credit_card": true,
    "bank_reference_number": "CC6040",
    "metadata": {
      "bank_reference": "CC6040",
      "original_description": "ATD/Auto Debit CC0xx6040",
      "upload_source": "october_statement_upload",
      "upload_date": "2025-10-19",
      "account_last_four": "2899",
      "balance_after_transaction": 5492591.67,
      "bank_name": "ICICI",
      "statement_period": "October 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Fixed Deposit Interest",
    "description": "388101502899-Int.Pd.30-06-2025 to 29-09-2025",
    "amount": 32583.00,
    "date": "2025-09-30",
    "type": "income",
    "source_account_type": "investment",
    "source_account_name": "ICICI Fixed Deposit",
    "destination_account_type": "bank",
    "destination_account_name": "ICICI Savings Account",
    "destination_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "is_recurring": true,
    "is_credit_card": false,
    "bank_reference_number": "388101502899",
    "metadata": {
      "bank_reference": "388101502899",
      "original_description": "388101502899-Int.Pd.30-06-2025 to 29-09-2025",
      "upload_source": "october_statement_upload",
      "upload_date": "2025-10-19",
      "account_last_four": "2899",
      "balance_after_transaction": 5525174.67,
      "bank_name": "ICICI",
      "statement_period": "October 2025",
      "interest_period": "30-06-2025 to 29-09-2025",
      "value_date": "2025-09-29"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Transfer from Sunidhi - Kotak",
    "description": "UPI/SUNIDHI VI/sumidhijbs-3@co/UPI/Kotak Mahi/564012936762/ICfb2ee02a9b129d4357b4",
    "amount": 6808.00,
    "date": "2025-10-01",
    "type": "income",
    "source_account_type": "bank",
    "source_account_name": "Kotak Mahindra Bank",
    "source_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
    "destination_account_type": "bank",
    "destination_account_name": "ICICI Savings Account",
    "destination_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "is_recurring": false,
    "is_credit_card": false,
    "bank_reference_number": "564012936762",
    "upi_reference_number": "ICfb2ee02a9b129d4357b4",
    "metadata": {
      "bank_reference": "564012936762",
      "upi_reference": "ICfb2ee02a9b129d4357b4",
      "original_description": "UPI/SUNIDHI VI/sumidhijbs-3@co/UPI/Kotak Mahi/564012936762/ICfb2ee02a9b129d4357b4",
      "upload_source": "october_statement_upload",
      "upload_date": "2025-10-19",
      "account_last_four": "2899",
      "balance_after_transaction": 5531982.67,
      "bank_name": "ICICI",
      "statement_period": "October 2025",
      "upi_id": "sumidhijbs-3@co",
      "sender_name": "Sunidhi"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Transfer to Axis Bank",
    "description": "UPI/DHRUV PATH/9717564406@jup/Self trans/AXIS BANK/132124662745/AXIUP334982050",
    "amount": 6808.00,
    "date": "2025-10-01",
    "type": "transfer",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "destination_account_type": "bank",
    "destination_account_name": "Axis Bank",
    "destination_account_id": "0de24177-a088-4453-bf59-9b6c79946a5d",
    "is_recurring": false,
    "is_credit_card": false,
    "bank_reference_number": "132124662745",
    "upi_reference_number": "AXIUP334982050",
    "metadata": {
      "bank_reference": "132124662745",
      "upi_reference": "AXIUP334982050",
      "original_description": "UPI/DHRUV PATH/9717564406@jup/Self trans/AXIS BANK/132124662745/AXIUP334982050",
      "upload_source": "october_statement_upload",
      "upload_date": "2025-10-19",
      "account_last_four": "2899",
      "balance_after_transaction": 5525174.67,
      "bank_name": "ICICI",
      "statement_period": "October 2025",
      "upi_id": "9717564406@jup"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Apple Services Subscription",
    "description": "UPI/APPLE MEDI/appleservices../UPI Mandat/HDFC BANK/101636371097/HDF40721AD2BBEAC",
    "amount": 319.00,
    "date": "2025-10-06",
    "type": "expense",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "merchant": "Apple",
    "is_recurring": true,
    "is_credit_card": false,
    "bank_reference_number": "101636371097",
    "upi_reference_number": "HDF40721AD2BBEAC",
    "metadata": {
      "bank_reference": "101636371097",
      "upi_reference": "HDF40721AD2BBEAC",
      "original_description": "UPI/APPLE MEDI/appleservices../UPI Mandat/HDFC BANK/101636371097/HDF40721AD2BBEAC",
      "upload_source": "october_statement_upload",
      "upload_date": "2025-10-19",
      "account_last_four": "2899",
      "balance_after_transaction": 5524855.67,
      "bank_name": "ICICI",
      "statement_period": "October 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Transfer to HDFC Bank",
    "description": "UPI/DHRUV PATH/9717564406@jup/Self trans/HDFC BANK/228916592815/AXIUP399887887",
    "amount": 50000.00,
    "date": "2025-10-08",
    "type": "transfer",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "destination_account_type": "bank",
    "destination_account_name": "HDFC Bank",
    "destination_account_id": "c5b2eb82-1159-4710-8d5d-de16ee0e6233",
    "is_recurring": false,
    "is_credit_card": false,
    "bank_reference_number": "228916592815",
    "upi_reference_number": "AXIUP399887887",
    "metadata": {
      "bank_reference": "228916592815",
      "upi_reference": "AXIUP399887887",
      "original_description": "UPI/DHRUV PATH/9717564406@jup/Self trans/HDFC BANK/228916592815/AXIUP399887887",
      "upload_source": "october_statement_upload",
      "upload_date": "2025-10-19",
      "account_last_four": "2899",
      "balance_after_transaction": 5474855.67,
      "bank_name": "ICICI",
      "statement_period": "October 2025",
      "upi_id": "9717564406@jup"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Transfer to Axis Bank",
    "description": "UPI/DHRUV PATH/9717564406@jup/Self trans/AXIS BANK/228986852815/AXIUP289628872",
    "amount": 50000.00,
    "date": "2025-10-08",
    "type": "transfer",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "destination_account_type": "bank",
    "destination_account_name": "Axis Bank",
    "destination_account_id": "0de24177-a088-4453-bf59-9b6c79946a5d",
    "is_recurring": false,
    "is_credit_card": false,
    "bank_reference_number": "228986852815",
    "upi_reference_number": "AXIUP289628872",
    "metadata": {
      "bank_reference": "228986852815",
      "upi_reference": "AXIUP289628872",
      "original_description": "UPI/DHRUV PATH/9717564406@jup/Self trans/AXIS BANK/228986852815/AXIUP289628872",
      "upload_source": "october_statement_upload",
      "upload_date": "2025-10-19",
      "account_last_four": "2899",
      "balance_after_transaction": 5424855.67,
      "bank_name": "ICICI",
      "statement_period": "October 2025",
      "upi_id": "9717564406@jup"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "PolicyBazaar Insurance Payment",
    "description": "UPI/Policybaza/paytm-8735485@/OidPBS1398/YES BANK L/528106939337/PAYTM510088022",
    "amount": 1890.00,
    "date": "2025-10-08",
    "type": "expense",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "merchant": "PolicyBazaar",
    "is_recurring": false,
    "is_credit_card": false,
    "bank_reference_number": "528106939337",
    "upi_reference_number": "PAYTM510088022",
    "metadata": {
      "bank_reference": "528106939337",
      "upi_reference": "PAYTM510088022",
      "original_description": "UPI/Policybaza/paytm-8735485@/OidPBS1398/YES BANK L/528106939337/PAYTM510088022",
      "upload_source": "october_statement_upload",
      "upload_date": "2025-10-19",
      "account_last_four": "2899",
      "balance_after_transaction": 5422965.67,
      "bank_name": "ICICI",
      "statement_period": "October 2025",
      "upi_id": "paytm-8735485@"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Credit Card Payment",
    "description": "ATD/Auto Debit CC0xx0318",
    "amount": 4654.50,
    "date": "2025-10-08",
    "type": "expense",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "destination_account_type": "credit_card",
    "destination_account_name": "ICICI Credit Card",
    "is_recurring": false,
    "is_credit_card": true,
    "bank_reference_number": "CC0318",
    "metadata": {
      "bank_reference": "CC0318",
      "original_description": "ATD/Auto Debit CC0xx0318",
      "upload_source": "october_statement_upload",
      "upload_date": "2025-10-19",
      "account_last_four": "2899",
      "balance_after_transaction": 5418311.17,
      "bank_name": "ICICI",
      "statement_period": "October 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Apple Services Subscription",
    "description": "UPI/Apple Serv/appleservices../MandateReq/ICICI Bank/528469455510/ICf6a60f892de7",
    "amount": 179.00,
    "date": "2025-10-11",
    "type": "expense",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings Account",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "merchant": "Apple",
    "is_recurring": true,
    "is_credit_card": false,
    "bank_reference_number": "528469455510",
    "upi_reference_number": "ICf6a60f892de7",
    "metadata": {
      "bank_reference": "528469455510",
      "upi_reference": "ICf6a60f892de7",
      "original_description": "UPI/Apple Serv/appleservices../MandateReq/ICICI Bank/528469455510/ICf6a60f892de7",
      "upload_source": "october_statement_upload",
      "upload_date": "2025-10-19",
      "account_last_four": "2899",
      "balance_after_transaction": 5418132.17,
      "bank_name": "ICICI",
      "statement_period": "October 2025"
    }
  },
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Payment from Rishabh",
    "description": "UPI/RISHABH GU/9718448446@ybl/Payment fr/AXIS BANK/086433058517/YBL44e16350b022",
    "amount": 225.70,
    "date": "2025-10-18",
    "type": "income",
    "source_account_type": "digital_wallet",
    "destination_account_type": "bank",
    "destination_account_name": "ICICI Savings Account",
    "destination_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "is_recurring": false,
    "is_credit_card": false,
    "bank_reference_number": "086433058517",
    "upi_reference_number": "YBL44e16350b022",
    "metadata": {
      "bank_reference": "086433058517",
      "upi_reference": "YBL44e16350b022",
      "original_description": "UPI/RISHABH GU/9718448446@ybl/Payment fr/AXIS BANK/086433058517/YBL44e16350b022",
      "upload_source": "october_statement_upload",
      "upload_date": "2025-10-19",
      "account_last_four": "2899",
      "balance_after_transaction": 5418357.87,
      "bank_name": "ICICI",
      "statement_period": "October 2025",
      "upi_id": "9718448446@ybl",
      "sender_name": "Rishabh"
    }
  }
]'::jsonb);

-- ============================================================
-- POST-UPLOAD VERIFICATION
-- ============================================================

\echo '\n========================================='
\echo 'POST-UPLOAD VERIFICATION'
\echo '========================================='

\echo '\nTransactions by Type:'
SELECT 
    type,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM transactions
WHERE (source_account_id = :'icici_account_id' OR destination_account_id = :'icici_account_id')
  AND date >= '2025-10-01'
  AND date <= '2025-10-31'
GROUP BY type
ORDER BY type;

\echo '\nOctober Transaction Summary:'
SELECT 
    COUNT(*) as total_transactions,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN type = 'transfer' AND source_account_id = :'icici_account_id' THEN amount ELSE 0 END) as total_transfers_out
FROM transactions
WHERE (source_account_id = :'icici_account_id' OR destination_account_id = :'icici_account_id')
  AND date >= '2025-10-01'
  AND date <= '2025-10-31';

\echo '\nBalance Verification:'
SELECT 
    'Expected Ending Balance' as description,
    5418357.87 as amount
UNION ALL
SELECT 
    'Current Account Balance',
    current_balance
FROM accounts
WHERE id = :'icici_account_id';

\echo '\nCheck for Duplicates:'
SELECT 
    bank_reference_number,
    COUNT(*) as occurrence_count
FROM transactions
WHERE (source_account_id = :'icici_account_id' OR destination_account_id = :'icici_account_id')
  AND bank_reference_number IS NOT NULL
GROUP BY bank_reference_number
HAVING COUNT(*) > 1;

\echo '\nCheck Transfer Links:'
SELECT 
    t1.name as transaction_name,
    t1.date,
    t1.amount,
    t1.linked_transfer_id,
    t2.id as linked_id,
    t2.name as linked_name
FROM transactions t1
LEFT JOIN transactions t2 ON t1.linked_transfer_id = t2.id
WHERE t1.type = 'transfer'
  AND t1.source_account_id = :'icici_account_id'
  AND t1.date >= '2025-10-01'
  AND t1.date <= '2025-10-31'
ORDER BY t1.date;

\echo '\nAll October Transactions (Ordered by Date):'
SELECT 
    date,
    name,
    type,
    amount,
    (metadata->>'balance_after_transaction')::numeric as balance_after
FROM transactions
WHERE (source_account_id = :'icici_account_id' OR destination_account_id = :'icici_account_id')
  AND date >= '2025-10-01'
  AND date <= '2025-10-31'
ORDER BY date, id;

\echo '\n========================================='
\echo 'UPLOAD COMPLETE!'
\echo '========================================='
\echo 'Review the results above to ensure:'
\echo '1. All 12 transactions were inserted (or appropriate skips for duplicates)'
\echo '2. No duplicate bank references'
\echo '3. Transfer transactions are properly linked'
\echo '4. Balance progression matches statement'
\echo '5. Ending balance is ₹5,418,357.87'
\echo '========================================='

