import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  
  // Custom banners for desktop
  const banners: Banner[] = [
    {
      id: 1,
      imageUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Crect width="800" height="400" fill="%23FF8C00" /%3E%3Ctext x="400" y="200" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle"%3EOnline Pharmacy Services%3C/text%3E%3Ctext x="400" y="250" font-family="Arial" font-size="22" fill="white" text-anchor="middle" dominant-baseline="middle"%3EOrder medicines online with free home delivery%3C/text%3E%3C/svg%3E',
      title: "Take care of your health from home",
      description: "Order medicines online and get them delivered at your doorstep",
      buttonText: "Order Medicines",
      buttonLink: "/products"
    },
    {
      id: 2,
      imageUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Crect width="800" height="400" fill="%23FF6347" /%3E%3Ctext x="400" y="200" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle"%3EHome Lab Tests%3C/text%3E%3Ctext x="400" y="250" font-family="Arial" font-size="22" fill="white" text-anchor="middle" dominant-baseline="middle"%3E60%25 OFF on all diagnostic tests%3C/text%3E%3C/svg%3E',
      title: "Book health checkup packages",
      description: "Get comprehensive health checkups at home with up to 60% discount",
      buttonText: "Book Lab Test",
      buttonLink: "/lab-tests"
    },
    {
      id: 3,
      imageUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Crect width="800" height="400" fill="%23FFA500" /%3E%3Ctext x="400" y="200" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle"%3EAI Health Assistant%3C/text%3E%3Ctext x="400" y="250" font-family="Arial" font-size="22" fill="white" text-anchor="middle" dominant-baseline="middle"%3EGet instant answers to your health questions%3C/text%3E%3C/svg%3E',
      title: "AI-powered health assistant",
      description: "Get instant answers to your health questions with our AI assistant",
      buttonText: "Chat Now",
      buttonLink: "/ai-healthcare"
    },
  ];

  // Function to start auto-rotation
  const startAutoScroll = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // Auto-scroll every 5 seconds
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

  const currentBanner = banners[currentIndex];

  return (
    <section className="bg-gradient-to-r from-orange-100 to-amber-100 py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center relative">
          <div className="md:w-1/2 mb-6 md:mb-0 z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{currentBanner.title}</h1>
            <p className="text-gray-600 mb-6">{currentBanner.description}</p>
            <div className="flex flex-col md:flex-row gap-4">
              <Button asChild className="bg-orange-500 text-white hover:bg-orange-600">
                <Link href={currentBanner.buttonLink}>
                  {currentBanner.buttonText}
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                <Link href="/consult">
                  Consult Doctor
                </Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center relative">
            <img 
              src={currentBanner.imageUrl}
              alt={currentBanner.title} 
              className="rounded-lg shadow-md max-w-full md:max-w-md h-auto object-cover transition-opacity duration-500"
            />
            {/* Navigation arrows */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <button 
                onClick={goToPrevious}
                className="bg-white/70 hover:bg-white rounded-full p-2 text-orange-500"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={goToNext}
                className="bg-white/70 hover:bg-white rounded-full p-2 text-orange-500"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Indicator dots */}
        <div className="flex justify-center mt-4 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (autoScrollRef.current) clearInterval(autoScrollRef.current);
                setCurrentIndex(index);
                startAutoScroll();
              }}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex ? 'bg-orange-500' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
