import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { usePreload } from '@/hooks/use-preload';
import { getSafeImageUrl } from '@/utils/imageUtils';

interface CategoryItem {
  id: number;
  name: string;
  imageUrl?: string | null;
  link: string;
}

interface MedicineCategorySliderProps {
  categories: CategoryItem[];
}

const MedicineCategorySlider: React.FC<MedicineCategorySliderProps> = ({ categories }) => {
  // References and state
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const preload = usePreload();
  
  // Auto scroll function (disabled when user interacts)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  
  useEffect(() => {
    if (!autoScrollEnabled) return;
    
    const timer = setInterval(() => {
      if (sliderRef.current) {
        const maxScrollLeft = sliderRef.current.scrollWidth - sliderRef.current.clientWidth;
        
        if (sliderRef.current.scrollLeft >= maxScrollLeft - 10) {
          // Reset to start when reaching the end
          sliderRef.current.scrollLeft = 0;
        } else {
          // Advance to next set
          sliderRef.current.scrollLeft += 180; // Approximate width of one grid item
        }
        
        checkScrollButtons();
      }
    }, 5000); // Auto scroll every 5 seconds
    
    return () => clearInterval(timer);
  }, [autoScrollEnabled]);
  
  // Preload images for better user experience
  useEffect(() => {
    if (categories && categories.length > 0) {
      // Immediately preload the first 4 visible images
      categories.slice(0, 4).forEach(category => {
        if (category.imageUrl) {
          preload.image(getSafeImageUrl(category.imageUrl, 'SMALL'), 'high');
        }
      });
      
      // Preload the next batch with lower priority
      setTimeout(() => {
        categories.slice(4, 8).forEach(category => {
          if (category.imageUrl) {
            preload.image(getSafeImageUrl(category.imageUrl, 'SMALL'));
          }
        });
      }, 1000);
    }
  }, [categories, preload]);
  
  // Scroll functions
  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      setAutoScrollEnabled(false); // Disable auto-scroll on manual interaction
      
      const scrollAmount = 180; // Width of item + gap
      const newScrollLeft = direction === 'left' 
        ? sliderRef.current.scrollLeft - scrollAmount
        : sliderRef.current.scrollLeft + scrollAmount;
        
      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };
  
  const checkScrollButtons = () => {
    if (sliderRef.current) {
      setShowLeftArrow(sliderRef.current.scrollLeft > 10);
      setShowRightArrow(sliderRef.current.scrollLeft < sliderRef.current.scrollWidth - sliderRef.current.clientWidth - 10);
    }
  };
  
  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Medicine Categories</h2>
        <Link href="/categories">
          <span className="text-sm font-medium text-[#FF8F00] flex items-center">
            All Categories <ChevronRight className="h-4 w-4 ml-1" />
          </span>
        </Link>
      </div>
      
      <div className="relative">
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        
        {showRightArrow && (
          <button 
            onClick={() => scroll('right')} 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
        
        <div 
          ref={sliderRef} 
          className="flex overflow-x-auto no-scrollbar gap-4 pb-4"
          onScroll={checkScrollButtons}
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {categories.map((category) => (
            <Link key={category.id} href={category.link}>
              <div 
                className="flex-none w-[90px] h-[118px] flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-2 transition-shadow hover:shadow-md"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="w-[88.4px] h-[72.33px] mb-2 flex items-center justify-center overflow-hidden">
                  {category.imageUrl ? (
                    <img 
                      src={getSafeImageUrl(category.imageUrl) || "/placeholder-category.png"} 
                      alt={category.name} 
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-[#FF8F00] rounded-full flex items-center justify-center text-white text-xl">
                      {category.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-xs text-center font-medium line-clamp-2 h-10 flex items-center">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Mobile-friendly indicator dots */}
        <div className="flex justify-center mt-3 space-x-1 md:hidden">
          <ChevronDown className="h-4 w-4 text-[#FF8F00]" />
        </div>
      </div>
    </div>
  );
};

export default MedicineCategorySlider;