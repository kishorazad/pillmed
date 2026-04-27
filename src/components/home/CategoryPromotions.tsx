import React from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/components/LanguageSwitcher';

interface CategoryPromotion {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  link: string;
  backgroundColor?: string;
}

interface CategoryPromotionsProps {
  title: string;
  description?: string;
  promotions: CategoryPromotion[];
  variant?: 'default' | 'brand' | 'festival' | 'offers' | 'deals';
}

const CategoryPromotions: React.FC<CategoryPromotionsProps> = ({
  title,
  description,
  promotions,
  variant = 'default'
}) => {
  const { t } = useLanguage();
  
  // Define styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'brand':
        return {
          container: 'bg-blue-50',
          header: 'text-blue-800',
          description: 'text-blue-600',
          cards: 'border-blue-200 hover:border-blue-400 shadow-blue-100',
          cardBg: 'bg-white',
        };
      case 'festival':
        return {
          container: 'bg-orange-50',
          header: 'text-orange-800',
          description: 'text-orange-600',
          cards: 'border-orange-200 hover:border-orange-400 shadow-orange-100',
          cardBg: 'bg-white',
        };
      case 'offers':
        return {
          container: 'bg-green-50',
          header: 'text-green-800',
          description: 'text-green-600',
          cards: 'border-green-200 hover:border-green-400 shadow-green-100',
          cardBg: 'bg-white',
        };
      case 'deals':
        return {
          container: 'bg-purple-50',
          header: 'text-purple-800',
          description: 'text-purple-600',
          cards: 'border-purple-200 hover:border-purple-400 shadow-purple-100',
          cardBg: 'bg-white',
        };
      default:
        return {
          container: 'bg-gray-50',
          header: 'text-gray-800',
          description: 'text-gray-600',
          cards: 'border-gray-200 hover:border-gray-400 shadow-gray-100',
          cardBg: 'bg-white',
        };
    }
  };
  
  const styles = getVariantStyles();
  
  return (
    <section className={`py-8 ${styles.container}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-bold mb-2 ${styles.header}`}>{title}</h2>
          {description && <p className={`${styles.description}`}>{description}</p>}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {promotions.map((promo) => (
            <Link 
              key={promo.id} 
              href={promo.link} 
              className={`block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 ${styles.cards}`}
            >
              <div 
                className={`p-4 h-full flex flex-col ${promo.backgroundColor || styles.cardBg}`}
                style={{ backgroundColor: promo.backgroundColor }}
              >
                <div className="h-40 mb-4 overflow-hidden rounded-md">
                  <img 
                    src={promo.imageUrl} 
                    alt={promo.title} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-1">{promo.title}</h3>
                {promo.description && <p className="text-sm text-gray-600">{promo.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryPromotions;