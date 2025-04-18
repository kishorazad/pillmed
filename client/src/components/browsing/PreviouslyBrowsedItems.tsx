import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/components/LanguageSwitcher';
import { ArrowRight } from 'lucide-react';

interface BrowsedProduct {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  discountedPrice?: number;
  quantity: string;
}

const PreviouslyBrowsedItems: React.FC = () => {
  const { t } = useLanguage();
  const [browsedItems, setBrowsedItems] = useState<BrowsedProduct[]>([]);

  const { language } = useLanguage();
  
  useEffect(() => {
    // Get previously browsed items from localStorage
    const getPreviouslyBrowsedItems = () => {
      try {
        const storedItems = localStorage.getItem('browsedProducts');
        if (storedItems) {
          const parsedItems = JSON.parse(storedItems);
          // Limit to 5 most recent items
          setBrowsedItems(parsedItems.slice(0, 5));
        }
      } catch (error) {
        console.error('Error retrieving browsed products:', error);
      }
    };

    getPreviouslyBrowsedItems();
  }, [language]); // Re-run when language changes

  if (browsedItems.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('previously_browsed_items')}</h2>
        <Link to="/products" className="text-saffron-600 hover:text-saffron-700 flex items-center text-sm">
          {t('view_all')} <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {browsedItems.map((item) => (
          <Link key={item.id} to={`/products/${item.id}`}>
            <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-gray-100 flex items-center justify-center p-2">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="max-h-full max-w-full object-contain" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500 text-xs text-center">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium line-clamp-2 h-10 mb-1">{item.name}</h3>
                <div className="text-xs text-gray-500 mb-1">{t('strip_of_tablets', { count: '15' })}</div>
                
                <div className="flex items-center">
                  <div className="text-xs text-gray-500">{t('mrp')} ₹{item.price.toFixed(2)}</div>
                </div>
                
                <div className="flex items-center mt-1">
                  <div className="text-md font-semibold">₹{(item.discountedPrice || item.price).toFixed(2)}</div>
                  {item.discountedPrice && (
                    <div className="ml-2 text-xs text-green-600">
                      {Math.round(((item.price - item.discountedPrice) / item.price) * 100)}% {t('off')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PreviouslyBrowsedItems;