import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
import { ProductSEO } from '@/components/seo';
import { getSafeImageUrl } from '@/utils/imageUtils';

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
    '/pillnow.png',
    '/pillnow.png',
    '/pillnow.png'
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
      {/* Enhanced SEO with structured data */}
      <ProductSEO 
        product={product}
      />
      
      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-4">
          <Link href="/">Home</Link> &#62; <Link href="/products">Products</Link> &#62; {product.name}
        </div>
        
        {/* Product details */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product image gallery */}
          <div className="lg:w-2/5">
            <div className="border rounded-lg overflow-hidden bg-white p-4 mb-4 relative">
              <img 
                src={getSafeImageUrl(currentImageIndex === 0 ? product.imageUrl : productImages[currentImageIndex])} 
                alt={product.name} 
                className="w-full h-auto object-contain max-h-80 mx-auto"
              />
              
              {/* Prescription Required Badge (Rx) */}
              {(product as any).prescriptionRequired && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold shadow-lg z-10">
                  Rx
                </div>
              )}
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
                    src={getSafeImageUrl(img)} 
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
              <Button 
                onClick={handleAddToCart} 
                className="w-full sm:flex-1 bg-[#FF8F00] hover:bg-[#FF8F00]/90 text-white font-semibold py-6 rounded-lg shadow-md transition-all flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t('add_to_cart')}
              </Button>
              <Button 
                onClick={handleDirectBooking} 
                className="w-full sm:flex-1 bg-[#10847e] hover:bg-[#10847e]/90 text-white font-semibold py-6 rounded-lg shadow-md transition-all flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('buy_now')}
              </Button>
            </div>
            
            {/* Prescription badge for smaller devices */}
            {(product as any).prescriptionRequired && (
              <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-md flex items-center">
                <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold mr-2">Rx</div>
                <p className="text-xs text-red-700">This medicine requires a valid prescription</p>
              </div>
            )}
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
                      
                      {/* Treatment information - dynamic based on medication type */}
                      <div className="mt-4">
                        <h4 className="font-medium text-[#10847e] text-lg border-b pb-1 mb-3">{t('in_treatment_of')}</h4>
                        
                        {product.name.includes("Teltab") ? (
                          <>
                            <div className="mb-4">
                              <h5 className="font-medium mb-1">Hypertension (high blood pressure)</h5>
                              <p className="text-sm leading-relaxed">
                                {product.name} relaxes the blood vessels so that blood can flow more easily around your body. This effectively lowers the blood pressure. It must be taken regularly as prescribed to be effective. You do not usually feel any direct benefit from taking this medicine, but it works in the long term to keep you well.
                              </p>
                            </div>
                            
                            <div className="mb-4">
                              <h5 className="font-medium mb-1">Prevention of heart attack and stroke</h5>
                              <p className="text-sm leading-relaxed">
                                If your blood pressure is controlled you are less at risk of having a heart attack or stroke. {product.name} reduces the chances of heart diseases and helps you remain healthier for longer. Take it regularly and make appropriate lifestyle changes, such as eating healthy and staying active, to maximize the effectiveness of this medicine.
                              </p>
                            </div>
                            
                            <div className="mb-4">
                              <h5 className="font-medium mb-1">Treatment of Heart failure</h5>
                              <p className="text-sm leading-relaxed">
                                Heart failure means your heart is weak and cannot pump enough blood to your lungs and the rest of your body. The most common symptoms are breathlessness, tiredness, and swelling in your legs, ankles, abdomen, and other parts of your body. {product.name} is an effective treatment for heart failure. This medicine will help relieve your symptoms, making you feel better and more energetic. Take it regularly and keep taking it even if you feel better.
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="mb-4">
                            <p className="text-sm leading-relaxed">
                              {product.name} is used to treat various conditions as directed by your doctor. Common uses may include treating symptoms like {(product as any).uses || 'pain, inflammation, allergies, or specific health conditions'}. The medication works by {(product as any).mechanism || 'targeting specific systems in your body'} to provide relief.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-md my-3">
                        <h4 className="font-medium text-blue-800 mb-2">{t('key_highlights')}</h4>
                        <ul className="list-disc pl-5 space-y-1 text-blue-700">
                          <li>{t('effective_treatment')}</li>
                          <li>{t('developed_by')} {product.brand || t('reputable_manufacturer')}</li>
                          <li>{t('used_by_thousands')}</li>
                          <li>{t('available_in_multiple_strengths')}</li>
                        </ul>
                      </div>
                      
                      <p className="mt-4 text-sm text-gray-600 italic">{t('consult_healthcare_provider')}</p>
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
                      
                      {/* Detailed dosing information for specific medications */}
                      {product.name.includes("Teltab") ? (
                        <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
                          <p className="text-sm leading-relaxed mb-3">
                            Take this medicine in the dose and duration as advised by your doctor. Swallow it as a whole. Do not chew, crush or break it. {product.name} may be taken with or without food, but it is better to take it at a fixed time.
                          </p>
                          
                          <h4 className="font-medium text-[#10847e] mt-4 mb-2">How {product.name} works</h4>
                          <p className="text-sm leading-relaxed">
                            {product.name} is an angiotensin receptor blocker (ARB). It works by blocking the hormone angiotensin thereby relaxing blood vessels, allowing the blood to flow more smoothly and the heart to pump more efficiently.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
                          <p className="text-sm leading-relaxed mb-3">
                            Take this medicine as directed by your doctor. Follow the dosage instructions carefully and complete the full course as prescribed. {product.name} may be taken with or without food, however it's best to take it at the same time each day.
                          </p>
                        </div>
                      )}
                      
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
                      
                      <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <h4 className="font-medium text-blue-800 mb-1">{t('regular_use')}</h4>
                        <p className="text-sm text-blue-700">{t('follow_doctors_advice')}</p>
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
                      
                      {product.name.includes("Teltab") ? (
                        <div className="mb-4">
                          <div className="mb-4">
                            <h4 className="font-medium text-[#10847e] border-b pb-1 mb-2">Description</h4>
                            <p className="text-sm leading-relaxed">
                              Teltab 80mg Tablet is a medicine used to treat high blood pressure and heart failure. Lowering blood pressure helps to prevent future heart attacks and strokes. This medicine is also effective in preserving kidney function in patients with diabetes.
                            </p>
                            <p className="text-sm leading-relaxed mt-3">
                              Teltab 80mg Tablet can be prescribed either alone or in combination with other medicines. It may be taken with or without food during the day or at night. However, try to take it at the same time each day to get the most benefit. It is important to continue taking it regularly even if you feel well or if your blood pressure is controlled. Most people with high blood pressure do not feel ill, but if you stop taking this medicine, your condition could get worse.
                            </p>
                            <p className="text-sm leading-relaxed mt-3">
                              This is a widely used medicine and is considered safe for long-term use. Making some changes in your lifestyle will also help lower your blood pressure. These may include regular exercise, losing weight, smoking cessation, reducing alcohol intake, and reducing the amount of salt in your diet as advised by your doctor.
                            </p>
                            <p className="text-sm leading-relaxed mt-3">
                              This medicine is tolerated well by most patients and has few side effects. However, it may cause upper respiratory tract infection, back pain, sinus infection, and diarrhea in some people. Let your doctor know if you experience any of these side effects. Before taking this medicine, let your doctor know if you have any kidney or liver problems. Pregnant or breastfeeding mothers should also consult their doctor before taking it. Your doctor may check your kidney function, blood pressure, and potassium levels in your blood at regular intervals while you are taking this medicine.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {(product as any).uses ? (
                            <div dangerouslySetInnerHTML={{ __html: (product as any).uses }} />
                          ) : (
                            <div>
                              <h4 className="font-medium text-[#10847e] border-b pb-1 mb-2">Description</h4>
                              <p className="text-sm leading-relaxed">
                                {product.description || `${product.name} is used to treat various conditions as directed by your doctor. Please consult your healthcare provider for specific information.`}
                              </p>
                              <p className="text-sm leading-relaxed mt-3">
                                This medication should be used as prescribed by your doctor. It's important to follow the dosage instructions and complete the full course of treatment even if you begin to feel better. Stopping medication early may result in incomplete treatment and potential recurrence of symptoms.
                              </p>
                              <p className="text-sm leading-relaxed mt-3">
                                While using this medication, maintain a healthy lifestyle including proper diet, regular exercise, and adequate rest as advised by your healthcare provider. These lifestyle changes can enhance the effectiveness of the medication and improve overall treatment outcomes.
                              </p>
                            </div>
                          )}
                        </div>
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
                      
                      {product.name.includes("Teltab") ? (
                        <div className="mb-4">
                          <p className="text-sm leading-relaxed mb-3">
                            Take this medicine in the dose and duration as advised by your doctor. Swallow it as a whole. Do not chew, crush or break it. {product.name} may be taken with or without food, but it is better to take it at a fixed time.
                          </p>
                          
                          <div className="bg-blue-50 p-3 rounded-md my-4">
                            <h4 className="font-medium text-blue-800 mb-2">Dosage Information</h4>
                            <p className="text-sm text-blue-700 mb-2">
                              <strong>For High Blood Pressure (Hypertension):</strong> The usual starting dose is 40 mg once daily. If needed, your doctor may increase your dose to 80 mg once daily.
                            </p>
                            <p className="text-sm text-blue-700 mb-2">
                              <strong>For Heart Failure:</strong> The recommended starting dose is 10-20 mg once daily. Your doctor may gradually increase the dose up to 40-80 mg once daily.
                            </p>
                            <p className="text-sm text-blue-700">
                              <strong>For Kidney Protection in Diabetes:</strong> The recommended dose is 80 mg once daily.
                            </p>
                          </div>
                        </div>
                      ) : null}
                      
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
                          <p>{product.name.includes("Teltab") ? "Take with a glass of water. Swallow the tablet whole; do not crush, chew, or break it." : t('take_with_water')}</p>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-[#FF8F00] text-white rounded-full h-6 w-6 flex items-center justify-center mr-3">4</div>
                          <p>{product.name.includes("Teltab") ? "Take it at the same time each day to maintain consistent blood levels." : t('complete_course')}</p>
                        </div>
                        
                        {product.name.includes("Teltab") && (
                          <div className="flex items-center">
                            <div className="bg-[#FF8F00] text-white rounded-full h-6 w-6 flex items-center justify-center mr-3">5</div>
                            <p>Continue taking this medicine even if you feel well. High blood pressure often has no symptoms.</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-red-50 p-3 rounded-md mt-4">
                        <h4 className="font-medium text-red-800 mb-1">{t('warning')}</h4>
                        <p className="text-sm text-red-700">{product.name.includes("Teltab") ? "Do not stop taking this medication without consulting your doctor. Stopping suddenly may worsen your condition." : t('do_not_exceed_dose')}</p>
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
                      
                      {product.name.includes("Teltab") ? (
                        <div className="mb-4">
                          <p className="text-sm leading-relaxed mb-4">
                            Before taking {product.name}, tell your healthcare provider about all of your medical conditions, including if you:
                          </p>
                          <ul className="list-disc ml-5 mb-4 text-sm leading-relaxed space-y-1">
                            <li>Have liver or kidney problems</li>
                            <li>Have heart problems</li>
                            <li>Are pregnant or plan to become pregnant</li>
                            <li>Are breastfeeding or plan to breastfeed</li>
                            <li>Are taking any other medications, including prescription and over-the-counter medicines, vitamins, and herbal supplements</li>
                          </ul>
                        </div>
                      ) : null}
                      
                      <div className="space-y-4 mt-3">
                        <div className="border-l-4 border-yellow-400 pl-3">
                          <h4 className="font-medium mb-1">{t('alcohol')}</h4>
                          <p className="text-sm">
                            {product.name.includes("Teltab") 
                              ? "Consumption of alcohol may increase the risk of side effects such as lightheadedness, dizziness, and low blood pressure. It's advisable to avoid alcohol while taking this medication." 
                              : t('alcohol_interaction_warning')}
                          </p>
                        </div>
                        
                        <div className="border-l-4 border-yellow-400 pl-3">
                          <h4 className="font-medium mb-1">{t('pregnancy')}</h4>
                          <p className="text-sm">
                            {product.name.includes("Teltab") 
                              ? "This medication can cause injury and even death to the unborn baby if used during the second and third trimesters of pregnancy. If you become pregnant while taking this medicine, tell your doctor right away." 
                              : t('pregnancy_warning')}
                          </p>
                        </div>
                        
                        <div className="border-l-4 border-yellow-400 pl-3">
                          <h4 className="font-medium mb-1">{t('driving')}</h4>
                          <p className="text-sm">
                            {product.name.includes("Teltab") 
                              ? "This medicine may cause dizziness or fatigue, especially at the beginning of treatment. If you experience these symptoms, it's advisable not to drive or use machinery until you know how this medicine affects you." 
                              : t('driving_warning')}
                          </p>
                        </div>
                        
                        <div className="border-l-4 border-yellow-400 pl-3">
                          <h4 className="font-medium mb-1">{t('kidney')}</h4>
                          <p className="text-sm">
                            {product.name.includes("Teltab") 
                              ? "Tell your doctor if you have kidney problems. Your doctor may need to monitor your kidney function regularly while you take this medicine." 
                              : t('kidney_warning')}
                          </p>
                        </div>
                        
                        {product.name.includes("Teltab") ? (
                          <div className="border-l-4 border-yellow-400 pl-3">
                            <h4 className="font-medium mb-1">Liver</h4>
                            <p className="text-sm">
                              Tell your doctor if you have liver problems. Your doctor may need to monitor your liver function while you take this medicine.
                            </p>
                          </div>
                        ) : null}
                      </div>
                      
                      <div className="bg-red-50 p-3 rounded-md mt-5">
                        <h4 className="font-medium text-red-800 mb-1">Important Safety Notice</h4>
                        <p className="text-sm text-red-700">
                          The information provided here is not exhaustive. Always read the package insert and consult your healthcare provider for complete safety information.
                        </p>
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
                      
                      {product.name.includes("Teltab") ? (
                        <div>
                          <p className="mb-4">
                            With medications used to treat high blood pressure like {product.name}, maintaining consistent levels in your bloodstream is important for the medicine to work effectively. Here's what to do if you miss a dose:
                          </p>
                          
                          <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
                            <h4 className="font-medium text-[#10847e] mb-2">Missing a Single Dose</h4>
                            <p className="text-sm mb-3">
                              If you forget to take your dose of {product.name}, take it as soon as you remember. However, if it is already close to the time for your next dose (within 12 hours), skip the missed dose and continue with your regular dosing schedule.
                            </p>
                            <p className="text-sm font-medium text-red-700">
                              Do not take a double dose to make up for a forgotten dose. This may increase the risk of side effects.
                            </p>
                          </div>
                          
                          <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
                            <h4 className="font-medium text-[#10847e] mb-2">Frequently Missing Doses</h4>
                            <p className="text-sm">
                              If you often forget to take your medication, try setting a daily alarm or using a pill organizer. Consider taking your medicine at the same time as other daily activities, such as brushing your teeth or eating a meal, to help you remember.
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-md">
                            <h4 className="font-medium text-blue-800 mb-2">Important Tips</h4>
                            <ul className="list-disc pl-5 space-y-2">
                              <li className="text-blue-700">Do not stop taking {product.name} without consulting your doctor, even if you feel well.</li>
                              <li className="text-blue-700">Missing doses may lead to a loss of blood pressure control, which could increase your risk of heart attack, stroke, or other complications.</li>
                              <li className="text-blue-700">If you're having trouble remembering to take your medication, talk to your healthcare provider about possible solutions.</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div>
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
                      )}
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
                      
                      {product.name.includes("Teltab") ? (
                        <div className="space-y-4">
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium mb-1 text-[#FF8F00]">How long should I take Teltab 80mg Tablet?</h4>
                            <p className="text-sm">You may need to take Teltab 80mg Tablet for a long time, perhaps for the rest of your life. High blood pressure usually has no symptoms, so you may not know if your blood pressure is too high. Even when you feel well, keep taking this medicine as prescribed to keep your blood pressure controlled. Only stop taking this medicine on your doctor's advice.</p>
                          </div>
                          
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium mb-1 text-[#FF8F00]">What are the common side effects of Teltab 80mg Tablet?</h4>
                            <p className="text-sm">Common side effects of Teltab 80mg Tablet include dizziness, headache, diarrhea, and upper respiratory tract infection. These effects are often mild and go away as your body adjusts to the medicine. If they persist or worry you, consult your doctor. Less common side effects include back pain, sinus inflammation, and fatigue.</p>
                          </div>
                          
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium mb-1 text-[#FF8F00]">Can I take Teltab 80mg Tablet with food?</h4>
                            <p className="text-sm">Yes, Teltab 80mg Tablet can be taken with or without food. However, it is best to take it at the same time each day to maintain consistent blood levels in your body. Many patients find it helpful to take it as part of their morning or evening routine.</p>
                          </div>
                          
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium mb-1 text-[#FF8F00]">Can Teltab 80mg Tablet be used during pregnancy?</h4>
                            <p className="text-sm">No, Teltab 80mg Tablet should not be used during pregnancy, especially during the second and third trimesters, as it can cause harm to the developing baby. If you become pregnant while taking this medicine, inform your doctor immediately. Your doctor will likely switch you to a different blood pressure medication that's safer to use during pregnancy.</p>
                          </div>
                          
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium mb-1 text-[#FF8F00]">What should I do if I forget to take a dose?</h4>
                            <p className="text-sm">If you forget to take a dose of Teltab 80mg Tablet, take it as soon as you remember. However, if it is almost time for your next dose, skip the missed dose and take your next dose at the regular time. Do not take a double dose to make up for a forgotten dose. If you regularly forget doses, consider setting an alarm or asking a family member to remind you.</p>
                          </div>
                          
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium mb-1 text-[#FF8F00]">How should I store Teltab 80mg Tablet?</h4>
                            <p className="text-sm">Store Teltab 80mg Tablet at room temperature, away from light and moisture. Keep it out of reach of children and pets. Do not store it in the bathroom or kitchen where there might be excess heat or moisture. Discard any expired medication through proper disposal methods.</p>
                          </div>
                        </div>
                      ) : (
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
                      )}
                      
                      <div className="bg-blue-50 p-3 rounded-md mt-5">
                        <h4 className="font-medium text-blue-800 mb-1">{t('medical_advice')}</h4>
                        <p className="text-sm text-blue-700">{t('seek_doctor_advice')}</p>
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
                      
                      {product.name.includes("Teltab") ? (
                        <div>
                          <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
                            <h4 className="font-medium text-[#10847e] mb-2">Active Ingredient</h4>
                            <p className="text-sm">
                              Each Teltab 80mg Tablet contains 80 mg of Telmisartan.
                            </p>
                          </div>
                          
                          <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
                            <h4 className="font-medium text-[#10847e] mb-2">Inactive Ingredients</h4>
                            <p className="text-sm">
                              Teltab 80mg Tablet may contain the following inactive ingredients: Meglumine, Sodium Hydroxide, Povidone, Polysorbate 80, Mannitol (E421), Magnesium Stearate, and other excipients.
                            </p>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="font-medium mb-1">Manufacturer</h4>
                            <p className="text-sm">Manufactured by XYZ Pharmaceuticals Ltd.</p>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="font-medium mb-1">Pack Size</h4>
                            <p className="text-sm">Available in blister packs of 10, 14, 28, 30, 56, and 90 tablets.</p>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="font-medium mb-1">Storage Instructions</h4>
                            <p className="text-sm">Store at room temperature between 15-30°C (59-86°F). Protect from moisture and light. Keep out of reach of children.</p>
                          </div>
                          
                          <div className="bg-blue-50 p-3 rounded-md mt-4">
                            <h4 className="font-medium text-blue-800 mb-1">Important Note</h4>
                            <p className="text-sm text-blue-700">
                              The information provided is for general educational purposes only. Specific product formulations may vary between manufacturers. Always refer to the package insert or consult your healthcare provider for complete information.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
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
