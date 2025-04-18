import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useStore } from '@/lib/store';
import Logo from './Logo';
import MedicineSearch from '@/components/search/MedicineSearch';
import NotificationHandler from '@/components/notifications/NotificationHandler';
import LanguageSwitcher, { useLanguage } from '@/components/LanguageSwitcher';

const Header = () => {
  const [location, navigate] = useLocation();
  const { cart, openCart, user } = useStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { t } = useLanguage();
  
  return (
    <header className="shadow-sm sticky top-0 z-50 bg-white">
      {/* Top bar */}
      <div className="bg-orange-500 text-white text-xs py-1 px-4 hidden md:block">
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
            <Logo size="medium" className="text-orange-500" />
            <div className="flex items-center text-sm text-[#666666] md:ml-4">
              <i className="fas fa-map-marker-alt mr-1 text-orange-500"></i>
              <span>Deliver to</span>
              <span className="font-medium ml-1 text-orange-500">110001</span>
              <i className="fas fa-chevron-down ml-1 text-xs"></i>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative w-full md:max-w-xl">
            <MedicineSearch />
          </div>
          
          {/* Navigation - Sign In and Cart buttons removed from mobile view */}
          <div className="hidden md:flex items-center gap-5 text-sm mt-2 md:mt-0">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Notification Bell */}
            <NotificationHandler />
            
            <div className="relative group">
              <Link href="/profile" className="flex flex-col items-center">
                <i className="fas fa-user text-[#666666]"></i>
                <span>{user ? user.name.split(' ')[0] : 'Sign In'}</span>
              </Link>
              
              {user && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md hidden group-hover:block z-50">
                  <div className="py-1">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                    <Link href="/profile#orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                    
                    {user.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-orange-500 font-medium hover:bg-gray-100">
                        Admin Dashboard
                      </Link>
                    )}
                    
                    {user.role === 'pharmacy' && (
                      <Link href="/pharmacy" className="block px-4 py-2 text-sm text-orange-500 font-medium hover:bg-gray-100">
                        Pharmacy Dashboard
                      </Link>
                    )}
                    
                    {user.role === 'doctor' && (
                      <Link href="/doctor" className="block px-4 py-2 text-sm text-orange-500 font-medium hover:bg-gray-100">
                        Doctor Dashboard
                      </Link>
                    )}
                    
                    {user.role === 'laboratory' && (
                      <Link href="/laboratory" className="block px-4 py-2 text-sm text-orange-500 font-medium hover:bg-gray-100">
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
            
            <button onClick={openCart} className="flex flex-col items-center relative">
              <i className="fas fa-shopping-cart text-[#666666]"></i>
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
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
            <li><Link href="/products" className="hover:text-orange-500">Medicines</Link></li>
            <li><Link href="/lab-tests" className="hover:text-orange-500">Lab Tests</Link></li>
            <li><Link href="/doctors" className="hover:text-orange-500">Consult Doctors</Link></li>
            <li><Link href="/hospitals" className="text-orange-500 font-semibold flex items-center">
              <i className="fas fa-hospital mr-1"></i> Hospitals
            </Link></li>
            <li><Link href="/services" className="text-orange-500 font-semibold flex items-center">
              <i className="fas fa-heartbeat mr-1"></i> Health Services
            </Link></li>
            <li><Link href="/ai-healthcare" className="text-orange-500 font-semibold flex items-center">
              <i className="fas fa-robot mr-1"></i> AI Health Assistant
            </Link></li>
            <li><Link href="/products/category/4" className="hover:text-orange-500">COVID-19</Link></li>
            <li><Link href="/products/category/5" className="hover:text-orange-500">Ayurveda</Link></li>
            <li><Link href="/products/category/6" className="hover:text-orange-500">Healthcare Devices</Link></li>
            <li><Link href="/products/category/7" className="text-orange-500 font-semibold">Saffron</Link></li>
            <li><Link href="/health-blog" className="hover:text-orange-500">Health Blog</Link></li>
            <li><Link href="/plus" className="hover:text-orange-500">PLUS</Link></li>
            <li><Link href="/offers" className="hover:text-orange-500">Offers</Link></li>
            <li><Link href="/value-store" className="text-orange-500 font-semibold">Value Store</Link></li>
          </ul>
        </div>
      </nav>
      
      {/* Mobile Navigation removed - now using the separate MobileNavigation component */}
    </header>
  );
};

export default Header;