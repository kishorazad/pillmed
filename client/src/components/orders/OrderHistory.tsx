import React from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { Package, ShoppingCart, Clock, Calendar, CheckCircle2, TruckIcon, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface Order {
  id: string;
  date: string;
  status: 'delivered' | 'processing' | 'shipped';
  totalAmount: number;
  items: OrderItem[];
  deliveryDate?: string;
  trackingId?: string;
}

const OrderHistory: React.FC = () => {
  const { t } = useLanguage();
  
  // Sample order data
  const orders: Order[] = [
    {
      id: 'ORD12345678',
      date: '2025-04-10',
      status: 'delivered',
      totalAmount: 1245.50,
      deliveryDate: '2025-04-15',
      items: [
        {
          id: 1,
          name: 'Teltab 80mg Tablet',
          quantity: 2,
          price: 420.25,
          imageUrl: 'https://cdn01.pharmeasy.in/dam/products_otc/I05582/dolo-650-tablet-15s-1-1669710798.jpg'
        },
        {
          id: 2,
          name: 'Blood Pressure Monitor',
          quantity: 1,
          price: 1599,
          imageUrl: 'https://cdn01.pharmeasy.in/dam/products_otc/W67219/dr-morepen-bp-one-bp02-fully-automatic-blood-pressure-monitor-with-adaptor-2-1671745339.jpg'
        }
      ]
    },
    {
      id: 'ORD87654321',
      date: '2025-04-02',
      status: 'shipped',
      totalAmount: 755.75,
      trackingId: 'TRK38472638',
      items: [
        {
          id: 3,
          name: 'Multivitamin Tablets',
          quantity: 1,
          price: 450,
          imageUrl: 'https://cdn01.pharmeasy.in/dam/products_otc/000665/accusure-simple-gluco-test-strips-box-of-50-1-1669710026.jpg'
        },
        {
          id: 4,
          name: 'Pain Relief Gel',
          quantity: 2,
          price: 120,
          imageUrl: 'https://cdn01.pharmeasy.in/dam/products_otc/142528/cetaphil-gentle-skin-cleanser-250ml-2-1669710367.jpg'
        }
      ]
    }
  ];

  const getStatusIcon = (status: Order['status']) => {
    switch(status) {
      case 'delivered':
        return <CheckCircle2 className="text-green-500" />;
      case 'processing':
        return <Clock className="text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="text-orange-500" />;
      default:
        return <Package />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleReorder = (orderId: string) => {
    console.log(`Reordering items from order ${orderId}`);
    // Implement reorder logic
  };

  return (
    <section className="py-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{t('order_history')}</h2>
          <Link href="/orders" className="text-primary text-sm">
            {t('view_all_orders')}
          </Link>
        </div>
        
        <p className="text-gray-600 mb-4">{t('reorder_previous_purchases')}</p>
        
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{t('order')} #{order.id}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(order.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{order.totalAmount.toFixed(2)}</div>
                    <div className="text-xs capitalize text-gray-500">
                      {t(order.status)}
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex flex-col space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="flex-shrink-0 h-16 w-16 bg-gray-50 rounded-md flex items-center justify-center p-1">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex-grow">
                          <Link href={`/products/${item.id}`}>
                            <h4 className="font-medium text-sm hover:text-primary transition-colors">{item.name}</h4>
                          </Link>
                          <div className="text-sm text-gray-500 mt-1">
                            {t('quantity')}: {item.quantity} × ₹{item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 flex justify-between items-center">
                  <div>
                    {order.status === 'shipped' && order.trackingId && (
                      <div className="text-xs text-gray-600">
                        {t('tracking_id')}: {order.trackingId}
                      </div>
                    )}
                    {order.status === 'delivered' && order.deliveryDate && (
                      <div className="text-xs text-gray-600">
                        {t('delivered_on')}: {formatDate(order.deliveryDate)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleReorder(order.id)}
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      {t('reorder')}
                    </Button>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">{t('view_details')}</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">{t('no_orders_yet')}</h3>
            <p className="text-gray-500 mt-1">{t('start_shopping_to_see_orders')}</p>
            <Link href="/products">
              <Button className="mt-4">{t('browse_products')}</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default OrderHistory;