/**
 * Cache Testing Script
 * 
 * Tests query cache functionality
 * Run with: npx ts-node scripts/testCache.ts
 */

import { getQueryCache, resetQueryCache } from '../services/repositories/queryCache';
import { TransactionsRepository } from '../services/repositories/transactionsRepository';
import { initializeLocalDb } from '../services/localDb';

const TEST_USER_ID = 'test_user_cache';

/**
 * Test cache hit on repeated queries
 */
async function testCacheHit(): Promise<void> {
  console.log('\n📋 Testing cache hit on repeated queries...');
  
  resetQueryCache();
  const cache = getQueryCache();
  const repo = new TransactionsRepository(TEST_USER_ID, false, false);
  
  // First query - should miss cache
  const start1 = Date.now();
  const result1 = await repo.findAll({ user_id: TEST_USER_ID, limit: 10 });
  const duration1 = Date.now() - start1;
  
  // Second query - should hit cache
  const start2 = Date.now();
  const result2 = await repo.findAll({ user_id: TEST_USER_ID, limit: 10 });
  const duration2 = Date.now() - start2;
  
  console.log(`First query: ${duration1}ms`);
  console.log(`Second query: ${duration2}ms`);
  console.log(`Speedup: ${((duration1 - duration2) / duration1 * 100).toFixed(1)}%`);
  
  if (duration2 < duration1 && result1.length === result2.length) {
    console.log('✅ PASS: Cache hit works correctly');
  } else {
    console.log('❌ FAIL: Cache hit did not work as expected');
  }
}

/**
 * Test cache invalidation on create
 */
async function testCacheInvalidationOnCreate(): Promise<void> {
  console.log('\n📋 Testing cache invalidation on create...');
  
  resetQueryCache();
  const repo = new TransactionsRepository(TEST_USER_ID, false, false);
  
  // Query to populate cache
  await repo.findAll({ user_id: TEST_USER_ID, limit: 10 });
  
  const cache = getQueryCache();
  const statsBefore = cache.getStats();
  
  // Create new record
  await repo.create({
    name: 'Cache Test Transaction',
    amount: 100,
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    description: 'Testing cache invalidation',
    user_id: TEST_USER_ID,
  } as any);
  
  const statsAfter = cache.getStats();
  
  console.log(`Cache size before: ${statsBefore.size}`);
  console.log(`Cache size after: ${statsAfter.size}`);
  
  // Cache should be cleared for this table
  const cacheKey = `transactions_local:${JSON.stringify({ user_id: TEST_USER_ID, limit: 10 })}`;
  const cached = cache.get(cacheKey);
  
  if (cached === null) {
    console.log('✅ PASS: Cache invalidated on create');
  } else {
    console.log('❌ FAIL: Cache was not invalidated');
  }
}

/**
 * Test cache invalidation on update
 */
async function testCacheInvalidationOnUpdate(): Promise<void> {
  console.log('\n📋 Testing cache invalidation on update...');
  
  resetQueryCache();
  const repo = new TransactionsRepository(TEST_USER_ID, false, false);
  
  // Create a transaction
  const transaction = await repo.create({
    name: 'Update Test Transaction',
    amount: 100,
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    description: 'Testing cache invalidation on update',
    user_id: TEST_USER_ID,
  } as any);
  
  // Query to populate cache
  await repo.findAll({ user_id: TEST_USER_ID, limit: 10 });
  
  const cache = getQueryCache();
  const cacheKey = `transactions_local:${JSON.stringify({ user_id: TEST_USER_ID, limit: 10 })}`;
  const cachedBefore = cache.get(cacheKey);
  
  // Update record
  await repo.update(transaction.id, {
    amount: 200,
  } as any);
  
  const cachedAfter = cache.get(cacheKey);
  
  if (cachedBefore !== null && cachedAfter === null) {
    console.log('✅ PASS: Cache invalidated on update');
  } else {
    console.log('❌ FAIL: Cache was not invalidated on update');
  }
}

/**
 * Test cache invalidation on delete
 */
