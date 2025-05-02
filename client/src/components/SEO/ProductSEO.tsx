import React from 'react';
import SEO from '../common/SEO';
import { Helmet } from 'react-helmet';

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
    : `Buy ${product.name} online at medadock with doorstep delivery. Available now with free shipping and COD.`;
  
  // Create comprehensive product-specific keywords using industry best practices
  // This follows the pattern of top pharmacy sites like 1mg, PharmEasy and Netmeds
  const generateKeywords = () => {
    const baseKeywords = [
      product.name,
      product.brand || '',
      product.manufacturer || '',
      `buy ${product.name}`,
      `${product.name} online`,
      `${product.name} price`,
      `${product.name} uses`,
      'buy medicine online',
      'online pharmacy',
      'medicine delivery',
      'medadock',
      'discount',
      'pharmacy',
      'healthcare',
      'delivery',
      'order medicine online',
      'best price',
      'authentic medicine'
    ];
    
    // Add composition-based keywords
    if (product.composition) {
      const compositions = product.composition.split('+').map(c => c.trim());
      compositions.forEach(comp => {
        baseKeywords.push(comp);
        baseKeywords.push(`${comp} medicine`);
        baseKeywords.push(`buy ${comp}`);
      });
    }
    
    // Add uses-based keywords for better disease/symptom targeting
    if (product.uses) {
      const uses = product.uses.split(',').map(use => use.trim());
      uses.forEach(use => {
        baseKeywords.push(`medicine for ${use}`);
        baseKeywords.push(`treatment for ${use}`);
        baseKeywords.push(`${use} medication`);
      });
    }
    
    // Add form-specific keywords if detectable
    const dosageForms = [
      'tablet', 'capsule', 'syrup', 'injection', 'ointment', 'cream', 
      'gel', 'drop', 'spray', 'suspension', 'powder', 'solution'
    ];
    
    const productText = `${product.name} ${product.description || ''}`.toLowerCase();
    const detectedForm = dosageForms.find(form => productText.includes(form));
    
    if (detectedForm) {
      baseKeywords.push(`${detectedForm}`);
      baseKeywords.push(`${product.name} ${detectedForm}`);
      baseKeywords.push(`${detectedForm} for ${product.uses?.split(',')[0] || 'health'}`);
    }
    
    // Add brand-specific keywords
    if (product.brand) {
      baseKeywords.push(`${product.brand} products`);
      baseKeywords.push(`${product.brand} medicine`);
      baseKeywords.push(`${product.brand} healthcare`);
    }
    
    // Add location-specific keywords for improved local SEO
    // These target major Indian cities, matching pharmacy industry patterns
    const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'India'];
    locations.forEach(location => {
      baseKeywords.push(`medicine delivery in ${location}`);
      if (product.name.length < 20) { // Only for shorter product names to avoid very long keywords
        baseKeywords.push(`${product.name} in ${location}`);
      }
    });
    
    // Filter empty keywords and return unique ones
    const filteredKeywords = baseKeywords.filter(keyword => keyword.trim() !== '');
    return filteredKeywords.filter((value, index, self) => self.indexOf(value) === index);
  };
  
  const keywords = generateKeywords();
  
  // Create advanced structured data for the product following 1mg, PharmEasy, and Netmeds patterns
  // This uses both Product schema and Drug/MedicalEntity schema for maximum SEO benefit
  
  // First, create the standard Product markup
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description || shortDescription,
    sku: `medadock-${product.id}`,
    mpn: `MPN-${product.id}`,
    image: product.imageUrl || `${window.location.origin}/assets/default-product.jpg`,
    brand: {
      '@type': 'Brand',
      name: product.brand || product.manufacturer || 'medadock'
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
        name: 'medadock',
        logo: `${window.location.origin}/assets/medadock.png`
      },
      itemCondition: 'https://schema.org/NewCondition',
      deliveryLeadTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 3,
        unitCode: 'DAY'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: 'INR'
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY'
          }
        }
      }
    }
  };
  
  // For medications, add comprehensive pharmaceutical markup following industry leaders
  // This extended approach is based on top pharmacy platforms like 1mg, PharmEasy and Netmeds
  const drugSchema = product.composition ? {
    '@context': 'https://schema.org/',
    '@type': 'Drug',
    name: product.name,
    drugUnit: product.quantity,
    activeIngredient: product.composition,
    description: product.description || shortDescription,
    url: `${window.location.origin}/products/${product.id}`,
    nonProprietaryName: product.composition?.split('+').map(c => c.trim()).join(', '),
    manufacturer: {
      '@type': 'Organization',
      name: product.manufacturer || product.brand || 'medadock',
      url: `${window.location.origin}/brands/${product.brand?.toLowerCase().replace(/\s+/g, '-') || 'all-brands'}`
    },
    
    // Medical indication (uses) as a more structured format
    ...(product.uses && { 
      possibleTreatment: product.uses.split(',').map(use => ({
        '@type': 'MedicalIndication',
        name: use.trim(),
        url: `${window.location.origin}/health-concerns/${use.trim().toLowerCase().replace(/\s+/g, '-')}`
      }))
    }),
    
    // Side effects in a more structured format
    ...(product.sideEffects && { 
      adverseOutcome: product.sideEffects.split(',').map(effect => ({
        '@type': 'MedicalEntity',
        name: effect.trim()
      }))
    }),
    
    // Add dosage form if it can be extracted
    dosageForm: (() => {
      const dosageForms = [
        'tablet', 'capsule', 'syrup', 'injection', 'ointment', 'cream', 
        'gel', 'drop', 'spray', 'suspension', 'powder', 'solution'
      ];
      
      // Try to detect dosage form from name or description
      const nameAndDesc = `${product.name} ${product.description || ''}`.toLowerCase();
      const detectedForm = dosageForms.find(form => nameAndDesc.includes(form));
      
      return detectedForm || 'Medication';
    })(),
    
    // Add drug class from best available info
    drugClass: product.brand || 'Medication',
    
    // Determine if generic or branded
    isAvailableGenerically: product.composition ? true : false,
    
    // Determine prescription status based on name patterns
    prescriptionStatus: (() => {
      const rxPatterns = ['rx', 'prescription'];
      const otcPatterns = ['otc', 'over-the-counter', 'over the counter'];
      
      const productText = `${product.name} ${product.description || ''}`.toLowerCase();
      
      if (rxPatterns.some(pattern => productText.includes(pattern))) {
        return 'prescription-only';
      } else if (otcPatterns.some(pattern => productText.includes(pattern))) {
        return 'over-the-counter';
      } else {
        // Default assumption based on industry pattern
        return 'prescription-only';
      }
    })(),
    
    // Standard warnings for medications
    warning: 'Read the label carefully before use. Do not exceed the recommended dose.',
    breastfeedingWarning: 'Consult doctor before use',
    pregnancyWarning: 'Consult doctor before use',
    overdosageWarning: 'Seek medical attention immediately in case of overdose',
    
    // Medical audience
    audience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patient'
    },
    
    // Add guidelines for administration
    administrationRoute: (() => {
      const name = product.name.toLowerCase();
      if (name.includes('injection') || name.includes('infusion')) return 'Injection';
      if (name.includes('cream') || name.includes('ointment') || name.includes('gel')) return 'Topical';
      if (name.includes('eye drop') || name.includes('ear drop')) return 'Instillation';
      if (name.includes('inhaler') || name.includes('nebulizer')) return 'Inhalation';
      if (name.includes('suppository')) return 'Rectal';
      return 'Oral';
    })(),
    
    // Add related drugs (can be improved with actual related products)
    relatedDrug: [
      { '@type': 'Drug', name: product.name }
    ],
    
    // Add standard legal disclaimer
    legalStatus: {
      '@type': 'MedicalEntity',
      name: 'Use only as prescribed by healthcare professional'
    }
  } : null;
  
  // Use the ProductSchema as the primary structured data
  const structuredData = productSchema;
  
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
  
  // Create a comprehensive enhanced description for better SEO and visibility
  // Follow pattern from leading pharmacy sites (1mg, PharmEasy, Netmeds)
  const generateEnhancedDescription = () => {
    let baseDescription = shortDescription;
    
    // Add composition information
    if (product.composition) {
      baseDescription += ` Composition: ${product.composition}.`;
    }
    
    // Add uses/indications in plain language
    if (product.uses) {
      baseDescription += ` Uses: ${product.uses}.`;
    }
    
    // Add manufacturer info for authenticity signals
    if (product.manufacturer) {
      baseDescription += ` Manufactured by ${product.manufacturer}.`;
    } else if (product.brand) {
      baseDescription += ` From ${product.brand}.`;
    }
    
    // Add price and discount information
    if (product.price) {
      if (product.discountedPrice && product.discountedPrice < product.price) {
        const discountPercent = Math.round(((product.price - product.discountedPrice) / product.price) * 100);
        baseDescription += ` ${discountPercent}% off. MRP ₹${product.price}.`;
      } else {
        baseDescription += ` MRP ₹${product.price}.`;
      }
    }
    
    // Add dosage form if we can detect it
    const dosageForms = [
      'tablet', 'capsule', 'syrup', 'injection', 'ointment', 'cream', 
      'gel', 'drop', 'spray', 'suspension', 'powder', 'solution'
    ];
    
    const productText = `${product.name} ${product.description || ''}`.toLowerCase();
    const detectedForm = dosageForms.find(form => productText.includes(form));
    
    if (detectedForm) {
      baseDescription += ` Available as ${detectedForm}.`;
    }
    
    // Add information about delivery
    baseDescription += ' Fast delivery with medadock.';
    
    // Add prescription requirement information based on likely status
    const rxPatterns = ['rx', 'prescription'];
    if (rxPatterns.some(pattern => productText.includes(pattern))) {
      baseDescription += ' Prescription required.';
    }
    
    // Ensure description isn't too long (max 160 chars for meta description)
    if (baseDescription.length > 160) {
      return baseDescription.substring(0, 157) + '...';
    }
    
    return baseDescription;
  };
  
  const enrichedDescription = generateEnhancedDescription();
  
  // Join keywords into a string for the SEO component
  const keywordsString = keywords.join(', ');
  
  return (
    <>
      <SEO
        title={`${product.name} ${product.quantity}`}
        description={enrichedDescription}
        keywords={keywordsString}
        ogType="product"
        ogImage={product.imageUrl || undefined}
        structuredData={structuredData}
      />
      
      {/* Add the Drug schema as a separate structured data block if available */}
      {drugSchema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(drugSchema)}
          </script>
        </Helmet>
      )}
    </>
  );
};

export default ProductSEO;
