import React from 'react';
import { Check, Timer, Package, Truck, Home, AlertTriangle, FileText } from 'lucide-react';
import { useLanguage } from '@/components/LanguageSwitcher';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export type OrderStatusType = 
  | 'prescription_uploaded'
  | 'prescription_verified'
  | 'prescription_rejected'
  | 'order_confirmed'
  | 'order_packed'
  | 'order_picked'
  | 'order_in_transit'
  | 'order_delivered'
  | 'order_cancelled';

interface OrderStatusProps {
  status: OrderStatusType;
  estimatedDelivery?: string;
  deliveryPerson?: string;
  rejectionReason?: string;
  updatedAt?: string;
  colorScheme?: 'default' | 'muted';
}

const OrderStatus: React.FC<OrderStatusProps> = ({ 
  status, 
  estimatedDelivery, 
  deliveryPerson, 
  rejectionReason,
  updatedAt,
  colorScheme = 'default'
}) => {
  const { t } = useLanguage();
  
  const getProgressPercentage = () => {
    switch (status) {
      case 'prescription_uploaded':
        return 10;
      case 'prescription_verified':
        return 30;
      case 'order_confirmed':
        return 40;
      case 'order_packed':
        return 60;
      case 'order_picked':
        return 70;
      case 'order_in_transit':
        return 85;
      case 'order_delivered':
        return 100;
      case 'prescription_rejected':
      case 'order_cancelled':
        return 0;
      default:
        return 0;
    }
  };
  
  const getStatusColor = () => {
    if (status === 'prescription_rejected' || status === 'order_cancelled') {
      return 'bg-red-600';
    }
    return colorScheme === 'muted' ? 'bg-primary/70' : 'bg-primary';
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'prescription_uploaded':
        return t('prescription_uploaded');
      case 'prescription_verified':
        return t('prescription_verified');
      case 'prescription_rejected':
        return t('prescription_rejected');
      case 'order_confirmed':
        return t('order_confirmed');
      case 'order_packed':
        return t('order_packed');
      case 'order_picked':
        return t('order_picked');
      case 'order_in_transit':
        return t('order_in_transit');
      case 'order_delivered':
        return t('order_delivered');
      case 'order_cancelled':
        return t('order_cancelled');
      default:
        return t('unknown_status');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'prescription_uploaded':
        return <FileText className="h-5 w-5" />;
      case 'prescription_verified':
        return <Check className="h-5 w-5" />;
      case 'prescription_rejected':
        return <AlertTriangle className="h-5 w-5" />;
      case 'order_confirmed':
        return <Timer className="h-5 w-5" />;
      case 'order_packed':
        return <Package className="h-5 w-5" />;
      case 'order_picked':
        return <Truck className="h-5 w-5" />;
      case 'order_in_transit':
        return <Truck className="h-5 w-5" />;
      case 'order_delivered':
        return <Home className="h-5 w-5" />;
      case 'order_cancelled':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Timer className="h-5 w-5" />;
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'prescription_uploaded':
        return t('prescription_under_review');
      case 'prescription_verified':
        return t('prescription_verified_description');
      case 'prescription_rejected':
        return rejectionReason || t('prescription_rejected_description');
      case 'order_confirmed':
        return t('order_confirmed_description');
      case 'order_packed':
        return t('order_packed_description');
      case 'order_picked':
        return deliveryPerson 
          ? t('order_picked_with_person', { person: deliveryPerson })
          : t('order_picked_description');
      case 'order_in_transit':
        return estimatedDelivery 
          ? t('order_in_transit_with_time', { time: estimatedDelivery })
          : t('order_in_transit_description');
      case 'order_delivered':
        return t('order_delivered_description');
      case 'order_cancelled':
        return t('order_cancelled_description');
      default:
        return '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${status === 'prescription_rejected' || status === 'order_cancelled' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{getStatusTitle()}</h3>
            {updatedAt && (
              <Badge variant="outline" className="text-xs font-normal">
                {updatedAt}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{getStatusDescription()}</p>
        </div>
      </div>
      
      {(status !== 'prescription_rejected' && status !== 'order_cancelled') && (
        <Progress value={getProgressPercentage()} className={`h-2 ${getStatusColor()}`} />
      )}

      {(status === 'prescription_rejected' || status === 'order_cancelled') && (
        <div className="border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          {status === 'prescription_rejected' 
            ? t('please_upload_new_prescription') 
            : t('order_cancelled_note')}
        </div>
      )}
    </div>
  );
};

export default OrderStatus;