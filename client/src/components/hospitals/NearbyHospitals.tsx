import React, { useState } from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { MapPin, Phone, Heart, Upload, Plus } from 'lucide-react';
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
}

const NearbyHospitals: React.FC = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  
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
        
        <p className="text-gray-600 mb-4">{t('emergency_healthcare_facilities_nearby')}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {hospitals.map((hospital) => (
            <div 
              key={hospital.id} 
              className={`rounded-lg shadow-sm p-4 ${hospital.isEmergency ? 'bg-red-50 border-l-4 border-red-500' : 'bg-white'} transition-shadow hover:shadow-md`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{hospital.name}</h3>
                <div className="text-sm text-gray-500 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {hospital.distance}
                </div>
              </div>
              
              {hospital.isEmergency && (
                <div className="inline-flex items-center mt-1 mb-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  <Heart className="h-3 w-3 mr-1" />
                  {t('emergency_care')}
                </div>
              )}
              
              <p className="text-sm text-gray-600 mt-2 mb-1">
                <MapPin className="h-3 w-3 inline mr-1" />
                {hospital.address}
              </p>
              
              <p className="text-sm text-gray-600 mb-3">
                <Phone className="h-3 w-3 inline mr-1" />
                {hospital.phone}
              </p>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {hospital.specialties.map((specialty, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {specialty}
                  </span>
                ))}
              </div>
              
              <div className="mt-3 flex justify-end">
                <a href={`tel:${hospital.phone.replace(/[^\d]/g, '')}`} className="text-primary text-sm font-medium hover:underline">
                  {t('call_now')}
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
            <Dialog>
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
                <form className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">{t('hospital_name')}</Label>
                    <Input id="name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">{t('address')}</Label>
                    <Textarea id="address" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">{t('phone_number')}</Label>
                    <Input id="phone" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="specialties">{t('specialties')}</Label>
                    <Input id="specialties" placeholder={t('comma_separated')} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="emergency" className="h-4 w-4" />
                    <Label htmlFor="emergency">{t('provides_emergency_care')}</Label>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{t('save')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NearbyHospitals;