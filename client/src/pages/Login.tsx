import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-provider';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useLocation } from 'wouter';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import EmailOTPLogin from '@/components/auth/EmailOTPLogin';

// Form validation schema
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

const Login = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [formType, setFormType] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpLogin, setShowOtpLogin] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Use auth context
  const auth = useAuth();
  
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

  // Reset form error states when switching between forms
  const resetFormErrors = () => {
    loginForm.clearErrors();
    registerForm.clearErrors();
  };
  
  // If user is already logged in, redirect to profile
  if (user) {
    navigate('/profile');
    return null;
  }
  
  // Handle login
  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
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
      
      const { confirmPassword, ...registerData } = data;
      
      // Submit registration data through the auth provider's mutation
      await auth.registerMutation.mutateAsync(registerData);
      
      // Note: Success handling, toast notifications, and redirection are all managed by the auth provider
      
    } catch (error) {
      // Error handling is managed by the auth provider
      console.error("Registration error:", error);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Sign In or Register - PillNow</title>
        <meta name="description" content="Sign in to your PillNow account or create a new account" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Sign In or Register</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Login/Register Form Section */}
          <div>
            <Tabs value={formType} onValueChange={(value) => {
              setFormType(value);
              setShowForgotPassword(false);
              setShowOtpLogin(false);
              resetFormErrors();
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    {showForgotPassword ? (
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
                                      placeholder="Enter your password" 
                                      {...field} 
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                                    >
                                      {showLoginPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <span className="sr-only">
                                        {showLoginPassword ? "Hide password" : "Show password"}
                                      </span>
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-between text-sm">
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
                          
                          <Button type="submit" className="w-full" disabled={auth.loginMutation.isPending}>
                            {auth.loginMutation.isPending ? 'Logging in...' : 'Login'}
                          </Button>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">Create an account</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
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
                                <Input type="email" placeholder="Enter your email" {...field} />
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
                                <Input placeholder="Choose a username" {...field} />
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
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                  >
                                    {showRegisterPassword ? (
                                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="sr-only">
                                      {showRegisterPassword ? "Hide password" : "Show password"}
                                    </span>
                                  </Button>
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
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="sr-only">
                                      {showConfirmPassword ? "Hide password" : "Show password"}
                                    </span>
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full" disabled={auth.registerMutation.isPending}>
                          {auth.registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Information Section */}
          <div className="bg-gradient-to-r from-orange-100 to-orange-50 p-6 rounded-lg hidden md:flex flex-col justify-center">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-orange-700">Welcome to PillNow</h2>
              <p className="text-gray-600">Your One-Stop Healthcare Solution</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-orange-500 p-2 rounded-full text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-package">
                    <path d="m7.5 4.27 9 5.15" />
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Fast Delivery</h3>
                  <p className="text-sm text-gray-600">Get medicines delivered to your doorstep in hours</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-orange-500 p-2 rounded-full text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-shield-check">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Genuine Products</h3>
                  <p className="text-sm text-gray-600">100% authentic products from licensed pharmacies</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-orange-500 p-2 rounded-full text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-user-check">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="m16 11 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Secure Account</h3>
                  <p className="text-sm text-gray-600">Your data is protected with industry-standard security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;