import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, clearCart } = useStore();
  const { toast } = useToast();
  const [cartTotal, setCartTotal] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  
  // Calculate cart totals
  useEffect(() => {
    if (cart.length === 0) {
      setCartSubtotal(0);
      setDiscount(0);
      setDeliveryCharge(0);
      setCartTotal(0);
      return;
    }
    
    const subtotal = cart.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    const discountAmount = cart.reduce((sum, item) => {
      if (!item.product?.discountedPrice) return sum;
      const savings = (item.product.price - item.product.discountedPrice) * item.quantity;
      return sum + savings;
    }, 0);
    
    // Free delivery for orders above ₹500
    const shipping = subtotal > 500 ? 0 : 40;
    
    setCartSubtotal(subtotal);
    setDiscount(discountAmount);
    setDeliveryCharge(shipping);
    setCartTotal(subtotal - discountAmount + shipping);
  }, [cart]);
  
  const handleQuantityChange = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateCartItem(id, newQuantity);
  };
  
  const handleRemoveItem = async (id: number) => {
    await removeFromCart(id);
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
    });
  };
  
  const handleClearCart = async () => {
    await clearCart();
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Your Cart - Medadock</title>
        <meta name="description" content="View and manage items in your shopping cart" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        
        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <i className="fas fa-shopping-cart text-gray-300 text-5xl mb-4"></i>
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add items to your cart to continue shopping</p>
            <Button asChild className="bg-[#ff6f61] hover:bg-[#ff6f61]/90">
              <Link href="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart items list */}
            <div className="lg:w-2/3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Cart Items ({cart.length})</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearCart}
                    className="text-[#ff6f61]"
                  >
                    Clear All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {cart.map((item) => (
                      <div key={item.id} className="py-4 flex">
                        <div className="w-20 h-20 border rounded overflow-hidden">
                          <img 
                            src={item.product?.imageUrl} 
                            alt={item.product?.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <Link href={`/products/${item.product?.id}`}>
                            <h3 className="font-medium hover:text-[#ff6f61]">{item.product?.name}</h3>
                          </Link>
                          <p className="text-sm text-gray-500">{item.product?.quantity}</p>
                          <div className="flex justify-between items-center mt-3">
                            <div>
                              <span className="font-bold">₹{item.product?.discountedPrice || item.product?.price}</span>
                              {item.product?.discountedPrice && (
                                <span className="text-xs text-gray-500 line-through ml-1">
                                  ₹{item.product?.price}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              >
                                <i className="fas fa-minus text-xs"></i>
                              </Button>
                              <span className="w-10 text-center">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <i className="fas fa-plus text-xs"></i>
                              </Button>
                            </div>
                          </div>
                          <button 
                            className="text-xs text-[#ff6f61] mt-2 hover:underline"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Order summary */}
            <div className="lg:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>- ₹{discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Charges</span>
                      <span>{deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-4 border-t">
                      <span>Total</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-md">
                    <p className="flex items-center">
                      <i className="fas fa-tag mr-2"></i>
                      You're saving ₹{discount.toFixed(2)} on this order
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-[#ff6f61] hover:bg-[#ff6f61]/90">
                    <Link href="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Delivery info */}
              <Card className="mt-4">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <i className="fas fa-shield-alt text-[#10847e] mt-1 mr-3"></i>
                      <div>
                        <p className="font-medium">100% Genuine Products</p>
                        <p className="text-xs text-gray-500">All products are sourced directly from manufacturers</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-truck text-[#10847e] mt-1 mr-3"></i>
                      <div>
                        <p className="font-medium">Free Delivery on orders above ₹500</p>
                        <p className="text-xs text-gray-500">Delivering to 1000+ cities across India</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
