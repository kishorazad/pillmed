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
import { queryClient } from '@/lib/queryClient';
import { Link } from 'wouter';
import OrderHistory from '@/components/orders/OrderHistory';
import { Eye, EyeOff } from 'lucide-react';

// Define User type for this component
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  pincode?: string;
  role?: string;
  profileImageUrl?: string;
}

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
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user } = useAuth();
  const { setUser } = useStore();
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
  
  // Handle login using the new auth provider
  const { loginMutation } = useAuth();
  
  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      // Get the temporary user ID from the store to transfer the cart later
      const { tempUserId } = useStore.getState();
      
      // Submit login credentials through the auth provider's mutation
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password
      });
      
      // Note: Redirection is handled by the auth provider
      
    } catch (error) {
      // Error handling is managed by the auth provider
      console.error("Login error:", error);
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
      
      // Show success message right away
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.name}!`,
      });
      
      // Only handle cart transfer in background if needed
      if (userData.id) {
        setTimeout(() => {
          // Update cart in background after registration
          useStore.getState().fetchCart(userData.id);
        }, 500);
      }
      
      // Redirect based on user role with improved logging and debugging
      if (userData.role) {
        const role = userData.role.toLowerCase();
        console.log(`Registration successful! Redirecting user with role: ${role}`);
        
        // Make sure the role is correctly set - log it for verification
        setTimeout(() => {
          fetch('/api/session-check')
            .then(res => res.json())
            .then(data => {
              console.log('Session check after registration:', data);
            })
            .catch(err => {
              console.error('Error checking session:', err);
            });
        }, 500);
        
        // Properly handle the redirection based on the role
        switch (role) {
          case 'admin':
            console.log('Admin registration detected, redirecting to admin dashboard...');
            // Use a short delay to ensure session is fully saved before redirect
            setTimeout(() => {
              window.location.href = '/admin';
            }, 800);
            break;
          case 'doctor':
            console.log('Doctor registration detected, redirecting to doctor dashboard...');
            setTimeout(() => {
              window.location.href = '/doctor';
            }, 800);
            break;
          case 'chemist':
            console.log('Chemist registration detected, redirecting to chemist dashboard...');
            setTimeout(() => {
              window.location.href = '/chemist';
            }, 800);
            break;
          case 'pharmacy':
            console.log('Pharmacy registration detected, redirecting to pharmacy dashboard...');
            setTimeout(() => {
              window.location.href = '/pharmacy';
            }, 800);
            break;
          case 'hospital':
          case 'laboratory':
            console.log('Hospital/Laboratory registration detected, redirecting to laboratory dashboard...');
            setTimeout(() => {
              window.location.href = '/laboratory';
            }, 800);
            break;
          case 'delivery':
            console.log('Delivery registration detected, redirecting to delivery dashboard...');
            setTimeout(() => {
              window.location.href = '/delivery';
            }, 800);
            break;
          default:
            console.log(`User role ${role} has no special dashboard, staying on profile page`);
            setActiveTab('profile');
        }
      } else {
        console.log('No role specified for user, staying on profile page');
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
  
  // Enhanced logout with proper server-side session cleanup
  const handleLogout = async () => {
    try {
      console.log('Initiating logout process');
      
      // Call the server to destroy the session
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Logout failed on server');
      }
      
      console.log('Server-side logout successful');
      
      // Use the store's setUser function to clear local state
      useStore.getState().setUser(null);
      
      // Query client invalidation to force refetch of user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.setQueryData(['/api/user'], null);
      
      // Explicitly fetch cart for guest user after logout
      setTimeout(() => {
        console.log('Fetching guest cart after logout');
        useStore.getState().fetchCart();
      }, 500);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      // Force reload the page to clear any lingering state
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      
      // Fallback: Even if server logout fails, clear client state
      useStore.getState().setUser(null);
      queryClient.setQueryData(['/api/user'], null);
      
      toast({
        title: "Logout issue",
        description: "Logged out with some issues. Please refresh the page.",
        variant: "destructive",
      });
      
      setActiveTab('login');
    }
  };
  
  // Fetch current user data from API
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user'],
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
  
  // Update user data in store when it changes
  useEffect(() => {
    // Check if userData exists and has an id property before trying to update the store
    if (userData && typeof userData === 'object' && 'id' in userData && (!user || JSON.stringify(userData) !== JSON.stringify(user))) {
      setUser(userData as User);
    }
    
    // If user is logged in and tries to navigate to the login tab, redirect to profile tab
    if (user && activeTab === 'login') {
      setActiveTab('profile');
    }
    
    // If user is logged out but tries to view profile or orders tab, redirect to login tab
    if (!user && activeTab !== 'login') {
      setActiveTab('login');
    }
  }, [userData, user, setUser, activeTab]);

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
            
            {/* Only show profile and orders tabs if user is logged in */}
            {user ? (
              <>
                <TabsContent value="profile">
                  <Card>
                    <CardHeader className="border-b">
                      <CardTitle className="flex items-center">
                        {user.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mr-3">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{user.name}'s Profile</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your name" {...field} />
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
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="your-email@example.com" {...field} />
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
                                  <Input placeholder="Your phone number" {...field} />
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
                                <FormLabel>Delivery Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your delivery address" {...field} />
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
                                  <Input placeholder="Your area pincode" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-between pt-2">
                            <Button type="submit" className="mr-2">Save Changes</Button>
                            <Button variant="destructive" type="button" onClick={handleLogout}>
                              <i className="fas fa-sign-out-alt mr-2"></i> Logout
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
                      <CardTitle>Order History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OrderHistory userId={user.id} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            ) : (
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <div className="flex h-9 items-center space-x-1 rounded-md border mb-2">
                      <Button
                        variant="outline"
                        className={`rounded-none flex-1 ${activeTab === 'login' ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => setActiveTab('login')}
                      >
                        Login
                      </Button>
                      <Button
                        variant="outline"
                        className={`rounded-none flex-1 ${activeTab === 'register' ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => setActiveTab('register')}
                      >
                        Register
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activeTab === 'login' ? (
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username or Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your username or email" {...field} />
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
                                  <div className="relative">
                                    <Input 
                                      type={showLoginPassword ? "text" : "password"} 
                                      placeholder="Your password" 
                                      {...field} 
                                    />
                                    <div 
                                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" 
                                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                                    >
                                      {showLoginPassword ? 
                                        <EyeOff className="h-4 w-4 text-gray-500" /> : 
                                        <Eye className="h-4 w-4 text-gray-500" />
                                      }
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" className="w-full">
                            Login
                          </Button>
                        </form>
                      </Form>
                    ) : (
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your name" {...field} />
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
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="your-email@example.com" {...field} />
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
                                  <Input placeholder="Pick a username" {...field} />
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
                                  <div className="relative">
                                    <Input 
                                      type={showRegisterPassword ? "text" : "password"} 
                                      placeholder="Create a password" 
                                      {...field} 
                                    />
                                    <div 
                                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" 
                                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                      aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                                    >
                                      {showRegisterPassword ? 
                                        <EyeOff className="h-4 w-4 text-gray-500" /> : 
                                        <Eye className="h-4 w-4 text-gray-500" />
                                      }
                                    </div>
                                  </div>
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
                                  <div className="relative">
                                    <Input 
                                      type={showConfirmPassword ? "text" : "password"} 
                                      placeholder="Confirm your password" 
                                      {...field} 
                                    />
                                    <div 
                                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" 
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                      {showConfirmPassword ? 
                                        <EyeOff className="h-4 w-4 text-gray-500" /> : 
                                        <Eye className="h-4 w-4 text-gray-500" />
                                      }
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" className="w-full">
                            Register
                          </Button>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Profile;
