import React from 'react';
import SEO from '../common/SEO';

interface ArticleSEOProps {
  article: {
    id: number;
    title: string;
    content: string;
    imageUrl?: string | null;
    authorName?: string;
    publishDate: string | Date;
    category?: string;
    tags?: string[];
  };
  relatedArticles?: Array<{
    id: number;
    title: string;
    url: string;
  }>;
}

/**
 * Specialized SEO component for blog articles
 * Implements article-specific metadata and structured data for better ranking
 */
const ArticleSEO: React.FC<ArticleSEOProps> = ({ article, relatedArticles = [] }) => {
  // Format the publish date properly
  const publishDate = article.publishDate instanceof Date 
    ? article.publishDate.toISOString() 
    : new Date(article.publishDate).toISOString();
  
  // Create a short description from the article content
  const description = article.content.length > 250 
    ? article.content.substring(0, 247) + '...' 
    : article.content;
  
  // Create article-specific keywords
  const baseKeywords = [
    'health',
    'healthcare',
    'medical',
    'wellness',
    'medicine',
    'pharmacy',
    'health information',
    'PillNow',
    'healthcare blog',
    article.category || 'health tips',
  ];
  
  // Add article tags as keywords if available
  const keywords = article.tags 
    ? [...baseKeywords, ...article.tags] 
    : baseKeywords;
  
  // Create structured data for the article using Schema.org Article markup
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description,
    image: article.imageUrl || `${window.location.origin}/images/default-article.jpg`,
    datePublished: publishDate,
    dateModified: publishDate,
    author: {
      '@type': 'Person',
      name: article.authorName || 'PillNow Healthcare Team'
    },
    publisher: {
      '@type': 'Organization',
      name: 'PillNow',
      logo: {
        '@type': 'ImageObject',
        url: `${window.location.origin}/pillnow.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${window.location.origin}/health-blog/${article.id}`
    }
  };

  // Create BreadcrumbList schema to help with navigation hierarchy
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: window.location.origin
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Health Blog',
        item: `${window.location.origin}/health-blog`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `${window.location.origin}/health-blog/${article.id}`
      }
    ]
  };

  return (
    <>
      <SEO
        title={article.title}
        description={description}
        keywords={keywords}
        ogType="article"
        ogImage={article.imageUrl || undefined}
        structuredData={articleSchema}
      />
      {/* Separate Helmet component for breadcrumb schema */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </>
  );
};

export default ArticleSEO;