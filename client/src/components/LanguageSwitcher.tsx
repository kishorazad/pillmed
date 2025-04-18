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
  ar: { name: 'Arabic', nativeName: 'العربية' },
  zh: { name: 'Chinese', nativeName: '中文' },
  fr: { name: 'French', nativeName: 'Français' },
  de: { name: 'German', nativeName: 'Deutsch' },
  es: { name: 'Spanish', nativeName: 'Español' },
  ru: { name: 'Russian', nativeName: 'Русский' },
};

// Create types for language context
type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
};

// Create translations
// Holds all translations for supported languages
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
    'quantity': 'Quantity',
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
    'quantity': 'मात्रा',
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
    'quantity': 'அளவு',
  },
  fr: {
    'home': 'Accueil',
    'products': 'Produits',
    'categories': 'Catégories',
    'cart': 'Panier',
    'search': 'Rechercher',
    'account': 'Compte',
    'login': 'Connexion',
    'logout': 'Déconnexion',
    'register': 'S\'inscrire',
    'add_to_cart': 'Ajouter au panier',
    'buy_now': 'Acheter maintenant',
    'price': 'Prix',
    'description': 'Description',
    'uses': 'Utilisations',
    'composition': 'Composition',
    'directions_for_use': 'Mode d\'emploi',
    'storage_and_disposal': 'Stockage et élimination',
    'quick_tips': 'Conseils rapides',
    'interactions': 'Interactions',
    'ingredients_and_benefits': 'Ingrédients et avantages',
    'fact_box': 'Boîte d\'information',
    'similar_medicines': 'Médicaments similaires',
    'frequently_bought_together': 'Souvent achetés ensemble',
    'view_cart': 'Voir le panier',
    'please_add_items_to_proceed': 'Veuillez ajouter des articles pour continuer',
    'quick_links': 'Liens rapides',
    'quantity': 'Quantité',
  },
  es: {
    'home': 'Inicio',
    'products': 'Productos',
    'categories': 'Categorías',
    'cart': 'Carrito',
    'search': 'Buscar',
    'account': 'Cuenta',
    'login': 'Iniciar sesión',
    'logout': 'Cerrar sesión',
    'register': 'Registrarse',
    'add_to_cart': 'Añadir al carrito',
    'buy_now': 'Comprar ahora',
    'price': 'Precio',
    'description': 'Descripción',
    'uses': 'Usos',
    'composition': 'Composición',
    'directions_for_use': 'Instrucciones de uso',
    'storage_and_disposal': 'Almacenamiento y eliminación',
    'quick_tips': 'Consejos rápidos',
    'interactions': 'Interacciones',
    'ingredients_and_benefits': 'Ingredientes y beneficios',
    'fact_box': 'Recuadro de hechos',
    'similar_medicines': 'Medicamentos similares',
    'frequently_bought_together': 'Comprados frecuentemente juntos',
    'view_cart': 'Ver carrito',
    'please_add_items_to_proceed': 'Por favor añada artículos para continuar',
    'quick_links': 'Enlaces rápidos',
    'quantity': 'Cantidad',
  },
  ar: {
    'home': 'الرئيسية',
    'products': 'المنتجات',
    'categories': 'الفئات',
    'cart': 'السلة',
    'search': 'بحث',
    'account': 'الحساب',
    'login': 'تسجيل الدخول',
    'logout': 'تسجيل الخروج',
    'register': 'التسجيل',
    'add_to_cart': 'أضف إلى السلة',
    'buy_now': 'اشتر الآن',
    'price': 'السعر',
    'description': 'الوصف',
    'uses': 'الاستخدامات',
    'composition': 'التركيب',
    'directions_for_use': 'إرشادات الاستخدام',
    'storage_and_disposal': 'التخزين والتخلص',
    'quick_tips': 'نصائح سريعة',
    'interactions': 'التفاعلات',
    'ingredients_and_benefits': 'المكونات والفوائد',
    'fact_box': 'صندوق الحقائق',
    'similar_medicines': 'أدوية مشابهة',
    'frequently_bought_together': 'تُشترى معًا بشكل متكرر',
    'view_cart': 'عرض السلة',
    'please_add_items_to_proceed': 'الرجاء إضافة عناصر للمتابعة',
    'quick_links': 'روابط سريعة',
    'quantity': 'الكمية',
  },
  de: {
    'home': 'Startseite',
    'products': 'Produkte',
    'categories': 'Kategorien',
    'cart': 'Warenkorb',
    'search': 'Suchen',
    'account': 'Konto',
    'login': 'Anmelden',
    'logout': 'Abmelden',
    'register': 'Registrieren',
    'add_to_cart': 'In den Warenkorb',
    'buy_now': 'Jetzt kaufen',
    'price': 'Preis',
    'description': 'Beschreibung',
    'uses': 'Anwendungen',
    'composition': 'Zusammensetzung',
    'directions_for_use': 'Gebrauchsanweisung',
    'storage_and_disposal': 'Lagerung und Entsorgung',
    'quick_tips': 'Schnelle Tipps',
    'interactions': 'Wechselwirkungen',
    'ingredients_and_benefits': 'Inhaltsstoffe und Vorteile',
    'fact_box': 'Faktenbox',
    'similar_medicines': 'Ähnliche Medikamente',
    'frequently_bought_together': 'Wird oft zusammen gekauft',
    'view_cart': 'Warenkorb anzeigen',
    'please_add_items_to_proceed': 'Bitte fügen Sie Artikel hinzu, um fortzufahren',
    'quick_links': 'Schnelllinks',
    'quantity': 'Menge',
  },
  zh: {
    'home': '首页',
    'products': '产品',
    'categories': '分类',
    'cart': '购物车',
    'search': '搜索',
    'account': '账户',
    'login': '登录',
    'logout': '登出',
    'register': '注册',
    'add_to_cart': '加入购物车',
    'buy_now': '立即购买',
    'price': '价格',
    'description': '描述',
    'uses': '用途',
    'composition': '成分',
    'directions_for_use': '使用说明',
    'storage_and_disposal': '储存和处理',
    'quick_tips': '快速提示',
    'interactions': '相互作用',
    'ingredients_and_benefits': '成分和益处',
    'fact_box': '事实框',
    'similar_medicines': '类似药品',
    'frequently_bought_together': '经常一起购买',
    'view_cart': '查看购物车',
    'please_add_items_to_proceed': '请添加商品以继续',
    'quick_links': '快速链接',
    'quantity': '数量',
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
    const rtlLanguages: string[] = ['ar'];
    
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