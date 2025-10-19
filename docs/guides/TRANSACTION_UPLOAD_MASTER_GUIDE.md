# 📚 Transaction Upload Master Guide

**Version:** 2.0  
**Last Updated:** October 19, 2025  
**Purpose:** Universal guide for uploading bank transactions for any month and any account

---

## 🎯 Overview

This guide provides a generalized, repeatable process for uploading bank transactions from any bank for any month. Follow these steps each time you have a new statement to upload.

---

## 📋 Prerequisites

### Required Files
- ✅ Bank statement (PDF, Excel, or Images)
- ✅ `ACCOUNT_MAPPING.json` (contains all account IDs)
- ✅ Previous month's transactions uploaded (for balance verification)

### Database Access
- ✅ PostgreSQL connection working
- ✅ Bulk insert function available
- ✅ Duplicate detection enabled

---

## 📊 Step-by-Step Process

### Step 1: Extract Transaction Data

**From your bank statement, collect:**

For each transaction:
```json
{
  "date": "YYYY-MM-DD",
  "name": "Transaction name",
  "description": "Full description from statement",
  "amount": 0.00,
  "type": "income|expense|transfer",
  "balance_after_transaction": 0.00,
  "bank_reference": "Unique reference number"
}
```

**Important Fields:**
- `date`: Transaction date (not value date)
- `amount`: Absolute value (always positive)
- `type`: Determine based on transaction
- `balance_after_transaction`: Balance shown in statement after this transaction

---

### Step 2: Determine Transaction Type

**Income Transactions:**
- Salary credits
- Interest earned
- Refunds
- Incoming transfers FROM another person/account
- Any credit to your account

**Expense Transactions:**
- Purchases
- Bill payments
- Credit card payments
- Withdrawals
- Any debit from your account

**Transfer Transactions:**
- Money moving between YOUR OWN accounts
- Must have both source and destination accounts in your system
- UPI transfers to self
- NEFT/IMPS to own accounts

---

### Step 3: Format Transactions (JSON)

Create a file: `transactions_[BANK]_[MONTH]_[YEAR]_ENHANCED.json`

Example: `transactions_ICICI_November_2025_ENHANCED.json`

```json
[
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Salary Credit",
    "description": "NEFT-XXXXX-Company Name-Salary",
    "amount": 50000.00,
    "date": "2025-11-30T00:00:00Z",
    "type": "income",
    "source_account_type": "bank",
    "source_account_name": "Company Name",
    "source_account_id": null,
    "destination_account_type": "bank",
    "destination_account_name": "ICICI Savings Account",
    "destination_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "category_id": null,
    "subcategory_id": null,
    "merchant": "Company Name",
    "icon": null,
    "is_recurring": true,
    "recurrence_pattern": null,
    "recurrence_end_date": null,
    "parent_transaction_id": null,
    "interest_rate": null,
    "loan_term_months": null,
    "is_credit_card": false,
    "bank_reference_number": "NEFT123456",
    "upi_reference_number": null,
    "neft_reference_number": "NEFT123456",
    "imps_reference_number": null,
    "metadata": {
      "bank_reference": "NEFT123456",
      "neft_reference": "NEFT123456",
      "original_description": "NEFT-XXXXX-Company Name-Salary",
      "upload_source": "statement_upload",
      "upload_date": "2025-11-XX",
      "account_last_four": "XXXX",
      "balance_after_transaction": 125000.00,
      "bank_name": "ICICI",
      "statement_period": "November 2025"
    }
  }
]
```

---

### Step 4: Account ID Mapping

**Reference:** `ACCOUNT_MAPPING.json`

| Account | Account ID | Use For |
|---------|------------|---------|
| ICICI | `fd551095-58a9-4f12-b00e-2fd182e68403` | ICICI transactions |
| IDFC FIRST | `328c756a-b05e-4925-a9ae-852f7fb18b4e` | IDFC transactions |
| Axis Bank | `0de24177-a088-4453-bf59-9b6c79946a5d` | Axis transactions |
| HDFC Bank | `c5b2eb82-1159-4710-8d5d-de16ee0e6233` | HDFC transactions |
| Kotak Mahindra | `db0683f0-4a26-45bf-8943-98755f6f7aa2` | Kotak transactions |
| Jupiter | `67f0dcb5-f0a7-41c9-855d-a22acdf8b59e` | Jupiter transactions |

