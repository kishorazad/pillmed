import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number | null;
  imageUrl?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
}

interface ProductSliderProps {
  title: string;
  viewMoreLink?: string;
  products: Product[];
}

const ProductSlider: React.FC<ProductSliderProps> = ({ 
  title, 
  viewMoreLink = '/products',
  products 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  useEffect(() => {
    // Check if we need to show the right scroll button on initial render
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowRightScroll(scrollWidth > clientWidth);
    }
  }, [products]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const renderDiscountPercentage = (price: number, discountedPrice: number) => {
    if (!discountedPrice || discountedPrice >= price) return null;
    const discount = Math.round(((price - discountedPrice) / price) * 100);
    return discount > 0 ? `${discount}%` : null;
  };

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">{title}</h2>
        {viewMoreLink && (
          <Link href={viewMoreLink}>
            <a className="text-sm font-medium text-[#10847e]">View All</a>
          </Link>
        )}
      </div>
      
      <div className="relative">
        {/* Scroll buttons */}
        {showLeftScroll && (
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md text-gray-600"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        
        {showRightScroll && (
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md text-gray-600"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
        
        {/* Products row */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto hide-scrollbar gap-3 py-2 pb-4"
          onScroll={handleScroll}
        >
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <a className="flex-shrink-0 w-36 rounded-lg p-2 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                {/* Product image */}
                <div className="h-24 mb-2 relative flex items-center justify-center">
                  <img 
                    src={product.imageUrl || 'https://via.placeholder.com/120'}
                    alt={product.name}
                    className="h-full object-contain mx-auto"
                  />
                  
                  {/* Discount tag */}
                  {product.discountedPrice && product.price && (
                    <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold py-1 px-1.5 rounded">
                      {renderDiscountPercentage(product.price, product.discountedPrice) || 'SALE'}
                    </div>
                  )}
                </div>
                
                {/* Product details */}
                <div>
                  <h3 className="text-xs font-medium mb-1 line-clamp-2 h-8">{product.name}</h3>
                  
                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center mb-1">
                      <div className="bg-green-700 text-white text-xs px-1 rounded flex items-center">
                        <span>{product.rating}</span>
                        <span className="text-xs">★</span>
                      </div>
                      {product.ratingCount && (
                        <span className="text-gray-500 text-xs ml-1">({product.ratingCount})</span>
                      )}
                    </div>
                  )}
                  
                  {/* Price */}
                  <div className="flex items-center">
                    <span className="font-bold text-sm">
                      ₹{product.discountedPrice || product.price}
                    </span>
                    
                    {product.discountedPrice && (
                      <span className="text-gray-500 text-xs line-through ml-1">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;