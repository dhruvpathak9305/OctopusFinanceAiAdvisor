# 🚀 Monthly Bank Transaction Bulk Upload Workflow

## 📋 Overview

This workflow allows you to:
1. Download monthly bank statements (CSV/Excel)
2. Use ChatGPT to transform them into JSON
3. Upload directly to Supabase using SQL
4. Bypass the unreliable in-app bulk upload feature

---

## 🔧 One-Time Setup

### Step 1: Get Your User UUID

```sql
-- Run in Supabase SQL Editor
SELECT id FROM auth.users WHERE email = 'your@email.com';
```

Copy your user UUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Step 2: Get Your Account UUIDs

```sql
-- Run in Supabase SQL Editor
SELECT id, name, type FROM accounts_real 
WHERE user_id = 'YOUR_USER_UUID'
ORDER BY name;
```

### Step 3: Update Mapping File

Open `account-bank-mapping.json` and fill in:
- Your user UUID
- Your account UUIDs for each bank
- Account names and last 4 digits

**Save this file for future uploads!**

---

## 📅 Monthly Upload Process

### Step 1: Download Bank Statements

Download CSV/Excel statements from each bank's website:
- ICICI Bank → Account → Statements → Download (CSV)
- HDFC Bank → Account Summary → Download Statement
- Axis Bank → Statement → Download
- etc.

**Save files as**: `BANK_MONTH_YEAR.csv` (e.g., `ICICI_Sep_2025.csv`)

---

### Step 2: Prepare ChatGPT Prompt

1. Open `chatgpt-bank-transform-prompt.md`
2. Copy the entire prompt
3. Replace these placeholders:
   - `YOUR_USER_UUID_HERE` → Your user UUID from Step 1
   - `BANK_NAME_HERE` → Bank name (ICICI, HDFC, etc.)
   - `ACCOUNT_NAME_HERE` → Account name
   - `MONTH_YEAR` → Statement period (e.g., "September 2025")
4. Paste your CSV/Excel data at the bottom

**Example**:
```
**User ID**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
**Bank Name**: `ICICI`
**Account Name**: `ICICI Savings Account`
**Statement Period**: `September 2025`

**CSV/Excel Data**:
DATE,PARTICULARS,WITHDRAWALS,DEPOSITS,BALANCE
01/09/25,NEFT CR-HDFC0003861-Salary,,75000.00,120000.00
12/09/25,UPI/Amazon/401234567890/Payment,1549.00,,118451.00
```

---

### Step 3: Get JSON from ChatGPT

1. Paste the prepared prompt into ChatGPT
2. Wait for transformation
3. Copy the JSON output
4. Save as `transactions_BANK_MONTH_YEAR.json`

**Example**: `transactions_ICICI_Sep_2025.json`

---

### Step 4: Validate JSON (Optional but Recommended)

1. Open Supabase SQL Editor
2. Run validation query:

```sql
SELECT * FROM validate_bulk_transactions('
[YOUR_JSON_HERE]
'::jsonb);
```

✅ **Expected output**: `is_valid: true`

---

### Step 5: Check for Duplicates (Optional but Recommended)

```sql
SELECT * FROM detect_duplicate_transactions('
[YOUR_JSON_HERE]
'::jsonb, 'YOUR_USER_UUID'::uuid);
```

✅ **Expected output**: `duplicate_count: 0`

---

### Step 6: Upload Transactions

1. Open `upload-bulk-transactions.sql`
2. Replace the JSON array in STEP 3 with your JSON from ChatGPT
3. Replace `YOUR_USER_UUID` with your actual user UUID
4. Run the query

```sql
SELECT * FROM bulk_insert_transactions('[YOUR_JSON_HERE]'::jsonb);
```

✅ **Expected output**: 
```
status: SUCCESS
inserted_count: 45
error_count: 0
errors: []
```

---

### Step 7: Verify Upload

```sql
SELECT 
  id,
  name,
  description,
  amount,
  date,
  type,
  source_account_name,
  merchant
FROM transactions_real
WHERE user_id = 'YOUR_USER_UUID'
  AND metadata->>'upload_source' = 'chatgpt_bulk_upload'
  AND metadata->>'statement_period' = 'September 2025'
ORDER BY date DESC;
```

---

### Step 8: View Summary

```sql
SELECT 
  TO_CHAR(date, 'YYYY-MM') as month,
  COUNT(*) as transaction_count,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
  metadata->>'bank_name' as bank_name
FROM transactions_real
WHERE user_id = 'YOUR_USER_UUID'
  AND metadata->>'upload_source' = 'chatgpt_bulk_upload'
GROUP BY TO_CHAR(date, 'YYYY-MM'), metadata->>'bank_name'
ORDER BY month DESC, bank_name;
```

---

## 🔁 Repeat for Each Bank

For each bank account (ICICI, HDFC, Axis, SBI, etc.):
1. Download statement
2. Prepare ChatGPT prompt (same user UUID, different bank name)
3. Get JSON
4. Upload
5. Verify

---

## 🎯 Tips & Best Practices

### Before Upload
- ✅ Always validate JSON first
- ✅ Check for duplicates before uploading
- ✅ Review the JSON output from ChatGPT for accuracy
- ✅ Test with a small subset first (5-10 transactions)

### After Upload
- ✅ Verify transaction count matches bank statement
- ✅ Check total income and expenses match
- ✅ Review merchant names for accuracy
- ✅ Add categories/subcategories if needed (see Advanced section)

