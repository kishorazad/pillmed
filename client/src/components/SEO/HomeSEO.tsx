import React from 'react';
import SEO from '../common/SEO';
import { Helmet } from 'react-helmet';

interface HomeSEOProps {
  featuredProducts?: number;
  featuredCategories?: string[];
  alternateLanguages?: Array<{
    language: string;
    url: string;
  }>;
  regions?: string[];
}

/**
 * Specialized SEO component for the homepage
 * Implements homepage-specific metadata and structured data
 * Enhanced for better multilingual and regional SEO
 */
const HomeSEO: React.FC<HomeSEOProps> = ({ 
  featuredProducts = 0, 
  featuredCategories = [],
  alternateLanguages = [],
  regions = ['IN']
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

  // Generate region specific keywords
  const regionKeywords = regions.flatMap(region => {
    return ['medicine delivery', 'online pharmacy', 'prescription delivery'].map(
      term => `${term} in ${region === 'IN' ? 'India' : region}`
    );
  });

  // Create comprehensive keyword list
  const completeKeywords = [...keywords, ...regionKeywords].join(', ');
  
  // Generate default alternate languages if none provided
  const defaultAlternateLanguages = alternateLanguages.length > 0 ? 
    alternateLanguages : 
    [
      { language: 'en-IN', url: `${window.location.origin}/` },
      { language: 'hi-IN', url: `${window.location.origin}/hi` }
    ];
  
  // Create pharmacy-specific custom meta tags
  const pharmaMeta = [
    { name: 'pharmacy:delivery-areas', content: regions.join(', ') },
    { name: 'pharmacy:prescription-required', content: 'partial' },
    { name: 'pharmacy:services', content: 'medicine-delivery,lab-tests,doctor-consultation' },
  ];
  
  // Create pharmacy-specific link tags for better discovery
  const pharmaLinks = [
    { rel: 'manifest', href: '/manifest.json' },
    { rel: 'apple-touch-icon', href: '/pillnow-icon.png' },
    { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5' }
  ];

  return (
    <>
      <SEO
        title="PillNow: Online Pharmacy & Healthcare Platform | Order Medicines & Lab Tests"
        description={description}
        keywords={completeKeywords}
        structuredData={organizationSchema}
        language="en"
        region="IN"
        alternateLanguages={defaultAlternateLanguages}
        meta={pharmaMeta}
        links={pharmaLinks}
        publishDate="2023-01-01"  // Use actual launch date
        modifiedDate={new Date().toISOString().split('T')[0]}
      />
      
      {/* We need separate Helmet components for the additional structured data schemas */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(medicalWebPageSchema)}
        </script>
        
        {/* Add FAQPage structured data for enhanced search results */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
              {
                '@type': 'Question',
                'name': 'How do I order medicines on PillNow?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'You can order medicines on PillNow by uploading your prescription, searching for medicines, or browsing categories. Add products to cart and proceed to checkout for home delivery.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Does PillNow deliver to my location?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'PillNow delivers to most cities and towns across India. You can check delivery availability by entering your pincode on the product page or during checkout.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Is a prescription required to order medicines?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Prescription medicines require a valid doctor\'s prescription which can be uploaded during checkout. Over-the-counter (OTC) medicines can be purchased without a prescription.'
                }
              }
            ]
          })}
        </script>
      </Helmet>
    </>
  );
};

export default HomeSEO;