// Bank Matcher - Match SMS text against bank accounts and credit cards
// Handles last 4 digits matching, bank name matching, and fuzzy matching

import { BankAccount, CreditCard, AccountMatchResult, AccountType } from '../types';

export class BankMatcher {
  private accounts: BankAccount[];
  private creditCards: CreditCard[];
  private bankNameAliases: Map<string, string[]>;

  constructor(accounts: BankAccount[], creditCards: CreditCard[]) {
    this.accounts = accounts.filter(acc => acc.isActive);
    this.creditCards = creditCards.filter(card => card.isActive);
    this.bankNameAliases = this.initializeBankAliases();
  }

  /**
   * Match account by last 4 digits
   */
  public matchByLastFourDigits(lastFour: string): AccountMatchResult {
    if (!lastFour || lastFour.length !== 4 || !/^\d{4}$/.test(lastFour)) {
      return this.createEmptyResult();
    }

    // Check credit cards first (usually more specific in SMS)
    for (const card of this.creditCards) {
      if (card.lastFourDigits === lastFour) {
        return {
          accountId: card.id,
          accountName: card.name,
          accountType: card.type,
          confidence: 0.95, // High confidence for exact match
          matchedBy: 'LAST_FOUR_DIGITS'
        };
      }
    }

    // Check bank accounts
    for (const account of this.accounts) {
      if (account.lastFourDigits === lastFour) {
        return {
          accountId: account.id,
          accountName: account.name,
          accountType: account.type,
          confidence: 0.9, // Slightly lower than credit cards
          matchedBy: 'LAST_FOUR_DIGITS'
        };
      }
    }

    return this.createEmptyResult();
  }

  /**
   * Match account by bank name
   */
  public matchByBankName(text: string): AccountMatchResult {
    if (!text) return this.createEmptyResult();

    const normalizedText = text.toLowerCase();
    let bestMatch: AccountMatchResult = this.createEmptyResult();

    // Check all accounts and cards
    const allAccounts = [
      ...this.accounts.map(acc => ({ ...acc, source: 'account' as const })),
      ...this.creditCards.map(card => ({ ...card, source: 'card' as const }))
    ];

    for (const account of allAccounts) {
      const bankName = account.bankName.toLowerCase();
      
      // Exact bank name match
      if (normalizedText.includes(bankName)) {
        const confidence = this.calculateBankNameConfidence(bankName, normalizedText, 'exact');
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            accountId: account.id,
            accountName: account.name,
            accountType: account.type,
            confidence,
            matchedBy: 'BANK_NAME'
          };
        }
      }

