// Main SMS Analyzer Service
// Industry-grade, modular, and testable implementation

import { extractAccount } from './extractors/extractAccount';
import { extractAmount } from './extractors/extractAmount';
import { extractMerchant } from './extractors/extractMerchant';
import { extractType } from './extractors/extractType';
import { extractDate } from './extractors/extractDate';
import { BankMatcher } from './matchers/bankMatcher';
import { MerchantMatcher } from './matchers/merchantMatcher';
import { TransactionCategorizer } from './categorizers/categorizeTransaction';
import { 
  SMSAnalysisContext, 
  ParsedTransaction, 
  SMSAnalysisResult,
  TransactionType 
} from './types';

export class SMSAnalyzer {
  private bankMatcher: BankMatcher;
  private merchantMatcher: MerchantMatcher;
  private categorizer: TransactionCategorizer;

  constructor(private context: SMSAnalysisContext) {
    this.bankMatcher = new BankMatcher(context.accounts, context.creditCards);
    this.merchantMatcher = new MerchantMatcher(context.merchantPatterns);
    this.categorizer = new TransactionCategorizer(context.categories, context.subcategories);
  }

  /**
   * Main method to analyze SMS and extract transaction details
   */
  public analyzeSMS(smsText: string): SMSAnalysisResult {
    try {
      // Step 1: Extract basic transaction data
      const transactionTypeResult = extractType(smsText);
      const amountResult = extractAmount(smsText);
      const rawMerchantResult = extractMerchant(smsText);
      const transactionDateResult = extractDate(smsText);
      
      // Step 2: Match and normalize merchant
      const merchant = this.merchantMatcher.normalizeMerchant(rawMerchantResult.value || '');
      
      // Step 3: Extract and match account
      const accountInfoResult = extractAccount(smsText, this.bankMatcher);
      
      // Step 4: Categorize transaction
      const categoryInfo = this.categorizer.categorize(merchant, transactionTypeResult.value);
      
      // Step 5: Build parsed transaction
      const parsedTransaction: ParsedTransaction = {
        transactionType: transactionTypeResult.value,
        accountId: accountInfoResult.value?.accountId || null,
        accountName: accountInfoResult.value?.accountName || null,
        accountType: accountInfoResult.value?.accountType || null,
        amount: amountResult.value,
        transactionDate: transactionDateResult.value,
        merchant: merchant.name,
        description: this.generateDescription(merchant, transactionTypeResult.value, amountResult.value),
        categoryId: categoryInfo.categoryId,
        categoryName: categoryInfo.categoryName,
        subcategoryId: categoryInfo.subcategoryId,
        subcategoryName: categoryInfo.subcategoryName,
        confidence: this.calculateConfidence({
          transactionTypeResult,
          amountResult,
          merchant,
          accountInfoResult,
          categoryInfo
        }),
        rawSms: smsText
      };

      return {
        success: true,
        data: parsedTransaction,
        confidence: parsedTransaction.confidence,
        errors: []
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  /**
   * Generate human-readable description
   */
  private generateDescription(
    merchant: { name: string; category?: string }, 
    type: TransactionType | null, 
    amount: number | null
  ): string {
    if (!type || !amount) {
      return `Transaction at ${merchant.name}`;
    }
    const action = type === 'CREDIT' ? 'received from' : 'paid to';
    return `₹${amount} ${action} ${merchant.name}`;
  }

  /**
   * Calculate confidence score based on extraction quality
   */
  private calculateConfidence(data: {
    transactionTypeResult: any;
    amountResult: any;
    merchant: { name: string; category?: string } | null;
    accountInfoResult: any;
    categoryInfo: any;
  }): number {
    let confidence = 0;
    
    // Base confidence for required fields
    if (data.transactionTypeResult.value) confidence += 0.2 * data.transactionTypeResult.confidence;
    if (data.amountResult.value && data.amountResult.value > 0) confidence += 0.3 * data.amountResult.confidence;
    if (data.merchant?.name) confidence += 0.2;
    
    // Bonus for matched entities
    if (data.accountInfoResult.value?.accountId) confidence += 0.15 * data.accountInfoResult.confidence;
    if (data.categoryInfo?.categoryId) confidence += 0.15 * data.categoryInfo.confidence;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Update context (useful for dynamic updates)
   */
  public updateContext(newContext: Partial<SMSAnalysisContext>): void {
    this.context = { ...this.context, ...newContext };
    
    // Reinitialize matchers with new context
    if (newContext.accounts || newContext.creditCards) {
      this.bankMatcher = new BankMatcher(
        newContext.accounts || this.context.accounts,
        newContext.creditCards || this.context.creditCards
      );
    }
    
    if (newContext.merchantPatterns) {
      this.merchantMatcher = new MerchantMatcher(newContext.merchantPatterns);
    }
    
    if (newContext.categories || newContext.subcategories) {
      this.categorizer = new TransactionCategorizer(
        newContext.categories || this.context.categories,
        newContext.subcategories || this.context.subcategories
      );
    }
  }

  /**
   * Get current context (useful for debugging)
   */
  public getContext(): SMSAnalysisContext {
    return { ...this.context };
  }
}

// Factory function for easy instantiation
export function createSMSAnalyzer(context: SMSAnalysisContext): SMSAnalyzer {
  return new SMSAnalyzer(context);
}

// Re-export types for external use
export * from './types'; 