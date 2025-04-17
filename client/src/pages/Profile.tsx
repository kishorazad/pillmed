import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// Order History Component
const OrderHistory = ({ userId }: { userId?: number }) => {
  const { toast } = useToast();
  const { addToCart } = useStore();
  
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/orders/user', userId],
    enabled: !!userId,
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(`/api/orders/user/${userId}`);
        if (!response.ok) {
          if (response.status === 404) {
            // If no orders, return empty array
            return [];
          }
          throw new Error(`Error fetching orders: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
      }
    }
  });
  
  const reorderItems = async (orderId: number) => {
    try {
      // Get order items
      const response = await fetch(`/api/orders/${orderId}/items`);
      if (!response.ok) throw new Error('Failed to fetch order items');
      
      const orderItems = await response.json();
      
      // Add each item to cart
      for (const item of orderItems) {
        await addToCart(item.productId, item.quantity);
      }
      
      toast({
        title: "Items added to cart",
        description: `${orderItems.length} item(s) from order #${orderId} have been added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add items to cart",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#10847e]"></div>
      </div>
    );
  }
  
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-6">
        <i className="fas fa-shopping-bag text-gray-300 text-5xl mb-4"></i>
        <h3 className="text-xl font-medium mb-2">No orders yet</h3>
        <p className="text-gray-500 mb-4">Your order history will appear here</p>
        <Button asChild className="bg-[#ff6f61] hover:bg-[#ff6f61]/90">
          <Link href="/products">Shop Now</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {orders.map((order: any) => (
        <div key={order.id} className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-wrap justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                Order #{order.id} • {format(new Date(order.orderDate), 'PPP')}
              </p>
              <h3 className="font-medium">₹{order.totalAmount.toFixed(2)}</h3>
            </div>
            <div className="flex items-center space-x-3 mt-2 sm:mt-0">
              <Badge className={
                order.status === 'delivered' ? 'bg-green-500 hover:bg-green-600 text-white' : 
                order.status === 'shipped' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 
                order.status === 'processing' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 
                'bg-gray-500 hover:bg-gray-600 text-white'
              }>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => reorderItems(order.id)}
                className="text-[#10847e]"
              >
                <i className="fas fa-redo-alt mr-1 text-xs"></i> Reorder
              </Button>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            {/* We'll show a summary of order items here */}
            <div className="space-y-2">
              {order.items && order.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden mr-3">
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <i className="fas fa-pills text-gray-400"></i>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{item.product?.name || 'Product'}</h4>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm">₹{(item.quantity * item.price).toFixed(2)}</div>
                </div>
              ))}
              
              {!order.items && (
                <p className="text-sm text-gray-500 italic">Loading order details...</p>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
              <span className="font-medium">Delivery Address:</span>
              <span className="text-gray-600 text-right">
                {order.shippingAddress || 'Address not available'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Form validation schema
const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }).optional(),
  address: z.string().min(5, { message: 'Address must be at least 5 characters' }).optional(),
  pincode: z.string().min(6, { message: 'Pincode must be at least 6 characters' }).optional(),
});

const loginSchema = z.object({
  username: z.string().min(4, { message: 'Username must be at least 4 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, setUser } = useStore();
  const { toast } = useToast();
  
  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      pincode: user?.pincode || '',
    },
  });
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  // Update profile form when user changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        pincode: user.pincode || '',
      });
    }
  }, [user, profileForm]);
  
  // Handle profile update
  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      // In a real app, you would send this data to the server
      // For now, just update the local state
      if (user) {
        setUser({
          ...user,
          ...data,
        });
        
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };
  
  // Handle login
  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      // Get the temporary user ID and cart info to transfer the cart
      const { tempUserId, cart } = useStore.getState();
      const cartCount = cart.length;
      
      console.log(`Login: Transferring cart with ${cartCount} items from guest user ${tempUserId} to authenticated user`);
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tempUserId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const userData = await response.json();
      
      // Important: Use the store's setUser function directly to handle cart transfer
      useStore.getState().setUser(userData);
      
      // Explicitly fetch cart after login to ensure it's up to date
      setTimeout(async () => {
        await useStore.getState().fetchCart(userData.id);
        
        // After fetching the cart, check if there are items and automatically create an order
        const updatedCart = useStore.getState().cart;
        
        if (updatedCart.length > 0) {
          try {
            // Get shipping address from user profile or use a default
            const shippingAddress = userData.address || 'Default Shipping Address';
            
            // Use our new endpoint to convert cart to order
            const orderResponse = await fetch('/api/cart-to-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: userData.id,
                shippingAddress,
                paymentMethod: 'credit_card'
              })
            });
            
            if (orderResponse.ok) {
              console.log('Order created automatically after login');
              // Fetch updated cart (should be empty now)
              await useStore.getState().fetchCart(userData.id);
            }
          } catch (orderError) {
            console.error('Failed to create automatic order:', orderError);
          }
        }
      }, 1000);
      
      // Show appropriate toast message depending on if cart had items
      if (cartCount > 0) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.name}! Your cart items have been processed as an order.`,
        });
      } else {
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.name}!`,
        });
      }
      
      setActiveTab('profile');
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Handle registration
  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    try {
      const { confirmPassword, ...registerData } = data;
      
      // Get the temporary user ID and cart info to transfer the cart
      const { tempUserId, cart } = useStore.getState();
      const cartCount = cart.length;
      
      console.log(`Registration: Transferring cart with ${cartCount} items from guest user ${tempUserId} to new user`);
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registerData,
          tempUserId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const userData = await response.json();
      
      // Important: Use the store's setUser function directly to handle cart transfer
      useStore.getState().setUser(userData);
      
      // Explicitly fetch cart after registration to ensure it's up to date
      setTimeout(async () => {
        await useStore.getState().fetchCart(userData.id);
        
        // After fetching the cart, check if there are items and automatically create an order
        const updatedCart = useStore.getState().cart;
        
        if (updatedCart.length > 0) {
          try {
            // Get shipping address from user profile or use a default
            const shippingAddress = userData.address || 'Default Shipping Address';
            
            // Use our new endpoint to convert cart to order
            const orderResponse = await fetch('/api/cart-to-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: userData.id,
                shippingAddress,
                paymentMethod: 'credit_card'
              })
            });
            
            if (orderResponse.ok) {
              console.log('Order created automatically after registration');
              // Fetch updated cart (should be empty now)
              await useStore.getState().fetchCart(userData.id);
            }
          } catch (orderError) {
            console.error('Failed to create automatic order:', orderError);
          }
        }
      }, 1000);
      
      // Show appropriate toast message depending on if cart had items
      if (cartCount > 0) {
        toast({
          title: "Registration successful",
          description: `Welcome, ${userData.name}! Your cart items have been processed as an order.`,
        });
      } else {
        toast({
          title: "Registration successful",
          description: `Welcome, ${userData.name}!`,
        });
      }
      
      setActiveTab('profile');
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    // Use the store's setUser function directly
    useStore.getState().setUser(null);
    
    // Explicitly fetch cart for guest user after logout
    setTimeout(() => {
      useStore.getState().fetchCart();
    }, 500);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    setActiveTab('login');
  };
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>{user ? `${user.name}'s Profile` : 'Sign In'} - Medadock</title>
        <meta name="description" content="Manage your profile, orders, and account information" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{user ? 'Your Account' : 'Sign In or Register'}</h1>
        
        <div className="max-w-3xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" disabled={!user}>
                <i className="fas fa-user mr-2"></i> Profile
              </TabsTrigger>
              <TabsTrigger value="orders" disabled={!user}>
                <i className="fas fa-shopping-bag mr-2"></i> Orders
              </TabsTrigger>
            </TabsList>
            
            {user ? (
              <>
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                          <FormField
                            control={profileForm.control}
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
                            control={profileForm.control}
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
                          
                          <FormField
                            control={profileForm.control}
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
                            control={profileForm.control}
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
                          
                          <FormField
                            control={profileForm.control}
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
                          
                          <div className="flex justify-between pt-4">
                            <Button type="submit" className="bg-[#10847e] hover:bg-[#10847e]/90">
                              Update Profile
                            </Button>
                            <Button type="button" variant="outline" onClick={handleLogout}>
                              Sign Out
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="orders">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OrderHistory userId={user?.id} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Login Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Cart preservation message */}
                    {useStore.getState().cart.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                        <div className="flex items-center text-blue-700 mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          <span className="font-medium">Your shopping cart has {useStore.getState().cart.length} items</span>
                        </div>
                        <p className="text-gray-600 pl-6">Your cart items will be preserved when you sign in.</p>
                      </div>
                    )}
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter your username" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" placeholder="Enter your password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full bg-[#10847e] hover:bg-[#10847e]/90">
                          Sign In
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                {/* Register Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Register</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Cart preservation message */}
                    {useStore.getState().cart.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                        <div className="flex items-center text-blue-700 mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          <span className="font-medium">Your shopping cart has {useStore.getState().cart.length} items</span>
                        </div>
                        <p className="text-gray-600 pl-6">Your cart items will be preserved when you register.</p>
                      </div>
                    )}
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
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
                          control={registerForm.control}
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
                        
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Choose a username" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" placeholder="Choose a password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" placeholder="Confirm your password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full bg-[#ff6f61] hover:bg-[#ff6f61]/90">
                          Register
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Profile;
