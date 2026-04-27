import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Form schemas for the different steps
const requestResetSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' })
});

const verifyOtpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  otp: z.string().length(6, { message: 'OTP must be 6 digits' })
});

const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  otp: z.string().length(6, { message: 'OTP must be 6 digits' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RequestResetFormValues = z.infer<typeof requestResetSchema>;
type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ForgotPasswordForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // Form for requesting password reset
  const requestResetForm = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
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

  // Form for resetting password
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
      otp: '',
      password: '',
      confirmPassword: ''
    }
  });

  // Request password reset mutation
  const requestResetMutation = useMutation({
    mutationFn: async (values: RequestResetFormValues) => {
      // apiRequest already returns the parsed JSON, no need to call .json() again
      return apiRequest('POST', '/api/password-reset/request', values);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'OTP Sent',
          description: 'If your email exists in our system, a one-time password has been sent to it',
        });
        setEmail(requestResetForm.getValues().email);
        verifyOtpForm.setValue('email', requestResetForm.getValues().email);
        resetPasswordForm.setValue('email', requestResetForm.getValues().email);
        setStep('verify');
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to send OTP',
          variant: 'destructive'
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP',
        variant: 'destructive'
      });
    }
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (values: VerifyOtpFormValues) => {
      // apiRequest already returns the parsed JSON, no need to call .json() again
      return apiRequest('POST', '/api/password-reset/verify-otp', values);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'OTP Verified',
          description: 'OTP verified successfully'
        });
        setOtp(verifyOtpForm.getValues().otp);
        resetPasswordForm.setValue('otp', verifyOtpForm.getValues().otp);
        setStep('reset');
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Invalid OTP',
          variant: 'destructive'
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify OTP',
        variant: 'destructive'
      });
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (values: ResetPasswordFormValues) => {
      // apiRequest already returns the parsed JSON, no need to call .json() again
      return apiRequest('POST', '/api/password-reset/reset', values);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Password Reset',
          description: 'Your password has been reset successfully'
        });
        onSuccess();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to reset password',
          variant: 'destructive'
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive'
      });
    }
  });

  // Handle form submissions
  const onRequestResetSubmit = (values: RequestResetFormValues) => {
    requestResetMutation.mutate(values);
  };

  const onVerifyOtpSubmit = (values: VerifyOtpFormValues) => {
    verifyOtpMutation.mutate(values);
  };

  const onResetPasswordSubmit = (values: ResetPasswordFormValues) => {
    resetPasswordMutation.mutate(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        {step === 'request' && (
          <CardDescription>
            Enter your email address and we'll send you a one-time password to reset your password.
          </CardDescription>
        )}
        {step === 'verify' && (
          <CardDescription>
            Enter the one-time password (OTP) sent to your email address.
          </CardDescription>
        )}
        {step === 'reset' && (
          <CardDescription>
            Create a new password for your account.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {step === 'request' && (
          <Form {...requestResetForm}>
            <form onSubmit={requestResetForm.handleSubmit(onRequestResetSubmit)} className="space-y-4">
              <FormField
                control={requestResetForm.control}
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
              <Button type="submit" className="w-full" disabled={requestResetMutation.isPending}>
                {requestResetMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
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
                    <FormLabel>One-Time Password (OTP)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter 6-digit OTP" {...field} />
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
                    'Verify OTP'
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
                    onClick={() => requestResetMutation.mutate({ email })}
                    disabled={requestResetMutation.isPending}
                    className="text-xs"
                  >
                    {requestResetMutation.isPending ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      'Resend OTP'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}

        {step === 'reset' && (
          <Form {...resetPasswordForm}>
            <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
              <FormField
                control={resetPasswordForm.control}
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
                control={resetPasswordForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password (OTP)</FormLabel>
                    <FormControl>
                      <Input {...field} value={otp} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetPasswordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetPasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStep('verify')}
                  className="text-xs mt-2"
                >
                  Back to OTP Verification
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={onSuccess}>
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordForm;