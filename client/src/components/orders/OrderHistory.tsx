import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderItem, Product } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';
import { Package, Truck, ArrowDown } from 'lucide-react';

interface OrderHistoryProps {
  userId: number;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ userId }) => {
  // Fetch the user's orders
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['/api/orders/user', userId],
    enabled: !!userId
  });

  // A function to fetch order items
  const fetchOrderItems = async (orderId: number) => {
    const response = await fetch(`/api/orders/${orderId}/items`);
    if (!response.ok) throw new Error('Failed to fetch order items');
    return await response.json();
  };

  // Functions to get order status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'default' as const;
      case 'shipped':
        return 'secondary' as const;
      case 'processing':
        return 'secondary' as const;
      case 'cancelled':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <Package className="h-4 w-4 mr-1" />;
      case 'shipped':
        return <Truck className="h-4 w-4 mr-1" />;
      case 'processing':
        return <ArrowDown className="h-4 w-4 mr-1" />;
      default:
        return <Package className="h-4 w-4 mr-1" />;
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };

  if (ordersLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (ordersError) {
    return <p className="text-destructive">Error loading orders. Please try again later.</p>;
  }

  if (!orders || orders.length === 0) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="py-8 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
          <p className="mt-2 text-muted-foreground">
            Your order history will appear here once you make a purchase.
          </p>
        </CardContent>
      </Card>
    );
  }

  const reorderItems = async (orderId: number) => {
    try {
      // Get the order items
      const items = await fetchOrderItems(orderId);
      
      // Add each item to the cart
      for (const item of items) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            productId: item.productId,
            quantity: item.quantity
          })
        });
      }
      
      alert('Items added to cart!');
    } catch (err) {
      console.error('Error reordering items:', err);
      alert('Failed to add items to cart');
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order: any) => (
        <Accordion key={order.id} type="single" collapsible>
          <AccordionItem value={`order-${order.id}`}>
            <div className="bg-card border border-border rounded-lg">
              <div className="p-4 flex flex-col sm:flex-row justify-between">
                <div>
                  <p className="text-sm font-medium">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Placed on {formatDate(order.orderDate)}
                  </p>
                  <div className="mt-2 flex items-center">
                    <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center">
                      {getStatusIcon(order.status)} {order.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col sm:items-end justify-between">
                  <p className="text-lg font-bold">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent accordion from toggling
                      reorderItems(order.id);
                    }}
                    className="mt-2"
                  >
                    Reorder
                  </Button>
                </div>
              </div>
              <AccordionTrigger className="px-4 py-2 text-sm border-t">
                View Order Details
              </AccordionTrigger>
              <AccordionContent>
                <OrderItems orderId={order.id} />
                <div className="p-4 border-t">
                  <p className="text-sm">
                    <span className="font-medium">Shipping Address:</span> {order.shippingAddress}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Payment Method:</span> {order.paymentMethod}
                  </p>
                  {order.trackingNumber && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">Tracking #:</span> {order.trackingNumber}
                    </p>
                  )}
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
};

// Component to show order items
const OrderItems = ({ orderId }: { orderId: number }) => {
  const { data: orderItems, isLoading, error } = useQuery({
    queryKey: ['/api/orders', orderId, 'items'],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}/items`);
      if (!response.ok) throw new Error('Failed to fetch order items');
      return await response.json();
    }
  });

  if (isLoading) {
    return <div className="p-4"><Skeleton className="h-20 w-full" /></div>;
  }

  if (error || !orderItems) {
    return <div className="p-4 text-destructive">Error loading order items</div>;
  }

  if (orderItems.length === 0) {
    return <div className="p-4 text-muted-foreground">No items in this order</div>;
  }

  return (
    <div className="divide-y">
      {orderItems.map((item: OrderItem & { product: Product }) => (
        <div key={item.id} className="p-4 flex justify-between items-center">
          <div className="flex items-center">
            {item.product?.imageUrl && (
              <div className="h-12 w-12 mr-4 overflow-hidden rounded border">
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-medium">{item.product?.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(item.price)} × {item.quantity}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;