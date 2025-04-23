import React, { useState, useEffect, useRef } from 'react';
import { useMemo } from 'react';
import { GoogleMap, useLoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const libraries: ("places")[] = ["places"];

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressData) => void;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
}

export interface AddressData {
  formattedAddress: string;
  streetNumber?: string;
  route?: string;
  locality?: string; // city
  administrativeAreaLevel1?: string; // state
  country?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
}

export default function AddressAutocomplete({
  onAddressSelect,
  defaultValue = "",
  label = "Address",
  placeholder = "Enter your address",
  required = false,
  className = "",
  error
}: AddressAutocompleteProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
    loading: "async"
  });

  const [inputValue, setInputValue] = useState(defaultValue);
  const [addressComponents, setAddressComponents] = useState<AddressData>({
    formattedAddress: defaultValue
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry && place.formatted_address) {
        const newAddressData: AddressData = {
          formattedAddress: place.formatted_address,
          lat: place.geometry.location?.lat(),
          lng: place.geometry.location?.lng()
        };

        // Extract address components
        if (place.address_components) {
          for (const component of place.address_components) {
            const types = component.types;

            if (types.includes('street_number')) {
              newAddressData.streetNumber = component.long_name;
            } else if (types.includes('route')) {
              newAddressData.route = component.long_name;
            } else if (types.includes('locality')) {
              newAddressData.locality = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              newAddressData.administrativeAreaLevel1 = component.long_name;
            } else if (types.includes('country')) {
              newAddressData.country = component.long_name;
            } else if (types.includes('postal_code')) {
              newAddressData.postalCode = component.long_name;
            }
          }
        }
        
        // Fallback for postal code extraction if not found in components
        // Sometimes the postal code is embedded in the address string
        if (!newAddressData.postalCode) {
          // Try to extract 6-digit pincode (common in India)
          const pincodeMatch = place.formatted_address.match(/\b(\d{6})\b/);
          if (pincodeMatch && pincodeMatch[1]) {
            newAddressData.postalCode = pincodeMatch[1];
          }
        }

        // Log the extracted data for debugging
        console.log('Extracted address data:', newAddressData);
        
        setAddressComponents(newAddressData);
        setInputValue(place.formatted_address);
        onAddressSelect(newAddressData);
      }
    }
  };

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    // Restrict to India if needed
    // autocomplete.setComponentRestrictions({ country: ['in'] });
  };

  if (loadError) {
    console.error("Error loading Google Maps API:", loadError);
    return (
      <div className="space-y-2">
        {label && <Label htmlFor="address">{label}{required && <span className="text-red-500">*</span>}</Label>}
        <Input
          type="text"
          id="address"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onAddressSelect({ formattedAddress: e.target.value });
          }}
          placeholder={placeholder}
          className={className}
          required={required}
        />
        <p className="text-xs text-amber-600">Address validation unavailable</p>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor="address">{label}{required && <span className="text-red-500">*</span>}</Label>}
        <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Loading address search...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="address">{label}{required && <span className="text-red-500">*</span>}</Label>}
      <Autocomplete
        onLoad={onAutocompleteLoad}
        onPlaceChanged={handlePlaceSelect}
        options={{ 
          fields: ["formatted_address", "geometry.location", "address_components"],
          componentRestrictions: { country: "in" } // Restrict to India
        }}
      >
        <Input
          ref={inputRef}
          type="text"
          id="address"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className={className}
          required={required}
        />
      </Autocomplete>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}