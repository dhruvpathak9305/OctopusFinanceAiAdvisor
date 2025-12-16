# Sync Guide - Local DB ↔ Supabase

## 🔄 How Sync Works

### Automatic Sync (Premium Users)

When you're **premium** and **online**:
1. **Create/Update/Delete** data → Saved to local DB immediately
2. **Sync job queued** → Added to `sync_jobs` table
3. **Auto-sync triggers** → After 1 second delay (if online)
4. **Push to Supabase** → Local changes sent to server
5. **Pull from Supabase** → Server changes fetched locally
6. **Conflict resolution** → Automatically resolved

### Manual Sync

Use Dev Menu → "Manual Sync" to force sync immediately.

---

## 📋 Step-by-Step: View Data in DB Browser

### Step 1: Install DB Browser
```bash
# Download from: https://sqlitebrowser.org/
# Install the app
```

### Step 2: Copy Database File

#### iOS Simulator:
```bash
# Find and copy database
find ~/Library/Developer/CoreSimulator -name "octopus_finance_offline.db" -exec cp {} ~/Desktop/local_db.db \;
```

#### Android Emulator:
```bash
# Pull database
adb pull /data/data/com.octopusfinance.advisor/databases/octopus_finance_offline.db ~/Desktop/local_db.db
```

### Step 3: Open in DB Browser
1. Open **DB Browser for SQLite**
2. Click **"Open Database"**
3. Select `~/Desktop/local_db.db`
4. Click **"Open"**

### Step 4: Browse Data
- Click **"Browse Data"** tab
- Select table: `transactions_local`, `accounts_local`, etc.
- View your data!

---

## ✅ Verify Sync Status

### Check Pending Syncs
```sql
SELECT 
  table_name,
  operation,
  COUNT(*) as count
FROM sync_jobs
WHERE status = 'pending'
GROUP BY table_name, operation;
```

### Check Sync Status of Records
```sql
SELECT 
  sync_status,
  COUNT(*) as count
FROM transactions_local
GROUP BY sync_status;
```

### View Sync Errors
```sql
SELECT 
  table_name,
  operation,
  error_message,
  attempt
FROM sync_jobs
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🧪 Testing Sync

### Test 1: Create Offline → Sync Online

1. **Turn off network** (Airplane mode or disable WiFi)
2. **Create a transaction** in app
3. **Check local DB**:
   ```sql
   SELECT * FROM transactions_local 
   WHERE sync_status = 'local_only' OR sync_status = 'pending'
   ORDER BY created_at DESC LIMIT 1;
   ```
4. **Turn on network**
5. **Wait 1-2 seconds** (or trigger manual sync)
6. **Check sync_jobs**:
   ```sql
   SELECT * FROM sync_jobs 
   WHERE status = 'completed' 
   ORDER BY updated_at DESC LIMIT 1;
   ```
7. **Verify in Supabase** dashboard → Should see new transaction

### Test 2: Create in Supabase → Pull Locally

1. **Create transaction** in Supabase dashboard
2. **Trigger pull sync** (or wait for auto-sync)
3. **Check local DB**:
   ```sql
   SELECT * FROM transactions_local 
   ORDER BY created_at DESC LIMIT 1;
   ```
4. **Verify** transaction appears in app

### Test 3: Conflict Resolution

1. **Create same transaction** locally and in Supabase (same ID)
2. **Trigger sync**
3. **Check conflict resolution**:
   ```sql
   SELECT * FROM sync_jobs 
   WHERE status = 'completed' 
   AND operation = 'update'
   ORDER BY updated_at DESC LIMIT 1;
   ```
4. **Verify** last-write-wins strategy applied

---

## 🎯 Online/Offline Indicator

### Location
- **Mobile Header**: Green/Red dot next to logo
- **Top Right**: Full indicator with label (optional)

### Colors
- 🟢 **Green** = Online (connected to internet)
- 🔴 **Red** = Offline (no internet connection)

### How It Works
- Automatically updates when network changes
- Uses `@react-native-community/netinfo` for detection
- Shows real-time connectivity status

---

## 🔧 Troubleshooting Sync

### Sync Not Working?

1. **Check Network**:
   - Verify online indicator is green
   - Check internet connection

2. **Check Subscription**:
   - Verify user is premium
   - Check `SubscriptionContext` status

3. **Check Sync Jobs**:
   ```sql
   SELECT * FROM sync_jobs 
   WHERE status = 'pending' OR status = 'failed'
   ORDER BY created_at DESC;
   ```

4. **Check Errors**:
   ```sql
   SELECT error_message, attempt 
   FROM sync_jobs 
   WHERE status = 'failed';
   ```

5. **Manual Sync**:
   - Use Dev Menu → "Manual Sync"
   - Check console logs for errors

### Data Not Appearing in Supabase?

1. **Check sync_jobs** → Should show `completed`
2. **Check Supabase** → Verify user_id matches
3. **Check network** → Ensure online
4. **Check subscription** → Must be premium

### Data Not Appearing Locally?

1. **Check sync_jobs** → Should show `completed`
2. **Check local DB** → Query `transactions_local`
3. **Refresh app** → Pull to refresh
4. **Manual sync** → Trigger pull manually

---

## 📊 Sync Status Values

### sync_status (in local tables)
- `local_only` - Only exists locally (free users)
- `pending` - Waiting to sync
- `synced` - Successfully synced
- `failed` - Sync failed

### sync_jobs.status
- `pending` - Waiting to process
- `processing` - Currently syncing
- `completed` - Successfully synced
- `failed` - Sync failed

---

## 🚀 Quick Commands

### Copy Database (iOS)
```bash
find ~/Library/Developer/CoreSimulator -name "octopus_finance_offline.db" -exec cp {} ~/Desktop/local_db.db \;
```

### Copy Database (Android)
```bash
adb pull /data/data/com.octopusfinance.advisor/databases/octopus_finance_offline.db ~/Desktop/local_db.db
```

### View All Transactions
```sql
SELECT * FROM transactions_local ORDER BY date DESC LIMIT 50;
```

### View Pending Syncs
```sql
SELECT * FROM sync_jobs WHERE status = 'pending';
```

### Clear Sync Jobs (for testing)
```sql
DELETE FROM sync_jobs WHERE status = 'failed';
```

---

## ✅ Checklist

- [ ] DB Browser installed
- [ ] Database file copied to Desktop
- [ ] Database opened in DB Browser
- [ ] Can see tables and data
- [ ] Online indicator shows green/red
- [ ] Created data offline → Appears in local DB
- [ ] Turned on network → Sync happens
- [ ] Verified data in Supabase
- [ ] Pulled data from Supabase → Appears locally

---

## 🎉 Success!

You now have:
- ✅ Offline-first architecture working
- ✅ Local database accessible in DB Browser
- ✅ Online/offline indicator visible
- ✅ Sync working between local and Supabase
- ✅ Full visibility into your data

Happy syncing! 🚀