**For Income:** Set `destination_account_id`  
**For Expense:** Set `source_account_id`  
**For Transfer:** Set both `source_account_id` and `destination_account_id`

---

### Step 5: Create Upload Script

Create: `scripts/upload-transactions-[bank]-[month]-[year].sql`

Example: `scripts/upload-transactions-icici-november-2025.sql`

```sql
-- ============================================================
-- [BANK] [MONTH] [YEAR] Transaction Upload Script
-- ============================================================
-- Date: [Current Date]
-- Account: [Bank Name] ([Account Number])
-- Period: [Date Range]
-- Total Transactions: [Count]
-- ============================================================

\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
\set account_id '[ACCOUNT_ID_FROM_MAPPING]'

-- Pre-Upload Verification
\echo '========================================='
\echo 'PRE-UPLOAD VERIFICATION'
\echo '========================================='

\echo '\nCurrent Account Status:'
SELECT 
    date::date,
    name,
    amount,
    (metadata->>'balance_after_transaction')::numeric as balance
FROM transactions_real
WHERE (source_account_id = :'account_id' OR destination_account_id = :'account_id')
ORDER BY date DESC, created_at DESC
LIMIT 5;

-- ============================================================
-- BULK INSERT WITH DUPLICATE CHECK
-- ============================================================

\echo '\n========================================='
\echo 'UPLOADING TRANSACTIONS'
\echo '========================================='

SELECT * FROM bulk_insert_transactions_with_duplicate_check('[
  -- PASTE YOUR JSON ARRAY HERE
]'::jsonb);

-- ============================================================
-- POST-UPLOAD VERIFICATION
-- ============================================================

\echo '\n========================================='
\echo 'POST-UPLOAD VERIFICATION'
\echo '========================================='

\echo '\nRecent Transactions:'
SELECT 
    date::date,
    name,
    type,
    amount,
    (metadata->>'balance_after_transaction')::numeric as balance_after
FROM transactions_real
WHERE (source_account_id = :'account_id' OR destination_account_id = :'account_id')
ORDER BY date DESC, created_at DESC
LIMIT 10;

\echo '\nMonth Summary:'
SELECT 
    COUNT(*) as total_transactions,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN type = 'transfer' AND source_account_id = :'account_id' THEN amount ELSE 0 END) as total_transfers_out
FROM transactions_real
WHERE (source_account_id = :'account_id' OR destination_account_id = :'account_id')
  AND date >= '[MONTH_START_DATE]'
  AND date <= '[MONTH_END_DATE]';

\echo '\n========================================='
\echo 'UPLOAD COMPLETE!'
\echo '========================================='
```

---

### Step 6: Quality Verification

**Before upload, verify:**

1. **Transaction Count** ✅
   - Count matches statement exactly
   
2. **Balance Progression** ✅
   ```
   Opening Balance + Income - Expenses - Transfers Out + Transfers In = Closing Balance
   ```

3. **Account IDs** ✅
   - All IDs match ACCOUNT_MAPPING.json
   - Income has destination_account_id
   - Expense has source_account_id
   - Transfers have both

4. **Bank References** ✅
   - All transactions have unique references
   - UPI, NEFT, IMPS references captured

5. **Dates** ✅
   - All dates within statement period
   - Format: YYYY-MM-DD

---

### Step 7: Execute Upload

```bash
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Set environment
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
export PGPASSWORD='KO5wgsWET2KgAvwr'

# Upload
psql -h db.fzzbfgnmbchhmqepwmer.supabase.co -p 5432 -d postgres -U postgres \
     -f scripts/upload-transactions-[bank]-[month]-[year].sql
```

---

### Step 8: Post-Upload Verification

Run verification queries:

```sql
-- Check transaction count
SELECT COUNT(*) FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '[MONTH_START]' AND date <= '[MONTH_END]';

-- Check ending balance
SELECT 
    date::date,
    (metadata->>'balance_after_transaction')::numeric as balance
FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
ORDER BY date DESC, created_at DESC
LIMIT 1;

-- Check for duplicates
SELECT 
    metadata->>'bank_reference' as ref,
    COUNT(*) as count
FROM transactions_real
WHERE metadata->>'bank_reference' IS NOT NULL
GROUP BY metadata->>'bank_reference'
HAVING COUNT(*) > 1;
```

