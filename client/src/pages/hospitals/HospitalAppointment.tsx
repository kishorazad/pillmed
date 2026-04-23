import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Home, ChevronRight, AlertCircle, Building, MapPin, Phone, Clock, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import AppointmentBooking from '@/components/hospitals/AppointmentBooking';
import { useStore } from '@/lib/store';
import OptimizedImage from '@/components/admin/OptimizedImage';

// Types
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

const HospitalAppointmentPage = () => {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { setLoading } = useStore();
  
  // Get hospital ID from URL params
  const hospitalId = params.id ? parseInt(params.id) : undefined;
  
  // Fetch hospital details
  const { 
    data: hospital, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [`/api/hospitals/${hospitalId}`],
    queryFn: async () => {
      if (!hospitalId) throw new Error('Hospital ID is required');
      
      try {
        // Simulate API delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // For development purposes, returning mock data
        // In production, this would be an API call
        return getMockHospital(hospitalId);
      } catch (err) {
        console.error('Error fetching hospital details:', err);
        throw err;
      }
    },
    enabled: !!hospitalId,
  });
  
  // Mock hospital data for development
  const getMockHospital = (id: number): Hospital => {
    return {
      id,
      name: "Apollo Hospitals",
      description: "Apollo Hospitals is a leading multi-specialty hospital with state-of-the-art facilities and experienced healthcare professionals. We provide comprehensive healthcare services including preventive health check-ups, diagnostics, and advanced treatments across multiple specialties.",
      address: "Plot No.1, Sector 26, Rohini Institutional Area, New Delhi, 110085",
      phone: "+91 11 2783 5555",
      website: "https://www.apollohospitals.com",
      email: "info@apollohospitals.com",
      openHours: {
        "Monday": "24 hours",
        "Tuesday": "24 hours",
        "Wednesday": "24 hours",
        "Thursday": "24 hours",
        "Friday": "24 hours",
        "Saturday": "24 hours",
        "Sunday": "24 hours"
      },
      distance: "2.5 km",
      specialties: [
        "Cardiology",
        "Neurology",
        "Orthopedics",
        "Oncology",
        "Gastroenterology",
        "Pediatrics",
        "Gynecology",
        "Dermatology",
        "ENT"
      ],
      facilities: [
        "Emergency Services",
        "ICU",
        "Operation Theatres",
        "Pharmacy",
        "Laboratory",
        "Radiology",
        "Blood Bank",
        "Ambulance Services",
        "Cafeteria"
      ],
      isEmergency: true,
      images: [
        "https://via.placeholder.com/800x400?text=Apollo+Hospitals+1",
        "https://via.placeholder.com/800x400?text=Apollo+Hospitals+2",
        "https://via.placeholder.com/800x400?text=Apollo+Hospitals+3"
      ],
      coordinates: {
        lat: 28.7197,
        lng: 77.1269
      },
      ratings: {
        overall: 4.2,
        cleanliness: 4.5,
        staffBehavior: 4.0,
        facilities: 4.3,
        waitTime: 3.8
      },
      doctors: [
        {
          id: 101,
          name: "Dr. Rajesh Kumar",
          specialty: "Cardiology",
          image: "https://randomuser.me/api/portraits/men/1.jpg"
        },
        {
          id: 102,
          name: "Dr. Priya Sharma",
          specialty: "Neurology",
          image: "https://randomuser.me/api/portraits/women/2.jpg"
        },
        {
          id: 103,
          name: "Dr. Amit Patel",
          specialty: "Orthopedics",
          image: "https://randomuser.me/api/portraits/men/3.jpg"
        }
      ],
      offers: [
        {
          title: "Free OPD Consultation",
          description: "Get a free OPD consultation with our specialists this week. Valid for new patients only.",
          validUntil: "April 30, 2025",
          isHighlighted: true
        },
        {
          title: "50% Off on Full Body Checkup",
          description: "Comprehensive full body checkup including 60+ tests at half price.",
          validUntil: "May 15, 2025"
        },
        {
          title: "Health Card Membership",
          description: "Join our health card program and get discounts on all services throughout the year.",
          isHighlighted: false
        },
        {
          title: "Senior Citizen Benefits",
          description: "Special discounts and priority appointment scheduling for senior citizens.",
          isHighlighted: false
        }
      ]
    };
  };
  
  // Set loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);
  
  // Handle back navigation
  const handleBack = () => {
    setLocation('/hospitals');
  };
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load hospital details. Please try again later.</AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Hospitals
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home className="h-4 w-4 mr-1" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/hospitals">Hospitals</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/hospitals/${hospitalId}`}>
              {isLoading ? <Skeleton className="h-4 w-32" /> : hospital?.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/hospitals/${hospitalId}/appointment`}>Book Appointment</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Back Button */}
      <Button onClick={() => setLocation(`/hospitals/${hospitalId}`)} variant="ghost" className="mb-4 gap-2">
        <ChevronLeft className="h-4 w-4" />
        Back to Hospital
      </Button>
      
      {/* Hospital Header */}
      <div className="mb-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
            <h2 className="text-xl font-medium text-gray-700">{hospital?.name}</h2>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Hospital Info */}
        <div className="md:col-span-1">
          {isLoading ? (
            <Skeleton className="h-[400px] w-full rounded-lg" />
          ) : hospital ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Hospital Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video overflow-hidden rounded-lg">
                  <OptimizedImage
                    src={hospital.images[0]}
                    alt={hospital.name}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Building className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <p className="text-sm">{hospital.name}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <p className="text-sm">{hospital.address}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <p className="text-sm">{hospital.phone}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium mb-1">Opening Hours</p>
                      <div className="space-y-1 text-sm">
                        {Object.entries(hospital.openHours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span>{day}</span>
                            <span>{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
        
        {/* Right Column: Appointment Form */}
        <div className="md:col-span-2">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[500px] w-full rounded-lg" />
            </div>
          ) : hospital ? (
            <AppointmentBooking hospital={hospital} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default HospitalAppointmentPage;