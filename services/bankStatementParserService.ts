import { ParsedTransaction, ParsingResult, ParsingOptions } from '../src/mobile/types/bankStatement';
import OpenAIService, { OpenAIParsingResult } from './openaiService';

// Interface for database-compatible transactions
export interface DatabaseTransaction {
  id: string;
  user_id: string;
  name: string;
  description: string;
  amount: number;
  date: Date;
  type: string;
  category_id: string | null;
  subcategory_id: string | null;
  icon: string;
  merchant: string;
  source_account_id: string;
  source_account_type: string;
  source_account_name: string;
  destination_account_id: string | null | undefined;
  destination_account_type: string | null | undefined;
  destination_account_name: string | null | undefined;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  recurrence_end_date: Date | null;
  parent_transaction_id: string | null;
  interest_rate: number | null;
  loan_term_months: number | null;
  created_at: Date;
  updated_at: Date;
  metadata: Record<string, any>;
}

export interface DatabaseTransactionResult {
  success: boolean;
  transactions: DatabaseTransaction[];
  totalAmount: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  aiUsed: boolean;
  errors: string[];
}

export class BankStatementParserService {
  private static instance: BankStatementParserService;
  private openaiService: OpenAIService;

  private constructor() {
    this.openaiService = OpenAIService.getInstance();
  }

  public static getInstance(): BankStatementParserService {
    if (!BankStatementParserService.instance) {
      BankStatementParserService.instance = new BankStatementParserService();
    }
    return BankStatementParserService.instance;
  }

  /**
   * Parse bank statement content based on file type
   */
  public async parseStatement(
    content: string,
    fileType: string,
    options: ParsingOptions = {}
  ): Promise<ParsingResult> {
    try {
      let transactions: ParsedTransaction[] = [];

      switch (fileType.toLowerCase()) {
        case 'csv':
          transactions = await this.parseCSV(content, options);
          break;
        case 'pdf':
          transactions = await this.parsePDF(content, options);
          break;
        case 'xlsx':
        case 'xls':
          transactions = await this.parseExcel(content, options);
          break;
        case 'doc':
        case 'docx':
          transactions = await this.parseWord(content, options);
          break;
        default:
          transactions = await this.parseGenericText(content, options);
      }

      // Apply post-processing options
      if (options.autoCategorize) {
        transactions = this.autoCategorizeTransactions(transactions);
      }

      if (options.mergeDuplicates) {
        transactions = this.mergeDuplicateTransactions(transactions);
      }

      if (options.validateAmounts) {
        transactions = this.validateTransactionAmounts(transactions);
      }

      const result = this.createParsingResult(transactions);
      return result;
    } catch (error) {
      console.error('Error parsing bank statement:', error);
      return {
        success: false,
        transactions: [],
        totalAmount: 0,
        dateRange: { start: new Date(), end: new Date() },
        errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
      };
    }
  }

  /**
   * Parse CSV content with OpenAI integration and fallback to traditional parsing
   */
  private async parseCSV(content: string, options: ParsingOptions): Promise<ParsedTransaction[]> {
    try {
      // First, try OpenAI parsing if available and enabled
      if (options.useAI !== false && this.openaiService.isAvailable()) {
        console.log('Attempting OpenAI CSV parsing...');
        
        const aiResult: OpenAIParsingResult = await this.openaiService.parseCSVWithAI(content);
        
        if (aiResult.success && aiResult.transactions.length > 0) {
          console.log(`OpenAI successfully parsed ${aiResult.transactions.length} transactions`);
          return aiResult.transactions;
        } else {
          console.log('OpenAI parsing failed, falling back to traditional parsing:', aiResult.error);
        }
      }
    } catch (error) {
      console.warn('OpenAI parsing error, falling back to traditional parsing:', error);
    }

    // Fallback to traditional CSV parsing
    console.log('Using traditional CSV parsing as fallback...');
    return this.parseCSVTraditional(content, options);
  }

