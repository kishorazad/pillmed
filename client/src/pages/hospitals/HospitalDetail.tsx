import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Phone, Heart, Clock, Building, Calendar, Users, MapIcon, Share2 } from 'lucide-react';
import { useRoute } from 'wouter';
import { useLanguage } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Hospital type for detailed view
interface Hospital {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  openHours: {
    [key: string]: string;
  };
  distance: string;
  specialties: string[];
  facilities: string[];
  isEmergency: boolean;
  images: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  ratings: {
    overall: number;
    cleanliness: number;
    staffBehavior: number;
    facilities: number;
    waitTime: number;
  };
  doctors: {
    id: number;
    name: string;
    specialty: string;
    image: string;
  }[];
  offers?: {
    title: string;
    description: string;
    validUntil?: string;
    isHighlighted?: boolean;
  }[];
}

// Sample detailed hospital data (would come from API)
const hospitalData: Record<string, Hospital> = {
  "1": {
    id: 1,
    name: 'City General Hospital',
    description: 'A premier multi-specialty hospital offering advanced medical care and emergency services. The hospital is equipped with state-of-the-art facilities and staffed by expert healthcare professionals dedicated to providing the best patient care.',
    address: '123 Healthcare Ave, Medical District',
    phone: '1800-123-4567',
    website: 'www.citygeneralhospital.com',
    email: 'info@citygeneralhospital.com',
    openHours: {
      'Monday': '9:00 AM - 9:00 PM',
      'Tuesday': '9:00 AM - 9:00 PM',
      'Wednesday': '9:00 AM - 9:00 PM',
      'Thursday': '9:00 AM - 9:00 PM',
      'Friday': '9:00 AM - 9:00 PM',
      'Saturday': '9:00 AM - 5:00 PM',
      'Sunday': '10:00 AM - 2:00 PM'
    },
    distance: '2.4 km',
    specialties: ['Emergency Care', 'Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics'],
    facilities: ['24/7 Emergency', 'ICU', 'Blood Bank', 'Pharmacy', 'Ambulance Service', 'Cafeteria', 'Parking'],
    isEmergency: true,
    images: ['/hospital-1.jpg', '/hospital-1-2.jpg', '/hospital-1-3.jpg'],
    coordinates: {
      lat: 28.6139,
      lng: 77.2090
    },
    ratings: {
      overall: 4.5,
      cleanliness: 4.7,
      staffBehavior: 4.3,
      facilities: 4.6,
      waitTime: 3.9
    },
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
      },
      {
        title: 'Senior Citizen Benefits',
        description: 'Special priority and discounts for senior citizens',
        isHighlighted: true
      }
    ],
    doctors: [
      {
        id: 101,
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        image: '/doctor-101.jpg'
      },
      {
        id: 102,
        name: 'Dr. Michael Chen',
        specialty: 'Neurology',
        image: '/doctor-102.jpg'
      },
      {
        id: 103,
        name: 'Dr. Emily Rodriguez',
        specialty: 'Pediatrics',
        image: '/doctor-103.jpg'
      }
    ]
  },
  "2": {
    id: 2,
    name: 'Apollo Healthcare',
    description: 'Apollo Healthcare is a modern hospital focused on providing personalized care with the latest medical technologies. Known for its excellent surgical facilities and specialized treatment options.',
    address: '456 Wellness Blvd, Health Park',
    phone: '1800-765-4321',
    website: 'www.apollohealthcare.com',
    email: 'contact@apollohealthcare.com',
    openHours: {
      'Monday': '8:00 AM - 8:00 PM',
      'Tuesday': '8:00 AM - 8:00 PM',
      'Wednesday': '8:00 AM - 8:00 PM',
      'Thursday': '8:00 AM - 8:00 PM',
      'Friday': '8:00 AM - 8:00 PM',
      'Saturday': '8:00 AM - 6:00 PM',
      'Sunday': '9:00 AM - 1:00 PM'
    },
    distance: '3.8 km',
    specialties: ['Orthopedics', 'Pediatrics', 'General Surgery', 'Dermatology', 'Ophthalmology'],
    facilities: ['24/7 Emergency', 'Diagnostic Center', 'Pharmacy', 'Ambulance Service', 'Cafeteria'],
    isEmergency: true,
    images: ['/hospital-2.jpg', '/hospital-2-2.jpg'],
    coordinates: {
      lat: 28.6329,
      lng: 77.2195
    },
    ratings: {
      overall: 4.3,
      cleanliness: 4.5,
      staffBehavior: 4.1,
      facilities: 4.4,
      waitTime: 3.7
    },
    offers: [
      {
        title: 'Free OPD Week',
        description: 'Complimentary OPD consultations for all specialties from May 10-17',
        validUntil: '2025-05-17',
        isHighlighted: true
      },
      {
        title: '15% Discount on Lab Tests',
        description: 'Special discount on all diagnostic lab tests for new patients',
        validUntil: '2025-06-30'
      },
      {
        title: 'Health Card Benefits',
        description: 'Free health card with special year-round benefits',
        isHighlighted: true
      }
    ],
    doctors: [
      {
        id: 201,
        name: 'Dr. John Wilson',
        specialty: 'Orthopedics',
        image: '/doctor-201.jpg'
      },
      {
        id: 202,
        name: 'Dr. Lisa Park',
        specialty: 'Pediatrics',
        image: '/doctor-202.jpg'
      }
    ]
  }
};

