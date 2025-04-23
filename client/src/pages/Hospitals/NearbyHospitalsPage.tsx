import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Search } from 'lucide-react';
import { useLanguage } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';

interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  distance: string;
  specialties: string[];
  isEmergency: boolean;
}

const NearbyHospitalsPage: React.FC = () => {
  const { t } = useLanguage();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [, navigate] = useLocation();

  // Sample hospital data - would be replaced with API data
  const sampleHospitals: Hospital[] = [
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

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setHospitals(sampleHospitals);
      setLoading(false);
    }, 800);
  }, []);

  // Filter hospitals based on search term
  const filteredHospitals = hospitals.filter(hospital => 
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm"
          className="mr-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('back_to_home')}
        </Button>
        <h1 className="text-2xl font-bold">{t('nearby_hospitals')}</h1>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          {t('view_all_nearby_hospitals')}
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={t('search_hospitals')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {t('showing')} {filteredHospitals.length} {t('nearby_results')}
        </p>
        <Button 
          variant="outline"
          onClick={() => navigate('/hospitals')}
        >
          {t('view_all_hospitals')}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-lg shadow-sm p-6 animate-pulse">
              <div className="bg-gray-200 h-4 w-2/3 mb-3 rounded"></div>
              <div className="bg-gray-200 h-3 w-full mb-2 rounded"></div>
              <div className="bg-gray-200 h-3 w-3/4 mb-4 rounded"></div>
              <div className="flex gap-2 mb-4">
                <div className="bg-gray-200 h-6 w-16 rounded"></div>
                <div className="bg-gray-200 h-6 w-16 rounded"></div>
              </div>
              <div className="bg-gray-200 h-8 w-full rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map(hospital => (
            <div 
              key={hospital.id} 
              className={`rounded-lg shadow-sm p-6 ${hospital.isEmergency ? 'bg-red-50 border-l-4 border-red-500' : 'bg-white'} cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => navigate(`/hospitals/${hospital.id}`)}
            >
              <h3 className="text-lg font-semibold mb-2">{hospital.name}</h3>
              <p className="text-sm text-gray-600 mb-1 flex items-start">
                <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{hospital.address}</span>
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <span className="inline-flex items-center bg-gray-100 px-2 py-0.5 rounded text-xs">
                  {hospital.distance} away
                </span>
              </p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {hospital.specialties.slice(0, 3).map((specialty, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {specialty}
                  </span>
                ))}
                {hospital.specialties.length > 3 && (
                  <span className="text-xs text-gray-500">+{hospital.specialties.length - 3} {t('more')}</span>
                )}
              </div>
              
              <div className="mt-auto">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/hospitals/${hospital.id}`);
                  }}
                >
                  {t('view_details')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{t('no_hospitals_matching')}</p>
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm('')}
          >
            {t('clear_search')}
          </Button>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">{t('not_finding_hospital')}</p>
        <Button onClick={() => navigate('/hospitals')}>
          {t('browse_all_hospitals')}
        </Button>
      </div>
    </div>
  );
};

export default NearbyHospitalsPage;