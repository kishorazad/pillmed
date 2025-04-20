import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { getSafeImageUrl } from '@/utils/imageUtils';

interface Product {
  id: number;
  name: string;
  imageUrl?: string | null;
  price: number;
  discountedPrice?: number | null;
  rating?: number | null;
  ratingCount?: number | null;
  isFeatured?: boolean;
  tags?: string[];
}

interface FeaturedProductsSliderProps {
  products?: Product[];
  loading?: boolean;
}

const FeaturedProductsSlider: React.FC<FeaturedProductsSliderProps> = ({ 
  products = [], 
  loading = false 
}) => {
  const { t } = useLanguage();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Use sample data only if no products are provided
  const displayProducts = products.length > 0 ? products : [
    {
      id: 1,
      name: 'Dolo 650mg Tablet',
      imageUrl: '/pillnow.png',
      price: 30,
      discountedPrice: 25.5,
      rating: 4.5,
      ratingCount: 1245,
      isFeatured: true,
      tags: ['Popular', 'Fast Delivery']
    },
    {
      id: 2,
      name: 'Vitamin D3 Supplements',
      imageUrl: '/pillnow.png',
      price: 899,
      discountedPrice: 674.25,
      rating: 4.3,
      ratingCount: 823,
      isFeatured: true,
      tags: ['Best Seller']
    },
    {
      id: 3,
      name: 'Blood Glucose Test Strips',
      imageUrl: '/pillnow.png',
      price: 999,
      discountedPrice: 799.2,
      rating: 4.7,
      ratingCount: 3240,
      isFeatured: true
    },
    {
      id: 4,
      name: 'Digital Thermometer',
      imageUrl: '/pillnow.png',
      price: 199,
      discountedPrice: 149.25,
      rating: 4.1,
      ratingCount: 652,
      isFeatured: true,
      tags: ['New Arrival']
    },
    {
      id: 5,
      name: 'Automatic BP Monitor',
      imageUrl: '/pillnow.png',
      price: 2499,
      discountedPrice: 1999.2,
      rating: 4.2,
      ratingCount: 872,
      isFeatured: true
    },
    {
      id: 6,
      name: 'Vitamin C Tablets',
      imageUrl: '/pillnow.png',
      price: 450,
      discountedPrice: 382.5,
      rating: 4.6,
      ratingCount: 1123,
      isFeatured: true,
      tags: ['Immunity Booster']
    }
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { current: slider } = sliderRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const checkScrollButtons = () => {
    if (sliderRef.current) {
      const { current: slider } = sliderRef;
      setShowLeftArrow(slider.scrollLeft > 0);
      setShowRightArrow(slider.scrollLeft < slider.scrollWidth - slider.clientWidth - 10);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkScrollButtons);
      // Initial check
      checkScrollButtons();
    }
    
    return () => {
      if (slider) {
        slider.removeEventListener('scroll', checkScrollButtons);
      }
    };
  }, []);

  const calculateDiscount = (price: number, discountedPrice?: number) => {
    if (!discountedPrice) return 0;
    return Math.round(((price - discountedPrice) / price) * 100);
  };

  return (
    <section className="py-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{t('featured_products')}</h2>
          <Link href="/products/featured" className="text-primary text-sm">
            {t('view_all')}
          </Link>
        </div>
        
        <p className="text-gray-600 mb-4">{t('handpicked_just_for_you')}</p>
        
        <div className="relative">
          {showLeftArrow && (
            <button 
              onClick={() => scroll('left')} 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          
          {showRightArrow && (
            <button 
              onClick={() => scroll('right')} 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
          
          <div 
            ref={sliderRef} 
            className="flex overflow-x-auto no-scrollbar gap-4 pb-4"
            onScroll={checkScrollButtons}
          >
            {loading ? (
              // Loading skeleton
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden min-w-[250px] max-w-[250px] flex-none">
                  <div className="px-4 pt-4 h-40 flex justify-center">
                    <div className="w-full h-full bg-gray-200 animate-pulse rounded-md"></div>
                  </div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-3"></div>
                    <div className="flex items-center mb-2">
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
                    </div>
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-24 mb-3"></div>
                    <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              ))
            ) : displayProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-lg shadow-sm overflow-hidden min-w-[250px] max-w-[250px] flex-none transition-shadow hover:shadow-md"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="relative px-4 pt-4 flex justify-center h-40">
                    <img 
                      src={getSafeImageUrl(product.imageUrl) || "/pillnow.png"} 
                      alt={product.name} 
                      className="h-full object-contain"
                    />
                    {product.discountedPrice && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {calculateDiscount(product.price, product.discountedPrice as number)}% {t('off')}
                      </div>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2 h-10">{product.name}</h3>
                    
                    {product.rating && (
                      <div className="flex items-center mb-2">
                        <div className="flex items-center bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          <span>{product.rating}</span>
                        </div>
                        {product.ratingCount && (
                          <span className="text-xs text-gray-500 ml-2">{product.ratingCount} {t('ratings')}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-baseline">
                      {product.discountedPrice ? (
                        <>
                          <span className="text-lg font-semibold">₹{(product.discountedPrice as number).toFixed(2)}</span>
                          <span className="text-gray-500 text-sm line-through ml-2">₹{product.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-lg font-semibold">₹{product.price.toFixed(2)}</span>
                      )}
                    </div>
                    
                    <Button 
                      className="mt-3 w-full flex items-center justify-center"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t('add_to_cart')}
                    </Button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSlider;