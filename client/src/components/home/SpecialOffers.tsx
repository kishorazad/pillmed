import React from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { ArrowRightIcon, Tag } from 'lucide-react';
import { Link } from 'wouter';

interface SpecialOffer {
  id: number;
  name: string;
  imageUrl: string;
  discount: number;
  description: string;
  tag?: string;
}

const SpecialOffers: React.FC = () => {
  const { t } = useLanguage();
  
  // Sample special offers data
  const offers: SpecialOffer[] = [
    {
      id: 1,
      name: 'Diabetes Care',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/a9ad640ce86-DIABETES.jpg',
      discount: 35,
      description: 'Special discounts on diabetes medication and supplies',
      tag: 'Health Specific'
    },
    {
      id: 2,
      name: 'First Order Discount',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/7297689b081-FIRST.jpg',
      discount: 25,
      description: 'Special offer for first-time customers',
      tag: 'New Users'
    },
    {
      id: 3,
      name: 'Cardiac Care',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/e695cef1018-CARDIAC-min.jpg',
      discount: 30,
      description: 'Special discounts on heart health products',
      tag: 'Health Specific'
    },
    {
      id: 4,
      name: 'Membership Deal',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/9bf974c173d-MEMBERSHIP.jpg',
      discount: 20,
      description: 'Exclusive discounts for members',
      tag: 'Members Only'
    }
  ];

  return (
    <section className="py-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{t('special_offers')}</h2>
          <Link href="/offers/special" className="text-primary flex items-center text-sm">
            {t('view_all')} <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <p className="text-gray-600 mb-4">{t('exclusive_discounts_for_you')}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {offers.map((offer) => (
            <Link key={offer.id} href={`/offers/special/${offer.id}`}>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden transition duration-300 hover:shadow-md cursor-pointer h-full flex flex-col">
                <div className="relative">
                  <img 
                    src={offer.imageUrl} 
                    alt={offer.name} 
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 m-2 rounded-full text-sm font-medium">
                    {t('get_percent_off', { percent: offer.discount.toString() })}
                  </div>
                  {offer.tag && (
                    <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white px-3 py-1 m-2 rounded-sm text-xs font-medium flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {offer.tag}
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-semibold text-lg mb-2">{offer.name}</h3>
                  <p className="text-sm text-gray-600 flex-grow">{offer.description}</p>
                  <div className="mt-3 text-primary text-sm font-medium">
                    {t('view_all')}
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

export default SpecialOffers;