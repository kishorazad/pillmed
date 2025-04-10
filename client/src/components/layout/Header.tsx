import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [location, navigate] = useLocation();
  const { cart, openCart, user, searchQuery, setSearchQuery } = useStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${searchQuery}`);
  };
  
  return (
    <header className="shadow-sm sticky top-0 z-50 bg-white">
      {/* Top bar */}
      <div className="bg-[#10847e] text-white text-xs py-1 px-4 hidden md:block">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <span className="mr-4">
              <i className="fas fa-phone-alt mr-1"></i> 1800-1234-5678
            </span>
            <span>
              <i className="fas fa-download mr-1"></i> Download App
            </span>
          </div>
          <div>
            <span className="ml-4">Need Help?</span>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="container mx-auto py-3 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Location */}
          <div className="flex items-center gap-6 w-full md:w-auto justify-between">
            <Link href="/" className="text-2xl font-bold text-[#10847e]">
              <span className="text-[#ff6f61]">1</span>mg
            </Link>
            <div className="flex items-center text-sm text-[#666666] md:ml-4">
              <i className="fas fa-map-marker-alt mr-1 text-[#10847e]"></i>
              <span>Deliver to</span>
              <span className="font-medium ml-1 text-[#10847e]">110001</span>
              <i className="fas fa-chevron-down ml-1 text-xs"></i>
            </div>
          </div>
          
          {/* Search */}
          <form onSubmit={handleSearch} className="relative w-full md:max-w-xl">
            <Input
              type="text"
              placeholder="Search for Medicines and Health Products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#10847e]"
            />
            <Button 
              type="submit"
              variant="ghost" 
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#10847e]"
            >
              <i className="fas fa-search"></i>
            </Button>
          </form>
          
          {/* Navigation */}
          <div className="flex items-center gap-6 text-sm mt-2 md:mt-0">
            <Link href="/profile" className="flex flex-col items-center">
              <i className="fas fa-user text-[#666666]"></i>
              <span>{user ? user.name : 'Sign In'}</span>
            </Link>
            <button onClick={openCart} className="flex flex-col items-center relative">
              <i className="fas fa-shopping-cart text-[#666666]"></i>
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff6f61] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Categories Navigation */}
      <nav className="border-t border-gray-200 py-2 overflow-x-auto hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-8 text-sm font-medium">
            <li><Link href="/products" className="hover:text-[#ff6f61]">Medicines</Link></li>
            <li><Link href="/lab-tests" className="hover:text-[#ff6f61]">Lab Tests</Link></li>
            <li><Link href="/consult" className="hover:text-[#ff6f61]">Consult Doctors</Link></li>
            <li><Link href="/products/category/4" className="hover:text-[#ff6f61]">COVID-19</Link></li>
            <li><Link href="/products/category/5" className="hover:text-[#ff6f61]">Ayurveda</Link></li>
            <li><Link href="/products/category/6" className="hover:text-[#ff6f61]">Healthcare Devices</Link></li>
            <li><Link href="/health-blog" className="hover:text-[#ff6f61]">Health Blog</Link></li>
            <li><Link href="/plus" className="hover:text-[#ff6f61]">PLUS</Link></li>
            <li><Link href="/offers" className="hover:text-[#ff6f61]">Offers</Link></li>
            <li><Link href="/value-store" className="text-[#14bef0] font-semibold">Value Store</Link></li>
          </ul>
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      <nav className="border-t border-gray-200 py-2 block md:hidden">
        <div className="flex justify-between px-4">
          <Link href="/" className="flex flex-col items-center text-xs">
            <i className="fas fa-home text-[#ff6f61]"></i>
            <span>Home</span>
          </Link>
          <Link href="/lab-tests" className="flex flex-col items-center text-xs">
            <i className="fas fa-flask"></i>
            <span>Lab Tests</span>
          </Link>
          <Link href="/products" className="flex flex-col items-center text-xs">
            <i className="fas fa-pills"></i>
            <span>Medicines</span>
          </Link>
          <Link href="/consult" className="flex flex-col items-center text-xs">
            <i className="fas fa-user-md"></i>
            <span>Consult</span>
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
