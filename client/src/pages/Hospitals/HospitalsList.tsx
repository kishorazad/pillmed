import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Heart, Search, Filter } from 'lucide-react';
import { Link } from 'wouter';
import { useLanguage } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  distance?: string;
  specialties: string[];
  isEmergency: boolean;
  rating?: number;
  imageUrl?: string;
}

// Predefined list of specialties for filtering
const allSpecialties = [
  'Emergency Care',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Oncology',
  'Gynecology',
  'Dermatology',
  'Ophthalmology',
  'General Surgery',
  'Dental',
  'ENT',
  'Psychiatry'
];

// Sample data
const allHospitals: Hospital[] = [
  {
    id: 1,
    name: 'City General Hospital',
    address: '123 Healthcare Ave, Medical District',
    phone: '1800-123-4567',
    distance: '2.4 km',
    specialties: ['Emergency Care', 'Cardiology', 'Neurology'],
    isEmergency: true,
    rating: 4.5,
    imageUrl: '/hospital-1.jpg'
  },
  {
    id: 2,
    name: 'Apollo Healthcare',
    address: '456 Wellness Blvd, Health Park',
    phone: '1800-765-4321',
    distance: '3.8 km',
    specialties: ['Orthopedics', 'Pediatrics', 'General Surgery'],
    isEmergency: true,
    rating: 4.3,
    imageUrl: '/hospital-2.jpg'
  },
  {
    id: 3,
    name: 'Medanta Clinic',
    address: '789 Doctor Lane, Care Center',
    phone: '1800-555-1212',
    distance: '5.2 km',
    specialties: ['Family Medicine', 'Dermatology', 'Internal Medicine'],
    isEmergency: false,
    rating: 4.1,
    imageUrl: '/hospital-3.jpg'
  },
  {
    id: 4,
    name: 'City Health Centre',
    address: '101 Medical Plaza, West District',
    phone: '1800-987-6543',
    distance: '6.7 km',
    specialties: ['Gynecology', 'Pediatrics', 'Dentistry'],
    isEmergency: false,
    rating: 3.9,
    imageUrl: '/hospital-4.jpg'
  },
  {
    id: 5,
    name: 'LifeCare Emergency',
    address: '202 Emergency Drive, South Region',
    phone: '1800-911-0101',
    distance: '4.3 km',
    specialties: ['Trauma Care', 'Critical Care', 'Emergency Medicine'],
    isEmergency: true,
    rating: 4.7,
    imageUrl: '/hospital-5.jpg'
  },
  {
    id: 6,
    name: 'Max Super Specialty',
    address: '303 Specialist Road, North Zone',
    phone: '1800-444-5555',
    distance: '7.1 km',
    specialties: ['Oncology', 'Cardiology', 'Neurosurgery', 'Transplant'],
    isEmergency: true,
    rating: 4.8,
    imageUrl: '/hospital-6.jpg'
  },
  {
    id: 7,
    name: 'Community Health Clinic',
    address: '404 Community Lane, East Suburb',
    phone: '1800-222-3333',
    distance: '3.6 km',
    specialties: ['General Medicine', 'Preventive Care', 'Vaccines'],
    isEmergency: false,
    rating: 3.7,
    imageUrl: '/hospital-7.jpg'
  },
  {
    id: 8,
    name: 'Children\'s Medical Center',
    address: '505 Kid\'s Way, Family Zone',
    phone: '1800-777-8888',
    distance: '8.3 km',
    specialties: ['Pediatrics', 'Child Psychology', 'Neonatology'],
    isEmergency: true,
    rating: 4.6,
    imageUrl: '/hospital-8.jpg'
  }
];

