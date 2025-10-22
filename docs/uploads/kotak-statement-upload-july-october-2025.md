# Kotak Mahindra Bank Statement Upload Documentation

## Upload Summary

**Date:** October 22, 2025  
**Statement Period:** July 22, 2025 - October 22, 2025  
**Bank:** Kotak Mahindra Bank Ltd.  
**Branch:** Lucknow-Aliganj  
**IFSC:** KKBK0005190  
**MICR:** 226485004  

---

## Accounts Processed

### 1. Account 3712733310 - PUSHPA PATHAK (Primary Account Holder)

**Account Details:**
- **Account Type:** Savings Account with Auto-Sweep Facility
- **Customer Relation Number:** 237964982
- **Account Holder:** PUSHPA PATHAK
- **Nominee:** Dhruv Pathak (Y)
- **Database ID:** `db0683f0-4a26-45bf-8943-98755f6f7aa2`

**Financial Summary:**
- **Opening Balance:** ₹29,242.74
- **Closing Balance:** ₹51,723.74
- **Net Change:** +₹22,481.00

**Transaction Summary:**
- **Total Transactions:** 6
- **Total Credits:** ₹533,071.00 (3 transactions)
  - FD Maturity 1: ₹522,433.00
  - FD Maturity 2: ₹10,345.00
  - Quarterly Interest: ₹293.00
- **Total Debits:** ₹510,590.00 (3 transactions)
  - Auto Sweep 1: ₹500,000.00
  - Auto Sweep 2: ₹10,000.00
  - Credit Card Payment: ₹590.00

---

### 2. Account 7246166101 - ASHOK PATHAK (Joint Account)

**Account Details:**
- **Account Type:** Fixed Deposit / Term Deposit Account
- **Customer Relation Number:** 237964982
- **Primary Holder:** ASHOK PATHAK
- **Joint Holder:** PUSHPA PATHAK
- **Nominee:** Dhruv Pathak (Y)
- **Database ID:** `f288c939-4ba1-4bd4-abd0-31951e19ee08`

**Financial Summary:**
- **Opening Balance:** Not specified
- **Closing Balance:** ₹16,250.24
- **Net Change:** +₹16,250.24

**Transaction Summary:**
- **Total Transactions:** 1
- **Total Credits:** ₹16,250.24
  - Quarterly FD Interest: ₹16,250.24

**Interest Details:**
- **Interest Period:** July 1, 2025 to September 30, 2025
- **Interest Frequency:** Quarterly
- **Transaction Date:** October 1, 2025 (02:26)
- **Value Date:** September 30, 2025

---

## Detailed Transaction Breakdown

### Account 3712733310 (PUSHPA PATHAK) Transactions

#### 1. FD Maturity - July 23, 2025
- **Amount:** ₹522,433.00 (Credit)
- **Type:** Income
- **FD Number:** 8280309098
- **Description:** Fixed Deposit maturity proceeds
- **Balance After:** ₹551,675.74
- **Time:** 04:21:52

#### 2. Auto Sweep Transfer - July 24, 2025
- **Amount:** ₹500,000.00 (Debit)
- **Type:** Transfer
- **Sweep Account:** 8291582858
- **Description:** Automatic sweep to Fixed Deposit
- **Balance After:** ₹51,675.74
- **Time:** 00:22:13
- **Value Date:** July 23, 2025

#### 3. Credit Card Bill Payment - August 7, 2025
- **Amount:** ₹590.00 (Debit)
- **Type:** Expense
- **Card Last 4:** 9856
- **Transaction ID:** 811CC-737895d5-58e9-
- **Balance After:** ₹51,085.74
- **Time:** 12:36

#### 4. FD Maturity - August 16, 2025
- **Amount:** ₹10,345.00 (Credit)
- **Type:** Income
- **FD Number:** 8281787054
- **Description:** Fixed Deposit maturity proceeds
- **Balance After:** ₹61,430.74
- **Time:** 02:57:00

#### 5. Auto Sweep Transfer - August 17, 2025
- **Amount:** ₹10,000.00 (Debit)
- **Type:** Transfer
- **Sweep Account:** 8292936870
- **Description:** Automatic sweep to Fixed Deposit
- **Balance After:** ₹51,430.74
- **Time:** 00:33:17
- **Value Date:** August 16, 2025

#### 6. Quarterly Interest - October 1, 2025
- **Amount:** ₹293.00 (Credit)
- **Type:** Income (Recurring)
- **Interest Period:** July 1 - September 30, 2025
- **Cheque Ref:** 293
- **Balance After:** ₹51,723.74
- **Time:** 02:49
- **Value Date:** September 30, 2025

---

### Account 7246166101 (JOINT ACCOUNT) Transactions

#### 1. Quarterly FD Interest - October 1, 2025
- **Amount:** ₹16,250.24 (Credit)
- **Type:** Income (Recurring)
- **Interest Period:** July 1 - September 30, 2025
- **Cheque Ref:** 103
- **Balance After:** ₹16,250.24
- **Time:** 02:26
- **Value Date:** September 30, 2025

---

## Key Observations

### Account 3712733310 (Pushpa's Savings Account)

1. **Auto-Sweep Strategy:**
   - Account uses auto-sweep facility to maintain minimal balance
   - FD maturities are credited to savings account
   - Excess amounts are automatically swept to new FDs (usually the next day)
   - Sweep threshold appears to be around ₹50,000

2. **FD Portfolio:**
   - Multiple FDs maturing at different times
   - Total FD maturities: ₹532,778.00
   - FD Numbers: 8280309098, 8281787054
   - Sweep Accounts: 8291582858, 8292936870

3. **Activity Pattern:**
   - Very low transaction activity
   - Primarily automated transactions (FD maturities, sweeps)
   - Minimal manual transactions (1 credit card payment)
   - Quarterly interest on savings balance

### Account 7246166101 (Joint FD Account)

1. **Account Nature:**
   - This is a Fixed Deposit or Term Deposit account
   - Joint holders: Ashok Pathak & Pushpa Pathak
   - Only interest credit transactions visible

2. **Interest Pattern:**
   - Quarterly interest credit: ₹16,250.24
   - Interest rate can be calculated: (16,250.24 × 4) / Principal
   - No withdrawal or maturity transaction in this period

### Family Banking Relationship

- **Customer Relation Number:** 237964982 (same for both accounts)
- **Primary Holders:** Ashok Pathak & Pushpa Pathak (Parents)
- **Nominee:** Dhruv Pathak (Son)
- **Branch:** Lucknow-Aliganj
- **Linked to:** ICICI account (transfers visible in ICICI statements)

---

## Database Mapping

### Transaction Types

| Statement Description | Database Type | Category |
|----------------------|---------------|----------|
| FD MATURITY PROCEEDS | income | fd_maturity |
| SWEEP TRANSFER TO | transfer | auto_sweep |
| BILL PAID TO CREDIT CARD | expense | credit_card_bill |
| Int.Pd: | income (recurring) | interest_paid |

### Account Mappings

| Account Number | Account Name | Account Type | Database ID |
|---------------|--------------|--------------|-------------|
| 3712733310 | Kotak Mahindra Bank - Pushpa | Savings | db0683f0-4a26-45bf-8943-98755f6f7aa2 |
| 7246166101 | Kotak Mahindra Joint Account | Fixed Deposit | f288c939-4ba1-4bd4-abd0-31951e19ee08 |

### Reference Number Format

All bank reference numbers are formatted as:
```
{identifier}-{date}
```

Examples:
- FD Maturity: `8280309098-20250723`
- Sweep Transfer: `SWEEP-8291582858-20250724`
- Interest: `3712733310-INT-20251001`
- Credit Card: `811CC-737895d5-58e9-20250807`

---

## Metadata Structure

Each transaction includes comprehensive metadata:

```json
{
  "bank_reference": "Unique identifier",
  "original_description": "Raw statement description",
  "upload_source": "kotak_statement_upload",
  "upload_date": "2025-10-22",
  "account_number": "Full account number",
  "account_last_four": "Last 4 digits",
  "balance_after_transaction": "Balance after this transaction",
  "bank_name": "Kotak Mahindra Bank",
  "statement_period": "July-October 2025",
  "transaction_time": "HH:MM:SS",
  "value_date": "YYYY-MM-DD"
}
```

### Additional Metadata Fields

**For FD Maturities:**
```json
{
  "fd_number": "8280309098",
  "fd_maturity_date": "2025-07-23"
}
```

**For Sweep Transfers:**
```json
{
  "sweep_account": "8291582858",
  "transaction_type": "auto_sweep"
}
```

**For Credit Card Payments:**
```json
{
  "credit_card_last_four": "9856",
  "transaction_id": "811CC-737895d5-58e9-"
}
```

**For Interest Credits:**
```json
{
  "interest_period_from": "2025-07-01",
  "interest_period_to": "2025-09-30",
  "cheque_ref_no": "293",
  "transaction_category": "interest_paid"
}
```

---

## Execution Instructions

### To Upload Transactions

```bash
# Connect to your database
psql -h your_host -U your_user -d your_database

# Run the upload script
\i scripts/uploads/upload-transactions-kotak-july-october-2025.sql
```

### Verification Checklist

After running the upload script, verify:

1. ✅ Total transactions uploaded: 7 (6 + 1)
2. ✅ No duplicate bank references
3. ✅ Balance progression matches statements
4. ✅ Account 3712733310 ending balance: ₹51,723.74
5. ✅ Account 7246166101 ending balance: ₹16,250.24
6. ✅ FD maturities recorded correctly
7. ✅ Sweep transfers linked properly
8. ✅ Interest credits marked as recurring

### Expected Verification Output

```sql
-- Account 3712733310 Summary
Total Transactions: 6
Total Income: ₹533,071.00
Total Expense: ₹590.00
Total Transfers Out: ₹510,000.00
Ending Balance: ₹51,723.74

-- Account 7246166101 Summary
Total Transactions: 1
Total Income: ₹16,250.24
Total Expense: ₹0.00
Total Transfers: ₹0.00
Ending Balance: ₹16,250.24
```

---

## Duplicate Prevention

The script uses `bulk_insert_transactions_with_duplicate_check()` which:
- Checks for existing transactions with same bank reference number
- Skips duplicates automatically
- Reports skipped transactions in the output
- Ensures idempotent uploads (safe to run multiple times)

---

## Notes

1. **Auto-Sweep Pattern:** Account 3712733310 demonstrates a typical auto-sweep facility where funds above a threshold are automatically moved to fixed deposits.

2. **Statement Period:** The statement covers July 22 to October 22, 2025, but transactions are from July 23 to October 1, 2025.

3. **Value Dating:** Some transactions (especially sweeps) have different transaction dates and value dates. Value dates are stored in metadata.

4. **Joint Account Interest:** The joint account (7246166101) shows high quarterly interest (₹16,250.24), suggesting a substantial FD principal amount.

5. **Family Banking:** Both accounts share the same CRN and have Dhruv Pathak as nominee, indicating this is family banking setup for parents.

6. **Transaction Timing:** Most automated transactions (sweeps, interest credits) occur in early morning hours (00:00-04:00).

---

## Related Documentation

- [ICICI Statement Upload](./icici-statement-upload-october-2025.md)
- [HDFC Statement Upload](./hdfc-statement-upload-october-2025.md)
- [IDFC Statement Upload](./idfc-statement-upload-september-2025.md)
- [Database Schema](../reference/database-schema.md)
- [Transaction Upload Guide](../guides/transaction-upload-guide.md)

---

## Contact Information

**Customer Service:**  
Kotak Mahindra Bank Ltd.  
24-Hour Contact Centre: 1860 266 2666  
Customer Contact Centre  
Post Box Number 16344  
Mumbai 400 013

**Branch:**  
Lucknow-Aliganj Branch  
IFSC: KKBK0005190  
MICR: 226485004

