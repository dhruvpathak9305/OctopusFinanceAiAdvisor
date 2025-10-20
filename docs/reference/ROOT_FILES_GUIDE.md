# 📂 Root Directory Files - Essential Only

**Last Updated:** October 19, 2025  
**Purpose:** Keep root directory minimal and clean

---

## ✅ Files That SHOULD Be in Root

### Essential Documentation
```
✅ README.md                  # Project overview & entry point
✅ SETUP.md                   # Initial setup instructions
✅ START_HERE.md              # Quick orientation guide
✅ QUICK_START_UPLOADS.md     # Fast upload reference
```

### Configuration Files
```
✅ package.json               # NPM dependencies
✅ tsconfig.json              # TypeScript configuration
✅ babel.config.js            # Babel configuration
✅ metro.config.js            # Metro bundler config
✅ app.config.js              # Expo app configuration
✅ .gitignore                 # Git ignore rules
✅ .env (gitignored)          # Environment variables
✅ pnpm-lock.yaml             # Package lock file
✅ pnpm-workspace.yaml        # PNPM workspace config
```

### Data Reference (Non-Sensitive)
```
✅ ACCOUNT_MAPPING.json       # Bank account IDs reference
```

### Build/System Files
```
✅ index.js                   # Entry point
✅ grok.webp                  # Image assets (if needed)
```

---

## ❌ Files That Should NOT Be in Root

### Documentation → docs/
```
❌ Any detailed guides → docs/guides/
❌ Upload summaries → docs/uploads/
❌ Verification reports → docs/verification/
❌ Session summaries → docs/archives/
❌ Feature docs → docs/[feature-name]/
❌ Cleanup summaries → docs/archives/
❌ Reorganization docs → docs/archives/
❌ Credentials docs → docs/reference/ (gitignored)
```

### Data Files → data/
```
❌ *_ENHANCED.json → data/accounts/ or data/transactions/
❌ transactions_*.json → data/transactions/
❌ account_statement_*.json → data/statements/
❌ fixed_deposits_*.json → data/statements/
❌ merchants_*.json → data/statements/
```

### SQL Files → database/
```
❌ supabase-*.sql → database/queries/
❌ Any other .sql files → database/queries/ or database/migrations/
```

---

## 📊 Current Root Directory (Target)

```
📦 Root (8 essential files only)
│
├── 📖 Documentation (4 files)
│   ├── README.md
│   ├── SETUP.md
│   ├── START_HERE.md
│   └── QUICK_START_UPLOADS.md
│
├── ⚙️ Configuration (7+ files)
│   ├── package.json
│   ├── tsconfig.json
│   ├── babel.config.js
│   ├── metro.config.js
│   ├── app.config.js
│   ├── .gitignore
│   └── ... (other config files)
│
├── 📊 Reference (1 file)
│   └── ACCOUNT_MAPPING.json
│
└── 🏗️ Build (1 file)
    └── index.js
```

---

## 🎯 Goal: Maximum 15 Files in Root

### Categories
1. **Essential Documentation:** 4 files
2. **Configuration:** ~8 files
3. **Reference:** 1 file
4. **Build/Entry:** 1-2 files
5. **Package Management:** 2 files

**Total:** ~12-15 files maximum

---

## 🧹 Cleanup Checklist

When you find files in root, ask:

### Is it documentation?
- ✅ README, SETUP, START_HERE → Keep in root
- ❌ Everything else → Move to `docs/`

### Is it configuration?
- ✅ package.json, tsconfig, babel, etc. → Keep in root
- ❌ Environment-specific → Keep but gitignore

### Is it data?
- ❌ All data files → Move to `data/`
- ✅ ACCOUNT_MAPPING.json → Keep (reference only, no sensitive data)

### Is it SQL?
- ❌ All SQL files → Move to `database/`

### Is it a script?
- ❌ All scripts → Move to `scripts/`

---

## 📋 Moving Files

### Documentation
```bash
# Move to appropriate docs folder
mv [DOC_FILE].md docs/[category]/
```

### Data Files
```bash
# Move to data directory
mv *_ENHANCED.json data/accounts/
mv transactions_*.json data/transactions/
mv account_statement_*.json data/statements/
```

### SQL Files
```bash
# Move to database
mv *.sql database/queries/
```

---

## ✅ Verification

### Check Root is Clean
```bash
# Should show only ~12-15 files
ls -1 | wc -l

# Should show only essential files
ls -1 *.md *.json
```

### Expected Output
```
README.md
SETUP.md
START_HERE.md
QUICK_START_UPLOADS.md
ACCOUNT_MAPPING.json
package.json
tsconfig.json
```

---

## 🎯 Maintenance

### Weekly Check
- [ ] Scan root for new documentation files
- [ ] Move any new docs to `docs/`
- [ ] Move any data files to `data/`
- [ ] Keep root minimal

### After Each Upload
- [ ] Save summaries in `docs/uploads/`
- [ ] Don't leave files in root
- [ ] Update `docs/reference/UPLOAD_STATUS.md`

---

## 🚫 Common Mistakes

### Don't Do This
```
❌ Create session_notes.md in root
❌ Leave UPLOAD_SUMMARY.md in root
❌ Keep old cleanup docs in root
❌ Store data files in root
❌ Leave SQL queries in root
```

### Do This Instead
```
✅ docs/archives/session_notes.md
✅ docs/uploads/UPLOAD_SUMMARY.md
✅ docs/archives/cleanup_docs.md
✅ data/[category]/data_file.json
✅ database/queries/query.sql
```

---

## 📚 Reference

### All Documentation → docs/
See [docs/README.md](../README.md) for complete organization

### All Data → data/
See [data/README.md](../../data/README.md) for data structure

### All SQL → database/
See [database/README.md](../../database/README.md) for database files

---

**Last Updated:** October 19, 2025  
**Target:** ≤15 files in root  
**Status:** ✅ Production Standard

