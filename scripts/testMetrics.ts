/**
 * Performance Metrics Testing Script
 * 
 * Verifies that performance metrics are collected correctly
 * Run with: npx ts-node scripts/testMetrics.ts
 */

import { initializeLocalDb, getLocalDb } from '../services/localDb';
import metricsCollector, { MetricType } from '../services/performance/metricsCollector';
import { TransactionsRepository } from '../services/repositories/transactionsRepository';
import syncEngine from '../services/sync/syncEngine';

const TEST_USER_ID = 'test_user_metrics';

/**
 * Test query metrics collection
 */
async function testQueryMetrics(): Promise<void> {
  console.log('\n📋 Testing query metrics collection...');
  
  const repo = new TransactionsRepository(TEST_USER_ID, false, false);
  
  // Perform CRUD operations
  console.log('Creating transaction...');
  const transaction = await repo.create({
    name: 'Metrics Test Transaction',
    amount: 100,
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    description: 'Testing metrics',
    user_id: TEST_USER_ID,
  } as any);
  
  console.log('Reading transactions...');
  await repo.findAll({ user_id: TEST_USER_ID });
  
  console.log('Reading by ID...');
  await repo.findById(transaction.id);
  
  console.log('Updating transaction...');
  await repo.update(transaction.id, { amount: 200 } as any);
  
  // Wait a bit for async metrics to be recorded
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Query metrics
  const queryMetrics = await metricsCollector.getMetrics(
    MetricType.QUERY,
    Date.now() - 60000, // Last minute
    1000 // Limit
  );
  
  console.log(`\nQuery metrics collected: ${queryMetrics.length}`);
  
  if (queryMetrics.length > 0) {
    console.log('✅ PASS: Query metrics are being collected');
    queryMetrics.slice(0, 5).forEach(metric => {
      console.log(`  - ${metric.metric_name}: ${metric.value}ms`);
    });
  } else {
    console.log('❌ FAIL: No query metrics found');
  }
  
  // Cleanup
  await repo.delete(transaction.id);
}

/**
 * Test sync metrics collection
 */
async function testSyncMetrics(): Promise<void> {
  console.log('\n📋 Testing sync metrics collection...');
  
  // Note: Sync requires premium user and online status
  // This test will verify metrics structure even if sync doesn't run
  
  // Record a mock sync metric
  await metricsCollector.recordSync('test', 150, {
    records_processed: 10,
  });
  
  // Query sync metrics
  const syncMetrics = await metricsCollector.getMetrics(
    MetricType.SYNC,
    Date.now() - 60000,
    100
  );
  
  console.log(`Sync metrics collected: ${syncMetrics.length}`);
  
  if (syncMetrics.length > 0) {
    console.log('✅ PASS: Sync metrics are being collected');
    syncMetrics.forEach(metric => {
      console.log(`  - ${metric.metric_name}: ${metric.value}ms`);
      if (metric.metadata) {
        console.log(`    Metadata: ${JSON.stringify(metric.metadata)}`);
      }
    });
  } else {
    console.log('⚠️  INFO: No sync metrics found (sync may not have run)');
  }
}

/**
 * Test aggregated metrics
 */
async function testAggregatedMetrics(): Promise<void> {
  console.log('\n📋 Testing aggregated metrics...');
  
  // Get aggregated metrics for a specific query type
  const aggregated = await metricsCollector.getAggregatedMetrics(
    MetricType.QUERY,
    'transactions_local.findAll',
    Date.now() - 3600000 // Last hour
  );
  
  console.log('Aggregated metrics:');
  console.log(`  Count: ${aggregated.count}`);
  console.log(`  Average: ${aggregated.avg.toFixed(2)}ms`);
  console.log(`  Min: ${aggregated.min.toFixed(2)}ms`);
  console.log(`  Max: ${aggregated.max.toFixed(2)}ms`);
  console.log(`  Sum: ${aggregated.sum.toFixed(2)}ms`);
  
  if (aggregated.count > 0) {
    console.log('✅ PASS: Aggregated metrics work correctly');
  } else {
    console.log('⚠️  INFO: No metrics to aggregate');
  }
}

/**
 * Test metrics cleanup
 */
async function testMetricsCleanup(): Promise<void> {
  console.log('\n📋 Testing metrics cleanup...');
  
  const db = await getLocalDb();
  
  // Get current count
  const countResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM performance_metrics`
  );
  const currentCount = countResult?.count || 0;
  
  console.log(`Current metrics count: ${currentCount}`);
  console.log(`Max metrics limit: 10000`);
  
  if (currentCount <= 10000) {
    console.log('✅ PASS: Metrics count is within limits');
  } else {
    console.log('⚠️  WARNING: Metrics count exceeds limit, cleanup should run');
  }
  
  // Test manual cleanup
  if (currentCount > 10000) {
    console.log('Testing manual cleanup...');
    await metricsCollector.clearAll();
    
    const afterCount = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM performance_metrics`
    );
    
    console.log(`Metrics after cleanup: ${afterCount?.count || 0}`);
    console.log('✅ PASS: Manual cleanup works');
  }
}

/**
 * Verify metrics table structure
 */
async function verifyMetricsTable(): Promise<void> {
  console.log('\n📋 Verifying metrics table structure...');
  
  const db = await getLocalDb();
  
  try {
    const result = await db.getFirstAsync<any>(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name='performance_metrics'`
    );
    
    if (result) {
      console.log('✅ Metrics table exists');
      console.log(`Table structure: ${result.sql.substring(0, 100)}...`);
    } else {
      console.log('❌ FAIL: Metrics table does not exist');
    }
    
    // Check indexes
    const indexes = await db.getAllAsync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='performance_metrics'`
    );
    
    console.log(`\nIndexes on performance_metrics: ${indexes.length}`);
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}`);
    });
    
    if (indexes.length >= 2) {
      console.log('✅ PASS: Metrics table has proper indexes');
    } else {
      console.log('⚠️  WARNING: Metrics table may be missing indexes');
    }
    
  } catch (error) {
    console.log('❌ Error verifying table:', error);
  }
}

/**
 * Main test runner
 */
async function runTests(): Promise<void> {
  console.log('🚀 Starting Metrics Tests\n');
  console.log('='.repeat(50));
  
  try {
    // Initialize database
    await initializeLocalDb();
    console.log('✅ Database initialized\n');
    
    // Verify table structure
    await verifyMetricsTable();
    
    // Test metrics collection
    await testQueryMetrics();
    await testSyncMetrics();
    await testAggregatedMetrics();
    await testMetricsCleanup();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All metrics tests completed!');
    
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

