import { Helmet } from 'react-helmet';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  structuredData?: Record<string, any>;
  noIndex?: boolean;
}

/**
 * SEOHead component for consistent SEO metadata across the site
 * This component handles meta tags, Open Graph, Twitter and structured data for any page
 */
const SEOHead = ({
  title,
  description,
  canonicalUrl,
  keywords = [],
  ogImage = '/pillnow.png',
  ogType = 'website',
  structuredData,
  noIndex = false,
}: SEOHeadProps) => {
  // Generate the full title with brand name
  const fullTitle = `${title} | PillNow - Online Pharmacy & Healthcare`;
  
  // Default host - would be replaced with actual domain in production
  const host = typeof window !== 'undefined' ? window.location.origin : 'https://pillnow.com';
  
  // Calculate canonical URL
  const canonical = canonicalUrl 
    ? `${host}${canonicalUrl.startsWith('/') ? canonicalUrl : `/${canonicalUrl}`}` 
    : host + (typeof window !== 'undefined' ? window.location.pathname : '');
  
  // Format keywords to comma-separated string
  const keywordsString = [
    ...keywords,
    'medicine delivery', 'online pharmacy', 'healthcare', 'prescriptions', 'pills'
  ].join(', ');
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Robots Meta - for pages that should not be indexed */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${host}${ogImage}`} />
      <meta property="og:site_name" content="PillNow" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${host}${ogImage}`} />
      
      {/* Mobile Meta */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Structured Data JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;