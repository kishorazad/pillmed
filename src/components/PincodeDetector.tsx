import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    google: any;
  }
}

const PincodeDetector = () => {
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const { setPincode, pincode } = useStore();

  // Try to detect location on component mount
  useEffect(() => {
    // Only try to detect location if we don't already have a pincode
    if (!pincode) {
      detectUserLocation();
    }
  }, [pincode]);

  const detectUserLocation = () => {
    setLocationLoading(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Prioritize Google Maps Geocoding API
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results: any, status: string) => {
                if (status === 'OK' && results[0]) {
                  const addressComponents = results[0].address_components;
                  const postalCode = addressComponents.find((component: any) => 
                    component.types.includes('postal_code')
                  );
                  
                  if (postalCode) {
                    setPincode(postalCode.long_name);
                  } else {
                    // Fallback to backend API if no postal code found
                    fetchPincodeFromBackend(latitude, longitude);
                  }
                } else {
                  fetchPincodeFromBackend(latitude, longitude);
                }
                setLocationLoading(false);
              }
            );
          } else {
            // Fallback to backend API if Google Maps not loaded
            fetchPincodeFromBackend(latitude, longitude);
          }
        } catch (error) {
          console.error('Error detecting location:', error);
          setLocationError('Failed to detect your location');
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Failed to detect your location';
        
        if (error.code === 1) {
          errorMessage = 'Location access denied. Please enable location permissions.';
        } else if (error.code === 2) {
          errorMessage = 'Location unavailable. Please try again.';
        } else if (error.code === 3) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const fetchPincodeFromBackend = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(`/api/pincode?lat=${latitude}&lng=${longitude}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pincode from coordinates');
      }
      
      const data = await response.json();
      
      if (data && data.pincode) {
        setPincode(data.pincode);
      } else {
        setLocationError('Could not determine your pincode');
      }
    } catch (error) {
      console.error('Error fetching pincode:', error);
      setLocationError('Failed to determine your pincode');
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center cursor-pointer" onClick={detectUserLocation}>
        <MapPin className="h-4 w-4 mr-1 text-orange-500" />
        <span className="text-gray-700 mr-1">Deliver to</span>
        {pincode ? (
          <span className="font-semibold text-orange-500">{pincode}</span>
        ) : (
          <Button 
            variant="link" 
            className="p-0 h-auto font-semibold text-orange-500"
            onClick={detectUserLocation}
            disabled={locationLoading}
          >
            {locationLoading ? 'Detecting...' : locationError ? 'Set location' : 'Detect location'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PincodeDetector;