**Expected Results:**
- ✅ Transaction count matches
- ✅ Ending balance matches statement
- ✅ No duplicates found

---

## 🔄 Monthly Upload Checklist

### Before Upload
- [ ] Extract all transactions from statement
- [ ] Format data in JSON
- [ ] Verify account IDs from ACCOUNT_MAPPING.json
- [ ] Check balance progression
- [ ] Verify all bank references are unique
- [ ] Create upload script
- [ ] Review for any transfers (need both accounts)

### During Upload
- [ ] Connect to database
- [ ] Run pre-upload verification
- [ ] Execute bulk insert
- [ ] Monitor for errors/duplicates
- [ ] Review upload summary

### After Upload
- [ ] Verify transaction count
- [ ] Confirm ending balance
- [ ] Check for duplicates
- [ ] Test transfer links
- [ ] Update UPLOAD_STATUS.md
- [ ] Document any issues

---

## 🎯 Quick Reference

### File Naming Convention

**Transaction Data:**
```
transactions_[BANK]_[MONTH]_[YEAR]_ENHANCED.json
Example: transactions_HDFC_November_2025_ENHANCED.json
```

**Upload Scripts:**
```
scripts/upload-transactions-[bank]-[month]-[year].sql
Example: scripts/upload-transactions-hdfc-november-2025.sql
```

**Verification:**
```
scripts/verify-[bank]-[month]-[year].sql
Example: scripts/verify-hdfc-november-2025.sql
```

### Common Transaction Types

| Bank Description | Type | Account Assignment |
|------------------|------|-------------------|
| Salary Credit | income | destination = your account |
| Credit Card Payment | expense | source = your account |
| UPI Purchase | expense | source = your account |
| Interest Credit | income | destination = your account |
| Transfer to own account | transfer | both source & destination = your accounts |
| Refund | income | destination = your account |

---

## ⚠️ Common Pitfalls

### 1. Transfer Transactions
**Wrong:** Marking as income/expense  
**Right:** Mark as transfer with both accounts

### 2. Account IDs
**Wrong:** Using account name instead of UUID  
**Right:** Always use UUID from ACCOUNT_MAPPING.json

### 3. Duplicate Prevention
**Wrong:** Not including bank references  
**Right:** Always capture UPI/NEFT/IMPS references

### 4. Balance Verification
**Wrong:** Skipping balance checks  
**Right:** Verify opening and closing balances match

### 5. Date Format
**Wrong:** DD-MM-YYYY or MM/DD/YYYY  
**Right:** YYYY-MM-DD or YYYY-MM-DDTHH:MM:SSZ

---

## 📊 Success Metrics

After successful upload:
- ✅ All transactions inserted (or appropriately skipped as duplicates)
- ✅ Ending balance matches statement exactly
- ✅ No duplicate bank references
- ✅ All transfers properly linked
- ✅ Balance progression logical

---

## 🆘 Troubleshooting

### Issue: Duplicates Found
**Solution:** Run duplicate fix script or skip manually verified duplicates

### Issue: Balance Doesn't Match
**Solution:** 
1. Check if all transactions included
2. Verify income/expense classification
3. Check transfer direction

### Issue: Transfer Not Linked
**Solution:** Ensure both accounts exist with correct IDs

### Issue: Bank Reference Error
**Solution:** Check for null/empty references, use alternative fields

---

## 📚 Related Documentation

- `ACCOUNT_MAPPING.json` - Official account ID mapping
- `docs/uploads/` - Month-specific upload summaries
- `docs/verification/` - Verification reports
- `scripts/` - Upload and verification scripts

---

## 🚀 Next Steps After Upload

1. Update `UPLOAD_STATUS.md` with new month
2. Archive upload documentation in `docs/uploads/`
3. Prepare for next month's statement
4. Back up transaction data files

---

**Last Updated:** October 19, 2025  
**Template Version:** 2.0  
**Maintained By:** Octopus Finance Team

