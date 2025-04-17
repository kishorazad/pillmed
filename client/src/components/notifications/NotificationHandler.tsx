import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { useStore } from '@/lib/store';
import { apiRequest } from '@/lib/queryClient';
import { injectFirebaseConfigIntoServiceWorker } from '@/lib/injectFirebaseConfig';

/**
 * NotificationHandler component manages Firebase Cloud Messaging (FCM) integration
 * It handles permission requests, token registration, and displaying notifications
 */
export function NotificationHandler() {
  const { toast } = useToast();
  const { user } = useStore();
  const [, setNotificationToken] = useState<string | null>(null);

  // Register service worker and inject Firebase config
  useEffect(() => {
    // Register service worker for Firebase Cloud Messaging
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Inject Firebase configuration into the service worker
          injectFirebaseConfigIntoServiceWorker();
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Request permission and register token when user logs in
  useEffect(() => {
    // Only proceed if we have a logged in user
    if (!user) return;

    const registerNotificationToken = async () => {
      try {
        // Request permission and get FCM token
        const token = await requestNotificationPermission();
        
        if (!token) return;
        
        setNotificationToken(token);
        
        // Register token with our backend
        await apiRequest('POST', '/api/notification-tokens', {
          token,
          userId: user.id,
          deviceInfo: navigator.userAgent
        });
        
        console.log('Notification token registered successfully');
      } catch (error) {
        console.error('Error registering notification token:', error);
      }
    };

    registerNotificationToken();
  }, [user]);

  // Set up listener for foreground messages
  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
      // Display notification as toast
      const { notification } = payload;
      
      if (notification) {
        toast({
          title: notification.title || 'New notification',
          description: notification.body || '',
          duration: 5000,
        });
      }
    });

    // Clean up listener on unmount
    return () => {
      unsubscribe();
    };
  }, [toast]);

  // This component doesn't render anything visible
  return null;
}

export default NotificationHandler;