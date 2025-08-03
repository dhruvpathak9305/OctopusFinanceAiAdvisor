// Merchant Extractor - Extract merchant/vendor names from SMS text
// Handles various SMS formats and merchant name patterns

import { ExtractionResult } from '../types';

// Common merchant extraction patterns
const MERCHANT_PATTERNS = [
  // "at [merchant]" patterns
  /\bat\s+([A-Za-z0-9\s\.\-_&]+?)(?:\s+(?:on|for|via|using|through|dated|dt)|\s*$)/gi,
  
  // "from [merchant]" patterns  
  /\bfrom\s+([A-Za-z0-9\s\.\-_&]+?)(?:\s+(?:on|for|via|using|through|dated|dt)|\s*$)/gi,
  
  // "to [merchant]" patterns
  /\bto\s+([A-Za-z0-9\s\.\-_&]+?)(?:\s+(?:on|for|via|using|through|dated|dt)|\s*$)/gi,
  
  // "paid to [merchant]" patterns
  /\bpaid\s+to\s+([A-Za-z0-9\s\.\-_&]+?)(?:\s+(?:on|for|via|using|through|dated|dt)|\s*$)/gi,
  
  // "spent at [merchant]" patterns
  /\bspent\s+at\s+([A-Za-z0-9\s\.\-_&]+?)(?:\s+(?:on|for|via|using|through|dated|dt)|\s*$)/gi,
  
  // "purchase at [merchant]" patterns
  /\bpurchase\s+at\s+([A-Za-z0-9\s\.\-_&]+?)(?:\s+(?:on|for|via|using|through|dated|dt)|\s*$)/gi,
  
  // "transaction at [merchant]" patterns
  /\btransaction\s+at\s+([A-Za-z0-9\s\.\-_&]+?)(?:\s+(?:on|for|via|using|through|dated|dt)|\s*$)/gi,
  
  // "debited by [merchant]" patterns
  /\bdebited\s+by\s+([A-Za-z0-9\s\.\-_&]+?)(?:\s+(?:on|for|via|using|through|dated|dt)|\s*$)/gi,
  
  // "charged by [merchant]" patterns
  /\bcharged\s+by\s+([A-Za-z0-9\s\.\-_&]+?)(?:\s+(?:on|for|via|using|through|dated|dt)|\s*$)/gi,
  
  // UPI patterns - "UPI/[merchant]"
  /\bUPI\/([A-Za-z0-9\s\.\-_&]+?)(?:\/|\s|$)/gi,
  
  // Website/domain patterns
  /\b([a-zA-Z0-9\-]+\.(?:com|in|org|net|co\.in))\b/gi,
  
  // Merchant code patterns (fallback)
  /\b([A-Z]{3,}[0-9A-Z]*)\b/g
];

// Keywords that typically precede merchant names
const MERCHANT_KEYWORDS = [
  'at', 'from', 'to', 'paid to', 'spent at', 'purchase at', 
  'transaction at', 'debited by', 'charged by', 'via', 'through'
];

// Common non-merchant words to filter out
const EXCLUDE_WORDS = [
  'bank', 'card', 'account', 'transaction', 'payment', 'debit', 'credit',
  'amount', 'balance', 'available', 'limit', 'date', 'time', 'sms', 'alert',
  'notification', 'service', 'charges', 'fee', 'interest', 'minimum', 'due',
  'statement', 'bill', 'invoice', 'receipt', 'confirmation', 'reference',
  'number', 'code', 'id', 'ref', 'txn', 'utr', 'rrn', 'auth', 'approval',
  'successful', 'failed', 'pending', 'processed', 'completed', 'cancelled',
  'declined', 'expired', 'invalid', 'error', 'please', 'contact', 'call',
  'visit', 'website', 'app', 'mobile', 'online', 'internet', 'digital',
  'thank', 'you', 'thanks', 'regards', 'team', 'customer', 'support',
  'help', 'desk', 'center', 'centre'
];

/**
 * Extract merchant name from SMS text
 * @param smsText - The SMS message text
 * @returns ExtractionResult with merchant name
 */
export function extractMerchant(smsText: string): ExtractionResult<string> {
  if (!smsText || typeof smsText !== 'string') {
    return {
      value: null,
      confidence: 0,
      extractedFrom: '',
      method: 'INVALID_INPUT'
    };
  }

  const normalizedText = smsText.trim();
  let bestMatch: { merchant: string; confidence: number; extractedFrom: string; method: string } | null = null;

  // Try each pattern
  for (let i = 0; i < MERCHANT_PATTERNS.length; i++) {
    const pattern = MERCHANT_PATTERNS[i];
    const matches = Array.from(normalizedText.matchAll(pattern));

    for (const match of matches) {
      const rawMerchant = match[1];
      if (!rawMerchant) continue;

      const cleanedMerchant = cleanMerchantName(rawMerchant);
      if (!cleanedMerchant || !isValidMerchant(cleanedMerchant)) continue;

      const confidence = calculateMerchantConfidence(
        cleanedMerchant,
        match[0],
        normalizedText,
        i
      );

      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = {
          merchant: cleanedMerchant,
          confidence,
          extractedFrom: match[0],
          method: `PATTERN_${i + 1}`
        };
      }
    }
  }

  if (bestMatch) {
    return {
      value: bestMatch.merchant,
      confidence: bestMatch.confidence,
      extractedFrom: bestMatch.extractedFrom,
      method: bestMatch.method
    };
  }

  // Fallback: try to extract any capitalized words that might be merchants
  const fallbackResult = extractFallbackMerchant(normalizedText);
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
 * Clean and normalize merchant name
 */
