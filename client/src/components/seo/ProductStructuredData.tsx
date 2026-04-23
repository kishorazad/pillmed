import { Helmet } from 'react-helmet';

interface ProductStructuredDataProps {
  name: string;
  description: string;
  price: number;
  discountedPrice?: number | null;
  imageUrl?: string;
  brand?: string;
  sku?: string;
  gtin?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  reviewCount?: number;
  ratingValue?: number;
  category?: string;
}

/**
 * Component for adding structured data (schema.org) for product pages
 * This is important for Google rich results and product display in search
 */
const ProductStructuredData = ({
  name,
  description,
  price,
  discountedPrice,
  imageUrl,
  brand,
  sku,
  gtin,
  availability = 'InStock',
  reviewCount,
  ratingValue,
  category,
}: ProductStructuredDataProps) => {
  // Create the structured data object
  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name,
    description,
    // Use the image provided, or a placeholder
    image: imageUrl || '/medicine-placeholder.png',
    ...(brand && { brand: { '@type': 'Brand', name: brand } }),
    ...(sku && { sku }),
    ...(gtin && { gtin }),
    ...(category && { category }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: discountedPrice || price,
      ...(discountedPrice && { priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }),
      availability: `https://schema.org/${availability}`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    },
  };
  
  // Add review data if available
  if (ratingValue && reviewCount) {
    Object.assign(structuredData, {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue,
        reviewCount,
      },
    });
  }
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default ProductStructuredData;