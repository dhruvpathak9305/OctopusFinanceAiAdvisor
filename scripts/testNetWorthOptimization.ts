/**
 * Test script for Net Worth optimization
 * Run with: npx ts-node scripts/testNetWorthOptimization.ts
 */

import { runNetWorthTests } from '../services/testing/testNetWorthLocal';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

// For testing, you can pass userId as command line argument
// or use a test user ID
const TEST_USER_ID = process.argv[2] || 'test-user-id';

async function main() {
  console.log('🧪 Net Worth Optimization Test Suite');
  console.log('='.repeat(50));
  console.log(`User ID: ${TEST_USER_ID}\n`);
  
  try {
    const results = await runNetWorthTests(TEST_USER_ID, false);
    
    const allPassed = results.every(r => r.success);
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    
    console.log('\n📈 Performance Summary:');
    console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`Status: ${allPassed ? '✅ All tests passed' : '❌ Some tests failed'}`);
    
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}


