#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fzzbfgnmbchhmqepwmer.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6emJmZ25tYmNoaG1xZXB3bWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDMyMTksImV4cCI6MjA1OTQxOTIxOX0.T47MLWYCH5xIvk9QEAYNpqwOSrm1AiWpBbZjiRmNn0U';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking Database Status...\n');

async function checkDatabase() {
  try {
    // Check accounts_real table
    console.log('1. Checking accounts_real table...');
    const { data: accounts, error: accountsError, count } = await supabase
      .from('accounts_real')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (accountsError) {
      console.log(`   ❌ Error: ${accountsError.message}`);
      console.log(`   Code: ${accountsError.code}`);
      console.log(`   Details: ${JSON.stringify(accountsError.details)}`);
    } else {
      console.log(`   ✅ Success! Found ${count} total accounts`);
      if (accounts && accounts.length > 0) {
        console.log(`   First ${accounts.length} accounts:`);
        accounts.forEach(acc => {
          console.log(`      - ${acc.name || acc.id}: Balance = ${acc.current_balance}`);
        });
      } else {
        console.log(`   ⚠️ Table is empty (no accounts found)`);
      }
    }

    // Check account_balance_history_real table
    console.log('\n2. Checking account_balance_history_real table...');
    const { data: history, error: historyError, count: historyCount } = await supabase
      .from('account_balance_history_real')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (historyError) {
      console.log(`   ❌ Error: ${historyError.message}`);
    } else {
      console.log(`   ✅ Success! Found ${historyCount} total snapshots`);
      if (history && history.length > 0) {
        console.log(`   First ${history.length} snapshots:`);
        history.forEach(h => {
          console.log(`      - ${h.snapshot_date}: ${h.balance}`);
        });
      } else {
        console.log(`   ⚠️ Table is empty (no balance history yet)`);
      }
    }

    // Check transactions_real table
    console.log('\n3. Checking transactions_real table...');
    const { data: transactions, error: txError, count: txCount } = await supabase
      .from('transactions_real')
      .select('*', { count: 'exact', head: false })
      .limit(3);

    if (txError) {
      console.log(`   ❌ Error: ${txError.message}`);
    } else {
      console.log(`   ✅ Success! Found ${txCount} total transactions`);
      if (transactions && transactions.length > 0) {
        console.log(`   First ${transactions.length} transactions:`);
        transactions.forEach(tx => {
          console.log(`      - ${tx.date}: ${tx.amount} (${tx.type})`);
        });
      } else {
        console.log(`   ⚠️ Table is empty (no transactions yet)`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('DIAGNOSIS:');
    console.log('='.repeat(60));
    
    if (accountsError?.code === 'PGRST301' || accountsError?.message?.includes('JWT')) {
      console.log('🔒 RLS (Row Level Security) is blocking access');
      console.log('   You need to be authenticated to access your data');
      console.log('   → Log in to your app first, then run this script');
    } else if (accountsError) {
      console.log('❌ Database connection issue');
      console.log('   → Check your Supabase project status');
    } else if (!accounts || accounts.length === 0) {
      console.log('⚠️ Database is accessible but has NO accounts');
      console.log('   → You need to create accounts first');
      console.log('   → Use the app to add your bank accounts');
    } else {
      console.log('✅ Database is accessible and has data');
      console.log('   → You can proceed with populating balance history');
    }

  } catch (error) {
    console.error('\n❌ Unexpected Error:', error.message);
  }
}

checkDatabase();

