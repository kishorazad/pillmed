import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, MapPin, Filter, Star, Calendar, Clock, Video, MessageSquare, Heart, ChevronDown, X, Sliders, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

// Sample data for doctors
const doctorsData = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    specialty: 'Cardiologist',
    hospitalName: 'Apollo Hospitals',
    location: 'Delhi',
    experience: 12,
    rating: 4.8,
    reviewCount: 120,
    consultationFee: 800,
    availability: ['Today', 'Tomorrow'],
    education: 'MBBS, MD (Cardiology), DM (Cardiology)',
    languages: ['English', 'Hindi'],
    about: "Dr. Priya Sharma is a renowned cardiologist with over 12 years of experience in diagnosing and treating cardiac conditions. She specializes in interventional cardiology and has performed over 1000 angioplasties.",
    consultationOptions: ['Video', 'Chat', 'In-person'],
    nextAvailable: '10:30 AM Today'
  },
  {
    id: 2,
    name: 'Dr. Rajesh Mehta',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    specialty: 'Neurologist',
    hospitalName: 'Max Healthcare',
    location: 'Mumbai',
    experience: 15,
    rating: 4.9,
    reviewCount: 240,
    consultationFee: 1200,
    availability: ['Tomorrow', 'Day After'],
    education: 'MBBS, MD (Medicine), DM (Neurology)',
    languages: ['English', 'Hindi', 'Marathi'],
    about: "Dr. Rajesh Mehta is a distinguished neurologist with 15 years of clinical experience. He specializes in stroke management, epilepsy, and movement disorders, and has pioneered several innovative neurological treatment protocols in India.",
    consultationOptions: ['Video', 'In-person'],
    nextAvailable: '3:00 PM Tomorrow'
  },
  {
    id: 3,
    name: 'Dr. Aisha Khan',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    specialty: 'Pediatrician',
    hospitalName: 'Fortis Healthcare',
    location: 'Bangalore',
    experience: 10,
    rating: 4.7,
    reviewCount: 180,
    consultationFee: 600,
    availability: ['Today', 'Tomorrow', 'Day After'],
    education: 'MBBS, MD (Pediatrics)',
    languages: ['English', 'Hindi', 'Kannada'],
    about: "Dr. Aisha Khan is a compassionate pediatrician with a decade of experience in child healthcare. She specializes in newborn care, developmental pediatrics, and childhood infections, and is known for her gentle approach with young patients.",
    consultationOptions: ['Video', 'Chat', 'In-person'],
    nextAvailable: '12:15 PM Today'
  },
  {
    id: 4,
    name: 'Dr. Vikram Reddy',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    specialty: 'Orthopedic Surgeon',
    hospitalName: 'AIIMS',
    location: 'Delhi',
    experience: 18,
    rating: 4.6,
    reviewCount: 210,
    consultationFee: 1000,
    availability: ['Day After'],
    education: 'MBBS, MS (Orthopedics)',
    languages: ['English', 'Hindi', 'Telugu'],
    about: "Dr. Vikram Reddy is a skilled orthopedic surgeon specializing in joint replacements and sports injuries. With 18 years of experience, he has successfully performed over 1500 surgeries and is known for his expertise in minimally invasive techniques.",
    consultationOptions: ['Video', 'In-person'],
    nextAvailable: '10:00 AM Day After'
  },
  {
    id: 5,
    name: 'Dr. Meenakshi Iyer',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    specialty: 'Gynecologist',
    hospitalName: 'Manipal Hospitals',
    location: 'Chennai',
    experience: 14,
    rating: 4.9,
    reviewCount: 320,
    consultationFee: 900,
    availability: ['Today', 'Tomorrow'],
    education: 'MBBS, MD (Obstetrics & Gynecology)',
    languages: ['English', 'Hindi', 'Tamil'],
    about: "Dr. Meenakshi Iyer is a leading gynecologist with 14 years of expertise in women's health. She specializes in high-risk pregnancies, gynecological endocrinology, and minimally invasive surgeries, with a patient-centered approach to care.",
    consultationOptions: ['Video', 'Chat', 'In-person'],
    nextAvailable: '4:30 PM Today'
  },
  {
    id: 6,
    name: 'Dr. Arjun Singh',
    image: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    specialty: 'Dermatologist',
    hospitalName: 'Medanta',
    location: 'Gurgaon',
    experience: 9,
    rating: 4.7,
    reviewCount: 150,
    consultationFee: 800,
    availability: ['Today', 'Day After'],
    education: 'MBBS, MD (Dermatology)',
    languages: ['English', 'Hindi', 'Punjabi'],
    about: "Dr. Arjun Singh is a skilled dermatologist specializing in clinical and cosmetic dermatology. With 9 years of experience, he has expertise in treating various skin conditions, including acne, psoriasis, and eczema, and is known for his holistic approach to skin health.",
    consultationOptions: ['Video', 'Chat'],
    nextAvailable: '6:00 PM Today'
  }
];

