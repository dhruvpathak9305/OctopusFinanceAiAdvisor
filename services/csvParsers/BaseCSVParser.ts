import { CSVParser, CSVParserResult, ParsedBankStatement, BankTransaction, StatementMetadata } from './types';

export abstract class BaseCSVParser implements CSVParser {
  protected abstract bankName: string;
  protected abstract supportedFormats: string[];

  abstract canParse(content: string): boolean;
  abstract parse(content: string): Promise<CSVParserResult>;

  getBankName(): string {
    return this.bankName;
  }

  getSupportedFormats(): string[] {
    return this.supportedFormats;
  }

  protected parseCSVContent(content: string): string[][] {
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map(line => this.parseCSVLine(line));
  }

  protected parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  protected parseAmount(amountStr: string): number {
    if (!amountStr) return 0;
    
    // Remove currency symbols, commas, and handle negative amounts
    const cleanAmount = amountStr
      .replace(/[^\d.-]/g, '')
      .replace(/,/g, '');
    
    const amount = parseFloat(cleanAmount);
    return isNaN(amount) ? 0 : amount;
  }

  protected parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();

    // Try multiple date formats
    const dateFormats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/, // MM/DD/YYYY or DD/MM/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{2,4})/,   // MM-DD-YYYY or DD-MM-YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/,     // YYYY-MM-DD
    ];

    for (const format of dateFormats) {
      const match = dateStr.match(format);
      if (match) {
        const [, first, second, third] = match;
        
        // Try to determine the format based on the values
        if (parseInt(first) > 12) {
          // First is year (YYYY-MM-DD)
          return new Date(parseInt(first), parseInt(second) - 1, parseInt(third));
        } else if (parseInt(third) > 31) {
          // Third is year (MM/DD/YYYY)
          return new Date(parseInt(third), parseInt(first) - 1, parseInt(second));
        }
        // Assume MM/DD/YYYY
        return new Date(parseInt(third), parseInt(first) - 1, parseInt(second));
      }
    }

    // Fallback to Date constructor - but be more careful
    try {
      const fallbackDate = new Date(dateStr);
      if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate;
      }
    } catch (e) {
      console.warn('Failed to parse date:', dateStr, e);
    }
    
    // If all else fails, return current date
    return new Date();
  }

  protected createStatementMetadata(
    transactions: BankTransaction[],
    statementType: string = 'Bank Statement'
  ): StatementMetadata {
    const totalTransactions = transactions.length;
    const totalCredits = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const dates = transactions
      .map(t => this.parseDate(t.date))
      .filter(d => !isNaN(d.getTime()));

    const dateRange = {
      start: dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date(),
      end: dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date(),
    };

    return {
      bankName: this.bankName,
      statementType,
      parsingDate: new Date(),
      totalTransactions,
      totalCredits,
      totalDebits,
      dateRange,
    };
  }

  protected createSuccessResult(data: ParsedBankStatement): CSVParserResult {
    return {
      success: true,
      data,
      errors: [],
      warnings: [],
    };
  }

  protected createErrorResult(errors: string[]): CSVParserResult {
    return {
      success: false,
      data: null,
      errors,
      warnings: [],
    };
  }

  protected addWarning(result: CSVParserResult, warning: string): void {
    if (!result.warnings.includes(warning)) {
      result.warnings.push(warning);
    }
  }

  protected addError(result: CSVParserResult, error: string): void {
    if (!result.errors.includes(error)) {
      result.errors.push(error);
    }
  }
}
