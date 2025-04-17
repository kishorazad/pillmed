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

const ProductDetail = () => {
  const params = useParams();
  const [_, navigate] = useLocation();
  const { addToCart } = useStore();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("uses");
  
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
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.id]);
  
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
  
  // Filtered related products (exclude current product)
  const filteredRelatedProducts = relatedProducts
    ? relatedProducts.filter((p: any) => p.id !== product.id).slice(0, 4)
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
          {/* Product image */}
          <div className="lg:w-2/5">
            <div className="border rounded-lg overflow-hidden bg-white p-4 mb-4">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-auto object-contain max-h-80 mx-auto"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
              <Button onClick={handleAddToCart} className="w-full sm:flex-1 bg-[#ff6f61] hover:bg-[#ff6f61]/90">
                ADD TO CART
              </Button>
              <Button onClick={handleDirectBooking} className="w-full sm:flex-1 bg-[#10847e] hover:bg-[#10847e]/90">
                BUY NOW
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
                <span className="mr-4">Quantity:</span>
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
                  <p className="font-medium">Delivery</p>
                  <p className="text-sm text-gray-600">Typically delivered in 2-3 days</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff6f61] mt-1 mr-3">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                <div>
                  <p className="font-medium">Offers</p>
                  <p className="text-sm text-gray-600">
                    Use code FIRSTORDER for an additional 10% off
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex mb-4 border-b">
                <button 
                  className={`py-3 px-4 ${activeTab === 'uses' ? 'text-[#10847e] border-b-2 border-[#10847e]' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('uses')}
                >
                  Uses
                </button>
                <button 
                  className={`py-3 px-4 ${activeTab === 'contraindications' ? 'text-[#10847e] border-b-2 border-[#10847e]' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('contraindications')}
                >
                  Contraindications
                </button>
                <button 
                  className={`py-3 px-4 ${activeTab === 'side-effects' ? 'text-[#10847e] border-b-2 border-[#10847e]' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('side-effects')}
                >
                  Side Effects
                </button>
              </div>
              
              {activeTab === 'uses' && (
                <div className="text-gray-700">
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10847e] mr-3 mt-1">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Uses of {product.name.toUpperCase()}</h3>
                      <p>{product.description || `${product.name} is used to treat various conditions as directed by your doctor. Please consult your healthcare provider for specific information.`}</p>
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
                      <ul className="list-disc pl-5 space-y-2">
                        <li>If you are allergic to any of the components in the medication.</li>
                        <li>If you have a history of an allergic reaction to similar medications.</li>
                        <li>If you have certain medical conditions that may interact with this medicine.</li>
                      </ul>
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
                      <p className="mb-2">Common side effects may include:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Headache</li>
                        <li>Dizziness</li>
                        <li>Nausea</li>
                        <li>Gastrointestinal discomfort</li>
                      </ul>
                      <p className="mt-3 text-sm">If you experience any severe side effects, please contact your healthcare provider immediately.</p>
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
                      <div className="grid grid-cols-3 border-b pb-2">
                        <div className="text-gray-500">Contains</div>
                        <div className="col-span-2">{product.description ? product.description.split(' ').slice(0, 3).join(' ') : product.name}</div>
                      </div>
                      <div className="grid grid-cols-3 border-b pb-2">
                        <div className="text-gray-500">Therapy</div>
                        <div className="col-span-2">{product.brand || "Generic"}</div>
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
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                  <Link href="#uses">Uses</Link>
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                  <Link href="#contraindications">Contraindications</Link>
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                  <Link href="#sideeffects">Side effects</Link>
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                  <Link href="#warnings">Precautions and Warnings</Link>
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                  <Link href="#directions">Directions for Use</Link>
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                  <Link href="#storage">Storage and disposal</Link>
                </Badge>
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
