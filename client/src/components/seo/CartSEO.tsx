import React from 'react';
import SEO from './SEO';

/**
 * Specialized SEO component for the Cart page
 * Implements cart-specific metadata with noindex to prevent indexing of personal cart pages
 */
const CartSEO: React.FC<{ itemCount?: number }> = ({ itemCount = 0 }) => {
  // Create cart-specific description
  const description = itemCount > 0 
    ? `Review your ${itemCount} items before checkout. Secure payment options and fast delivery available.` 
    : 'Review and manage items in your cart before checkout. Secure payment options and fast delivery available.';

  // No need for elaborate structured data on cart pages that should not be indexed
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Shopping Cart',
    description: 'Review your shopping cart',
    isPartOf: {
      '@type': 'WebSite',
      name: 'PillNow',
      url: window.location.origin
    }
  };

  return (
    <SEO
      title={`Your Cart ${itemCount > 0 ? `(${itemCount} items)` : ''} | PillNow`}
      description={description}
      // Add meta robots noindex tag for cart pages
      meta={[
        {
          name: 'robots',
          content: 'noindex, nofollow' // Don't index cart pages as they contain personal info
        }
      ]}
      structuredData={structuredData}
    />
  );
};

export default CartSEO;