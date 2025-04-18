import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/LanguageSwitcher';
import { Loader2 } from 'lucide-react';

interface AddressFormProps {
  form: any;
}

const AddressForm: React.FC<AddressFormProps> = ({ form }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [lookupInProgress, setLookupInProgress] = useState(false);
  const [pincodeLookupResult, setPincodeLookupResult] = useState<any>(null);

  // When pincode changes, look up city and state
  const handlePincodeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = event.target.value;
    
    // Only proceed if it's a 6-digit number
    if (pincode && pincode.length === 6 && /^\d+$/.test(pincode)) {
      setLookupInProgress(true);
      
      try {
        const response = await fetch(`/api/pincode/${pincode}`);
        
        if (response.ok) {
          const data = await response.json();
          setPincodeLookupResult(data);
          
          // Auto-fill city and state fields
          form.setValue('city', data.city);
          form.setValue('state', data.state);
          
          // Show delivery availability message
          if (data.deliveryAvailable) {
            toast({
              title: t('delivery_available_title'),
              description: t('delivery_available_desc'),
              variant: 'default',
            });
          } else {
            toast({
              title: t('delivery_unavailable_title'),
              description: t('delivery_unavailable_desc'),
              variant: 'destructive',
            });
          }
        } else {
          // Pin code not found or error
          const errorData = await response.json();
          toast({
            title: t('pincode_error_title'),
            description: errorData.error || t('pincode_error_desc'),
            variant: 'destructive',
          });
          setPincodeLookupResult(null);
        }
      } catch (error) {
        console.error('Error looking up pincode:', error);
        toast({
          title: t('pincode_error_title'),
          description: t('pincode_error_desc'),
          variant: 'destructive',
        });
      } finally {
        setLookupInProgress(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('full_name')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('enter_full_name')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('enter_email')} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('phone')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('enter_phone')} type="tel" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('address')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('enter_address')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('pincode')}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    {...field} 
                    placeholder={t('enter_pincode')} 
                    maxLength={6}
                    onChange={(e) => {
                      field.onChange(e);
                      handlePincodeChange(e);
                    }}
                  />
                  {lookupInProgress && (
                    <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3 text-gray-400" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('city')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('enter_city')} />
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
              <FormLabel>{t('state')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('enter_state')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {pincodeLookupResult && pincodeLookupResult.deliveryAvailable && (
        <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md flex items-start">
          <span className="mr-2">✓</span>
          <div>
            <p className="font-medium">{t('delivery_available_title')}</p>
            <p>{t('delivery_time_message')}</p>
          </div>
        </div>
      )}
      
      {pincodeLookupResult && !pincodeLookupResult.deliveryAvailable && (
        <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-md flex items-start">
          <span className="mr-2">!</span>
          <div>
            <p className="font-medium">{t('delivery_unavailable_title')}</p>
            <p>{t('delivery_unavailable_message')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressForm;