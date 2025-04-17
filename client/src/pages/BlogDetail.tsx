import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Calendar, Clock, User, Tag, ChevronLeft, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArticleSEO } from '@/components/seo';

// Type definition for blog articles
interface BlogArticle {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  author: string;
  authorImage?: string;
  publishDate: string;
  category: string;
  tags: string[];
  readTime: number;
}

// Type for related articles
interface RelatedArticle {
  id: number;
  title: string;
  imageUrl: string;
  publishDate: string;
}

const BlogDetail = () => {
  // Get article ID from URL
  const { id } = useParams<{ id: string }>();
  const articleId = parseInt(id);

  // Fetch the specific article
  const { data: article, isLoading, isError } = useQuery<BlogArticle>({
    queryKey: ['/api/articles', articleId],
    enabled: !isNaN(articleId)
  });

  // Fetch related articles
  const { data: relatedArticles = [] } = useQuery<RelatedArticle[]>({
    queryKey: ['/api/articles/related', articleId],
    enabled: !isNaN(articleId) && !!article,
  });

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or has been removed.</p>
        <Link href="/health-blog">
          <Button>Return to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* SEO for individual blog article */}
      <ArticleSEO 
        article={{
          id: article.id,
          title: article.title,
          content: article.content,
          publishDate: article.publishDate,
          authorName: article.author,
          imageUrl: article.imageUrl,
          category: article.category,
          tags: article.tags
        }}
        relatedArticles={relatedArticles.map(a => ({
          id: a.id,
          title: a.title,
          url: `/health-blog/${a.id}`
        }))}
      />

      <div className="bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb navigation */}
          <div className="flex items-center text-sm text-gray-500 mb-8">
            <Link href="/">
              <a className="hover:text-orange-500">Home</a>
            </Link>
            <span className="mx-2">/</span>
            <Link href="/health-blog">
              <a className="hover:text-orange-500">Health Blog</a>
            </Link>
            <span className="mx-2">/</span>
            <span className="text-orange-500">{article.title}</span>
          </div>

          {/* Back button */}
          <Link href="/health-blog">
            <a className="inline-flex items-center text-orange-500 hover:text-orange-700 mb-6">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to all articles
            </a>
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Main content */}
            <div className="w-full md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
              
              {/* Article meta information */}
              <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(article.publishDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{article.readTime} min read</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>By {article.author}</span>
                </div>
              </div>

              {/* Featured image */}
              <div className="rounded-lg overflow-hidden mb-8">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-auto"
                />
              </div>

              {/* Article content */}
              <div className="prose max-w-none mb-8">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map(tag => (
                  <Link key={tag} href={`/health-blog/tag/${tag.toLowerCase()}`}>
                    <a className="bg-gray-100 hover:bg-orange-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center transition-colors">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </a>
                  </Link>
                ))}
              </div>

              {/* Social share and engagement */}
              <div className="flex justify-between items-center border-t border-b py-4 mb-8">
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Author box */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8 flex items-start gap-4">
                <div className="flex-shrink-0">
                  <img 
                    src={article.authorImage || 'https://via.placeholder.com/80'} 
                    alt={article.author}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">About {article.author}</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Healthcare expert and medical writer with over 10 years of experience in the pharmaceutical industry.
                  </p>
                  <Link href={`/authors/${article.author.toLowerCase().replace(/\s+/g, '-')}`}>
                    <a className="text-orange-500 hover:text-orange-700 text-sm font-medium">
                      View all articles by this author
                    </a>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-1/3 space-y-8">
              {/* Related articles */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Related Articles</h3>
                {relatedArticles.length > 0 ? (
                  <div className="space-y-4">
                    {relatedArticles.map(relatedArticle => (
                      <Link key={relatedArticle.id} href={`/health-blog/${relatedArticle.id}`}>
                        <a className="flex gap-3 group">
                          <div className="flex-shrink-0 w-20 h-16 rounded overflow-hidden">
                            <img 
                              src={relatedArticle.imageUrl} 
                              alt={relatedArticle.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium line-clamp-2 group-hover:text-orange-500 transition-colors">
                              {relatedArticle.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(relatedArticle.publishDate)}
                            </p>
                          </div>
                        </a>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No related articles found.</p>
                )}
              </div>

              {/* Newsletter signup */}
              <div className="bg-orange-50 rounded-lg p-6 border border-orange-100">
                <h3 className="text-lg font-bold mb-3 text-orange-800">Stay Updated</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Get the latest health tips and articles delivered directly to your inbox.
                </p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Your email address"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  By subscribing, you agree to our privacy policy and terms of service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetail;