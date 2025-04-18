import React, { useRef } from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { ArrowRightIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { useMediaQuery } from '@/hooks/use-media-query';

interface Brand {
  id: number;
  name: string;
  imageUrl: string;
  description?: string;
}

const BrandPromotions: React.FC = () => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  // Sample brands data
  const brands: Brand[] = [
    {
      id: 1,
      name: 'Himalaya',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/6d462f424a43372ea8b7b6f8ee455ae5.png',
      description: 'Natural healthcare products'
    },
    {
      id: 2,
      name: 'Dabur',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/335dae76832d370c94f0440f5ba89e1f.png',
      description: 'Ayurvedic healthcare'
    },
    {
      id: 3,
      name: 'Baidyanath',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/2f85888a0a4f3d22a65931aef6355a77.png',
      description: 'Traditional remedies'
    },
    {
      id: 4,
      name: 'Dr. Morepen',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/ecad9a974a273b658f32c2ac65d736f9.png',
      description: 'Healthcare devices'
    },
    {
      id: 5,
      name: 'Zandu',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/105ceca515ee30509f93309ae75306aa.png',
      description: 'Ayurvedic healthcare'
    },
    {
      id: 6,
      name: 'Patanjali',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/c9cfac89b6f63dd1a151c7fb23a8d830.png',
      description: 'Ayurvedic products'
    }
  ];

  return (
    <section className="py-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{t('featured_brands')}</h2>
          <div className="flex items-center">
            {!isMobile && (
              <div className="flex gap-2 mr-4">
                <button 
                  onClick={handleScrollLeft}
                  className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleScrollRight}
                  className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            <Link href="/brands" className="text-primary flex items-center text-sm">
              {t('view_all')} <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{t('shop_by_your_trusted_brands')}</p>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {brands.map((brand) => (
            <Link 
              key={brand.id} 
              href={`/brands/${brand.id}`}
              className="snap-start min-w-[160px] max-w-[180px] flex-shrink-0"
            >
              <div className="bg-white rounded-lg shadow-sm p-4 transition duration-300 hover:shadow-md flex flex-col items-center text-center cursor-pointer h-full">
                <div className="w-20 h-20 mb-3 flex items-center justify-center">
                  <img 
                    src={brand.imageUrl} 
                    alt={brand.name} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <h3 className="font-medium text-sm">{brand.name}</h3>
                {brand.description && (
                  <p className="text-xs text-gray-500 mt-1">{brand.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandPromotions;