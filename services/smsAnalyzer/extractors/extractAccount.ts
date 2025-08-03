// Account Extractor - Match SMS text against bank accounts and credit cards
// Handles last 4 digits matching, bank name matching, and pattern recognition

import { ExtractionResult, AccountMatchResult, BankAccount, CreditCard } from '../types';
import { BankMatcher } from '../matchers/bankMatcher';

/**
 * Extract account information from SMS text using bank matcher
 * @param smsText - The SMS message text
 * @param bankMatcher - Initialized bank matcher with accounts and cards
 * @returns ExtractionResult with account match information
 */
export function extractAccount(
  smsText: string, 
  bankMatcher: BankMatcher
): ExtractionResult<AccountMatchResult> {
  if (!smsText || typeof smsText !== 'string') {
    return {
      value: {
        accountId: null,
        accountName: null,
        accountType: null,
        confidence: 0,
        matchedBy: null
      },
      confidence: 0,
      extractedFrom: '',
      method: 'INVALID_INPUT'
    };
  }

  const normalizedText = smsText.trim();
  
  // Try different extraction strategies in order of reliability
  const strategies = [
    () => extractByLastFourDigits(normalizedText, bankMatcher),
    () => extractByBankName(normalizedText, bankMatcher),
    () => extractByAccountPattern(normalizedText, bankMatcher),
    () => extractByCardPattern(normalizedText, bankMatcher)
  ];

  let bestMatch: ExtractionResult<AccountMatchResult> | null = null;

  for (const strategy of strategies) {
    const result = strategy();
    if (result && result.value && result.confidence > 0) {
      if (!bestMatch || result.confidence > bestMatch.confidence) {
        bestMatch = result;
      }
    }
  }

  return bestMatch || {
    value: {
      accountId: null,
      accountName: null,
      accountType: null,
      confidence: 0,
      matchedBy: null
    },
    confidence: 0,
    extractedFrom: '',
    method: 'NO_MATCH'
  };
}

/**
 * Extract account by matching last 4 digits
 */
function extractByLastFourDigits(
  text: string, 
  bankMatcher: BankMatcher
): ExtractionResult<AccountMatchResult> | null {
  // Patterns for last 4 digits in SMS
  const lastFourPatterns = [
    /(?:card|account|a\/c)[\s\w]*?(?:ending|ending\s+with|xx|xxxx)?(\d{4})/gi,
    /(?:xx|xxxx)(\d{4})/gi,
    /(\d{4})(?:\s*$|\s+(?:on|at|from))/gi,
    /(?:last\s+4\s+digits?[\s:]*)?(\d{4})/gi
  ];

  for (const pattern of lastFourPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    
    for (const match of matches) {
      const lastFour = match[1];
      if (!lastFour || lastFour.length !== 4) continue;

      const matchResult = bankMatcher.matchByLastFourDigits(lastFour);
      if (matchResult.accountId) {
        return {
          value: matchResult,
          confidence: matchResult.confidence,
          extractedFrom: match[0],
          method: 'LAST_FOUR_DIGITS'
        };
      }
    }
  }

  return null;
}

/**
 * Extract account by matching bank name
 */
function extractByBankName(
  text: string, 
  bankMatcher: BankMatcher
): ExtractionResult<AccountMatchResult> | null {
  const matchResult = bankMatcher.matchByBankName(text);
  
  if (matchResult.accountId) {
    return {
      value: matchResult,
      confidence: matchResult.confidence,
      extractedFrom: text,
      method: 'BANK_NAME'
    };
  }

  return null;
}

/**
 * Extract account by account-specific patterns
 */
function extractByAccountPattern(
  text: string, 
  bankMatcher: BankMatcher
): ExtractionResult<AccountMatchResult> | null {
  // Account number patterns (partial matching)
  const accountPatterns = [
    /(?:account|a\/c)[\s\w]*?(\d{4,})/gi,
    /(?:savings|current)[\s\w]*?(\d{4,})/gi
  ];

  for (const pattern of accountPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    
    for (const match of matches) {
      const accountDigits = match[1];
      if (!accountDigits || accountDigits.length < 4) continue;

      // Try to match with last 4 digits of the extracted number
      const lastFour = accountDigits.slice(-4);
      const matchResult = bankMatcher.matchByLastFourDigits(lastFour);
      
      if (matchResult.accountId) {
        return {
          value: {
            ...matchResult,
            matchedBy: 'PATTERN'
          },
          confidence: matchResult.confidence * 0.8, // Slightly lower confidence
          extractedFrom: match[0],
          method: 'ACCOUNT_PATTERN'
        };
      }
    }
  }

  return null;
}

/**
 * Extract account by card-specific patterns
 */
function extractByCardPattern(
  text: string, 
  bankMatcher: BankMatcher
): ExtractionResult<AccountMatchResult> | null {
  // Card-specific patterns
  const cardPatterns = [
    /(?:credit|debit)\s+card[\s\w]*?(\d{4})/gi,
    /card[\s\w]*?(?:ending|xx|xxxx)?(\d{4})/gi,
    /(?:visa|master|rupay)[\s\w]*?(\d{4})/gi
  ];

  for (const pattern of cardPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    
    for (const match of matches) {
      const lastFour = match[1];
      if (!lastFour || lastFour.length !== 4) continue;

      const matchResult = bankMatcher.matchByLastFourDigits(lastFour);
      
      if (matchResult.accountId) {
        return {
          value: {
            ...matchResult,
            matchedBy: 'PATTERN'
          },
          confidence: matchResult.confidence * 0.9,
          extractedFrom: match[0],
          method: 'CARD_PATTERN'
        };
      }
    }
  }

  return null;
}

/**
 * Validate account extraction result
 */
export function validateAccountMatch(result: AccountMatchResult | null): boolean {
  if (!result) return false;
  if (!result.accountId) return false;
  if (result.confidence <= 0) return false;
  
  return true;
}

/**
 * Get account display name for UI
 */
export function getAccountDisplayName(
  accountId: string,
  accounts: BankAccount[],
  creditCards: CreditCard[]
): string {
  // Check bank accounts first
  const bankAccount = accounts.find(acc => acc.id === accountId);
  if (bankAccount) {
    return `${bankAccount.bankName} ${bankAccount.name} (...${bankAccount.lastFourDigits})`;
  }

  // Check credit cards
  const creditCard = creditCards.find(card => card.id === accountId);
  if (creditCard) {
    return `${creditCard.bankName} ${creditCard.name} (...${creditCard.lastFourDigits})`;
  }

  return 'Unknown Account';
}

/**
 * Extract multiple potential accounts (for ambiguous cases)
 */
export function extractMultipleAccounts(
  smsText: string,
  bankMatcher: BankMatcher
): ExtractionResult<AccountMatchResult>[] {
  const results: ExtractionResult<AccountMatchResult>[] = [];
  
  // Extract all possible last 4 digit matches
  const lastFourPattern = /(\d{4})/g;
  const matches = Array.from(smsText.matchAll(lastFourPattern));
  
  for (const match of matches) {
    const lastFour = match[1];
    const matchResult = bankMatcher.matchByLastFourDigits(lastFour);
    
    if (matchResult.accountId && matchResult.confidence > 0.3) {
      results.push({
        value: matchResult,
        confidence: matchResult.confidence,
        extractedFrom: match[0],
        method: 'MULTI_MATCH'
      });
    }
  }

  // Sort by confidence
  return results.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
} 