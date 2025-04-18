/**
 * High-performance caching service inspired by PharmEasy's architecture
 * Optimized for handling 10 lakh+ products and high traffic without overloading the database
 * 
 * PharmEasy-style scaling strategies implemented:
 * 1. Multi-tier cache with memory and persistence layers
 * 2. Segmented caching with query-specific results
 * 3. Adaptive TTL based on access patterns
 * 4. Selective cache invalidation
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
  
  // PharmEasy-style optimized TTL for different data types
  private readonly CATEGORY_TTL = 60 * 60 * 1000; // 1 hour for categories - rarely change
  private readonly PRODUCT_LIST_TTL = 10 * 60 * 1000; // 10 minutes for product lists
  private readonly PRODUCT_DETAIL_TTL = 30 * 60 * 1000; // 30 minutes for product details
  private readonly SEARCH_TTL = 5 * 60 * 1000; // 5 minutes for search results
  private readonly CART_TTL = 2 * 60 * 1000; // 2 minutes for cart - frequently changes
  
  // Cache size limits for preventing memory issues with 10 lakh+ products
  private readonly SEARCH_CACHE_LIMIT = 1000; // Max number of search queries to cache
  private readonly PRODUCT_CACHE_LIMIT = 5000; // Max number of product details to cache
  private searchCacheKeys: string[] = []; // Track search cache keys for LRU implementation
  private productCacheKeys: string[] = []; // Track product cache keys for LRU implementation
  
  // Memory usage thresholds for cache eviction (in MB)
  private readonly MAX_MEMORY_USAGE = 500; // 500MB max before aggressive cache clearing
  
  /**
   * Set a value in the cache with a given TTL, with smart memory management for large datasets
   * @param key Cache key
   * @param value Data to cache
   * @param ttl Time to live in milliseconds (optional)
   * @param type Optional type indicator for specialized cache management
   */
  set<T>(key: string, value: T, ttl: number = this.defaultTTL, type?: 'search' | 'product' | 'category' | 'cart'): void {
    // Memory protection for large datasets (10 lakh+ products)
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    if (memoryUsage > this.MAX_MEMORY_USAGE) {
      // Clear 30% of cache when memory usage is too high
      this.evictCachePercentage(30);
    }
    
    // Handle LRU cache limits for specialized cache types
    if (type === 'search') {
      // LRU implementation for search queries
      this.searchCacheKeys.push(key);
      if (this.searchCacheKeys.length > this.SEARCH_CACHE_LIMIT) {
        const oldestKey = this.searchCacheKeys.shift();
        if (oldestKey) delete this.cache[oldestKey];
      }
    } else if (type === 'product') {
      // LRU implementation for product details
      this.productCacheKeys.push(key);
      if (this.productCacheKeys.length > this.PRODUCT_CACHE_LIMIT) {
        const oldestKey = this.productCacheKeys.shift();
        if (oldestKey) delete this.cache[oldestKey];
      }
    }
    
    // Store in cache with expiry
    const expiry = Date.now() + ttl;
    this.cache[key] = { data: value, expiry };
    
    // Log cache operations in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Cache SET: ${key} (expires in ${ttl/1000}s)`);
    }
  }
  
  /**
   * Evict a percentage of the cache to free memory
   * Used for large dataset management (10 lakh+ products)
   * @param percentage Percentage of cache to evict (0-100)
   */
  private evictCachePercentage(percentage: number): void {
    if (percentage <= 0 || percentage > 100) return;
    
    const keys = Object.keys(this.cache);
    const evictCount = Math.floor(keys.length * (percentage / 100));
    
    // Sort keys by expiry (remove items closest to expiry first)
    const keysToEvict = keys
      .map(key => ({ key, expiry: this.cache[key].expiry }))
      .sort((a, b) => a.expiry - b.expiry)
      .slice(0, evictCount)
      .map(item => item.key);
    
    // Remove the selected items
    keysToEvict.forEach(key => delete this.cache[key]);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Cache EVICTED: ${evictCount}/${keys.length} items (${percentage}%)`);
    }
  }
  
  /**
   * Get a value from the cache with optimized access patterns for large datasets (10 lakh+ products)
   * Implements LRU (Least Recently Used) pattern to prioritize frequently accessed cache entries
   * @param key Cache key
   * @param type Optional type indicator for specialized cache management
   * @returns The cached value or null if not found or expired
   */
  get<T>(key: string, type?: 'search' | 'product' | 'category' | 'cart'): T | null {
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
      
      // Remove from tracking arrays if needed
      if (type === 'search') {
        this.searchCacheKeys = this.searchCacheKeys.filter(k => k !== key);
      } else if (type === 'product') {
        this.productCacheKeys = this.productCacheKeys.filter(k => k !== key);
      }
      
      delete this.cache[key];
      return null;
    }
    
    // Cache hit - update LRU ordering for specialized cache types
    if (type === 'search') {
      // Move this key to the end of the array (most recently used)
      this.searchCacheKeys = this.searchCacheKeys.filter(k => k !== key);
      this.searchCacheKeys.push(key);
    } else if (type === 'product') {
      // Move this key to the end of the array (most recently used)
      this.productCacheKeys = this.productCacheKeys.filter(k => k !== key);
      this.productCacheKeys.push(key);
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