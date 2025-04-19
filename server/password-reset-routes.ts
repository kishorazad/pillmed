import express from 'express';
import { storage } from './storage';
import { z } from 'zod';
import { mockEmailService } from './mock-email-service';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const router = express.Router();
const scryptAsync = promisify(scrypt);

// Validate email
const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' })
});

// Validate OTP
const verifyOtpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  otp: z.string().length(6, { message: 'OTP must be 6 digits' })
});

// Validate reset password
const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  otp: z.string().length(6, { message: 'OTP must be 6 digits' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

// Hash password
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Request password reset - send OTP via email
router.post('/request', async (req, res) => {
  try {
    // Validate email
    const { email } = emailSchema.parse(req.body);
    
    // Check if user exists
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }
    
    // Generate and send OTP
    await mockEmailService.sendPasswordResetOTP(email);
    
    return res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request'
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    // Validate input
    const { email, otp } = verifyOtpSchema.parse(req.body);
    
    // Verify OTP
    const isValid = mockEmailService.verifyOTP(email, otp, 'password-reset');
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('OTP verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while verifying the OTP'
    });
  }
});

// Reset password with OTP
router.post('/reset', async (req, res) => {
  try {
    // Validate input
    const { email, otp, password } = resetPasswordSchema.parse(req.body);
    
    // Verify OTP
    const isValid = mockEmailService.verifyOTP(email, otp, 'password-reset');
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(password);
    
    // Update user's password
    await storage.updateUserPassword(user.id, hashedPassword);
    
    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while resetting the password'
    });
  }
});

export default router;