      // Check aliases
      const aliases = this.bankNameAliases.get(bankName) || [];
      for (const alias of aliases) {
        if (normalizedText.includes(alias.toLowerCase())) {
          const confidence = this.calculateBankNameConfidence(alias, normalizedText, 'alias');
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              accountId: account.id,
              accountName: account.name,
              accountType: account.type,
              confidence,
              matchedBy: 'BANK_NAME'
            };
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * Match account by account name
   */
  public matchByAccountName(text: string): AccountMatchResult {
    if (!text) return this.createEmptyResult();

    const normalizedText = text.toLowerCase();
    let bestMatch: AccountMatchResult = this.createEmptyResult();

    // Check all accounts and cards
    const allAccounts = [
      ...this.accounts.map(acc => ({ ...acc, source: 'account' as const })),
      ...this.creditCards.map(card => ({ ...card, source: 'card' as const }))
    ];

    for (const account of allAccounts) {
      const accountName = account.name.toLowerCase();
      
      if (normalizedText.includes(accountName)) {
        const confidence = this.calculateAccountNameConfidence(accountName, normalizedText);
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            accountId: account.id,
            accountName: account.name,
            accountType: account.type,
            confidence,
            matchedBy: 'ACCOUNT_NAME'
          };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Get all possible matches with confidence scores
   */
  public getAllMatches(text: string): AccountMatchResult[] {
    const results: AccountMatchResult[] = [];

    // Extract potential last 4 digits
    const lastFourPattern = /\b(\d{4})\b/g;
    const lastFourMatches = Array.from(text.matchAll(lastFourPattern));
    
    for (const match of lastFourMatches) {
      const result = this.matchByLastFourDigits(match[1]);
      if (result.accountId) {
        results.push(result);
      }
    }

    // Bank name matching
    const bankNameResult = this.matchByBankName(text);
    if (bankNameResult.accountId) {
      results.push(bankNameResult);
    }

    // Account name matching
    const accountNameResult = this.matchByAccountName(text);
    if (accountNameResult.accountId) {
      results.push(accountNameResult);
    }

    // Remove duplicates and sort by confidence
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.accountId === result.accountId)
    );

    return uniqueResults.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get account by ID
   */
  public getAccountById(accountId: string): BankAccount | CreditCard | null {
    const account = this.accounts.find(acc => acc.id === accountId);
    if (account) return account;

    const card = this.creditCards.find(card => card.id === accountId);
    if (card) return card;

    return null;
  }

  /**
   * Get all accounts and cards
   */
  public getAllAccounts(): (BankAccount | CreditCard)[] {
    return [...this.accounts, ...this.creditCards];
  }

  /**
   * Update accounts and cards
   */
  public updateAccounts(accounts: BankAccount[], creditCards: CreditCard[]): void {
    this.accounts = accounts.filter(acc => acc.isActive);
    this.creditCards = creditCards.filter(card => card.isActive);
  }

  /**
   * Initialize bank name aliases for better matching
   */
  private initializeBankAliases(): Map<string, string[]> {
    const aliases = new Map<string, string[]>();

    // Common bank aliases
    aliases.set('state bank of india', ['sbi', 'state bank']);
    aliases.set('hdfc bank', ['hdfc']);
    aliases.set('icici bank', ['icici']);
    aliases.set('axis bank', ['axis']);
    aliases.set('kotak mahindra bank', ['kotak']);
    aliases.set('punjab national bank', ['pnb']);
    aliases.set('bank of baroda', ['bob', 'baroda']);
    aliases.set('canara bank', ['canara']);
    aliases.set('union bank of india', ['union bank']);
    aliases.set('bank of india', ['boi']);
    aliases.set('central bank of india', ['central bank']);
    aliases.set('indian bank', ['indian bank']);
    aliases.set('punjab and sind bank', ['psb']);
    aliases.set('idbi bank', ['idbi']);
    aliases.set('federal bank', ['federal']);
    aliases.set('south indian bank', ['sib']);
    aliases.set('karur vysya bank', ['kvb']);
    aliases.set('city union bank', ['cub']);
    aliases.set('yes bank', ['yes']);
    aliases.set('indusind bank', ['indusind']);
    aliases.set('rbl bank', ['rbl']);
    aliases.set('bandhan bank', ['bandhan']);
    aliases.set('idfc first bank', ['idfc']);

    return aliases;
  }

  /**
   * Calculate confidence for bank name matching
   */
  private calculateBankNameConfidence(
    bankName: string, 
    text: string, 
    matchType: 'exact' | 'alias'
  ): number {
    let confidence = matchType === 'exact' ? 0.8 : 0.7;

    // Bonus for longer bank names (more specific)
    if (bankName.length > 10) confidence += 0.1;

    // Bonus if bank name appears with transaction keywords
    const transactionKeywords = ['debit', 'credit', 'card', 'account', 'transaction'];
    const hasTransactionContext = transactionKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    if (hasTransactionContext) confidence += 0.1;

    // Penalty if bank name is very common/short
    if (bankName.length < 4) confidence -= 0.2;

    return Math.min(confidence, 0.95);
  }

  /**
   * Calculate confidence for account name matching
   */
  private calculateAccountNameConfidence(accountName: string, text: string): number {
    let confidence = 0.6; // Base confidence for account name

    // Bonus for longer account names
    if (accountName.length > 8) confidence += 0.1;

    // Bonus if appears with account-specific keywords
    const accountKeywords = ['account', 'card', 'savings', 'current', 'credit'];
    const hasAccountContext = accountKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    if (hasAccountContext) confidence += 0.15;

    return Math.min(confidence, 0.85);
  }

  /**
   * Create empty result
   */
  private createEmptyResult(): AccountMatchResult {
    return {
      accountId: null,
      accountName: null,
      accountType: null,
      confidence: 0,
      matchedBy: null
    };
  }

  /**
   * Fuzzy match for partial matches (future enhancement)
   */
  public fuzzyMatch(text: string, threshold: number = 0.6): AccountMatchResult[] {
    // This could be enhanced with libraries like fuse.js for fuzzy matching
    // For now, return empty array
    return [];
  }

  /**
   * Get statistics about matching performance
   */
  public getMatchingStats(): {
    totalAccounts: number;
    totalCreditCards: number;
    bankCoverage: string[];
  } {
    const banks = new Set([
      ...this.accounts.map(acc => acc.bankName),
      ...this.creditCards.map(card => card.bankName)
    ]);

    return {
      totalAccounts: this.accounts.length,
      totalCreditCards: this.creditCards.length,
      bankCoverage: Array.from(banks)
    };
  }
} 