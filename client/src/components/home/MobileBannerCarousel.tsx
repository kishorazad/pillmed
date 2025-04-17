import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Upload, Stethoscope, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Banner {
  id: number;
  imageUrl: string;
  altText: string;
  link: string;
}

const MobileBannerCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Sample banner data
  const banners: Banner[] = [
    {
      id: 1,
      imageUrl: 'https://assets.pharmeasy.in/apothecary/images/medicine_ff.webp?dim=360x0',
      altText: 'Order medicines online',
      link: '/products'
    },
    {
      id: 2,
      imageUrl: 'https://assets.pharmeasy.in/apothecary/images/labtest_ff.webp?dim=360x0',
      altText: 'Book lab tests',
      link: '/lab-tests'
    },
    {
      id: 3,
      imageUrl: 'https://assets.pharmeasy.in/apothecary/images/healthcare_ff.webp?dim=360x0',
      altText: 'Healthcare products',
      link: '/products'
    }
  ];

  // Function to start auto-rotation
  const startAutoScroll = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000); // Auto-scroll every 3 seconds
  };

  // Initialize auto-rotation on component mount
  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [banners.length]);

  const goToPrevious = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
    startAutoScroll();
  };

  const goToNext = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    startAutoScroll();
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (diff > 50) {
      // Swipe left, go next
      goToNext();
    } else if (diff < -50) {
      // Swipe right, go previous
      goToPrevious();
    } else {
      // No significant swipe, restart auto-scroll
      startAutoScroll();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative mb-4 mt-2">
        <div 
          className="overflow-hidden rounded-xl relative"
          ref={carouselRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {banners.map((banner) => (
              <Link key={banner.id} href={banner.link}>
                <div className="flex-shrink-0 w-full">
                  <img
                    src={banner.imageUrl}
                    alt={banner.altText}
                    className="w-full h-auto object-cover rounded-xl"
                    loading="eager" // Prioritize loading
                  />
                </div>
              </Link>
            ))}
          </div>
          
          {/* Navigation Buttons - removed from mobile view for cleaner look */}
          
          {/* Dots indicator */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (autoScrollRef.current) clearInterval(autoScrollRef.current);
                  setCurrentIndex(index);
                  startAutoScroll();
                }}
                className={`h-2 w-2 rounded-full ${
                  index === currentIndex ? 'bg-[#10847e]' : 'bg-gray-300'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Healthcare Services */}
      <div className="grid grid-cols-2 gap-3">
        {/* Upload Prescription */}
        <div className="bg-gradient-to-r from-[#e3f6f5] to-[#d0f0ef] rounded-lg p-3 flex flex-col items-center">
          <Upload className="text-[#10847e] h-6 w-6 mb-1" />
          <span className="text-sm font-medium text-center">Upload Prescription</span>
          <span className="text-xs text-gray-600 mt-1 text-center">Quick order via prescription</span>
        </div>
        
        {/* Consult Doctor */}
        <div className="bg-gradient-to-r from-[#fef3d7] to-[#fdeec2] rounded-lg p-3 flex flex-col items-center">
          <Stethoscope className="text-[#ff6f61] h-6 w-6 mb-1" />
          <span className="text-sm font-medium text-center">Consult Doctor</span>
          <span className="text-xs text-gray-600 mt-1 text-center">Online consultation</span>
        </div>
      </div>

      {/* Health Checkup */}
      <div className="bg-gradient-to-r from-[#e5f3ff] to-[#d4ecff] rounded-lg p-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-bold mb-1">Health Checkup at Home</h3>
          <p className="text-xs text-gray-600">70+ tests available</p>
          <Button variant="default" size="sm" className="mt-2 bg-[#10847e] hover:bg-[#0a655e] text-white text-xs">
            Book Now
          </Button>
        </div>
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
          <HeartPulse className="text-[#10847e] h-10 w-10" />
        </div>
      </div>
    </div>
  );
};

export default MobileBannerCarousel;