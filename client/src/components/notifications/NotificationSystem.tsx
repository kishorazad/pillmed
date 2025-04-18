import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X, AlertCircle, ShoppingBag, Package, Truck, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useLanguage } from '@/components/LanguageSwitcher';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type NotificationType = 
  | 'prescription_readable'
  | 'prescription_not_readable'
  | 'medicine_price_change'
  | 'order_packed'
  | 'order_picked'
  | 'order_delivered';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  data?: {
    orderId?: number;
    medicineName?: string;
    oldPrice?: number;
    newPrice?: number;
    prescriptionId?: number;
    rejectReason?: string;
    courier?: string;
  };
}

interface NotificationSystemProps {
  userId?: number;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ userId }) => {
  const { t } = useLanguage();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // This would be replaced with an actual API call to fetch notifications
  useEffect(() => {
    // Mock data
    const mockNotifications: Notification[] = [
      {
        id: 1,
        type: 'prescription_readable',
        title: t('prescription_verified'),
        message: t('prescription_verified_message'),
        time: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        data: {
          orderId: 1,
          prescriptionId: 123
        }
      },
      {
        id: 2,
        type: 'medicine_price_change',
        title: t('price_change_notification'),
        message: t('medicine_price_changed'),
        time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        data: {
          medicineName: 'Telmibrex-AM Tablet',
          oldPrice: 128,
          newPrice: 106
        }
      },
      {
        id: 3,
        type: 'order_packed',
        title: t('order_packed'),
        message: t('order_packed_message'),
        time: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        read: true,
        data: {
          orderId: 2
        }
      },
      {
        id: 4,
        type: 'prescription_not_readable',
        title: t('prescription_not_readable'),
        message: t('prescription_not_readable_message'),
        time: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        read: true,
        data: {
          prescriptionId: 124,
          rejectReason: 'Blurry image. Please upload a clearer prescription.'
        }
      },
      {
        id: 5,
        type: 'order_picked',
        title: t('order_picked'),
        message: t('order_picked_message'),
        time: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        read: true,
        data: {
          orderId: 3,
          courier: 'Delhivery'
        }
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [t]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const deleteNotification = (id: number) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => prev - 1);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'prescription_readable':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'prescription_not_readable':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'medicine_price_change':
        return <ShoppingBag className="h-5 w-5 text-amber-500" />;
      case 'order_packed':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'order_picked':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'order_delivered':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatNotificationTime = (time: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) {
      return `${diffMins} ${t('minutes_ago')}`;
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) {
      return `${diffHours} ${t('hours_ago')}`;
    }
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} ${t('days_ago')}`;
  };

  const getNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case 'prescription_readable':
        return (
          <div>
            <p className="text-sm">{notification.message}</p>
            {notification.data?.orderId && (
              <p className="text-xs text-gray-500 mt-1">
                {t('order')} #{notification.data.orderId}
              </p>
            )}
          </div>
        );
      case 'prescription_not_readable':
        return (
          <div>
            <p className="text-sm">{notification.message}</p>
            {notification.data?.rejectReason && (
              <p className="text-xs text-red-600 mt-1">
                {t('reason')}: {notification.data.rejectReason}
              </p>
            )}
          </div>
        );
      case 'medicine_price_change':
        return (
          <div>
            <p className="text-sm">
              {notification.data?.medicineName}: 
              <span className={notification.data?.newPrice && notification.data.oldPrice && 
                      notification.data.newPrice < notification.data.oldPrice ? 
                      'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {notification.data?.oldPrice && notification.data?.newPrice && (
                  ` ₹${notification.data.oldPrice} → ₹${notification.data.newPrice}`
                )}
              </span>
            </p>
          </div>
        );
      case 'order_packed':
        return (
          <div>
            <p className="text-sm">{notification.message}</p>
            {notification.data?.orderId && (
              <p className="text-xs text-gray-500 mt-1">
                {t('order')} #{notification.data.orderId}
              </p>
            )}
          </div>
        );
      case 'order_picked':
        return (
          <div>
            <p className="text-sm">{notification.message}</p>
            {notification.data?.orderId && notification.data?.courier && (
              <p className="text-xs text-gray-500 mt-1">
                {t('order')} #{notification.data.orderId} - {notification.data.courier}
              </p>
            )}
          </div>
        );
      default:
        return <p className="text-sm">{notification.message}</p>;
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(true)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`max-w-md ${isMobile ? 'w-[95vw]' : ''}`}>
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{t('notifications')}</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                  disabled={unreadCount === 0}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {t('mark_all_read')}
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={`${!notification.read ? 'bg-blue-50' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-sm">{notification.title}</h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-xs text-gray-500">{formatNotificationTime(notification.time)}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {getNotificationContent(notification)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <BellOff className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="font-medium text-gray-700">{t('no_notifications')}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {t('notifications_will_appear_here')}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationSystem;