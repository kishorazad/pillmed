import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface SliderContainerProps {
  children: ReactNode;
  title?: string;
  viewAllLink?: string;
  viewAllLabel?: string;
  showArrows?: boolean;
  className?: string;
  theme?: 'light' | 'colorful';
  accentColor?: string;
  highlight?: boolean;
  itemWidth?: number;
}

/**
 * A reusable slider container that handles horizontal scrolling with arrows
 * This maintains a consistent UI pattern across all sliding components with a modern design
 */
const SliderContainer: React.FC<SliderContainerProps> = ({
  children,
  title,
  viewAllLink,
  viewAllLabel = 'View All',
  showArrows = true,
  className = '',
  theme = 'light',
  accentColor = '#FF8F00',
  highlight = false,
  itemWidth = 100 // Default width of MobileGridItem
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
      // Calculate visible items
      const visibleWidth = sliderRef.current.clientWidth;
      const itemsPerPage = Math.max(1, Math.floor(visibleWidth / (itemWidth + 16))); // 16px for gap
      const scrollAmount = itemsPerPage * itemWidth;
      
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

  // Theme styles
  const themeStyles = {
    light: {
      container: '',
      title: 'text-gray-800',
      viewAll: `text-[${accentColor}]`,
      arrowBg: 'bg-white',
      arrowShadow: 'shadow-md',
      arrowColor: `text-[${accentColor}]`,
    },
    colorful: {
      container: `bg-gradient-to-r from-[${accentColor}]/5 to-[${accentColor}]/10 rounded-2xl p-4`,
      title: `text-[${accentColor}]`,
      viewAll: `text-[${accentColor}]`,
      arrowBg: `bg-[${accentColor}]`,
      arrowShadow: 'shadow-lg',
      arrowColor: 'text-white',
    }
  };

  const styles = themeStyles[theme];

  return (
    <div className={`my-6 ${styles.container} ${className}`}>
      {title && (
        <div className={`flex justify-between items-center mb-4 ${highlight ? 'relative' : ''}`}>
          <h2 className={`text-xl font-bold ${styles.title} flex items-center`}>
            {title}
            {highlight && <Sparkles className="h-4 w-4 ml-2 text-yellow-500" />}
          </h2>
          {viewAllLink && (
            <a 
              href={viewAllLink} 
              className={`text-sm font-medium ${styles.viewAll} flex items-center hover:underline`}
            >
              {viewAllLabel} <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          )}
          {highlight && (
            <div 
              className="absolute -left-4 top-0 bottom-0 w-1" 
              style={{ backgroundColor: accentColor }}
            ></div>
          )}
        </div>
      )}
      
      <div className="relative">
        {showArrows && showLeftArrow && (
          <button 
            onClick={() => scroll('left')} 
            className={`
              absolute left-2 top-1/2 -translate-y-1/2 z-10 
              ${styles.arrowBg} ${styles.arrowColor} rounded-full ${styles.arrowShadow} 
              p-2 transition-transform hover:scale-110
            `}
            aria-label="Scroll left"
            style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        
        {showArrows && showRightArrow && (
          <button 
            onClick={() => scroll('right')} 
            className={`
              absolute right-2 top-1/2 -translate-y-1/2 z-10 
              ${styles.arrowBg} ${styles.arrowColor} rounded-full ${styles.arrowShadow}
              p-2 transition-transform hover:scale-110
            `}
            aria-label="Scroll right"
            style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
        
        <div 
          ref={sliderRef} 
          className="flex overflow-x-auto no-scrollbar gap-4 pb-4 pl-2 pr-2"
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