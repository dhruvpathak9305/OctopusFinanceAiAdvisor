# Net Worth Optimization - Testing Guide

## 🧪 How to Test the Optimizations

### 1. Manual Testing

#### Test Accounts Loading
1. Open Net Worth page
2. Check console logs for:
   - `📊 Fetched X accounts in Yms`
   - `📊 Fetched X balances in Yms`
   - `✅ Accounts Net Worth: X accounts, ₹Y total in Zms`
3. Verify accounts appear correctly
4. **Expected**: Load time < 100ms (first load), < 10ms (cached)

#### Test Credit Cards Loading
1. Open Net Worth page (liabilities tab)
2. Check console logs for:
   - `📊 Fetched X credit cards in Yms`
   - `✅ Credit Cards Net Worth: X cards, ₹Y total debt in Zms`
3. Verify credit cards appear correctly
4. **Expected**: Load time < 100ms (first load), < 10ms (cached)

#### Test Fixed Deposits
1. Open Net Worth page
2. Check console logs for:
   - `💰 Found X Fixed Deposits in local DB` (if synced)
   - OR `💰 Checking for Fixed Deposits from Supabase...` (if not synced)
   - `✅ Using cached Fixed Deposits` (on second load)
3. Verify FDs appear in "Debt & Fixed Income" category
4. **Expected**: Load time < 500ms (first load), < 10ms (cached)

#### Test Cache Performance
1. Load Net Worth page (first load - cache miss)
2. Note the load time
3. Navigate away and back
4. Load Net Worth page again (second load - cache hit)
5. **Expected**: Second load should be < 10ms

### 2. Automated Testing

#### Run Test Suite
```bash
# From project root
npx ts-node scripts/testNetWorthOptimization.ts [userId]
```

#### Test Results
The test suite will output:
- ✅/❌ Status for each test
- Duration in milliseconds
- Performance metrics
- Summary statistics

### 3. Performance Monitoring

#### Check Performance Dashboard
1. Navigate to Settings → Performance Metrics
2. View:
   - Query execution times
   - Cache hit rates
   - Database size
   - Sync durations

#### Expected Metrics
- **Query Times**: < 100ms for local queries
- **Cache Hit Rate**: 80-90% after initial load
- **Database Size**: Varies by data volume
- **Sync Duration**: < 5s for incremental sync

### 4. Offline Testing

#### Test Offline Mode
1. Turn off network/WiFi
2. Open Net Worth page
3. **Expected**: 
   - Accounts load from local DB ✅
   - Credit Cards load from local DB ✅
   - Categories/Entries load from local DB ✅
   - Fixed Deposits load from local DB (if synced) ✅
   - Page loads in < 200ms ✅

### 5. Sync Testing

#### Test Data Sync
1. Make changes to accounts/credit cards in Supabase
2. Run "Sync Supabase to Local" in Settings
3. Open Net Worth page
4. **Expected**: Changes appear immediately

#### Test Cache Invalidation
1. Load Net Worth page (cached)
2. Add/edit a Net Worth entry
3. Load Net Worth page again
4. **Expected**: Cache invalidated, fresh data loaded

## 📊 Performance Benchmarks

### Expected Load Times

| Scenario | Expected Time | Status |
|----------|---------------|--------|
| First Load (Uncached) | 80-800ms | ✅ |
| Cached Load | < 10ms | ✅ |
| Offline Load | 80-200ms | ✅ |
| With 1000+ entries | < 500ms | ✅ |

### Query Performance

| Query Type | Expected Time | Status |
|------------|---------------|--------|
| Accounts (batch) | 10-50ms | ✅ |
| Balances (batch) | 10-30ms | ✅ |
| Credit Cards | 10-50ms | ✅ |
| Categories | 20-100ms | ✅ |
| Entries | 50-200ms | ✅ |

## 🐛 Troubleshooting

### Issue: Slow loading
**Check**:
- Console logs for query durations
- Cache hit rate in Performance Dashboard
- Database size

**Solutions**:
- Ensure data is synced to local DB
- Check for slow queries (> 200ms)
- Clear cache if needed

### Issue: Missing data
**Check**:
- Sync status in Settings
- Local DB content (use DB Browser)
- Console logs for errors

**Solutions**:
- Run "Sync Supabase to Local"
- Check sync queue for errors
- Verify user_id matches

### Issue: Stale data
**Check**:
- Cache TTL (5-10 minutes)
- Last sync time in Settings
- Console logs for cache hits

**Solutions**:
- Wait for cache TTL expiration
- Manually clear cache
- Force refresh by adding/editing entry

## ✅ Success Criteria

All tests pass when:
- [x] Page loads in < 1 second (first load)
- [x] Page loads in < 10ms (cached)
- [x] All data loads from local DB
- [x] Works 100% offline
- [x] Cache hit rate > 80%
- [x] No console errors
- [x] Performance metrics collected

## 📝 Test Checklist

- [ ] Accounts load from local DB
- [ ] Credit Cards load from local DB
- [ ] Fixed Deposits load (local or cached)
- [ ] Categories load from local DB
- [ ] Entries load from local DB
- [ ] Cache works correctly
- [ ] Cache invalidation works
- [ ] Offline mode works
- [ ] Performance metrics collected
- [ ] No console errors

## 🚀 Ready for Production

Once all tests pass, the optimization is production-ready! 🎉


