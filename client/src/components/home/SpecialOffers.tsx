import React from 'react';
import CategoryPromotions from './CategoryPromotions';
import { useLanguage } from '@/components/LanguageSwitcher';

const SpecialOffers: React.FC = () => {
  const { t } = useLanguage();
  
  // Special offers data
  const specialOffers = [
    {
      id: 1,
      title: 'First Order Discount',
      description: 'Get 10% off on your first order',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/52802a4eff23-Diabetes.jpg',
      link: '/offers/first-order',
      backgroundColor: '#FFE4E6',
    },
    {
      id: 2,
      title: 'Senior Citizen Benefits',
      description: 'Extra 5% off for senior citizens',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/d71f5be3262-Thyroid.jpg',
      link: '/offers/senior-citizen',
      backgroundColor: '#E0F2FE',
    },
    {
      id: 3,
      title: 'Lab Test Offers',
      description: 'Up to 70% off on all lab tests',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/5e840a142b3-CB.jpg',
      link: '/offers/lab-tests',
      backgroundColor: '#ECFCCB',
    },
    {
      id: 4,
      title: 'Membership Savings',
      description: 'Save more with our membership',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/d41c5c66efe-Health_Packages.jpg',
      link: '/offers/membership',
      backgroundColor: '#FFEDD5',
    }
  ];
  
  return (
    <CategoryPromotions
      title={t('special_offers')}
      description={t('exclusive_discounts_for_you')}
      promotions={specialOffers}
      variant="offers"
    />
  );
};

export default SpecialOffers;