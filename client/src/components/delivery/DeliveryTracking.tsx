import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageSwitcher';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Truck, MapPin, User, Phone, Calendar, Clock, Package, Check, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { OrderStatusType } from '../orders/OrderStatus';

export interface DeliveryStatus {
  status: OrderStatusType;
  timestamp: Date;
  location?: string;
  note?: string;
}

export interface DeliveryDetails {
  id: number;
  orderId: number;
  trackingId: string;
  courierName: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  estimatedDelivery: Date;
  currentStatus: OrderStatusType;
  history: DeliveryStatus[];
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  products: {
    id: number;
    name: string;
    quantity: number;
  }[];
}

interface DeliveryTrackingProps {
  deliveryId: number;
}

const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({ deliveryId }) => {
  const { t } = useLanguage();
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  // This would be replaced with an API call to fetch delivery details
  const deliveryDetails: DeliveryDetails = {
    id: deliveryId,
    orderId: 123456,
    trackingId: 'DLVRY98765432',
    courierName: 'Express Delivery',
    deliveryPersonName: 'Rahul Singh',
    deliveryPersonPhone: '+91 9876543210',
    estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    currentStatus: 'order_in_transit',
    history: [
      {
        status: 'prescription_uploaded',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        location: 'Customer App',
        note: 'Prescription uploaded by customer'
      },
      {
        status: 'prescription_verified',
        timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000), // 3.5 hours ago
        location: 'Pharmacy',
        note: 'Prescription verified by pharmacist'
      },
      {
        status: 'order_confirmed',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        location: 'Pharmacy',
        note: 'Order confirmed and processing started'
      },
      {
        status: 'order_packed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        location: 'Pharmacy',
        note: 'Order packed and ready for pickup'
      },
      {
        status: 'order_picked',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        location: 'Pharmacy',
        note: 'Order picked up by delivery partner'
      },
      {
        status: 'order_in_transit',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        location: 'In Transit',
        note: 'Order in transit to delivery location'
      }
    ],
    recipientName: 'Amit Kumar',
    recipientPhone: '+91 9876543210',
    deliveryAddress: '123 Main Street, Sector 47, Gurugram, Haryana 122001',
    products: [
      {
        id: 814,
        name: 'Telmibrex-AM Tablet',
        quantity: 2
      },
      {
        id: 245,
        name: 'Dolo 650mg Tablet',
        quantity: 1
      }
    ]
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const getStatusColor = (status: OrderStatusType) => {
    switch (status) {
      case 'prescription_rejected':
      case 'order_cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'order_delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'order_in_transit':
      case 'order_picked':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'order_packed':
      case 'order_confirmed':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'prescription_verified':
      case 'prescription_uploaded':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: OrderStatusType) => {
    switch (status) {
      case 'prescription_uploaded':
      case 'prescription_verified':
      case 'prescription_rejected':
        return <ShoppingBag className="h-4 w-4" />;
      case 'order_confirmed':
        return <Check className="h-4 w-4" />;
      case 'order_packed':
        return <Package className="h-4 w-4" />;
      case 'order_picked':
      case 'order_in_transit':
        return <Truck className="h-4 w-4" />;
      case 'order_delivered':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'order_cancelled':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{t('delivery_tracking')}</CardTitle>
              <CardDescription>
                {t('tracking_id')}: {deliveryDetails.trackingId}
              </CardDescription>
            </div>
            <Badge variant="outline" className={getStatusColor(deliveryDetails.currentStatus)}>
              {getStatusIcon(deliveryDetails.currentStatus)}
              <span className="ml-1">{t(deliveryDetails.currentStatus as string)}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('courier_service')}</p>
                  <p className="font-medium">{deliveryDetails.courierName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('estimated_delivery')}</p>
                  <p className="font-medium">
                    {formatDate(deliveryDetails.estimatedDelivery)}, {formatTime(deliveryDetails.estimatedDelivery)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {deliveryDetails.deliveryPersonName && (
            <div className="border rounded-md p-3">
              <h3 className="text-sm font-medium mb-2">{t('delivery_partner')}</h3>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{deliveryDetails.deliveryPersonName}</p>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <Phone className="h-3 w-3 mr-1" />
                    {deliveryDetails.deliveryPersonPhone}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">{t('delivery_address')}</h3>
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{deliveryDetails.recipientName}</p>
                <p className="text-sm text-gray-600">{deliveryDetails.deliveryAddress}</p>
                <p className="text-sm text-gray-600 mt-1">
                  <Phone className="h-3 w-3 inline mr-1" />
                  {deliveryDetails.recipientPhone}
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">{t('order_items')}</h3>
            <div className="space-y-2">
              {deliveryDetails.products.map((product) => (
                <div key={product.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">{product.name}</p>
                  </div>
                  <Badge variant="outline">
                    {t('qty')}: {product.quantity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between">
          <Button 
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setIsMapOpen(true)}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {t('track_on_map')}
          </Button>
          <Button className="w-full sm:w-auto">
            <Phone className="h-4 w-4 mr-2" />
            {t('contact_delivery_partner')}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('delivery_history')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveryDetails.history.map((status, index) => (
              <div key={index} className="relative pl-6 pb-4">
                {index !== deliveryDetails.history.length - 1 && (
                  <div className="absolute top-3 left-[9px] bottom-0 w-0.5 bg-gray-200" />
                )}
                <div className="flex gap-3">
                  <div className={`absolute left-0 top-0.5 p-1 rounded-full ${getStatusColor(status.status)}`}>
                    {getStatusIcon(status.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <h4 className="font-medium">{t(status.status as string)}</h4>
                      <div className="text-sm text-gray-500 flex flex-wrap gap-1">
                        <Calendar className="h-3.5 w-3.5 mr-1" /> 
                        {formatDate(status.timestamp)}, {formatTime(status.timestamp)}
                      </div>
                    </div>
                    {status.location && (
                      <div className="text-sm text-gray-600 mt-1">
                        <MapPin className="h-3.5 w-3.5 inline mr-1" />
                        {status.location}
                      </div>
                    )}
                    {status.note && (
                      <p className="text-sm mt-1">{status.note}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('live_delivery_tracking')}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-center p-6">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('map_loading_placeholder')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('tracking_id')}: {deliveryDetails.trackingId}</p>
            </div>
          </div>
          <div className="p-3 rounded-md bg-blue-50 flex gap-3">
            <div className="mt-1 text-blue-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-blue-800">
                {t('estimated_arrival')}: {formatTime(deliveryDetails.estimatedDelivery)}
              </p>
              <p className="text-sm text-blue-700">{t('delivery_in_progress_message')}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryTracking;