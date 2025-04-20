import React, { useRef } from 'react';
import { useLanguage } from '../LanguageSwitcher';
import { Package, ShoppingCart, Clock, Calendar, CheckCircle2, TruckIcon, RotateCw, ArrowRightIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useQuery } from '@tanstack/react-query';

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

interface OrderHistoryProps {
  userId?: number;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ userId }) => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  // Fetch user's orders from the API
  const { data: userOrders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders', userId],
    enabled: !!userId, // Only run the query if userId is provided
  });
  
  // Sample orders data for when no user is logged in
  const sampleOrders: Order[] = [
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
          imageUrl: '/pillnow.png'
        },
        {
          id: 2,
          name: 'Blood Pressure Monitor',
          quantity: 1,
          price: 1599,
          imageUrl: '/pillnow.png'
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
          imageUrl: '/pillnow.png'
        },
        {
          id: 4,
          name: 'Pain Relief Gel',
          quantity: 2,
          price: 120,
          imageUrl: '/pillnow.png'
        }
      ]
    },
    {
      id: 'ORD24681357',
      date: '2025-03-28',
      status: 'delivered',
      totalAmount: 890.25,
      deliveryDate: '2025-04-01',
      items: [
        {
          id: 5,
          name: 'Diabetes Testing Kit',
          quantity: 1,
          price: 799,
          imageUrl: '/pillnow.png'
        },
        {
          id: 6,
          name: 'Calcium Supplements',
          quantity: 1,
          price: 299.50,
          imageUrl: '/pillnow.png'
        }
      ]
    },
    {
      id: 'ORD13579246',
      date: '2025-03-20',
      status: 'delivered',
      totalAmount: 1350.00,
      deliveryDate: '2025-03-25',
      items: [
        {
          id: 7,
          name: 'Nebulizer',
          quantity: 1,
          price: 1250,
          imageUrl: '/pillnow.png'
        },
        {
          id: 8,
          name: 'Antiseptic Solution',
          quantity: 2,
          price: 50,
          imageUrl: '/pillnow.png'
        }
      ]
    },
    {
      id: 'ORD97531246',
      date: '2025-03-15',
      status: 'processing',
      totalAmount: 420.75,
      items: [
        {
          id: 9,
          name: 'Digestion Tablets',
          quantity: 3,
          price: 110.25,
          imageUrl: '/pillnow.png'
        },
        {
          id: 10,
          name: 'Cough Syrup',
          quantity: 1,
          price: 90,
          imageUrl: '/pillnow.png'
        }
      ]
    },
    {
      id: 'ORD24680975',
      date: '2025-03-10',
      status: 'shipped',
      totalAmount: 1845.50,
      trackingId: 'TRK58249173',
      items: [
        {
          id: 11,
          name: 'Thermometer',
          quantity: 1,
          price: 450.50,
          imageUrl: '/pillnow.png'
        },
        {
          id: 12,
          name: 'First Aid Kit',
          quantity: 1,
          price: 1395,
          imageUrl: '/pillnow.png'
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
          <div className="flex items-center">
            {!isMobile && (
              <div className="flex gap-2 mr-4">
                <button 
                  onClick={handleScrollLeft}
                  className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleScrollRight}
                  className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            <Link href="/orders" className="text-primary flex items-center text-sm">
              {t('view_all_orders')} <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{t('reorder_previous_purchases')}</p>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (userId ? (userOrders || []) : sampleOrders).length > 0 ? (
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {(userId && userOrders ? userOrders : sampleOrders).map((order) => (
              <div 
                key={order.id} 
                className="snap-start min-w-[300px] md:min-w-[350px] flex-shrink-0 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm truncate max-w-[150px]">#{order.id}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(order.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">₹{order.totalAmount.toFixed(2)}</div>
                    <div className="text-xs capitalize px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                      {t(order.status)}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 flex-grow">
                  <div className="flex flex-col space-y-3">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="flex-shrink-0 h-14 w-14 bg-gray-50 rounded-md flex items-center justify-center p-1">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex-grow overflow-hidden">
                          <Link href={`/products/${item.id}`}>
                            <h4 className="font-medium text-xs hover:text-primary transition-colors truncate">{item.name}</h4>
                          </Link>
                          <div className="text-xs text-gray-500">
                            {t('quantity')}: {item.quantity} × ₹{item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-xs text-gray-500 italic">
                        {t('and')} {order.items.length - 2} {t('more_items')}...
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 flex justify-between items-center mt-auto">
                  <div className="text-xs">
                    {order.status === 'shipped' && order.trackingId && (
                      <div className="text-gray-600 truncate max-w-[100px]">
                        {t('tracking')}: {order.trackingId}
                      </div>
                    )}
                    {order.status === 'delivered' && order.deliveryDate && (
                      <div className="text-gray-600">
                        {t('received')}: {formatDate(order.deliveryDate)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2 flex items-center gap-1"
                      onClick={() => handleReorder(order.id)}
                    >
                      <RotateCw className="h-3 w-3" />
                      {t('reorder')}
                    </Button>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 px-2">{t('details')}</Button>
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