import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { EmergencyServices } from '@/components/emergency/EmergencyServices';
import { useLanguage } from '@/components/LanguageSwitcher';
import { ChevronRight } from 'lucide-react';

export default function EmergencyServicesPage() {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>Emergency Medical Services | PillNow</title>
        <meta name="description" content="Access emergency medical services including ambulance, doctor home visits, nursing care, and scheduled consultations." />
      </Helmet>

      <section className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-primary transition-colors">
            {t('home')}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>{t('emergency_medical_services')}</span>
        </div>
      </section>
      
      <EmergencyServices />
      
      <section className="container mx-auto py-8 px-4 md:px-6">
        <div className="bg-primary/5 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">When to Call Emergency Services?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Call Emergency Number (102/108) for:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Difficulty breathing or shortness of breath</li>
                <li>Chest or upper abdominal pain or pressure</li>
                <li>Fainting, sudden dizziness, weakness</li>
                <li>Sudden changes in vision</li>
                <li>Confusion or changes in mental status</li>
                <li>Sudden or severe pain</li>
                <li>Uncontrolled bleeding</li>
                <li>Severe or persistent vomiting or diarrhea</li>
                <li>Coughing or vomiting blood</li>
                <li>Suicidal or homicidal feelings</li>
                <li>Suspected poisoning</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Use Our Services for:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Non-emergency medical assistance</li>
                <li>Minor illnesses and injuries</li>
                <li>Medical consultations for existing conditions</li>
                <li>Follow-up care after hospital discharge</li>
                <li>Elderly care and assistance</li>
                <li>Medication administration</li>
                <li>Scheduled medical procedures</li>
                <li>Health monitoring for chronic conditions</li>
                <li>Specialized home care services</li>
                <li>Preventive healthcare visits</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}