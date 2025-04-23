import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SliderContainerProps {
  children: ReactNode;
  title?: string;
  viewAllLink?: string;
  viewAllLabel?: string;
  showArrows?: boolean;
  className?: string;
}

/**
 * A reusable slider container that handles horizontal scrolling with arrows
 * This maintains a consistent UI pattern across all sliding components
 */
const SliderContainer: React.FC<SliderContainerProps> = ({
  children,
  title,
  viewAllLink,
  viewAllLabel = 'View All',
  showArrows = true,
  className = ''
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check if scroll buttons should be shown
  const checkScrollButtons = () => {
    if (sliderRef.current) {
      setShowLeftArrow(sliderRef.current.scrollLeft > 10);
      setShowRightArrow(
        sliderRef.current.scrollLeft < 
        sliderRef.current.scrollWidth - sliderRef.current.clientWidth - 10
      );
    }
  };

  // Scroll function
  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 90; // Width of one MobileGridItem
      const newScrollLeft = direction === 'left' 
        ? sliderRef.current.scrollLeft - scrollAmount
        : sliderRef.current.scrollLeft + scrollAmount;
        
      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll buttons on mount and resize
  useEffect(() => {
    checkScrollButtons();
    
    const handleResize = () => {
      checkScrollButtons();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`my-6 ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">{title}</h2>
          {viewAllLink && (
            <a href={viewAllLink} className="text-sm font-medium text-[#FF8F00] flex items-center">
              {viewAllLabel} <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          )}
        </div>
      )}
      
      <div className="relative">
        {showArrows && showLeftArrow && (
          <button 
            onClick={() => scroll('left')} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        
        {showArrows && showRightArrow && (
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
          {children}
        </div>
      </div>
    </div>
  );
};

export default SliderContainer;