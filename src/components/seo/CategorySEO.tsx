import React from 'react';
import SEO from '../common/SEO';

interface CategorySEOProps {
  category: {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string | null;
  };
  productsCount?: number;
  topBrands?: string[];
}

/**
 * Specialized SEO component for category pages
 * Implements category-specific metadata and structured data
 */
const CategorySEO: React.FC<CategorySEOProps> = ({ 
  category, 
  productsCount = 0, 
  topBrands = []
}) => {
  // Create a description for the category
  let description = category.description || 
    `Buy ${category.name} online at medadock with doorstep delivery and amazing discounts. Wide range of products available.`;
  
  // Enhance the description with product count and top brands if available
  if (productsCount > 0) {
    description = `Explore ${productsCount}+ ${category.name} products online at medadock. ${description}`;
  }
  
  if (topBrands.length > 0) {
    const brandsList = topBrands.slice(0, 5).join(', ');
    description += ` Top brands include ${brandsList} and more.`;
  }
  
  // Ensure description isn't too long for meta tags
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }
  
  // Create category-specific keywords
  const keywords = [
    category.name,
    'buy online',
    'medicine',
    'pharmacy',
    'medadock',
    'discount',
    'delivery',
    'healthcare',
    ...topBrands
  ].filter(keyword => keyword.trim() !== '');
  
  // Create structured data for the category using Schema.org ItemList markup
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} Products`,
    description,
    numberOfItems: productsCount,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Product',
          name: `${category.name} Products`,
          description: `Online shopping for ${category.name} at medadock`,
          url: `${window.location.origin}/products/category/${category.id}`
        }
      }
    ]
  };
  
  // Add BreadcrumbList schema to help with navigation hierarchy
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: window.location.origin
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${window.location.origin}/products`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `${window.location.origin}/products/category/${category.id}`
      }
    ]
  };

  return (
    <>
      <SEO
        title={`${category.name} - Buy Online at Best Prices`}
        description={description}
        keywords={keywords}
        ogImage={category.imageUrl || undefined}
        structuredData={structuredData}
      />
      {/* We need a separate Helmet component for the breadcrumb schema */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </>
  );
};

export default CategorySEO;
