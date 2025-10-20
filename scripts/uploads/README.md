# 📤 Upload Scripts

**Purpose:** SQL scripts for uploading bank transactions to the database

---

## 📁 Directory Structure

```
uploads/
├── README.md (this file)
├── _templates/
│   └── upload-template.sql           # Template for new uploads
├── upload-transactions-icici-october-2025.sql
└── [historical scripts]
```

---

## 📋 Naming Convention

### Format
```
upload-transactions-[bank]-[month]-[year].sql
```

### Examples
```
upload-transactions-icici-october-2025.sql
upload-transactions-hdfc-november-2025.sql
upload-transactions-axis-september-2025.sql
```

### Rules
- ✅ Lowercase bank names
- ✅ Lowercase month names
- ✅ Year as 4 digits (2025, not 25)
- ✅ Hyphens between parts
- ✅ `.sql` extension

---

## 🎯 Current Upload Scripts

### Active (Month-Specific)
| Script | Bank | Month | Status |
|--------|------|-------|--------|
| `upload-transactions-icici-october-2025.sql` | ICICI | Oct 2025 | ✅ Complete |

### Templates & Historical
| Script | Purpose | Status |
|--------|---------|--------|
| `upload-bulk-transactions.sql` | Old template | 📦 Archive |
| `upload-transactions-complete.sql` | Old version | 📦 Archive |
| `upload-transactions-enhanced.sql` | Old version | 📦 Archive |

---

## 📝 Script Structure

### Required Components

1. **Header Comment**
   ```sql
   -- Upload [BANK] [MONTH] [YEAR] Transactions
   -- Generated: [DATE]
   -- Transactions: [COUNT]
   ```

2. **Transaction Data (JSON)**
   ```sql
   SELECT * FROM bulk_insert_transactions_with_duplicate_check('[
     {
       "user_id": "...",
       "name": "...",
       ...
     }
   ]'::jsonb);
   ```

3. **Verification Queries**
   ```sql
   -- Verify upload
   SELECT COUNT(*) as inserted_count
   FROM transactions_real
   WHERE ...;
   ```

---

## 🚀 Creating New Upload Script

### Step 1: Copy Template
```bash
cp scripts/uploads/_templates/upload-template.sql \
   scripts/uploads/upload-transactions-[bank]-[month]-[year].sql
```

### Step 2: Fill in Data
1. Update header with bank, month, year
2. Insert transaction JSON data
3. Update account IDs in verification

### Step 3: Test Upload
```bash
# Dry run (if template supports it)
psql -h [host] -p 5432 -d postgres -U postgres \
     -v dry_run=true \
     -f scripts/uploads/upload-transactions-[bank]-[month]-[year].sql
```

### Step 4: Execute Upload
```bash
psql -h [host] -p 5432 -d postgres -U postgres \
     -f scripts/uploads/upload-transactions-[bank]-[month]-[year].sql
```

---

## ✅ Best Practices

### Before Upload
- ✅ Verify transaction count in JSON
- ✅ Check all account IDs are correct
- ✅ Ensure all UPI/NEFT references are unique
- ✅ Validate balance progression
- ✅ Run pre-upload quality checks

### During Upload
- ✅ Use bulk insert function
- ✅ Let duplicate detection handle re-runs
- ✅ Monitor for errors
- ✅ Capture output for verification

### After Upload
- ✅ Run verification script
- ✅ Check transaction count
- ✅ Verify ending balance
- ✅ Document results in success summary

---

## 🔍 Finding Upload Scripts

### By Bank
```bash
# All ICICI uploads
ls scripts/uploads/upload-transactions-icici-*.sql

# All HDFC uploads
ls scripts/uploads/upload-transactions-hdfc-*.sql
```

### By Month
```bash
# All October uploads
ls scripts/uploads/*october-2025.sql

# All uploads for 2025
ls scripts/uploads/*-2025.sql
```

### Latest Upload
```bash
ls -t scripts/uploads/upload-transactions-*.sql | head -1
```

---

## 📊 Upload Function

### Function Used
```sql
bulk_insert_transactions_with_duplicate_check(transactions jsonb)
```

### Features
- ✅ Handles duplicate detection automatically
- ✅ Uses transaction hash for uniqueness
- ✅ Checks bank references
- ✅ Returns inserted and duplicate counts
- ✅ Safe to re-run

### Returns
```sql
-- Returns summary
{
  "inserted": 10,
  "duplicates": 0,
  "errors": []
}
```

---

## 🎯 Quick Reference

### Create Upload Script
```bash
# 1. Prepare data
cat data/transactions/transactions_[BANK]_[Month]_[Year]_ENHANCED.json

# 2. Create script
cp scripts/uploads/_templates/upload-template.sql \
   scripts/uploads/upload-transactions-[bank]-[month]-[year].sql

# 3. Edit script (add JSON data)
# 4. Upload
psql ... -f scripts/uploads/upload-transactions-[bank]-[month]-[year].sql

# 5. Verify
psql ... -f scripts/verification/verify-[bank]-[month]-[year].sql
```

---

## 🔗 Related Documentation

- **Upload Guide:** `docs/guides/TRANSACTION_UPLOAD_MASTER_GUIDE.md`
- **Verification Scripts:** `scripts/verification/README.md`
- **Upload Documentation:** `docs/uploads/`
- **Quick Start:** `QUICK_START_UPLOADS.md`

---

**Organization:** ✅ By Bank and Month  
**Naming:** ✅ Consistent Convention  
**Status:** ✅ Production Ready

---

**Last Updated:** October 20, 2025  
**Active Scripts:** 1  
**Template Version:** 2.0

