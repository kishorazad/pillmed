import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  CalendarIcon, 
  Clock, 
  Info, 
  CheckCircle, 
  Calendar as CalendarIcon2,
  User,
  Phone,
  Mail,
  FileText,
  ClipboardCheck,
  Tag,
  ChevronRight,
  Heart,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import OptimizedImage from "../admin/OptimizedImage";

// Type definitions
interface Hospital {
  id: number;
  name: string;
  address: string;
  specialties: string[];
  image: string;
  distance?: string;
  isEmergency?: boolean;
  offers?: {
    title: string;
    description: string;
    validUntil?: string;
    isHighlighted?: boolean;
  }[];
}

interface Department {
  id: number;
  name: string;
  description: string;
  doctors: number;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  qualification: string;
  experience: number;
  image: string;
  availability: string[];
  fees: number;
}

interface Appointment {
  id: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: Date;
  appointmentTime: string;
  department: string;
  doctor: string;
  reasonForVisit: string;
  isFirstVisit: boolean;
  insuranceProvider?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}

const timeSlots = [
  "08:00 AM", 
  "08:30 AM", 
  "09:00 AM", 
  "09:30 AM", 
  "10:00 AM", 
  "10:30 AM", 
  "11:00 AM", 
  "11:30 AM",
  "12:00 PM", 
  "02:00 PM", 
  "02:30 PM", 
  "03:00 PM", 
  "03:30 PM", 
  "04:00 PM", 
  "04:30 PM", 
  "05:00 PM", 
  "05:30 PM"
];

