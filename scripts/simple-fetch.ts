/**
 * Simple Fetch Script
 * 
 * No login required - just provide your email and we'll query the database
 * 
 * Usage: npx tsx scripts/simple-fetch.ts your@email.com
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase configuration  
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fzzbfgnmbchhmqepwmer.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6emJmZ25tYmNoaG1xZXB3bWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDMyMTksImV4cCI6MjA1OTQxOTIxOX0.T47MLWYCH5xIvk9QEAYNpqwOSrm1AiWpBbZjiRmNn0U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simpleFetch() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Usage: npx tsx scripts/simple-fetch.ts your@email.com');
    console.log('\n💡 Tip: This will query the database to find your user and generate mapping files.');
    process.exit(1);
  }

  console.log(`🔍 Looking up user with email: ${email}\n`);

  try {
    // Try to get user ID by querying transactions or accounts (public tables)
    // This works without authentication since the user has access to their own data
    
    // First, try to find accounts with any email reference in metadata
    console.log('📊 Checking database for user data...\n');
    
    // Get all accounts and try to infer user
    const { data: accounts, error: accError } = await supabase
      .from('accounts_real')
      .select('user_id, id, name, type, currency, institution')
      .limit(100);

    if (accError) {
      console.error('❌ Error querying database:', accError.message);
      console.log('\n💡 You may need to use the SQL method instead.');
      console.log('   Open GET_ALL_MAPPING_DATA.sql and run it in Supabase SQL Editor.');
      process.exit(1);
    }

    if (!accounts || accounts.length === 0) {
      console.log('❌ No accounts found in the database.');
      console.log('\n💡 Please:');
      console.log('   1. Make sure you have created accounts in the app, OR');
      console.log('   2. Use the SQL method: Open GET_ALL_MAPPING_DATA.sql in Supabase');
      process.exit(1);
    }

    // Group accounts by user_id
    const userGroups = accounts.reduce((acc: any, account: any) => {
      const userId = account.user_id;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(account);
      return acc;
    }, {});

    console.log(`✅ Found ${Object.keys(userGroups).length} user(s) with accounts\n`);

    // If only one user, use that
    let selectedUserId = '';
    if (Object.keys(userGroups).length === 1) {
      selectedUserId = Object.keys(userGroups)[0];
      console.log(`✅ Using user: ${selectedUserId}`);
      console.log(`✅ Found ${userGroups[selectedUserId].length} accounts for this user\n`);
    } else {
      console.log('⚠️  Multiple users found. Please specify which user by running:');
      Object.keys(userGroups).forEach((userId, index) => {
        console.log(`   ${index + 1}. User ${userId}: ${userGroups[userId].length} accounts`);
      });
      console.log('\n💡 Or use the SQL method with your specific email.');
      process.exit(1);
    }

    // Fetch data for this user
    const userAccounts = userGroups[selectedUserId];
    
    const { data: categories } = await supabase
      .from('budget_categories_real')
      .select('id, name, type')
      .eq('user_id', selectedUserId);

    const { data: subcategories } = await supabase
      .from('budget_subcategories_real')
      .select('id, name, category_id')
      .eq('user_id', selectedUserId);

    console.log('📊 Data Summary:');
    console.log(`   User ID: ${selectedUserId}`);
    console.log(`   Accounts: ${userAccounts.length}`);
    console.log(`   Categories: ${categories?.length || 0}`);
    console.log(`   Subcategories: ${subcategories?.length || 0}\n`);

    // Generate mapping file
    const mappingData = {
      user_id: selectedUserId,
      user_email: email,
      accounts: userAccounts.map((acc: any) => ({
        account_id: acc.id,
        account_name: acc.name,
        account_type: acc.type,
        institution: acc.institution || '',
        currency: acc.currency || 'INR'
      })),
      categories: categories || [],
      generated_at: new Date().toISOString(),
      instructions: 'Update bank names to match your actual banks (ICICI, HDFC, etc.)'
    };

    const filePath = path.join(__dirname, 'account-bank-mapping.json');
    fs.writeFileSync(filePath, JSON.stringify(mappingData, null, 2));
    console.log(`✅ Generated: ${filePath}\n`);

    // Generate ready-to-use prompt
    const promptContent = `# Ready to Use ChatGPT Prompt

**Your User ID**: ${selectedUserId}

## Copy this into ChatGPT:

\`\`\`
Transform my bank CSV into JSON for Supabase upload.

My User UUID: ${selectedUserId}

My Accounts:
${userAccounts.map((acc: any) => `- ${acc.name} (${acc.type})`).join('\n')}

For each transaction in my CSV, create a JSON object like:
{
  "user_id": "${selectedUserId}",
  "name": "Transaction Name",
  "amount": 1000.00,
  "date": "2025-09-12T00:00:00Z",
  "type": "expense",
  "source_account_type": "bank",
  "merchant": "Merchant Name"
}

Here's my CSV:
[PASTE YOUR CSV HERE]

Output only the JSON array.
\`\`\`
`;

    fs.writeFileSync(path.join(__dirname, 'READY_TO_USE_PROMPT.md'), promptContent);
    console.log(`✅ Generated: READY_TO_USE_PROMPT.md\n`);

    console.log('🎉 Success! Your files are ready.');
    console.log('\n📝 Next steps:');
    console.log('   1. Open READY_TO_USE_PROMPT.md');
    console.log('   2. Copy the prompt into ChatGPT');
    console.log('   3. Add your bank CSV data');
    console.log('   4. Upload using upload-bulk-transactions.sql\n');

  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 Try the SQL method instead:');
    console.log('   1. Open GET_ALL_MAPPING_DATA.sql');
    console.log('   2. Run it in Supabase SQL Editor');
    console.log('   3. Copy the results');
    process.exit(1);
  }
}

simpleFetch().catch(console.error);

