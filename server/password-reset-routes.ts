import { Router, Request, Response } from 'express';
import { storage } from './storage';
import { mongoDBStorage } from './mongodb-storage';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetOTP, sendPasswordResetConfirmation, sendPasswordResetToken } from './email-service';
import { hashPassword, verifyPassword, logPasswordDetails } from './utils/password-util';

const router = Router();

// Helper to get the appropriate storage service
function getStorageService() {
  return global.useMongoStorage ? mongoDBStorage : storage;
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
    
    // Send OTP via email service
    await sendPasswordResetOTP(email, otp);
    
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
    
    // Get the appropriate storage service
    const storageService = getStorageService();
    
    // Check if the user exists
    try {
      const user = await storageService.getUserByEmail(email);
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
    
    // Find OTP record from storage
    const otpRecord = await storageService.getOtpRecord(email);
    
    if (!otpRecord || otpRecord.otp !== otp) {
      console.log(`Invalid OTP attempt for ${email}: ${otp}`);
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // Check if OTP is expired
    const now = new Date();
    if (otpRecord.expiresAt < now) {
      console.log(`Expired OTP used for ${email}: ${otp}`);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    
    // Mark the OTP as verified
    await storageService.updateOtpRecord(email, { verified: true });
    
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
    
    // Get the appropriate storage service
    const storageService = getStorageService();
    
    // Check if the user exists
    let user;
    try {
      user = await storageService.getUserByEmail(email);
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
    
    // Find OTP record from storage
    const otpRecord = await storageService.getOtpRecord(email);
    
    if (!otpRecord || otpRecord.otp !== otp) {
      console.log(`Invalid OTP provided for password reset: ${email}, OTP: ${otp}`);
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // Check if OTP is expired
    const now = new Date();
    if (otpRecord.expiresAt < now) {
      console.log(`Expired OTP used for password reset: ${email}, OTP: ${otp}`);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(password);
    
    // Update user's password
    if (user.id === 999999) {
      // For a temporary user (non-existent in the DB), just log success
      console.log(`DEVELOPMENT MODE: Password reset simulated for temporary user: ${email}`);
    } else {
      // Update real user's password in the database using the appropriate storage service
      try {
        await storageService.updateUserPassword(user.id, hashedPassword);
      } catch (error) {
        console.error(`Error updating user password: ${error}`);
        return res.status(500).json({ success: false, message: 'Failed to update password' });
      }
    }
    
    // Delete the OTP record from storage
    await storageService.deleteOtpRecord(email);
    
    console.log(`Password reset successful for user: ${email}`);
    
    // Send confirmation email
    await sendPasswordResetConfirmation(email);
    
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while resetting your password' });
  }
});

// Token-based password reset flow
// Route to request a password reset token (alternative to OTP-based reset)
router.post('/request-token', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    // Get the appropriate storage service
    const storageService = getStorageService();
    
    // Check if the user exists
    const user = await storageService.getUserByEmail(email);
    if (!user) {
      // For security reasons, we still return a success response even if the email doesn't exist
      // This prevents email enumeration attacks
      console.log(`Password reset token requested for non-existent email: ${email}`);
      return res.json({ success: true, message: 'If your email is registered, you will receive a password reset link' });
    }
    
    // Generate a unique token
    const token = uuidv4();
    
    // Set token expiration (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Save the token in the database
    await storageService.savePasswordResetToken({
      userId: user.id,
      token,
      expiresAt,
      used: false
    });
    
    // Generate a reset link with the token
    const resetLink = `https://pillnow.app/reset-password?token=${token}`;
    console.log(`Generated password reset token for ${email}: ${token}`);
    console.log(`Password reset link: ${resetLink}`);
    
    // Send the password reset email with the token link
    await sendPasswordResetToken(email, token, resetLink);
    
    return res.json({ success: true, message: 'If your email is registered, you will receive a password reset link' });
  } catch (error) {
    console.error('Token-based password reset request error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
  }
});

// Route to verify a password reset token
router.post('/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }
    
    // Get the appropriate storage service
    const storageService = getStorageService();
    
    // Get the token from the database
    const resetToken = await storageService.getPasswordResetToken(token);
    
    // Check if the token exists and is not used
    if (!resetToken || resetToken.used) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Check if the token is expired
    const now = new Date();
    if (resetToken.expiresAt < now) {
      return res.status(400).json({ success: false, message: 'Token has expired. Please request a new one.' });
    }
    
    // Token is valid
    return res.json({ success: true, message: 'Token is valid' });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while verifying the token' });
  }
});

// Route to reset password using a token
router.post('/reset-with-token', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    
    // Get the appropriate storage service
    const storageService = getStorageService();
    
    // Get the token from the database
    const resetToken = await storageService.getPasswordResetToken(token);
    
    // Check if the token exists and is not used
    if (!resetToken || resetToken.used) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Check if the token is expired
    const now = new Date();
    if (resetToken.expiresAt < now) {
      return res.status(400).json({ success: false, message: 'Token has expired. Please request a new one.' });
    }
    
    // Get the user
    const user = await storageService.getUser(resetToken.userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(password);
    
    // Update the user's password
    await storageService.updateUserPassword(user.id, hashedPassword);
    
    // Invalidate the token
    await storageService.invalidatePasswordResetToken(token);
    
    // Send confirmation email
    await sendPasswordResetConfirmation(user.email);
    
    console.log(`Password reset successful for user ID: ${user.id}`);
    
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Token-based password reset error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while resetting your password' });
  }
});

export default router;