# 📝 Scripts Directory - Organized

**Purpose:** Transaction uploads, verification, and database utilities

---

## 📂 Directory Structure

```
scripts/
├── README.md (this file)
│
├── 🔌 Connection Scripts (Root - gitignored)
│   ├── db-connect.sh            # Full database connection
│   └── quick-connect.sh         # Quick connection
│
├── 📦 setup/                    # Initial setup & configuration
│   ├── README.md
│   ├── setup-service-key.sh     # Service key setup
│   ├── populate-with-service-key.js  # Populate balance history
│   └── quick-populate-history.sh     # Quick populate wrapper
│
├── 🛠️  utilities/               # Diagnostic & utility tools
│   ├── check-database.js        # Database connection test
│   ├── check-mom-calculation.js # Verify MoM calculations
│   └── ... (other utility scripts)
│
├── 🔧 maintenance/              # Maintenance & fixes
│   ├── force-balance-sync.js    # Sync balance tables
│   ├── fix-duplicates.sql
│   └── fix-transfer-links.sql
│
├── 📤 uploads/                  # Transaction upload scripts
│   ├── _templates/
│   │   └── upload-template.sql
│   ├── upload-transactions-hdfc-*.sql
│   ├── upload-transactions-icici-*.sql
│   ├── upload-transactions-idfc-*.sql
│   └── upload-bulk-transactions.sql
│
├── ✅ verification/             # Verification & testing
│   ├── _templates/
│   │   └── verify-template.sql
│   ├── verify-*-final.sql
│   ├── verification-queries.sql
│   ├── edge-case-tests.sql
│   └── final-verification.sql
│
├── 🔧 maintenance/              # Maintenance & fixes
│   ├── fix-duplicates.sql
│   └── fix-transfer-links.sql
│
├── 🔄 migrations/               # Database migrations
│   ├── populate_complete_account_metadata.sql
│   └── update_idfc_complete_metadata.sql
│
├── 🧪 tests/                    # Test scripts
│   ├── testBankStatement.ts
│   ├── testCSVParser.ts
│   ├── testCSVParsing.ts
│   ├── testNetWorthCRUD.ts
│   ├── testNetWorthCategories.ts
│   ├── testOpenAI.ts
│   └── testRealData.ts
│
├── 🛠️ utilities/                # Utility scripts
│   ├── fetch-all-accounts.sql
│   ├── capture-complete-schema.sql
│   ├── checkBalanceRealTable.sql
│   ├── cleanup_net_worth_data.sql
│   ├── populateBalanceReal.sql
│   ├── populateNetWorthFromMobileData.ts
│   ├── populateSampleNetWorthData.ts
│   ├── demoCSVParser.ts
│   └── account-bank-mapping.json
│
└── 📄 check-database.js         # Database connection check
```

---

## 📋 Script Categories

### 🔌 Connection Scripts (Root)
**Location:** `scripts/` (gitignored)

| Script | Purpose |
|--------|---------|
| `db-connect.sh` | Full connection with environment setup |
| `quick-connect.sh` | Quick PSQL connection |

**⚠️ Security:** Both gitignored - contain credentials

---

### 📦 Setup Scripts
**Location:** `scripts/setup/`

| Script | Purpose |
|--------|---------|
| `setup-service-key.sh` | Interactive setup for Supabase service role key |
| `populate-with-service-key.js` | Populate 12 months of balance history for all accounts |
| `quick-populate-history.sh` | Quick wrapper for balance history population |

**Usage:**
```bash
# First time setup
bash scripts/setup/setup-service-key.sh
node scripts/setup/populate-with-service-key.js

# Verify
node scripts/utilities/check-mom-calculation.js
```

---

### 🛠️ Utility Scripts
**Location:** `scripts/utilities/`

| Script | Purpose |
|--------|---------|
| `check-database.js` | Test database connection |
| `check-mom-calculation.js` | Verify MoM calculations and display expected values |
| (other utilities) | Schema capture, CSV parsers, etc. |

