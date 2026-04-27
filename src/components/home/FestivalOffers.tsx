import React, { useRef } from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { ArrowRightIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { useMediaQuery } from '@/hooks/use-media-query';

interface FestivalOffer {
  id: number;
  name: string;
  imageUrl: string;
  discount: number;
  offerCode: string;
  expiryDate: string;
}

const FestivalOffers: React.FC = () => {
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
  
  // Sample offers data
  const offers: FestivalOffer[] = [
    {
      id: 1,
      name: 'Diwali Special',
      imageUrl: '/pillnow.png',
      discount: 30,
      offerCode: 'DIWALI30',
      expiryDate: '2025-04-28'
    },
    {
      id: 2,
      name: 'Summer Health',
      imageUrl: '/pillnow.png',
      discount: 25,
      offerCode: 'SUMMER25',
      expiryDate: '2025-05-10'
    },
    {
      id: 3,
      name: 'Weekend Special',
      imageUrl: '/pillnow.png',
      discount: 20,
      offerCode: 'WEEKEND20',
      expiryDate: '2025-04-25'
    },
    {
      id: 4,
      name: 'Navratri Offer',
      imageUrl: '/pillnow.png',
      discount: 35,
      offerCode: 'NAVRATRI35',
      expiryDate: '2025-05-15'
    },
    {
      id: 5,
      name: 'Senior Citizens Discount',
      imageUrl: '/pillnow.png',
      discount: 15,
      offerCode: 'SENIOR15',
      expiryDate: '2025-06-30'
    },
    {
      id: 6,
      name: 'First Order Special',
      imageUrl: '/pillnow.png',
      discount: 40,
      offerCode: 'FIRST40',
      expiryDate: '2025-05-01'
    }
  ];

  // Function to calculate days remaining until expiry
  const getDaysRemaining = (expiryDate: string): number => {
    const currentDate = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <section className="py-6 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{t('festival_offers')}</h2>
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
            <Link href="/offers/festival" className="text-primary flex items-center text-sm">
              {t('view_all')} <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{t('limited_time_offers_and_deals')}</p>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {offers.map((offer) => (
            <Link 
              key={offer.id} 
              href={`/offers/${offer.id}`}
              className="snap-start min-w-[280px] max-w-[320px] flex-shrink-0"
            >
              <div className="bg-white rounded-lg shadow-sm overflow-hidden transition duration-300 hover:shadow-md cursor-pointer h-full flex flex-col">
                <div className="h-40 overflow-hidden relative">
                  <img 
                    src={offer.imageUrl} 
                    alt={offer.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 m-2 rounded-full text-sm font-medium">
                    {offer.discount}% {t('off')}
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-semibold text-lg mb-1">{offer.name}</h3>
                  <div className="flex justify-between items-center mt-auto">
                    <div className="bg-gray-100 px-2 py-1 rounded-md text-sm">
                      <span className="font-medium">{offer.offerCode}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {getDaysRemaining(offer.expiryDate) > 0 ? (
                        <span>{getDaysRemaining(offer.expiryDate)} days left</span>
                      ) : (
                        <span className="text-red-500">Expired</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FestivalOffers;