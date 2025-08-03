// Merchant Matcher - Normalize and match merchant names
// Handles aliases, patterns, and fuzzy matching for merchant identification

import { MerchantPattern, MerchantMatchResult } from '../types';

export class MerchantMatcher {
  private merchantPatterns: MerchantPattern[];
  private aliasMap: Map<string, string>;
  private domainMap: Map<string, string>;

  constructor(merchantPatterns: MerchantPattern[]) {
    this.merchantPatterns = merchantPatterns;
    this.aliasMap = this.buildAliasMap();
    this.domainMap = this.buildDomainMap();
  }

  /**
   * Normalize merchant name using patterns and aliases
   */
  public normalizeMerchant(rawMerchant: string | null): MerchantMatchResult {
    if (!rawMerchant || typeof rawMerchant !== 'string') {
      return this.createEmptyResult();
    }

    const cleanMerchant = this.cleanMerchantName(rawMerchant);
    if (!cleanMerchant) {
      return this.createEmptyResult();
    }

    // Try different matching strategies in order of reliability
    const strategies = [
      () => this.exactPatternMatch(cleanMerchant),
      () => this.aliasMatch(cleanMerchant),
      () => this.domainMatch(cleanMerchant),
      () => this.fuzzyPatternMatch(cleanMerchant),
      () => this.fallbackMatch(cleanMerchant)
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
   * Get all possible merchant matches with confidence scores
   */
  public getAllMatches(rawMerchant: string): MerchantMatchResult[] {
    if (!rawMerchant) return [];

    const cleanMerchant = this.cleanMerchantName(rawMerchant);
    if (!cleanMerchant) return [];

    const results: MerchantMatchResult[] = [];

    // Try all strategies
    results.push(this.exactPatternMatch(cleanMerchant));
    results.push(this.aliasMatch(cleanMerchant));
    results.push(this.domainMatch(cleanMerchant));
    results.push(this.fuzzyPatternMatch(cleanMerchant));

    // Filter out empty results and sort by confidence
    return results
      .filter(result => result.confidence > 0)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Add new merchant pattern
   */
  public addMerchantPattern(pattern: MerchantPattern): void {
    this.merchantPatterns.push(pattern);
    this.rebuildMaps();
  }

  /**
   * Update merchant patterns
   */
  public updatePatterns(patterns: MerchantPattern[]): void {
    this.merchantPatterns = patterns;
    this.rebuildMaps();
  }

  /**
   * Get merchant suggestions for partial input
   */
  public getSuggestions(partialMerchant: string, limit: number = 5): string[] {
    if (!partialMerchant || partialMerchant.length < 2) return [];

    const suggestions = new Set<string>();
    const lowerPartial = partialMerchant.toLowerCase();

    // Check pattern names
    for (const pattern of this.merchantPatterns) {
      if (pattern.name.toLowerCase().includes(lowerPartial)) {
        suggestions.add(pattern.name);
      }

      // Check aliases
      for (const alias of pattern.aliases) {
        if (alias.toLowerCase().includes(lowerPartial)) {
          suggestions.add(pattern.name);
        }
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Exact pattern matching
   */
  private exactPatternMatch(merchant: string): MerchantMatchResult {
    const lowerMerchant = merchant.toLowerCase();

    for (const pattern of this.merchantPatterns) {
      // Check exact name match
      if (pattern.name.toLowerCase() === lowerMerchant) {
        return {
          name: merchant,
          normalizedName: pattern.name,
          category: pattern.category,
          subcategory: pattern.subcategory,
          confidence: 0.95,
          matchedBy: 'EXACT_MATCH'
        };
      }

      // Check regex patterns
      for (const regex of pattern.patterns) {
        if (regex.test(merchant)) {
          return {
            name: merchant,
            normalizedName: pattern.name,
            category: pattern.category,
            subcategory: pattern.subcategory,
            confidence: pattern.confidence * 0.9, // Slightly lower for regex
            matchedBy: 'PATTERN_MATCH'
          };
        }
      }
    }

    return this.createEmptyResult();
  }

  /**
   * Alias matching
   */
  private aliasMatch(merchant: string): MerchantMatchResult {
    const lowerMerchant = merchant.toLowerCase();

    for (const pattern of this.merchantPatterns) {
      for (const alias of pattern.aliases) {
        if (alias.toLowerCase() === lowerMerchant || 
            lowerMerchant.includes(alias.toLowerCase())) {
          return {
            name: merchant,
            normalizedName: pattern.name,
            category: pattern.category,
            subcategory: pattern.subcategory,
            confidence: pattern.confidence * 0.85,
            matchedBy: 'ALIAS_MATCH'
          };
        }
      }
    }

    return this.createEmptyResult();
  }

  /**
   * Domain/website matching
   */
  private domainMatch(merchant: string): MerchantMatchResult {
    const lowerMerchant = merchant.toLowerCase();

    // Check if it's a domain
    const domainPattern = /([a-zA-Z0-9\-]+)\.(?:com|in|org|net|co\.in)/i;
    const domainMatch = merchant.match(domainPattern);

    if (domainMatch) {
      const domain = domainMatch[1].toLowerCase();
      const normalizedName = this.domainMap.get(domain);

      if (normalizedName) {
        const pattern = this.merchantPatterns.find(p => p.name === normalizedName);
        return {
          name: merchant,
          normalizedName: normalizedName,
          category: pattern?.category,
          subcategory: pattern?.subcategory,
          confidence: 0.8,
          matchedBy: 'PATTERN_MATCH'
        };
      }

      // Fallback: capitalize domain name
      return {
        name: merchant,
        normalizedName: this.capitalizeName(domain),
        confidence: 0.6,
        matchedBy: 'PATTERN_MATCH'
      };
    }

    return this.createEmptyResult();
  }

  /**
   * Fuzzy pattern matching
   */
  private fuzzyPatternMatch(merchant: string): MerchantMatchResult {
    const lowerMerchant = merchant.toLowerCase();
    let bestMatch: MerchantMatchResult = this.createEmptyResult();

    for (const pattern of this.merchantPatterns) {
      // Check if merchant contains pattern name
      if (lowerMerchant.includes(pattern.name.toLowerCase()) ||
          pattern.name.toLowerCase().includes(lowerMerchant)) {
        
        const similarity = this.calculateSimilarity(lowerMerchant, pattern.name.toLowerCase());
        const confidence = similarity * pattern.confidence * 0.7; // Lower confidence for fuzzy

        if (confidence > bestMatch.confidence) {
          bestMatch = {
            name: merchant,
            normalizedName: pattern.name,
            category: pattern.category,
            subcategory: pattern.subcategory,
            confidence,
            matchedBy: 'FUZZY_MATCH'
          };
        }
      }

      // Check aliases with fuzzy matching
      for (const alias of pattern.aliases) {
        if (lowerMerchant.includes(alias.toLowerCase()) ||
            alias.toLowerCase().includes(lowerMerchant)) {
          
          const similarity = this.calculateSimilarity(lowerMerchant, alias.toLowerCase());
          const confidence = similarity * pattern.confidence * 0.6;

          if (confidence > bestMatch.confidence) {
            bestMatch = {
              name: merchant,
              normalizedName: pattern.name,
              category: pattern.category,
              subcategory: pattern.subcategory,
              confidence,
              matchedBy: 'FUZZY_MATCH'
            };
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * Fallback matching for unknown merchants
   */
  private fallbackMatch(merchant: string): MerchantMatchResult {
    return {
      name: merchant,
      normalizedName: this.capitalizeName(merchant),
      confidence: 0.3, // Low confidence for unknown merchants
      matchedBy: 'FALLBACK'
    };
  }

  /**
   * Clean and normalize merchant name
   */
  private cleanMerchantName(rawMerchant: string): string {
    if (!rawMerchant) return '';

    let cleaned = rawMerchant.trim();
    
    // Remove common prefixes/suffixes
    cleaned = cleaned.replace(/^(www\.|https?:\/\/)/i, '');
    cleaned = cleaned.replace(/\.(com|in|org|net|co\.in)$/i, '');
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Remove trailing punctuation
    cleaned = cleaned.replace(/[.,;:!?]+$/, '');
    
    // Remove common SMS artifacts
    cleaned = cleaned.replace(/[*#]/g, '');

    return cleaned;
  }

  /**
   * Capitalize merchant name properly
   */
  private capitalizeName(name: string): string {
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Calculate similarity between two strings (simple implementation)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Build alias map for quick lookups
   */
  private buildAliasMap(): Map<string, string> {
    const map = new Map<string, string>();
    
    for (const pattern of this.merchantPatterns) {
      for (const alias of pattern.aliases) {
        map.set(alias.toLowerCase(), pattern.name);
      }
    }
    
    return map;
  }

  /**
   * Build domain map for website matching
   */
  private buildDomainMap(): Map<string, string> {
    const map = new Map<string, string>();
    
    // Common domain mappings
    map.set('amazon', 'Amazon');
    map.set('flipkart', 'Flipkart');
    map.set('myntra', 'Myntra');
    map.set('zomato', 'Zomato');
    map.set('swiggy', 'Swiggy');
    map.set('uber', 'Uber');
    map.set('ola', 'Ola');
    map.set('paytm', 'Paytm');
    map.set('phonepe', 'PhonePe');
    map.set('googlepay', 'Google Pay');
    map.set('netflix', 'Netflix');
    map.set('spotify', 'Spotify');
    map.set('hotstar', 'Disney+ Hotstar');
    
    // Add patterns that have domain-like aliases
    for (const pattern of this.merchantPatterns) {
      for (const alias of pattern.aliases) {
        if (alias.includes('.') || alias.match(/^[a-zA-Z0-9\-]+$/)) {
          map.set(alias.toLowerCase().replace(/\.(com|in|org|net)$/, ''), pattern.name);
        }
      }
    }
    
    return map;
  }

  /**
   * Rebuild maps after pattern updates
   */
  private rebuildMaps(): void {
    this.aliasMap = this.buildAliasMap();
    this.domainMap = this.buildDomainMap();
  }

  /**
   * Create empty result
   */
  private createEmptyResult(): MerchantMatchResult {
    return {
      name: '',
      normalizedName: '',
      confidence: 0,
      matchedBy: 'FALLBACK'
    };
  }

  /**
   * Get statistics about merchant patterns
   */
  public getStats(): {
    totalPatterns: number;
    totalAliases: number;
    categoryCoverage: string[];
  } {
    const categories = new Set(
      this.merchantPatterns
        .map(p => p.category)
        .filter(Boolean) as string[]
    );

    const totalAliases = this.merchantPatterns.reduce(
      (sum, pattern) => sum + pattern.aliases.length, 
      0
    );

    return {
      totalPatterns: this.merchantPatterns.length,
      totalAliases,
      categoryCoverage: Array.from(categories)
    };
  }
} 