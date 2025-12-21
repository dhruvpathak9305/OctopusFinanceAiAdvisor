/**
 * =============================================================================
 * PERFORMANCE TESTING UTILITIES
 * =============================================================================
 * 
 * Utilities for testing performance with large datasets.
 */

import { getLocalDb } from '../localDb';
import { TransactionsRepository } from '../repositories/transactionsRepository';
import { AccountsRepository } from '../repositories/accountsRepository';
import { NetWorthEntriesRepository } from '../repositories/netWorthRepository';
import metricsCollector, { MetricType } from '../performance/metricsCollector';

export interface PerformanceTestResult {
  testName: string;
  duration: number;
  recordCount: number;
  recordsPerSecond: number;
  success: boolean;
  error?: string;
}

/**
 * Generate test transactions
 */
export async function generateTestTransactions(
  userId: string,
  count: number
): Promise<void> {
  const db = await getLocalDb();
  const repo = new TransactionsRepository(userId, false, false);
  
  console.log(`📊 Generating ${count} test transactions...`);
  const startTime = Date.now();
  
  const batchSize = 100;
  let inserted = 0;
  
  for (let i = 0; i < count; i += batchSize) {
    const batch = [];
    const currentBatchSize = Math.min(batchSize, count - i);
    
    for (let j = 0; j < currentBatchSize; j++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365)); // Random date in last year
      
      batch.push({
        user_id: userId,
        name: `Test Transaction ${i + j}`,
        description: `Generated test transaction ${i + j}`,
        amount: Math.random() * 10000,
        date: date.toISOString().split('T')[0],
        type: ['income', 'expense', 'transfer'][Math.floor(Math.random() * 3)] as any,
        source_account_type: 'savings',
        destination_account_type: null,
      });
    }
    
    // Insert batch
    for (const tx of batch) {
      try {
        await repo.create(tx as any);
        inserted++;
      } catch (error) {
        console.error(`Error inserting transaction ${i}:`, error);
      }
    }
    
    if ((i + batchSize) % 1000 === 0) {
      console.log(`  Inserted ${inserted} transactions...`);
    }
  }
  
  const duration = Date.now() - startTime;
  const recordsPerSecond = (inserted / duration) * 1000;
  
  console.log(`✅ Generated ${inserted} transactions in ${duration}ms (${recordsPerSecond.toFixed(2)} records/sec)`);
  
  await metricsCollector.record({
    metric_type: MetricType.QUERY,
    metric_name: 'test.generate_transactions',
    value: duration,
    metadata: { count: inserted, records_per_second: recordsPerSecond },
  });
}

/**
 * Test query performance with pagination
 */
export async function testPaginationPerformance(
  userId: string,
  pageSize: number = 50
): Promise<PerformanceTestResult> {
  const startTime = Date.now();
  const repo = new TransactionsRepository(userId, false, false);
  
  try {
    let totalFetched = 0;
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 20) { // Limit to 20 pages for testing
      const result = await repo.findPage({
        user_id: userId,
        page,
        pageSize,
        orderBy: 'date',
        orderDirection: 'DESC',
      });
      
      totalFetched += result.data.length;
      hasMore = result.hasMore;
      page++;
    }
    
    const duration = Date.now() - startTime;
    const recordsPerSecond = (totalFetched / duration) * 1000;
    
    return {
      testName: 'Pagination Performance',
      duration,
      recordCount: totalFetched,
      recordsPerSecond,
      success: true,
    };
  } catch (error: any) {
    return {
      testName: 'Pagination Performance',
      duration: Date.now() - startTime,
      recordCount: 0,
      recordsPerSecond: 0,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Test query performance with date range filtering
 */
export async function testDateRangeQueryPerformance(
  userId: string
): Promise<PerformanceTestResult> {
  const startTime = Date.now();
  const repo = new TransactionsRepository(userId, false, false);
  
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    const transactions = await repo.findByDateRange(startDate, endDate);
    
    const duration = Date.now() - startTime;
    const recordsPerSecond = (transactions.length / duration) * 1000;
    
    return {
      testName: 'Date Range Query Performance',
      duration,
      recordCount: transactions.length,
      recordsPerSecond,
      success: true,
    };
  } catch (error: any) {
    return {
      testName: 'Date Range Query Performance',
      duration: Date.now() - startTime,
      recordCount: 0,
      recordsPerSecond: 0,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Test cache performance
 */
export async function testCachePerformance(
  userId: string
): Promise<PerformanceTestResult> {
  const startTime = Date.now();
  const repo = new TransactionsRepository(userId, false, false);
  
  try {
    // First query (cache miss)
    const firstQueryStart = Date.now();
    await repo.findAll({ user_id: userId, limit: 100 });
    const firstQueryDuration = Date.now() - firstQueryStart;
    
    // Second query (cache hit)
    const secondQueryStart = Date.now();
    await repo.findAll({ user_id: userId, limit: 100 });
    const secondQueryDuration = Date.now() - secondQueryStart;
    
    const improvement = ((firstQueryDuration - secondQueryDuration) / firstQueryDuration) * 100;
    
    return {
      testName: 'Cache Performance',
      duration: Date.now() - startTime,
      recordCount: 200, // 2 queries of 100 each
      recordsPerSecond: improvement,
      success: true,
    };
  } catch (error: any) {
    return {
      testName: 'Cache Performance',
      duration: Date.now() - startTime,
      recordCount: 0,
      recordsPerSecond: 0,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Run all performance tests
 */
export async function runAllPerformanceTests(
  userId: string,
  generateTestData: boolean = false
): Promise<PerformanceTestResult[]> {
  const results: PerformanceTestResult[] = [];
  
  console.log('🚀 Starting performance tests...');
  
  // Generate test data if requested
  if (generateTestData) {
    console.log('📊 Generating test data...');
    await generateTestTransactions(userId, 1000);
  }
  
  // Run tests
  results.push(await testPaginationPerformance(userId));
  results.push(await testDateRangeQueryPerformance(userId));
  results.push(await testCachePerformance(userId));
  
  // Log results
  console.log('\n📊 Performance Test Results:');
  results.forEach(result => {
    console.log(`  ${result.testName}:`);
    console.log(`    Duration: ${result.duration}ms`);
    console.log(`    Records: ${result.recordCount}`);
    console.log(`    Throughput: ${result.recordsPerSecond.toFixed(2)} records/sec`);
    console.log(`    Status: ${result.success ? '✅' : '❌'} ${result.error || ''}`);
  });
  
  return results;
}


