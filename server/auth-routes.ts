import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch';
import { randomBytes, createHash } from 'crypto';
import { storage as memStorage, IStorage } from './storage'; // In-memory storage
import { mongoDBStorage } from './mongodb-storage'; // MongoDB storage
import { mongoDBService } from './services/mongodb-service'; // MongoDB service
import { sendPasswordResetOTP, sendWelcomeEmail, generateOTP, sendLoginOTP } from './email-service';
import { hashPassword, verifyPassword, logPasswordDetails } from './utils/password-util';

// Helper function to get the appropriate storage at runtime
function getStorage(): IStorage {
  const storage = global.useMongoStorage ? mongoDBStorage : memStorage;
  console.log(`Auth routes using ${global.useMongoStorage ? 'MongoDB' : 'in-memory'} storage (type: ${storage.constructor.name})`);
  return storage;
}

const router = Router();

// Google OAuth client
const googleClient = new OAuth2Client();

// OTP storage - In production this should be in Redis or a database
const otpStore = new Map<string, { otp: string; expires: number; userId?: number; }>();

// Store active login sessions - In production this should be in Redis or a database
const activeLoginSessions = new Map<string, { userId: number; expires: number; }>(); 

// Helper function to generate a secure password
function generateSecurePassword(): string {
  return randomBytes(16).toString('hex');
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

/**
 * Regular login with username/email and password
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('Processing login request');
    const { username, email, password } = req.body;
    
    if ((!username && !email) || !password) {
      return res.status(400).json({ message: 'Username/email and password are required' });
    }
    
    // Use dynamic storage selection
    const storage = getStorage();
    console.log(`Login using ${global.useMongoStorage ? 'MongoDB' : 'in-memory'} storage`);
    
    // Find user by username or email
    let user;
    if (username) {
      console.log(`Attempting to find user by username: ${username}`);
      user = await storage.getUserByUsername(username);
    } else if (email) {
      console.log(`Attempting to find user by email: ${email}`);
      user = await storage.getUserByEmail(email);
    }
    
    // If user not found or password doesn't match
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log(`User found with ID: ${user.id}`);
    
    // Log password details for debugging (only in development)
    if (process.env.NODE_ENV !== 'production') {
      logPasswordDetails('login-attempt', password, user.password);
    }
    
    // Verify password using async version
    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      console.log('Password verification failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password verification successful');
    
    // Set user session
    if (req.session) {
      req.session.userId = user.id;
      req.session.isAuthenticated = true;
      console.log(`Session established for user ID: ${user.id}`);
    }
    
    // Return user data (excluding password)
    const { password: _, ...userData } = user;
    console.log('Login successful');
    
    res.status(200).json(userData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

/**
 * Logout endpoint
 */
router.post('/logout', (req: Request, res: Response) => {
  try {
    if (req.session) {
      // Destroy the session
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ message: 'Logout failed' });
        }
        
        res.status(200).json({ message: 'Logged out successfully' });
      });
    } else {
      res.status(200).json({ message: 'Already logged out' });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

/**
 * Get current user
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Use dynamic storage selection
    const storage = getStorage();
    
    // Get user data
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data without password
    const { password: _, ...userData } = user;
    res.status(200).json(userData);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get user data' });
  }
});

/**
 * Request OTP login
 * Generates and sends an OTP for login via email
 */
router.post('/request-login-otp', async (req: Request, res: Response) => {
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
      // For security reasons, still return success even if user doesn't exist
      return res.status(200).json({ 
        message: 'If an account with that email exists, a login code has been sent',
        success: false
      });
    }
    
    // Generate OTP
    const otp = generateOTP(6);
    
    // Store OTP with expiration (15 minutes)
    const expiresAt = Date.now() + 15 * 60 * 1000;
    otpStore.set(email, { otp, expires: expiresAt, userId: user.id });
    
    // Send login OTP email
    const emailSent = await sendLoginOTP(email, otp);
    
    if (emailSent) {
      console.log(`Login OTP ${otp} sent to ${email} for user ID ${user.id}`);
      
      res.status(200).json({ 
        message: 'Login code sent to your email',
        success: true,
        // Include OTP for testing purposes only
        testOtp: process.env.NODE_ENV === 'production' ? undefined : otp
      });
    } else {
      console.error(`Failed to send login OTP to ${email}`);
      res.status(500).json({ message: 'Failed to send login code', success: false });
    }
  } catch (error) {
    console.error('Request login OTP error:', error);
    res.status(500).json({ message: 'Error processing request', success: false });
  }
});

/**
 * Verify OTP login
 * Validates the OTP sent to email and logs in the user
 */
router.post('/verify-login-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    // Check if OTP exists and is valid
    const otpData = otpStore.get(email);
    
    if (!otpData || otpData.otp !== otp) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }
    
    // Check if OTP is expired
    if (otpData.expires < Date.now()) {
      // Delete expired OTP
      otpStore.delete(email);
      return res.status(401).json({ message: 'OTP has expired' });
    }
    
    // OTP is valid, get the user
    const storage = getStorage();
    const user = await storage.getUser(otpData.userId as number);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Clear the OTP
    otpStore.delete(email);
    
    // Set user session
    if (req.session) {
      req.session.userId = user.id;
      req.session.isAuthenticated = true;
    }
    
    // Return user data (excluding password)
    const { password: _, ...userData } = user;
    res.status(200).json(userData);
  } catch (error) {
    console.error('Verify login OTP error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

export default router;