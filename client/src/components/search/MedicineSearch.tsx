import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'wouter';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchResult {
  id: number;
  name: string;
  imageUrl?: string | null;
  price: number;
  discountedPrice?: number | null;
  manufacturer?: string | null;
}

const MedicineSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Close the search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch search results whenever the debounced search term changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedSearchTerm.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setShowResults(true);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Error searching medicines:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length > 0) {
      setShowResults(true);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
  };

  const calculateDiscount = (price: number, discountedPrice?: number | null) => {
    if (!discountedPrice || discountedPrice >= price) return null;
    return Math.round(((price - discountedPrice) / price) * 100);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center bg-gray-100 rounded-full p-2">
        <Search className="h-4 w-4 text-gray-400 mx-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search medicines/healthcare products"
          className="bg-transparent border-none outline-none flex-grow text-sm placeholder-gray-400"
          onFocus={() => setShowResults(true)}
        />
        {searchTerm && (
          <button 
            onClick={clearSearch}
            className="flex items-center justify-center h-5 w-5 bg-gray-300 rounded-full mr-1"
          >
            <X className="h-3 w-3 text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (searchTerm.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg mt-1 z-50 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div>
              {results.map((result) => (
                <Link key={result.id} href={`/products/${result.id}`}>
                  <a className="block p-3 hover:bg-gray-50 border-b last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={result.imageUrl || 'https://via.placeholder.com/40'} 
                          alt={result.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <h3 className="text-sm font-medium line-clamp-1">{result.name}</h3>
                        {result.manufacturer && (
                          <p className="text-xs text-gray-500">{result.manufacturer}</p>
                        )}
                        <div className="flex items-center mt-1">
                          <span className="text-sm font-bold">
                            ₹{result.discountedPrice || result.price}
                          </span>
                          {result.discountedPrice && (
                            <>
                              <span className="text-xs text-gray-500 line-through ml-1">
                                ₹{result.price}
                              </span>
                              <span className="text-xs text-green-600 ml-1">
                                {calculateDiscount(result.price, result.discountedPrice)}% off
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No medicines found matching "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default MedicineSearch;