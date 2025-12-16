# Quick Guide: Viewing Local Database Data

## 🚀 Quick Steps

### 1. Database File Location
The database file has been copied to: **`~/Desktop/octopus_finance_offline.db`**

### 2. Open in DB Browser for SQLite

**Option A: If DB Browser is installed**
- The database should open automatically
- If not, manually open: `File → Open Database → Select ~/Desktop/octopus_finance_offline.db`

**Option B: Install DB Browser**
- Download: https://sqlitebrowser.org/
- Install the app
- Open the database file from Desktop

### 3. Browse Your Data

#### View Tables:
1. Click **"Browse Data"** tab (top)
2. Select table from dropdown:
   - `transactions_local` - Your synced transactions (146 records)
   - `accounts_local` - Your accounts (8 records)
   - `budget_categories_local` - Budget categories (9 records)
   - `budget_subcategories_local` - Budget subcategories (81 records)
   - `net_worth_categories_local` - Net worth categories (31 records)
   - `sync_jobs` - Pending sync operations
   - `sync_metadata` - Sync state information

#### View Schema:
- Click **"Database Structure"** tab
- See all tables and their columns

#### Run SQL Queries:
- Click **"Execute SQL"** tab
- Write custom queries (see examples below)

---

## 📊 Useful SQL Queries

### View All Transactions
```sql
SELECT 
  id,
  name,
  amount,
  date,
  type,
  sync_status,
  created_offline,
  updated_offline,
  deleted_offline
FROM transactions_local
WHERE deleted_offline = 0
ORDER BY date DESC
LIMIT 50;
```

### View Sync Status Summary
```sql
SELECT 
  sync_status,
  COUNT(*) as count
FROM transactions_local
GROUP BY sync_status;
```

### View Accounts
```sql
SELECT 
  id,
  name,
  type,
  current_balance,
  sync_status
FROM accounts_local
WHERE deleted_offline = 0;
```

### View Pending Syncs
```sql
SELECT 
  table_name,
  operation,
  COUNT(*) as count,
  MAX(created_at) as oldest_pending
FROM sync_jobs
WHERE status = 'pending'
GROUP BY table_name, operation;
```

### View Sync Metadata
```sql
SELECT * FROM sync_metadata;
```

---

## 🔄 Refresh Database After Changes

After making changes in your app (creating transactions, syncing, etc.):

1. **Close the database** in DB Browser: `File → Close Database`
2. **Re-copy the database**:
   ```bash
   cp "/Users/dhruvpathak9305/Library/Developer/CoreSimulator/Devices/C35CDA9D-03DA-468A-8B87-F835C94B3072/data/Containers/Data/Application/087809CB-EB13-4F35-AA3E-E59CB0A102D1/Documents/ExponentExperienceData/@dhruvpathak9305/OctopusFinanceAiAdvisor/SQLite/octopus_finance_offline.db" ~/Desktop/octopus_finance_offline.db
   ```
3. **Re-open** in DB Browser: `File → Open Database`

---

## 💡 Tips

1. **Keep DB Browser Open**: Leave it open while testing to see changes
2. **Use Browse Data Tab**: Easiest way to view table contents
3. **Export Data**: `File → Export → Export to CSV` to analyze in Excel
4. **Filter Data**: Use the filter box in Browse Data tab to search
5. **Sort Columns**: Click column headers to sort

---

## 🎯 What to Check

### After Syncing:
- ✅ Check `transactions_local` - Should show synced data
- ✅ Check `sync_status` column - Should be `'synced'` for synced records
- ✅ Check `sync_jobs` - Should show completed syncs
- ✅ Check `sync_metadata` - Should show last sync times

### After Creating Data Offline:
- ✅ Check `sync_status` - Should be `'local_only'` or `'pending'`
- ✅ Check `created_offline` - Should be `1` for offline-created records
- ✅ Check `sync_jobs` - Should show pending sync operations

---

Happy exploring! 🚀

