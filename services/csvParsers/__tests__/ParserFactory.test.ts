import { ParserFactory } from '../ParserFactory';
import { ICICIParser } from '../ICICIParser';
import { CSVParser } from '../types';

describe('ParserFactory', () => {
  let factory: ParserFactory;

  beforeEach(() => {
    // Reset the singleton instance for each test
    (ParserFactory as any).instance = undefined;
    factory = ParserFactory.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = ParserFactory.getInstance();
      const instance2 = ParserFactory.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getParser', () => {
    it('should return ICICI parser for ICICI content', () => {
      const iciciContent = `
        ICICI BANK LIMITED
        STATEMENT SUMMARY
        Customer ID: CUST123
        DATE,MODE,PARTICULARS,DEPOSITS,WITHDRAWALS,BALANCE
        01/01/2024,B/F,Balance Forward,0,0,50000.00
      `;

      const parser = factory.getParser(iciciContent);
      expect(parser).toBeInstanceOf(ICICIParser);
      expect(parser?.getBankName()).toBe('ICICI Bank');
    });

    it('should return null for unsupported bank content', () => {
      const unsupportedContent = `
        UNKNOWN BANK
        STATEMENT OF ACCOUNT
        DATE,DESCRIPTION,AMOUNT
        01/01/2024,Opening Balance,50000.00
      `;

      const parser = factory.getParser(unsupportedContent);
      expect(parser).toBeNull();
    });

    it('should return null for empty content', () => {
      const parser = factory.getParser('');
      expect(parser).toBeNull();
    });
  });

  describe('getSupportedBanks', () => {
    it('should return list of supported banks', () => {
      const supportedBanks = factory.getSupportedBanks();
      expect(supportedBanks).toContain('ICICI Bank');
      expect(supportedBanks.length).toBeGreaterThan(0);
    });
  });

  describe('getAllParsers', () => {
    it('should return all registered parsers', () => {
      const parsers = factory.getAllParsers();
      expect(parsers.length).toBeGreaterThan(0);
      expect(parsers.some(p => p instanceof ICICIParser)).toBe(true);
    });
  });

  describe('addParser', () => {
    it('should add a new parser', () => {
      const mockParser: CSVParser = {
        canParse: jest.fn().mockReturnValue(true),
        parse: jest.fn(),
        getBankName: jest.fn().mockReturnValue('Test Bank'),
        getSupportedFormats: jest.fn().mockReturnValue(['Test Format']),
      };

      const initialCount = factory.getAllParsers().length;
      factory.addParser(mockParser);
      const finalCount = factory.getAllParsers().length;

      expect(finalCount).toBe(initialCount + 1);
    });

    it('should not add duplicate parsers', () => {
      const mockParser: CSVParser = {
        canParse: jest.fn().mockReturnValue(true),
        parse: jest.fn(),
        getBankName: jest.fn().mockReturnValue('ICICI Bank'),
        getSupportedFormats: jest.fn().mockReturnValue(['Test Format']),
      };

      const initialCount = factory.getAllParsers().length;
      factory.addParser(mockParser);
      const finalCount = factory.getAllParsers().length;

      // Should not add duplicate since ICICI Bank already exists
      expect(finalCount).toBe(initialCount);
    });
  });

  describe('removeParser', () => {
    it('should remove a parser by bank name', () => {
      const initialCount = factory.getAllParsers().length;
      const removed = factory.removeParser('ICICI Bank');
      
      expect(removed).toBe(true);
      expect(factory.getAllParsers().length).toBe(initialCount - 1);
    });

    it('should return false when removing non-existent parser', () => {
      const removed = factory.removeParser('Non-existent Bank');
      expect(removed).toBe(false);
    });
  });

  describe('getParserByBankName', () => {
    it('should return parser for existing bank', () => {
      const parser = factory.getParserByBankName('ICICI Bank');
      expect(parser).toBeInstanceOf(ICICIParser);
      expect(parser?.getBankName()).toBe('ICICI Bank');
    });

    it('should return null for non-existent bank', () => {
      const parser = factory.getParserByBankName('Non-existent Bank');
      expect(parser).toBeNull();
    });
  });
});
