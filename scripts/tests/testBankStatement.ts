#!/usr/bin/env node

import BankStatementParserService, { DatabaseTransactionResult } from '../services/bankStatementParserService.js';

async function testBankStatementFormat() {
  console.log('🧪 Testing Bank Statement Format Parsing...\n');

  try {
    // Initialize the parser service
    const parserService = BankStatementParserService.getInstance();
    
    // Sample CSV content matching your bank statement format
    const sampleCSV = `MR.DHRUV PATHAK,E - 146 NEAR INDIRA PARKSECTOR -B ALIGANJ,Your Relationship Manager :,Contact Number :,E-mail ID :,LUCKNOW,Your Customer Service Manager :,UTTAR PRADESH-INDIA - 226024,Contact Number :,E-mail ID :
RELATIONSHIP,Savings Account Balance(A),Fixed Deposits linked to Savings Account Balance(B),Total Savings Account Balance(A + B),Current Account Balance,Total Fixed Deposits Balance,Total Recurring Deposits Balance,TOTAL DEPOSITS
,5202021.97,520714,5722735.97,0,0,0,5722735.97
ACCOUNT TYPE,Savings A/c XXXXXXXX2899
A/C. BALANCE (I),5202021.97
FIXED DEPOSITS (LINKED) BAL. (II),520714
TOTAL BALANCE (I+II),5722735.97
NOMINATION,Registered
DEPOSIT NO.,OPEN DATE,DEP. AMT. #,ROI%,PERIOD,MAT. AMT. ^,MAT. DATE,BALANCE*,NOMINATION
3.88113E+11,8/9/24,500000,7.25,15 Mths,546985,8/12/25,520714,Registered
SUB TOTAL OF DEPOSITS LINKED TO ACCOUNT No. XXXXXXXX2899,520714,Registered
TOTAL,520714,Registered
STATEMENT OF TRANSACTIONS
Savings Number: XXXXXXXX2899
Period: July 01, 2025 to July 31, 2025
DATE,MODE,PARTICULARS,DEPOSITS,WITHDRAWALS,BALANCE
1/7/25,B/F,Balance Forward,0,0,5107087.82
8/7/25,CREDIT CARD,ATD/Auto Debit CC0xx0318,0,15630.8,5091457.02
8/7/25,UPI,Policybaza/paytm...,0,2230,5089227.02
8/7/25,UPI,Dhruv Path... (Self trans/IDFC FIRST),0,50000,5039227.02
8/7/25,UPI,Dhruv Path... (Self trans/IDFC FIRST),0,50000,4989227.02
11/7/25,UPI,Apple Serv/appleservices...,0,179,4989048.02
30-07-2025,NEFT,CITIN52025073000382738-WM GLOBAL TECHNOLOGY SERVICES I PL-GTS SALARY PAY JULY2-0520551018-CIT,224861,0,5213909.02
30-07-2025,CREDIT CARD,ATD/Auto Debit CC0xx6040,0,11887.05,5202021.97
SAVINGS ACCOUNT NUMBER,LINKED PAYBACK NUMBER,My Savings REWARD,DEBIT CARD,POINTS BALANCE*
ACCOUNT TYPE,Savings
ACCOUNT NUMBER,XXXXXXXX2899
MICR CODE,700229137
IFS CODE,ICIC0003881
NAME OF NOMINEE*,NAME OF MANDATE HOLDER`;

    console.log('📄 Sample Bank Statement CSV Content:');
    console.log('(Showing first few lines for brevity)');
    console.log(sampleCSV.split('\n').slice(0, 5).join('\n'));
    console.log('...');
    console.log('STATEMENT OF TRANSACTIONS');
    console.log('DATE,MODE,PARTICULARS,DEPOSITS,WITHDRAWALS,BALANCE');
    console.log('1/7/25,B/F,Balance Forward,0,0,5107087.82');
    console.log('8/7/25,CREDIT CARD,ATD/Auto Debit CC0xx0318,0,15630.8,5091457.02');
    console.log('...');
    
    // Mock user and account IDs
    const mockUserId = 'demo-user-123';
    const mockSourceAccountId = 'demo-account-456';
    
    console.log('\n🤖 Attempting AI-powered bank statement parsing...');
    console.log('User ID:', mockUserId);
    console.log('Account ID:', mockSourceAccountId);
    
    // Parse with database format
    const result: DatabaseTransactionResult = await parserService.parseCSVForDatabase(
      sampleCSV,
      mockUserId,
      mockSourceAccountId,
      'bank',
      { useAI: true, autoCategorize: true, mergeDuplicates: true, validateAmounts: true }
    );
    
    if (result.success) {
      console.log('\n✅ Bank Statement Parsing Successful!');
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
      console.log('\n❌ Bank Statement parsing failed:');
      console.log('Errors:', result.errors);
      console.log('AI used:', result.aiUsed);
    }
    
  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
  }
}

// Run the test
testBankStatementFormat().catch(console.error);
