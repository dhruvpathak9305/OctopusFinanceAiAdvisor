// Transaction Type Extractor - Identify transaction types from SMS text
// Handles various transaction type patterns and keywords

import { ExtractionResult, TransactionType, TransactionTypePattern } from '../types';

// Comprehensive transaction type patterns
const TRANSACTION_TYPE_PATTERNS: TransactionTypePattern[] = [
  {
    type: 'DEBIT',
    keywords: ['debit', 'debited', 'spent', 'paid', 'purchase', 'withdrawn', 'withdraw', 'charged'],
    patterns: [
      /\b(?:debit|debited|spent|paid|purchase|withdrawn|withdraw|charged)\b/gi,
      /\b(?:rs\.?|inr|₹)\s*\d+.*?(?:debit|debited|spent|paid|charged)\b/gi,
      /\b(?:amount|amt).*?(?:debit|debited|spent|paid|charged)\b/gi
    ],
    confidence: 0.9
  },
  {
    type: 'CREDIT',
    keywords: ['credit', 'credited', 'received', 'deposited', 'deposit', 'refund', 'refunded', 'cashback'],
    patterns: [
      /\b(?:credit|credited|received|deposited|deposit|refund|refunded|cashback)\b/gi,
      /\b(?:rs\.?|inr|₹)\s*\d+.*?(?:credit|credited|received|deposited|refund)\b/gi,
      /\b(?:amount|amt).*?(?:credit|credited|received|deposited|refund)\b/gi
    ],
    confidence: 0.9
  },
  {
    type: 'TRANSFER',
    keywords: ['transfer', 'transferred', 'sent', 'upi', 'imps', 'neft', 'rtgs'],
    patterns: [
      /\b(?:transfer|transferred|sent|upi|imps|neft|rtgs)\b/gi,
      /\b(?:fund|money).*?(?:transfer|transferred|sent)\b/gi,
      /\bupi.*?(?:transfer|payment|sent)\b/gi
    ],
    confidence: 0.85
  },
  {
    type: 'PAYMENT',
    keywords: ['payment', 'bill payment', 'bill paid', 'utility payment', 'loan payment'],
    patterns: [
      /\b(?:payment|bill\s+payment|bill\s+paid|utility\s+payment|loan\s+payment)\b/gi,
      /\b(?:electricity|water|gas|mobile|internet).*?(?:payment|paid|bill)\b/gi
    ],
    confidence: 0.8
  },
  {
    type: 'WITHDRAWAL',
    keywords: ['withdrawal', 'atm', 'cash withdrawal', 'withdrew'],
    patterns: [
      /\b(?:withdrawal|atm|cash\s+withdrawal|withdrew)\b/gi,
      /\batm.*?(?:withdrawal|withdrew|cash)\b/gi
    ],
    confidence: 0.85
  },
  {
    type: 'DEPOSIT',
    keywords: ['deposit', 'deposited', 'cash deposit', 'cheque deposit'],
    patterns: [
      /\b(?:deposit|deposited|cash\s+deposit|cheque\s+deposit)\b/gi,
      /\b(?:cash|cheque).*?(?:deposit|deposited)\b/gi
    ],
    confidence: 0.85
  },
  {
    type: 'REFUND',
    keywords: ['refund', 'refunded', 'reversal', 'reversed', 'chargeback'],
    patterns: [
      /\b(?:refund|refunded|reversal|reversed|chargeback)\b/gi,
      /\b(?:transaction|payment).*?(?:refund|refunded|reversal|reversed)\b/gi
    ],
    confidence: 0.9
  }
];

// Context keywords that help determine transaction type
const CONTEXT_KEYWORDS = {
  DEBIT: ['spent', 'purchase', 'buy', 'bought', 'shop', 'store', 'merchant', 'online', 'pos'],
  CREDIT: ['salary', 'income', 'bonus', 'interest', 'dividend', 'cashback', 'reward'],
  TRANSFER: ['to', 'from', 'beneficiary', 'account holder', 'mobile number'],
  PAYMENT: ['bill', 'utility', 'loan', 'emi', 'insurance', 'subscription'],
  WITHDRAWAL: ['atm', 'cash', 'branch'],
  DEPOSIT: ['branch', 'cheque', 'cash', 'counter'],
  REFUND: ['cancelled', 'failed', 'unsuccessful', 'error']
};

