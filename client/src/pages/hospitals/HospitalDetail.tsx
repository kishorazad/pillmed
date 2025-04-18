import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { 
  MapPin,
  Phone, 
  Mail, 
  Clock, 
  Award,
  Stethoscope,
  Building2,
  CalendarDays,
  Users,
  Bed,
  Ambulance,
  HeartPulse,
  ArrowLeft,
  Star,
  ExternalLink,
  CheckCircle,
  Pill,
  FlaskConical,
  Scan,
  ActivitySquare,
  Droplets,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Mock hospital data - would come from API in production
const hospitalsData = {
  'apollo-hospitals': {
    id: 1,
    name: 'Apollo Hospitals',
    tagline: 'Excellence in Healthcare Since 1983',
    description: 'Apollo Hospitals is a leading multispecialty hospital known for its excellence in medical care, advanced technology, and patient-centered approach. With state-of-the-art facilities and a team of experienced medical professionals, we provide comprehensive healthcare services.',
    longDescription: 'Apollo Hospitals is a renowned healthcare institution committed to providing world-class medical services. Our hospital is equipped with cutting-edge technology and staffed by a team of highly qualified medical professionals dedicated to delivering exceptional patient care. We offer a wide range of medical services across various specialties, including cardiology, neurology, orthopedics, oncology, and more. Our patient-centered approach, combined with our commitment to medical excellence, has established us as a trusted name in healthcare.',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
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
    workingHours: {
      emergency: '24/7',
      outpatient: 'Mon-Sat: 9:00 AM - 6:00 PM',
      inpatient: '24/7',
      pharmacy: '24/7'
    },
    facilities: [
      'Emergency Services',
      'ICU & Critical Care',
      'Diagnostic Services',
      'Surgical Facilities',
      'Pharmacy',
      'Laboratory',
      'Radiology',
      'Rehabilitation',
      'Blood Bank',
      'Ambulance Services'
    ],
    specialties: [
      'Cardiology',
      'Neurology',
      'Orthopedics',
      'Oncology',
      'Gastroenterology',
      'Nephrology',
      'Urology',
      'Gynecology',
      'Pediatrics',
      'General Surgery'
    ],
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
    doctors: [
      {
        id: 101,
        name: 'Dr. Priya Sharma',
        specialty: 'Cardiology',
        qualification: 'MD, DM (Cardiology)',
        experience: 15,
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        position: 'Senior Consultant Cardiologist',
        awards: ['Best Cardiologist Award 2018', 'Medical Excellence Award 2021'],
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        bio: 'Dr. Priya Sharma is a renowned cardiologist with over 15 years of experience in diagnosing and treating cardiac conditions. She specializes in interventional cardiology and has performed over 1000 angioplasties. Dr. Sharma is known for her patient-centered approach and has received multiple awards for her contributions to cardiology.'
      },
      {
        id: 102,
        name: 'Dr. Rajiv Mehta',
        specialty: 'Neurology',
        qualification: 'MD, DM (Neurology)',
        experience: 18,
        imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        position: 'Head of Neurology Department',
        awards: ['Neurological Society of India Award', 'Excellence in Stroke Management'],
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        bio: 'Dr. Rajiv Mehta leads the Neurology Department with 18 years of expertise in neurological disorders. His specialization includes stroke management, epilepsy treatment, and movement disorders. He has contributed to numerous research papers in international neurology journals and is dedicated to advancing neurological care through innovative approaches.'
      },
      {
        id: 103,
        name: 'Dr. Anita Desai',
        specialty: 'Orthopedics',
        qualification: 'MS (Orthopedics), Fellowship in Joint Replacement',
        experience: 12,
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        position: 'Consultant Orthopedic Surgeon',
        awards: ['Best Paper Award - Indian Orthopedic Association'],
        availableDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
        bio: 'Dr. Anita Desai is a skilled orthopedic surgeon specializing in joint replacements and sports injuries. With 12 years of experience, she has successfully performed over 800 joint replacement surgeries. She employs minimally invasive techniques to ensure faster recovery and better outcomes for her patients.'
      },
      {
        id: 104,
        name: 'Dr. Suresh Kumar',
        specialty: 'Oncology',
        qualification: 'MD, DM (Medical Oncology)',
        experience: 20,
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        position: 'Director of Oncology Services',
        awards: ['Lifetime Achievement Award - Cancer Society of India', 'Research Excellence Award'],
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        bio: 'Dr. Suresh Kumar has dedicated 20 years to oncology, focusing on innovative cancer treatments and research. As the Director of Oncology Services, he has established comprehensive cancer care protocols and introduced several cutting-edge therapies. He is passionate about personalized treatment plans and has helped thousands of patients in their cancer journey.'
      }
    ],
    mapLocation: {
      lat: 13.0653,
      lng: 80.2486,
      zoom: 15
    }
  },
  'fortis-healthcare': {
    id: 2,
    name: 'Fortis Healthcare',
    tagline: 'Saving & Enriching Lives',
    description: 'Fortis Healthcare is committed to delivering integrated healthcare services with care and compassion. Our team of experienced healthcare professionals ensures personalized care and superior outcomes for all patients.',
    longDescription: 'Fortis Healthcare is a leading integrated healthcare delivery service provider in India. We are committed to clinical excellence and patient-centered care. Our hospitals are equipped with the latest technology and staffed by experienced healthcare professionals who work tirelessly to provide the best possible care to our patients. We offer a wide range of medical services across various specialties, ensuring comprehensive healthcare solutions for all.',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
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
    workingHours: {
      emergency: '24/7',
      outpatient: 'Mon-Sat: 8:30 AM - 7:00 PM',
      inpatient: '24/7',
      pharmacy: '24/7'
    },
    facilities: [
      'Emergency Services',
      'ICU & Critical Care',
      'Diagnostic Services',
      'Surgical Facilities',
      'Pharmacy',
      'Laboratory',
      'Radiology',
      'Rehabilitation',
      'Blood Bank',
      'Ambulance Services'
    ],
    specialties: [
      'Cardiac Sciences',
      'Neuro Sciences',
      'Orthopedics',
      'Gastroenterology',
      'Oncology',
      'Renal Sciences',
      'Transplants',
      'Woman & Child Institute',
      'Pulmonology',
      'Preventive Health'
    ],
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
    doctors: [
      {
        id: 201,
        name: 'Dr. Ashok Rajgopal',
        specialty: 'Orthopedics',
        qualification: 'MS (Orthopedics), Fellowship in Joint Replacement',
        experience: 25,
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        position: 'Chairman & Chief Surgeon - Bone & Joint Institute',
        awards: ['Padma Shri Award', 'Dr. B.C. Roy Award'],
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        bio: 'Dr. Ashok Rajgopal is a pioneer in the field of joint replacement surgery in India. With over 25 years of experience, he has performed more than 25,000 total knee replacement surgeries, earning him a place in the Limca Book of Records. Dr. Rajgopal has been instrumental in bringing the latest advancements in orthopedic surgery to India.'
      },
      {
        id: 202,
        name: 'Dr. T.S. Kler',
        specialty: 'Cardiology',
        qualification: 'MD, DM (Cardiology)',
        experience: 30,
        imageUrl: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        position: 'Chairman - Cardiac Sciences',
        awards: ['Lifetime Achievement Award', 'Best Cardiologist Award'],
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        bio: 'Dr. T.S. Kler is a distinguished cardiologist with 30 years of experience in cardiac care. He specializes in interventional cardiology and electrophysiology. Under his leadership, the Cardiac Sciences department has achieved remarkable success in complex cardiac procedures and heart transplants. He is known for his unwavering commitment to cardiac care excellence.'
      },
      {
        id: 203,
        name: 'Dr. Ritika Singh',
        specialty: 'Oncology',
        qualification: 'MD, DM (Medical Oncology)',
        experience: 16,
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        position: 'Senior Consultant - Oncology',
        awards: ['Young Investigator Award', 'Research Excellence Award'],
        availableDays: ['Monday', 'Tuesday', 'Thursday'],
        bio: 'Dr. Ritika Singh is a dedicated oncologist specializing in breast cancer and hematological malignancies. With 16 years of experience, she has been instrumental in implementing personalized cancer therapy protocols. She is actively involved in clinical research and has published numerous papers in international oncology journals.'
      }
    ],
    mapLocation: {
      lat: 30.7046,
      lng: 76.7179,
      zoom: 15
    }
  },
  'max-healthcare': {
    id: 3,
    name: 'Max Healthcare',
    tagline: 'To Our Patients. For Life.',
    description: 'Max Healthcare is one of the leading healthcare service providers in India, offering advanced medical services and technology-driven healthcare solutions. Our expert team is dedicated to providing the highest quality of care to our patients.',
    longDescription: 'Max Healthcare is a leading healthcare provider in India, known for its commitment to excellence in patient care. Our hospitals are equipped with state-of-the-art facilities and technology, and our team of experienced healthcare professionals is dedicated to providing personalized care to each patient.',
    imageUrl: 'https://images.unsplash.com/photo-1578991624414-276ef23908e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
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
    workingHours: {
      emergency: '24/7',
      outpatient: 'Mon-Sat: 9:00 AM - 6:00 PM',
      inpatient: '24/7',
      pharmacy: '24/7'
    },
    facilities: [
      'Emergency Services',
      'ICU & Critical Care',
      'Diagnostic Services',
      'Surgical Facilities',
      'Pharmacy',
      'Laboratory',
      'Radiology',
      'Rehabilitation',
      'Blood Bank',
      'Ambulance Services'
    ],
    specialties: [
      'Cardiac Sciences',
      'Neurosciences',
      'Orthopaedics & Joint Replacement',
      'Cancer Care',
      'Transplants',
      'Minimal Access & Bariatric Surgery',
      'Urology & Nephrology',
      'Gastroenterology',
      'Gynecology',
      'Pediatrics'
    ],
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
    doctors: [
      {
        id: 301,
        name: 'Dr. Naresh Trehan',
        specialty: 'Cardiac Surgery',
        qualification: 'MD, Cardiovascular Surgery',
        experience: 35,
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        position: 'Chairman & Managing Director',
        awards: ['Padma Bhushan', 'Dr. B.C. Roy Award', 'Lifetime Achievement Award'],
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        bio: 'Dr. Naresh Trehan is a world-renowned cardiovascular surgeon with over 35 years of experience. He has performed more than 50,000 heart surgeries and is known for his pioneering work in minimally invasive cardiac surgery. Dr. Trehan has been instrumental in bringing cutting-edge cardiac care to India and has received numerous accolades for his contributions to medicine.'
      },
      {
        id: 302,
        name: 'Dr. Sandeep Vaishya',
        specialty: 'Neurosurgery',
        qualification: 'MCh (Neurosurgery)',
        experience: 22,
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        position: 'Director - Neurosurgery',
        awards: ['Best Neurosurgeon Award', 'Excellence in Minimally Invasive Neurosurgery'],
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        bio: 'Dr. Sandeep Vaishya is an accomplished neurosurgeon specializing in complex brain tumors and spine disorders. With 22 years of experience, he has performed over 5000 neurosurgical procedures. He is recognized for his expertise in minimally invasive neurosurgery and has introduced several innovative surgical techniques in India.'
      },
      {
        id: 303,
        name: 'Dr. Harit Chaturvedi',
        specialty: 'Oncology',
        qualification: 'MS, MCh (Surgical Oncology)',
        experience: 28,
        imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        position: 'Chairman - Cancer Care',
        awards: ['Distinguished Surgeon Award', 'Cancer Care Excellence Award'],
        availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        bio: 'Dr. Harit Chaturvedi is a prominent surgical oncologist with 28 years of experience in cancer treatment. He specializes in thoracic oncology and has pioneered video-assisted thoracic surgery in India. Under his leadership, the Cancer Care department has achieved remarkable success rates in complex cancer treatments and has introduced several innovative therapies.'
      }
    ],
    mapLocation: {
      lat: 28.5283,
      lng: 77.2090,
      zoom: 15
    }
  }
};

const HospitalDetail: React.FC = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get the hospital data based on the ID parameter
  const hospital = hospitalsData[id as keyof typeof hospitalsData];
  
  if (!hospital) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-800">Hospital not found</h2>
          <p className="mt-4 text-gray-600">The hospital you're looking for doesn't exist or has been removed.</p>
          <Button 
            className="mt-6" 
            onClick={() => navigate('/hospitals')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hospitals
          </Button>
        </div>
      </div>
    );
  }
  
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
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/hospitals">Hospitals</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{hospital.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Hospital Header */}
      <div className="bg-white rounded-lg overflow-hidden shadow-md mb-8">
        <div className="relative h-64 md:h-96 bg-gradient-to-r from-blue-600 to-blue-800">
          <img
            src={hospital.imageUrl}
            alt={hospital.name}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <div className="flex items-center mb-4">
              <div className="bg-white p-2 rounded-full mr-4">
                <img 
                  src={hospital.logo} 
                  alt={`${hospital.name} Logo`} 
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white">{hospital.name}</h1>
                <p className="text-white/80 text-sm md:text-base">{hospital.tagline}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{hospital.address.city}, {hospital.address.state}</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                <span>Estd. {hospital.establishedYear}</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" />
                <span>{hospital.bedsCount} Beds</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{hospital.doctors.length}+ Specialists</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5" />
                <span>{hospital.accreditations.length} Accreditations</span>
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-white">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-700">Address</h3>
              <p className="text-sm text-gray-600">{hospital.address.street}</p>
              <p className="text-sm text-gray-600">{hospital.address.city}, {hospital.address.state} {hospital.address.pincode}</p>
              <p className="text-sm text-gray-600">{hospital.address.country}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-700">Contact</h3>
              <p className="text-sm text-gray-600">{hospital.contact.phone}</p>
              <p className="text-sm text-gray-600">{hospital.contact.email}</p>
              <a 
                href={`https://${hospital.contact.website}`} 
                className="text-sm text-primary flex items-center hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {hospital.contact.website} <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-700">Working Hours</h3>
              <p className="text-sm text-gray-600">Emergency: <span className="font-medium">{hospital.workingHours.emergency}</span></p>
              <p className="text-sm text-gray-600">OPD: <span className="font-medium">{hospital.workingHours.outpatient}</span></p>
              <p className="text-sm text-gray-600">Pharmacy: <span className="font-medium">{hospital.workingHours.pharmacy}</span></p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Award className="h-5 w-5 text-primary mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-700">Accreditations</h3>
              <ul className="text-sm text-gray-600">
                {hospital.accreditations.map((accreditation, index) => (
                  <li key={index}>{accreditation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hospital Content Tabs */}
      <div className="mb-8">
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="specialties">Specialties</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>About {hospital.name}</CardTitle>
                    <CardDescription>Established in {hospital.establishedYear}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-6">{hospital.longDescription}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Key Specialties</h4>
                        <ul className="space-y-1">
                          {hospital.specialties.slice(0, 5).map((specialty, index) => (
                            <li key={index} className="flex items-center text-gray-600">
                              <Stethoscope className="h-4 w-4 text-primary mr-2" />
                              {specialty}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Key Facilities</h4>
                        <ul className="space-y-1">
                          {hospital.facilities.slice(0, 5).map((facility, index) => (
                            <li key={index} className="flex items-center text-gray-600">
                              <CheckCircle className="h-4 w-4 text-primary mr-2" />
                              {facility}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Featured Doctors</CardTitle>
                    <CardDescription>Meet our specialists</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hospital.doctors.slice(0, 4).map((doctor) => (
                        <div key={doctor.id} className="flex items-start p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <Avatar className="h-14 w-14 mr-4">
                            <AvatarImage src={doctor.imageUrl} alt={doctor.name} />
                            <AvatarFallback>{doctor.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-800">{doctor.name}</h4>
                            <p className="text-sm text-primary">{doctor.specialty}</p>
                            <p className="text-xs text-gray-600">{doctor.qualification}</p>
                            <p className="text-xs text-gray-600">{doctor.experience} Years Experience</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('doctors')}
                    >
                      View All Doctors
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Ratings & Reviews</CardTitle>
                    <CardDescription>{hospital.reviewCount} patient reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-4">
                      <div className="mr-4">
                        <span className="text-4xl font-bold text-gray-800">{hospital.ratings.overall}</span>
                        <span className="text-gray-500">/5</span>
                      </div>
                      <div className="flex flex-col">
                        {renderRatingStars(hospital.ratings.overall)}
                        <span className="text-sm text-gray-600 mt-1">Overall Rating</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Facilities</span>
                        {renderRatingStars(hospital.ratings.facilities)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cleanliness</span>
                        {renderRatingStars(hospital.ratings.cleanliness)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Staff</span>
                        {renderRatingStars(hospital.ratings.staff)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Value</span>
                        {renderRatingStars(hospital.ratings.value)}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Read Reviews</Button>
                  </CardFooter>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Emergency Contact</CardTitle>
                    <CardDescription>Available 24/7</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-4">
                      <Ambulance className="h-10 w-10 text-red-500 mr-4" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Emergency Services</h4>
                        <p className="text-sm text-gray-600">24/7 Available</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <a 
                        href={`tel:${hospital.contact.phone}`} 
                        className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Phone className="h-5 w-5 mr-2" />
                        {hospital.contact.phone}
                      </a>
                      <Button className="w-full mt-2 bg-red-600 hover:bg-red-700">
                        <Ambulance className="h-4 w-4 mr-2" /> Request Ambulance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Book Appointment</CardTitle>
                    <CardDescription>Schedule a visit</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <CalendarDays className="h-4 w-4 mr-2" /> Book Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Doctors Tab */}
          <TabsContent value="doctors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Our Medical Specialists</CardTitle>
                <CardDescription>Experienced doctors dedicated to your care</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {hospital.doctors.map((doctor) => (
                    <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <img 
                        src={doctor.imageUrl} 
                        alt={doctor.name} 
                        className="w-full h-48 object-cover"
                      />
                      <CardHeader className="pb-2">
                        <CardTitle>{doctor.name}</CardTitle>
                        <CardDescription className="text-primary">{doctor.specialty}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-sm text-gray-700">{doctor.qualification}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm text-gray-700">{doctor.experience} Years Experience</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-gray-700">Available: {doctor.availableDays.join(', ')}</span>
                        </div>
                        <div className="mt-4">
                          <Accordion type="single" collapsible>
                            <AccordionItem value="bio">
                              <AccordionTrigger className="text-sm">About Doctor</AccordionTrigger>
                              <AccordionContent>
                                <p className="text-sm text-gray-600">{doctor.bio}</p>
                                {doctor.awards.length > 0 && (
                                  <div className="mt-2">
                                    <h5 className="text-sm font-semibold">Awards & Recognitions:</h5>
                                    <ul className="text-sm text-gray-600 list-disc list-inside">
                                      {doctor.awards.map((award, index) => (
                                        <li key={index}>{award}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">
                          <CalendarDays className="h-4 w-4 mr-2" /> Book Appointment
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Specialties Tab */}
          <TabsContent value="specialties" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical Specialties</CardTitle>
                <CardDescription>Comprehensive healthcare services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hospital.specialties.map((specialty, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-primary/10 mr-3">
                            <Stethoscope className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-lg">{specialty}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          Our {specialty} department is staffed by experienced specialists providing comprehensive care for all related conditions.
                        </p>
                        <div className="mt-4">
                          <div className="text-sm font-medium text-gray-700 mb-1">Key Specialists:</div>
                          <div className="space-y-2">
                            {hospital.doctors
                              .filter(doctor => doctor.specialty === specialty || index % 3 === 0)
                              .slice(0, 2)
                              .map(doctor => (
                                <div key={doctor.id} className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={doctor.imageUrl} alt={doctor.name} />
                                    <AvatarFallback>{doctor.name.slice(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{doctor.name}</p>
                                    <p className="text-xs text-gray-500">{doctor.qualification}</p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full text-sm">
                          Learn More
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Facilities Tab */}
          <TabsContent value="facilities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Hospital Facilities</CardTitle>
                <CardDescription>State-of-the-art healthcare infrastructure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Facilities</h3>
                    <ul className="space-y-3">
                      {hospital.facilities.slice(0, 5).map((facility, index) => (
                        <li key={index} className="flex items-start p-3 border rounded-lg">
                          {facility === 'Emergency Services' ? (
                            <Ambulance className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                          ) : facility === 'ICU & Critical Care' ? (
                            <HeartPulse className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                          ) : facility === 'Diagnostic Services' ? (
                            <Stethoscope className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                          ) : facility === 'Surgical Facilities' ? (
                            <Stethoscope className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-800">{facility}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {facility === 'Emergency Services' ? '24/7 emergency medical care with rapid response team' : 
                               facility === 'ICU & Critical Care' ? 'Advanced intensive care units with 24/7 monitoring' :
                               facility === 'Diagnostic Services' ? 'Comprehensive diagnostic facilities with latest equipment' :
                               facility === 'Surgical Facilities' ? 'State-of-the-art operation theaters for all surgical needs' :
                               'Advanced healthcare facility available'}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Support Facilities</h3>
                    <ul className="space-y-3">
                      {hospital.facilities.slice(5, 10).map((facility, index) => (
                        <li key={index} className="flex items-start p-3 border rounded-lg">
                          {facility === 'Pharmacy' ? (
                            <Pill className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                          ) : facility === 'Laboratory' ? (
                            <FlaskConical className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                          ) : facility === 'Radiology' ? (
                            <Scan className="h-5 w-5 text-indigo-500 mr-3 mt-0.5" />
                          ) : facility === 'Rehabilitation' ? (
                            <ActivitySquare className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                          ) : (
                            <Droplets className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-800">{facility}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {facility === 'Pharmacy' ? '24/7 pharmacy services with extensive medication inventory' : 
                               facility === 'Laboratory' ? 'Advanced clinical laboratory with rapid testing capabilities' :
                               facility === 'Radiology' ? 'Modern imaging center with X-ray, CT, MRI and ultrasound' :
                               facility === 'Rehabilitation' ? 'Comprehensive rehabilitation services for recovery support' :
                               facility === 'Blood Bank' ? 'Full-service blood bank with stringent quality standards' :
                               'Additional support services available'}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Hospital Infrastructure</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Bed className="h-4 w-4 mr-2 text-blue-500" />
                          Hospital Beds
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-gray-800 mb-1">{hospital.bedsCount}</div>
                        <p className="text-sm text-gray-600">Including general, private, and ICU beds</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-green-500" />
                          Facility Area
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                          {(hospital.bedsCount * 120).toLocaleString()} sq.ft.
                        </div>
                        <p className="text-sm text-gray-600">Modern healthcare facility</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Users className="h-4 w-4 mr-2 text-purple-500" />
                          Medical Staff
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                          {(hospital.bedsCount * 0.7).toFixed(0)}+
                        </div>
                        <p className="text-sm text-gray-600">Doctors, nurses, and support staff</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Location Tab */}
          <TabsContent value="location" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Hospital Location</CardTitle>
                <CardDescription>Find us easily with directions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-700">Address</h3>
                      <p className="text-gray-600">{hospital.address.street}</p>
                      <p className="text-gray-600">{hospital.address.city}, {hospital.address.state} {hospital.address.pincode}</p>
                      <p className="text-gray-600">{hospital.address.country}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden h-96 mb-6">
                  {/* Google Maps iframe would go here - using a placeholder */}
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-center p-4">
                      <MapPin className="h-10 w-10 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Google Maps Location</h3>
                      <p className="text-sm text-gray-600 mb-4">Map will be displayed here with the hospital's location</p>
                      <p className="text-xs text-gray-500">
                        Coordinates: {hospital.mapLocation.lat}, {hospital.mapLocation.lng}
                      </p>
                      
                      <Button className="mt-4" onClick={() => {
                        window.open(`https://www.google.com/maps/search/?api=1&query=${hospital.mapLocation.lat},${hospital.mapLocation.lng}`, '_blank');
                      }}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </Button>
                      
                      <p className="text-xs text-gray-500 mt-4">
                        Note: To use Google Maps, you would need to add a Google Maps API key.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Directions</h3>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-800 mb-2">By Public Transport</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Nearest Bus Stop: {hospital.name} Bus Stop (200m)</li>
                          <li>• Nearest Metro Station: {hospital.address.city} Central (500m)</li>
                          <li>• Local Train Station: {hospital.address.city} Junction (2km)</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-800 mb-2">By Car</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• From City Center: 15 minutes (5km)</li>
                          <li>• From Airport: 30 minutes (15km)</li>
                          <li>• Parking: Available (200 cars capacity)</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-800 mb-2">Landmarks Nearby</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• {hospital.address.city} Central Park (500m)</li>
                          <li>• City Mall (1km)</li>
                          <li>• Government Office Complex (1.5km)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-800 mb-2">General Inquiries</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-600 mr-2" />
                            <span>{hospital.contact.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-600 mr-2" />
                            <span>{hospital.contact.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 text-gray-600 mr-2" />
                            <a 
                              href={`https://${hospital.contact.website}`} 
                              className="text-primary hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {hospital.contact.website}
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-800 mb-2">Emergency Contact</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Ambulance className="h-4 w-4 text-red-600 mr-2" />
                            <span className="font-medium">Emergency Helpline:</span>
                          </div>
                          <a 
                            href={`tel:${hospital.contact.phone}`} 
                            className="flex items-center p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            {hospital.contact.phone}
                          </a>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-800 mb-2">Appointment Booking</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-600 mr-2" />
                            <span>{hospital.contact.phone} (Ext. 1001)</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-600 mr-2" />
                            <span>appointments@{hospital.contact.website.split('www.')[1]}</span>
                          </div>
                          <Button variant="outline" className="w-full mt-2">Book Appointment</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Call-to-Action Section */}
      <div className="mt-8 bg-primary/10 rounded-lg p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Need Healthcare Assistance?
            </h2>
            <p className="text-gray-600 mb-4">
              Our dedicated team at {hospital.name} is ready to help you with all your healthcare needs. Book an appointment today or contact us for more information.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button>
                <CalendarDays className="h-4 w-4 mr-2" /> Book Appointment
              </Button>
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" /> Contact Us
              </Button>
            </div>
          </div>
          <div className="hidden md:flex justify-end">
            <div className="bg-white rounded-lg p-5 shadow-lg w-full max-w-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Contact</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">{hospital.contact.phone}</p>
                    <p className="text-xs text-gray-500">General Helpline</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">{hospital.workingHours.outpatient}</p>
                    <p className="text-xs text-gray-500">OPD Hours</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">{hospital.contact.email}</p>
                    <p className="text-xs text-gray-500">Email Us</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">{hospital.address.city}, {hospital.address.state}</p>
                    <p className="text-xs text-gray-500">{hospital.address.street}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetail;