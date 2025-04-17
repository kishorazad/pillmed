import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react';
import { useStore } from '@/lib/store';

const MobileNavigation: React.FC = () => {
  const [location] = useLocation();
  const cartItems = useStore((state) => state.cart);
  
  // Navigation items
  const navItems = [
    {
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      path: '/',
    },
    {
      label: 'Search',
      icon: <Search className="h-5 w-5" />,
      path: '/products',
    },
    {
      label: 'Cart',
      icon: <ShoppingCart className="h-5 w-5" />,
      path: '/cart',
      badge: cartItems.length > 0 ? cartItems.length : null,
    },
    {
      label: 'Orders',
      icon: <Heart className="h-5 w-5" />,
      path: '/profile?tab=orders',
    },
    {
      label: 'Profile',
      icon: <User className="h-5 w-5" />,
      path: '/profile',
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex justify-between items-center">
        {navItems.map((item) => (
          <Link key={item.label} href={item.path}>
            <div className={`flex flex-col items-center py-2 px-4 flex-1 ${
              location === item.path ? 'text-[#10847e]' : 'text-gray-500'
            }`}>
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-[#ff6f61] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;