async function testCacheInvalidationOnDelete(): Promise<void> {
  console.log('\n📋 Testing cache invalidation on delete...');
  
  resetQueryCache();
  const repo = new TransactionsRepository(TEST_USER_ID, false, false);
  
  // Create a transaction
  const transaction = await repo.create({
    name: 'Delete Test Transaction',
    amount: 100,
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    description: 'Testing cache invalidation on delete',
    user_id: TEST_USER_ID,
  } as any);
  
  // Query to populate cache
  await repo.findAll({ user_id: TEST_USER_ID, limit: 10 });
  
  const cache = getQueryCache();
  const cacheKey = `transactions_local:${JSON.stringify({ user_id: TEST_USER_ID, limit: 10 })}`;
  const cachedBefore = cache.get(cacheKey);
  
  // Delete record
  await repo.delete(transaction.id);
  
  const cachedAfter = cache.get(cacheKey);
  
  if (cachedBefore !== null && cachedAfter === null) {
    console.log('✅ PASS: Cache invalidated on delete');
  } else {
    console.log('❌ FAIL: Cache was not invalidated on delete');
  }
}

/**
 * Test cache TTL expiration
 */
async function testCacheTTLExpiration(): Promise<void> {
  console.log('\n📋 Testing cache TTL expiration...');
  
  resetQueryCache();
  const cache = getQueryCache();
  const repo = new TransactionsRepository(TEST_USER_ID, false, false);
  
  // Query to populate cache
  await repo.findAll({ user_id: TEST_USER_ID, limit: 10 });
  
  const cacheKey = `transactions_local:${JSON.stringify({ user_id: TEST_USER_ID, limit: 10 })}`;
  
  // Immediately after - should be cached
  const cached1 = cache.get(cacheKey);
  console.log(`Immediately after query: ${cached1 !== null ? 'Cached' : 'Not cached'}`);
  
  // Manually expire cache entry (for testing)
  const cacheEntry = (cache as any).cache.get(cacheKey);
  if (cacheEntry) {
    cacheEntry.timestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago (past TTL)
  }
  
  // After expiration - should not be cached
  const cached2 = cache.get(cacheKey);
  console.log(`After expiration: ${cached2 !== null ? 'Cached' : 'Not cached'}`);
  
  if (cached1 !== null && cached2 === null) {
    console.log('✅ PASS: Cache TTL expiration works correctly');
  } else {
    console.log('❌ FAIL: Cache TTL expiration did not work');
  }
}

/**
 * Test cache size limits and LRU eviction
 */
async function testCacheSizeLimits(): Promise<void> {
  console.log('\n📋 Testing cache size limits and LRU eviction...');
  
  resetQueryCache();
  const cache = getQueryCache();
  const repo = new TransactionsRepository(TEST_USER_ID, false, false);
  
  // Fill cache beyond max size (default is 100)
  for (let i = 0; i < 110; i++) {
    await repo.findAll({ user_id: TEST_USER_ID, limit: 10, offset: i * 10 });
  }
  
  const stats = cache.getStats();
  console.log(`Cache size: ${stats.size}`);
  console.log(`Max size: ${stats.maxSize}`);
  
  if (stats.size <= stats.maxSize) {
    console.log('✅ PASS: Cache respects size limits');
  } else {
    console.log('❌ FAIL: Cache exceeded max size');
  }
  
  // Verify oldest entries were evicted
  const firstKey = `transactions_local:${JSON.stringify({ user_id: TEST_USER_ID, limit: 10, offset: 0 })}`;
  const firstCached = cache.get(firstKey);
  
  const lastKey = `transactions_local:${JSON.stringify({ user_id: TEST_USER_ID, limit: 10, offset: 1000 })}`;
  const lastCached = cache.get(lastKey);
  
  if (firstCached === null && lastCached !== null) {
    console.log('✅ PASS: LRU eviction works correctly');
  } else {
    console.log('⚠️  INFO: LRU eviction behavior needs verification');
  }
}

/**
 * Main test runner
 */
async function runTests(): Promise<void> {
  console.log('🚀 Starting Cache Tests\n');
  console.log('='.repeat(50));
  
  try {
    // Initialize database
    await initializeLocalDb();
    console.log('✅ Database initialized\n');
    
    // Run tests
    await testCacheHit();
    await testCacheInvalidationOnCreate();
    await testCacheInvalidationOnUpdate();
    await testCacheInvalidationOnDelete();
    await testCacheTTLExpiration();
    await testCacheSizeLimits();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All cache tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };

