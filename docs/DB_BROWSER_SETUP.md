# SQLite DB Browser Setup Guide

## 📱 Viewing Local Database in DB Browser for SQLite

### Step 1: Install DB Browser for SQLite

**Download**: https://sqlitebrowser.org/

**Install**:
- macOS: Download `.dmg` and install
- Windows: Download `.exe` installer
- Linux: Use package manager

---

### Step 2: Locate Your Database File

The database file is: `octopus_finance_offline.db`

#### iOS Simulator Path:
```bash
# Find your app's data directory
xcrun simctl get_app_container booted com.anonymous.OctopusFinanceAiAdvisor data

# Database location:
~/Library/Developer/CoreSimulator/Devices/[DEVICE_ID]/data/Containers/Data/Application/[APP_ID]/Library/LocalDatabase/octopus_finance_offline.db
```

**Quick Command**:
```bash
# Copy database to Desktop
find ~/Library/Developer/CoreSimulator -name "octopus_finance_offline.db" -exec cp {} ~/Desktop/local_db.db \;
```

#### Android Emulator Path:
```bash
# Pull database from device
adb exec-out run-as com.octopusfinance.advisor cat databases/octopus_finance_offline.db > ~/Desktop/local_db.db
```

#### Physical iOS Device:
1. Connect device to Mac
2. Open Xcode → Window → Devices and Simulators
3. Select your device → Select app → Download Container
4. Right-click container → Show Package Contents
5. Navigate to: `AppData/Library/LocalDatabase/octopus_finance_offline.db`

#### Physical Android Device:
```bash
# Enable USB debugging
# Pull database
adb pull /data/data/com.octopusfinance.advisor/databases/octopus_finance_offline.db ~/Desktop/local_db.db
```

---

### Step 3: Open Database in DB Browser

1. **Open DB Browser for SQLite**
2. **Click "Open Database"**
3. **Navigate to** `~/Desktop/local_db.db` (or wherever you copied it)
4. **Click "Open"**

---

### Step 4: Browse Your Data

#### View Tables:
- Click **"Browse Data"** tab
- Select table from dropdown (e.g., `transactions_local`, `accounts_local`)

#### View Schema:
- Click **"Database Structure"** tab
- See all tables and their columns

#### Run Queries:
- Click **"Execute SQL"** tab
- Write SQL queries

---

## 🔍 Useful Queries

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
  deleted_offline,
  last_synced_at
FROM transactions_local
WHERE deleted_offline = 0
ORDER BY date DESC
LIMIT 50;
```

### View Sync Status
```sql
SELECT 
  sync_status,
  COUNT(*) as count
FROM transactions_local
GROUP BY sync_status;
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

### View Accounts
```sql
SELECT 
  id,
  name,
  type,
  current_balance,
  sync_status,
  created_offline,
  updated_offline
FROM accounts_local
WHERE deleted_offline = 0;
```

### Check Sync Metadata
```sql
SELECT * FROM sync_metadata;
```

### View Sync Jobs
```sql
SELECT 
  id,
  table_name,
  operation,
  status,
  attempt,
  error_message,
  created_at,
  updated_at
FROM sync_jobs
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🔄 Refresh Database After Changes

### Option 1: Re-copy Database
```bash
# iOS Simulator
find ~/Library/Developer/CoreSimulator -name "octopus_finance_offline.db" -exec cp {} ~/Desktop/local_db.db \;

# Android
adb pull /data/data/com.octopusfinance.advisor/databases/octopus_finance_offline.db ~/Desktop/local_db.db
```

Then in DB Browser:
- **File → Close Database**
- **File → Open Database** → Select updated file

### Option 2: Use DB Browser's Refresh
- Click **"Refresh"** button (circular arrow icon)
- Or press `Cmd+R` (Mac) / `Ctrl+R` (Windows)

---

## 📊 Testing Sync

### 1. Create Data Offline
- Turn off network in app
- Create a transaction
- Check `transactions_local` table
- Verify `sync_status = 'local_only'` or `'pending'`

### 2. Sync to Supabase
- Turn on network
- Wait for sync (or trigger manually)
- Check `sync_jobs` table → Should show `status = 'completed'`
- Check `transactions_local` → `sync_status` should be `'synced'`
- Verify in Supabase dashboard

### 3. Pull from Supabase
- Create data in Supabase dashboard
- Trigger pull sync in app
- Check `transactions_local` → Should see new data

---

## 🐛 Troubleshooting

### Database File Not Found?
- Make sure app has run at least once
- Check app logs for initialization errors
- Verify database path is correct

### Can't Open Database?
- Make sure app is not running (close app first)
- Try copying database again
- Check file permissions

### No Data Showing?
- Make sure you've created some data in the app
- Check if tables exist (Database Structure tab)
- Verify you're looking at the right table

### Sync Not Working?
- Check `sync_jobs` table for errors
- Look at `error_message` column
- Verify network connectivity
- Check subscription status

---

## 💡 Tips

1. **Keep DB Browser Open**: Leave it open while testing to see changes in real-time
2. **Use Refresh**: Refresh database after making changes in app
3. **Export Data**: Use File → Export → Export to CSV to analyze data
4. **Backup**: Copy database file before testing sync to avoid data loss
5. **Query Builder**: Use Execute SQL tab to write custom queries

---

## 📝 Quick Reference

### Database Location
- **File Name**: `octopus_finance_offline.db`
- **iOS**: `~/Library/Developer/CoreSimulator/.../Library/LocalDatabase/`
- **Android**: `/data/data/com.octopusfinance.advisor/databases/`

### Key Tables
- `transactions_local` - All transactions
- `accounts_local` - All accounts
- `sync_jobs` - Pending sync operations
- `sync_metadata` - Sync state per table
- `schema_version` - Database schema version

### Sync Status Values
- `local_only` - Only exists locally (free users)
- `pending` - Waiting to sync
- `synced` - Successfully synced
- `failed` - Sync failed

---

## 🎯 Next Steps

1. ✅ Install DB Browser
2. ✅ Copy database file
3. ✅ Open in DB Browser
4. ✅ Browse your data
5. ✅ Test sync functionality
6. ✅ Verify data in Supabase

Happy debugging! 🚀

