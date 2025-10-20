-- ============================================================================
-- IDFC FIRST BANK - SEPTEMBER 2025 TRANSACTIONS UPLOAD (CORRECTED)
-- ============================================================================
-- 
-- Account: IDFC Savings Account
-- Account Number: 10167677364 (CORRECTED)
-- Period: September 1-30, 2025
-- Total Transactions: 46 (CORRECTED)
-- Total Credits: ₹122,554.00 (6 transactions)
-- Total Debits: ₹69,867.04 (40 transactions)
-- Opening Balance: ₹8,381.86 (CORRECTED)
-- Closing Balance: ₹61,068.82 (CORRECTED)
-- Net Change: +₹52,687.96 (+628.3%)
--
-- This is a corrected upload with accurate data from bank statement
-- ============================================================================

-- STEP 1: Verify account exists and get details
SELECT 
    id,
    name,
    account_number,
    ifsc_code,
    micr_code,
    current_balance
FROM accounts_real
WHERE id = '328c756a-b05e-4925-a9ae-852f7fb18b4e';

-- STEP 2: Insert corrected transactions using bulk insert function
SELECT * FROM bulk_insert_transactions_with_duplicate_check('[
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Payment - Raghaven",
        "description": "UPI/DR/524791536892/RAGHAVEN/BARB/9902929/cab",
        "amount": 52.00,
        "date": "2025-09-04",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-524791536892-20250904",
            "balance_after_transaction": 8329.86,
            "original_description": "UPI/DR/524791536892/RAGHAVEN/BARB/9902929/cab",
            "transaction_mode": "UPI",
            "category": "cab"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Food Payment - Avneesh",
        "description": "UPI/DR/524704225962/AVNEESH /UTIB/paytm.d/food",
        "amount": 175.00,
        "date": "2025-09-04",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-524704225962-20250904",
            "balance_after_transaction": 8154.86,
            "original_description": "UPI/DR/524704225962/AVNEESH /UTIB/paytm.d/food",
            "transaction_mode": "UPI",
            "category": "food"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cook Payment - Jagat Babu",
        "description": "UPI/DR/524857319641/Jagat B/ESMF/vikashr/cook",
        "amount": 6000.00,
        "date": "2025-09-05",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-524857319641-20250905",
            "balance_after_transaction": 2154.86,
            "original_description": "UPI/DR/524857319641/Jagat B/ESMF/vikashr/cook",
            "transaction_mode": "UPI",
            "category": "cook"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Payment - Dhanush",
        "description": "UPI/DR/524865153543/DHANUSH /ICIC/9353881/cab",
        "amount": 61.00,
        "date": "2025-09-05",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-524865153543-20250905",
            "balance_after_transaction": 2093.86,
            "original_description": "UPI/DR/524865153543/DHANUSH /ICIC/9353881/cab",
            "transaction_mode": "UPI",
            "category": "cab"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Bus Payment - BMTC",
        "description": "UPI/DR/524868497753/BMTC BUS/CNRB/ka57f21/Pay to",
        "amount": 25.00,
        "date": "2025-09-05",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-524868497753-20250905",
            "balance_after_transaction": 2068.86,
            "original_description": "UPI/DR/524868497753/BMTC BUS/CNRB/ka57f21/Pay to",
            "transaction_mode": "UPI",
            "category": "bus"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Payment - Renuka",
        "description": "UPI/DR/524883097957/Renuka/UNBA/bharatp/Pay to",
        "amount": 110.00,
        "date": "2025-09-05",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-524883097957-20250905",
            "balance_after_transaction": 1958.86,
            "original_description": "UPI/DR/524883097957/Renuka/UNBA/bharatp/Pay to",
            "transaction_mode": "UPI",
            "category": "payment"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Self Transfer",
        "description": "UPI/DR/843111312485/DHRUV PA/FDRL/9717564/Self tr",
        "amount": 375.00,
        "date": "2025-09-05",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-843111312485-20250905",
            "balance_after_transaction": 1583.86,
            "original_description": "UPI/DR/843111312485/DHRUV PA/FDRL/9717564/Self tr",
            "transaction_mode": "UPI",
            "category": "self_transfer"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Self Transfer",
        "description": "UPI/DR/843234182485/DHRUV PA/FDRL/9717564/Self tr",
        "amount": 1.00,
        "date": "2025-09-05",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-843234182485-20250905",
            "balance_after_transaction": 1582.86,
            "original_description": "UPI/DR/843234182485/DHRUV PA/FDRL/9717564/Self tr",
            "transaction_mode": "UPI",
            "category": "self_transfer"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Payment - Padmavat",
        "description": "UPI/DR/524923607822/PADMAVAT/KARB/7795905/cab",
        "amount": 80.00,
        "date": "2025-09-06",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-524923607822-20250906",
            "balance_after_transaction": 1502.86,
            "original_description": "UPI/DR/524923607822/PADMAVAT/KARB/7795905/cab",
            "transaction_mode": "UPI",
            "category": "cab"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Sweets - The Moda",
        "description": "UPI/DR/524925180443/THE MODA/HDFC/vyapar./sweets",
        "amount": 303.00,
        "date": "2025-09-06",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-524925180443-20250906",
            "balance_after_transaction": 1199.86,
            "original_description": "UPI/DR/524925180443/THE MODA/HDFC/vyapar./sweets",
            "transaction_mode": "UPI",
            "category": "sweets"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Payment - Raghu",
        "description": "UPI/DR/525064024675/RAGHU R/SBIN/9380601/cab",
        "amount": 85.00,
        "date": "2025-09-07",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-525064024675-20250907",
            "balance_after_transaction": 1114.86,
            "original_description": "UPI/DR/525064024675/RAGHU R/SBIN/9380601/cab",
            "transaction_mode": "UPI",
            "category": "cab"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Payment - Raju",
        "description": "UPI/DR/525065813183/RAJU MC/AIRP/3324200/Payment",
        "amount": 54.00,
        "date": "2025-09-07",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-525065813183-20250907",
            "balance_after_transaction": 1060.86,
            "original_description": "UPI/DR/525065813183/RAJU MC/AIRP/3324200/Payment",
            "transaction_mode": "UPI",
            "category": "payment"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Juice - Basappa",
        "description": "UPI/DR/525066121801/BASAPPA/YESB/q003195/juice",
        "amount": 40.00,
        "date": "2025-09-07",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-525066121801-20250907",
            "balance_after_transaction": 1020.86,
            "original_description": "UPI/DR/525066121801/BASAPPA/YESB/q003195/juice",
            "transaction_mode": "UPI",
            "category": "juice"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Reimbursement - Suryam",
        "description": "UPI/CR/525072749001/SURYAM /SBIN/suryamv/Cab",
        "amount": 1100.00,
        "date": "2025-09-07",
        "type": "income",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-525072749001-20250907",
            "balance_after_transaction": 2120.86,
            "original_description": "UPI/CR/525072749001/SURYAM /SBIN/suryamv/Cab",
            "transaction_mode": "UPI",
            "category": "cab_reimbursement"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Payment - Sonu",
        "description": "UPI/DR/525093957264/SONU KUM/BKID/sonukum/cab",
        "amount": 102.00,
        "date": "2025-09-07",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-525093957264-20250907",
            "balance_after_transaction": 2018.86,
            "original_description": "UPI/DR/525093957264/SONU KUM/BKID/sonukum/cab",
            "transaction_mode": "UPI",
            "category": "cab"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Payment - Saidalav",
        "description": "UPI/DR/525197622868/SAIDALAV/BARB/7994352/cab",
        "amount": 114.00,
        "date": "2025-09-08",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-525197622868-20250908",
            "balance_after_transaction": 1904.86,
            "original_description": "UPI/DR/525197622868/SAIDALAV/BARB/7994352/cab",
            "transaction_mode": "UPI",
            "category": "cab"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Self Transfer - From ICICI",
        "description": "UPI/CR/279045892515/DHRUV PA/ICIC/9717564/Self tr",
        "amount": 50000.00,
        "date": "2025-09-08",
        "type": "income",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-279045892515-20250908",
            "balance_after_transaction": 51904.86,
            "original_description": "UPI/CR/279045892515/DHRUV PA/ICIC/9717564/Self tr",
            "transaction_mode": "UPI",
            "category": "self_transfer"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Self Transfer - From ICICI",
        "description": "UPI/CR/279145852515/DHRUV PA/ICIC/9717564/Self tr",
        "amount": 48000.00,
        "date": "2025-09-08",
        "type": "income",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-279145852515-20250908",
            "balance_after_transaction": 99904.86,
            "original_description": "UPI/CR/279145852515/DHRUV PA/ICIC/9717564/Self tr",
            "transaction_mode": "UPI",
            "category": "self_transfer"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Society Maintenance - MyGate",
        "description": "UPI/DR/525105987808/MyGate/YESB/paytm-m/society",
        "amount": 13065.90,
        "date": "2025-09-08",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-525105987808-20250908",
            "balance_after_transaction": 86838.96,
            "original_description": "UPI/DR/525105987808/MyGate/YESB/paytm-m/society",
            "transaction_mode": "UPI",
            "category": "society_maintenance"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Self Transfer to Other Account",
        "description": "UPI/DR/543885112535/DHRUV PA/UTIB/9717564/Self tr",
        "amount": 15178.00,
        "date": "2025-09-10",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-543885112535-20250910",
            "balance_after_transaction": 71660.96,
            "original_description": "UPI/DR/543885112535/DHRUV PA/UTIB/9717564/Self tr",
            "transaction_mode": "UPI",
            "category": "self_transfer"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Home Payment - Mrs Pushpa",
        "description": "UPI/DR/561924274953/Mrs Push/SBIN/3179264/home",
        "amount": 15000.00,
        "date": "2025-09-10",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-561924274953-20250910",
            "balance_after_transaction": 56660.96,
            "original_description": "UPI/DR/561924274953/Mrs Push/SBIN/3179264/home",
            "transaction_mode": "UPI",
            "category": "home_payment"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cigarettes - S Rayapp",
        "description": "UPI/DR/525772787433/S RAYAPP/YESB/paytmqr/cigg",
        "amount": 160.00,
        "date": "2025-09-14",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-525772787433-20250914",
            "balance_after_transaction": 56500.96,
            "original_description": "UPI/DR/525772787433/S RAYAPP/YESB/paytmqr/cigg",
            "transaction_mode": "UPI",
            "category": "cigarettes"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Payment - Muhammed",
        "description": "UPI/DR/525772851065/MUHAMMED/UTIB/pkt-860/cab",
        "amount": 157.00,
        "date": "2025-09-14",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-525772851065-20250914",
            "balance_after_transaction": 56343.96,
            "original_description": "UPI/DR/525772851065/MUHAMMED/UTIB/pkt-860/cab",
            "transaction_mode": "UPI",
            "category": "cab"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Payment - Vikash",
        "description": "UPI/DR/525785669815/VIKASH K/UBIN/6206398/cab",
        "amount": 213.00,
        "date": "2025-09-14",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-525785669815-20250914",
            "balance_after_transaction": 56130.96,
            "original_description": "UPI/DR/525785669815/VIKASH K/UBIN/6206398/cab",
            "transaction_mode": "UPI",
            "category": "cab"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Golgappa - Rajesh",
        "description": "UPI/DR/525792625192/Rajesh K/YESB/paytm.s/golgapp",
        "amount": 60.00,
        "date": "2025-09-14",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-525792625192-20250914",
            "balance_after_transaction": 56070.96,
            "original_description": "UPI/DR/525792625192/Rajesh K/YESB/paytm.s/golgapp",
            "transaction_mode": "UPI",
            "category": "golgappa"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Payment - Master M",
        "description": "UPI/DR/525797192846/Master M/FDRL/bharatp/Pay to",
        "amount": 197.00,
        "date": "2025-09-14",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-525797192846-20250914",
            "balance_after_transaction": 55873.96,
            "original_description": "UPI/DR/525797192846/Master M/FDRL/bharatp/Pay to",
            "transaction_mode": "UPI",
            "category": "payment"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Payment - Kotak Mahindra",
        "description": "UPI/DR/525939715344/KOTAK MA/HDFC/kotakma/Pay",
        "amount": 1179.00,
        "date": "2025-09-16",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-525939715344-20250916",
            "balance_after_transaction": 54694.96,
            "original_description": "UPI/DR/525939715344/KOTAK MA/HDFC/kotakma/Pay",
            "transaction_mode": "UPI",
            "category": "payment"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Uber Payment",
        "description": "UPI/DR/526188143252/UBER IND/AIRP/uberind/Payment",
        "amount": 89.14,
        "date": "2025-09-18",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-526188143252-20250918",
            "balance_after_transaction": 54605.82,
            "original_description": "UPI/DR/526188143252/UBER IND/AIRP/uberind/Payment",
            "transaction_mode": "UPI",
            "category": "uber"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Payment - Ajesh",
        "description": "UPI/DR/526101915879/AJESH -/ESMF/ajeshab/cab",
        "amount": 382.00,
        "date": "2025-09-18",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-526101915879-20250918",
            "balance_after_transaction": 54223.82,
            "original_description": "UPI/DR/526101915879/AJESH -/ESMF/ajeshab/cab",
            "transaction_mode": "UPI",
            "category": "cab"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Bus Payment - BMTC",
        "description": "UPI/DR/526220164600/KA01AR15/CNRB/bmtc.ka/bus",
        "amount": 25.00,
        "date": "2025-09-19",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-526220164600-20250919",
            "balance_after_transaction": 54198.82,
            "original_description": "UPI/DR/526220164600/KA01AR15/CNRB/bmtc.ka/bus",
            "transaction_mode": "UPI",
            "category": "bus"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Payment - Zahidul",
        "description": "UPI/DR/526229856652/Zahidul /SBIN/zahidu9/cab",
        "amount": 83.00,
        "date": "2025-09-19",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-526229856652-20250919",
            "balance_after_transaction": 54115.82,
            "original_description": "UPI/DR/526229856652/Zahidul /SBIN/zahidu9/cab",
            "transaction_mode": "UPI",
            "category": "cab"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cake - Layerbit",
        "description": "UPI/DR/526325855029/LAYERBIT/UTIB/paytm.d/cake",
        "amount": 361.00,
        "date": "2025-09-20",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-526325855029-20250920",
            "balance_after_transaction": 53754.82,
            "original_description": "UPI/DR/526325855029/LAYERBIT/UTIB/paytm.d/cake",
            "transaction_mode": "UPI",
            "category": "cake"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Washroom - Meghan",
        "description": "UPI/DR/563004025853/Meghan D/BARB/6362494/washroo",
        "amount": 10.00,
        "date": "2025-09-21",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-563004025853-20250921",
            "balance_after_transaction": 53744.82,
            "original_description": "UPI/DR/563004025853/Meghan D/BARB/6362494/washroo",
            "transaction_mode": "UPI",
            "category": "washroom"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Parcel - Mohammed",
        "description": "UPI/DR/563107213815/Mohammed/AIRP/masee.u/parcel",
        "amount": 113.00,
        "date": "2025-09-22",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-563107213815-20250922",
            "balance_after_transaction": 53631.82,
            "original_description": "UPI/DR/563107213815/Mohammed/AIRP/masee.u/parcel",
            "transaction_mode": "UPI",
            "category": "parcel"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Google Pay",
        "description": "UPI/DR/526989497255/Google I/UTIB/gpay-ut/UPI",
        "amount": 1643.00,
        "date": "2025-09-26",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-526989497255-20250926",
            "balance_after_transaction": 51988.82,
            "original_description": "UPI/DR/526989497255/Google I/UTIB/gpay-ut/UPI",
            "transaction_mode": "UPI",
            "category": "google_payment"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Inverter Payment - Tanuj",
        "description": "UPI/DR/526992161481/TANUJ SA/ICIC/55555sa/Inverte",
        "amount": 11460.00,
        "date": "2025-09-26",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-526992161481-20250926",
            "balance_after_transaction": 40528.82,
            "original_description": "UPI/DR/526992161481/TANUJ SA/ICIC/55555sa/Inverte",
            "transaction_mode": "UPI",
            "category": "inverter"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "GPay Received - Yash",
        "description": "UPI/CR/389864903274/YASH JA/SBIN/9810052/gpay se",
        "amount": 10000.00,
        "date": "2025-09-26",
        "type": "income",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-389864903274-20250926",
            "balance_after_transaction": 50528.82,
            "original_description": "UPI/CR/389864903274/YASH JA/SBIN/9810052/gpay se",
            "transaction_mode": "UPI",
            "category": "gpay_received"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Sweets - True Cake",
        "description": "UPI/DR/526910206072/True Cak/YESB/paytm.d/sweets",
        "amount": 308.00,
        "date": "2025-09-26",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-526910206072-20250926",
            "balance_after_transaction": 50220.82,
            "original_description": "UPI/DR/526910206072/True Cak/YESB/paytm.d/sweets",
            "transaction_mode": "UPI",
            "category": "sweets"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Drinks - Manje Gowda",
        "description": "UPI/DR/871413553905/Manje Go/SBIN/manju19/Drink",
        "amount": 1950.00,
        "date": "2025-09-28",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-871413553905-20250928",
            "balance_after_transaction": 48270.82,
            "original_description": "UPI/DR/871413553905/Manje Go/SBIN/manju19/Drink",
            "transaction_mode": "UPI",
            "category": "drinks"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Gift - Raj Bagr",
        "description": "UPI/DR/527118897284/Raj Bagr/AIRP/7424858/gift",
        "amount": 100.00,
        "date": "2025-09-28",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-527118897284-20250928",
            "balance_after_transaction": 48170.82,
            "original_description": "UPI/DR/527118897284/Raj Bagr/AIRP/7424858/gift",
            "transaction_mode": "UPI",
            "category": "gift"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Golgappa - Arvind",
        "description": "UPI/DR/527120083827/Arvind P/YESB/paytmqr/golgapp",
        "amount": 30.00,
        "date": "2025-09-28",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-527120083827-20250928",
            "balance_after_transaction": 48140.82,
            "original_description": "UPI/DR/527120083827/Arvind P/YESB/paytmqr/golgapp",
            "transaction_mode": "UPI",
            "category": "golgappa"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Payment - Sachin",
        "description": "UPI/DR/527120761763/SACHIN/UJVN/chavans/cab",
        "amount": 105.00,
        "date": "2025-09-28",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-527120761763-20250928",
            "balance_after_transaction": 48035.82,
            "original_description": "UPI/DR/527120761763/SACHIN/UJVN/chavans/cab",
            "transaction_mode": "UPI",
            "category": "cab"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Rent Received - Yash",
        "description": "UPI/CR/691499782635/YASH JA/SBIN/9810052/rent fo",
        "amount": 13343.00,
        "date": "2025-09-30",
        "type": "income",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-691499782635-20250930",
            "balance_after_transaction": 61378.82,
            "original_description": "UPI/CR/691499782635/YASH JA/SBIN/9810052/rent fo",
            "transaction_mode": "UPI",
            "category": "rent"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Payment - Naresh",
        "description": "UPI/DR/527320221446/Naresh R/UTIB/gpay-11/cab",
        "amount": 346.00,
        "date": "2025-09-30",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-527320221446-20250930",
            "balance_after_transaction": 61032.82,
            "original_description": "UPI/DR/527320221446/Naresh R/UTIB/gpay-11/cab",
            "transaction_mode": "UPI",
            "category": "cab"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Cab Payment - Praveen",
        "description": "UPI/DR/527425933192/PRAVEEN /KARB/praveen/cab",
        "amount": 75.00,
        "date": "2025-09-30",
        "type": "expense",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-UPI-527425933192-20250930",
            "balance_after_transaction": 60957.82,
            "original_description": "UPI/DR/527425933192/PRAVEEN /KARB/praveen/cab",
            "transaction_mode": "UPI",
            "category": "cab"
        }
    },
    {
        "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
        "name": "Monthly Savings Interest",
        "description": "MONTHLY SAVINGS INTEREST CREDIT",
        "amount": 111.00,
        "date": "2025-09-30",
        "type": "income",
        "category_id": null,
        "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
        "destination_account_id": null,
        "source_account_type": "bank",
        "metadata": {
            "bank_reference": "IDFC-INT-SAVINGS-20250930",
            "balance_after_transaction": 61068.82,
            "original_description": "MONTHLY SAVINGS INTEREST CREDIT",
            "transaction_mode": "INTEREST_CREDIT",
            "category": "interest"
        }
    }
]'::jsonb);

-- STEP 3: Verify the upload
SELECT 
    COUNT(*) as total_transactions,
    SUM(CASE WHEN type = 'income' THEN 1 ELSE 0 END) as income_count,
    SUM(CASE WHEN type = 'expense' THEN 1 ELSE 0 END) as expense_count,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
FROM transactions_real
WHERE source_account_id = '328c756a-b05e-4925-a9ae-852f7fb18b4e'
  AND date >= '2025-09-01'
  AND date <= '2025-09-30';

-- STEP 4: Show sample transactions
SELECT 
    date,
    name,
    type,
    amount,
    metadata->>'balance_after_transaction' as balance_after
FROM transactions_real
WHERE source_account_id = '328c756a-b05e-4925-a9ae-852f7fb18b4e'
  AND date >= '2025-09-01'
  AND date <= '2025-09-30'
ORDER BY date, created_at
LIMIT 10;

-- ============================================================================
-- UPLOAD COMPLETE
-- ============================================================================

