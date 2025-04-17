import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Component that handles notification permissions and displays FCM messages
 */
const NotificationHandler: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const { toast } = useToast();

  // Check notification permission status on component mount
  useEffect(() => {
    const checkPermission = async () => {
      if (typeof Notification !== 'undefined') {
        const permission = Notification.permission;
        setNotificationsEnabled(permission === 'granted');
      }
    };

    checkPermission();
  }, []);

  // Set up message listener for foreground notifications
  useEffect(() => {
    if (!notificationsEnabled) return;

    const unsubscribe = onMessageListener((payload) => {
      const { notification } = payload;
      
      if (notification) {
        toast({
          title: notification.title || 'New Notification',
          description: notification.body || '',
          duration: 5000,
        });
      }
    });

    return () => unsubscribe();
  }, [notificationsEnabled, toast]);

  // Handle requesting permission
  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();
    
    if (token) {
      setNotificationsEnabled(true);
      
      // Show success toast
      toast({
        title: 'Notifications Enabled',
        description: 'You will now receive notifications for order updates and medication reminders.',
        duration: 3000,
      });
      
      // Here you would typically save this token to your user's profile on the server
      try {
        // This is a placeholder for sending the token to your server
        // await fetch('/api/user/notifications/token', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ token }),
        // });
      } catch (error) {
        console.error('Error saving notification token:', error);
      }
    } else {
      toast({
        title: 'Notification Permission Denied',
        description: 'Please enable notifications in your browser settings to receive updates.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEnableNotifications}
            disabled={notificationsEnabled}
            className="relative"
            aria-label={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
          >
            {notificationsEnabled ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
            
            {notificationsEnabled && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-500" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {notificationsEnabled 
            ? 'Notifications are enabled' 
            : 'Enable notifications for order updates and medication reminders'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NotificationHandler;