interface AppointmentBookingProps {
  hospital: Hospital;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ hospital }) => {
  // State
  const [step, setStep] = useState(1);
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [viewAllOffers, setViewAllOffers] = useState(false);
  
  const { toast } = useToast();
  
  // Mock data for development
  const departments: Department[] = [
    { id: 1, name: "General Medicine", description: "For common illnesses and preventive care", doctors: 8 },
    { id: 2, name: "Pediatrics", description: "Child healthcare from birth through adolescence", doctors: 5 },
    { id: 3, name: "Orthopedics", description: "Bone and joint related issues", doctors: 6 },
    { id: 4, name: "Cardiology", description: "Heart related consultations and treatments", doctors: 4 },
    { id: 5, name: "Dermatology", description: "Skin, hair and nail treatments", doctors: 3 },
    { id: 6, name: "Gynecology", description: "Women's health and reproductive system", doctors: 5 },
    { id: 7, name: "Neurology", description: "Nervous system disorders", doctors: 2 },
    { id: 8, name: "Ophthalmology", description: "Eye care and vision health", doctors: 3 },
    { id: 9, name: "ENT", description: "Ear, nose, and throat specialists", doctors: 4 }
  ];
  
  const doctors: Doctor[] = [
    { 
      id: 1, 
      name: "Dr. Rajesh Kumar", 
      specialty: "General Medicine", 
      qualification: "MBBS, MD",
      experience: 12,
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      availability: ["Monday", "Tuesday", "Thursday", "Friday"],
      fees: 500
    },
    { 
      id: 2, 
      name: "Dr. Priya Sharma", 
      specialty: "General Medicine", 
      qualification: "MBBS, MD",
      experience: 8,
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      availability: ["Monday", "Wednesday", "Friday", "Saturday"],
      fees: 600
    },
    { 
      id: 3, 
      name: "Dr. Amit Patel", 
      specialty: "Pediatrics", 
      qualification: "MBBS, DCH, MD",
      experience: 10,
      image: "https://randomuser.me/api/portraits/men/3.jpg",
      availability: ["Tuesday", "Thursday", "Saturday"],
      fees: 700
    },
    { 
      id: 4, 
      name: "Dr. Neha Gupta", 
      specialty: "Gynecology", 
      qualification: "MBBS, MS, DNB",
      experience: 15,
      image: "https://randomuser.me/api/portraits/women/4.jpg",
      availability: ["Monday", "Wednesday", "Friday"],
      fees: 800
    },
    { 
      id: 5, 
      name: "Dr. Vikram Singh", 
      specialty: "Orthopedics", 
      qualification: "MBBS, MS (Ortho)",
      experience: 14,
      image: "https://randomuser.me/api/portraits/men/5.jpg",
      availability: ["Tuesday", "Thursday", "Saturday"],
      fees: 900
    }
  ];
  
  // Get doctors by department
  const getDoctorsByDepartment = (departmentName: string) => {
    return doctors.filter(doc => doc.specialty === departmentName);
  };
  
  // Get doctor by ID
  const getDoctorById = (doctorId: string) => {
    return doctors.find(doc => doc.id.toString() === doctorId);
  };
  
  // Get department by name
  const getDepartmentByName = (departmentName: string) => {
    return departments.find(dep => dep.name === departmentName);
  };
  
  // Handle next step
  const handleNext = () => {
    // Validate current step
    if (step === 1 && !department) {
      toast({
        title: "Department Required",
        description: "Please select a department to proceed",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && !doctor) {
      toast({
        title: "Doctor Required",
        description: "Please select a doctor to proceed",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 3 && (!date || !time)) {
      toast({
        title: "Date and Time Required",
        description: "Please select both date and time for your appointment",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 4) {
      // Validate personal information
      if (!name || !email || !phone || !reasonForVisit) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }
      
      // Validate phone format
      const phoneRegex = /^\+?[0-9]{10,12}$/;
      if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number",
          variant: "destructive",
        });
        return;
      }
      
      // Submit appointment
      handleBookAppointment();
      return;
    }
    
    // Move to next step
    setStep(prev => prev + 1);
  };
  
  // Handle previous step
  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };
  
  // Handle booking appointment
  const handleBookAppointment = () => {
    setIsBooking(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsBooking(false);
      
      // Generate a random booking ID
      const randomId = Math.floor(100000 + Math.random() * 900000).toString();
      setBookingId(randomId);
      
      // Show success dialog
      setIsSuccessDialogOpen(true);
    }, 1500);
  };
  
  // Format date
  const formatDate = (date?: Date) => {
    return date ? format(date, "PPP") : "";
  };
  
  // Get selected doctor data
  const selectedDoctor = doctor ? getDoctorById(doctor) : null;
  
  // Handle viewing all offers
  const handleViewAllOffers = () => {
    setViewAllOffers(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Hospital Offers Section */}
      {hospital.offers && hospital.offers.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-primary flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Special Offers & Packages
            </CardTitle>
            <CardDescription>
              Exclusive healthcare offers available at {hospital.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hospital.offers.slice(0, viewAllOffers ? hospital.offers.length : 2).map((offer, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-3 ${offer.isHighlighted ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className={`font-medium ${offer.isHighlighted ? 'text-primary' : ''}`}>{offer.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                      {offer.validUntil && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                          <CalendarIcon className="h-3 w-3" />
                          <span>Valid until {offer.validUntil}</span>
                        </div>
                      )}
                    </div>
                    {offer.isHighlighted && (
                      <Badge className="bg-primary">Featured</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {!viewAllOffers && hospital.offers.length > 2 && (
              <Button 
                variant="link" 
                className="mt-3 p-0"
                onClick={handleViewAllOffers}
              >
                View all {hospital.offers.length} offers <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Appointment Booking Card */}
      <Card>
        <CardHeader>
          <CardTitle>Book an Appointment</CardTitle>
          <CardDescription>
            Schedule your visit to {hospital.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Select Department */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name} ({dept.doctors} doctors)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {department && (
                <div className="rounded-lg border p-3 bg-gray-50">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{department}</p>
                      <p className="text-sm text-gray-600">
                        {getDepartmentByName(department)?.description}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {getDepartmentByName(department)?.doctors} doctors available
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Step 2: Select Doctor */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Doctor</Label>
                <Select value={doctor} onValueChange={setDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDoctorsByDepartment(department).map((doc) => (
                      <SelectItem key={doc.id} value={doc.id.toString()}>
                        {doc.name} ({doc.experience} yrs exp)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedDoctor && (
                <div className="rounded-lg border p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border">
                      <OptimizedImage 
                        src={selectedDoctor.image}
                        alt={selectedDoctor.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{selectedDoctor.name}</h4>
                      <p className="text-sm text-gray-600">{selectedDoctor.specialty}</p>
                      <p className="text-sm text-gray-600">{selectedDoctor.qualification}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">
                          {selectedDoctor.experience} years exp
                        </Badge>
                        <span className="text-sm font-medium text-primary">
                          ₹{selectedDoctor.fees} fee
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t text-sm">
                    <div className="font-medium mb-1">Available On:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedDoctor.availability.map((day, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Step 3: Select Date & Time */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => {
                        // Disable past dates
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        
                        // Disable weekends if doctor not available
                        const day = date.getDay();
                        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        const isAvailable = selectedDoctor?.availability.includes(dayNames[day]);
                        
                        return date < yesterday || !isAvailable;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {date && (
                <div className="space-y-2">
                  <Label>Select Time</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={time === slot ? "default" : "outline"}
                        className="h-10"
                        onClick={() => setTime(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {date && time && (
                <div className="rounded-lg border p-3 bg-blue-50 text-blue-800 mt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Appointment Details</p>
                      <p className="text-sm">
                        {selectedDoctor?.name} on {format(date, "PPP")} at {time}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Step 4: Personal Information */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    id="phone" 
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reasonForVisit">Reason for Visit *</Label>
                <Textarea 
                  id="reasonForVisit" 
                  placeholder="Briefly describe your symptoms or reason for the appointment"
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Insurance Provider (Optional)</Label>
                <Input 
                  id="insuranceProvider" 
                  placeholder="Enter your insurance provider if applicable"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="isFirstVisit" 
                  checked={isFirstVisit}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      setIsFirstVisit(checked);
                    }
                  }}
                />
                <Label htmlFor="isFirstVisit">This is my first visit to this hospital</Label>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handlePrevious}>
              Back
            </Button>
          ) : (
            <div></div>
          )}
          
          <Button onClick={handleNext} disabled={isBooking}>
            {isBooking ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : step === 4 ? (
              "Book Appointment"
            ) : (
              "Next"
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Appointment Confirmation Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Appointment Confirmed!</DialogTitle>
            <DialogDescription className="text-center">
              Your appointment has been successfully booked
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-gray-50">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CalendarIcon2 className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Date & Time</div>
                    <div className="font-medium">{formatDate(date)} at {time}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Doctor</div>
                    <div className="font-medium">{selectedDoctor?.name}</div>
                    <div className="text-sm">{selectedDoctor?.specialty}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Patient</div>
                    <div className="font-medium">{name}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Hospital</div>
                    <div className="font-medium">{hospital.name}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Booking ID</div>
                    <div className="font-medium">{bookingId}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Appointment Details Sent</AlertTitle>
              <AlertDescription>
                We've sent the appointment details to your email and phone. Please arrive 15 minutes before your scheduled time.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => window.print()}
            >
              <FileText className="h-4 w-4" />
              Print Details
            </Button>
            <Button 
              className="flex-1"
              onClick={() => setIsSuccessDialogOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentBooking;