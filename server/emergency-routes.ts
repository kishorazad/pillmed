import express, { Request, Response } from 'express';
import { z } from 'zod';

const router = express.Router();

const emergencySchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(5),
  pincode: z.string().min(6),
  emergencyType: z.enum(['medical', 'ambulance', 'home_doctor', 'nursing']),
  urgencyLevel: z.enum(['urgent', 'scheduled']),
  description: z.string().min(10),
  preferredTime: z.string().optional(),
  consent: z.boolean()
});

type EmergencyRequest = z.infer<typeof emergencySchema>;

// In-memory storage for emergency requests (would be replaced with database in production)
const emergencyRequests: (EmergencyRequest & { id: string, timestamp: Date })[] = [];

// POST /api/emergency-requests - Create new emergency request
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = emergencySchema.parse(req.body);
    
    // Create new emergency request with ID and timestamp
    const newRequest = {
      ...validatedData,
      id: `ER${Date.now()}`,
      timestamp: new Date()
    };
    
    // Store the request
    emergencyRequests.push(newRequest);
    
    // Log for monitoring (in production, would send notifications to medical team)
    console.log(`New emergency request received: ${newRequest.id}`);
    console.log(`Type: ${newRequest.emergencyType}, Urgency: ${newRequest.urgencyLevel}`);
    
    // In a real implementation, we would:
    // 1. Store in database
    // 2. Send SMS/email notifications to medical team
    // 3. Trigger alerts for urgent cases
    // 4. Setup response SLA tracking
    
    res.status(201).json({
      success: true,
      message: 'Emergency request submitted successfully',
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
    
    console.error('Error submitting emergency request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit emergency request'
    });
  }
});

// GET /api/emergency-requests - Get all emergency requests (admin only in production)
router.get('/', (req: Request, res: Response) => {
  // In production, this would require admin authentication
  res.json(emergencyRequests);
});

export default router;