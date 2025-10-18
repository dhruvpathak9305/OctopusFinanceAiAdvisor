# 🚀 Bulk Upload Cheat Sheet

## 📋 Quick Commands

### Get User UUID
```sql
SELECT id FROM auth.users WHERE email = 'your@email.com';
```

### Get Account UUIDs
```sql
SELECT id, name, type FROM accounts_real WHERE user_id = 'YOUR_UUID';
```

### Validate JSON
```sql
SELECT * FROM validate_bulk_transactions('[YOUR_JSON]'::jsonb);
```

### Check Duplicates
```sql
SELECT * FROM detect_duplicate_transactions('[YOUR_JSON]'::jsonb, 'YOUR_UUID'::uuid);
```

### Upload Transactions
```sql
SELECT * FROM bulk_insert_transactions('[YOUR_JSON]'::jsonb);
```

### Verify Upload
```sql
SELECT name, amount, date, type FROM transactions_real
WHERE user_id = 'YOUR_UUID'
AND metadata->>'upload_source' = 'chatgpt_bulk_upload'
ORDER BY date DESC LIMIT 20;
```

### View Summary
```sql
SELECT 
  TO_CHAR(date, 'YYYY-MM') as month,
  COUNT(*) as count,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
FROM transactions_real
WHERE user_id = 'YOUR_UUID'
AND metadata->>'upload_source' = 'chatgpt_bulk_upload'
GROUP BY TO_CHAR(date, 'YYYY-MM')
ORDER BY month DESC;
```

---

## 🎯 Field Quick Reference

### Required Fields
```json
{
  "user_id": "uuid",
  "name": "string",
  "amount": 0.00,
  "type": "expense|income|transfer|loan|loan_repayment|debt|debt_collection",
  "source_account_type": "bank|credit_card|cash|digital_wallet|investment|other"
}
```

### Optional Fields
```json
{
  "description": "string",
  "date": "2025-09-12T00:00:00Z",
  "source_account_id": "uuid",
  "source_account_name": "string",
  "destination_account_id": "uuid",
  "destination_account_name": "string",
  "destination_account_type": "string",
  "category_id": "uuid",
  "subcategory_id": "uuid",
  "merchant": "string",
  "is_recurring": false,
  "metadata": {}
}
```

---

## 🔄 Monthly Workflow

1. **Download** bank statements (CSV/Excel)
2. **Open** `chatgpt-bank-transform-prompt.md`
3. **Copy** prompt + add your UUID and CSV data
4. **Paste** into ChatGPT
5. **Save** JSON output
6. **Validate** in Supabase
7. **Upload** using bulk_insert_transactions
8. **Verify** transaction count

**Time**: ~10 minutes per bank

---

## 💾 File Naming

```
transactions_BANK_MONTH_YEAR.json
```

**Examples**:
- `transactions_ICICI_Sep_2025.json`
- `transactions_HDFC_Oct_2025.json`
- `transactions_AXIS_Nov_2025.json`

---

## ✅ Success Indicators

- Validation: `is_valid: true`
- Upload: `status: SUCCESS`
- Duplicates: `duplicate_count: 0`
- Errors: `error_count: 0`

---

## 🚨 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Missing user_id" | Add `"user_id": "YOUR_UUID"` |
| "Missing name" | Extract from description |
| "Invalid type" | Use: income/expense/transfer |
| "Invalid account type" | Use: bank/credit_card/cash/digital_wallet |
| "Amount must be positive" | Remove negative sign |
| "Invalid date format" | Use ISO 8601: `YYYY-MM-DDTHH:MM:SSZ` |

---

## 🧹 Cleanup Commands

### Delete Test Transactions
```sql
DELETE FROM transactions_real
WHERE user_id = 'YOUR_UUID'
AND created_at >= '2025-10-18T10:00:00Z'; -- Be specific!
```

### Delete Specific Month
```sql
DELETE FROM transactions_real
WHERE user_id = 'YOUR_UUID'
AND TO_CHAR(date, 'YYYY-MM') = '2025-09'
AND metadata->>'upload_source' = 'chatgpt_bulk_upload';
```

### View Duplicates
```sql
WITH dups AS (
  SELECT id, name, amount, date,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, amount, date::date, description 
      ORDER BY created_at DESC
    ) as row_num
  FROM transactions_real
  WHERE user_id = 'YOUR_UUID'
)
SELECT * FROM dups WHERE row_num > 1;
```

### Delete Duplicates
```sql
WITH dups AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, amount, date::date, description 
      ORDER BY created_at DESC
    ) as row_num
  FROM transactions_real
  WHERE user_id = 'YOUR_UUID'
)
DELETE FROM transactions_real
WHERE id IN (SELECT id FROM dups WHERE row_num > 1);
```

---

## 🎨 Post-Upload Categorization

### Auto-Categorize Shopping
```sql
UPDATE transactions_real
SET category_id = 'SHOPPING_CAT_UUID',
    subcategory_id = 'ONLINE_SUBCAT_UUID'
WHERE user_id = 'YOUR_UUID'
AND merchant IN ('Amazon', 'Flipkart', 'Myntra')
AND category_id IS NULL;
```

### Mark Recurring
```sql
UPDATE transactions_real
SET is_recurring = true, recurrence_pattern = 'monthly'
WHERE user_id = 'YOUR_UUID'
AND (name ILIKE '%netflix%' OR name ILIKE '%spotify%');
```

### Link Accounts
```sql
UPDATE transactions_real
SET source_account_id = 'ACCOUNT_UUID'
WHERE user_id = 'YOUR_UUID'
AND source_account_name = 'ICICI Savings'
AND source_account_id IS NULL;
```

---

## 📊 Useful Queries

### Transaction Count by Type
```sql
SELECT type, COUNT(*), SUM(amount)
FROM transactions_real
WHERE user_id = 'YOUR_UUID'
GROUP BY type;
```

### Top Merchants
```sql
SELECT merchant, COUNT(*), SUM(amount)
FROM transactions_real
WHERE user_id = 'YOUR_UUID'
AND merchant IS NOT NULL
GROUP BY merchant
ORDER BY SUM(amount) DESC
LIMIT 10;
```

### Monthly Trends
```sql
SELECT 
  TO_CHAR(date, 'YYYY-MM') as month,
  type,
  COUNT(*),
  SUM(amount)
FROM transactions_real
WHERE user_id = 'YOUR_UUID'
GROUP BY TO_CHAR(date, 'YYYY-MM'), type
ORDER BY month DESC, type;
```

### Uncategorized Transactions
```sql
SELECT name, amount, date, merchant
FROM transactions_real
WHERE user_id = 'YOUR_UUID'
AND category_id IS NULL
ORDER BY date DESC;
```

---

## 🔗 Quick Links

- **Setup**: `QUICK_START_GUIDE.md`
- **Workflow**: `BULK_UPLOAD_WORKFLOW.md`
- **Prompt**: `chatgpt-bank-transform-prompt.md`
- **SQL**: `upload-bulk-transactions.sql`
- **Examples**: `example-transactions.json`

---

## 💡 Pro Tips

1. **Always validate** before uploading
2. **Check duplicates** for same-month re-uploads
3. **Save JSONs** for future reference
4. **Test with 5 transactions** first
5. **Verify totals** match bank statement
6. **Categorize** right after upload
7. **Keep mapping file** updated

---

## 📞 Need Help?

Check in order:
1. This cheat sheet (you're here!)
2. `QUICK_START_GUIDE.md` - First-time setup
3. `BULK_UPLOAD_WORKFLOW.md` - Detailed guide
4. `upload-bulk-transactions.sql` - Troubleshooting

---

**Print this out and keep it handy! 📌**

