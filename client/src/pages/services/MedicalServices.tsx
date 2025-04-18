import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Search, Filter, Calendar, Clock, MapPin, User, CalendarDays, Tag, Info, BadgeCheck, Clipboard, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Sample services data
const servicesData = [
  {
    id: 1,
    name: 'Doctor Home Visit',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    category: 'Medical Consultation',
    price: 1499,
    duration: '30-45 minutes',
    availability: true,
    rating: 4.8,
    reviewCount: 124,
    description: 'Comprehensive medical consultation at your home by a qualified doctor. Includes general examination, prescription, and follow-up recommendations.',
    professionals: [
      {
        id: 1,
        name: 'Dr. Rajesh Mehta',
        specialty: 'General Physician',
        experience: 12,
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Gujarati'],
        availability: ['Morning', 'Evening'],
        rating: 4.9
      },
      {
        id: 2,
        name: 'Dr. Priya Sharma',
        specialty: 'General Physician',
        experience: 8,
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Bengali'],
        availability: ['Afternoon', 'Evening'],
        rating: 4.7
      },
      {
        id: 3,
        name: 'Dr. Karthik Sundaram',
        specialty: 'General Physician',
        experience: 15,
        image: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Tamil', 'Malayalam'],
        availability: ['Morning', 'Afternoon'],
        rating: 4.8
      }
    ],
    inclusions: [
      'Physical examination',
      'Vital signs check',
      'Medical history review',
      'Prescription writing',
      'Basic diagnostic tests',
      'Follow-up recommendations'
    ]
  },
  {
    id: 2,
    name: 'Specialist Doctor Visit',
    image: 'https://images.unsplash.com/photo-1651069188152-bf30b5af2a0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    category: 'Medical Consultation',
    price: 2999,
    duration: '45-60 minutes',
    availability: true,
    rating: 4.9,
    reviewCount: 87,
    description: 'Home visit from a specialist doctor for focused medical concerns. The specialist will examine, diagnose, and develop a treatment plan specific to your condition.',
    professionals: [
      {
        id: 4,
        name: 'Dr. Anita Desai',
        specialty: 'Cardiologist',
        experience: 18,
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Marathi'],
        availability: ['Morning', 'Evening'],
        rating: 4.9
      },
      {
        id: 5,
        name: 'Dr. Vikram Malhotra',
        specialty: 'Neurologist',
        experience: 14,
        image: 'https://images.unsplash.com/photo-1637059824899-a441006a6875?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Punjabi'],
        availability: ['Afternoon'],
        rating: 4.8
      },
      {
        id: 6,
        name: 'Dr. Sunita Rao',
        specialty: 'Endocrinologist',
        experience: 12,
        image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Telugu'],
        availability: ['Morning', 'Afternoon'],
        rating: 4.7
      }
    ],
    inclusions: [
      'Specialized assessment',
      'In-depth history review',
      'Physical examination',
      'Detailed treatment plan',
      'Prescription',
      'Referrals if needed',
      'Specialized diagnostic interpretations'
    ]
  },
  {
    id: 3,
    name: 'Nurse Home Visit',
    image: 'https://images.unsplash.com/photo-1576091127566-e9d4278554e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    category: 'Nursing Care',
    price: 699,
    duration: '30-60 minutes',
    availability: true,
    rating: 4.7,
    reviewCount: 156,
    description: 'Professional nursing care at home. Our qualified nurses can administer medications, change dressings, monitor vital signs, and provide care instructions.',
    professionals: [
      {
        id: 7,
        name: 'Nurse Lakshmi Singh',
        specialty: 'Registered Nurse',
        experience: 7,
        image: 'https://images.unsplash.com/photo-1616498712532-8d1336d1d6f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Punjabi'],
        availability: ['Morning', 'Afternoon', 'Evening'],
        rating: 4.8
      },
      {
        id: 8,
        name: 'Nurse Rajan Kumar',
        specialty: 'Registered Nurse',
        experience: 9,
        image: 'https://images.unsplash.com/photo-1581595219315-a2f6c9a19e8a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Bengali'],
        availability: ['Morning', 'Afternoon', 'Evening'],
        rating: 4.6
      },
      {
        id: 9,
        name: 'Nurse Meena Reddy',
        specialty: 'Registered Nurse',
        experience: 5,
        image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Telugu'],
        availability: ['Morning', 'Evening'],
        rating: 4.7
      }
    ],
    inclusions: [
      'Vital signs monitoring',
      'Medication administration',
      'Wound dressing',
      'Catheter care',
      'Basic health assessment',
      'Care instructions'
    ]
  },
  {
    id: 4,
    name: 'Daily Nursing Care',
    image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    category: 'Nursing Care',
    price: 1499,
    duration: '3-8 hours',
    availability: true,
    rating: 4.8,
    reviewCount: 92,
    description: 'Comprehensive daily nursing care for patients requiring regular attention. Our nurses provide extended care including personal hygiene, medication management, and health monitoring.',
    professionals: [
      {
        id: 10,
        name: 'Nurse Ananya Dasgupta',
        specialty: 'Senior Registered Nurse',
        experience: 10,
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Bengali'],
        availability: ['Morning', 'Afternoon', 'Evening'],
        rating: 4.9
      },
      {
        id: 11,
        name: 'Nurse Ramesh Patel',
        specialty: 'Senior Registered Nurse',
        experience: 8,
        image: 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Gujarati'],
        availability: ['Morning', 'Afternoon'],
        rating: 4.7
      }
    ],
    inclusions: [
      'Extended personal care',
      'Medication management',
      'Continuous health monitoring',
      'Mobility assistance',
      'Feeding support if needed',
      'Hygiene maintenance',
      'Basic physiotherapy exercises',
      'Health record maintenance'
    ]
  },
  {
    id: 5,
    name: 'Physiotherapy Session',
    image: 'https://images.unsplash.com/photo-1630963563455-01c34238fbb7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    category: 'Therapy',
    price: 899,
    duration: '45-60 minutes',
    availability: true,
    rating: 4.9,
    reviewCount: 104,
    description: 'Professional physiotherapy session at home. Our physiotherapists assess movement issues, provide therapy, and teach exercises for continued improvement.',
    professionals: [
      {
        id: 12,
        name: 'Dr. Sunil Ahuja',
        specialty: 'Senior Physiotherapist',
        experience: 11,
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Punjabi'],
        availability: ['Morning', 'Evening'],
        rating: 4.9
      },
      {
        id: 13,
        name: 'Dr. Maya Iyer',
        specialty: 'Physiotherapist',
        experience: 7,
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Tamil'],
        availability: ['Afternoon', 'Evening'],
        rating: 4.8
      }
    ],
    inclusions: [
      'Complete physical assessment',
      'Personalized therapy session',
      'Pain management techniques',
      'Mobility improvement exercises',
      'Home exercise program',
      'Progress tracking',
      'Equipment recommendations'
    ]
  },
  {
    id: 6,
    name: 'Elder Care Visit',
    image: 'https://images.unsplash.com/photo-1574279548156-7b17a2527022?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    category: 'Geriatric Care',
    price: 999,
    duration: '60-90 minutes',
    availability: true,
    rating: 4.8,
    reviewCount: 78,
    description: 'Specialized care for elderly patients. Our geriatric care specialists provide health assessments, medication reviews, and personalized care plans focused on aging-related concerns.',
    professionals: [
      {
        id: 14,
        name: 'Dr. Suresh Menon',
        specialty: 'Geriatric Specialist',
        experience: 15,
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Malayalam'],
        availability: ['Morning', 'Afternoon'],
        rating: 4.9
      },
      {
        id: 15,
        name: 'Nurse Deepa Mathur',
        specialty: 'Geriatric Care Nurse',
        experience: 9,
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        languages: ['English', 'Hindi', 'Rajasthani'],
        availability: ['Morning', 'Evening'],
        rating: 4.7
      }
    ],
    inclusions: [
      'Geriatric health assessment',
      'Medication review and management',
      'Cognitive assessment',
      'Mobility evaluation',
      'Fall risk assessment',
      'Nutrition counseling',
      'Care planning',
      'Family education'
    ]
  }
];

const MedicalServices: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<number | null>(null);
  
  // Filter services based on search and filters
  const filteredServices = servicesData.filter(item => {
    // Search filter
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    // Price filter
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });
  
  // Get all unique categories
  const categories = Array.from(new Set(servicesData.map(item => item.category)));
  
  const handleBookService = () => {
    if (!selectedDate || !selectedTimeSlot || !selectedProfessional) {
      toast({
        title: "Incomplete booking information",
        description: "Please select a date, time slot, and professional to continue",
        variant: "destructive"
      });
      return;
    }
    
    const service = servicesData.find(s => s.id === selectedService);
    const professional = service?.professionals.find(p => p.id === selectedProfessional);
    
    toast({
      title: "Service scheduled successfully",
      description: `${service?.name} with ${professional?.name} on ${format(selectedDate, 'MMMM d, yyyy')} at ${selectedTimeSlot}`,
    });
    
    // Reset selections or navigate
    // navigate('/booking-confirmation');
  };
  
  const timeSlots = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 1:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
    "5:00 PM - 6:00 PM",
    "6:00 PM - 7:00 PM"
  ];
  
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
            <BreadcrumbLink href="/services">Services</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Medical Home Services</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Home Services</h1>
        <p className="text-gray-600">
          Book professional healthcare providers to visit your home for medical consultations, nursing care, and therapy services.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search Services</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="search"
                    placeholder="Search by service name..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Category */}
              <div className="space-y-2">
                <Label>Service Category</Label>
                <RadioGroup 
                  value={selectedCategory || ''} 
                  onValueChange={(value) => setSelectedCategory(value === '' ? null : value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="category-all" />
                    <Label htmlFor="category-all" className="cursor-pointer">All Categories</Label>
                  </div>
                  
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <RadioGroupItem value={category} id={`category-${category}`} />
                      <Label htmlFor={`category-${category}`} className="cursor-pointer">{category}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {/* Price Range */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Price Range</Label>
                  <span className="text-sm text-gray-500">
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                  </span>
                </div>
                <Slider
                  defaultValue={priceRange}
                  min={0}
                  max={3000}
                  step={100}
                  onValueChange={setPriceRange}
                />
              </div>
              
              {/* Clear Filters */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setPriceRange([0, 3000]);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Services List */}
        <div className="lg:col-span-3">
          {selectedService !== null ? (
            <ServiceDetail 
              service={servicesData.find(item => item.id === selectedService)!}
              onBack={() => setSelectedService(null)}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTimeSlot={selectedTimeSlot}
              setSelectedTimeSlot={setSelectedTimeSlot}
              selectedProfessional={selectedProfessional}
              setSelectedProfessional={setSelectedProfessional}
              timeSlots={timeSlots}
              onBookService={handleBookService}
            />
          ) : (
            <>
              {/* Results Summary */}
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-500">
                  Showing {filteredServices.length} of {servicesData.length} services
                </p>
                <Select defaultValue="featured">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Service Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredServices.map(service => (
                  <Card key={service.id} className="overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={service.image} 
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {service.category}
                        </Badge>
                        <div className="flex items-center text-yellow-500">
                          <span>★</span>
                          <span className="ml-1 text-sm text-gray-700">{service.rating} ({service.reviewCount})</span>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-orange-500" />
                          <span>{service.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-orange-500" />
                          <span>{service.professionals.length} Professionals</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-gray-500 text-sm">Service Fee</p>
                          <p className="text-2xl font-bold text-orange-600">₹{service.price}</p>
                        </div>
                        
                        <Button 
                          className="bg-orange-500 hover:bg-orange-600"
                          onClick={() => setSelectedService(service.id)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                      setPriceRange([0, 3000]);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface ServiceDetailProps {
  service: any;
  onBack: () => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: (timeSlot: string | null) => void;
  selectedProfessional: number | null;
  setSelectedProfessional: (professionalId: number | null) => void;
  timeSlots: string[];
  onBookService: () => void;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ 
  service, 
  onBack,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  selectedProfessional,
  setSelectedProfessional,
  timeSlots,
  onBookService
}) => {
  return (
    <div>
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
      </Button>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Service Image */}
            <div className="rounded-lg overflow-hidden">
              <img 
                src={service.image} 
                alt={service.name}
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Service Details */}
            <div>
              <Badge variant="outline" className="mb-2 bg-orange-50 text-orange-700 border-orange-200">
                {service.category}
              </Badge>
              
              <h1 className="text-2xl font-bold mb-2">{service.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center text-yellow-500 mr-3">
                  <span>★</span>
                  <span className="ml-1 text-sm text-gray-700">{service.rating}</span>
                </div>
                <span className="text-sm text-gray-500">{service.reviewCount} reviews</span>
              </div>
              
              <p className="text-gray-700 mb-6">{service.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">Duration</h3>
                    <p className="text-gray-700">{service.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Tag className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">Price</h3>
                    <p className="text-gray-700">₹{service.price}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <BadgeCheck className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">Service Type</h3>
                    <p className="text-gray-700">{service.category}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">Available At</h3>
                    <p className="text-gray-700">Your Home</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">What's Included</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {service.inclusions.map((inclusion: string, index: number) => (
                    <li key={index} className="flex items-center text-sm">
                      <div className="flex-shrink-0 h-4 w-4 text-orange-500 mr-2">✓</div>
                      <span>{inclusion}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    For the best experience, please have your medical records and any previous prescription ready. Keep the home well-ventilated and ensure a quiet environment for the consultation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Booking Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Book This Service</CardTitle>
          <CardDescription>
            Select a date, time, and professional for your home appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Date Selection */}
            <div>
              <Label htmlFor="date" className="block mb-2">Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => 
                      date < new Date(new Date().setHours(0, 0, 0, 0)) || // Past dates
                      date > new Date(new Date().setDate(new Date().getDate() + 30)) // More than 30 days in future
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Time Slot Selection */}
            <div>
              <Label className="block mb-2">Select Time Slot</Label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <div key={slot} className="flex items-center">
                    <input
                      type="radio"
                      id={`time-${slot}`}
                      value={slot}
                      checked={selectedTimeSlot === slot}
                      onChange={() => setSelectedTimeSlot(slot)}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={`time-${slot}`}
                      className="flex px-3 py-2 bg-white border rounded-md cursor-pointer text-sm w-full peer-checked:border-orange-500 peer-checked:bg-orange-50"
                    >
                      {slot}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Professional Selection */}
            <div>
              <Label className="block mb-2">Select Healthcare Professional</Label>
              <div className="space-y-4">
                {service.professionals.map((professional: any) => (
                  <div key={professional.id} className="flex items-start">
                    <input
                      type="radio"
                      id={`professional-${professional.id}`}
                      value={professional.id}
                      checked={selectedProfessional === professional.id}
                      onChange={() => setSelectedProfessional(professional.id)}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={`professional-${professional.id}`}
                      className="flex cursor-pointer w-full border rounded-md peer-checked:border-orange-500 peer-checked:bg-orange-50 overflow-hidden"
                    >
                      <div className="flex p-3 w-full">
                        <div className="flex-shrink-0 mr-3">
                          <img 
                            src={professional.image} 
                            alt={professional.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{professional.name}</h4>
                          <p className="text-sm text-gray-500">{professional.specialty}</p>
                          <div className="flex mt-1">
                            <span className="text-yellow-500 text-xs mr-1">★</span>
                            <span className="text-xs text-gray-700">{professional.rating}</span>
                            <span className="text-xs text-gray-500 ml-2">{professional.experience} years exp.</span>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Service Fee</p>
            <p className="text-2xl font-bold text-orange-600">₹{service.price}</p>
          </div>
          <Button 
            className="bg-orange-500 hover:bg-orange-600"
            disabled={!selectedDate || !selectedTimeSlot || !selectedProfessional}
            onClick={onBookService}
          >
            Book Appointment
          </Button>
        </CardFooter>
      </Card>
      
      {/* Customer Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <h3 className="font-semibold">Customer Support</h3>
                <p className="text-gray-700">1800-123-4567 (Toll-Free)</p>
                <p className="text-sm text-gray-500">Available 24/7 for any inquiries or assistance</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <h3 className="font-semibold">Service Coverage</h3>
                <p className="text-gray-700">All major cities and surrounding areas</p>
                <p className="text-sm text-gray-500">Enter your pincode during checkout to confirm availability</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clipboard className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <h3 className="font-semibold">Cancellation Policy</h3>
                <p className="text-gray-700">Free cancellation up to 4 hours before appointment</p>
                <p className="text-sm text-gray-500">50% refund for cancellations between 4 hours and 1 hour before appointment</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalServices;