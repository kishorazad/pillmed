import React from 'react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';

interface CategoryItem {
  id: number;
  name: string;
  imageUrl?: string;
  link: string;
}

interface MedicineCategorySliderProps {
  categories: CategoryItem[];
}

const MedicineCategorySlider: React.FC<MedicineCategorySliderProps> = ({ categories }) => {
  // We'll auto-scroll through categories
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  // Auto scroll function
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        // If we reached the end, reset to the start
        return nextIndex >= Math.ceil(categories.length / 4) ? 0 : nextIndex;
      });
    }, 5000); // Auto scroll every 5 seconds
    
    return () => clearInterval(timer);
  }, [categories.length]);
  
  // Calculate display window (4 categories at a time)
  const displayCategories = () => {
    const startIdx = currentIndex * 4;
    return categories.slice(startIdx, startIdx + 4);
  };
  
  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Medicine Categories</h2>
        <Link href="/categories">
          <span className="text-sm font-medium text-[#10847e] flex items-center">
            All Categories <ChevronRight className="h-4 w-4 ml-1" />
          </span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg p-3">
        <div className="grid grid-cols-4 gap-3">
          {displayCategories().map((category) => (
            <Link key={category.id} href={category.link}>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 mb-2 rounded-full bg-[#f8f8f8] flex items-center justify-center overflow-hidden">
                  {category.imageUrl ? (
                    <img 
                      src={category.imageUrl} 
                      alt={category.name} 
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-[#10847e] rounded-full flex items-center justify-center text-white text-sm">
                      {category.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-xs text-center font-medium line-clamp-2">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Pagination dots */}
        {categories.length > 4 && (
          <div className="flex justify-center mt-3 space-x-1">
            {Array.from({ length: Math.ceil(categories.length / 4) }).map((_, index) => (
              <span 
                key={index}
                className={`w-2 h-2 rounded-full ${
                  currentIndex === index ? 'bg-[#10847e]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineCategorySlider;