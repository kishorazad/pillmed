/**
 * Location Service
 * 
 * Handles all location-related functionality including:
 * - Pincode lookups for delivery availability
 * - IP-based location detection for automatic language selection
 * - Geocoding for address auto-completion
 */

import axios from 'axios';

// Define pincode data interface matching server response
export interface PincodeData {
  pincode: string;
  city: string;
  district: string;
  state: string;
  country: string;
  serviceAvailable?: boolean;  // From delivery endpoint
  deliveryAvailable?: boolean; // From pincode endpoint
  deliveryDays: number;
}

// Define IP location data interface
interface IPLocationData {
  country_code: string;
  country_name: string;
  region_code: string;
  region_name: string;
  city: string;
  zip_code: string;
  time_zone: string;
  latitude: number;
  longitude: number;
}

// Map countries to languages for automatic language selection
const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  'IN': 'hi', // India -> Hindi
  'AE': 'ar', // UAE -> Arabic  
  'SA': 'ar', // Saudi Arabia -> Arabic
  'EG': 'ar', // Egypt -> Arabic
  'PK': 'ur', // Pakistan -> Urdu
  'BD': 'bn', // Bangladesh -> Bengali
  'CN': 'zh', // China -> Chinese
  'JP': 'ja', // Japan -> Japanese
  'KR': 'ko', // South Korea -> Korean
  'RU': 'ru', // Russia -> Russian
  'ES': 'es', // Spain -> Spanish
  'FR': 'fr', // France -> French
  'DE': 'de', // Germany -> German
  'IT': 'it', // Italy -> Italian
  'BR': 'pt', // Brazil -> Portuguese
  'PT': 'pt', // Portugal -> Portuguese
};

/**
 * Get pincode data including delivery availability
 * @param pincode 6-digit Indian pincode
 * @returns Promise with pincode data or error
 */
export async function getPincodeData(pincode: string): Promise<PincodeData> {
  try {
    const response = await axios.get(`/api/pincode/${pincode}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pincode data:', error);
    throw new Error('Unable to fetch pincode data');
  }
}

/**
 * Detect user's location based on IP address and set language
 * @param setLanguage Function to set the language in the app
 * @returns Promise with location data or null
 */
export async function detectLocationByIP(): Promise<IPLocationData | null> {
  try {
    // Use ipapi.co for IP-based geolocation (free tier, 1000 requests/day)
    // Non-commercial usage falls within free tier limits
    const response = await axios.get('https://ipapi.co/json/');
    return response.data;
  } catch (error) {
    console.error('Error detecting location:', error);
    return null;
  }
}

/**
 * Set language based on user's location from IP address
 * @param setLanguage Function to set language in the app
 */
export async function setLanguageBasedOnLocation(setLanguage: (lang: string) => void): Promise<void> {
  try {
    const locationData = await detectLocationByIP();
    
    if (locationData && locationData.country_code) {
      const countryCode = locationData.country_code;
      const language = COUNTRY_LANGUAGE_MAP[countryCode] || 'en';
      
      // Set the language in the app
      setLanguage(language);
      console.log(`Set language to ${language} based on location (${locationData.country_name})`);
    }
  } catch (error) {
    console.error('Error setting language by location:', error);
  }
}

/**
 * Get full address details from pincode
 * @param pincode Numeric pincode
 * @returns Promise with address details or error
 */
export async function getAddressFromPincode(pincode: string): Promise<Partial<PincodeData>> {
  try {
    const pincodeData = await getPincodeData(pincode);
    return {
      city: pincodeData.city,
      state: pincodeData.state,
      district: pincodeData.district,
      country: pincodeData.country
    };
  } catch (error) {
    console.error('Error getting address from pincode:', error);
    throw new Error('Unable to get address from pincode');
  }
}

/**
 * Get estimated delivery time based on pincode
 * @param pincode Delivery pincode
 * @returns Promise with estimated delivery days
 */
export async function getEstimatedDeliveryTime(pincode: string): Promise<number> {
  try {
    const pincodeData = await getPincodeData(pincode);
    return pincodeData.deliveryDays;
  } catch (error) {
    console.error('Error getting delivery estimate:', error);
    return 5; // Default to 5 days if error
  }
}

/**
 * Check if delivery is available at a pincode
 * @param pincode Delivery pincode
 * @returns Promise with boolean indicating availability
 */
export async function isDeliveryAvailable(pincode: string): Promise<boolean> {
  try {
    const response = await axios.get(`/api/pincode/${pincode}/delivery`);
    return response.data.isServiceable;
  } catch (error) {
    console.error('Error checking delivery availability:', error);
    return false; // Default to not available if error
  }
}