  /**
   * Parse CSV content and return transactions compatible with the database schema
   */
  public async parseCSVForDatabase(
    content: string, 
    userId: string,
    sourceAccountId: string,
    sourceAccountType: string = 'bank',
    options: ParsingOptions = {}
  ): Promise<DatabaseTransactionResult> {
    try {
      // Parse the CSV content
      const parsedTransactions = await this.parseCSV(content, options);
      
      // Transform to database format
      const databaseTransactions = parsedTransactions.map(txn => ({
        id: txn.id,
        user_id: userId,
        name: txn.description,
        description: txn.description,
        amount: txn.amount,
        date: txn.date,
        type: this.mapTransactionType(txn.type),
        category_id: null, // Will be set based on AI categorization
        subcategory_id: null,
        icon: this.getIconForCategory(txn.category),
        merchant: txn.merchant || txn.description,
        source_account_id: sourceAccountId,
        source_account_type: sourceAccountType,
        source_account_name: 'Uploaded Statement',
        destination_account_id: undefined,
        destination_account_type: undefined,
        destination_account_name: undefined,
        is_recurring: false,
        recurrence_pattern: null,
        recurrence_end_date: null,
        parent_transaction_id: null,
        interest_rate: null,
        loan_term_months: null,
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {
          original_description: txn.description,
          ai_parsed: options.useAI !== false,
          original_amount: txn.amount,
          original_type: txn.type,
          category: txn.category,
          reference: txn.reference,
          balance: txn.balance
        }
      }));

      return {
        success: true,
        transactions: databaseTransactions,
        totalAmount: databaseTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
        dateRange: {
          start: new Date(Math.min(...databaseTransactions.map(t => t.date.getTime()))),
          end: new Date(Math.max(...databaseTransactions.map(t => t.date.getTime())))
        },
        aiUsed: options.useAI !== false && this.openaiService.isAvailable(),
        errors: []
      };

    } catch (error) {
      console.error('Error parsing CSV for database:', error);
      return {
        success: false,
        transactions: [],
        totalAmount: 0,
        dateRange: { start: new Date(), end: new Date() },
        aiUsed: false,
        errors: [error instanceof Error ? error.message : 'Unknown parsing error']
      };
    }
  }

  /**
   * Map transaction type to database schema
   */
  private mapTransactionType(type: 'credit' | 'debit'): string {
    switch (type) {
      case 'credit':
        return 'income';
      case 'debit':
        return 'expense';
      default:
        return 'expense';
    }
  }

  /**
   * Get icon for category
   */
  private getIconForCategory(category: string): string {
    const categoryIcons: Record<string, string> = {
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Utilities': '⚡',
      'Bills & Payments': '📄',
      'Income': '💰',
      'Investment': '📈',
      'Travel': '✈️',
      'Education': '📚',
      'Home & Garden': '🏠',
      'Personal Care': '💄',
      'Gifts': '🎁',
      'Insurance': '🛡️',
      'Taxes': '📊',
      'Fees': '💳',
      'Other': '📌'
    };
    
    return categoryIcons[category] || '📌';
  }

  /**
   * Traditional CSV parsing with intelligent column detection
   */
  private async parseCSVTraditional(content: string, options: ParsingOptions): Promise<ParsedTransaction[]> {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = this.parseCSVHeaders(lines[0]);
    const transactions: ParsedTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line);
      const transaction = this.createTransactionFromCSV(headers, values);
      
