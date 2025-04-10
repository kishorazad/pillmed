import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CalendarDays, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Check, 
  X, 
  Calendar as CalendarIcon,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

// Appointment type definitions
type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

interface Appointment {
  id: number;
  patientName: string;
  patientId: number;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientEmail: string;
  date: Date;
  timeSlot: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
}

interface TimeSlot {
  id: string;
  time: string;
  isBooked: boolean;
  appointmentId?: number;
}

const AppointmentCalendar = () => {
  // States
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [timeSlotFilter, setTimeSlotFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Sample appointment data
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      patientName: 'Rahul Sharma',
      patientId: 101,
      patientAge: 42,
      patientGender: 'Male',
      patientPhone: '+91 98765 43210',
      patientEmail: 'rahul.sharma@example.com',
      date: new Date(2025, 3, 10), // April 10, 2025
      timeSlot: '10:00 AM - 10:30 AM',
      reason: 'Annual checkup and diabetes monitoring',
      status: 'scheduled'
    },
    {
      id: 2,
      patientName: 'Priya Patel',
      patientId: 102,
      patientAge: 35,
      patientGender: 'Female',
      patientPhone: '+91 87654 32109',
      patientEmail: 'priya.patel@example.com',
      date: new Date(2025, 3, 10), // April 10, 2025
      timeSlot: '11:30 AM - 12:00 PM',
      reason: 'Migraine consultation',
      status: 'scheduled'
    },
    {
      id: 3,
      patientName: 'Amit Kumar',
      patientId: 103,
      patientAge: 28,
      patientGender: 'Male',
      patientPhone: '+91 76543 21098',
      patientEmail: 'amit.kumar@example.com',
      date: new Date(2025, 3, 11), // April 11, 2025
      timeSlot: '9:00 AM - 9:30 AM',
      reason: 'Skin allergy followup',
      status: 'scheduled'
    },
    {
      id: 4,
      patientName: 'Anjali Desai',
      patientId: 104,
      patientAge: 56,
      patientGender: 'Female',
      patientPhone: '+91 65432 10987',
      patientEmail: 'anjali.desai@example.com',
      date: new Date(2025, 3, 9), // April 9, 2025
      timeSlot: '2:00 PM - 2:30 PM',
      reason: 'Hypertension monitoring',
      status: 'completed',
      notes: 'BP readings normal. Continue same medication. Follow up in 3 months.'
    },
    {
      id: 5,
      patientName: 'Rajesh Singh',
      patientId: 105,
      patientAge: 38,
      patientGender: 'Male',
      patientPhone: '+91 54321 09876',
      patientEmail: 'rajesh.singh@example.com',
      date: new Date(2025, 3, 9), // April 9, 2025
      timeSlot: '3:30 PM - 4:00 PM',
      reason: 'Lower back pain evaluation',
      status: 'cancelled'
    }
  ]);

  // Generate time slots from 9 AM to 5 PM, every 30 minutes
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour}:${minute === 0 ? '00' : minute}`;
        const slotTime = `${hour > 12 ? hour - 12 : hour}:${minute === 0 ? '00' : minute} ${hour >= 12 ? 'PM' : 'AM'}`;
        const endTime = minute === 30 
          ? `${hour + 1 > 12 ? hour - 11 : hour + 1}:00 ${hour + 1 >= 12 ? 'PM' : 'AM'}`
          : `${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}`;
        
        const slotId = `${date.toISOString().split('T')[0]}-${timeString}`;
        const displayTime = `${slotTime} - ${endTime}`;
        
        // Check if this slot is booked
        const booked = appointments.some(apt => 
          apt.date.toDateString() === date.toDateString() && 
          apt.timeSlot === displayTime
        );
        
        const appointmentForSlot = appointments.find(apt => 
          apt.date.toDateString() === date.toDateString() && 
          apt.timeSlot === displayTime
        );
        
        slots.push({
          id: slotId,
          time: displayTime,
          isBooked: booked,
          appointmentId: appointmentForSlot?.id
        });
      }
    }
    
    return slots;
  };
  
  // Get appointments for the selected date
  const getAppointmentsForDate = (date: Date): Appointment[] => {
    return appointments.filter(apt => 
      apt.date.toDateString() === date.toDateString()
    );
  };
  
  // Get a list of all appointments based on filters
  const getFilteredAppointments = (): Appointment[] => {
    let filtered = [...appointments];
    
    // Filter by status if needed
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }
    
    // Sort by date and time
    filtered.sort((a, b) => {
      // First sort by date
      if (a.date.getTime() !== b.date.getTime()) {
        return a.date.getTime() - b.date.getTime();
      }
      
      // Then sort by time slot
      return a.timeSlot.localeCompare(b.timeSlot);
    });
    
    return filtered;
  };
  
  // Function to handle viewing an appointment
  const handleViewAppointment = (appointmentId: number) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setIsViewDialogOpen(true);
    }
  };
  
  // Function to update appointment status
  const updateAppointmentStatus = (id: number, status: AppointmentStatus) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === id ? { ...apt, status } : apt
      )
    );
    setIsViewDialogOpen(false);
  };
  
  // Function to add notes to an appointment
  const addAppointmentNotes = (id: number, notes: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === id ? { ...apt, notes } : apt
      )
    );
  };
  
  // Render date cell with appointment indicators
  const renderDateCell = (date: Date) => {
    const aptsForDate = getAppointmentsForDate(date);
    const count = aptsForDate.length;
    
    if (count === 0) return null;
    
    const hasScheduled = aptsForDate.some(apt => apt.status === 'scheduled');
    const hasCompleted = aptsForDate.some(apt => apt.status === 'completed');
    const hasCancelled = aptsForDate.some(apt => apt.status === 'cancelled' || apt.status === 'no-show');
    
    return (
      <div className="flex flex-col items-center">
        <span className="text-xs font-semibold mt-1">{count} appt{count > 1 ? 's' : ''}</span>
        <div className="flex gap-1 mt-1">
          {hasScheduled && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
          {hasCompleted && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
          {hasCancelled && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
        </div>
      </div>
    );
  };
  
  // Helper function to format date
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Get time slots for the selected date
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Appointment Calendar</h2>
          <p className="text-gray-500">Manage your patient appointments</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={viewMode === 'calendar' ? 'default' : 'outline'} 
            onClick={() => setViewMode('calendar')}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Calendar View
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            onClick={() => setViewMode('list')}
          >
            <FileText className="mr-2 h-4 w-4" />
            List View
          </Button>
        </div>
      </div>
      
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                components={{
                  DayContent: ({ date }) => (
                    <div className="relative flex h-9 w-9 items-center justify-center">
                      <span>{date.getDate()}</span>
                      {renderDateCell(date)}
                    </div>
                  )
                }}
              />
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Legend:</h4>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Cancelled/No-show</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedDate && formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate && (
                <>
                  <Select value={timeSlotFilter} onValueChange={setTimeSlotFilter}>
                    <SelectTrigger className="w-full sm:w-[240px] mb-4">
                      <SelectValue placeholder="Filter by time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time Slots</SelectItem>
                      <SelectItem value="available">Available Only</SelectItem>
                      <SelectItem value="booked">Booked Only</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {timeSlots
                      .filter(slot => {
                        if (timeSlotFilter === 'available') return !slot.isBooked;
                        if (timeSlotFilter === 'booked') return slot.isBooked;
                        return true;
                      })
                      .map(slot => (
                        <div 
                          key={slot.id}
                          className={`p-3 rounded-md flex justify-between items-center ${
                            slot.isBooked 
                              ? 'bg-slate-100' 
                              : 'bg-white border border-dashed border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-full rounded-full ${
                              slot.isBooked 
                                ? 'bg-[#10847e]' 
                                : 'bg-gray-200'
                            }`} />
                            <div>
                              <p className="font-medium">{slot.time}</p>
                              {slot.isBooked && (
                                <div className="mt-1">
                                  {appointments.find(apt => apt.id === slot.appointmentId)?.patientName}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {slot.isBooked ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewAppointment(slot.appointmentId!)}
                            >
                              View Details
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              Available
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>
                  
                  {timeSlots.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No time slots available for this date.</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Appointments</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No-show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredAppointments().length > 0 ? (
                  getFilteredAppointments().map(appointment => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="font-medium">{formatDate(appointment.date)}</div>
                        <div className="text-sm text-gray-500">{appointment.timeSlot}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">
                          ID: {appointment.patientId} | {appointment.patientAge} yrs, {appointment.patientGender}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={appointment.reason}>
                          {appointment.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
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
                    <TableCell colSpan={5} className="text-center py-4">
                      No appointments found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Appointment Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View and manage appointment information
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-500">Patient Information</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{selectedAppointment.patientName}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      ID: {selectedAppointment.patientId} | {selectedAppointment.patientAge} years, {selectedAppointment.patientGender}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500">Contact Details</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedAppointment.patientPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedAppointment.patientEmail}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-500">Appointment Details</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(selectedAppointment.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{selectedAppointment.timeSlot}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500">Current Status</Label>
                    <div className="mt-1">
                      <Badge 
                        variant="outline" 
                        className={
                          selectedAppointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          selectedAppointment.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                          selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-amber-100 text-amber-800 border-amber-200'
                        }
                      >
                        {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-500">Reason for Visit</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">
                  {selectedAppointment.reason}
                </p>
              </div>
              
              <div>
                <Label htmlFor="notes" className="text-gray-500">Doctor's Notes</Label>
                <Textarea 
                  id="notes"
                  className="mt-1"
                  placeholder="Add your consultation notes here..."
                  rows={4}
                  defaultValue={selectedAppointment.notes || ''}
                  onChange={(e) => addAppointmentNotes(selectedAppointment.id, e.target.value)}
                />
              </div>
              
              {selectedAppointment.status === 'scheduled' && (
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'cancelled')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Mark as Cancelled
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-amber-500 text-amber-600 hover:bg-amber-50"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'no-show')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Mark as No-show
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'completed')}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Complete Appointment
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar;