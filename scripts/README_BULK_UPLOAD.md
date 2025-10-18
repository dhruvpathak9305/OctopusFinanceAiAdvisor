# 💼 Bank Transaction Bulk Upload System

## 📖 Overview

This system allows you to **bulk upload monthly bank transactions** to your Supabase database using ChatGPT to transform raw bank statements into the correct JSON format.

---

## 🎯 Why This System?

- ✅ **Bypasses** unreliable in-app bulk upload
- ✅ **Automated** data transformation with ChatGPT
- ✅ **Consistent** formatting across all banks
- ✅ **Validated** before upload (prevents errors)
- ✅ **Transparent** SQL-based upload process
- ✅ **Future-proof** JSON format

---

## 📚 Documentation Files

### 🚀 Start Here
- **`QUICK_START_GUIDE.md`** - 5-minute setup + first upload
  - Best for: First-time users
  - Time: 10-15 minutes total

### 📋 Main Documentation
- **`BULK_UPLOAD_WORKFLOW.md`** - Complete monthly workflow
  - Best for: Regular monthly uploads
  - Includes: Tips, best practices, troubleshooting

### 🤖 ChatGPT Prompt
- **`chatgpt-bank-transform-prompt.md`** - Full transformation prompt
  - Copy-paste this into ChatGPT
  - Includes: Schema, validation rules, examples

### 🗄️ SQL Scripts
- **`upload-bulk-transactions.sql`** - Upload and verification queries
  - Validation queries
  - Upload queries
  - Verification queries
  - Advanced categorization

### 🗺️ Configuration
- **`account-bank-mapping.json`** - Your account/bank mapping
  - One-time setup
  - Keep updated with new accounts

### 📝 Examples
- **`example-transactions.json`** - Sample JSON output
  - Reference for format
  - Shows all field types

---

## 🔄 Workflow Summary

```
┌─────────────────────┐
│ Download Bank CSV   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Prepare Prompt      │
│ (Add UUID, bank)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ ChatGPT Transform   │
│ CSV → JSON          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Validate JSON       │
│ (Supabase SQL)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Check Duplicates    │
│ (Optional)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Upload to Supabase  │
│ bulk_insert_...()   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Verify Upload       │
│ (Check counts)      │
└─────────────────────┘
```

---

## 📊 Database Schema Reference

### Required Fields
```typescript
{
  user_id: UUID,           // Your user UUID
  name: string,            // Transaction name
  amount: number,          // Always positive
  type: string,            // income|expense|transfer|...
  source_account_type: string  // bank|credit_card|...
}
```

### Transaction Types
- `income` - Money coming in
- `expense` - Money going out
- `transfer` - Moving between accounts
- `loan` - Taking a loan
- `loan_repayment` - Repaying a loan
- `debt` - Borrowing money
- `debt_collection` - Collecting debt

### Account Types
- `bank` - Bank account
- `credit_card` - Credit card
- `cash` - Cash
- `digital_wallet` - UPI/PayTM/GPay
- `investment` - Investment account
- `other` - Other types

---

## 🔧 Setup Checklist

- [ ] Get user UUID from Supabase
- [ ] Get account UUIDs (if linking to specific accounts)
- [ ] Update `account-bank-mapping.json`
- [ ] Test with `example-transactions.json`
- [ ] Download first bank statement
- [ ] Transform with ChatGPT
- [ ] Validate and upload
- [ ] Verify results

---

## 📦 Files in This Directory

```
scripts/
├── README_BULK_UPLOAD.md              ← You are here
├── QUICK_START_GUIDE.md               ← Start here!
├── BULK_UPLOAD_WORKFLOW.md            ← Complete guide
├── chatgpt-bank-transform-prompt.md   ← ChatGPT prompt
├── upload-bulk-transactions.sql       ← SQL queries
├── account-bank-mapping.json          ← Your config
└── example-transactions.json          ← Sample data
```

---

## 💡 Common Use Cases

### First Time Upload
1. Read `QUICK_START_GUIDE.md`
2. Follow steps exactly
3. Test with small dataset first

### Monthly Routine Upload
1. Download statements
2. Use saved ChatGPT prompt
3. Transform → Validate → Upload
4. Time: ~10 minutes per bank

### Historical Data Import
1. Download multiple months
2. Process one month at a time
3. Verify each before continuing
4. Use duplicate detection

### Multi-Bank Upload
1. Process all banks same day
2. Use consistent naming
3. Track in spreadsheet
4. Verify totals match statements

---

## 🎓 Learning Path

### Beginner (First Upload)
1. `QUICK_START_GUIDE.md`
2. `example-transactions.json`
3. First successful upload

### Intermediate (Monthly Routine)
1. `BULK_UPLOAD_WORKFLOW.md`
2. Batch processing multiple banks
3. Post-upload categorization

### Advanced (Automation & Optimization)
1. Custom category mappings
2. Automated recurring marking
3. Account linking
4. Duplicate prevention strategies

---

## 🚨 Troubleshooting Resources

### Validation Errors
→ See `chatgpt-bank-transform-prompt.md` - Field specifications

### Upload Failures
→ See `upload-bulk-transactions.sql` - Troubleshooting section

### Duplicates
→ See `BULK_UPLOAD_WORKFLOW.md` - Duplicate handling

### Wrong Amounts/Types
→ See `upload-bulk-transactions.sql` - Fixing after upload

---

## 📈 Success Metrics

Track your uploads:
- ✅ Transactions uploaded per month
- ✅ Time taken per bank
- ✅ Error rate
- ✅ Duplicate detection rate
- ✅ Auto-categorization accuracy

---

## 🔮 Future Enhancements

Planned improvements:
- [ ] Python script for local transformation
- [ ] Bank-specific templates
- [ ] Auto-categorization ML model
- [ ] Duplicate detection improvements
- [ ] CSV → JSON converter web tool

---

## 🤝 Support

If you need help:
1. Check `BULK_UPLOAD_WORKFLOW.md` troubleshooting
2. Review your JSON against `example-transactions.json`
3. Verify mapping in `account-bank-mapping.json`
4. Check Supabase logs for detailed errors

---

## 📝 Notes

- This system is **independent** of the in-app bulk upload
- Uses **database functions directly** for reliability
- JSON format is **compatible** with future app updates
- **No code changes** needed in the main app
- Can be used **indefinitely** even after app importer is fixed

---

## 🎯 Quick Reference

| Task | File to Use | Time |
|------|-------------|------|
| First setup | `QUICK_START_GUIDE.md` | 15 min |
| Monthly upload | `chatgpt-bank-transform-prompt.md` | 10 min |
| Verify upload | `upload-bulk-transactions.sql` | 2 min |
| Fix errors | `BULK_UPLOAD_WORKFLOW.md` | 5 min |
| Reference format | `example-transactions.json` | - |

---

**Ready to start? Open `QUICK_START_GUIDE.md`! 🚀**

