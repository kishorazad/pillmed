import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useStore } from '@/lib/store';

// Form schemas for the different steps
const requestOtpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' })
});

const verifyOtpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  otp: z.string().length(6, { message: 'OTP must be 6 digits' })
});

type RequestOtpFormValues = z.infer<typeof requestOtpSchema>;
type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

interface EmailOTPLoginProps {
  onLoginSuccess?: () => void;
  onBackToPassword?: () => void;
}

const EmailOTPLogin = ({ onLoginSuccess, onBackToPassword }: EmailOTPLoginProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const { setUser } = useStore();

  // Form for requesting login OTP
  const requestOtpForm = useForm<RequestOtpFormValues>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: {
      email: ''
    }
  });

  // Form for verifying OTP
  const verifyOtpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: '',
      otp: ''
    }
  });

  // Request OTP login mutation
  const requestOtpMutation = useMutation({
    mutationFn: async (values: RequestOtpFormValues) => {
      console.log('Requesting login OTP for email:', values.email);
      const response = await fetch('/api/auth/request-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send login OTP');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('OTP request response:', data);
      if (data.success) {
        toast({
          title: 'OTP Sent',
          description: 'A one-time login code has been sent to your email'
        });
        setEmail(requestOtpForm.getValues().email);
        verifyOtpForm.setValue('email', requestOtpForm.getValues().email);
        setStep('verify');
      } else {
        toast({
          title: 'Notice',
          description: data.message || 'If your email exists in our system, a login code has been sent',
        });
      }
    },
    onError: (error: any) => {
      console.error('Error requesting OTP:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send login OTP',
        variant: 'destructive'
      });
    }
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (values: VerifyOtpFormValues) => {
      console.log('Verifying login OTP for email:', values.email);
      const response = await fetch('/api/auth/verify-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify login OTP');
      }
      
      return response.json();
    },
    onSuccess: (userData) => {
      console.log('OTP verification successful, user data:', userData);
      
      // Update the user in the store
      setUser(userData);
      
      // Update user in query cache
      queryClient.setQueryData(['/api/user'], userData);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${userData.name || userData.username}!`
      });
      
      // Call the onLoginSuccess callback if provided
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        // Default redirect based on role
        const role = userData.role?.toLowerCase();
        if (role) {
          switch (role) {
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
              window.location.href = '/profile';
          }
        } else {
          window.location.href = '/profile';
        }
      }
    },
    onError: (error: any) => {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify login OTP',
        variant: 'destructive'
      });
    }
  });

  // Handle form submissions
  const onRequestOtpSubmit = (values: RequestOtpFormValues) => {
    requestOtpMutation.mutate(values);
  };

  const onVerifyOtpSubmit = (values: VerifyOtpFormValues) => {
    verifyOtpMutation.mutate(values);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Login with OTP</h2>
        <p className="text-sm text-muted-foreground">
          {step === 'request' 
            ? "Enter your email address and we'll send you a one-time code to log in."
            : "Enter the one-time code sent to your email address."}
        </p>
      </div>

      {step === 'request' && (
        <Form {...requestOtpForm}>
          <form onSubmit={requestOtpForm.handleSubmit(onRequestOtpSubmit)} className="space-y-4">
            <FormField
              control={requestOtpForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={requestOtpMutation.isPending}>
              {requestOtpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                'Get Login Code'
              )}
            </Button>
          </form>
        </Form>
      )}

      {step === 'verify' && (
        <Form {...verifyOtpForm}>
          <form onSubmit={verifyOtpForm.handleSubmit(onVerifyOtpSubmit)} className="space-y-4">
            <FormField
              control={verifyOtpForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} value={email} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={verifyOtpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One-Time Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter 6-digit code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={verifyOtpMutation.isPending}>
                {verifyOtpMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Log In'
                )}
              </Button>
              <div className="flex justify-between items-center mt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStep('request')}
                  className="text-xs"
                >
                  Change Email
                </Button>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  onClick={() => requestOtpMutation.mutate({ email })}
                  disabled={requestOtpMutation.isPending}
                  className="text-xs"
                >
                  {requestOtpMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      )}

      {onBackToPassword && (
        <div className="mt-4 text-center">
          <Button variant="link" onClick={onBackToPassword} className="text-sm">
            Back to Password Login
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmailOTPLogin;