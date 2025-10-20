#!/usr/bin/env ts-node

/**
 * Demo script for the CSV Parser System
 * 
 * This script demonstrates how to use the CSV parser system
 * to parse different bank statement formats.
 */

import CSVParserService from '../services/csvParsers';

// Sample ICICI Bank Statement CSV content
const sampleICICICSV = `
ICICI BANK LIMITED
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

ACCOUNT TYPE,ACCOUNT NUMBER,BALANCE
Savings,1234567890,50000.00
Current,0987654321,25000.00

DEPOSIT NO.,OPEN DATE,DEP. AMT. #,ROI%,MAT. DATE,BALANCE *
FD001,01/01/2024,50000.00,7.5,01/01/2025,50000.00
FD002,01/02/2024,50000.00,7.0,01/02/2025,50000.00

DATE,MODE,PARTICULARS,DEPOSITS,WITHDRAWALS,BALANCE
01/01/2024,B/F,Balance Forward,0,0,50000.00
02/01/2024,NEFT,Salary Credit,25000,0,75000.00
03/01/2024,ATM,ATM Withdrawal,0,5000,70000.00
04/01/2024,UPI,UPI Payment,0,2000,68000.00

SAVINGS ACCOUNT NUMBER,REWARD POINTS,EXPIRY DATE,TIER
1234567890,1500,31/12/2025,GOLD

ACCOUNT TYPE, ACCOUNT NUMBER,IFSC CODE,BRANCH,STATUS
Savings,1234567890,ICIC0001234,MAIN BRANCH,ACTIVE
`;

// Sample HDFC Bank Statement CSV content
const sampleHDFCCSV = `
HDFC BANK LIMITED
STATEMENT OF ACCOUNT
Customer Name: JANE SMITH
Customer ID: HDFC456
Account Number: 123456789012

Date,Description,Amount,Balance
01/01/2024,Opening Balance,50000.00,50000.00
02/01/2024,Salary Credit,30000.00,80000.00
03/01/2024,ATM Withdrawal,-5000.00,75000.00
04/01/2024,UPI Payment,-2000.00,73000.00
05/01/2024,Interest Credit,500.00,73500.00
`;

// Sample unsupported bank statement
const sampleUnsupportedCSV = `
UNKNOWN BANK
STATEMENT OF ACCOUNT
Date,Description,Amount
01/01/2024,Opening Balance,10000.00
02/01/2024,Deposit,5000.00
`;

async function demoCSVParser() {
  console.log('🚀 CSV Parser System Demo\n');
  
  const parserService = CSVParserService.getInstance();
  
  console.log('📋 Supported Banks:', parserService.getSupportedBanks().join(', '));
  console.log('');

  // Test 1: ICICI Bank Statement
  console.log('🧪 Test 1: Parsing ICICI Bank Statement');
  console.log('=' .repeat(50));
  
  try {
    const iciciResult = await parserService.parseBankStatement(sampleICICICSV);
    
    if (iciciResult.success) {
      console.log('✅ ICICI parsing successful!');
      console.log(`🏦 Bank: ${iciciResult.data?.metadata.bankName}`);
      console.log(`👤 Customer: ${iciciResult.data?.customerInfo.name}`);
      console.log(`💰 Total Transactions: ${iciciResult.data?.metadata.totalTransactions}`);
      console.log(`📈 Total Credits: ₹${iciciResult.data?.metadata.totalCredits.toFixed(2)}`);
      console.log(`📉 Total Debits: ₹${iciciResult.data?.metadata.totalDebits.toFixed(2)}`);
      console.log(`🏦 Fixed Deposits: ${iciciResult.data?.fixedDeposits.length}`);
      console.log(`🎁 Reward Points: ${iciciResult.data?.rewardPoints.length > 0 ? 'Available' : 'None'}`);
    } else {
      console.log('❌ ICICI parsing failed:', iciciResult.errors);
    }
  } catch (error) {
    console.log('❌ ICICI parsing error:', error);
  }
  
  console.log('');

  // Test 2: HDFC Bank Statement
  console.log('🧪 Test 2: Parsing HDFC Bank Statement');
  console.log('=' .repeat(50));
  
  try {
    const hdfcResult = await parserService.parseBankStatement(sampleHDFCCSV);
    
    if (hdfcResult.success) {
      console.log('✅ HDFC parsing successful!');
      console.log(`🏦 Bank: ${hdfcResult.data?.metadata.bankName}`);
      console.log(`👤 Customer: ${hdfcResult.data?.customerInfo.name}`);
      console.log(`💰 Total Transactions: ${hdfcResult.data?.metadata.totalTransactions}`);
      console.log(`📈 Total Credits: ₹${hdfcResult.data?.metadata.totalCredits.toFixed(2)}`);
      console.log(`📉 Total Debits: ₹${hdfcResult.data?.metadata.totalDebits.toFixed(2)}`);
    } else {
      console.log('❌ HDFC parsing failed:', hdfcResult.errors);
    }
  } catch (error) {
    console.log('❌ HDFC parsing error:', error);
  }
  
  console.log('');

  // Test 3: Unsupported Bank Statement
  console.log('🧪 Test 3: Parsing Unsupported Bank Statement');
  console.log('=' .repeat(50));
  
  try {
    const unsupportedResult = await parserService.parseBankStatement(sampleUnsupportedCSV);
    
    if (unsupportedResult.success) {
      console.log('✅ Unsupported parsing successful!');
    } else {
      console.log('❌ Unsupported parsing failed (expected):', unsupportedResult.errors);
      console.log('💡 This is expected behavior for unsupported formats');
    }
  } catch (error) {
    console.log('❌ Unsupported parsing error:', error);
  }
  
  console.log('');

  // Test 4: Bank Detection
  console.log('🧪 Test 4: Bank Format Detection');
  console.log('=' .repeat(50));
  
  console.log(`ICICI format supported: ${parserService.isBankSupported(sampleICICICSV)}`);
  console.log(`HDFC format supported: ${parserService.isBankSupported(sampleHDFCCSV)}`);
  console.log(`Unsupported format supported: ${parserService.isBankSupported(sampleUnsupportedCSV)}`);
  
  console.log('');

  // Test 5: Parser Information
  console.log('🧪 Test 5: Parser Information');
  console.log('=' .repeat(50));
  
  const supportedBanks = parserService.getSupportedBanks();
  supportedBanks.forEach(bankName => {
    const parserInfo = parserService.getParserInfo(bankName);
    if (parserInfo) {
      console.log(`🏦 ${parserInfo.bankName}:`);
      console.log(`   Formats: ${parserInfo.supportedFormats.join(', ')}`);
      console.log(`   Available: ${parserInfo.isAvailable ? 'Yes' : 'No'}`);
    }
  });
  
  console.log('');
  console.log('🎉 Demo completed successfully!');
  console.log('');
  console.log('💡 Key Features Demonstrated:');
  console.log('   • Automatic bank format detection');
  console.log('   • Comprehensive data extraction');
  console.log('   • Error handling for unsupported formats');
  console.log('   • Easy extensibility for new banks');
  console.log('   • Rich metadata and transaction details');
}

// Run the demo
if (require.main === module) {
  demoCSVParser().catch(console.error);
}

export { demoCSVParser };
