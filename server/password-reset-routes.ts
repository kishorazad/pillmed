import { Router, Request, Response } from 'express';
import { storage } from './storage';
import { mongoDBStorage } from './mongodb-storage';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { mockEmailService } from './mock-email-service';

const router = Router();
const scryptAsync = promisify(scrypt);

// Helper to get the appropriate storage service
function getStorageService() {
  return global.useMongoStorage ? mongoDBStorage : storage;
}

// Hash password using scrypt
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Generate a 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Route to request a password reset
router.post('/request', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    // Find user by email
    const storageService = getStorageService();
    try {
      const user = await storageService.getUserByEmail(email);
      if (!user) {
        console.log(`Password reset requested for non-existent email: ${email}`);
        
        // IMPORTANT: For testing purposes, we'll still send an OTP even if the email doesn't exist
        // This allows testing the reset flow without requiring a registered email
        // In a production environment, we would only send OTPs to registered emails
        console.log(`DEVELOPMENT MODE: Sending OTP despite email not being registered: ${email}`);
      }
    } catch (error) {
      console.error(`Error checking user email: ${error}`);
      // Continue with OTP generation even if database lookup fails
    }
    
    // Generate OTP
    const otp = generateOtp();
    
    // Store OTP with 10-minute expiration (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // First check if we already have an OTP record for this email
    const existingOtpRecord = await storageService.getOtpRecord(email);
    
    if (existingOtpRecord) {
      // Update the existing OTP record
      await storageService.updateOtpRecord(email, { 
        otp, 
        expiresAt 
      });
    } else {
      // Create a new OTP record
      await storageService.createOtpRecord(email, otp, expiresAt);
    }
    
    console.log(`Generated OTP ${otp} for ${email} with expiration at ${new Date(expiresAt).toLocaleString()}`);
    
    // Send OTP via mock email service
    await mockEmailService.sendOtpEmail(email, otp);
    
    return res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
  }
});

// Route to verify OTP
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    
    // Check if the user exists
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`OTP verification attempted for non-existent email: ${email}`);
        console.log(`DEVELOPMENT MODE: Allowing OTP verification for non-existent email: ${email}`);
        // In development mode, we'll continue to allow OTP verification
        // In production, we would return an error here
      }
    } catch (error) {
      console.error(`Error checking user for OTP verification: ${error}`);
      // Continue with OTP verification even if database lookup fails
    }
    
    // Clean up expired OTPs
    cleanupExpiredOtps();
    
    // Find OTP record
    const otpRecord = otpStore.find(record => record.email === email && record.otp === otp);
    
    if (!otpRecord) {
      console.log(`Invalid OTP attempt for ${email}: ${otp}`);
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    console.log(`OTP verified successfully for ${email}`);
    return res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while verifying the OTP' });
  }
});

// Route to reset password
router.post('/reset', async (req: Request, res: Response) => {
  try {
    const { email, otp, password } = req.body;
    
    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }
    
    // Check if the user exists
    let user;
    try {
      user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`Password reset attempted for non-existent email: ${email}`);
        console.log(`DEVELOPMENT MODE: Creating temporary user account for: ${email}`);
        
        // In development mode, we'll create a temporary user account for testing
        // In production, we would return an error here
        user = {
          id: 999999, // Use a high number unlikely to conflict
          email: email,
          username: email.split('@')[0],
          name: 'Temporary User',
          password: 'placeholder',
          role: 'customer',
          phone: null,
          address: null,
          pincode: null,
          profileImageUrl: null
        };
      }
    } catch (error) {
      console.error(`Error checking user for password reset: ${error}`);
      return res.status(500).json({ success: false, message: 'Database error occurred' });
    }
    
    // Clean up expired OTPs
    cleanupExpiredOtps();
    
    // Find OTP record
    const otpRecord = otpStore.find(record => record.email === email && record.otp === otp);
    
    if (!otpRecord) {
      console.log(`Invalid OTP provided for password reset: ${email}, OTP: ${otp}`);
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(password);
    
    // Update user's password
    if (user.id === 999999) {
      // For a temporary user (non-existent in the DB), just log success
      console.log(`DEVELOPMENT MODE: Password reset simulated for temporary user: ${email}`);
    } else {
      // Update real user's password in the database
      await storage.updateUserPassword(user.id, hashedPassword);
    }
    
    // Remove OTP record
    const otpIndex = otpStore.findIndex(record => record.email === email);
    if (otpIndex !== -1) {
      otpStore.splice(otpIndex, 1);
    }
    
    console.log(`Password reset successful for user: ${email}`);
    
    // Send confirmation email
    await mockEmailService.sendPasswordResetConfirmation(email);
    
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while resetting your password' });
  }
});

export default router;