**Usage:**
```bash
# Check database connection
node scripts/utilities/check-database.js

# Verify MoM calculation
node scripts/utilities/check-mom-calculation.js
```

---

### 🔧 Maintenance Scripts
**Location:** `scripts/maintenance/`

| Script | Purpose |
|--------|---------|
| `force-balance-sync.js` | Sync balance_real table with accounts_real |
| `fix-duplicates.sql` | Remove duplicate transactions |
| `fix-transfer-links.sql` | Fix broken transfer links |

**Usage:**
```bash
# Sync balances (when app shows wrong totals)
node scripts/maintenance/force-balance-sync.js

# Fix duplicates
psql [connection] -f scripts/maintenance/fix-duplicates.sql
```

---

### 📤 Upload Scripts
**Location:** `scripts/uploads/`

| Script | Purpose | Month |
|--------|---------|-------|
| `upload-bulk-transactions.sql` | Template for bulk uploads | - |
| `upload-transactions-complete.sql` | September complete upload | Sept 2025 |
| `upload-transactions-enhanced.sql` | September enhanced | Sept 2025 |
| `upload-transactions-october.sql` | October upload | Oct 2025 |

**Usage:**
```bash
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
export PGPASSWORD='[PASSWORD]'
psql -h db.fzzbfgnmbchhmqepwmer.supabase.co -p 5432 -d postgres -U postgres \
     -f scripts/uploads/upload-transactions-october.sql
```

**Naming Convention:**
```
upload-transactions-[bank]-[month]-[year].sql
Example: upload-transactions-hdfc-november-2025.sql
```

---

### ✅ Verification Scripts
**Location:** `scripts/verification/`

| Script | Purpose |
|--------|---------|
| `verify-october-final.sql` | October final verification |
| `verify-october-upload.sql` | October upload verification |
| `verification-queries.sql` | General verification queries |
| `edge-case-tests.sql` | Edge case testing |
| `final-verification.sql` | Comprehensive verification |

**Usage:**
```bash
psql -h [HOST] -p 5432 -d postgres -U postgres \
     -f scripts/verification/verify-october-final.sql
```

**Purpose:**
- Verify transaction counts
- Check balances
- Test duplicates
- Validate transfers

---

### 🔧 Maintenance Scripts
**Location:** `scripts/maintenance/`

| Script | Purpose |
|--------|---------|
| `fix-duplicates.sql` | Remove duplicate transactions |
| `fix-transfer-links.sql` | Fix broken transfer links |

**Usage:**
```bash
# Remove duplicates
psql -h [HOST] -p 5432 -d postgres -U postgres \
     -f scripts/maintenance/fix-duplicates.sql

# Fix transfers
psql -h [HOST] -p 5432 -d postgres -U postgres \
     -f scripts/maintenance/fix-transfer-links.sql
```

---

### 🧪 Test Scripts
**Location:** `scripts/tests/`

| Script | Purpose | Language |
|--------|---------|----------|
| `testBankStatement.ts` | Test bank statement parsing | TypeScript |
| `testCSVParser.ts` | Test CSV parser | TypeScript |
| `testCSVParsing.ts` | Test CSV parsing logic | TypeScript |
| `testNetWorthCRUD.ts` | Test net worth CRUD ops | TypeScript |
| `testNetWorthCategories.ts` | Test net worth categories | TypeScript |
| `testOpenAI.ts` | Test OpenAI integration | TypeScript |
| `testRealData.ts` | Test with real data | TypeScript |

**Usage:**
```bash
# Run TypeScript tests
npx ts-node scripts/tests/testBankStatement.ts
```

---

### 🛠️ Utility Scripts
**Location:** `scripts/utilities/`

