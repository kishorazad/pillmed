/**
 * Location Service
 * 
 * Handles all location-related functionality including:
 * - Pincode lookups for delivery availability
 * - IP-based location detection for automatic language selection
 * - Geocoding for address auto-completion
 */

import axios from 'axios';

export interface PincodeData {
  pincode: string;
  city: string;
  district: string;
  state: string;
  country: string;
  serviceAvailable: boolean;
  deliveryDays: number;
}

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

// Map country codes to language codes for automatic language detection
const COUNTRY_TO_LANGUAGE: Record<string, string> = {
  'IN': 'hi', // India -> Hindi
  'US': 'en', // United States -> English
  'GB': 'en', // United Kingdom -> English
  'FR': 'fr', // France -> French
  'ES': 'es', // Spain -> Spanish
  'AE': 'ar', // UAE -> Arabic
  'SA': 'ar', // Saudi Arabia -> Arabic
  'CN': 'zh', // China -> Chinese
  'TW': 'zh', // Taiwan -> Chinese
  'JP': 'ja', // Japan -> Japanese
  'DE': 'de', // Germany -> German
  'RU': 'ru', // Russia -> Russian
  'IT': 'it', // Italy -> Italian
  'PT': 'pt', // Portugal -> Portuguese
  'BR': 'pt-BR', // Brazil -> Portuguese (Brazil)
  'TH': 'th', // Thailand -> Thai
  'KR': 'ko', // South Korea -> Korean
  'TR': 'tr', // Turkey -> Turkish
  'VN': 'vi', // Vietnam -> Vietnamese
  'NL': 'nl', // Netherlands -> Dutch
  'SE': 'sv', // Sweden -> Swedish
  'NO': 'no', // Norway -> Norwegian
  'DK': 'da', // Denmark -> Danish
  'FI': 'fi', // Finland -> Finnish
  'PL': 'pl', // Poland -> Polish
  'GR': 'el', // Greece -> Greek
  'IL': 'he', // Israel -> Hebrew
  'ID': 'id', // Indonesia -> Indonesian
  'MY': 'ms', // Malaysia -> Malay
  'PH': 'fil', // Philippines -> Filipino
  'TN': 'ar', // Tunisia -> Arabic
  'DZ': 'ar', // Algeria -> Arabic
  'MA': 'ar', // Morocco -> Arabic
  'EG': 'ar', // Egypt -> Arabic
  'IR': 'fa', // Iran -> Persian
  'PK': 'ur', // Pakistan -> Urdu
  'BD': 'bn', // Bangladesh -> Bengali
  'LK': 'si', // Sri Lanka -> Sinhala
  'NP': 'ne', // Nepal -> Nepali
  'ZA': 'en', // South Africa -> English
  'NG': 'en', // Nigeria -> English
  'KE': 'sw', // Kenya -> Swahili
  'TZ': 'sw', // Tanzania -> Swahili
  'MX': 'es', // Mexico -> Spanish
  'AR': 'es', // Argentina -> Spanish
  'CL': 'es', // Chile -> Spanish
  'CO': 'es', // Colombia -> Spanish
  'PE': 'es', // Peru -> Spanish
  'VE': 'es', // Venezuela -> Spanish
  'CA': 'en', // Canada -> English (default, could be fr in Quebec)
  'AU': 'en', // Australia -> English
  'NZ': 'en', // New Zealand -> English
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
    throw new Error('Failed to fetch pincode data');
  }
}

/**
 * Detect user's location based on IP address and set language
 * @param setLanguage Function to set the language in the app
 * @returns Promise with location data or null
 */
export async function detectLocationByIP(): Promise<IPLocationData | null> {
  try {
    // Free IP Geolocation API
    const response = await axios.get('https://ipapi.co/json/');
    return response.data;
  } catch (error) {
    console.error('Error detecting location by IP:', error);
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
      const language = COUNTRY_TO_LANGUAGE[countryCode] || 'en';
      
      setLanguage(language);
      console.log(`Set language to ${language} based on location (${locationData.country_name})`);
    }
  } catch (error) {
    console.error('Error setting language by location:', error);
    // Fallback to English
    setLanguage('en');
  }
}

/**
 * Get full address details from pincode
 * @param pincode Numeric pincode
 * @returns Promise with address details or error
 */
export async function getAddressFromPincode(pincode: string): Promise<Partial<PincodeData>> {
  try {
    const data = await getPincodeData(pincode);
    return {
      city: data.city,
      district: data.district,
      state: data.state,
      country: data.country
    };
  } catch (error) {
    console.error('Error getting address from pincode:', error);
    throw new Error('Failed to get address from pincode');
  }
}

/**
 * Get estimated delivery time based on pincode
 * @param pincode Delivery pincode
 * @returns Promise with estimated delivery days
 */
export async function getEstimatedDeliveryTime(pincode: string): Promise<number> {
  try {
    const data = await getPincodeData(pincode);
    return data.deliveryDays;
  } catch (error) {
    console.error('Error getting delivery time:', error);
    // Default to 3 days if we can't get exact estimate
    return 3;
  }
}