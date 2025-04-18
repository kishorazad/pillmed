import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Clock, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useLanguage } from '@/components/LanguageSwitcher';
import { PincodeData } from '@/services/location-service';

interface PincodeCheckerProps {
  initialPincode?: string;
  onPincodeData?: (data: PincodeData | null) => void;
  onDeliveryAvailability?: (available: boolean) => void;
}

const PincodeChecker = ({
  initialPincode,
  onPincodeData,
  onDeliveryAvailability
}: PincodeCheckerProps) => {
  const [checking, setChecking] = useState(false);
  const [pincodeData, setPincodeData] = useState<PincodeData | null>(null);
  const [pincode, setPincode] = useState(initialPincode || '');
  const debouncedPincode = useDebounce(pincode, 500);
  const { t } = useLanguage();

  useEffect(() => {
    // Check pincode if it's a valid 6-digit number
    if (debouncedPincode && debouncedPincode.length === 6 && /^[1-9][0-9]{5}$/.test(debouncedPincode)) {
      checkPincode(debouncedPincode);
    } else if (debouncedPincode && debouncedPincode.length > 0 && debouncedPincode.length < 6) {
      setPincodeData(null);
      onPincodeData && onPincodeData(null);
      onDeliveryAvailability && onDeliveryAvailability(false);
    }
  }, [debouncedPincode]);

  useEffect(() => {
    // Initialize with the prop value if provided
    if (initialPincode && initialPincode.length === 6 && /^[1-9][0-9]{5}$/.test(initialPincode)) {
      checkPincode(initialPincode);
    }
  }, []);

  const checkPincode = async (code: string) => {
    try {
      setChecking(true);
      const response = await axios.get(`/api/pincode/${code}`);
      
      if (response.data) {
        // Handle potential API field name mismatch - our API returns deliveryAvailable
        // but our component expects serviceAvailable
        const dataWithCorrectFields = {
          ...response.data,
          serviceAvailable: response.data.serviceAvailable || response.data.deliveryAvailable || false
        };
        
        setPincodeData(dataWithCorrectFields);
        onPincodeData && onPincodeData(dataWithCorrectFields);
        onDeliveryAvailability && onDeliveryAvailability(dataWithCorrectFields.serviceAvailable);
      } else {
        setPincodeData(null);
        onPincodeData && onPincodeData(null);
        onDeliveryAvailability && onDeliveryAvailability(false);
      }
    } catch (error) {
      console.error('Error checking pincode:', error);
      setPincodeData(null);
      onPincodeData && onPincodeData(null);
      onDeliveryAvailability && onDeliveryAvailability(false);
    } finally {
      setChecking(false);
    }
  };

  if (!pincode && !initialPincode) {
    return null;
  }

  // If checking, show loading state
  if (checking) {
    return (
      <div className="flex items-center text-muted-foreground text-sm mt-1 animate-pulse">
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        <span>{t('checking_delivery')}</span>
      </div>
    );
  }

  // If we have pincode data, show the result
  if (pincodeData) {
    return (
      <div className={pincodeData.serviceAvailable ? "text-green-600" : "text-red-500"}>
        <div className="flex items-start text-sm mt-1">
          <div className="flex-shrink-0 mt-0.5">
            {pincodeData.serviceAvailable ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-1" />
            )}
          </div>
          <div className="ml-1">
            <div className="font-medium">
              {pincodeData.serviceAvailable 
                ? t('delivery_available') 
                : t('delivery_not_available')}
            </div>
            <div className="text-xs">
              <span className="flex items-center mt-0.5">
                <MapPin className="h-3 w-3 mr-1" />
                {pincodeData.city}, {pincodeData.state}
              </span>
              {pincodeData.serviceAvailable && (
                <span className="flex items-center mt-0.5">
                  <Clock className="h-3 w-3 mr-1" />
                  {t('delivery_estimate', { days: pincodeData.deliveryDays.toString() })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Return null if no valid pincode yet
  return null;
};

export default PincodeChecker;