const HospitalsList: React.FC = () => {
  const { t } = useLanguage();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setHospitals(allHospitals);
      setLoading(false);
    }, 800);
  }, []);

  // Filter and sort hospitals
  const filteredHospitals = hospitals
    .filter(hospital => {
      // Search term filter
      const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hospital.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Specialty filter
      const matchesSpecialty = selectedSpecialties.length === 0 || 
                              selectedSpecialties.some(specialty => 
                                hospital.specialties.includes(specialty));
      
      // Emergency filter
      const matchesEmergency = !showEmergencyOnly || hospital.isEmergency;
      
      return matchesSearch && matchesSpecialty && matchesEmergency;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') {
        return parseFloat(a.distance || '0') - parseFloat(b.distance || '0');
      } else if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  // Handle specialty filter changes
  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty) 
        : [...prev, specialty]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialties([]);
    setShowEmergencyOnly(false);
    setSortBy('distance');
  };

  // Render star rating
  const renderStarRating = (rating: number = 0) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-sm ${star <= Math.round(rating) ? 'text-yellow-500' : 'text-gray-300'}`}>
            ★
          </span>
        ))}
        <span className="ml-1 text-xs text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('all_hospitals')}</h1>
          <p className="text-gray-600">{t('find_hospitals_near_you')}</p>
        </div>
        
        <div>
          {/* Filter button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center"
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                {t('filter')}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t('filter_hospitals')}</SheetTitle>
                <SheetDescription>
                  {t('adjust_filters_to_find')}
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-4 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">{t('sort_by')}</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('sort_by')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">{t('distance')}</SelectItem>
                      <SelectItem value="rating">{t('rating')}</SelectItem>
                      <SelectItem value="name">{t('name')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      id="emergency-only" 
                      checked={showEmergencyOnly}
                      onCheckedChange={(checked) => setShowEmergencyOnly(checked as boolean)}
                    />
                    <Label htmlFor="emergency-only">{t('emergency_care_only')}</Label>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-3">{t('specialties')}</h3>
                  <div className="space-y-2">
                    {allSpecialties.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`specialty-${specialty}`}
                          checked={selectedSpecialties.includes(specialty)}
                          onCheckedChange={() => toggleSpecialty(specialty)}
                        />
                        <Label htmlFor={`specialty-${specialty}`}>{specialty}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button onClick={resetFilters} variant="outline" className="w-full mt-4">
                  {t('reset_filters')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder={t('search_hospitals')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Filter pills - show active filters */}
      {(selectedSpecialties.length > 0 || showEmergencyOnly) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {showEmergencyOnly && (
            <div className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              {t('emergency_care')}
              <button 
                className="ml-2 hover:text-red-900" 
                onClick={() => setShowEmergencyOnly(false)}
              >×</button>
            </div>
          )}
          
          {selectedSpecialties.map(specialty => (
            <div key={specialty} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center">
              {specialty}
              <button 
                className="ml-2 hover:text-blue-900" 
                onClick={() => toggleSpecialty(specialty)}
              >×</button>
            </div>
          ))}
          
          <button 
            className="text-gray-600 text-xs hover:text-gray-900 underline"
            onClick={resetFilters}
          >
            {t('clear_all')}
          </button>
        </div>
      )}
      
      {/* Results count */}
      <p className="text-sm text-gray-600 mb-6">
        {t('showing')} {filteredHospitals.length} {t('of')} {hospitals.length} {t('hospitals')}
      </p>
      
      {/* Hospital list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white shadow-sm rounded-lg overflow-hidden animate-pulse">
              <div className="bg-gray-200 h-48 w-full"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredHospitals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{t('no_hospitals_matching')}</p>
              <Button variant="outline" onClick={resetFilters}>
                {t('reset_filters')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHospitals.map((hospital) => (
                <Link key={hospital.id} href={`/hospitals/${hospital.id}`}>
                  <a className="block bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden cursor-pointer">
                    <div className="relative h-48 w-full bg-gray-100">
                      <img 
                        src={hospital.imageUrl || 'attached_assets/hospital-placeholder.jpg'} 
                        alt={hospital.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'attached_assets/hospital-placeholder.jpg';
                        }}
                      />
                      {hospital.isEmergency && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {t('emergency')}
                        </div>
                      )}
                      {hospital.distance && (
                        <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                          {hospital.distance}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{hospital.name}</h3>
                      
                      {hospital.rating && (
                        <div className="mb-2">
                          {renderStarRating(hospital.rating)}
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {hospital.address}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {hospital.specialties.slice(0, 3).map((specialty, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {specialty}
                          </span>
                        ))}
                        {hospital.specialties.length > 3 && (
                          <span className="text-xs text-gray-500">+{hospital.specialties.length - 3} {t('more')}</span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {hospital.phone}
                        </span>
                        <span className="text-primary text-sm font-medium hover:underline">
                          {t('view_details')} →
                        </span>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HospitalsList;
