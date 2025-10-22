/**
 * ============================================================================
 * Force Balance Sync Script
 * ============================================================================
 * This script will trigger a manual balance recalculation in the database
 * to ensure all account balances are up-to-date.
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

console.log('🔄 Force Balance Sync...\n');

async function forceSyncBalances() {
  try {
    console.log('1️⃣ Fetching all accounts...');
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts_real')
      .select('id, name, current_balance')
      .not('current_balance', 'is', null)
      .order('name', { ascending: true });

    if (accountsError) {
      console.error('❌ Error fetching accounts:', accountsError);
      return;
    }

    console.log(`   Found ${accounts.length} accounts\n`);

    console.log('2️⃣ Current balances in accounts_real:');
    let dbTotal = 0;
    accounts.forEach(acc => {
      console.log(`   - ${acc.name}: ₹${acc.current_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      dbTotal += acc.current_balance;
    });
    console.log(`   📊 TOTAL: ₹${dbTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`);

    console.log('3️⃣ Checking if balance_real table needs update...');
    
    // For each account, check if balance_real matches accounts_real
    for (const account of accounts) {
      const { data: balanceData, error: balanceError } = await supabase
        .from('balance_real')
        .select('*')
        .eq('account_id', account.id)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') { // PGRST116 = not found
        console.error(`   ⚠️ Error checking balance_real for ${account.name}:`, balanceError);
        continue;
      }

      if (!balanceData) {
        console.log(`   ⚠️ No balance_real entry for ${account.name}, creating one...`);
        // Get user_id, account_name, account_type for insert
        const { data: accountDetails, error: detailsError } = await supabase
          .from('accounts_real')
          .select('user_id, name, account_type')
          .eq('id', account.id)
          .single();

        if (detailsError || !accountDetails) {
          console.error(`   ❌ Error fetching account details for ${account.name}:`, detailsError);
          continue;
        }

        const { error: insertError } = await supabase
          .from('balance_real')
          .insert({
            account_id: account.id,
            user_id: accountDetails.user_id,
            account_name: accountDetails.name,
            account_type: accountDetails.account_type,
            current_balance: account.current_balance,
            opening_balance: account.current_balance,
            last_updated: new Date().toISOString()
          });

        if (insertError) {
          console.error(`   ❌ Error creating balance_real for ${account.name}:`, insertError);
        } else {
          console.log(`   ✅ Created balance_real entry for ${account.name}`);
        }
      } else if (balanceData.current_balance !== account.current_balance) {
        console.log(`   ⚠️ Balance mismatch for ${account.name}:`);
        console.log(`      balance_real: ₹${balanceData.current_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
        console.log(`      accounts_real: ₹${account.current_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
        console.log(`      Updating balance_real...`);

        const { error: updateError } = await supabase
          .from('balance_real')
          .update({
            current_balance: account.current_balance,
            last_updated: new Date().toISOString()
          })
          .eq('account_id', account.id);

        if (updateError) {
          console.error(`   ❌ Error updating balance_real for ${account.name}:`, updateError);
        } else {
          console.log(`   ✅ Updated balance_real for ${account.name}`);
        }
      } else {
        console.log(`   ✅ Balance matches for ${account.name}`);
      }
    }

    console.log('\n✅ Balance sync complete!');
    console.log('💡 Now try refreshing the app to see updated balances.');

  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

// Run the sync
forceSyncBalances();

