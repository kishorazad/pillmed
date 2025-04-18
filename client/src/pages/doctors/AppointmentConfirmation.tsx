import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  MessageSquare, 
  CheckCircle,
  ArrowLeft,
  Download,
  CreditCard,
  Wallet,
  Building2, // replacing Bank which is not available in lucide-react
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';

// Sample appointment data - in a real application, this would come from the previous booking step
const appointmentData = {
  doctor: {
    id: 1,
    name: 'Dr. Priya Sharma',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    specialty: 'Cardiologist',
    hospitalName: 'Apollo Hospitals',
    location: 'Delhi'
  },
  appointmentDate: '25 April 2025',
  appointmentDay: 'Tomorrow',
  appointmentTime: '10:30 AM',
  consultationType: 'Video',
  consultationFee: 800,
  taxes: 50,
  platformFee: 30,
  totalAmount: 880
};

const AppointmentConfirmation: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // State for patient information form
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientSymptoms, setPatientSymptoms] = useState('');
  
  // State for payment method
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Function to handle form submission and payment
  const confirmAppointment = () => {
    // Validate form
    if (!patientName || !patientAge || !patientGender || !patientPhone || !patientEmail) {
      toast({
        title: "Please fill all required fields",
        description: "All patient information is required to book an appointment.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real application, this would make an API call to process payment and confirm the appointment
    console.log('Confirming appointment with payment method:', paymentMethod);
    
    // Show success toast
    toast({
      title: "Appointment Confirmed!",
      description: `Your appointment with Dr. Priya Sharma on ${appointmentData.appointmentDate} at ${appointmentData.appointmentTime} has been confirmed.`,
      variant: "default",
    });
    
    // Navigate to success page
    navigate(`/doctors/${appointmentData.doctor.id}/success`);
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
            <BreadcrumbLink href="/doctors">Doctors</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/doctors/${appointmentData.doctor.id}`}>
              {appointmentData.doctor.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Confirm Appointment</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Appointment</h1>
        <p className="text-gray-600">
          Please review your appointment details and complete the booking process.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Patient Information */}
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>
                Please provide the patient details for this consultation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Full Name *</Label>
                  <Input 
                    id="patientName" 
                    placeholder="Enter patient's full name" 
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientAge">Age *</Label>
                    <Input 
                      id="patientAge" 
                      type="number" 
                      placeholder="Age" 
                      min="0"
                      max="120"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="patientGender">Gender *</Label>
                    <RadioGroup 
                      value={patientGender}
                      onValueChange={setPatientGender}
                      className="flex space-x-4 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="patientPhone">Mobile Number *</Label>
                  <Input 
                    id="patientPhone" 
                    placeholder="Enter mobile number" 
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    You'll receive appointment confirmation on this number
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="patientEmail">Email Address *</Label>
                  <Input 
                    id="patientEmail" 
                    type="email" 
                    placeholder="Enter email address" 
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patientSymptoms">Symptoms & Health Concerns</Label>
                <Textarea 
                  id="patientSymptoms" 
                  placeholder="Describe your symptoms and concerns in detail to help the doctor understand your condition better"
                  className="min-h-[100px]"
                  value={patientSymptoms}
                  onChange={(e) => setPatientSymptoms(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Options */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Choose your preferred payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-4"
              >
                <div className={`flex items-center border rounded-lg p-4 ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                  <RadioGroupItem value="card" id="card" className="sr-only" />
                  <Label 
                    htmlFor="card"
                    className="flex items-center cursor-pointer flex-1"
                  >
                    <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
                    <div className="flex-1">
                      <div>Credit / Debit Card</div>
                      <p className="text-sm text-gray-500">Pay securely with your card</p>
                    </div>
                  </Label>
                  <div className="flex space-x-2">
                    <img src="https://cdn-icons-png.flaticon.com/128/349/349221.png" alt="Visa" className="h-6" />
                    <img src="https://cdn-icons-png.flaticon.com/128/349/349228.png" alt="Mastercard" className="h-6" />
                    <img src="https://cdn-icons-png.flaticon.com/128/349/349230.png" alt="Amex" className="h-6" />
                  </div>
                </div>
                
                <div className={`flex items-center border rounded-lg p-4 ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                  <RadioGroupItem value="upi" id="upi" className="sr-only" />
                  <Label 
                    htmlFor="upi"
                    className="flex items-center cursor-pointer flex-1"
                  >
                    <Wallet className="h-5 w-5 text-gray-600 mr-3" />
                    <div className="flex-1">
                      <div>UPI</div>
                      <p className="text-sm text-gray-500">Pay directly from your bank account using UPI</p>
                    </div>
                  </Label>
                  <div className="flex space-x-2">
                    <img src="https://cdn-icons-png.flaticon.com/128/8465/8465515.png" alt="Google Pay" className="h-6" />
                    <img src="https://cdn-icons-png.flaticon.com/128/825/825454.png" alt="PhonePe" className="h-6" />
                    <img src="https://cdn-icons-png.flaticon.com/128/5986/5986234.png" alt="BHIM" className="h-6" />
                  </div>
                </div>
                
                <div className={`flex items-center border rounded-lg p-4 ${paymentMethod === 'netbanking' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                  <RadioGroupItem value="netbanking" id="netbanking" className="sr-only" />
                  <Label 
                    htmlFor="netbanking"
                    className="flex items-center cursor-pointer flex-1"
                  >
                    <Bank className="h-5 w-5 text-gray-600 mr-3" />
                    <div className="flex-1">
                      <div>Netbanking</div>
                      <p className="text-sm text-gray-500">Pay using your bank's online banking service</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => navigate(`/doctors/${appointmentData.doctor.id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600"
                onClick={confirmAppointment}
              >
                Pay & Confirm Appointment 
                <span className="ml-2">₹{appointmentData.totalAmount}</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Sidebar - Appointment Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Doctor Info */}
              <div className="flex items-start">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={appointmentData.doctor.image} alt={appointmentData.doctor.name} />
                  <AvatarFallback>{appointmentData.doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">{appointmentData.doctor.name}</h3>
                  <p className="text-sm text-gray-500">{appointmentData.doctor.specialty}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {appointmentData.doctor.hospitalName}, {appointmentData.doctor.location}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              {/* Appointment Details */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date
                  </div>
                  <div className="font-medium">{appointmentData.appointmentDate}</div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Time
                  </div>
                  <div className="font-medium">{appointmentData.appointmentTime}</div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    {appointmentData.consultationType === 'Video' && <Video className="h-4 w-4 mr-2" />}
                    {appointmentData.consultationType === 'Chat' && <MessageSquare className="h-4 w-4 mr-2" />}
                    {appointmentData.consultationType === 'In-person' && <MapPin className="h-4 w-4 mr-2" />}
                    Mode
                  </div>
                  <Badge 
                    variant="outline"
                    className={`
                      ${appointmentData.consultationType === 'Video' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                      ${appointmentData.consultationType === 'Chat' ? 'bg-teal-50 text-teal-700 border-teal-200' : ''}
                      ${appointmentData.consultationType === 'In-person' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                    `}
                  >
                    {appointmentData.consultationType}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              {/* Payment Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <div className="text-gray-600">Consultation Fee</div>
                  <div className="font-medium">₹{appointmentData.consultationFee}</div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="text-gray-600">Platform Fee</div>
                  <div className="font-medium">₹{appointmentData.platformFee}</div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="text-gray-600">Taxes</div>
                  <div className="font-medium">₹{appointmentData.taxes}</div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <div className="font-semibold">Total</div>
                  <div className="font-bold text-orange-600">₹{appointmentData.totalAmount}</div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-100 rounded-md p-3">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <div className="text-sm text-green-700">
                    Join instantly after successful payment. Consultation link will be sent to your email and mobile.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;