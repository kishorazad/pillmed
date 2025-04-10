import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/products/ProductCard';

const ProductDetail = () => {
  const params = useParams();
  const { addToCart } = useStore();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  
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
    
    await addToCart(product.id, quantity);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
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
  
  return (
    <>
      <Helmet>
        <title>{product.name} - 1mg</title>
        <meta name="description" content={product.description || `Buy ${product.name} online at the best price`} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
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
            <div className="flex justify-center">
              <Button onClick={handleAddToCart} className="w-full lg:w-auto bg-[#ff6f61] hover:bg-[#ff6f61]/90">
                ADD TO CART
              </Button>
            </div>
          </div>
          
          {/* Product info */}
          <div className="lg:w-3/5">
            <h1 className="text-2xl font-bold mb-1">{product.name}</h1>
            {product.brand && (
              <p className="text-sm text-gray-600 mb-4">By {product.brand}</p>
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
              <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
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
                <i className="fas fa-truck text-[#10847e] mt-1 mr-3"></i>
                <div>
                  <p className="font-medium">Delivery</p>
                  <p className="text-sm text-gray-600">Typically delivered in 2-3 days</p>
                </div>
              </div>
              <div className="flex items-start">
                <i className="fas fa-tag text-[#ff6f61] mt-1 mr-3"></i>
                <div>
                  <p className="font-medium">Offers</p>
                  <p className="text-sm text-gray-600">
                    Use code FIRSTORDER for an additional 10% off
                  </p>
                </div>
              </div>
            </div>
            
            {/* Additional info tabs */}
            <Tabs defaultValue="description">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="how-to-use">How to Use</TabsTrigger>
                <TabsTrigger value="info">Additional Info</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="p-4">
                <p className="text-gray-700">
                  {product.description || "No description available for this product."}
                </p>
              </TabsContent>
              <TabsContent value="how-to-use" className="p-4">
                <p className="text-gray-700">
                  Please consult with your healthcare provider for specific instructions on how to use this product.
                </p>
              </TabsContent>
              <TabsContent value="info" className="p-4">
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Brand:</span> {product.brand || "Not specified"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">In Stock:</span> {product.inStock ? "Yes" : "No"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Related products */}
        {filteredRelatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">Related Products</h2>
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
