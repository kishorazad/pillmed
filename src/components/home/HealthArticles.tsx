import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

const HealthArticles = () => {
  const { data: articles, isLoading, isError } = useQuery({
    queryKey: ['/api/articles'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  if (isLoading) {
    return (
      <section className="py-8 bg-[#f8f8f8]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Health Articles</h2>
            <Link href="/health-blog" className="text-[#10847e] font-medium hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="bg-gray-200 h-6 rounded mb-3"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (isError || !articles) {
    return (
      <section className="py-8 bg-[#f8f8f8]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Health Articles</h2>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-500">Failed to load health articles. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-8 bg-[#f8f8f8]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Health Articles</h2>
          <Link href="/health-blog" className="text-[#10847e] font-medium hover:underline">View All</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article: any) => (
            <div key={article.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">{article.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{article.content}</p>
                <Link href={`/health-blog/${article.id}`} className="text-[#10847e] font-medium text-sm hover:underline">
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HealthArticles;
