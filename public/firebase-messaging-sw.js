// This service worker is needed for Firebase Cloud Messaging to work in the background
// It will be automatically registered when the app loads

// Scripts imported by the service worker must be fetched from the network
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Store Firebase config values
self.FIREBASE_API_KEY = '';
self.FIREBASE_PROJECT_ID = '';
self.FIREBASE_MESSAGING_SENDER_ID = '';
self.FIREBASE_APP_ID = '';

// Listen for messages from the main application with config values
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    self[event.data.key] = event.data.value;
    console.log(`[firebase-messaging-sw.js] Received config ${event.data.key}`);
    
    // Try to initialize Firebase if we have all the required config
    if (self.FIREBASE_API_KEY && self.FIREBASE_PROJECT_ID && 
        self.FIREBASE_MESSAGING_SENDER_ID && self.FIREBASE_APP_ID) {
      initializeFirebase();
    }
  }
});

// Flag to track if Firebase has been initialized
let firebaseInitialized = false;

// Initialize Firebase with the received config
function initializeFirebase() {
  // Prevent multiple initializations
  if (firebaseInitialized) return;
  
  // Initialize the Firebase app
  firebase.initializeApp({
    apiKey: self.FIREBASE_API_KEY,
    authDomain: `${self.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: self.FIREBASE_PROJECT_ID,
    storageBucket: `${self.FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID,
    appId: self.FIREBASE_APP_ID,
  });
  
  firebaseInitialized = true;
  console.log('[firebase-messaging-sw.js] Firebase initialized');
}

// Get Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification.title || 'New PillNow Notification';
  const notificationOptions = {
    body: payload.notification.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data,
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  
  // Close the notification
  event.notification.close();
  
  // Handle click action - typically opening a specific URL
  const clickAction = event.notification.data?.clickAction;
  if (clickAction) {
    // Navigate to the URL
    clients.openWindow(clickAction);
  } else {
    // Default action - open the app
    clients.openWindow('/');
  }
});