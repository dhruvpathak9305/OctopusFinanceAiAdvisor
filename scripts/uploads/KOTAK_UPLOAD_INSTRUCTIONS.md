# Kotak Mahindra Bank Statement Upload Instructions

## Quick Start

Upload the Kotak Mahindra Bank transactions for July-October 2025 period.

---

## Prerequisites

1. ✅ Database connection configured
2. ✅ Both Kotak accounts exist in the database:
   - Account 3712733310 (Pushpa Pathak)
   - Account 7246166101 (Ashok & Pushpa Joint)
3. ✅ User ID: `6679ae58-a6fb-4d2f-8f23-dd7fafe973d9`

---

## Upload Command

### Option 1: Using psql (Recommended)

```bash
# Navigate to project root
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Connect to database and run upload script
psql -h your_supabase_host \
     -U postgres \
     -d postgres \
     -f scripts/uploads/upload-transactions-kotak-july-october-2025.sql
```

### Option 2: Using Supabase SQL Editor

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `scripts/uploads/upload-transactions-kotak-july-october-2025.sql`
4. Paste and run

### Option 3: Using your existing connection script

```bash
# If you have a connection script
./scripts/db-connect.sh

# Then from psql prompt:
\i scripts/uploads/upload-transactions-kotak-july-october-2025.sql
```

---

## What This Upload Does

### Transactions Being Uploaded: 7 Total

#### Account 3712733310 (Pushpa Pathak) - 6 Transactions

1. **July 23, 2025** - FD Maturity: ₹522,433.00
2. **July 24, 2025** - Auto Sweep Transfer: ₹500,000.00
3. **August 7, 2025** - Credit Card Payment: ₹590.00
4. **August 16, 2025** - FD Maturity: ₹10,345.00
5. **August 17, 2025** - Auto Sweep Transfer: ₹10,000.00
6. **October 1, 2025** - Quarterly Interest: ₹293.00

#### Account 7246166101 (Joint Account) - 1 Transaction

1. **October 1, 2025** - Quarterly FD Interest: ₹16,250.24

---

## Expected Results

### Account 3712733310 (Pushpa's Savings)
- **Opening Balance:** ₹29,242.74
- **Closing Balance:** ₹51,723.74
- **Net Change:** +₹22,481.00

### Account 7246166101 (Joint FD)
- **Closing Balance:** ₹16,250.24

---

## Verification Steps

The script automatically runs verification queries. Check the output for:

### 1. Pre-Upload Status
```
Current Kotak Accounts Status
Existing Kotak Transactions (July-October 2025)
```

### 2. Upload Results
```
Successfully inserted: 7 transactions
Skipped duplicates: 0 (or actual count if re-running)
```

### 3. Post-Upload Verification
- ✅ Transactions by Type
- ✅ Transaction Summary
- ✅ Balance Verification
- ✅ Duplicate Check (should be empty)
- ✅ All Transactions Ordered by Date
- ✅ FD Maturity Summary
- ✅ Sweep Transfer Summary

---

## Manual Verification Queries

If you want to manually verify after upload:

### Check Total Kotak Transactions
```sql
SELECT 
    a.name,
    COUNT(t.id) as transaction_count,
    MAX(t.date) as last_transaction
FROM accounts a
LEFT JOIN transactions t ON (t.source_account_id = a.id OR t.destination_account_id = a.id)
WHERE a.account_number IN ('3712733310', '7246166101')
GROUP BY a.id, a.name;
```

### Check Balances
```sql
SELECT 
    name,
    account_number,
    current_balance,
    institution
FROM accounts
WHERE account_number IN ('3712733310', '7246166101');
```

### Check Recent Transactions
```sql
SELECT 
    t.date,
    t.name,
    t.type,
    t.amount,
    a.name as account
FROM transactions t
JOIN accounts a ON (t.source_account_id = a.id OR t.destination_account_id = a.id)
WHERE a.account_number IN ('3712733310', '7246166101')
  AND t.date >= '2025-07-22'
ORDER BY t.date DESC;
```

---

## Duplicate Prevention

The script uses `bulk_insert_transactions_with_duplicate_check()`:
- ✅ Safe to run multiple times
- ✅ Automatically skips duplicates based on bank reference number
- ✅ Reports what was inserted vs. skipped

---

## Troubleshooting

