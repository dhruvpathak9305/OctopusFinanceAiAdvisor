# Next Steps - Offline-First Architecture Implementation

## ✅ Completed

1. ✅ Local database schema with sync metadata
2. ✅ Repository pattern implementation
3. ✅ Sync engine with push/pull flow
4. ✅ Conflict resolution
5. ✅ Network monitoring
6. ✅ Subscription management
7. ✅ Service refactoring
8. ✅ Migration utilities

## 🔄 Immediate Next Steps

### 1. App Initialization (Priority: HIGH)

**Action**: Integrate `useOfflineFirstInit` hook in your main app component

```typescript
// In App.tsx or _layout.tsx
import { useOfflineFirstInit } from './hooks/useOfflineFirstInit';
import { OnlineStatusIndicator } from './components/common/OnlineStatusIndicator';

export default function App() {
  const initStatus = useOfflineFirstInit();
  
  if (!initStatus.initialized) {
    return <LoadingScreen />;
  }
  
  return (
    <>
      <YourApp />
      <OnlineStatusIndicator />
    </>
  );
}
```

### 2. Testing Sync from Supabase to Local (Priority: HIGH)

**Action**: Create a dev menu or admin screen to test sync

```typescript
// In a dev/testing screen
import { syncSupabaseToLocal, clearLocalDB } from '../services/testing/syncSupabaseToLocal';

// Button to sync Supabase data to local
const handleSyncToLocal = async () => {
  const result = await syncSupabaseToLocal({ limit: 100 });
  console.log('Synced:', result.synced);
  console.log('Errors:', result.errors);
};
```

### 3. Ensure Auto-Sync on Changes (Priority: HIGH)

**Status**: ✅ Already implemented in repositories
- When you create/update/delete via repositories, sync jobs are automatically queued
- Sync engine processes queue when online and premium

**Verification**: Check that sync jobs are created:
```sql
SELECT * FROM sync_jobs WHERE status = 'pending' ORDER BY created_at DESC;
```

### 4. Subscription Context Integration (Priority: MEDIUM)

**Action**: Wrap your app with SubscriptionProvider

```typescript
// In _layout.tsx or App.tsx
import { SubscriptionProvider } from './contexts/SubscriptionContext';

export default function RootLayout() {
  return (
    <SubscriptionProvider>
      <YourApp />
    </SubscriptionProvider>
  );
}
```

### 5. Handle Subscription Changes (Priority: MEDIUM)

**Status**: ✅ Implemented in `subscriptionSyncHandler.ts`
- Automatically stops syncing when downgraded to free
- Automatically starts syncing when upgraded to premium

**Action**: Ensure it's initialized in app startup (already done in `useOfflineFirstInit`)

## 📋 Testing Checklist

### Offline Mode Testing

- [ ] Create transaction while offline → Should save locally
- [ ] Create account while offline → Should save locally
- [ ] Update transaction while offline → Should update locally
- [ ] Delete transaction while offline → Should mark as deleted locally
- [ ] Go online → Should sync pending changes
- [ ] Check sync_jobs table → Should see pending jobs when offline, completed when synced

### Premium/Free Testing

- [ ] Free user → All data should be `local_only` sync status
- [ ] Premium user → Data should sync to Supabase when online
- [ ] Downgrade premium → Free → Pending syncs should be marked `local_only`
- [ ] Upgrade free → Premium → Local data should be marked `pending` for sync

### Sync Testing

- [ ] Create data locally → Check Supabase → Should appear after sync
- [ ] Create data in Supabase → Pull sync → Should appear locally
- [ ] Update same record locally and in Supabase → Conflict should be resolved
- [ ] Delete locally → Should delete in Supabase after sync

### Network Testing

- [ ] Online indicator shows correct status
- [ ] Going offline → Indicator updates
- [ ] Going online → Sync triggers automatically (if premium)

## 🐛 Known Issues & Fixes Needed

### 1. Sync Engine Import Issue

**Issue**: `syncEngine.initSchema()` is called but might not be exported correctly

**Fix**: Check `services/sync/syncEngine.ts` exports

### 2. Network Monitor Dependency

**Issue**: `@react-native-community/netinfo` might not be installed

**Fix**: 
```bash
npm install @react-native-community/netinfo
# or
pnpm add @react-native-community/netinfo
```

### 3. Secure Store Dependency

**Issue**: `expo-secure-store` might not be installed for encryption

**Fix**:
```bash
npx expo install expo-secure-store
```

## 🎯 Integration Points

### 1. Update Main App Entry Point

```typescript
// app/_layout.tsx or App.tsx
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { useOfflineFirstInit } from './hooks/useOfflineFirstInit';
import { OnlineStatusIndicator } from './components/common/OnlineStatusIndicator';

export default function RootLayout() {
  const initStatus = useOfflineFirstInit();
  
  if (!initStatus.initialized) {
    return <SplashScreen />;
  }
  
  return (
    <SubscriptionProvider>
      <Stack>
        {/* Your routes */}
      </Stack>
      <OnlineStatusIndicator position="top-right" />
    </SubscriptionProvider>
  );
}
```

### 2. Add Dev Menu for Testing

Create a dev/admin screen with buttons:
- "Sync Supabase to Local" - Test offline mode
- "Clear Local DB" - Reset for testing
- "Trigger Manual Sync" - Force sync
- "View Sync Status" - Show pending syncs

### 3. Add Sync Status Badge

Show sync status in navigation or header:
- Green dot = All synced
- Yellow dot = Pending syncs
- Red dot = Sync errors

## 📊 Monitoring & Debugging

### Check Sync Health

```typescript
// Add to dev menu
import { getDbStats } from './services/localDb';

const stats = await getDbStats();
console.log('Local DB Stats:', stats);
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

### Monitor Sync Errors

```sql
SELECT 
  table_name,
  operation,
  error_message,
  attempt,
  created_at
FROM sync_jobs
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 20;
```

## 🚀 Production Readiness Checklist

- [ ] All dependencies installed
- [ ] Database initialized on app start
- [ ] Network monitoring active
- [ ] Sync engine initialized
- [ ] Subscription handler active
- [ ] Online indicator visible
- [ ] Error handling for sync failures
- [ ] User feedback for sync status
- [ ] Migration wizard accessible for free→premium users
- [ ] Local DB visualization tool available for debugging

## 📝 Documentation Updates Needed

1. Update README with offline-first features
2. Add migration guide for existing users
3. Document sync behavior for users
4. Create troubleshooting guide

