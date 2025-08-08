/**
 * Test Script for Real Data Integration
 * 
 * Run this script to verify that your accounts_real table integration is working
 * 
 * Usage:
 * 1. Make sure you're authenticated in your app
 * 2. Run this script to test database connectivity
 * 3. Check if real data is being fetched correctly
 */

import { 
  checkRealDataExists, 
  getSampleRealAccounts, 
  compareDataSources, 
  verifyDatabaseConnection,
  addSampleRealAccount 
} from '../utils/realDataHelper';

export const runRealDataTests = async () => {
  console.log('🚀 Starting Real Data Integration Tests...\n');

  // Test 1: Verify database connection
  console.log('📡 Test 1: Database Connection');
  const connectionTest = await verifyDatabaseConnection();
  console.log('Connected:', connectionTest.connected);
  console.log('Authenticated:', connectionTest.authenticated);
  console.log('Tables Accessible:', connectionTest.tablesAccessible);
  if (connectionTest.error) {
    console.log('❌ Error:', connectionTest.error);
  } else {
    console.log('✅ Database connection successful');
  }
  console.log('');

  // Test 2: Check if real data exists
  console.log('📊 Test 2: Real Data Availability');
  const dataCheck = await checkRealDataExists();
  console.log('Has Real Data:', dataCheck.hasData);
  console.log('Account Count:', dataCheck.count);
  if (dataCheck.error) {
    console.log('❌ Error:', dataCheck.error);
  } else if (dataCheck.hasData) {
    console.log('✅ Real data found in accounts_real table');
  } else {
    console.log('⚠️ No real data found - you may need to populate accounts_real');
  }
  console.log('');

  // Test 3: Compare demo vs real data
  console.log('⚖️ Test 3: Data Source Comparison');
  const comparison = await compareDataSources();
  if (comparison.error) {
    console.log('❌ Error:', comparison.error);
  } else {
    console.log('Demo Accounts:', comparison.demoCount);
    console.log('Real Accounts:', comparison.realCount);
    console.log('Demo Total Balance: $' + comparison.demoBalance.toLocaleString());
    console.log('Real Total Balance: $' + comparison.realBalance.toLocaleString());
    
    if (comparison.realCount > 0) {
      console.log('✅ Real data is available');
    } else {
      console.log('⚠️ No real accounts found');
    }
  }
  console.log('');

  // Test 4: Fetch sample real accounts
  console.log('📋 Test 4: Sample Real Account Data');
  const sampleData = await getSampleRealAccounts();
  if (sampleData.error) {
    console.log('❌ Error:', sampleData.error);
  } else {
    console.log('Total Balance: $' + sampleData.totalBalance.toLocaleString());
    console.log('Accounts:');
    sampleData.accounts.forEach((account, index) => {
      console.log(`  ${index + 1}. ${account.name} (${account.type}): $${account.balance.toLocaleString()}`);
    });
    
    if (sampleData.accounts.length > 0) {
      console.log('✅ Successfully fetched real account data');
    } else {
      console.log('⚠️ No accounts returned');
    }
  }
  console.log('');

  // Test 5: Add sample account (if no real data exists)
  if (!dataCheck.hasData && connectionTest.tablesAccessible) {
    console.log('➕ Test 5: Adding Sample Account');
    const addResult = await addSampleRealAccount();
    if (addResult.success) {
      console.log('✅ Sample account added successfully');
      console.log('Account:', addResult.account?.name);
      console.log('Balance: $' + addResult.account?.balance?.toLocaleString());
    } else {
      console.log('❌ Failed to add sample account:', addResult.error);
    }
    console.log('');
  }

  console.log('🏁 Real Data Integration Tests Complete!\n');
  
  // Summary
  console.log('📝 SUMMARY:');
  console.log('- Database Connection:', connectionTest.connected ? '✅' : '❌');
  console.log('- Authentication:', connectionTest.authenticated ? '✅' : '❌');
  console.log('- Table Access:', connectionTest.tablesAccessible ? '✅' : '❌');
  console.log('- Real Data Available:', dataCheck.hasData ? '✅' : '⚠️');
  console.log('');
  
  if (connectionTest.connected && connectionTest.authenticated && connectionTest.tablesAccessible) {
    if (dataCheck.hasData) {
      console.log('🎉 SUCCESS: Your app is ready to use real data from accounts_real!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Set isDemo = false in your DemoModeContext');
      console.log('2. Your components will automatically show real balance data');
      console.log('3. Use the TestRealData component to verify in your UI');
    } else {
      console.log('⚠️ SETUP NEEDED: Database is connected but no real data found');
      console.log('');
      console.log('Next steps:');
      console.log('1. Add real account data to accounts_real table');
      console.log('2. Or use the addSampleRealAccount() function for testing');
      console.log('3. Then set isDemo = false to see real data');
    }
  } else {
    console.log('❌ ISSUES FOUND: Please fix database connectivity first');
    console.log('');
    console.log('Check:');
    console.log('- Supabase configuration in lib/supabase/client.ts');
    console.log('- User authentication status');
    console.log('- Database permissions and RLS policies');
  }
};

// Export for use in components or run directly
export default runRealDataTests;