// Sample specialties data
const specialties = [
  { value: 'all', label: 'All Specialties' },
  { value: 'cardiologist', label: 'Cardiologist' },
  { value: 'neurologist', label: 'Neurologist' },
  { value: 'pediatrician', label: 'Pediatrician' },
  { value: 'orthopedic', label: 'Orthopedic Surgeon' },
  { value: 'gynecologist', label: 'Gynecologist' },
  { value: 'dermatologist', label: 'Dermatologist' },
  { value: 'psychiatrist', label: 'Psychiatrist' },
  { value: 'ent', label: 'ENT Specialist' },
  { value: 'ophthalmologist', label: 'Ophthalmologist' },
  { value: 'dentist', label: 'Dentist' },
  { value: 'gastroenterologist', label: 'Gastroenterologist' },
  { value: 'urologist', label: 'Urologist' },
  { value: 'pulmonologist', label: 'Pulmonologist' },
  { value: 'endocrinologist', label: 'Endocrinologist' }
];

// Sample symptoms data
const symptoms = [
  { value: 'fever', label: 'Fever' },
  { value: 'cough', label: 'Cough' },
  { value: 'headache', label: 'Headache' },
  { value: 'stomachache', label: 'Stomach Ache' },
  { value: 'backpain', label: 'Back Pain' },
  { value: 'jointpain', label: 'Joint Pain' },
  { value: 'chestpain', label: 'Chest Pain' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'rash', label: 'Skin Rash' },
  { value: 'dizziness', label: 'Dizziness' },
  { value: 'nausea', label: 'Nausea' },
  { value: 'sore-throat', label: 'Sore Throat' },
  { value: 'breathing', label: 'Difficulty Breathing' },
  { value: 'blurry-vision', label: 'Blurry Vision' },
  { value: 'ear-pain', label: 'Ear Pain' }
];

// Sample locations
const locations = [
  { value: 'all', label: 'All Locations' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'chennai', label: 'Chennai' },
  { value: 'hyderabad', label: 'Hyderabad' },
  { value: 'kolkata', label: 'Kolkata' },
  { value: 'gurgaon', label: 'Gurgaon' },
  { value: 'noida', label: 'Noida' },
  { value: 'pune', label: 'Pune' }
];

// Sample hospitals
const hospitals = [
  { value: 'all', label: 'All Hospitals' },
  { value: 'apollo', label: 'Apollo Hospitals' },
  { value: 'max', label: 'Max Healthcare' },
  { value: 'fortis', label: 'Fortis Healthcare' },
  { value: 'aiims', label: 'AIIMS' },
  { value: 'manipal', label: 'Manipal Hospitals' },
  { value: 'medanta', label: 'Medanta' }
];

import DoctorSEO from '@/components/SEO/DoctorSEO';

