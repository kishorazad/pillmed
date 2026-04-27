import { useEffect, useRef, useState } from 'react';
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { app } from '@/lib/firebase';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/LanguageSwitcher';
import { BellRing } from 'lucide-react';

interface NotificationHandlerProps {
  userId?: number; // Optional user ID for personalized notifications
}

/**
 * FirebaseMessage interface defines the structure of FCM messages
 */
interface FirebaseMessage {
  notification: {
    title: string;
    body: string;
    icon?: string;
  };
  data?: Record<string, string>;
}

/**
 * Component to handle Firebase notifications
 * This will request permission and listen for incoming push notifications
 */
const NotificationHandler = ({ userId }: NotificationHandlerProps) => {
  const [permissionStatus, setPermissionStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const messaging = useRef<Messaging | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState<boolean>(false);

  // Attempt to disable runtime error overlay for Firebase compatibility issues
  useEffect(() => {
    // Target the error overlay to handle Firebase compatibility issues
    const handleOverlayRuntimeError = () => {
      const errorOverlay = document.querySelector('[plugin\\:runtime-error-plugin]');
      if (errorOverlay) {
        // Find the close button or handle alternate methods to close it
        const closeButton = errorOverlay.querySelector('button');
        if (closeButton) {
          closeButton.click();
        }
        
        // If we can't find a close button, try hiding the overlay directly
        (errorOverlay as HTMLElement).style.display = 'none';
      }
    };
    
    // Apply immediately and set up a short interval to catch if it appears
    handleOverlayRuntimeError();
    const intervalId = setInterval(handleOverlayRuntimeError, 500);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Check if Firebase is available
  useEffect(() => {
    const checkFirebaseAvailability = async () => {
      try {
        // Check if app is defined (from firebase.ts) and initialized
        if (!app) {
          console.log('Firebase app is not initialized - skipping notifications');
          setIsFirebaseAvailable(false);
          return;
        }

        // Check if notifications are supported in this browser
        if (!('Notification' in window)) {
          console.log('This browser does not support notifications');
          setIsFirebaseAvailable(false);
          return;
        }

        // Check if the browser supports service workers
        if (!('serviceWorker' in navigator)) {
          console.log('This browser does not support service workers needed for Firebase');
          setIsFirebaseAvailable(false);
          return;
        }

        try {
          // Initialize messaging reference safely - wrapped in a try catch
          const messagingInstance = getMessaging(app);
          messaging.current = messagingInstance;
          setIsFirebaseAvailable(true);
          
          // Check permission status
          const permission = Notification.permission as 'default' | 'granted' | 'denied';
          setPermissionStatus(permission);
  
          // If permission already granted, get token
          if (permission === 'granted') {
            await getFCMToken();
          }
        } catch (e) {
          // This is likely a browser compatibility error - not all browsers support Firebase Messaging
          console.log('Firebase Messaging is not supported in this browser');
          setIsFirebaseAvailable(false);
          return;
        }
      } catch (error) {
        console.error('FCM initialization error:', error);
        setIsFirebaseAvailable(false);
      }
    };

    checkFirebaseAvailability();
  }, []);

  // Listen for incoming messages when app is in foreground
  useEffect(() => {
    // Only set up listener if Firebase is available and permission is granted
    if (isFirebaseAvailable && messaging.current && permissionStatus === 'granted') {
      try {
        const unsubscribe = onMessage(messaging.current, (payload: any) => {
          console.log('Message received in foreground:', payload);
          
          // Show toast notification
          toast({
            title: payload.notification?.title || t('new_notification'),
            description: payload.notification?.body || '',
            duration: 5000,
          });
          
          // You can also show a system notification here if needed
          showLocalNotification(payload.notification);
        });
        
        // Clean up listener on unmount
        return () => {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        };
      } catch (error) {
        console.error('Error setting up message listener:', error);
      }
    }
  }, [isFirebaseAvailable, permissionStatus, toast, t]);

  // Function to get FCM token
  const getFCMToken = async () => {
    if (!isFirebaseAvailable || !messaging.current) {
      console.log('Firebase messaging not available - cannot get token');
      return;
    }
    
    try {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      const options = vapidKey ? { vapidKey } : undefined;
      
      const currentToken = await getToken(messaging.current, options);
      
      if (currentToken) {
        setFcmToken(currentToken);
        console.log('FCM Token received');
        
        // If userId is provided, associate token with user
        if (userId) {
          await saveTokenForUser(currentToken, userId);
        }
      } else {
        console.log('No FCM token available');
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  // Save token to backend for a specific user
  const saveTokenForUser = async (token: string, userId: number) => {
    try {
      await axios.post('/api/notification-tokens', {
        token,
        userId
      });
      console.log('Token saved for user', userId);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  // Request notification permission from user
  const requestPermission = async () => {
    if (!isFirebaseAvailable) {
      toast({
        title: 'Notifications not available',
        description: 'Push notifications feature is currently not available',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission as 'default' | 'granted' | 'denied');
      
      if (permission === 'granted') {
        await getFCMToken();
        
        toast({
          title: t('notifications_enabled'),
          description: t('notifications_enabled_desc'),
          duration: 5000,
        });
      } else {
        toast({
          title: t('notifications_denied'),
          description: t('notifications_denied_desc'),
          variant: 'destructive',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: t('notification_error'),
        description: t('notification_error_desc'),
        variant: 'destructive'
      });
    }
  };

  // Show a local notification
  const showLocalNotification = (notification: any) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    
    try {
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/pillnow.png'
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  // Only render enable button if Firebase is available and permission is not granted
  if (isFirebaseAvailable && permissionStatus !== 'granted') {
    return (
      <button 
        onClick={requestPermission}
        className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded-md text-sm transition-colors"
        aria-label={t('enable_notifications')}
      >
        <BellRing size={16} className="text-primary" />
        <span>{t('enable_notifications')}</span>
      </button>
    );
  }

  // Return null if Firebase is not available or notifications are already enabled
  return null;
};

export default NotificationHandler;