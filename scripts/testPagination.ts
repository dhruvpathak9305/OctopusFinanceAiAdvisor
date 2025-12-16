/**
 * Pagination Testing Script
 * 
 * Tests pagination functionality with large datasets
 * Run with: npx ts-node scripts/testPagination.ts
 */

import { TransactionsRepository } from '../services/repositories/transactionsRepository';
import { getLocalDb } from '../services/localDb';
import { initializeLocalDb } from '../services/localDb';

// Test configuration
const TEST_USER_ID = 'test_user_pagination';
const NUM_TEST_TRANSACTIONS = 1000;
const PAGE_SIZES = [10, 50, 100];

/**
 * Create test transactions
 */
async function createTestTransactions(repo: TransactionsRepository, count: number): Promise<void> {
  console.log(`Creating ${count} test transactions...`);
  
  const now = Date.now();
  const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < count; i++) {
    const date = new Date(oneYearAgo + (i * 24 * 60 * 60 * 1000)); // Spread over a year
    
    await repo.create({
      name: `Test Transaction ${i + 1}`,
      amount: Math.random() * 1000,
      type: i % 3 === 0 ? 'income' : 'expense',
      date: date.toISOString().split('T')[0],
      description: `Test transaction for pagination testing`,
      user_id: TEST_USER_ID,
    } as any);
    
    if ((i + 1) % 100 === 0) {
      console.log(`Created ${i + 1}/${count} transactions...`);
    }
  }
  
  console.log(`✅ Created ${count} test transactions`);
}

/**
 * Test findAll with default limit
 */
async function testFindAllDefaultLimit(repo: TransactionsRepository): Promise<void> {
  console.log('\n📋 Testing findAll() with default limit...');
  
  const result = await repo.findAll({ user_id: TEST_USER_ID });
  
  console.log(`Result count: ${result.length}`);
  console.log(`Expected: 50 (default limit)`);
  
  if (result.length === 50) {
    console.log('✅ PASS: findAll() applies default limit correctly');
  } else {
    console.log(`❌ FAIL: Expected 50, got ${result.length}`);
  }
}

/**
 * Test findPage with different page sizes
 */
async function testFindPage(repo: TransactionsRepository, pageSize: number): Promise<void> {
  console.log(`\n📋 Testing findPage() with page size ${pageSize}...`);
  
  const page1 = await repo.findPage({
    user_id: TEST_USER_ID,
    page: 1,
    pageSize,
  });
  
  console.log(`Page 1: ${page1.data.length} records`);
  console.log(`Total: ${page1.total}`);
  console.log(`Total Pages: ${page1.totalPages}`);
  console.log(`Has More: ${page1.hasMore}`);
  
  if (page1.data.length === pageSize && page1.totalPages > 0) {
    console.log(`✅ PASS: findPage() works correctly with page size ${pageSize}`);
    
    // Test next page
    if (page1.hasMore) {
      const page2 = await repo.findPage({
        user_id: TEST_USER_ID,
        page: 2,
        pageSize,
      });
      
      console.log(`Page 2: ${page2.data.length} records`);
      
      if (page2.data.length > 0) {
        console.log(`✅ PASS: Page navigation works correctly`);
      } else {
        console.log(`❌ FAIL: Page 2 is empty`);
      }
    }
  } else {
    console.log(`❌ FAIL: findPage() did not return expected results`);
  }
}

/**
 * Test getTotalCount
 */
async function testGetTotalCount(repo: TransactionsRepository): Promise<void> {
  console.log('\n📋 Testing getTotalCount()...');
  
  const total = await repo.getTotalCount({ user_id: TEST_USER_ID });
  
  console.log(`Total count: ${total}`);
  console.log(`Expected: ${NUM_TEST_TRANSACTIONS}`);
  
  if (total === NUM_TEST_TRANSACTIONS) {
    console.log('✅ PASS: getTotalCount() returns accurate total');
  } else {
    console.log(`❌ FAIL: Expected ${NUM_TEST_TRANSACTIONS}, got ${total}`);
  }
}

/**
 * Test findRecent default behavior
 */
async function testFindRecent(repo: TransactionsRepository): Promise<void> {
  console.log('\n📋 Testing findRecent() default (last 30 days)...');
  
  const recent = await repo.findRecent(30);
  
  console.log(`Recent transactions (last 30 days): ${recent.length}`);
  console.log(`Expected: ≤ 50 (default limit)`);
  
  if (recent.length <= 50) {
    console.log('✅ PASS: findRecent() applies default limit');
  } else {
    console.log(`❌ FAIL: Expected ≤ 50, got ${recent.length}`);
  }
  
  // Verify all dates are within last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const allRecent = recent.every(t => {
    const txDate = new Date(t.date);
    return txDate >= thirtyDaysAgo;
  });
  
  if (allRecent) {
    console.log('✅ PASS: All recent transactions are within last 30 days');
  } else {
    console.log('❌ FAIL: Some transactions are outside last 30 days');
  }
}

/**
 * Clean up test data
 */
async function cleanupTestData(): Promise<void> {
  console.log('\n🧹 Cleaning up test data...');
  
  const db = await getLocalDb();
  
  try {
    const result = await db.runAsync(
      `DELETE FROM transactions_local WHERE user_id = ?`,
      [TEST_USER_ID]
    );
    
    console.log(`✅ Deleted ${result.changes} test transactions`);
  } catch (error) {
    console.error('❌ Error cleaning up:', error);
  }
}

/**
 * Main test runner
 */
async function runTests(): Promise<void> {
  console.log('🚀 Starting Pagination Tests\n');
  console.log('=' .repeat(50));
  
  try {
    // Initialize database
    await initializeLocalDb();
    console.log('✅ Database initialized\n');
    
    // Create repository instance
    const repo = new TransactionsRepository(TEST_USER_ID, false, false);
    
    // Create test data
    await createTestTransactions(repo, NUM_TEST_TRANSACTIONS);
    
    // Run tests
    await testFindAllDefaultLimit(repo);
    
    for (const pageSize of PAGE_SIZES) {
      await testFindPage(repo, pageSize);
    }
    
    await testGetTotalCount(repo);
    await testFindRecent(repo);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All pagination tests completed!');
    
    // Cleanup
    await cleanupTestData();
    
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

