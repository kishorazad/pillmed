import React, { useRef, useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Offer {
  id: number;
  imageUrl: string;
  alt: string;
  link: string;
}

interface OffersCarouselProps {
  offers: Offer[];
}

const OffersCarousel: React.FC<OffersCarouselProps> = ({ offers }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  return (
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
      
      {/* Carousel content */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto hide-scrollbar gap-4 py-2 px-1"
        onScroll={handleScroll}
      >
        {offers.map((offer) => (
          <Link key={offer.id} href={offer.link}>
            <a className="flex-shrink-0 w-[85%] rounded-lg overflow-hidden shadow-sm">
              <img 
                src={offer.imageUrl}
                alt={offer.alt}
                className="w-full h-auto object-cover"
              />
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OffersCarousel;