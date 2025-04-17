import React from 'react';
import SEO from './SEO';

interface ProductSEOProps {
  product: {
    id: number;
    name: string;
    description?: string;
    price: number;
    discountedPrice?: number | null;
    imageUrl?: string | null;
    brand?: string;
    manufacturer?: string | null;
    composition?: string | null;
    uses?: string | null;
    sideEffects?: string | null;
    quantity: string;
    rating?: number | null;
    ratingCount?: number | null;
  };
  reviews?: Array<{ rating: number; review: string; author: string; date: string }>;
}

/**
 * Specialized SEO component for product pages
 * Implements product-specific metadata and structured data
 */
const ProductSEO: React.FC<ProductSEOProps> = ({ product, reviews = [] }) => {
  // Create a short description for meta tags if the full description is too long
  const shortDescription = product.description 
    ? (product.description.length > 160 
        ? product.description.substring(0, 157) + '...' 
        : product.description)
    : `Buy ${product.name} online at PillNow with doorstep delivery. Available now with free shipping and COD.`;
  
  // Create product-specific keywords
  const keywords = [
    product.name,
    product.brand || '',
    product.manufacturer || '',
    product.composition || '',
    'buy online',
    'medicine',
    'pharmacy',
    'PillNow',
    'discount',
    'delivery',
    'healthcare'
  ].filter(keyword => keyword.trim() !== '');
  
  // Create structured data for the product using Schema.org Product markup
  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description || shortDescription,
    sku: `PILLNOW-${product.id}`,
    mpn: `MPN-${product.id}`,
    image: product.imageUrl || `https://pillnow.com/images/default-product.jpg`,
    brand: {
      '@type': 'Brand',
      name: product.brand || product.manufacturer || 'PillNow'
    },
    offers: {
      '@type': 'Offer',
      url: `${window.location.origin}/products/${product.id}`,
      priceCurrency: 'INR',
      price: product.discountedPrice || product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'PillNow'
      }
    }
  };
  
  // Add review aggregation if there are reviews or a product rating
  if (reviews.length > 0 || (product.rating && product.ratingCount)) {
    const ratingValue = product.rating || 
      (reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0);
    
    const ratingCount = product.ratingCount || reviews.length;
    
    if (ratingValue > 0 && ratingCount > 0) {
      (structuredData as any).aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue,
        ratingCount,
        bestRating: '5',
        worstRating: '1'
      };
    }
  }
  
  // Add individual reviews to structured data if available
  if (reviews.length > 0) {
    (structuredData as any).review = reviews.map(review => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
        worstRating: '1'
      },
      author: {
        '@type': 'Person',
        name: review.author
      },
      reviewBody: review.review,
      datePublished: review.date
    }));
  }
  
  // Enrich description with product details for better SEO
  let enrichedDescription = shortDescription;
  if (product.composition) {
    enrichedDescription += ` Composition: ${product.composition}.`;
  }
  if (product.uses) {
    enrichedDescription += ` Uses: ${product.uses}.`;
  }
  
  // Ensure enriched description isn't too long
  if (enrichedDescription.length > 160) {
    enrichedDescription = enrichedDescription.substring(0, 157) + '...';
  }
  
  return (
    <SEO
      title={`${product.name} ${product.quantity}`}
      description={enrichedDescription}
      keywords={keywords}
      ogType="product"
      ogImage={product.imageUrl || undefined}
      structuredData={structuredData}
    />
  );
};

export default ProductSEO;