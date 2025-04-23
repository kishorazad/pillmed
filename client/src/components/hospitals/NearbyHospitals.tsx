import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { MapPin, Phone, Heart, Upload, Plus, ArrowRightIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Link } from 'wouter';
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
import { usePreload } from '@/hooks/use-preload';

interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  distance: string;
  specialties: string[];
  isEmergency: boolean;
}

const NearbyHospitals: React.FC = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const preload = usePreload();
  
  // Check if scroll buttons should be shown
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      setShowLeftArrow(scrollContainerRef.current.scrollLeft > 10);
      setShowRightArrow(scrollContainerRef.current.scrollLeft < scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth - 10);
    }
  };
  
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -90, behavior: 'smooth' });
    }
  };
  
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 90, behavior: 'smooth' });
    }
  };
  
  // Preload hospital detail page data
  useEffect(() => {
    // Preload hospitals data
    preload.json('/api/hospitals');
  }, [preload]);
  
  // Sample hospital data - would be replaced with API data
  const hospitals: Hospital[] = [
    {
      id: 1,
      name: 'City General Hospital',
      address: '123 Healthcare Ave, Medical District',
      phone: '1800-123-4567',
      distance: '2.4 km',
      specialties: ['Emergency Care', 'Cardiology', 'Neurology'],
      isEmergency: true
    },
    {
      id: 2,
      name: 'Apollo Healthcare',
      address: '456 Wellness Blvd, Health Park',
      phone: '1800-765-4321',
      distance: '3.8 km',
      specialties: ['Orthopedics', 'Pediatrics', 'General Surgery'],
      isEmergency: true
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
          className="flex overflow-x-auto no-scrollbar gap-4 pb-4"
          onScroll={checkScrollButtons}
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {hospitals.map((hospital) => (
            <Link 
              key={hospital.id} 
              href={`/hospitals/${hospital.id}`}
            >
              <div 
                className={`flex-none w-[90px] h-[118px] flex flex-col items-center justify-center ${hospital.isEmergency ? 'bg-red-50 border-l-4 border-red-500' : 'bg-white'} rounded-lg shadow-sm p-2 transition-shadow hover:shadow-md`}
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="w-[88.4px] h-[72.33px] flex items-center justify-center">
                  {hospital.isEmergency ? (
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                      <Heart className="h-7 w-7 text-red-500" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-7 w-7 text-blue-500" />
                    </div>
                  )}
                </div>
                <h4 className="text-xs font-medium text-center line-clamp-1 mt-1">
                  {hospital.name}
                </h4>
                <span className="text-[10px] text-gray-500">{hospital.distance}</span>
              </div>
            </Link>
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