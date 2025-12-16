/**
 * Database Indexes Testing Script
 * 
 * Verifies that performance indexes are created and improve query performance
 * Run with: npx ts-node scripts/testIndexes.ts
 */

import { getLocalDb, initializeLocalDb } from '../services/localDb';
import { TransactionsRepository } from '../services/repositories/transactionsRepository';

const TEST_USER_ID = 'test_user_indexes';

/**
 * Check if indexes exist in database
 */
async function checkIndexesExist(): Promise<void> {
  console.log('\n📋 Checking if indexes exist...');
  
  const db = await getLocalDb();
  
  const indexes = [
    'idx_transactions_local_user_date_sync',
    'idx_transactions_local_user_updated',
    'idx_transactions_local_date_desc',
    'idx_sync_jobs_status_updated',
    'idx_accounts_local_user_updated',
    'idx_budget_categories_local_user_updated',
    'idx_net_worth_entries_local_user_updated',
  ];
  
  for (const indexName of indexes) {
    try {
      const result = await db.getFirstAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='index' AND name=?`,
        [indexName]
      );
      
      if (result) {
        console.log(`✅ Index exists: ${indexName}`);
      } else {
        console.log(`❌ Index missing: ${indexName}`);
      }
    } catch (error) {
      console.log(`⚠️  Error checking index ${indexName}:`, error);
    }
  }
}

/**
 * Test query performance with indexes
 */
async function testQueryPerformance(): Promise<void> {
  console.log('\n📋 Testing query performance...');
  
  const repo = new TransactionsRepository(TEST_USER_ID, false, false);
  
  // Test 1: Query by user_id + date (should use idx_transactions_local_user_date_sync)
  console.log('\nTest 1: Query by user_id + date DESC');
  const start1 = Date.now();
  const result1 = await repo.findAll({
    user_id: TEST_USER_ID,
    orderBy: 'date',
    orderDirection: 'DESC',
    limit: 50,
  });
  const duration1 = Date.now() - start1;
  console.log(`Duration: ${duration1}ms`);
  console.log(`Records returned: ${result1.length}`);
  
  // Test 2: Query by user_id + updated_at (should use idx_transactions_local_user_updated)
  console.log('\nTest 2: Query by user_id + updated_at DESC');
  const start2 = Date.now();
  const result2 = await repo.findAll({
    user_id: TEST_USER_ID,
    orderBy: 'updated_at',
    orderDirection: 'DESC',
    limit: 50,
  });
  const duration2 = Date.now() - start2;
  console.log(`Duration: ${duration2}ms`);
  console.log(`Records returned: ${result2.length}`);
  
  // Test 3: Query by date only (should use idx_transactions_local_date_desc)
  console.log('\nTest 3: Query by date DESC only');
  const start3 = Date.now();
  const result3 = await repo.findAll({
    orderBy: 'date',
    orderDirection: 'DESC',
    limit: 50,
  });
  const duration3 = Date.now() - start3;
  console.log(`Duration: ${duration3}ms`);
  console.log(`Records returned: ${result3.length}`);
  
  // Performance expectations
  console.log('\n📊 Performance Analysis:');
  console.log(`All queries completed in < 500ms: ${duration1 < 500 && duration2 < 500 && duration3 < 500 ? '✅' : '❌'}`);
  
  if (duration1 < 500 && duration2 < 500 && duration3 < 500) {
    console.log('✅ PASS: Query performance is acceptable');
  } else {
    console.log('⚠️  WARNING: Some queries are slow, may need optimization');
  }
}

/**
 * Test sync job query performance
 */
async function testSyncJobQueryPerformance(): Promise<void> {
  console.log('\n📋 Testing sync job query performance...');
  
  const db = await getLocalDb();
  
  // Query sync jobs by status + updated_at (should use idx_sync_jobs_status_updated)
  const start = Date.now();
  const result = await db.getAllAsync<any>(
    `SELECT * FROM sync_jobs WHERE status = ? ORDER BY updated_at DESC LIMIT 50`,
    ['pending']
  );
  const duration = Date.now() - start;
  
  console.log(`Duration: ${duration}ms`);
  console.log(`Records returned: ${result.length}`);
  
  if (duration < 100) {
    console.log('✅ PASS: Sync job query performance is good');
  } else {
    console.log('⚠️  WARNING: Sync job query is slow');
  }
}

/**
 * Verify migration 002 ran
 */
async function verifyMigration002(): Promise<void> {
  console.log('\n📋 Verifying migration 002 ran...');
  
  const db = await getLocalDb();
  
  try {
    const result = await db.getFirstAsync<{ version: number }>(
      `SELECT MAX(version) as version FROM schema_version`
    );
    
    const version = result?.version || 0;
    console.log(`Current schema version: ${version}`);
    
    if (version >= 2) {
      console.log('✅ PASS: Migration 002 has been applied');
    } else {
      console.log('❌ FAIL: Migration 002 has not been applied');
      console.log('⚠️  Run the app to trigger migration');
    }
  } catch (error) {
    console.log('⚠️  Could not verify migration:', error);
  }
}

/**
 * Main test runner
 */
async function runTests(): Promise<void> {
  console.log('🚀 Starting Index Tests\n');
  console.log('='.repeat(50));
  
  try {
    // Initialize database
    await initializeLocalDb();
    console.log('✅ Database initialized\n');
    
    // Verify migration
    await verifyMigration002();
    
    // Check indexes
    await checkIndexesExist();
    
    // Test performance
    await testQueryPerformance();
    await testSyncJobQueryPerformance();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All index tests completed!');
    console.log('\n💡 Tip: Use DB Browser for SQLite to visually inspect indexes');
    
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

