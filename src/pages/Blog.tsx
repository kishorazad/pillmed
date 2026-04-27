import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Calendar, Clock, Tag, ChevronRight, Search } from 'lucide-react';
import { ArticleSEO } from '@/components/seo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Type definition for blog articles
interface BlogArticle {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  publishDate: string;
  category: string;
  tags: string[];
  readTime: number;
}

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all blog articles
  const { data: articles = [], isLoading } = useQuery<BlogArticle[]>({
    queryKey: ['/api/articles'],
  });

  // Get popular categories from articles
  const categories = Array.from(new Set(articles.map(article => article.category)));

  // Get all tags from articles
  const allTags = Array.from(
    new Set(articles.flatMap(article => article.tags))
  ).slice(0, 10); // Limit to 10 most used tags

  // Filter articles by search query
  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <>
      {/* SEO for blog listing page */}
      <ArticleSEO 
        article={{
          id: 0,
          title: "Health Blog - Latest Articles on Medicine, Wellness & Healthcare | PillNow",
          content: "Explore expert advice on medicine, health conditions, wellness tips, and healthcare information. Stay informed with PillNow's reliable health blog.",
          publishDate: new Date().toISOString(),
          category: "Healthcare",
          tags: ["health", "wellness", "medicine", "healthcare", "medical advice"]
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content */}
          <div className="w-full md:w-2/3">
            <h1 className="text-3xl font-bold mb-6">Health Blog</h1>
            
            {/* Search bar */}
            <div className="mb-8 relative">
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {isLoading ? (
              // Loading skeleton
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No articles found matching your search.</p>
                <Button 
                  variant="link" 
                  onClick={() => setSearchQuery('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredArticles.map(article => (
                  <article key={article.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <Link href={`/health-blog/${article.id}`}>
                      <a className="block">
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-4 left-4 bg-orange-500 text-white text-sm px-2 py-1 rounded">
                            {article.category}
                          </div>
                        </div>
                        <div className="p-6">
                          <h2 className="text-xl font-bold mb-2 text-gray-800 hover:text-orange-500 transition-colors">
                            {article.title}
                          </h2>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {article.excerpt}
                          </p>
                          <div className="flex flex-wrap justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(article.publishDate)}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{article.readTime} min read</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-1/3 space-y-8">
            {/* Categories section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 border-b pb-2">Categories</h3>
              <ul className="space-y-2">
                {categories.map(category => (
                  <li key={category}>
                    <Link href={`/health-blog/category/${category.toLowerCase()}`}>
                      <a className="flex justify-between items-center text-gray-700 hover:text-orange-500 transition-colors">
                        <span>{category}</span>
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular tags */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 border-b pb-2">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Link key={tag} href={`/health-blog/tag/${tag.toLowerCase()}`}>
                    <a className="bg-gray-200 hover:bg-orange-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center transition-colors">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </a>
                  </Link>
                ))}
              </div>
            </div>

            {/* Health tips */}
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-100">
              <h3 className="text-lg font-bold mb-4 text-orange-800">Health Tip of the Day</h3>
              <p className="text-gray-700 italic">
                "Drinking enough water each day is crucial for many reasons: to regulate body temperature, keep joints lubricated, prevent infections, deliver nutrients to cells, and keep organs functioning properly."
              </p>
              <Link href="/health-tips">
                <a className="text-orange-500 hover:text-orange-700 font-medium text-sm inline-flex items-center mt-4">
                  View more health tips
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;