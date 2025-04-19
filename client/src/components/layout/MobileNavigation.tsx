import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Search, ShoppingCart, Clock, User, Bot, Building, Building2, Globe, X, Ambulance, MessageSquare } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLanguage, LANGUAGES } from '@/components/LanguageSwitcher';

const MobileNavigation: React.FC = () => {
  const [location] = useLocation();
  const { user, cart } = useStore();
  const { t, language, setLanguage } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
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
      label: 'Hospitals',
      icon: <Building2 className="h-5 w-5" />,
      path: '/hospitals',
      highlight: true,
    },
    {
      label: 'Communication',
      icon: <MessageSquare className="h-5 w-5" />,
      path: '/communication',
      highlight: true,
    },
    {
      label: t('emergency'),
      icon: <Ambulance className="h-5 w-5" />,
      path: '/services/emergency',
      highlight: true,
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
  ];
  
  // Currently selected language
  const currentLanguageName = LANGUAGES[language]?.nativeName || 'English';

  return (
    <>
      {/* Language menu overlay */}
      {showLanguageMenu && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[51] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 mx-4 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{t('select_language')}</h3>
              <button 
                onClick={() => setShowLanguageMenu(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => {
                    setLanguage(code);
                    setShowLanguageMenu(false);
                  }}
                  className={`px-4 py-3 rounded-lg text-left ${
                    language === code 
                      ? 'bg-orange-100 border border-orange-500 text-orange-700' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-sm text-gray-600">{lang.nativeName}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Language switcher button */}
      <div className="md:hidden fixed bottom-16 right-4 z-50">
        <button
          onClick={() => setShowLanguageMenu(true)}
          className="bg-white p-3 rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-orange-500"
        >
          <Globe className="h-6 w-6" />
        </button>
      </div>
      
      {/* Bottom navigation bar */}
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
    </>
  );
};

export default MobileNavigation;