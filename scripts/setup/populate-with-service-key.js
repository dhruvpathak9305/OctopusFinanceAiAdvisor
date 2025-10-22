#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config/database.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   'https://fzzbfgnmbchhmqepwmer.supabase.co';

// 🔑 Use SERVICE ROLE key instead of ANON key
// This bypasses RLS and allows full access
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                          process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found');
  console.error('');
  console.error('📋 To fix this:');
  console.error('1. Go to Supabase Dashboard > Settings > API');
  console.error('2. Copy the "service_role" key (NOT the anon key)');
  console.error('3. Add to config/database.env:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"');
  console.error('');
  console.error('⚠️  WARNING: Service role key has FULL ACCESS - keep it secret!');
  process.exit(1);
}

// Create client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔄 Populating Balance History (Authenticated with Service Role)...');
console.log('📊 This will process ALL accounts in accounts_real table\n');

async function populateBalanceHistory() {
  try {
    console.log('📊 Step 1: Fetching all accounts (bypassing RLS)...');
    
    // Fetch ALL accounts with balances - not limited to specific banks!
    // This works for any account in accounts_real table
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts_real')
      .select('id, name, current_balance, user_id')
      .not('current_balance', 'is', null)
      .order('name', { ascending: true });

    if (accountsError) {
      throw new Error(`Error fetching accounts: ${accountsError.message}`);
    }

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found in accounts_real table with a balance');
    }

    console.log(`✅ Found ${accounts.length} account${accounts.length !== 1 ? 's' : ''} in database:`);
    accounts.forEach(acc => {
      console.log(`   - ${acc.name}: ₹${acc.current_balance.toLocaleString('en-IN')}`);
    });

    console.log('\n📊 Step 2: Checking existing balance history...');
    
    const { data: existingHistory } = await supabase
      .from('account_balance_history_real')
      .select('account_id')
      .in('account_id', accounts.map(a => a.id));

    console.log(`   Existing snapshots: ${existingHistory?.length || 0}`);

    console.log('\n📊 Step 3: Calculating historical balances...\n');

    const now = new Date();
    const snapshots = [];

    for (const account of accounts) {
      console.log(`   Processing ${account.name}...`);
      
      // Generate last 12 month-end dates
      for (let i = 0; i < 12; i++) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        // Format date in local timezone to avoid UTC conversion issues
        const monthEndStr = `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;

        // Get transactions after this month-end
        const { data: transactionsAfter } = await supabase
          .from('transactions_real')
          .select('type, amount, date')
          .eq('source_account_id', account.id)
          .gt('date', monthEndStr);

        // Calculate net change
        let netChangeAfter = 0;
        if (transactionsAfter && transactionsAfter.length > 0) {
          netChangeAfter = transactionsAfter.reduce((sum, tx) => {
            if (tx.type === 'income') return sum - tx.amount;
            if (tx.type === 'expense') return sum + tx.amount;
            if (tx.type === 'transfer') return sum + tx.amount;
            return sum;
          }, 0);
        }

        const balanceAtMonthEnd = Math.max(account.current_balance + netChangeAfter, 0);

        snapshots.push({
          account_id: account.id,
          balance: balanceAtMonthEnd,
          snapshot_date: monthEndStr,
          user_id: account.user_id,
        });

        if (i < 3) {
          console.log(`      ${monthEndStr}: ₹${balanceAtMonthEnd.toLocaleString('en-IN')}`);
        }
      }
      console.log(`   ✅ Generated 12 snapshots`);
    }

    console.log(`\n📊 Step 4: Inserting ${snapshots.length} balance snapshots...\n`);

    // Insert in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < snapshots.length; i += batchSize) {
      const batch = snapshots.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('account_balance_history_real')
        .upsert(batch, { 
          onConflict: 'account_id,snapshot_date',
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.error(`   ❌ Error inserting batch: ${insertError.message}`);
      } else {
        inserted += batch.length;
        console.log(`   ✅ Inserted ${inserted}/${snapshots.length} snapshots`);
      }
    }

    console.log('\n📊 Step 5: Verifying results...\n');

    // Verify
    for (const account of accounts) {
      const { data: accountHistory } = await supabase
        .from('account_balance_history_real')
        .select('snapshot_date, balance')
        .eq('account_id', account.id)
        .order('snapshot_date', { ascending: false })
        .limit(3);

      console.log(`   ${account.name}:`);
      accountHistory?.forEach(h => {
        console.log(`      ${h.snapshot_date}: ₹${h.balance.toLocaleString('en-IN')}`);
      });
    }

    console.log('\n📊 Step 6: Calculating MoM Growth...\n');

    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

    const { data: currentMonth } = await supabase
      .from('account_balance_history_real')
      .select('balance')
      .eq('snapshot_date', currentMonthEnd)
      .in('account_id', accounts.map(a => a.id));

    const { data: previousMonth } = await supabase
      .from('account_balance_history_real')
      .select('balance')
      .eq('snapshot_date', previousMonthEnd)
      .in('account_id', accounts.map(a => a.id));

    const currentTotal = currentMonth?.reduce((sum, b) => sum + b.balance, 0) || 0;
    const previousTotal = previousMonth?.reduce((sum, b) => sum + b.balance, 0) || 0;

    if (previousTotal > 0) {
      const change = currentTotal - previousTotal;
      const pct = (change / previousTotal * 100).toFixed(1);
      const sign = change >= 0 ? '+' : '';
      
      console.log(`   Current Month (${currentMonthEnd}): ₹${currentTotal.toLocaleString('en-IN')}`);
      console.log(`   Previous Month (${previousMonthEnd}): ₹${previousTotal.toLocaleString('en-IN')}`);
      console.log(`   Change: ₹${change.toLocaleString('en-IN')}`);
      console.log(`   MoM Growth: ${sign}${pct}%`);
    }

    console.log('\n✅ SUCCESS! Balance history populated\n');
    console.log('📈 What happens next:');
    console.log('  • Historical chart will now display on Accounts card');
    console.log('  • Shows last 12 months of balance trends');
    console.log('  • MoM growth percentage is calculated from real data\n');
    console.log('🔄 Refresh your app to see the changes!');

  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
    process.exit(1);
  }
}

populateBalanceHistory();

