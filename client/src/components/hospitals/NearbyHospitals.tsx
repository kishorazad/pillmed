import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { MapPin, Search, Phone, Globe, Clock, Star, Navigation, Filter, Info, FileText, Plus, Stethoscope, Heart, Brain, PenTool, Baby, Hospital, ArrowUpRight, Scale, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Type for hospital data
interface Hospital {
  id: number;
  name: string;
  type: string;
  address: string;
  distance: number; // in kilometers
  rating: number;
  reviews: number;
  openHours: string;
  phone: string;
  website: string;
  latitude: number;
  longitude: number;
  specialties: string[];
  departments: string[];
  facilities: string[];
  emergency: boolean;
  image: string;
  verified: boolean;
}

// Type for doctor data
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  qualification: string;
  experience: number;
  rating: number;
  reviews: number;
  image: string;
  availableToday: boolean;
}

// Sample data for nearby hospitals
const hospitalsData: Hospital[] = [
  {
    id: 1,
    name: "Apollo Hospitals",
    type: "Multi-Specialty",
    address: "Sarita Vihar, Delhi-Mathura Road, New Delhi 110076",
    distance: 1.8,
    rating: 4.7,
    reviews: 1245,
    openHours: "24 Hours",
    phone: "+91-11-7179 1090",
    website: "https://www.apollohospitals.com",
    latitude: 28.5421,
    longitude: 77.2880,
    specialties: ["Cardiology", "Neurology", "Oncology", "Orthopedics", "Gastroenterology"],
    departments: ["Emergency", "ICU", "OPD", "Surgery", "Pharmacy", "Laboratory", "Radiology"],
    facilities: ["Parking", "Cafeteria", "WiFi", "Wheelchair Access", "ATM"],
    emergency: true,
    image: "https://www.apollohospitals.com/wp-content/themes/appollo/assets-v3/images/locations/delhi.jpg",
    verified: true
  },
  {
    id: 2,
    name: "Max Super Speciality Hospital",
    type: "Super-Specialty",
    address: "1, 2, Press Enclave Marg, Saket, New Delhi 110017",
    distance: 2.5,
    rating: 4.6,
    reviews: 1120,
    openHours: "24 Hours",
    phone: "+91-11-2651 5050",
    website: "https://www.maxhealthcare.in",
    latitude: 28.5280,
    longitude: 77.2130,
    specialties: ["Cardiology", "Neuroscience", "Oncology", "Transplants", "Urology"],
    departments: ["Emergency", "ICU", "OPD", "Surgery", "Pharmacy", "Laboratory", "Radiology"],
    facilities: ["Parking", "Cafeteria", "WiFi", "Wheelchair Access", "ATM", "Valet"],
    emergency: true,
    image: "https://www.maxhealthcare.in/img/h-d-saket.jpg",
    verified: true
  },
  {
    id: 3,
    name: "AIIMS Delhi",
    type: "Government",
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029",
    distance: 3.7,
    rating: 4.4,
    reviews: 2650,
    openHours: "24 Hours",
    phone: "+91-11-2658 8500",
    website: "https://www.aiims.edu",
    latitude: 28.5672,
    longitude: 77.2100,
    specialties: ["Cardiology", "Neurology", "Oncology", "Pediatrics", "Orthopedics"],
    departments: ["Emergency", "ICU", "OPD", "Surgery", "Trauma Center", "Laboratory", "Radiology"],
    facilities: ["Parking", "Cafeteria", "Wheelchair Access"],
    emergency: true,
    image: "https://www.aiims.edu/images/slider/aiims_main.jpg",
    verified: true
  },
  {
    id: 4,
    name: "Fortis Hospital",
    type: "Multi-Specialty",
    address: "A Block, Shalimar Bagh, New Delhi 110088",
    distance: 6.2,
    rating: 4.5,
    reviews: 890,
    openHours: "24 Hours",
    phone: "+91-11-7196 6750",
    website: "https://www.fortishealthcare.com",
    latitude: 28.7158,
    longitude: 77.1599,
    specialties: ["Cardiology", "Orthopedics", "Neurology", "Gastroenterology", "Pulmonology"],
    departments: ["Emergency", "ICU", "OPD", "Surgery", "Pharmacy", "Laboratory", "Radiology"],
    facilities: ["Parking", "Cafeteria", "WiFi", "Wheelchair Access", "ATM", "Valet"],
    emergency: true,
    image: "https://www.fortishealthcare.com/hospitals/fortis-hospital-shalimar-bagh-new-delhi/gallery/hospital-building",
    verified: true
  },
  {
    id: 5,
    name: "Indraprastha Apollo Hospital",
    type: "Multi-Specialty",
    address: "Sarita Vihar, Delhi-Mathura Road, New Delhi 110076",
    distance: 8.3,
    rating: 4.8,
    reviews: 1560,
    openHours: "24 Hours",
    phone: "+91-11-7179 1090",
    website: "https://www.apollohospitals.com",
    latitude: 28.5421,
    longitude: 77.2830,
    specialties: ["Cardiology", "Neurology", "Oncology", "Transplants", "Robotics Surgery"],
    departments: ["Emergency", "ICU", "OPD", "Surgery", "Pharmacy", "Laboratory", "Radiology"],
    facilities: ["Parking", "Cafeteria", "WiFi", "Wheelchair Access", "ATM", "Valet", "Prayer Room"],
    emergency: true,
    image: "https://www.apollohospitals.com/wp-content/themes/appollo/assets-v3/images/locations/delhi.jpg",
    verified: true
  },
  {
    id: 6,
    name: "Sir Ganga Ram Hospital",
    type: "Multi-Specialty",
    address: "Rajinder Nagar, New Delhi 110060",
    distance: 10.1,
    rating: 4.5,
    reviews: 1230,
    openHours: "24 Hours",
    phone: "+91-11-2574 7474",
    website: "https://www.sgrh.com",
    latitude: 28.6390,
    longitude: 77.1926,
    specialties: ["Cardiology", "Neurology", "Oncology", "Nephrology", "Gastroenterology"],
    departments: ["Emergency", "ICU", "OPD", "Surgery", "Pharmacy", "Laboratory", "Radiology"],
    facilities: ["Parking", "Cafeteria", "WiFi", "Wheelchair Access"],
    emergency: true,
    image: "https://www.sgrh.com/assets/images/SGRHMainWeb.jpg",
    verified: false
  }
];

// Sample data for doctors
const doctorsData: Doctor[] = [
  {
    id: 101,
    name: "Dr. Rajesh Kumar",
    specialty: "Cardiology",
    qualification: "MD, DM (Cardiology)",
    experience: 18,
    rating: 4.9,
    reviews: 385,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    availableToday: true
  },
  {
    id: 102,
    name: "Dr. Priya Sharma",
    specialty: "Neurology",
    qualification: "MD, DM (Neurology)",
    experience: 15,
    rating: 4.8,
    reviews: 298,
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    availableToday: true
  },
  {
    id: 103,
    name: "Dr. Sanjay Gupta",
    specialty: "Orthopedics",
    qualification: "MS (Ortho), DNB",
    experience: 20,
    rating: 4.7,
    reviews: 412,
    image: "https://randomuser.me/api/portraits/men/67.jpg",
    availableToday: false
  },
  {
    id: 104,
    name: "Dr. Ananya Patel",
    specialty: "Pediatrics",
    qualification: "MD (Pediatrics)",
    experience: 12,
    rating: 4.9,
    reviews: 325,
    image: "https://randomuser.me/api/portraits/women/28.jpg",
    availableToday: true
  },
  {
    id: 105,
    name: "Dr. Vikram Malhotra",
    specialty: "Oncology",
    qualification: "MD, DM (Oncology)",
    experience: 22,
    rating: 4.8,
    reviews: 456,
    image: "https://randomuser.me/api/portraits/men/55.jpg",
    availableToday: true
  }
];

// Star Rating component
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="text-yellow-400">
          {star <= Math.floor(rating) ? "★" : star - 0.5 <= rating ? "★" : "☆"}
        </span>
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
};

// Main component
const NearbyHospitals = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [distance, setDistance] = useState('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  
  // Filter hospitals based on search, specialty and distance
  const filteredHospitals = hospitalsData
    .filter(hospital => 
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(hospital => 
      specialty === 'all' || hospital.specialties.includes(specialty)
    )
    .filter(hospital => {
      if (distance === 'all') return true;
      if (distance === '0-5') return hospital.distance <= 5;
      if (distance === '5-10') return hospital.distance > 5 && hospital.distance <= 10;
      if (distance === '10+') return hospital.distance > 10;
      return true;
    })
    .sort((a, b) => a.distance - b.distance);
  
  // Get user's location using browser geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Unable to get your current location. Please enable location services.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);
  
  // View hospital details
  const handleViewHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setActiveTab('details');
  };
  
  // Format distance
  const formatDistance = (distance: number) => {
    return distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nearby Hospitals</h1>
          <p className="text-gray-500">Find healthcare facilities close to your location</p>
        </div>
        
        {userLocation ? (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <MapPin className="mr-1 h-3 w-3" />
            Location found
          </Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Info className="mr-1 h-3 w-3" />
            {locationError || "Getting your location..."}
          </Badge>
        )}
      </div>
      
      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search hospitals by name or area..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            <SelectItem value="Cardiology">Cardiology</SelectItem>
            <SelectItem value="Neurology">Neurology</SelectItem>
            <SelectItem value="Orthopedics">Orthopedics</SelectItem>
            <SelectItem value="Pediatrics">Pediatrics</SelectItem>
            <SelectItem value="Oncology">Oncology</SelectItem>
            <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={distance} onValueChange={setDistance}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by distance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Distances</SelectItem>
            <SelectItem value="0-5">0-5 km</SelectItem>
            <SelectItem value="5-10">5-10 km</SelectItem>
            <SelectItem value="10+">10+ km</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 sm:w-[400px]">
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        {/* Map View Tab */}
        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospitals Near You</CardTitle>
              <CardDescription>Interactive map showing hospitals in your vicinity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 border rounded-md h-[500px] flex items-center justify-center">
                <div className="text-center p-6">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 max-w-md mx-auto">
                    The interactive map would display hospitals near your location with distance information and routing capabilities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredHospitals.slice(0, 3).map((hospital) => (
              <Card key={hospital.id} className="overflow-hidden">
                <div className="h-40 bg-gray-200 overflow-hidden">
                  <img 
                    src={hospital.image} 
                    alt={hospital.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3053&q=80";
                    }}
                  />
                </div>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">{hospital.name}</h3>
                      <p className="text-sm text-gray-500">{hospital.type}</p>
                    </div>
                    {hospital.verified && (
                      <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="truncate">{hospital.address}</span>
                  </div>
                  <div className="flex items-center text-sm mb-3">
                    <Navigation className="h-4 w-4 mr-1 text-blue-500" />
                    <span className="font-medium">{formatDistance(hospital.distance)} away</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <StarRating rating={hospital.rating} />
                    <Button size="sm" variant="outline" onClick={() => handleViewHospital(hospital)}>
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredHospitals.length > 3 && (
            <div className="text-center">
              <Button variant="outline" onClick={() => setActiveTab('list')}>
                View All Hospitals
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* List View Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Nearby Hospitals</CardTitle>
              <CardDescription>
                {filteredHospitals.length} hospitals found near your location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredHospitals.length > 0 ? (
                  filteredHospitals.map((hospital) => (
                    <div 
                      key={hospital.id} 
                      className="border rounded-lg overflow-hidden flex flex-col sm:flex-row"
                    >
                      <div className="sm:w-48 h-40 sm:h-auto bg-gray-200 flex-shrink-0">
                        <img 
                          src={hospital.image} 
                          alt={hospital.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3053&q=80";
                          }}
                        />
                      </div>
                      <div className="p-4 flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{hospital.name}</h3>
                            <div className="flex items-center">
                              <Badge className="mr-2" variant="outline">{hospital.type}</Badge>
                              {hospital.emergency && (
                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                  24/7 Emergency
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end">
                              <Navigation className="h-4 w-4 mr-1 text-blue-500" />
                              <span className="font-medium">{formatDistance(hospital.distance)}</span>
                            </div>
                            <StarRating rating={hospital.rating} />
                          </div>
                        </div>
                        
                        <div className="flex items-start text-sm text-gray-500 mb-3">
                          <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                          <span>{hospital.address}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {hospital.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50">
                              {specialty}
                            </Badge>
                          ))}
                          {hospital.specialties.length > 3 && (
                            <Badge variant="outline" className="bg-gray-50">
                              +{hospital.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Call</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Globe className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Website</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Info className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Info</span>
                            </div>
                          </div>
                          
                          <Button onClick={() => handleViewHospital(hospital)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Hospital className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900">No hospitals found</h3>
                    <p className="text-gray-500 mt-2">
                      No hospitals match your search criteria. Try adjusting your filters.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Hospital Details Tab */}
        <TabsContent value="details" className="space-y-4">
          {selectedHospital ? (
            <>
              <Card>
                <div className="h-60 sm:h-80 bg-gray-200 relative">
                  <img 
                    src={selectedHospital.image} 
                    alt={selectedHospital.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3053&q=80";
                    }}
                  />
                  <Button 
                    className="absolute top-4 left-4"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('list')}
                  >
                    Back to List
                  </Button>
                  
                  {selectedHospital.verified && (
                    <Badge className="absolute top-4 right-4 bg-blue-500 text-white">
                      Verified Hospital
                    </Badge>
                  )}
                </div>
                
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedHospital.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{selectedHospital.type}</Badge>
                        {selectedHospital.emergency && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            24/7 Emergency
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center justify-end mb-1">
                        <StarRating rating={selectedHospital.rating} />
                        <span className="text-sm text-gray-600 ml-2">
                          ({selectedHospital.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center justify-end text-sm text-blue-600">
                        <Navigation className="h-4 w-4 mr-1" />
                        <span>{formatDistance(selectedHospital.distance)} from your location</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <h3 className="font-medium mb-2">Contact Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{selectedHospital.address}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-gray-700">{selectedHospital.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Globe className="h-5 w-5 text-gray-500 mr-2" />
                            <a 
                              href={selectedHospital.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Visit Website
                            </a>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-gray-700">{selectedHospital.openHours}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Specialties</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedHospital.specialties.map((specialty, index) => (
                            <Badge key={index} className="bg-blue-50 text-blue-800 border-blue-200">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Facilities & Services</h3>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {selectedHospital.departments.map((department, index) => (
                          <div key={index} className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-gray-700">{department}</span>
                          </div>
                        ))}
                      </div>
                      
                      <h3 className="font-medium mb-2">Amenities</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedHospital.facilities.map((facility, index) => (
                          <div key={index} className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-gray-700">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button variant="outline">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Hospital
                  </Button>
                  <Button>
                    <Navigation className="mr-2 h-4 w-4" />
                    Get Directions
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Doctors at this hospital */}
              <Card>
                <CardHeader>
                  <CardTitle>Doctors at {selectedHospital.name}</CardTitle>
                  <CardDescription>Find and book appointments with specialists</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctorsData.slice(0, 4).map((doctor) => (
                      <div key={doctor.id} className="flex items-start gap-4 border rounded-lg p-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={doctor.image} alt={doctor.name} />
                          <AvatarFallback>{doctor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{doctor.name}</h4>
                              <p className="text-sm text-gray-500">{doctor.specialty}</p>
                              <p className="text-xs text-gray-500">{doctor.qualification}</p>
                            </div>
                            {doctor.availableToday ? (
                              <Badge className="bg-green-100 text-green-800">Available Today</Badge>
                            ) : (
                              <Badge variant="outline">Not Available</Badge>
                            )}
                          </div>
                          <div className="flex items-center mt-1 text-sm">
                            <div className="mr-3">
                              <span className="text-gray-500">Experience:</span> {doctor.experience} years
                            </div>
                            <StarRating rating={doctor.rating} />
                          </div>
                          <Button size="sm" className="mt-2">Book Appointment</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <Button variant="outline">View All Doctors</Button>
                </CardFooter>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <Hospital className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-900">No Hospital Selected</h3>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    Please select a hospital from the list or map view to see detailed information.
                  </p>
                  <Button 
                    className="mt-6"
                    onClick={() => setActiveTab('list')}
                  >
                    Browse Hospitals
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Popular Specialties Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Popular Medical Specialties</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Heart className="h-10 w-10 mx-auto mb-3 text-red-500" />
              <h3 className="font-medium">Cardiology</h3>
              <p className="text-sm text-gray-500 mt-1">Heart Care</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Brain className="h-10 w-10 mx-auto mb-3 text-purple-500" />
              <h3 className="font-medium">Neurology</h3>
              <p className="text-sm text-gray-500 mt-1">Brain & Nerves</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <PenTool className="h-10 w-10 mx-auto mb-3 text-blue-500" />
              <h3 className="font-medium">Orthopedics</h3>
              <p className="text-sm text-gray-500 mt-1">Bones & Joints</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Baby className="h-10 w-10 mx-auto mb-3 text-green-500" />
              <h3 className="font-medium">Pediatrics</h3>
              <p className="text-sm text-gray-500 mt-1">Child Care</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Stethoscope className="h-10 w-10 mx-auto mb-3 text-amber-500" />
              <h3 className="font-medium">General</h3>
              <p className="text-sm text-gray-500 mt-1">Primary Care</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Scale className="h-10 w-10 mx-auto mb-3 text-indigo-500" />
              <h3 className="font-medium">Others</h3>
              <p className="text-sm text-gray-500 mt-1">More Specialists</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Health Articles Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Health Articles</h2>
          <Button variant="outline" size="sm">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop" 
                alt="Heart Health" 
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="pt-4">
              <Badge className="mb-2 bg-red-100 text-red-800">Cardiology</Badge>
              <h3 className="font-bold text-lg mb-2">
                Understanding Heart Health: Prevention and Care
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                Learn about the latest advances in cardiovascular health and how to keep your heart in top condition.
              </p>
              <div className="flex justify-between items-center mt-4 text-sm">
                <span className="text-gray-500">Apr 5, 2025</span>
                <Button variant="link" className="p-0 h-auto">Read More</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1581595219315-99faed38a1a7?q=80&w=1974&auto=format&fit=crop" 
                alt="Child Health" 
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="pt-4">
              <Badge className="mb-2 bg-green-100 text-green-800">Pediatrics</Badge>
              <h3 className="font-bold text-lg mb-2">
                Essential Vaccinations for Children in 2025
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                A comprehensive guide to keeping your child protected with the latest vaccination schedules and recommendations.
              </p>
              <div className="flex justify-between items-center mt-4 text-sm">
                <span className="text-gray-500">Apr 3, 2025</span>
                <Button variant="link" className="p-0 h-auto">Read More</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1794&auto=format&fit=crop" 
                alt="Mental Health" 
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="pt-4">
              <Badge className="mb-2 bg-purple-100 text-purple-800">Mental Health</Badge>
              <h3 className="font-bold text-lg mb-2">
                Mindfulness Techniques for Better Mental Health
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                Discover effective strategies to manage stress and improve your mental wellbeing in today's fast-paced world.
              </p>
              <div className="flex justify-between items-center mt-4 text-sm">
                <span className="text-gray-500">Mar 28, 2025</span>
                <Button variant="link" className="p-0 h-auto">Read More</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NearbyHospitals;