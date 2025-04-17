/**
 * In-memory caching service inspired by large pharmacy sites like 1mg, PharmEasy and Netmeds
 * Allows the application to handle high traffic without overloading the database
 */

interface CacheItem<T> {
  data: T;
  expiry: number; // Timestamp when this item expires
}

interface Cache {
  [key: string]: CacheItem<any>;
}

class CacheService {
  private cache: Cache = {};
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly CATEGORY_TTL = 60 * 60 * 1000; // 1 hour for categories - rarely change
  private readonly PRODUCT_LIST_TTL = 10 * 60 * 1000; // 10 minutes for product lists
  private readonly PRODUCT_DETAIL_TTL = 30 * 60 * 1000; // 30 minutes for product details
  private readonly SEARCH_TTL = 5 * 60 * 1000; // 5 minutes for search results
  
  /**
   * Set a value in the cache with a given TTL
   * @param key Cache key
   * @param value Data to cache
   * @param ttl Time to live in milliseconds (optional)
   */
  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache[key] = { data: value, expiry };
    
    // Log cache operations in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Cache SET: ${key} (expires in ${ttl/1000}s)`);
    }
  }
  
  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache[key];
    
    // Not in cache
    if (!item) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Cache MISS: ${key}`);
      }
      return null;
    }
    
    // Expired
    if (Date.now() > item.expiry) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Cache EXPIRED: ${key}`);
      }
      delete this.cache[key];
      return null;
    }
    
    // Cache hit
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Cache HIT: ${key}`);
    }
    return item.data as T;
  }
  
  /**
   * Delete a specific key from the cache
   * @param key Cache key to delete
   */
  delete(key: string): void {
    delete this.cache[key];
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Cache DELETE: ${key}`);
    }
  }
  
  /**
   * Delete all keys that match a pattern
   * @param pattern String pattern to match keys against
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete = Object.keys(this.cache).filter(key => regex.test(key));
    
    keysToDelete.forEach(key => {
      delete this.cache[key];
    });
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Cache DELETE PATTERN: ${pattern} (deleted ${keysToDelete.length} keys)`);
    }
  }
  
  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache = {};
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Cache CLEARED`);
    }
  }
  
  /**
   * Get info about the current state of the cache
   */
  getCacheStats(): any {
    const now = Date.now();
    const totalItems = Object.keys(this.cache).length;
    const expiredItems = Object.values(this.cache).filter(item => now > item.expiry).length;
    const validItems = totalItems - expiredItems;
    
    return {
      totalItems,
      expiredItems,
      validItems,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // In MB
    };
  }
  
  /**
   * Helper for calculating TTL based on content type
   */
  getTTL(type: 'category' | 'product-list' | 'product-detail' | 'search' | 'default'): number {
    switch (type) {
      case 'category': return this.CATEGORY_TTL;
      case 'product-list': return this.PRODUCT_LIST_TTL;
      case 'product-detail': return this.PRODUCT_DETAIL_TTL;
      case 'search': return this.SEARCH_TTL;
      default: return this.defaultTTL;
    }
  }
}

// Create a singleton instance
const cacheService = new CacheService();

export default cacheService;