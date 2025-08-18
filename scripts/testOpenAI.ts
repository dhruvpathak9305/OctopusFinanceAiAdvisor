#!/usr/bin/env node

import OpenAIService from '../services/openaiService';

async function testOpenAIIntegration() {
  console.log('🧪 Testing OpenAI Integration...\n');

  try {
    // Initialize the service
    const openaiService = OpenAIService.getInstance();
    
    console.log('📊 Service Status:', openaiService.getStatus());
    
    // Test CSV parsing
    const sampleCSV = `Date,Description,Amount,Type
2024-01-15,Salary Deposit,5000.00,Credit
2024-01-16,Grocery Store,-120.50,Debit
2024-01-17,Gas Station,-45.00,Debit
2024-01-18,Online Purchase,-89.99,Debit
2024-01-19,Interest Credit,12.45,Credit`;

    console.log('\n📄 Sample CSV Content:');
    console.log(sampleCSV);
    
    console.log('\n🤖 Attempting AI parsing...');
    const result = await openaiService.parseCSVWithAI(sampleCSV, 'test_statement.csv');
    
    if (result.success) {
      console.log('✅ AI parsing successful!');
      console.log(`📊 Parsed ${result.transactions.length} transactions:`);
      
      result.transactions.forEach((txn, index) => {
        console.log(`  ${index + 1}. ${txn.date.toDateString()} - ${txn.description}`);
        console.log(`     Amount: $${txn.amount.toFixed(2)} (${txn.type})`);
        console.log(`     Category: ${txn.category}`);
        if (txn.merchant) console.log(`     Merchant: ${txn.merchant}`);
        console.log('');
      });
    } else {
      console.log('❌ AI parsing failed:', result.error);
      console.log('🔄 Fallback used:', result.fallbackUsed);
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
testOpenAIIntegration().catch(console.error);

