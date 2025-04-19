import { Router, Request, Response } from 'express';
import { storage } from './storage';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

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
      // For security reasons, don't reveal if the email exists in the database
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
    
    // In a production app, you would send the OTP via email
    // For our mock implementation, we'll just log it
    console.log(`[MOCK EMAIL SERVICE] OTP for ${email}: ${otp}`);
    
    return res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
  }
});

// Route to verify OTP
router.post('/verify-otp', (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    
    // Clean up expired OTPs
    cleanupExpiredOtps();
    
    // Find OTP record
    const otpRecord = otpStore.find(record => record.email === email && record.otp === otp);
    
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
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
    
    // Clean up expired OTPs
    cleanupExpiredOtps();
    
    // Find OTP record
    const otpRecord = otpStore.find(record => record.email === email && record.otp === otp);
    
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
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
    
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while resetting your password' });
  }
});

export default router;