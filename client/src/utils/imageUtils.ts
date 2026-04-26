/**
 * Advanced image utility functions for optimizing image loading and web performance
 * Handles caching, placeholder generation, lazy loading, and sanitization of external URLs
 * Automatically blocks and replaces images from competitor pharmacy websites
 */

// Default local image path (optimized)
const DEFAULT_MEDICINE_IMAGE = '/pillnow.png';

// Cache version for long-term browser caching - increment this when default images change
const CACHE_VERSION = '2';

// Low-quality image placeholders for faster initial load
const DEFAULT_MEDICINE_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Image size constants for responsive loading
const IMAGE_SIZES = {
  THUMBNAIL: {width: 100, height: 100, quality: 70},
  SMALL: {width: 200, height: 200, quality: 75},
  MEDIUM: {width: 400, height: 400, quality: 80},
  LARGE: {width: 800, height: 800, quality: 85}
};

// List of domains to block and replace with our default image
const BLOCKED_DOMAINS = [
  'pharmeasy.in',
  '1mg.com',
  'netmeds.com',
  'cdn01.pharmeasy.in',
  'onemg.com',
  'cdn.netmeds.com',
  'healthmug.com',
  'lh3.googleusercontent.com/pw/pharm', // Sometimes Google Images cache pharmacy images
  'img.freepik.com/premium-photo/medicine', // Generic medicine stock photos
  'apollopharmacy.in',
  'medplusmart.com',
  'medicaldialogues.in',
];

// In-memory cache for image URL processing
const imageUrlCache = new Map<string, string>();

/**
 * Gets the appropriate image format based on URL and browser support
 * Prioritizes WebP for better compression when possible
 */
const getOptimalFormat = (url: string): string => {
  // For local images, assume we can convert to WebP
   if (!url) return 'webp';  // ✅ ADD THIS LINE
  if (!url.startsWith('http') && !url.startsWith('data:')) {
    return 'webp';
  }
  
  // For external images, keep the original format
  if (url.includes('.jpg') || url.includes('.jpeg')) return 'jpeg';
  if (url.includes('.png')) return 'png';
  if (url.includes('.webp')) return 'webp';
  if (url.includes('.gif')) return 'gif';
  
  // Default to WebP for local images without extension
  return 'webp';
};

/**
 * Enhanced image URL sanitizer with caching, optimization, and format conversion
 * Uses best practices for image loading and performance
 * 
 * @param imageUrl - The original image URL
 * @param size - Optional size preset for the image
 * @returns A safe image URL with optimization parameters
 */
export const getSafeImageUrl = (
  imageUrl: string | null | undefined, 
  size?: keyof typeof IMAGE_SIZES
): string => {
  // If no image URL is provided, return the default
  if (!imageUrl) {
    return DEFAULT_MEDICINE_IMAGE;
  }
  
  // Create a cache key based on URL and size 
  const cacheKey = `${imageUrl}|${size || 'original'}|v${CACHE_VERSION}`;
  
  // Check cache first to avoid reprocessing
  if (imageUrlCache.has(cacheKey)) {
    return imageUrlCache.get(cacheKey) as string;
  }

  // Check if the URL contains any of the blocked domains
  const containsBlockedDomain = BLOCKED_DOMAINS.some(domain => 
    imageUrl.toLowerCase().includes(domain.toLowerCase())
  );
  
  // Return default image if it contains a blocked domain
  if (containsBlockedDomain) {
    const defaultWithVersion = `${DEFAULT_MEDICINE_IMAGE}?v=${CACHE_VERSION}`;
    imageUrlCache.set(cacheKey, defaultWithVersion);
    return defaultWithVersion;
  }
  
  // Process image URL with optimization parameters
  let processedUrl = imageUrl;
  
  // If size is specified and the image is from our domain, apply size parameters for optimization
  if (size && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
    const dimensions = IMAGE_SIZES[size];
    const format = getOptimalFormat(imageUrl);
    
    // Create an optimized URL with width, height, quality and cache parameters
    processedUrl = `${imageUrl}?width=${dimensions.width}&height=${dimensions.height}&quality=${dimensions.quality}&format=${format}&v=${CACHE_VERSION}`;
    
    // Cache the processed URL
    imageUrlCache.set(cacheKey, processedUrl);
    return processedUrl;
  }
  
  // Add cache version to local images
  if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('http') && !imageUrl.includes('?')) {
    processedUrl = `${imageUrl}?v=${CACHE_VERSION}`;
  }
  
  // Store in cache and return
  imageUrlCache.set(cacheKey, processedUrl);
  return processedUrl;
};

/**
 * Replaces all external pharma websites' images in objects with default PillNow image
 * @param object - The object containing image URLs
 * @param imageUrlField - The field name containing the image URL (default: 'imageUrl')
 * @returns A new object with sanitized image URLs
 */
export const sanitizeObjectImages = <T extends Record<string, any>>(
  object: T, 
  imageUrlField: string = 'imageUrl'
): T => {
  if (!object || typeof object !== 'object') {
    return object;
  }
  
  // Create a copy of the object
  const sanitizedObject = { ...object } as T;
  
  // Replace the image URL if it exists
  if (imageUrlField in sanitizedObject) {
    (sanitizedObject as any)[imageUrlField] = getSafeImageUrl((sanitizedObject as any)[imageUrlField]);
  }
  
  return sanitizedObject;
};

/**
 * Sanitizes an array of objects containing image URLs
 * @param objects - Array of objects containing image URLs
 * @param imageUrlField - The field name containing the image URL (default: 'imageUrl')
 * @returns A new array with sanitized objects
 */
export const sanitizeObjectsArray = <T extends Record<string, any>>(
  objects: T[], 
  imageUrlField: string = 'imageUrl'
): T[] => {
  if (!Array.isArray(objects)) {
    return objects;
  }
  
  return objects.map(obj => sanitizeObjectImages(obj, imageUrlField));
};
