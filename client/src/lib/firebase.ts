import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, Auth } from "firebase/auth";
import { getMessaging, isSupported } from 'firebase/messaging';

// Check if all required Firebase config values are available
const hasAllRequiredConfig = () => {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID
  );
};

// Define variables with correct types
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;
let facebookProvider: FacebookAuthProvider | undefined;

// Only initialize Firebase if all required config values are available
if (hasAllRequiredConfig()) {
  try {
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
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    // Initialize Authentication
    if (app) {
      auth = getAuth(app);
      
      // Initialize providers for social login
      googleProvider = new GoogleAuthProvider();
      facebookProvider = new FacebookAuthProvider();

      // Configure persistence and settings
      if (auth) {
        auth.useDeviceLanguage(); // Set auth language to match device
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        facebookProvider.setCustomParameters({ display: 'popup' });
      }
      
      console.log('Firebase initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error instanceof Error ? error.message : String(error));
  }
} else {
  console.warn('Firebase initialization skipped - missing config values');
}

// Initialize Cloud Messaging if browser supports it
export const getMessagingIfSupported = async () => {
  if (!app) return null;
  
  try {
    const isMessagingSupported = await isSupported();
    if (isMessagingSupported) {
      return getMessaging(app);
    }
    console.log('Firebase Cloud Messaging is not supported in this browser');
    return null;
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error instanceof Error ? error.message : String(error));
    return null;
  }
};

// Export Firebase instances if they were initialized
export { app, auth, googleProvider, facebookProvider };