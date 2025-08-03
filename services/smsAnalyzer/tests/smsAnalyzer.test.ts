// Comprehensive Test Suite for SMS Analyzer
// Tests all components with extensive coverage and edge cases

import { SMSAnalyzer, createSMSAnalyzer } from '../index';
import { extractAmount, validateAmount, formatAmount } from '../extractors/extractAmount';
import { extractAccount } from '../extractors/extractAccount';
import { extractMerchant, validateMerchant } from '../extractors/extractMerchant';
import { extractType, validateTransactionType } from '../extractors/extractType';
import { extractDate, validateDate, formatDate } from '../extractors/extractDate';
import { BankMatcher } from '../matchers/bankMatcher';
import { MerchantMatcher } from '../matchers/merchantMatcher';
import { TransactionCategorizer } from '../categorizers/categorizeTransaction';
import { 
  SMSAnalysisContext, 
  BankAccount, 
  CreditCard, 
  Category, 
  Subcategory, 
  MerchantPattern,
  TransactionType 
} from '../types';

// Mock data for testing
const mockBankAccounts: BankAccount[] = [
  {
    id: 'acc1',
    name: 'Savings Account',
    bankName: 'HDFC Bank',
    accountNumber: '12345678901234',
    lastFourDigits: '1234',
    type: 'BANK_ACCOUNT',
    isActive: true
  },
  {
    id: 'acc2',
    name: 'Current Account',
    bankName: 'ICICI Bank',
    accountNumber: '98765432109876',
    lastFourDigits: '9876',
    type: 'BANK_ACCOUNT',
    isActive: true
  }
];

const mockCreditCards: CreditCard[] = [
  {
    id: 'card1',
    name: 'Platinum Credit Card',
    bankName: 'HDFC Bank',
    cardNumber: '4567890123456789',
    lastFourDigits: '6789',
    type: 'CREDIT_CARD',
    isActive: true
  },
  {
    id: 'card2',
    name: 'Gold Credit Card',
    bankName: 'ICICI Bank',
    cardNumber: '1234567890123456',
    lastFourDigits: '3456',
    type: 'CREDIT_CARD',
    isActive: true
  }
];

const mockCategories: Category[] = [
  {
    id: 'cat1',
    name: 'Needs',
    type: 'EXPENSE',
    isActive: true,
    color: '#FF5722'
  },
  {
    id: 'cat2',
    name: 'Wants',
    type: 'EXPENSE',
    isActive: true,
    color: '#2196F3'
  },
  {
    id: 'cat3',
    name: 'Income',
    type: 'INCOME',
    isActive: true,
    color: '#4CAF50'
  }
];

const mockSubcategories: Subcategory[] = [
  {
    id: 'sub1',
    name: 'Food & Dining',
    categoryId: 'cat1',
    isActive: true
  },
  {
    id: 'sub2',
    name: 'Transportation',
    categoryId: 'cat1',
    isActive: true
  },
  {
    id: 'sub3',
    name: 'Online Shopping',
    categoryId: 'cat2',
    isActive: true
  },
  {
    id: 'sub4',
    name: 'Entertainment',
    categoryId: 'cat2',
    isActive: true
  },
  {
    id: 'sub5',
    name: 'Salary',
    categoryId: 'cat3',
    isActive: true
  }
];

const mockMerchantPatterns: MerchantPattern[] = [
  {
    id: 'merchant1',
    name: 'Amazon',
    aliases: ['amazon.in', 'amazon', 'amzn'],
    patterns: [/amazon/gi, /amzn/gi],
    category: 'Wants',
    subcategory: 'Online Shopping',
    confidence: 0.9
  },
  {
    id: 'merchant2',
    name: 'Zomato',
    aliases: ['zomato', 'zomato.com'],
    patterns: [/zomato/gi],
    category: 'Needs',
    subcategory: 'Food & Dining',
    confidence: 0.9
  },
  {
    id: 'merchant3',
    name: 'Uber',
    aliases: ['uber', 'uber.com'],
    patterns: [/uber/gi],
    category: 'Needs',
    subcategory: 'Transportation',
    confidence: 0.9
  }
];