### File Organization
```
Downloads/
  BankStatements/
    2025/
      September/
        ICICI_Sep_2025.csv
        transactions_ICICI_Sep_2025.json
      October/
        ICICI_Oct_2025.csv
        transactions_ICICI_Oct_2025.json
```

---

## 🔧 Advanced: Post-Upload Categorization

### Auto-Categorize by Merchant

```sql
-- Shopping
UPDATE transactions_real
SET category_id = 'YOUR_SHOPPING_CATEGORY_UUID',
    subcategory_id = 'YOUR_ONLINE_SHOPPING_SUBCATEGORY_UUID'
WHERE user_id = 'YOUR_USER_UUID'
  AND merchant IN ('Amazon', 'Flipkart', 'Myntra', 'Ajio')
  AND category_id IS NULL;

-- Food & Dining
UPDATE transactions_real
SET category_id = 'YOUR_FOOD_CATEGORY_UUID',
    subcategory_id = 'YOUR_RESTAURANTS_SUBCATEGORY_UUID'
WHERE user_id = 'YOUR_USER_UUID'
  AND merchant IN ('Swiggy', 'Zomato')
  AND category_id IS NULL;

-- Bills & Utilities
UPDATE transactions_real
SET category_id = 'YOUR_BILLS_CATEGORY_UUID'
WHERE user_id = 'YOUR_USER_UUID'
  AND (name ILIKE '%electricity%' OR name ILIKE '%broadband%')
  AND category_id IS NULL;
```

### Mark Recurring Transactions

```sql
UPDATE transactions_real
SET is_recurring = true,
    recurrence_pattern = 'monthly'
WHERE user_id = 'YOUR_USER_UUID'
  AND (
    name ILIKE '%netflix%' OR
    name ILIKE '%amazon prime%' OR
    name ILIKE '%spotify%' OR
    name ILIKE '%emi%'
  );
```

### Link to Specific Accounts

If you have account UUIDs and want to link transactions:

```sql
-- Link ICICI transactions to ICICI account
UPDATE transactions_real
SET source_account_id = 'YOUR_ICICI_ACCOUNT_UUID'
WHERE user_id = 'YOUR_USER_UUID'
  AND source_account_name = 'ICICI Savings'
  AND source_account_id IS NULL;
```

---

## 🚨 Troubleshooting

### Issue: Validation fails

**Check**:
1. All required fields present? (user_id, name, amount, type, source_account_type)
2. Valid transaction types? (income, expense, transfer, etc.)
3. Valid account types? (bank, credit_card, cash, etc.)
4. Amounts are positive numbers?
5. Dates in ISO 8601 format?

### Issue: Duplicates detected

**Options**:
1. Skip duplicates manually (remove from JSON)
2. Update dates slightly if they're legitimate different transactions
3. Check if you already uploaded this month

### Issue: Upload fails

**Check**:
1. User UUID exists? `SELECT id FROM auth.users WHERE id = 'YOUR_UUID'`
2. Account UUIDs valid? (if provided)
3. Category UUIDs valid? (if provided)
4. JSON syntax correct? Use a JSON validator

### Issue: Wrong amounts or types

**Fix after upload**:
```sql
-- Fix incorrect type
UPDATE transactions_real
SET type = 'income'
WHERE id = 'TRANSACTION_UUID';

-- Fix incorrect amount
UPDATE transactions_real
SET amount = 5000.00
WHERE id = 'TRANSACTION_UUID';
```

---

## 🗑️ Cleanup & Rollback

### Delete test uploads

```sql
DELETE FROM transactions_real
WHERE user_id = 'YOUR_USER_UUID'
  AND metadata->>'upload_source' = 'chatgpt_bulk_upload'
  AND created_at >= '2025-10-18T10:00:00Z'; -- Be specific!
```

### Delete specific month

```sql
DELETE FROM transactions_real
WHERE user_id = 'YOUR_USER_UUID'
  AND TO_CHAR(date, 'YYYY-MM') = '2025-09'
  AND metadata->>'upload_source' = 'chatgpt_bulk_upload';
```

---

## 📊 Monthly Checklist

- [ ] Download statements from all banks
- [ ] Transform each statement using ChatGPT
- [ ] Validate JSON for each bank
- [ ] Check for duplicates
- [ ] Upload each bank's transactions
- [ ] Verify transaction counts
- [ ] Review and categorize uncategorized transactions
- [ ] Mark recurring transactions
- [ ] Check total income vs expenses
- [ ] Archive CSV and JSON files

---

## 🔮 Future Improvements

When the in-app bulk upload is fixed, you can:
1. Continue using this workflow (it's reliable!)
2. Switch back to the app importer
3. This JSON format is compatible with the app's bulk upload service

The transformation prompt and workflow will remain useful for:
- Data validation
- Consistent formatting
- Historical imports
- Multi-bank reconciliation

---

## 📞 Support

If you encounter issues:
1. Check troubleshooting section
2. Verify your mapping file is correct
3. Test with a small subset of transactions
4. Check Supabase logs for detailed error messages

---

## 📝 Notes

- This workflow is **independent** of the app's bulk upload feature
- It uses the **exact same database functions** (`bulk_insert_transactions`)
- Data format is **identical** to what the app would use
- **No app changes needed** - this is purely a data input workflow
- JSON format is **future-proof** and can be used with any upload method

---

**Happy uploading! 🎉**

