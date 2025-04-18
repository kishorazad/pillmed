import React from 'react';
import CategoryPromotions from './CategoryPromotions';
import { useLanguage } from '@/components/LanguageSwitcher';

const TopDeals: React.FC = () => {
  const { t } = useLanguage();
  
  // Top deals data
  const topDeals = [
    {
      id: 1,
      title: 'Vitamins & Supplements',
      description: 'Up to 60% off on vitamins',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/89dedbe063393754a6dff34e6db68fda.jpg',
      link: '/category/vitamins-supplements',
      backgroundColor: '#FFF8E6',
    },
    {
      id: 2,
      title: 'Personal Care',
      description: 'Up to 50% off on personal care',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/62e5778d8b8f35b1bc39447a1cae832f.jpg',
      link: '/category/personal-care',
      backgroundColor: '#E6F5FF',
    },
    {
      id: 3,
      title: 'Ayurvedic Care',
      description: 'Save on all ayurvedic products',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/ff342a0a54523d6ca27e11439e0c509f.jpg',
      link: '/category/ayurvedic',
      backgroundColor: '#F0FFE6',
    },
    {
      id: 4,
      title: 'Diabetes Care',
      description: 'Special discounts on diabetes care',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/db5cec4ad94138f5bb931da737a9d3b0.jpg',
      link: '/category/diabetes-care',
      backgroundColor: '#FFE6E6',
    }
  ];
  
  return (
    <CategoryPromotions
      title={t('top_deals')}
      description={t('best_deals_and_savings')}
      promotions={topDeals}
      variant="deals"
    />
  );
};

export default TopDeals;