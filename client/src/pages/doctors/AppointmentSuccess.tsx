import React from 'react';
import { Link, useRoute } from 'wouter';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Download,
  Video,
  Share2,
  ChevronRight,
  Bell,
  Home,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

// Sample appointment data - in a real application, this would come from the API
const appointmentData = {
  id: 'APT1234567',
  doctor: {
    id: 1,
    name: 'Dr. Priya Sharma',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    specialty: 'Cardiologist',
  },
  appointmentDate: '25 April 2025',
  appointmentDay: 'Tomorrow',
  appointmentTime: '10:30 AM',
  consultationType: 'Video',
  totalAmount: 880,
  meetingLink: 'https://meet.pillnow.com/dr-priya-sharma/apt1234567',
  patient: {
    name: 'Rahul Khanna',
    email: 'rahul.khanna@example.com',
    phone: '+91 98765 43210'
  }
};

const AppointmentSuccess: React.FC = () => {
  const [matched, params] = useRoute('/doctors/:doctorId/appointment/:appointmentId/success');
  const simpleMatched = useRoute('/doctors/:doctorId/success')[0];
  
  const doctorId = matched ? parseInt(params.doctorId) : 
                 simpleMatched ? parseInt(params.doctorId) : 
                 appointmentData.doctor.id;
  
  const appointmentId = matched ? params.appointmentId : null;
  
  // Fetch doctor data
  const { data: doctorData, isLoading: isLoadingDoctor } = useQuery({
    queryKey: ['/api/doctors', doctorId],
    enabled: !!doctorId,
    placeholderData: appointmentData.doctor
  });
  
  // Fetch appointment data if we have an ID
  const { data: appointment, isLoading: isLoadingAppointment } = useQuery({
    queryKey: ['/api/appointments', appointmentId],
    enabled: !!appointmentId,
    placeholderData: appointmentData
  });
  
  // Decide which data to use (API or static)
  const displayData = appointment || appointmentData;
  const doctor = doctorData || appointmentData.doctor;
  
  const isLoading = isLoadingDoctor || isLoadingAppointment;
  
  // Generate a meeting link if not available
  const meetingLink = displayData.meetingLink || 
    (displayData.consultationType === 'Video' ? 
      `https://meet.pillnow.com/dr-${doctor.name.toLowerCase().replace(/\s+/g, '-')}/${displayData.id}` : 
      null);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          <div className="text-center mb-10">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h1>
            <p className="text-gray-600 text-lg">
              Your appointment has been successfully booked.
            </p>
          </div>
          
          <Card className="mb-8">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle>Appointment Details</CardTitle>
                <Badge className="bg-green-500">Confirmed</Badge>
              </div>
              <CardDescription>
                Appointment ID: {displayData.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Doctor Info */}
              <div className="flex items-start">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={doctor.image} alt={doctor.name} />
                  <AvatarFallback>{doctor.name?.charAt(0) || 'D'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900 text-lg">{doctor.name}</h3>
                  <p className="text-gray-500">{doctor.specialty}</p>
                  <div className="mt-2">
                    <Badge 
                      variant="outline"
                      className={`
                        ${displayData.consultationType === 'Video' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                        ${displayData.consultationType === 'Chat' ? 'bg-teal-50 text-teal-700 border-teal-200' : ''}
                        ${displayData.consultationType === 'In-person' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                      `}
                    >
                      {displayData.consultationType === 'Video' && <Video className="h-3 w-3 mr-1" />}
                      {displayData.consultationType} Consultation
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Appointment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Date & Time</div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <div className="font-medium">{displayData.appointmentDate}, {displayData.appointmentTime}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Patient</div>
                  <div className="font-medium">{displayData.patient?.name || 'Rahul Khanna'}</div>
                  <div className="text-sm text-gray-500">{displayData.patient?.email || 'rahul.khanna@example.com'}</div>
                  <div className="text-sm text-gray-500">{displayData.patient?.phone || '+91 98765 43210'}</div>
                </div>
              </div>
              
              {/* Video Consultation Link */}
              {displayData.consultationType === 'Video' && meetingLink && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                    <Video className="h-4 w-4 mr-2" />
                    Video Consultation Link
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm text-purple-700 break-all">
                      {meetingLink}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-purple-700 border-purple-300 hover:bg-purple-100 sm:flex-shrink-0"
                      onClick={() => navigator.clipboard.writeText(meetingLink)}
                    >
                      Copy Link
                    </Button>
                  </div>
                  <div className="mt-3 text-sm text-purple-700">
                    <p>Please join the video consultation 5 minutes before the scheduled time.</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6 flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto flex items-center justify-center"
                onClick={() => window.print()}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto flex items-center justify-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Details
              </Button>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto flex items-center justify-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-orange-800 mb-1">Reminders</h3>
                  <ul className="space-y-2 text-sm text-orange-700">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-orange-500" />
                      You will receive a reminder notification 30 minutes before your appointment.
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-orange-500" />
                      Please have your medical records and any recent test reports ready for reference during the consultation.
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-orange-500" />
                      Make a list of questions you want to ask the doctor to make the most of your consultation time.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href={`/doctors/${doctorId}`}>
              <Button variant="outline" className="w-full sm:w-auto">
                Doctor's Profile
              </Button>
            </Link>
            
            <Link href="/my-appointments">
              <Button variant="outline" className="w-full sm:w-auto">
                View All Appointments
              </Button>
            </Link>
            
            <Link href="/">
              <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default AppointmentSuccess;