import React from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'wouter';

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
  
  // Sample offers data
  const offers: FestivalOffer[] = [
    {
      id: 1,
      name: 'Diwali Special',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/80d465aa6e6-GRAND.jpg',
      discount: 30,
      offerCode: 'DIWALI30',
      expiryDate: '2025-04-28'
    },
    {
      id: 2,
      name: 'Summer Health',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/a9ad640ce86-DIABETES.jpg',
      discount: 25,
      offerCode: 'SUMMER25',
      expiryDate: '2025-05-10'
    },
    {
      id: 3,
      name: 'Weekend Special',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/fcbf95577c7-MEGA.jpg',
      discount: 20,
      offerCode: 'WEEKEND20',
      expiryDate: '2025-04-25'
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
          <Link href="/offers/festival" className="text-primary flex items-center text-sm">
            {t('view_all')} <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <p className="text-gray-600 mb-4">{t('limited_time_offers_and_deals')}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <Link key={offer.id} href={`/offers/${offer.id}`}>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden transition duration-300 hover:shadow-md cursor-pointer">
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
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{offer.name}</h3>
                  <div className="flex justify-between items-center">
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