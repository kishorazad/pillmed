import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  signInWithPopup, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithCredential,
  sendSignInLinkToEmail
} from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize providers for social login
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Messaging
let messaging: any;

// Initialize messaging only in browser environment with service worker support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Failed to initialize Firebase messaging:', error);
  }
}

// Request notification permission and get token
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) return null;
    
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }
    
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });
    
    if (token) {
      console.log('Notification token:', token);
      
      // Save token to database via API
      await fetch('/api/notification-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for message events
export const onMessageListener = () => {
  if (!messaging) return Promise.reject('Messaging not initialized');
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

// Google Sign-in
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Return user information to be stored in your backend
    return {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      profilePicture: user.photoURL,
      provider: 'google'
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Facebook Sign-in
export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;
    
    // Return user information to be stored in your backend
    return {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      profilePicture: user.photoURL,
      provider: 'facebook'
    };
  } catch (error) {
    console.error('Error signing in with Facebook:', error);
    throw error;
  }
};

// Setup reCAPTCHA
export const setupRecaptcha = (elementId: string) => {
  return new RecaptchaVerifier(auth, elementId, {
    'size': 'invisible'
  });
};

// Phone authentication
export const sendOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    // Store the confirmation result in localStorage
    window.localStorage.setItem('otpConfirmation', JSON.stringify({
      verificationId: confirmationResult.verificationId,
      phone: phoneNumber
    }));
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (otp: string) => {
  try {
    const storedData = window.localStorage.getItem('otpConfirmation');
    if (!storedData) {
      throw new Error('No verification ID found');
    }
    
    const { verificationId, phone } = JSON.parse(storedData);
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    const result = await signInWithCredential(auth, credential);
    
    // Return user information
    return {
      id: result.user.uid,
      phone,
      provider: 'phone'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Email link authentication
export const sendSignInLink = async (email: string) => {
  try {
    const actionCodeSettings = {
      url: window.location.origin + '/auth/email-signin',
      handleCodeInApp: true
    };
    
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    return true;
  } catch (error) {
    console.error('Error sending sign-in link:', error);
    throw error;
  }
};

export { auth };