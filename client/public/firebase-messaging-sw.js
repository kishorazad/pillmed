// Firebase Cloud Messaging Service Worker
// This file must be named 'firebase-messaging-sw.js' and placed in the root of the public directory

// Firebase app version (will be replaced in build process)
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// This configuration is public and doesn't need to be secured
firebase.initializeApp({
  apiKey: 'API_KEY_PLACEHOLDER', // Will be replaced in runtime
  authDomain: 'PROJECT_ID_PLACEHOLDER.firebaseapp.com', // Will be replaced in runtime
  projectId: 'PROJECT_ID_PLACEHOLDER', // Will be replaced in runtime
  storageBucket: 'PROJECT_ID_PLACEHOLDER.appspot.com', // Will be replaced in runtime
  messagingSenderId: 'MESSAGING_SENDER_ID_PLACEHOLDER', // Will be replaced in runtime
  appId: 'APP_ID_PLACEHOLDER', // Will be replaced in runtime
});

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification.title || 'PillNow';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new notification',
    icon: '/pillnow.png',
    badge: '/pillnow.png',
    tag: payload.data?.tag || 'default',
    data: payload.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
      },
    ],
  };
  
  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Get the notification data
  const data = event.notification.data;
  
  // Handle different notification types
  let url = '/';
  if (data && data.url) {
    url = data.url;
  } else if (data && data.type) {
    switch (data.type) {
      case 'order':
        url = `/orders/${data.orderId}`;
        break;
      case 'medication':
        url = '/medication-tracking';
        break;
      case 'offer':
        url = `/products/${data.productId}`;
        break;
      default:
        url = '/';
    }
  }
  
  // Focus or open a new window
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is open with the URL, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});