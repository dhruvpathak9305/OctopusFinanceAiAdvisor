import OpenAI from 'openai';
import { ParsedTransaction } from '../src/mobile/types/bankStatement';
import ConfigService from './configService';

export interface OpenAIParsingResult {
  success: boolean;
  transactions: ParsedTransaction[];
  error?: string;
  fallbackUsed?: boolean;
}

export class OpenAIService {
  private static instance: OpenAIService;
  private openai: OpenAI | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Initialize OpenAI client with configuration
   */
  private async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Get configuration from config service
      const configService = ConfigService.getInstance();
      const openaiConfig = configService.getOpenAIConfig();

      if (!openaiConfig.apiKey) {
        console.warn('OpenAI API key not found, service will not be available');
        return false;
      }

      this.openai = new OpenAI({
        baseURL: openaiConfig.baseUrl,
        apiKey: openaiConfig.apiKey,
        defaultHeaders: {
          "HTTP-Referer": openaiConfig.siteUrl,
          "X-Title": openaiConfig.siteName,
        },
      });

      this.isInitialized = true;
      console.log('OpenAI service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize OpenAI service:', error);
      return false;
    }
  }

  /**
   * Parse CSV content using OpenAI
   */
  public async parseCSVWithAI(
    csvContent: string,
    fileName: string = 'bank_statement.csv'
  ): Promise<OpenAIParsingResult> {
    try {
      const initialized = await this.initialize();
      if (!initialized || !this.openai) {
        return {
          success: false,
          transactions: [],
          error: 'OpenAI service not available',
          fallbackUsed: true
        };
      }

      // Create a structured prompt for CSV parsing
      const prompt = this.createCSVParsingPrompt(csvContent, fileName);

      const completion = await this.openai.chat.completions.create({
        model: "openai/gpt-oss-20b:free",
        messages: [
          {
            role: "system",
            content: "You are a financial data parser. Parse the CSV content and return ONLY a valid JSON array of transactions. Each transaction should have: date (ISO string), description (string), amount (number), type ('credit' or 'debit'), category (string), merchant (string, optional), reference (string, optional). Ensure the JSON is valid and properly formatted."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent parsing
        max_tokens: 2000,
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response content from OpenAI');
      }

      // Extract JSON from response
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }

      const transactionsData = JSON.parse(jsonMatch[0]);
      
      // Validate and transform the parsed data
      const transactions = this.validateAndTransformTransactions(transactionsData);
      
      return {
        success: true,
        transactions,
        fallbackUsed: false
      };

    } catch (error) {
      console.error('OpenAI CSV parsing failed:', error);
      return {
        success: false,
        transactions: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        fallbackUsed: true
      };
    }
  }

  /**
   * Create a structured prompt for CSV parsing
   */
  private createCSVParsingPrompt(csvContent: string, fileName: string): string {
    return `Please parse the following CSV content from "${fileName}" and extract all financial transactions.

CSV Content:
${csvContent}

Requirements:
1. Parse each row as a transaction
2. Extract date, description, amount, and transaction type
3. Determine if amount is credit (positive) or debit (negative)
4. Categorize transactions based on description patterns
5. Return a JSON array with this structure:
   [
     {
       "date": "2024-01-15",
       "description": "Salary Deposit",
       "amount": 5000.00,
       "type": "credit",
       "category": "Income",
       "merchant": "Company Name",
       "reference": "REF123"
     }
   ]

6. Handle various date formats (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
7. Clean up description text (remove extra spaces, special characters)
8. Ensure amounts are positive numbers
9. Categorize transactions intelligently (Food, Transportation, Shopping, etc.)

Please return ONLY the JSON array, no additional text or explanations.`;
  }

  /**
   * Validate and transform parsed transactions
   */
  private validateAndTransformTransactions(transactionsData: any[]): ParsedTransaction[] {
    const validTransactions: ParsedTransaction[] = [];

    for (const item of transactionsData) {
      try {
        // Validate required fields
        if (!item.date || !item.description || typeof item.amount !== 'number') {
          console.warn('Skipping invalid transaction:', item);
          continue;
        }

        // Parse and validate date
        const date = this.parseDate(item.date);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date for transaction:', item);
          continue;
        }

        // Validate amount
        if (item.amount <= 0) {
          console.warn('Invalid amount for transaction:', item);
          continue;
        }

        // Create valid transaction object
        const transaction: ParsedTransaction = {
          id: `ai_parsed_${Date.now()}_${Math.random()}`,
          date,
          description: item.description.trim(),
          amount: Math.abs(item.amount),
          type: item.type === 'credit' ? 'credit' : 'debit',
          category: item.category || 'uncategorized',
          account: 'ai_parsed_statement',
          merchant: item.merchant || undefined,
          reference: item.reference || undefined,
        };

        validTransactions.push(transaction);
      } catch (error) {
        console.warn('Error processing transaction:', item, error);
      }
    }

    return validTransactions;
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
   * Check if OpenAI service is available
   */
  public isAvailable(): boolean {
    return this.isInitialized && this.openai !== null;
  }

  /**
   * Get service status
   */
  public getStatus(): { available: boolean; initialized: boolean } {
    return {
      available: this.isAvailable(),
      initialized: this.isInitialized
    };
  }
}

export default OpenAIService;
