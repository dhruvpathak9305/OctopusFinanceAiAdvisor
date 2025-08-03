// SMS Analyzer Usage Examples
// Comprehensive examples showing different use cases and integration patterns

import { createSMSAnalyzer, SMSAnalyzer } from '../index';
import { DEFAULT_MERCHANT_PATTERNS } from '../config/merchantPatterns';
import { 
  SMSAnalysisContext, 
  BankAccount, 
  CreditCard, 
  Category, 
  Subcategory,
  SMSAnalysisResult 
} from '../types';

// Example 1: Basic Setup and Usage
export function basicUsageExample() {
  console.log('=== Basic SMS Analyzer Usage ===');

  // Sample context data (this would typically come from your database)
  const context: SMSAnalysisContext = {
    accounts: [
      {
        id: 'acc1',
        name: 'Primary Savings',
        bankName: 'HDFC Bank',
        accountNumber: '12345678901234',
        lastFourDigits: '1234',
        type: 'BANK_ACCOUNT',
        isActive: true
      }
    ],
    creditCards: [
      {
        id: 'card1',
        name: 'Platinum Credit Card',
        bankName: 'HDFC Bank',
        cardNumber: '4567890123456789',
        lastFourDigits: '6789',
        type: 'CREDIT_CARD',
        isActive: true
      }
    ],
    categories: [
      {
        id: 'cat1',
        name: 'Needs',
        type: 'EXPENSE',
        isActive: true
      },
      {
        id: 'cat2',
        name: 'Wants',
        type: 'EXPENSE',
        isActive: true
      }
    ],
    subcategories: [
      {
        id: 'sub1',
        name: 'Food & Dining',
        categoryId: 'cat1',
        isActive: true
      },
      {
        id: 'sub2',
        name: 'Online Shopping',
        categoryId: 'cat2',
        isActive: true
      }
    ],
    merchantPatterns: DEFAULT_MERCHANT_PATTERNS.slice(0, 10) // Use first 10 patterns
  };

  // Create analyzer instance
  const analyzer = createSMSAnalyzer(context);

  // Analyze different types of SMS
  const smsExamples = [
    'Debit of INR 670 from HDFC Card 6789 at Amazon.in on 15/01/2024',
    'Rs 1,500 spent on HDFC Card xx6789 at ZOMATO on 14-Jan-24',
    'Your salary of Rs.50,000 has been credited to account ending 1234',
    'UPI payment of Rs 250 to Uber successful'
  ];

  smsExamples.forEach((sms, index) => {
    console.log(`\n--- SMS ${index + 1} ---`);
    console.log(`Input: ${sms}`);
    
    const result = analyzer.analyzeSMS(sms);
    console.log(`Success: ${result.success}`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    
    if (result.data) {
      console.log(`Type: ${result.data.transactionType}`);
      console.log(`Amount: ₹${result.data.amount}`);
      console.log(`Merchant: ${result.data.merchant}`);
      console.log(`Account: ${result.data.accountName}`);
      console.log(`Category: ${result.data.categoryName} > ${result.data.subcategoryName}`);
    }
  });
}

// Example 2: Advanced Configuration with Custom Patterns
export function advancedConfigurationExample() {
  console.log('\n=== Advanced Configuration Example ===');

  // Custom merchant patterns for specific business needs
  const customMerchantPatterns = [
    {
      id: 'custom1',
      name: 'Local Coffee Shop',
      aliases: ['coffee corner', 'cc cafe'],
      patterns: [/coffee\s*corner/gi, /cc\s*cafe/gi],
      category: 'Wants',
      subcategory: 'Food & Dining',
      confidence: 0.9
    },
    {
      id: 'custom2',
      name: 'Company Cafeteria',
      aliases: ['cafeteria', 'office cafe'],
      patterns: [/cafeteria/gi, /office\s*cafe/gi],
      category: 'Needs',
      subcategory: 'Food & Dining',
      confidence: 0.85
    }
  ];

  const context: SMSAnalysisContext = {
    accounts: [],
    creditCards: [],
    categories: [],
    subcategories: [],
    merchantPatterns: [...DEFAULT_MERCHANT_PATTERNS, ...customMerchantPatterns]
  };

  const analyzer = createSMSAnalyzer(context);

  // Test custom patterns
  const customSMS = [
    'Paid Rs 150 at Coffee Corner for lunch',
    'Debit of Rs 80 from office cafe'
  ];

  customSMS.forEach(sms => {
    const result = analyzer.analyzeSMS(sms);
    console.log(`\nSMS: ${sms}`);
    console.log(`Merchant: ${result.data?.merchant}`);
    console.log(`Category: ${result.data?.categoryName}`);
  });
}

// Example 3: Batch Processing
export function batchProcessingExample() {
  console.log('\n=== Batch Processing Example ===');

  const context: SMSAnalysisContext = {
    accounts: [],
    creditCards: [],
    categories: [],
    subcategories: [],
    merchantPatterns: DEFAULT_MERCHANT_PATTERNS
  };

  const analyzer = createSMSAnalyzer(context);

  // Simulate processing multiple SMS messages
  const smsBatch = [
    'Debit Rs 500 from card 1234 at Amazon',
    'Credit of Rs 10000 salary received',
    'Spent Rs 250 at Zomato for dinner',
    'ATM withdrawal of Rs 2000',
    'Netflix subscription Rs 199 debited'
  ];

  console.log(`Processing ${smsBatch.length} SMS messages...`);
  
  const startTime = performance.now();
  const results = smsBatch.map(sms => analyzer.analyzeSMS(sms));
  const endTime = performance.now();

  console.log(`Processing completed in ${(endTime - startTime).toFixed(2)}ms`);
  console.log(`Average time per SMS: ${((endTime - startTime) / smsBatch.length).toFixed(2)}ms`);

  // Analyze results
  const successfulAnalyses = results.filter(r => r.success && r.confidence > 0.5);
  console.log(`Successful analyses: ${successfulAnalyses.length}/${results.length}`);

  // Group by transaction type
  const typeGroups = successfulAnalyses.reduce((groups, result) => {
    const type = result.data?.transactionType || 'UNKNOWN';
    groups[type] = (groups[type] || 0) + 1;
    return groups;
  }, {} as Record<string, number>);

  console.log('Transaction types:', typeGroups);
}

// Example 4: Error Handling and Validation
export function errorHandlingExample() {
  console.log('\n=== Error Handling Example ===');

  const context: SMSAnalysisContext = {
    accounts: [],
    creditCards: [],
    categories: [],
    subcategories: [],
    merchantPatterns: []
  };

  const analyzer = createSMSAnalyzer(context);

  // Test various edge cases
  const edgeCases = [
    '', // Empty string
    '   ', // Whitespace only
    'Random text without transaction info',
    'Amount: Rs. -500', // Negative amount
    'Debit of Rs 999999999999', // Very large amount
    'Transaction on 32/13/2024', // Invalid date
    'Spent money somewhere sometime' // Vague information
  ];

  edgeCases.forEach((sms, index) => {
    console.log(`\n--- Edge Case ${index + 1} ---`);
    console.log(`Input: "${sms}"`);
    
    try {
      const result = analyzer.analyzeSMS(sms);
      console.log(`Success: ${result.success}`);
      console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`Errors: ${result.errors.length > 0 ? result.errors.join(', ') : 'None'}`);
    } catch (error) {
      console.log(`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
}

// Example 5: Real-time Integration Pattern
export class RealTimeSMSProcessor {
  private analyzer: SMSAnalyzer;
  private processingQueue: string[] = [];
  private isProcessing = false;

  constructor(context: SMSAnalysisContext) {
    this.analyzer = createSMSAnalyzer(context);
  }

  // Add SMS to processing queue
  public addSMS(smsText: string): void {
    this.processingQueue.push(smsText);
    this.processQueue();
  }

  // Process queue asynchronously
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const sms = this.processingQueue.shift();
      if (sms) {
        await this.processSMS(sms);
      }
    }

    this.isProcessing = false;
  }

  // Process individual SMS
  private async processSMS(smsText: string): Promise<void> {
    try {
      const result = this.analyzer.analyzeSMS(smsText);
      
      if (result.success && result.confidence > 0.7) {
        // High confidence - auto-process
        await this.saveTransaction(result);
        console.log(`Auto-saved transaction: ${result.data?.merchant} - ₹${result.data?.amount}`);
      } else if (result.success && result.confidence > 0.3) {
        // Medium confidence - flag for review
        await this.flagForReview(result);
        console.log(`Flagged for review: ${smsText.substring(0, 50)}...`);
      } else {
        // Low confidence - log for analysis
        console.log(`Low confidence SMS: ${smsText.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error(`Error processing SMS: ${error}`);
    }
  }

  // Mock function to save transaction
  private async saveTransaction(result: SMSAnalysisResult): Promise<void> {
    // In real implementation, this would save to database
    await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async operation
  }

  // Mock function to flag for review
  private async flagForReview(result: SMSAnalysisResult): Promise<void> {
    // In real implementation, this would add to review queue
    await new Promise(resolve => setTimeout(resolve, 5)); // Simulate async operation
  }

  // Update analyzer context (e.g., when user adds new accounts)
  public updateContext(newContext: Partial<SMSAnalysisContext>): void {
    this.analyzer.updateContext(newContext);
  }

  // Get processing statistics
  public getStats(): { queueLength: number; isProcessing: boolean } {
    return {
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing
    };
  }
}

// Example 6: Integration with React Component
export function reactIntegrationExample() {
  console.log('\n=== React Integration Pattern ===');

  // This would be a custom hook in a real React application
  const useSMSAnalyzer = (context: SMSAnalysisContext) => {
    const analyzer = createSMSAnalyzer(context);

    const analyzeSMS = (smsText: string) => {
      return analyzer.analyzeSMS(smsText);
    };

    const updateContext = (newContext: Partial<SMSAnalysisContext>) => {
      analyzer.updateContext(newContext);
    };

    return { analyzeSMS, updateContext };
  };

  // Example component usage
  const ExampleComponent = () => {
    const context: SMSAnalysisContext = {
      accounts: [],
      creditCards: [],
      categories: [],
      subcategories: [],
      merchantPatterns: DEFAULT_MERCHANT_PATTERNS
    };

    const { analyzeSMS } = useSMSAnalyzer(context);

    const handleSMSInput = (smsText: string) => {
      const result = analyzeSMS(smsText);
      
      if (result.success) {
        // Update UI with parsed transaction data
        console.log('Parsed transaction:', result.data);
      } else {
        // Show error message
        console.log('Failed to parse SMS:', result.errors);
      }
    };

    return {
      handleSMSInput,
      // Other component methods...
    };
  };

  console.log('React integration pattern defined. Use useSMSAnalyzer hook in components.');
}

// Example 7: Performance Testing
export function performanceTestingExample() {
  console.log('\n=== Performance Testing Example ===');

  const context: SMSAnalysisContext = {
    accounts: [],
    creditCards: [],
    categories: [],
    subcategories: [],
    merchantPatterns: DEFAULT_MERCHANT_PATTERNS
  };

  const analyzer = createSMSAnalyzer(context);

  // Test with different SMS complexities
  const testCases = [
    {
      name: 'Simple SMS',
      sms: 'Debit Rs 500',
      iterations: 1000
    },
    {
      name: 'Complex SMS',
      sms: 'Dear Customer, Rs.1,234.50 debited from A/c **1234 on 15-Jan-24 for Amazon.in. Available Balance: Rs.12,345.67. For queries call 1800-xxx-xxxx',
      iterations: 1000
    },
    {
      name: 'Long SMS',
      sms: 'A'.repeat(500) + ' Debit Rs 500 from card 1234',
      iterations: 500
    }
  ];

  testCases.forEach(testCase => {
    console.log(`\nTesting: ${testCase.name}`);
    
    const startTime = performance.now();
    
    for (let i = 0; i < testCase.iterations; i++) {
      analyzer.analyzeSMS(testCase.sms);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / testCase.iterations;
    
    console.log(`Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`Average time: ${avgTime.toFixed(3)}ms`);
    console.log(`Throughput: ${(1000 / avgTime).toFixed(0)} SMS/second`);
  });
}

// Run all examples
export function runAllExamples() {
  basicUsageExample();
  advancedConfigurationExample();
  batchProcessingExample();
  errorHandlingExample();
  reactIntegrationExample();
  performanceTestingExample();

  console.log('\n=== All Examples Completed ===');
}

// All exports are already declared above 