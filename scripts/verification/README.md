# ✅ Verification Scripts

**Purpose:** SQL scripts for verifying uploaded transactions and data integrity

---

## 📁 Directory Structure

```
verification/
├── README.md (this file)
├── _templates/
│   └── verify-template.sql           # Template for new verifications
├── verify-icici-october-2025.sql     # October ICICI verification
├── verify-october-final.sql          # Final October verification
└── [other verification scripts]
```

---

## 📋 Naming Convention

### For Month-Specific Verifications
```
verify-[bank]-[month]-[year].sql
```

### Examples
```
verify-icici-october-2025.sql
verify-hdfc-november-2025.sql
verify-axis-september-2025.sql
```

### For General Verifications
```
verification-queries.sql          # General queries
final-verification.sql            # Complete verification
edge-case-tests.sql              # Edge case testing
```

---

## 🎯 Current Verification Scripts

### Month-Specific
| Script | Bank | Month | Purpose |
|--------|------|-------|---------|
| `verify-icici-october-2025.sql` | ICICI | Oct 2025 | October upload verification |
| `verify-october-final.sql` | ICICI | Oct 2025 | Comprehensive check |

### General Purpose
| Script | Purpose | Use Case |
|--------|---------|----------|
| `verification-queries.sql` | General checks | Ongoing monitoring |
| `final-verification.sql` | Complete system check | End-to-end validation |
| `edge-case-tests.sql` | Edge case testing | Quality assurance |

---

## 📝 Script Components

### Standard Verification Checks

1. **Transaction Count**
   ```sql
   -- Total transactions for month
   SELECT COUNT(*) FROM transactions_real
   WHERE date >= 'YYYY-MM-01' AND date <= 'YYYY-MM-31';
   ```

2. **By Transaction Type**
   ```sql
   -- Count and amount by type
   SELECT type, COUNT(*), SUM(amount)
   FROM transactions_real
   GROUP BY type;
   ```

3. **Ending Balance**
   ```sql
   -- Latest balance from metadata
   SELECT (metadata->>'balance_after_transaction')::numeric
   FROM transactions_real
   ORDER BY date DESC LIMIT 1;
   ```

4. **Duplicate Check**
   ```sql
   -- Find duplicate bank references
   SELECT metadata->>'bank_reference', COUNT(*)
   FROM transactions_real
   GROUP BY metadata->>'bank_reference'
   HAVING COUNT(*) > 1;
   ```

5. **Transfer Links**
   ```sql
   -- Verify transfer connections
   SELECT * FROM transactions_real
   WHERE type = 'transfer'
   AND destination_account_id IS NOT NULL;
   ```

6. **Balance Progression**
   ```sql
   -- Check balance sequence
   SELECT date, amount, 
          (metadata->>'balance_after_transaction')::numeric
   FROM transactions_real
   ORDER BY date, created_at;
   ```

---

## 🚀 Creating Verification Script

### Step 1: Copy Template
```bash
cp scripts/verification/_templates/verify-template.sql \
   scripts/verification/verify-[bank]-[month]-[year].sql
```

### Step 2: Customize
1. Update header with bank, month, year
2. Set account ID
3. Set date range
4. Update expected values

### Step 3: Run Verification
```bash
psql -h [host] -p 5432 -d postgres -U postgres \
     -f scripts/verification/verify-[bank]-[month]-[year].sql
```

---

## ✅ Verification Checklist

### After Every Upload
- [ ] Transaction count matches expected
- [ ] No duplicate bank references
- [ ] Ending balance matches statement
- [ ] All transfers have destination IDs
- [ ] Balance progression is correct
- [ ] All metadata fields populated
- [ ] No errors in output

### Expected Results
- **Transaction Count:** Matches upload
- **Duplicates:** 0
- **Balance:** Matches bank statement
- **Transfers:** All linked correctly
- **Errors:** None

---

## 🔍 Finding Verification Scripts

### By Bank
```bash
# All ICICI verifications
ls scripts/verification/verify-icici-*.sql

# All HDFC verifications
ls scripts/verification/verify-hdfc-*.sql
```

### By Month
```bash
# All October verifications
ls scripts/verification/*october-2025.sql

# All 2025 verifications
ls scripts/verification/*-2025.sql
```

### Latest
```bash
ls -t scripts/verification/verify-*.sql | head -1
```

---

## 📊 Verification Queries

### Quick Checks
```sql
-- Total transactions
SELECT COUNT(*) FROM transactions_real;

-- Last 10 transactions
SELECT date, name, amount FROM transactions_real
ORDER BY date DESC LIMIT 10;

-- Total by type
SELECT type, COUNT(*), SUM(amount)
FROM transactions_real
GROUP BY type;
```

### Deep Validation
```sql
-- Orphaned transfers (missing destination)
SELECT * FROM transactions_real
WHERE type = 'transfer'
AND destination_account_id IS NULL;

-- Balance gaps (missing progression)
WITH balance_check AS (
  SELECT date, 
         (metadata->>'balance_after_transaction')::numeric as balance,
         LAG((metadata->>'balance_after_transaction')::numeric) 
           OVER (ORDER BY date) as prev_balance
  FROM transactions_real
  WHERE source_account_id = '[ACCOUNT_ID]'
)
SELECT * FROM balance_check
WHERE balance IS NULL;
```

---

## 🎯 Common Verification Patterns

### Pattern 1: Post-Upload Verification
```bash
# Right after upload
psql ... -f scripts/uploads/upload-transactions-icici-october-2025.sql
psql ... -f scripts/verification/verify-icici-october-2025.sql
```

### Pattern 2: Monthly Audit
```bash
# End of month check
psql ... -f scripts/verification/final-verification.sql
```

### Pattern 3: Debug Investigation
```bash
# When something looks wrong
psql ... -f scripts/verification/edge-case-tests.sql
psql ... -f scripts/verification/verification-queries.sql
```

---

## ⚠️ Red Flags

### Critical Issues
- ❌ Duplicate bank references (except planned duplicates)
- ❌ Missing destination IDs for transfers
- ❌ Balance doesn't match statement
- ❌ Transaction count mismatch
- ❌ Negative balances (unless overdraft)

### Warnings
- ⚠️ Large gaps in dates
- ⚠️ Unusual transaction amounts
- ⚠️ Missing metadata fields
- ⚠️ Inconsistent balance progression

---

## 🔗 Related Documentation

- **Upload Scripts:** `scripts/uploads/README.md`
- **Upload Guide:** `docs/guides/TRANSACTION_UPLOAD_MASTER_GUIDE.md`
- **Upload Documentation:** `docs/uploads/`

---

**Organization:** ✅ By Bank and Month  
**Naming:** ✅ Consistent Convention  
**Status:** ✅ Production Ready

---

**Last Updated:** October 20, 2025  
**Active Scripts:** 2  
**Template Version:** 2.0

