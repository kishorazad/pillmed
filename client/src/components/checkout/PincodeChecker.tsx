import { useState } from 'react';
import { useLanguage } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, MapPin, Loader2 } from 'lucide-react';
import { getPincodeData, PincodeData } from '@/services/location-service';

interface PincodeCheckerProps {
  onPincodeData?: (data: PincodeData | null) => void;
  onDeliveryAvailability?: (available: boolean) => void;
  initialPincode?: string;
}

/**
 * PincodeChecker Component
 * 
 * Allows users to check if delivery is available for their location
 * by entering a pincode. Shows appropriate messages based on availability.
 */
const PincodeChecker = ({ 
  onPincodeData, 
  onDeliveryAvailability, 
  initialPincode 
}: PincodeCheckerProps) => {
  const { t } = useLanguage();
  const [pincode, setPincode] = useState(initialPincode || '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PincodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(value);
    
    // Reset states when pincode changes
    if (data) {
      setData(null);
      setDeliveryAvailable(false);
      setError(null);
      
      // Notify parent components
      if (onPincodeData) onPincodeData(null);
      if (onDeliveryAvailability) onDeliveryAvailability(false);
    }
  };

  const checkPincode = async () => {
    if (pincode.length !== 6) {
      setError(t('pincode_error_title'));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const pincodeData = await getPincodeData(pincode);
      setData(pincodeData);
      
      // Determine if delivery is available based on service area
      // This is a simplified example - in a real app, you would check against your
      // actual service areas stored in the database
      const isDeliveryAvailable = pincodeData.serviceAvailable;
      setDeliveryAvailable(isDeliveryAvailable);
      
      // Notify parent components
      if (onPincodeData) onPincodeData(pincodeData);
      if (onDeliveryAvailability) onDeliveryAvailability(isDeliveryAvailable);
    } catch (err) {
      console.error('Error checking pincode:', err);
      setError(t('pincode_error_desc'));
      
      // Notify parent components
      if (onPincodeData) onPincodeData(null);
      if (onDeliveryAvailability) onDeliveryAvailability(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkPincode();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          value={pincode}
          onChange={handlePincodeChange}
          onKeyDown={handleKeyDown}
          placeholder={t('enter_pincode')}
          className="max-w-[150px]"
          maxLength={6}
        />
        <Button 
          onClick={checkPincode} 
          disabled={loading || pincode.length !== 6}
          size="sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
          {t('check')}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="p-3">
          <XCircle className="h-4 w-4" />
          <AlertTitle className="text-sm font-medium">{t('pincode_error_title')}</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {data && deliveryAvailable && (
        <Alert variant="default" className="bg-green-50 border-green-200 p-3">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-sm font-medium text-green-800">{t('delivery_available_title')}</AlertTitle>
          <AlertDescription className="text-xs text-green-700">
            {t('delivery_available_desc')}
            <div className="mt-1 text-xs text-green-600">
              {t('delivery_time_message')}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {data && !deliveryAvailable && (
        <Alert variant="default" className="bg-orange-50 border-orange-200 p-3">
          <XCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-sm font-medium text-orange-800">{t('delivery_unavailable_title')}</AlertTitle>
          <AlertDescription className="text-xs text-orange-700">
            {t('delivery_unavailable_desc')}
            <div className="mt-1 text-xs text-orange-600">
              {t('delivery_unavailable_message')}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PincodeChecker;