import axios from 'axios';

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
 * Get user's location based on IP address
 * Uses a free IP geolocation API (ipapi.co)
 */
export const getUserLocation = async (): Promise<IPLocationData | null> => {
  try {
    const response = await axios.get('https://ipapi.co/json/');
    return response.data;
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
};

/**
 * Map country code to language code
 * Default fallback to English if no mapping exists
 */
export const getLanguageFromCountry = (countryCode: string): string => {
  const countryToLanguageMap: Record<string, string> = {
    // Major English-speaking countries
    'US': 'en', 'GB': 'en', 'AU': 'en', 'NZ': 'en', 'CA': 'en',
    
    // German-speaking countries
    'DE': 'de', 'AT': 'de', 'CH': 'de',
    
    // French-speaking countries
    'FR': 'fr', 'BE': 'fr', 'MC': 'fr', 'LU': 'fr',
    
    // Spanish-speaking countries
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es',
    'CL': 'es', 'VE': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es',
    'BO': 'es', 'DO': 'es', 'HN': 'es', 'PY': 'es', 'SV': 'es',
    'NI': 'es', 'CR': 'es', 'PA': 'es', 'UY': 'es',
    
    // Chinese-speaking countries
    'CN': 'zh', 'TW': 'zh', 'SG': 'zh',
    
    // Arabic-speaking countries
    'SA': 'ar', 'AE': 'ar', 'QA': 'ar', 'BH': 'ar', 'KW': 'ar',
    'OM': 'ar', 'JO': 'ar', 'LB': 'ar', 'SY': 'ar', 'IQ': 'ar',
    'EG': 'ar', 'SD': 'ar', 'LY': 'ar', 'MA': 'ar', 'TN': 'ar',
    'DZ': 'ar', 'YE': 'ar',
    
    // Hindi-speaking countries
    'IN': 'hi',
    
    // Tamil-speaking regions
    'LK': 'ta', // Sri Lanka
  };
  
  return countryToLanguageMap[countryCode] || 'en';
};

/**
 * Set user language based on IP geolocation
 * @param setLanguage Function to set language in the app
 */
export const setLanguageBasedOnLocation = async (setLanguage: (lang: string) => void): Promise<void> => {
  try {
    // Only set language if it's not already set by the user in localStorage
    if (typeof window !== 'undefined' && !localStorage.getItem('language')) {
      const locationData = await getUserLocation();
      
      if (locationData?.country_code) {
        const detectedLanguage = getLanguageFromCountry(locationData.country_code);
        setLanguage(detectedLanguage);
        console.log(`Automatically set language to ${detectedLanguage} based on location (${locationData.country_code})`);
      }
    }
  } catch (error) {
    console.error('Error setting language based on location:', error);
  }
};

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
 * Get city and delivery information by pincode
 */
export const getCityByPincode = async (pincode: string): Promise<PincodeData | null> => {
  try {
    const response = await axios.get(`/api/pincode/${pincode}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pincode data:', error);
    return null;
  }
};