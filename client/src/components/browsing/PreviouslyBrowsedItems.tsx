import React from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { ArrowRightIcon, Clock } from 'lucide-react';
import { Link } from 'wouter';

interface BrowsedItem {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  viewedAt: string;
}

const PreviouslyBrowsedItems: React.FC = () => {
  const { t } = useLanguage();
  
  // Sample browsed items data
  const items: BrowsedItem[] = [
    {
      id: 1,
      name: 'Dolo 650mg Tablet',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/products_otc/I05582/dolo-650-tablet-15s-1-1669710798.jpg',
      price: 30.50,
      viewedAt: '2025-04-17T10:30:00'
    },
    {
      id: 2,
      name: 'Cetaphil Gentle Skin Cleanser',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/products_otc/142528/cetaphil-gentle-skin-cleanser-250ml-2-1669710367.jpg',
      price: 450,
      viewedAt: '2025-04-17T11:15:00'
    },
    {
      id: 3,
      name: 'Blood Glucose Test Strips',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/products_otc/000665/accusure-simple-gluco-test-strips-box-of-50-1-1669710026.jpg',
      price: 999,
      viewedAt: '2025-04-17T14:20:00'
    },
    {
      id: 4,
      name: 'Dr. Morepen BP Monitor',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/products_otc/W67219/dr-morepen-bp-one-bp02-fully-automatic-blood-pressure-monitor-with-adaptor-2-1671745339.jpg',
      price: 1899,
      viewedAt: '2025-04-18T09:10:00'
    }
  ];

  const formatViewTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    const formattedTime = `${hour12}:${minutes < 10 ? '0' : ''}${minutes} ${amPm}`;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return `${t('today')} ${formattedTime}`;
    } else if (isYesterday) {
      return `${t('yesterday')} ${formattedTime}`;
    } else {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ` ${formattedTime}`;
    }
  };

  return (
    <section className="py-6 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{t('previously_browsed_items')}</h2>
          <Link href="/browsing-history" className="text-primary flex items-center text-sm">
            {t('view_all')} <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <p className="text-gray-600 mb-4">{t('recently_viewed_products')}</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <Link key={item.id} href={`/products/${item.id}`}>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden transition duration-300 hover:shadow-md cursor-pointer h-full flex flex-col">
                <div className="relative px-4 pt-4 flex justify-center">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="h-32 object-contain"
                  />
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2 h-10">{item.name}</h3>
                  
                  <div className="flex items-center mb-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatViewTime(item.viewedAt)}</span>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="text-lg font-semibold">₹{item.price.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreviouslyBrowsedItems;