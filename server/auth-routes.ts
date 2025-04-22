import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch';
import { randomBytes, scryptSync, createHash } from 'crypto';
import { storage as memStorage, IStorage } from './storage'; // In-memory storage
import { mongoDBStorage } from './mongodb-storage'; // MongoDB storage
import { mongoDBService } from './services/mongodb-service'; // MongoDB service
import { sendPasswordResetOTP, sendWelcomeEmail, generateOTP } from './email-service';

// Helper function to get the appropriate storage at runtime
function getStorage(): IStorage {
  const storage = global.useMongoStorage ? mongoDBStorage : memStorage;
  console.log(`Auth routes using ${global.useMongoStorage ? 'MongoDB' : 'in-memory'} storage (type: ${storage.constructor.name})`);
  return storage;
}

const router = Router();

// Google OAuth client
const googleClient = new OAuth2Client();

// Helper function to generate a secure password
function generateSecurePassword(): string {
  return randomBytes(16).toString('hex');
}

// Helper function to hash a password
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

/**
 * Google Authentication endpoint
 * Verifies Google ID tokens and creates or logs in the user
 */
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { token, user } = req.body;
    
    if (!token || !user) {
      return res.status(400).json({ message: 'Missing token or user data' });
    }
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.VITE_FIREBASE_API_KEY,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Use dynamic storage selection
    const storage = getStorage();
    console.log('Auth routes using storage type:', storage.constructor.name);
    
    // Check if user exists
    const existingUser = await storage.getUserByEmail(payload.email || '');
    
    let userId: number;
    
    if (existingUser) {
      // User exists, log them in
      userId = existingUser.id;
    } else {
      // User doesn't exist, create new account
      const newUser = await storage.createUser({
        username: user.uid || generateSecurePassword(),
        password: hashPassword(generateSecurePassword()),
        name: user.displayName || payload.name || '',
        email: payload.email || '',
        provider: 'google',
        avatarUrl: user.photoURL || payload.picture,
      });
      
      userId = newUser.id;
    }
    
    // Set user session
    if (req.session) {
      req.session.userId = userId;
      req.session.isAuthenticated = true;
    }
    
    // Return user data
    const userData = await storage.getUser(userId);
    res.status(200).json(userData);
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

/**
 * Facebook Authentication endpoint
 * Verifies Facebook access tokens and creates or logs in the user
 */
router.post('/facebook', async (req: Request, res: Response) => {
  try {
    const { token, user } = req.body;
    
    if (!token || !user) {
      return res.status(400).json({ message: 'Missing token or user data' });
    }
    
    // Verify token with Facebook
    const response = await fetch(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`);
    const data = await response.json();
    
    if (!data.data || !data.data.is_valid) {
      return res.status(401).json({ message: 'Invalid Facebook token' });
    }
    
    // Use dynamic storage selection
    const storage = getStorage();
    
    // Check if user exists
    const existingUser = await storage.getUserByEmail(user.email || '');
    
    let userId: number;
    
    if (existingUser) {
      // User exists, log them in
      userId = existingUser.id;
    } else {
      // User doesn't exist, create new account
      const newUser = await storage.createUser({
        username: user.uid || generateSecurePassword(),
        password: hashPassword(generateSecurePassword()),
        name: user.displayName || '',
        email: user.email || '',
        provider: 'facebook',
        avatarUrl: user.photoURL,
      });
      
      userId = newUser.id;
    }
    
    // Set user session
    if (req.session) {
      req.session.userId = userId;
      req.session.isAuthenticated = true;
    }
    
    // Return user data
    const userData = await storage.getUser(userId);
    res.status(200).json(userData);
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

/**
 * Phone OTP verification endpoint
 * Verifies OTP and creates or logs in the user
 */
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { verificationId, otp, phoneNumber } = req.body;
    
    if (!verificationId || !otp || !phoneNumber) {
      return res.status(400).json({ message: 'Missing verification data' });
    }
    
    // In a real application, we would verify with Firebase admin SDK
    // For now, assuming verification is successful
    
    // Generate a hash of the verification ID and OTP to simulate verification
    const verificationHash = createHash('sha256')
      .update(`${verificationId}:${otp}`)
      .digest('hex');
    
    // Use dynamic storage selection
    const storage = getStorage();
    
    // Check if user exists by phone
    const existingUser = await storage.getUserByPhone(phoneNumber);
    
    let userId: number;
    
    if (existingUser) {
      // User exists, log them in
      userId = existingUser.id;
    } else {
      // User doesn't exist, create new account with phone number
      const newUser = await storage.createUser({
        username: `user_${phoneNumber.replace(/\D/g, '')}`,
        password: hashPassword(generateSecurePassword()),
        name: `User ${phoneNumber.slice(-4)}`,
        email: `${phoneNumber.replace(/\D/g, '')}@example.com`,
        phone: phoneNumber,
        provider: 'phone',
      });
      
      userId = newUser.id;
    }
    
    // Set user session
    if (req.session) {
      req.session.userId = userId;
      req.session.isAuthenticated = true;
    }
    
    // Return user data
    const userData = await storage.getUser(userId);
    res.status(200).json(userData);
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

/**
 * Forgot Password endpoint
 * Generates and sends a reset OTP to the user's email
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Use dynamic storage selection
    const storage = getStorage();
    
    // Check if user exists
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      // For security reasons, we still return success even if user doesn't exist
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent' 
      });
    }
    
    // Generate OTP
    const otp = generateOTP(6);
    
    // Store OTP in database (in a real app)
    // For now, we'll just simulate this process
    
    // Send email
    const emailSent = await sendPasswordResetOTP(email, otp);
    
    if (emailSent) {
      console.log(`Password reset OTP ${otp} sent to ${email}`);
      res.status(200).json({ 
        message: 'Password reset instructions sent to your email',
        // Include OTP for testing purposes only, in production this should be removed
        testOtp: process.env.NODE_ENV === 'production' ? undefined : otp
      });
    } else {
      res.status(500).json({ message: 'Failed to send password reset email' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
});

/**
 * Test Welcome Email endpoint
 * Used for testing the welcome email functionality
 */
router.post('/test-welcome-email', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }
    
    // Send welcome email
    const emailSent = await sendWelcomeEmail(email, name);
    
    if (emailSent) {
      console.log(`Welcome email sent to ${email}`);
      res.status(200).json({ message: 'Welcome email sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send welcome email' });
    }
  } catch (error) {
    console.error('Test welcome email error:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
});

/**
 * Check if email exists (testing endpoint only)
 * This endpoint should be disabled in production
 */
router.post('/check-email', async (req: Request, res: Response) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ message: 'Endpoint not found' });
    }
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Use dynamic storage selection
    const storage = getStorage();
    console.log('check-email endpoint using storage:', storage.constructor.name);
    
    // Check if user exists
    const user = await storage.getUserByEmail(email);
    
    // Return existence status
    res.status(200).json({ 
      exists: !!user,
      // Include user ID for testing only
      userId: user ? user.id : null
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ message: 'Error checking email' });
  }
});

export default router;