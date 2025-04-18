import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Search, ShoppingCart, Clock, User, Bot } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/components/LanguageSwitcher';

const MobileNavigation: React.FC = () => {
  const [location] = useLocation();
  const { user, cart } = useStore();
  const { t } = useLanguage();
  
  // Get the proper dashboard path for the user based on role
  const getDashboardPath = () => {
    if (!user) return '/profile';
    
    switch (user.role) {
      case 'admin': return '/admin';
      case 'pharmacy': return '/pharmacy';
      case 'doctor': return '/doctor';
      case 'laboratory': return '/laboratory';
      default: return '/profile';
    }
  };
  
  // Navigation items
  const navItems = [
    {
      label: t('home'),
      icon: <Home className="h-5 w-5" />,
      path: '/',
    },
    {
      label: t('medicines'),
      icon: <Search className="h-5 w-5" />,
      path: '/products',
    },
    {
      label: t('ai_assistant'),
      icon: <Bot className="h-5 w-5" />,
      path: '/ai-healthcare',
      highlight: true,
    },
    {
      label: t('cart'),
      icon: <ShoppingCart className="h-5 w-5" />,
      path: '/cart',
      badge: cart.length > 0 ? cart.reduce((total, item) => total + item.quantity, 0) : null,
    },
    {
      label: user && user.role !== 'user' ? t('dashboard') : t('profile'),
      icon: <User className="h-5 w-5" />,
      path: getDashboardPath(),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 shadow-lg">
      <div className="flex justify-between items-center">
        {navItems.map((item) => (
          <Link key={item.label} href={item.path}>
            <div className={`flex flex-col items-center py-2 px-4 flex-1 ${
              location === item.path || 
              (item.path !== '/' && location.startsWith(item.path)) ? 
              'text-orange-500 font-medium' : 
              'text-gray-500'
            }`}>
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 ${item.highlight ? 'text-orange-500 font-medium' : ''}`}>
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;