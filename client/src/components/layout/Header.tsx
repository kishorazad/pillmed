import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [location, navigate] = useLocation();
  const { cart, openCart, user, searchQuery, setSearchQuery } = useStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${searchQuery}`);
    setShowSearchResults(false);
  };
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      // If already on products page, we don't need to navigate
      if (location.startsWith('/products')) {
        // The products will be filtered by the searchQuery in ProductListing component
      } else if (query.length >= 3) {
        // If not on products page and query is substantial, navigate to products
        navigate(`/products?search=${query}`);
      }
      
      // Filter products for search suggestions
      fetch('/api/products')
        .then(res => res.json())
        .then(products => {
          const filtered = products
            .filter((p: any) => 
              p.name.toLowerCase().includes(query.toLowerCase()) ||
              (p.brand && p.brand.toLowerCase().includes(query.toLowerCase()))
            )
            .slice(0, 5); // Limit to 5 results
          setSearchResults(filtered);
          setShowSearchResults(filtered.length > 0);
        })
        .catch(err => console.error('Error fetching search results:', err));
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };
  
  return (
    <header className="shadow-sm sticky top-0 z-50 bg-white">
      {/* Main header */}
      <div className="container mx-auto py-3 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Location */}
          <div className="flex items-center gap-6 w-full md:w-auto justify-between">
            <Link href="/" className="text-xl font-bold text-[#10847e] flex items-center">
              <span className="text-emerald-600 mr-2">PharmEasy</span>
              <span className="text-xs italic text-gray-500">Take it easy</span>
            </Link>
            <div className="flex items-center text-sm text-[#666666] md:ml-4 border border-gray-200 rounded px-2 py-1">
              <i className="fas fa-map-marker-alt mr-1 text-[#10847e]"></i>
              <span className="text-xs">Express delivery to</span>
              <span className="font-medium ml-1 text-[#10847e]">Select Pincode</span>
              <i className="fas fa-chevron-down ml-1 text-xs"></i>
            </div>
          </div>
          
          {/* Download App Button */}
          <div className="hidden md:flex items-center border border-gray-200 rounded px-3 py-1 ml-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-600">
              <path d="M12 17V3"></path>
              <path d="m6 11 6 6 6-6"></path>
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2Z"></path>
            </svg>
            <span className="text-sm">Download App</span>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-6 text-sm mt-2 md:mt-0">
            <div className="relative group">
              <Link href="/profile" className="flex items-center gap-1">
                <i className="fas fa-user text-[#666666]"></i>
                <span>{user ? `Hello, ${user.name.split(' ')[0]}` : 'Hello, Log in'}</span>
                {user && <div className="w-1 h-1 rounded-full bg-green-500 absolute top-0 right-0"></div>}
              </Link>
              
              {user && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md hidden group-hover:block z-50">
                  <div className="py-1">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                    <Link href="/profile#orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                    
                    {user.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-[#10847e] font-medium hover:bg-gray-100">
                        Admin Dashboard
                      </Link>
                    )}
                    
                    {user.role === 'pharmacy' && (
                      <Link href="/pharmacy" className="block px-4 py-2 text-sm text-[#10847e] font-medium hover:bg-gray-100">
                        Pharmacy Dashboard
                      </Link>
                    )}
                    
                    {user.role === 'doctor' && (
                      <Link href="/doctor" className="block px-4 py-2 text-sm text-[#10847e] font-medium hover:bg-gray-100">
                        Doctor Dashboard
                      </Link>
                    )}
                    
                    {user.role === 'laboratory' && (
                      <Link href="/laboratory" className="block px-4 py-2 text-sm text-[#10847e] font-medium hover:bg-gray-100">
                        Laboratory Dashboard
                      </Link>
                    )}
                    
                    <div className="border-t border-gray-200 my-1"></div>
                    <button 
                      onClick={() => useStore.getState().setUser(null)} 
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <Link href="/offers" className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" x2="12" y1="2" y2="15"></line>
              </svg>
              <span>Offers</span>
            </Link>
            
            <button onClick={openCart} className="flex items-center gap-1 relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <circle cx="8" cy="21" r="1"></circle>
                <circle cx="19" cy="21" r="1"></circle>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
              </svg>
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff6f61] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="mt-4 mb-2">
          <form onSubmit={handleSearch} className="relative w-full">
            <div className="relative">
              <Input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="w-full py-3 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#10847e]"
              />
              <Button 
                type="submit"
                variant="default"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 rounded-md px-6 h-10"
              >
                Search
              </Button>
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-auto">
                <div className="p-2 border-b border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600">Showing results for "{searchQuery}"</p>
                </div>
                <ul>
                  {searchResults.map((product, index) => (
                    <li key={product.id} className="border-b border-gray-100 last:border-none">
                      <Link 
                        href={`/product/${product.id}`}
                        className="flex items-center px-4 py-3 hover:bg-gray-50"
                        onClick={() => setShowSearchResults(false)}
                      >
                        <div className="flex-shrink-0 w-10 h-10 mr-3">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                              <i className="fas fa-pills text-gray-400"></i>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{product.name}</p>
                          {product.brand && (
                            <p className="text-xs text-gray-500">By {product.brand}</p>
                          )}
                        </div>
                        <div className="ml-2 text-sm font-medium text-[#10847e]">
                          ₹{product.discountedPrice || product.price}
                          <i className="fas fa-chevron-right ml-1 text-xs"></i>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <Link
                    href={`/products?search=${searchQuery}`}
                    className="block w-full py-2 text-center text-sm font-medium text-[#10847e] hover:bg-gray-100 rounded"
                    onClick={() => setShowSearchResults(false)}
                  >
                    View All Results <i className="fas fa-arrow-right ml-1"></i>
                  </Link>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      
      {/* Categories Navigation */}
      <nav className="border-t border-gray-200 py-2 overflow-x-auto">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-8 text-sm font-medium">
            <li><Link href="/products" className="hover:text-[#ff6f61]">Medicine</Link></li>
            <li><Link href="/lab-tests" className="hover:text-[#ff6f61]">Lab Tests</Link></li>
            <li><Link href="/consult" className="hover:text-[#ff6f61]">Doctor Consult</Link></li>
            <li><Link href="/healthcare" className="hover:text-[#ff6f61]">Healthcare</Link></li>
            <li><Link href="/health-blog" className="hover:text-[#ff6f61]">Health Blogs</Link></li>
            <li><Link href="/plus" className="hover:text-[#ff6f61]">PLUS</Link></li>
            <li><Link href="/offers" className="hover:text-[#ff6f61]">Offers</Link></li>
            <li><Link href="/value-store" className="hover:text-[#ff6f61]">Value Store</Link></li>
          </ul>
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      <nav className="border-t border-gray-200 py-2 block md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-t z-50">
        <div className="flex justify-between px-4">
          <Link href="/" className="flex flex-col items-center text-xs">
            <i className="fas fa-home text-[#10847e]"></i>
            <span>Home</span>
          </Link>
          
          <Link href="/products" className="flex flex-col items-center text-xs">
            <i className="fas fa-pills"></i>
            <span>Medicines</span>
          </Link>
          
          <Link href="/lab-tests" className="flex flex-col items-center text-xs">
            <i className="fas fa-flask"></i>
            <span>Lab Tests</span>
          </Link>
          
          <Link href="/ai-healthcare" className="flex flex-col items-center text-xs">
            <i className="fas fa-robot text-[#14bef0]"></i>
            <span>Healthcare</span>
          </Link>
          
          <Link href="/profile" className="flex flex-col items-center text-xs">
            <i className="fas fa-user"></i>
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
