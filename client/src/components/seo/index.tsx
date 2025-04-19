import SEOHead from '../SEO/SEOHead';

interface HomeSEOProps {
  featuredProducts?: number;
  featuredCategories?: string[];
}

export const HomeSEO = ({ featuredProducts = 0, featuredCategories = [] }: HomeSEOProps) => {
  // Build dynamic keywords based on available categories
  const keywords = [
    'online pharmacy',
    'medicine delivery',
    'healthcare',
    'prescription refill',
    'online medicine order',
    'health products',
    ...featuredCategories.slice(0, 10) // Only use up to 10 categories
  ];

  // Create structured data for Organization
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PillNow',
    url: 'https://pillnow.com',
    logo: 'https://pillnow.com/logo.png',
    sameAs: [
      'https://www.facebook.com/pillnow',
      'https://twitter.com/pillnow',
      'https://www.instagram.com/pillnow',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+918770762307',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi']
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://pillnow.com/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <SEOHead
      title="Online Pharmacy & Healthcare Platform"
      description="PillNow - India's trusted online pharmacy and healthcare platform. Order medicines, book lab tests, consult doctors and get medicines delivered at your doorstep."
      keywords={keywords}
      ogImage="/pillnow.png"
      ogType="website"
      structuredData={structuredData}
    />
  );
};

interface ProductSEOProps {
  product: {
    id: number;
    name: string;
    description?: string;
    price: number;
    discountedPrice?: number | null;
    imageUrl?: string | null;
    brand?: string;
    categoryId?: number;
    quantity?: string;
    rating?: number | null;
    ratingCount?: number | null;
    composition?: string | null;
    uses?: string | null;
    sideEffects?: string | null;
  };
  categoryName?: string;
}

export const ProductSEO = ({ product, categoryName }: ProductSEOProps) => {
  // Building product-specific keywords based on details
  const keywords = [
    product.name,
    product.brand || '',
    categoryName || '',
    'medicine',
    'online purchase',
    'pharmacy',
    'healthcare',
    'prescription'
  ].filter(k => k); // Remove empty strings

  // Prepare a suitable description
  const description = product.description || 
    `Buy ${product.name} ${product.quantity ? `- ${product.quantity}` : ''} online at PillNow. ${
      product.brand ? `Made by ${product.brand}. ` : ''
    }${product.uses ? `Used for ${product.uses}. ` : ''}Fast delivery & secure payment options available.`;

  // Rich product structured data for search engines
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: description,
    image: product.imageUrl || 'https://pillnow.com/default-medicine.png',
    sku: `PILL-${product.id}`,
    mpn: `PILL-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Generic'
    },
    offers: {
      '@type': 'Offer',
      url: `https://pillnow.com/products/${product.id}`,
      priceCurrency: 'INR',
      price: product.discountedPrice || product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'PillNow'
      }
    }
  };

  // Add rating if available
  if (product.rating && product.ratingCount) {
    Object.assign(structuredData, {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.ratingCount
      }
    });
  }

  return (
    <SEOHead
      title={`${product.name} ${product.quantity ? `- ${product.quantity}` : ''}`}
      description={description}
      keywords={keywords}
      ogImage={product.imageUrl || '/default-medicine.png'}
      ogType="product"
      structuredData={structuredData}
      canonicalUrl={`/products/${product.id}`}
    />
  );
};

interface CategorySEOProps {
  category: {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
  };
  productsCount?: number;
}

export const CategorySEO = ({ category, productsCount = 0 }: CategorySEOProps) => {
  const description = category.description || 
    `Browse ${category.name} products at PillNow. We offer a wide range of ${category.name.toLowerCase()} with ${productsCount} products available. Shop online for fast delivery & best prices.`;

  // Rich category structured data for search engines (using ItemList)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} - PillNow`,
    description: description,
    url: `https://pillnow.com/products/category/${category.id}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Product',
          name: category.name,
          url: `https://pillnow.com/products/category/${category.id}`
        }
      }
    }
  };

  return (
    <SEOHead
      title={`${category.name} - Buy Online at Best Prices`}
      description={description}
      keywords={[category.name, 'medicine', 'healthcare', 'online pharmacy', 'discount', 'best price']}
      ogImage={category.imageUrl || '/default-category.png'}
      ogType="website"
      structuredData={structuredData}
      canonicalUrl={`/products/category/${category.id}`}
    />
  );
};

interface CheckoutSEOProps {
  noIndex?: boolean;
}

export const CheckoutSEO = ({ noIndex = true }: CheckoutSEOProps) => {
  return (
    <SEOHead
      title="Secure Checkout"
      description="Complete your purchase securely at PillNow. We accept multiple payment methods for your convenience."
      keywords={['secure checkout', 'payment', 'delivery', 'order confirmation']}
      noIndex={noIndex} // We usually don't want checkout pages indexed
    />
  );
};

export const ProfileSEO = () => {
  return (
    <SEOHead
      title="My Account"
      description="Manage your PillNow account, view orders, prescriptions, and health records."
      noIndex={true} // We don't want profile pages indexed
    />
  );
};