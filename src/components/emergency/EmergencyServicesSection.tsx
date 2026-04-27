import React, { useRef } from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { Link } from 'wouter';
import { 
  Truck as Ambulance, 
  HeartPulse, 
  Plane, 
  Phone, 
  User,
  MapPin,
  ArrowRight as ArrowRightIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Badge } from '@/components/ui/badge';

interface EmergencyService {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  responseTime: string;
  price: number;
  isEmergency: boolean;
}

const EmergencyServicesSection: React.FC = () => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const emergencyServices: EmergencyService[] = [
    {
      id: 1,
      name: 'Ambulance Service',
      description: 'Emergency ambulance with trained paramedics',
      icon: <Ambulance size={24} />,
      url: '/emergency/ambulance',
      color: 'bg-red-50 text-red-600',
      responseTime: '15-30 min',
      price: 1500,
      isEmergency: true
    },
    {
      id: 2,
      name: 'Air Ambulance',
      description: 'Helicopter medical evacuation for critical cases',
      icon: <Plane size={24} />,
      url: '/emergency/air-ambulance',
      color: 'bg-blue-50 text-blue-600',
      responseTime: '45-60 min',
      price: 50000,
      isEmergency: true
    },
    {
      id: 3,
      name: 'Emergency Team',
      description: 'Mobile emergency medical team dispatched to your location',
      icon: <HeartPulse size={24} />,
      url: '/emergency/medical-team',
      color: 'bg-orange-50 text-orange-600',
      responseTime: '20-40 min',
      price: 5000,
      isEmergency: true
    },
    {
      id: 4,
      name: 'Emergency Consultation',
      description: 'Immediate video consultation with emergency doctors',
      icon: <Phone size={24} />,
      url: '/emergency/consultation',
      color: 'bg-green-50 text-green-600',
      responseTime: '5-10 min',
      price: 2000,
      isEmergency: false
    }
  ];

  return (
    <section className="py-6 bg-red-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" /> Emergency Services
          </h2>
          <div className="flex items-center">
            {!isMobile && (
              <div className="flex gap-2 mr-4">
                <button 
                  onClick={handleScrollLeft}
                  className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleScrollRight}
                  className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            <Link href="/emergency" className="text-red-600 flex items-center text-sm">
              {t('view_all')} <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">Fast response emergency medical assistance available 24/7</p>
        
        <div className="p-4 bg-white rounded-lg border border-red-200 mb-6 flex items-center">
          <Phone className="h-5 w-5 text-red-600 mr-3" />
          <div>
            <div className="font-bold text-lg">Emergency Hotline: <a href="tel:102" className="text-red-600">102</a></div>
            <div className="text-sm text-gray-600">For immediate medical emergencies, call our emergency hotline.</div>
          </div>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {emergencyServices.map((service) => (
            <Link key={service.id} href={service.url} className="snap-start">
              <div className={`${service.isEmergency ? 'bg-white border-red-100' : 'bg-white border-gray-100'} rounded-lg shadow-sm border p-4 transition-shadow hover:shadow-md flex flex-col min-w-[250px] max-w-[320px]`}>
                <div className="flex justify-between items-start mb-3">
                  <div className={`${service.color} p-3 rounded-full`}>
                    {service.icon}
                  </div>
                  <Badge variant="outline" className={`${service.isEmergency ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center`}>
                    <Clock className="mr-1 h-3 w-3" /> Response: {service.responseTime}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-base mb-1 line-clamp-1">{service.name}</h3>
                <p className="text-xs text-gray-600 flex-grow mb-3 line-clamp-2">{service.description}</p>
                
                <div className="flex flex-col mt-auto gap-2">
                  <div className="text-sm font-medium">Starting at ₹{service.price}</div>
                  <Button size="sm" variant={service.isEmergency ? 'destructive' : 'default'} className="w-full">
                    {service.isEmergency ? 'Call Emergency Now' : 'Request Service'}
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-4 bg-white rounded-lg border border-red-200 p-4">
          <h3 className="font-semibold mb-2">What to provide when calling emergency services:</h3>
          <ul className="text-sm space-y-2">
            <li className="flex items-start">
              <User className="h-4 w-4 mr-2 mt-1 text-red-500" />
              <span>Patient's name and age</span>
            </li>
            <li className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-1 text-red-500" />
              <span>Exact location with landmarks</span>
            </li>
            <li className="flex items-start">
              <HeartPulse className="h-4 w-4 mr-2 mt-1 text-red-500" />
              <span>Nature of emergency and patient's condition</span>
            </li>
            <li className="flex items-start">
              <Phone className="h-4 w-4 mr-2 mt-1 text-red-500" />
              <span>Your contact number</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default EmergencyServicesSection;