/**
 * Extract transaction type from SMS text
 * @param smsText - The SMS message text
 * @returns ExtractionResult with transaction type
 */
export function extractType(smsText: string): ExtractionResult<TransactionType> {
  if (!smsText || typeof smsText !== 'string') {
    return {
      value: null,
      confidence: 0,
      extractedFrom: '',
      method: 'INVALID_INPUT'
    };
  }

  const normalizedText = smsText.toLowerCase().trim();
  let bestMatch: { 
    type: TransactionType; 
    confidence: number; 
    extractedFrom: string; 
    method: string 
  } | null = null;

  // Try each transaction type pattern
  for (const typePattern of TRANSACTION_TYPE_PATTERNS) {
    // Check keywords first (most reliable)
    for (const keyword of typePattern.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        const confidence = calculateTypeConfidence(
          typePattern.type,
          keyword,
          normalizedText,
          'KEYWORD'
        );

        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = {
            type: typePattern.type,
            confidence,
            extractedFrom: keyword,
            method: 'KEYWORD_MATCH'
          };
        }
      }
    }

    // Check regex patterns
    for (let i = 0; i < typePattern.patterns.length; i++) {
      const pattern = typePattern.patterns[i];
      const matches = Array.from(normalizedText.matchAll(pattern));

      for (const match of matches) {
        const confidence = calculateTypeConfidence(
          typePattern.type,
          match[0],
          normalizedText,
          'PATTERN'
        );

        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = {
            type: typePattern.type,
            confidence,
            extractedFrom: match[0],
            method: `PATTERN_MATCH_${i + 1}`
          };
        }
      }
    }
  }

  if (bestMatch) {
    return {
      value: bestMatch.type,
      confidence: bestMatch.confidence,
      extractedFrom: bestMatch.extractedFrom,
      method: bestMatch.method
    };
  }

  // Fallback: try to infer from context
  const fallbackResult = inferTypeFromContext(normalizedText);
  if (fallbackResult) {
    return fallbackResult;
  }

  return {
    value: null,
    confidence: 0,
    extractedFrom: '',
    method: 'NO_MATCH'
  };
}

/**
 * Calculate confidence score for transaction type extraction
 */
function calculateTypeConfidence(
  type: TransactionType,
  matchedText: string,
  fullText: string,
  matchType: 'KEYWORD' | 'PATTERN'
): number {
  let confidence = 0.6; // Base confidence

  // Match type bonus
  if (matchType === 'KEYWORD') {
    confidence += 0.2; // Keywords are more reliable
  } else {
    confidence += 0.15; // Patterns are slightly less reliable
  }

  // Context bonus - check for supporting keywords
  const contextKeywords = CONTEXT_KEYWORDS[type] || [];
  const contextMatches = contextKeywords.filter(keyword => 
    fullText.includes(keyword.toLowerCase())
  ).length;
  
  confidence += Math.min(contextMatches * 0.05, 0.15); // Max 0.15 bonus

  // Amount context bonus
  if (/(?:rs\.?|inr|₹)\s*\d+/i.test(fullText)) {
    confidence += 0.1;
  }

  // Specific type adjustments
  switch (type) {
    case 'DEBIT':
      // Most common type, slightly higher base confidence
      if (fullText.includes('spent') || fullText.includes('purchase')) {
        confidence += 0.05;
      }
      break;
    
    case 'CREDIT':
      // Less common, need stronger signals
      if (fullText.includes('salary') || fullText.includes('refund')) {
        confidence += 0.1;
      }
      break;
    
    case 'TRANSFER':
      // UPI/IMPS/NEFT are strong indicators
      if (/\b(?:upi|imps|neft|rtgs)\b/i.test(fullText)) {
        confidence += 0.15;
      }
      break;
    
    case 'WITHDRAWAL':
      // ATM is a strong indicator
      if (fullText.includes('atm')) {
        confidence += 0.2;
      }
      break;
  }

  return Math.min(confidence, 1.0);
}

