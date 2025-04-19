import express, { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create validation schema for emergency requests
export const emergencySchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
  serviceType: z.enum(['ambulance', 'doctor_visit', 'nursing', 'scheduled']),
  address: z.string().min(5),
  urgency: z.enum(['high', 'medium', 'low']),
  description: z.string().min(5).max(500),
});

type EmergencyRequest = z.infer<typeof emergencySchema>;

// In-memory storage for emergency requests (in a real system, this would be a database)
const emergencyRequests: (EmergencyRequest & { id: string, timestamp: Date })[] = [];

// Create a new emergency request
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = emergencySchema.parse(req.body);
    
    // Generate unique ID and add timestamp
    const newRequest = {
      ...validatedData,
      id: uuidv4(),
      timestamp: new Date()
    };
    
    // Store the request
    emergencyRequests.push(newRequest);
    
    // In a real system, we would also:
    // 1. Send notifications to relevant healthcare providers
    // 2. Send SMS confirmation to the user
    // 3. Store in a persistent database
    
    console.log(`New emergency request received: ${newRequest.serviceType} - ${newRequest.urgency} priority`);
    
    return res.status(201).json({
      success: true,
      message: 'Emergency request received',
      requestId: newRequest.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }
    
    console.error('Emergency request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process emergency request'
    });
  }
});

// Get all emergency requests (admin access only in a real system)
router.get('/', (req: Request, res: Response) => {
  return res.json(emergencyRequests);
});

export default router;