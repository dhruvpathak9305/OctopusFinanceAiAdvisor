// Amount Extractor - Robust parsing of monetary amounts from SMS
// Handles multiple formats, currencies, and edge cases

import { ExtractionResult, AmountPattern } from '../types';

// Comprehensive amount patterns for Indian SMS formats
const AMOUNT_PATTERNS: AmountPattern[] = [
  // INR with various formats
  {
    pattern: /(?:INR|Rs\.?|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
    currencySymbols: ['INR', 'Rs', '₹'],
    decimalSeparators: ['.'],
    thousandSeparators: [',']
  },
  // Amount followed by currency
  {
    pattern: /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:INR|Rs\.?|₹)/gi,
    currencySymbols: ['INR', 'Rs', '₹'],
    decimalSeparators: ['.'],
    thousandSeparators: [',']
  },
  // Generic amount patterns (fallback)
  {
    pattern: /(?:amount|amt|sum|total|paid|spent|debited|credited|withdrawn|deposited)[\s:]*(?:of\s+)?(?:INR\s+|Rs\.?\s+|₹\s*)?([0-9,]+(?:\.[0-9]{1,2})?)/gi,
    currencySymbols: ['INR', 'Rs', '₹'],
    decimalSeparators: ['.'],
    thousandSeparators: [',']
  },
  // Contextual patterns
  {
    pattern: /(?:for|worth|value)\s+(?:INR\s+|Rs\.?\s+|₹\s*)?([0-9,]+(?:\.[0-9]{1,2})?)/gi,
    currencySymbols: ['INR', 'Rs', '₹'],
    decimalSeparators: ['.'],
    thousandSeparators: [',']
  }
];

// Keywords that typically precede amounts
const AMOUNT_KEYWORDS = [
  'amount', 'amt', 'sum', 'total', 'paid', 'spent', 'debited', 'credited',
  'withdrawn', 'deposited', 'charged', 'billed', 'cost', 'price', 'value',
  'worth', 'for', 'of'
];

/**
 * Extract monetary amount from SMS text
 * @param smsText - The SMS message text
 * @returns ExtractionResult with parsed amount
 */
export function extractAmount(smsText: string): ExtractionResult<number> {
  if (!smsText || typeof smsText !== 'string') {
    return {
      value: null,
      confidence: 0,
      extractedFrom: '',
      method: 'INVALID_INPUT'
    };
  }

  const normalizedText = smsText.trim();
  let bestMatch: { amount: number; confidence: number; extractedFrom: string; method: string } | null = null;

  // Try each pattern
  for (let i = 0; i < AMOUNT_PATTERNS.length; i++) {
    const pattern = AMOUNT_PATTERNS[i];
    const matches = Array.from(normalizedText.matchAll(pattern.pattern));

    for (const match of matches) {
      const amountStr = match[1];
      if (!amountStr) continue;

      const parsedAmount = parseAmountString(amountStr);
      if (parsedAmount === null || parsedAmount <= 0) continue;

      // Calculate confidence based on pattern quality and context
      const confidence = calculateAmountConfidence(
        match[0], 
        normalizedText, 
        i, 
        parsedAmount
      );

      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = {
          amount: parsedAmount,
          confidence,
          extractedFrom: match[0],
          method: `PATTERN_${i + 1}`
        };
      }
    }
  }

  if (bestMatch) {
    return {
      value: bestMatch.amount,
      confidence: bestMatch.confidence,
      extractedFrom: bestMatch.extractedFrom,
      method: bestMatch.method
    };
  }

  // Fallback: try to find any number that looks like an amount
  const fallbackResult = extractFallbackAmount(normalizedText);
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
 * Parse amount string to number, handling commas and decimals
 */
function parseAmountString(amountStr: string): number | null {
  if (!amountStr) return null;

  try {
    // Remove commas and parse
    const cleanAmount = amountStr.replace(/,/g, '');
    const parsed = parseFloat(cleanAmount);
    
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Calculate confidence score for amount extraction
 */
function calculateAmountConfidence(
  matchedText: string,
  fullText: string,
  patternIndex: number,
  amount: number
): number {
  let confidence = 0.5; // Base confidence

  // Pattern quality bonus
  if (patternIndex === 0) confidence += 0.3; // INR prefix patterns are most reliable
  else if (patternIndex === 1) confidence += 0.25; // Amount + currency suffix
  else if (patternIndex === 2) confidence += 0.2; // Keyword-based patterns
  else confidence += 0.1; // Fallback patterns

  // Context bonus - check for amount keywords nearby
  const contextWindow = getContextWindow(fullText, matchedText);
  const hasAmountKeywords = AMOUNT_KEYWORDS.some(keyword => 
    contextWindow.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (hasAmountKeywords) confidence += 0.15;

  // Amount reasonableness check
  if (amount >= 1 && amount <= 1000000) { // Reasonable transaction range
    confidence += 0.1;
  } else if (amount > 1000000) {
    confidence -= 0.2; // Very large amounts are less likely
  }

  // Decimal precision bonus
  if (matchedText.includes('.')) {
    confidence += 0.05;
  }

  return Math.min(confidence, 1.0);
}

/**
 * Get context window around matched text
 */
function getContextWindow(fullText: string, matchedText: string, windowSize: number = 50): string {
  const index = fullText.indexOf(matchedText);
  if (index === -1) return matchedText;

  const start = Math.max(0, index - windowSize);
  const end = Math.min(fullText.length, index + matchedText.length + windowSize);
  
  return fullText.substring(start, end);
}

/**
 * Fallback amount extraction for edge cases
 */
function extractFallbackAmount(text: string): ExtractionResult<number> | null {
  // Look for standalone numbers that might be amounts
  const numberPattern = /\b([0-9,]+(?:\.[0-9]{1,2})?)\b/g;
  const matches = Array.from(text.matchAll(numberPattern));
  
  for (const match of matches) {
    const amountStr = match[1];
    const amount = parseAmountString(amountStr);
    
    if (amount && amount >= 10 && amount <= 500000) { // Reasonable range
      // Check if it's likely an amount (not phone number, date, etc.)
      const context = getContextWindow(text, match[0]);
      const hasAmountContext = /(?:pay|spend|cost|price|bill|charge|debit|credit)/i.test(context);
      
      if (hasAmountContext) {
        return {
          value: amount,
          confidence: 0.3, // Low confidence for fallback
          extractedFrom: match[0],
          method: 'FALLBACK_NUMERIC'
        };
      }
    }
  }
  
  return null;
}

/**
 * Validate extracted amount
 */
export function validateAmount(amount: number | null): boolean {
  if (amount === null || amount === undefined) return false;
  if (typeof amount !== 'number') return false;
  if (isNaN(amount) || !isFinite(amount)) return false;
  if (amount <= 0) return false;
  if (amount > 10000000) return false; // 1 crore limit
  
  return true;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string = '₹'): string {
  if (!validateAmount(amount)) return 'Invalid Amount';
  
  return `${currency}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  })}`;
} 