// Custom SMS Transaction Analyzer for Octopus Finance
// Uses actual context data from the application

export interface SMSAnalysisResult {
  success: boolean;
  data: any | null;
  error?: string;
  confidence: number;
  extractedData?: any;
}

export interface ContextData {
  categories: Array<{ id: string; name: string }>;
  subcategories: Array<{ id: string; name: string; category_id: string }>;
  accounts: Array<{ id: string; name: string; institution: string | null }>;
  creditCards: Array<{ id: string; name: string; bank: string; cardNumber?: string }>;
}

export class OctopusSMSAnalyzer {
  private categories: Map<string, string> = new Map();
  private subcategories: Map<string, { id: string; categoryId: string }> = new Map();
  private bankAccounts: Map<string, string> = new Map();
  private creditCards: Map<string, string> = new Map();

  constructor(contextData: ContextData) {
    this.loadContextData(contextData);
  }

  private loadContextData(contextData: ContextData) {
    // Load categories
    contextData.categories.forEach(cat => {
      this.categories.set(cat.name.toUpperCase(), cat.id);
    });

    // Load subcategories
    contextData.subcategories.forEach(sub => {
      this.subcategories.set(sub.name.toUpperCase(), {
        id: sub.id,
        categoryId: sub.category_id
      });
    });

    // Load bank accounts
    contextData.accounts.forEach(acc => {
      const institutionKey = acc.institution ? `${acc.institution.toUpperCase()}` : acc.name.toUpperCase();
      const nameKey = acc.name.toUpperCase();
      this.bankAccounts.set(institutionKey, acc.id);
      this.bankAccounts.set(nameKey, acc.id);
    });

    // Load credit cards
    contextData.creditCards.forEach(card => {
      const bankKey = card.bank.toUpperCase();
      const nameKey = card.name.toUpperCase();
      this.creditCards.set(bankKey, card.id);
      this.creditCards.set(nameKey, card.id);
      
      // Also store with card number if available (for card number matching)
      if (card.cardNumber) {
        const cardNumberKey = card.cardNumber.toString();
        this.creditCards.set(`${bankKey} ${cardNumberKey}`, card.id);
        this.creditCards.set(cardNumberKey, card.id);
      }
    });
    
    // Debug: Log loaded context data
    console.log('📊 Context data loaded:', {
      categories: Array.from(this.categories.entries()),
      subcategories: Array.from(this.subcategories.entries()),
      bankAccounts: Array.from(this.bankAccounts.entries()),
      creditCards: Array.from(this.creditCards.entries()),
      categoriesCount: this.categories.size,
      subcategoriesCount: this.subcategories.size,
      creditCardsCount: this.creditCards.size
    });
  }

  public analyzeSMS(smsText: string): SMSAnalysisResult {
    try {
      const extractedData = this.extractTransactionData(smsText);
      
      if (!extractedData.amount) {
        throw new Error('Unable to extract amount from SMS');
      }

      const categorization = this.applyCategorization(extractedData.merchant);
      
      // Try to identify account by card number first, then fallback to bank name
      let accountInfo = this.identifyAccountByCardNumber(extractedData.cardNumber, extractedData.bankName);
      if (!accountInfo) {
        accountInfo = this.identifyAccount(extractedData.bankName, extractedData.type);
      }
      
      const confidence = this.calculateConfidence(extractedData, categorization, accountInfo);
      
      const transactionJSON = this.buildTransactionJSON(
        extractedData, 
        categorization, 
        accountInfo, 
        confidence
      );
      
      // Essential debug log for SMS parsing results
      console.log('📊 SMS parsed:', {
        parsedCategory: categorization.categoryName,
        parsedSubcategory: categorization.subcategoryName,
        parsedAccount: accountInfo.accountName,
        merchant: extractedData.merchant,
        amount: extractedData.amount,
        bankName: extractedData.bankName
      });
      
      return {
        success: true,
        data: transactionJSON,
        extractedData,
        confidence
      };
    } catch (error) {
      console.error('❌ SMS Analysis Failed:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        confidence: 0
      };
    }
  }

  private extractTransactionData(smsText: string) {
    const text = smsText.toUpperCase().trim();
    
    // Determine transaction type
    let type = 'expense';
    if (text.includes('CREDITED') || text.includes('DEPOSIT') || text.includes('RECEIVED') || 
        text.includes('REFUND') || text.includes('CASHBACK') || text.includes('SALARY')) {
      type = 'income';
    }

    // Extract amount
    const amountPatterns = [
      /(?:RS\.?\s*|INR\s*|₹\s*)(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      /(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:RS\.?|INR|₹)/i,
      /AMOUNT\s*(?:RS\.?\s*|INR\s*|₹\s*)?(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      /(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:DEBITED|CREDITED|SPENT|PAID)/i
    ];

    let amount = null;
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

    // Extract date
    let date = new Date().toISOString().split('T')[0];
    const datePatterns = [
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
      /(\d{1,2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\d{2,4})/i,
      /ON\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const parsedDate = new Date(match[1]);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0];
            break;
          }
        } catch (e) {
          // Continue with default date
        }
      }
    }

    // Extract card number
    const cardPatterns = [
      /(?:CARD|A\/C)\s*(?:NO\.?\s*)?[X*]+(\d{4})/i,
      /[X*]{4,}(\d{4})/,
      /(\d{4})\s*(?:CARD|A\/C)/i
    ];

    let cardNumber = null;
    for (const pattern of cardPatterns) {
      const match = text.match(pattern);
      if (match) {
        cardNumber = match[1];
        break;
      }
    }

    // Extract bank name
    let bankName = null;
    const bankPatterns = ['HDFC', 'ICICI', 'AXIS', 'SBI', 'KOTAK', 'INDUSIND'];
    for (const bank of bankPatterns) {
      if (text.includes(bank)) {
        bankName = bank;
        break;
      }
    }

    // Extract merchant
    const merchantPatterns = [
      /(?:ON|AT|@)\s+([A-Z*][A-Z0-9\s\-\.\*]{2,30})(?:\s+[-\.]|\s+ON|\s+\d|$)/,
      /(?:PAID TO|TO)\s+([A-Z][A-Z0-9\s\-\.]{2,30})(?:\s+ON|\s+\d|$)/,
      /(?:FROM|VIA)\s+([A-Z][A-Z0-9\s\-\.]{2,30})(?:\s+ON|\s+\d|$)/,
      /(?:FOR|AT)\s+([A-Z*][A-Z0-9\s\-\.\*]{2,30})(?:\s+[-\.]|\s+ON|\s+\d|$)/
    ];

    let merchant = null;
    for (const pattern of merchantPatterns) {
      const match = text.match(pattern);
      if (match) {
        merchant = match[1].trim();
        // Clean up merchant name
        merchant = merchant.replace(/^IND\*/, ''); // Remove IND* prefix
        merchant = merchant.replace(/\s+(BANGALORE|MUMBAI|DELHI|CHENNAI|HYDERABAD|PUNE|KOLKATA).*$/i, '');
        merchant = merchant.replace(/\s+(PVT|LTD|LIMITED|PRIVATE|INDIA).*$/i, '');
        merchant = merchant.replace(/\s*[-\.]\s*$/, ''); // Remove trailing dash or dot
        break;
      }
    }

