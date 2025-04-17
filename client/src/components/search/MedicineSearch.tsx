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

// Placeholder search suggestions that rotate like PharmEasy
const searchSuggestions = [
  "Search for medicines", 
  "Search for Cardiology", 
  "Search for Orthopedic", 
  "Search for Gynecology",
  "Search for Diabetes",
  "Search for Vitamins"
];

const MedicineSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % searchSuggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
        const response = await fetch(`/api/medicine/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          // The API returns an object with a results array, not an array directly
          setResults(data.results || []);
          setShowResults(true);
          console.log('Search results:', data.results);
        } else {
          setResults([]);
          console.error('Search API returned error status:', response.status);
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
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSearchButtonClick = async () => {
    if (searchTerm.trim().length > 0) {
      // Explicitly trigger search when clicking the button
      setLoading(true);
      try {
        const response = await fetch(`/api/medicine/search?q=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setShowResults(true);
          console.log('Button search results:', data.results);
        } else {
          setResults([]);
          console.error('Button search API returned error status:', response.status);
        }
      } catch (error) {
        console.error('Error with button search:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const calculateDiscount = (price: number, discountedPrice?: number | null) => {
    if (!discountedPrice || discountedPrice >= price) return null;
    return Math.round(((price - discountedPrice) / price) * 100);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="flex w-full items-center">
        <div className="flex flex-grow items-center bg-white rounded-l-full border p-2 pl-4">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={searchSuggestions[placeholderIndex]}
            className="bg-transparent border-none outline-none flex-grow text-base placeholder-gray-500 w-full"
            onFocus={() => setShowResults(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm.trim().length > 0) {
                e.preventDefault();
                handleSearchButtonClick();
              }
            }}
          />
          {searchTerm && (
            <button 
              onClick={clearSearch}
              className="flex items-center justify-center h-6 w-6 bg-gray-200 rounded-full mr-1"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>
        <button 
          onClick={handleSearchButtonClick}
          className="bg-orange-500 text-white py-2 px-6 rounded-r-full font-medium hover:bg-orange-600 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (searchTerm.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg mt-1 z-50 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                    <div className="ml-3 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y">
              {results.map((result) => (
                <Link key={result.id} href={`/products/${result.id}`}>
                  <div className="block p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={result.imageUrl || 'https://via.placeholder.com/48'} 
                          alt={result.name} 
                          className="w-full h-full object-contain"
                          loading="lazy"
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
                              <span className="text-xs text-orange-600 ml-1">
                                {calculateDiscount(result.price, result.discountedPrice)}% off
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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