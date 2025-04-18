import React, { useRef } from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { Link } from 'wouter';
import { 
  UserCog, 
  Heart, 
  Stethoscope, 
  Thermometer, 
  Activity,
  ArrowRightIcon,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Badge } from '@/components/ui/badge';

interface MedicalService {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  category: string;
  duration: string;
  price: number;
}

const MedicalServicesSection: React.FC = () => {
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
  
  const services: MedicalService[] = [
    {
      id: 1,
      name: 'Doctor Home Visit',
      description: 'Qualified medical doctor visit at your doorstep',
      icon: <Stethoscope size={24} />,
      url: '/services/doctor-visit',
      color: 'bg-blue-50 text-blue-600',
      category: 'Doctor',
      duration: '30-60 min',
      price: 1200
    },
    {
      id: 2,
      name: 'Nurse Service',
      description: 'Skilled nursing care for injections, dressing, and more',
      icon: <Heart size={24} />,
      url: '/services/nurse-visit',
      color: 'bg-pink-50 text-pink-600',
      category: 'Nurse',
      duration: '30-60 min',
      price: 800
    },
    {
      id: 3,
      name: 'Physiotherapy',
      description: 'Professional physiotherapy service at home',
      icon: <Activity size={24} />,
      url: '/services/physiotherapy',
      color: 'bg-green-50 text-green-600',
      category: 'Therapy',
      duration: '45-60 min',
      price: 900
    },
    {
      id: 4,
      name: 'Elder Care',
      description: 'Specialized care for elderly patients',
      icon: <UserCog size={24} />,
      url: '/services/elder-care',
      color: 'bg-purple-50 text-purple-600',
      category: 'Specialist',
      duration: '1-2 hours',
      price: 1500
    },
    {
      id: 5,
      name: 'Health Check-up',
      description: 'Comprehensive health check in the comfort of your home',
      icon: <Thermometer size={24} />,
      url: '/services/health-checkup',
      color: 'bg-orange-50 text-orange-600',
      category: 'Preventive',
      duration: '30-45 min',
      price: 1000
    },
    {
      id: 6,
      name: 'Wound Care',
      description: 'Professional wound dressing and care',
      icon: <Heart size={24} />,
      url: '/services/wound-care',
      color: 'bg-red-50 text-red-600',
      category: 'Nurse',
      duration: '20-40 min',
      price: 600
    }
  ];

  return (
    <section className="py-6 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Medical Services at Home</h2>
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
            <Link href="/services" className="text-primary flex items-center text-sm">
              {t('view_all')} <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">Professional healthcare services delivered at your doorstep</p>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {services.map((service) => (
            <Link key={service.id} href={service.url} className="snap-start">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-shadow hover:shadow-md flex flex-col min-w-[220px] max-w-[280px]">
                <div className="flex justify-between items-start mb-3">
                  <div className={`${service.color} p-3 rounded-full`}>
                    {service.icon}
                  </div>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center">
                    <Clock className="mr-1 h-3 w-3" /> {service.duration}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-base mb-1 line-clamp-1">{service.name}</h3>
                <div className="flex items-center mb-2">
                  <Badge variant="outline" className="text-xs bg-gray-50">
                    {service.category}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 flex-grow mb-3 line-clamp-2">{service.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-sm font-medium">₹{service.price}</div>
                  <Button size="sm" className="text-xs">Book Now</Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MedicalServicesSection;