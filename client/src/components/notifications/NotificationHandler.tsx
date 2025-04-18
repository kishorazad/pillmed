import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';

interface NotificationHandlerProps {
  userId?: number; // Optional user ID for personalized notifications
}

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
  const [notificationToken, setNotificationToken] = useState<string | null>(null);

  // Request notification permission on component mount
  useEffect(() => {
    // Only request permission if the user is logged in
    if (userId) {
      const requestPermission = async () => {
        try {
          const token = await requestNotificationPermission();
          setNotificationToken(token);
        } catch (error) {
          console.error('Error requesting notification permission:', error);
        }
      };

      requestPermission();
    }
  }, [userId]);

  // Listen for incoming notifications
  useEffect(() => {
    if (!notificationToken) return;

    const unsubscribe = onMessageListener()
      .then((payload: FirebaseMessage) => {
        // Show toast notification
        toast({
          title: payload.notification.title,
          description: payload.notification.body,
          duration: 6000,
        });

        // You can also handle data payloads for custom actions
        if (payload.data?.action) {
          // Handle custom actions based on payload data
          switch (payload.data.action) {
            case 'ORDER_UPDATE':
              // Navigate to order page or update order status
              break;
            case 'PROMOTION':
              // Show promotion details
              break;
            default:
              break;
          }
        }
      })
      .catch((err) => console.error('Error receiving notification:', err));

    // Clean up
    return () => {
      unsubscribe;
    };
  }, [notificationToken]);

  // This component doesn't render anything visible
  return null;
};

export default NotificationHandler;