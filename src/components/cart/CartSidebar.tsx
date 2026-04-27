import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CartSidebar = () => {
  const { cart, cartOpen, closeCart, updateCartItem, removeFromCart } = useStore();
  const { toast } = useToast();
  const [cartTotal, setCartTotal] = useState(0);
  
  // Calculate cart total
  useEffect(() => {
    const total = cart.reduce((sum, item) => {
      const price = item.product?.discountedPrice || item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    setCartTotal(total);
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
  
  return (
    <>
      {/* Cart Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-medium">Your Cart ({cart.length} items)</h3>
          <button onClick={closeCart} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto h-[calc(100%-180px)]">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <i className="fas fa-shopping-cart text-gray-300 text-4xl mb-4"></i>
              <p className="text-gray-500">Your cart is empty</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => {
                  closeCart();
                  window.location.href = '/products';
                }}
              >
                Shop Now
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex border-b pb-4 mb-4">
                <div className="w-16 h-16 border rounded overflow-hidden">
                  <img 
                    src={item.product?.imageUrl} 
                    alt={item.product?.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium">{item.product?.name}</h4>
                  <p className="text-xs text-gray-500">{item.product?.quantity}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <span className="font-medium">₹{item.product?.discountedPrice || item.product?.price}</span>
                      {item.product?.discountedPrice && (
                        <span className="text-xs text-gray-500 line-through ml-1">
                          ₹{item.product?.price}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center border rounded">
                      <button 
                        className="px-2 py-1 text-gray-500"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button 
                        className="px-2 py-1 text-gray-500"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button 
                    className="text-xs text-red-500 mt-2"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Subtotal</span>
              <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
            </div>
            <Link href="/checkout">
              <Button 
                className="w-full bg-[#ff6f61] text-white py-3 rounded-md font-medium hover:bg-[#ff6f61]/90 transition"
                onClick={closeCart}
              >
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Overlay */}
      {cartOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={closeCart}
        ></div>
      )}
    </>
  );
};

export default CartSidebar;
