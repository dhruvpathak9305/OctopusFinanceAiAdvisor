# Local Database Visualization Guide

## Overview

The offline-first architecture uses SQLite for local storage. The database file is located at:
- **iOS**: `Library/LocalDatabase/octopus_finance_offline.db`
- **Android**: `databases/octopus_finance_offline.db`
- **Web**: IndexedDB (via SQL.js)

## Viewing Local Database

### Option 1: DB Browser for SQLite (Recommended)

1. **Download DB Browser for SQLite**: https://sqlitebrowser.org/
2. **Locate the database file**:
   - For iOS Simulator: `~/Library/Developer/CoreSimulator/Devices/[DEVICE_ID]/data/Containers/Data/Application/[APP_ID]/Library/LocalDatabase/octopus_finance_offline.db`
   - For Android Emulator: Use `adb pull` to copy the database file
   - For Web: Check browser DevTools → Application → IndexedDB

3. **Open the database file** in DB Browser
4. **Browse tables**:
   - `transactions_local` - All transactions
   - `accounts_local` - All accounts
   - `budget_categories_local` - Budget categories
   - `budget_subcategories_local` - Budget subcategories
   - `net_worth_entries_local` - Net worth entries
   - `sync_jobs` - Pending sync operations
   - `sync_metadata` - Sync state per table

### Option 2: React Native Debugger

1. Install React Native Debugger
2. Use the SQLite plugin to query the database directly

### Option 3: Command Line (iOS Simulator)

```bash
# Find your app's data directory
xcrun simctl get_app_container booted com.anonymous.OctopusFinanceAiAdvisor data

# Copy database file
cp [PATH_TO_DB]/octopus_finance_offline.db ~/Desktop/

# Open with DB Browser
open -a "DB Browser for SQLite" ~/Desktop/octopus_finance_offline.db
```

### Option 4: Android ADB

```bash
# Find database path
adb shell "run-as com.octopusfinance.advisor ls databases/"

# Pull database file
adb exec-out run-as com.octopusfinance.advisor cat databases/octopus_finance_offline.db > ~/Desktop/local_db.db

# Open with DB Browser
open -a "DB Browser for SQLite" ~/Desktop/local_db.db
```

## Testing Sync Status

### Check Sync Status

```sql
-- View pending syncs
SELECT table_name, COUNT(*) as pending_count
FROM sync_jobs
WHERE status = 'pending'
GROUP BY table_name;

-- View sync metadata
SELECT * FROM sync_metadata;

-- View records by sync status
SELECT sync_status, COUNT(*) as count
FROM transactions_local
GROUP BY sync_status;
```

### Check Local vs Server Data

```sql
-- Count local transactions
SELECT COUNT(*) FROM transactions_local WHERE deleted_offline = 0;

-- Count pending syncs
SELECT COUNT(*) FROM sync_jobs WHERE status = 'pending';

-- View sync errors
SELECT * FROM sync_jobs WHERE status = 'failed' ORDER BY updated_at DESC LIMIT 10;
```

## Useful Queries

### View All Local Data

```sql
-- Transactions
SELECT id, name, amount, date, sync_status, created_offline, updated_offline
FROM transactions_local
ORDER BY date DESC
LIMIT 50;

-- Accounts
SELECT id, name, type, current_balance, sync_status
FROM accounts_local
ORDER BY created_at DESC;

-- Budget Categories
SELECT id, name, budget_limit, sync_status
FROM budget_categories_local
ORDER BY display_order;
```

### Check Sync Health

```sql
-- Sync status summary
SELECT 
  'transactions_local' as table_name,
  sync_status,
  COUNT(*) as count
FROM transactions_local
GROUP BY sync_status

UNION ALL

SELECT 
  'accounts_local' as table_name,
  sync_status,
  COUNT(*) as count
FROM accounts_local
GROUP BY sync_status;
```

## Export Data for Testing

You can export local data to JSON for testing:

```javascript
// In your app's dev menu or testing utility
import { getLocalDb } from './services/localDb';

const db = getLocalDb();
db.transaction((tx) => {
  tx.executeSql('SELECT * FROM transactions_local', [], (_, result) => {
    const data = [];
    for (let i = 0; i < result.rows.length; i++) {
      data.push(result.rows.item(i));
    }
    console.log(JSON.stringify(data, null, 2));
  });
});
```

