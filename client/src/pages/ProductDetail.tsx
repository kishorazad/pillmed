import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/products/ProductCard';
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SubstituteMedicines from '@/components/products/SubstituteMedicines';
import { useLanguage } from '@/components/LanguageSwitcher';
import { addToBrowsingHistory } from '@/services/browsing-history-service';

const ProductDetail = () => {
  const params = useParams();
  const [_, navigate] = useLocation();
  const { addToCart } = useStore();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("introduction");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Fetch product data
  const { data: product, isLoading, isError } = useQuery({
    queryKey: [`/api/products/${params.id}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch related products (same category)
  const { data: relatedProducts } = useQuery({
    queryKey: product ? [`/api/products/category/${product.categoryId}`] : null,
    enabled: !!product,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    // Get the current userId from store state for logging purposes
    const { user, tempUserId, openCart } = useStore.getState();
    const currentUserId = user?.id || tempUserId;
    
    console.log("Adding to cart for user ID:", currentUserId, "Product ID:", product.id, "Quantity:", quantity);
    
    try {
      await addToCart(product.id, quantity);
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
      
      // Open cart sidebar after adding item
      openCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive"
      });
    }
  };
  
  // Handle direct booking
  const handleDirectBooking = async () => {
    if (!product) return;
    
    // Add to cart first
    await handleAddToCart();
    
    // Navigate to checkout
    navigate('/checkout');
    
    toast({
      title: "Proceeding to checkout",
      description: "You can review your order before confirming",
    });
  };
  
  // Increase/decrease quantity
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  
  // Scroll to top on page load and track viewed product
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Add to browsing history when product data is loaded
    if (product) {
      addToBrowsingHistory({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl || '',
        price: product.price,
        discountedPrice: product.discountedPrice,
        quantity: product.quantity
      });
    }
  }, [params.id, product]);
  
  // Update when language changes
  useEffect(() => {
    // Refresh components and translations when language changes
    console.log("Language changed to:", language);
  }, [language]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
          <div className="lg:w-2/5">
            <div className="bg-gray-200 h-80 rounded-lg"></div>
          </div>
          <div className="lg:w-3/5">
            <div className="bg-gray-200 h-8 w-3/4 mb-3 rounded"></div>
            <div className="bg-gray-200 h-4 w-1/4 mb-6 rounded"></div>
            <div className="bg-gray-200 h-4 w-full mb-2 rounded"></div>
            <div className="bg-gray-200 h-4 w-full mb-2 rounded"></div>
            <div className="bg-gray-200 h-4 w-3/4 mb-6 rounded"></div>
            <div className="bg-gray-200 h-8 w-1/3 mb-4 rounded"></div>
            <div className="bg-gray-200 h-10 w-40 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <h2 className="text-xl font-medium text-red-600 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the product you're looking for.</p>
          <Link href="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Multiple product images (in a real app, these would come from the database)
  const productImages = [
    product.imageUrl || '',
    'https://cdn01.pharmeasy.in/dam/products_otc/I40046/cipcal-500mg-strip-of-15-tablets-2-1669710287.jpg',
    'https://cdn01.pharmeasy.in/dam/products_otc/I40046/cipcal-500mg-strip-of-15-tablets-3-1669710290.jpg',
    'https://cdn01.pharmeasy.in/dam/products_otc/I40046/cipcal-500mg-strip-of-15-tablets-4-1669710292.jpg'
  ];
  
  // Filtered related products (exclude current product)
  const filteredRelatedProducts = relatedProducts && 
                                  relatedProducts.products && 
                                  Array.isArray(relatedProducts.products)
    ? relatedProducts.products.filter((p: any) => p && p.id !== product.id).slice(0, 4)
    : [];
  
  // Generate SEO metadata for the product
  const generateSEOTitle = () => {
    return `${product.name} - Buy Online at PillNow`;
  };

  const generateSEODescription = () => {
    let desc = `Buy ${product.name}`;
    if (product.brand) desc += ` by ${product.brand}`;
    desc += ` online at PillNow. Get information about uses, composition, dosage, side effects and more. Order now for home delivery.`;
    return desc;
  };

  return (
    <>
      {/* Dynamic SEO metadata for each product */}
      <Helmet>
        <title>{generateSEOTitle()}</title>
        <meta name="description" content={generateSEODescription()} />
        <meta name="keywords" content={`${product.name}, ${product.brand || 'medicine'}, online pharmacy, healthcare, medicine, ${product.name.toLowerCase()}`} />
        <meta property="og:title" content={`${product.name} - PillNow`} />
        <meta property="og:description" content={product.description || `Buy ${product.name} online at the best price`} />
        {product.imageUrl && <meta property="og:image" content={product.imageUrl} />}
        <meta property="og:type" content="product" />
        <link rel="canonical" href={`https://pillnow.com/products/${params.id}`} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-4">
          <Link href="/">Home</Link> &#62; <Link href="/products">Products</Link> &#62; {product.name}
        </div>
        
        {/* Product details */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product image gallery */}
          <div className="lg:w-2/5">
            <div className="border rounded-lg overflow-hidden bg-white p-4 mb-4">
              <img 
                src={currentImageIndex === 0 ? product.imageUrl : productImages[currentImageIndex]} 
                alt={product.name} 
                className="w-full h-auto object-contain max-h-80 mx-auto"
              />
            </div>
            
            {/* Thumbnail gallery */}
            <div className="flex overflow-x-auto space-x-2 mb-4">
              {productImages.filter(Boolean).map((img, idx) => (
                <div 
                  key={idx} 
                  className={`border rounded p-1 cursor-pointer ${idx === currentImageIndex ? 'border-[#FF8F00]' : 'border-gray-200'}`}
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} - view ${idx+1}`} 
                    className="h-16 w-16 object-contain"
                  />
                </div>
              ))}
            </div>
            
            {/* Safety badge */}
            <div className="flex items-center justify-center bg-blue-50 p-2 rounded-lg mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span className="text-xs text-blue-700">{t('all_products_packed_safely')}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
              <Button onClick={handleAddToCart} className="w-full sm:flex-1 bg-[#ff6f61] hover:bg-[#ff6f61]/90">
                {t('add_to_cart')}
              </Button>
              <Button onClick={handleDirectBooking} className="w-full sm:flex-1 bg-[#10847e] hover:bg-[#10847e]/90">
                {t('buy_now')}
              </Button>
            </div>
          </div>
          
          {/* Product info */}
          <div className="lg:w-3/5">
            <h1 className="text-2xl font-bold mb-1">{product.name}</h1>
            {product.brand && (
              <p className="text-sm text-gray-600 mb-2">By {product.brand}</p>
            )}
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center mb-4">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded flex items-center">
                  {product.rating} <span className="text-yellow-500 ml-1">★</span>
                </span>
                {product.ratingCount && (
                  <span className="text-sm text-gray-500 ml-2">
                    {product.ratingCount} ratings
                  </span>
                )}
              </div>
            )}
            
            {/* Price */}
            <div className="mb-4">
              <span className="text-2xl font-bold mr-2">
                ₹{product.discountedPrice || product.price}
              </span>
              {product.discountedPrice && (
                <>
                  <span className="text-gray-500 line-through">₹{product.price}</span>
                  <span className="text-green-600 ml-2">
                    {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% off
                  </span>
                </>
              )}
              <p className="text-sm text-gray-500 mt-1">₹{((product.discountedPrice || product.price) / parseFloat(product.quantity.replace(/[^0-9.]/g, '') || 1)).toFixed(2)}/ml (Inclusive of all taxes)</p>
            </div>
            
            {/* Quantity */}
            <div className="mb-6">
              <p className="font-medium mb-2">{product.quantity}</p>
              <div className="flex items-center">
                <span className="mr-4">{t('quantity')}:</span>
                <div className="flex items-center border rounded">
                  <button 
                    className="px-3 py-1 text-gray-500"
                    onClick={decreaseQuantity}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-x">{quantity}</span>
                  <button 
                    className="px-3 py-1 text-gray-500"
                    onClick={increaseQuantity}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            {/* Delivery and offers */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-start mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10847e] mt-1 mr-3">
                  <circle cx="17" cy="17" r="1"/><circle cx="7" cy="17" r="1"/>
                  <path d="M18 17H6v-2h8V5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1"/>
                  <path d="M9 5h2m0 0h2m0 0h1a2 2 0 0 1 2 2v3.764a2 2 0 0 0 1.106 1.789L18 13v4h-1"/>
                </svg>
                <div>
                  <p className="font-medium">{t('delivery')}</p>
                  <p className="text-sm text-gray-600">{t('typically_delivered_in', { days: '2-3' })}</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff6f61] mt-1 mr-3">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                <div>
                  <p className="font-medium">{t('offers')}</p>
                  <p className="text-sm text-gray-600">
                    {t('use_code_for_discount', { code: 'FIRSTORDER', discount: '10%' })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex mb-0 border-b overflow-x-auto bg-gray-50 rounded-t-md">
                <button 
                  className={`py-3 px-4 whitespace-nowrap ${activeTab === 'introduction' ? 'text-white bg-[#FF8F00] font-medium rounded-t-md' : 'text-gray-600 hover:text-[#FF8F00]'}`}
                  onClick={() => setActiveTab('introduction')}
                >
                  {t('introduction')}
                </button>
                <button 
                  className={`py-3 px-4 whitespace-nowrap ${activeTab === 'benefits' ? 'text-white bg-[#FF8F00] font-medium rounded-t-md' : 'text-gray-600 hover:text-[#FF8F00]'}`}
                  onClick={() => setActiveTab('benefits')}
                >
                  {t('benefits')}
                </button>
                <button 
                  className={`py-3 px-4 whitespace-nowrap ${activeTab === 'uses' ? 'text-white bg-[#FF8F00] font-medium rounded-t-md' : 'text-gray-600 hover:text-[#FF8F00]'}`}
                  onClick={() => setActiveTab('uses')}
                >
                  {t('uses')}
                </button>
                <button 
                  className={`py-3 px-4 whitespace-nowrap ${activeTab === 'directions' ? 'text-white bg-[#FF8F00] font-medium rounded-t-md' : 'text-gray-600 hover:text-[#FF8F00]'}`}
                  onClick={() => setActiveTab('directions')}
                >
                  {t('directions_for_use')}
                </button>
                <button 
                  className={`py-3 px-4 whitespace-nowrap ${activeTab === 'safety' ? 'text-white bg-[#FF8F00] font-medium rounded-t-md' : 'text-gray-600 hover:text-[#FF8F00]'}`}
                  onClick={() => setActiveTab('safety')}
                >
                  {t('safety_advice')}
                </button>
                <button 
                  className={`py-3 px-4 whitespace-nowrap ${activeTab === 'missed_dose' ? 'text-white bg-[#FF8F00] font-medium rounded-t-md' : 'text-gray-600 hover:text-[#FF8F00]'}`}
                  onClick={() => setActiveTab('missed_dose')}
                >
                  {t('if_you_miss_dose')}
                </button>
                <button 
                  className={`py-3 px-4 whitespace-nowrap ${activeTab === 'faq' ? 'text-white bg-[#FF8F00] font-medium rounded-t-md' : 'text-gray-600 hover:text-[#FF8F00]'}`}
                  onClick={() => setActiveTab('faq')}
                >
                  {t('faq')}
                </button>
                <button 
                  className={`py-3 px-4 whitespace-nowrap ${activeTab === 'composition' ? 'text-white bg-[#FF8F00] font-medium rounded-t-md' : 'text-gray-600 hover:text-[#FF8F00]'}`}
                  onClick={() => setActiveTab('composition')}
                >
                  {t('ingredients_and_benefits')}
                </button>
              </div>
              
              {/* Introduction section */}
              {activeTab === 'introduction' && (
                <div className="text-gray-700 p-4 border-l border-r border-b rounded-b-md">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10847e] mr-3 mt-1">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t('about')} {product.name}</h3>
                      <p className="mb-3">{product.description || `${product.name} is a medication prescribed by healthcare professionals.`}</p>
                      
                      <div className="bg-blue-50 p-3 rounded-md my-3">
                        <h4 className="font-medium text-blue-800 mb-2">{t('key_highlights')}</h4>
                        <ul className="list-disc pl-5 space-y-1 text-blue-700">
                          <li>{t('effective_treatment')}</li>
                          <li>{t('developed_by')} {product.brand || t('reputable_manufacturer')}</li>
                          <li>{t('used_by_thousands')}</li>
                          <li>{t('available_in_multiple_strengths')}</li>
                        </ul>
                      </div>
                      
                      <p>{t('consult_healthcare_provider')}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Benefits section */}
              {activeTab === 'benefits' && (
                <div className="text-gray-700 p-4 border-l border-r border-b rounded-b-md">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 mr-3 mt-1">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t('benefits_of')} {product.name}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                        <div className="bg-green-50 p-3 rounded-md">
                          <h4 className="font-medium text-green-800 mb-1">{t('proven_effectiveness')}</h4>
                          <p className="text-sm text-green-700">{t('clinically_proven')}</p>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded-md">
                          <h4 className="font-medium text-green-800 mb-1">{t('convenient_dosing')}</h4>
                          <p className="text-sm text-green-700">{t('easy_to_administer')}</p>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded-md">
                          <h4 className="font-medium text-green-800 mb-1">{t('well_tolerated')}</h4>
                          <p className="text-sm text-green-700">{t('minimal_side_effects')}</p>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded-md">
                          <h4 className="font-medium text-green-800 mb-1">{t('trusted_formula')}</h4>
                          <p className="text-sm text-green-700">{t('years_of_research')}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p>{t('individual_results_vary')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Uses tab */}
              {activeTab === 'uses' && (
                <div className="text-gray-700 p-4 border-l border-r border-b rounded-b-md">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10847e] mr-3 mt-1">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t('uses_of')} {product.name.toUpperCase()}</h3>
                      {(product as any).uses ? (
                        <div dangerouslySetInnerHTML={{ __html: (product as any).uses }} />
                      ) : (
                        <p>{product.description || `${product.name} is used to treat various conditions as directed by your doctor. Please consult your healthcare provider for specific information.`}</p>
                      )}
                      
                      <div className="bg-yellow-50 p-3 rounded-md mt-4">
                        <h4 className="font-medium text-yellow-800 mb-1">{t('important_note')}</h4>
                        <p className="text-sm text-yellow-700">{t('consult_doctor_before_use')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* How to use */}
              {activeTab === 'directions' && (
                <div className="text-gray-700 p-4 border-l border-r border-b rounded-b-md">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF8F00] mr-3 mt-1">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9.1 7.87a1.87 1.87 0 0 0 2.64 2.64" />
                      <path d="M10.2 13a1.5 1.5 0 0 0 3 0v-1.5a2.5 2.5 0 1 0-5 0" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t('how_to_use')} {product.name}</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="bg-[#FF8F00] text-white rounded-full h-6 w-6 flex items-center justify-center mr-3">1</div>
                          <p>{t('read_label_carefully')}</p>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-[#FF8F00] text-white rounded-full h-6 w-6 flex items-center justify-center mr-3">2</div>
                          <p>{t('follow_prescribed_dose')}</p>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-[#FF8F00] text-white rounded-full h-6 w-6 flex items-center justify-center mr-3">3</div>
                          <p>{t('take_with_water')}</p>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-[#FF8F00] text-white rounded-full h-6 w-6 flex items-center justify-center mr-3">4</div>
                          <p>{t('complete_course')}</p>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 p-3 rounded-md mt-4">
                        <h4 className="font-medium text-red-800 mb-1">{t('warning')}</h4>
                        <p className="text-sm text-red-700">{t('do_not_exceed_dose')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Safety Advice */}
              {activeTab === 'safety' && (
                <div className="text-gray-700 p-4 border-l border-r border-b rounded-b-md">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mr-3 mt-1">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t('safety_advice')}</h3>
                      
                      <div className="space-y-4 mt-3">
                        <div className="border-l-4 border-yellow-400 pl-3">
                          <h4 className="font-medium mb-1">{t('alcohol')}</h4>
                          <p className="text-sm">{t('alcohol_interaction_warning')}</p>
                        </div>
                        
                        <div className="border-l-4 border-yellow-400 pl-3">
                          <h4 className="font-medium mb-1">{t('pregnancy')}</h4>
                          <p className="text-sm">{t('pregnancy_warning')}</p>
                        </div>
                        
                        <div className="border-l-4 border-yellow-400 pl-3">
                          <h4 className="font-medium mb-1">{t('driving')}</h4>
                          <p className="text-sm">{t('driving_warning')}</p>
                        </div>
                        
                        <div className="border-l-4 border-yellow-400 pl-3">
                          <h4 className="font-medium mb-1">{t('kidney')}</h4>
                          <p className="text-sm">{t('kidney_warning')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* If you miss a dose */}
              {activeTab === 'missed_dose' && (
                <div className="text-gray-700 p-4 border-l border-r border-b rounded-b-md">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-3 mt-1">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t('if_you_miss_dose')}</h3>
                      
                      <p className="mb-4">{t('missed_dose_instructions')}</p>
                      
                      <div className="bg-blue-50 p-4 rounded-md">
                        <h4 className="font-medium text-blue-800 mb-2">{t('what_to_do')}</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          <li className="text-blue-700">{t('take_as_soon_as_remember')}</li>
                          <li className="text-blue-700">{t('skip_if_next_dose_soon')}</li>
                          <li className="text-blue-700">{t('never_double_dose')}</li>
                          <li className="text-blue-700">{t('contact_doctor_if_unsure')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* FAQ section */}
              {activeTab === 'faq' && (
                <div className="text-gray-700 p-4 border-l border-r border-b rounded-b-md">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF8F00] mr-3 mt-1">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <div className="w-full">
                      <h3 className="font-semibold text-lg mb-3">{t('frequently_asked_questions')}</h3>
                      
                      <div className="space-y-4">
                        <div className="border rounded-md p-3">
                          <h4 className="font-medium mb-1 text-[#FF8F00]">{t('faq_how_long_q')}</h4>
                          <p className="text-sm">{t('faq_how_long_a')}</p>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <h4 className="font-medium mb-1 text-[#FF8F00]">{t('faq_side_effects_q')}</h4>
                          <p className="text-sm">{t('faq_side_effects_a')}</p>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <h4 className="font-medium mb-1 text-[#FF8F00]">{t('faq_with_food_q')}</h4>
                          <p className="text-sm">{t('faq_with_food_a')}</p>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <h4 className="font-medium mb-1 text-[#FF8F00]">{t('faq_storage_q')}</h4>
                          <p className="text-sm">{t('faq_storage_a')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Composition section */}
              {activeTab === 'composition' && (
                <div className="text-gray-700 p-4 border-l border-r border-b rounded-b-md">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10847e] mr-3 mt-1">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 3v6" />
                      <path d="M9 9h6" />
                      <path d="m15 12-3 3-3-3" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t('composition_of')} {product.name.toUpperCase()}</h3>
                      {(product as any).composition ? (
                        <p>{(product as any).composition}</p>
                      ) : (
                        <p>{t('composition_not_available')}</p>
                      )}
                      
                      {(product as any).manufacturer && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-1">{t('manufacturer')}</h4>
                          <p>{(product as any).manufacturer}</p>
                        </div>
                      )}
                      
                      {(product as any).packSize && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-1">{t('pack_size')}</h4>
                          <p>{(product as any).packSize}</p>
                        </div>
                      )}
                      
                      {(product as any).storageInstructions && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-1">{t('storage_instructions')}</h4>
                          <p>{(product as any).storageInstructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'contraindications' && (
                <div className="text-gray-700">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff6f61] mr-3 mt-1">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Contraindications of {product.name.toUpperCase()}</h3>
                      {(product as any).contraindications ? (
                        <div dangerouslySetInnerHTML={{ __html: (product as any).contraindications }} />
                      ) : (
                        <ul className="list-disc pl-5 space-y-2">
                          <li>If you are allergic to any of the components in the medication.</li>
                          <li>If you have a history of an allergic reaction to similar medications.</li>
                          <li>If you have certain medical conditions that may interact with this medicine.</li>
                        </ul>
                      )}
                      
                      {(product as any).warnings && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-1">Warnings</h4>
                          <div dangerouslySetInnerHTML={{ __html: (product as any).warnings }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'side-effects' && (
                <div className="text-gray-700">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 mr-3 mt-1">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Side Effects of {product.name.toUpperCase()}</h3>
                      {(product as any).sideEffects ? (
                        <div dangerouslySetInnerHTML={{ __html: (product as any).sideEffects }} />
                      ) : (
                        <>
                          <p className="mb-2">Common side effects may include:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>Headache</li>
                            <li>Dizziness</li>
                            <li>Nausea</li>
                            <li>Gastrointestinal discomfort</li>
                          </ul>
                        </>
                      )}
                      <p className="mt-3 text-sm">If you experience any severe side effects, please contact your healthcare provider immediately.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'directions' && (
                <div className="bg-white p-4 text-gray-700">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF8F00] mr-3 mt-1">
                      <path d="M19 15V9c0-1.2-1-2-2-2h-8" />
                      <rect x="3" y="7" width="5" height="5" rx="1" />
                      <path d="M9 12h2.7" />
                      <circle cx="16" cy="19" r="2" />
                      <circle cx="7" cy="19" r="2" />
                      <path d="M16 19h.01" />
                    </svg>
                    <div className="w-full">
                      <h3 className="font-semibold text-lg mb-3">
                        <span className="bg-[#FF8F00] text-white px-3 py-1 rounded">
                          {t('directions_for_use')} - {product.name.toUpperCase()}
                        </span>
                      </h3>
                      <div className="mt-4 bg-[#FFF5E6] p-4 rounded-md border-l-4 border-[#FF8F00]">
                        <ul className="list-disc pl-6 space-y-2">
                          {(product as any).how_to_use ? (
                            <div dangerouslySetInnerHTML={{ __html: (product as any).how_to_use }} />
                          ) : (
                            <>
                              <li>Take this medication as directed by your doctor.</li>
                              <li>Do not increase your dose or use this drug more often or for longer than prescribed.</li>
                              <li>Use the lowest effective dose for the shortest duration possible to minimize side effects.</li>
                              <li>Take with or without food as directed by your physician.</li>
                            </>
                          )}
                        </ul>
                      </div>
                      
                      {(product as any).if_miss && (
                        <div className="mt-4 bg-[#FFF5E6] p-4 rounded-md border-l-4 border-[#FF8F00]">
                          <h4 className="font-medium mb-1 text-[#FF8F00]">{t('if_miss')}</h4>
                          <p>{(product as any).if_miss}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 p-3 bg-[#FFFAEE] rounded-md border border-[#FF8F00]">
                        <p className="text-[#FF8F00] font-medium">Important Note</p>
                        <p className="text-gray-700 mt-1">This medication information is provided for informational purposes only. Always consult your healthcare provider for proper dosage instructions tailored to your specific health condition.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'storage' && (
                <div className="bg-white p-4 text-gray-700">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF8F00] mr-3 mt-1">
                      <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
                      <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
                      <path d="M4 12h16" />
                      <path d="M9 12v4" />
                      <path d="M15 12v4" />
                    </svg>
                    <div className="w-full">
                      <h3 className="font-semibold text-lg mb-3">
                        <span className="bg-[#FF8F00] text-white px-3 py-1 rounded">
                          {t('storage_and_disposal')} - {product.name.toUpperCase()}
                        </span>
                      </h3>
                      
                      <div className="mt-4 bg-[#FFF5E6] p-4 rounded-md border-l-4 border-[#FF8F00]">
                        <ul className="list-disc pl-6 space-y-2">
                          {((product as any).storageInstructions || (product as any).storage) ? (
                            <div dangerouslySetInnerHTML={{ __html: (product as any).storageInstructions || (product as any).storage }} />
                          ) : (
                            <>
                              <li>Store at room temperature away from light and moisture.</li>
                              <li>Keep all medications away from children and pets.</li>
                              <li>Do not flush medications down the toilet or pour them into a drain unless instructed to do so.</li>
                              <li>Properly discard this product when it is expired or no longer needed.</li>
                            </>
                          )}
                        </ul>
                      </div>
                      
                      <div className="mt-4 p-3 bg-[#FFFAEE] rounded-md border border-[#FF8F00]">
                        <p className="text-[#FF8F00] font-medium">Temperature Guidelines</p>
                        <p className="text-gray-700 mt-1">Unless specifically mentioned, store between 15-30°C (59-86°F). Keep away from heat, direct light, and humid places.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'quicktips' && (
                <div className="bg-white p-4 text-gray-700">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF8F00] mr-3 mt-1">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div className="w-full">
                      <h3 className="font-semibold text-lg mb-3">
                        <span className="bg-[#FF8F00] text-white px-3 py-1 rounded">
                          {t('quick_tips')} - {product.name.toUpperCase()}
                        </span>
                      </h3>
                      
                      <div className="mt-4 bg-[#FFF5E6] p-4 rounded-md border-l-4 border-[#FF8F00]">
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Take this medication regularly to get the most benefit from it.</li>
                          <li>If you experience stomach upset, consider taking it with food.</li>
                          <li>Inform your doctor if you experience any unusual side effects.</li>
                          <li>Do not share your medication with others even if they have the same symptoms.</li>
                          <li>Keep a list of all the products you use and share it with your doctor.</li>
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-[#FFFAEE] p-3 rounded-md border border-[#FF8F00]">
                          <p className="text-[#FF8F00] font-medium">Best Time to Take</p>
                          <p className="text-gray-700 mt-1">Follow your doctor's advice for the optimal timing. Most medications work best when taken consistently at the same time each day.</p>
                        </div>
                        <div className="bg-[#FFFAEE] p-3 rounded-md border border-[#FF8F00]">
                          <p className="text-[#FF8F00] font-medium">Medication Tracking</p>
                          <p className="text-gray-700 mt-1">Use a pill organizer or set a daily alarm on your phone to help remember to take your medication on schedule.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'safety' && (
                <div className="text-gray-700">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF8F00] mr-3 mt-1">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <div className="w-full">
                      <h3 className="font-semibold text-lg mb-3">
                        <span className="bg-[#FF8F00] text-white px-3 py-1 rounded">
                          {t('safety_advice')} - {product.name.toUpperCase()}
                        </span>
                      </h3>
                      
                      <div className="mt-4 bg-[#FFF5E6] p-4 rounded-md border-l-4 border-[#FF8F00]">
                        {(product as any).safety_advise ? (
                          <div dangerouslySetInnerHTML={{ __html: (product as any).safety_advise }} />
                        ) : (
                          <p>Please consult your healthcare provider for safety information specific to this medication.</p>
                        )}
                      </div>
                      
                      {((product as any).storageInstructions || (product as any).storage) && (
                        <div className="mt-4 p-3 bg-[#FFFAEE] rounded-md border border-[#FF8F00]">
                          <p className="text-[#FF8F00] font-medium">Storage Instructions</p>
                          <p className="text-gray-700 mt-1">{(product as any).storageInstructions || (product as any).storage}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#FFFAEE] p-3 rounded-md border border-[#FF8F00]">
                          <p className="text-[#FF8F00] font-medium">{t('pregnancy_interaction')}</p>
                          <p className="text-gray-700 mt-1">
                            {(product as any).pregnancyInteraction || 'Consult your doctor before taking this medication during pregnancy.'}
                          </p>
                        </div>
                        <div className="bg-[#FFFAEE] p-3 rounded-md border border-[#FF8F00]">
                          <p className="text-[#FF8F00] font-medium">{t('lactation_interaction')}</p>
                          <p className="text-gray-700 mt-1">
                            {(product as any).lactationInteraction || 'Consult your doctor before taking this medication while breastfeeding.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'interactions' && (
                <div className="text-gray-700">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF8F00] mr-3 mt-1">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <div className="w-full">
                      <h3 className="font-semibold text-lg mb-3">
                        <span className="bg-[#FF8F00] text-white px-3 py-1 rounded">
                          {t('interactions')} - {product.name.toUpperCase()}
                        </span>
                      </h3>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(product as any).alcoholInteraction && (
                          <div className="bg-[#FFF5E6] p-4 rounded-md border-l-4 border-[#FF8F00]">
                            <h4 className="font-medium mb-1 text-[#FF8F00]">{t('alcohol_interaction')}</h4>
                            <p>{(product as any).alcoholInteraction}</p>
                          </div>
                        )}
                        
                        {(product as any).pregnancyInteraction && (
                          <div className="bg-[#FFF5E6] p-4 rounded-md border-l-4 border-[#FF8F00]">
                            <h4 className="font-medium mb-1 text-[#FF8F00]">{t('pregnancy_interaction')}</h4>
                            <p>{(product as any).pregnancyInteraction}</p>
                          </div>
                        )}
                        
                        {(product as any).lactationInteraction && (
                          <div className="bg-[#FFF5E6] p-4 rounded-md border-l-4 border-[#FF8F00]">
                            <h4 className="font-medium mb-1 text-[#FF8F00]">{t('lactation_interaction')}</h4>
                            <p>{(product as any).lactationInteraction}</p>
                          </div>
                        )}
                        
                        {(product as any).drivingInteraction && (
                          <div className="bg-[#FFF5E6] p-4 rounded-md border-l-4 border-[#FF8F00]">
                            <h4 className="font-medium mb-1 text-[#FF8F00]">{t('driving_interaction')}</h4>
                            <p>{(product as any).drivingInteraction}</p>
                          </div>
                        )}
                        
                        {(product as any).kidneyInteraction && (
                          <div className="bg-[#FFF5E6] p-4 rounded-md border-l-4 border-[#FF8F00]">
                            <h4 className="font-medium mb-1 text-[#FF8F00]">{t('kidney_interaction')}</h4>
                            <p>{(product as any).kidneyInteraction}</p>
                          </div>
                        )}
                        
                        {(product as any).liverInteraction && (
                          <div className="bg-[#FFF5E6] p-4 rounded-md border-l-4 border-[#FF8F00]">
                            <h4 className="font-medium mb-1 text-[#FF8F00]">{t('liver_interaction')}</h4>
                            <p>{(product as any).liverInteraction}</p>
                          </div>
                        )}
                      </div>
                      
                      {!((product as any).alcoholInteraction || 
                        (product as any).pregnancyInteraction || 
                        (product as any).lactationInteraction || 
                        (product as any).drivingInteraction || 
                        (product as any).kidneyInteraction || 
                        (product as any).liverInteraction) && (
                        <div className="mt-4 p-4 bg-[#FFFAEE] rounded-md border border-[#FF8F00]">
                          <p className="text-center">No specific interaction information available. Please consult your doctor for personalized advice.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'facts' && (
                <div className="text-gray-700">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF8F00] mr-3 mt-1">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                      <path d="M10 9H8" />
                    </svg>
                    <div className="w-full">
                      <h3 className="font-semibold text-lg mb-3">
                        <span className="bg-[#FF8F00] text-white px-3 py-1 rounded">
                          {t('fact_box')} - {product.name.toUpperCase()}
                        </span>
                      </h3>
                      
                      <div className="mt-4 bg-[#FFF5E6] p-4 rounded-md">
                        {(product as any).Fact_Box ? (
                          <div dangerouslySetInnerHTML={{ __html: (product as any).Fact_Box }} />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(product as any).primary_use && (
                              <div className="bg-[#FFFAEE] p-3 rounded-md border border-[#FF8F00]">
                                <h4 className="font-medium text-[#FF8F00]">{t('primary_use').toUpperCase()}</h4>
                                <p className="text-gray-700 mt-1">{(product as any).primary_use}</p>
                              </div>
                            )}
                            
                            {(product as any).medicine_type && (
                              <div className="bg-[#FFFAEE] p-3 rounded-md border border-[#FF8F00]">
                                <h4 className="font-medium text-[#FF8F00]">{t('medicine_type').toUpperCase()}</h4>
                                <p className="text-gray-700 mt-1">{(product as any).medicine_type}</p>
                              </div>
                            )}
                            
                            {(product as any).salt_composition && (
                              <div className="bg-[#FFFAEE] p-3 rounded-md border border-[#FF8F00]">
                                <h4 className="font-medium text-[#FF8F00]">{t('salt_composition').toUpperCase()}</h4>
                                <p className="text-gray-700 mt-1">{(product as any).salt_composition}</p>
                              </div>
                            )}
                            
                            {(product as any).packaging && (
                              <div className="bg-[#FFFAEE] p-3 rounded-md border border-[#FF8F00]">
                                <h4 className="font-medium text-[#FF8F00]">{t('packaging').toUpperCase()}</h4>
                                <p className="text-gray-700 mt-1">{(product as any).packaging} {(product as any).packaging_typ || ''}</p>
                              </div>
                            )}
                            
                            {(product as any).country_of_origin && (
                              <div className="bg-[#FFFAEE] p-3 rounded-md border border-[#FF8F00]">
                                <h4 className="font-medium text-[#FF8F00]">{t('country_of_origin').toUpperCase()}</h4>
                                <p className="text-gray-700 mt-1">{(product as any).country_of_origin}</p>
                              </div>
                            )}
                            
                            {(product as any).MANUFACTURER_ADDRESS && (
                              <div className="bg-[#FFFAEE] p-3 rounded-md border border-[#FF8F00]">
                                <h4 className="font-medium text-[#FF8F00]">{t('manufacturer_address').toUpperCase()}</h4>
                                <p className="text-gray-700 mt-1">{(product as any).MANUFACTURER_ADDRESS}</p>
                              </div>
                            )}
                            
                            {(product as any).prescription_required && (
                              <div className="bg-[#FFFAEE] p-3 rounded-md border border-[#FF8F00]">
                                <h4 className="font-medium text-[#FF8F00]">{t('prescription_required').toUpperCase()}</h4>
                                <p className="text-gray-700 mt-1">{(product as any).prescription_required === 'Yes' ? t('yes') : t('no')}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {(product as any).Q_A && (
                        <div className="mt-6 bg-[#FFF5E6] p-4 rounded-md border-l-4 border-[#FF8F00]">
                          <h4 className="font-medium mb-3 text-[#FF8F00]">{t('q_and_a')}</h4>
                          <div dangerouslySetInnerHTML={{ __html: (product as any).Q_A }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Additional info */}
            <div className="mb-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="description">
                  <AccordionTrigger className="text-left font-medium">Product Summary</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {/* Basic details */}
                      <div className="grid grid-cols-3 border-b pb-2">
                        <div className="text-gray-500">Offer Price</div>
                        <div className="col-span-2 font-medium">₹{product.discountedPrice || product.price}</div>
                      </div>
                      <div className="grid grid-cols-3 border-b pb-2">
                        <div className="text-gray-500">You Save</div>
                        <div className="col-span-2 text-green-600">
                          {product.discountedPrice ? 
                            `₹${(product.price - product.discountedPrice).toFixed(2)} (${Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% off)` : 
                            "No discount available"}
                        </div>
                      </div>
                      
                      {/* Composition information */}
                      {(product as any).composition && (
                        <div className="grid grid-cols-3 border-b pb-2">
                          <div className="text-gray-500">Composition</div>
                          <div className="col-span-2">{(product as any).composition}</div>
                        </div>
                      )}
                      
                      {/* Package size */}
                      {(product as any).packSize && (
                        <div className="grid grid-cols-3 border-b pb-2">
                          <div className="text-gray-500">Pack Size</div>
                          <div className="col-span-2">{(product as any).packSize}</div>
                        </div>
                      )}
                      
                      {/* Manufacturer */}
                      {(product as any).manufacturer && (
                        <div className="grid grid-cols-3 border-b pb-2">
                          <div className="text-gray-500">Manufacturer</div>
                          <div className="col-span-2">{(product as any).manufacturer}</div>
                        </div>
                      )}
                      
                      {/* Salt/Generic name */}
                      <div className="grid grid-cols-3 border-b pb-2">
                        <div className="text-gray-500">Contains</div>
                        <div className="col-span-2">
                          {(product as any).composition || 
                           (product.description ? product.description.split(' ').slice(0, 3).join(' ') : product.name)}
                        </div>
                      </div>
                      
                      {/* Brand */}
                      <div className="grid grid-cols-3 border-b pb-2">
                        <div className="text-gray-500">Brand</div>
                        <div className="col-span-2">{product.brand || "Generic"}</div>
                      </div>
                      
                      {/* Storage instructions */}
                      {(product as any).storageInstructions && (
                        <div className="grid grid-cols-3 border-b pb-2">
                          <div className="text-gray-500">Storage</div>
                          <div className="col-span-2">{(product as any).storageInstructions}</div>
                        </div>
                      )}
                      
                      {/* In stock status */}
                      <div className="grid grid-cols-3 border-b pb-2">
                        <div className="text-gray-500">Availability</div>
                        <div className="col-span-2 font-medium">
                          {product.inStock ? (
                            <span className="text-green-600">In Stock</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            {/* Safety banner */}
            <div className="bg-blue-50 p-3 rounded-md mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mr-2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <p className="text-sm text-blue-800">All the products are packed and stored safely</p>
            </div>
            
            {/* Quick Links */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Quick links</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setActiveTab('uses')}>
                  Uses
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setActiveTab('composition')}>
                  Composition
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setActiveTab('how-to-use')}>
                  How to Use
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setActiveTab('side-effects')}>
                  Side Effects
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setActiveTab('safety')}>
                  Safety Advice
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setActiveTab('interactions')}>
                  Interactions
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setActiveTab('facts')}>
                  Facts
                </Badge>
                {(product as any).Q_A && (
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100"
                    onClick={() => setActiveTab('facts')}>
                    FAQ
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Related products */}
        {/* Medicine Substitutes */}
        <SubstituteMedicines 
          medicineId={parseInt(params.id)}
          medicineName={product.name}
          composition={product.composition}
        />
        
        {filteredRelatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Frequently Bought Together</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredRelatedProducts.map((relatedProduct: any) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetail;
