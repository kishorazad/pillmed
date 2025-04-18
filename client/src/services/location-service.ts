/**
 * Location service for IP-based language detection
 * and pincode-based city detection
 */

/**
 * Interface for IP location data
 */
interface IPLocationData {
  country_code: string;
  country_name: string;
  city: string;
  postal: string;
  latitude: number;
  longitude: number;
  IPv4: string;
  state: string;
}

/**
 * Interface for pincode data
 */
export interface PincodeData {
  pincode: string;
  district: string;
  state: string;
  country: string;
  city: string;
  deliveryAvailable: boolean;
}

/**
 * Get user's location based on IP address
 * Uses a free IP geolocation API (ipapi.co)
 */
export const getUserLocation = async (): Promise<IPLocationData | null> => {
  try {
    // Using ipapi.co which doesn't require API keys
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error(`Failed to get location data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
};

/**
 * Map country code to language code
 * Default fallback to English if no mapping exists
 */
export const getLanguageFromCountry = (countryCode: string): string => {
  const countryToLanguage: Record<string, string> = {
    // Most common countries and their primary languages
    'US': 'en', // United States - English
    'GB': 'en', // United Kingdom - English
    'CA': 'en', // Canada - English (could also be French)
    'AU': 'en', // Australia - English
    'NZ': 'en', // New Zealand - English
    'IN': 'hi', // India - Hindi
    'FR': 'fr', // France - French
    'DE': 'de', // Germany - German
    'ES': 'es', // Spain - Spanish
    'MX': 'es', // Mexico - Spanish
    'CN': 'zh', // China - Chinese
    'HK': 'zh', // Hong Kong - Chinese
    'TW': 'zh', // Taiwan - Chinese
    'SA': 'ar', // Saudi Arabia - Arabic
    'AE': 'ar', // UAE - Arabic
    'EG': 'ar', // Egypt - Arabic
    'QA': 'ar', // Qatar - Arabic
    'TN': 'ta', // Tunisia - Tamil speakers can be present
    'LK': 'ta', // Sri Lanka - Tamil
    // Add more country-to-language mappings as needed
  };
  
  return countryToLanguage[countryCode] || 'en'; // Default to English
};

/**
 * Set user language based on IP geolocation
 * @param setLanguage Function to set language in the app
 */
export const setLanguageBasedOnLocation = async (setLanguage: (lang: string) => void): Promise<void> => {
  try {
    // Check if language is already set in localStorage
    const savedLanguage = localStorage.getItem('pillnow-language');
    
    // If we already have a user-selected language, respect that choice
    if (savedLanguage) {
      return;
    }
    
    // Get location data
    const locationData = await getUserLocation();
    
    if (!locationData) {
      return;
    }
    
    // Map country to language
    const languageCode = getLanguageFromCountry(locationData.country_code);
    
    // Set the language
    setLanguage(languageCode);
    
    // Update localStorage
    localStorage.setItem('pillnow-language', languageCode);
    
    console.log(`Set language to ${languageCode} based on location (${locationData.country_name})`);
  } catch (error) {
    console.error('Error setting language based on location:', error);
  }
};

/**
 * Get city and delivery information by pincode
 */
export const getCityByPincode = async (pincode: string): Promise<PincodeData | null> => {
  try {
    const response = await fetch(`/api/pincode/${pincode}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get pincode data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error getting data for pincode ${pincode}:`, error);
    return null;
  }
};

/**
 * Check if delivery is available for a pincode
 */
export const checkDeliveryAvailability = async (pincode: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/delivery-available/${pincode}`);
    
    if (!response.ok) {
      throw new Error(`Failed to check delivery availability: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.deliveryAvailable;
  } catch (error) {
    console.error(`Error checking delivery availability for pincode ${pincode}:`, error);
    return false;
  }
};