// For hospitals that don't have data yet
const defaultHospital: Hospital = {
  id: 0,
  name: 'Hospital Information',
  description: 'Information about this hospital is currently being updated. Please check back later for more details.',
  address: 'Address not available',
  phone: 'Phone not available',
  website: '',
  email: '',
  openHours: {
    'Monday to Friday': 'Hours not available',
    'Saturday to Sunday': 'Hours not available'
  },
  distance: '',
  specialties: [],
  facilities: [],
  isEmergency: false,
  images: ['/hospital-placeholder.jpg'],
  coordinates: {
    lat: 28.6139,
    lng: 77.2090
  },
  ratings: {
    overall: 0,
    cleanliness: 0,
    staffBehavior: 0,
    facilities: 0,
    waitTime: 0
  },
  doctors: []
};

const HospitalDetail: React.FC = () => {
  const { t } = useLanguage();
  const [match, params] = useRoute<{ id: string }>('/hospitals/:id');
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    // Simulating API call with a minimal delay (optimized for better user experience)
    setLoading(true);
    
    const fetchHospitalData = async () => {
      try {
        // In a real app, this would be an API call using the ID
        // await fetch(`/api/hospitals/${params?.id}`)
        
        // For demo, use the static data with a very short timeout to optimize loading
        setTimeout(() => {
          if (params?.id && hospitalData[params.id]) {
            setHospital(hospitalData[params.id]);
          } else {
            // If no data for this ID, use the default hospital with the ID from the URL
            setHospital({
              ...defaultHospital,
              id: parseInt(params?.id || '0')
            });
          }
          setLoading(false);
        }, 300); // Reduced loading time from 800ms to 300ms for better user experience
      } catch (error) {
        console.error('Error fetching hospital data:', error);
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, [params?.id]);

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-xl ${star <= Math.round(rating) ? 'text-yellow-500' : 'text-gray-300'}`}>
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <Skeleton className="h-[300px] w-full rounded-xl mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[200px] rounded-lg" />
            <Skeleton className="h-[200px] rounded-lg" />
            <Skeleton className="h-[200px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Hospital Not Found</h2>
          <p className="text-gray-600 mb-6">The hospital you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button 
        variant="outline" 
        className="mb-6 flex items-center"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('back')}
      </Button>
      
      {/* Hero image */}
      <div className="relative h-[250px] md:h-[400px] rounded-xl overflow-hidden mb-6">
        <img 
          src={hospital.images[0]} 
          alt={hospital.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/hospital-placeholder.jpg';
          }}
        />
        
        {hospital.isEmergency && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
            <Heart className="h-4 w-4 mr-1" />
            {t('emergency_services')}
          </div>
        )}
      </div>
      
      {/* Hospital name and basic info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{hospital.name}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {hospital.specialties.map((specialty, index) => (
            <Badge key={index} variant="secondary" className="rounded-full">
              {specialty}
            </Badge>
          ))}
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-gray-500" />
            <span>{hospital.address}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-5 w-5 mr-2 text-gray-500" />
            <a href={`tel:${hospital.phone.replace(/[^\d]/g, '')}`} className="hover:text-primary">
              {hospital.phone}
            </a>
          </div>
        </div>
      </div>
      
      {/* Quick action buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Button 
          variant="outline" 
          className="flex items-center justify-center py-6"
          onClick={() => {
            if (hospital.coordinates) {
              window.open(`https://maps.google.com/?q=${hospital.coordinates.lat},${hospital.coordinates.lng}`, '_blank');
            }
          }}
        >
          <MapIcon className="h-5 w-5 mr-2" />
          {t('get_directions')}
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-center py-6"
          onClick={() => {
            window.location.href = `tel:${hospital.phone.replace(/[^\d]/g, '')}`;
          }}
        >
          <Phone className="h-5 w-5 mr-2" />
          {t('call_now')}
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-center py-6"
          onClick={() => {
            if (hospital.doctors.length > 0) {
              window.location.href = `/doctors?hospital=${hospital.id}`;
            }
          }}
        >
          <Users className="h-5 w-5 mr-2" />
          {t('find_doctors')}
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-center py-6"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: hospital.name,
                text: `Check out ${hospital.name}`,
                url: window.location.href
              });
            }
          }}
        >
          <Share2 className="h-5 w-5 mr-2" />
          {t('share')}
        </Button>
      </div>
      
      {/* Tabs for detailed information */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex mb-6">
          <TabsTrigger value="about">{t('about')}</TabsTrigger>
          <TabsTrigger value="facilities">{t('facilities')}</TabsTrigger>
          <TabsTrigger value="doctors">{t('doctors')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold mb-3">{t('about_hospital')}</h3>
              <p className="text-gray-700 mb-6">{hospital.description}</p>
              
              <h3 className="text-xl font-semibold mb-3">{t('contact_information')}</h3>
              <div className="space-y-2 mb-6">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('address')}</p>
                    <p className="text-gray-600">{hospital.address}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('phone')}</p>
                    <p className="text-gray-600">{hospital.phone}</p>
                  </div>
                </div>
                {hospital.email && (
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium">{t('email')}</p>
                      <p className="text-gray-600">{hospital.email}</p>
                    </div>
                  </div>
                )}
                {hospital.website && (
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <div>
                      <p className="font-medium">{t('website')}</p>
                      <a href={`https://${hospital.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {hospital.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{t('specialties')}</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {hospital.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline" className="rounded-md py-1.5">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-1">
              {/* Hospital offers section */}
              {hospital.offers && hospital.offers.length > 0 && (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 118 0v7M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v12a2 2 0 002 2h10a2 2 0 002-2V8" />
                      </svg>
                      Special Offers
                    </h3>
                    <div className="space-y-4">
                      {hospital.offers.map((offer, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${offer.isHighlighted ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                        >
                          <h4 className={`font-semibold ${offer.isHighlighted ? 'text-primary' : 'text-gray-900'}`}>
                            {offer.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                          {offer.validUntil && (
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Opening hours card */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    {t('opening_hours')}
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(hospital.openHours).map(([day, hours], index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="font-medium">{day}</span>
                        <span className="text-gray-600">{hours}</span>
                      </div>
                    ))}
                  </div>
                  
                  {hospital.ratings.overall > 0 && (
                    <>
                      <hr className="my-6" />
                      <h3 className="text-xl font-semibold mb-4">{t('ratings')}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>{t('overall')}</span>
                          {renderStars(hospital.ratings.overall)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>{t('cleanliness')}</span>
                          {renderStars(hospital.ratings.cleanliness)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>{t('staff_behavior')}</span>
                          {renderStars(hospital.ratings.staffBehavior)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>{t('facilities')}</span>
                          {renderStars(hospital.ratings.facilities)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>{t('wait_time')}</span>
                          {renderStars(hospital.ratings.waitTime)}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="facilities" className="mt-4">
          <h3 className="text-xl font-semibold mb-4">{t('available_facilities')}</h3>
          {hospital.facilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hospital.facilities.map((facility, index) => (
                <Card key={index} className="bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center">
                    <Building className="h-5 w-5 text-primary mr-3" />
                    <span>{facility}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{t('no_facilities_listed')}</p>
          )}
          
          {hospital.images.length > 1 && (
            <>
              <h3 className="text-xl font-semibold mt-8 mb-4">{t('hospital_images')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hospital.images.map((image, index) => (
                  <div key={index} className="rounded-lg overflow-hidden aspect-video">
                    <img 
                      src={image} 
                      alt={`${hospital.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/hospital-placeholder.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="doctors" className="mt-4">
          <h3 className="text-xl font-semibold mb-4">{t('doctors_at_hospital')}</h3>
          {hospital.doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospital.doctors.map((doctor) => (
                <Card key={doctor.id} className="bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="h-[120px] w-full sm:w-[120px] overflow-hidden">
                        <img 
                          src={doctor.image} 
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/doctor-placeholder.jpg';
                          }}
                        />
                      </div>
                      <div className="p-4 flex-1">
                        <h4 className="font-semibold text-lg mb-1">{doctor.name}</h4>
                        <p className="text-gray-600 text-sm mb-3">{doctor.specialty}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          onClick={() => window.location.href = `/doctors/${doctor.id}`}
                        >
                          {t('view_profile')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">{t('no_doctors_listed')}</p>
              <Button variant="outline" onClick={() => setActiveTab('about')}>
                {t('view_hospital_info')}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* No Special offers section */}
    </div>
  );
};

export default HospitalDetail;