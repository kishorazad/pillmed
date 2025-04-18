import React, { useRef } from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { Link } from 'wouter';
import { 
  Stethoscope, 
  ActivitySquare as Wheelchair, 
  Heart as LungIcon, 
  Thermometer, 
  Bed,
  ArrowRight as ArrowRightIcon,
  ChevronLeft,
  ChevronRight,
  Monitor as MonitorIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Badge } from '@/components/ui/badge';

interface MedicalEquipment {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  rentalAvailable: boolean;
  color: string;
  category: string;
}

const MedicalEquipmentSection: React.FC = () => {
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
  
  const equipments: MedicalEquipment[] = [
    {
      id: 1,
      name: 'Oxygen Concentrator',
      description: 'Medical-grade oxygen concentrator for home use',
      icon: <LungIcon size={24} />,
      url: '/equipment/oxygen-concentrator',
      rentalAvailable: true,
      color: 'bg-sky-50 text-sky-600',
      category: 'Respiratory'
    },
    {
      id: 2,
      name: 'Blood Pressure Monitor',
      description: 'Digital BP monitor for accurate home readings',
      icon: <Stethoscope size={24} />,
      url: '/equipment/bp-monitor',
      rentalAvailable: false,
      color: 'bg-red-50 text-red-600',
      category: 'Monitoring'
    },
    {
      id: 3,
      name: 'Wheelchair',
      description: 'Foldable wheelchair for improved mobility',
      icon: <Wheelchair size={24} />,
      url: '/equipment/wheelchair',
      rentalAvailable: true,
      color: 'bg-blue-50 text-blue-600',
      category: 'Mobility'
    },
    {
      id: 4,
      name: 'Hospital Bed',
      description: 'Adjustable hospital bed for home care',
      icon: <Bed size={24} />,
      url: '/equipment/hospital-bed',
      rentalAvailable: true,
      color: 'bg-green-50 text-green-600',
      category: 'Furniture'
    },
    {
      id: 5,
      name: 'Infrared Thermometer',
      description: 'Non-contact temperature measurement',
      icon: <Thermometer size={24} />,
      url: '/equipment/thermometer',
      rentalAvailable: false,
      color: 'bg-yellow-50 text-yellow-600',
      category: 'Monitoring'
    },
    {
      id: 6,
      name: 'Patient Monitor',
      description: 'Multi-parameter patient vital monitoring system',
      icon: <MonitorIcon size={24} />,
      url: '/equipment/patient-monitor',
      rentalAvailable: true,
      color: 'bg-purple-50 text-purple-600',
      category: 'Monitoring'
    }
  ];

  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Medical Equipment</h2>
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
            <Link href="/equipment" className="text-primary flex items-center text-sm">
              {t('view_all')} <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">Quality medical equipment for rent or purchase</p>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {equipments.map((equipment) => (
            <Link key={equipment.id} href={equipment.url} className="snap-start">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-shadow hover:shadow-md flex flex-col min-w-[220px] max-w-[280px]">
                <div className="flex justify-between items-start mb-3">
                  <div className={`${equipment.color} p-3 rounded-full`}>
                    {equipment.icon}
                  </div>
                  {equipment.rentalAvailable && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Rental Available
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-base mb-1 line-clamp-1">{equipment.name}</h3>
                <div className="flex items-center mb-2">
                  <Badge variant="outline" className="text-xs bg-gray-50">
                    {equipment.category}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 flex-grow mb-3 line-clamp-2">{equipment.description}</p>
                
                <Button variant="outline" className="mt-auto w-full text-sm">
                  {equipment.rentalAvailable ? 'Rent or Buy' : 'Purchase'}
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MedicalEquipmentSection;