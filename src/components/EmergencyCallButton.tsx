import React, { useState } from 'react';
import { PhoneCall, Phone, Heart, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { useLanguage } from './LanguageSwitcher';

interface EmergencyContact {
  name: string;
  number: string;
  description?: string;
}

interface EmergencyCallButtonProps {
  variant?: 'pill' | 'floating';
  size?: 'default' | 'large';
}

const EmergencyCallButton: React.FC<EmergencyCallButtonProps> = ({ 
  variant = 'floating',
  size = 'default'
}) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  
  // These would be fetched from an API in a real implementation
  const emergencyContacts: EmergencyContact[] = [
    {
      name: t('national_emergency'),
      number: '112',
      description: t('national_emergency_description')
    },
    {
      name: t('ambulance'),
      number: '102',
      description: t('ambulance_description')
    },
    {
      name: t('healthcare_helpline'),
      number: '1800-180-1104',
      description: t('healthcare_helpline_description')
    },
    {
      name: t('poison_control'),
      number: '1800-116-117',
      description: t('poison_control_description')
    },
    {
      name: t('blood_bank'),
      number: '1800-180-1233',
      description: t('blood_bank_description')
    },
    {
      name: t('mental_health_helpline'),
      number: '1800-599-0019',
      description: t('mental_health_helpline_description')
    }
  ];

  return (
    <>
      {variant === 'floating' ? (
        <Button
          className="fixed bottom-6 right-6 rounded-full shadow-lg z-50 flex gap-2"
          size={size === 'large' ? 'lg' : 'default'}
          onClick={() => setOpen(true)}
        >
          <PhoneCall className="h-4 w-4" />
          <span>{t('emergency_call')}</span>
        </Button>
      ) : (
        <Button
          className="bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md flex gap-2"
          size={size === 'large' ? 'lg' : 'default'}
          onClick={() => setOpen(true)}
        >
          <PhoneCall className="h-4 w-4" />
          <span>{t('emergency_call')}</span>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              className="h-6 w-6 p-0 rounded-full"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t('close')}</span>
            </Button>
          </div>
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600">
              <Heart className="h-5 w-5" />
              <DialogTitle>{t('emergency_contacts')}</DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="bg-red-50 px-4 py-3 rounded-md mb-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              {t('emergency_disclaimer')}
            </p>
          </div>
          
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3">
                <div>
                  <div className="font-medium">{contact.name}</div>
                  {contact.description && (
                    <div className="text-sm text-gray-500">{contact.description}</div>
                  )}
                </div>
                <a 
                  href={`tel:${contact.number.replace(/[^\d]/g, '')}`}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {contact.number}
                </a>
              </div>
            ))}
          </div>
          
          <DialogFooter className="mt-4">
            <div className="text-xs text-gray-500 text-center w-full">
              {t('contact_emergency_services_note')}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmergencyCallButton;