import { useEffect, useRef, useState } from 'react';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
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
  const messaging = useRef(getMessaging(app));
  const { toast } = useToast();
  const { t } = useLanguage();

  // Check and request notification permission
  useEffect(() => {
    // Function to initialize FCM
    const initializeFCM = async () => {
      try {
        // Check if notifications are supported in this browser
        if (!('Notification' in window)) {
          console.log('This browser does not support notifications');
          return;
        }

        // Check permission status
        const permission = Notification.permission as 'default' | 'granted' | 'denied';
        setPermissionStatus(permission);

        // If permission already granted, get token
        if (permission === 'granted') {
          await getFCMToken();
        }
      } catch (error) {
        console.error('FCM initialization error:', error);
      }
    };

    initializeFCM();
  }, []);

  // Listen for incoming messages when app is in foreground
  useEffect(() => {
    // Only set up listener if permission is granted
    if (permissionStatus === 'granted') {
      const unsubscribe = onMessage(messaging.current, (payload) => {
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
      return () => unsubscribe();
    }
  }, [permissionStatus, toast, t]);

  // Function to get FCM token
  const getFCMToken = async () => {
    try {
      const currentToken = await getToken(messaging.current, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      
      if (currentToken) {
        setFcmToken(currentToken);
        console.log('FCM Token:', currentToken);
        
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

  // Only render enable button if permission is not granted
  if (permissionStatus !== 'granted') {
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

  // Return null if already enabled (component is invisible but functional)
  return null;
};

export default NotificationHandler;