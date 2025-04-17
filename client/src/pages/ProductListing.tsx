import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { Helmet } from 'react-helmet';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';

const ProductListing = () => {
  const [location] = useLocation();
  const params = useParams();
  const { searchQuery } = useStore();
  const [sortBy, setSortBy] = useState('default');
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const apiEndpoint = params.categoryId 
    ? `/api/products/category/${params.categoryId}`
    : '/api/products';
  
  // Add query params for pagination
  const { data, isLoading } = useQuery({
    queryKey: [apiEndpoint, currentPage, itemsPerPage],
    queryFn: async () => {
      const url = new URL(apiEndpoint, window.location.origin);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', itemsPerPage.toString());
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const result = await response.json();
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(result)) {
        // Handle non-paginated response
        return {
          products: result,
          pagination: {
            total: result.length,
            page: 1,
            limit: result.length,
            totalPages: 1
          }
        };
      }
      
      return result; // Return paginated response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const { data: categoryData } = useQuery({
    queryKey: params.categoryId ? [`/api/categories/${params.categoryId}`] : ['no-category'],
    enabled: !!params.categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  const category = categoryData || {};
  
  // Extract products from paginated API response
  const productsData = data?.products || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: itemsPerPage, totalPages: 0 };
  
  // Filtered and sorted products
  const filteredProducts = productsData
    ? productsData.filter((product: any) => {
        // Search filter
        if (searchQuery && product.name && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Price filter
        if (priceFilter.length > 0) {
          const price = product.discountedPrice || product.price;
          
          const inPriceRange = priceFilter.some(range => {
            if (range === 'under500') return price < 500;
            if (range === '500-1000') return price >= 500 && price <= 1000;
            if (range === '1000-2000') return price >= 1000 && price <= 2000;
            if (range === 'above2000') return price > 2000;
            return true;
          });
          
          if (!inPriceRange) return false;
        }
        
        // Rating filter
        if (ratingFilter.length > 0) {
          const rating = product.rating || 0;
          if (!ratingFilter.some(minRating => rating >= minRating)) {
            return false;
          }
        }
        
        return true;
      })
    : [];
  
  // Sorting
  const sortedProducts = [...filteredProducts];
  if (sortBy === 'priceAsc') {
    sortedProducts.sort((a: any, b: any) => {
      const priceA = a.discountedPrice || a.price;
      const priceB = b.discountedPrice || b.price;
      return priceA - priceB;
    });
  } else if (sortBy === 'priceDesc') {
    sortedProducts.sort((a: any, b: any) => {
      const priceA = a.discountedPrice || a.price;
      const priceB = b.discountedPrice || b.price;
      return priceB - priceA;
    });
  } else if (sortBy === 'rating') {
    sortedProducts.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
  }
  
  // Reset filters
  const resetFilters = () => {
    setPriceFilter([]);
    setRatingFilter([]);
    setSortBy('default');
  };
  
  // Handle price filter change
  const handlePriceFilterChange = (range: string) => {
    setPriceFilter(prev => 
      prev.includes(range) 
        ? prev.filter(r => r !== range) 
        : [...prev, range]
    );
  };
  
  // Handle rating filter change
  const handleRatingFilterChange = (rating: number) => {
    setRatingFilter(prev => 
      prev.includes(rating) 
        ? prev.filter(r => r !== rating) 
        : [...prev, rating]
    );
  };
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  // Handle page change for pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  // Page title
  const pageTitle = category && (category as any).name
    ? `${(category as any).name} Products - PillNow`
    : searchQuery 
      ? `Search Results for "${searchQuery}" - PillNow`
      : 'All Products - PillNow';
  
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`Browse our collection of ${(category as any)?.name ? (category as any).name.toLowerCase() : ''} products and medications.`} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {(category as any)?.name ? (category as any).name : searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
          </h1>
          {(category as any)?.description && (
            <p className="text-gray-600 mt-2">{(category as any).description}</p>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters (sidebar) - Only show when search is performed */}
          {searchQuery && (
            <div className="md:w-1/4 lg:w-1/5">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold">Filters</h2>
                  <Button variant="link" className="text-sm text-[#ff6f61]" onClick={resetFilters}>
                    Reset All
                  </Button>
                </div>
                
                {/* Price filter */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'under500', label: 'Under ₹500' },
                      { id: '500-1000', label: '₹500 - ₹1000' },
                      { id: '1000-2000', label: '₹1000 - ₹2000' },
                      { id: 'above2000', label: 'Above ₹2000' }
                    ].map(range => (
                      <div key={range.id} className="flex items-center">
                        <Checkbox 
                          id={range.id} 
                          checked={priceFilter.includes(range.id)}
                          onCheckedChange={() => handlePriceFilterChange(range.id)}
                        />
                        <Label htmlFor={range.id} className="ml-2 text-sm">{range.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Rating filter */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-3">Customer Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2].map(rating => (
                      <div key={rating} className="flex items-center">
                        <Checkbox 
                          id={`rating-${rating}`} 
                          checked={ratingFilter.includes(rating)}
                          onCheckedChange={() => handleRatingFilterChange(rating)}
                        />
                        <Label htmlFor={`rating-${rating}`} className="ml-2 text-sm flex items-center">
                          {rating}+ <span className="text-yellow-400 ml-1">★</span> & above
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Products */}
          <div className={searchQuery ? "md:w-3/4 lg:w-4/5" : "w-full"}>
            {/* Sort options - Only show when search is performed */}
            {searchQuery && (
              <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex justify-between items-center">
                <div>
                  <span className="text-sm">
                    Showing <span className="font-medium">{sortedProducts.length}</span> results
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm mr-2">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#10847e]"
                  >
                    <option value="default">Relevance</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* Products grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="bg-gray-200 h-40 mb-4 rounded"></div>
                    <div className="bg-gray-200 h-4 mb-2 rounded"></div>
                    <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <i className="fas fa-search text-gray-300 text-5xl mb-4"></i>
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            )}
            
            {/* Pagination */}
            {!isLoading && sortedProducts.length > 0 && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-1">
                  <Button 
                    variant="outline" 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2"
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages adjacent to current
                      return page === 1 || 
                             page === pagination.totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => {
                      // Add ellipsis where there are gaps in the sequence
                      const showEllipsisBefore = index > 0 && page > array[index - 1] + 1;
                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsisBefore && (
                            <span className="px-3 py-2">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => handlePageChange(page)}
                            className="px-4 py-2"
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })
                  }
                  
                  <Button 
                    variant="outline" 
                    onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductListing;
