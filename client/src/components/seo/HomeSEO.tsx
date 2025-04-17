import React from 'react';
import SEO from './SEO';

interface HomeSEOProps {
  featuredProducts?: number;
  featuredCategories?: string[];
}

/**
 * Specialized SEO component for the homepage
 * Implements homepage-specific metadata and structured data
 */
const HomeSEO: React.FC<HomeSEOProps> = ({ 
  featuredProducts = 0, 
  featuredCategories = []
}) => {
  // Create pharmacy-specific keywords based on most common search terms
  const keywords = [
    'online pharmacy',
    'medicine delivery',
    'online medicine',
    'drug store',
    'healthcare',
    'prescription drugs',
    'health products',
    'PillNow',
    'medicine order online',
    'discount medicine',
    'healthcare app',
    'buy medicines online',
    'health supplies',
    'doctor consultation',
    'COVID-19 essentials',
    'medicine reminder app',
    'lab tests booking',
    'health blog',
    ...featuredCategories
  ];

  // Create home page description with special focus on key services
  const description = `PillNow - India's leading online pharmacy and healthcare platform. Order prescription medicines, OTC products, and health foods online. Get doorstep delivery with amazing discounts. Book lab tests and doctor consultations. ${
    featuredProducts > 0 ? `Explore ${featuredProducts}+ healthcare products.` : ''
  } Download the PillNow app for a better healthcare experience.`;

  // Create structured data for the organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PillNow',
    url: window.location.origin,
    logo: `${window.location.origin}/pillnow.png`,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+91-8770762307',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi']
      }
    ],
    sameAs: [
      'https://www.facebook.com/pillnow',
      'https://twitter.com/pillnow',
      'https://www.instagram.com/pillnow',
      'https://www.linkedin.com/company/pillnow'
    ]
  };

  // Create WebSite structured data
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PillNow',
    url: window.location.origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${window.location.origin}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  // Medical Web Page schema for better healthcare relevance
  const medicalWebPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    about: {
      '@type': 'MedicalBusiness',
      name: 'PillNow Online Pharmacy'
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'General public seeking healthcare services'
    },
    lastReviewed: new Date().toISOString().split('T')[0],
    mainContentOfPage: {
      '@type': 'WebPageElement',
      isAccessibleForFree: true,
      cssSelector: '.main-content'
    }
  };

  return (
    <>
      <SEO
        title="PillNow: Online Pharmacy & Healthcare Platform | Order Medicines & Lab Tests"
        description={description}
        keywords={keywords}
        structuredData={organizationSchema}
      />
      {/* We need separate Helmet components for each structured data schema */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(medicalWebPageSchema)}
      </script>
    </>
  );
};

export default HomeSEO;