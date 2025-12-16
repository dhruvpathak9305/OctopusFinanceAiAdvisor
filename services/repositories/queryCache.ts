/**
 * =============================================================================
 * QUERY CACHE - LRU Cache for Database Query Results
 * =============================================================================
 * 
 * Implements LRU (Least Recently Used) cache for frequently accessed queries.
 * Reduces database load by caching query results with TTL-based expiration.
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheOptions {
  maxSize?: number; // Maximum number of entries
  defaultTTL?: number; // Default TTL in milliseconds
}

const DEFAULT_OPTIONS: Required<CacheOptions> = {
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
};

/**
 * Generate cache key from table name and filter
 */
export function generateCacheKey(tableName: string, filter?: any): string {
  const filterStr = filter ? JSON.stringify(filter) : 'all';
  return `${tableName}:${filterStr}`;
}

/**
 * LRU Cache implementation for query results
 */
export class QueryCache<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private defaultTTL: number;
  private accessOrder: string[]; // Track access order for LRU eviction
  private hits: number = 0;
  private misses: number = 0;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || DEFAULT_OPTIONS.maxSize;
    this.defaultTTL = options.defaultTTL || DEFAULT_OPTIONS.defaultTTL;
    this.cache = new Map();
    this.accessOrder = [];
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cached entry if valid
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.delete(key);
      this.misses++;
      return null;
    }

    // Update access order (move to end)
    this.updateAccessOrder(key);
    this.hits++;
    return entry.data;
  }

  /**
   * Set cache entry
   */
  set(key: string, data: T, ttl?: number): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    // Optionally reset stats, but keeping them for historical tracking
    // this.hits = 0;
    // this.misses = 0;
  }

  /**
   * Clear cache entries for a specific table
   */
  clearTable(tableName: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${tableName}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Get cache hit rate (percentage)
   */
  getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? (this.hits / total) * 100 : 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: number;
    hits: number;
    misses: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.getHitRate(),
      entries: this.cache.size,
      hits: this.hits,
      misses: this.misses,
    };
  }

  /**
   * Update access order for LRU tracking
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) {
      return;
    }

    const lruKey = this.accessOrder[0];
    this.delete(lruKey);
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
    return expiredKeys.length;
  }
}

/**
 * Global query cache instance
 */
let globalCache: QueryCache | null = null;

/**
 * Get or create global query cache instance
 */
export function getQueryCache(): QueryCache {
  if (!globalCache) {
    globalCache = new QueryCache();
  }
  return globalCache;
}

/**
 * Reset global cache (for testing)
 */
export function resetQueryCache(): void {
  globalCache = null;
}

