import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface BookHospitalAppointmentProps {
  hospitalId: number;
  hospitalName: string;
  specialties: string[];
}

const BookHospitalAppointment = ({ 
  hospitalId, 
  hospitalName,
  specialties 
}: BookHospitalAppointmentProps) => {
  // Use local state for authentication
  const [user, setUser] = useState<any | null>(null);
  const { toast } = useToast();
  
  // Check for user authentication when component mounts
  useEffect(() => {
    // Fetch user data from API
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          if (userData && userData.id) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    
    checkAuth();
  }, []);
  
  const today = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(today.getMonth() + 1);

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [specialty, setSpecialty] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Generate time slots from 9:00 AM to 5:00 PM with 30 minute intervals
  const availableTimeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = (i % 2) * 30;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute === 0 ? '00' : minute} ${ampm}`;
  });

  // Handle booking submission
  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to book an appointment",
        variant: "destructive"
      });
      window.location.href = "/auth";
      return;
    }

    if (!date) {
      toast({
        title: "Missing information",
        description: "Please select an appointment date",
        variant: "destructive"
      });
      return;
    }

    if (!timeSlot) {
      toast({
        title: "Missing information",
        description: "Please select a time slot",
        variant: "destructive"
      });
      return;
    }

    if (!specialty) {
      toast({
        title: "Missing information",
        description: "Please select a specialty",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Format date for API
      const dateTime = new Date(date);
      const [hours, minutes] = timeSlot.split(':');
      const isPM = timeSlot.includes('PM');
      
      let hour = parseInt(hours, 10);
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      
      dateTime.setHours(hour, parseInt(minutes, 10), 0, 0);

      // Send appointment booking request
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hospitalId,
          date: dateTime.toISOString(),
          specialty,
          symptoms: symptoms.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to book appointment');
      }

      toast({
        title: "Appointment booked",
        description: `Your appointment at ${hospitalName} has been successfully booked`,
      });

      // Reset form
      setDate(undefined);
      setTimeSlot("");
      setSpecialty("");
      setSymptoms("");
      
      // Redirect to appointments page
      window.location.href = "/appointments";
    } catch (error) {
      console.error("Appointment booking error:", error);
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Unable to book appointment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="text-xl font-semibold mb-3">Book an Appointment</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Select Date</label>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) => {
              // Disable past dates, Sundays, and dates more than a month in the future
              return (
                date < today ||
                date > oneMonthFromNow ||
                date.getDay() === 0 // Sunday
              );
            }}
            className="border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Select Time</label>
          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger>
              <SelectValue placeholder="Select time slot" />
            </SelectTrigger>
            <SelectContent>
              {availableTimeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Specialty</label>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger>
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Symptoms (Optional)</label>
          <Textarea
            placeholder="Describe your symptoms or reason for visit"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        <Button 
          onClick={handleBooking} 
          className="w-full" 
          disabled={loading || !date || !timeSlot || !specialty}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            "Book Appointment"
          )}
        </Button>
        
        {!user && (
          <p className="text-xs text-gray-500 text-center">
            Please <a href="/auth" className="text-primary underline">sign in</a> to book an appointment
          </p>
        )}
      </div>
    </div>
  );
};

export default BookHospitalAppointment;