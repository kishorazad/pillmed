import React, { useRef } from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { Link } from 'wouter';
import { 
  Stethoscope, 
  HeartPulse, 
  FlaskConical, 
  Pill, 
  Home, 
  MessageSquare,
  ArrowRightIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

interface HealthService {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  color: string;
}

const HealthServices: React.FC = () => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  const services: HealthService[] = [
    {
      id: 1,
      title: t('doctor_consultation'),
      description: t('consult_with_top_doctors'),
      icon: <Stethoscope size={24} />,
      url: '/doctors',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 2,
      title: t('lab_tests'),
      description: t('book_lab_tests_home_collection'),
      icon: <FlaskConical size={24} />,
      url: '/lab-tests',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 3,
      title: t('medicine_delivery'),
      description: t('doorstep_delivery_of_medicines'),
      icon: <Pill size={24} />,
      url: '/medicines',
      color: 'bg-green-50 text-green-600'
    },
    {
      id: 4,
      title: t('health_checkups'),
      description: t('comprehensive_health_packages'),
      icon: <HeartPulse size={24} />,
      url: '/health-checkups',
      color: 'bg-red-50 text-red-600'
    },
    {
      id: 5,
      title: t('home_healthcare'),
      description: t('healthcare_services_at_home'),
      icon: <Home size={24} />,
      url: '/home-healthcare',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      id: 6,
      title: t('health_chat'),
      description: t('chat_with_ai_health_assistant'),
      icon: <MessageSquare size={24} />,
      url: '/health-chat',
      color: 'bg-pink-50 text-pink-600'
    }
  ];

  return (
    <section className="py-6 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{t('health_services')}</h2>
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
        
        <p className="text-gray-600 mb-4">{t('comprehensive_healthcare_solutions')}</p>
        
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
              <div className="bg-white rounded-lg shadow-sm p-4 transition-shadow hover:shadow-md flex flex-col min-w-[160px] w-[160px]">
                <div className={`${service.color} p-3 rounded-full w-fit mb-3`}>
                  {service.icon}
                </div>
                
                <h3 className="font-semibold text-base mb-1 line-clamp-1">{service.title}</h3>
                <p className="text-xs text-gray-600 flex-grow mb-3 line-clamp-2">{service.description}</p>
                
                <Button variant="ghost" className="mt-auto w-fit p-0 h-auto text-primary text-xs font-medium hover:bg-transparent">
                  {t('explore')} <ArrowRightIcon className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HealthServices;