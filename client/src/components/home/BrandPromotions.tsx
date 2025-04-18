import React from 'react';
import CategoryPromotions from './CategoryPromotions';
import { useLanguage } from '@/components/LanguageSwitcher';

const BrandPromotions: React.FC = () => {
  const { t } = useLanguage();
  
  // Brand promotion data
  const brandPromotions = [
    {
      id: 1,
      title: 'Himalaya',
      description: 'Herbal Healthcare Products',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/6d462f424a43372ea8b7b6f8ca13e052.png',
      link: '/brands/himalaya',
    },
    {
      id: 2,
      title: 'Dettol',
      description: 'Antiseptic Products',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/9cf0c849851a3e1dbf7934dc2de719cb.png',
      link: '/brands/dettol',
    },
    {
      id: 3,
      title: 'Dabur',
      description: 'Ayurvedic Healthcare',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/f692f7243b8036ed97d99a7973dd42b3.png',
      link: '/brands/dabur',
    },
    {
      id: 4,
      title: 'Baidyanath',
      description: 'Traditional Medicines',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/8a76e2f3b4583858a1a0c51b5ad4013a.png',
      link: '/brands/baidyanath',
    },
    {
      id: 5,
      title: 'Zandu',
      description: 'Ayurvedic Products',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/1e622b0308ec3ab48887512eaa3488a5.png',
      link: '/brands/zandu',
    },
    {
      id: 6,
      title: 'Horlicks',
      description: 'Nutritional Supplements',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/0e3bad8d2bfd3ee3b02d1ecc1a30c493.png',
      link: '/brands/horlicks',
    },
    {
      id: 7,
      title: 'Ensure',
      description: 'Complete Nutrition',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/8c985f80de9c3e6db42c0e47b3abd468.png',
      link: '/brands/ensure',
    },
    {
      id: 8,
      title: 'Protinex',
      description: 'Protein Supplements',
      imageUrl: 'https://cdn01.pharmeasy.in/dam/discovery/categoryImages/c8a4724446563038afe9c71aaece1cfb.png',
      link: '/brands/protinex',
    },
  ];
  
  return (
    <CategoryPromotions
      title={t('featured_brands')}
      description={t('shop_by_your_trusted_brands')}
      promotions={brandPromotions}
      variant="brand"
    />
  );
};

export default BrandPromotions;