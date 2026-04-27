/**
 * This helper injects Firebase configuration values into the service worker.
 * Since service workers can't directly access environment variables, we need to pass them in.
 */
export function injectFirebaseConfigIntoServiceWorker() {
  // Only run in browser environment
  if (typeof window === 'undefined' || !navigator.serviceWorker) return;

  // Get the Firebase configuration from environment variables
  const config = {
    FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  };
  
  // Check if we have the required values
  if (!config.FIREBASE_API_KEY || !config.FIREBASE_PROJECT_ID || 
      !config.FIREBASE_APP_ID || !config.FIREBASE_MESSAGING_SENDER_ID) {
    console.warn('Firebase configuration is incomplete. Push notifications may not work.');
    return;
  }

  // Once the service worker is registered, we can send the config to it
  navigator.serviceWorker.ready.then(registration => {
    // The service worker scope
    const serviceWorker = registration.active;
    if (!serviceWorker) return;

    // Inject each config value
    Object.entries(config).forEach(([key, value]) => {
      serviceWorker.postMessage({
        type: 'FIREBASE_CONFIG',
        key,
        value
      });
    });

    console.log('Firebase config injected into service worker');
  }).catch(error => {
    console.error('Failed to inject Firebase config:', error);
  });
}