      if (transaction) {
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  /**
   * Parse CSV headers and detect column types
   */
  private parseCSVHeaders(headerLine: string): Record<string, string> {
    const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
    const headerMap: Record<string, string> = {};

    headers.forEach((header, index) => {
      if (header.includes('date') || header.includes('transaction date')) {
        headerMap.date = header;
      } else if (header.includes('amount') || header.includes('debit') || header.includes('credit')) {
        headerMap.amount = header;
      } else if (header.includes('description') || header.includes('memo') || header.includes('payee')) {
        headerMap.description = header;
      } else if (header.includes('balance')) {
        headerMap.balance = header;
      } else if (header.includes('reference') || header.includes('ref')) {
        headerMap.reference = header;
      } else if (header.includes('merchant') || header.includes('vendor')) {
        headerMap.merchant = header;
      }
    });

    return headerMap;
  }

  /**
   * Parse CSV line with proper handling of quoted values
   */
  private parseCSVLine(line: string): string[] {
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

  /**
   * Create transaction from CSV values
   */
  private createTransactionFromCSV(headers: Record<string, string>, values: string[]): ParsedTransaction | null {
    try {
      const dateStr = this.findValueByHeader(headers, 'date', values);
      const amountStr = this.findValueByHeader(headers, 'amount', values);
      const description = this.findValueByHeader(headers, 'description', values) || 'Unknown Transaction';
      const balanceStr = this.findValueByHeader(headers, 'balance', values);
      const reference = this.findValueByHeader(headers, 'reference', values);
      const merchant = this.findValueByHeader(headers, 'merchant', values);

      if (!dateStr || !amountStr) {
        return null;
      }

      const date = this.parseDate(dateStr);
      const amount = this.parseAmount(amountStr);
      const balance = balanceStr ? this.parseAmount(balanceStr) : undefined;

      if (isNaN(date.getTime()) || isNaN(amount)) {
        return null;
      }

      return {
        id: `txn_${Date.now()}_${Math.random()}`,
        date,
        description,
        amount: Math.abs(amount),
        type: amount < 0 ? 'debit' : 'credit',
        category: 'uncategorized',
        account: 'uploaded_statement',
        merchant,
        reference,
        balance,
      };
    } catch (error) {
      console.error('Error creating transaction from CSV:', error);
      return null;
    }
  }

  /**
   * Find value by header type
   */
  private findValueByHeader(headers: Record<string, string>, headerType: string, values: string[]): string | null {
    const header = headers[headerType];
    if (!header) return null;

    const headerIndex = Object.values(headers).indexOf(header);
    return headerIndex >= 0 && headerIndex < values.length ? values[headerIndex] : null;
  }

  /**
   * Parse PDF content (simplified text extraction)
   */
  private async parsePDF(content: string, options: ParsingOptions): Promise<ParsedTransaction[]> {
    // This is a simplified PDF parser
    // In production, you'd want to use a proper PDF parsing library
    return this.parseGenericText(content, options);
  }

  /**
   * Parse Excel content
   */
  private async parseExcel(content: string, options: ParsingOptions): Promise<ParsedTransaction[]> {
    // For Excel files, we'll use the generic text parser
    // In production, you'd want to use a proper Excel parsing library
    return this.parseGenericText(content, options);
  }

  /**
   * Parse Word document content
   */
  private async parseWord(content: string, options: ParsingOptions): Promise<ParsedTransaction[]> {
    // For Word documents, we'll use the generic text parser
    return this.parseGenericText(content, options);
  }

  /**
   * Parse generic text content with pattern matching
   */
  private async parseGenericText(content: string, options: ParsingOptions): Promise<ParsedTransaction[]> {
    const lines = content.split('\n').filter(line => line.trim());
    const transactions: ParsedTransaction[] = [];

    for (const line of lines) {
      const transaction = this.extractTransactionFromText(line);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  /**
   * Extract transaction information from text line
   */
  private extractTransactionFromText(line: string): ParsedTransaction | null {
    try {
      // Look for common transaction patterns
      const amountMatch = line.match(/(\d+\.\d{2})/);
      const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
      
      if (amountMatch && dateMatch) {
        const amount = parseFloat(amountMatch[0]);
        const date = this.parseDate(dateMatch[0]);
        
        if (isNaN(date.getTime()) || isNaN(amount)) {
          return null;
        }

        // Extract description by removing amount and date
        let description = line
          .replace(amountMatch[0], '')
          .replace(dateMatch[0], '')
          .trim();

        // Clean up description
        description = description.replace(/[^\w\s]/g, ' ').trim();
        
        if (!description) {
          description = 'Unknown Transaction';
        }

        return {
          id: `txn_${Date.now()}_${Math.random()}`,
          date,
          description,
          amount: Math.abs(amount),
          type: amount < 0 ? 'debit' : 'credit',
          category: 'uncategorized',
          account: 'uploaded_statement',
        };
      }
    } catch (error) {
      console.error('Error extracting transaction from text:', error);
    }

    return null;
  }

  /**
   * Parse date string with multiple format support
   */
  private parseDate(dateStr: string): Date {
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
        } else {
          // Assume MM/DD/YYYY
          return new Date(parseInt(third), parseInt(first) - 1, parseInt(second));
        }
      }
    }

    // Fallback to Date constructor
    return new Date(dateStr);
  }

  /**
   * Parse amount string with currency symbol handling
   */
  private parseAmount(amountStr: string): number {
    // Remove currency symbols and commas, handle negative amounts
    const cleanAmount = amountStr
      .replace(/[^\d.-]/g, '')
      .replace(/,/g, '');
    
    return parseFloat(cleanAmount);
  }

  /**
   * Auto-categorize transactions based on description patterns
   */
  private autoCategorizeTransactions(transactions: ParsedTransaction[]): ParsedTransaction[] {
    const categoryPatterns: Record<string, RegExp[]> = {
      'Food & Dining': [
        /restaurant/i, /cafe/i, /starbucks/i, /mcdonalds/i, /uber eats/i, /doordash/i,
        /grubhub/i, /pizza/i, /burger/i, /taco/i, /subway/i, /kfc/i, /wendys/i
      ],
      'Transportation': [
        /uber/i, /lyft/i, /taxi/i, /gas/i, /shell/i, /exxon/i, /chevron/i,
        /parking/i, /toll/i, /metro/i, /bus/i, /train/i, /subway/i
      ],
      'Shopping': [
        /amazon/i, /walmart/i, /target/i, /costco/i, /best buy/i, /home depot/i,
        /lowes/i, /macy/i, /nordstrom/i, /gap/i, /old navy/i, /h&m/i
      ],
      'Entertainment': [
        /netflix/i, /spotify/i, /hulu/i, /disney/i, /hbo/i, /youtube/i,
        /movie/i, /theater/i, /concert/i, /game/i, /playstation/i, /xbox/i
      ],
      'Healthcare': [
        /cvs/i, /walgreens/i, /rite aid/i, /pharmacy/i, /doctor/i, /hospital/i,
        /medical/i, /dental/i, /vision/i, /insurance/i
      ],
      'Utilities': [
        /electric/i, /gas/i, /water/i, /internet/i, /phone/i, /cable/i,
        /at&t/i, /verizon/i, /comcast/i, /xfinity/i, /spectrum/i
      ],
      'Bills & Payments': [
        /mortgage/i, /rent/i, /loan/i, /credit card/i, /insurance/i,
        /utility/i, /subscription/i, /membership/i
      ],
    };

    return transactions.map(transaction => {
      for (const [category, patterns] of Object.entries(categoryPatterns)) {
        if (patterns.some(pattern => pattern.test(transaction.description))) {
          return { ...transaction, category };
        }
      }
      return transaction;
    });
  }

  /**
   * Merge duplicate transactions
   */
  private mergeDuplicateTransactions(transactions: ParsedTransaction[]): ParsedTransaction[] {
    const transactionMap = new Map<string, ParsedTransaction>();

    transactions.forEach(transaction => {
      const key = `${transaction.date.toDateString()}_${transaction.amount}_${transaction.description}`;
      
      if (transactionMap.has(key)) {
        // Merge with existing transaction
        const existing = transactionMap.get(key)!;
        existing.description = `${existing.description} / ${transaction.description}`;
      } else {
        transactionMap.set(key, { ...transaction });
      }
    });

    return Array.from(transactionMap.values());
  }

  /**
   * Validate transaction amounts
   */
  private validateTransactionAmounts(transactions: ParsedTransaction[]): ParsedTransaction[] {
    return transactions.filter(transaction => {
      // Check for reasonable amount ranges
      if (transaction.amount <= 0 || transaction.amount > 1000000) {
        return false;
      }
      
      // Check for suspicious round numbers (might indicate manual entry)
      if (transaction.amount % 100 === 0 && transaction.amount > 1000) {
        // Flag for review but don't remove
        console.warn('Suspicious round amount detected:', transaction);
      }
      
      return true;
    });
  }

  /**
   * Create parsing result with summary statistics
   */
  private createParsingResult(transactions: ParsedTransaction[]): ParsingResult {
    if (transactions.length === 0) {
      return {
        success: true,
        transactions: [],
        totalAmount: 0,
        dateRange: { start: new Date(), end: new Date() },
      };
    }

    const amounts = transactions.map(t => t.amount);
    const dates = transactions.map(t => t.date);
    
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
    const dateRange = {
      start: new Date(Math.min(...dates.map(d => d.getTime()))),
      end: new Date(Math.max(...dates.map(d => d.getTime()))),
    };

    return {
      success: true,
      transactions,
      totalAmount,
      dateRange,
    };
  }
}

export default BankStatementParserService;

