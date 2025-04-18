import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/LanguageSwitcher';
import { Loader2 } from 'lucide-react';
import { 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  signInWithPopup, 
  getAuth 
} from 'firebase/auth';
import { FaGoogle, FaFacebook, FaPhone } from 'react-icons/fa';

interface SocialLoginProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
}

/**
 * Social login component that provides options to login with:
 * - Google
 * - Facebook
 * - Phone (OTP)
 */
const SocialLogin = ({ onSuccess, onError }: SocialLoginProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

  const auth = getAuth();

  // Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      
      // Get user info from result
      const user = result.user;
      
      // Get credentials for server-side verification
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      // Send token to backend to create/verify user
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          user: { 
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to authenticate with server');
      }
      
      const userData = await response.json();
      
      toast({
        title: t('login_success'),
        description: t('welcome_back_user', { name: user.displayName || 'User' }),
      });
      
      if (onSuccess) onSuccess(userData);
    } catch (error) {
      console.error('Google sign in error:', error);
      
      toast({
        title: t('login_failed'),
        description: t('login_error_message'),
        variant: 'destructive',
      });
      
      if (onError) onError(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Facebook Sign In
  const handleFacebookSignIn = async () => {
    try {
      setIsFacebookLoading(true);
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      provider.addScope('public_profile');
      
      const result = await signInWithPopup(auth, provider);
      
      // Get user info from result
      const user = result.user;
      
      // Get credentials for server-side verification
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      // Send token to backend to create/verify user
      const response = await fetch('/api/auth/facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          user: { 
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to authenticate with server');
      }
      
      const userData = await response.json();
      
      toast({
        title: t('login_success'),
        description: t('welcome_back_user', { name: user.displayName || 'User' }),
      });
      
      if (onSuccess) onSuccess(userData);
    } catch (error) {
      console.error('Facebook sign in error:', error);
      
      toast({
        title: t('login_failed'),
        description: t('login_error_message'),
        variant: 'destructive',
      });
      
      if (onError) onError(error);
    } finally {
      setIsFacebookLoading(false);
    }
  };

  // Phone Number OTP Sign In
  const handlePhoneSignIn = () => {
    setIsPhoneLoading(true);
    // We'll navigate to a separate OTP screen instead of showing a popup
    window.location.href = '/auth/phone';
    setIsPhoneLoading(false);
  };

  return (
    <div className="flex flex-col space-y-3 w-full">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">
            {t('or_continue_with')}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        disabled={isGoogleLoading}
        onClick={handleGoogleSignIn}
        className="w-full"
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
        )}
        {t('continue_with_google')}
      </Button>

      <Button
        variant="outline"
        type="button"
        disabled={isFacebookLoading}
        onClick={handleFacebookSignIn}
        className="w-full"
      >
        {isFacebookLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FaFacebook className="mr-2 h-4 w-4 text-blue-600" />
        )}
        {t('continue_with_facebook')}
      </Button>

      <Button
        variant="outline"
        type="button"
        disabled={isPhoneLoading}
        onClick={handlePhoneSignIn}
        className="w-full"
      >
        {isPhoneLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FaPhone className="mr-2 h-4 w-4 text-green-500" />
        )}
        {t('continue_with_phone')}
      </Button>
    </div>
  );
};

export default SocialLogin;