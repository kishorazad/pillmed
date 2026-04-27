import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/LanguageSwitcher';
import { Loader2, ChevronLeft } from 'lucide-react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { OTPInput, OTPInputContext } from 'input-otp';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

type AuthStep = 'phone' | 'otp';

const PhoneAuthForm = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [otp, setOtp] = useState('');
  const [currentStep, setCurrentStep] = useState<AuthStep>('phone');
  const auth = getAuth();

  // Configure recaptcha
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {
          // reCAPTCHA solved, enable send OTP button
          console.log('Recaptcha verified');
        },
        'expired-callback': () => {
          // Reset reCAPTCHA when expired
          toast({
            title: t('recaptcha_expired'),
            description: t('please_solve_recaptcha_again'),
            variant: 'destructive',
          });
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        },
      });
    }
  };

  // Handle phone number submission
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: t('invalid_phone'),
        description: t('please_enter_valid_phone'),
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Format phone number with country code
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+91${phoneNumber}`; // Default to India
      
      // Setup recaptcha if needed
      setupRecaptcha();
      
      // Request OTP
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone,
        window.recaptchaVerifier
      );
      
      // Store verification ID for the next step
      setVerificationId(confirmationResult.verificationId);
      
      // Move to OTP verification step
      setCurrentStep('otp');
      
      toast({
        title: t('otp_sent'),
        description: t('otp_sent_description'),
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      toast({
        title: t('otp_error'),
        description: t('otp_error_description'),
        variant: 'destructive',
      });
      
      // Reset recaptcha
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: t('invalid_otp'),
        description: t('please_enter_valid_otp'),
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Verify OTP with credential
      // In a real app, use confirmationResult.confirm(otp) instead
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          verificationId, 
          otp,
          phoneNumber
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify OTP');
      }
      
      const userData = await response.json();
      
      toast({
        title: t('login_success'),
        description: t('welcome_back'),
      });
      
      // Navigate back to the home page or redirect as needed
      setLocation('/');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      toast({
        title: t('otp_verification_failed'),
        description: t('please_try_again'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Go back to phone input
  const goBack = () => {
    setCurrentStep('phone');
    setOtp('');
    
    // Reset recaptcha
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  // Render phone number input step
  const renderPhoneStep = () => (
    <form onSubmit={handlePhoneSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
          placeholder={t('enter_phone_number')}
          maxLength={15}
          disabled={loading}
          className="text-base"
        />
        <p className="text-sm text-muted-foreground">
          {t('phone_auth_description')}
        </p>
      </div>

      <div id="recaptcha-container" className="flex justify-center my-4"></div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={loading || phoneNumber.length < 10}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {t('get_otp')}
      </Button>
    </form>
  );

  // Render OTP verification step
  const renderOTPStep = () => (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        className="p-0 h-auto flex items-center text-muted-foreground hover:text-primary"
        onClick={goBack}
        disabled={loading}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {t('back')}
      </Button>
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground mb-4">
          {t('otp_verification_message', { phone: phoneNumber })}
        </p>
        
        <div className="flex justify-center my-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            disabled={loading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <Button 
        onClick={handleVerifyOTP} 
        className="w-full"
        disabled={loading || otp.length !== 6}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {t('verify_otp')}
      </Button>
      
      <div className="text-center">
        <Button
          variant="link"
          className="text-sm"
          disabled={loading}
          onClick={goBack}
        >
          {t('resend_otp')}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {currentStep === 'phone' ? t('phone_login') : t('verify_otp')}
        </CardTitle>
        <CardDescription>
          {currentStep === 'phone' 
            ? t('enter_your_phone_to_continue') 
            : t('enter_the_otp_sent_to_your_phone')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === 'phone' ? renderPhoneStep() : renderOTPStep()}
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setLocation('/auth')}
        >
          {t('back_to_login')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PhoneAuthForm;

// Add RecaptchaVerifier to window object
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}