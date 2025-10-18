# 🎯 Bulk Transaction Upload System - Complete Setup

## 📦 What We've Created

A complete system to bulk upload monthly bank transactions using ChatGPT to transform CSV → JSON → Supabase.

---

## 🚀 Quick Start (Choose Your Path)

### Path A: Automatic Setup (2 minutes)
**When**: You have accounts in the app already

```bash
# Make sure you're logged into the app first!
npm start   # Login through the UI

# Then run the auto-fetch script
npx tsx scripts/simple-fetch.ts your@email.com
```

**Output**: 3 ready-to-use files with your actual UUIDs!

---

### Path B: Manual Setup (5 minutes)  
**When**: You prefer SQL or don't have accounts yet

1. Open `START_HERE.md`
2. Follow Method 2 (Manual SQL)
3. Run `GET_ALL_MAPPING_DATA.sql` in Supabase SQL Editor
4. Copy your UUIDs manually

---

##  📁 Files Created

### 🎯 Setup & Getting Started
| File | Purpose | When to Use |
|------|---------|-------------|
| **`README.md`** | This file - overview | Start here |
| **`START_HERE.md`** | Setup guide with 2 methods | First time setup |
| **`SETUP_INSTRUCTIONS.md`** | Detailed setup steps | If you need help |

### 🤖 Auto-Fetch Scripts (Easiest Method)
| File | Purpose | Command |
|------|---------|---------|
| **`simple-fetch.ts`** | Fetch data without login | `npx tsx scripts/simple-fetch.ts email` |
| **`fetch-mapping-data.ts`** | Fetch with auth | `npx tsx scripts/fetch-mapping-data.ts` |
| **`login-and-fetch.ts`** | Login then fetch | `npx tsx scripts/login-and-fetch.ts email pass` |

### 🗄️ Manual SQL Method
| File | Purpose | Where to Run |
|------|---------|--------------|
| **`GET_ALL_MAPPING_DATA.sql`** | Complete SQL query | Supabase SQL Editor |

### 📚 Documentation & Guides
| File | Purpose | Who Should Read |
|------|---------|-----------------|
| **`QUICK_START_GUIDE.md`** | First upload walkthrough | First-time users |
| **`BULK_UPLOAD_WORKFLOW.md`** | Complete monthly workflow | Regular users |
| **`CHEAT_SHEET.md`** | Quick command reference | Everyone |
| **`SYSTEM_OVERVIEW.md`** | Architecture & design | Power users |

### 🤖 ChatGPT Integration
| File | Purpose | How to Use |
|------|---------|------------|
| **`chatgpt-bank-transform-prompt.md`** | Transform CSV to JSON | Copy-paste into ChatGPT |
| **`READY_TO_USE_PROMPT.md`** | Auto-generated with your UUID | Created by scripts |

### 🗄️ SQL & Upload
| File | Purpose | Where to Run |
|------|---------|--------------|
| **`upload-bulk-transactions.sql`** | Upload & verify queries | Supabase SQL Editor |
| **`READY_TO_USE_QUERIES.sql`** | Auto-generated with your UUID | Created by scripts |

### ⚙️ Configuration
| File | Purpose | Update When |
|------|---------|-------------|
| **`account-bank-mapping.json`** | Your UUID mapping | After setup, when adding accounts |

### 📝 Examples
| File | Purpose |
|------|---------|
| **`example-transactions.json`** | Sample transaction format |

---

## 🎯 Complete Workflow

### One-Time Setup (Choose One)

#### Option 1: Automatic (Recommended)
```bash
# 1. Make sure you have accounts in the app
# 2. Run the script
npx tsx scripts/simple-fetch.ts your@email.com

# Output: 
# ✅ account-bank-mapping.json (with real UUIDs)
# ✅ READY_TO_USE_PROMPT.md (ChatGPT prompt)
```

#### Option 2: Manual SQL
```bash
# 1. Open Supabase SQL Editor
# 2. Copy & run GET_ALL_MAPPING_DATA.sql
# 3. Copy your user_id from results
# 4. Update account-bank-mapping.json manually
```

---

### Monthly Upload (Every Month)

```
1. Download bank statements (CSV/Excel)
   ↓
2. Open READY_TO_USE_PROMPT.md (or chatgpt-bank-transform-prompt.md)
   ↓
3. Copy prompt + add CSV data → Paste into ChatGPT
   ↓
4. Save JSON output as transactions_BANK_MONTH.json
   ↓
5. Open Supabase SQL Editor
   ↓
6. Run: SELECT * FROM validate_bulk_transactions('[JSON]'::jsonb);
   ↓
7. Run: SELECT * FROM bulk_insert_transactions('[JSON]'::jsonb);
   ↓
8. Verify: Check transaction count matches
```

**Time**: ~10 minutes per bank

---

## ✅ Prerequisites

Before you can upload transactions, you need:

- [ ] **Supabase account** with access to your project
- [ ] **User account** created in the app (logged in at least once)
- [ ] **At least one account** created (ICICI, HDFC, etc.)
- [ ] **Categories** (optional but recommended)
- [ ] **Bank statement** downloaded (CSV or Excel format)

---

## 🚧 Current Status

Based on our test, your database currently has:
- ❌ **No accounts found**

### What to Do Next:

1. **Open the app**
   ```bash
   npm start
   ```

