import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerSlide {
  id: number;
  imageUrl: string;
  title: string;
  link: string;
  backgroundColor: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    imageUrl: 'https://assets.pharmeasy.in/web-assets/_next/icons/home.svg',
    title: 'Order Medicines',
    link: '/products',
    backgroundColor: '#10847e'
  },
  {
    id: 2,
    imageUrl: 'https://assets.pharmeasy.in/web-assets/dist/4d2f7c48.svg',
    title: 'Healthcare Products',
    link: '/products',
    backgroundColor: '#4f8a10'
  },
  {
    id: 3,
    imageUrl: 'https://assets.pharmeasy.in/web-assets/dist/d8c0570c.svg',
    title: 'Lab Tests',
    link: '/lab-tests',
    backgroundColor: '#0f52ba'
  },
  {
    id: 4,
    imageUrl: 'https://assets.pharmeasy.in/web-assets/dist/be11a94a.svg',
    title: 'Chat with Doctor',
    link: '/doctors',
    backgroundColor: '#d53e4f'
  }
];

const MobileBannerCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Auto slide effect
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentSlide((prev) => (prev === bannerSlides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(intervalId);
  }, []);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev === bannerSlides.length - 1 ? 0 : prev + 1));
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
    }

    // Reset touch positions
    setTouchStart(null);
    setTouchEnd(null);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === bannerSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg my-4 md:my-6">
      {/* Mobile Carousel with Swipe */}
      <div 
        className="relative flex flex-nowrap overflow-hidden h-40 md:h-48"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {bannerSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
            style={{ backgroundColor: slide.backgroundColor }}
          >
            <div className="flex items-center justify-between h-full w-full px-4 md:px-8">
              <div className="text-white max-w-[60%]">
                <h3 className="text-xl md:text-2xl font-bold mb-2">{slide.title}</h3>
                <p className="text-sm md:text-base mb-3 hidden md:block">Best offers and discounts</p>
                <a href={slide.link}>
                  <Button size="sm" variant="outline" className="text-white border-white hover:bg-white/20">
                    Explore
                  </Button>
                </a>
              </div>
              <div className="flex-shrink-0 w-16 h-16 md:w-24 md:h-24 bg-white/10 p-2 rounded-full flex items-center justify-center">
                <img src={slide.imageUrl} alt={slide.title} className="w-10 h-10 md:w-16 md:h-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/60'
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows (visible only on larger screens) */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md hidden md:flex items-center justify-center"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md hidden md:flex items-center justify-center"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default MobileBannerCarousel;