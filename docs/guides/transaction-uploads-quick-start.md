# ⚡ Quick Start - Transaction Uploads

**Fast reference for uploading bank transactions**

---

## 🎯 In 5 Steps

### 1️⃣ Get Your Bank Statement
- PDF, Excel, or screenshot
- Note the date range
- Identify all transactions

### 2️⃣ Format as JSON
Create file: `transactions_[BANK]_[MONTH]_[YEAR]_ENHANCED.json`

```json
[
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Transaction Name",
    "description": "Full description from statement",
    "amount": 1000.00,
    "date": "2025-11-XX",
    "type": "income|expense|transfer",
    "source_account_id": "[FROM_ACCOUNT_MAPPING.json]",
    "destination_account_id": "[FROM_ACCOUNT_MAPPING.json]",
    "metadata": {
      "bank_reference": "Unique reference",
      "balance_after_transaction": 50000.00,
      "bank_name": "BANK_NAME",
      "statement_period": "Month Year"
    }
  }
]
```

### 3️⃣ Get Account IDs
From `ACCOUNT_MAPPING.json`:
- **ICICI**: `fd551095-58a9-4f12-b00e-2fd182e68403`
- **HDFC**: `c5b2eb82-1159-4710-8d5d-de16ee0e6233`
- **Axis**: `0de24177-a088-4453-bf59-9b6c79946a5d`
- **IDFC**: `328c756a-b05e-4925-a9ae-852f7fb18b4e`
- **Kotak**: `db0683f0-4a26-45bf-8943-98755f6f7aa2`

### 4️⃣ Create Upload Script
Create: `scripts/upload-transactions-[bank]-[month]-[year].sql`

```sql
\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
\set account_id '[ACCOUNT_ID]'

SELECT * FROM bulk_insert_transactions_with_duplicate_check('[
  -- PASTE YOUR JSON HERE
]'::jsonb);
```

### 5️⃣ Upload!
```bash
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
export PGPASSWORD='KO5wgsWET2KgAvwr'
psql -h db.fzzbfgnmbchhmqepwmer.supabase.co -p 5432 -d postgres -U postgres \
     -f scripts/upload-transactions-[bank]-[month]-[year].sql
```

---

## 🔍 Transaction Types Quick Reference

| Type | When to Use | Account Setup |
|------|-------------|---------------|
| **income** | Money coming in | `destination_account_id` = your account |
| **expense** | Money going out | `source_account_id` = your account |
| **transfer** | Between your accounts | Both `source` and `destination` = your accounts |

---

## ✅ Quick Verification

```sql
-- Check last transaction
SELECT date, name, amount, (metadata->>'balance_after_transaction')::numeric 
FROM transactions_real 
WHERE source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]'
ORDER BY date DESC LIMIT 1;

-- Count transactions for month
SELECT COUNT(*) FROM transactions_real
WHERE (source_account_id = '[ACCOUNT_ID]' OR destination_account_id = '[ACCOUNT_ID]')
  AND date >= '2025-XX-01' AND date <= '2025-XX-31';
```

---

## 📚 Need More Detail?

Read the complete guide: **[Transaction Upload Master Guide](docs/guides/TRANSACTION_UPLOAD_MASTER_GUIDE.md)**

---

**Last Updated:** October 19, 2025

