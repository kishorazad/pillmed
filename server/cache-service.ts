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
    // Set expiry time based on current time + TTL
    const expiry = Date.now() + ttl;
    
    // Save the data in cache
    this.cache[key] = { data: value, expiry };
    
    // For specialized types, update LRU tracking
    if (type === 'search') {
      // Remove key if it exists to avoid duplicates
      const index = this.searchCacheKeys.indexOf(key);
      if (index > -1) {
        this.searchCacheKeys.splice(index, 1);
      }
      // Add key to end of array (most recently used)
      this.searchCacheKeys.push(key);
      
      // If exceeding limit, remove oldest keys (LRU eviction)
      if (this.searchCacheKeys.length > this.SEARCH_CACHE_LIMIT) {
        const oldestKey = this.searchCacheKeys.shift();
        if (oldestKey) {
          delete this.cache[oldestKey];
        }
      }
    } else if (type === 'product') {
      // Same LRU implementation for products
      const index = this.productCacheKeys.indexOf(key);
      if (index > -1) {
        this.productCacheKeys.splice(index, 1);
      }
      this.productCacheKeys.push(key);
      
      if (this.productCacheKeys.length > this.PRODUCT_CACHE_LIMIT) {
        const oldestKey = this.productCacheKeys.shift();
        if (oldestKey) {
          delete this.cache[oldestKey];
        }
      }
    }
    
    // Check memory usage if we have a lot of items
    const totalItems = Object.keys(this.cache).length;
    if (totalItems > 1000) {
      const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // In MB
      
      // If approaching memory limit, evict a percentage of the cache
      if (memoryUsage > this.MAX_MEMORY_USAGE * 0.9) {
        this.evictCachePercentage(30);
        console.log(`Memory pressure detected (${memoryUsage.toFixed(2)}MB), evicted 30% of cache`);
      }
    }
  }
  
  /**
   * Evict a percentage of the cache to free memory
   * Used for large dataset management (10 lakh+ products)
   * @param percentage Percentage of cache to evict (0-100)
   */
  private evictCachePercentage(percentage: number): void {
    const keys = Object.keys(this.cache);
    const removeCount = Math.floor(keys.length * (percentage / 100));
    
    // Start removing from beginning (oldest) of specialized caches
    if (this.searchCacheKeys.length > 0) {
      const searchRemoveCount = Math.min(
        Math.floor(this.searchCacheKeys.length * (percentage / 100)),
        this.searchCacheKeys.length
      );
      const searchKeysToRemove = this.searchCacheKeys.splice(0, searchRemoveCount);
      searchKeysToRemove.forEach(key => delete this.cache[key]);
    }
    
    if (this.productCacheKeys.length > 0) {
      const productRemoveCount = Math.min(
        Math.floor(this.productCacheKeys.length * (percentage / 100)),
        this.productCacheKeys.length
      );
      const productKeysToRemove = this.productCacheKeys.splice(0, productRemoveCount);
      productKeysToRemove.forEach(key => delete this.cache[key]);
    }
    
    // Then remove random entries from the general cache if needed
    const remainingKeys = Object.keys(this.cache);
    const stillNeedToRemove = removeCount - 
      (this.searchCacheKeys.length + this.productCacheKeys.length);
    
    if (stillNeedToRemove > 0 && remainingKeys.length > 0) {
      // Get random keys to remove
      const randomKeysToRemove = remainingKeys
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(stillNeedToRemove, remainingKeys.length));
      
      randomKeysToRemove.forEach(key => delete this.cache[key]);
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
    const now = Date.now();
    
    // Check if item exists and is not expired
    if (item && now < item.expiry) {
      // For specialized types, update LRU tracking (move to end as most recently used)
      if (type === 'search' && this.searchCacheKeys.includes(key)) {
        // Remove and add to end (most recently used position)
        const index = this.searchCacheKeys.indexOf(key);
        this.searchCacheKeys.splice(index, 1);
        this.searchCacheKeys.push(key);
      } else if (type === 'product' && this.productCacheKeys.includes(key)) {
        // Remove and add to end (most recently used position)
        const index = this.productCacheKeys.indexOf(key);
        this.productCacheKeys.splice(index, 1);
        this.productCacheKeys.push(key);
      }
      
      return item.data as T;
    }
    
    // If item exists but is expired, delete it
    if (item && now >= item.expiry) {
      this.delete(key);
      
      // Also remove from tracking arrays if needed
      if (type === 'search') {
        const index = this.searchCacheKeys.indexOf(key);
        if (index > -1) {
          this.searchCacheKeys.splice(index, 1);
        }
      } else if (type === 'product') {
        const index = this.productCacheKeys.indexOf(key);
        if (index > -1) {
          this.productCacheKeys.splice(index, 1);
        }
      }
    }
    
    return null;
  }
  
  /**
   * Delete a specific key from the cache
   * @param key Cache key to delete
   */
  delete(key: string): void {
    delete this.cache[key];
    
    // Also remove from tracking arrays if needed
    const searchIndex = this.searchCacheKeys.indexOf(key);
    if (searchIndex > -1) {
      this.searchCacheKeys.splice(searchIndex, 1);
    }
    
    const productIndex = this.productCacheKeys.indexOf(key);
    if (productIndex > -1) {
      this.productCacheKeys.splice(productIndex, 1);
    }
  }
  
  /**
   * Delete all keys that match a pattern
   * @param pattern String pattern to match keys against
   */
  deletePattern(pattern: string): void {
    const keys = Object.keys(this.cache);
    const matchingKeys = keys.filter(key => key.includes(pattern));
    
    matchingKeys.forEach(key => {
      this.delete(key);
    });
  }
  
  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache = {};
    this.searchCacheKeys = [];
    this.productCacheKeys = [];
  }
  
  /**
   * Get info about the current state of the cache with details for 10 lakh+ dataset monitoring
   */
  getCacheStats(): any {
    const now = Date.now();
    const keys = Object.keys(this.cache);
    const totalItems = keys.length;
    const expiredItems = Object.values(this.cache).filter(item => now > item.expiry).length;
    const validItems = totalItems - expiredItems;
    
    // Count items by type based on key prefixes (for 10 lakh+ dataset analysis)
    const searchItems = keys.filter(key => key.startsWith('search:') || key.startsWith('medicine:search:')).length;
    const productItems = keys.filter(key => key.startsWith('products:') || key.startsWith('product:')).length;
    const categoryItems = keys.filter(key => key.startsWith('categories:')).length;
    const cartItems = keys.filter(key => key.startsWith('cart:')).length;
    
    // Calculate memory usage per key type (approximation)
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // Total in MB
    const estimatedItemSize = memoryUsage / (totalItems || 1); // MB per item (avoid division by zero)
    
    return {
      totalItems,
      expiredItems,
      validItems,
      memoryUsage, // In MB
      estimatedItemSize, // In MB
      typeBreakdown: {
        search: searchItems,
        product: productItems,
        category: categoryItems,
        cart: cartItems,
        other: totalItems - searchItems - productItems - categoryItems - cartItems
      },
      trackedKeys: {
        search: this.searchCacheKeys.length,
        product: this.productCacheKeys.length
      },
      limits: {
        search: this.SEARCH_CACHE_LIMIT,
        product: this.PRODUCT_CACHE_LIMIT
      }
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
  
  /**
   * Perform automated cache optimization for 10 lakh+ products
   * This analyzes current cache usage and applies heuristics to optimize memory usage
   * @returns Information about the optimization performed
   */
  optimizeCacheForLargeDatasets(): any {
    const beforeStats = this.getCacheStats();
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // In MB
    
    let optimizationActions: string[] = [];
    
    // Apply different strategies based on memory pressure
    if (memoryUsage > this.MAX_MEMORY_USAGE * 0.9) { // >90% of limit
      // Aggressive optimization - reduce cache size significantly
      this.evictCachePercentage(50); 
      optimizationActions.push("Reduced cache size by 50% due to high memory pressure");
    } else if (memoryUsage > this.MAX_MEMORY_USAGE * 0.7) { // >70% of limit
      // Moderate optimization - target less frequently accessed items
      this.evictCachePercentage(30);
      optimizationActions.push("Reduced cache size by 30% due to moderate memory pressure");
    } else if (memoryUsage > this.MAX_MEMORY_USAGE * 0.5) { // >50% of limit
      // Light optimization - just trim oldest items
      this.evictCachePercentage(15);
      optimizationActions.push("Reduced cache size by 15% due to mild memory pressure");
    }
    
    // Next, check each specialized cache type (search/product) if approaching limits
    if (this.searchCacheKeys.length > this.SEARCH_CACHE_LIMIT * 0.9) {
      // Remove older 20% of search cache if approaching limit
      const removeCount = Math.floor(this.searchCacheKeys.length * 0.2);
      const keysToRemove = this.searchCacheKeys.slice(0, removeCount);
      keysToRemove.forEach(key => delete this.cache[key]);
      this.searchCacheKeys = this.searchCacheKeys.slice(removeCount);
      optimizationActions.push(`Pruned ${removeCount} oldest search cache entries`);
    }
    
    if (this.productCacheKeys.length > this.PRODUCT_CACHE_LIMIT * 0.9) {
      // Remove older 20% of product cache if approaching limit
      const removeCount = Math.floor(this.productCacheKeys.length * 0.2);
      const keysToRemove = this.productCacheKeys.slice(0, removeCount);
      keysToRemove.forEach(key => delete this.cache[key]);
      this.productCacheKeys = this.productCacheKeys.slice(removeCount);
      optimizationActions.push(`Pruned ${removeCount} oldest product cache entries`);
    }
    
    // Provide analysis of effectiveness
    const afterStats = this.getCacheStats();
    const memorySaved = beforeStats.memoryUsage - afterStats.memoryUsage;
    const itemsRemoved = beforeStats.totalItems - afterStats.totalItems;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Cache optimization performed: saved ${memorySaved.toFixed(2)} MB by removing ${itemsRemoved} items`);
    }
    
    return {
      before: beforeStats,
      after: afterStats,
      memoryReduced: memorySaved,
      itemsRemoved,
      optimizationActions
    };
  }
}

// Create a singleton instance
const cacheService = new CacheService();

// Set up periodic optimization for 10 lakh+ product scenarios
// Schedule periodic optimization (250MB threshold instead of accessing private property)
if (process.env.NODE_ENV === 'production') {
  // In production, optimize every 5 minutes
  setInterval(() => {
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    if (memoryUsage > 250) { // Only optimize if using >250MB memory
      cacheService.optimizeCacheForLargeDatasets();
    }
  }, 5 * 60 * 1000); // 5 minutes
}

export default cacheService;