function cleanMerchantName(rawMerchant: string): string {
  if (!rawMerchant) return '';

  let cleaned = rawMerchant.trim();
  
  // Remove common prefixes/suffixes
  cleaned = cleaned.replace(/^(www\.|https?:\/\/)/i, '');
  cleaned = cleaned.replace(/\.(com|in|org|net|co\.in)$/i, '');
  
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Remove trailing punctuation
  cleaned = cleaned.replace(/[.,;:!?]+$/, '');
  
  // Capitalize properly
  cleaned = cleaned.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return cleaned;
}

/**
 * Validate if extracted text is likely a merchant name
 */
function isValidMerchant(merchant: string): boolean {
  if (!merchant || merchant.length < 2) return false;
  if (merchant.length > 50) return false; // Too long to be a merchant name
  
  // Check if it's in exclude list
  const lowerMerchant = merchant.toLowerCase();
  if (EXCLUDE_WORDS.some(word => lowerMerchant.includes(word))) {
    return false;
  }
  
  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(merchant)) return false;
  
  // Should not be all numbers
  if (/^\d+$/.test(merchant)) return false;
  
  // Should not be a date pattern
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(merchant)) return false;
  
  // Should not be a time pattern
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(merchant)) return false;
  
  return true;
}

/**
 * Calculate confidence score for merchant extraction
 */
function calculateMerchantConfidence(
  merchant: string,
  matchedText: string,
  fullText: string,
  patternIndex: number
): number {
  let confidence = 0.4; // Base confidence

  // Pattern quality bonus
  if (patternIndex <= 2) confidence += 0.3; // "at", "from", "to" patterns are most reliable
  else if (patternIndex <= 6) confidence += 0.25; // Transaction-specific patterns
  else if (patternIndex <= 8) confidence += 0.2; // Debit/charge patterns
  else if (patternIndex === 9) confidence += 0.35; // UPI patterns are very reliable
  else if (patternIndex === 10) confidence += 0.3; // Website patterns
  else confidence += 0.1; // Fallback patterns

  // Merchant name quality bonus
  if (merchant.length >= 3 && merchant.length <= 20) confidence += 0.1;
  if (/^[A-Z]/.test(merchant)) confidence += 0.05; // Starts with capital
  if (merchant.includes('.')) confidence += 0.1; // Likely a website
  
  // Context bonus
  const contextWindow = getContextWindow(fullText, matchedText);
  const hasTransactionKeywords = /(?:transaction|payment|purchase|spent|paid|debit|credit)/i.test(contextWindow);
  if (hasTransactionKeywords) confidence += 0.1;

  // Penalty for very common/generic words
  const genericWords = ['store', 'shop', 'mart', 'center', 'service'];
  if (genericWords.some(word => merchant.toLowerCase().includes(word))) {
    confidence -= 0.1;
  }

  return Math.min(confidence, 1.0);
}

/**
 * Get context window around matched text
 */
function getContextWindow(fullText: string, matchedText: string, windowSize: number = 30): string {
  const index = fullText.indexOf(matchedText);
  if (index === -1) return matchedText;

  const start = Math.max(0, index - windowSize);
  const end = Math.min(fullText.length, index + matchedText.length + windowSize);
  
  return fullText.substring(start, end);
}

/**
 * Fallback merchant extraction for edge cases
 */
function extractFallbackMerchant(text: string): ExtractionResult<string> | null {
  // Look for capitalized words that might be merchant names
  const capitalizedPattern = /\b([A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]+)*)\b/g;
  const matches = Array.from(text.matchAll(capitalizedPattern));
  
  for (const match of matches) {
    const potential = match[1];
    if (isValidMerchant(potential)) {
      // Check if it appears in a transaction context
      const context = getContextWindow(text, match[0]);
      const hasTransactionContext = /(?:pay|spend|buy|purchase|transaction|debit|credit)/i.test(context);
      
      if (hasTransactionContext) {
        return {
          value: cleanMerchantName(potential),
          confidence: 0.3, // Low confidence for fallback
          extractedFrom: match[0],
          method: 'FALLBACK_CAPITALIZED'
        };
      }
    }
  }
  
  return null;
}

/**
 * Extract multiple potential merchants (for ambiguous cases)
 */
export function extractMultipleMerchants(smsText: string): ExtractionResult<string>[] {
  const results: ExtractionResult<string>[] = [];
  
  for (let i = 0; i < MERCHANT_PATTERNS.length; i++) {
    const pattern = MERCHANT_PATTERNS[i];
    const matches = Array.from(smsText.matchAll(pattern));
    
    for (const match of matches) {
      const rawMerchant = match[1];
      if (!rawMerchant) continue;
      
      const cleanedMerchant = cleanMerchantName(rawMerchant);
      if (!cleanedMerchant || !isValidMerchant(cleanedMerchant)) continue;
      
      const confidence = calculateMerchantConfidence(
        cleanedMerchant,
        match[0],
        smsText,
        i
      );
      
      if (confidence > 0.2) { // Minimum threshold
        results.push({
          value: cleanedMerchant,
          confidence,
          extractedFrom: match[0],
          method: `PATTERN_${i + 1}`
        });
      }
    }
  }
  
  // Remove duplicates and sort by confidence
  const uniqueResults = results.filter((result, index, self) => 
    index === self.findIndex(r => r.value === result.value)
  );
  
  return uniqueResults.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
}

/**
 * Validate merchant extraction result
 */
export function validateMerchant(merchant: string | null): boolean {
  if (!merchant) return false;
  return isValidMerchant(merchant);
} 