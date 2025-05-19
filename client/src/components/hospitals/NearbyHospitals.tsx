import React, { useState, useRef } from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { MapPin, Phone, Heart, Upload, Plus, ArrowRightIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  distance: string;
  specialties: string[];
  isEmergency: boolean;
  offers?: {
    title: string;
    description: string;
    validUntil?: string;
    isHighlighted?: boolean;
  }[];
}

const NearbyHospitals: React.FC = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
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
  
  // Sample hospital data - would be replaced with API data
  const hospitals: Hospital[] = [
    {
      id: 1,
      name: 'City General Hospital',
      address: '123 Healthcare Ave, Medical District',
      phone: '1800-123-4567',
      distance: '2.4 km',
      specialties: ['Emergency Care', 'Cardiology', 'Neurology'],
      isEmergency: true,
      offers: [
        {
          title: 'Free OPD Consultation',
          description: 'Get a free OPD consultation with our specialists every Monday',
          validUntil: '2025-06-30',
          isHighlighted: true
        },
        {
          title: '20% Off on Health Packages',
          description: 'Special discount on all preventive health checkup packages',
          validUntil: '2025-05-31'
        }
      ]
    },
    {
      id: 2,
      name: 'Apollo Healthcare',
      address: '456 Wellness Blvd, Health Park',
      phone: '1800-765-4321',
      distance: '3.8 km',
      specialties: ['Orthopedics', 'Pediatrics', 'General Surgery'],
      isEmergency: true,
      offers: [
        {
          title: 'Free OPD Week',
          description: 'Complimentary OPD consultations for all specialties from May 10-17',
          validUntil: '2025-05-17',
          isHighlighted: true
        }
      ]
    },
    {
      id: 3,
      name: 'Medanta Clinic',
      address: '789 Doctor Lane, Care Center',
      phone: '1800-555-1212',
      distance: '5.2 km',
      specialties: ['Family Medicine', 'Dermatology', 'Internal Medicine'],
      isEmergency: false
    },
    {
      id: 4,
      name: 'City Health Centre',
      address: '101 Medical Plaza, West District',
      phone: '1800-987-6543',
      distance: '6.7 km',
      specialties: ['Gynecology', 'Pediatrics', 'Dentistry'],
      isEmergency: false
    },
    {
      id: 5,
      name: 'LifeCare Emergency',
      address: '202 Emergency Drive, South Region',
      phone: '1800-911-0101',
      distance: '4.3 km',
      specialties: ['Trauma Care', 'Critical Care', 'Emergency Medicine'],
      isEmergency: true
    },
    {
      id: 6,
      name: 'Max Super Specialty',
      address: '303 Specialist Road, North Zone',
      phone: '1800-444-5555',
      distance: '7.1 km',
      specialties: ['Oncology', 'Cardiology', 'Neurosurgery', 'Transplant'],
      isEmergency: true
    }
  ];

  const [newHospital, setNewHospital] = useState({
    name: '',
    address: '',
    phone: '',
    specialties: '',
    isEmergency: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewHospital({
      ...newHospital,
      [name]: value
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewHospital({
      ...newHospital,
      isEmergency: e.target.checked
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here would be API call to save the hospital data
    console.log('Hospital data submitted:', newHospital);
    setOpen(false);
    // Reset form
    setNewHospital({
      name: '',
      address: '',
      phone: '',
      specialties: '',
      isEmergency: false
    });
  };

  return (
    <section className="py-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{t('nearby_hospitals')}</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="link" 
              className="flex items-center gap-1 text-primary"
              onClick={() => window.location.href = '/hospitals'}
            >
              {t('view_all')}
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
            
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
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  {t('add_hospital')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('add_hospital_information')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">{t('hospital_name')}</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={newHospital.name} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">{t('address')}</Label>
                    <Textarea 
                      id="address" 
                      name="address" 
                      value={newHospital.address} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">{t('phone_number')}</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={newHospital.phone} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="specialties">{t('specialties')}</Label>
                    <Input 
                      id="specialties" 
                      name="specialties" 
                      value={newHospital.specialties} 
                      onChange={handleInputChange} 
                      placeholder={t('comma_separated')}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isEmergency" 
                      name="isEmergency" 
                      checked={newHospital.isEmergency} 
                      onChange={handleCheckboxChange} 
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isEmergency">{t('provides_emergency_care')}</Label>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{t('save')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{t('emergency_healthcare_facilities_nearby')}</p>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {hospitals.map((hospital) => (
            <div 
              key={hospital.id} 
              className={`snap-start min-w-[90px] md:min-w-[350px] max-w-[118px] md:max-w-none flex-shrink-0 rounded-lg shadow-sm p-4 ${hospital.isEmergency ? 'bg-red-50 border-l-4 border-red-500' : 'bg-white'} transition-shadow hover:shadow-md flex flex-col cursor-pointer`}
              onClick={() => window.location.href = `/hospitals/${hospital.id}`}
            >
              {/* Image container with fixed 88.4x72.33 dimensions for mobile consistency */}
              <div className="w-[88.4px] h-[72.33px] bg-gray-100 rounded-lg mb-2 overflow-hidden flex items-center justify-center mx-auto">
                <img
  src={`/hospital-${hospital.id}.jpg`}
  alt={hospital.name}
  className="object-cover w-full h-full"
  onError={(e) => {
    const img = e.target as HTMLImageElement;
    if (img.src !== window.location.origin + '/hospital-placeholder.jpg') {
      img.src = '/hospital-placeholder.jpg';
    }
  }}
/>

              </div>
              
              <div className="flex justify-between items-start">
                <h3 className="text-sm md:text-lg font-semibold line-clamp-2">{hospital.name}</h3>
                <div className="text-xs md:text-sm text-gray-500 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {hospital.distance}
                </div>
              </div>
              
              {hospital.isEmergency && (
                <div className="inline-flex items-center mt-1 mb-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded w-fit">
                  <Heart className="h-3 w-3 mr-1" />
                  {t('emergency_care')}
                </div>
              )}
              
              <p className="text-xs md:text-sm text-gray-600 mt-2 mb-1 line-clamp-1">
                <MapPin className="h-3 w-3 inline mr-1" />
                {hospital.address}
              </p>
              
              <p className="text-xs md:text-sm text-gray-600 mb-3 hidden md:block">
                <Phone className="h-3 w-3 inline mr-1" />
                {hospital.phone}
              </p>
              
              {/* Display highlighted offer if available */}
              {hospital.offers && hospital.offers.length > 0 && hospital.offers.some(offer => offer.isHighlighted) && (
                <div className="my-2">
                  {hospital.offers.filter(offer => offer.isHighlighted).slice(0, 1).map((offer, index) => (
                    <div key={index} className="bg-primary/10 border border-primary/30 rounded-md px-2 py-1.5 text-xs">
                      <p className="font-medium text-primary">{offer.title}</p>
                      <p className="text-gray-600 line-clamp-1 md:line-clamp-2 text-[10px] md:text-xs">{offer.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap gap-1 mt-2 hidden md:flex">
                {hospital.specialties.slice(0, 3).map((specialty, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {specialty}
                  </span>
                ))}
                {hospital.specialties.length > 3 && (
                  <span className="text-xs text-gray-500">+{hospital.specialties.length - 3} {t('more')}</span>
                )}
              </div>
              
              <div className="mt-auto pt-3 flex justify-between w-full">
                <a 
                  href={`/hospitals/${hospital.id}`}
                  className="text-primary text-xs md:text-sm font-medium hover:underline flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {t('view_details')}
                </a>
                <a 
                  href={`tel:${hospital.phone.replace(/[^\d]/g, '')}`} 
                  className="text-primary text-xs md:text-sm font-medium hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {t('call')}
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-center">
          <div className="bg-blue-50 p-4 rounded-lg max-w-md text-center">
            <Upload className="h-10 w-10 mx-auto text-blue-500 mb-2" />
            <h3 className="text-lg font-semibold">{t('add_local_hospital')}</h3>
            <p className="text-sm text-gray-600 mt-1 mb-3">{t('help_community_by_adding')}</p>
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => setOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t('add_hospital')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NearbyHospitals;
