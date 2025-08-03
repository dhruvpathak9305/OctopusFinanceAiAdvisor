// TypeScript Types and Interfaces for SMS Analyzer
// Comprehensive type definitions for industry-grade implementation

export type TransactionType = 'DEBIT' | 'CREDIT' | 'TRANSFER' | 'REFUND' | 'PAYMENT' | 'WITHDRAWAL' | 'DEPOSIT';

export type AccountType = 'BANK_ACCOUNT' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'WALLET' | 'UPI';

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  lastFourDigits: string;
  type: AccountType;
  isActive: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  bankName: string;
  cardNumber: string;
  lastFourDigits: string;
  type: AccountType;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  isActive: boolean;
  color?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  isActive: boolean;
}

export interface MerchantPattern {
  id: string;
  name: string;
  aliases: string[];
  patterns: RegExp[];
  category?: string;
  subcategory?: string;
  confidence: number;
}

export interface SMSAnalysisContext {
  accounts: BankAccount[];
  creditCards: CreditCard[];
  categories: Category[];
  subcategories: Subcategory[];
  merchantPatterns: MerchantPattern[];
}

export interface ParsedTransaction {
  transactionType: TransactionType | null;
  accountId: string | null;
  accountName: string | null;
  accountType: AccountType | null;
  amount: number | null;
  transactionDate: Date | null;
  merchant: string | null;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  subcategoryId: string | null;
  subcategoryName: string | null;
  confidence: number;
  rawSms: string;
}

export interface SMSAnalysisResult {
  success: boolean;
  data: ParsedTransaction | null;
  confidence: number;
  errors: string[];
}

export interface AccountMatchResult {
  accountId: string | null;
  accountName: string | null;
  accountType: AccountType | null;
  confidence: number;
  matchedBy: 'LAST_FOUR_DIGITS' | 'BANK_NAME' | 'ACCOUNT_NAME' | 'PATTERN' | null;
}

export interface MerchantMatchResult {
  name: string;
  normalizedName: string;
  category?: string;
  subcategory?: string;
  confidence: number;
  matchedBy: 'EXACT_MATCH' | 'ALIAS_MATCH' | 'PATTERN_MATCH' | 'FUZZY_MATCH' | 'FALLBACK';
}

export interface CategoryMatchResult {
  categoryId: string | null;
  categoryName: string | null;
  subcategoryId: string | null;
  subcategoryName: string | null;
  confidence: number;
  matchedBy: 'MERCHANT_MAPPING' | 'KEYWORD_MATCH' | 'PATTERN_MATCH' | 'DEFAULT' | null;
}

export interface ExtractionResult<T> {
  value: T | null;
  confidence: number;
  extractedFrom: string;
  method: string;
}

// SMS Pattern Types
export interface SMSPattern {
  name: string;
  pattern: RegExp;
  extractionGroups: {
    amount?: number;
    merchant?: number;
    account?: number;
    type?: number;
    date?: number;
  };
  confidence: number;
}

// Bank-specific patterns
export interface BankSMSPattern extends SMSPattern {
  bankName: string;
  senderIds: string[];
}

// Transaction type patterns
export interface TransactionTypePattern {
  type: TransactionType;
  keywords: string[];
  patterns: RegExp[];
  confidence: number;
}

// Amount extraction patterns
export interface AmountPattern {
  pattern: RegExp;
  currencySymbols: string[];
  decimalSeparators: string[];
  thousandSeparators: string[];
}

// Date extraction patterns
export interface DatePattern {
  pattern: RegExp;
  format: string;
  confidence: number;
}

// Merchant categorization rules
export interface MerchantCategorizationRule {
  merchantPatterns: string[];
  categoryId: string;
  subcategoryId: string;
  confidence: number;
  priority: number;
}

// Configuration interfaces
export interface SMSAnalyzerConfig {
  enableFuzzyMatching: boolean;
  fuzzyMatchThreshold: number;
  minimumConfidenceThreshold: number;
  enableMerchantNormalization: boolean;
  enableDateExtraction: boolean;
  defaultCurrency: string;
  timeZone: string;
}

// Error types
export class SMSAnalysisError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'SMSAnalysisError';
  }
}

export class ExtractionError extends SMSAnalysisError {
  constructor(message: string, public field: string, context?: any) {
    super(message, 'EXTRACTION_ERROR', context);
  }
}

export class MatchingError extends SMSAnalysisError {
  constructor(message: string, public matchType: string, context?: any) {
    super(message, 'MATCHING_ERROR', context);
  }
}

// Utility types
export type ExtractorFunction<T> = (smsText: string, context?: any) => ExtractionResult<T>;
export type MatcherFunction<T> = (input: string, context: any) => T;
export type CategorizerFunction = (merchant: string, transactionType: TransactionType) => CategoryMatchResult; 