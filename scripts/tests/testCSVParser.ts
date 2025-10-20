#!/usr/bin/env ts-node

/**
 * Test script for the CSV Parser System
 * 
 * This script tests the CSV parser system to ensure it's working correctly.
 */

const { CSVParserService } = require('../services/csvParsers/CSVParserService');

// Sample ICICI Bank Statement CSV content (similar to what you might upload)
const sampleICICICSV = `ICICI BANK LIMITED
MR. JOHN DOE
123 MAIN STREET
CITY, STATE 12345

STATEMENT SUMMARY
Customer ID: CUST123
as on 31/12/2024

RELATIONSHIP,BALANCE
Savings Account Balance,50000.00
Fixed Deposits linked,100000.00
Total Savings Balance,150000.00
TOTAL DEPOSITS,150000.00

DATE,MODE,PARTICULARS,DEPOSITS,WITHDRAWALS,BALANCE
01/01/2024,B/F,Balance Forward,0,0,50000.00
02/01/2024,NEFT,Salary Credit,25000,0,75000.00
03/01/2024,ATM,ATM Withdrawal,0,5000,70000.00
04/01/2024,UPI,UPI Payment,0,2000,68000.00`;

async function testCSVParser() {
  console.log('🧪 Testing CSV Parser System\n');
  
  try {
    const parserService = CSVParserService.getInstance();
    console.log('✅ CSVParserService instance created successfully');
    
    console.log('📋 Supported Banks:', parserService.getSupportedBanks());
    console.log('');
    
    console.log('🔍 Testing ICICI CSV parsing...');
    const result = await parserService.parseBankStatement(sampleICICICSV);
    
    if (result.success) {
      console.log('✅ ICICI parsing successful!');
      console.log(`🏦 Bank: ${result.data?.metadata.bankName}`);
      console.log(`👤 Customer: ${result.data?.customerInfo.name}`);
      console.log(`💰 Total Transactions: ${result.data?.metadata.totalTransactions}`);
      console.log(`📈 Total Credits: ₹${result.data?.metadata.totalCredits.toFixed(2)}`);
      console.log(`📉 Total Debits: ₹${result.data?.metadata.totalDebits.toFixed(2)}`);
      
      console.log('\n📊 Transaction Details:');
      result.data?.transactions.forEach((txn: any, index: number) => {
        console.log(`  ${index + 1}. ${txn.date} - ${txn.particulars} - ₹${txn.amount} (${txn.type})`);
      });
    } else {
      console.log('❌ ICICI parsing failed:');
      result.errors.forEach((error: string) => console.log(`  - ${error}`));
      result.warnings.forEach((warning: string) => console.log(`  ⚠️ ${warning}`));
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
if (require.main === module) {
  testCSVParser().catch(console.error);
}

export { testCSVParser };
