import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  MapPin,
  Phone, 
  Star, 
  Building2,
  Users,
  Bed,
  Award,
  Search,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock hospital data - would come from API in production
const hospitalsData = {
  'apollo-hospitals': {
    id: 1,
    name: 'Apollo Hospitals',
    tagline: 'Excellence in Healthcare Since 1983',
    description: 'Apollo Hospitals is a leading multispecialty hospital known for its excellence in medical care, advanced technology, and patient-centered approach. With state-of-the-art facilities and a team of experienced medical professionals, we provide comprehensive healthcare services.',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Apollo_Hospitals_Logo.svg/1200px-Apollo_Hospitals_Logo.svg.png',
    address: {
      street: '21, Greams Lane, Off Greams Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600006',
      country: 'India'
    },
    contact: {
      phone: '+91 44 2829 3333',
      email: 'info@apollohospitals.com',
      website: 'www.apollohospitals.com'
    },
    ratings: {
      overall: 4.5,
      facilities: 4.6,
      cleanliness: 4.7,
      staff: 4.4,
      value: 4.2
    },
    reviewCount: 1250,
    accreditations: [
      'JCI (Joint Commission International)',
      'NABH (National Accreditation Board for Hospitals & Healthcare Providers)',
      'ISO 9001:2015'
    ],
    establishedYear: 1983,
    bedsCount: 700,
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Gastroenterology'],
    doctorCount: 220,
    emergencyServices: true,
    ambulanceService: true,
    distance: 2.5
  },
  'fortis-healthcare': {
    id: 2,
    name: 'Fortis Healthcare',
    tagline: 'Saving & Enriching Lives',
    description: 'Fortis Healthcare is committed to delivering integrated healthcare services with care and compassion. Our team of experienced healthcare professionals ensures personalized care and superior outcomes for all patients.',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Fortis_Healthcare_logo.svg/1200px-Fortis_Healthcare_logo.svg.png',
    address: {
      street: 'Sector 62, Phase-VIII',
      city: 'Mohali',
      state: 'Punjab',
      pincode: '160062',
      country: 'India'
    },
    contact: {
      phone: '+91 172 5096001',
      email: 'info@fortishealthcare.com',
      website: 'www.fortishealthcare.com'
    },
    ratings: {
      overall: 4.3,
      facilities: 4.5,
      cleanliness: 4.6,
      staff: 4.2,
      value: 4.0
    },
    reviewCount: 980,
    accreditations: [
      'JCI (Joint Commission International)',
      'NABH (National Accreditation Board for Hospitals & Healthcare Providers)',
      'ISO 9001:2015'
    ],
    establishedYear: 1996,
    bedsCount: 500,
    specialties: ['Cardiac Sciences', 'Neuro Sciences', 'Orthopedics', 'Oncology', 'Renal Sciences'],
    doctorCount: 180,
    emergencyServices: true,
    ambulanceService: true,
    distance: 3.7
  },
  'max-healthcare': {
    id: 3,
    name: 'Max Healthcare',
    tagline: 'To Our Patients. For Life.',
    description: 'Max Healthcare is one of the leading healthcare service providers in India, offering advanced medical services and technology-driven healthcare solutions. Our expert team is dedicated to providing the highest quality of care to our patients.',
    imageUrl: 'https://images.unsplash.com/photo-1578991624414-276ef23908e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Max_Healthcare_logo.svg/1200px-Max_Healthcare_logo.svg.png',
    address: {
      street: '1, Press Enclave Marg, Saket',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110017',
      country: 'India'
    },
    contact: {
      phone: '+91 11 2651 5050',
      email: 'info@maxhealthcare.com',
      website: 'www.maxhealthcare.in'
    },
    ratings: {
      overall: 4.4,
      facilities: 4.5,
      cleanliness: 4.7,
      staff: 4.3,
      value: 4.1
    },
    reviewCount: 1100,
    accreditations: [
      'JCI (Joint Commission International)',
      'NABH (National Accreditation Board for Hospitals & Healthcare Providers)',
      'ISO 9001:2015'
    ],
    establishedYear: 2000,
    bedsCount: 600,
    specialties: ['Cardiac Sciences', 'Neurosciences', 'Orthopedics', 'Cancer Care', 'Transplants'],
    doctorCount: 200,
    emergencyServices: true,
    ambulanceService: true,
    distance: 1.8
  },
  'aiims': {
    id: 4,
    name: 'All India Institute of Medical Sciences (AIIMS)',
    tagline: 'Excellence in Healthcare, Education and Research',
    description: 'AIIMS is a premier medical institution in India known for its excellence in patient care, education, and research. It provides comprehensive healthcare services and is a center for high-quality medical education and research.',
    imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/84/All_India_Institute_of_Medical_Sciences.svg/1200px-All_India_Institute_of_Medical_Sciences.svg.png',
    address: {
      street: 'Sri Aurobindo Marg, Ansari Nagar',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110029',
      country: 'India'
    },
    contact: {
      phone: '+91 11 2658 8500',
      email: 'info@aiims.edu',
      website: 'www.aiims.edu'
    },
    ratings: {
      overall: 4.6,
      facilities: 4.4,
      cleanliness: 4.3,
      staff: 4.7,
      value: 4.8
    },
    reviewCount: 1500,
    accreditations: [
      'NABH (National Accreditation Board for Hospitals & Healthcare Providers)',
      'ISO 9001:2015'
    ],
    establishedYear: 1956,
    bedsCount: 1200,
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'General Surgery'],
    doctorCount: 500,
    emergencyServices: true,
    ambulanceService: true,
    distance: 4.2
  },
  'medanta': {
    id: 5,
    name: 'Medanta - The Medicity',
    tagline: 'Dedicated to Life',
    description: 'Medanta is a multi-specialty medical institute built on the core values of excellence in medical care, compassion, commitment, and innovation. It combines the best of traditional healing and state-of-the-art technology.',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Medanta-The_Medicity_Logo.svg/1200px-Medanta-The_Medicity_Logo.svg.png',
    address: {
      street: 'Sector 38, Gurgaon',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122001',
      country: 'India'
    },
    contact: {
      phone: '+91 124 4141414',
      email: 'info@medanta.org',
      website: 'www.medanta.org'
    },
    ratings: {
      overall: 4.5,
      facilities: 4.7,
      cleanliness: 4.6,
      staff: 4.4,
      value: 4.3
    },
    reviewCount: 1300,
    accreditations: [
      'JCI (Joint Commission International)',
      'NABH (National Accreditation Board for Hospitals & Healthcare Providers)',
      'ISO 9001:2015'
    ],
    establishedYear: 2009,
    bedsCount: 1250,
    specialties: ['Cardiac Sciences', 'Neurosciences', 'Orthopedics & Joint Replacement', 'Cancer Institute', 'Liver Transplantation'],
    doctorCount: 350,
    emergencyServices: true,
    ambulanceService: true,
    distance: 5.3
  }
};

const HospitalsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<{
    specialty: string;
    sortBy: string;
    emergency: string;
  }>({
    specialty: 'all',
    sortBy: 'distance',
    emergency: 'all'
  });
  
  // Convert the object to an array for filtering and sorting
  const hospitals = Object.entries(hospitalsData).map(([slug, data]) => ({
    slug,
    ...data
  }));
  
  // Filter hospitals based on search term and filters
  const filteredHospitals = hospitals.filter(hospital => {
    // Search term filter
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.address.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Specialty filter
    const matchesSpecialty = filter.specialty === 'all' || 
                           hospital.specialties.some(s => s.toLowerCase() === filter.specialty.toLowerCase());
    
    // Emergency services filter
    const matchesEmergency = filter.emergency === 'all' || 
                           (filter.emergency === 'yes' && hospital.emergencyServices) ||
                           (filter.emergency === 'no' && !hospital.emergencyServices);
    
    return matchesSearch && matchesSpecialty && matchesEmergency;
  });
  
  // Sort hospitals based on selected sort option
  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    switch (filter.sortBy) {
      case 'rating':
        return b.ratings.overall - a.ratings.overall;
      case 'beds':
        return b.bedsCount - a.bedsCount;
      case 'distance':
        return a.distance - b.distance;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
  
  // Get all unique specialties from the hospitals data
  const specialties = Array.from(new Set(
    hospitals.flatMap(hospital => hospital.specialties)
  )).sort();
  
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : i < rating
                ? 'text-yellow-400 fill-yellow-400 opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Hospitals Near You</h1>
        <p className="text-gray-600">Find the best hospitals in your area for quality healthcare services</p>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search hospitals by name, location or services"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Select
              value={filter.specialty}
              onValueChange={(value) => setFilter({...filter, specialty: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty.toLowerCase()}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select
              value={filter.sortBy}
              onValueChange={(value) => setFilter({...filter, sortBy: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance (Nearest)</SelectItem>
                <SelectItem value="rating">Rating (Highest)</SelectItem>
                <SelectItem value="beds">Capacity (Largest)</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-700">Emergency Services:</div>
              <div className="flex space-x-2">
                <Button
                  variant={filter.emergency === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter({...filter, emergency: 'all'})}
                >
                  All
                </Button>
                <Button
                  variant={filter.emergency === 'yes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter({...filter, emergency: 'yes'})}
                >
                  With Emergency
                </Button>
                <Button
                  variant={filter.emergency === 'no' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter({...filter, emergency: 'no'})}
                >
                  Without Emergency
                </Button>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="text-sm text-gray-600">
              {sortedHospitals.length} hospital{sortedHospitals.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </div>
      
      {/* Hospitals List */}
      <div className="space-y-6">
        {sortedHospitals.length > 0 ? (
          sortedHospitals.map(hospital => (
            <Card key={hospital.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-64 h-48 md:h-auto relative">
                  <img
                    src={hospital.imageUrl}
                    alt={hospital.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white p-1 rounded-full">
                    <img
                      src={hospital.logo}
                      alt={`${hospital.name} Logo`}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                </div>
                
                <CardContent className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{hospital.name}</h2>
                      <p className="text-gray-600 text-sm">{hospital.tagline}</p>
                      
                      <div className="flex items-center mt-2 mb-4">
                        {renderRatingStars(hospital.ratings.overall)}
                        <span className="text-sm text-gray-500 ml-2">({hospital.reviewCount} reviews)</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 text-right">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {hospital.distance} km away
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hospital.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="rounded-full">
                        {specialty}
                      </Badge>
                    ))}
                    {hospital.specialties.length > 3 && (
                      <Badge variant="outline" className="rounded-full cursor-default">
                        +{hospital.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{hospital.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-auto">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">{hospital.address.city}, {hospital.address.state}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">{hospital.contact.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Estd. {hospital.establishedYear}</span>
                    </div>
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">{hospital.bedsCount} Beds</span>
                    </div>
                  </div>
                </CardContent>
              </div>
              
              <CardFooter className="border-t px-6 py-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="flex items-center">
                    <div className="flex items-center mr-6">
                      <Users className="h-4 w-4 text-primary mr-1" />
                      <span className="text-sm text-gray-600">{hospital.doctorCount}+ Doctors</span>
                    </div>
                    <div className="flex items-center mr-6">
                      <Award className="h-4 w-4 text-amber-500 mr-1" />
                      <span className="text-sm text-gray-600">{hospital.accreditations.length} Accreditations</span>
                    </div>
                    {hospital.emergencyServices && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        24/7 Emergency
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex justify-start md:justify-end gap-3">
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" /> Contact
                    </Button>
                    <Link href={`/hospitals/${hospital.slug}`}>
                      <Button>View Hospital</Button>
                    </Link>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No hospitals found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find what you're looking for</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setFilter({
                  specialty: 'all',
                  sortBy: 'distance',
                  emergency: 'all'
                });
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Map Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Hospitals on Map</h2>
        <div className="border rounded-lg overflow-hidden h-96">
          {/* Google Maps iframe would go here - using a placeholder */}
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center p-4">
              <MapPin className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Hospital Map View</h3>
              <p className="text-sm text-gray-600 mb-4">Map will display nearby hospitals based on your location</p>
              <Button>
                Enable Location
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Note: To use Google Maps, you would need to add a Google Maps API key.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call-to-Action */}
      <div className="mt-12 bg-primary/10 rounded-lg p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Need Immediate Medical Assistance?</h2>
          <p className="text-gray-600 mb-6">
            Our ambulance services are available 24/7. In case of emergency, contact the nearest hospital or call our emergency helpline.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-red-600 hover:bg-red-700">
              Call Emergency Helpline
            </Button>
            <Button variant="outline">
              View Emergency Services
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalsList;