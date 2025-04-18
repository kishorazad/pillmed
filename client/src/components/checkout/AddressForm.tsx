import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import PincodeChecker from './PincodeChecker';
import { useState } from 'react';
import { PincodeData } from '@/services/location-service';

// Form validation schema
const addressFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters' }),
  city: z.string().min(2, { message: 'City must be at least 2 characters' }),
  state: z.string().min(2, { message: 'State must be at least 2 characters' }),
  pincode: z.string().min(6, { message: 'Pincode must be at least 6 characters' }),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

interface AddressFormProps {
  defaultValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => void;
}

const AddressForm = ({ defaultValues, onSubmit }: AddressFormProps) => {
  const { t } = useLanguage();
  const [pincodeData, setPincodeData] = useState<PincodeData | null>(null);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      phone: defaultValues?.phone || '',
      address: defaultValues?.address || '',
      city: defaultValues?.city || '',
      state: defaultValues?.state || '',
      pincode: defaultValues?.pincode || '',
    },
  });

  const handlePincodeData = (data: PincodeData) => {
    setPincodeData(data);
    
    // Auto-fill city and state if pincode data is available
    if (data) {
      form.setValue('city', data.city);
      form.setValue('state', data.state);
    }
  };

  const handleDeliveryAvailability = (available: boolean) => {
    setDeliveryAvailable(available);
  };

  // Handle form submission
  const handleSubmitForm = (values: AddressFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('full_name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('enter_full_name')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t('enter_email')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone_number')}</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder={t('enter_phone')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('address_line1')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('enter_address')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pincode')}</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input placeholder={t('enter_pincode')} {...field} />
                    <PincodeChecker 
                      onPincodeData={handlePincodeData} 
                      onDeliveryAvailability={handleDeliveryAvailability}
                    />
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
                  <Input placeholder={t('enter_city')} {...field} />
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
                  <Input placeholder={t('enter_state')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={!deliveryAvailable && form.getValues('pincode').length >= 6}
        >
          {t('continue')}
        </Button>
      </form>
    </Form>
  );
};

export default AddressForm;