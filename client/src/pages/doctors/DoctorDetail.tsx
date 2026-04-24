import React, { useState, useEffect } from 'react';
import { useLocation, Link, useRoute } from 'wouter';
import DoctorSEO from '@/components/seo/DoctorSEO';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Award,
  Languages,
  ChevronRight,
  ChevronLeft,
  Video,
  MessageSquare,
  CheckCircle,
  User,
  ThumbsUp,
  X,
  Info,
  File,
  Download,
  Share2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Sample doctor data
const doctorDetails = {
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
  education: [
    { degree: 'MBBS', institute: 'All India Institute of Medical Sciences (AIIMS)', year: '2006' },
    { degree: 'MD (Medicine)', institute: 'AIIMS, Delhi', year: '2010' },
    { degree: 'DM (Cardiology)', institute: 'Sanjay Gandhi Postgraduate Institute of Medical Sciences', year: '2013' }
  ],
  languages: ['English', 'Hindi', 'Punjabi'],
  about: 'Dr. Priya Sharma is a renowned cardiologist with over 12 years of experience in diagnosing and treating cardiac conditions. She specializes in interventional cardiology and has performed over 1000 angioplasties. She has been recognized with multiple awards for her contributions to cardiac care, including the Young Investigator Award from the Cardiological Society of India.\n\nHer areas of expertise include coronary angiography, angioplasty, pacemaker implantation, and management of heart failure. She follows a patient-centered approach, focusing on preventive cardiology and lifestyle modifications alongside medical management.',
  consultationOptions: ['Video', 'Chat', 'In-person'],
  nextAvailable: '10:30 AM Today',
  awards: [
    { title: 'Young Investigator Award', organization: 'Cardiological Society of India', year: '2018' },
    { title: 'Best Research Paper', organization: 'Indian Medical Association', year: '2016' }
  ],
  specializations: [
    'Interventional Cardiology',
    'Coronary Angiography',
    'Angioplasty',
    'Pacemaker Implantation',
    'Heart Failure Management',
    'Preventive Cardiology'
  ],
  services: [
    'Echocardiography',
    'Electrocardiogram (ECG)',
    'Stress Test',
    'Holter Monitoring',
    'Coronary Angiography',
    'Angioplasty',
    'Pacemaker Implantation'
  ],
  reviews: [
    {
      id: 1,
      name: 'Rahul Khanna',
      date: '2 weeks ago',
      rating: 5,
      comment: 'Dr. Sharma was exceptionally thorough and patient. She took the time to explain my condition in detail and answered all my questions. The treatment she prescribed has shown significant improvement in my condition.',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 2,
      name: 'Anita Desai',
      date: '1 month ago',
      rating: 4,
      comment: 'Very professional and knowledgeable doctor. The consultation was thorough and she provided clear explanations. The only drawback was the long waiting time at the clinic.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 3,
      name: 'Suresh Patel',
      date: '2 months ago',
      rating: 5,
      comment: 'Dr. Sharma is an excellent cardiologist who truly cares about her patients. She diagnosed my condition accurately when other doctors had missed it, and the treatment has been life-changing.',
      avatar: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    }
  ],
  availableTimeSlots: {
    'Today': [
      { time: '10:30 AM', available: true },
      { time: '11:00 AM', available: true },
      { time: '11:30 AM', available: false },
      { time: '12:00 PM', available: true },
      { time: '12:30 PM', available: false },
      { time: '4:00 PM', available: true },
      { time: '4:30 PM', available: true },
      { time: '5:00 PM', available: true },
      { time: '5:30 PM', available: false }
    ],
    'Tomorrow': [
      { time: '9:00 AM', available: true },
      { time: '9:30 AM', available: true },
      { time: '10:00 AM', available: true },
      { time: '10:30 AM', available: true },
      { time: '11:00 AM', available: false },
      { time: '11:30 AM', available: true },
      { time: '3:00 PM', available: true },
      { time: '3:30 PM', available: true },
      { time: '4:00 PM', available: true },
      { time: '4:30 PM', available: true }
    ],
    'Day After': [
      { time: '10:00 AM', available: true },
      { time: '10:30 AM', available: true },
      { time: '11:00 AM', available: true },
      { time: '11:30 AM', available: true },
      { time: '12:00 PM', available: true },
      { time: '2:00 PM', available: true },
      { time: '2:30 PM', available: true },
      { time: '3:00 PM', available: true },
      { time: '3:30 PM', available: true }
    ]
  },
  hospital: {
    name: 'Apollo Hospitals',
    address: 'Sarita Vihar, Delhi Mathura Road, New Delhi - 110076',
    phone: '+91-11-2692 5858',
    website: 'https://www.apollohospitals.com/',
    image: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
  },
  prescriptions: [
    {
      id: 'PRE123',
      date: '15 Mar 2023',
      condition: 'Hypertension',
      medications: [
        { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' },
        { name: 'Losartan', dosage: '50mg', frequency: 'Once daily', duration: '30 days' }
      ],
      advice: 'Monitor blood pressure daily. Reduce salt intake. Exercise regularly for 30 minutes.',
      followUp: '1 month'
    }
  ]
};

// Rating distribution data
const ratingDistribution = [
  { rating: 5, percentage: 75 },
  { rating: 4, percentage: 15 },
  { rating: 3, percentage: 5 },
  { rating: 2, percentage: 3 },
  { rating: 1, percentage: 2 }
];

const DoctorDetail: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [matched, params] = useRoute('/doctors/:id');
  const doctorId = matched ? parseInt(params.id) : 1;
  
  const [selectedDay, setSelectedDay] = useState('Today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [consultationType, setConsultationType] = useState('Video');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  
  // Use React Query to fetch doctor data
  const { data: doctor, isLoading: isLoadingDoctor } = useQuery({
    queryKey: ['/api/doctors', doctorId],
    enabled: !!doctorId,
    // Use static data if API call fails
    placeholderData: doctorDetails
  });
  
  // Fetch available time slots
  const { data: availableSlots, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['/api/appointments/available-slots', doctorId, selectedDay],
    enabled: !!doctorId && !!selectedDay,
    placeholderData: doctorDetails.availableTimeSlots[selectedDay] || []
  });
  
  const { toast } = useToast();
  
  const displayedReviews = showAllReviews 
    ? (doctor?.reviews || doctorDetails.reviews) 
    : (doctor?.reviews || doctorDetails.reviews).slice(0, 2);
  
  // Create appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await apiRequest('POST', '/api/appointments/book', appointmentData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully scheduled",
        variant: "default",
      });
      // Navigate to confirmation page with the new appointment ID
      setLocation(`/doctors/${doctorId}/appointment/${data.id}/confirmation`);
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Could not book appointment. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Function to book appointment
  const bookAppointment = () => {
    if (selectedTimeSlot) {
      const appointmentData = {
        doctorId,
        appointmentDate: selectedDay,
        appointmentTime: selectedTimeSlot,
        consultationType,
        patientId: 1, // In a real app, this would be the logged-in user's ID
        symptoms: '',
        notes: ''
      };
      
      bookAppointmentMutation.mutate(appointmentData);
    } else {
      setBookingDialogOpen(true);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* SEO Component */}
      <DoctorSEO
        doctor={{
          id: doctorDetails.id,
          name: doctorDetails.name,
          specialty: doctorDetails.specialty,
          hospitalName: doctorDetails.hospitalName,
          location: doctorDetails.location,
          about: doctorDetails.about,
          image: doctorDetails.image
        }}
        isDetailPage={true}
      />
      
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/doctors">Doctors</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Dr. Priya Sharma</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Doctor Profile Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row">
                <div className="md:mr-6 mb-4 md:mb-0 flex-shrink-0">
                  <img 
                    src={doctorDetails.image} 
                    alt={doctorDetails.name}
                    className="h-40 w-40 rounded-full object-cover border-4 border-gray-100 mx-auto md:mx-0"
                  />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{doctorDetails.name}</h1>
                  <p className="text-gray-600 mb-3">{doctorDetails.specialty}</p>
                  
                  <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
                    <div className="flex items-center mr-4">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {doctorDetails.hospitalName}, {doctorDetails.location}
                    </div>
                    <div className="flex items-center mr-4">
                      <Award className="h-4 w-4 text-gray-400 mr-1" />
                      {doctorDetails.experience} years exp.
                    </div>
                    <div className="flex items-center">
                      <Languages className="h-4 w-4 text-gray-400 mr-1" />
                      {doctorDetails.languages.join(', ')}
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex items-center bg-orange-50 text-orange-700 px-2 py-1 rounded-md">
                      <Star className="h-4 w-4 fill-orange-500 text-orange-500 mr-1" />
                      <span className="font-medium">{doctorDetails.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      ({doctorDetails.reviewCount} patient reviews)
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {doctorDetails.consultationOptions.map((option) => (
                      <Badge 
                        key={option} 
                        variant="outline"
                        className={`
                          ${option === 'Video' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                          ${option === 'Chat' ? 'bg-teal-50 text-teal-700 border-teal-200' : ''}
                          ${option === 'In-person' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        `}
                      >
                        {option === 'Video' && <Video className="h-3 w-3 mr-1" />}
                        {option === 'Chat' && <MessageSquare className="h-3 w-3 mr-1" />}
                        {option === 'In-person' && <MapPin className="h-3 w-3 mr-1" />}
                        {option} Consultation
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs Section */}
          <Tabs
            defaultValue="overview"
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="mb-8"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="hospital">Hospital</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About Dr. {doctorDetails.name.split(' ')[1]}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-gray-700 whitespace-pre-line">{doctorDetails.about}</p>
                  </div>
                  
                  {/* Specializations */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Specializations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {doctorDetails.specializations.map((specialization, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-700">{specialization}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Services */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {doctorDetails.services.map((service, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-700">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Reviews</CardTitle>
                  <CardDescription>
                    Based on {doctorDetails.reviewCount} reviews
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rating Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                    <div className="flex items-center justify-center flex-col">
                      <div className="text-5xl font-bold text-gray-900 mb-2">
                        {doctorDetails.rating}
                      </div>
                      <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.floor(doctorDetails.rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : star <= doctorDetails.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-500 text-sm">
                        {doctorDetails.reviewCount} verified patient reviews
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {ratingDistribution.map((item) => (
                        <div key={item.rating} className="flex items-center">
                          <div className="w-8 text-sm font-medium text-gray-700">
                            {item.rating} <Star className="h-3 w-3 inline-block text-yellow-400 fill-yellow-400" />
                          </div>
                          <div className="flex-1 mx-2">
                            <Progress value={item.percentage} className="h-2" />
                          </div>
                          <div className="w-8 text-xs text-gray-500">
                            {item.percentage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Individual Reviews */}
                  <div className="space-y-6">
                    {displayedReviews.map((review) => (
                      <div key={review.id} className="pb-6 border-b last:border-b-0 last:pb-0">
                        <div className="flex items-start">
                          <Avatar className="h-10 w-10 mr-4">
                            <AvatarImage src={review.avatar} alt={review.name} />
                            <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{review.name}</h4>
                              <span className="text-xs text-gray-500">{review.date}</span>
                            </div>
                            <div className="flex items-center mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                            <div className="flex items-center mt-3">
                              <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Helpful
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {doctorDetails.reviews.length > 2 && (
                      <Button
                        variant="outline"
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="w-full"
                      >
                        {showAllReviews ? 'Show Less' : `Show All ${doctorDetails.reviews.length} Reviews`}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Experience Tab */}
            <TabsContent value="experience" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Education & Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Education */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Education</h3>
                    <div className="space-y-4">
                      {doctorDetails.education.map((edu, index) => (
                        <div key={index} className="flex">
                          <div className="mr-4 mt-1">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <Award className="h-5 w-5" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                            <p className="text-gray-600">{edu.institute}</p>
                            <p className="text-sm text-gray-500">{edu.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Awards & Recognitions */}
                  {doctorDetails.awards && doctorDetails.awards.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-gray-900">Awards & Recognitions</h3>
                      <div className="space-y-4">
                        {doctorDetails.awards.map((award, index) => (
                          <div key={index} className="flex">
                            <div className="mr-4 mt-1">
                              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                <Award className="h-5 w-5" />
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{award.title}</h4>
                              <p className="text-gray-600">{award.organization}</p>
                              <p className="text-sm text-gray-500">{award.year}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Hospital Tab */}
            <TabsContent value="hospital" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{doctorDetails.hospital.name}</CardTitle>
                  <CardDescription>
                    Where Dr. {doctorDetails.name.split(' ')[1]} practices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <img 
                    src={doctorDetails.hospital.image} 
                    alt={doctorDetails.hospital.name}
                    className="w-full h-48 md:h-64 object-cover rounded-lg"
                  />
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Address</h4>
                        <p className="text-gray-600">{doctorDetails.hospital.address}</p>
                        <a 
                          href={`https://maps.google.com/?q=${doctorDetails.hospital.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 text-sm inline-flex items-center mt-1"
                        >
                          Get Directions
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Contact</h4>
                        <p className="text-gray-600">{doctorDetails.hospital.phone}</p>
                        <a 
                          href={doctorDetails.hospital.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 text-sm inline-flex items-center mt-1"
                        >
                          Visit Website
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Appointment Booking Card */}
          <Card className="mb-6 sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle>Book an Appointment</CardTitle>
              <CardDescription>
                Consultation Fee: <span className="font-semibold text-orange-600">₹{doctorDetails.consultationFee}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Consultation Type */}
              <div className="space-y-2">
                <Label>Consultation Type</Label>
                <RadioGroup 
                  defaultValue="Video"
                  value={consultationType}
                  onValueChange={setConsultationType}
                  className="grid grid-cols-3 gap-2"
                >
                  <div>
                    <RadioGroupItem 
                      value="Video" 
                      id="video" 
                      className="sr-only peer" 
                      disabled={!doctorDetails.consultationOptions.includes('Video')}
                    />
                    <Label
                      htmlFor="video"
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-3 hover:bg-gray-50 ${
                        consultationType === 'Video' ? 'border-orange-500' : ''
                      } ${
                        !doctorDetails.consultationOptions.includes('Video') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <Video className={`h-6 w-6 ${consultationType === 'Video' ? 'text-orange-500' : 'text-gray-500'}`} />
                      <span className="mt-2 text-sm font-medium">Video</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="Chat" 
                      id="chat" 
                      className="sr-only peer" 
                      disabled={!doctorDetails.consultationOptions.includes('Chat')}
                    />
                    <Label
                      htmlFor="chat"
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-3 hover:bg-gray-50 ${
                        consultationType === 'Chat' ? 'border-orange-500' : ''
                      } ${
                        !doctorDetails.consultationOptions.includes('Chat') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <MessageSquare className={`h-6 w-6 ${consultationType === 'Chat' ? 'text-orange-500' : 'text-gray-500'}`} />
                      <span className="mt-2 text-sm font-medium">Chat</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="In-person" 
                      id="in-person" 
                      className="sr-only peer" 
                      disabled={!doctorDetails.consultationOptions.includes('In-person')}
                    />
                    <Label
                      htmlFor="in-person"
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-3 hover:bg-gray-50 ${
                        consultationType === 'In-person' ? 'border-orange-500' : ''
                      } ${
                        !doctorDetails.consultationOptions.includes('In-person') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <MapPin className={`h-6 w-6 ${consultationType === 'In-person' ? 'text-orange-500' : 'text-gray-500'}`} />
                      <span className="mt-2 text-sm font-medium">In-person</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Day Selection */}
              <div className="space-y-2">
                <Label>Select Day</Label>
                <div className="flex space-x-2">
                  {Object.keys(doctorDetails.availableTimeSlots).map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        setSelectedDay(day);
                        setSelectedTimeSlot(null);
                      }}
                      className={`px-3 py-2 border rounded-md text-sm flex-1 ${
                        selectedDay === day
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Time Slots */}
              <div className="space-y-2">
                <Label>Select Time Slot</Label>
                <div className="grid grid-cols-3 gap-2">
                  {doctorDetails.availableTimeSlots[selectedDay].map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTimeSlot(slot.time)}
                      className={`px-3 py-2 border rounded-md text-sm ${
                        selectedTimeSlot === slot.time
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : slot.available
                          ? 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={bookAppointment}
                disabled={!selectedTimeSlot}
              >
                Book Appointment
              </Button>
              
              <p className="text-center text-sm text-gray-500">
                You won't be charged yet
              </p>
            </CardContent>
          </Card>
          
          {/* Past Prescriptions Card */}
          {doctorDetails.prescriptions && doctorDetails.prescriptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Past Prescriptions</CardTitle>
                <CardDescription>
                  Prescriptions from previous consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {doctorDetails.prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border rounded-md p-4">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{prescription.condition}</h4>
                          <p className="text-sm text-gray-500">{prescription.date}</p>
                        </div>
                        <div className="flex">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="pt-2 border-t text-sm text-gray-600">
                        <div className="flex items-center mb-1">
                          <File className="h-4 w-4 text-gray-400 mr-2" />
                          <span>Prescription #{prescription.id}</span>
                        </div>
                        <Button variant="link" className="p-0 h-auto text-orange-600 text-sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Booking Dialog for mobile */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a time slot</DialogTitle>
            <DialogDescription>
              Please select a time slot to continue with your booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Day</Label>
              <div className="flex space-x-2">
                {Object.keys(doctorDetails.availableTimeSlots).map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDay(day);
                      setSelectedTimeSlot(null);
                    }}
                    className={`px-3 py-2 border rounded-md text-sm flex-1 ${
                      selectedDay === day
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Select Time Slot</Label>
              <div className="grid grid-cols-3 gap-2">
                {doctorDetails.availableTimeSlots[selectedDay].map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedTimeSlot(slot.time)}
                    className={`px-3 py-2 border rounded-md text-sm ${
                      selectedTimeSlot === slot.time
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : slot.available
                        ? 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setBookingDialogOpen(false);
                  if (selectedTimeSlot) {
                    bookAppointment();
                  }
                }}
                disabled={!selectedTimeSlot}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDetail;