# October 2025 Statement Upload Guide

## ✅ Pre-Upload Checklist (Completed)

- ✅ September data uploaded successfully
- ✅ All duplicates removed
- ✅ Transfers properly linked to IDFC account
- ✅ Account mapping created
- ✅ System verified and ready

## 📋 Account Mapping Reference

Use these Account IDs when preparing October transactions:

| Account Name | Account ID | Institution | Account Number |
|-------------|------------|-------------|----------------|
| ICICI | `fd551095-58a9-4f12-b00e-2fd182e68403` | ICICI Bank | 388101502899 |
| IDFC Savings Account | `328c756a-b05e-4925-a9ae-852f7fb18b4e` | IDFC FIRST Bank | 10167677364 |
| Axis Bank | `0de24177-a088-4453-bf59-9b6c79946a5d` | Axis Bank | XXXXXXXXXXXX7423 |
| HDFC | `c5b2eb82-1159-4710-8d5d-de16ee0e6233` | HDFC Bank Ltd. | 50100223596697 |
| Kotak Mahindra | `db0683f0-4a26-45bf-8943-98755f6f7aa2` | Kotak Mahindra Bank | 3712733310 |
| Jupiter | `67f0dcb5-f0a7-41c9-855d-a22acdf8b59e` | Jupiter | N/A |

## 🎯 Upload Process for October

### Step 1: Prepare October Statement Data

Create a JSON file similar to `transactions_ICICI_September_2025_ENHANCED.json` with:
- Transaction date, name, description
- Amount and type (income/expense/transfer)
- Source and destination accounts with proper IDs
- Bank references (UPI, NEFT, etc.)
- Metadata including balance_after_transaction

### Step 2: Use the Upload Script Template

```bash
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Connect and upload
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
export PGPASSWORD='KO5wgsWET2KgAvwr'
psql -h db.fzzbfgnmbchhmqepwmer.supabase.co -p 5432 -d postgres -U postgres \
     -f scripts/upload-transactions-october.sql
```

### Step 3: Key Points for October Upload

#### For Transfer Transactions:
- **FROM ICICI to IDFC:**
  ```json
  {
    "type": "transfer",
    "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "destination_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
    "source_account_name": "ICICI Savings Account",
    "destination_account_name": "IDFC FIRST Bank"
  }
  ```

- **FROM IDFC to ICICI:**
  ```json
  {
    "type": "transfer",
    "source_account_id": "328c756a-b05e-4925-a9ae-852f7fb18b4e",
    "destination_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
    "source_account_name": "IDFC FIRST Bank",
    "destination_account_name": "ICICI Savings Account"
  }
  ```

#### For Income Transactions:
```json
{
  "type": "income",
  "destination_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
  "destination_account_type": "bank",
  "destination_account_name": "ICICI Savings Account"
}
```

#### For Expense Transactions:
```json
{
  "type": "expense",
  "source_account_id": "fd551095-58a9-4f12-b00e-2fd182e68403",
  "source_account_type": "bank",
  "source_account_name": "ICICI Savings Account"
}
```

### Step 4: Verification After Upload

Run verification queries:
```bash
psql -h db.fzzbfgnmbchhmqepwmer.supabase.co -p 5432 -d postgres -U postgres \
     -f scripts/final-verification.sql
```

Expected results:
- ✅ No duplicates
- ✅ All transfers linked
- ✅ All transactions have hashes
- ✅ Balance calculations match

## 🔧 Troubleshooting

### If You See Duplicates:
```bash
psql -f scripts/fix-duplicates.sql
```

### If Balance Doesn't Match:
1. Check if all income transactions have `destination_account_id`
2. Check if all expenses have `source_account_id`
3. Verify transfer transactions are counted correctly

### If Transfers Are Not Linked:
```bash
psql -f scripts/fix-transfer-links.sql
```

## 📊 Current September Balances

| Account | Balance (Sept 30) | Status |
|---------|------------------|---------|
| ICICI | ₹5,228,611.48 | ✅ Active |
| IDFC | ₹0.00 | ⚠️ Pending IDFC statement |

**Note:** IDFC balance is ₹0 because September transfers haven't been confirmed with IDFC statement yet. When you upload IDFC October statement, include the opening balance from their side.

## 🎯 Quick Commands

```bash
# Set up environment
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
export PGPASSWORD='KO5wgsWET2KgAvwr'

# Upload October data
psql -h db.fzzbfgnmbchhmqepwmer.supabase.co -p 5432 -d postgres -U postgres \
     -f scripts/upload-transactions-october.sql

# Verify
psql -h db.fzzbfgnmbchhmqepwmer.supabase.co -p 5432 -d postgres -U postgres \
     -f scripts/final-verification.sql
```

## 📝 Template for October Upload Script

Save as `scripts/upload-transactions-october.sql`:

```sql
\set user_id '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
\set account_id 'fd551095-58a9-4f12-b00e-2fd182e68403'

-- Insert October transactions
SELECT * FROM bulk_insert_transactions_with_duplicate_check('[
  {
    "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
    "name": "Transaction Name",
    "description": "Full description",
    "amount": 1000.00,
    "date": "2025-10-XX",
    "type": "expense|income|transfer",
    "source_account_id": "...",
    "destination_account_id": "...",
    "metadata": {
      "bank_reference": "...",
      "balance_after_transaction": ...
    }
  }
]'::jsonb);
```

## ✅ You're Ready!

**Paste your October statement data when ready, and I'll help you:**
1. Format it correctly with proper account IDs
2. Create the upload script
3. Upload to database
4. Verify everything works

Just share your October statement and we'll process it! 🚀

