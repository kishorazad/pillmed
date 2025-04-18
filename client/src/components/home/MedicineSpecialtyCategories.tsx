import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Define interfaces
interface SpecialtyCategory {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  slug: string;
}

interface MedicineSpecialtyCategoriesProps {
  title?: string;
}

const MedicineSpecialtyCategories = ({ title = "Medicines by Specialty" }: MedicineSpecialtyCategoriesProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Predefined specialty categories
  const specialtyCategories: SpecialtyCategory[] = [
    {
      id: 'orthopedic',
      name: 'Orthopedic',
      imageUrl: '/assets/categories/orthopedic.png',
      description: 'Medications for bone, joint, and muscle health',
      slug: 'orthopedic'
    },
    {
      id: 'gynecologist',
      name: 'Gynecology',
      imageUrl: '/assets/categories/gynecology.png',
      description: 'Women\'s health and reproductive care',
      slug: 'gynecology'
    },
    {
      id: 'dental',
      name: 'Dental',
      imageUrl: '/assets/categories/dental.png',
      description: 'Oral health and dental care products',
      slug: 'dental'
    },
    {
      id: 'cardiology',
      name: 'Cardiology',
      imageUrl: '/assets/categories/cardiology.png',
      description: 'Heart health and cardiovascular medications',
      slug: 'cardiology'
    },
    {
      id: 'pediatric',
      name: 'Pediatric',
      imageUrl: '/assets/categories/pediatric.png',
      description: 'Children\'s health and medications',
      slug: 'pediatric'
    },
    {
      id: 'dermatology',
      name: 'Dermatology',
      imageUrl: '/assets/categories/dermatology.png',
      description: 'Skin care and dermatological products',
      slug: 'dermatology'
    }
  ];

  // Function to scroll the slider left
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  // Function to scroll the slider right
  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Update arrow visibility based on scroll position
  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleScroll);
      // Initial check for arrows
      handleScroll();
      return () => slider.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="relative my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <Link href="/products/specialty">
          <a className="text-primary text-sm font-medium hover:underline">View All</a>
        </Link>
      </div>

      {/* Left arrow */}
      {showLeftArrow && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md hover:bg-white"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6 text-primary" />
        </button>
      )}

      {/* Specialty Categories Slider */}
      <div 
        ref={sliderRef}
        className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {specialtyCategories.map((category) => (
          <Card 
            key={category.id}
            className="flex-shrink-0 w-[250px] hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            <Link href={`/products/specialty/${category.slug}`}>
              <a className="block h-full">
                <div className="h-32 bg-gray-100 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                  <img 
                    src={category.imageUrl} 
                    alt={category.name}
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/250x150?text=Medicine+Category';
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Browse Products
                  </Button>
                </CardContent>
              </a>
            </Link>
          </Card>
        ))}
      </div>

      {/* Right arrow */}
      {showRightArrow && (
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md hover:bg-white"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6 text-primary" />
        </button>
      )}
    </div>
  );
};

export default MedicineSpecialtyCategories;