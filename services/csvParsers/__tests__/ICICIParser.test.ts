import { ICICIParser } from '../ICICIParser';
import { ParsedBankStatement } from '../types';

describe('ICICIParser', () => {
  let parser: ICICIParser;

  beforeEach(() => {
    parser = new ICICIParser();
  });

  describe('canParse', () => {
    it('should identify ICICI bank statements correctly', () => {
      const iciciContent = `
        ICICI BANK LIMITED
        STATEMENT SUMMARY
        Customer ID: CUST123
        as on 31/12/2024
        RELATIONSHIP,BALANCE
        Savings Account Balance,50000.00
        Fixed Deposits linked,100000.00
        TOTAL DEPOSITS,150000.00
        DATE,MODE,PARTICULARS,DEPOSITS,WITHDRAWALS,BALANCE
        01/01/2024,B/F,Balance Forward,0,0,50000.00
        02/01/2024,NEFT,Salary Credit,25000,0,75000.00
      `;

      expect(parser.canParse(iciciContent)).toBe(true);
    });

    it('should identify ICICI statements with different formats', () => {
      const iciciContent2 = `
        ICICI BANK
        STATEMENT SUMMARY
        Customer ID: CUST456
        DATE,MODE,PARTICULARS,DEPOSITS,WITHDRAWALS,BALANCE
        01/01/2024,B/F,Balance Forward,0,0,50000.00
      `;

      expect(parser.canParse(iciciContent2)).toBe(true);
    });

    it('should reject non-ICICI content', () => {
      const nonIciciContent = `
        HDFC BANK
        STATEMENT OF ACCOUNT
        DATE,DESCRIPTION,AMOUNT,BALANCE
        01/01/2024,Opening Balance,50000.00,50000.00
      `;

      expect(parser.canParse(nonIciciContent)).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse ICICI statement with all sections', async () => {
      const iciciContent = `
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

      const result = await parser.parse(iciciContent);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toHaveLength(0);

      const data = result.data as ParsedBankStatement;

      // Check customer info
      expect(data.customerInfo.name).toBe('MR. JOHN DOE');
      expect(data.customerInfo.customerId).toBe('CUST123');
      expect(data.customerInfo.address).toContain('123 MAIN STREET');

      // Check account summary
      expect(data.accountSummary.statementDate).toContain('as on 31/12/2024');
      expect(data.accountSummary.savingsBalance).toBe(50000.00);
      expect(data.accountSummary.linkedFDBalance).toBe(100000.00);
      expect(data.accountSummary.totalDeposits).toBe(150000.00);

      // Check account details
      expect(data.accountDetails).toHaveLength(2);
      expect(data.accountDetails[0].accountType).toBe('Savings');
      expect(data.accountDetails[0].balance).toBe(50000.00);

      // Check fixed deposits
      expect(data.fixedDeposits).toHaveLength(2);
      expect(data.fixedDeposits[0].depositNo).toBe('FD001');
      expect(data.fixedDeposits[0].roi).toBe(7.5);
      expect(data.fixedDeposits[0].amount).toBe(50000.00);

      // Check transactions
      expect(data.transactions).toHaveLength(4);
      expect(data.transactions[0].date).toBe('01/01/2024');
      expect(data.transactions[0].type).toBe('debit');
      expect(data.transactions[1].type).toBe('credit');
      expect(data.transactions[1].amount).toBe(25000);

      // Check reward points
      expect(data.rewardPoints).toHaveLength(1);
      expect(data.rewardPoints[0].rewardPoints).toBe(1500);

      // Check account info
      expect(data.accountInfo).toHaveLength(1);
      expect(data.accountInfo[0].ifscCode).toBe('ICIC0001234');

      // Check metadata
      expect(data.metadata.bankName).toBe('ICICI Bank');
      expect(data.metadata.totalTransactions).toBe(4);
      expect(data.metadata.totalCredits).toBe(25000);
      expect(data.metadata.totalDebits).toBe(7000);
    });

    it('should handle ICICI statement with minimal data', async () => {
      const minimalContent = `
        ICICI BANK
        DATE,MODE,PARTICULARS,DEPOSITS,WITHDRAWALS,BALANCE
        01/01/2024,B/F,Balance Forward,0,0,50000.00
        02/01/2024,NEFT,Salary,25000,0,75000.00
      `;

      const result = await parser.parse(minimalContent);

      expect(result.success).toBe(true);
      expect(result.data?.transactions).toHaveLength(2);
      expect(result.data?.metadata.totalTransactions).toBe(2);
    });

    it('should handle empty or invalid content', async () => {
      const emptyContent = '';
      const result = await parser.parse(emptyContent);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('CSV file is too short to be a valid bank statement');
    });

    it('should handle content without transactions', async () => {
      const noTransactionsContent = `
        ICICI BANK
        STATEMENT SUMMARY
        Customer ID: CUST123
        RELATIONSHIP,BALANCE
        Savings Account Balance,50000.00
      `;

      const result = await parser.parse(noTransactionsContent);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No transactions found in the CSV file');
    });

    it('should parse amounts correctly', async () => {
      const contentWithAmounts = `
        ICICI BANK
        RELATIONSHIP,BALANCE
        Savings Account Balance,"50,000.00"
        Fixed Deposits linked,"1,00,000.00"
        DATE,MODE,PARTICULARS,DEPOSITS,WITHDRAWALS,BALANCE
        01/01/2024,B/F,Balance Forward,0,0,"50,000.00"
        02/01/2024,NEFT,Salary,"25,000.00",0,"75,000.00"
      `;

      const result = await parser.parse(contentWithAmounts);

      expect(result.success).toBe(true);
      expect(result.data?.accountSummary.savingsBalance).toBe(50000.00);
      expect(result.data?.accountSummary.linkedFDBalance).toBe(100000.00);
      expect(result.data?.transactions[1].amount).toBe(25000);
    });

    it('should handle different date formats', async () => {
      const contentWithDates = `
        ICICI BANK
        DATE,MODE,PARTICULARS,DEPOSITS,WITHDRAWALS,BALANCE
        01-01-2024,B/F,Balance Forward,0,0,50000.00
        2024-02-01,NEFT,Salary,25000,0,75000.00
        15/03/2024,ATM,Withdrawal,0,5000,70000.00
      `;

      const result = await parser.parse(contentWithDates);

      expect(result.success).toBe(true);
      expect(result.data?.transactions).toHaveLength(3);
      expect(result.data?.transactions[0].date).toBe('01-01-2024');
      expect(result.data?.transactions[1].date).toBe('2024-02-01');
      expect(result.data?.transactions[2].date).toBe('15/03/2024');
    });
  });

  describe('getBankName', () => {
    it('should return correct bank name', () => {
      expect(parser.getBankName()).toBe('ICICI Bank');
    });
  });

  describe('getSupportedFormats', () => {
    it('should return supported formats', () => {
      const formats = parser.getSupportedFormats();
      expect(formats).toContain('ICICI Bank Statement');
      expect(formats).toContain('ICICI CSV');
    });
  });
});
