import React, { useRef } from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { ArrowRightIcon, Star, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { useMediaQuery } from '@/hooks/use-media-query';
import { getSafeImageUrl } from '@/utils/imageUtils';

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  rating: number;
  ratingCount: number;
}

const TopDeals: React.FC = () => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  // Sample products data with top deals
  const products: Product[] = [
    {
      id: 1,
      name: 'Dolo 650mg Tablet',
      imageUrl: '/pillnow.png',
      originalPrice: 30,
      discountedPrice: 22.5,
      discountPercentage: 25,
      rating: 4.5,
      ratingCount: 1245
    },
    {
      id: 2,
      name: 'Cetaphil Gentle Skin Cleanser',
      imageUrl: '/pillnow.png',
      originalPrice: 450,
      discountedPrice: 382.5,
      discountPercentage: 15,
      rating: 4.3,
      ratingCount: 823
    },
    {
      id: 3,
      name: 'Accu-Chek Active Test Strips',
      imageUrl: '/pillnow.png',
      originalPrice: 999,
      discountedPrice: 699.3,
      discountPercentage: 30,
      rating: 4.7,
      ratingCount: 3240
    },
    {
      id: 4,
      name: 'Dr. Morepen BP One BP Monitor',
      imageUrl: '/pillnow.png',
      originalPrice: 2499,
      discountedPrice: 1499.4,
      discountPercentage: 40,
      rating: 4.2,
      ratingCount: 872
    },
    {
      id: 5,
      name: 'Everherb Ashwagandha Tablets',
      imageUrl: '/pillnow.png',
      originalPrice: 599,
      discountedPrice: 329.45,
      discountPercentage: 45,
      rating: 4.4,
      ratingCount: 642
    },
    {
      id: 6,
      name: 'OneTouch Select Plus Test Strips',
      imageUrl: '/pillnow.png',
      originalPrice: 1199,
      discountedPrice: 959.2,
      discountPercentage: 20,
      rating: 4.6,
      ratingCount: 1875
    }
  ];

  return (
    <section className="py-6 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{t('top_deals')}</h2>
          <div className="flex items-center">
            {!isMobile && (
              <div className="flex gap-2 mr-4">
                <button 
                  onClick={handleScrollLeft}
                  className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleScrollRight}
                  className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            <Link href="/deals" className="text-primary flex items-center text-sm">
              {t('view_all')} <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{t('best_deals_and_savings')}</p>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {products.map((product) => (
            <Link 
              key={product.id} 
              href={`/products/${product.id}`} 
              className="snap-start min-w-[260px] max-w-[300px] flex-shrink-0"
            >
              <div className="bg-white rounded-lg shadow-sm overflow-hidden transition duration-300 hover:shadow-md cursor-pointer h-full flex flex-col">
                <div className="relative px-4 pt-4 flex justify-center">
                  <img 
                    src={getSafeImageUrl(product.imageUrl)} 
                    alt={product.name} 
                    className="h-36 object-contain"
                  />
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 m-2 rounded-sm text-xs font-medium">
                    {product.discountPercentage}% {t('off')}
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2 h-10">{product.name}</h3>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex items-center bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      <span>{product.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">{product.ratingCount} {t('ratings')}</span>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex items-baseline">
                      <span className="text-lg font-semibold">₹{product.discountedPrice}</span>
                      <span className="text-gray-500 text-sm line-through ml-2">₹{product.originalPrice}</span>
                    </div>
                    
                    <button className="mt-3 w-full bg-primary text-white py-1.5 px-4 rounded-md text-sm font-medium flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t('add_to_cart')}
                    </button>
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

export default TopDeals;