const mockContext: SMSAnalysisContext = {
  accounts: mockBankAccounts,
  creditCards: mockCreditCards,
  categories: mockCategories,
  subcategories: mockSubcategories,
  merchantPatterns: mockMerchantPatterns
};

describe('SMS Analyzer - Main Service', () => {
  let smsAnalyzer: SMSAnalyzer;

  beforeEach(() => {
    smsAnalyzer = createSMSAnalyzer(mockContext);
  });

  describe('SMS Analysis Integration', () => {
    test('should analyze complete SMS successfully', () => {
      const sms = 'Debit of INR 670 from HDFC Card 6789 at Amazon.in on 15/01/2024';
      const result = smsAnalyzer.analyzeSMS(sms);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.transactionType).toBe('DEBIT');
      expect(result.data?.amount).toBe(670);
      expect(result.data?.accountId).toBe('card1');
      expect(result.data?.merchant).toBe('Amazon.in');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should handle partial SMS data gracefully', () => {
      const sms = 'Spent 500 at some unknown merchant';
      const result = smsAnalyzer.analyzeSMS(sms);

      expect(result.success).toBe(true);
      expect(result.data?.transactionType).toBe('DEBIT');
      expect(result.data?.amount).toBe(500);
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should handle invalid SMS gracefully', () => {
      const sms = 'This is not a transaction SMS';
      const result = smsAnalyzer.analyzeSMS(sms);

      expect(result.success).toBe(true);
      expect(result.confidence).toBeLessThan(0.5);
    });

    test('should handle empty SMS', () => {
      const result = smsAnalyzer.analyzeSMS('');
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Context Management', () => {
    test('should update context successfully', () => {
      const newAccount: BankAccount = {
        id: 'acc3',
        name: 'New Account',
        bankName: 'SBI',
        accountNumber: '11111111111111',
        lastFourDigits: '1111',
        type: 'BANK_ACCOUNT',
        isActive: true
      };

      smsAnalyzer.updateContext({
        accounts: [...mockBankAccounts, newAccount]
      });

      const context = smsAnalyzer.getContext();
      expect(context.accounts).toHaveLength(3);
      expect(context.accounts.find(acc => acc.id === 'acc3')).toBeDefined();
    });

    test('should get current context', () => {
      const context = smsAnalyzer.getContext();
      
      expect(context.accounts).toHaveLength(2);
      expect(context.creditCards).toHaveLength(2);
      expect(context.categories).toHaveLength(3);
      expect(context.subcategories).toHaveLength(5);
      expect(context.merchantPatterns).toHaveLength(3);
    });
  });
});

describe('Amount Extractor', () => {
  describe('Basic Amount Extraction', () => {
    test('should extract INR amounts correctly', () => {
      const testCases = [
        { sms: 'Debit of INR 1,234.50', expected: 1234.50 },
        { sms: 'Rs. 500 debited', expected: 500 },
        { sms: '₹2,000 spent', expected: 2000 },
        { sms: 'Amount: INR 999.99', expected: 999.99 }
      ];

      testCases.forEach(({ sms, expected }) => {
        const result = extractAmount(sms);
        expect(result.value).toBe(expected);
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    test('should handle different number formats', () => {
      const testCases = [
        { sms: 'Amount 1,23,456', expected: 123456 },
        { sms: 'Rs 1000.00', expected: 1000 },
        { sms: '₹ 50', expected: 50 }
      ];

      testCases.forEach(({ sms, expected }) => {
        const result = extractAmount(sms);
        expect(result.value).toBe(expected);
      });
    });

    test('should return null for invalid input', () => {
      const result = extractAmount('No amount here');
      expect(result.value).toBeNull();
      expect(result.confidence).toBe(0);
    });
  });

  describe('Amount Validation', () => {
    test('should validate amounts correctly', () => {
      expect(validateAmount(100)).toBe(true);
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-100)).toBe(false);
      expect(validateAmount(null)).toBe(false);
      expect(validateAmount(NaN)).toBe(false);
      expect(validateAmount(Infinity)).toBe(false);
      expect(validateAmount(20000000)).toBe(false); // Too large
    });
  });

  describe('Amount Formatting', () => {
    test('should format amounts correctly', () => {
      expect(formatAmount(1234.50)).toBe('₹1,234.50');
      expect(formatAmount(1000)).toBe('₹1,000');
      expect(formatAmount(50.5)).toBe('₹50.50');
    });

    test('should handle invalid amounts', () => {
      expect(formatAmount(null as any)).toBe('Invalid Amount');
      expect(formatAmount(NaN)).toBe('Invalid Amount');
    });
  });
});

describe('Account Extractor', () => {
  let bankMatcher: BankMatcher;

  beforeEach(() => {
    bankMatcher = new BankMatcher(mockBankAccounts, mockCreditCards);
  });

  describe('Last Four Digits Matching', () => {
    test('should match credit card by last 4 digits', () => {
      const sms = 'Transaction on card ending 6789';
      const result = extractAccount(sms, bankMatcher);

      expect(result.value?.accountId).toBe('card1');
      expect(result.value?.accountType).toBe('CREDIT_CARD');
      expect(result.value?.matchedBy).toBe('LAST_FOUR_DIGITS');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('should match bank account by last 4 digits', () => {
      const sms = 'Debit from account xxxx1234';
      const result = extractAccount(sms, bankMatcher);

      expect(result.value?.accountId).toBe('acc1');
      expect(result.value?.accountType).toBe('BANK_ACCOUNT');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('should return null for non-matching digits', () => {
      const sms = 'Transaction on card ending 0000';
      const result = extractAccount(sms, bankMatcher);

      expect(result.value?.accountId).toBeNull();
      expect(result.confidence).toBe(0);
    });
  });

  describe('Bank Name Matching', () => {
    test('should match by bank name', () => {
      const sms = 'HDFC Bank transaction alert';
      const result = extractAccount(sms, bankMatcher);

      expect(result.value?.accountId).toBeDefined();
      expect(result.value?.matchedBy).toBe('BANK_NAME');
    });
  });

  describe('Invalid Input Handling', () => {
    test('should handle empty SMS', () => {
      const result = extractAccount('', bankMatcher);
      expect(result.value?.accountId).toBeNull();
      expect(result.confidence).toBe(0);
    });

    test('should handle null input', () => {
      const result = extractAccount(null as any, bankMatcher);
      expect(result.value?.accountId).toBeNull();
    });
  });
});

describe('Merchant Extractor', () => {
  describe('Basic Merchant Extraction', () => {
    test('should extract merchants with "at" pattern', () => {
      const testCases = [
        { sms: 'Spent 500 at Amazon', expected: 'Amazon' },
        { sms: 'Transaction at Zomato.com', expected: 'Zomato.Com' },
        { sms: 'Purchase at Big Bazaar', expected: 'Big Bazaar' }
      ];

      testCases.forEach(({ sms, expected }) => {
        const result = extractMerchant(sms);
        expect(result.value).toBe(expected);
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    test('should extract merchants with "from" pattern', () => {
      const sms = 'Debit from Netflix India';
      const result = extractMerchant(sms);
      
      expect(result.value).toBe('Netflix India');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should extract UPI merchants', () => {
      const sms = 'UPI/Amazon/Payment successful';
      const result = extractMerchant(sms);
      
      expect(result.value).toBe('Amazon');
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Merchant Validation', () => {
    test('should validate merchants correctly', () => {
      expect(validateMerchant('Amazon')).toBe(true);
      expect(validateMerchant('A')).toBe(false); // Too short
      expect(validateMerchant('')).toBe(false);
      expect(validateMerchant(null)).toBe(false);
      expect(validateMerchant('12345')).toBe(false); // All numbers
    });
  });

  describe('Edge Cases', () => {
    test('should handle domain names', () => {
      const sms = 'Payment to amazon.in';
      const result = extractMerchant(sms);
      
      expect(result.value).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should filter out common non-merchant words', () => {
      const sms = 'Transaction at bank account';
      const result = extractMerchant(sms);
      
      expect(result.confidence).toBeLessThan(0.5);
    });
  });
});

describe('Transaction Type Extractor', () => {
  describe('Basic Type Extraction', () => {
    test('should extract DEBIT transactions', () => {
      const testCases = [
        'Debit of Rs 500',
        'Amount debited: 1000',
        'Spent 200 at store',
        'Paid 150 to merchant'
      ];

      testCases.forEach(sms => {
        const result = extractType(sms);
        expect(result.value).toBe('DEBIT');
        expect(result.confidence).toBeGreaterThan(0.6);
      });
    });

    test('should extract CREDIT transactions', () => {
      const testCases = [
        'Credit of Rs 5000',
        'Amount credited: 2000',
        'Salary received',
        'Refund processed'
      ];

      testCases.forEach(sms => {
        const result = extractType(sms);
        expect(result.value).toBe('CREDIT');
        expect(result.confidence).toBeGreaterThan(0.6);
      });
    });

    test('should extract TRANSFER transactions', () => {
      const testCases = [
        'UPI transfer successful',
        'IMPS transfer completed',
        'Money sent via NEFT'
      ];

      testCases.forEach(sms => {
        const result = extractType(sms);
        expect(result.value).toBe('TRANSFER');
        expect(result.confidence).toBeGreaterThan(0.6);
      });
    });
  });

  describe('Transaction Type Validation', () => {
    test('should validate transaction types', () => {
      expect(validateTransactionType('DEBIT')).toBe(true);
      expect(validateTransactionType('CREDIT')).toBe(true);
      expect(validateTransactionType('TRANSFER')).toBe(true);
      expect(validateTransactionType('INVALID' as TransactionType)).toBe(false);
      expect(validateTransactionType(null)).toBe(false);
    });
  });

  describe('Context Inference', () => {
    test('should infer type from context', () => {
      const sms = 'Purchase at Amazon store';
      const result = extractType(sms);
      
      expect(result.value).toBe('DEBIT');
      expect(result.method).toContain('INFERENCE');
    });
  });
});

describe('Date Extractor', () => {
  describe('Basic Date Extraction', () => {
    test('should extract dates in DD/MM/YYYY format', () => {
      const sms = 'Transaction on 15/01/2024';
      const result = extractDate(sms);
      
      expect(result.value).toBeInstanceOf(Date);
      expect(result.value?.getDate()).toBe(15);
      expect(result.value?.getMonth()).toBe(0); // January is 0
      expect(result.value?.getFullYear()).toBe(2024);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('should extract dates with month names', () => {
      const sms = 'Payment on 15 Jan 2024';
      const result = extractDate(sms);
      
      expect(result.value).toBeInstanceOf(Date);
      expect(result.value?.getDate()).toBe(15);
      expect(result.value?.getMonth()).toBe(0);
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('should extract ISO format dates', () => {
      const sms = 'Transaction: 2024-01-15';
      const result = extractDate(sms);
      
      expect(result.value).toBeInstanceOf(Date);
      expect(result.confidence).toBeGreaterThan(0.9);
    });
  });

  describe('Date Validation', () => {
    test('should validate dates correctly', () => {
      const validDate = new Date('2024-01-15');
      const invalidDate = new Date('invalid');
      const futureDate = new Date('2030-01-01');
      const oldDate = new Date('2020-01-01');

      expect(validateDate(validDate)).toBe(true);
      expect(validateDate(invalidDate)).toBe(false);
      expect(validateDate(futureDate)).toBe(false);
      expect(validateDate(oldDate)).toBe(false);
      expect(validateDate(null)).toBe(false);
    });
  });

  describe('Date Formatting', () => {
    test('should format dates correctly', () => {
      const date = new Date('2024-01-15');
      
      expect(formatDate(date, 'short')).toMatch(/15\/1\/2024|15\/01\/2024/);
      expect(formatDate(date, 'long')).toContain('January');
      expect(formatDate(date, 'iso')).toBe('2024-01-15');
    });
  });

  describe('Fallback Date Logic', () => {
    test('should use current date for recent keywords', () => {
      const sms = 'Transaction completed just now';
      const result = extractDate(sms);
      
      expect(result.value).toBeInstanceOf(Date);
      expect(result.method).toBe('FALLBACK_CURRENT_DATE');
    });

    test('should extract time and assume today', () => {
      const sms = 'Payment at 14:30';
      const result = extractDate(sms);
      
      expect(result.value).toBeInstanceOf(Date);
      expect(result.value?.getHours()).toBe(14);
      expect(result.value?.getMinutes()).toBe(30);
    });
  });
});

describe('Bank Matcher', () => {
  let bankMatcher: BankMatcher;

  beforeEach(() => {
    bankMatcher = new BankMatcher(mockBankAccounts, mockCreditCards);
  });

  describe('Last Four Digits Matching', () => {
    test('should match credit cards by last 4 digits', () => {
      const result = bankMatcher.matchByLastFourDigits('6789');
      
      expect(result.accountId).toBe('card1');
      expect(result.accountType).toBe('CREDIT_CARD');
      expect(result.confidence).toBe(0.95);
    });

    test('should match bank accounts by last 4 digits', () => {
      const result = bankMatcher.matchByLastFourDigits('1234');
      
      expect(result.accountId).toBe('acc1');
      expect(result.accountType).toBe('BANK_ACCOUNT');
      expect(result.confidence).toBe(0.9);
    });

    test('should return empty result for invalid digits', () => {
      const result = bankMatcher.matchByLastFourDigits('0000');
      
      expect(result.accountId).toBeNull();
      expect(result.confidence).toBe(0);
    });

    test('should handle invalid input', () => {
      expect(bankMatcher.matchByLastFourDigits('123')).toHaveProperty('accountId', null);
      expect(bankMatcher.matchByLastFourDigits('abcd')).toHaveProperty('accountId', null);
      expect(bankMatcher.matchByLastFourDigits('')).toHaveProperty('accountId', null);
    });
  });

  describe('Bank Name Matching', () => {
    test('should match by exact bank name', () => {
      const result = bankMatcher.matchByBankName('HDFC Bank transaction');
      
      expect(result.accountId).toBeDefined();
      expect(result.matchedBy).toBe('BANK_NAME');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should match by bank aliases', () => {
      const result = bankMatcher.matchByBankName('SBI account alert');
      
      expect(result.matchedBy).toBe('BANK_NAME');
    });
  });

  describe('Utility Methods', () => {
    test('should get account by ID', () => {
      const account = bankMatcher.getAccountById('acc1');
      
      expect(account).toBeDefined();
      expect(account?.id).toBe('acc1');
      expect(account?.name).toBe('Savings Account');
    });

    test('should get all accounts', () => {
      const allAccounts = bankMatcher.getAllAccounts();
      
      expect(allAccounts).toHaveLength(4); // 2 accounts + 2 cards
    });

    test('should get matching stats', () => {
      const stats = bankMatcher.getMatchingStats();
      
      expect(stats.totalAccounts).toBe(2);
      expect(stats.totalCreditCards).toBe(2);
      expect(stats.bankCoverage).toContain('HDFC Bank');
      expect(stats.bankCoverage).toContain('ICICI Bank');
    });
  });
});

describe('Merchant Matcher', () => {
  let merchantMatcher: MerchantMatcher;

  beforeEach(() => {
    merchantMatcher = new MerchantMatcher(mockMerchantPatterns);
  });

  describe('Merchant Normalization', () => {
    test('should normalize known merchants', () => {
      const result = merchantMatcher.normalizeMerchant('amazon.in');
      
      expect(result.normalizedName).toBe('Amazon');
      expect(result.category).toBe('Wants');
      expect(result.subcategory).toBe('Online Shopping');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('should handle exact matches', () => {
      const result = merchantMatcher.normalizeMerchant('Amazon');
      
      expect(result.normalizedName).toBe('Amazon');
      expect(result.matchedBy).toBe('EXACT_MATCH');
      expect(result.confidence).toBe(0.95);
    });

    test('should handle alias matches', () => {
      const result = merchantMatcher.normalizeMerchant('amzn');
      
      expect(result.normalizedName).toBe('Amazon');
      expect(result.matchedBy).toBe('ALIAS_MATCH');
    });

    test('should handle domain matches', () => {
      const result = merchantMatcher.normalizeMerchant('zomato.com');
      
      expect(result.normalizedName).toBe('Zomato');
      expect(result.matchedBy).toBe('PATTERN_MATCH');
    });

    test('should handle unknown merchants', () => {
      const result = merchantMatcher.normalizeMerchant('Unknown Store');
      
      expect(result.normalizedName).toBe('Unknown Store');
      expect(result.matchedBy).toBe('FALLBACK');
      expect(result.confidence).toBe(0.3);
    });
  });

  describe('Merchant Suggestions', () => {
    test('should provide suggestions for partial input', () => {
      const suggestions = merchantMatcher.getSuggestions('ama');
      
      expect(suggestions).toContain('Amazon');
    });

    test('should limit suggestions', () => {
      const suggestions = merchantMatcher.getSuggestions('a', 2);
      
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Utility Methods', () => {
    test('should get merchant stats', () => {
      const stats = merchantMatcher.getStats();
      
      expect(stats.totalPatterns).toBe(3);
      expect(stats.totalAliases).toBeGreaterThan(0);
      expect(stats.categoryCoverage).toContain('Wants');
      expect(stats.categoryCoverage).toContain('Needs');
    });
  });
});

describe('Transaction Categorizer', () => {
  let categorizer: TransactionCategorizer;

  beforeEach(() => {
    categorizer = new TransactionCategorizer(mockCategories, mockSubcategories);
  });

  describe('Merchant-based Categorization', () => {
    test('should categorize by merchant mapping', () => {
      const merchant = {
        name: 'Amazon',
        normalizedName: 'Amazon',
        category: 'Wants',
        subcategory: 'Online Shopping',
        confidence: 0.9,
        matchedBy: 'EXACT_MATCH' as const
      };

      const result = categorizer.categorize(merchant, 'DEBIT');
      
      expect(result.categoryName).toBe('Wants');
      expect(result.subcategoryName).toBe('Online Shopping');
      expect(result.confidence).toBe(0.9);
    });

    test('should categorize by merchant keywords', () => {
      const merchant = {
        name: 'Amazon Store',
        normalizedName: 'Amazon Store',
        confidence: 0.8,
        matchedBy: 'PATTERN_MATCH' as const
      };

      const result = categorizer.categorize(merchant, 'DEBIT');
      
      expect(result.categoryName).toBe('Wants');
      expect(result.subcategoryName).toBe('Online Shopping');
    });
  });

  describe('Transaction Type Categorization', () => {
    test('should categorize CREDIT transactions', () => {
      const result = categorizer.categorize(null, 'CREDIT');
      
      expect(result.categoryName).toBe('Income');
      expect(result.matchedBy).toBe('PATTERN_MATCH');
    });

    test('should categorize DEBIT transactions', () => {
      const result = categorizer.categorize(null, 'DEBIT');
      
      expect(result.categoryName).toBe('Needs');
      expect(result.matchedBy).toBe('PATTERN_MATCH');
    });
  });

  describe('Category Suggestions', () => {
    test('should provide category suggestions for merchants', () => {
      const suggestions = categorizer.getSuggestions('Amazon');
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].categoryName).toBe('Wants');
    });
  });

  describe('Utility Methods', () => {
    test('should get categorization stats', () => {
      const stats = categorizer.getStats();
      
      expect(stats.totalCategories).toBe(3);
      expect(stats.totalSubcategories).toBe(5);
      expect(stats.totalRules).toBeGreaterThan(0);
    });
  });
});

describe('Error Handling and Edge Cases', () => {
  let smsAnalyzer: SMSAnalyzer;

  beforeEach(() => {
    smsAnalyzer = createSMSAnalyzer(mockContext);
  });

  test('should handle malformed SMS gracefully', () => {
    const malformedSMS = [
      '',
      '   ',
      'Random text without transaction info',
      '!@#$%^&*()',
      '123456789'
    ];

    malformedSMS.forEach(sms => {
      const result = smsAnalyzer.analyzeSMS(sms);
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.confidence).toBe('number');
    });
  });

  test('should handle empty context gracefully', () => {
    const emptyContext: SMSAnalysisContext = {
      accounts: [],
      creditCards: [],
      categories: [],
      subcategories: [],
      merchantPatterns: []
    };

    const analyzer = createSMSAnalyzer(emptyContext);
    const result = analyzer.analyzeSMS('Debit of Rs 500');
    
    expect(result.success).toBe(true);
    expect(result.data?.amount).toBe(500);
  });

  test('should handle very long SMS', () => {
    const longSMS = 'A'.repeat(1000) + ' Debit of Rs 500 from card 1234';
    const result = smsAnalyzer.analyzeSMS(longSMS);
    
    expect(result.success).toBe(true);
    expect(result.data?.amount).toBe(500);
  });

  test('should handle special characters in SMS', () => {
    const specialSMS = 'Débit of ₹500 from café "Côte d\'Or" on 15/01/2024';
    const result = smsAnalyzer.analyzeSMS(specialSMS);
    
    expect(result.success).toBe(true);
    expect(result.data?.amount).toBe(500);
  });
});

describe('Performance Tests', () => {
  let smsAnalyzer: SMSAnalyzer;

  beforeEach(() => {
    smsAnalyzer = createSMSAnalyzer(mockContext);
  });

  test('should process SMS within reasonable time', () => {
    const sms = 'Debit of INR 1,234.50 from HDFC Card 6789 at Amazon.in on 15/01/2024';
    
    const startTime = performance.now();
    const result = smsAnalyzer.analyzeSMS(sms);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    expect(result.success).toBe(true);
  });

  test('should handle batch processing efficiently', () => {
    const smsList = Array(100).fill('Debit of Rs 500 from card 1234');
    
    const startTime = performance.now();
    const results = smsList.map(sms => smsAnalyzer.analyzeSMS(sms));
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    expect(results.every(r => r.success)).toBe(true);
  });
});

describe('Real-world SMS Examples', () => {
  let smsAnalyzer: SMSAnalyzer;

  beforeEach(() => {
    smsAnalyzer = createSMSAnalyzer(mockContext);
  });

  const realWorldSMS = [
    {
      sms: 'Dear Customer, Rs.670.00 debited from A/c **1234 on 15-Jan-24 for Amazon.in. Avbl Bal: Rs.12,345.67',
      expectedAmount: 670,
      expectedType: 'DEBIT',
      expectedMerchant: 'Amazon.In'
    },
    {
      sms: 'HDFC Bank: Rs 1,500 spent on HDFC Card xx6789 at ZOMATO on 14-Jan-24. Outstanding: Rs 5,432',
      expectedAmount: 1500,
      expectedType: 'DEBIT',
      expectedMerchant: 'Zomato'
    },
    {
      sms: 'Your salary of Rs.50,000 has been credited to your account ending 9876 on 01-Feb-24',
      expectedAmount: 50000,
      expectedType: 'CREDIT',
      expectedMerchant: null
    }
  ];

  test.each(realWorldSMS)('should analyze real SMS: $sms', ({ 
    sms, 
    expectedAmount, 
    expectedType, 
    expectedMerchant 
  }) => {
    const result = smsAnalyzer.analyzeSMS(sms);
    
    expect(result.success).toBe(true);
    
    if (expectedAmount !== null) {
      expect(result.data?.amount).toBe(expectedAmount);
    }
    
    if (expectedType) {
      expect(result.data?.transactionType).toBe(expectedType);
    }
    
    if (expectedMerchant) {
      expect(result.data?.merchant).toContain(expectedMerchant);
    }
    
    expect(result.confidence).toBeGreaterThan(0.3);
  });
}); 