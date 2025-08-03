// Date Extractor - Extract transaction dates from SMS text
// Handles various date formats and patterns commonly found in SMS

import { ExtractionResult, DatePattern } from '../types';

// Common date patterns in SMS messages
const DATE_PATTERNS: DatePattern[] = [
  // DD/MM/YYYY and DD-MM-YYYY
  {
    pattern: /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g,
    format: 'DD/MM/YYYY',
    confidence: 0.9
  },
  // DD/MM/YY and DD-MM-YY
  {
    pattern: /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})\b/g,
    format: 'DD/MM/YY',
    confidence: 0.85
  },
  // DD MMM YYYY (e.g., 15 Jan 2024)
  {
    pattern: /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/gi,
    format: 'DD MMM YYYY',
    confidence: 0.95
  },
  // DD-MMM-YYYY (e.g., 15-Jan-2024)
  {
    pattern: /\b(\d{1,2})-+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-+(\d{4})\b/gi,
    format: 'DD-MMM-YYYY',
    confidence: 0.95
  },
  // MMM DD, YYYY (e.g., Jan 15, 2024)
  {
    pattern: /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})\b/gi,
    format: 'MMM DD, YYYY',
    confidence: 0.9
  },
  // YYYY-MM-DD (ISO format)
  {
    pattern: /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g,
    format: 'YYYY-MM-DD',
    confidence: 0.95
  },
  // DD.MM.YYYY
  {
    pattern: /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g,
    format: 'DD.MM.YYYY',
    confidence: 0.85
  },
  // Contextual date patterns
  {
    pattern: /(?:on|dated|dt\.?)\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/gi,
    format: 'Contextual DD/MM/YYYY',
    confidence: 0.9
  }
];

// Month name mappings
const MONTH_NAMES: Record<string, number> = {
  'jan': 1, 'january': 1,
  'feb': 2, 'february': 2,
  'mar': 3, 'march': 3,
  'apr': 4, 'april': 4,
  'may': 5,
  'jun': 6, 'june': 6,
  'jul': 7, 'july': 7,
  'aug': 8, 'august': 8,
  'sep': 9, 'september': 9,
  'oct': 10, 'october': 10,
  'nov': 11, 'november': 11,
  'dec': 12, 'december': 12
};

// Keywords that typically precede dates
const DATE_KEYWORDS = [
  'on', 'dated', 'dt', 'date', 'transaction date', 'txn date', 'processed on'
];

/**
 * Extract transaction date from SMS text
 * @param smsText - The SMS message text
 * @returns ExtractionResult with parsed date
 */
export function extractDate(smsText: string): ExtractionResult<Date> {
  if (!smsText || typeof smsText !== 'string') {
    return {
      value: null,
      confidence: 0,
      extractedFrom: '',
      method: 'INVALID_INPUT'
    };
  }

  const normalizedText = smsText.trim();
  let bestMatch: { 
    date: Date; 
    confidence: number; 
    extractedFrom: string; 
    method: string 
  } | null = null;

  // Try each date pattern
  for (let i = 0; i < DATE_PATTERNS.length; i++) {
    const datePattern = DATE_PATTERNS[i];
    const matches = Array.from(normalizedText.matchAll(datePattern.pattern));

    for (const match of matches) {
      const parsedDate = parseDateFromMatch(match, datePattern.format);
      if (!parsedDate || !isValidDate(parsedDate)) continue;

      const confidence = calculateDateConfidence(
        match[0],
        normalizedText,
        datePattern,
        parsedDate
      );

      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = {
          date: parsedDate,
          confidence,
          extractedFrom: match[0],
          method: `PATTERN_${datePattern.format}`
        };
      }
    }
  }

  if (bestMatch) {
    return {
      value: bestMatch.date,
      confidence: bestMatch.confidence,
      extractedFrom: bestMatch.extractedFrom,
      method: bestMatch.method
    };
  }

  // Fallback: use current date if no date found but SMS seems recent
  const fallbackResult = getFallbackDate(normalizedText);
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
 * Parse date from regex match based on format
 */
