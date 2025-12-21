/**
 * =============================================================================
 * NET WORTH LOCAL-FIRST TESTING UTILITY
 * =============================================================================
 * 
 * Tests the local-first Net Worth implementation
 */

import { fetchFormattedCategoriesForUILocal } from '../netWorthServiceLocal';
import { getLocalDb } from '../localDb';
import { AccountsRepository } from '../repositories/accountsRepository';
import metricsCollector, { MetricType } from '../performance/metricsCollector';

export interface TestResult {
  testName: string;
  success: boolean;
  duration: number;
  details: string;
  error?: string;
}

/**
 * Test Net Worth data fetching from local DB
 */
export async function testNetWorthLocalFetch(
  userId: string,
  isPremium: boolean = false
): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log('🧪 Testing Net Worth local fetch...');
    
    // Test assets
    const assetsStart = Date.now();
    const assets = await fetchFormattedCategoriesForUILocal('asset', userId, isPremium);
    const assetsDuration = Date.now() - assetsStart;
    
    // Test liabilities
    const liabilitiesStart = Date.now();
    const liabilities = await fetchFormattedCategoriesForUILocal('liability', userId, isPremium);
    const liabilitiesDuration = Date.now() - liabilitiesStart;
    
    const totalDuration = Date.now() - startTime;
    
    // Record metrics
    await metricsCollector.record({
      metric_type: MetricType.QUERY,
      metric_name: 'test.net_worth_local_fetch',
      value: totalDuration,
      metadata: {
        assets_count: assets.length,
        liabilities_count: liabilities.length,
        assets_duration: assetsDuration,
        liabilities_duration: liabilitiesDuration,
      },
    });
    
    const details = `
      Assets: ${assets.length} categories (${assetsDuration}ms)
      Liabilities: ${liabilities.length} categories (${liabilitiesDuration}ms)
      Total: ${totalDuration}ms
    `;
    
    console.log('✅ Net Worth local fetch test passed:', details);
    
    return {
      testName: 'Net Worth Local Fetch',
      success: true,
      duration: totalDuration,
      details,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ Net Worth local fetch test failed:', error);
    
    return {
      testName: 'Net Worth Local Fetch',
      success: false,
      duration,
      details: 'Failed to fetch Net Worth data',
      error: error.message,
    };
  }
}

/**
 * Test accounts fetching from local DB
 */
export async function testAccountsLocalFetch(userId: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log('🧪 Testing accounts local fetch...');
    
    const accountsRepo = new AccountsRepository(userId, false, false);
    const accounts = await accountsRepo.findAll({
      user_id: userId,
      isActive: true,
      limit: 1000,
    });
    
    const db = await getLocalDb();
    const accountsWithBalances = await Promise.all(
      accounts.map(async (account) => {
        const balance = await db.getFirstAsync<{ current_balance: number }>(
          `SELECT current_balance FROM balance_local WHERE account_id = ?`,
          [account.id]
        );
        return {
          ...account,
          current_balance: balance?.current_balance ?? 0,
        };
      })
    );
    
    const duration = Date.now() - startTime;
    const totalBalance = accountsWithBalances.reduce(
      (sum, acc) => sum + (acc.current_balance ?? 0),
      0
    );
    
    const details = `
      Accounts: ${accountsWithBalances.length}
      Total Balance: ₹${totalBalance.toLocaleString('en-IN')}
      Duration: ${duration}ms
    `;
    
    console.log('✅ Accounts local fetch test passed:', details);
    
    return {
      testName: 'Accounts Local Fetch',
      success: true,
      duration,
      details,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ Accounts local fetch test failed:', error);
    
    return {
      testName: 'Accounts Local Fetch',
      success: false,
      duration,
      details: 'Failed to fetch accounts',
      error: error.message,
    };
  }
}

/**
 * Test credit cards fetching from local DB
 */
export async function testCreditCardsLocalFetch(userId: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log('🧪 Testing credit cards local fetch...');
    
    const db = await getLocalDb();
    const creditCards = await db.getAllAsync<any>(
      `SELECT * FROM credit_cards_local 
       WHERE user_id = ? AND deleted_offline = 0 
       ORDER BY name ASC`,
      [userId]
    );
    
    const duration = Date.now() - startTime;
    const totalDebt = creditCards.reduce(
      (sum, card) => sum + Math.abs(card.current_balance || 0),
      0
    );
    
    const details = `
      Credit Cards: ${creditCards.length}
      Total Debt: ₹${totalDebt.toLocaleString('en-IN')}
      Duration: ${duration}ms
    `;
    
    console.log('✅ Credit cards local fetch test passed:', details);
    
    return {
      testName: 'Credit Cards Local Fetch',
      success: true,
      duration,
      details,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ Credit cards local fetch test failed:', error);
    
    return {
      testName: 'Credit Cards Local Fetch',
      success: false,
      duration,
      details: 'Failed to fetch credit cards',
      error: error.message,
    };
  }
}

/**
 * Test cache performance
 */
export async function testCachePerformance(
  userId: string,
  isPremium: boolean = false
): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log('🧪 Testing cache performance...');
    
    // First fetch (cache miss)
    const firstStart = Date.now();
    await fetchFormattedCategoriesForUILocal('asset', userId, isPremium);
    const firstDuration = Date.now() - firstStart;
    
    // Second fetch (cache hit)
    const secondStart = Date.now();
    await fetchFormattedCategoriesForUILocal('asset', userId, isPremium);
    const secondDuration = Date.now() - secondStart;
    
    const improvement = ((firstDuration - secondDuration) / firstDuration) * 100;
    const totalDuration = Date.now() - startTime;
    
    const details = `
      First fetch (cache miss): ${firstDuration}ms
      Second fetch (cache hit): ${secondDuration}ms
      Improvement: ${improvement.toFixed(1)}%
      Total: ${totalDuration}ms
    `;
    
    console.log('✅ Cache performance test passed:', details);
    
    return {
      testName: 'Cache Performance',
      success: true,
      duration: totalDuration,
      details,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ Cache performance test failed:', error);
    
    return {
      testName: 'Cache Performance',
      success: false,
      duration,
      details: 'Failed to test cache',
      error: error.message,
    };
  }
}

/**
 * Run all Net Worth tests
 */
export async function runNetWorthTests(
  userId: string,
  isPremium: boolean = false
): Promise<TestResult[]> {
  console.log('🚀 Starting Net Worth local-first tests...\n');
  
  const results: TestResult[] = [];
  
  // Test 1: Net Worth fetch
  results.push(await testNetWorthLocalFetch(userId, isPremium));
  
  // Test 2: Accounts fetch
  results.push(await testAccountsLocalFetch(userId));
  
  // Test 3: Credit Cards fetch
  results.push(await testCreditCardsLocalFetch(userId));
  
  // Test 4: Cache performance
  results.push(await testCachePerformance(userId, isPremium));
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.testName}: ${result.duration}ms`);
    if (result.details) {
      console.log(`   ${result.details.trim().replace(/\n/g, '\n   ')}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${successCount}/${results.length} tests passed`);
  console.log(`Total Duration: ${totalDuration}ms`);
  console.log('='.repeat(50));
  
  return results;
}


