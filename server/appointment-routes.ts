import express, { Request, Response } from 'express';
import { z } from 'zod';
import { sendAppointmentConfirmation } from './email-service';
import { storage } from './storage';
import { mongoDBStorage } from './mongodb-storage';

const router = express.Router();

// Schema for validating appointment booking request
const bookAppointmentSchema = z.object({
  doctorId: z.string().or(z.number()),
  patientId: z.string().or(z.number()),
  patientName: z.string(),
  patientEmail: z.string().email(),
  patientPhone: z.string(),
  date: z.string(),
  time: z.string(),
  isVideoConsultation: z.boolean().default(false),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Get available time slots for a specific doctor and date
 */
router.get('/available-slots/:doctorId/:date', async (req: Request, res: Response) => {
  try {
    const { doctorId, date } = req.params;
    
    // Use MongoDB storage for fetching time slots
    const currentStorage = global.useMongoStorage ? mongoDBStorage : storage;
    
    // Get the doctor's schedule for the specific date
    const availableSlots = await currentStorage.getDoctorAvailabilityForDate(doctorId, date);
    
    res.json({ success: true, slots: availableSlots });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch available slots' });
  }
});

/**
 * Book a new appointment
 */
router.post('/book', async (req: Request, res: Response) => {
  try {
    // Validate the request data
    const validatedData = bookAppointmentSchema.parse(req.body);
    
    // Use MongoDB storage for booking appointments
    const currentStorage = global.useMongoStorage ? mongoDBStorage : storage;
    
    // Check if the slot is still available (double booking prevention)
    const isSlotAvailable = await currentStorage.checkSlotAvailability(
      validatedData.doctorId, 
      validatedData.date, 
      validatedData.time
    );
    
    if (!isSlotAvailable) {
      return res.status(409).json({ 
        success: false, 
        message: 'This time slot is no longer available. Please select a different time.' 
      });
    }
    
    // Book the appointment and get the booking confirmation
    const appointmentData = await currentStorage.createAppointment({
      ...validatedData,
      status: 'confirmed',
      bookingTime: new Date().toISOString(),
    });
    
    // Get doctor details for the email
    const doctorDetails = await currentStorage.getDoctor(validatedData.doctorId);
    
    // Prepare data for email
    const emailData = {
      bookingId: appointmentData.id,
      patientName: validatedData.patientName,
      doctorName: doctorDetails.name,
      doctorSpecialty: doctorDetails.specialty,
      date: validatedData.date,
      time: validatedData.time,
      isVideoConsultation: validatedData.isVideoConsultation,
      clinicName: doctorDetails.clinicName,
      address: doctorDetails.clinicAddress,
    };
    
    // Send confirmation email
    await sendAppointmentConfirmation(validatedData.patientEmail, emailData);
    
    // Return the booking confirmation
    res.status(201).json({ 
      success: true, 
      message: 'Appointment booked successfully',
      appointment: appointmentData
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid appointment data',
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to book appointment' 
    });
  }
});

/**
 * Get appointments for a user (either doctor or patient)
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role = 'patient' } = req.query;
    
    const currentStorage = global.useMongoStorage ? mongoDBStorage : storage;
    
    // Fetch appointments based on role (doctor or patient)
    const appointments = role === 'doctor' 
      ? await currentStorage.getDoctorAppointments(userId)
      : await currentStorage.getPatientAppointments(userId);
    
    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
});

/**
 * Get detailed info for a specific appointment
 */
router.get('/:appointmentId', async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    
    const currentStorage = global.useMongoStorage ? mongoDBStorage : storage;
    const appointment = await currentStorage.getAppointment(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointment details' });
  }
});

/**
 * Update an appointment status (confirm, reschedule, cancel)
 */
router.patch('/:appointmentId/status', async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { status, cancellationReason } = req.body;
    
    if (!['confirmed', 'completed', 'cancelled', 'rescheduled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const currentStorage = global.useMongoStorage ? mongoDBStorage : storage;
    const updatedAppointment = await currentStorage.updateAppointmentStatus(
      appointmentId, 
      status, 
      cancellationReason
    );
    
    res.json({ success: true, appointment: updatedAppointment });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ success: false, message: 'Failed to update appointment status' });
  }
});

/**
 * Reschedule an appointment
 */
router.patch('/:appointmentId/reschedule', async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { date, time } = req.body;
    
    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'Date and time are required' });
    }
    
    const currentStorage = global.useMongoStorage ? mongoDBStorage : storage;
    
    // Check if the new slot is available
    const isSlotAvailable = await currentStorage.checkSlotAvailability(
      req.body.doctorId, 
      date, 
      time
    );
    
    if (!isSlotAvailable) {
      return res.status(409).json({ 
        success: false, 
        message: 'This time slot is no longer available. Please select a different time.' 
      });
    }
    
    const updatedAppointment = await currentStorage.rescheduleAppointment(appointmentId, date, time);
    
    // Get patient and doctor info for email notification
    const appointment = await currentStorage.getAppointment(appointmentId);
    
    // Send email notification about the rescheduled appointment
    if (appointment) {
      const doctorDetails = await currentStorage.getDoctor(appointment.doctorId);
      
      const emailData = {
        bookingId: appointment.id,
        patientName: appointment.patientName,
        doctorName: doctorDetails.name,
        doctorSpecialty: doctorDetails.specialty,
        date: date,
        time: time,
        isVideoConsultation: appointment.isVideoConsultation,
        clinicName: doctorDetails.clinicName,
        address: doctorDetails.clinicAddress,
        additionalInstructions: 'Your appointment has been rescheduled to the new date and time.'
      };
      
      await sendAppointmentConfirmation(appointment.patientEmail, emailData);
    }
    
    res.json({ success: true, appointment: updatedAppointment });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ success: false, message: 'Failed to reschedule appointment' });
  }
});

export default router;