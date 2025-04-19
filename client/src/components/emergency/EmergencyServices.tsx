import { useState } from 'react';
import { Ambulance, UserRound, CalendarClock, Stethoscope, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmergencyContactForm } from './EmergencyContactForm';
import { useLanguage } from '@/components/LanguageSwitcher';

const serviceTypes = [
  {
    id: 'ambulance',
    name: 'Ambulance Service',
    description: 'Quick emergency transport with life support',
    icon: Ambulance,
    color: 'bg-red-100 text-red-600',
  },
  {
    id: 'doctor_visit',
    name: 'Doctor Home Visit',
    description: 'Expert medical care in the comfort of your home',
    icon: UserRound,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'nursing',
    name: 'Nursing Care',
    description: 'Skilled nursing assistance for patients at home',
    icon: Stethoscope,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'scheduled',
    name: 'Scheduled Consultation',
    description: 'Plan ahead for non-urgent medical needs',
    icon: CalendarClock,
    color: 'bg-purple-100 text-purple-600',
  },
];

export function EmergencyServices() {
  const [showContactForm, setShowContactForm] = useState(false);
  const { t } = useLanguage();
  
  return (
    <>
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t('emergency_medical_services')}
            </h2>
            <p className="text-gray-600 max-w-2xl">
              {t('emergency_services_description')}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">102 / 108</span>
              <span className="text-gray-600">- {t('for_life_threatening')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceTypes.map((service) => (
              <div 
                key={service.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col"
              >
                <div className={`p-5 flex justify-center ${service.color}`}>
                  <service.icon className="h-10 w-10" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <Button 
                    onClick={() => setShowContactForm(true)}
                    className="w-full"
                  >
                    {t('book_service')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{t('important_note')}</h3>
            <p className="text-gray-600 text-sm">
              {t('emergency_services_disclaimer')}
            </p>
            <ul className="text-gray-600 text-sm mt-2 space-y-1 list-disc list-inside">
              <li>{t('emergency_disclaimer_1')}</li>
              <li>{t('emergency_disclaimer_2')}</li>
              <li>{t('emergency_disclaimer_3')}</li>
            </ul>
          </div>
        </div>
      </section>
      
      {showContactForm && (
        <EmergencyContactForm onClose={() => setShowContactForm(false)} />
      )}
    </>
  );
}