2. **Create your first account**
   - Login or signup
   - Go to Accounts section
   - Add at least one bank account (ICICI, HDFC, etc.)

3. **Create budget categories** (optional)
   - Go to Budget section
   - Create categories like: Shopping, Food, Bills, etc.

4. **Run the auto-fetch script again**
   ```bash
   npx tsx scripts/simple-fetch.ts your@email.com
   ```

---

## 📖 Recommended Reading Order

### 🆕 Brand New User (Never Used This Before)
1. Read: `README.md` (you are here)
2. Read: `START_HERE.md`
3. Setup accounts in the app
4. Run: Auto-fetch script OR Manual SQL
5. Read: `QUICK_START_GUIDE.md`
6. Do: First upload!

### 🔄 Ready to Upload (Setup Done)
1. Check: `CHEAT_SHEET.md` (quick reference)
2. Use: `READY_TO_USE_PROMPT.md` (if auto-generated)
3. Or: `chatgpt-bank-transform-prompt.md` (manual)
4. Upload: Use `upload-bulk-transactions.sql`

### 🔧 Need Help
1. Check: `TROUBLESHOOTING` section below
2. Read: `BULK_UPLOAD_WORKFLOW.md` (detailed guide)
3. Review: `SYSTEM_OVERVIEW.md` (architecture)

---

## 🆘 Troubleshooting

### "No accounts found"
→ **Solution**: Create accounts in the app first
```bash
npm start  # Open app → Accounts → Add Account
```

### "Script fails with auth error"
→ **Solution**: Use the Manual SQL method instead
- Open `GET_ALL_MAPPING_DATA.sql`
- Run in Supabase SQL Editor

### "Can't access Supabase SQL Editor"
→ **Solution**: Check your Supabase project access
- Make sure you're logged into correct project
- Refresh the page
- Check you have proper permissions

### "Balance column doesn't exist"
→ **Solution**: This is expected! We've fixed the scripts
- The schema doesn't have a balance column
- Use the latest version of the scripts

### "Multiple users found"
→ **Solution**: Provide your specific user ID
- Run the Manual SQL method
- Use your specific email address

---

## 🎓 Learning Path

### Week 1: Setup & First Upload
- [ ] Complete one-time setup
- [ ] Get your UUIDs
- [ ] Download one bank statement
- [ ] Transform with ChatGPT
- [ ] Upload successfully
- [ ] Verify in database

### Week 2-4: Monthly Routine
- [ ] Upload for all banks
- [ ] Optimize your workflow
- [ ] Add category mappings
- [ ] Mark recurring transactions

### Month 2+: Power User
- [ ] Automated categorization
- [ ] Recurring detection
- [ ] Custom SQL queries
- [ ] Batch processing

---

## 🎉 Success Metrics

You'll know it's working when:
- ✅ Auto-fetch script runs successfully
- ✅ `READY_TO_USE_PROMPT.md` is generated with your UUID
- ✅ ChatGPT transforms your CSV correctly
- ✅ Validation passes (`is_valid: true`)
- ✅ Upload succeeds (`status: SUCCESS`)
- ✅ Transaction count matches bank statement
- ✅ Amounts and dates are correct

---

## 📊 What's Next?

### Right Now (If Not Set Up)
1. Create accounts in the app
2. Run auto-fetch script
3. Review generated files

### After Setup
1. Download your September bank statement
2. Use the ChatGPT prompt
3. Upload your first batch!

### Monthly Routine
1. Download statements (5 min)
2. Transform with ChatGPT (5 min per bank)
3. Upload to Supabase (2 min per bank)
4. Verify totals (2 min)

**Total time**: ~10-15 minutes per bank, per month

---

## 💡 Pro Tips

1. **Save your UUID** somewhere safe (password manager)
2. **Keep mapping file updated** as you add accounts
3. **Test with small batch** first (5-10 transactions)
4. **Validate before uploading** (always!)
5. **Check for duplicates** if re-uploading same month
6. **Archive CSV + JSON** files for future reference
7. **Categorize right after upload** for better tracking

---

## 🔗 Quick Links

| Need | File |
|------|------|
| Setup help | `START_HERE.md` |
| First upload | `QUICK_START_GUIDE.md` |
| Quick commands | `CHEAT_SHEET.md` |
| Full workflow | `BULK_UPLOAD_WORKFLOW.md` |
| ChatGPT prompt | `chatgpt-bank-transform-prompt.md` or `READY_TO_USE_PROMPT.md` |
| SQL queries | `upload-bulk-transactions.sql` or `READY_TO_USE_QUERIES.sql` |
| Examples | `example-transactions.json` |

---

## 🎯 Your Action Items

**Right Now**:
1. [ ] Create accounts in the app (if you haven't)
2. [ ] Run: `npx tsx scripts/simple-fetch.ts your@email.com`
3. [ ] Check generated files

**This Week**:
4. [ ] Download September bank statement
5. [ ] Transform using ChatGPT
6. [ ] Upload to Supabase
7. [ ] Verify upload

**This Month**:
8. [ ] Upload for all banks
9. [ ] Categorize transactions
10. [ ] Mark recurring payments

---

**Let's get your accounts set up and start uploading! 🚀**

**Questions?** Open `START_HERE.md` for step-by-step guidance.

