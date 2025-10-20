# 📤 [BANK] [MONTH] [YEAR] Upload Guide

**Bank:** [BANK NAME]  
**Month:** [MONTH YEAR]  
**Account:** [ACCOUNT NUMBER]  
**Date Range:** [START DATE] - [END DATE]  
**Upload Date:** [UPLOAD DATE]

---

## 📊 Statement Overview

| Metric | Value |
|--------|-------|
| **Total Transactions** | [NUMBER] |
| **Opening Balance** | ₹[AMOUNT] |
| **Closing Balance** | ₹[AMOUNT] |
| **Total Income** | ₹[AMOUNT] |
| **Total Expenses** | ₹[AMOUNT] |
| **Total Transfers** | ₹[AMOUNT] |

---

## 📋 Transaction Breakdown

### By Type
| Type | Count | Total Amount |
|------|-------|--------------|
| Income | [#] | ₹[AMOUNT] |
| Expense | [#] | ₹[AMOUNT] |
| Transfer | [#] | ₹[AMOUNT] |

### By Category (Top 5)
| Category | Count | Total Amount |
|----------|-------|--------------|
| [CATEGORY 1] | [#] | ₹[AMOUNT] |
| [CATEGORY 2] | [#] | ₹[AMOUNT] |
| [CATEGORY 3] | [#] | ₹[AMOUNT] |
| [CATEGORY 4] | [#] | ₹[AMOUNT] |
| [CATEGORY 5] | [#] | ₹[AMOUNT] |

---

## 🔍 Pre-Upload Verification

### Data Quality Checks
- [ ] All transactions extracted from statement
- [ ] Dates formatted correctly (YYYY-MM-DD)
- [ ] Amounts verified against statement
- [ ] Balance progression calculated
- [ ] All transactions have unique references

### Account ID Verification
- [ ] Source account ID: `[ACCOUNT_ID]`
- [ ] Destination account IDs verified for transfers
- [ ] All IDs from ACCOUNT_MAPPING.json

### Transaction Classification
- [ ] Income transactions properly marked
- [ ] Expense transactions properly marked
- [ ] Transfer transactions properly marked
- [ ] All account IDs assigned correctly

---

## 📝 Data Preparation

### Files Created
1. **Transaction Data:**
   - File: `data/transactions/transactions_[BANK]_[Month]_[Year]_ENHANCED.json`
   - Transactions: [NUMBER]
   - Size: [SIZE]

2. **Upload Script:**
   - File: `scripts/uploads/upload-transactions-[bank]-[month]-[year].sql`
   - Format: SQL with bulk insert
   - Verification: Included

---

## 🎯 Upload Process

### Step 1: Review Data
```bash
# Check transaction data
cat data/transactions/transactions_[BANK]_[Month]_[Year]_ENHANCED.json | jq '.' | head
```

### Step 2: Connect to Database
```bash
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
export PGPASSWORD='[PASSWORD]'
```

### Step 3: Execute Upload
```bash
psql -h db.fzzbfgnmbchhmqepwmer.supabase.co -p 5432 -d postgres -U postgres \
     -f scripts/uploads/upload-transactions-[bank]-[month]-[year].sql
```

### Step 4: Verify Upload
```bash
psql -h db.fzzbfgnmbchhmqepwmer.supabase.co -p 5432 -d postgres -U postgres \
     -f scripts/verification/verify-[bank]-[month]-[year].sql
```

---

## 📊 Upload Results

### Transactions Inserted
- **Expected:** [NUMBER]
- **Inserted:** [NUMBER]
- **Duplicates:** [NUMBER]
- **Errors:** [NUMBER]

### Verification
- [ ] Transaction count matches
- [ ] Balance matches statement
- [ ] No duplicate references
- [ ] All transfers linked correctly

---

## ✅ Post-Upload Verification

### Database Checks
```sql
-- Check transaction count
SELECT COUNT(*) FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '[MONTH_START]' AND date <= '[MONTH_END]';

-- Check ending balance
SELECT (metadata->>'balance_after_transaction')::numeric
FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
ORDER BY date DESC, created_at DESC LIMIT 1;
```

### Results
- **Transaction Count:** [ACTUAL] (Expected: [EXPECTED]) ✅
- **Ending Balance:** ₹[ACTUAL] (Expected: ₹[EXPECTED]) ✅
- **Duplicates Found:** [NUMBER] ✅
- **All Verified:** ✅

---

## 📝 Notes

### Issues Encountered
[List any issues encountered during upload]

### Resolutions
[How issues were resolved]

### Special Cases
[Any special cases or unique transactions]

---

## 🎯 Next Steps

- [ ] Update `docs/reference/UPLOAD_STATUS.md`
- [ ] Create success summary document
- [ ] Prepare for next month's upload
- [ ] Archive this documentation

---

**Upload Status:** [In Progress / Complete]  
**Verification Status:** [Pending / Complete]  
**Documentation Status:** [Draft / Final]

