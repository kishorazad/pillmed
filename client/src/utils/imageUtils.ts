/**
 * Utility function to handle product images
 * Replaces external images from pharmacy websites with a local PillNow image
 * to ensure privacy and avoid direct hotlinking from these sites
 */

// Default local image path
const DEFAULT_MEDICINE_IMAGE = '/pillnow.png';

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

/**
 * Sanitizes an image URL by replacing blocked domain images with a default image
 * @param imageUrl - The original image URL
 * @returns A safe image URL
 */
export const getSafeImageUrl = (imageUrl: string | null | undefined): string => {
  // If no image URL is provided, return the default
  if (!imageUrl) {
    return DEFAULT_MEDICINE_IMAGE;
  }

  // Check if the URL contains any of the blocked domains
  const containsBlockedDomain = BLOCKED_DOMAINS.some(domain => 
    imageUrl.toLowerCase().includes(domain.toLowerCase())
  );
  
  // Return default image if it contains a blocked domain
  if (containsBlockedDomain) {
    return DEFAULT_MEDICINE_IMAGE;
  }
  
  return imageUrl;
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