/**
 * Infer transaction type from context when direct patterns fail
 */
function inferTypeFromContext(text: string): ExtractionResult<TransactionType> | null {
  const inferences = [
    {
      type: 'DEBIT' as TransactionType,
      indicators: ['at ', 'from ', 'merchant', 'store', 'shop', 'online', 'pos'],
      confidence: 0.4
    },
    {
      type: 'CREDIT' as TransactionType,
      indicators: ['salary', 'bonus', 'interest', 'dividend', 'cashback'],
      confidence: 0.5
    },
    {
      type: 'TRANSFER' as TransactionType,
      indicators: ['mobile number', 'beneficiary', 'account holder'],
      confidence: 0.4
    },
    {
      type: 'WITHDRAWAL' as TransactionType,
      indicators: ['cash', 'branch withdrawal'],
      confidence: 0.3
    }
  ];

  for (const inference of inferences) {
    const matchCount = inference.indicators.filter(indicator => 
      text.includes(indicator.toLowerCase())
    ).length;

    if (matchCount > 0) {
      const confidence = inference.confidence + (matchCount - 1) * 0.1;
      return {
        value: inference.type,
        confidence: Math.min(confidence, 0.7), // Cap at 0.7 for inference
        extractedFrom: inference.indicators.filter(ind => text.includes(ind.toLowerCase())).join(', '),
        method: 'CONTEXT_INFERENCE'
      };
    }
  }

  return null;
}

/**
 * Get all possible transaction types with confidence scores
 */
export function extractAllPossibleTypes(smsText: string): ExtractionResult<TransactionType>[] {
  const results: ExtractionResult<TransactionType>[] = [];
  const normalizedText = smsText.toLowerCase().trim();

  for (const typePattern of TRANSACTION_TYPE_PATTERNS) {
    let bestConfidence = 0;
    let bestMatch = '';
    let bestMethod = '';

    // Check keywords
    for (const keyword of typePattern.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        const confidence = calculateTypeConfidence(
          typePattern.type,
          keyword,
          normalizedText,
          'KEYWORD'
        );

        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestMatch = keyword;
          bestMethod = 'KEYWORD_MATCH';
        }
      }
    }

    // Check patterns
    for (let i = 0; i < typePattern.patterns.length; i++) {
      const pattern = typePattern.patterns[i];
      const matches = Array.from(normalizedText.matchAll(pattern));

      for (const match of matches) {
        const confidence = calculateTypeConfidence(
          typePattern.type,
          match[0],
          normalizedText,
          'PATTERN'
        );

        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestMatch = match[0];
          bestMethod = `PATTERN_MATCH_${i + 1}`;
        }
      }
    }

    if (bestConfidence > 0.3) { // Minimum threshold
      results.push({
        value: typePattern.type,
        confidence: bestConfidence,
        extractedFrom: bestMatch,
        method: bestMethod
      });
    }
  }

  return results.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
}

/**
 * Validate transaction type extraction result
 */
export function validateTransactionType(type: TransactionType | null): boolean {
  if (!type) return false;
  
  const validTypes: TransactionType[] = [
    'DEBIT', 'CREDIT', 'TRANSFER', 'REFUND', 'PAYMENT', 'WITHDRAWAL', 'DEPOSIT'
  ];
  
  return validTypes.includes(type);
}

/**
 * Get transaction type display name
 */
export function getTransactionTypeDisplayName(type: TransactionType): string {
  const displayNames: Record<TransactionType, string> = {
    'DEBIT': 'Debit',
    'CREDIT': 'Credit',
    'TRANSFER': 'Transfer',
    'REFUND': 'Refund',
    'PAYMENT': 'Payment',
    'WITHDRAWAL': 'Withdrawal',
    'DEPOSIT': 'Deposit'
  };

  return displayNames[type] || type;
} 