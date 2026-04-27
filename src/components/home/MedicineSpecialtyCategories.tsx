import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define interfaces
interface SpecialtyCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string; // Use lightweight SVG icons instead of images
}

interface MedicineSpecialtyCategoriesProps {
  title?: string;
}

// Optimized category cards with no images (using icons instead)
const CategoryCard = ({ category }: { category: SpecialtyCategory }) => (
  <div className="flex-shrink-0 w-[180px] rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
    <div className="block h-full">
      <div className="h-24 bg-primary/10 flex items-center justify-center relative">
        <div 
          className="w-12 h-12 flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: category.icon }}
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-md mb-1">{category.name}</h3>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{category.description}</p>
        <Link href={`/products/specialty/${category.slug}`}>
          <Button variant="outline" size="sm" className="w-full text-xs py-1">
            Browse
          </Button>
        </Link>
      </div>
    </div>
  </div>
);

const MedicineSpecialtyCategories = ({ title = "Medicines by Specialty" }: MedicineSpecialtyCategoriesProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Predefined specialty categories using SVG icons instead of images
  const specialtyCategories: SpecialtyCategory[] = [
    {
      id: 'orthopedic',
      name: 'Orthopedic',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M17 12c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h6c1.1 0 2 .9 2.1 2v4z"></path><path d="M12 18v4"></path><path d="M8 18v4"></path><path d="M16 18v4"></path><path d="M9 6V2"></path><path d="M15 6V2"></path></svg>',
      description: 'Medications for bone, joint, and muscle health',
      slug: 'orthopedic'
    },
    {
      id: 'gynecologist',
      name: 'Gynecology',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 22a8 8 0 0 0 8-8"></path><path d="M12 22a8 8 0 0 1-8-8"></path><path d="M12 22V9"></path><circle cx="12" cy="5" r="3"></circle></svg>',
      description: 'Women\'s health and reproductive care',
      slug: 'gynecology'
    },
    {
      id: 'dental',
      name: 'Dental',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1"></path><path d="m8 10 2-2h6"></path><path d="m10 8 5 8"></path><path d="m8 16 2-2"></path></svg>',
      description: 'Oral health and dental care products',
      slug: 'dental'
    },
    {
      id: 'cardiology',
      name: 'Cardiology',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>',
      description: 'Heart health and cardiovascular medications',
      slug: 'cardiology'
    },
    {
      id: 'pediatric',
      name: 'Pediatric',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M9 12h.01"></path><path d="M15 12h.01"></path><path d="M10 16c.5.3 1.1.5 2 .5s1.5-.2 2-.5"></path><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"></path></svg>',
      description: 'Children\'s health and medications',
      slug: 'pediatric'
    },
    {
      id: 'dermatology',
      name: 'Dermatology',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M8 14v-4"></path><path d="M12 14v-2"></path><path d="M16 14v-6"></path><path d="M19 14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3Z"></path></svg>',
      description: 'Skin care and dermatological products',
      slug: 'dermatology'
    },
    {
      id: 'neurology',
      name: 'Neurology',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><circle cx="12" cy="12" r="3"></circle><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5"></path></svg>',
      description: 'Treatments for neurological disorders',
      slug: 'neurology'
    },
    {
      id: 'respiratory',
      name: 'Respiratory',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M8 4h8"></path><path d="M12 4v7"></path><path d="M6 8h12"></path><rect width="8" height="4" x="8" y="16" rx="1"></rect><path d="M18 16c0-2.4-1.9-4-3-4l-6 .7V16"></path></svg>',
      description: 'Asthma and respiratory health products',
      slug: 'respiratory'
    }
  ];

  // Optimized scroll function
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  // Debounced scroll handler for better performance
  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  // Optimized useEffect with passive event listener
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      // Use passive true for better scroll performance
      slider.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => slider.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="relative my-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <Link href="/products/specialty">
          <div className="text-primary text-sm font-medium hover:underline">View All</div>
        </Link>
      </div>

      {/* Navigation arrows */}
      {showLeftArrow && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md hover:bg-white"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-primary" />
        </button>
      )}

      {/* Optimized category slider with smaller cards */}
      <div 
        ref={sliderRef}
        className="flex gap-3 overflow-x-auto pb-3 hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {specialtyCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {showRightArrow && (
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md hover:bg-white"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-primary" />
        </button>
      )}
    </div>
  );
};

export default MedicineSpecialtyCategories;