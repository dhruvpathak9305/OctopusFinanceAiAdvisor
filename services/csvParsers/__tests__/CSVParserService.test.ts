import { CSVParserService } from '../CSVParserService';
import { ParsedBankStatement } from '../types';
import { ParsingResult } from '../../bankStatementParserService';

// Mock the ParserFactory
jest.mock('../ParserFactory');
const MockParserFactory = require('../ParserFactory').ParserFactory;

describe('CSVParserService', () => {
  let service: CSVParserService;
  let mockFactory: any;

  beforeEach(() => {
    // Reset the singleton instance for each test
    (CSVParserService as any).instance = undefined;
    
    // Setup mock factory
    mockFactory = {
      getParser: jest.fn(),
      getSupportedBanks: jest.fn(),
      getParserByBankName: jest.fn(),
    };
    
    MockParserFactory.getInstance.mockReturnValue(mockFactory);
    service = CSVParserService.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = CSVParserService.getInstance();
      const instance2 = CSVParserService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('parseBankStatement', () => {
    it('should successfully parse ICICI bank statement', async () => {
      const mockParser = {
        getBankName: jest.fn().mockReturnValue('ICICI Bank'),
        parse: jest.fn().mockResolvedValue({
          success: true,
          data: {
            customerInfo: { name: 'John Doe' },
            transactions: [{ date: '01/01/2024', amount: 1000, type: 'credit' }],
            metadata: { bankName: 'ICICI Bank', totalTransactions: 1 }
          },
          errors: [],
          warnings: []
        })
      };

      mockFactory.getParser.mockReturnValue(mockParser);

      const content = 'ICICI BANK,STATEMENT SUMMARY';
      const result = await service.parseBankStatement(content);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.customerInfo.name).toBe('John Doe');
      expect(mockFactory.getParser).toHaveBeenCalledWith(content);
      expect(mockParser.parse).toHaveBeenCalledWith(content);
    });

    it('should return error when no parser is found', async () => {
      mockFactory.getParser.mockReturnValue(null);

      const content = 'UNKNOWN BANK STATEMENT';
      const result = await service.parseBankStatement(content);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No suitable parser found for this bank statement format');
      expect(result.warnings).toContain('Consider implementing a parser for this bank format');
    });

    it('should handle parser errors gracefully', async () => {
      const mockParser = {
        getBankName: jest.fn().mockReturnValue('ICICI Bank'),
        parse: jest.fn().mockRejectedValue(new Error('Parser failed'))
      };

      mockFactory.getParser.mockReturnValue(mockParser);

      const content = 'ICICI BANK,STATEMENT SUMMARY';
      const result = await service.parseBankStatement(content);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Parser service error: Parser failed');
    });
  });

  describe('parseForTransactions', () => {
    it('should convert bank statement to ParsingResult format', async () => {
      const mockBankStatement: ParsedBankStatement = {
        customerInfo: { name: 'John Doe' },
        accountSummary: {},
        accountDetails: [],
        fixedDeposits: [],
        transactions: [
          {
            date: '01/01/2024',
            particulars: 'Salary',
            amount: 50000,
            type: 'credit',
            deposits: 50000,
            withdrawals: 0,
            balance: 50000
          },
          {
            date: '02/01/2024',
            particulars: 'ATM Withdrawal',
            amount: 5000,
            type: 'debit',
            deposits: 0,
            withdrawals: 5000,
            balance: 45000
          }
        ],
        rewardPoints: [],
        accountInfo: [],
        metadata: {
          bankName: 'ICICI Bank',
          statementType: 'Bank Statement',
          parsingDate: new Date(),
          totalTransactions: 2,
          totalCredits: 50000,
          totalDebits: 5000,
          dateRange: { start: new Date(), end: new Date() }
        }
      };

      const mockParser = {
        getBankName: jest.fn().mockReturnValue('ICICI Bank'),
        parse: jest.fn().mockResolvedValue({
          success: true,
          data: mockBankStatement,
          errors: [],
          warnings: []
        })
      };

      mockFactory.getParser.mockReturnValue(mockParser);

      const content = 'ICICI BANK,STATEMENT SUMMARY';
      const result = await service.parseForTransactions(content);

      expect(result.success).toBe(true);
      expect(result.transactions).toHaveLength(2);
      expect(result.transactions[0].description).toBe('Salary');
      expect(result.transactions[0].amount).toBe(50000);
      expect(result.transactions[0].type).toBe('credit');
      expect(result.transactions[1].type).toBe('debit');
      expect(result.totalAmount).toBe(55000);
    });

    it('should handle parsing failures', async () => {
      mockFactory.getParser.mockReturnValue(null);

      const content = 'UNKNOWN BANK STATEMENT';
      const result = await service.parseForTransactions(content);

      expect(result.success).toBe(false);
      expect(result.transactions).toHaveLength(0);
      expect(result.errors).toContain('No suitable parser found for this bank statement format');
    });

    it('should handle empty transaction data', async () => {
      const mockParser = {
        getBankName: jest.fn().mockReturnValue('ICICI Bank'),
        parse: jest.fn().mockResolvedValue({
          success: true,
          data: {
            ...{} as ParsedBankStatement,
            transactions: [],
            metadata: {
              bankName: 'ICICI Bank',
              statementType: 'Bank Statement',
              parsingDate: new Date(),
              totalTransactions: 0,
              totalCredits: 0,
              totalDebits: 0,
              dateRange: { start: new Date(), end: new Date() }
            }
          },
          errors: [],
          warnings: []
        })
      };

      mockFactory.getParser.mockReturnValue(mockParser);

      const content = 'ICICI BANK,STATEMENT SUMMARY';
      const result = await service.parseForTransactions(content);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No valid transactions found in the parsed data');
    });
  });

  describe('getSupportedBanks', () => {
    it('should return supported banks from factory', () => {
      const supportedBanks = ['ICICI Bank', 'HDFC Bank'];
      mockFactory.getSupportedBanks.mockReturnValue(supportedBanks);

      const result = service.getSupportedBanks();
      expect(result).toEqual(supportedBanks);
      expect(mockFactory.getSupportedBanks).toHaveBeenCalled();
    });
  });

  describe('isBankSupported', () => {
    it('should return true for supported bank content', () => {
      const mockParser = { getBankName: jest.fn() };
      mockFactory.getParser.mockReturnValue(mockParser);

      const result = service.isBankSupported('ICICI BANK STATEMENT');
      expect(result).toBe(true);
      expect(mockFactory.getParser).toHaveBeenCalledWith('ICICI BANK STATEMENT');
    });

    it('should return false for unsupported bank content', () => {
      mockFactory.getParser.mockReturnValue(null);

      const result = service.isBankSupported('UNKNOWN BANK STATEMENT');
      expect(result).toBe(false);
    });
  });

  describe('getParserInfo', () => {
    it('should return parser information for existing bank', () => {
      const mockParser = {
        getBankName: jest.fn().mockReturnValue('ICICI Bank'),
        getSupportedFormats: jest.fn().mockReturnValue(['ICICI CSV'])
      };
      mockFactory.getParserByBankName.mockReturnValue(mockParser);

      const result = service.getParserInfo('ICICI Bank');
      expect(result).toEqual({
        bankName: 'ICICI Bank',
        supportedFormats: ['ICICI CSV'],
        isAvailable: true
      });
    });

    it('should return null for non-existent bank', () => {
      mockFactory.getParserByBankName.mockReturnValue(null);

      const result = service.getParserInfo('Non-existent Bank');
      expect(result).toBeNull();
    });
  });
});
