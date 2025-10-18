# ⚡ Quick Start Guide - Bulk Transaction Upload

## 🎯 5-Minute Setup

### 1️⃣ Get Your User UUID (30 seconds)

Open Supabase SQL Editor and run:
```sql
SELECT id FROM auth.users WHERE email = 'your@email.com';
```

Copy the UUID → Save it somewhere safe.

---

### 2️⃣ Update Your Mapping File (2 minutes)

1. Open `account-bank-mapping.json`
2. Replace `YOUR_USER_UUID_HERE` with your UUID
3. Fill in your bank account details
4. Save the file

---

### 3️⃣ Prepare Your First Upload (2 minutes)

1. Download a bank statement (CSV or Excel)
2. Open `chatgpt-bank-transform-prompt.md`
3. Copy the entire prompt
4. Replace:
   - `YOUR_USER_UUID_HERE` → Your UUID
   - `BANK_NAME_HERE` → Your bank name
   - `ACCOUNT_NAME_HERE` → Your account name
   - `MONTH_YEAR` → Statement period
5. Paste your CSV data at the bottom

---

## 🚀 Monthly Upload (10 minutes per bank)

### Step 1: Transform with ChatGPT (3 minutes)

1. Copy prepared prompt
2. Paste into ChatGPT
3. Wait for JSON output
4. Copy and save as `transactions_BANK_MONTH.json`

**Example filename**: `transactions_ICICI_Sep_2025.json`

---

### Step 2: Validate (1 minute)

Open Supabase SQL Editor:

```sql
SELECT * FROM validate_bulk_transactions('
[PASTE YOUR JSON HERE]
'::jsonb);
```

✅ Look for: `is_valid: true`

---

### Step 3: Upload (1 minute)

```sql
SELECT * FROM bulk_insert_transactions('
[PASTE YOUR JSON HERE]
'::jsonb);
```

✅ Look for: `status: SUCCESS`

---

### Step 4: Verify (1 minute)

```sql
SELECT 
  name, amount, date, type, merchant
FROM transactions_real
WHERE user_id = 'YOUR_USER_UUID'
  AND metadata->>'upload_source' = 'chatgpt_bulk_upload'
ORDER BY date DESC
LIMIT 20;
```

---

## 📊 Example Output

### ChatGPT Transformation
**Input** (Your bank CSV):
```
DATE,PARTICULARS,WITHDRAWALS,DEPOSITS,BALANCE
12/09/25,UPI/Amazon/Payment,1549.00,,118451.00
```

**Output** (JSON):
```json
[
  {
    "user_id": "your-uuid-here",
    "name": "Amazon Purchase",
    "amount": 1549.00,
    "date": "2025-09-12T00:00:00Z",
    "type": "expense",
    "source_account_type": "bank",
    "merchant": "Amazon",
    "metadata": {
      "upload_source": "chatgpt_bulk_upload",
      "original_description": "UPI/Amazon/Payment"
    }
  }
]
```

---

## ⚡ Pro Tips

### Batch Processing
Do all your banks in one session:
1. Download all statements
2. Transform all with ChatGPT (one at a time)
3. Validate all JSONs
4. Upload all at once

### Naming Convention
```
transactions_ICICI_Sep_2025.json
transactions_HDFC_Sep_2025.json
transactions_AXIS_Sep_2025.json
```

### Monthly Checklist
```
□ Download statements
□ Transform with ChatGPT
□ Validate JSONs
□ Upload to Supabase
□ Verify counts
□ Archive files
```

---

## 🆘 Common Issues

### "Missing required field"
→ Check that user_id, name, amount, type, and source_account_type are all present

### "Duplicate transactions"
→ You might have already uploaded this month. Check before uploading again.

### "Invalid transaction type"
→ Must be one of: income, expense, transfer, loan, loan_repayment, debt, debt_collection

### "Invalid account type"
→ Must be one of: bank, credit_card, cash, digital_wallet, investment, other

---

## 📁 File Structure

Keep your files organized:
```
Desktop/
  BankStatements/
    2025/
      September/
        ICICI_Sep_2025.csv (original)
        transactions_ICICI_Sep_2025.json (transformed)
      October/
        ICICI_Oct_2025.csv
        transactions_ICICI_Oct_2025.json
```

---

## 🎓 Next Steps

After your first successful upload:

1. **Read** `BULK_UPLOAD_WORKFLOW.md` for detailed workflow
2. **Explore** post-upload categorization (Advanced section)
3. **Set up** recurring transaction marking
4. **Create** category mappings for auto-categorization

---

## 📞 Need Help?

Check these files:
- `BULK_UPLOAD_WORKFLOW.md` - Complete workflow guide
- `chatgpt-bank-transform-prompt.md` - Full transformation prompt
- `upload-bulk-transactions.sql` - SQL queries and troubleshooting
- `example-transactions.json` - Sample JSON format

---

## ✅ Success Criteria

Your first upload is successful when:
- ✅ Validation returns `is_valid: true`
- ✅ Upload returns `status: SUCCESS`
- ✅ Transaction count matches your bank statement
- ✅ Amounts and dates are correct
- ✅ Income and expenses are categorized correctly

---

**You're all set! 🎉 Go upload your first batch!**

