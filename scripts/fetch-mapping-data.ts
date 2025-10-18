/**
 * Fetch Mapping Data Script
 * 
 * This script connects to your Supabase database and fetches all the UUIDs
 * you need for bulk transaction uploads. It automatically generates:
 * 1. Updated account-bank-mapping.json
 * 2. Pre-filled SQL queries
 * 3. Ready-to-use ChatGPT prompt
 * 
 * Usage: npx tsx scripts/fetch-mapping-data.ts [your-email@example.com]
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fzzbfgnmbchhmqepwmer.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6emJmZ25tYmNoaG1xZXB3bWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDMyMTksImV4cCI6MjA1OTQxOTIxOX0.T47MLWYCH5xIvk9QEAYNpqwOSrm1AiWpBbZjiRmNn0U';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Account {
  id: string;
  name: string;
  type: string;
  balance?: number;
  currency?: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  category_name?: string;
}

interface MappingData {
  user_id: string;
  user_email: string;
  accounts: Account[];
  categories: Category[];
  subcategories: Subcategory[];
  generated_at: string;
}

async function getUserByEmail(email?: string): Promise<{ id: string; email: string } | null> {
  try {
    // Try to get current authenticated user first
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (user && !error) {
      console.log('✅ Found authenticated user:', user.email);
      return { id: user.id, email: user.email || '' };
    }

    // If email provided, try to fetch from auth.users (admin access needed)
    if (email) {
      console.log('⚠️ Not authenticated. Trying to fetch user by email (requires admin access)...');
      const { data, error: queryError } = await supabase
        .from('auth.users')
        .select('id, email')
        .eq('email', email)
        .single();

      if (data && !queryError) {
        console.log('✅ Found user by email:', data.email);
        return { id: data.id, email: data.email };
      }
    }

    console.error('❌ Could not find user. Please make sure you are logged in or provide a valid email.');
    return null;
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return null;
  }
}

async function fetchAccounts(userId: string): Promise<Account[]> {
  try {
    const { data, error } = await supabase
      .from('accounts_real')
      .select('id, name, type, balance, currency')
      .eq('user_id', userId)
      .order('name');

    if (error) {
      console.error('❌ Error fetching accounts:', error);
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} accounts`);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching accounts:', error);
    return [];
  }
}

async function fetchCategories(userId: string): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('budget_categories_real')
      .select('id, name, type')
      .eq('user_id', userId)
      .order('name');

    if (error) {
      console.error('❌ Error fetching categories:', error);
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} categories`);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return [];
  }
}

async function fetchSubcategories(userId: string): Promise<Subcategory[]> {
  try {
    const { data, error } = await supabase
      .from('budget_subcategories_real')
      .select(`
        id,
        name,
        category_id,
        budget_categories_real!inner(name)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error fetching subcategories:', error);
      return [];
    }

    const subcategories = data?.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      category_id: sub.category_id,
      category_name: sub.budget_categories_real?.name || 'Unknown'
    })) || [];

    console.log(`✅ Found ${subcategories.length} subcategories`);
    return subcategories;
  } catch (error) {
    console.error('❌ Error fetching subcategories:', error);
    return [];
  }
}

function generateMappingJson(data: MappingData): void {
  const mappingFile = {
    user_id: data.user_id,
    user_email: data.user_email,
    accounts: data.accounts.map(acc => ({
      bank_name: acc.name,
      account_id: acc.id,
      account_name: acc.name,
      account_type: acc.type,
      balance: acc.balance || 0,
      currency: acc.currency || 'INR',
      notes: `Auto-generated on ${data.generated_at}`
    })),
    categories: data.categories.map(cat => ({
      category_id: cat.id,
      category_name: cat.name,
      category_type: cat.type
    })),
    subcategories: data.subcategories.map(sub => ({
      subcategory_id: sub.id,
      subcategory_name: sub.name,
      category_id: sub.category_id,
      category_name: sub.category_name
    })),
    generated_at: data.generated_at,
    instructions: {
      how_to_use: [
        '1. This file has been auto-generated with your actual UUIDs',
        '2. Update bank_name fields to match your actual bank names (ICICI, HDFC, etc.)',
        '3. Use these UUIDs in your ChatGPT prompts',
        '4. Re-run this script whenever you add new accounts or categories'
      ]
    }
  };

  const filePath = path.join(__dirname, 'account-bank-mapping.json');
  fs.writeFileSync(filePath, JSON.stringify(mappingFile, null, 2));
  console.log(`\n✅ Generated: ${filePath}`);
}

function generateReadyToUsePrompt(data: MappingData): void {
  const content = `# 🤖 ChatGPT Prompt - Ready to Use!

**Generated on**: ${data.generated_at}
**User ID**: ${data.user_id}
**Email**: ${data.user_email}

---

## 📋 Copy-Paste This Into ChatGPT

\`\`\`
You are helping me prepare my bank transactions for bulk upload into my Supabase database.

I'm providing you with a raw CSV/Excel bank statement. Please convert it into a **JSON array** matching this exact schema:

**My User UUID**: ${data.user_id}

Each transaction should be a JSON object like this:

\`\`\`json
{
  "user_id": "${data.user_id}",
  "name": "Transaction Name",
  "description": "Full bank details",
  "amount": 1549.00,
  "date": "2025-09-12T00:00:00Z",
  "type": "expense",
  "source_account_type": "bank",
  "source_account_name": "YOUR_BANK_ACCOUNT",
  "merchant": "Merchant Name",
  "metadata": {
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "${new Date().toISOString().split('T')[0]}",
    "bank_name": "YOUR_BANK_NAME"
  }
}
\`\`\`

**Required Fields**:
- user_id: "${data.user_id}" (use this for ALL transactions)
- name: Short transaction title
- amount: Positive number
- type: one of: income, expense, transfer, loan, loan_repayment, debt, debt_collection
- source_account_type: one of: bank, credit_card, cash, digital_wallet, investment, other

**My Accounts**:
${data.accounts.map(acc => `- ${acc.name} (UUID: ${acc.id}, Type: ${acc.type})`).join('\n')}

**Transaction Types**:
- expense: Money going out (use negative in description, but amount is positive)
- income: Money coming in
- transfer: Moving between my accounts

**Rules**:
1. Amount is ALWAYS positive (use type to indicate direction)
2. Extract merchant names when possible (Amazon, Flipkart, Swiggy, etc.)
3. Date format: YYYY-MM-DDTHH:MM:SSZ
4. Skip header rows and summary rows

**Now here's my bank statement CSV**:
[PASTE YOUR CSV DATA HERE]

Output ONLY the JSON array, ready to upload.
\`\`\`

---

## 📝 Usage Instructions

1. **Copy everything from "You are helping..." to the end**
2. **Paste into ChatGPT**
3. **Add your CSV data at the bottom** (replace [PASTE YOUR CSV DATA HERE])
4. **Wait for JSON output**
5. **Save as** transactions_BANK_MONTH.json
6. **Upload using** upload-bulk-transactions.sql

---

## ✅ Your Accounts (for reference)

${data.accounts.map(acc => `
### ${acc.name}
- **UUID**: ${acc.id}
- **Type**: ${acc.type}
- **Balance**: ${acc.balance || 0} ${acc.currency || 'INR'}
`).join('\n')}

---

**Ready to transform your first statement!** 🚀
`;

  const filePath = path.join(__dirname, 'READY_TO_USE_PROMPT.md');
  fs.writeFileSync(filePath, content);
  console.log(`✅ Generated: ${filePath}`);
}

function generateSampleSqlQuery(data: MappingData): void {
  const sampleAccount = data.accounts[0];
  const sampleJson = [{
    user_id: data.user_id,
    name: "Sample Transaction",
    description: "This is a test transaction with your real UUIDs",
    amount: 100.00,
    date: new Date().toISOString(),
    type: "expense",
    source_account_type: "bank",
    source_account_name: sampleAccount?.name || "Your Account",
    source_account_id: sampleAccount?.id || null,
    merchant: "Sample Merchant",
    metadata: {
      upload_source: "chatgpt_bulk_upload",
      upload_date: new Date().toISOString().split('T')[0],
      note: "Test transaction"
    }
  }];

  const content = `-- =====================================================================
-- READY TO USE SQL QUERIES (with your actual UUIDs!)
-- =====================================================================
-- Generated on: ${data.generated_at}
-- User ID: ${data.user_id}
-- Email: ${data.user_email}
-- =====================================================================

-- STEP 1: TEST WITH SAMPLE DATA
-- This uses your actual user_id and account_id

SELECT * FROM bulk_insert_transactions('
${JSON.stringify(sampleJson, null, 2)}'::jsonb);

-- Expected result: status = SUCCESS, inserted_count = 1

-- =====================================================================
-- STEP 2: VERIFY YOUR SETUP
-- =====================================================================

-- Check your accounts
SELECT id, name, type, balance 
FROM accounts_real 
WHERE user_id = '${data.user_id}'
ORDER BY name;

-- Check your categories
SELECT id, name, type 
FROM budget_categories_real 
WHERE user_id = '${data.user_id}'
ORDER BY name;

-- Check existing transactions
SELECT COUNT(*) as total_transactions
FROM transactions_real
WHERE user_id = '${data.user_id}';

-- =====================================================================
-- STEP 3: UPLOAD YOUR TRANSACTIONS
-- =====================================================================
-- Replace the JSON below with the output from ChatGPT

SELECT * FROM bulk_insert_transactions('
[
  {
    "user_id": "${data.user_id}",
    "name": "Your Transaction",
    "amount": 1000.00,
    "date": "2025-10-18T00:00:00Z",
    "type": "expense",
    "source_account_type": "bank"
  }
]'::jsonb);

-- =====================================================================
-- STEP 4: VERIFY UPLOAD
-- =====================================================================

SELECT 
  name, amount, date, type, merchant,
  metadata->>'upload_source' as upload_source
FROM transactions_real
WHERE user_id = '${data.user_id}'
AND metadata->>'upload_source' = 'chatgpt_bulk_upload'
ORDER BY date DESC
LIMIT 20;

-- =====================================================================
-- YOUR ACCOUNT REFERENCE
-- =====================================================================
${data.accounts.map(acc => `
-- ${acc.name}
-- UUID: ${acc.id}
-- Type: ${acc.type}
-- Balance: ${acc.balance || 0} ${acc.currency || 'INR'}
`).join('\n')}

-- =====================================================================
-- QUICK DELETE (if you need to remove test data)
-- =====================================================================

-- DELETE FROM transactions_real
-- WHERE user_id = '${data.user_id}'
-- AND metadata->>'upload_source' = 'chatgpt_bulk_upload'
-- AND created_at >= NOW() - INTERVAL '1 hour'; -- Only recent uploads

-- =====================================================================
-- All queries use your actual user_id: ${data.user_id}
-- =====================================================================
`;

  const filePath = path.join(__dirname, 'READY_TO_USE_QUERIES.sql');
  fs.writeFileSync(filePath, content);
  console.log(`✅ Generated: ${filePath}`);
}

async function main() {
  console.log('🚀 Fetching your mapping data from Supabase...\n');

  const email = process.argv[2]; // Optional email argument
  
  // Step 1: Get user
  const user = await getUserByEmail(email);
  if (!user) {
    console.error('\n❌ Failed to fetch user. Please:');
    console.error('   1. Make sure you are logged into the app, OR');
    console.error('   2. Provide your email: npx tsx scripts/fetch-mapping-data.ts your@email.com');
    process.exit(1);
  }

  console.log(`\n📧 User: ${user.email}`);
  console.log(`🆔 UUID: ${user.id}\n`);

  // Step 2: Fetch all data
  const accounts = await fetchAccounts(user.id);
  const categories = await fetchCategories(user.id);
  const subcategories = await fetchSubcategories(user.id);

  // Validate we have some data
  if (accounts.length === 0) {
    console.warn('\n⚠️  No accounts found! Please create some accounts in the app first.');
  }
  if (categories.length === 0) {
    console.warn('\n⚠️  No categories found! Categories are optional but recommended.');
  }

  const mappingData: MappingData = {
    user_id: user.id,
    user_email: user.email,
    accounts,
    categories,
    subcategories,
    generated_at: new Date().toISOString()
  };

  // Step 3: Generate files
  console.log('\n📝 Generating files...\n');
  generateMappingJson(mappingData);
  generateReadyToUsePrompt(mappingData);
  generateSampleSqlQuery(mappingData);

  // Summary
  console.log('\n✨ Summary:');
  console.log(`   User ID: ${user.id}`);
  console.log(`   Accounts: ${accounts.length}`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Subcategories: ${subcategories.length}`);
  
  console.log('\n📁 Generated Files:');
  console.log('   1. account-bank-mapping.json     ← Your mapping config');
  console.log('   2. READY_TO_USE_PROMPT.md        ← ChatGPT prompt with your UUID');
  console.log('   3. READY_TO_USE_QUERIES.sql      ← SQL queries with your UUID');

  console.log('\n🎯 Next Steps:');
  console.log('   1. Open READY_TO_USE_PROMPT.md');
  console.log('   2. Copy the prompt and paste into ChatGPT');
  console.log('   3. Add your bank CSV data');
  console.log('   4. Save the JSON output');
  console.log('   5. Use READY_TO_USE_QUERIES.sql to upload');

  console.log('\n✅ All done! You\'re ready to upload transactions! 🎉\n');
}

// Run the script
main().catch(console.error);

