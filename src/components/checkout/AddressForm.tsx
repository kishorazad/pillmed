import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/LanguageSwitcher';
import PincodeChecker from './PincodeChecker';
import { PincodeData } from '@/services/location-service';
import { useToast } from '@/hooks/use-toast';

// Define schema for address form
const addressSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name is required' }),
  phoneNumber: z.string().min(10, { message: 'Valid phone number is required' }),
  pincode: z.string().min(6, { message: 'Valid pincode is required' }),
  address: z.string().min(5, { message: 'Address is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  state: z.string().min(1, { message: 'State is required' }),
  addressType: z.enum(['home', 'office', 'other'], {
    required_error: 'Address type is required',
  }),
  landmark: z.string().optional(),
  alternatePhone: z.string().optional(),
  makeDefault: z.boolean().default(false)
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  initialData?: Partial<AddressFormValues>;
  onSubmit: (data: AddressFormValues) => void;
  onCancel?: () => void;
  buttonText?: string;
  isMobile?: boolean;
}

const AddressForm = ({
  initialData,
  onSubmit,
  onCancel,
  buttonText = 'Save Address',
  isMobile = false
}: AddressFormProps) => {
  const { t, language, isRTL } = useLanguage();
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [pincodeData, setPincodeData] = useState<PincodeData | null>(null);
  const { toast } = useToast();
  
  // Initialize form with react-hook-form
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      phoneNumber: initialData?.phoneNumber || '',
      pincode: initialData?.pincode || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      addressType: initialData?.addressType || 'home',
      landmark: initialData?.landmark || '',
      alternatePhone: initialData?.alternatePhone || '',
      makeDefault: initialData?.makeDefault || false
    }
  });
  
  // Handle form submission
  const handleSubmit = (values: AddressFormValues) => {
    // Check delivery availability
    if (!deliveryAvailable) {
      toast({
        title: t('delivery_not_available'),
        description: t('delivery_not_available_desc'),
        variant: 'destructive',
      });
      return;
    }
    
    onSubmit(values);
  };
  
  // Update city and state when pincode data is received
  useEffect(() => {
    if (pincodeData) {
      form.setValue('city', pincodeData.city);
      form.setValue('state', pincodeData.state);
    }
  }, [pincodeData, form]);
  
  // Handle delivery availability change
  const handleDeliveryAvailability = (available: boolean) => {
    setDeliveryAvailable(available);
    if (!available) {
      toast({
        title: t('delivery_not_available'),
        description: t('delivery_not_available_desc'),
        variant: 'destructive',
      });
    }
  };
  
  // Handle pincode data
  const handlePincodeData = (data: PincodeData | null) => {
    setPincodeData(data);
    if (data) {
      form.setValue('city', data.city);
      form.setValue('state', data.state);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('full_name')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('full_name_placeholder')} 
                    {...field} 
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone_number')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('phone_number_placeholder')} 
                    {...field} 
                    dir="ltr" // Always keep phone numbers LTR
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Pincode */}
        <FormField
          control={form.control}
          name="pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('pincode')}</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input 
                    placeholder={t('pincode_placeholder')} 
                    {...field} 
                    dir="ltr" // Always keep pincodes LTR
                    maxLength={6}
                    onChange={(e) => {
                      // Allow only numeric input
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                  <PincodeChecker 
                    initialPincode={field.value} 
                    onPincodeData={handlePincodeData}
                    onDeliveryAvailability={handleDeliveryAvailability}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('address')}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('address_placeholder')} 
                  rows={3} 
                  {...field} 
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('city')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('city_placeholder')} 
                    {...field} 
                    dir={isRTL ? 'rtl' : 'ltr'}
                    disabled={!!pincodeData}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* State */}
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('state')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('state_placeholder')} 
                    {...field} 
                    dir={isRTL ? 'rtl' : 'ltr'}
                    disabled={!!pincodeData}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Landmark */}
        <FormField
          control={form.control}
          name="landmark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('landmark')} ({t('optional')})</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t('landmark_placeholder')} 
                  {...field} 
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Alternate Phone */}
        <FormField
          control={form.control}
          name="alternatePhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('alternate_phone')} ({t('optional')})</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t('alternate_phone_placeholder')} 
                  {...field} 
                  dir="ltr" // Always keep phone numbers LTR
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Address Type */}
        <FormField
          control={form.control}
          name="addressType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('address_type')}</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value} 
                  className="flex flex-row gap-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="home" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      {t('home')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="office" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      {t('office')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="other" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      {t('other')}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className={isMobile ? "flex-1" : ""}
            >
              {t('cancel')}
            </Button>
          )}
          <Button 
            type="submit" 
            className={isMobile ? "flex-1" : ""}
            disabled={!deliveryAvailable || form.formState.isSubmitting}
          >
            {buttonText}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddressForm;