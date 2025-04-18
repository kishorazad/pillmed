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
import OrderHistory from '@/components/orders/OrderHistory';

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
      
      // Redirect user to appropriate dashboard based on role
      if (userData.role) {
        // Add a small delay to ensure the user state is fully updated
        setTimeout(() => {
          // Redirect based on user role
          switch (userData.role.toLowerCase()) {
            case 'admin':
              window.location.href = '/admin';
              break;
            case 'doctor':
              window.location.href = '/doctor';
              break;
            case 'chemist':
              window.location.href = '/chemist';
              break;
            case 'pharmacy':
              window.location.href = '/pharmacy';
              break;
            case 'hospital':
            case 'laboratory':
              window.location.href = '/laboratory';
              break;
            case 'delivery':
              window.location.href = '/delivery';
              break;
            default:
              setActiveTab('profile');
          }
        }, 500);
      } else {
        setActiveTab('profile');
      }
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
      
      // Redirect user to appropriate dashboard based on role
      if (userData.role) {
        // Add a small delay to ensure the user state is fully updated
        setTimeout(() => {
          // Redirect based on user role
          switch (userData.role.toLowerCase()) {
            case 'admin':
              window.location.href = '/admin';
              break;
            case 'doctor':
              window.location.href = '/doctor';
              break;
            case 'chemist':
              window.location.href = '/chemist';
              break;
            case 'pharmacy':
              window.location.href = '/pharmacy';
              break;
            case 'hospital':
            case 'laboratory':
              window.location.href = '/laboratory';
              break;
            case 'delivery':
              window.location.href = '/delivery';
              break;
            default:
              setActiveTab('profile');
          }
        }, 500);
      } else {
        setActiveTab('profile');
      }
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
  
  // Fetch current user data from API
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user'],
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
  
  // Update user data in store when it changes
  useEffect(() => {
    if (userData && (!user || JSON.stringify(userData) !== JSON.stringify(user))) {
      setUser(userData);
    }
  }, [userData, user, setUser]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>{user ? `${user.name}'s Profile` : 'Sign In'} - PillNow</title>
        <meta name="description" content="Manage your profile, orders, and account information" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{user ? 'Your Account' : 'Sign In or Register'}</h1>
        
        <div className="max-w-3xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" disabled={!user ? true : undefined}>
                <i className="fas fa-user mr-2"></i> Profile
              </TabsTrigger>
              <TabsTrigger value="orders" disabled={!user ? true : undefined}>
                <i className="fas fa-shopping-bag mr-2"></i> Orders
              </TabsTrigger>
              <TabsTrigger value="login" disabled={user ? true : undefined}>
                <i className="fas fa-sign-in-alt mr-2"></i> Login/Register
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
