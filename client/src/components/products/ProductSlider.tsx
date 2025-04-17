import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  discountedPrice?: number;
  rating?: number;
  ratingCount?: number;
}

interface ProductSliderProps {
  title: string;
  viewMoreLink: string;
  products: Product[];
  showDiscount?: boolean;
}

const ProductSlider: React.FC<ProductSliderProps> = ({ 
  title, 
  viewMoreLink, 
  products,
  showDiscount = true 
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Calculate discount percentage
  const getDiscountPercentage = (price: number, discountedPrice?: number) => {
    if (!discountedPrice) return 0;
    return Math.round(((price - discountedPrice) / price) * 100);
  };

  return (
    <div className="my-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link href={viewMoreLink}>
          <a className="text-sm text-[#10847e] font-medium hover:underline">View All</a>
        </Link>
      </div>
      
      <div className="relative group">
        {/* Navigation Buttons (Desktop) */}
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow-md z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 bg-white rounded-full p-2 shadow-md z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Product Slider */}
        <div 
          ref={sliderRef}
          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className="flex-shrink-0 w-[160px] sm:w-[200px] bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              <Link href={`/products/${product.id}`}>
                <a className="block">
                  <div className="relative h-32 sm:h-40 bg-gray-100">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-contain p-2"
                    />
                    {product.discountedPrice && showDiscount && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {getDiscountPercentage(product.price, product.discountedPrice)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 h-10 mb-1">{product.name}</h3>
                    
                    {product.rating !== undefined && (
                      <div className="flex items-center mb-1">
                        <div className="bg-green-500 text-white text-xs px-1 rounded flex items-center">
                          {product.rating}★
                        </div>
                        {product.ratingCount !== undefined && (
                          <span className="text-xs text-gray-500 ml-1">({product.ratingCount})</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-baseline">
                      <span className="font-bold text-sm">₹{product.discountedPrice || product.price}</span>
                      {product.discountedPrice && (
                        <span className="text-xs text-gray-500 line-through ml-1">₹{product.price}</span>
                      )}
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;