    return {
      type,
      amount,
      date,
      merchant,
      cardNumber,
      bankName,
      originalSMS: smsText
    };
  }

  private applyCategorization(merchant: string | null) {
    if (!merchant) {
      return {
        categoryName: null,
        categoryId: null,
        subcategoryName: null,
        subcategoryId: null
      };
    }

    const merchantUpper = merchant.toUpperCase();
    
    // Debug: Check if we have categories loaded
    console.log('🔍 Category mapping debug:', {
      merchant: merchantUpper,
      categoriesCount: this.categories.size,
      subcategoriesCount: this.subcategories.size,
      availableCategories: Array.from(this.categories.keys()),
      availableSubcategories: Array.from(this.subcategories.keys())
    });
    
    // Enhanced merchant categorization rules
    const merchantRules = {
      // Shopping & E-commerce (exact matches for Amazon)
      'AMAZON': { category: 'Wants', subcategory: 'Shopping' },
      'AMAZON.IN': { category: 'Wants', subcategory: 'Shopping' },
      'AMAZON.COM': { category: 'Wants', subcategory: 'Shopping' },
      'IND*AMAZON': { category: 'Wants', subcategory: 'Shopping' },
      'IND*AMAZON.IN': { category: 'Wants', subcategory: 'Shopping' },
      'FLIPKART': { category: 'Wants', subcategory: 'Shopping' },
      'MYNTRA': { category: 'Wants', subcategory: 'Shopping' },
      'AJIO': { category: 'Wants', subcategory: 'Shopping' },
      'NYKAA': { category: 'Wants', subcategory: 'Shopping' },
      'MEESHO': { category: 'Wants', subcategory: 'Shopping' },
      
      // Food & Dining
      'ZOMATO': { category: 'Wants', subcategory: 'Food & Dining' },
      'SWIGGY': { category: 'Wants', subcategory: 'Food & Dining' },
      'DOMINOS': { category: 'Wants', subcategory: 'Food & Dining' },
      'MCDONALDS': { category: 'Wants', subcategory: 'Food & Dining' },
      'KFC': { category: 'Wants', subcategory: 'Food & Dining' },
      'PIZZA HUT': { category: 'Wants', subcategory: 'Food & Dining' },
      
      // Groceries (Needs)
      'BIGBASKET': { category: 'Needs', subcategory: 'Groceries' },
      'GROFERS': { category: 'Needs', subcategory: 'Groceries' },
      'ZEPTO': { category: 'Needs', subcategory: 'Groceries' },
      'BLINKIT': { category: 'Needs', subcategory: 'Groceries' },
      'DUNZO': { category: 'Needs', subcategory: 'Groceries' },
      'BIG BAZAAR': { category: 'Needs', subcategory: 'Groceries' },
      'RELIANCE FRESH': { category: 'Needs', subcategory: 'Groceries' },
      
      // Transportation
      'UBER': { category: 'Needs', subcategory: 'Transportation' },
      'OLA': { category: 'Needs', subcategory: 'Transportation' },
      'RAPIDO': { category: 'Needs', subcategory: 'Transportation' },
      
      // Entertainment
      'NETFLIX': { category: 'Wants', subcategory: 'Entertainment' },
      'AMAZON PRIME': { category: 'Wants', subcategory: 'Entertainment' },
      'BOOKMYSHOW': { category: 'Wants', subcategory: 'Entertainment' },
      'HOTSTAR': { category: 'Wants', subcategory: 'Entertainment' },
      'SPOTIFY': { category: 'Wants', subcategory: 'Entertainment' },
      'PVR CINEMAS': { category: 'Wants', subcategory: 'Entertainment' },
      
      // Bills & Utilities (Needs)
      'AIRTEL': { category: 'Needs', subcategory: 'Phone & Internet' },
      'JIO': { category: 'Needs', subcategory: 'Phone & Internet' },
      'VODAFONE': { category: 'Needs', subcategory: 'Phone & Internet' },
      'BSNL': { category: 'Needs', subcategory: 'Phone & Internet' },
      'TATA POWER': { category: 'Needs', subcategory: 'Utilities' },
      'ELECTRICITY BILL': { category: 'Needs', subcategory: 'Utilities' },
      
      // Healthcare
      'APOLLO PHARMACY': { category: 'Needs', subcategory: 'Healthcare' },
      'MEDPLUS': { category: 'Needs', subcategory: 'Healthcare' },
      '1MG': { category: 'Needs', subcategory: 'Healthcare' },
      
      // Electronics & Technology
      'CROMA ELECTRONICS': { category: 'Wants', subcategory: 'Electronics' },
      'VIJAY SALES': { category: 'Wants', subcategory: 'Electronics' },
      'RELIANCE DIGITAL': { category: 'Wants', subcategory: 'Electronics' },
      
      // Fashion & Lifestyle
      'LIFESTYLE STORES': { category: 'Wants', subcategory: 'Fashion' },
      'WESTSIDE': { category: 'Wants', subcategory: 'Fashion' },
      'PANTALOONS': { category: 'Wants', subcategory: 'Fashion' },
      
      // Travel & Transport
      'INDIGO AIRLINES': { category: 'Wants', subcategory: 'Travel' },
      'SPICEJET': { category: 'Wants', subcategory: 'Travel' },
      'BOOKING.COM': { category: 'Wants', subcategory: 'Travel' },
      'MAKEMYTRIP': { category: 'Wants', subcategory: 'Travel' },
      'LUFTHANSA': { category: 'Wants', subcategory: 'Travel' },
      
      // Financial Services
      'MUTUAL FUND': { category: 'Save', subcategory: 'Investments' },
      'SIP': { category: 'Save', subcategory: 'Investments' },
      'INSURANCE PREMIUM': { category: 'Needs', subcategory: 'Insurance' },
      'HOME LOAN EMI': { category: 'Needs', subcategory: 'Loan EMI' },
      'CAR LOAN EMI': { category: 'Needs', subcategory: 'Loan EMI' },
      
      // Government & Tax
      'INCOME TAX': { category: 'Needs', subcategory: 'Government & Tax' },
      'GST PAYMENT': { category: 'Needs', subcategory: 'Government & Tax' },
    };

    // Check exact matches first
    if (merchantRules[merchantUpper]) {
      const rule = merchantRules[merchantUpper];
      let categoryId = this.categories.get(rule.category);
      let subcategoryInfo = this.subcategories.get(rule.subcategory);
      
      // Fallback: Try exact name matching if uppercase lookup failed
      if (!categoryId) {
        // Try to find by exact name match (case-insensitive)
        for (const [categoryKey, catId] of this.categories.entries()) {
          if (categoryKey.toLowerCase() === rule.category.toLowerCase()) {
            categoryId = catId;
            break;
          }
        }
      }
      
      if (!subcategoryInfo) {
        // Try to find by exact name match (case-insensitive)
        for (const [subcategoryKey, subInfo] of this.subcategories.entries()) {
          if (subcategoryKey.toLowerCase() === rule.subcategory.toLowerCase()) {
            subcategoryInfo = subInfo;
            break;
          }
        }
      }
      
      // Debug: Log category/subcategory lookup results
      console.log('✅ Found exact merchant match:', {
        merchant: merchantUpper,
        rule,
        categoryLookupKey: rule.category,
        subcategoryLookupKey: rule.subcategory,
        categoryId,
        subcategoryInfo,
        categoryFound: !!categoryId,
        subcategoryFound: !!subcategoryInfo,
        availableCategoryKeys: Array.from(this.categories.keys()),
        availableSubcategoryKeys: Array.from(this.subcategories.keys())
      });
      
      return {
        categoryName: rule.category,
        categoryId: categoryId || null,
        subcategoryName: rule.subcategory,
        subcategoryId: subcategoryInfo?.id || null
      };
    }
    
    // Check partial matches
    for (const [ruleMerchant, rule] of Object.entries(merchantRules)) {
      if (merchantUpper.includes(ruleMerchant) || ruleMerchant.includes(merchantUpper)) {
        let categoryId = this.categories.get(rule.category);
        let subcategoryInfo = this.subcategories.get(rule.subcategory);
        
        // Fallback: Try exact name matching if uppercase lookup failed
        if (!categoryId) {
          for (const [categoryKey, catId] of this.categories.entries()) {
            if (categoryKey.toLowerCase() === rule.category.toLowerCase()) {
              categoryId = catId;
              break;
            }
          }
        }
        
        if (!subcategoryInfo) {
          for (const [subcategoryKey, subInfo] of this.subcategories.entries()) {
            if (subcategoryKey.toLowerCase() === rule.subcategory.toLowerCase()) {
              subcategoryInfo = subInfo;
              break;
            }
          }
        }
        
        // Debug: Log partial match results
        console.log('✅ Found partial merchant match:', {
          merchant: merchantUpper,
          ruleMerchant,
          rule,
          categoryId,
          subcategoryInfo,
          categoryFound: !!categoryId,
          subcategoryFound: !!subcategoryInfo
        });
        
        return {
          categoryName: rule.category,
          categoryId: categoryId || null,
          subcategoryName: rule.subcategory,
          subcategoryId: subcategoryInfo?.id || null
        };
      }
    }
    
    // No match found - return null values
    return {
      categoryName: null,
      categoryId: null,
      subcategoryName: null,
      subcategoryId: null
    };
  }

  private identifyAccountByCardNumber(cardNumber: string | null, bankName: string | null) {
    if (!cardNumber) return null;
    
    // Look through credit cards to find matching last 4 digits
    for (const [key, cardId] of this.creditCards.entries()) {
      // Check if the key contains the card number (e.g., "ICICI 8018", "HDFC ****1234")
      if (key.includes(cardNumber)) {
        console.log('✅ Found credit card by card number:', { cardNumber, key, cardId });
        return {
          accountId: cardId,
          accountName: key,
          accountType: 'credit_card'
        };
      }
    }
    
    return null;
  }

  private identifyAccount(bankName: string | null, transactionType: string) {
    if (!bankName) {
      return {
        accountName: null,
        accountId: null,
        accountType: null
      };
    }

    const bankNameUpper = bankName.toUpperCase();
    
    // Debug: Log account identification process
    console.log('🏦 Account identification debug:', {
      bankName,
      bankNameUpper,
      transactionType,
      bankAccountsCount: this.bankAccounts.size,
      creditCardsCount: this.creditCards.size,
      availableBankAccounts: Array.from(this.bankAccounts.keys()),
      availableCreditCards: Array.from(this.creditCards.keys())
    });

    // PRIORITIZE CREDIT CARD MATCHING since most SMS transactions are credit card based
    // Try to find credit card with multiple lookup strategies
    let creditCardId = this.creditCards.get(bankNameUpper) || this.creditCards.get(bankName);
    
    // Try variations for common bank name formats
    if (!creditCardId) {
      const variations = [
        `${bankNameUpper} BANK`,
        bankNameUpper.replace(' BANK', ''),
        `${bankNameUpper.replace(' BANK', '')} BANK`
      ];
      
      for (const variation of variations) {
        creditCardId = this.creditCards.get(variation);
        if (creditCardId) break;
      }
    }
    
    if (creditCardId) {
      console.log('✅ Found credit card:', { bankName, creditCardId, bankNameUpper });
      return {
        accountName: `${bankName} Credit Card`,
        accountId: creditCardId,
        accountType: 'credit_card'
      };
    }

    // Only try bank account if credit card not found
    const bankAccountId = this.bankAccounts.get(bankNameUpper) || this.bankAccounts.get(bankName);
    if (bankAccountId) {
      console.log('✅ Found bank account:', { bankName, bankAccountId });
      return {
        accountName: `${bankName} Account`,
        accountId: bankAccountId,
        accountType: 'bank'
      };
    }
    
    // Default fallback for known banks - assume credit card for most SMS transactions
    if (bankName) {
      console.log('⚠️ Using fallback for bank:', bankName);
      return {
        accountName: `${bankName} Credit Card`,
        accountId: null,
        accountType: 'credit_card'
      };
    }

    console.log('❌ No account found');
    return {
      accountName: null,
      accountId: null,
      accountType: null
    };
  }

  private calculateConfidence(extractedData: any, categorization: any, accountInfo: any): number {
    let confidence = 0;
    
    if (extractedData.amount && extractedData.amount > 0) confidence += 0.3;
    if (extractedData.date) confidence += 0.1;
    if (extractedData.merchant) confidence += 0.2;
    if (categorization.categoryId) confidence += 0.2;
    if (accountInfo.accountId) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  private buildTransactionJSON(extractedData: any, categorization: any, accountInfo: any, confidence: number) {
    let name = '';
    if (extractedData.merchant) {
      name = `${extractedData.merchant}`;
    } else {
      name = `${extractedData.type === 'income' ? 'Income' : 'Expense'} Transaction`;
    }
    
    if (extractedData.cardNumber) {
      name += ` - Card XX${extractedData.cardNumber}`;
    }

    // Enhanced account name to include card number if available
    let enhancedAccountName = accountInfo.accountName;
    if (extractedData.cardNumber && accountInfo.accountType === 'credit_card') {
      enhancedAccountName = `${extractedData.bankName} ${extractedData.cardNumber}`;
    }

    return {
      name: name,
      amount: extractedData.amount,
      type: extractedData.type,
      categoryId: categorization.categoryId,
      categoryName: categorization.categoryName,
      subcategoryId: categorization.subcategoryId,
      subcategoryName: categorization.subcategoryName,
      date: extractedData.date,
      accountId: accountInfo.accountId,
      accountName: enhancedAccountName,
      accountType: accountInfo.accountType,
      // ❌ EXCLUDE is_credit_card - it's a GENERATED column in the database
      isRecurring: false,
      merchant: extractedData.merchant,
      confidence: confidence
    };
  }
}

// Main function to analyze SMS using context data
export function analyzeWithOctopus(
  smsText: string, 
  contextData: ContextData
): SMSAnalysisResult {
  const analyzer = new OctopusSMSAnalyzer(contextData);
  console.log("🚀 ~ contextData:", contextData)
  console.log("🚀 ~ analyzer.analyzeSMS(smsText):", analyzer.analyzeSMS(smsText))
  return analyzer.analyzeSMS(smsText);
} 