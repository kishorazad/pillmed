import React, { useState } from 'react';
import AddressAutocomplete, { AddressData } from './AddressAutocomplete';
import AddressMap from './AddressMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { MapPin, Home, Building, Navigation } from 'lucide-react';

interface AddressFormProps {
  defaultAddress?: AddressData;
  onAddressChange: (address: AddressData) => void;
  includeMap?: boolean;
  form?: any;
  fieldName?: string;
  showDetailedFields?: boolean;
}

export default function AddressForm({
  defaultAddress = { formattedAddress: '' },
  onAddressChange,
  includeMap = true,
  form,
  fieldName = 'address',
  showDetailedFields = false
}: AddressFormProps) {
  const [address, setAddress] = useState<AddressData>(defaultAddress);
  const [mapVisible, setMapVisible] = useState<boolean>(false);

  const handleAddressSelect = (newAddress: AddressData) => {
    console.log('New address selected:', newAddress);
    
    // Update the local state with the selected address
    setAddress(newAddress);
    
    // Notify parent component about the address change
    onAddressChange(newAddress);
    
    // Show the map when an address is selected
    setMapVisible(true);
    
    // If form integration is enabled, update all the related form fields
    if (form && fieldName) {
      // Update the main address field
      form.setValue(fieldName, newAddress.formattedAddress);
      
      // Update related fields if available
      if (newAddress.postalCode) {
        form.setValue("pincode", newAddress.postalCode);
      }
      
      if (newAddress.locality) {
        form.setValue("city", newAddress.locality);
      }
      
      if (newAddress.administrativeAreaLevel1) {
        form.setValue("state", newAddress.administrativeAreaLevel1);
      }
      
      // Trigger validation after setting values
      form.trigger([fieldName, "pincode", "city", "state"]);
    }
  };

  const handleMarkerDragEnd = (location: google.maps.LatLngLiteral) => {
    const newAddress = { ...address, lat: location.lat, lng: location.lng };
    setAddress(newAddress);
    onAddressChange(newAddress);
    
    // Reverse geocode to get address from coordinates
    if (window.google) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          console.log('Geocoding result:', results[0]);
          
          const formattedAddress = results[0].formatted_address;
          const addressComponents = results[0].address_components || [];
          
          // Extract detailed information from address components
          const updatedAddress: AddressData = { 
            ...newAddress,
            formattedAddress
          };
          
          for (const component of addressComponents) {
            const types = component.types;
            
            if (types.includes('street_number')) {
              updatedAddress.streetNumber = component.long_name;
            } else if (types.includes('route')) {
              updatedAddress.route = component.long_name;
            } else if (types.includes('locality')) {
              updatedAddress.locality = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              updatedAddress.administrativeAreaLevel1 = component.long_name;
            } else if (types.includes('country')) {
              updatedAddress.country = component.long_name;
            } else if (types.includes('postal_code')) {
              updatedAddress.postalCode = component.long_name;
            }
          }
          
          // Fallback for postal code extraction if not found in components
          if (!updatedAddress.postalCode) {
            const pincodeMatch = formattedAddress.match(/\b(\d{6})\b/);
            if (pincodeMatch && pincodeMatch[1]) {
              updatedAddress.postalCode = pincodeMatch[1];
            }
          }
          
          // Update state and notify parent
          setAddress(updatedAddress);
          onAddressChange(updatedAddress);
          
          // Update form fields if using react-hook-form
          if (form && fieldName) {
            form.setValue(fieldName, formattedAddress);
            
            // Update related fields
            if (updatedAddress.postalCode) {
              form.setValue("pincode", updatedAddress.postalCode);
            }
            
            if (updatedAddress.locality) {
              try {
                form.setValue("city", updatedAddress.locality);
              } catch (err) {
                console.log('Failed to set city field:', err);
              }
            }
            
            if (updatedAddress.administrativeAreaLevel1) {
              try {
                form.setValue("state", updatedAddress.administrativeAreaLevel1);
              } catch (err) {
                console.log('Failed to set state field:', err);
              }
            }
            
            // Trigger validation
            try {
              form.trigger(fieldName);
              form.trigger("pincode");
            } catch (err) {
              console.log('Error triggering validation:', err);
            }
          }
        }
      });
    }
  };

  // If using with react-hook-form
  if (form && fieldName) {
    return (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <AddressAutocomplete
                  onAddressSelect={(newAddress) => {
                    handleAddressSelect(newAddress);
                    field.onChange(newAddress.formattedAddress);
                  }}
                  defaultValue={field.value}
                  label=""
                  placeholder="Enter your address"
                  required={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {showDetailedFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value || address.postalCode || ''} 
                      onChange={(e) => {
                        field.onChange(e);
                        setAddress(prev => ({ ...prev, postalCode: e.target.value }));
                      }}
                      placeholder="Pincode" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value || address.locality || ''} 
                      onChange={(e) => {
                        field.onChange(e);
                        setAddress(prev => ({ ...prev, locality: e.target.value }));
                      }}
                      placeholder="City" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value || address.administrativeAreaLevel1 || ''} 
                      onChange={(e) => {
                        field.onChange(e);
                        setAddress(prev => ({ ...prev, administrativeAreaLevel1: e.target.value }));
                      }}
                      placeholder="State" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        {includeMap && mapVisible && address.formattedAddress && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Selected Location</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setMapVisible(!mapVisible)}
                >
                  {mapVisible ? 'Hide Map' : 'Show Map'}
                </Button>
              </div>
              <AddressMap 
                address={address} 
                height="250px" 
                draggable={true}
                onMarkerDragEnd={handleMarkerDragEnd}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Standalone version
  return (
    <div className="space-y-4">
      <AddressAutocomplete
        onAddressSelect={handleAddressSelect}
        defaultValue={address.formattedAddress}
        label="Address"
        placeholder="Enter your address"
      />
      
      {showDetailedFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="pincode">Pincode</Label>
            <Input 
              id="pincode"
              value={address.postalCode || ''}
              onChange={(e) => {
                setAddress(prev => ({ ...prev, postalCode: e.target.value }));
                onAddressChange({ ...address, postalCode: e.target.value });
              }}
              placeholder="Pincode"
            />
          </div>
          
          <div>
            <Label htmlFor="city">City</Label>
            <Input 
              id="city"
              value={address.locality || ''}
              onChange={(e) => {
                setAddress(prev => ({ ...prev, locality: e.target.value }));
                onAddressChange({ ...address, locality: e.target.value });
              }}
              placeholder="City"
            />
          </div>
          
          <div>
            <Label htmlFor="state">State</Label>
            <Input 
              id="state"
              value={address.administrativeAreaLevel1 || ''}
              onChange={(e) => {
                setAddress(prev => ({ ...prev, administrativeAreaLevel1: e.target.value }));
                onAddressChange({ ...address, administrativeAreaLevel1: e.target.value });
              }}
              placeholder="State"
            />
          </div>
        </div>
      )}
      
      {includeMap && mapVisible && address.formattedAddress && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Selected Location</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setMapVisible(!mapVisible)}
              >
                {mapVisible ? 'Hide Map' : 'Show Map'}
              </Button>
            </div>
            <AddressMap 
              address={address} 
              height="250px" 
              draggable={true}
              onMarkerDragEnd={handleMarkerDragEnd}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}