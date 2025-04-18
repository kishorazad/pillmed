import React from 'react';
import CategoryPromotions from './CategoryPromotions';
import { useLanguage } from '@/components/LanguageSwitcher';

const FestivalOffers: React.FC = () => {
  const { t } = useLanguage();
  
  // Festival offers data
  const festivalOffers = [
    {
      id: 1,
      title: 'Summer Sale',
      description: 'Up to 30% off on summer essentials',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/1f6c578a-89e5-4814-8bc4-1d9e2bdc3df4.jpg',
      link: '/offers/summer-sale',
      backgroundColor: '#FFF4E5',
    },
    {
      id: 2,
      title: 'Monsoon Care',
      description: 'Big discounts on immunity boosters',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/8fe374c3-fd48-4234-a827-e5e590bdbb6f.jpg',
      link: '/offers/monsoon-care',
      backgroundColor: '#E6F7FF',
    },
    {
      id: 3,
      title: 'Diabetes Day',
      description: 'Special deals on diabetes care',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/9da8ae67-0c2e-4273-b688-c6fc669bf761.jpg',
      link: '/offers/diabetes-day',
      backgroundColor: '#F5E6FF',
    },
    {
      id: 4,
      title: 'Women\'s Health',
      description: 'Health essentials for women',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/c3f9ab30-1837-4866-aea3-3407e14d8b9d.jpg',
      link: '/offers/womens-health',
      backgroundColor: '#FFE6EA',
    }
  ];
  
  return (
    <CategoryPromotions
      title={t('festival_offers')}
      description={t('limited_time_offers_and_deals')}
      promotions={festivalOffers}
      variant="festival"
    />
  );
};

export default FestivalOffers;