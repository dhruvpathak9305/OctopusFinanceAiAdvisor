import { ParserFactory } from './ParserFactory';
import { CSVParserResult, ParsedBankStatement, BankTransaction } from './types';

export class CSVParserService {
  private static instance: CSVParserService;
  private parserFactory: ParserFactory;

  private constructor() {
    this.parserFactory = ParserFactory.getInstance();
  }

  public static getInstance(): CSVParserService {
    if (!CSVParserService.instance) {
      CSVParserService.instance = new CSVParserService();
    }
    return CSVParserService.instance;
  }

  /**
   * Parse CSV content and return detailed bank statement data
   */
  async parseBankStatement(content: string): Promise<CSVParserResult> {
    try {
      const parser = this.parserFactory.getParser(content);
      
      if (!parser) {
        return {
          success: false,
          data: null,
          errors: ['No suitable parser found for this bank statement format'],
          warnings: ['Consider implementing a parser for this bank format']
        };
      }

      const result = await parser.parse(content);
      return result;
    } catch (error) {
      console.error('Error in CSV parser service:', error);
      return {
        success: false,
        data: null,
        errors: [`Parser service error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }



  /**
   * Get supported banks
   */
  getSupportedBanks(): string[] {
    return this.parserFactory.getSupportedBanks();
  }

  /**
   * Check if a specific bank format is supported
   */
  isBankSupported(content: string): boolean {
    return this.parserFactory.getParser(content) !== null;
  }

  /**
   * Get parser information for a specific bank
   */
  getParserInfo(bankName: string) {
    const parser = this.parserFactory.getParserByBankName(bankName);
    if (!parser) return null;

    return {
      bankName: parser.getBankName(),
      supportedFormats: parser.getSupportedFormats(),
      isAvailable: true
    };
  }

}
