/**
 * ============================================================================
 * Check MoM Calculation Script
 * ============================================================================
 * This script verifies the Month-over-Month calculation by:
 * 1. Fetching the current total balance from accounts_real
 * 2. Fetching the previous month's end balance from account_balance_history_real
 * 3. Calculating the MoM percentage
 * 4. Comparing with what the app is showing
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', 'config', 'database.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Supabase credentials not found in config/database.env');
  console.error('   Required: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('🔍 Checking MoM Calculation...\n');

// Get current date info
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 0-11
const currentDay = now.getDate();

// Get previous month
const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

console.log(`📅 Current Date: ${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`);
console.log(`📅 Previous Month: ${previousYear}-${String(previousMonth + 1).padStart(2, '0')} (checking for month-end snapshot)\n`);

async function checkMoMCalculation() {
  try {
    // 1. Get current total balance
    console.log('1️⃣ Fetching current total balance from accounts_real...');
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts_real')
      .select('id, name, current_balance')
      .not('current_balance', 'is', null)
      .order('name', { ascending: true });

    if (accountsError) {
      console.error('❌ Error fetching accounts:', accountsError);
      return;
    }

    console.log(`   Found ${accounts.length} accounts with balances:`);
    let currentTotal = 0;
    accounts.forEach(acc => {
      console.log(`   - ${acc.name}: ₹${acc.current_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      currentTotal += acc.current_balance;
    });
    console.log(`   📊 CURRENT TOTAL: ₹${currentTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`);

    // 2. Get previous month's end balance
    console.log('2️⃣ Fetching previous month\'s end balance from account_balance_history_real...');
    
    // Calculate month-end date
    const monthEnd = new Date(previousYear, previousMonth + 1, 0);
    const monthEndStr = `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;
    
    console.log(`   Looking for snapshots on or before: ${monthEndStr}`);
    
    const { data: history, error: historyError } = await supabase
      .from('account_balance_history_real')
      .select('account_id, balance, snapshot_date')
      .lte('snapshot_date', monthEndStr)
      .gte('snapshot_date', `${previousYear}-${String(previousMonth + 1).padStart(2, '0')}-01`)
      .order('snapshot_date', { ascending: false });

    if (historyError) {
      console.error('❌ Error fetching history:', historyError);
      return;
    }

    console.log(`   Found ${history.length} balance snapshots in previous month`);
    
    // Get the latest snapshot for each account
    const latestByAccount = new Map();
    history.forEach(snapshot => {
      if (!latestByAccount.has(snapshot.account_id)) {
        latestByAccount.set(snapshot.account_id, snapshot);
      }
    });

    console.log(`   Latest snapshots for ${latestByAccount.size} accounts:`);
    let previousTotal = 0;
    for (const [accountId, snapshot] of latestByAccount.entries()) {
      const account = accounts.find(a => a.id === accountId);
      const accountName = account ? account.name : 'Unknown';
      console.log(`   - ${accountName} (${snapshot.snapshot_date}): ₹${snapshot.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      previousTotal += snapshot.balance;
    }
    console.log(`   📊 PREVIOUS MONTH TOTAL: ₹${previousTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`);

    // 3. Calculate MoM
    console.log('3️⃣ Calculating Month-over-Month Change...');
    const changeAmount = currentTotal - previousTotal;
    const changePercentage = previousTotal > 0 ? (changeAmount / previousTotal) * 100 : 0;
    const sign = changePercentage >= 0 ? '+' : '';
    const trend = changePercentage > 0.1 ? 'up' : changePercentage < -0.1 ? 'down' : 'neutral';
    const trendEmoji = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
    const trendColor = trend === 'up' ? 'GREEN' : trend === 'down' ? 'RED' : 'BLUE';

    console.log(`   Change Amount: ₹${changeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`   Change Percentage: ${sign}${changePercentage.toFixed(1)}%`);
    console.log(`   Trend: ${trend.toUpperCase()} ${trendEmoji}`);
    console.log(`   Expected Color: ${trendColor}\n`);

    console.log('✅ MoM Calculation Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Expected to show on Accounts Card: ${sign}${changePercentage.toFixed(1)}%`);
    console.log(`🎨 Expected color: ${trendColor} (${trend})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 4. Check if any accounts are missing from history
    const accountsInHistory = new Set(Array.from(latestByAccount.keys()));
    const accountsWithoutHistory = accounts.filter(acc => !accountsInHistory.has(acc.id));
    
    if (accountsWithoutHistory.length > 0) {
      console.log('⚠️  Warning: Some accounts have no historical data:');
      accountsWithoutHistory.forEach(acc => {
        console.log(`   - ${acc.name} (Current balance: ₹${acc.current_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`);
      });
      console.log('   → These accounts are included in current total but not in previous month\'s total');
      console.log('   → This may inflate the MoM percentage if they are new accounts\n');
    }

  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

// Run the check
checkMoMCalculation();

