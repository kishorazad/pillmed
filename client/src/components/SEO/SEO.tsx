import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  structuredData?: object;
}

/**
 * SEO component for consistent metadata and structured data implementation
 * Used for improving search engine visibility and social sharing
 */
const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogType = 'website',
  ogImage,
  structuredData,
}) => {
  // Format the title to include brand name
  const formattedTitle = `${title} | PillNow Online Pharmacy`;
  
  // Create default canonical URL if not provided
  const siteUrl = window.location.origin;
  const canonical = canonicalUrl || `${siteUrl}${window.location.pathname}`;
  
  // Default image for social sharing if not provided
  const defaultOgImage = `${siteUrl}/images/pillnow-og-image.jpg`;
  
  return (
    <Helmet>
      {/* Basic metadata */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:site_name" content="PillNow" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />
      
      {/* Mobile specific */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      
      {/* Structured data if provided */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Additional SEO best practices */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    </Helmet>
  );
};

export default SEO;