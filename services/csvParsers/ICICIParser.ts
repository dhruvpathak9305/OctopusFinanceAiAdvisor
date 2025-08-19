import { BaseCSVParser } from './BaseCSVParser';
import { CSVParserResult, ParsedBankStatement, CustomerInfo, AccountSummary, AccountDetail, FixedDeposit, BankTransaction, RewardPoint, AccountInfo } from './types';

export class ICICIParser extends BaseCSVParser {
  protected bankName = 'ICICI Bank';
  protected supportedFormats = ['ICICI Bank Statement', 'ICICI CSV'];

  canParse(content: string): boolean {
    const lines = content.split('\n').slice(0, 30); // Check more lines
    const contentUpper = content.toUpperCase();
    
    // Look for ICICI-specific identifiers
    const hasICICIIdentifier = lines.some(line => 
      line.toUpperCase().includes('ICICI') || 
      line.toUpperCase().includes('ICICI BANK') ||
      line.toUpperCase().includes('ICICI BANK LIMITED')
    );

    // Look for ICICI IFSC codes
    const hasICICIIFSC = contentUpper.includes('ICIC0') || contentUpper.match(/ICIC0[0-9]{6}/);

    // Look for ICICI MICR codes (start with specific patterns)
    const hasICICIMICR = contentUpper.includes('700229137') || contentUpper.match(/\b7002[0-9]{5}\b/);

    // Exclude IDFC and HDFC content
    const isOtherBankContent = lines.some(line => 
      line.toUpperCase().includes('IDFC') ||
      line.toUpperCase().includes('HDFC') ||
      line.toUpperCase().includes('IDFB0') ||
      line.toUpperCase().includes('HDFC0')
    );

    // Look for ICICI statement format
    const hasStatementSummary = lines.some(line => 
      line.toUpperCase().includes('STATEMENT SUMMARY') ||
      line.toUpperCase().includes('CUSTOMER ID:')
    );

    // Look for ICICI transaction format
    const hasTransactionFormat = lines.some(line => 
      line.toUpperCase().includes('DATE') && 
      line.toUpperCase().includes('MODE') && 
      line.toUpperCase().includes('PARTICULARS') &&
      line.toUpperCase().includes('DEPOSITS') && 
      line.toUpperCase().includes('WITHDRAWALS')
    );

    console.log('ICICI Parser - Detection results:', {
      hasICICIIdentifier,
      hasICICIIFSC,
      hasICICIMICR,
      hasStatementSummary,
      hasTransactionFormat,
      isOtherBankContent
    });

    return !isOtherBankContent && (hasICICIIdentifier || hasICICIIFSC || hasICICIMICR || hasStatementSummary || hasTransactionFormat);
  }

