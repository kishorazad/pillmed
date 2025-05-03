import { Helmet } from 'react-helmet';

interface MetaTag {
  name: string;
  content: string;
}

interface LinkTag {
  rel: string;
  href: string;
  hrefLang?: string;
  media?: string;
  type?: string;
}

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  language?: string;
  region?: string; 
  alternateLanguages?: Array<{
    language: string;
    url: string;
  }>;
  structuredData?: Record<string, any>;
  meta?: MetaTag[]; // Optional array of additional meta tags
  links?: LinkTag[]; // Optional array of additional link tags
  publishDate?: string; // Optional date for articles/blog posts
  modifiedDate?: string; // Optional last updated date for content
  preventIndexing?: boolean; // Optional flag to prevent indexing
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
  language = 'en',
  region = 'IN', 
  alternateLanguages = [],
  structuredData,
  meta = [],
  links = [],
  publishDate,
  modifiedDate,
  preventIndexing = false,
}: SEOProps) => {
  // Format title to ensure it includes the brand name (like PharmEasy, 1mg do)
  const formattedTitle = !title.includes('medadock') 
    ? `${title} | medadock - Online Pharmacy & Healthcare`
    : title;

  const baseUrl = window.location.origin;
  const currentUrl = window.location.href;
  const canonicalLink = canonicalUrl || currentUrl;
  
  // Default image if none provided
  const image = ogImage || `${baseUrl}/medadock.png`;

  // Generate robots meta tag content based on indexing preference
  const robotsContent = preventIndexing 
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  // Generate language and region tags (important for pharmacy regional content)
  const languageRegion = `${language.toLowerCase()}-${region.toUpperCase()}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={language} />
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="language" content={language} />
      <meta httpEquiv="content-language" content={languageRegion} />
      <meta name="geo.region" content={region} />
      
      {/* Canonical Link for avoiding duplicate content issues */}
      <link rel="canonical" href={canonicalLink} />
      
      {/* Alternate language links for international SEO */}
      {alternateLanguages.map((altLang, index) => (
        <link 
          key={`alt-lang-${index}`}
          rel="alternate" 
          href={altLang.url} 
          hrefLang={altLang.language}
        />
      ))}
      
      {/* Dates for articles and content - important for pharma news & medical articles */}
      {publishDate && <meta name="article:published_time" content={publishDate} />}
      {modifiedDate && <meta name="article:modified_time" content={modifiedDate} />}

      {/* Open Graph Tags for Social Media Sharing */}
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="medadock" />
      <meta property="og:locale" content={languageRegion} />
      {alternateLanguages.map((altLang, index) => (
        <meta 
          key={`og-locale-${index}`}
          property="og:locale:alternate" 
          content={`${altLang.language.replace('-', '_')}`} 
        />
      ))}
      
      {/* Publish dates for OpenGraph */}
      {publishDate && <meta property="article:published_time" content={publishDate} />}
      {modifiedDate && <meta property="article:modified_time" content={modifiedDate} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Mobile App Tags */}
      <meta name="apple-itunes-app" content="app-id=myAppStoreID" />
      <meta name="google-play-app" content="app-id=com.medadock.android" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Robots Meta Tags for Indexing Instructions - can be overridden by custom meta tags */}
      {!meta.some(tag => tag.name === 'robots') && 
        <meta name="robots" content={robotsContent} />
      }
      
      {/* Additional pharmacy industry specific meta tags */}
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="category" content="health" />
      
      {/* Pharma/medical website verification for trust signals */}
      <meta name="verify-v1" content="unique-verification-id" />
      <meta name="p:domain_verify" content="pinterest-verification-id" />
      
      {/* Custom Meta Tags */}
      {meta.map((tag, index) => (
        <meta key={`${tag.name}-${index}`} name={tag.name} content={tag.content} />
      ))}
      
      {/* Custom Link Tags */}
      {links.map((link, index) => (
        <link 
          key={`${link.rel}-${index}`} 
          rel={link.rel} 
          href={link.href} 
          {...(link.hrefLang ? { hrefLang: link.hrefLang } : {})}
          {...(link.media ? { media: link.media } : {})}
          {...(link.type ? { type: link.type } : {})}
        />
      ))}

      {/* Structured Data for Rich Results */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Organization Schema for industry-standard branding - required by pharmacies */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'medadock',
          'url': baseUrl,
          'logo': `${baseUrl}/medadock.png`,
          'contactPoint': [
            {
              '@type': 'ContactPoint',
              'telephone': '+91-XXXXX-XXXXX',
              'contactType': 'customer service',
              'areaServed': 'IN',
              'availableLanguage': ['English', 'Hindi']
            }
          ],
          'sameAs': [
            'https://www.facebook.com/medadock',
            'https://www.twitter.com/medadock',
            'https://www.instagram.com/medadock',
            'https://www.linkedin.com/company/medadock'
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
