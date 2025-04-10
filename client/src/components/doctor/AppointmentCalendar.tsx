import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  Video, 
  Phone, 
  Users, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  X, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  User,
  PlusCircle,
  ClipboardList
} from 'lucide-react';
import { format, addDays, isSameDay, startOfWeek, addWeeks, subWeeks, isSameMonth } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';

// Type definitions
interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientEmail: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  type: 'in-person' | 'video' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  patientPhoto?: string;
}

interface TimeSlot {
  time: string;
  isBooked: boolean;
  appointmentId?: number;
}

const AppointmentCalendar = () => {
  // State
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('calendar');
  const [isViewAppointmentDialogOpen, setIsViewAppointmentDialogOpen] = useState(false);
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample appointment data
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1001,
      patientId: 2001,
      patientName: 'Vikram Mehta',
      patientAge: 45,
      patientGender: 'Male',
      patientPhone: '+91 98765 10111',
      patientEmail: 'vikram.m@example.com',
      date: new Date(),
      time: '09:30 AM',
      duration: 30,
      type: 'in-person',
      status: 'scheduled',
      reason: 'Follow-up for hypertension medication',
      notes: 'Patient reporting occasional headaches in the morning',
      patientPhoto: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 1002,
      patientId: 2002,
      patientName: 'Sunita Sharma',
      patientAge: 38,
      patientGender: 'Female',
      patientPhone: '+91 87654 20222',
      patientEmail: 'sunita.s@example.com',
      date: new Date(),
      time: '11:00 AM',
      duration: 45,
      type: 'video',
      status: 'scheduled',
      reason: 'Asthma management review',
      patientPhoto: 'https://randomuser.me/api/portraits/women/67.jpg'
    },
    {
      id: 1003,
      patientId: 2003,
      patientName: 'Rajesh Patel',
      patientAge: 62,
      patientGender: 'Male',
      patientPhone: '+91 76543 30333',
      patientEmail: 'rajesh.p@example.com',
      date: addDays(new Date(), 1),
      time: '10:00 AM',
      duration: 30,
      type: 'in-person',
      status: 'scheduled',
      reason: 'Arthritis pain management',
      patientPhoto: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
      id: 1004,
      patientId: 2004,
      patientName: 'Kavita Singh',
      patientAge: 28,
      patientGender: 'Female',
      patientPhone: '+91 65432 40444',
      patientEmail: 'kavita.s@example.com',
      date: addDays(new Date(), 1),
      time: '2:30 PM',
      duration: 30,
      type: 'phone',
      status: 'scheduled',
      reason: 'Review of test results',
      patientPhoto: 'https://randomuser.me/api/portraits/women/22.jpg'
    },
    {
      id: 1005,
      patientId: 2005,
      patientName: 'Arun Kumar',
      patientAge: 55,
      patientGender: 'Male',
      patientPhone: '+91 54321 50555',
      patientEmail: 'arun.k@example.com',
      date: addDays(new Date(), 2),
      time: '11:30 AM',
      duration: 60,
      type: 'in-person',
      status: 'scheduled',
      reason: 'Comprehensive checkup',
      patientPhoto: 'https://randomuser.me/api/portraits/men/67.jpg'
    },
    {
      id: 1006,
      patientId: 2006,
      patientName: 'Deepa Verma',
      patientAge: 42,
      patientGender: 'Female',
      patientPhone: '+91 43210 60666',
      patientEmail: 'deepa.v@example.com',
      date: addDays(new Date(), -1),
      time: '09:00 AM',
      duration: 30,
      type: 'video',
      status: 'completed',
      reason: 'Thyroid medication review',
      notes: 'Patient feeling better with current medication dosage',
      patientPhoto: 'https://randomuser.me/api/portraits/women/54.jpg'
    }
  ]);
  
  // Get filtered appointments based on date and filters
  const getFilteredAppointments = () => {
    return appointments.filter(appointment => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.reason.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by appointment type
      const matchesType = appointmentTypeFilter === 'all' || appointment.type === appointmentTypeFilter;
      
      return matchesSearch && matchesType;
    });
  };
  
  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.date), date)
    ).sort((a, b) => {
      const timeA = convertTo24Hour(a.time);
      const timeB = convertTo24Hour(b.time);
      return timeA.localeCompare(timeB);
    });
  };
  
  // Get schedule for selected date
  const getScheduleForDate = (date: Date) => {
    const appointmentsForDate = getAppointmentsForDate(date);
    
    // Generate time slots from 9 AM to 5 PM
    const timeSlots: TimeSlot[] = [];
    const hours = ['09', '10', '11', '12', '01', '02', '03', '04', '05'];
    const minutes = ['00', '30'];
    
    hours.forEach(hour => {
      minutes.forEach(minute => {
        const time = `${hour}:${minute} ${parseInt(hour) < 12 || hour === '12' ? 'AM' : 'PM'}`;
        const appointment = appointmentsForDate.find(appt => appt.time === time);
        
        timeSlots.push({
          time,
          isBooked: !!appointment,
          appointmentId: appointment?.id
        });
      });
    });
    
    return timeSlots;
  };
  
  // Convert time from 12-hour to 24-hour format for sorting
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = String(parseInt(hours) + 12);
    }
    
    return `${hours.padStart(2, '0')}:${minutes}`;
  };
  
  // Get day of week
  const getDayOfWeek = (date: Date) => {
    return format(date, 'EEEE');
  };
  
  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };
  
  // Handle week change
  const handleNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };
  
  const handlePrevWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };
  
  // Handle view appointment
  const handleViewAppointment = (appointmentId: number) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setIsViewAppointmentDialogOpen(true);
    }
  };
  
  // Handle add appointment
  const handleAddAppointment = () => {
    setIsAddAppointmentDialogOpen(true);
  };
  
  // Handle save appointment
  const handleSaveAppointment = () => {
    // In a real app, you'd save the appointment here
    setIsAddAppointmentDialogOpen(false);
  };
  
  // Handle update appointment status
  const handleUpdateStatus = (appointmentId: number, status: 'scheduled' | 'completed' | 'cancelled' | 'no-show') => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status } 
          : appointment
      )
    );
    setIsViewAppointmentDialogOpen(false);
  };
  
  // Get badge style for appointment type
  const getAppointmentTypeStyle = (type: string) => {
    switch (type) {
      case 'in-person':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'video':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'phone':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get icon for appointment type
  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'in-person':
        return <Users className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  // Get badge style for appointment status
  const getAppointmentStatusStyle = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    return addDays(weekStart, i);
  });
  
  // Get appointments count per day for calendar highlighting
  const getAppointmentCountForDay = (day: Date): number => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.date), day)
    ).length;
  };

  // Custom calendar day rendering
  const renderCalendarDay = (day: Date, modifiers: any) => {
    const appointmentCount = getAppointmentCountForDay(day);
    
    return (
      <div className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md",
        modifiers.selected && "bg-blue-100 text-blue-900 font-medium",
        !modifiers.selected && modifiers.today && "border border-blue-200",
        !isSameMonth(day, date) && "text-gray-400",
      )}>
        <div>
          {format(day, 'd')}
          {appointmentCount > 0 && (
            <div className="flex justify-center mt-1">
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                appointmentCount > 2 ? "bg-blue-600" : "bg-blue-400"
              )}/>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Appointment Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search appointments..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={handleAddAppointment}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue="calendar" 
        className="space-y-4"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList>
          <TabsTrigger value="calendar">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="list">
            <ClipboardList className="mr-2 h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    defaultMonth={date}
                    components={{
                      Day: ({ date, displayMonth, ...props }) => renderCalendarDay(date, props.modifiers)
                    }}
                    className="border rounded-md p-3"
                  />
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-500 mb-2">UPCOMING APPOINTMENTS</h4>
                    <div className="space-y-3">
                      {appointments
                        .filter(appointment => 
                          new Date(appointment.date) >= new Date() && 
                          appointment.status === 'scheduled'
                        )
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 3)
                        .map(appointment => (
                          <Card 
                            key={appointment.id} 
                            className="p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleViewAppointment(appointment.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{appointment.patientName}</p>
                                <p className="text-xs text-gray-500">
                                  {format(new Date(appointment.date), 'MMM d')} • {appointment.time}
                                </p>
                              </div>
                              <Badge className={getAppointmentTypeStyle(appointment.type)}>
                                <span className="flex items-center gap-1">
                                  {getAppointmentTypeIcon(appointment.type)}
                                </span>
                              </Badge>
                            </div>
                          </Card>
                        ))
                      }
                      
                      {appointments.filter(appointment => 
                        new Date(appointment.date) >= new Date() && 
                        appointment.status === 'scheduled'
                      ).length === 0 && (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed">
                          <p className="text-gray-500">No upcoming appointments</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Daily Schedule</CardTitle>
                  <p className="text-gray-500 mt-1">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                </div>
                <Select value={appointmentTypeFilter} onValueChange={setAppointmentTypeFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getAppointmentsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getAppointmentsForDate(selectedDate)
                        .filter(appointment => 
                          appointmentTypeFilter === 'all' || appointment.type === appointmentTypeFilter
                        )
                        .map(appointment => (
                          <Card 
                            key={appointment.id} 
                            className="p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleViewAppointment(appointment.id)}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={appointment.patientPhoto} alt={appointment.patientName} />
                                  <AvatarFallback>{getInitials(appointment.patientName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{appointment.patientName}</div>
                                  <div className="text-sm text-gray-500">{appointment.patientAge} yrs, {appointment.patientGender}</div>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className={getAppointmentTypeStyle(appointment.type)}>
                                  <span className="flex items-center gap-1">
                                    {getAppointmentTypeIcon(appointment.type)}
                                    <span className="hidden sm:inline">{appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}</span>
                                  </span>
                                </Badge>
                                <div className="text-sm">
                                  <span className="font-medium">{appointment.time}</span>
                                  <span className="text-gray-500"> • {appointment.duration} min</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-600">
                              {appointment.reason}
                            </div>
                          </Card>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
                      <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium">No appointments scheduled</h3>
                      <p className="mt-1 text-gray-500">There are no appointments scheduled for this date.</p>
                      <Button onClick={handleAddAppointment} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Appointment
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>All Appointments</CardTitle>
                
                <div className="flex gap-3">
                  <Select value={appointmentTypeFilter} onValueChange={setAppointmentTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredAppointments().length > 0 ? (
                    getFilteredAppointments()
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(appointment => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={appointment.patientPhoto} alt={appointment.patientName} />
                                <AvatarFallback>{getInitials(appointment.patientName)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{appointment.patientName}</div>
                                <div className="text-xs text-gray-500">{appointment.patientAge} yrs, {appointment.patientGender}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{format(new Date(appointment.date), 'MMM d, yyyy')}</div>
                            <div className="text-sm text-gray-500">{appointment.time} • {appointment.duration} min</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getAppointmentTypeStyle(appointment.type)}>
                              <span className="flex items-center gap-1">
                                {getAppointmentTypeIcon(appointment.type)}
                                <span>{appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}</span>
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getAppointmentStatusStyle(appointment.status)}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate text-sm">{appointment.reason}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewAppointment(appointment.id)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        <div className="text-gray-500">No appointments found matching your criteria</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* View Appointment Dialog */}
      <Dialog open={isViewAppointmentDialogOpen} onOpenChange={setIsViewAppointmentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View appointment information and manage status
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedAppointment.patientPhoto} alt={selectedAppointment.patientName} />
                    <AvatarFallback className="text-lg">{getInitials(selectedAppointment.patientName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedAppointment.patientName}</h3>
                    <p className="text-gray-500">{selectedAppointment.patientAge} years, {selectedAppointment.patientGender}</p>
                  </div>
                </div>
                
                <Badge className={getAppointmentStatusStyle(selectedAppointment.status)}>
                  {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                <div>
                  <Label className="text-gray-500">Date & Time</Label>
                  <p className="font-medium">
                    {format(new Date(selectedAppointment.date), 'MMMM d, yyyy')} • {selectedAppointment.time}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Duration</Label>
                  <p className="font-medium">{selectedAppointment.duration} minutes</p>
                </div>
                <div>
                  <Label className="text-gray-500">Appointment Type</Label>
                  <div className="flex items-center gap-1.5 mt-1">
                    {getAppointmentTypeIcon(selectedAppointment.type)}
                    <span className="font-medium">
                      {selectedAppointment.type.charAt(0).toUpperCase() + selectedAppointment.type.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Contact</Label>
                  <p className="font-medium">{selectedAppointment.patientPhone}</p>
                  <p className="text-sm">{selectedAppointment.patientEmail}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-500">Reason for Visit</Label>
                  <p className="font-medium mt-1">{selectedAppointment.reason}</p>
                </div>
                
                {selectedAppointment.notes && (
                  <div>
                    <Label className="text-gray-500">Notes</Label>
                    <p className="mt-1">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between pt-4 border-t">
                {selectedAppointment.status === 'scheduled' && (
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                  >
                    <X className="mr-2 h-4 w-4" /> Cancel Appointment
                  </Button>
                )}
                
                <div className="flex gap-2 ml-auto">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsViewAppointmentDialogOpen(false)}
                  >
                    Close
                  </Button>
                  
                  {selectedAppointment.status === 'scheduled' && (
                    <Button 
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
                    >
                      <Check className="mr-2 h-4 w-4" /> Mark as Completed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Appointment Dialog */}
      <Dialog open={isAddAppointmentDialogOpen} onOpenChange={setIsAddAppointmentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>
              Schedule a new appointment for a patient
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2001">Vikram Mehta</SelectItem>
                  <SelectItem value="2002">Sunita Sharma</SelectItem>
                  <SelectItem value="2003">Rajesh Patel</SelectItem>
                  <SelectItem value="2004">Kavita Singh</SelectItem>
                  <SelectItem value="2005">Arun Kumar</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center mt-1 text-sm">
                <PlusCircle className="h-3.5 w-3.5 mr-1 text-blue-600" />
                <span className="text-blue-600">Register new patient</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  defaultValue={format(new Date(), 'yyyy-MM-dd')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                    <SelectItem value="09:30 AM">09:30 AM</SelectItem>
                    <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                    <SelectItem value="10:30 AM">10:30 AM</SelectItem>
                    <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                    <SelectItem value="11:30 AM">11:30 AM</SelectItem>
                    <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                    <SelectItem value="12:30 PM">12:30 PM</SelectItem>
                    <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                    <SelectItem value="01:30 PM">01:30 PM</SelectItem>
                    <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                    <SelectItem value="02:30 PM">02:30 PM</SelectItem>
                    <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                    <SelectItem value="03:30 PM">03:30 PM</SelectItem>
                    <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                    <SelectItem value="04:30 PM">04:30 PM</SelectItem>
                    <SelectItem value="05:00 PM">05:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <Select defaultValue="in-person">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Input id="reason" placeholder="Enter reason for visit" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (optional)</Label>
              <Textarea id="notes" placeholder="Enter any additional notes" rows={3} />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-700">Send reminders to the patient?</p>
                <p className="text-sm text-blue-600 mt-1">
                  Appointment notifications will be sent to the patient via SMS and email
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAppointmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAppointment}>
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar;