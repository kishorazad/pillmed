import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: number;
  imageUrl: string;
  altText: string;
  link: string;
}

const MobileBannerCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
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

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  return (
    <div className="relative mb-6 mt-2">
      <div className="overflow-hidden rounded-xl relative">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner) => (
            <Link key={banner.id} href={banner.link}>
              <a className="flex-shrink-0 w-full">
                <img
                  src={banner.imageUrl}
                  alt={banner.altText}
                  className="w-full h-auto object-cover rounded-xl"
                />
              </a>
            </Link>
          ))}
        </div>
        
        {/* Navigation Buttons */}
        <button 
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 rounded-full p-1 shadow-md text-gray-700"
          aria-label="Previous banner"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <button 
          onClick={goToNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 rounded-full p-1 shadow-md text-gray-700"
          aria-label="Next banner"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        
        {/* Dots indicator */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileBannerCarousel;