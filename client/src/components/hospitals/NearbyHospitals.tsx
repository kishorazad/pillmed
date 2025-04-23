import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { MapPin, Phone, Heart, Upload, Plus, Stethoscope, Sparkles } from 'lucide-react';
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
import MobileGridItem from '@/components/common/MobileGridItem';
import MobileGridContent from '@/components/common/MobileGridContent';
import SliderContainer from '@/components/common/SliderContainer';

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
  const isMobile = useMediaQuery('(max-width: 768px)');
  const preload = usePreload();
  
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
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-6 w-6 text-[#FF8F00]" />
            <h2 className="text-xl md:text-2xl font-bold flex items-center">
              {t('nearby_hospitals')}
              {isMobile && <Sparkles className="h-4 w-4 ml-2 text-yellow-500" />}
            </h2>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 shadow-sm"
              >
                <Plus className="h-4 w-4 text-blue-600" />
                {t('add_hospital')}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center text-[#FF8F00]">
                  <MapPin className="h-5 w-5 mr-2" />
                  {t('add_hospital_information')}
                </DialogTitle>
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
                    className="rounded-lg"
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
                    className="rounded-lg"
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
                    className="rounded-lg"
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
                    className="rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <input 
                    type="checkbox" 
                    id="isEmergency" 
                    name="isEmergency" 
                    checked={newHospital.isEmergency} 
                    onChange={handleCheckboxChange} 
                    className="h-4 w-4 text-red-500"
                  />
                  <Label htmlFor="isEmergency" className="text-red-700">{t('provides_emergency_care')}</Label>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit"
                    className="bg-[#FF8F00] hover:bg-[#FF8F00]/90 rounded-xl"
                  >
                    {t('save')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <p className="text-gray-600 mb-4 max-w-xl">{t('emergency_healthcare_facilities_nearby')}</p>
        
        {/* Hospital slider using our new components */}
        <SliderContainer
          theme="light"
          accentColor="#FF8F00"
          className="mb-6"
        >
          {hospitals.map((hospital) => (
            <Link 
              key={hospital.id} 
              href={`/hospitals/${hospital.id}`}
            >
              <MobileGridItem 
                isHighlighted={hospital.isEmergency}
                accentColor={hospital.isEmergency ? "#EF4444" : "#3B82F6"}
                shadowColor={hospital.isEmergency ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)"}
                hoverEffect="lift"
              >
                <MobileGridContent
                  icon={hospital.isEmergency ? <Heart /> : <MapPin />}
                  title={hospital.name}
                  subtitle={hospital.distance}
                  iconBackground={hospital.isEmergency ? "bg-red-100" : "bg-blue-100"}
                  iconColor={hospital.isEmergency ? "text-red-500" : "text-blue-500"}
                  useGradient={hospital.isEmergency}
                  subtitleColor={hospital.isEmergency ? "text-red-400" : "text-gray-500"}
                />
              </MobileGridItem>
            </Link>
          ))}
        </SliderContainer>
        
        <div className="mt-6 flex justify-center">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl max-w-md text-center shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
            <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-inner mb-3">
              <Upload className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-blue-700">{t('add_local_hospital')}</h3>
            <p className="text-sm text-blue-600/80 mt-2 mb-4">{t('help_community_by_adding')}</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 mx-auto shadow-md hover:shadow-lg transition-all duration-300"
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