  async parse(content: string): Promise<CSVParserResult> {
    try {
      const rows = this.parseCSVContent(content);
      
      if (rows.length < 5) {
        return this.createErrorResult(['CSV file is too short to be a valid bank statement']);
      }

      const extractedData: ParsedBankStatement = {
        customerInfo: {},
        accountSummary: {},
        accountDetails: [],
        fixedDeposits: [],
        transactions: [],
        rewardPoints: [],
        accountInfo: [],
        metadata: this.createStatementMetadata([], 'ICICI Bank Statement')
      };

      let currentSection = '';
      let transactionStarted = false;
      let accountDetailsStarted = false;
      let fixedDepositsStarted = false;
      let rewardPointsStarted = false;
      let accountInfoStarted = false;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const firstCell = row[0] ? String(row[0]).trim() : '';
        
        // Extract customer information
        if (i < 10 && firstCell && !firstCell.includes('STATEMENT')) {
          if (firstCell.includes('MR.') || firstCell.includes('MS.') || firstCell.includes('MRS.')) {
            extractedData.customerInfo.name = firstCell;
          } else if (firstCell && row.length > 1 && !firstCell.includes(':')) {
            extractedData.customerInfo.address = (extractedData.customerInfo.address || '') + firstCell + ' ';
          }
        }

        // Extract account summary
        if (firstCell.includes('STATEMENT SUMMARY')) {
          const match = firstCell.match(/Customer ID:\s*(\w+)/);
          if (match) {
            extractedData.customerInfo.customerId = match[1];
          }
          const dateMatch = firstCell.match(/as on\s+(.+?)(?:\s+2\d{3}|$)/);
          if (dateMatch) {
            extractedData.accountSummary.statementDate = dateMatch[0];
          }
        }

        // Extract balance information - look for multiple patterns
        if ((firstCell === 'RELATIONSHIP' && row[1] === 'BALANCE') || 
            (firstCell.includes('RELATIONSHIP') && row.some(cell => cell && String(cell).includes('BALANCE')))) {
          for (let j = i + 1; j < i + 15 && j < rows.length; j++) {
            const balanceRow = rows[j];
            if (balanceRow[0] && balanceRow[1]) {
              const label = String(balanceRow[0]).trim();
              const value = this.parseAmount(String(balanceRow[1]));
              
              if (label.includes('Savings Account Balance')) {
                extractedData.accountSummary.savingsBalance = value;
              } else if (label.includes('Fixed Deposits linked')) {
                extractedData.accountSummary.linkedFDBalance = value;
              } else if (label.includes('Total Savings')) {
                extractedData.accountSummary.totalSavingsBalance = value;
              } else if (label === 'TOTAL DEPOSITS') {
                extractedData.accountSummary.totalDeposits = value;
              } else if (label.includes('Current Account Balance')) {
                extractedData.accountSummary.currentAccountBalance = value;
              } else if (label.includes('Total Fixed Deposits Balance')) {
                extractedData.accountSummary.totalFixedDepositsBalance = value;
              } else if (label.includes('Total Recurring Deposits Balance')) {
                extractedData.accountSummary.totalRecurringDepositsBalance = value;
              }
            }
          }
        }

        // Also look for individual balance entries scattered throughout the CSV
        if (row.length >= 2 && firstCell && row[1]) {
          const label = String(firstCell).trim();
          const value = this.parseAmount(String(row[1]));
          
          // Debug logging to see what we're parsing
          if (value > 0) {
            console.log(`ICICI Parser - Found balance: "${label}" = ${value}`);
          }
          
          if (label.includes('Savings Account Balance') && !extractedData.accountSummary.savingsBalance) {
            extractedData.accountSummary.savingsBalance = value;
            console.log(`Set savingsBalance: ${value}`);
          } else if (label.includes('Fixed Deposits linked') && !extractedData.accountSummary.linkedFDBalance) {
            extractedData.accountSummary.linkedFDBalance = value;
            console.log(`Set linkedFDBalance: ${value}`);
          } else if (label.includes('Total Savings') && !extractedData.accountSummary.totalSavingsBalance) {
            extractedData.accountSummary.totalSavingsBalance = value;
            console.log(`Set totalSavingsBalance: ${value}`);
          } else if (label === 'TOTAL DEPOSITS' && !extractedData.accountSummary.totalDeposits) {
            extractedData.accountSummary.totalDeposits = value;
            console.log(`Set totalDeposits: ${value}`);
          } else if (label.includes('Current Account Balance') && !extractedData.accountSummary.currentAccountBalance) {
            extractedData.accountSummary.currentAccountBalance = value;
            console.log(`Set currentAccountBalance: ${value}`);
          } else if (label.includes('Total Fixed Deposits Balance') && !extractedData.accountSummary.totalFixedDepositsBalance) {
            extractedData.accountSummary.totalFixedDepositsBalance = value;
            console.log(`Set totalFixedDepositsBalance: ${value}`);
          } else if (label.includes('Total Recurring Deposits Balance') && !extractedData.accountSummary.totalRecurringDepositsBalance) {
            extractedData.accountSummary.totalRecurringDepositsBalance = value;
            console.log(`Set totalRecurringDepositsBalance: ${value}`);
          }
        }

        // Extract account details
        if (firstCell === 'ACCOUNT TYPE' && !accountDetailsStarted) {
          accountDetailsStarted = true;
          const headers = row.map(h => h ? String(h).trim() : '');
          
          for (let j = i + 1; j < rows.length; j++) {
            const detailRow = rows[j];
            if (detailRow[0] === 'Total' || !detailRow[0]) break;
            
            const accountDetail: AccountDetail = {};
            headers.forEach((header, idx) => {
              if (header && detailRow[idx] !== undefined) {
                const value = detailRow[idx];
                if (header.includes('BALANCE') || header.includes('AMOUNT')) {
                  accountDetail.balance = this.parseAmount(String(value));
                } else {
                  (accountDetail as any)[header] = value;
                }
              }
            });
            
            if (Object.keys(accountDetail).length > 0) {
              extractedData.accountDetails.push(accountDetail);
            }
          }
        }

        // Extract fixed deposits
        if ((firstCell === 'DEPOSIT NO.' || firstCell.includes('DEP NO.')) && !fixedDepositsStarted) {
          fixedDepositsStarted = true;
          const headers = row.map(h => h ? String(h).trim().toUpperCase() : '');
          
          for (let j = i + 1; j < rows.length; j++) {
            const fdRow = rows[j];
            if (!fdRow[0] || String(fdRow[0]).includes('TOTAL') || String(fdRow[0]).includes('SUB TOTAL')) break;
            
            const fd: FixedDeposit = {
              depositNo: String(fdRow[0]),
              status: 'Active'
            };
            
            headers.forEach((header, idx) => {
              if (header && fdRow[idx] !== undefined && fdRow[idx] !== '') {
                const value = String(fdRow[idx]).trim();
                
                if (header.includes('OPEN DATE') || header.includes('OPENING DATE')) {
                  fd.openDate = value;
                } else if (header.includes('DEP. AMT') || header.includes('DEPOSIT AMT') || header.includes('AMOUNT')) {
                  fd.amount = this.parseAmount(value);
                } else if (header.includes('ROI') || header.includes('RATE')) {
                  fd.roi = parseFloat(value.replace('%', ''));
                } else if (header.includes('PERIOD') || header.includes('TENURE')) {
                  fd.period = value;
                } else if (header.includes('MAT. AMT') || header.includes('MATURITY AMT') || header.includes('MATURITY AMOUNT')) {
                  fd.maturityAmount = this.parseAmount(value);
                } else if (header.includes('MAT. DATE') || header.includes('MATURITY DATE')) {
                  fd.maturityDate = value;
                } else if (header.includes('BALANCE')) {
                  fd.balance = this.parseAmount(value);
                } else if (header.includes('NOMINATION')) {
                  fd.nomination = value;
                }
              }
            });
            
            // Try to extract from scientific notation (like 3.88113E+11)
            if (fd.depositNo && fd.depositNo.includes('E+')) {
              try {
                const scientificNum = parseFloat(fd.depositNo);
                if (!isNaN(scientificNum)) {
                  fd.depositNo = scientificNum.toFixed(0);
                }
              } catch (e) {
                // Keep original if conversion fails
              }
            }
            
            if (Object.keys(fd).length > 1) { // More than just depositNo
              extractedData.fixedDeposits.push(fd);
            }
          }
        }

        // Extract transactions
        if (firstCell === 'DATE' && row[1] === 'MODE' && !transactionStarted) {
          transactionStarted = true;
          const headers = row.map(h => h ? String(h).trim() : '');
          
          for (let j = i + 1; j < rows.length; j++) {
            const txnRow = rows[j];
            if (!txnRow[0]) break;
            
            const transaction: BankTransaction = {
              date: String(txnRow[0]),
              mode: txnRow[1] ? String(txnRow[1]) : undefined,
              particulars: txnRow[2] ? String(txnRow[2]) : 'Unknown Transaction',
              deposits: txnRow[3] ? this.parseAmount(String(txnRow[3])) : 0,
              withdrawals: txnRow[4] ? this.parseAmount(String(txnRow[4])) : 0,
              balance: txnRow[5] ? this.parseAmount(String(txnRow[5])) : undefined,
              type: 'debit',
              amount: 0
            };

            // Determine transaction type and amount
            if (transaction.deposits > 0) {
              transaction.type = 'credit';
              transaction.amount = transaction.deposits;
            } else if (transaction.withdrawals > 0) {
              transaction.type = 'debit';
              transaction.amount = transaction.withdrawals;
            }

            if (transaction.amount > 0) {
              extractedData.transactions.push(transaction);
            }
          }
        }

        // Extract reward points
        if (firstCell === 'SAVINGS ACCOUNT NUMBER' && !rewardPointsStarted) {
          rewardPointsStarted = true;
          const headers = row.map(h => h ? String(h).trim() : '');
          
          for (let j = i + 1; j < rows.length; j++) {
            const rpRow = rows[j];
            if (!rpRow[0] || rpRow[0] === 'Account Related Other Information') break;
            
            const rewardPoint: RewardPoint = {};
            headers.forEach((header, idx) => {
              if (header && rpRow[idx] !== undefined) {
                const value = rpRow[idx];
                if (header.includes('REWARD POINTS')) {
                  rewardPoint.rewardPoints = parseInt(String(value)) || 0;
                } else {
                  (rewardPoint as any)[header] = value;
                }
              }
            });
            
            if (Object.keys(rewardPoint).length > 0) {
              extractedData.rewardPoints.push(rewardPoint);
            }
          }
        }

        // Extract account info - look for various patterns
        if ((firstCell === 'ACCOUNT TYPE' && (row[1] === ' ACCOUNT NUMBER' || row[1] === 'ACCOUNT NUMBER')) && !accountInfoStarted) {
          accountInfoStarted = true;
          const headers = row.map(h => h ? String(h).trim().toUpperCase() : '');
          
          for (let j = i + 1; j < rows.length; j++) {
            const infoRow = rows[j];
            if (!infoRow[0] || String(infoRow[0]).includes('Account Related Other Information')) break;
            
            const info: AccountInfo = {};
            headers.forEach((header, idx) => {
              if (header && infoRow[idx] !== undefined && infoRow[idx] !== '') {
                const value = String(infoRow[idx]).trim();
                
                if (header.includes('ACCOUNT TYPE')) {
                  info.accountType = value;
                } else if (header.includes('ACCOUNT NUMBER')) {
                  info.accountNumber = value;
                } else if (header.includes('IFS CODE') || header.includes('IFSC')) {
                  info.ifscCode = value;
                } else if (header.includes('MICR CODE') || header.includes('MICR')) {
                  info.micrCode = value;
                } else if (header.includes('BRANCH')) {
                  info.branch = value;
                } else if (header.includes('NOMINEE')) {
                  info.nominee = value;
                } else if (header.includes('MANDATE HOLDER')) {
                  info.mandateHolder = value;
                } else {
                  (info as any)[header] = value;
                }
              }
            });
            
            if (Object.keys(info).length > 0) {
              extractedData.accountInfo.push(info);
            }
          }
        }
        
        // Also look for standalone MICR and IFS codes
        if (firstCell.includes('MICR CODE') && row[1]) {
          const micrCode = String(row[1]).trim();
          if (extractedData.accountInfo.length > 0) {
            extractedData.accountInfo[0].micrCode = micrCode;
          } else {
            extractedData.accountInfo.push({ micrCode });
          }
        }
        
        if (firstCell.includes('IFS CODE') && row[1]) {
          const ifscCode = String(row[1]).trim();
          if (extractedData.accountInfo.length > 0) {
            extractedData.accountInfo[0].ifscCode = ifscCode;
          } else {
            extractedData.accountInfo.push({ ifscCode });
          }
        }
      }

      // Update metadata with actual transaction data
      extractedData.metadata = this.createStatementMetadata(
        extractedData.transactions,
        'ICICI Bank Statement'
      );

      // Validate that we have at least some data
      if (extractedData.transactions.length === 0) {
        return this.createErrorResult(['No transactions found in the CSV file']);
      }

      return this.createSuccessResult(extractedData);

    } catch (error) {
      console.error('Error parsing ICICI CSV:', error);
      return this.createErrorResult([
        `Failed to parse ICICI CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
      ]);
    }
  }
}
