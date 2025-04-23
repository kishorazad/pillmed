import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HospitalImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

const HospitalImageCarousel = ({ 
  images, 
  alt,
  className = "" 
}: HospitalImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle next image
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Handle previous image
  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Handle direct navigation to a specific image
  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  // If no images provided, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className={`relative h-64 md:h-96 bg-gray-100 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          No images available
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Main image */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500"
          onError={(e) => {
            // Fallback to a placeholder if image fails to load
            (e.target as HTMLImageElement).src = '/hospital-placeholder.jpg';
          }}
        />
        
        {/* Navigation arrows for larger screens */}
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/70 hover:bg-white/90 rounded-full hidden md:flex"
            onClick={prevImage}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/70 hover:bg-white/90 rounded-full hidden md:flex"
            onClick={nextImage}
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Small indicator dots for touch navigation */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Thumbnails navigation */}
      {images.length > 1 && (
        <div className="flex mt-2 overflow-x-auto space-x-2 pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`relative flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/hospital-placeholder.jpg';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HospitalImageCarousel;