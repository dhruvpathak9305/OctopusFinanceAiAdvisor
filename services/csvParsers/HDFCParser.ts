import { BaseCSVParser } from './BaseCSVParser';
import { CSVParserResult, ParsedBankStatement, CustomerInfo, AccountSummary, AccountDetail, FixedDeposit, BankTransaction, RewardPoint, AccountInfo } from './types';

export class HDFCParser extends BaseCSVParser {
  protected bankName = 'HDFC Bank';
  protected supportedFormats = ['HDFC Bank Statement', 'HDFC CSV'];

  canParse(content: string): boolean {
    const lines = content.split('\n').slice(0, 20); // Check first 20 lines
    
    // Look for HDFC-specific identifiers
    const hasHDFCIdentifier = lines.some(line => 
      line.includes('HDFC') || 
      line.includes('HDFC BANK') ||
      line.includes('HDFC BANK LIMITED')
    );

    // Look for HDFC statement format
    const hasStatementFormat = lines.some(line => 
      line.includes('STATEMENT OF ACCOUNT') ||
      line.includes('Account Statement') ||
      line.includes('Transaction Details')
    );

    // Look for HDFC transaction format
    const hasTransactionFormat = lines.some(line => 
      line.includes('Date') && 
      line.includes('Description') && 
      line.includes('Amount') &&
      line.includes('Balance')
    );

    return hasHDFCIdentifier || hasStatementFormat || hasTransactionFormat;
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
        metadata: this.createStatementMetadata([], 'HDFC Bank Statement')
      };

      // Extract customer information from header
      for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const row = rows[i];
        const firstCell = row[0] ? String(row[0]).trim() : '';
        
        if (firstCell.includes('Customer Name:') && row[1]) {
          extractedData.customerInfo.name = String(row[1]).trim();
        } else if (firstCell.includes('Customer ID:') && row[1]) {
          extractedData.customerInfo.customerId = String(row[1]).trim();
        } else if (firstCell.includes('Account Number:') && row[1]) {
          extractedData.accountInfo.push({
            accountNumber: String(row[1]).trim(),
            accountType: 'Savings',
            status: 'Active'
          });
        }
      }

      // Look for transaction section
      let transactionStartIndex = -1;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const firstCell = String(row[0]).trim().toLowerCase();
        
        if (firstCell === 'date' || firstCell === 'transaction date') {
          transactionStartIndex = i;
          break;
        }
      }

      if (transactionStartIndex !== -1) {
        const headers = rows[transactionStartIndex].map(h => String(h).trim().toLowerCase());
        
        // Parse transaction rows
        for (let i = transactionStartIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row[0] || String(row[0]).trim() === '') continue;
          
          // Skip summary rows
          if (String(row[0]).toLowerCase().includes('total') || 
              String(row[0]).toLowerCase().includes('balance')) {
            continue;
          }

          const transaction: BankTransaction = {
            date: String(row[0]),
            particulars: String(row[1] || 'Unknown Transaction'),
            type: 'debit',
            amount: 0,
            deposits: 0,
            withdrawals: 0
          };

          // Extract amount and determine type
          const amountStr = row[2] || row[3] || '0';
          const amount = this.parseAmount(amountStr);
          
          if (amount > 0) {
            // Determine if it's credit or debit based on context or amount sign
            if (amountStr.includes('-') || amountStr.includes('Dr')) {
              transaction.type = 'debit';
              transaction.withdrawals = amount;
            } else {
              transaction.type = 'credit';
              transaction.deposits = amount;
            }
            transaction.amount = amount;
          }

          // Extract balance if available
          if (row[4]) {
            transaction.balance = this.parseAmount(String(row[4]));
          }

          if (transaction.amount > 0) {
            extractedData.transactions.push(transaction);
          }
        }
      }

      // Update metadata with actual transaction data
      extractedData.metadata = this.createStatementMetadata(
        extractedData.transactions,
        'HDFC Bank Statement'
      );

      // Validate that we have at least some data
      if (extractedData.transactions.length === 0) {
        return this.createErrorResult(['No transactions found in the CSV file']);
      }

      return this.createSuccessResult(extractedData);

    } catch (error) {
      console.error('Error parsing HDFC CSV:', error);
      return this.createErrorResult([
        `Failed to parse HDFC CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
      ]);
    }
  }
}
