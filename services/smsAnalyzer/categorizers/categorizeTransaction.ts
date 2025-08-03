// Transaction Categorizer - Categorize transactions based on merchant and type
// Handles category and subcategory matching with confidence scoring

import { 
  Category, 
  Subcategory, 
  CategoryMatchResult, 
  TransactionType,
  MerchantMatchResult 
} from '../types';

export class TransactionCategorizer {
  private categories: Category[];
  private subcategories: Subcategory[];
  private merchantCategoryRules: MerchantCategoryRule[];
  private transactionTypeRules: TransactionTypeRule[];

  constructor(categories: Category[], subcategories: Subcategory[]) {
    this.categories = categories.filter(cat => cat.isActive);
    this.subcategories = subcategories.filter(sub => sub.isActive);
    this.merchantCategoryRules = this.initializeMerchantRules();
    this.transactionTypeRules = this.initializeTransactionTypeRules();
  }

  /**
   * Categorize transaction based on merchant and transaction type
   */
  public categorize(
    merchant: MerchantMatchResult | null, 
    transactionType: TransactionType | null
  ): CategoryMatchResult {
    // Try different categorization strategies
    const strategies = [
      () => this.categorizeByMerchantMapping(merchant),
      () => this.categorizeByMerchantKeywords(merchant),
      () => this.categorizeByTransactionType(transactionType),
      () => this.categorizeByMerchantPattern(merchant),
      () => this.getDefaultCategory(transactionType)
    ];

    for (const strategy of strategies) {
      const result = strategy();
      if (result.confidence > 0.5) { // Minimum confidence threshold
        return result;
      }
    }

    // Return the best result even if below threshold
    return strategies.reduce((best, strategy) => {
      const result = strategy();
      return result.confidence > best.confidence ? result : best;
    }, this.createEmptyResult());
  }

  /**
   * Get all possible category matches with confidence scores
   */
  public getAllMatches(
    merchant: MerchantMatchResult | null,
    transactionType: TransactionType | null
  ): CategoryMatchResult[] {
    const results: CategoryMatchResult[] = [];

    // Try all strategies
    results.push(this.categorizeByMerchantMapping(merchant));
    results.push(this.categorizeByMerchantKeywords(merchant));
    results.push(this.categorizeByTransactionType(transactionType));
    results.push(this.categorizeByMerchantPattern(merchant));

    // Filter out empty results and sort by confidence
    return results
      .filter(result => result.confidence > 0)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Update categories and subcategories
   */
  public updateCategories(categories: Category[], subcategories: Subcategory[]): void {
    this.categories = categories.filter(cat => cat.isActive);
    this.subcategories = subcategories.filter(sub => sub.isActive);
  }

  /**
   * Get category suggestions for merchant
   */
  public getSuggestions(merchantName: string): CategoryMatchResult[] {
    if (!merchantName) return [];

    const results: CategoryMatchResult[] = [];
    const lowerMerchant = merchantName.toLowerCase();

    // Check merchant rules
    for (const rule of this.merchantCategoryRules) {
      for (const pattern of rule.merchantPatterns) {
        if (lowerMerchant.includes(pattern.toLowerCase())) {
          const category = this.categories.find(c => c.id === rule.categoryId);
          const subcategory = this.subcategories.find(s => s.id === rule.subcategoryId);

          if (category && subcategory) {
            results.push({
              categoryId: category.id,
              categoryName: category.name,
              subcategoryId: subcategory.id,
              subcategoryName: subcategory.name,
              confidence: rule.confidence,
              matchedBy: 'MERCHANT_MAPPING'
            });
          }
        }
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Categorize by direct merchant mapping
   */
  private categorizeByMerchantMapping(merchant: MerchantMatchResult | null): CategoryMatchResult {
    if (!merchant || !merchant.category || !merchant.subcategory) {
      return this.createEmptyResult();
    }

    // Find category and subcategory by name
    const category = this.categories.find(c => 
      c.name.toLowerCase() === merchant.category!.toLowerCase()
    );
    
    const subcategory = this.subcategories.find(s => 
      s.name.toLowerCase() === merchant.subcategory!.toLowerCase() &&
      s.categoryId === category?.id
    );

    if (category && subcategory) {
      return {
        categoryId: category.id,
        categoryName: category.name,
        subcategoryId: subcategory.id,
        subcategoryName: subcategory.name,
        confidence: 0.9,
        matchedBy: 'MERCHANT_MAPPING'
      };
    }

    return this.createEmptyResult();
  }

  /**
   * Categorize by merchant keywords
   */
  private categorizeByMerchantKeywords(merchant: MerchantMatchResult | null): CategoryMatchResult {
    if (!merchant || !merchant.normalizedName) {
      return this.createEmptyResult();
    }

    const merchantName = merchant.normalizedName.toLowerCase();
    let bestMatch: CategoryMatchResult = this.createEmptyResult();

    for (const rule of this.merchantCategoryRules) {
      for (const pattern of rule.merchantPatterns) {
        if (merchantName.includes(pattern.toLowerCase())) {
          const category = this.categories.find(c => c.id === rule.categoryId);
          const subcategory = this.subcategories.find(s => s.id === rule.subcategoryId);

          if (category && subcategory) {
            const confidence = rule.confidence * (merchant.confidence || 0.5);
            
            if (confidence > bestMatch.confidence) {
              bestMatch = {
                categoryId: category.id,
                categoryName: category.name,
                subcategoryId: subcategory.id,
                subcategoryName: subcategory.name,
                confidence,
                matchedBy: 'KEYWORD_MATCH'
              };
            }
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * Categorize by transaction type
   */
  private categorizeByTransactionType(transactionType: TransactionType | null): CategoryMatchResult {
    if (!transactionType) {
      return this.createEmptyResult();
    }

    const rule = this.transactionTypeRules.find(r => r.transactionType === transactionType);
    if (!rule) {
      return this.createEmptyResult();
    }

    const category = this.categories.find(c => c.id === rule.defaultCategoryId);
    const subcategory = this.subcategories.find(s => s.id === rule.defaultSubcategoryId);

    if (category && subcategory) {
      return {
        categoryId: category.id,
        categoryName: category.name,
        subcategoryId: subcategory.id,
        subcategoryName: subcategory.name,
        confidence: rule.confidence,
        matchedBy: 'PATTERN_MATCH'
      };
    }

    return this.createEmptyResult();
  }

  /**
   * Categorize by merchant pattern matching
   */
  private categorizeByMerchantPattern(merchant: MerchantMatchResult | null): CategoryMatchResult {
    if (!merchant || !merchant.normalizedName) {
      return this.createEmptyResult();
    }

    const merchantName = merchant.normalizedName.toLowerCase();
    
    // Check for common patterns
    const patterns = [
      { keywords: ['amazon', 'flipkart', 'myntra', 'shopping'], category: 'Wants', subcategory: 'Online Shopping' },
      { keywords: ['zomato', 'swiggy', 'restaurant', 'food'], category: 'Needs', subcategory: 'Food & Dining' },
      { keywords: ['uber', 'ola', 'taxi', 'transport'], category: 'Needs', subcategory: 'Transportation' },
      { keywords: ['netflix', 'spotify', 'hotstar', 'subscription'], category: 'Wants', subcategory: 'Entertainment' },
      { keywords: ['grocery', 'supermarket', 'mart'], category: 'Needs', subcategory: 'Groceries' },
      { keywords: ['petrol', 'fuel', 'gas'], category: 'Needs', subcategory: 'Fuel' },
      { keywords: ['medical', 'hospital', 'pharmacy'], category: 'Needs', subcategory: 'Healthcare' },
      { keywords: ['electricity', 'water', 'gas', 'utility'], category: 'Needs', subcategory: 'Utilities' },
      { keywords: ['mobile', 'internet', 'broadband'], category: 'Needs', subcategory: 'Phone & Internet' }
    ];

    for (const pattern of patterns) {
      if (pattern.keywords.some(keyword => merchantName.includes(keyword))) {
        const category = this.categories.find(c => c.name === pattern.category);
        const subcategory = this.subcategories.find(s => 
          s.name === pattern.subcategory && s.categoryId === category?.id
        );

        if (category && subcategory) {
          return {
            categoryId: category.id,
            categoryName: category.name,
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name,
            confidence: 0.7,
            matchedBy: 'PATTERN_MATCH'
          };
        }
      }
    }

    return this.createEmptyResult();
  }

  /**
   * Get default category based on transaction type
   */
  private getDefaultCategory(transactionType: TransactionType | null): CategoryMatchResult {
    // Default to most common expense category
    const defaultCategory = this.categories.find(c => 
      c.name.toLowerCase().includes('expense') || 
      c.name.toLowerCase().includes('needs') ||
      c.type === 'EXPENSE'
    );

    const defaultSubcategory = defaultCategory ? 
      this.subcategories.find(s => 
        s.categoryId === defaultCategory.id && 
        (s.name.toLowerCase().includes('other') || s.name.toLowerCase().includes('miscellaneous'))
      ) : null;

    if (defaultCategory && defaultSubcategory) {
      return {
        categoryId: defaultCategory.id,
        categoryName: defaultCategory.name,
        subcategoryId: defaultSubcategory.id,
        subcategoryName: defaultSubcategory.name,
        confidence: 0.3, // Low confidence for default
        matchedBy: 'DEFAULT'
      };
    }

    return this.createEmptyResult();
  }

  /**
   * Initialize merchant categorization rules
   */
  private initializeMerchantRules(): MerchantCategoryRule[] {
    // This would typically be loaded from a configuration file or database
    // For now, we'll create some basic rules
    const rules: MerchantCategoryRule[] = [];

    // Find category and subcategory IDs (this is a simplified approach)
    const wantsCategory = this.categories.find(c => c.name === 'Wants');
    const needsCategory = this.categories.find(c => c.name === 'Needs');

    if (wantsCategory && needsCategory) {
      // Online Shopping
      const onlineShoppingSub = this.subcategories.find(s => 
        s.name === 'Online Shopping' && s.categoryId === wantsCategory.id
      );
      if (onlineShoppingSub) {
        rules.push({
          merchantPatterns: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa'],
          categoryId: wantsCategory.id,
          subcategoryId: onlineShoppingSub.id,
          confidence: 0.9,
          priority: 1
        });
      }

      // Food & Dining
      const foodSub = this.subcategories.find(s => 
        s.name === 'Food & Dining' && s.categoryId === needsCategory.id
      );
      if (foodSub) {
        rules.push({
          merchantPatterns: ['zomato', 'swiggy', 'dominos', 'pizza', 'restaurant'],
          categoryId: needsCategory.id,
          subcategoryId: foodSub.id,
          confidence: 0.9,
          priority: 1
        });
      }

      // Transportation
      const transportSub = this.subcategories.find(s => 
        s.name === 'Transportation' && s.categoryId === needsCategory.id
      );
      if (transportSub) {
        rules.push({
          merchantPatterns: ['uber', 'ola', 'rapido', 'taxi', 'metro'],
          categoryId: needsCategory.id,
          subcategoryId: transportSub.id,
          confidence: 0.9,
          priority: 1
        });
      }
    }

    return rules;
  }

  /**
   * Initialize transaction type rules
   */
  private initializeTransactionTypeRules(): TransactionTypeRule[] {
    const needsCategory = this.categories.find(c => c.name === 'Needs');
    const wantsCategory = this.categories.find(c => c.name === 'Wants');
    const incomeCategory = this.categories.find(c => c.type === 'INCOME');

    const rules: TransactionTypeRule[] = [];

    if (needsCategory) {
      const otherSub = this.subcategories.find(s => 
        s.name.includes('Other') && s.categoryId === needsCategory.id
      );
      
      if (otherSub) {
        rules.push({
          transactionType: 'DEBIT',
          defaultCategoryId: needsCategory.id,
          defaultSubcategoryId: otherSub.id,
          confidence: 0.4
        });
      }
    }

    if (incomeCategory) {
      const incomeSub = this.subcategories.find(s => s.categoryId === incomeCategory.id);
      
      if (incomeSub) {
        rules.push({
          transactionType: 'CREDIT',
          defaultCategoryId: incomeCategory.id,
          defaultSubcategoryId: incomeSub.id,
          confidence: 0.5
        });
      }
    }

    return rules;
  }

  /**
   * Create empty result
   */
  private createEmptyResult(): CategoryMatchResult {
    return {
      categoryId: null,
      categoryName: null,
      subcategoryId: null,
      subcategoryName: null,
      confidence: 0,
      matchedBy: null
    };
  }

  /**
   * Get categorization statistics
   */
  public getStats(): {
    totalCategories: number;
    totalSubcategories: number;
    totalRules: number;
  } {
    return {
      totalCategories: this.categories.length,
      totalSubcategories: this.subcategories.length,
      totalRules: this.merchantCategoryRules.length
    };
  }
}

// Helper interfaces
interface MerchantCategoryRule {
  merchantPatterns: string[];
  categoryId: string;
  subcategoryId: string;
  confidence: number;
  priority: number;
}

interface TransactionTypeRule {
  transactionType: TransactionType;
  defaultCategoryId: string;
  defaultSubcategoryId: string;
  confidence: number;
} 