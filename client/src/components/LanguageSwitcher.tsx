import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GlobeIcon } from 'lucide-react';

// Define all supported languages
export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்' },
  te: { name: 'Telugu', nativeName: 'తెలుగు' },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  bn: { name: 'Bengali', nativeName: 'বাংলা' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી' },
  mr: { name: 'Marathi', nativeName: 'मराठी' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
};

// Create types for language context
type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
};

// Create translations
export const translations: Record<string, Record<string, string>> = {
  en: {
    'home': 'Home',
    'products': 'Products',
    'categories': 'Categories',
    'cart': 'Cart',
    'search': 'Search',
    'account': 'Account',
    'login': 'Login',
    'logout': 'Logout',
    'register': 'Register',
    'add_to_cart': 'Add to Cart',
    'buy_now': 'Buy Now',
    'price': 'Price',
    'description': 'Description',
    'uses': 'Uses',
    'composition': 'Composition',
    'directions_for_use': 'Directions for Use',
    'storage_and_disposal': 'Storage and Disposal',
    'quick_tips': 'Quick Tips',
    'interactions': 'Interactions',
    'ingredients_and_benefits': 'Ingredients and Benefits',
    'fact_box': 'Fact Box',
    'similar_medicines': 'Similar Medicines',
    'frequently_bought_together': 'Frequently Bought Together',
    'view_cart': 'View Cart',
    'please_add_items_to_proceed': 'Please add item(s) to proceed',
    'quick_links': 'Quick links',
  },
  hi: {
    'home': 'होम',
    'products': 'उत्पाद',
    'categories': 'श्रेणियाँ',
    'cart': 'कार्ट',
    'search': 'खोज',
    'account': 'खाता',
    'login': 'लॉगिन',
    'logout': 'लॉगआउट',
    'register': 'रजिस्टर',
    'add_to_cart': 'कार्ट में जोड़ें',
    'buy_now': 'अभी खरीदें',
    'price': 'मूल्य',
    'description': 'विवरण',
    'uses': 'उपयोग',
    'composition': 'संरचना',
    'directions_for_use': 'उपयोग के लिए निर्देश',
    'storage_and_disposal': 'भंडारण और निपटान',
    'quick_tips': 'त्वरित टिप्स',
    'interactions': 'इंटरैक्शन्स',
    'ingredients_and_benefits': 'सामग्री और लाभ',
    'fact_box': 'तथ्य बॉक्स',
    'similar_medicines': 'समान दवाएं',
    'frequently_bought_together': 'अक्सर एक साथ खरीदे जाते हैं',
    'view_cart': 'कार्ट देखें',
    'please_add_items_to_proceed': 'आगे बढ़ने के लिए कृपया आइटम जोड़ें',
    'quick_links': 'त्वरित लिंक',
  },
  ta: {
    'home': 'முகப்பு',
    'products': 'பொருட்கள்',
    'categories': 'வகைகள்',
    'cart': 'கார்ட்',
    'search': 'தேடு',
    'account': 'கணக்கு',
    'login': 'உள்நுழைய',
    'logout': 'வெளியேறு',
    'register': 'பதிவு செய்ய',
    'add_to_cart': 'கார்ட்டில் சேர்',
    'buy_now': 'இப்போது வாங்கு',
    'price': 'விலை',
    'description': 'விளக்கம்',
    'uses': 'பயன்பாடுகள்',
    'composition': 'கலவை',
    'directions_for_use': 'பயன்படுத்தும் முறை',
    'storage_and_disposal': 'சேமிப்பு மற்றும் அகற்றல்',
    'quick_tips': 'விரைவு குறிப்புகள்',
    'interactions': 'தொடர்புகள்',
    'ingredients_and_benefits': 'பொருட்கள் மற்றும் நன்மைகள்',
    'fact_box': 'உண்மை பெட்டி',
    'similar_medicines': 'இதே போன்ற மருந்துகள்',
    'frequently_bought_together': 'அடிக்கடி ஒன்றாக வாங்கப்படுகின்றன',
    'view_cart': 'கார்ட் காண்க',
    'please_add_items_to_proceed': 'தொடர பொருட்களை சேர்க்கவும்',
    'quick_links': 'விரைவு இணைப்புகள்',
  },
};

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create provider
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try to get language from localStorage, default to English
  const [language, setLanguageState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'en';
    }
    return 'en';
  });

  // Set language and save to localStorage
  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  // Translation function
  const t = (key: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    // Fallback to English
    if (translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }
    // If no translation is found, return the key
    return key;
  };

  // Apply language direction for RTL languages (if needed)
  useEffect(() => {
    // Add RTL languages here if needed
    const rtlLanguages: string[] = [];
    
    if (rtlLanguages.includes(language)) {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = language;
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create hook for easy access to context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language switcher component
const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100 rounded-full">
          <GlobeIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        {Object.keys(LANGUAGES).map((lang) => (
          <DropdownMenuItem
            key={lang}
            className={`flex items-center ${language === lang ? 'font-bold bg-gray-100' : ''}`}
            onClick={() => handleLanguageChange(lang)}
          >
            <span className="w-8">{lang.toUpperCase()}</span>
            <span className="ml-2">{LANGUAGES[lang as keyof typeof LANGUAGES].nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;