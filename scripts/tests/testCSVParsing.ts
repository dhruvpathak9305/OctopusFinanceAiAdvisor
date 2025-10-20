#!/usr/bin/env node

import BankStatementParserService, { DatabaseTransactionResult } from '../services/bankStatementParserService.js';

async function testCSVParsing() {
  console.log('🧪 Testing CSV Parsing with OpenAI Integration...\n');

  try {
    // Initialize the parser service
    const parserService = BankStatementParserService.getInstance();
    
    // Sample CSV content
    const sampleCSV = `Date,Description,Amount,Type
2024-01-15,Salary Deposit,5000.00,Credit
2024-01-16,Grocery Store,-120.50,Debit
2024-01-17,Gas Station,-45.00,Debit
2024-01-18,Online Purchase,-89.99,Debit
2024-01-19,Interest Credit,12.45,Credit
2024-01-20,Restaurant,-75.25,Debit
2024-01-21,ATM Withdrawal,-200.00,Debit
2024-01-22,Refund Credit,25.99,Credit`;

    console.log('📄 Sample CSV Content:');
    console.log(sampleCSV);
    
    // Mock user and account IDs
    const mockUserId = 'test-user-123';
    const mockSourceAccountId = 'test-account-456';
    
    console.log('\n🤖 Attempting AI-powered CSV parsing...');
    console.log('User ID:', mockUserId);
    console.log('Account ID:', mockSourceAccountId);
    
    // Parse CSV for database
    const result: DatabaseTransactionResult = await parserService.parseCSVForDatabase(
      sampleCSV,
      mockUserId,
      mockSourceAccountId,
      'bank',
      { useAI: true, autoCategorize: true, mergeDuplicates: true, validateAmounts: true }
    );
    
    if (result.success) {
      console.log('\n✅ Parsing successful!');
      console.log(`📊 Total transactions: ${result.transactions.length}`);
      console.log(`💰 Total amount: $${result.totalAmount.toFixed(2)}`);
      console.log(`🤖 AI used: ${result.aiUsed ? 'Yes' : 'No'}`);
      console.log(`📅 Date range: ${result.dateRange.start.toDateString()} to ${result.dateRange.end.toDateString()}`);
      
      console.log('\n📋 Parsed Transactions:');
      result.transactions.forEach((txn, index) => {
        console.log(`\n  ${index + 1}. ${txn.name}`);
        console.log(`     Date: ${txn.date.toDateString()}`);
        console.log(`     Amount: $${txn.amount.toFixed(2)} (${txn.type})`);
        console.log(`     Category: ${txn.metadata?.category || 'uncategorized'}`);
        console.log(`     Merchant: ${txn.merchant}`);
        console.log(`     Icon: ${txn.icon}`);
        if (txn.metadata?.reference) {
          console.log(`     Reference: ${txn.metadata.reference}`);
        }
      });
      
      // Show database schema compatibility
      console.log('\n🗄️ Database Schema Compatibility:');
      const sampleTxn = result.transactions[0];
      console.log('Sample transaction fields:');
      console.log('- id:', sampleTxn.id);
      console.log('- user_id:', sampleTxn.user_id);
      console.log('- name:', sampleTxn.name);
      console.log('- amount:', sampleTxn.amount);
      console.log('- type:', sampleTxn.type);
      console.log('- source_account_type:', sampleTxn.source_account_type);
      console.log('- metadata:', JSON.stringify(sampleTxn.metadata, null, 2));
      
    } else {
      console.log('\n❌ Parsing failed:');
      console.log('Errors:', result.errors);
      console.log('AI used:', result.aiUsed);
    }
    
  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
  }
}

// Run the test
testCSVParsing().catch(console.error);