#### SQL Utilities
| Script | Purpose |
|--------|---------|
| `fetch-all-accounts.sql` | Fetch all account data |
| `capture-complete-schema.sql` | Capture database schema |
| `checkBalanceRealTable.sql` | Check balance table |
| `cleanup_net_worth_data.sql` | Clean net worth data |
| `populateBalanceReal.sql` | Populate balance table |

#### TypeScript Utilities
| Script | Purpose |
|--------|---------|
| `populateNetWorthFromMobileData.ts` | Populate net worth from mobile |
| `populateSampleNetWorthData.ts` | Create sample net worth data |
| `demoCSVParser.ts` | Demo CSV parser |

#### Data Files
| File | Purpose |
|------|---------|
| `account-bank-mapping.json` | Account mapping reference |

---

## 🎯 Quick Usage Guide

### Upload New Month
1. Create formatted JSON data
2. Create upload script: `scripts/uploads/upload-transactions-[bank]-[month]-[year].sql`
3. Run upload:
   ```bash
   psql -h [HOST] -p 5432 -d postgres -U postgres \
        -f scripts/uploads/[your-script].sql
   ```

### Verify Upload
1. Run verification:
   ```bash
   psql -h [HOST] -p 5432 -d postgres -U postgres \
        -f scripts/verification/verify-[month]-final.sql
   ```

### Fix Issues
1. Identify issue (duplicates, broken transfers, etc.)
2. Run appropriate maintenance script:
   ```bash
   psql -h [HOST] -p 5432 -d postgres -U postgres \
        -f scripts/maintenance/fix-[issue].sql
   ```

---

## 📝 Creating New Scripts

### Upload Script Template
```sql
-- File: scripts/uploads/upload-transactions-[bank]-[month]-[year].sql

\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
\set account_id '[ACCOUNT_ID]'

-- Pre-verification
SELECT * FROM transactions_real WHERE ... LIMIT 5;

-- Upload
SELECT * FROM bulk_insert_transactions_with_duplicate_check('[...]'::jsonb);

-- Post-verification
SELECT COUNT(*), SUM(amount) FROM transactions_real WHERE ...;
```

### Naming Conventions
```
uploads/upload-transactions-[bank]-[month]-[year].sql
verification/verify-[bank]-[month]-[year].sql
maintenance/fix-[issue-description].sql
tests/test[Feature].ts
utilities/[descriptive-name].sql
```

---

## 🔐 Security

### Gitignored (Root Level)
- ✅ `db-connect.sh` - Contains credentials
- ✅ `quick-connect.sh` - Contains credentials

### Safe to Commit
- ✅ All `.sql` files in subdirectories
- ✅ All `.ts` files
- ✅ README files
- ✅ JSON reference files

---

## 📚 Related Documentation

- [Transaction Upload Master Guide](../docs/guides/TRANSACTION_UPLOAD_MASTER_GUIDE.md)
- [Quick Start Uploads](../QUICK_START_UPLOADS.md)
- [Database Setup Guide](../docs/guides/DATABASE_SETUP_GUIDE.md)
- [Upload Status](../docs/reference/UPLOAD_STATUS.md)

---

## ✅ Best Practices

### Before Running Scripts
1. ✅ Backup database (if needed)
2. ✅ Test on sample data first
3. ✅ Review script contents
4. ✅ Set correct variables (user_id, account_id)

### After Running Scripts
1. ✅ Verify results
2. ✅ Document outcomes
3. ✅ Update upload status
4. ✅ Archive if needed

### Maintenance
1. ✅ Keep scripts organized in subdirectories
2. ✅ Follow naming conventions
3. ✅ Document purpose in comments
4. ✅ Archive old scripts

---

**Directory Organization:** ✅ Clean & Categorized  
**Total Scripts:** 30+ organized files  
**Security:** ✅ Credentials gitignored  
**Status:** 🎯 Production Ready

---

**Last Updated:** October 19, 2025  
**Version:** 2.0 - Organized Structure
