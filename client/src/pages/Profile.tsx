import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-provider';
import { Helmet } from 'react-helmet';
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
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import EmailOTPLogin from '@/components/auth/EmailOTPLogin';
import AddressForm from '@/components/AddressForm';

// Define User type for this component
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  pincode?: string;
  city?: string;
  state?: string;
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
  city: z.string().optional(),
  state: z.string().optional(),
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
  // Additional state to track form type (login or register) within the login tab
  const [formType, setFormType] = useState('login');
  // Track if forgot password form should be shown
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  // Track if OTP login form should be shown
  const [showOtpLogin, setShowOtpLogin] = useState(false);
  
  // Reset form error states when switching between forms
  const resetFormErrors = () => {
    loginForm.clearErrors();
    registerForm.clearErrors();
  };
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Use auth context
  const auth = useAuth();
  const { setUser } = useStore();
  const { toast } = useToast();
  
  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: auth.user?.name || '',
      email: auth.user?.email || '',
      phone: auth.user?.phone || '',
      address: auth.user?.address || '',
      pincode: auth.user?.pincode || '',
      city: auth.user?.city || '',
      state: auth.user?.state || '',
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
    if (auth.user) {
      profileForm.reset({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone || '',
        address: auth.user.address || '',
        pincode: auth.user.pincode || '',
        city: auth.user.city || '',
        state: auth.user.state || '',
      });
    }
  }, [auth.user, profileForm]);
  
  // Handle profile update
  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      console.log('Submitting profile data:', data);
      
      if (auth.user) {
        // Send data to the server via API endpoint
        const response = await fetch('/api/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include', // Important for session cookies
        });
        
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
        
        const updatedUser = await response.json();
        
        // Update local state with the server response
        setUser(updatedUser);
        
        // Invalidate user query to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated",
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };
  
  // We already have our auth hooks from above
  
  // Handle login
  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      // Get the temporary user ID from the store to transfer the cart later
      const { tempUserId } = useStore.getState();
      
      // Submit login credentials through the auth provider's mutation
      await auth.loginMutation.mutateAsync({
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
      console.log('Submitting registration data:', data);
      
      // Show validation errors if fields are empty
      if (!data.name || !data.email || !data.username || !data.password || !data.confirmPassword) {
        toast({
          title: "Registration Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Make sure passwords match
      if (data.password !== data.confirmPassword) {
        toast({
          title: "Password Error",
          description: "Passwords do not match",
          variant: "destructive"
        });
        registerForm.setError('confirmPassword', { 
          type: 'manual', 
          message: 'Passwords do not match' 
        });
        return;
      }
      
      const { confirmPassword, ...registerData } = data;
      
      // Submit registration data through the auth provider's mutation
      await auth.registerMutation.mutateAsync(registerData);
      
      // Note: Success handling, toast notifications, and redirection are all managed by the auth provider
      
    } catch (error) {
      // Error handling is managed by the auth provider
      console.error("Registration error:", error);
      
      // Display a generic error if the auth provider doesn't handle it
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive"
      });
    }
  };
  
  // Enhanced logout handler
  const handleLogout = async () => {
    try {
      // Use the auth provider's logout mutation
      await auth.logoutMutation.mutateAsync();
      
      // Note: Success handling, toast notifications, and redirects are handled by the auth provider
      
    } catch (error) {
      console.error('Logout error:', error);
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
    if (userData && typeof userData === 'object' && 'id' in userData && 
        (!auth.user || JSON.stringify(userData) !== JSON.stringify(auth.user))) {
      setUser(userData as User);
    }
    
    // If user is logged in and tries to navigate to the login tab, redirect to profile tab
    if (auth.user && activeTab === 'login') {
      setActiveTab('profile');
    }
    
    // If user is logged out but tries to view profile or orders tab, redirect to login tab
    if (!auth.user && activeTab !== 'login') {
      setActiveTab('login');
    }
  }, [userData, auth.user, setUser, activeTab]);
  
  // Log state changes for debugging
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);
  
  useEffect(() => {
    console.log('Form type changed to:', formType);
  }, [formType]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>{auth.user ? `${auth.user.name}'s Profile` : 'Sign In'} - PillNow</title>
        <meta name="description" content="Manage your profile, orders, and account information" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{auth.user ? 'Your Account' : 'Sign In or Register'}</h1>
        
        <div className="max-w-3xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" disabled={!auth.user ? true : undefined}>
                <i className="fas fa-user mr-2"></i> Profile
              </TabsTrigger>
              <TabsTrigger value="orders" disabled={!auth.user ? true : undefined}>
                <i className="fas fa-shopping-bag mr-2"></i> Orders
              </TabsTrigger>
              <TabsTrigger value="login" disabled={auth.user ? true : undefined}>
                <i className="fas fa-sign-in-alt mr-2"></i> Login/Register
              </TabsTrigger>
            </TabsList>
            
            {/* Only show profile and orders tabs if user is logged in */}
            {auth.user ? (
              <>
                <TabsContent value="profile">
                  <Card>
                    <CardHeader className="border-b">
                      <CardTitle className="flex items-center">
                        {auth.user.profileImageUrl ? (
                          <img src={auth.user.profileImageUrl} alt={auth.user.name} className="w-10 h-10 rounded-full mr-3" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mr-3">
                            {auth.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{auth.user.name}'s Profile</span>
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
                          
                          {/* New Address component with Google Maps integration */}
                          <div className="space-y-2">
                            <FormLabel>Delivery Address</FormLabel>
                            <AddressForm 
                              defaultAddress={{ 
                                formattedAddress: profileForm.getValues("address") || "",
                                postalCode: profileForm.getValues("pincode") || "",
                                locality: profileForm.getValues("city") || "",
                                administrativeAreaLevel1: profileForm.getValues("state") || ""
                              }}
                              onAddressChange={(addressData) => {
                                console.log('Address data received in profile form:', addressData);
                                profileForm.setValue("address", addressData.formattedAddress);
                                
                                // Update all related fields
                                if (addressData.postalCode) {
                                  profileForm.setValue("pincode", addressData.postalCode);
                                }
                                if (addressData.locality) {
                                  profileForm.setValue("city", addressData.locality);
                                }
                                if (addressData.administrativeAreaLevel1) {
                                  profileForm.setValue("state", addressData.administrativeAreaLevel1);
                                }
                                
                                // Trigger validation after setting values
                                profileForm.trigger(["address", "pincode", "city", "state"]);
                              }}
                              includeMap={true}
                              form={profileForm}
                              fieldName="address"
                              showDetailedFields={true}
                            />
                            <FormMessage />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your city" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your state" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
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
                      <OrderHistory userId={auth.user.id} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            ) : (
              <TabsContent value="login">
                {/* This will handle both login and register forms through the activeTab state */}
                <Card>
                  <CardHeader>
                    <div className="flex h-9 items-center space-x-1 rounded-md border mb-2">
                      <Button
                        variant="outline"
                        className={`rounded-none flex-1 ${formType === 'login' ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => {
                          setFormType('login');
                          resetFormErrors();
                          loginForm.reset();
                          setShowOtpLogin(false);
                          setShowForgotPassword(false);
                          console.log('Setting formType to login');
                        }}
                      >
                        Login
                      </Button>
                      <Button
                        variant="outline"
                        className={`rounded-none flex-1 ${formType === 'register' ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => {
                          setFormType('register');
                          resetFormErrors();
                          registerForm.reset();
                          setShowOtpLogin(false);
                          setShowForgotPassword(false);
                          console.log('Setting formType to register');
                        }}
                      >
                        Register
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {formType === 'login' ? (
                      showForgotPassword ? (
                        <ForgotPasswordForm onSuccess={() => setShowForgotPassword(false)} />
                      ) : showOtpLogin ? (
                        <EmailOTPLogin 
                          onLoginSuccess={() => {
                            // Will redirect automatically with the user's role
                          }}
                          onBackToPassword={() => setShowOtpLogin(false)}
                        />
                      ) : (
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
                            
                            <div className="flex justify-between">
                              <Button 
                                variant="link" 
                                type="button" 
                                onClick={() => setShowOtpLogin(true)}
                                className="text-sm p-0 h-auto"
                              >
                                Login with OTP
                              </Button>
                              <Button 
                                variant="link" 
                                type="button" 
                                onClick={() => setShowForgotPassword(true)}
                                className="text-sm p-0 h-auto"
                              >
                                Forgot Password?
                              </Button>
                            </div>
                            
                            <Button type="submit" className="w-full">
                              Login
                            </Button>
                          </form>
                        </Form>
                      )
                    ) : (
                      <div>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <div className="space-y-2">
                            <label htmlFor="register-name" className="text-sm font-medium">Full Name</label>
                            <input 
                              id="register-name"
                              type="text" 
                              placeholder="Your name"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              {...registerForm.register("name")}
                            />
                            {registerForm.formState.errors.name && (
                              <p className="text-sm text-red-500">{registerForm.formState.errors.name.message}</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="register-email" className="text-sm font-medium">Email Address</label>
                            <input 
                              id="register-email"
                              type="email" 
                              placeholder="your-email@example.com"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                              {...registerForm.register("email")}
                            />
                            {registerForm.formState.errors.email && (
                              <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="register-username" className="text-sm font-medium">Username</label>
                            <input 
                              id="register-username"
                              type="text" 
                              placeholder="Pick a username"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                              {...registerForm.register("username")}
                            />
                            {registerForm.formState.errors.username && (
                              <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="register-password" className="text-sm font-medium">Password</label>
                            <div className="relative">
                              <input 
                                id="register-password"
                                type={showRegisterPassword ? "text" : "password"} 
                                placeholder="Create a password" 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                {...registerForm.register("password")}
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
                            {registerForm.formState.errors.password && (
                              <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="register-confirm" className="text-sm font-medium">Confirm Password</label>
                            <div className="relative">
                              <input 
                                id="register-confirm"
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Confirm your password" 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                {...registerForm.register("confirmPassword")}
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
                            {registerForm.formState.errors.confirmPassword && (
                              <p className="text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                            )}
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full mt-6"
                            disabled={registerForm.formState.isSubmitting}
                          >
                            {registerForm.formState.isSubmitting ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                              </span>
                            ) : "Register"}
                          </Button>
                          
                          {Object.keys(registerForm.formState.errors).length > 0 && (
                            <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                              <p className="font-bold">Please fix the following errors:</p>
                              <ul className="list-disc pl-5 mt-1">
                                {Object.entries(registerForm.formState.errors).map(([field, error]) => (
                                  <li key={field}>{error?.message as string}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </form>
                      </div>
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
