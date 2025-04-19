import { Helmet } from 'react-helmet';

interface MetaTag {
  name: string;
  content: string;
}

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  structuredData?: Record<string, any>;
  meta?: MetaTag[]; // Optional array of additional meta tags
}

/**
 * SEO component for optimized search engine visibility 
 * based on best practices from top pharmacy platforms
 */
const SEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  structuredData,
  meta = [],
}: SEOProps) => {
  // Format title to ensure it includes the brand name (like PharmEasy, 1mg do)
  const formattedTitle = !title.includes('PillNow') 
    ? `${title} | PillNow - Online Pharmacy & Healthcare`
    : title;

  const baseUrl = window.location.origin;
  const currentUrl = window.location.href;
  const canonicalLink = canonicalUrl || currentUrl;
  
  // Default image if none provided
  const image = ogImage || `${baseUrl}/pillnow.png`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Canonical Link for avoiding duplicate content issues */}
      <link rel="canonical" href={canonicalLink} />

      {/* Open Graph Tags for Social Media Sharing */}
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="PillNow" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Mobile App Tags */}
      <meta name="apple-itunes-app" content="app-id=myAppStoreID" />
      <meta name="google-play-app" content="app-id=com.pillnow.android" />

      {/* Robots Meta Tags for Indexing Instructions - can be overridden by custom meta tags */}
      {!meta.some(tag => tag.name === 'robots') && 
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      }
      
      {/* Custom Meta Tags */}
      {meta.map((tag, index) => (
        <meta key={`${tag.name}-${index}`} name={tag.name} content={tag.content} />
      ))}

      {/* Structured Data for Rich Results */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;