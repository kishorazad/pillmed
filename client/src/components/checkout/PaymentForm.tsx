import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/components/LanguageSwitcher';

interface PaymentFormProps {
  form: any;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ form }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel>{t('select_payment_method')}</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value="creditCard" id="creditCard" />
                  <label htmlFor="creditCard" className="flex items-center cursor-pointer">
                    <i className="fas fa-credit-card text-blue-500 mr-3"></i>
                    {t('credit_card')}
                  </label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value="debitCard" id="debitCard" />
                  <label htmlFor="debitCard" className="flex items-center cursor-pointer">
                    <i className="fas fa-credit-card text-green-500 mr-3"></i>
                    {t('debit_card')}
                  </label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value="upi" id="upi" />
                  <label htmlFor="upi" className="flex items-center cursor-pointer">
                    <i className="fas fa-mobile-alt text-purple-500 mr-3"></i>
                    {t('upi_payment')}
                  </label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value="cod" id="cod" />
                  <label htmlFor="cod" className="flex items-center cursor-pointer">
                    <i className="fas fa-money-bill-wave text-green-600 mr-3"></i>
                    {t('cash_on_delivery')}
                  </label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="p-4 bg-yellow-50 rounded-md text-sm text-yellow-800">
        <p className="flex items-start">
          <i className="fas fa-info-circle mt-1 mr-2"></i>
          <span>{t('demo_checkout_notice')}</span>
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;