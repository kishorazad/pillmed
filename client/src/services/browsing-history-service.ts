interface BrowsedProduct {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  discountedPrice?: number;
  quantity: string;
}

const STORAGE_KEY = 'browsedProducts';
const MAX_BROWSED_ITEMS = 20; // Maximum number of browsed items to store

/**
 * Add a product to browsing history
 */
export const addToBrowsingHistory = (product: BrowsedProduct): void => {
  try {
    // Get existing browsing history
    const existingHistory = getBrowsingHistory();

    // Check if product already exists in history
    const existingProductIndex = existingHistory.findIndex(item => item.id === product.id);
    
    // If product exists, remove it (we'll add it to the front)
    if (existingProductIndex !== -1) {
      existingHistory.splice(existingProductIndex, 1);
    }
    
    // Add product to the front of the array
    const updatedHistory = [product, ...existingHistory];
    
    // Trim history to maximum size
    const trimmedHistory = updatedHistory.slice(0, MAX_BROWSED_ITEMS);
    
    // Save updated history
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error adding product to browsing history:', error);
  }
};

/**
 * Get all products from browsing history
 */
export const getBrowsingHistory = (): BrowsedProduct[] => {
  try {
    const storedHistory = localStorage.getItem(STORAGE_KEY);
    return storedHistory ? JSON.parse(storedHistory) : [];
  } catch (error) {
    console.error('Error retrieving browsing history:', error);
    return [];
  }
};

/**
 * Clear browsing history
 */
export const clearBrowsingHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing browsing history:', error);
  }
};