function parseDateFromMatch(match: RegExpMatchArray, format: string): Date | null {
  try {
    switch (format) {
      case 'DD/MM/YYYY':
      case 'DD.MM.YYYY':
      case 'Contextual DD/MM/YYYY':
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      
      case 'DD/MM/YY':
        const year = parseInt(match[3]);
        const fullYear = year < 50 ? 2000 + year : 1900 + year; // Assume 00-49 is 2000s, 50-99 is 1900s
        return new Date(fullYear, parseInt(match[2]) - 1, parseInt(match[1]));
      
      case 'DD MMM YYYY':
      case 'DD-MMM-YYYY':
        const month = MONTH_NAMES[match[2].toLowerCase()];
        if (!month) return null;
        return new Date(parseInt(match[3]), month - 1, parseInt(match[1]));
      
      case 'MMM DD, YYYY':
        const monthName = MONTH_NAMES[match[1].toLowerCase()];
        if (!monthName) return null;
        return new Date(parseInt(match[3]), monthName - 1, parseInt(match[2]));
      
      case 'YYYY-MM-DD':
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Validate if date is reasonable for a transaction
 */
function isValidDate(date: Date): boolean {
  if (!date || isNaN(date.getTime())) return false;
  
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Date should be within reasonable range (1 year ago to 1 week from now)
  return date >= oneYearAgo && date <= oneWeekFromNow;
}

/**
 * Calculate confidence score for date extraction
 */
function calculateDateConfidence(
  matchedText: string,
  fullText: string,
  pattern: DatePattern,
  date: Date
): number {
  let confidence = pattern.confidence;

  // Context bonus - check for date keywords nearby
  const contextWindow = getContextWindow(fullText, matchedText);
  const hasDateKeywords = DATE_KEYWORDS.some(keyword => 
    contextWindow.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (hasDateKeywords) confidence += 0.1;

  // Recency bonus - more recent dates are more likely to be transaction dates
  const now = new Date();
  const daysDiff = Math.abs((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 7) confidence += 0.1; // Within a week
  else if (daysDiff <= 30) confidence += 0.05; // Within a month
  else if (daysDiff > 365) confidence -= 0.2; // More than a year old

  // Format quality bonus
  if (pattern.format.includes('MMM')) confidence += 0.05; // Month names are clearer
  if (pattern.format.includes('YYYY')) confidence += 0.05; // Full year is clearer

  return Math.min(confidence, 1.0);
}

/**
 * Get context window around matched text
 */
function getContextWindow(fullText: string, matchedText: string, windowSize: number = 20): string {
  const index = fullText.indexOf(matchedText);
  if (index === -1) return matchedText;

  const start = Math.max(0, index - windowSize);
  const end = Math.min(fullText.length, index + matchedText.length + windowSize);
  
  return fullText.substring(start, end);
}

/**
 * Get fallback date when no explicit date is found
 */
function getFallbackDate(text: string): ExtractionResult<Date> | null {
  // Check for time-related keywords that suggest recent transaction
  const recentKeywords = ['today', 'now', 'just', 'recent', 'latest', 'current'];
  const hasRecentKeywords = recentKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );

  if (hasRecentKeywords) {
    return {
      value: new Date(), // Current date
      confidence: 0.3, // Low confidence for fallback
      extractedFrom: 'recent keywords',
      method: 'FALLBACK_CURRENT_DATE'
    };
  }

  // Check for time patterns (HH:MM) which might indicate today's transaction
  const timePattern = /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/g;
  const timeMatches = Array.from(text.matchAll(timePattern));
  
  if (timeMatches.length > 0) {
    const timeMatch = timeMatches[0];
    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      const today = new Date();
      today.setHours(hours, minutes, 0, 0);
      
      return {
        value: today,
        confidence: 0.4,
        extractedFrom: timeMatch[0],
        method: 'FALLBACK_TIME_TODAY'
      };
    }
  }

  return null;
}

/**
 * Extract multiple potential dates (for ambiguous cases)
 */
export function extractMultipleDates(smsText: string): ExtractionResult<Date>[] {
  const results: ExtractionResult<Date>[] = [];
  
  for (let i = 0; i < DATE_PATTERNS.length; i++) {
    const datePattern = DATE_PATTERNS[i];
    const matches = Array.from(smsText.matchAll(datePattern.pattern));
    
    for (const match of matches) {
      const parsedDate = parseDateFromMatch(match, datePattern.format);
      if (!parsedDate || !isValidDate(parsedDate)) continue;
      
      const confidence = calculateDateConfidence(
        match[0],
        smsText,
        datePattern,
        parsedDate
      );
      
      if (confidence > 0.3) { // Minimum threshold
        results.push({
          value: parsedDate,
          confidence,
          extractedFrom: match[0],
          method: `PATTERN_${datePattern.format}`
        });
      }
    }
  }
  
  // Remove duplicates (same date) and sort by confidence
  const uniqueResults = results.filter((result, index, self) => 
    index === self.findIndex(r => 
      r.value && result.value && 
      r.value.toDateString() === result.value.toDateString()
    )
  );
  
  return uniqueResults.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
}

/**
 * Validate date extraction result
 */
export function validateDate(date: Date | null): boolean {
  if (!date) return false;
  return isValidDate(date);
}

/**
 * Format date for display
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'iso' = 'short'): string {
  if (!validateDate(date)) return 'Invalid Date';
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-IN');
    case 'long':
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'iso':
      return date.toISOString().split('T')[0];
    default:
      return date.toLocaleDateString('en-IN');
  }
} 