### Issue: "Account not found"
**Solution:** Verify account IDs match in `ACCOUNT_MAPPING.json`:
```json
{
  "account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
  "account_number": "3712733310"
},
{
  "account_id": "f288c939-4ba1-4bd4-abd0-31951e19ee08",
  "account_number": "7246166101"
}
```

### Issue: "User not found"
**Solution:** Update user_id in script line 30:
```sql
\set user_id 'your-actual-user-id'
```

### Issue: "Function does not exist"
**Solution:** Ensure database functions are deployed:
```bash
psql -f database/functions/bulk-insert-transactions.sql
```

### Issue: Balances don't match
**Solution:** Check if there are existing transactions in the date range that might affect balance calculations.

---

## Post-Upload Actions

After successful upload:

### 1. Update Account Balances (if needed)
```sql
UPDATE accounts 
SET current_balance = 51723.74,
    updated_at = NOW()
WHERE id = 'db0683f0-4a26-45bf-8943-98755f6f7aa2'; -- Account 3712733310

UPDATE accounts 
SET current_balance = 16250.24,
    updated_at = NOW()
WHERE id = 'f288c939-4ba1-4bd4-abd0-31951e19ee08'; -- Account 7246166101
```

### 2. Verify in Application
- Open your finance app
- Navigate to Accounts section
- Check Kotak Mahindra accounts
- Verify transactions appear correctly
- Check balances match

### 3. Test Filters and Queries
- Filter by date range (July-October 2025)
- Filter by transaction type (income, expense, transfer)
- Check FD-related transactions
- Verify auto-sweep transfers

---

## Bank Reference Numbers

All transactions have unique bank references for duplicate prevention:

| Transaction Type | Reference Format | Example |
|-----------------|------------------|---------|
| FD Maturity | `{fd_number}-{date}` | `8280309098-20250723` |
| Sweep Transfer | `SWEEP-{account}-{date}` | `SWEEP-8291582858-20250724` |
| Interest | `{account}-INT-{date}` | `3712733310-INT-20251001` |
| Credit Card | `{transaction_id}-{date}` | `811CC-737895d5-58e9-20250807` |

---

## Transaction Categories

| Statement Description | Type | Category |
|----------------------|------|----------|
| FD MATURITY PROCEEDS | income | fd_maturity |
| SWEEP TRANSFER TO | transfer | auto_sweep |
| BILL PAID TO CREDIT CARD | expense | credit_card_bill |
| Int.Pd: | income | interest_paid |

---

## Key Features

### Auto-Sweep Functionality
Account 3712733310 uses auto-sweep:
- FD matures → credited to savings
- Next day → excess swept to new FD
- Maintains minimal balance (~₹50K)

### Fixed Deposit Tracking
- FD numbers stored in metadata
- Maturity dates recorded
- Sweep accounts tracked
- Easy to analyze FD portfolio

### Interest Credits
- Quarterly interest credited
- Interest period tracked
- Marked as recurring income
- Value date vs. transaction date stored

---

## Support

For issues or questions:
1. Check [Full Documentation](../../docs/uploads/kotak-statement-upload-july-october-2025.md)
2. Review [Transaction Upload Guide](../../docs/guides/transaction-upload-guide.md)
3. Check database logs for errors
4. Verify account IDs in ACCOUNT_MAPPING.json

---

## Next Steps

After uploading Kotak transactions, consider:

1. **Upload other banks** (if pending):
   - ICICI October 2025
   - HDFC October 2025
   - IDFC September/October 2025

2. **Reconcile balances** across all accounts

3. **Generate reports**:
   - Net worth summary
   - Income vs. expense analysis
   - FD portfolio overview
   - Interest income summary

4. **Set up recurring transactions**:
   - Mark salary as recurring
   - Mark subscriptions as recurring
   - Set up bill reminders

---

## Success Checklist

- [ ] Script ran without errors
- [ ] 7 transactions uploaded (6 + 1)
- [ ] No duplicates detected
- [ ] Balances match statements
- [ ] All verification queries passed
- [ ] Transactions visible in app
- [ ] Account balances updated
- [ ] FD maturities recorded
- [ ] Sweep transfers tracked
- [ ] Interest credits marked recurring

---

## Script Location

**Upload Script:**  
`/Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor/scripts/uploads/upload-transactions-kotak-july-october-2025.sql`

**Documentation:**  
`/Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor/docs/uploads/kotak-statement-upload-july-october-2025.md`

---

**Ready to upload? Run the command above! 🚀**

