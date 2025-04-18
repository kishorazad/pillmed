import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Check, X, MapPin, Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getCityByPincode, PincodeData } from '@/services/location-service';
import { useLanguage } from '@/components/LanguageSwitcher';

interface PincodeCheckerProps {
  onPincodeData?: (data: PincodeData) => void;
  onDeliveryAvailability?: (available: boolean) => void;
}

/**
 * A component to check pincode and validate delivery availability
 * Integrates with auto-language detection to show messages in user's language
 */
const PincodeChecker = ({ onPincodeData, onDeliveryAvailability }: PincodeCheckerProps) => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pincodeData, setPincodeData] = useState<PincodeData | null>(null);
  const { t } = useLanguage();

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setPincode(value);
    
    // Clear previous results when changing pincode
    if (value.length !== 6) {
      setPincodeData(null);
      setError(null);
      if (onDeliveryAvailability) onDeliveryAvailability(false);
      if (onPincodeData) onPincodeData(null as any);
    }
  };

  const checkPincode = async () => {
    if (pincode.length !== 6) {
      setError(t('pincode_error_desc'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await getCityByPincode(pincode);
      
      if (!data) {
        setError(t('pincode_error_desc'));
        setPincodeData(null);
        if (onDeliveryAvailability) onDeliveryAvailability(false);
        return;
      }
      
      setPincodeData(data);
      if (onPincodeData) onPincodeData(data);
      if (onDeliveryAvailability) onDeliveryAvailability(data.deliveryAvailable);
    } catch (err) {
      console.error('Error checking pincode:', err);
      setError(t('pincode_error_desc'));
      setPincodeData(null);
      if (onDeliveryAvailability) onDeliveryAvailability(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkPincode();
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            value={pincode}
            onChange={handlePincodeChange}
            onKeyDown={handleKeyDown}
            placeholder={t('enter_pincode')}
            className="pl-9"
            maxLength={6}
            disabled={loading}
          />
        </div>
        <Button 
          onClick={checkPincode} 
          disabled={pincode.length !== 6 || loading}
          variant="outline"
          className="gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {t('check')}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle className="flex items-center gap-2">
            <X className="h-4 w-4" />
            {t('pincode_error_title')}
          </AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {pincodeData && (
        <Alert variant={pincodeData.deliveryAvailable ? "default" : "destructive"}>
          <AlertTitle className="flex items-center gap-2">
            {pincodeData.deliveryAvailable 
              ? <><Check className="h-4 w-4" /> {t('delivery_available_title')}</>
              : <><X className="h-4 w-4" /> {t('delivery_unavailable_title')}</>
            }
          </AlertTitle>
          <AlertDescription>
            <div>
              <p>{pincodeData.city}, {pincodeData.district}, {pincodeData.state}</p>
              <p className="mt-1 text-sm">
                {pincodeData.deliveryAvailable 
                  ? t('delivery_available_desc') + ' ' + t('delivery_time_message')
                  : t('delivery_unavailable_desc') + ' ' + t('delivery_unavailable_message')
                }
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PincodeChecker;