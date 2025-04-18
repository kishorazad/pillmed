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
    // Navigation & Basic UI
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
    'view_cart': 'View Cart',
    'please_add_items_to_proceed': 'Please add item(s) to proceed',
    'quick_links': 'Quick links',
    'quantity': 'Quantity',
    
    // Product Information Fields
    'description': 'Description',
    'manufacturer': 'Manufacturer',
    'salt_composition': 'Salt Composition',
    'medicine_type': 'Medicine Type',
    'stock': 'Stock',
    'introduction': 'Introduction',
    'benefits': 'Benefits',
    'how_to_use': 'How to Use',
    'safety_advice': 'Safety Advice',
    'if_miss': 'If You Miss a Dose',
    'packaging': 'Packaging',
    'packaging_type': 'Packaging Type',
    'mrp': 'MRP',
    'best_price': 'Best Price',
    'discount_percent': 'Discount',
    'views_bought': 'Views & Purchases',
    'prescription_required': 'Prescription Required',
    'label': 'Label',
    'fact_box': 'Fact Box',
    'primary_use': 'Primary Use',
    'storage': 'Storage',
    'common_side_effect': 'Common Side Effects',
    'alcohol_interaction': 'Alcohol Interaction',
    'pregnancy_interaction': 'Pregnancy Interaction',
    'lactation_interaction': 'Lactation Interaction',
    'driving_interaction': 'Driving Interaction',
    'kidney_interaction': 'Kidney Interaction',
    'liver_interaction': 'Liver Interaction',
    'manufacturer_address': 'Manufacturer Address',
    'country_of_origin': 'Country of Origin',
    'for_sale': 'For Sale',
    'q_and_a': 'Q&A',
    
    // Tab Labels
    'uses': 'Uses',
    'composition': 'Composition',
    'directions_for_use': 'Directions for Use',
    'storage_and_disposal': 'Storage and Disposal',
    'quick_tips': 'Quick Tips',
    'interactions': 'Interactions',
    'ingredients_and_benefits': 'Ingredients and Benefits',
    'similar_medicines': 'Similar Medicines',
    'frequently_bought_together': 'Frequently Bought Together',
    'in_stock': 'In Stock',
    'out_of_stock': 'Out of Stock',
    'yes': 'Yes',
    'no': 'No',
  },
  hi: {
    // Navigation & Basic UI
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
    'view_cart': 'कार्ट देखें',
    'please_add_items_to_proceed': 'आगे बढ़ने के लिए कृपया आइटम जोड़ें',
    'quick_links': 'त्वरित लिंक',
    'quantity': 'मात्रा',
    
    // Product Information Fields
    'description': 'विवरण',
    'manufacturer': 'निर्माता',
    'salt_composition': 'नमक संरचना',
    'medicine_type': 'दवा का प्रकार',
    'stock': 'स्टॉक',
    'introduction': 'परिचय',
    'benefits': 'लाभ',
    'how_to_use': 'कैसे उपयोग करें',
    'safety_advice': 'सुरक्षा सलाह',
    'if_miss': 'अगर खुराक छूट जाए तो',
    'packaging': 'पैकेजिंग',
    'packaging_type': 'पैकेजिंग प्रकार',
    'mrp': 'एमआरपी',
    'best_price': 'सबसे अच्छी कीमत',
    'discount_percent': 'छूट',
    'views_bought': 'देखे और खरीदे गए',
    'prescription_required': 'पर्चे की आवश्यकता है',
    'label': 'लेबल',
    'fact_box': 'तथ्य बॉक्स',
    'primary_use': 'प्राथमिक उपयोग',
    'storage': 'भंडारण',
    'common_side_effect': 'आम दुष्प्रभाव',
    'alcohol_interaction': 'अल्कोहल इंटरैक्शन',
    'pregnancy_interaction': 'गर्भावस्था इंटरैक्शन',
    'lactation_interaction': 'स्तनपान इंटरैक्शन',
    'driving_interaction': 'ड्राइविंग इंटरैक्शन',
    'kidney_interaction': 'किडनी इंटरैक्शन',
    'liver_interaction': 'लिवर इंटरैक्शन',
    'manufacturer_address': 'निर्माता का पता',
    'country_of_origin': 'उत्पत्ति देश',
    'for_sale': 'बिक्री के लिए',
    'q_and_a': 'प्रश्न और उत्तर',
    
    // Tab Labels
    'uses': 'उपयोग',
    'composition': 'संरचना',
    'directions_for_use': 'उपयोग के लिए निर्देश',
    'storage_and_disposal': 'भंडारण और निपटान',
    'quick_tips': 'त्वरित टिप्स',
    'interactions': 'इंटरैक्शन्स',
    'ingredients_and_benefits': 'सामग्री और लाभ',
    'similar_medicines': 'समान दवाएं',
    'frequently_bought_together': 'अक्सर एक साथ खरीदे जाते हैं',
    'in_stock': 'स्टॉक में है',
    'out_of_stock': 'स्टॉक में नहीं है',
    'yes': 'हां',
    'no': 'नहीं',
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
    // Navigation & Basic UI
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
    'view_cart': 'Voir le panier',
    'please_add_items_to_proceed': 'Veuillez ajouter des articles pour continuer',
    'quick_links': 'Liens rapides',
    'quantity': 'Quantité',
    
    // Product Information Fields
    'description': 'Description',
    'manufacturer': 'Fabricant',
    'salt_composition': 'Composition du sel',
    'medicine_type': 'Type de médicament',
    'stock': 'Stock',
    'introduction': 'Introduction',
    'benefits': 'Avantages',
    'how_to_use': 'Comment utiliser',
    'safety_advice': 'Conseils de sécurité',
    'if_miss': 'Si vous manquez une dose',
    'packaging': 'Emballage',
    'packaging_type': 'Type d\'emballage',
    'mrp': 'Prix maximum de vente',
    'best_price': 'Meilleur prix',
    'discount_percent': 'Pourcentage de réduction',
    'views_bought': 'Vues et achats',
    'prescription_required': 'Ordonnance requise',
    'label': 'Étiquette',
    'fact_box': 'Boîte d\'information',
    'primary_use': 'Utilisation principale',
    'storage': 'Stockage',
    'common_side_effect': 'Effets secondaires courants',
    'alcohol_interaction': 'Interaction avec l\'alcool',
    'pregnancy_interaction': 'Interaction avec la grossesse',
    'lactation_interaction': 'Interaction avec l\'allaitement',
    'driving_interaction': 'Interaction avec la conduite',
    'kidney_interaction': 'Interaction avec les reins',
    'liver_interaction': 'Interaction avec le foie',
    'manufacturer_address': 'Adresse du fabricant',
    'country_of_origin': 'Pays d\'origine',
    'for_sale': 'À vendre',
    'q_and_a': 'Questions et réponses',
    
    // Tab Labels
    'uses': 'Utilisations',
    'composition': 'Composition',
    'directions_for_use': 'Mode d\'emploi',
    'storage_and_disposal': 'Stockage et élimination',
    'quick_tips': 'Conseils rapides',
    'interactions': 'Interactions',
    'ingredients_and_benefits': 'Ingrédients et avantages',
    'similar_medicines': 'Médicaments similaires',
    'frequently_bought_together': 'Souvent achetés ensemble',
    'in_stock': 'En stock',
    'out_of_stock': 'Rupture de stock',
    'yes': 'Oui',
    'no': 'Non',
  },
  es: {
    // Navigation & Basic UI
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
    'view_cart': 'Ver carrito',
    'please_add_items_to_proceed': 'Por favor añada artículos para continuar',
    'quick_links': 'Enlaces rápidos',
    'quantity': 'Cantidad',
    
    // Product Information Fields
    'description': 'Descripción',
    'manufacturer': 'Fabricante',
    'salt_composition': 'Composición de sal',
    'medicine_type': 'Tipo de medicina',
    'stock': 'Stock',
    'introduction': 'Introducción',
    'benefits': 'Beneficios',
    'how_to_use': 'Cómo usar',
    'safety_advice': 'Consejos de seguridad',
    'if_miss': 'Si olvida una dosis',
    'packaging': 'Empaque',
    'packaging_type': 'Tipo de empaque',
    'mrp': 'Precio máximo de venta',
    'best_price': 'Mejor precio',
    'discount_percent': 'Porcentaje de descuento',
    'views_bought': 'Vistas y compras',
    'prescription_required': 'Requiere receta',
    'label': 'Etiqueta',
    'fact_box': 'Recuadro de hechos',
    'primary_use': 'Uso principal',
    'storage': 'Almacenamiento',
    'common_side_effect': 'Efectos secundarios comunes',
    'alcohol_interaction': 'Interacción con alcohol',
    'pregnancy_interaction': 'Interacción durante el embarazo',
    'lactation_interaction': 'Interacción durante la lactancia',
    'driving_interaction': 'Interacción al conducir',
    'kidney_interaction': 'Interacción con los riñones',
    'liver_interaction': 'Interacción con el hígado',
    'manufacturer_address': 'Dirección del fabricante',
    'country_of_origin': 'País de origen',
    'for_sale': 'En venta',
    'q_and_a': 'Preguntas y respuestas',
    
    // Tab Labels
    'uses': 'Usos',
    'composition': 'Composición',
    'directions_for_use': 'Instrucciones de uso',
    'storage_and_disposal': 'Almacenamiento y eliminación',
    'quick_tips': 'Consejos rápidos',
    'interactions': 'Interacciones',
    'ingredients_and_benefits': 'Ingredientes y beneficios',
    'similar_medicines': 'Medicamentos similares',
    'frequently_bought_together': 'Comprados frecuentemente juntos',
    'in_stock': 'En stock',
    'out_of_stock': 'Agotado',
    'yes': 'Sí',
    'no': 'No',
  },
  ar: {
    // Navigation & Basic UI
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
    'view_cart': 'عرض السلة',
    'please_add_items_to_proceed': 'الرجاء إضافة عناصر للمتابعة',
    'quick_links': 'روابط سريعة',
    'quantity': 'الكمية',
    
    // Product Information Fields
    'description': 'الوصف',
    'manufacturer': 'الشركة المصنعة',
    'salt_composition': 'تركيبة الملح',
    'medicine_type': 'نوع الدواء',
    'stock': 'المخزون',
    'introduction': 'مقدمة',
    'benefits': 'الفوائد',
    'how_to_use': 'كيفية الاستخدام',
    'safety_advice': 'نصائح السلامة',
    'if_miss': 'إذا فاتتك جرعة',
    'packaging': 'التعبئة',
    'packaging_type': 'نوع التعبئة',
    'mrp': 'السعر الأقصى للتجزئة',
    'best_price': 'أفضل سعر',
    'discount_percent': 'نسبة الخصم',
    'views_bought': 'المشاهدات والمشتريات',
    'prescription_required': 'تتطلب وصفة طبية',
    'label': 'ملصق',
    'fact_box': 'صندوق الحقائق',
    'primary_use': 'الاستخدام الرئيسي',
    'storage': 'التخزين',
    'common_side_effect': 'الآثار الجانبية الشائعة',
    'alcohol_interaction': 'التفاعل مع الكحول',
    'pregnancy_interaction': 'التفاعل مع الحمل',
    'lactation_interaction': 'التفاعل مع الرضاعة',
    'driving_interaction': 'التفاعل مع القيادة',
    'kidney_interaction': 'التفاعل مع الكلى',
    'liver_interaction': 'التفاعل مع الكبد',
    'manufacturer_address': 'عنوان الشركة المصنعة',
    'country_of_origin': 'بلد المنشأ',
    'for_sale': 'للبيع',
    'q_and_a': 'أسئلة وأجوبة',
    
    // Tab Labels
    'uses': 'الاستخدامات',
    'composition': 'التركيب',
    'directions_for_use': 'إرشادات الاستخدام',
    'storage_and_disposal': 'التخزين والتخلص',
    'quick_tips': 'نصائح سريعة',
    'interactions': 'التفاعلات',
    'ingredients_and_benefits': 'المكونات والفوائد',
    'similar_medicines': 'أدوية مشابهة',
    'frequently_bought_together': 'تُشترى معًا بشكل متكرر',
    'in_stock': 'متوفر',
    'out_of_stock': 'غير متوفر',
    'yes': 'نعم',
    'no': 'لا',
  },
  de: {
    // Navigation & Basic UI
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
    'view_cart': 'Warenkorb anzeigen',
    'please_add_items_to_proceed': 'Bitte fügen Sie Artikel hinzu, um fortzufahren',
    'quick_links': 'Schnelllinks',
    'quantity': 'Menge',
    
    // Product Information Fields
    'description': 'Beschreibung',
    'manufacturer': 'Hersteller',
    'salt_composition': 'Salzzusammensetzung',
    'medicine_type': 'Medikamententyp',
    'stock': 'Lagerbestand',
    'introduction': 'Einführung',
    'benefits': 'Vorteile',
    'how_to_use': 'Anwendungshinweise',
    'safety_advice': 'Sicherheitshinweise',
    'if_miss': 'Bei verpasster Dosis',
    'packaging': 'Verpackung',
    'packaging_type': 'Verpackungsart',
    'mrp': 'Höchstverkaufspreis',
    'best_price': 'Bestpreis',
    'discount_percent': 'Rabatt',
    'views_bought': 'Aufrufe und Käufe',
    'prescription_required': 'Rezeptpflichtig',
    'label': 'Etikett',
    'fact_box': 'Faktenbox',
    'primary_use': 'Hauptanwendung',
    'storage': 'Lagerung',
    'common_side_effect': 'Häufige Nebenwirkungen',
    'alcohol_interaction': 'Wechselwirkung mit Alkohol',
    'pregnancy_interaction': 'Wechselwirkung bei Schwangerschaft',
    'lactation_interaction': 'Wechselwirkung bei Stillzeit',
    'driving_interaction': 'Wechselwirkung beim Fahren',
    'kidney_interaction': 'Wechselwirkung bei Nierenerkrankungen',
    'liver_interaction': 'Wechselwirkung bei Lebererkrankungen',
    'manufacturer_address': 'Herstelleradresse',
    'country_of_origin': 'Herkunftsland',
    'for_sale': 'Zum Verkauf',
    'q_and_a': 'Fragen und Antworten',
    
    // Tab Labels
    'uses': 'Anwendungen',
    'composition': 'Zusammensetzung',
    'directions_for_use': 'Gebrauchsanweisung',
    'storage_and_disposal': 'Lagerung und Entsorgung',
    'quick_tips': 'Schnelle Tipps',
    'interactions': 'Wechselwirkungen',
    'ingredients_and_benefits': 'Inhaltsstoffe und Vorteile',
    'similar_medicines': 'Ähnliche Medikamente',
    'frequently_bought_together': 'Wird oft zusammen gekauft',
    'in_stock': 'Auf Lager',
    'out_of_stock': 'Nicht auf Lager',
    'yes': 'Ja',
    'no': 'Nein',
  },
  zh: {
    // Navigation & Basic UI
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
    'view_cart': '查看购物车',
    'please_add_items_to_proceed': '请添加商品以继续',
    'quick_links': '快速链接',
    'quantity': '数量',
    
    // Product Information Fields
    'description': '描述',
    'manufacturer': '制造商',
    'salt_composition': '盐成分',
    'medicine_type': '药品类型',
    'stock': '库存',
    'introduction': '简介',
    'benefits': '益处',
    'how_to_use': '如何使用',
    'safety_advice': '安全建议',
    'if_miss': '如果错过剂量',
    'packaging': '包装',
    'packaging_type': '包装类型',
    'mrp': '最高零售价',
    'best_price': '最优价格',
    'discount_percent': '折扣',
    'views_bought': '浏览和购买',
    'prescription_required': '需要处方',
    'label': '标签',
    'fact_box': '事实框',
    'primary_use': '主要用途',
    'storage': '储存',
    'common_side_effect': '常见副作用',
    'alcohol_interaction': '酒精相互作用',
    'pregnancy_interaction': '怀孕相互作用',
    'lactation_interaction': '哺乳相互作用',
    'driving_interaction': '驾驶相互作用',
    'kidney_interaction': '肾脏相互作用',
    'liver_interaction': '肝脏相互作用',
    'manufacturer_address': '制造商地址',
    'country_of_origin': '原产国',
    'for_sale': '出售',
    'q_and_a': '问答',
    
    // Tab Labels
    'uses': '用途',
    'composition': '成分',
    'directions_for_use': '使用说明',
    'storage_and_disposal': '储存和处理',
    'quick_tips': '快速提示',
    'interactions': '相互作用',
    'ingredients_and_benefits': '成分和益处',
    'similar_medicines': '类似药品',
    'frequently_bought_together': '经常一起购买',
    'in_stock': '有库存',
    'out_of_stock': '缺货',
    'yes': '是',
    'no': '否',
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