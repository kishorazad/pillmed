import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/components/LanguageSwitcher';

// Form validation schema
const checkoutSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters' }),
  city: z.string().min(2, { message: 'City must be at least 2 characters' }),
  state: z.string().min(2, { message: 'State must be at least 2 characters' }),
  pincode: z.string().min(6, { message: 'Pincode must be at least 6 characters' }),
  paymentMethod: z.enum(['creditCard', 'debitCard', 'upi', 'cod'], {
    required_error: 'Please select a payment method',
  }),
});

type CheckoutStep = 'address' | 'payment' | 'confirmation';

const Checkout = () => {
  const [location, navigate] = useLocation();
  const { cart, user, clearCart } = useStore();
  const { toast } = useToast();
  const [cartTotal, setCartTotal] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // Form with default values from user profile if available
  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: '',
      state: '',
      pincode: user?.pincode || '',
      paymentMethod: 'cod',
    },
  });
  
  // Calculate cart totals
  useEffect(() => {
    if (cart.length === 0 && !orderComplete) {
      // Redirect to cart if empty
      navigate('/cart');
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
  }, [cart, navigate, orderComplete]);
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof checkoutSchema>) => {
    if (currentStep === 'address') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      try {
        // Create a complete shipping address
        const shippingAddress = `${data.address}, ${data.city}, ${data.state} - ${data.pincode}`;
        
        // Prepare order items
        const items = cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.discountedPrice || item.product.price
        }));
        
        // Send order to server
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user?.id,
            shippingAddress,
            totalAmount: cartTotal,
            paymentMethod: data.paymentMethod,
            items
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create order');
        }
        
        const orderData = await response.json();
        
        // Set order ID from server response
        setOrderId(`ORD${orderData.id}`);
        
        // Clear the cart and set order as complete
        await clearCart();
        setOrderComplete(true);
        setCurrentStep('confirmation');
        
        toast({
          title: "Order placed successfully",
          description: "Thank you for your order!",
        });
      } catch (error) {
        console.error('Error creating order:', error);
        toast({
          title: "Error placing order",
          description: "There was a problem placing your order. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Go back to previous step
  const goBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('address');
    } else {
      navigate('/cart');
    }
  };
  
  // Scroll to top on page load or step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep, location]);
  
  const { t } = useLanguage();
  
  return (
    <>
      <Helmet>
        <title>Checkout - PillNow</title>
        <meta name="description" content="Complete your purchase securely" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t('checkout')}</h1>
        
        {/* Progress steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex flex-col items-center ${currentStep === 'address' || currentStep === 'payment' || currentStep === 'confirmation' ? 'text-[#10847e]' : 'text-gray-400'}`}>
              <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center font-bold">1</div>
              <span className="mt-1">{t('address')}</span>
            </div>
            <div className={`w-16 sm:w-28 h-1 ${currentStep === 'payment' || currentStep === 'confirmation' ? 'bg-[#10847e]' : 'bg-gray-300'}`}></div>
            <div className={`flex flex-col items-center ${currentStep === 'payment' || currentStep === 'confirmation' ? 'text-[#10847e]' : 'text-gray-400'}`}>
              <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center font-bold">2</div>
              <span className="mt-1">{t('payment')}</span>
            </div>
            <div className={`w-16 sm:w-28 h-1 ${currentStep === 'confirmation' ? 'bg-[#10847e]' : 'bg-gray-300'}`}></div>
            <div className={`flex flex-col items-center ${currentStep === 'confirmation' ? 'text-[#10847e]' : 'text-gray-400'}`}>
              <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center font-bold">3</div>
              <span className="mt-1">{t('confirmation')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
          {/* Main checkout form */}
          <div className="lg:w-2/3">
            {currentStep === 'confirmation' ? (
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-center">
                    <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                      <i className="fas fa-check text-2xl text-green-600"></i>
                    </div>
                    Order Confirmed!
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="mb-4">
                    Thank you for your order. Your order has been placed successfully!
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 inline-block">
                    <p><span className="font-medium">Order ID:</span> {orderId}</p>
                  </div>
                  <p className="mb-6">
                    You will receive an email confirmation shortly with the details of your order.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button asChild className="bg-[#10847e] hover:bg-[#10847e]/90">
                      <Link href="/">Return to Home</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {currentStep === 'address' ? 'Shipping Address' : 'Payment Method'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {currentStep === 'address' && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Enter your full name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="email" placeholder="Enter your email" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter your phone number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter your address" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Enter your city" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Enter your state" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="pincode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pincode</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Enter your pincode" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      )}
                      
                      {currentStep === 'payment' && (
                        <>
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel>Select a Payment Method</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="space-y-2"
                                  >
                                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                                      <RadioGroupItem value="creditCard" id="creditCard" />
                                      <label htmlFor="creditCard" className="flex items-center cursor-pointer">
                                        <i className="fas fa-credit-card text-blue-500 mr-3"></i>
                                        Credit Card
                                      </label>
                                    </div>
                                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                                      <RadioGroupItem value="debitCard" id="debitCard" />
                                      <label htmlFor="debitCard" className="flex items-center cursor-pointer">
                                        <i className="fas fa-credit-card text-green-500 mr-3"></i>
                                        Debit Card
                                      </label>
                                    </div>
                                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                                      <RadioGroupItem value="upi" id="upi" />
                                      <label htmlFor="upi" className="flex items-center cursor-pointer">
                                        <i className="fas fa-mobile-alt text-purple-500 mr-3"></i>
                                        UPI / Mobile Payment
                                      </label>
                                    </div>
                                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                                      <RadioGroupItem value="cod" id="cod" />
                                      <label htmlFor="cod" className="flex items-center cursor-pointer">
                                        <i className="fas fa-money-bill-wave text-green-600 mr-3"></i>
                                        Cash on Delivery
                                      </label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="p-4 bg-yellow-50 rounded-md text-sm text-yellow-800">
                            <p className="flex items-start">
                              <i className="fas fa-info-circle mt-1 mr-2"></i>
                              <span>This is a demo checkout. No actual payment will be processed.</span>
                            </p>
                          </div>
                        </>
                      )}
                      
                      <div className="pt-4 flex justify-between">
                        <Button type="button" variant="outline" onClick={goBack}>
                          {currentStep === 'address' ? 'Back to Cart' : 'Back to Address'}
                        </Button>
                        <Button type="submit" className="bg-[#ff6f61] hover:bg-[#ff6f61]/90">
                          {currentStep === 'address' ? 'Continue to Payment' : 'Place Order'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Order summary */}
          <div className="lg:w-1/3">
            {!orderComplete && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {cart.map((item) => (
                      <div key={item.id} className="py-2 flex">
                        <div className="w-12 h-12 border rounded overflow-hidden">
                          <img 
                            src={item.product?.imageUrl} 
                            alt={item.product?.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-medium line-clamp-1">{item.product?.name}</h3>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-sm font-medium">
                              ₹{((item.product?.discountedPrice || item.product?.price || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>- ₹{discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Charges</span>
                      <span>{deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-3 border-t">
                      <span>Total</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Delivery info */}
            <Card className="mt-4">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <i className="fas fa-shield-alt text-[#10847e] mt-1 mr-3"></i>
                    <div>
                      <p className="font-medium">100% Secure Payments</p>
                      <p className="text-xs text-gray-500">All payment options are secured with encryption</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <i className="fas fa-exchange-alt text-[#10847e] mt-1 mr-3"></i>
                    <div>
                      <p className="font-medium">Easy Returns</p>
                      <p className="text-xs text-gray-500">Return policy available for eligible products</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
