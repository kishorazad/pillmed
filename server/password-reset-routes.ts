import { Router, Request, Response } from 'express';
import { storage } from './storage';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { mockEmailService } from './mock-email-service';

const router = Router();
const scryptAsync = promisify(scrypt);

// Store OTPs with expiration times
interface OtpRecord {
  email: string;
  otp: string;
  expiresAt: number; // Timestamp in milliseconds
}

// In-memory OTP storage (in a real app, this would be in a database)
const otpStore: OtpRecord[] = [];

// Helper to clean up expired OTPs
function cleanupExpiredOtps() {
  const now = Date.now();
  const validOtps = otpStore.filter(record => record.expiresAt > now);
  otpStore.length = 0;
  otpStore.push(...validOtps);
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
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      // For security reasons, still return success to avoid revealing if the email exists
      // But don't actually send an OTP
      return res.json({ success: true, message: 'If the email exists, an OTP has been sent' });
    }
    
    // Clean up expired OTPs
    cleanupExpiredOtps();
    
    // Generate OTP
    const otp = generateOtp();
    
    // Store OTP with 10-minute expiration
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Remove any existing OTPs for this email
    const existingIndex = otpStore.findIndex(record => record.email === email);
    if (existingIndex !== -1) {
      otpStore.splice(existingIndex, 1);
    }
    
    // Store new OTP
    otpStore.push({ email, otp, expiresAt });
    
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
    
    // Check if the user exists first
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log(`OTP verification attempted for non-existent email: ${email}`);
      // For security reasons, don't reveal if the email exists
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
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
    
    // Find user by email first - verify the user exists before even checking OTP
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log(`Password reset attempted for non-existent email: ${email}`);
      // For security reasons, return a generic error message
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
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
    await storage.updateUserPassword(user.id, hashedPassword);
    
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