const DoctorSearch: React.FC = () => {
  const [, navigate] = useLocation();
  
  // Get URL parameters for SEO and initial filter settings
  const searchParams = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search) 
    : new URLSearchParams();
    
  const initialSpecialty = searchParams.get('specialty') || 'all';
  const initialCondition = searchParams.get('condition') || '';
  const initialLocation = searchParams.get('location') || 'all';
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(initialCondition);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    initialCondition ? [initialCondition] : []
  );
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [experienceRange, setExperienceRange] = useState([0, 20]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [consultationType, setConsultationType] = useState<string[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  
  // Mobile filter states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filtered doctors based on search and filters
  const [filteredDoctors, setFilteredDoctors] = useState(doctorsData);
  
  // Map to convert from URL specialty parameter to display name
  const specialtyDisplayName = specialties.find(s => 
    s.value.toLowerCase() === selectedSpecialty.toLowerCase()
  )?.label || 'All Specialties';
  
  // Function to handle symptom selection
  const toggleSymptom = (value: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(value) 
        ? prev.filter(s => s !== value) 
        : [...prev, value]
    );
  };
  
  // Function to handle availability filters
  const toggleAvailability = (value: string) => {
    setAvailability(prev => 
      prev.includes(value) 
        ? prev.filter(a => a !== value) 
        : [...prev, value]
    );
  };
  
  // Function to handle consultation type filters
  const toggleConsultationType = (value: string) => {
    setConsultationType(prev => 
      prev.includes(value) 
        ? prev.filter(c => c !== value) 
        : [...prev, value]
    );
  };
  
  // Function to apply filters
  useEffect(() => {
    const filteredResults = doctorsData.filter(doctor => {
      // Search query filter (doctor name, specialty, hospital)
      const matchesSearch = 
        searchQuery === '' || 
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.hospitalName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Specialty filter
      const matchesSpecialty = 
        selectedSpecialty === 'all' || 
        doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
      
      // Location filter
      const matchesLocation = 
        selectedLocation === 'all' || 
        doctor.location.toLowerCase() === selectedLocation.toLowerCase();
      
      // Hospital filter
      const matchesHospital = 
        selectedHospital === 'all' || 
        doctor.hospitalName.toLowerCase().includes(selectedHospital.toLowerCase());
      
      // Price filter
      const matchesPrice = 
        doctor.consultationFee >= priceRange[0] && 
        doctor.consultationFee <= priceRange[1];
      
      // Experience filter
      const matchesExperience = 
        doctor.experience >= experienceRange[0] && 
        doctor.experience <= experienceRange[1];
      
      // Rating filter
      const matchesRating = 
        rating === null || 
        doctor.rating >= rating;
      
      // Availability filter
      const matchesAvailability = 
        availability.length === 0 || 
        availability.some(a => doctor.availability.includes(a));
      
      // Consultation type filter
      const matchesConsultationType = 
        consultationType.length === 0 || 
        consultationType.some(c => doctor.consultationOptions.includes(c));
      
      // Symptoms filter - this would typically come from a backend endpoint that maps symptoms to specialties
      // This is a simplified version
      let matchesSymptoms = true;
      if (selectedSymptoms.length > 0) {
        // Simplified symptom to specialty mapping
        const symptomToSpecialty: Record<string, string[]> = {
          fever: ['Pediatrician', 'General Physician'],
          cough: ['Pulmonologist', 'General Physician'],
          headache: ['Neurologist', 'General Physician'],
          stomachache: ['Gastroenterologist', 'General Physician'],
          backpain: ['Orthopedic Surgeon', 'Neurologist'],
          jointpain: ['Orthopedic Surgeon', 'Rheumatologist'],
          chestpain: ['Cardiologist', 'Pulmonologist'],
          fatigue: ['Endocrinologist', 'General Physician'],
          rash: ['Dermatologist', 'Allergist'],
          dizziness: ['Neurologist', 'ENT Specialist'],
          nausea: ['Gastroenterologist', 'General Physician'],
          'sore-throat': ['ENT Specialist', 'General Physician'],
          breathing: ['Pulmonologist', 'Cardiologist'],
          'blurry-vision': ['Ophthalmologist', 'Neurologist'],
          'ear-pain': ['ENT Specialist', 'General Physician']
        };
        
        matchesSymptoms = selectedSymptoms.some(symptom => {
          const relevantSpecialties = symptomToSpecialty[symptom] || [];
          return relevantSpecialties.includes(doctor.specialty);
        });
      }
      
      return matchesSearch && 
             matchesSpecialty && 
             matchesLocation && 
             matchesHospital && 
             matchesPrice && 
             matchesExperience && 
             matchesRating && 
             matchesAvailability && 
             matchesConsultationType &&
             matchesSymptoms;
    });
    
    setFilteredDoctors(filteredResults);
  }, [
    searchQuery, 
    selectedSpecialty, 
    selectedSymptoms,
    selectedLocation, 
    selectedHospital, 
    priceRange, 
    experienceRange, 
    rating, 
    availability, 
    consultationType
  ]);
  
  // Function to clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('all');
    setSelectedSymptoms([]);
    setSelectedLocation('all');
    setSelectedHospital('all');
    setPriceRange([0, 2000]);
    setExperienceRange([0, 20]);
    setRating(null);
    setAvailability([]);
    setConsultationType([]);
  };
  
  // Function to view doctor details
  const viewDoctorDetails = (doctorId: number) => {
    navigate(`/doctors/${doctorId}`);
  };
  
  // Function to book appointment
  const bookAppointment = (doctorId: number) => {
    navigate(`/doctors/${doctorId}/book`);
  };
  
  // Update URL when filters change
  useEffect(() => {
    // Don't update during initial render
    if (typeof window === 'undefined') return;
    
    // Build new URL with current filter state
    const params = new URLSearchParams();
    if (selectedSpecialty !== 'all') params.set('specialty', selectedSpecialty);
    if (searchQuery && searchQuery.trim() !== '') params.set('condition', searchQuery);
    if (selectedLocation !== 'all') params.set('location', selectedLocation);
    
    // Update browser URL without page refresh
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedSpecialty, searchQuery, selectedLocation]);
  
  // Function to handle search + automatic specialty selection 
  // Like PharmEasy, Netmeds, 1mg
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    // Automatically map search query to specialty
    if (query) {
      // Common condition to specialty mappings
      const conditionMap: Record<string, string> = {
        // Heart conditions
        'heart': 'cardiologist',
        'chest pain': 'cardiologist',
        'blood pressure': 'cardiologist',
        'hypertension': 'cardiologist',
        'cholesterol': 'cardiologist',
        
        // Brain conditions
        'headache': 'neurologist',
        'migraine': 'neurologist',
        'seizure': 'neurologist',
        'epilepsy': 'neurologist',
        'stroke': 'neurologist',
        'brain': 'neurologist',
        
        // Skin conditions
        'skin': 'dermatologist',
        'acne': 'dermatologist',
        'rash': 'dermatologist',
        'allergy': 'dermatologist',
        
        // Children's conditions
        'child': 'pediatrician',
        'fever': 'pediatrician',
        'children': 'pediatrician',
        'growth': 'pediatrician',
        
        // Women's health
        'pregnancy': 'gynecologist',
        'period': 'gynecologist',
        'menstrual': 'gynecologist',
        'gynecology': 'gynecologist',
        'gynecological': 'gynecologist',
        'women': 'gynecologist',
        
        // Bone and joint issues
        'bone': 'orthopedic',
        'joint': 'orthopedic',
        'fracture': 'orthopedic',
        'arthritis': 'orthopedic',
        
        // Eye problems
        'eye': 'ophthalmologist',
        'vision': 'ophthalmologist',
        'glasses': 'ophthalmologist',
        
        // ENT issues
        'ear': 'ent',
        'nose': 'ent',
        'throat': 'ent',
        'hearing': 'ent',
        'sinus': 'ent',
      };
      
      // Check if search contains any mapped condition
      const lowerQuery = query.toLowerCase();
      for (const [condition, specialty] of Object.entries(conditionMap)) {
        if (lowerQuery.includes(condition)) {
          setSelectedSpecialty(specialty);
          break;
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* SEO Component */}
      <DoctorSEO
        specialty={specialtyDisplayName !== 'All Specialties' ? specialtyDisplayName : undefined}
        condition={searchQuery || undefined}
        location={selectedLocation !== 'all' ? 
          locations.find(l => l.value === selectedLocation)?.label : undefined}
        isSearchPage={true}
      />
      
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Find Doctors</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find and Consult with Doctors</h1>
        <p className="text-gray-600">
          Search for the best doctors, book appointments, and get online consultations from the comfort of your home.
        </p>
      </div>
      
      {/* Main Search Bar */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative flex">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search doctors, specialties, conditions..."
                  className="pl-10 rounded-r-none"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="rounded-l-none bg-orange-500 hover:bg-orange-600 text-white font-medium px-6"
                onClick={() => {
                  // Update URL with search params and filter doctors based on current input
                  const params = new URLSearchParams();
                  if (selectedSpecialty !== 'all') params.set('specialty', selectedSpecialty);
                  if (searchQuery && searchQuery.trim() !== '') params.set('condition', searchQuery);
                  if (selectedLocation !== 'all') params.set('location', selectedLocation);
                  
                  // Update URL without page refresh
                  const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
                  window.history.replaceState({}, '', newUrl);
                }}
              >
                Search
              </Button>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.value} value={specialty.value}>
                      {specialty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-between w-full">
                    <div className="flex items-center truncate">
                      <div className="truncate">
                        {selectedSymptoms.length > 0 
                          ? `${selectedSymptoms.length} symptom${selectedSymptoms.length > 1 ? 's' : ''} selected` 
                          : "Select Symptoms"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search symptoms..." />
                    <CommandList>
                      <CommandEmpty>No symptoms found.</CommandEmpty>
                      <CommandGroup>
                        {symptoms.map((symptom) => (
                          <CommandItem
                            key={symptom.value}
                            onSelect={() => toggleSymptom(symptom.value)}
                            className="flex items-center"
                          >
                            <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                              selectedSymptoms.includes(symptom.value) 
                                ? "border-primary bg-primary text-primary-foreground" 
                                : "border-muted opacity-50"
                            }`}>
                              {selectedSymptoms.includes(symptom.value) && (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                            <span>{symptom.label}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters - Desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <Filter className="mr-2 h-5 w-5" /> Filters
                </CardTitle>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm text-orange-500"
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hospital Filter */}
              <div className="space-y-2">
                <Label>Hospital</Label>
                <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.value} value={hospital.value}>
                        {hospital.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Price Range */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Consultation Fee</Label>
                  <span className="text-sm text-gray-500">
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                  </span>
                </div>
                <Slider
                  defaultValue={priceRange}
                  min={0}
                  max={2000}
                  step={100}
                  onValueChange={setPriceRange}
                />
              </div>
              
              {/* Experience Range */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Experience (years)</Label>
                  <span className="text-sm text-gray-500">
                    {experienceRange[0]} - {experienceRange[1]}+ years
                  </span>
                </div>
                <Slider
                  defaultValue={experienceRange}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={setExperienceRange}
                />
              </div>
              
              {/* Rating Filter */}
              <div className="space-y-2">
                <Label>Minimum Rating</Label>
                <div className="flex items-center space-x-1">
                  {[4, 4.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRating(r)}
                      className={`px-3 py-1.5 border rounded-md text-sm ${
                        rating === r
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {r}+ <Star className="inline-block h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </button>
                  ))}
                  <button
                    onClick={() => setRating(null)}
                    className="px-2 py-1.5 border rounded-md text-sm border-gray-200 bg-white"
                  >
                    All
                  </button>
                </div>
              </div>
              
              {/* Availability Filter */}
              <div className="space-y-2">
                <Label>Availability</Label>
                <div className="flex flex-wrap gap-2">
                  {['Today', 'Tomorrow', 'Day After'].map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleAvailability(day)}
                      className={`px-3 py-1.5 border rounded-md text-sm ${
                        availability.includes(day)
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Consultation Type */}
              <div className="space-y-2">
                <Label>Consultation Type</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="video" 
                      checked={consultationType.includes('Video')}
                      onCheckedChange={() => toggleConsultationType('Video')}
                    />
                    <Label htmlFor="video" className="flex items-center">
                      <Video className="h-4 w-4 mr-2 text-gray-500" />
                      Video Consultation
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="chat" 
                      checked={consultationType.includes('Chat')}
                      onCheckedChange={() => toggleConsultationType('Chat')}
                    />
                    <Label htmlFor="chat" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                      Chat Consultation
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="inperson" 
                      checked={consultationType.includes('In-person')}
                      onCheckedChange={() => toggleConsultationType('In-person')}
                    />
                    <Label htmlFor="inperson" className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      In-person Visit
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Doctor Listings */}
        <div className="lg:col-span-3">
          {/* Mobile Filters Button */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredDoctors.length} of {doctorsData.length} doctors
            </p>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Sliders className="h-4 w-4" />
              Filters
              {(selectedSpecialty !== 'all' || 
                selectedSymptoms.length > 0 || 
                selectedLocation !== 'all' || 
                selectedHospital !== 'all' || 
                rating !== null ||
                availability.length > 0 ||
                consultationType.length > 0) && (
                <Badge variant="secondary" className="ml-1 text-xs py-0 h-5">
                  Active
                </Badge>
              )}
            </Button>
          </div>
          
          {/* Mobile Filters Panel */}
          {showMobileFilters && (
            <Card className="lg:hidden mb-6">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mobile Filters Content - same as desktop but condensed */}
                <Tabs defaultValue="basic">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="price">Price & Exp</TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Hospital</Label>
                      <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Hospital" />
                        </SelectTrigger>
                        <SelectContent>
                          {hospitals.map((hospital) => (
                            <SelectItem key={hospital.value} value={hospital.value}>
                              {hospital.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Minimum Rating</Label>
                      <div className="flex items-center space-x-1">
                        {[4, 4.5].map((r) => (
                          <button
                            key={r}
                            onClick={() => setRating(r)}
                            className={`px-3 py-1.5 border rounded-md text-sm ${
                              rating === r
                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            {r}+ <Star className="inline-block h-3 w-3 fill-yellow-400 text-yellow-400" />
                          </button>
                        ))}
                        <button
                          onClick={() => setRating(null)}
                          className="px-2 py-1.5 border rounded-md text-sm border-gray-200 bg-white"
                        >
                          All
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="price" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Consultation Fee</Label>
                        <span className="text-sm text-gray-500">
                          ₹{priceRange[0]} - ₹{priceRange[1]}
                        </span>
                      </div>
                      <Slider
                        defaultValue={priceRange}
                        min={0}
                        max={2000}
                        step={100}
                        onValueChange={setPriceRange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Experience (years)</Label>
                        <span className="text-sm text-gray-500">
                          {experienceRange[0]} - {experienceRange[1]}+ years
                        </span>
                      </div>
                      <Slider
                        defaultValue={experienceRange}
                        min={0}
                        max={20}
                        step={1}
                        onValueChange={setExperienceRange}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="availability" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Availability</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Today', 'Tomorrow', 'Day After'].map((day) => (
                          <button
                            key={day}
                            onClick={() => toggleAvailability(day)}
                            className={`px-3 py-1.5 border rounded-md text-sm ${
                              availability.includes(day)
                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Consultation Type</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Video', 'Chat', 'In-person'].map((type) => (
                          <button
                            key={type}
                            onClick={() => toggleConsultationType(type)}
                            className={`px-3 py-1.5 border rounded-md text-sm ${
                              consultationType.includes(type)
                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-between pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Sort Options - Desktop */}
          <div className="hidden lg:flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">
              Showing {filteredDoctors.length} of {doctorsData.length} doctors
            </p>
            <Select defaultValue="relevance">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="rating-high">Highest Rated</SelectItem>
                <SelectItem value="experience-high">Most Experienced</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Doctor Cards */}
          <div className="space-y-6">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                    {/* Doctor Info Section */}
                    <div className="p-6 md:col-span-2 lg:col-span-3">
                      <div className="flex">
                        <div className="mr-4 flex-shrink-0">
                          <img 
                            src={doctor.image} 
                            alt={doctor.name}
                            className="h-24 w-24 rounded-full object-cover border-2 border-gray-100"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{doctor.name}</h3>
                          <p className="text-gray-500">{doctor.specialty}</p>
                          
                          <div className="flex items-center mt-1">
                            <div className="flex items-center text-yellow-500 mr-3">
                              <Star className="h-4 w-4 fill-yellow-400" />
                              <span className="ml-1 text-sm text-gray-700">{doctor.rating}</span>
                            </div>
                            <span className="text-sm text-gray-500">{doctor.reviewCount} reviews</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {doctor.experience} years exp.
                            </Badge>
                            
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              <MapPin className="h-3 w-3 mr-1" /> {doctor.location}
                            </Badge>
                            
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Clock className="h-3 w-3 mr-1" /> {doctor.nextAvailable}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-gray-600">{doctor.hospitalName}</span>
                            </div>
                            
                            <div className="flex items-center text-sm">
                              {doctor.consultationOptions.includes('Video') && (
                                <Badge variant="outline" className="mr-2 bg-purple-50 text-purple-700 border-purple-200">
                                  <Video className="h-3 w-3 mr-1" /> Video
                                </Badge>
                              )}
                              
                              {doctor.consultationOptions.includes('Chat') && (
                                <Badge variant="outline" className="mr-2 bg-teal-50 text-teal-700 border-teal-200">
                                  <MessageSquare className="h-3 w-3 mr-1" /> Chat
                                </Badge>
                              )}
                              
                              {doctor.consultationOptions.includes('In-person') && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  <MapPin className="h-3 w-3 mr-1" /> In-person
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Booking Section */}
                    <div className="bg-gray-50 p-6 flex flex-col justify-center border-l border-gray-100">
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-500 mb-1">Consultation Fee</p>
                        <p className="text-2xl font-bold text-orange-600">₹{doctor.consultationFee}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <Button 
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          onClick={() => bookAppointment(doctor.id)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Book Appointment
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => viewDoctorDetails(doctor.id)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSearch;